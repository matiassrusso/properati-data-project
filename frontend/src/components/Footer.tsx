import "./Footer.css"

function IconDatos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  )
}

function IconGithub() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0.5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.41-2.7 5.39-5.26 5.67.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.21 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function IconLinkedin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.56V9H3.56v11.45Z" />
    </svg>
  )
}

const LINKS = [
  {
    href: "https://github.com/mauriciomem/DS_desafio_1_Properati",
    label: "Datos: Properati",
    icon: IconDatos,
  },
  {
    href: "https://github.com/matiassrusso",
    label: "GitHub",
    icon: IconGithub,
  },
  {
    href: "mailto:matiasrussolacerna@gmail.com",
    label: "Email",
    icon: IconMail,
  },
  {
    href: "https://www.linkedin.com/in/matias-russo-lacerna/",
    label: "LinkedIn",
    icon: IconLinkedin,
  },
]

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-credit">Hecho por Matías Russo Lacerna</p>
      <nav className="footer-links" aria-label="Enlaces externos">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <span className="footer-icon">
              <Icon />
            </span>
            {label}
          </a>
        ))}
      </nav>
    </footer>
  )
}

export default Footer
