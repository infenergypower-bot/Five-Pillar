import { NextResponse } from "next/server";
import { connection } from "next/server";
import { demoModeEnabled } from "@/lib/demo-mode";

export async function GET() {
  await connection();
  const enabled = demoModeEnabled();
  return NextResponse.json({ enabled, writable: enabled, label: enabled ? "PUBLIC_WORKSPACE" : "AUTHENTICATED" });
}
