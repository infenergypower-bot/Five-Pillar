import { Suspense } from "react";
import { ConsumeResetForm, RequestResetForm } from "./reset-forms";

async function ResetContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-content"><span className="kicker">Account recovery</span><h1>Password reset</h1>
          {token ? <ConsumeResetForm token={token} /> : <><p>A time-limited recovery link will be queued when the email provider is configured.</p><RequestResetForm /></>}
        </div>
      </section>
    </main>
  );
}

export default function PasswordResetPage(props: { searchParams: Promise<{ token?: string }> }) {
  return (
    <Suspense fallback={<main className="auth-page"><section className="auth-card"><div className="auth-content">Loading…</div></section></main>}>
      <ResetContent {...props} />
    </Suspense>
  );
}
