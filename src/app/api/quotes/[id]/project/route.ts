import { api } from "@/app/api/_shared";
import { convertQuoteToProject } from "@/lib/services";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async (principal) => convertQuoteToProject(principal, (await context.params).id), { status: 201 });
}
