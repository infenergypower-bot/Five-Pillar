import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "five-pillar-os", timestamp: new Date().toISOString() });
}
