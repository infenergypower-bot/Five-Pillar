import { api, jsonBody } from "@/app/api/_shared";
import { reviewResearchAnswer } from "@/lib/research/service";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async principal => reviewResearchAnswer(principal, (await context.params).id, await jsonBody(request)));
}
