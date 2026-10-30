import os
import sys

import pytest
from fastapi.testclient import TestClient

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVISO_SIN_AJUSTAR = "Sin ajustar: modelo entrenado con datos de ~2020 en USD nominales"
AVISO_CALIBRADO = "Ajustado a precios de publicación de CABA del 4T 2025 (IDECBA)"
GBA_SUR = {"lat": -34.78, "lon": -58.55, "superficie": 60, "ambientes": 2, "tipo": "apartment"}
PALERMO = {"lat": -34.5829, "lon": -58.4241, "superficie": 42, "ambientes": 2, "tipo": "apartment"}
MATADEROS = {"lat": -34.6573, "lon": -58.5070, "superficie": 42, "ambientes": 2, "tipo": "apartment"}


@pytest.fixture(scope="module")
def client():
    os.chdir(BACKEND)
    sys.path.insert(0, BACKEND)
    import main

    return TestClient(main.app)


def test_fuera_de_caba_no_se_calibra(client):
    d = client.post("/predecir", json=GBA_SUR).json()
    assert d["calibrado"] is False
    assert d["aviso"] == AVISO_SIN_AJUSTAR


def test_en_caba_se_calibra_y_lo_dice(client):
    d = client.post("/predecir", json=PALERMO).json()
    assert d["calibrado"] is True
    assert d["aviso"] == AVISO_CALIBRADO


def test_calibrado_acerca_el_sur_al_precio_oficial(client):
    # Mataderos, usado de 2 ambientes: oficial 4T 2025 = USD 1.814 por m2; el modelo crudo daba ~2.334
    d = client.post("/predecir", json=MATADEROS).json()
    assert abs(d["precio_m2"] - 1814) / 1814 < 0.15


def test_rango_se_calibra_junto_con_el_precio(client):
    d = client.post("/predecir", json=MATADEROS).json()
    assert d["rango"][0] <= d["precio_m2"] <= d["rango"][1]


def test_calibracion_mejora_dejando_cada_barrio_afuera():
    from ml.calibracion import evaluar_dejando_uno_afuera

    r = evaluar_dejando_uno_afuera()
    assert r["cubiertos"] == r["n"]
    assert r["mape_calibrado_loo"] < r["mape_sin_calibrar"]


def test_factor_none_lejos_de_los_barrios_oficiales():
    from ml.calibracion import factor_caba

    assert factor_caba(-34.78, -58.55) is None
    assert factor_caba(-34.5829, -58.4241) is not None


def test_modelo_expone_la_validacion_contra_datos_oficiales(client):
    d = client.get("/modelo").json()
    c = d["calibracion"]
    assert "IDECBA" in c["fuente"]
    assert c["validacion"]["mape_calibrado_loo"] < c["validacion"]["mape_sin_calibrar"]
    assert c["validacion"]["n"] >= 100
