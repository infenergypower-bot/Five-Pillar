import { api } from "@/app/api/_shared";
import { getResearchProfile } from "@/lib/research/service";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async principal => getResearchProfile(principal, (await context.params).id));
}
