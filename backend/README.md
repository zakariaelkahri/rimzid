# RIMZID Backend

Small FastAPI service for the RIMZID site.

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

The API listens on `http://localhost:3000`.

## Endpoints

- `GET /health`
- `GET /api/company`
- `POST /api/contact`
