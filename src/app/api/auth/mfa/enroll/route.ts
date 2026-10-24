import { api, jsonBody } from "@/app/api/_shared";
import { beginMfaEnrollment } from "@/lib/auth/mfa";

export async function POST(request: Request) {
  return api(async (principal) => beginMfaEnrollment(principal, await jsonBody(request)));
}
