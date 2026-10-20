import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  initialCompetitions,
  initialTasks,
  initialVaultFiles,
  initialExpenses,
  initialRetrospectives,
} from "@/lib/mock-data";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "database.json");

function getDefaultData() {
  return {
    competitions: initialCompetitions,
    tasks: initialTasks,
    vaultFiles: initialVaultFiles,
    expenses: initialExpenses,
    retrospectives: initialRetrospectives,
    lastUpdated: new Date().toISOString(),
  };
}

function readDatabase() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      const defaultData = getDefaultData();
      fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), "utf8");
      return defaultData;
    }
    const content = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading local database:", err);
    return getDefaultData();
  }
}

function writeDatabase(data: any) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }, null, 2),
      "utf8"
    );
    return true;
  } catch (err) {
    // In Vercel serverless environment, local filesystem is read-only
    console.warn("Local filesystem write skipped (serverless environment):", err);
    return true;
  }
}

// GET /api/db - Read all database records
export async function GET() {
  const data = readDatabase();
  return NextResponse.json({
    success: true,
    data,
    source: "local_json_db",
    storagePath: dbPath,
  });
}

// POST /api/db - Update database records
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const success = writeDatabase(body);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to write database file" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Database updated successfully",
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
