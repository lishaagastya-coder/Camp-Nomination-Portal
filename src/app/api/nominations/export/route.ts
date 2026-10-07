import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const nominations = await prisma.nomination.findMany({ orderBy: { createdAt: "desc" } });

  const rows = nominations.map((n) => ({
    "School Roll No.": n.rollNo,
    "Student Name (As per Aadhar Card)": n.studentName,
    "Class Studying": n.className,
    Gender: n.gender,
    "SCHOOL Name": n.schoolName,
    "School District": n.schoolDistrict,
    "School Location / Village": n.schoolVillage,
    "School State": n.schoolState,
    "School Pincode": n.schoolPincode,
    "Class X - Marks in Math": n.marksXMath ?? "",
    "Class X - Marks in Science": n.marksXScience ?? "",
    "Class X - Marks Aggregate": n.marksXAggregate ?? "",
    "Class XI - % Marks Math+Science": n.marksXIPercent ?? "",
    "School Co-ordinator Name": n.coordinatorName,
    "School Co-ordinator Contact No.": n.coordinatorPhone,
    "School Co-ordinator Email Id": n.coordinatorEmail,
    "Student Email Id": n.studentEmail ?? "",
    "Other Achievements": n.achievements ?? "",
    "Prizes Won": n.prizes ?? "",
    "Student's Aspiration": n.aspiration ?? "",
    "Submitted At": n.createdAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nominations");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="nominations-export.xlsx"`,
    },
  });
}
