import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { API_URL, type Barrio } from "./api"
import Dock from "./components/Dock"
import Footer from "./components/Footer"
import Intro from "./pages/Intro"
import Resumen from "./pages/Resumen"
import TopBarrios from "./pages/TopBarrios"
import Buscador from "./pages/Buscador"
import Superficies from "./pages/Superficies"
import "./App.css"

function App() {
  const [barrios, setBarrios] = useState<Barrio[]>([])

  useEffect(() => {
    fetch(`${API_URL}/barrios`)
      .then(res => res.json())
      .then(data => setBarrios(data))
  }, [])

  return (
    <BrowserRouter>
      <div className="ticker">
        <span className="ticker-label">ranking</span>
        <div className="ticker-track">
          {[...barrios, ...barrios].map((b, index) => (
            <span className="ticker-item" key={index}>
              #{(index % barrios.length) + 1} {b.barrio} <strong>USD {b.precio_mediano}/m²</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="app">
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/barrios" element={<TopBarrios />} />
          <Route path="/buscador" element={<Buscador />} />
          <Route path="/superficies" element={<Superficies />} />
        </Routes>
      </div>

      <Footer />
      <Dock />
    </BrowserRouter>
  )
}

export default App
