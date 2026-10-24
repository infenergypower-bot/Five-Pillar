import { NextRequest, NextResponse } from "next/server";
import { redirectsDemoAuth } from "@/lib/demo-mode";

export function proxy(request: NextRequest) {
  if (redirectsDemoAuth(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/login", "/logout", "/password-reset/:path*"],
};
