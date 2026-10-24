"use client";

import { useActionState } from "react";
import { consumeResetAction, requestResetAction, type ResetState } from "./actions";

const initialState: ResetState = {};

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestResetAction, initialState);
  return (
    <form action={action} className="auth-form">
      <label>Organization<input name="organization" required defaultValue="five-pillar" /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <button className="primary-button" disabled={pending} type="submit">Request recovery link</button>
      {state.message ? <p role="status">{state.message}</p> : null}
    </form>
  );
}

export function ConsumeResetForm({ token }: { token?: string }) {
  const [state, action, pending] = useActionState(consumeResetAction, initialState);
  return (
    <form action={action} className="auth-form">
      <label>Reset token<input name="token" required defaultValue={token} /></label>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
      <button className="primary-button" disabled={pending} type="submit">Reset password</button>
      {state.message ? <p role="status">{state.message}</p> : null}
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
