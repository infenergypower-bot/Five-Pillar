import { publicApi } from "@/app/api/_shared";
import { requireJobRunnerSecret } from "@/lib/services/jobs";
import { processResearchQueue } from "@/lib/research/service";
export async function POST(request: Request) {
  return publicApi(async () => {
    requireJobRunnerSecret(request);
    return processResearchQueue(Number(new URL(request.url).searchParams.get("limit") || "2"));
  });
}
