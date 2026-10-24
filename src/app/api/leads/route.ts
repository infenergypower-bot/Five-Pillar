import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createLead, listLeads } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listLeads(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createLead(principal, body)), { status: 201 });
}
