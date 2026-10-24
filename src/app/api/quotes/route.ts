import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createQuote, listQuotes } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listQuotes(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createQuote(principal, body)), { status: 201 });
}
