import { jsonBody, publicApi } from "@/app/api/_shared";
import { consumePasswordReset } from "@/lib/auth";
import { ServiceError } from "@/lib/services";

export async function POST(request: Request) {
  return publicApi(async () => {
    if (!(await consumePasswordReset(await jsonBody(request)))) {
      throw new ServiceError("INVALID_RESET_TOKEN", "Reset token is invalid or expired", 400);
    }
    return { reset: true };
  });
}
