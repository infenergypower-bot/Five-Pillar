import { publicApi } from "@/app/api/_shared";
import { processDueIntegrationWork, requireJobRunnerSecret } from "@/lib/services";

export async function POST(request: Request) {
  return publicApi(async () => {
    requireJobRunnerSecret(request);
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "10");
    return processDueIntegrationWork({ limit: Number.isFinite(limit) ? limit : 10 });
  });
}
