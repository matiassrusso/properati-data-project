import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Sello from "../components/Sello"
import { API_URL, fmt, type Superficies as SuperficiesData, type Ambiente } from "../api"

const TICK = { fontSize: 12, fill: "#5C7184", fontFamily: "Geist Mono, monospace" }
const ORDEN_AMBIENTES = ["1", "2", "3", "4", "5+"]

function Superficies() {
  const [superficies, setSuperficies] = useState<SuperficiesData | null>(null)
  const [ambientes, setAmbientes] = useState<Ambiente[]>([])

  useEffect(() => {
    fetch(`${API_URL}/superficies`)
      .then(res => res.json())
      .then(data => setSuperficies(data))

    fetch(`${API_URL}/ambientes`)
      .then(res => res.json())
      .then((data: Ambiente[]) => {
        const ordenado = [...data].sort(
          (a, b) => ORDEN_AMBIENTES.indexOf(a.ambientes) - ORDEN_AMBIENTES.indexOf(b.ambientes)
        )
        setAmbientes(ordenado)
      })
  }, [])

  const maxPrecio = Math.max(...ambientes.map(a => a.precio_mediano))

  return (
    <section className="page superficies-page">
      <h2>Superficies de las propiedades</h2>
      <Sello />

      {superficies && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Promedio</p>
              <p className="stat-value">{fmt(superficies.promedio_superficies, 1)}</p>
              <p className="stat-unit">m²</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Mediana</p>
              <p className="stat-value">{fmt(superficies.mediana_superficies, 1)}</p>
              <p className="stat-unit">m²</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Mínima</p>
              <p className="stat-value">{fmt(superficies.min_superficies, 1)}</p>
              <p className="stat-unit">m²</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Máxima</p>
              <p className="stat-value">{fmt(superficies.max_superficies, 1)}</p>
              <p className="stat-unit">m²</p>
            </div>
          </div>

          <p className="insight">
            El promedio ({fmt(superficies.promedio_superficies, 1)} m²) está por{" "}
            {superficies.promedio_superficies > superficies.mediana_superficies ? "encima" : "debajo"} de
            la mediana ({fmt(superficies.mediana_superficies, 1)} m²), lo que sugiere que algunas propiedades
            grandes empujan el promedio hacia arriba. El rango va de {fmt(superficies.min_superficies, 1)} m² a{" "}
            {fmt(superficies.max_superficies, 1)} m².
          </p>
        </>
      )}

      {ambientes.length > 0 && (
        <>
          <h3 className="section-title">Precio según cantidad de ambientes</h3>
          <div className="chart-section">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ambientes} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <XAxis dataKey="ambientes" stroke="#5C7184" tick={TICK} />
                <YAxis stroke="#5C7184" tick={TICK} tickFormatter={v => fmt(Number(v))} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => [`USD ${fmt(Number(value))}/m²`, "Precio mediano"]}
                  contentStyle={{ background: "#142536", border: "none", borderRadius: "8px", fontSize: 13 }}
                  labelStyle={{ color: "#EAF2FA" }}
                  itemStyle={{ color: "#EAF2FA" }}
                />
                <Bar dataKey="precio_mediano" radius={[6, 6, 0, 0]}>
                  {ambientes.map(entry => (
                    <Cell key={entry.ambientes} fill={entry.precio_mediano === maxPrecio ? "#1C77B5" : "#C5CDD8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}

export default Superficies
