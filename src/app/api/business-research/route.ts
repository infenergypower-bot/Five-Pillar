import { api, jsonBody } from "@/app/api/_shared";
import { createResearchProfile, listResearchProfiles } from "@/lib/research/service";
export async function GET() { return api(listResearchProfiles); }
export async function POST(request: Request) { return api(async principal => createResearchProfile(principal, await jsonBody(request)), { status: 201 }); }
