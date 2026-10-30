import logging
import os
from functools import lru_cache
from typing import Literal

import joblib
import numpy as np
import pandas as pd
import sklearn
from pydantic import BaseModel, Field

from ml import train
from ml.calibracion import factor_caba, resumen

log = logging.getLogger("uvicorn.error")

AVISO_SIN_AJUSTAR = "Sin ajustar: modelo entrenado con datos de ~2020 en USD nominales"
AVISO_CALIBRADO = "Ajustado a precios de publicación de CABA del 4T 2025 (IDECBA)"
DESCRIPCION = (
    "HistGradientBoosting sobre log(USD por m2) con lat, lon, superficie, ambientes y tipo; "
    "intervalo del 80% con regresiones cuantiles (q10 y q90). Aprende del dataset de ~2020; dentro de CABA "
    "se ajusta con los precios de publicación oficiales del 4T 2025 (IDECBA), fuera de CABA queda sin ajustar."
)
LAT_MIN, LAT_MAX = -35.2, -34.2
LON_MIN, LON_MAX = -59.2, -58.0
MIN_PROPS_BARRIO = 30


class EntradaPrediccion(BaseModel):
    lat: float = Field(ge=-90, le=90, allow_inf_nan=False)
    lon: float = Field(ge=-180, le=180, allow_inf_nan=False)
    superficie: float = Field(ge=10, le=2000, allow_inf_nan=False)
    ambientes: int = Field(ge=1, le=8)
    tipo: Literal["apartment", "house", "PH"]


class Referencia(BaseModel):
    barrio: str
    mediana_m2: int
    cantidad: int


class SalidaPrediccion(BaseModel):
    precio_m2: int
    rango: list[int]
    precio_total: int
    rango_total: list[int]
    referencia: Referencia | None
    fuera_de_cobertura: bool
    calibrado: bool
    aviso: str


@lru_cache(maxsize=1)
def cargar_artefacto() -> dict:
    # Si falta el joblib o no coincide la versión de scikit-learn, se reentrena en memoria una vez.
    try:
        art = joblib.load(train.RUTA_MODELO)
        if art["metricas"]["version_sklearn"] != sklearn.__version__:
            raise RuntimeError(
                f"pickle de scikit-learn {art['metricas']['version_sklearn']}, instalado {sklearn.__version__}"
            )
        return art
    except Exception as e:
        log.warning("No se pudo cargar %s (%s); reentrenando en memoria", os.path.basename(train.RUTA_MODELO), e)
        return train.entrenar(guardar=False)


@lru_cache(maxsize=1)
def _barrios() -> pd.DataFrame:
    g = train.cargar_datos()
    b = g.groupby("place_name").agg(
        lat=("lat", "mean"), lon=("lon", "mean"),
        mediana=("price_usd_per_m2", "median"), cantidad=("price_usd_per_m2", "count"),
    )
    return b[b["cantidad"] >= MIN_PROPS_BARRIO].reset_index()


def _referencia(lat: float, lon: float) -> dict | None:
    b = _barrios()
    if b.empty:
        return None
    # lon se escala por cos(lat) para que la distancia sea ~isótropa en metros
    k = np.cos(np.radians(lat))
    i = (((b["lat"] - lat) ** 2) + (((b["lon"] - lon) * k) ** 2)).idxmin()
    r = b.loc[i]
    return {"barrio": r["place_name"], "mediana_m2": int(round(r["mediana"])), "cantidad": int(r["cantidad"])}


def predecir(e: EntradaPrediccion, calibrar: bool = True) -> dict:
    art = cargar_artefacto()
    X = pd.DataFrame(
        [[e.lat, e.lon, e.superficie, e.ambientes, art["categorias"].index(e.tipo)]],
        columns=art["features"],
    )
    p = float(np.exp(art["central"].predict(X)[0]))
    lo = min(float(np.exp(art["q10"].predict(X)[0])), p)
    hi = max(float(np.exp(art["q90"].predict(X)[0])), p)
    # dentro de CABA se corrige con los precios oficiales actuales; el rango se escala igual
    f = factor_caba(e.lat, e.lon) if calibrar else None
    if f is not None:
        p, lo, hi = p * f, lo * f, hi * f
    precio_m2, rango = round(p), [round(lo), round(hi)]
    return {
        "precio_m2": precio_m2,
        "rango": rango,
        "precio_total": round(precio_m2 * e.superficie),
        "rango_total": [round(r * e.superficie) for r in rango],
        "referencia": _referencia(e.lat, e.lon),
        "fuera_de_cobertura": not (LAT_MIN <= e.lat <= LAT_MAX and LON_MIN <= e.lon <= LON_MAX),
        "calibrado": f is not None,
        "aviso": AVISO_SIN_AJUSTAR if f is None else AVISO_CALIBRADO,
    }


def info_modelo() -> dict:
    return {
        **cargar_artefacto()["metricas"],
        "datos_hasta": "~2020",
        "descripcion": DESCRIPCION,
        "calibracion": resumen(),
    }
