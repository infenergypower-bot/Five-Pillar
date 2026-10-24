import { api, jsonBody } from "@/app/api/_shared";
import { createDiscoveryQuestion, listDiscoveryQuestionBank } from "@/lib/services";

export async function GET() {
  return api((principal) => listDiscoveryQuestionBank(principal));
}

export async function POST(request: Request) {
  return api(async (principal) => createDiscoveryQuestion(principal, await jsonBody(request)), { status: 201 });
}
