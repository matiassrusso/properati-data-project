import { useEffect, useMemo, useRef, useState } from "react"
import maplibregl, { type GeoJSONSourceSpecification } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { API_URL, fmt, type MapaPrecios as Datos } from "../api"

const CELDA = 0.01
// Base cartográfica oscura gratuita (OpenFreeMap, datos de OpenStreetMap), sin API key
const ESTILO = "https://tiles.openfreemap.org/styles/dark"
// Escala de una sola luminosidad creciente: precio bajo = oscuro, alto = dorado
const COLORES = ["#1E4466", "#1C77B5", "#7CC4E8", "#F2C75C"]

const percentil = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) * p)]

interface Hover {
  x: number
  y: number
  precio: number
  cantidad: number
}

function MapaPrecios({ onCargar }: { onCargar?: (d: Datos) => void }) {
  const contRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState(false)
  const [listo, setListo] = useState(false)
  const [hover, setHover] = useState<Hover | null>(null)
  const [ancho, setAncho] = useState(0)

  useEffect(() => {
    fetch(`${API_URL}/mapa-precios?celda=${CELDA}`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then((d: Datos) => {
        setDatos(d)
        onCargar?.(d)
      })
      .catch(() => setError(true))
    // solo al montar: onCargar es un callback de la página, no una dependencia de datos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!contRef.current) return
    const map = new maplibregl.Map({
      container: contRef.current,
      style: ESTILO,
      center: [-58.45, -34.6],
      zoom: 9.4,
      minZoom: 8,
      maxZoom: 14,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    })
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
    map.on("load", () => setListo(true))
    mapRef.current = map
    setAncho(contRef.current.clientWidth)
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  const rango = useMemo(() => {
    if (!datos) return null
    const precios = datos.celdas.map(c => c.precio_mediano)
    return { min: percentil(precios, 0.05), max: percentil(precios, 0.95) }
  }, [datos])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !listo || !datos || !rango) return
    const m = CELDA / 2
    const geojson: GeoJSONSourceSpecification["data"] = {
      type: "FeatureCollection",
      features: datos.celdas.map(c => ({
        type: "Feature",
        properties: {
          precio: c.precio_mediano,
          cantidad: c.cantidad,
          t: Math.min(Math.max((c.precio_mediano - rango.min) / (rango.max - rango.min), 0), 1),
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [c.lon - m, c.lat - m],
            [c.lon + m, c.lat - m],
            [c.lon + m, c.lat + m],
            [c.lon - m, c.lat + m],
            [c.lon - m, c.lat - m],
          ]],
        },
      })),
    }

    map.addSource("celdas", { type: "geojson", data: geojson })
    map.addLayer({
      id: "celdas-fill",
      type: "fill",
      source: "celdas",
      paint: {
        "fill-color": ["interpolate", ["linear"], ["get", "t"], 0, COLORES[0], 0.4, COLORES[1], 0.75, COLORES[2], 1, COLORES[3]],
        // la opacidad cuenta cuántas propiedades hay: las celdas con pocos datos se ven más tenues
        "fill-opacity": ["interpolate", ["linear"], ["get", "cantidad"], 5, 0.4, 60, 0.85],
      },
    })

    map.on("mousemove", "celdas-fill", e => {
      const f = e.features?.[0]
      if (!f) return
      map.getCanvas().style.cursor = "crosshair"
      setHover({ x: e.point.x, y: e.point.y, precio: Number(f.properties.precio), cantidad: Number(f.properties.cantidad) })
    })
    map.on("mouseleave", "celdas-fill", () => {
      map.getCanvas().style.cursor = ""
      setHover(null)
    })

    const marcadores = datos.barrios.map(b => {
      const el = document.createElement("div")
      el.className = "map-label"
      el.textContent = b.barrio
      return new maplibregl.Marker({ element: el, anchor: "left" }).setLngLat([b.lon, b.lat]).addTo(map)
    })

    // alejado solo se ven los 6 barrios con más propiedades; al acercar aparecen todos
    const ajustarEtiquetas = () => {
      const lejos = map.getZoom() < 10.5
      marcadores.forEach((mk, i) => {
        mk.getElement().style.display = lejos && i >= 6 ? "none" : ""
      })
    }
    map.on("zoom", ajustarEtiquetas)
    ajustarEtiquetas()

    // encuadre en el núcleo (percentiles 1 a 99): las celdas lejanas quedan fuera de cuadro
    const lats = datos.celdas.map(c => c.lat)
    const lons = datos.celdas.map(c => c.lon)
    map.fitBounds(
      [
        [percentil(lons, 0.01), percentil(lats, 0.01)],
        [percentil(lons, 0.99), percentil(lats, 0.99)],
      ],
      { padding: 32, duration: 0 }
    )

    return () => {
      map.off("zoom", ajustarEtiquetas)
      marcadores.forEach(mk => mk.remove())
      if (map.getLayer("celdas-fill")) map.removeLayer("celdas-fill")
      if (map.getSource("celdas")) map.removeSource("celdas")
    }
  }, [listo, datos, rango])

  const resumen = datos
    ? `Mapa de precio mediano por m² en ${fmt(datos.celdas.length)} celdas de Buenos Aires. Barrios más representados: ${datos.barrios.map(b => `${b.barrio} USD ${fmt(b.precio_mediano)}`).join(", ")}.`
    : "Mapa de precios por m²"

  return (
    <div className="map-wrap">
      <div className="map-canvas" ref={contRef} role="img" aria-label={resumen} />
      {!datos && !error && (
        <p className="map-status">Cargando el mapa. El servidor gratuito puede tardar hasta un minuto en despertar.</p>
      )}
      {error && <p className="map-status">No se pudo cargar el mapa. Probá recargar en un momento.</p>}
      {rango && (
        <div className="map-legend">
          <div className="map-legend-bar" />
          <div className="map-legend-scale">
            <span>USD {fmt(rango.min)}</span>
            <span>USD {fmt(rango.max)} / m²</span>
          </div>
          <p className="map-legend-note">Color: precio mediano por m². Intensidad: cantidad de propiedades.</p>
        </div>
      )}
      {hover && (
        <div
          className="map-tip"
          style={{
            ...(hover.x > ancho / 2 ? { right: ancho - hover.x + 14 } : { left: hover.x + 14 }),
            top: hover.y + 14,
          }}
        >
          <strong>USD {fmt(hover.precio)}/m²</strong>
          <br />
          {fmt(hover.cantidad)} propiedades en esta celda
        </div>
      )}
    </div>
  )
}

export default MapaPrecios
