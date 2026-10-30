import { useState, useEffect } from "react"
import { API_URL, fmt, zonaCorta, type Estadisticas, type Superficies, type Zona, type TipoPropiedad, type MatrizZona } from "../api"

function Resumen() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [superficies, setSuperficies] = useState<Superficies | null>(null)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [tipos, setTipos] = useState<TipoPropiedad[]>([])
  const [matriz, setMatriz] = useState<MatrizZona[]>([])

  useEffect(() => {
    fetch(`${API_URL}/estadisticas`).then(res => res.json()).then(setEstadisticas)
    fetch(`${API_URL}/superficies`).then(res => res.json()).then(setSuperficies)
    fetch(`${API_URL}/zonas`).then(res => res.json()).then(setZonas)
    fetch(`${API_URL}/tipos-propiedad`).then(res => res.json()).then(setTipos)
    fetch(`${API_URL}/matriz-zona-tipo`).then(res => res.json()).then(setMatriz)
  }, [])

  const columnasTipo = matriz[0]?.tipos.map(t => t.tipo) ?? []
  const zonasOrdenadas = [...zonas].sort((a, b) => b.precio_mediano - a.precio_mediano)
  const tiposOrdenados = [...tipos].sort((a, b) => b.precio_mediano - a.precio_mediano)
  const maxZona = zonasOrdenadas[0]?.precio_mediano ?? 1
  const maxTipo = tiposOrdenados[0]?.precio_mediano ?? 1

  return (
    <section className="page">
      <h2>Resumen del mercado</h2>

      {estadisticas && superficies && (
        <p className="lede">
          <span className="num">{fmt(estadisticas.total_propiedades)}</span> propiedades en venta. Precio mediano
          de <span className="num">USD {fmt(estadisticas.precio_mediano_caba)}</span> por m², con una superficie mediana
          de <span className="num">{fmt(superficies.mediana_superficies, 1)} m²</span>.
        </p>
      )}

      {zonasOrdenadas.length > 0 && (
        <>
          <h3 className="section-title">Precio por zona</h3>
          <ul className="rank">
            {zonasOrdenadas.map((z, i) => (
              <li key={z.zona} className={`rank-row${i === 0 ? " lead" : ""}`}>
                <span className="rank-name">
                  {zonaCorta(z.zona)}
                  <span className="rank-sub">{fmt(z.cantidad_propiedades)} propiedades</span>
                </span>
                <span className="rank-bar" aria-hidden="true">
                  <i style={{ width: `${(z.precio_mediano / maxZona) * 100}%` }} />
                </span>
                <span className="rank-value">USD {fmt(z.precio_mediano)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {tiposOrdenados.length > 0 && (
        <>
          <h3 className="section-title">Precio por tipo de propiedad</h3>
          <ul className="rank">
            {tiposOrdenados.map((t, i) => (
              <li key={t.tipo} className={`rank-row${i === 0 ? " lead" : ""}`}>
                <span className="rank-name">
                  {t.tipo}
                  <span className="rank-sub">
                    {fmt(t.cantidad_propiedades)} propiedades, {fmt(t.superficie_promedio, 1)} m² promedio
                  </span>
                </span>
                <span className="rank-bar" aria-hidden="true">
                  <i style={{ width: `${(t.precio_mediano / maxTipo) * 100}%` }} />
                </span>
                <span className="rank-value">USD {fmt(t.precio_mediano)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {matriz.length > 0 && (
        <>
          <h3 className="section-title">Precio por zona y tipo de propiedad</h3>
          <p className="section-note">USD por m², mediana</p>
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
                    <th scope="row">{zonaCorta(z.zona)}</th>
                    {columnasTipo.map(tipo => {
                      const entry = z.tipos.find(t => t.tipo === tipo)
                      return <td key={tipo}>{entry ? fmt(entry.precio_mediano) : "sin datos"}</td>
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
