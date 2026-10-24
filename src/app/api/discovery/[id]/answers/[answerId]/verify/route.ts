import { api, jsonBody } from "@/app/api/_shared";
import { verifyDiscoveryAnswer } from "@/lib/services";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; answerId: string }> }) {
  return api(async (principal) => {
    const { id, answerId } = await context.params;
    return verifyDiscoveryAnswer(principal, id, answerId, await jsonBody(request));
  });
}
