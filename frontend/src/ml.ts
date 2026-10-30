export type Tipo = "apartment" | "house" | "PH"

export interface PeticionPrediccion {
  lat: number
  lon: number
  superficie: number
  ambientes: number
  tipo: Tipo
}

export interface Prediccion {
  precio_m2: number
  rango: [number, number]
  precio_total: number
  rango_total: [number, number]
  referencia: { barrio: string; mediana_m2: number; cantidad: number } | null
  fuera_de_cobertura: boolean
  calibrado: boolean
  aviso: string
}

export interface Modelo {
  mae_usd_m2: number
  mape: number
  r2: number
  baseline_mae_usd_m2: number
  baseline_mape: number
  baseline_r2: number
  cobertura_intervalo: number
  n_entrenamiento: number
  n_prueba: number
  importancias: { variable: string; importancia: number }[]
  datos_hasta: string
  calibracion?: {
    fuente: string
    validacion: { n: number; mape_sin_calibrar: number; mape_calibrado_loo: number }
  }
}

export const TIPOS: { valor: Tipo; etiqueta: string }[] = [
  { valor: "apartment", etiqueta: "Departamento" },
  { valor: "house", etiqueta: "Casa" },
  { valor: "PH", etiqueta: "PH" },
]

export const NOMBRE_VARIABLE: Record<string, string> = {
  lat: "Latitud",
  lon: "Longitud",
  superficie: "Superficie",
  ambientes: "Ambientes",
  tipo: "Tipo de propiedad",
}
