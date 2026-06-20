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

zonas_amba = [
    "Capital Federal",
    "Bs.As. G.B.A. Zona Norte",
    "Bs.As. G.B.A. Zona Sur",
    "Bs.As. G.B.A. Zona Oeste",
]
tipos_propiedad = ["apartment", "house", "PH"]
nombres_tipos = {"apartment": "Departamento", "house": "Casa", "PH": "PH"}

df_amba = df[
    (df["state_name"].isin(zonas_amba)) &
    (df["operation"] == "sell")
].copy()

df_apts = df_amba[df_amba["property_type"].isin(tipos_propiedad)][[
    "place_name", "state_name", "property_type", "price_usd_per_m2", "surface_total_in_m2", "rooms"
]].copy()

df_apts = df_apts.dropna(subset=["price_usd_per_m2"])

df_apts = df_apts[
    (df_apts["price_usd_per_m2"] > 300) &
    (df_apts["price_usd_per_m2"] < 15000)
]

df_superficie = df_apts.dropna(subset=["surface_total_in_m2"])

# DataFrame: precio y cantidad por zona, de mayor a menor precio mediano
df_zonas = (
    df_apts
    .groupby("state_name")["price_usd_per_m2"]
    .agg(precio_mediano="median", cantidad_propiedades="count")
    .reset_index()
    .rename(columns={"state_name": "zona"})
    .sort_values("precio_mediano", ascending=False)
    .round(2)
)

# DataFrame: precio, cantidad y superficie por tipo de propiedad
df_tipos = (
    df_apts
    .groupby("property_type")
    .agg(
        precio_mediano=("price_usd_per_m2", "median"),
        cantidad_propiedades=("price_usd_per_m2", "count"),
        superficie_promedio=("surface_total_in_m2", "mean"),
    )
    .reindex(tipos_propiedad)
    .reset_index()
    .round(2)
)
df_tipos["tipo"] = df_tipos["property_type"].map(nombres_tipos)
df_tipos = df_tipos[["tipo", "precio_mediano", "cantidad_propiedades", "superficie_promedio"]]

# DataFrame: precio y cantidad por cantidad de ambientes (5 o más se agrupa en "5+")
df_ambientes_base = df_apts.dropna(subset=["rooms"]).copy()
df_ambientes_base["ambientes"] = pd.cut(
    df_ambientes_base["rooms"],
    bins=[0, 1, 2, 3, 4, float("inf")],
    labels=["1", "2", "3", "4", "5+"],
)

df_ambientes = (
    df_ambientes_base
    .groupby("ambientes", observed=True)["price_usd_per_m2"]
    .agg(precio_mediano="median", cantidad_propiedades="count")
    .reset_index()
    .round(2)
)
df_ambientes["ambientes"] = df_ambientes["ambientes"].astype(str)

# DataFrame: top 15 barrios más baratos por precio mediano
df_barrios_economicos = (
    df_apts
    .groupby("place_name")["price_usd_per_m2"]
    .median()
    .sort_values(ascending=True)
    .head(15)
    .reset_index()
    .round(2)
    .rename(columns={"place_name": "barrio", "price_usd_per_m2": "precio_mediano"})
)

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
        .round(2)
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

# Endpoint 4: detalle de un barrio específico
@app.get("/barrio/{nombre}")
def get_barrio_detalle(nombre: str):
    datos_barrio = df_apts[df_apts["place_name"].str.lower() == nombre.lower()]
    
    if len(datos_barrio) == 0:
        return {"error": "Barrio no encontrado"}
    
    return {
        "barrio": nombre,
        "cantidad_propiedades": len(datos_barrio),
        "precio_mediano": round(datos_barrio["price_usd_per_m2"].median(), 2),
        "precio_minimo": round(datos_barrio["price_usd_per_m2"].min(), 2),
        "precio_maximo": round(datos_barrio["price_usd_per_m2"].max(), 2),
        "superficie_promedio": round(datos_barrio["surface_total_in_m2"].mean(), 2),
    }

# Endpoint 5: zonas (state_name) por precio mediano
@app.get("/zonas")
def get_zonas():
    return df_zonas.to_dict(orient="records")

# Endpoint 6: tipos de propiedad con precio, cantidad y superficie
@app.get("/tipos-propiedad")
def get_tipos_propiedad():
    return df_tipos.to_dict(orient="records")

# Endpoint 7: precios agrupados por cantidad de ambientes
@app.get("/ambientes")
def get_ambientes():
    return df_ambientes.to_dict(orient="records")

# Endpoint 8: top 15 barrios más económicos por precio mediano
@app.get("/barrios-economicos")
def get_barrios_economicos():
    return df_barrios_economicos.to_dict(orient="records")

# Endpoint 9: detalle de una zona específica, con desglose por tipo de propiedad
@app.get("/zona/{nombre}")
def get_zona_detalle(nombre: str):
    datos_zona = df_apts[df_apts["state_name"].str.lower() == nombre.lower()]

    if len(datos_zona) == 0:
        return {"error": "Zona no encontrada"}

    por_tipo = (
        datos_zona
        .groupby("property_type")
        .agg(
            precio_mediano=("price_usd_per_m2", "median"),
            cantidad_propiedades=("price_usd_per_m2", "count"),
        )
        .reset_index()
        .round(2)
    )
    por_tipo["tipo"] = por_tipo["property_type"].map(nombres_tipos)
    por_tipo = por_tipo[["tipo", "precio_mediano", "cantidad_propiedades"]]

    return {
        "zona": nombre,
        "cantidad_propiedades": len(datos_zona),
        "precio_mediano": round(datos_zona["price_usd_per_m2"].median(), 2),
        "superficie_promedio": round(datos_zona["surface_total_in_m2"].mean(), 2),
        "por_tipo": por_tipo.to_dict(orient="records"),
    }