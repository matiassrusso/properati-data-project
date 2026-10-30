import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MapaPrecios from "../components/MapaPrecios"
import { API_URL, fmt, zonaCorta, type Estadisticas, type Zona, type MapaPrecios as Datos } from "../api"

function Intro() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [zonas, setZonas] = useState<Zona[]>([])
  const [enMapa, setEnMapa] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/estadisticas`).then(res => res.json()).then(setEstadisticas)
    fetch(`${API_URL}/zonas`).then(res => res.json()).then(setZonas)
  }, [])

  const ordenadas = [...zonas].sort((a, b) => b.precio_mediano - a.precio_mediano)
  const cara = ordenadas[0]
  const barata = ordenadas[ordenadas.length - 1]
  const veces = cara && barata ? (cara.precio_mediano / barata.precio_mediano).toFixed(1).replace(".", ",") : null

  return (
    <section className="page home">
      <div className="home-copy">
        <h1>
          {cara && barata && veces
            ? `El m² en ${zonaCorta(cara.zona)} cuesta ${veces} veces el de ${zonaCorta(barata.zona)}`
            : "Cuánto cuesta el m² en Buenos Aires"}
        </h1>
        <p>
          {estadisticas ? (
            <>
              Precio por m² de <span className="num">{fmt(estadisticas.total_propiedades)}</span> propiedades en
              venta en CABA y GBA. Mediana general: <span className="num">USD {fmt(estadisticas.precio_mediano_caba)}</span>.
            </>
          ) : (
            "Precio por m² de las propiedades en venta en CABA y GBA."
          )}
        </p>
        {enMapa !== null && (
          <p>
            El mapa muestra <span className="num">{fmt(enMapa)}</span> propiedades: solo las que traen coordenadas
            en el dataset, que es de ~2020.
          </p>
        )}
        <Link to="/barrios" className="cta">
          Ver el ranking de barrios
        </Link>
      </div>
      <MapaPrecios onCargar={(d: Datos) => setEnMapa(d.celdas.reduce((acc, c) => acc + c.cantidad, 0))} />
    </section>
  )
}

export default Intro
