import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Nomination Submitted</h1>
        <p className="mt-2 text-slate-600">
          Thank you. The student&apos;s nomination has been recorded and the camp
          coordinators can now see it immediately.
        </p>
        <Link
          href="/nominate"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Submit Another Nomination
        </Link>
      </div>
    </div>
  );
}
