import { api, jsonBody } from "@/app/api/_shared";
import { reviewGrowthOpportunity } from "@/lib/research/service";
export async function PATCH(request: Request, context: { params: Promise<{ id: string; runId: string }> }) {
  return api(async principal => {
    const { id, runId } = await context.params;
    return reviewGrowthOpportunity(principal, id, runId, await jsonBody(request));
  });
}
