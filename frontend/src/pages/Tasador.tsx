import { lazy, Suspense, useEffect, useState } from "react"
import { API_URL, fmt } from "../api"
import { NOMBRE_VARIABLE, TIPOS, type Modelo, type Prediccion, type Tipo } from "../ml"

// MapLibre pesa mucho: solo se descarga al entrar a esta página
const MapaPrecios = lazy(() => import("../components/MapaPrecios"))

const AMBIENTES = [1, 2, 3, 4, 5]

function Tasador() {
  const [punto, setPunto] = useState<{ lat: number; lon: number } | null>(null)
  const [tipo, setTipo] = useState<Tipo>("apartment")
  const [superficie, setSuperficie] = useState(60)
  const [ambientes, setAmbientes] = useState(2)
  const [resultado, setResultado] = useState<Prediccion | null>(null)
  const [error, setError] = useState(false)
  const [modelo, setModelo] = useState<Modelo | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/modelo`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(setModelo)
      .catch(() => setModelo(null))
  }, [])

  // se recalcula solo al cambiar cualquier dato, con una pequeña espera para no disparar un pedido por tecla
  useEffect(() => {
    if (!punto || !(superficie >= 10 && superficie <= 2000)) return
    const ctrl = new AbortController()
    const id = setTimeout(() => {
      fetch(`${API_URL}/predecir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: punto.lat, lon: punto.lon, superficie, ambientes, tipo }),
        signal: ctrl.signal,
      })
        .then(res => (res.ok ? res.json() : Promise.reject()))
        .then((d: Prediccion) => {
          setResultado(d)
          setError(false)
        })
        .catch(e => {
          if (e?.name !== "AbortError") setError(true)
        })
    }, 300)
    return () => {
      clearTimeout(id)
      ctrl.abort()
    }
  }, [punto, tipo, superficie, ambientes])

  const mejora = modelo ? Math.round((1 - modelo.mae_usd_m2 / modelo.baseline_mae_usd_m2) * 100) : null
  const maxImp = modelo ? Math.max(...modelo.importancias.map(i => i.importancia), 0.000001) : 1

  return (
    <section className="page">
      <h2>Predicción de precios</h2>
      <p className="lede">
        Hacé clic en el mapa, contá cómo es la propiedad y un modelo de machine learning predice cuánto cuesta el m².
        Aprendió de {modelo ? `${fmt(modelo.n_entrenamiento)} avisos` : "avisos"} de ~2020 y, dentro de CABA, se
        ajusta con los precios de publicación oficiales del 4.º trimestre de 2025. Fuera de CABA los valores son de
        ~2020 y no están ajustados.
      </p>

      <div className="tasador">
        <div className="tasador-panel">
          <fieldset className="field">
            <legend>Tipo de propiedad</legend>
            <div className="tabs" role="group" aria-label="Tipo de propiedad">
              {TIPOS.map(t => (
                <button
                  key={t.valor}
                  className={`tab-btn ${tipo === t.valor ? "tab-btn-active" : ""}`}
                  aria-pressed={tipo === t.valor}
                  onClick={() => setTipo(t.valor)}
                >
                  {t.etiqueta}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="superficie">Superficie total (m²)</label>
            <input
              id="superficie"
              className="search-input num"
              type="number"
              inputMode="numeric"
              min={10}
              max={2000}
              value={superficie}
              onChange={e => setSuperficie(Number(e.target.value))}
            />
            {!(superficie >= 10 && superficie <= 2000) && (
              <p className="field-error">Ingresá una superficie entre 10 y 2.000 m².</p>
            )}
          </div>

          <fieldset className="field">
            <legend>Ambientes</legend>
            <div className="tabs" role="group" aria-label="Ambientes">
              {AMBIENTES.map(a => (
                <button
                  key={a}
                  className={`tab-btn ${ambientes === a ? "tab-btn-active" : ""}`}
                  aria-pressed={ambientes === a}
                  onClick={() => setAmbientes(a)}
                >
                  {a === 5 ? "5 o más" : a}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="resultado" aria-live="polite">
            {!punto && <p className="resultado-vacio">Elegí un punto en el mapa para ver la estimación.</p>}
            {punto && error && <p className="resultado-vacio">No se pudo calcular la estimación. Probá de nuevo.</p>}
            {punto && !error && resultado && (
              <>
                <p className="resultado-linea">
                  <span className="num resultado-cifra">USD {fmt(resultado.precio_m2)}</span> por m²
                </p>
                <p className="resultado-detalle">
                  Con un 80% de confianza, entre <span className="num">{fmt(resultado.rango[0])}</span> y{" "}
                  <span className="num">{fmt(resultado.rango[1])}</span>. Para {fmt(superficie)} m² son unos{" "}
                  <span className="num">USD {fmt(resultado.precio_total)}</span> (entre{" "}
                  <span className="num">{fmt(resultado.rango_total[0])}</span> y{" "}
                  <span className="num">{fmt(resultado.rango_total[1])}</span>).
                </p>
                {resultado.referencia && (
                  <p className="resultado-detalle">
                    El barrio más cercano con datos, {resultado.referencia.barrio}, tiene una mediana de{" "}
                    <span className="num">USD {fmt(resultado.referencia.mediana_m2)}</span> por m² (
                    {fmt(resultado.referencia.cantidad)} propiedades).
                  </p>
                )}
                <p className={`resultado-aviso${resultado.calibrado ? " ajustado" : ""}`}>{resultado.aviso}</p>
                {resultado.fuera_de_cobertura && (
                  <p className="field-error">Este punto está fuera de la zona que cubre el dataset: la estimación no es confiable.</p>
                )}
              </>
            )}
          </div>
        </div>

        <Suspense fallback={<div className="map-wrap"><p className="map-status">Cargando el mapa</p></div>}>
          <MapaPrecios onElegir={(lat, lon) => setPunto({ lat, lon })} punto={punto} />
        </Suspense>
      </div>

      {modelo && (
        <>
          <h3 className="section-title">Qué tan confiable es</h3>
          <p className="insight">
            Se probó con <span className="num">{fmt(modelo.n_prueba)}</span> propiedades que el modelo no vio al
            aprender. Se equivoca en promedio <span className="num">USD {fmt(modelo.mae_usd_m2)}</span> por m²; adivinar
            con la mediana del barrio se equivoca <span className="num">USD {fmt(modelo.baseline_mae_usd_m2)}</span>
            {mejora !== null && mejora > 0 ? `, así que mejora un ${mejora}%` : ""}. El rango del 80% acierta en el{" "}
            <span className="num">{Math.round(modelo.cobertura_intervalo * 100)}%</span> de los casos de prueba.
          </p>

          {modelo.calibracion && (
            <p className="insight">
              Contra los precios oficiales de CABA del 4.º trimestre de 2025 (IDECBA, precios de publicación y no de
              escrituras), el modelo sin ajustar se equivocaba un{" "}
              <span className="num">{(modelo.calibracion.validacion.mape_sin_calibrar * 100).toFixed(1).replace(".", ",")}%</span>{" "}
              en {modelo.calibracion.validacion.n} comparaciones por barrio y ambientes. Con el ajuste, probado en barrios
              que no usó para ajustarse, el error baja al{" "}
              <span className="num">{(modelo.calibracion.validacion.mape_calibrado_loo * 100).toFixed(1).replace(".", ",")}%</span>.
              Fuera de CABA no hay dato oficial y no se puede medir.
            </p>
          )}

          <ul className="rank">
            <li className="rank-row">
              <span className="rank-name">Mediana del barrio<span className="rank-sub">Error medio por m²</span></span>
              <span className="rank-bar" aria-hidden="true"><i style={{ width: "100%" }} /></span>
              <span className="rank-value">USD {fmt(modelo.baseline_mae_usd_m2)}</span>
            </li>
            <li className="rank-row lead">
              <span className="rank-name">Modelo<span className="rank-sub">Error medio por m²</span></span>
              <span className="rank-bar" aria-hidden="true">
                <i style={{ width: `${(modelo.mae_usd_m2 / modelo.baseline_mae_usd_m2) * 100}%` }} />
              </span>
              <span className="rank-value">USD {fmt(modelo.mae_usd_m2)}</span>
            </li>
          </ul>

          <h3 className="section-title">Qué mira el modelo</h3>
          <p className="section-note">Cuánto empeora la predicción si se desordena cada dato</p>
          <ul className="rank">
            {[...modelo.importancias]
              .sort((a, b) => b.importancia - a.importancia)
              .map((i, idx) => (
                <li key={i.variable} className={`rank-row${idx === 0 ? " lead" : ""}`}>
                  <span className="rank-name">{NOMBRE_VARIABLE[i.variable] ?? i.variable}</span>
                  <span className="rank-bar" aria-hidden="true">
                    <i style={{ width: `${Math.max(i.importancia, 0) / maxImp * 100}%` }} />
                  </span>
                  <span className="rank-value">{i.importancia.toFixed(3).replace(".", ",")}</span>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default Tasador
