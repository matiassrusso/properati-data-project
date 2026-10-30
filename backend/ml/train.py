"""Entrena el predictor de precio por m2. Correr desde backend/: python -m ml.train

Decisiones:
- Target: log(price_usd_per_m2). Features: lat, lon, superficie, ambientes, tipo.
- Se descartan filas con superficie fuera de [10, 2000] m2 (los mismos límites que valida el endpoint).
- ambientes: ~47% de los avisos no lo trae. Se conservan esas filas con NaN (HistGradientBoosting
  maneja NaN de forma nativa) y se recorta a 8 para coincidir con el rango del endpoint.
- Baseline: mediana de precio por m2 del barrio (place_name), calculada solo con train.
- Los datos son de ~2020 en USD nominales: el modelo no predice precios de hoy.
"""
import json
import os
import warnings
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

AQUI = os.path.dirname(os.path.abspath(__file__))
RUTA_MODELO = os.path.join(AQUI, "modelo.joblib")
RUTA_METRICAS = os.path.join(AQUI, "metricas.json")

FEATURES = ["lat", "lon", "superficie", "ambientes", "tipo"]
CATEGORIAS = ["apartment", "house", "PH"]
SUP_MIN, SUP_MAX = 10, 2000
SEMILLA = 42
# Early stopping sobre una porción de train (no toca test) para fijar el número de árboles.
PARAMS = dict(
    learning_rate=0.06,
    max_iter=1500,
    max_leaf_nodes=31,
    min_samples_leaf=20,
    l2_regularization=1.0,
    categorical_features=[FEATURES.index("tipo")],
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=30,
    random_state=SEMILLA,
)


def cargar_datos() -> pd.DataFrame:
    import main  # mismo filtro que usa la app (df_geo); main solo importa ml.predictor, que no importa esto a nivel módulo

    return main.df_geo


def preparar(df_geo: pd.DataFrame) -> pd.DataFrame:
    d = df_geo[df_geo["surface_total_in_m2"].between(SUP_MIN, SUP_MAX)]
    d = d[d["property_type"].isin(CATEGORIAS)]
    return pd.DataFrame({
        "lat": d["lat"], "lon": d["lon"],
        "superficie": d["surface_total_in_m2"],
        "ambientes": d["rooms"].clip(upper=8),
        "tipo": d["property_type"].map(CATEGORIAS.index),
        "barrio": d["place_name"],
        "precio_m2": d["price_usd_per_m2"],
    }).reset_index(drop=True)


def metricas_escala_original(y, pred):
    err = pred - y
    return {
        "mae": float(np.abs(err).mean()),
        "mape": float((np.abs(err) / y).mean()),
        "r2": float(1 - (err ** 2).sum() / ((y - y.mean()) ** 2).sum()),
    }


def entrenar(df_geo: pd.DataFrame | None = None, guardar: bool = True) -> dict:
    datos = preparar(cargar_datos() if df_geo is None else df_geo)
    train, test = train_test_split(datos, test_size=0.2, random_state=SEMILLA)
    X_tr, X_te = train[FEATURES], test[FEATURES]
    y_tr, y_te = np.log(train["precio_m2"]), test["precio_m2"].to_numpy()

    central = HistGradientBoostingRegressor(loss="squared_error", **PARAMS).fit(X_tr, y_tr)
    q10 = HistGradientBoostingRegressor(loss="quantile", quantile=0.1, **PARAMS).fit(X_tr, y_tr)
    q90 = HistGradientBoostingRegressor(loss="quantile", quantile=0.9, **PARAMS).fit(X_tr, y_tr)

    pred = np.exp(central.predict(X_te))
    lo, hi = np.exp(q10.predict(X_te)), np.exp(q90.predict(X_te))
    lo, hi = np.minimum(lo, pred), np.maximum(hi, pred)  # mismo clip que el endpoint
    m = metricas_escala_original(y_te, pred)

    med_barrio = train.groupby("barrio")["precio_m2"].median()
    base = test["barrio"].map(med_barrio).fillna(train["precio_m2"].median()).to_numpy()
    b = metricas_escala_original(y_te, base)

    pi = permutation_importance(
        central, X_te, np.log(y_te), n_repeats=5, random_state=SEMILLA, scoring="r2"
    )
    importancias = sorted(
        ({"variable": f, "importancia": round(float(v), 4)} for f, v in zip(FEATURES, pi.importances_mean)),
        key=lambda x: -x["importancia"],
    )

    metricas = {
        "mae_usd_m2": round(m["mae"], 2), "mape": round(m["mape"], 4), "r2": round(m["r2"], 4),
        "baseline_mae_usd_m2": round(b["mae"], 2), "baseline_mape": round(b["mape"], 4),
        "baseline_r2": round(b["r2"], 4),
        "cobertura_intervalo": round(float(((y_te >= lo) & (y_te <= hi)).mean()), 4),
        "n_entrenamiento": len(train), "n_prueba": len(test),
        "importancias": importancias,
        "iteraciones": [int(central.n_iter_), int(q10.n_iter_), int(q90.n_iter_)],
        "version_sklearn": sklearn.__version__,
        "fecha_entrenamiento": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    artefacto = {
        "central": central, "q10": q10, "q90": q90,
        "categorias": CATEGORIAS, "features": FEATURES, "metricas": metricas,
    }
    if guardar:
        joblib.dump(artefacto, RUTA_MODELO, compress=3)
        with open(RUTA_METRICAS, "w", encoding="utf-8") as f:
            json.dump(metricas, f, indent=2, ensure_ascii=False)
    return artefacto


if __name__ == "__main__":
    warnings.filterwarnings("ignore", category=FutureWarning)
    art = entrenar()
    print(json.dumps(art["metricas"], indent=2, ensure_ascii=False))
    print(f"{RUTA_MODELO}: {os.path.getsize(RUTA_MODELO) / 1e6:.2f} MB")
