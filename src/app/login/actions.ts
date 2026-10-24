"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticatePassword } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const requestHeaders = await headers();
  const result = await authenticatePassword(
    {
      organization: formData.get("organization"),
      email: formData.get("email"),
      password: formData.get("password"),
      mfaCode: formData.get("mfaCode") || undefined,
    },
    {
      ipAddress: requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
      userAgent: requestHeaders.get("user-agent") ?? undefined,
    },
  ).catch(() => ({ ok: false as const, code: "INVALID_CREDENTIALS" as const }));
  if (!result.ok) {
    const messages = {
      INVALID_CREDENTIALS: "Invalid organization, email, or password.",
      RATE_LIMITED: "Too many attempts. Try again later.",
      MFA_REQUIRED: "Enter a valid six-digit authenticator code.",
      MFA_SETUP_REQUIRED: "MFA enrollment is required. Contact an administrator to bootstrap enrollment.",
    };
    return { error: messages[result.code] };
  }
  redirect("/");
}
