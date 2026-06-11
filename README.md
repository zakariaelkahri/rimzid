# rimzid

RIMZID website with a Vite/React frontend and a small FastAPI backend API.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

Docker run:

```bash
docker compose up --build
```

The site runs at `http://localhost:8080`; the backend is available at `http://localhost:3000`.
