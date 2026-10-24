import { authenticatePassword } from "@/lib/auth";
import { clientIp, jsonBody, publicApi } from "@/app/api/_shared";
import { ServiceError } from "@/lib/services";

export async function POST(request: Request) {
  return publicApi(async () => {
    const result = await authenticatePassword(await jsonBody(request), {
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    if (!result.ok) {
      throw new ServiceError(
        result.code,
        result.code === "RATE_LIMITED" ? "Too many login attempts" : "Authentication failed",
        result.code === "RATE_LIMITED" ? 429 : 401,
      );
    }
    return { authenticated: true, expiresAt: result.expiresAt };
  });
}
