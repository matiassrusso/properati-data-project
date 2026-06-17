import zipfile
import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Descomprimimos el zip si todavía no está descomprimido
if not os.path.exists("properati"):
    with zipfile.ZipFile("properati.zip", "r") as z:
        z.extractall("properati")

# Cargamos y limpiamos los datos una sola vez al arrancar
df = pd.read_csv("properati/properati.csv")

df_caba = df[
    (df["state_name"] == "Capital Federal") &
    (df["operation"] == "sell")
].copy()

df_apts = df_caba[df_caba["property_type"] == "apartment"][[
    "place_name", "price_usd_per_m2", "surface_total_in_m2", "rooms"
]].copy()

df_apts = df_apts.dropna(subset=["price_usd_per_m2"])

df_apts = df_apts[
    (df_apts["price_usd_per_m2"] > 500) &
    (df_apts["price_usd_per_m2"] < 10000)
]

df_superficie = df_apts.dropna(subset=["surface_total_in_m2"])

# Endpoint 1: top 15 barrios por precio mediano
@app.get("/barrios")
def get_barrios():
    resultado = (
        df_apts
        .groupby("place_name")["price_usd_per_m2"]
        .median()
        .sort_values(ascending=False)
        .head(15)
        .reset_index()
        .rename(columns={"place_name": "barrio", "price_usd_per_m2": "precio_mediano"})
        .to_dict(orient="records")
    )
    return resultado

# Endpoint 2: estadísticas generales
@app.get("/estadisticas")
def get_estadisticas():
    return {
        "total_propiedades": len(df_apts),
        "precio_mediano_caba": round(df_apts["price_usd_per_m2"].median(), 2),
        "precio_minimo": round(df_apts["price_usd_per_m2"].min(), 2),
        "precio_maximo": round(df_apts["price_usd_per_m2"].max(), 2),
    }

# Endpoint 3: superficies
@app.get("/superficies")
def get_superficies():
    return {
        "promedio_superficies": round(df_superficie["surface_total_in_m2"].mean(), 2),
        "mediana_superficies": round(df_superficie["surface_total_in_m2"].median(), 2),
        "min_superficies": round(df_superficie["surface_total_in_m2"].min(), 2),
        "max_superficies": round(df_superficie["surface_total_in_m2"].max(), 2),
    }