import { NextResponse } from "next/server";
import { requirePrincipal, type AuthPrincipal } from "@/lib/auth";
import { normalizeServiceError, serializeForClient, ServiceError, stripInternalEconomics } from "@/lib/services";

export function clientIp(request: Request): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function jsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ServiceError("INVALID_JSON", "Request body must contain valid JSON", 400);
  }
}

export function pagination(request: Request): { cursor?: string; limit?: string } {
  const search = new URL(request.url).searchParams;
  return { cursor: search.get("cursor") ?? undefined, limit: search.get("limit") ?? undefined };
}

export async function api(
  handler: (principal: AuthPrincipal) => Promise<unknown>,
  options: { status?: number } = {},
): Promise<NextResponse> {
  try {
    const principal = await requirePrincipal();
    const data = await handler(principal);
    const safeData = principal.role === "CLIENT" ? stripInternalEconomics(data) : data;
    return NextResponse.json({ data: serializeForClient(safeData) }, { status: options.status ?? 200 });
  } catch (error) {
    const normalized = normalizeServiceError(error);
    return NextResponse.json(
      { error: { code: normalized.code, message: normalized.message, details: normalized.details } },
      { status: normalized.status },
    );
  }
}

export async function publicApi(handler: () => Promise<unknown>, options: { status?: number } = {}): Promise<NextResponse> {
  try {
    return NextResponse.json({ data: serializeForClient(await handler()) }, { status: options.status ?? 200 });
  } catch (error) {
    const normalized = normalizeServiceError(error);
    return NextResponse.json(
      { error: { code: normalized.code, message: normalized.message, details: normalized.details } },
      { status: normalized.status },
    );
  }
}
