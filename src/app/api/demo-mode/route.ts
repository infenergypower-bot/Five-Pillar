import { NextResponse } from "next/server";
import { connection } from "next/server";
import { demoModeEnabled } from "@/lib/demo-mode";

export async function GET() {
  await connection();
  return NextResponse.json({ enabled: demoModeEnabled() });
}
