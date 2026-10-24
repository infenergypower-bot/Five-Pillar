import { NextResponse } from "next/server";
import { demoModeEnabled } from "@/lib/demo-mode";

export function GET() {
  return NextResponse.json({ enabled: demoModeEnabled() });
}
