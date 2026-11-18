import { api } from "@/app/api/_shared";
import { advanceScopedRun } from "@/lib/research/service";
export async function POST(_request: Request, context: { params: Promise<{ id: string; runId: string }> }) {
  return api(async principal => {
    const { id, runId } = await context.params;
    return advanceScopedRun(principal, id, runId);
  });
}
