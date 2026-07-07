import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL, type Estadisticas, type Zona, type TipoPropiedad } from "../api"
import { IconResumen, IconTopBarrios, IconBuscador, IconSuperficies } from "../components/Dock"

const SECCIONES = [
  {
    icon: IconResumen,
    titulo: "Resumen del mercado",
    descripcion: "Precio mediano por zona y tipo de propiedad, de un vistazo.",
  },
  {
    icon: IconTopBarrios,
    titulo: "Ranking de barrios",
    descripcion: "Los barrios más caros y más económicos, lado a lado.",
  },
  {
    icon: IconBuscador,
    titulo: "Buscador por zona",
    descripcion: "Precio y superficie promedio de cualquier barrio.",
  },
  {
    icon: IconSuperficies,
    titulo: "Análisis de superficies",
    descripcion: "Cómo varía el precio según la cantidad de ambientes.",
  },
]

function Intro() {
  const navigate = useNavigate()
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [zonas, setZonas] = useState<Zona[] | null>(null)
  const [tipos, setTipos] = useState<TipoPropiedad[] | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/estadisticas`)
      .then(res => res.json())
      .then(data => setEstadisticas(data))
    fetch(`${API_URL}/zonas`)
      .then(res => res.json())
      .then(data => setZonas(data))
    fetch(`${API_URL}/tipos-propiedad`)
      .then(res => res.json())
      .then(data => setTipos(data))
  }, [])

  const totalPropiedades = estadisticas ? estadisticas.total_propiedades.toLocaleString("es-AR") : "…"
  const precioMediano = estadisticas ? estadisticas.precio_mediano_caba : "…"
  const cantidadZonas = zonas ? zonas.length : "…"
  const cantidadTipos = tipos ? tipos.length : "…"

  return (
    <section className="page intro-page">
      <span className="eyebrow">Properati · Buenos Aires</span>
      <h1>Mercado inmobiliario<br />de CABA y GBA</h1>
      <p className="hero-sub">
        Un análisis de {totalPropiedades} propiedades en venta en Capital Federal y el Gran Buenos Aires,
        con datos reales de Properati sobre precio por m², superficies y comparativas por zona y por
        tipo de propiedad (departamentos, casas y PH).
      </p>

      <div className="mini-stats-row">
        <div className="mini-stat">
          <p className="mini-stat-value">{totalPropiedades}</p>
          <p className="mini-stat-label">Propiedades analizadas</p>
        </div>
        <div className="mini-stat">
          <p className="mini-stat-value">USD {precioMediano}</p>
          <p className="mini-stat-label">Precio mediano por m²</p>
        </div>
        <div className="mini-stat">
          <p className="mini-stat-value">{cantidadZonas}</p>
          <p className="mini-stat-label">Zonas cubiertas</p>
        </div>
        <div className="mini-stat">
          <p className="mini-stat-value">{cantidadTipos}</p>
          <p className="mini-stat-label">Tipos de propiedad</p>
        </div>
      </div>

      <div className="explora-section">
        <h2 className="explora-title">Qué vas a encontrar</h2>
        <div className="explora-grid">
          {SECCIONES.map(({ icon: Icon, titulo, descripcion }) => (
            <div className="explora-item" key={titulo}>
              <span className="explora-icon">
                <Icon />
              </span>
              <div>
                <p className="explora-item-title">{titulo}</p>
                <p className="explora-item-desc">{descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="scroll-down-btn" onClick={() => navigate("/resumen")}>
        Ver el análisis →
      </button>
    </section>
  )
}

export default Intro
