# Properati Data Project

Análisis del mercado inmobiliario de Buenos Aires sobre más de 48.000 propiedades (CABA y GBA).

🔗 **Demo:** [properati-frontend.vercel.app](https://properati-frontend.vercel.app)

Real estate market analysis for Buenos Aires, covering 48,000+ property listings (CABA and greater Buenos Aires).

🔗 **Live demo:** [properati-frontend.vercel.app](https://properati-frontend.vercel.app)

---

## Estructura del repo / Repo structure

```
properati-data-project/
├── backend/    → API FastAPI (Python)
└── frontend/   → App React + TypeScript
```

## Stack

- **Backend:** Python, FastAPI, 10 endpoints
- **Frontend:** React, TypeScript, React Router (5 páginas / 5 pages)
- **Deploy:** Railway (backend) · Vercel (frontend)
- **Dataset:** 48.133 propiedades — departamentos, casas y PH en CABA y GBA
- **Dataset:** 48,133 listings — apartments, houses, and PH-type units in CABA and greater Buenos Aires

## Funcionalidades / Features

- Búsqueda y filtrado de propiedades por zona, tipo y precio
- Estadísticas de mercado por barrio
- Identidad visual celeste / dorado / navy

- Property search and filtering by zone, type, and price
- Market statistics by neighborhood
- Celeste / gold / navy visual identity

## Correr el proyecto localmente / Running locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

> Nota: verificá los comandos exactos contra los `package.json`/`requirements.txt` reales de cada carpeta.
> Note: check exact commands against the actual `package.json`/`requirements.txt` in each folder.

## Nota sobre los datos / Data note

El dataset actual data de ~2020. Una actualización con datos más recientes está planificada.

The current dataset dates from ~2020. An update with more recent data is planned.

## Licencia / License

MIT
