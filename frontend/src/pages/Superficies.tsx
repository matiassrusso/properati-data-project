import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API_URL, type Superficies as SuperficiesData, type Ambiente } from "../api"

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

  return (
    <section className="page superficies-page">
      <h2>Superficies de las propiedades</h2>

      {superficies && (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-coral">
              <p className="stat-label">Promedio</p>
              <p className="stat-value">{superficies.promedio_superficies}</p>
              <p className="stat-unit">m²</p>
            </div>
            <div className="stat-card stat-lime">
              <p className="stat-label">Mediana</p>
              <p className="stat-value">{superficies.mediana_superficies}</p>
              <p className="stat-unit">m²</p>
            </div>
            <div className="stat-card stat-cream">
              <p className="stat-label">Mínima</p>
              <p className="stat-value">{superficies.min_superficies}</p>
              <p className="stat-unit">m²</p>
            </div>
            <div className="stat-card stat-cream">
              <p className="stat-label">Máxima</p>
              <p className="stat-value">{superficies.max_superficies}</p>
              <p className="stat-unit">m²</p>
            </div>
          </div>

          <p className="insight">
            El promedio ({superficies.promedio_superficies} m²) está por{" "}
            {superficies.promedio_superficies > superficies.mediana_superficies ? "encima" : "debajo"} de
            la mediana ({superficies.mediana_superficies} m²), lo que sugiere que algunas propiedades
            grandes empujan el promedio hacia arriba. El rango va de {superficies.min_superficies} m² a{" "}
            {superficies.max_superficies} m².
          </p>
        </>
      )}

      {ambientes.length > 0 && (
        <>
          <h3 className="section-title">Precio según cantidad de ambientes</h3>
          <div className="chart-section">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ambientes} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <XAxis dataKey="ambientes" stroke="#5C7184" />
                <YAxis stroke="#5C7184" />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => [`USD ${Math.round(Number(value) * 100) / 100}/m²`, "Precio mediano"]}
                  contentStyle={{ background: "#142536", border: "1px solid #E8ECF0", borderRadius: "8px" }}
                  labelStyle={{ color: "#EAF2FA" }}
                  itemStyle={{ color: "#EAF2FA" }}
                />
                <Bar dataKey="precio_mediano" radius={[6, 6, 0, 0]}>
                  {ambientes.map((entry, index) => (
                    <Cell key={entry.ambientes} fill={index % 2 === 0 ? "#1C77B5" : "#E8B23D"} />
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
