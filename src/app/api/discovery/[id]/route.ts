import { api } from "@/app/api/_shared";
import { getDiscoveryWorkspace } from "@/lib/services";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => getDiscoveryWorkspace(principal, (await context.params).id));
}
