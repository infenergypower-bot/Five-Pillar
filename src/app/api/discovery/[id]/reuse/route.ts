import { api } from "@/app/api/_shared";
import { reuseVerifiedDiscoveryAnswers } from "@/lib/services";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => reuseVerifiedDiscoveryAnswers(principal, (await context.params).id));
}
