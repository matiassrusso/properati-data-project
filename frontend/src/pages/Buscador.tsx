import { useState, useEffect } from "react"
import { API_URL, fmt, zonaCorta, type DetalleBarrio, type Zona, type DetalleZona } from "../api"

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

  // debounce: espera 400ms después de que el usuario deja de tipear
  // antes de buscar, así no dispara un fetch (y un posible error) por cada letra.
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

  const zonasOrdenadas = [...zonas].sort((a, b) => b.precio_mediano - a.precio_mediano)
  const maxZona = zonasOrdenadas[0]?.precio_mediano ?? 1

  return (
    <section className="page">
      <h2>Buscá tu barrio</h2>
      <label className="sr-only" htmlFor="busqueda">Barrio</label>
      <input
        id="busqueda"
        type="text"
        placeholder="Ej: Palermo, Belgrano, Recoleta"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {!busqueda.trim() && zonasOrdenadas.length > 0 && (
        <>
          <h3 className="section-title">Explorá por zona</h3>
          <ul className="rank">
            {zonasOrdenadas.map(z => (
              <li key={z.zona}>
                <button
                  className="rank-row"
                  aria-pressed={zonaSeleccionada?.zona === z.zona}
                  onClick={() => buscarZona(z.zona)}
                >
                  <span className="rank-name">
                    {zonaCorta(z.zona)}
                    <span className="rank-sub">{fmt(z.cantidad_propiedades)} propiedades</span>
                  </span>
                  <span className="rank-bar" aria-hidden="true">
                    <i style={{ width: `${(z.precio_mediano / maxZona) * 100}%` }} />
                  </span>
                  <span className="rank-value">USD {fmt(z.precio_mediano)}</span>
                </button>
              </li>
            ))}
          </ul>

          {zonaSeleccionada && (
            <div className="detalle">
              <h3>{zonaCorta(zonaSeleccionada.zona)}</h3>
              <dl className="kv">
                <div>
                  <dt>Precio mediano</dt>
                  <dd>USD {fmt(zonaSeleccionada.precio_mediano)}<small>/m²</small></dd>
                </div>
                <div>
                  <dt>Propiedades</dt>
                  <dd>{fmt(zonaSeleccionada.cantidad_propiedades)}</dd>
                </div>
                <div>
                  <dt>Superficie promedio</dt>
                  <dd>{fmt(zonaSeleccionada.superficie_promedio, 1)}<small>m²</small></dd>
                </div>
              </dl>

              <div className="detalle-portipo">
                {zonaSeleccionada.por_tipo.map(t => (
                  <div key={t.tipo} className="detalle-portipo-row">
                    <strong>{t.tipo}</strong>
                    <span>USD {fmt(t.precio_mediano)}/m² · {fmt(t.cantidad_propiedades)} propiedades</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {busqueda.trim() && detalle && !detalle.error && (
        <div className="detalle">
          <h3>{detalle.barrio}</h3>
          <dl className="kv">
            <div>
              <dt>Precio mediano</dt>
              <dd>USD {fmt(detalle.precio_mediano)}<small>/m²</small></dd>
            </div>
            <div>
              <dt>Rango de precios</dt>
              <dd>{fmt(detalle.precio_minimo)} a {fmt(detalle.precio_maximo)}<small>USD</small></dd>
            </div>
            <div>
              <dt>Propiedades</dt>
              <dd>{fmt(detalle.cantidad_propiedades)}</dd>
            </div>
            <div>
              <dt>Superficie promedio</dt>
              <dd>{fmt(detalle.superficie_promedio, 1)}<small>m²</small></dd>
            </div>
          </dl>
        </div>
      )}

      {detalle?.error && busqueda.trim().length >= 3 && (
        <p className="detalle-error">No encontramos ese barrio. Probá con otro nombre.</p>
      )}
    </section>
  )
}

export default Buscador
