# JARVIS Shop OS — API

Express + PostgreSQL (Supabase-compatible) backend for a smartphone /
tablet / laptop repair shop in Athens, Greece.

- Languages: Greek, English, Arabic
- Currency: EUR (€) · Timezone: Europe/Athens
- Hosted API: `https://jarvis-shop-api.onrender.com` (or your Render domain)

## API routes

| Group | Path |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/change-password`, `GET /api/auth/me` |
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id` |
| Customers | `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/:id` |
| Repairs | `GET/POST /api/repairs`, `GET/PUT/DELETE /api/repairs/:id`, `POST /api/repairs/:id/notes`, `.../parts`, `.../labour`, `.../final-price`, `.../payments`, `.../parts-used`, `.../history`, `.../diagnosis` |
| Products | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id` |
| Inventory | `GET/POST /api/inventory/purchases`, `.../stock-movements`, `.../movements`, `.../valuation` |
| Sales | `POST /api/sales`, `GET /api/sales`, `GET /api/sales/:id` |
| Expenses | `POST /api/expenses`, `GET /api/expenses`, `GET/PUT/DELETE /api/expenses/:id` |
| Reports | `GET /api/reports/*` |
| Suppliers | `GET /api/suppliers`, `...` |
| Audit & AI | `GET/POST /api/audit*`, `POST /api/ai/ask`, etc. |

Authentication: `Authorization: Bearer <JWT>` (issued via `/api/auth/login`).

## Local development

```bash
cd backend
npm install               # or: npm ci
cp .env.example .env      # set DATABASE_URL + ADMIN_PASSWORD (+ JWT_SECRET)
npm run dev               # http://localhost:10000
```

## Deploy to Render

1. Create a Web Service in Render, connect this GitHub repo, choose **Node**.
2. Set **Root Directory** to `backend` (recommended) or keep the repo root.
3. Build command: `npm ci` · Start command: `npm start`
4. Add environment variables in Dashboard → Settings → Environment:
   - `DATABASE_URL` — Supabase-compatible PostgreSQL connection string
     (the app expects `?ssl=true`, automatically enforced when present)
   - `ADMIN_PASSWORD` — first admin account password
   - `JWT_SECRET` — 32+ random characters
   - `CORS_ORIGIN` — e.g. `http://localhost:5173` (or `*`)
5. Redeploy. Migrations run automatically on first boot.

See `render.yaml` + `.env.example` for an automated deployment setup.
