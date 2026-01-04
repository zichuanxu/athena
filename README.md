## Backend

Ensure you run `PostgreSQL` locally.
Username: `postgres`
Password: `posrgres`
DB: `mm_enshu`

Refer to [mm_enshu_lightrag](https://github.com/Acow337/mm_enshu_lightrag) to config Light RAG locally.

Run

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Frontend

Run

```bash
cd frontend
npm install
npm run dev
```
