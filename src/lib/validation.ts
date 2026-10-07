import { CLASS_OPTIONS, GENDER_OPTIONS } from "./constants";

export type NominationInput = {
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

export type ValidationError = { field: string; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;

function requireText(
  value: string | undefined,
  field: string,
  label: string,
  errors: ValidationError[],
  maxLen = 200
) {
  const v = (value ?? "").trim();
  if (!v) {
    errors.push({ field, message: `${label} is required.` });
  } else if (v.length > maxLen) {
    errors.push({ field, message: `${label} must be under ${maxLen} characters.` });
  }
}

function optionalNumber(
  value: string | undefined,
  field: string,
  label: string,
  errors: ValidationError[],
  min = 0,
  max = 100
) {
  const v = (value ?? "").trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) {
    errors.push({ field, message: `${label} must be a number between ${min} and ${max}.` });
    return null;
  }
  return n;
}

export function validateNomination(input: NominationInput): {
  errors: ValidationError[];
  data: {
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
  };
} {
  const errors: ValidationError[] = [];

  requireText(input.rollNo, "rollNo", "School roll number", errors, 50);
  requireText(input.studentName, "studentName", "Student name", errors, 150);
  requireText(input.schoolName, "schoolName", "School name", errors, 200);
  requireText(input.schoolDistrict, "schoolDistrict", "District", errors, 100);
  requireText(input.schoolVillage, "schoolVillage", "Location / village", errors, 150);
  requireText(input.coordinatorName, "coordinatorName", "Coordinator name", errors, 150);

  if (!CLASS_OPTIONS.includes(input.className as never)) {
    errors.push({ field: "className", message: "Please select a valid class." });
  }
  if (!GENDER_OPTIONS.includes(input.gender as never)) {
    errors.push({ field: "gender", message: "Please select a valid gender." });
  }
  if (!input.schoolState) {
    errors.push({ field: "schoolState", message: "Please select a state." });
  }

  if (!PINCODE_RE.test((input.schoolPincode ?? "").trim())) {
    errors.push({ field: "schoolPincode", message: "Pincode must be exactly 6 digits." });
  }
  if (!PHONE_RE.test((input.coordinatorPhone ?? "").trim())) {
    errors.push({
      field: "coordinatorPhone",
      message: "Coordinator contact number must be a valid 10-digit mobile number.",
    });
  }
  if (!EMAIL_RE.test((input.coordinatorEmail ?? "").trim())) {
    errors.push({ field: "coordinatorEmail", message: "Coordinator email is not valid." });
  }
  const studentEmailTrim = (input.studentEmail ?? "").trim();
  if (studentEmailTrim && !EMAIL_RE.test(studentEmailTrim)) {
    errors.push({ field: "studentEmail", message: "Student email is not valid." });
  }

  const marksXMath = optionalNumber(input.marksXMath, "marksXMath", "Class X Math marks", errors);
  const marksXScience = optionalNumber(
    input.marksXScience,
    "marksXScience",
    "Class X Science marks",
    errors
  );
  const marksXAggregate = optionalNumber(
    input.marksXAggregate,
    "marksXAggregate",
    "Class X aggregate marks",
    errors
  );
  const marksXIPercent = optionalNumber(
    input.marksXIPercent,
    "marksXIPercent",
    "Class XI Math+Science %",
    errors
  );

  if (input.aspiration && input.aspiration.trim().length > 300) {
    errors.push({ field: "aspiration", message: "Aspiration must be a single short sentence (under 300 characters)." });
  }
  if (input.achievements && input.achievements.trim().length > 1000) {
    errors.push({ field: "achievements", message: "Achievements must be under 1000 characters." });
  }
  if (input.prizes && input.prizes.trim().length > 1000) {
    errors.push({ field: "prizes", message: "Prizes must be under 1000 characters." });
  }

  return {
    errors,
    data: {
      rollNo: input.rollNo.trim(),
      studentName: input.studentName.trim(),
      className: input.className,
      gender: input.gender,
      schoolName: input.schoolName.trim(),
      schoolDistrict: input.schoolDistrict.trim(),
      schoolVillage: input.schoolVillage.trim(),
      schoolState: input.schoolState,
      schoolPincode: input.schoolPincode.trim(),
      marksXMath,
      marksXScience,
      marksXAggregate,
      marksXIPercent,
      coordinatorName: input.coordinatorName.trim(),
      coordinatorPhone: input.coordinatorPhone.trim(),
      coordinatorEmail: input.coordinatorEmail.trim(),
      studentEmail: studentEmailTrim || null,
      achievements: input.achievements?.trim() || null,
      prizes: input.prizes?.trim() || null,
      aspiration: input.aspiration?.trim() || null,
    },
  };
}
