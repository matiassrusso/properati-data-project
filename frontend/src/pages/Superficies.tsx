import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { API_URL, fmt, type Superficies as SuperficiesData, type Ambiente } from "../api"

const TICK = { fontSize: 12, fill: "#8EA3B6", fontFamily: "JetBrains Mono, monospace" }
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
    <section className="page">
      <h2>Superficies de las propiedades</h2>

      {superficies && (
        <>
          <dl className="kv">
            <div>
              <dt>Promedio</dt>
              <dd>{fmt(superficies.promedio_superficies, 1)}<small>m²</small></dd>
            </div>
            <div>
              <dt>Mediana</dt>
              <dd>{fmt(superficies.mediana_superficies, 1)}<small>m²</small></dd>
            </div>
            <div>
              <dt>Mínima</dt>
              <dd>{fmt(superficies.min_superficies, 1)}<small>m²</small></dd>
            </div>
            <div>
              <dt>Máxima</dt>
              <dd>{fmt(superficies.max_superficies, 1)}<small>m²</small></dd>
            </div>
          </dl>

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
          <p className="section-note">USD por m², mediana</p>
          <div className="chart-section">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ambientes} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <XAxis dataKey="ambientes" stroke="#35536E" tick={TICK} />
                <YAxis stroke="#35536E" tick={TICK} tickFormatter={v => fmt(Number(v))} />
                <Tooltip
                  cursor={{ fill: "rgba(234,242,250,0.04)" }}
                  formatter={(value) => [`USD ${fmt(Number(value))}/m²`, "Precio mediano"]}
                  contentStyle={{ background: "#0E1A26", border: "1px solid rgba(234,242,250,0.1)", borderRadius: "8px", fontSize: 13 }}
                  labelStyle={{ color: "#EAF2FA" }}
                  itemStyle={{ color: "#EAF2FA" }}
                />
                <Bar dataKey="precio_mediano" radius={[4, 4, 0, 0]}>
                  {ambientes.map(entry => (
                    <Cell key={entry.ambientes} fill={entry.precio_mediano === maxPrecio ? "#E8B23D" : "#35536E"} />
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
