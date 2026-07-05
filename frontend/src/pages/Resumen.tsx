import { useState, useEffect } from "react"
import { API_URL, type Estadisticas, type Superficies, type Zona, type TipoPropiedad, type MatrizZona } from "../api"

const COLORES_ZONA = ["stat-coral", "stat-lime", "stat-cream", "stat-coral"]
const COLORES_TIPO = ["stat-coral", "stat-lime", "stat-cream"]

function Resumen() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [superficies, setSuperficies] = useState<Superficies | null>(null)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [tipos, setTipos] = useState<TipoPropiedad[]>([])
  const [matriz, setMatriz] = useState<MatrizZona[]>([])

  useEffect(() => {
    fetch(`${API_URL}/estadisticas`)
      .then(res => res.json())
      .then(data => setEstadisticas(data))

    fetch(`${API_URL}/superficies`)
      .then(res => res.json())
      .then(data => setSuperficies(data))

    fetch(`${API_URL}/zonas`)
      .then(res => res.json())
      .then(data => setZonas(data))

    fetch(`${API_URL}/tipos-propiedad`)
      .then(res => res.json())
      .then(data => setTipos(data))

    fetch(`${API_URL}/matriz-zona-tipo`)
      .then(res => res.json())
      .then(data => setMatriz(data))
  }, [])

  const columnasTipo = matriz[0]?.tipos.map(t => t.tipo) ?? []

  return (
    <section className="page resumen-page">
      <h2>Resumen del mercado</h2>

      {estadisticas && superficies && (
        <div className="stats-grid">
          <div className="stat-card stat-coral">
            <p className="stat-label">Precio mediano</p>
            <p className="stat-value">USD {estadisticas.precio_mediano_caba}</p>
            <p className="stat-unit">por m²</p>
          </div>
          <div className="stat-card stat-lime">
            <p className="stat-label">Propiedades analizadas</p>
            <p className="stat-value">{estadisticas.total_propiedades.toLocaleString()}</p>
            <p className="stat-unit">en venta</p>
          </div>
          <div className="stat-card stat-cream">
            <p className="stat-label">Superficie mediana</p>
            <p className="stat-value">{superficies.mediana_superficies}</p>
            <p className="stat-unit">m²</p>
          </div>
        </div>
      )}

      {zonas.length > 0 && (
        <>
          <h3 className="section-title">Precio por zona</h3>
          <div className="stats-grid-compact">
            {zonas.map((z, i) => (
              <div key={z.zona} className={`stat-card ${COLORES_ZONA[i % COLORES_ZONA.length]}`}>
                <p className="stat-label">{z.zona}</p>
                <p className="stat-value">USD {z.precio_mediano}</p>
                <p className="stat-unit">{z.cantidad_propiedades.toLocaleString()} propiedades</p>
              </div>
            ))}
          </div>
        </>
      )}

      {tipos.length > 0 && (
        <>
          <h3 className="section-title">Precio por tipo de propiedad</h3>
          <div className="stats-grid">
            {tipos.map((t, i) => (
              <div key={t.tipo} className={`stat-card ${COLORES_TIPO[i % COLORES_TIPO.length]}`}>
                <p className="stat-label">{t.tipo}</p>
                <p className="stat-value">USD {t.precio_mediano}</p>
                <p className="stat-unit">por m²</p>
                <div className="stat-extra">
                  <span>{t.cantidad_propiedades.toLocaleString()} propiedades</span>
                  <span>{t.superficie_promedio} m² promedio</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {matriz.length > 0 && (
        <>
          <h3 className="section-title">Precio por zona y tipo de propiedad</h3>
          <div className="matriz-wrapper">
            <table className="matriz-table">
              <thead>
                <tr>
                  <th scope="col">Zona</th>
                  {columnasTipo.map(tipo => (
                    <th scope="col" key={tipo}>{tipo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matriz.map(z => (
                  <tr key={z.zona}>
                    <th scope="row">{z.zona}</th>
                    {columnasTipo.map(tipo => {
                      const entry = z.tipos.find(t => t.tipo === tipo)
                      return (
                        <td key={tipo}>{entry ? `USD ${entry.precio_mediano}` : "—"}</td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default Resumen
