import os
import sys

import pytest
from fastapi.testclient import TestClient

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAT_MIN, LAT_MAX = -35.2, -34.2
LON_MIN, LON_MAX = -59.2, -58.0


@pytest.fixture(scope="module")
def client():
    # main.py usa rutas relativas (properati.zip), así que corre desde backend/
    os.chdir(BACKEND)
    sys.path.insert(0, BACKEND)
    import main

    return TestClient(main.app)


@pytest.fixture(scope="module")
def data(client):
    r = client.get("/mapa-precios")
    assert r.status_code == 200
    return r.json()


def test_forma_de_la_respuesta(data):
    assert set(data) == {"celdas", "barrios"}
    assert len(data["celdas"]) > 0
    assert set(data["celdas"][0]) == {"lat", "lon", "precio_mediano", "cantidad"}
    assert set(data["barrios"][0]) == {"barrio", "lat", "lon", "precio_mediano", "cantidad"}


@pytest.mark.parametrize("celda", [0.001, 0.0049, 0.051, 1, -0.01, 0])
def test_celda_fuera_de_rango_da_422(client, celda):
    assert client.get("/mapa-precios", params={"celda": celda}).status_code == 422


@pytest.mark.parametrize("celda", [0.005, 0.05])
def test_celda_en_los_limites_es_valida(client, celda):
    assert client.get("/mapa-precios", params={"celda": celda}).status_code == 200


def test_ninguna_celda_con_menos_de_5(data):
    assert all(c["cantidad"] >= 5 for c in data["celdas"])


def test_celdas_dentro_de_la_caja_de_ba(data):
    for c in data["celdas"]:
        assert LAT_MIN <= c["lat"] <= LAT_MAX
        assert LON_MIN <= c["lon"] <= LON_MAX


def test_barrios_son_12_ordenados_por_cantidad_desc(data):
    cantidades = [b["cantidad"] for b in data["barrios"]]
    assert len(cantidades) == 12
    assert cantidades == sorted(cantidades, reverse=True)


def test_redondeo_y_precios_positivos(data):
    for c in data["celdas"]:
        assert c["lat"] == round(c["lat"], 4) and c["lon"] == round(c["lon"], 4)
        assert c["precio_mediano"] == round(c["precio_mediano"]) and c["precio_mediano"] > 0


def test_precios_coherentes_con_estadisticas(client, data):
    est = client.get("/estadisticas").json()
    medianas = sorted(c["precio_mediano"] for c in data["celdas"])
    mediana_de_celdas = medianas[len(medianas) // 2]
    ratio = mediana_de_celdas / est["precio_mediano_caba"]
    assert 0.5 < ratio < 2
    assert est["precio_minimo"] <= min(medianas) and max(medianas) <= est["precio_maximo"]
    for b in data["barrios"]:
        assert est["precio_minimo"] <= b["precio_mediano"] <= est["precio_maximo"]
