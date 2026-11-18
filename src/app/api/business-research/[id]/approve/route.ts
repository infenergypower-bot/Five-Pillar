import { api } from "@/app/api/_shared";
import { approveResearchProfile } from "@/lib/research/service";
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async principal => approveResearchProfile(principal, (await context.params).id));
}
