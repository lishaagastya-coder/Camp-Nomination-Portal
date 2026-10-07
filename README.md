# Camp Nomination Portal

A simple web portal that replaces the old "fill an Excel sheet and forward it by
email" workflow for collecting student nominations for the camp from school
coordinators across India.

- **`/nominate`** — public form. Any coordinator with the link can submit a
  student nomination from their phone or laptop. No login required.
- **`/admin`** — password-protected dashboard. See every nomination the moment
  it's submitted, search/filter by state, drill into details, delete bad
  entries, and export everything to an Excel file matching the original
  column layout.

## Running it locally

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Then open http://localhost:3000.

## Configuration

Copy `.env.example` to `.env` and set:

- `ADMIN_PASSWORD` — the password used to log into `/admin`. Change this from
  the default before sharing the link with anyone.
- `SESSION_SECRET` — any long random string, used to sign the admin login
  session cookie.
- `DATABASE_URL` — defaults to a local SQLite file (`prisma/dev.db`). For a
  real deployment with multiple coordinators submitting at once, point this
  at a hosted Postgres database instead (e.g. Neon or Supabase) and change
  the `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`.

## Importing last year's nominations (optional)

If you want the nominations from `FINAL NOMINATIONS LISTs.xlsx` loaded into
the portal for reference, run:

```bash
npm run import-legacy -- "C:\path\to\FINAL NOMINATIONS LISTs.xlsx"
```

## Deploying so coordinators can access it from anywhere

This app is ready to deploy to any Node.js host (e.g. Vercel, Render,
Railway). It needs:

1. A persistent database (SQLite alone won't survive on most serverless
   hosts — use a hosted Postgres database for production).
2. The three environment variables above set in the host's dashboard.

Ask if you'd like help picking a host and deploying it — that step needs a
hosting account, so I'll check with you before creating one.
