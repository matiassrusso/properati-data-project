import { useState, useEffect } from "react"
import Sello from "../components/Sello"
import { API_URL, fmt, type Estadisticas, type Superficies, type Zona, type TipoPropiedad, type MatrizZona } from "../api"

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
      <Sello />

      {estadisticas && superficies && (
        <div className="stats-grid">
          <div className="stat-card stat-key">
            <p className="stat-label">Precio mediano</p>
            <p className="stat-value">USD {fmt(estadisticas.precio_mediano_caba)}</p>
            <p className="stat-unit">por m²</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Propiedades analizadas</p>
            <p className="stat-value">{fmt(estadisticas.total_propiedades)}</p>
            <p className="stat-unit">en venta</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Superficie mediana</p>
            <p className="stat-value">{fmt(superficies.mediana_superficies, 1)}</p>
            <p className="stat-unit">m²</p>
          </div>
        </div>
      )}

      {zonas.length > 0 && (
        <>
          <h3 className="section-title">Precio por zona</h3>
          <div className="stats-grid-compact">
            {zonas.map(z => (
              <div key={z.zona} className="stat-card">
                <p className="stat-label">{z.zona}</p>
                <p className="stat-value">USD {fmt(z.precio_mediano)}</p>
                <p className="stat-unit">{fmt(z.cantidad_propiedades)} propiedades</p>
              </div>
            ))}
          </div>
        </>
      )}

      {tipos.length > 0 && (
        <>
          <h3 className="section-title">Precio por tipo de propiedad</h3>
          <div className="stats-grid">
            {tipos.map(t => (
              <div key={t.tipo} className="stat-card">
                <p className="stat-label">{t.tipo}</p>
                <p className="stat-value">USD {fmt(t.precio_mediano)}</p>
                <p className="stat-unit">por m²</p>
                <div className="stat-extra">
                  <span>{fmt(t.cantidad_propiedades)} propiedades</span>
                  <span>{fmt(t.superficie_promedio, 1)} m² promedio</span>
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
                        <td key={tipo}>{entry ? `USD ${fmt(entry.precio_mediano)}` : "—"}</td>
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
