import { api, jsonBody } from "@/app/api/_shared";
import { confirmDiscoveryBrief } from "@/lib/services";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => confirmDiscoveryBrief(principal, (await context.params).id, await jsonBody(request)));
}
