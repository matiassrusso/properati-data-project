import { NavLink } from "react-router-dom"
import "./Dock.css"

function IconInicio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9h14v-9" />
    </svg>
  )
}

export function IconResumen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  )
}

export function IconTopBarrios() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
    </svg>
  )
}

export function IconBuscador() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function IconSuperficies() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h4M9 3v4" />
    </svg>
  )
}

const items = [
  { to: "/", label: "Inicio", icon: IconInicio, end: true },
  { to: "/resumen", label: "Resumen", icon: IconResumen },
  { to: "/barrios", label: "Top barrios", icon: IconTopBarrios },
  { to: "/buscador", label: "Buscador", icon: IconBuscador },
  { to: "/superficies", label: "Superficies", icon: IconSuperficies },
]

function Dock() {
  return (
    <nav className="dock" aria-label="Navegación principal">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `dock-item${isActive ? " dock-item-active" : ""}`}
        >
          <span className="dock-icon"><Icon /></span>
          <span className="dock-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default Dock
