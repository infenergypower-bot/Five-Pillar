import { NextRequest, NextResponse } from "next/server";
import { blocksDemoMutation } from "@/lib/demo-mode";

export function proxy(request: NextRequest) {
  if (blocksDemoMutation(request.method, request.nextUrl.pathname)) {
    return NextResponse.json(
      { error: { code: "READ_ONLY_DEMO", message: "Pillar One is currently running as a read-only demonstration." } },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
