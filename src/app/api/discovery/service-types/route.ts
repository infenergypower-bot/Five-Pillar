import { api, jsonBody } from "@/app/api/_shared";
import { createServiceType, listServiceTypes } from "@/lib/services";

export async function GET() {
  return api((principal) => listServiceTypes(principal));
}

export async function POST(request: Request) {
  return api(async (principal) => createServiceType(principal, await jsonBody(request)), { status: 201 });
}
