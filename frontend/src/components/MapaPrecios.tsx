import { useEffect, useMemo, useRef, useState } from "react"
import { API_URL, fmt, type MapaPrecios as Datos, type CeldaMapa } from "../api"

const CELDA = 0.01
// Escala de una sola luminosidad creciente: precio bajo = oscuro, alto = dorado
const STOPS: [number, number, number][] = [
  [30, 68, 102],
  [28, 119, 181],
  [124, 196, 232],
  [242, 199, 92],
]

function color(t: number): [number, number, number] {
  const x = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1)
  const i = Math.min(Math.floor(x), STOPS.length - 2)
  const f = x - i
  return [0, 1, 2].map(k => Math.round(STOPS[i][k] + (STOPS[i + 1][k] - STOPS[i][k]) * f)) as [number, number, number]
}

const key = (lat: number, lon: number) => `${Math.floor(lat / CELDA)},${Math.floor(lon / CELDA)}`

function MapaPrecios({ onCargar }: { onCargar?: (d: Datos) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hover, setHover] = useState<{ x: number; y: number; celda: CeldaMapa } | null>(null)

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
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // proyección equirectangular corregida por latitud, ajustada al recuadro
  const vista = useMemo(() => {
    if (!datos || !datos.celdas.length || !size.w) return null
    // encuadre en el núcleo (percentiles 1 a 99): las celdas lejanas quedan fuera de cuadro
    const pct = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) * p)]
    const lats = datos.celdas.map(c => c.lat)
    const lons = datos.celdas.map(c => c.lon)
    const minLat = pct(lats, 0.01) - CELDA
    const maxLat = pct(lats, 0.99) + CELDA
    const minLon = pct(lons, 0.01) - CELDA
    const maxLon = pct(lons, 0.99) + CELDA
    const k = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180))
    const pad = 24
    const escala = Math.min((size.w - pad * 2) / ((maxLon - minLon) * k), (size.h - pad * 2) / (maxLat - minLat))
    const offX = (size.w - (maxLon - minLon) * k * escala) / 2
    const offY = (size.h - (maxLat - minLat) * escala) / 2
    return {
      x: (lon: number) => offX + (lon - minLon) * k * escala,
      y: (lat: number) => offY + (maxLat - lat) * escala,
      px: CELDA * escala,
      kx: k * escala,
      escala,
      minLon,
      maxLat,
      offX,
      offY,
      k,
    }
  }, [datos, size])

  const rango = useMemo(() => {
    if (!datos) return null
    const precios = datos.celdas.map(c => c.precio_mediano).sort((a, b) => a - b)
    return { min: precios[Math.floor(precios.length * 0.05)], max: precios[Math.floor(precios.length * 0.95)] }
  }, [datos])

  const indice = useMemo(() => {
    const m = new Map<string, CeldaMapa>()
    datos?.celdas.forEach(c => m.set(key(c.lat, c.lon), c))
    return m
  }, [datos])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !vista || !datos || !rango) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    const ctx = canvas.getContext("2d")!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size.w, size.h)

    const lado = Math.max(vista.px, 2)
    for (const c of datos.celdas) {
      const t = (c.precio_mediano - rango.min) / (rango.max - rango.min)
      const [r, g, b] = color(t)
      // la opacidad cuenta cuántas propiedades hay: la mancha dibuja la ciudad
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(0.3 + c.cantidad / 40, 1)})`
      ctx.fillRect(vista.x(c.lon) - lado / 2, vista.y(c.lat) - lado / 2, lado + 0.5, lado + 0.5)
    }

    ctx.font = "500 11px 'JetBrains Mono', monospace"
    ctx.textBaseline = "middle"
    const ocupado: { x: number; y: number; w: number }[] = []
    for (const b of datos.barrios) {
      const x = vista.x(b.lon)
      const y = vista.y(b.lat)
      const w = ctx.measureText(b.barrio).width + 12
      if (ocupado.some(o => Math.abs(o.x - x) < (o.w + w) / 2 && Math.abs(o.y - y) < 16)) continue
      ocupado.push({ x, y, w })
      ctx.fillStyle = "rgba(14,26,38,0.78)"
      ctx.fillRect(x + 6, y - 8, w, 16)
      ctx.fillStyle = "#EAF2FA"
      ctx.fillText(b.barrio, x + 12, y)
      ctx.beginPath()
      ctx.arc(x, y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = "#EAF2FA"
      ctx.fill()
    }
  }, [vista, datos, rango, size])

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!vista) return
    const r = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - r.left
    const my = e.clientY - r.top
    const lon = vista.minLon + (mx - vista.offX) / vista.kx
    const lat = vista.maxLat - (my - vista.offY) / vista.escala
    const celda = indice.get(key(lat, lon))
    setHover(celda ? { x: mx, y: my, celda } : null)
  }

  const resumen = datos
    ? `Mapa de precio mediano por m² en ${fmt(datos.celdas.length)} celdas de Buenos Aires. Barrios más representados: ${datos.barrios.map(b => `${b.barrio} USD ${fmt(b.precio_mediano)}`).join(", ")}.`
    : "Mapa de precios por m²"

  return (
    <div className="map-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={resumen} onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
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
            ...(hover.x > size.w / 2 ? { right: size.w - hover.x + 14 } : { left: hover.x + 14 }),
            top: Math.min(hover.y + 14, size.h - 56),
          }}
        >
          <strong>USD {fmt(hover.celda.precio_mediano)}/m²</strong>
          <br />
          {fmt(hover.celda.cantidad)} propiedades en esta celda
        </div>
      )}
    </div>
  )
}

export default MapaPrecios
