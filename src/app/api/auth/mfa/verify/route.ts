import { api, jsonBody } from "@/app/api/_shared";
import { confirmMfaEnrollment } from "@/lib/auth/mfa";

export async function POST(request: Request) {
  return api(async (principal) => confirmMfaEnrollment(principal, await jsonBody(request)));
}
