import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><div className="brand-symbol"><i /><i /><i /><i /><i /></div><div><strong>FIVE PILLAR</strong><span>OPERATING SYSTEM</span></div></div>
        <div className="auth-content"><span className="kicker">Secure workspace</span><h1>Sign in</h1><p>Use your organization and authorized account credentials.</p><LoginForm /></div>
      </section>
    </main>
  );
}
