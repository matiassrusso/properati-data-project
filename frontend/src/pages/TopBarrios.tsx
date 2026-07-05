import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API_URL, type Barrio } from "../api"

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
            <XAxis type="number" unit=" USD" stroke="#5C7184" />
            <YAxis type="category" dataKey="barrio" width={140} stroke="#5C7184" interval={0} tick={{ fontSize: 13 }} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value) => [`USD ${Math.round(Number(value) * 100) / 100}/m²`, "Precio mediano"]}
              contentStyle={{ background: "#142536", border: "1px solid #E8ECF0", borderRadius: "8px" }}
              labelStyle={{ color: "#EAF2FA" }}
              itemStyle={{ color: "#EAF2FA" }}
            />
            <Bar dataKey="precio_mediano" radius={[0, 6, 6, 0]}>
              {barrios.map((entry, index) => (
                <Cell key={entry.barrio} fill={index % 2 === 0 ? "#1C77B5" : "#E8B23D"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default TopBarrios
