import { api, jsonBody, pagination } from "@/app/api/_shared";
import { listResource } from "@/app/api/_resources";
import { createProposal } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listResource("proposals", principal, pagination(request)));
}

export async function POST(request: Request) {
  return api(async (principal) => createProposal(principal, await jsonBody(request)), { status: 201 });
}
