import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API_URL, fmt, type Barrio } from "../api"

const TICK = { fontSize: 12, fill: "#8EA3B6", fontFamily: "JetBrains Mono, monospace" }

function TopBarrios() {
  const [vista, setVista] = useState<"caros" | "baratos">("caros")
  const [barrios, setBarrios] = useState<Barrio[]>([])

  useEffect(() => {
    const endpoint = vista === "caros" ? "/barrios" : "/barrios-economicos"
    fetch(`${API_URL}${endpoint}`)
      .then(res => res.json())
      .then(data => setBarrios(data))
  }, [vista])

  // la altura del gráfico depende de cuántas barras hay,
  // en vez de ser un valor fijo: 42px por barra evita que se corten o superpongan.
  const alturaGrafico = Math.max(barrios.length * 42, 120)

  return (
    <section className="page">
      <h2>Top barrios {vista === "caros" ? "más caros" : "más económicos"}</h2>
      <div className="tabs" role="group" aria-label="Orden del ranking">
        <button
          className={`tab-btn ${vista === "caros" ? "tab-btn-active" : ""}`}
          aria-pressed={vista === "caros"}
          onClick={() => setVista("caros")}
        >
          Más caros
        </button>
        <button
          className={`tab-btn ${vista === "baratos" ? "tab-btn-active" : ""}`}
          aria-pressed={vista === "baratos"}
          onClick={() => setVista("baratos")}
        >
          Más baratos
        </button>
      </div>
      <p className="section-note">USD por m², mediana</p>
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={alturaGrafico}>
          <BarChart
            data={barrios}
            layout="vertical"
            margin={{ top: 10, left: 8, right: 30, bottom: 10 }}
            barCategoryGap={8}
          >
            <XAxis type="number" stroke="#35536E" tick={TICK} tickFormatter={v => fmt(Number(v))} />
            <YAxis
              type="category"
              dataKey="barrio"
              width={190}
              stroke="#35536E"
              interval={0}
              tick={{ ...TICK, fontFamily: "Schibsted Grotesk, sans-serif", fontSize: 13, fill: "#B3C3D2" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(234,242,250,0.04)" }}
              formatter={(value) => [`USD ${fmt(Number(value))}/m²`, "Precio mediano"]}
              contentStyle={{ background: "#0E1A26", border: "1px solid rgba(234,242,250,0.1)", borderRadius: "8px", fontSize: 13 }}
              labelStyle={{ color: "#EAF2FA" }}
              itemStyle={{ color: "#EAF2FA" }}
            />
            <Bar dataKey="precio_mediano" radius={[0, 4, 4, 0]}>
              {barrios.map((entry, index) => (
                <Cell key={entry.barrio} fill={index === 0 ? "#E8B23D" : "#35536E"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default TopBarrios
