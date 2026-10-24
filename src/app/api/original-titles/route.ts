import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createOriginalTitle, listOriginalTitles } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listOriginalTitles(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createOriginalTitle(principal, body)), { status: 201 });
}
