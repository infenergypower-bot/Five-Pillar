import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createIntake, listIntakes } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listIntakes(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createIntake(principal, body)), { status: 201 });
}
