import NominationForm from "./NominationForm";

export const metadata = {
  title: "Submit Nomination — Camp Nomination Portal",
};

export default function NominatePage() {
  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Student Nomination Form</h1>
          <p className="mt-1 text-sm text-slate-600">
            Please fill in the details carefully. Fields marked{" "}
            <span className="text-rose-500">*</span> are required.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <NominationForm />
        </div>
      </div>
    </div>
  );
}
