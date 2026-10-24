"use server";

import { headers } from "next/headers";
import { createPasswordReset, consumePasswordReset } from "@/lib/auth";

export interface ResetState {
  message?: string;
  error?: string;
}

export async function requestResetAction(_state: ResetState, formData: FormData): Promise<ResetState> {
  const requestHeaders = await headers();
  await createPasswordReset(
    { organization: formData.get("organization"), email: formData.get("email") },
    requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ).catch(() => undefined);
  return {
    message: "If the account exists, recovery instructions were queued for configured delivery.",
  };
}

export async function consumeResetAction(_state: ResetState, formData: FormData): Promise<ResetState> {
  const reset = await consumePasswordReset({
    token: formData.get("token"),
    password: formData.get("password"),
  }).catch(() => false);
  return reset
    ? { message: "Password reset. Existing sessions were revoked; you may sign in." }
    : { error: "The reset token is invalid or expired." };
}
