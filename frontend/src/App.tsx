import { BrowserRouter, Routes, Route } from "react-router-dom"
import Nav from "./components/Nav"
import Footer from "./components/Footer"
import Intro from "./pages/Intro"
import Tasador from "./pages/Tasador"
import Resumen from "./pages/Resumen"
import TopBarrios from "./pages/TopBarrios"
import Buscador from "./pages/Buscador"
import Superficies from "./pages/Superficies"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Nav />

      <main className="app">
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/prediccion" element={<Tasador />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/barrios" element={<TopBarrios />} />
          <Route path="/buscador" element={<Buscador />} />
          <Route path="/superficies" element={<Superficies />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}

export default App
