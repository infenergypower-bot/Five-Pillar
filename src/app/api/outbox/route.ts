import { api, jsonBody } from "@/app/api/_shared";
import { enqueueOutbox } from "@/lib/services";

export async function POST(request: Request) {
  return api(async (principal) => enqueueOutbox(principal, await jsonBody(request)), { status: 202 });
}
