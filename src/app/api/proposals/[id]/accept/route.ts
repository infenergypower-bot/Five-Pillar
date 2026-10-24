import { api, clientIp, jsonBody } from "@/app/api/_shared";
import { acceptProposal } from "@/lib/services";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => acceptProposal(principal, (await context.params).id, await jsonBody(request), clientIp(request)));
}
