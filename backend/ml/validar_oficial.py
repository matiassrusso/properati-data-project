"""Valida el modelo (entrenado con ~2020) contra los precios oficiales de CABA del 4T 2025.

Fuente: IDECBA, "Dinámica del mercado de venta de departamentos. Ciudad de Buenos Aires. 4to. trimestre de 2025"
(Informe de resultados 2010, febrero de 2026). Son precios de publicación en Argenprop, no de escritura.
Los valores de referencia_caba_4T2025.csv se transcribieron a mano del PDF (departamentos usados).

Uso, desde backend/:  python -m ml.validar_oficial
"""
import json
import os
import unicodedata

import numpy as np
import pandas as pd

from ml import train
from ml.predictor import EntradaPrediccion, predecir

RUTA_REF = os.path.join(os.path.dirname(__file__), "referencia_caba_4T2025.csv")
RUTA_SALIDA = os.path.join(os.path.dirname(__file__), "validacion_oficial.json")
# Tamaño típico de un usado según el mismo informe (tabla C.2): 31, 42 y 65 m2
CASOS = [("usd_m2_usados_1amb", 1, 31), ("usd_m2_usados_2amb", 2, 42), ("usd_m2_usados_3amb", 3, 65)]
MIN_PROPS = 20


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower().strip()
    return s.replace("general", "gral.").replace("gral. ", "gral. ")


def validar() -> dict:
    ref = pd.read_csv(RUTA_REF)
    datos = train.cargar_datos()
    datos = datos.assign(clave=datos["place_name"].map(norm))
    filas, sin_match = [], []
    for _, r in ref.iterrows():
        g = datos[datos["clave"] == norm(r["barrio"])]
        if len(g) < MIN_PROPS:
            sin_match.append(r["barrio"])
            continue
        lat, lon = float(g["lat"].mean()), float(g["lon"].mean())
        mediana_2020 = float(g["price_usd_per_m2"].median())
        for col, amb, sup in CASOS:
            oficial = r[col]
            if pd.isna(oficial):
                continue
            # calibrar=False: se valida el modelo crudo; si no, se mediría contra el mismo dato oficial (circular)
            p = predecir(EntradaPrediccion(lat=lat, lon=lon, superficie=sup, ambientes=amb, tipo="apartment"), calibrar=False)
            filas.append({
                "barrio": r["barrio"], "ambientes": amb, "oficial": float(oficial),
                "modelo": p["precio_m2"], "mediana_2020": round(mediana_2020), "n_2020": int(len(g)),
                "lat": round(lat, 5), "lon": round(lon, 5),
            })
    df = pd.DataFrame(filas)
    df["ratio"] = df["oficial"] / df["modelo"]
    df["err_abs_pct"] = (df["modelo"] - df["oficial"]).abs() / df["oficial"]
    df["err_abs_pct_mediana2020"] = (df["mediana_2020"] - df["oficial"]).abs() / df["oficial"]
    por_amb = df.groupby("ambientes").agg(
        n=("ratio", "size"), ratio_mediano=("ratio", "median"),
        mape=("err_abs_pct", "mean"), mape_mediana2020=("err_abs_pct_mediana2020", "mean"),
    ).round(3)
    resumen = {
        "fuente": "IDECBA, Dinámica del mercado de venta de departamentos, 4T 2025 (precios de publicación, Argenprop)",
        "n_comparaciones": int(len(df)),
        "ratio_oficial_sobre_modelo_mediano": round(float(df["ratio"].median()), 3),
        "mape_modelo": round(float(df["err_abs_pct"].mean()), 3),
        "mape_mediana_2020_del_barrio": round(float(df["err_abs_pct_mediana2020"].mean()), 3),
        "por_ambientes": por_amb.reset_index().to_dict(orient="records"),
        "barrios_sin_match": sin_match,
        "detalle": df.round(3).to_dict(orient="records"),
    }
    return resumen


if __name__ == "__main__":
    r = validar()
    with open(RUTA_SALIDA, "w", encoding="utf-8") as f:
        json.dump(r, f, ensure_ascii=False, indent=1)
    print({k: v for k, v in r.items() if k != "detalle"})
    d = pd.DataFrame(r["detalle"])
    d2 = d[d["ambientes"] == 2].sort_values("err_abs_pct", ascending=False)
    print("\nPeores 2 amb:\n", d2.head(8)[["barrio", "oficial", "modelo", "mediana_2020", "ratio"]].to_string(index=False))
    print("\nMejores 2 amb:\n", d2.tail(8)[["barrio", "oficial", "modelo", "mediana_2020", "ratio"]].to_string(index=False))
    print("\nSesgo (modelo - oficial) mediano en USD por m2 (2 amb):", float(np.median(d[d['ambientes']==2]['modelo'] - d[d['ambientes']==2]['oficial'])))
