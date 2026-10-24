import { api } from "@/app/api/_shared";
import { getResource } from "@/app/api/_resources";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => getResource("costs", principal, decodeURIComponent((await context.params).id)));
}
