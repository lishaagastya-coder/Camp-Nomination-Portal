import { createClient, type Client, type InArgs } from "@libsql/client";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const globalForDb = globalThis as unknown as { dbClient?: Client };

function getClient(): Client {
  if (globalForDb.dbClient) return globalForDb.dbClient;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  let client: Client;
  if (url) {
    client = createClient({ url, authToken });
  } else {
    // Local development fallback: a plain SQLite file on disk, no Turso account needed.
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    client = createClient({ url: `file:${path.join(dataDir, "nominations.db")}` });
  }

  globalForDb.dbClient = client;
  return client;
}

const db = getClient();

let schemaReady: Promise<unknown> | null = null;

function ensureSchema(): Promise<unknown> {
  if (!schemaReady) {
    schemaReady = db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS nominations (
        id TEXT PRIMARY KEY,
        rollNo TEXT NOT NULL,
        studentName TEXT NOT NULL,
        className TEXT NOT NULL DEFAULT 'XI',
        gender TEXT NOT NULL,
        schoolName TEXT NOT NULL,
        schoolDistrict TEXT NOT NULL,
        schoolVillage TEXT NOT NULL,
        schoolState TEXT NOT NULL,
        schoolPincode TEXT NOT NULL,
        marksXMath REAL,
        marksXScience REAL,
        marksXAggregate REAL,
        marksXIPercent REAL,
        coordinatorName TEXT NOT NULL,
        coordinatorPhone TEXT NOT NULL,
        coordinatorEmail TEXT NOT NULL,
        studentEmail TEXT,
        achievements TEXT,
        prizes TEXT,
        aspiration TEXT,
        cycle TEXT NOT NULL DEFAULT '2026',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_nominations_state ON nominations(schoolState);
      CREATE INDEX IF NOT EXISTS idx_nominations_school_roll ON nominations(schoolName, rollNo);
    `);
  }
  return schemaReady;
}

async function run(sql: string, args: InArgs = []) {
  await ensureSchema();
  return db.execute({ sql, args });
}

export type Nomination = {
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
  cycle: string;
  createdAt: string;
  updatedAt: string;
};

export type NominationCreateData = Omit<Nomination, "id" | "createdAt" | "updatedAt">;

export async function findDuplicateNomination(
  schoolName: string,
  rollNo: string,
  cycle: string
): Promise<Nomination | undefined> {
  const rs = await run(
    `SELECT * FROM nominations WHERE schoolName = ? AND rollNo = ? AND cycle = ? LIMIT 1`,
    [schoolName, rollNo, cycle]
  );
  return rs.rows[0] as unknown as Nomination | undefined;
}

export async function createNomination(data: NominationCreateData): Promise<Nomination> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = { ...data, id, createdAt: now, updatedAt: now };

  await run(
    `INSERT INTO nominations (
      id, rollNo, studentName, className, gender,
      schoolName, schoolDistrict, schoolVillage, schoolState, schoolPincode,
      marksXMath, marksXScience, marksXAggregate, marksXIPercent,
      coordinatorName, coordinatorPhone, coordinatorEmail, studentEmail,
      achievements, prizes, aspiration, cycle, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.rollNo,
      record.studentName,
      record.className,
      record.gender,
      record.schoolName,
      record.schoolDistrict,
      record.schoolVillage,
      record.schoolState,
      record.schoolPincode,
      record.marksXMath,
      record.marksXScience,
      record.marksXAggregate,
      record.marksXIPercent,
      record.coordinatorName,
      record.coordinatorPhone,
      record.coordinatorEmail,
      record.studentEmail,
      record.achievements,
      record.prizes,
      record.aspiration,
      record.cycle,
      record.createdAt,
      record.updatedAt,
    ]
  );

  return record;
}

export async function listNominations(filters: { state?: string; q?: string }): Promise<Nomination[]> {
  const clauses: string[] = [];
  const args: (string | number)[] = [];

  if (filters.state) {
    clauses.push("schoolState = ?");
    args.push(filters.state);
  }
  if (filters.q) {
    clauses.push("(studentName LIKE ? OR schoolName LIKE ? OR rollNo LIKE ? OR schoolDistrict LIKE ?)");
    const like = `%${filters.q}%`;
    args.push(like, like, like, like);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rs = await run(`SELECT * FROM nominations ${where} ORDER BY createdAt DESC`, args);
  return rs.rows as unknown as Nomination[];
}

export async function getAllNominations(): Promise<Nomination[]> {
  const rs = await run(`SELECT * FROM nominations ORDER BY createdAt DESC`);
  return rs.rows as unknown as Nomination[];
}

export async function deleteNomination(id: string): Promise<void> {
  await run(`DELETE FROM nominations WHERE id = ?`, [id]);
}
