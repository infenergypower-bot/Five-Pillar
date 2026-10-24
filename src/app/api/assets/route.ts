import { api, jsonBody, pagination } from "@/app/api/_shared";
import { listResource } from "@/app/api/_resources";
import { registerAssetMetadata } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listResource("assets", principal, pagination(request)));
}

export async function POST(request: Request) {
  return api(async (principal) => registerAssetMetadata(principal, await jsonBody(request)), { status: 201 });
}
