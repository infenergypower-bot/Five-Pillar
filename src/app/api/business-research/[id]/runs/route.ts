import { api, jsonBody } from "@/app/api/_shared";
import { startResearchRun } from "@/lib/research/service";
import { z } from "zod";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async principal => {
    const { stage } = z.object({ stage: z.enum(["PROFILE", "GROWTH"]) }).parse(await jsonBody(request));
    return startResearchRun(principal, (await context.params).id, stage);
  }, { status: 201 });
}
