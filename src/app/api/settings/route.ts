import { api, pagination } from "@/app/api/_shared";
import { listResource } from "@/app/api/_resources";

export async function GET(request: Request) {
  return api((principal) => listResource("settings", principal, pagination(request)));
}
