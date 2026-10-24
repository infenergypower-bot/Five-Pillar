import { logoutAction } from "./actions";

export default function LogoutPage() {
  return (
    <main style={{ maxWidth: 440, margin: "64px auto", padding: 24 }}>
      <h1>Sign out</h1>
      <form action={logoutAction}>
        <button type="submit">Revoke this session</button>
      </form>
    </main>
  );
}
