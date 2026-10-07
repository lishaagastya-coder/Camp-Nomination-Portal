import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Science Camp Nominations
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Camp Nomination Portal
        </h1>
        <p className="mt-4 text-slate-600">
          School coordinators can submit student nominations directly from any
          phone or laptop. Entries are recorded immediately — no more emailing
          or forwarding Excel sheets.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/nominate"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            Submit a Nomination
          </Link>
          <Link
            href="/admin"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
