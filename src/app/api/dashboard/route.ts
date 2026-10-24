import { api } from "@/app/api/_shared";
import { getDashboardSummary } from "@/lib/services";

export async function GET() {
  return api(getDashboardSummary);
}
