// One-off helper to import last cycle's nominations from the original Excel
// sheet into the portal's database, for reference.
//
// Usage: npm run import-legacy -- "C:\path\to\FINAL NOMINATIONS LISTs.xlsx"

import * as XLSX from "xlsx";
import { createNomination, findDuplicateNomination } from "../src/lib/db";

const STATE_ALIASES: Record<string, string> = {
  "A & N ISLANDS": "Andaman & Nicobar Islands",
  "ANDHARA PRADESH": "Andhra Pradesh",
  "ARUNACHAL PRADESH": "Arunachal Pradesh",
  ASSAM: "Assam",
  BIHAR: "Bihar",
  CHATTISGARH: "Chhattisgarh",
  DELHI: "Delhi",
  GOA: "Goa",
  GUJARAT: "Gujarat",
  HARYANA: "Haryana",
  HP: "Himachal Pradesh",
  "J&K-UT": "Jammu & Kashmir",
  JHARKHAND: "Jharkhand",
  KARNAKATA: "Karnataka",
  KARNATAKA: "Karnataka",
  KERALA: "Kerala",
  "LADAKH-UT": "Ladakh",
  "MADHYA PRADESH": "Madhya Pradesh",
  MAHARASHTRA: "Maharashtra",
  MANIPUR: "Manipur",
  ODISHA: "Odisha",
  PUDUCHERRY: "Puducherry",
  PUNJAB: "Punjab",
  RAJASTHAN: "Rajasthan",
  TELANGANA: "Telangana",
  TRIPURA: "Tripura",
  UP: "Uttar Pradesh",
  UT: "Uttar Pradesh",
  "UT OF DNH & DD": "Dadra & Nagar Haveli and Daman & Diu",
  UTTARAKHAND: "Uttarakhand",
  "WEST BENGAL": "West Bengal",
};

function normalizeState(raw: unknown): string {
  const s = String(raw ?? "").trim().toUpperCase();
  return STATE_ALIASES[s] ?? (String(raw ?? "").trim() || "Unknown");
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringOrEmpty(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npm run import-legacy -- "<path-to-xlsx>"');
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Sheet1"];
  if (!sheet) {
    console.error('Expected a sheet named "Sheet1" in the workbook.');
    process.exit(1);
  }

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  const dataRows = rows.slice(1); // skip header row

  let imported = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const rollNo = toStringOrEmpty(row[0]);
    const studentName = toStringOrEmpty(row[1]);
    const schoolName = toStringOrEmpty(row[4]);

    if (!rollNo || !studentName || !schoolName) {
      skipped++;
      continue;
    }

    if (await findDuplicateNomination(schoolName, rollNo, "legacy")) {
      skipped++;
      continue;
    }

    await createNomination({
      rollNo,
      studentName,
      className: toStringOrEmpty(row[2]) || "XI",
      gender: toStringOrEmpty(row[3]).toUpperCase() || "UNKNOWN",
      schoolName,
      schoolDistrict: toStringOrEmpty(row[5]),
      schoolVillage: toStringOrEmpty(row[6]),
      schoolState: normalizeState(row[7]),
      schoolPincode: toStringOrEmpty(row[8]),
      marksXMath: toNumberOrNull(row[9]),
      marksXScience: toNumberOrNull(row[10]),
      marksXAggregate: toNumberOrNull(row[11]),
      marksXIPercent: toNumberOrNull(row[12]),
      coordinatorName: toStringOrEmpty(row[13]),
      coordinatorPhone: toStringOrEmpty(row[14]),
      coordinatorEmail: toStringOrEmpty(row[15]),
      studentEmail: toStringOrEmpty(row[16]) || null,
      achievements: toStringOrEmpty(row[17]) || null,
      prizes: toStringOrEmpty(row[18]) || null,
      aspiration: toStringOrEmpty(row[19]) || null,
      cycle: "legacy",
    });
    imported++;
  }

  console.log(`Imported ${imported} nomination(s). Skipped ${skipped} (missing data or duplicate).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
