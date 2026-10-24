import { api, jsonBody } from "@/app/api/_shared";
import { createChangeOrder } from "@/lib/services";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => createChangeOrder(principal, (await context.params).id, await jsonBody(request)), { status: 201 });
}
