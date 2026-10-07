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

The form fields mirror the columns from last cycle's `FINAL NOMINATIONS
LISTs.xlsx`, and duplicate nominations (same School + Roll No.) are rejected
automatically.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3001. With no Turso environment variables set
(see below), it automatically uses a local SQLite file at
`data/nominations.db` — no database setup needed for local development.

## Configuration

Copy `.env.example` to `.env` and set:

- `ADMIN_PASSWORD` — the password used to log into `/admin`. **Change this
  from the default (`changeme123`) before sharing the link with anyone** —
  this dashboard shows students' names, emails and phone numbers.
- `SESSION_SECRET` — any long random string, used to sign the admin login
  session cookie.
- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` — only needed for production
  (see Deploying below). Leave blank for local development.

## Importing last year's nominations (optional)

If you want the nominations from `FINAL NOMINATIONS LISTs.xlsx` loaded into
the portal for reference, run:

```bash
npm run import-legacy -- "C:\path\to\FINAL NOMINATIONS LISTs.xlsx"
```

This also doubles as a duplicate-finder: running it against last cycle's file
found 244 rows that were the same student (same school + roll no.) submitted
more than once — exactly the kind of mess repeated email-forwarding used to
cause.

## Deploying so coordinators can access it from anywhere (Vercel + Turso, free)

This app is already set up for a fully free deployment: **Vercel** hosts the
website, **Turso** hosts the database (both have generous free tiers for a
camp-sized amount of traffic). Here's the full path, step by step.

### 1. Create a GitHub account (if you don't have one)

Go to [github.com](https://github.com) and sign up — it's free. GitHub is
where the project's code will live so Vercel can deploy it.

### 2. Push this project to a new GitHub repository

Once you have a GitHub account, tell me and I'll create a repo and push the
code for you (I'll ask for your confirmation before pushing anything).

### 3. Create a Turso account and database

1. Go to [turso.tech](https://turso.tech) and sign up (you can use your new
   GitHub account to sign in — one click, no new password to remember).
2. Create a new database (any name, e.g. `camp-nominations`).
3. From the database's dashboard, grab two values: the **Database URL**
   (starts with `libsql://...`) and an **Auth Token**. Both are in the
   "Connect" panel.

### 4. Create a Vercel account and import the project

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub
   account.
2. Click "Add New Project" and select the GitHub repo from step 2.
3. Before deploying, open the "Environment Variables" section and add:
   - `TURSO_DATABASE_URL` → the value from step 3
   - `TURSO_AUTH_TOKEN` → the value from step 3
   - `ADMIN_PASSWORD` → a strong password of your choice
   - `SESSION_SECRET` → any long random string (e.g. mash the keyboard for
     40+ characters)
4. Click Deploy. Vercel gives you a live URL
   (like `camp-nominations.vercel.app`) within a minute or two — that's the
   link you share with coordinators, and `<that-link>/admin` is your
   dashboard.

I can walk through any of these steps with you live, or do the parts that
don't require your own login (like preparing the GitHub push) once you've
created the accounts.

## A note on the `xlsx` library

The Excel export/import feature uses the `xlsx` (SheetJS) package. Its
published npm version has known advisories, but they apply to *parsing
untrusted Excel files*. This app never lets the public upload a file — the
nomination form is plain text fields — so the only place `xlsx` reads a file
is the optional `import-legacy` script, which you'd run yourself, locally,
against a file you trust. The public-facing export path only *writes* xlsx
files from the app's own database, which isn't affected by these advisories.
