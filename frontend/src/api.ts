export const API_URL = import.meta.env.VITE_API_URL || "https://properati-production.up.railway.app"

export interface Barrio {
  barrio: string
  precio_mediano: number
}

export interface Estadisticas {
  total_propiedades: number
  precio_mediano_caba: number
  precio_minimo: number
  precio_maximo: number
}

export interface Superficies {
  promedio_superficies: number
  mediana_superficies: number
  min_superficies: number
  max_superficies: number
}

export interface DetalleBarrio {
  barrio: string
  cantidad_propiedades: number
  precio_mediano: number
  precio_minimo: number
  precio_maximo: number
  superficie_promedio: number
  error?: string
}

export interface Zona {
  zona: string
  precio_mediano: number
  cantidad_propiedades: number
}

export interface TipoPropiedad {
  tipo: string
  precio_mediano: number
  cantidad_propiedades: number
  superficie_promedio: number
}

export interface Ambiente {
  ambientes: string
  precio_mediano: number
  cantidad_propiedades: number
}

export interface DetalleZona {
  zona: string
  cantidad_propiedades: number
  precio_mediano: number
  superficie_promedio: number
  por_tipo: {
    tipo: string
    precio_mediano: number
    cantidad_propiedades: number
  }[]
}

export interface MatrizTipo {
  tipo: string
  precio_mediano: number
  cantidad_propiedades: number
}

export interface MatrizZona {
  zona: string
  tipos: MatrizTipo[]
}