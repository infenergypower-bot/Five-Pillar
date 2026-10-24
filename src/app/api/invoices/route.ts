import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createInvoice, listInvoices } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listInvoices(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createInvoice(principal, body)), { status: 201 });
}
