"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BriefcaseBusiness, ChartNoAxesCombined, ChevronDown, Clapperboard,
  FileCheck2, FileSignature, Files, Gauge, HandCoins, Layers3, Menu, Receipt,
  Search, Settings2, Sparkles, UsersRound, WandSparkles, Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { useDemoMode } from "@/components/demo-mode-provider";

const navigation = [
  { label: "Command center", href: "/", icon: Gauge },
  { label: "Leads", href: "/leads", icon: UsersRound },
  { label: "Clients & brands", href: "/clients", icon: BriefcaseBusiness },
  { label: "Discovery & intake", href: "/intake", icon: FileCheck2 },
  { label: "Quotes & estimates", href: "/quotes", icon: HandCoins },
  { label: "Proposals", href: "/proposals", icon: Files },
  { label: "Contracts", href: "/contracts", icon: FileSignature },
  { label: "Projects", href: "/projects", icon: BriefcaseBusiness },
  { label: "Productions", href: "/productions", icon: Clapperboard },
  { label: "Tasks & milestones", href: "/tasks", icon: Workflow },
  { label: "Reviews & approvals", href: "/reviews", icon: FileCheck2 },
  { label: "Assets & files", href: "/assets", icon: Files },
  { label: "Invoices & payments", href: "/invoices", icon: Receipt },
  { label: "Subscriptions", href: "/subscriptions", icon: Layers3 },
  { label: "Production costs", href: "/costs", icon: ChartNoAxesCombined },
  { label: "Reports", href: "/reports", icon: ChartNoAxesCombined },
];

const intelligence = [
  { label: "Creative studio", href: "/creative", icon: WandSparkles },
  { label: "Original entertainment", href: "/original-ip", icon: Clapperboard },
  { label: "Alphi AI integration", href: "/integrations", icon: Sparkles },
];

export function AppShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  const pathname = usePathname();
  const demoMode = useDemoMode();
  const links = (items: typeof navigation) => items.map(({ label, href, icon: Icon }) => (
    <Link className={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "active" : ""} href={href} key={label}>
      <Icon size={17} />{label}
    </Link>
  ));

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href="/"><div className="brand-symbol"><i /><i /><i /><i /><i /></div><div><strong>PILLAR ONE</strong><span>{demoMode ? "READ-ONLY DEMO" : "OPERATING SYSTEM"}</span></div></Link>
        <nav>
          <p>Workspace</p>
          {links(navigation)}
          <p>Intelligence</p>
          {links(intelligence)}
          <p>Administration</p>
          <Link className={pathname === "/settings" ? "active" : ""} href="/settings"><Settings2 size={17} />Settings</Link>
          <Link className={pathname === "/portal" ? "active" : ""} href="/portal"><UsersRound size={17} />Client portal</Link>
        </nav>
        <div className="sidebar-foot"><div className="avatar">P1</div><div><strong>{demoMode ? "Demo workspace" : "Authorized workspace"}</strong><span>{demoMode ? "View only" : "Role-scoped access"}</span></div>{!demoMode && <ChevronDown size={15} />}</div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
          <div><span>{eyebrow}</span><strong>{title}</strong></div>
          <label className="global-search"><Search size={16} /><input aria-label="Global search" placeholder="Search clients, projects, quotes..." /><kbd>Ctrl K</kbd></label>
          <Link className="icon-button" aria-label="Settings" href="/settings"><Settings2 size={18} /></Link>
          <button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
