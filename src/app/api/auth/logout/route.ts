import { api } from "@/app/api/_shared";
import { revokeCurrentSession } from "@/lib/auth";

export async function POST() {
  return api(async () => {
    await revokeCurrentSession();
    return { revoked: true };
  });
}
