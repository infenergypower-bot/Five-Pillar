import { LoginForm } from "./login-form";
import { redirect } from "next/navigation";
import { demoModeEnabled } from "@/lib/demo-mode";

export default function LoginPage() {
  if (demoModeEnabled()) redirect("/");
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><div className="brand-symbol"><i /><i /><i /><i /><i /></div><div><strong>PILLAR ONE</strong><span>OPERATING SYSTEM</span></div></div>
        <div className="auth-content"><span className="kicker">Secure workspace</span><h1>Sign in</h1><p>Use your organization and authorized account credentials.</p><LoginForm /></div>
      </section>
    </main>
  );
}
