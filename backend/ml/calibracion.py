"""Calibración del modelo (aprendido de ~2020) con los precios oficiales de CABA del 4T 2025.

Idea: para cada barrio con dato oficial se calcula log(oficial / modelo). Para un punto de CABA se
promedian los factores de los barrios más cercanos (ponderados por distancia) y se multiplica la
predicción. Fuera de CABA no hay dato oficial, así que no se calibra.

Uso, desde backend/:  python -m ml.calibracion      (reconstruye calibracion_caba.json y evalúa)
"""
import json
import os
from functools import lru_cache

import numpy as np
import pandas as pd

RUTA = os.path.join(os.path.dirname(__file__), "calibracion_caba.json")
K = 3  # barrios vecinos que se promedian
SUAVIZADO_KM = 0.5
MAX_KM = 3.5  # más lejos del barrio oficial más cercano no se calibra
FUENTE = "IDECBA, Dinámica del mercado de venta de departamentos, 4T 2025 (precios de publicación, Argenprop)"


def _km(lat1, lon1, lat2, lon2):
    k = np.cos(np.radians(lat1))
    return 111.2 * np.sqrt((lat1 - lat2) ** 2 + ((lon1 - lon2) * k) ** 2)


def _factor(lat, lon, tabla: pd.DataFrame):
    if tabla.empty:
        return None
    d = _km(lat, lon, tabla["lat"].to_numpy(), tabla["lon"].to_numpy())
    idx = np.argsort(d)[:K]
    if d[idx[0]] > MAX_KM:
        return None
    w = 1.0 / (d[idx] + SUAVIZADO_KM)
    return float(np.exp(np.sum(w * tabla["log_ratio"].to_numpy()[idx]) / np.sum(w)))


def construir() -> pd.DataFrame:
    from ml.validar_oficial import validar

    det = pd.DataFrame(validar()["detalle"])
    det["log_ratio"] = np.log(det["ratio"])
    tabla = det.groupby("barrio").agg(lat=("lat", "first"), lon=("lon", "first"), log_ratio=("log_ratio", "mean")).reset_index()
    with open(RUTA, "w", encoding="utf-8") as f:
        json.dump(
            {"fuente": FUENTE, "validacion": evaluar_dejando_uno_afuera(), "barrios": tabla.round(5).to_dict(orient="records")},
            f, ensure_ascii=False, indent=1,
        )
    _tabla.cache_clear()
    return tabla


def resumen() -> dict:
    """Fuente y error medido de la calibración, para mostrarlos en la API."""
    if not os.path.exists(RUTA):
        return {}
    with open(RUTA, encoding="utf-8") as f:
        d = json.load(f)
    return {"fuente": d["fuente"], "validacion": d.get("validacion", {})}


@lru_cache(maxsize=1)
def _tabla() -> pd.DataFrame:
    if not os.path.exists(RUTA):
        return pd.DataFrame(columns=["barrio", "lat", "lon", "log_ratio"])
    with open(RUTA, encoding="utf-8") as f:
        return pd.DataFrame(json.load(f)["barrios"])


def factor_caba(lat: float, lon: float):
    """Multiplicador a aplicar a la predicción en (lat, lon), o None si el punto no está cubierto."""
    return _factor(lat, lon, _tabla())


def evaluar_dejando_uno_afuera() -> dict:
    """Error antes y después de calibrar, dejando cada barrio fuera de su propia calibración."""
    from ml.validar_oficial import validar

    det = pd.DataFrame(validar()["detalle"])
    det["log_ratio"] = np.log(det["ratio"])
    tabla = det.groupby("barrio").agg(lat=("lat", "first"), lon=("lon", "first"), log_ratio=("log_ratio", "mean")).reset_index()
    antes, despues, cubiertos = [], [], 0
    for _, r in det.iterrows():
        f = _factor(r["lat"], r["lon"], tabla[tabla["barrio"] != r["barrio"]])
        antes.append(abs(r["modelo"] - r["oficial"]) / r["oficial"])
        if f is None:
            despues.append(antes[-1])
        else:
            cubiertos += 1
            despues.append(abs(r["modelo"] * f - r["oficial"]) / r["oficial"])
    return {
        "n": int(len(det)),
        "cubiertos": cubiertos,
        "mape_sin_calibrar": round(float(np.mean(antes)), 4),
        "mape_calibrado_loo": round(float(np.mean(despues)), 4),
    }


if __name__ == "__main__":
    t = construir()
    print("barrios calibrados:", len(t))
    print(evaluar_dejando_uno_afuera())
