"use client";

import { ArrowUpRight, CheckCircle2, CircleDollarSign, Film, LoaderCircle, Sparkles, TriangleAlert, Users } from "lucide-react";
import Link from "next/link";
import { useDemoMode } from "@/components/demo-mode-provider";
import { useEffect, useState } from "react";

interface DashboardData {
  pipelineValue?: string;
  qualifiedLeads?: number;
  contractedRevenue?: string;
  collectedRevenue?: string;
  activeProjects?: number;
  onTimeDeliveryRate?: string;
  pipeline?: Array<{ stage: string; count: number; amount: string }>;
  alerts?: Array<{ title: string; detail: string; href?: string }>;
  projects?: Array<{ id: string; title: string; client?: string; status: string; dueAt?: string; progress?: number }>;
}

interface DashboardResponse {
  leads: Record<string, number>;
  projects: Record<string, number>;
  quotes: Record<string, number>;
  invoices: Array<{ billed: string; collected: string }>;
  recentProjects: Array<{ id: string; title: string; client?: { displayName?: string } | null; status: string; dueAt?: string | null }>;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function normalizeDashboard(data: DashboardResponse): DashboardData {
  const inactiveStatuses = new Set(["COMPLETED", "ARCHIVED", "CANCELLED"]);
  const activeProjects = Object.entries(data.projects).reduce((sum, [status, count]) => inactiveStatuses.has(status) ? sum : sum + count, 0);
  const billed = data.invoices.reduce((sum, invoice) => sum + Number(invoice.billed), 0);
  const collected = data.invoices.reduce((sum, invoice) => sum + Number(invoice.collected), 0);
  const quotePipeline = Object.entries(data.quotes).filter(([status]) => !["ACCEPTED", "DECLINED", "EXPIRED", "ARCHIVED"].includes(status));
  const quotePipelineCount = quotePipeline.reduce((sum, [, count]) => sum + count, 0);
  return {
    pipelineValue: `${quotePipelineCount} quote${quotePipelineCount === 1 ? "" : "s"}`,
    qualifiedLeads: Object.values(data.leads).reduce((sum, count) => sum + count, 0),
    contractedRevenue: currency(billed),
    collectedRevenue: currency(collected),
    activeProjects,
    onTimeDeliveryRate: "Not tracked",
    pipeline: quotePipeline.map(([stage, count]) => ({ stage: stage.replaceAll("_", " "), count, amount: `${count} quote${count === 1 ? "" : "s"}` })),
    alerts: data.quotes.INTERNAL_REVIEW ? [{ title: "Quote awaiting review", detail: `${data.quotes.INTERNAL_REVIEW} quote requires an authorized decision.`, href: "/quotes" }] : [],
    projects: data.recentProjects.map((project) => ({
      id: project.id,
      title: project.title,
      client: project.client?.displayName,
      status: project.status,
      dueAt: project.dueAt ?? undefined,
      progress: inactiveStatuses.has(project.status) ? 100 : 50,
    })),
  };
}

const metricDefinitions = [
  { key: "pipelineValue", label: "Active pipeline", detailKey: "qualifiedLeads", suffix: " qualified opportunities", icon: Users, tone: "teal" },
  { key: "contractedRevenue", label: "Contracted revenue", detailKey: "collectedRevenue", suffix: " collected", icon: CircleDollarSign, tone: "gold" },
  { key: "activeProjects", label: "Productions running", detailKey: "activeProjects", suffix: " active projects", icon: Film, tone: "violet" },
  { key: "onTimeDeliveryRate", label: "On-time delivery", detailKey: "onTimeDeliveryRate", suffix: " current rate", icon: CheckCircle2, tone: "green" },
] as const;

export function DashboardOverview() {
  const demoMode = useDemoMode();
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json() as { error?: string; data?: DashboardResponse };
        if (!response.ok) throw new Error(body.error ?? `Dashboard failed with HTTP ${response.status}.`);
        if (!body.data) throw new Error("Dashboard response did not include data.");
        setData(normalizeDashboard(body.data));
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Unable to load the dashboard.");
      });
    return () => controller.abort();
  }, []);

  if (!data && !error) return <div className="dashboard-loading"><LoaderCircle className="spin" /><span>Loading live operations</span></div>;
  if (error) return <section className="system-message error"><TriangleAlert size={18} /><span>{error}</span>{!demoMode && <Link href="/login">Sign in</Link>}</section>;

  return (
    <>
      <section className="hero">
        <div><span className="status-chip"><Sparkles size={14} /> Live operating data</span><h1>Build exceptional work.<br /><em>Protect every margin.</em></h1><p>One operating view from first inquiry to final delivery.</p></div>
        <Link className="primary-button" href="/quotes/new">Build a quote <ArrowUpRight size={16} /></Link>
      </section>
      <section className="metric-grid" aria-label="Business metrics">
        {metricDefinitions.map(({ key, label, detailKey, suffix, icon: Icon, tone }) => {
          const value = data?.[key] ?? "—";
          const detail = data?.[detailKey] ?? "—";
          return <article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={19} /></div><span>{label}</span><strong>{String(value)}</strong><small>{String(detail)}{suffix}</small></article>;
        })}
      </section>
      <section className="dashboard-grid">
        <article className="panel pipeline-panel">
          <header><div><span className="kicker">Revenue</span><h2>Client pipeline</h2></div><Link href="/leads">View CRM</Link></header>
          <div className="pipeline-list">{data?.pipeline?.length ? data.pipeline.map((item) => <div className="pipeline-row" key={item.stage}><div><span>{item.stage}</span><small>{item.count} records</small></div><div className="track"><i style={{ width: `${Math.min(100, Math.max(8, item.count * 10))}%` }} /></div><strong>{item.amount}</strong></div>) : <div className="empty-state"><strong>No pipeline records</strong></div>}</div>
        </article>
        <article className="panel alert-panel">
          <header><div><span className="kicker">Attention</span><h2>Critical actions</h2></div><span className="count-badge">{data?.alerts?.length ?? 0}</span></header>
          <div className="alerts">{data?.alerts?.length ? data.alerts.map((alert) => <Link href={alert.href ?? "/"} key={`${alert.title}-${alert.detail}`}><TriangleAlert size={18} /><p><strong>{alert.title}</strong><span>{alert.detail}</span></p><ArrowUpRight size={14} /></Link>) : <div><CheckCircle2 size={18} /><p><strong>No critical alerts</strong><span>All monitored controls are within threshold.</span></p></div>}</div>
        </article>
      </section>
      <section className="panel production-panel">
        <header><div><span className="kicker">Studio floor</span><h2>Active productions</h2></div><Link href="/projects">View all projects</Link></header>
        <div className="production-table">{data?.projects?.length ? data.projects.map((project) => <Link className="production-row" href={`/projects/${project.id}`} key={project.id}><div className="project-mark">{project.title.slice(0, 2).toUpperCase()}</div><div><strong>{project.title}</strong><span>{project.client ?? "Five Pillar Studios"}</span></div><span className="stage-pill">{project.status}</span><div className="progress"><i><b style={{ width: `${project.progress ?? 0}%` }} /></i><span>{project.progress ?? 0}%</span></div><time>{project.dueAt ? new Date(project.dueAt).toLocaleDateString() : "No due date"}</time><ArrowUpRight size={16} /></Link>) : <div className="empty-state"><strong>No active productions</strong><span>Accepted quotes and original-IP plans appear here.</span></div>}</div>
      </section>
    </>
  );
}
