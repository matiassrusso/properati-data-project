import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Sello from "../components/Sello"
import { API_URL, fmt, type Barrio } from "../api"

const TICK = { fontSize: 12, fill: "#5C7184", fontFamily: "Geist Mono, monospace" }

function TopBarrios() {
  const [vista, setVista] = useState<"caros" | "baratos">("caros")
  const [barrios, setBarrios] = useState<Barrio[]>([])

  useEffect(() => {
    const endpoint = vista === "caros" ? "/barrios" : "/barrios-economicos"
    fetch(`${API_URL}${endpoint}`)
      .then(res => res.json())
      .then(data => setBarrios(data))
  }, [vista])

  // FIX 2 y 3: la altura del gráfico depende de cuántas barras hay,
  // en vez de ser un valor fijo. 42px por barra es suficiente para que
  // ninguna se corte ni se superponga.
  const alturaGrafico = Math.max(barrios.length * 42, 120)

  return (
    <section className="page chart-page">
      <h2>Top barrios {vista === "caros" ? "más caros" : "más económicos"}</h2>
      <Sello />
      <div className="tabs">
        <button
          className={`tab-btn ${vista === "caros" ? "tab-btn-active" : ""}`}
          onClick={() => setVista("caros")}
        >
          Más caros
        </button>
        <button
          className={`tab-btn ${vista === "baratos" ? "tab-btn-active" : ""}`}
          onClick={() => setVista("baratos")}
        >
          Más baratos
        </button>
      </div>
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={alturaGrafico}>
          <BarChart
            data={barrios}
            layout="vertical"
            margin={{ top: 10, left: 150, right: 30, bottom: 10 }}
            barCategoryGap={8}
          >
            <XAxis type="number" stroke="#5C7184" tick={TICK} tickFormatter={v => fmt(Number(v))} />
            <YAxis type="category" dataKey="barrio" width={140} stroke="#5C7184" interval={0} tick={{ ...TICK, fontFamily: "Geist, sans-serif", fontSize: 13 }} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value) => [`USD ${fmt(Number(value))}/m²`, "Precio mediano"]}
              contentStyle={{ background: "#142536", border: "none", borderRadius: "8px", fontSize: 13 }}
              labelStyle={{ color: "#EAF2FA" }}
              itemStyle={{ color: "#EAF2FA" }}
            />
            <Bar dataKey="precio_mediano" radius={[0, 6, 6, 0]}>
              {barrios.map((entry, index) => (
                <Cell key={entry.barrio} fill={index === 0 ? "#1C77B5" : "#C5CDD8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default TopBarrios
