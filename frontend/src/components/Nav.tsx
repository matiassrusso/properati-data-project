import { NavLink, Link } from "react-router-dom"
import Sello from "./Sello"

const items = [
  { to: "/", label: "Mapa", end: true },
  { to: "/prediccion", label: "Predicción" },
  { to: "/resumen", label: "Resumen" },
  { to: "/barrios", label: "Top barrios" },
  { to: "/buscador", label: "Buscador" },
  { to: "/superficies", label: "Superficies" },
]

function Nav() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Properati <span>CABA y GBA</span>
      </Link>
      <nav className="topnav" aria-label="Navegación principal">
        {items.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end}>
            {label}
          </NavLink>
        ))}
      </nav>
      <Sello />
    </header>
  )
}

export default Nav
