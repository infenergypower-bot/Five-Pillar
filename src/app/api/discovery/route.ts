import { api } from "@/app/api/_shared";
import { listDiscoverySessions } from "@/lib/services";

export async function GET() {
  return api((principal) => listDiscoverySessions(principal));
}
