import { api } from "@/app/api/_shared";
import { getPortalSummary } from "@/lib/services";

export async function GET() {
  return api(getPortalSummary);
}
