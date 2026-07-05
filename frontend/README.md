# Properati CABA & GBA — Frontend

An interactive data visualization app built with React and TypeScript that explores the real estate market of Buenos Aires (CABA) and Greater Buenos Aires (GBA).

**Live demo:** [properati-frontend.vercel.app](https://properati-frontend.vercel.app)  
**Backend repo:** [github.com/matiassrusso/properatti-app](https://github.com/matiassrusso/properatti-app)

---

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **React Router** — client-side routing (5 pages)
- **Recharts** — data visualizations
- **Vercel** — deployment

---

## Features

- **5 fully routed pages** with bottom dock navigation
- **Animated ticker** showing real-time neighborhood rankings
- **Interactive bar charts** with hover tooltips
- **Neighborhood search** with debounced API calls and zone/type breakdown
- **Toggle** between most expensive and most affordable neighborhoods
- **Zone × property type matrix** — full comparative table
- Responsive design (desktop and mobile)

---

## Pages

| Route | Content |
|---|---|
| `/` | Landing page with key stats and site map |
| `/resumen` | Market summary: price by zone, property type, and full comparison matrix |
| `/barrios` | Top 15 most expensive / most affordable neighborhoods (toggleable) |
| `/buscador` | Search any neighborhood or explore by zone |
| `/superficies` | Surface area distribution and price by number of rooms |

---

## Running Locally

**Requirements:** Node.js 18+, the backend API running locally or deployed

```bash
# Clone the repo
git clone https://github.com/matiassrusso/properati-frontend.git
cd properati-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> By default the app points to the deployed backend on Railway. To use a local backend, update `API_URL` in `src/api.ts`.

---

## Project Structure

```
properati-frontend/
├── src/
│   ├── api.ts              # API base URL and TypeScript interfaces
│   ├── App.tsx             # Router, ticker, dock layout
│   ├── App.css             # Global styles and design tokens
│   ├── pages/
│   │   ├── Intro.tsx
│   │   ├── Resumen.tsx
│   │   ├── TopBarrios.tsx
│   │   ├── Buscador.tsx
│   │   └── Superficies.tsx
│   └── components/
│       ├── Dock.tsx        # Bottom navigation bar
│       └── Footer.tsx      # Contact links
├── index.html
└── vite.config.ts
```

---

## Author

**Matías Russo Lacerna**  
Student — Data Science, Universidad de Buenos Aires (UBA)  
[GitHub](https://github.com/matiassrusso) · [LinkedIn](https://www.linkedin.com/in/matias-russo-lacerna/) · [matiasrussolacerna@gmail.com](mailto:matiasrussolacerna@gmail.com)
