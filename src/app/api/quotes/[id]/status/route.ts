import { api, jsonBody } from "@/app/api/_shared";
import { transitionQuote } from "@/lib/services";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => transitionQuote(principal, (await context.params).id, await jsonBody(request)));
}
