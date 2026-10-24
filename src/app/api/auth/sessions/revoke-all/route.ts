import { api } from "@/app/api/_shared";
import { revokeAllUserSessions } from "@/lib/auth";

export async function POST() {
  return api(async (principal) => ({ revoked: await revokeAllUserSessions(principal.userId) }));
}
