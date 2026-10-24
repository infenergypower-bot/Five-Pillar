import { api, jsonBody, pagination } from "@/app/api/_shared";
import { createProject, listProjects } from "@/lib/services";

export async function GET(request: Request) {
  return api((principal) => listProjects(principal, pagination(request)));
}

export async function POST(request: Request) {
  return api((principal) => jsonBody(request).then((body) => createProject(principal, body)), { status: 201 });
}
