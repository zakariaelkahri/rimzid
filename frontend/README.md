# RIMZID Frontend

React + Vite frontend for the RIMZID site.

## Local development

```bash
npm install
npm run dev
```

Run the backend in another terminal:

```bash
cd ../backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

## Production build

```bash
npm run build
```

## Docker

```bash
cd ..
docker compose up --build
```

The frontend is served at `http://localhost:8080` and proxies API calls to the backend service.
