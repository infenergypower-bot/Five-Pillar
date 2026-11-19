import { api } from "@/app/api/_shared";
import { applyInfenergyResearchBaseline } from "@/lib/research/service";

export async function POST(_request: Request, { params }: RouteContext<"/api/business-research/[id]/baseline">) {
  const { id } = await params;
  return api(principal => applyInfenergyResearchBaseline(principal, id));
}

