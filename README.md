# CineBook

Movie ticket booking for cinemas in Hyderabad: film listings, live seat maps,
snacks, Stripe payments, a customer chat assistant, and a manager's desk at `/admin`.

| Folder | What it is |
|---|---|
| `MovieBackend/` | Spring Boot 3 (Java 17) API, Supabase Postgres via Flyway |
| `MovieFrontend/` | React (Create React App) website |

## Run it locally

1. Copy `.env.example` to `.env` (in this folder) and fill it in.
2. Backend, from `MovieBackend/`: `./mvnw spring-boot:run` (serves on port 8080).
3. Frontend, from `MovieFrontend/`: `npm install`, then `npm start` (port 3000).

The staff login is at http://localhost:3000/admin with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

All times are Hyderabad time (Asia/Kolkata), whatever the server's or visitor's clock says.

To fill a week of shows for every active film (only free screens are used, so re-running is safe):

    python3 scripts/schedule_shows.py --dry-run     # preview
    python3 scripts/schedule_shows.py               # next 7 days
    python3 scripts/schedule_shows.py 2026-10-06 7  # a given start date and number of days

## Going live

**Backend** (e.g. Render), environment variables:

- Everything in `.env.example`, with the database on the **session pooler** address
  (`aws-0-ap-south-1.pooler.supabase.com`, user `postgres.<project-ref>`), since these
  hosts don't support IPv6.
- `CORS_ALLOWED_ORIGINS` = the website's address, e.g. `https://cinebook.vercel.app`.
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, so uploaded images go to Supabase Storage
  instead of the server's disk (which is wiped on each deploy). Film posters load from
  TMDB and need nothing.
- `STRIPE_WEBHOOK_SECRET`: in the Stripe Dashboard, add a webhook to
  `https://<backend>/api/payments/webhook` for `payment_intent.succeeded`, and use its
  signing secret. This books paid orders even if the customer's browser closes.

**Website** (e.g. Vercel): set `REACT_APP_API_URL` to the backend's address (see
`MovieFrontend/.env.example`) and the project root to `MovieFrontend`.
`MovieFrontend/vercel.json` routes every path to the app, so `/admin` works.
