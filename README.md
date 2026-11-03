# Bresomilan Admin

Staff operations panel for Bresomilan (dashboard, orders, catalogue, customers, contact messages, newsletter).

Runs on **port 3001** and talks to `Polson-EC-BE` at `/api/admin/`.

## Prerequisites

- Node 20+
- Backend running (`Polson-EC-BE`) with a **staff** user (`is_staff=True`)
- CORS allowing `http://localhost:3001` (included in backend `.env.example` defaults)

## Setup

```bash
cd Bresomilan-Admin
cp .env.example .env.local   # if needed
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) and sign in with a staff account.

## Environment

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Admin calls `/admin/...` under this base |

## Local stack

| App | Port | Command |
|---|---|---|
| Storefront (`Polson-EC-FE`) | 3000 | `npm run dev` |
| Admin (`Bresomilan-Admin`) | 3001 | `npm run dev` |
| API (`Polson-EC-BE`) | 8000 | `python manage.py runserver` |

Create a staff user via Django admin or:

```bash
cd Polson-EC-BE
python manage.py createsuperuser
```

## Notes

- Non-staff logins are rejected after JWT issue (frontend clears tokens when `/api/admin/me/` returns 403).
- Django `/admin/` remains available; this app is the day-to-day staff UI.
