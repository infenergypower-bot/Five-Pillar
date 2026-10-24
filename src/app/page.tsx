import { AppShell } from "@/components/app-shell";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function Dashboard() {
  return <AppShell title="Command center" eyebrow="Live operations"><DashboardOverview /></AppShell>;
}
