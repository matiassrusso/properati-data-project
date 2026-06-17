import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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

function App() {
  const [barrios, setBarrios] = useState<Barrio[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [superficies, setSuperficies] = useState<Superficies | null>(null)


  useEffect(() => {
    fetch("https://web-production-bdaa.up.railway.app/barrios")
      .then(res => res.json())
      .then(data => setBarrios(data))

    fetch("https://web-production-bdaa.up.railway.app/estadisticas")
      .then(res => res.json())
      .then(data => setEstadisticas(data))

    fetch("https://web-production-bdaa.up.railway.app/superficies")
      .then(res => res.json())
      .then(data => setSuperficies(data))
  }, [])

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Mercado inmobiliario CABA</h1>

      {estadisticas && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Total propiedades</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{estadisticas.total_propiedades.toLocaleString()}</p>
          </div>
          <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Precio mediano CABA</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>USD {estadisticas.precio_mediano_caba}/m²</p>
          </div>
          <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Rango de precios</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>USD {estadisticas.precio_minimo} — {estadisticas.precio_maximo}</p>
          </div>
        </div>
      )}

      {superficies && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Promedio de superficies</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{superficies.promedio_superficies.toLocaleString()}m²</p>
          </div>
          <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Mediana superficies CABA</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{superficies.mediana_superficies}/m²</p>
          </div>
          <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Rango de superficies</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>{superficies.min_superficies}m² — {superficies.max_superficies}m²</p>
          </div>
        </div>
      )}

      <h2>Top 15 barrios más caros</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={barrios} layout="vertical" margin={{ left: 120 }}>
          <XAxis type="number" unit=" USD" />
          <YAxis type="category" dataKey="barrio" width={110} />
          <Tooltip formatter={(value) => `USD ${value}/m²`} />
          <Bar dataKey="precio_mediano" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default App