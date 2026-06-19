import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import "./App.css"

const API_URL = "https://web-production-bdaa.up.railway.app"

interface Barrio {
  barrio: string
  precio_mediano: number
}

interface Estadisticas {
  total_propiedades: number
  precio_mediano_caba: number
  precio_minimo: number
  precio_maximo: number
}

interface Superficies {
  promedio_superficies: number
  mediana_superficies: number
  min_superficies: number
  max_superficies: number
}

interface DetalleBarrio {
  barrio: string
  cantidad_propiedades: number
  precio_mediano: number
  precio_minimo: number
  precio_maximo: number
  superficie_promedio: number
  error?: string
}

function App() {
  const [barrios, setBarrios] = useState<Barrio[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [superficies, setSuperficies] = useState<Superficies | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [detalle, setDetalle] = useState<DetalleBarrio | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/barrios`)
      .then(res => res.json())
      .then(data => setBarrios(data))

    fetch(`${API_URL}/estadisticas`)
      .then(res => res.json())
      .then(data => setEstadisticas(data))

    fetch(`${API_URL}/superficies`)
      .then(res => res.json())
      .then(data => setSuperficies(data))
  }, [])

  // FIX 4: debounce — espera 400ms después de que el usuario deja de tipear
  // antes de buscar. Así no dispara un fetch (y un posible error) por cada letra.
  useEffect(() => {
    if (!busqueda.trim()) {
      setDetalle(null)
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

  const barriosFiltrados = barrios.filter(b =>
    b.barrio.toLowerCase().includes(busqueda.toLowerCase())
  )

  // FIX 2 y 3: la altura del gráfico ahora depende de cuántas barras hay,
  // en vez de ser un valor fijo. 42px por barra es suficiente para que
  // ninguna se corte ni se superponga.
  const alturaGrafico = Math.max(barriosFiltrados.length * 42, 120)

  return (
    <div className="app">
      <header className="hero">
        <span className="eyebrow">Properati · Buenos Aires</span>
        <h1>Mercado inmobiliario<br />de CABA</h1>
        <p className="hero-sub">Análisis de 19.215 propiedades en venta</p>
      </header>

      {estadisticas && superficies && (
        <section className="stats-grid">
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
        </section>
      )}

      <section className="search-section">
        <h2>Buscá tu barrio</h2>
        <input
          type="text"
          placeholder="Ej: Palermo, Belgrano, Recoleta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />

        {detalle && !detalle.error && (
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

      <section className="chart-section">
        <h2>Top barrios más caros</h2>
        <ResponsiveContainer width="100%" height={alturaGrafico}>
          <BarChart
            data={barriosFiltrados}
            layout="vertical"
            margin={{ top: 10, left: 120, right: 30, bottom: 10 }}
            barCategoryGap={8}
          >
            <XAxis type="number" unit=" USD" stroke="#9A9389" />
            <YAxis type="category" dataKey="barrio" width={110} stroke="#9A9389" interval={0} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value) => [`USD ${Math.round(Number(value) * 100) / 100}/m²`, "Precio mediano"]}
              contentStyle={{ background: "#26211C", border: "1px solid #3A332B", borderRadius: "8px", color: "#F5F0E8" }}
            />
            <Bar dataKey="precio_mediano" radius={[0, 6, 6, 0]}>
              {barriosFiltrados.map((entry, index) => (
                <Cell key={entry.barrio} fill={index % 2 === 0 ? "#FF6B4A" : "#C8E063"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}

export default App