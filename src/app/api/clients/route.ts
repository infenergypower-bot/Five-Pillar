import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createClient, listClients } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listClients(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createClient(principal, body)), { status: 201 });
}
