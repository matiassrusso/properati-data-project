import os
import sys

import pytest
from fastapi.testclient import TestClient

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVISO_SIN_AJUSTAR = "Sin ajustar: modelo entrenado con datos de ~2020 en USD nominales"
AVISO_CALIBRADO = "Ajustado a precios de publicación de CABA del 4T 2025 (IDECBA)"
MATADEROS = {"lat": -34.6573, "lon": -58.5070, "superficie": 42, "ambientes": 2, "tipo": "apartment"}
PUERTO_MADERO = {"lat": -34.61, "lon": -58.363, "superficie": 60, "ambientes": 2, "tipo": "apartment"}
GBA_SUR = {"lat": -34.78, "lon": -58.55, "superficie": 60, "ambientes": 2, "tipo": "apartment"}


@pytest.fixture(scope="module")
def client():
    # main.py usa rutas relativas (properati.zip), así que corre desde backend/
    os.chdir(BACKEND)
    sys.path.insert(0, BACKEND)
    import main

    return TestClient(main.app)


@pytest.fixture(scope="module")
def modelo(client):
    r = client.get("/modelo")
    assert r.status_code == 200
    return r.json()


def predecir(client, **cambios):
    return client.post("/predecir", json={**PUERTO_MADERO, **cambios})


def test_forma_de_la_respuesta(client):
    r = predecir(client)
    assert r.status_code == 200
    d = r.json()
    assert set(d) == {
        "precio_m2", "rango", "precio_total", "rango_total",
        "referencia", "fuera_de_cobertura", "calibrado", "aviso",
    }
    assert isinstance(d["precio_m2"], int) and isinstance(d["precio_total"], int)
    assert len(d["rango"]) == 2 and len(d["rango_total"]) == 2
    assert d["calibrado"] is True
    assert d["aviso"] == AVISO_CALIBRADO
    assert d["fuera_de_cobertura"] is False
    assert set(d["referencia"]) == {"barrio", "mediana_m2", "cantidad"}
    assert d["referencia"]["cantidad"] >= 30


@pytest.mark.parametrize("tipo", ["apartment", "house", "PH"])
def test_rango_contiene_la_prediccion(client, tipo):
    d = predecir(client, tipo=tipo).json()
    assert d["rango"][0] <= d["precio_m2"] <= d["rango"][1]


def test_precio_total_coherente(client):
    d = predecir(client, superficie=75).json()
    assert d["precio_total"] == round(d["precio_m2"] * 75)
    assert d["rango_total"] == [round(d["rango"][0] * 75), round(d["rango"][1] * 75)]


@pytest.mark.parametrize("cambio", [
    {"superficie": 9}, {"superficie": 2001}, {"superficie": 0}, {"superficie": -5},
    {"ambientes": 0}, {"ambientes": 9}, {"ambientes": 2.5},
    {"tipo": "castillo"}, {"tipo": "Apartment"},
    {"lat": "norte"}, {"lon": "este"}, {"lat": None},
])
def test_validacion_da_422(client, cambio):
    assert predecir(client, **cambio).status_code == 422


@pytest.mark.parametrize("campo", ["lat", "lon", "superficie", "ambientes", "tipo"])
def test_campo_faltante_da_422(client, campo):
    body = dict(PUERTO_MADERO)
    del body[campo]
    assert client.post("/predecir", json=body).status_code == 422


@pytest.mark.parametrize("cambio", [{"superficie": 10}, {"superficie": 2000}, {"ambientes": 1}, {"ambientes": 8}])
def test_limites_son_validos(client, cambio):
    assert predecir(client, **cambio).status_code == 200


def test_puerto_madero_mas_caro_que_gba_sur(client):
    caro = client.post("/predecir", json=PUERTO_MADERO).json()["precio_m2"]
    barato = client.post("/predecir", json=GBA_SUR).json()["precio_m2"]
    assert caro > barato


@pytest.mark.parametrize("punto", [
    {"lat": -35.0, "lon": -50.0},    # océano Atlántico
    {"lat": -33.45, "lon": -70.66},  # Santiago de Chile
    {"lat": 40.4, "lon": -3.7},      # Madrid
])
def test_fuera_de_cobertura(client, punto):
    r = predecir(client, **punto)
    assert r.status_code == 200
    assert r.json()["fuera_de_cobertura"] is True


def test_modelo_trae_metricas(modelo):
    for k in [
        "mae_usd_m2", "mape", "r2", "baseline_mae_usd_m2", "baseline_mape", "baseline_r2",
        "cobertura_intervalo", "n_entrenamiento", "n_prueba", "importancias",
        "version_sklearn", "fecha_entrenamiento", "descripcion",
    ]:
        assert k in modelo, k
    assert modelo["datos_hasta"] == "~2020"
    assert {"variable", "importancia"} <= set(modelo["importancias"][0])
    assert {i["variable"] for i in modelo["importancias"]} == {"lat", "lon", "superficie", "ambientes", "tipo"}


def test_cobertura_del_intervalo_razonable(modelo):
    assert 0.6 <= modelo["cobertura_intervalo"] <= 0.95


def test_modelo_supera_al_baseline_en_mae(modelo):
    assert modelo["mae_usd_m2"] < modelo["baseline_mae_usd_m2"]


def test_modelo_supera_al_baseline_en_mape(modelo):
    assert modelo["mape"] < modelo["baseline_mape"]
