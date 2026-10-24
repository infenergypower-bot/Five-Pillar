import { api } from "@/app/api/_shared";
import { assessDiscoverySession } from "@/lib/services";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => assessDiscoverySession(principal, (await context.params).id));
}
