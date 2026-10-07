"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLASS_OPTIONS, GENDER_OPTIONS, INDIAN_STATES } from "@/lib/constants";

type FormState = {
  rollNo: string;
  studentName: string;
  className: string;
  gender: string;
  schoolName: string;
  schoolDistrict: string;
  schoolVillage: string;
  schoolState: string;
  schoolPincode: string;
  marksXMath: string;
  marksXScience: string;
  marksXAggregate: string;
  marksXIPercent: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  studentEmail: string;
  achievements: string;
  prizes: string;
  aspiration: string;
};

const EMPTY_FORM: FormState = {
  rollNo: "",
  studentName: "",
  className: "XI",
  gender: "",
  schoolName: "",
  schoolDistrict: "",
  schoolVillage: "",
  schoolState: "",
  schoolPincode: "",
  marksXMath: "",
  marksXScience: "",
  marksXAggregate: "",
  marksXIPercent: "",
  coordinatorName: "",
  coordinatorPhone: "",
  coordinatorEmail: "",
  studentEmail: "",
  achievements: "",
  prizes: "",
  aspiration: "",
};

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function NominationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fieldErrors) {
          const errs: Record<string, string> = {};
          for (const fe of json.fieldErrors) errs[fe.field] = fe.message;
          setFieldErrors(errs);
        }
        setSubmitError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/thank-you");
    } catch {
      setSubmitError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {submitError && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Student Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Student Name (as per Aadhar Card)" required error={fieldErrors.studentName}>
            <input
              className={inputClass}
              value={form.studentName}
              onChange={(e) => update("studentName", e.target.value)}
              required
            />
          </Field>
          <Field label="School Roll No." required error={fieldErrors.rollNo}>
            <input
              className={inputClass}
              value={form.rollNo}
              onChange={(e) => update("rollNo", e.target.value)}
              required
            />
          </Field>
          <Field label="Class Studying (current)" required error={fieldErrors.className}>
            <select
              className={inputClass}
              value={form.className}
              onChange={(e) => update("className", e.target.value)}
              required
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender" required error={fieldErrors.gender}>
            <select
              className={inputClass}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              required
            >
              <option value="">Select...</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Student Email Id (optional)" error={fieldErrors.studentEmail}>
            <input
              type="email"
              className={inputClass}
              value={form.studentEmail}
              onChange={(e) => update("studentEmail", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">School Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="School Name" required error={fieldErrors.schoolName}>
            <input
              className={inputClass}
              value={form.schoolName}
              onChange={(e) => update("schoolName", e.target.value)}
              required
            />
          </Field>
          <Field label="School District" required error={fieldErrors.schoolDistrict}>
            <input
              className={inputClass}
              value={form.schoolDistrict}
              onChange={(e) => update("schoolDistrict", e.target.value)}
              required
            />
          </Field>
          <Field label="School Location / Village" required error={fieldErrors.schoolVillage}>
            <input
              className={inputClass}
              value={form.schoolVillage}
              onChange={(e) => update("schoolVillage", e.target.value)}
              required
            />
          </Field>
          <Field label="School State" required error={fieldErrors.schoolState}>
            <select
              className={inputClass}
              value={form.schoolState}
              onChange={(e) => update("schoolState", e.target.value)}
              required
            >
              <option value="">Select...</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="School Pincode" required error={fieldErrors.schoolPincode}>
            <input
              className={inputClass}
              value={form.schoolPincode}
              onChange={(e) => update("schoolPincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              required
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Academic Record</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Class X - Marks in Math (%)" error={fieldErrors.marksXMath}>
            <input
              className={inputClass}
              value={form.marksXMath}
              onChange={(e) => update("marksXMath", e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field label="Class X - Marks in Science (%)" error={fieldErrors.marksXScience}>
            <input
              className={inputClass}
              value={form.marksXScience}
              onChange={(e) => update("marksXScience", e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field label="Class X - Marks Aggregate (%)" error={fieldErrors.marksXAggregate}>
            <input
              className={inputClass}
              value={form.marksXAggregate}
              onChange={(e) => update("marksXAggregate", e.target.value)}
              inputMode="decimal"
            />
          </Field>
          <Field
            label="Class XI - % Marks Math + Science (Qtrly / 1st Summative)"
            error={fieldErrors.marksXIPercent}
          >
            <input
              className={inputClass}
              value={form.marksXIPercent}
              onChange={(e) => update("marksXIPercent", e.target.value)}
              inputMode="decimal"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Any other achievement (extra-curricular / science exhibition / olympiad)"
            error={fieldErrors.achievements}
          >
            <textarea
              className={inputClass}
              rows={2}
              value={form.achievements}
              onChange={(e) => update("achievements", e.target.value)}
            />
          </Field>
          <Field label="Prizes won (science exhibition / olympiad / etc.)" error={fieldErrors.prizes}>
            <textarea
              className={inputClass}
              rows={2}
              value={form.prizes}
              onChange={(e) => update("prizes", e.target.value)}
            />
          </Field>
          <Field label={`Student's aspiration in 1 sentence (e.g. "I want to be a ...")`} error={fieldErrors.aspiration}>
            <input
              className={inputClass}
              value={form.aspiration}
              onChange={(e) => update("aspiration", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">School Co-ordinator Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Co-ordinator Name" required error={fieldErrors.coordinatorName}>
            <input
              className={inputClass}
              value={form.coordinatorName}
              onChange={(e) => update("coordinatorName", e.target.value)}
              required
            />
          </Field>
          <Field label="Co-ordinator Contact No." required error={fieldErrors.coordinatorPhone}>
            <input
              className={inputClass}
              value={form.coordinatorPhone}
              onChange={(e) => update("coordinatorPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              required
            />
          </Field>
          <Field label="Co-ordinator Email Id" required error={fieldErrors.coordinatorEmail}>
            <input
              type="email"
              className={inputClass}
              value={form.coordinatorEmail}
              onChange={(e) => update("coordinatorEmail", e.target.value)}
              required
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Nomination"}
        </button>
      </div>
    </form>
  );
}
