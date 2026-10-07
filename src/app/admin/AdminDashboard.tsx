"use client";

import { Fragment, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { INDIAN_STATES } from "@/lib/constants";

type Nomination = {
  id: string;
  rollNo: string;
  studentName: string;
  className: string;
  gender: string;
  schoolName: string;
  schoolDistrict: string;
  schoolVillage: string;
  schoolState: string;
  schoolPincode: string;
  marksXMath: number | null;
  marksXScience: number | null;
  marksXAggregate: number | null;
  marksXIPercent: number | null;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  studentEmail: string | null;
  achievements: string | null;
  prizes: string | null;
  aspiration: string | null;
  createdAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    try {
      const res = await fetch(`/api/nominations?${params.toString()}`, { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      setNominations(json.nominations ?? []);
    } catch {
      setError("Failed to load nominations.");
    } finally {
      setLoading(false);
    }
  }, [q, state, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this nomination? This cannot be undone.")) return;
    await fetch(`/api/nominations/${id}`, { method: "DELETE" });
    setNominations((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const stateCounts = useMemo(() => {
    const byState = new Set(INDIAN_STATES as readonly string[]);
    const extra = new Set<string>();
    for (const n of nominations) {
      if (!byState.has(n.schoolState)) extra.add(n.schoolState);
    }
    return extra;
  }, [nominations]);

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nominations Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              {loading ? "Loading..." : `${nominations.length} nomination(s) found`}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/nominations/export"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Export to Excel
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            placeholder="Search name, school, roll no, district..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-[260px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All States</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {Array.from(stateCounts).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Roll No.</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">School</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">State / District</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Coordinator</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Submitted</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nominations.map((n) => (
                <Fragment key={n.id}>
                  <tr
                    key={n.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {n.studentName}
                      <span className="ml-2 text-xs text-slate-500">
                        {n.gender} · {n.className}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{n.rollNo}</td>
                    <td className="px-4 py-3 text-slate-700">{n.schoolName}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {n.schoolState}
                      <div className="text-xs text-slate-500">{n.schoolDistrict}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {n.coordinatorName}
                      <div className="text-xs text-slate-500">{n.coordinatorPhone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n.id);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expanded === n.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                          <div>
                            <p className="font-semibold text-slate-700">Academic record</p>
                            <p className="text-slate-600">Class X Math: {n.marksXMath ?? "-"}</p>
                            <p className="text-slate-600">Class X Science: {n.marksXScience ?? "-"}</p>
                            <p className="text-slate-600">Class X Aggregate: {n.marksXAggregate ?? "-"}</p>
                            <p className="text-slate-600">Class XI Math+Science %: {n.marksXIPercent ?? "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Contact</p>
                            <p className="text-slate-600">Coordinator email: {n.coordinatorEmail}</p>
                            <p className="text-slate-600">Student email: {n.studentEmail ?? "-"}</p>
                            <p className="text-slate-600">
                              Location: {n.schoolVillage}, {n.schoolPincode}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Achievements</p>
                            <p className="text-slate-600">{n.achievements || "-"}</p>
                            <p className="mt-1 text-slate-600">Prizes: {n.prizes || "-"}</p>
                            <p className="mt-1 text-slate-600">Aspiration: {n.aspiration || "-"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!loading && nominations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No nominations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
