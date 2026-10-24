import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Five Pillar operational API",
    envelope: { success: { data: "..." }, failure: { error: { code: "...", message: "...", details: "optional" } } },
    authentication: "Opaque database session in an HttpOnly cookie. Mutations require JSON.",
    collections: {
      "/api/leads": ["GET", "POST"],
      "/api/clients": ["GET", "POST"],
      "/api/intakes": ["GET", "POST"],
      "/api/quotes": ["GET", "POST"],
      "/api/projects": ["GET", "POST"],
      "/api/invoices": ["GET", "POST"],
      "/api/original-titles": ["GET", "POST"],
    },
    summaries: ["/api/dashboard", "/api/portal"],
    mutations: [
      "/api/leads/:id/stage",
      "/api/intakes/:id/status",
      "/api/quotes/:id/status",
      "/api/quotes/:id/project",
      "/api/proposals/:id/accept",
      "/api/projects/:id/transition",
      "/api/projects/:id/approvals",
      "/api/approvals/:id/decision",
      "/api/projects/:id/revisions",
      "/api/projects/:id/change-orders",
      "/api/change-orders/:id/status",
      "/api/invoices/:id/payments",
      "/api/assets",
      "/api/outbox",
    ],
  });
}
