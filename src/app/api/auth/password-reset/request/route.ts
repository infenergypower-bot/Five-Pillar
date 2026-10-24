import { clientIp, jsonBody, publicApi } from "@/app/api/_shared";
import { createPasswordReset } from "@/lib/auth";

export async function POST(request: Request) {
  return publicApi(async () => ({
    ...(await createPasswordReset(await jsonBody(request), clientIp(request))),
    message: "If the account exists, recovery instructions were queued for configured delivery.",
  }), { status: 202 });
}
