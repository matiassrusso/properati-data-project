import { useState, useEffect } from "react"
import { API_URL, type DetalleBarrio, type Zona, type DetalleZona } from "../api"

const COLORES_ZONA = ["stat-coral", "stat-lime", "stat-cream", "stat-coral"]

function Buscador() {
  const [busqueda, setBusqueda] = useState("")
  const [detalle, setDetalle] = useState<DetalleBarrio | null>(null)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [zonaSeleccionada, setZonaSeleccionada] = useState<DetalleZona | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/zonas`)
      .then(res => res.json())
      .then(data => setZonas(data))
  }, [])

  // FIX 4: debounce — espera 400ms después de que el usuario deja de tipear
  // antes de buscar. Así no dispara un fetch (y un posible error) por cada letra.
  useEffect(() => {
    if (!busqueda.trim()) {
      return
    }

    const timeoutId = setTimeout(() => {
      fetch(`${API_URL}/barrio/${busqueda}`)
        .then(res => res.json())
        .then(data => setDetalle(data))
    }, 400)

    // Si el usuario sigue tipeando antes de que pasen los 400ms,
    // cancelamos el timeout anterior y arrancamos uno nuevo.
    return () => clearTimeout(timeoutId)
  }, [busqueda])

  const buscarZona = (zona: string) => {
    fetch(`${API_URL}/zona/${zona}`)
      .then(res => res.json())
      .then(data => setZonaSeleccionada(data))
  }

  return (
    <section className="page search-section">
      <h2>Buscá tu barrio</h2>
      <input
        type="text"
        placeholder="Ej: Palermo, Belgrano, Recoleta..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {!busqueda.trim() && zonas.length > 0 && (
        <div className="zona-explorer">
          <h3 className="section-title">Explorá por zona</h3>
          <div className="stats-grid-compact">
            {zonas.map((z, i) => (
              <button
                key={z.zona}
                className={`stat-card stat-card-btn ${COLORES_ZONA[i % COLORES_ZONA.length]}`}
                onClick={() => buscarZona(z.zona)}
              >
                <p className="stat-label">{z.zona}</p>
                <p className="stat-value">USD {z.precio_mediano}</p>
                <p className="stat-unit">{z.cantidad_propiedades.toLocaleString()} propiedades</p>
              </button>
            ))}
          </div>

          {zonaSeleccionada && (
            <div className="detalle-card">
              <h3>{zonaSeleccionada.zona}</h3>
              <div className="detalle-grid">
                <div>
                  <p className="detalle-label">Precio mediano</p>
                  <p className="detalle-value">USD {zonaSeleccionada.precio_mediano}/m²</p>
                </div>
                <div>
                  <p className="detalle-label">Propiedades</p>
                  <p className="detalle-value">{zonaSeleccionada.cantidad_propiedades.toLocaleString()}</p>
                </div>
                <div>
                  <p className="detalle-label">Superficie promedio</p>
                  <p className="detalle-value">{zonaSeleccionada.superficie_promedio} m²</p>
                </div>
              </div>

              <div className="detalle-portipo">
                <p className="detalle-label">Por tipo de propiedad</p>
                {zonaSeleccionada.por_tipo.map(t => (
                  <div key={t.tipo} className="detalle-portipo-row">
                    <strong>{t.tipo}</strong>
                    <span>USD {t.precio_mediano}/m² · {t.cantidad_propiedades.toLocaleString()} propiedades</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {busqueda.trim() && detalle && !detalle.error && (
        <div className="detalle-card">
          <h3>{detalle.barrio}</h3>
          <div className="detalle-grid">
            <div>
              <p className="detalle-label">Precio mediano</p>
              <p className="detalle-value">USD {detalle.precio_mediano}/m²</p>
            </div>
            <div>
              <p className="detalle-label">Rango de precios</p>
              <p className="detalle-value">USD {detalle.precio_minimo} — {detalle.precio_maximo}</p>
            </div>
            <div>
              <p className="detalle-label">Propiedades</p>
              <p className="detalle-value">{detalle.cantidad_propiedades}</p>
            </div>
            <div>
              <p className="detalle-label">Superficie promedio</p>
              <p className="detalle-value">{detalle.superficie_promedio} m²</p>
            </div>
          </div>
        </div>
      )}

      {detalle?.error && busqueda.trim().length >= 3 && (
        <p className="detalle-error">No encontramos ese barrio. Probá con otro nombre.</p>
      )}
    </section>
  )
}

export default Buscador
