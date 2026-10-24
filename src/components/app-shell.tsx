"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BriefcaseBusiness, ChartNoAxesCombined, ChevronDown, Clapperboard,
  FileCheck2, FileSignature, Files, Gauge, HandCoins, Layers3, Menu, Receipt,
  Search, Settings2, Sparkles, UsersRound, WandSparkles, Workflow,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

interface SearchResult {
  id: string;
  href: string;
  label: string;
  type: string;
}

function items(body: unknown): Array<Record<string, unknown>> {
  if (!body || typeof body !== "object" || !("data" in body)) return [];
  const data = (body as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !("items" in data)) return [];
  return Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
}

export function AppShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  const pathname = usePathname();
  const demoMode = useDemoMode();
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Dashboard failed with HTTP ${response.status}.`);
        const body = await response.json() as { data?: { quotes?: Record<string, number> } };
        setReviewCount(body.data?.quotes?.INTERNAL_REVIEW ?? 0);
      })
      .catch((cause: unknown) => {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) setReviewCount(0);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      Promise.all(["clients", "projects", "quotes"].map(async (resource) => {
        const response = await fetch(`/api/${resource}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Search failed with HTTP ${response.status}.`);
        return { resource, records: items(await response.json()) };
      }))
        .then((collections) => {
          const results = collections.flatMap(({ resource, records }) => records.flatMap((record) => {
            const label = String(record.displayName ?? record.title ?? record.projectTitle ?? "");
            if (!label.toLowerCase().includes(term) || !record.id) return [];
            return [{
              id: String(record.id),
              href: `/${resource}/${encodeURIComponent(String(record.id))}`,
              label,
              type: resource === "clients" ? "Client" : resource === "projects" ? "Project" : "Quote",
            }];
          }));
          setSearchResults(results.slice(0, 8));
        })
        .catch((cause: unknown) => {
          if (!(cause instanceof DOMException && cause.name === "AbortError")) setSearchResults([]);
        })
        .finally(() => setSearching(false));
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const links = (items: typeof navigation) => items.map(({ label, href, icon: Icon }) => (
    <Link className={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "active" : ""} href={href} key={label} onClick={() => setMobileOpen(false)}>
      <Icon size={17} />{label}
    </Link>
  ));

  return (
    <div className="app-frame">
      {mobileOpen && <button aria-label="Close menu" className="mobile-backdrop" onClick={() => setMobileOpen(false)} type="button" />}
      <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <Link className="brand" href="/" onClick={() => setMobileOpen(false)}><div className="brand-symbol"><i /><i /><i /><i /><i /></div><div><strong>PILLAR ONE</strong><span>{demoMode ? "READ-ONLY DEMO" : "OPERATING SYSTEM"}</span></div></Link>
        <nav>
          <p>Workspace</p>
          {links(navigation)}
          <p>Intelligence</p>
          {links(intelligence)}
          <p>Administration</p>
          <Link className={pathname === "/settings" ? "active" : ""} href="/settings" onClick={() => setMobileOpen(false)}><Settings2 size={17} />Settings</Link>
          <Link className={pathname === "/portal" ? "active" : ""} href="/portal" onClick={() => setMobileOpen(false)}><UsersRound size={17} />Client portal</Link>
        </nav>
        <div className="sidebar-foot"><div className="avatar">P1</div><div><strong>{demoMode ? "Demo workspace" : "Authorized workspace"}</strong><span>{demoMode ? "View only" : "Role-scoped access"}</span></div>{!demoMode && <ChevronDown size={15} />}</div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <button aria-expanded={mobileOpen} aria-label="Open menu" className="mobile-menu" onClick={() => setMobileOpen(true)} type="button"><Menu size={20} /></button>
          <div><span>{eyebrow}</span><strong>{title}</strong></div>
          <div className="topbar-popover search-popover">
            <label className="global-search"><Search size={16} /><input aria-label="Global search" onChange={(event) => { const value = event.target.value; setQuery(value); setSearchOpen(true); if (value.trim().length < 2) { setSearchResults([]); setSearching(false); } }} onFocus={() => setSearchOpen(true)} placeholder="Search clients, projects, quotes..." ref={searchInput} value={query} /><kbd>Ctrl K</kbd></label>
            {searchOpen && query.trim().length >= 2 && <div className="topbar-menu search-results" role="listbox">
              {searching ? <p>Searching...</p> : searchResults.length ? searchResults.map((result) => <Link href={result.href} key={`${result.type}-${result.id}`} onClick={() => setSearchOpen(false)}><span>{result.type}</span><strong>{result.label}</strong></Link>) : <p>No matching clients, projects, or quotes.</p>}
            </div>}
          </div>
          <Link className="icon-button" aria-label="Settings" href="/settings"><Settings2 size={18} /></Link>
          <div className="topbar-popover">
            <button aria-expanded={notificationOpen} aria-label="Notifications" className="icon-button" onClick={() => setNotificationOpen((open) => !open)} type="button"><Bell size={18} />{reviewCount > 0 && <i />}</button>
            {notificationOpen && <div className="topbar-menu notification-menu">
              <span>Notifications</span>
              {reviewCount > 0 ? <Link href="/quotes" onClick={() => setNotificationOpen(false)}><strong>{reviewCount} quote{reviewCount === 1 ? "" : "s"} awaiting review</strong><small>Open margin-protection decisions.</small></Link> : <p>No current notifications.</p>}
            </div>}
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
