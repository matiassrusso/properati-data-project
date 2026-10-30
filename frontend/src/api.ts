export const API_URL = import.meta.env.VITE_API_URL || "https://properati-api.onrender.com"

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

// un solo formato de números en toda la app
export const fmt = (n: number, digits = 0) =>
  n.toLocaleString("es-AR", { maximumFractionDigits: digits })

export interface CeldaMapa {
  lat: number
  lon: number
  precio_mediano: number
  cantidad: number
}

export interface BarrioMapa {
  barrio: string
  lat: number
  lon: number
  precio_mediano: number
  cantidad: number
}

export interface MapaPrecios {
  celdas: CeldaMapa[]
  barrios: BarrioMapa[]
}

// "Bs.As. G.B.A. Zona Oeste" -> "GBA Zona Oeste"
export const zonaCorta = (zona: string) => zona.replace("Bs.As. G.B.A.", "GBA").trim()
