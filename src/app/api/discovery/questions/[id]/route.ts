import { api, jsonBody } from "@/app/api/_shared";
import { updateDiscoveryQuestion } from "@/lib/services";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => updateDiscoveryQuestion(principal, (await context.params).id, await jsonBody(request)));
}
