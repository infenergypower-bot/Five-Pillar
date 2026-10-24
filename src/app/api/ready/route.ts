import { NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", service: "five-pillar-os", database: "reachable", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Readiness database failure", error);
    return NextResponse.json(
      { status: "not_ready", service: "five-pillar-os", database: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
