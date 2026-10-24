"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="auth-form">
      <label>
        Organization
        <input name="organization" autoComplete="organization" required defaultValue="five-pillar" />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <label>
        Authenticator code
        <input name="mfaCode" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" />
      </label>
      {state.error ? <p className="auth-error" role="alert">{state.error}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <Link href="/password-reset">Forgot password?</Link>
    </form>
  );
}
