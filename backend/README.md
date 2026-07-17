# Properati CABA & GBA — Backend API

A RESTful API built with FastAPI that analyzes the real estate market of Buenos Aires (Capital Federal) and Greater Buenos Aires (GBA), covering apartments, houses, and PHs for sale.

**Live demo:** [properati-frontend.vercel.app](https://properati-frontend.vercel.app)  
**Frontend repo:** [github.com/matiassrusso/properati-frontend](https://github.com/matiassrusso/properati-frontend)

---

## Tech Stack

- **Python** + **FastAPI** — REST API framework
- **pandas** — data processing and aggregation
- **Render** — cloud deployment
- **Dataset** — Properati Argentina ([source](https://github.com/mauriciomem/DS_desafio_1_Properati))

---

## Dataset

The dataset contains **48,133 residential properties** for sale across:

| Zone | Properties |
|---|---|
| Capital Federal (CABA) | 21,966 |
| GBA Zona Norte | 16,335 |
| GBA Zona Sur | 5,620 |
| GBA Zona Oeste | 4,212 |

Property types covered: **Apartments**, **Houses**, **PHs**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/barrios` | Top 15 most expensive neighborhoods by median price/m² |
| GET | `/barrios-economicos` | Top 15 most affordable neighborhoods by median price/m² |
| GET | `/estadisticas` | General market summary (median price, total properties, price range) |
| GET | `/superficies` | Surface area statistics (avg, median, min, max) |
| GET | `/zonas` | Median price and property count per zone |
| GET | `/tipos-propiedad` | Median price, count and avg surface per property type |
| GET | `/ambientes` | Median price per number of rooms (1, 2, 3, 4, 5+) |
| GET | `/barrios-economicos` | Top 15 cheapest neighborhoods |
| GET | `/barrio/{nombre}` | Detail for a specific neighborhood (price range, avg surface, count) |
| GET | `/zona/{nombre}` | Detail for a specific zone with breakdown by property type |
| GET | `/matriz-zona-tipo` | Full matrix: median price for all zone × property type combinations |

Interactive docs available at `/docs` (Swagger UI).

---

## Running Locally

**Requirements:** Python 3.10+, the `properati.zip` dataset file

```bash
# Clone the repo
git clone https://github.com/matiassrusso/properatti-app.git
cd properatti-app

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Place properati.zip in the root directory, then start the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

---

## Project Structure

```
properatti-app/
├── main.py           # FastAPI app, data loading, all endpoints
├── requirements.txt  # Python dependencies
├── Procfile          # Render deployment config
└── properati.zip     # Dataset (not tracked in git)
```

---

## Author

**Matías Russo Lacerna**  
Student — Data Science, Universidad de Buenos Aires (UBA)  
[GitHub](https://github.com/matiassrusso) · [LinkedIn](https://www.linkedin.com/in/matias-russo-lacerna/) · [matiasrussolacerna@gmail.com](mailto:matiasrussolacerna@gmail.com)
