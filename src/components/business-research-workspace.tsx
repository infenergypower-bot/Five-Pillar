"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { BusinessProfileData, GrowthAudit, Question, ResearchAnswer, ResearchSource } from "@/lib/research/domain";
// Styles are loaded by the root layout so research screens retain their design
// in production navigation and direct links alike.
const styleNames = ["actionBar", "auditColumns", "back", "bar", "card", "columns", "editor", "error", "facets", "finding", "hero", "inlineActions", "kicker", "meta", "muted", "notice", "primary", "questionLayout", "questionList", "record", "recordList", "secondary", "segmentMap", "selected", "sources", "space", "stat", "stats", "tag", "tasks", "two"] as const;
const styles = Object.fromEntries(styleNames.map(name => [name, `research-${name}`])) as Record<(typeof styleNames)[number], string>;

type Run = { id: string; profileVersion: number; stage: "PROFILE" | "GROWTH"; status: string; tasks: { lane: string; status: string; error?: string }[]; result: GrowthAudit | null; error?: string | null };
type Detail = { id: string; businessName: string; description: string; website: string | null; location: string | null; status: string; version: number; researchAvailable: boolean; researchUnavailableReason: string | null; profile: BusinessProfileData; progress: { total: number; answered: number; approved: number }; questions: Question[]; runs: Run[] };
type ListItem = { id: string; businessName: string; description: string; website: string | null; status: string; updatedAt: string; progress: { total: number; answered: number; approved: number }; latestRun: { stage: string; status: string } | null };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || `Request failed with HTTP ${response.status}`);
  return body.data as T;
}
const payload = (method: string, value?: unknown): RequestInit => ({
  method, headers: { "content-type": "application/json" }, body: value === undefined ? undefined : JSON.stringify(value),
});

export function ResearchHome() {
  const router = useRouter();
  const [items, setItems] = useState<ListItem[]>([]);
  const [clients, setClients] = useState<{ id: string; displayName: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [growthSelection, setGrowthSelection] = useState("");
  useEffect(() => {
    void request<{ items: ListItem[] }>("/api/business-research").then(x => setItems(x.items)).catch(e => setError(String(e))).finally(() => setLoading(false));
    void request<{ items: { id: string; displayName: string }[] }>("/api/clients").then(x => setClients(x.items)).catch(() => undefined);
  }, []);
  async function create(event: FormEvent) {
    event.preventDefault(); setError(""); setCreating(true);
    try {
      const created = await request<{ id: string; research: { status: string } | null }>("/api/business-research", payload("POST", { businessName, description, website, location, clientId: clientId || undefined }));
      router.push(`/business-research/${created.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create profile"); setCreating(false); }
  }
  return <div className={styles.space}>
    <section className={styles.hero}><span className={styles.kicker}>Five Pillar Firm intelligence</span><h1>Business research</h1><p>Build a sourced company profile, review its answers, then hand it to the growth intelligence audit.</p></section>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.columns}>
      <form className={styles.card} onSubmit={create}>
        <span className={styles.kicker}>01 / Business profile</span><h2>Start a company profile</h2>
        <label>Business name<input required minLength={2} maxLength={180} value={businessName} onChange={e => setBusinessName(e.target.value)} /></label>
        <label>What the business does<textarea required minLength={12} maxLength={5000} rows={5} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <div className={styles.two}><label>Website <small>optional</small><input type="url" placeholder="https://" value={website} onChange={e => setWebsite(e.target.value)} /></label><label>Location <small>optional</small><input value={location} onChange={e => setLocation(e.target.value)} /></label></div>
        {clients.length > 0 && <label>Link to the same CRM client <small>optional</small><select value={clientId} onChange={e => setClientId(e.target.value)}><option value="">Not linked yet</option>{clients.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}</select></label>}
        <button className={styles.primary} disabled={creating}>{creating ? "Creating and queuing research..." : "Create profile and research"}</button>
      </form>
      <section className={styles.card}><span className={styles.kicker}>Your research</span><h2>Company profiles</h2>
        {loading ? <p>Loading profiles</p> : items.length ? <div className={styles.recordList}>{items.map(item => <Link key={item.id} href={`/business-research/${item.id}`} className={styles.record}><strong>{item.businessName}</strong><span>{item.description}</span><small>{item.progress.approved}/{item.progress.total} approved answers / {item.status}{item.latestRun ? `  ${item.latestRun.stage} ${item.latestRun.status}` : ""}</small></Link>)}</div> : <p>No research profiles yet. Start with a business name and description.</p>}
      </section>
    </div>
    <section className="research-handoff" aria-labelledby="research-handoff-heading">
      <div className="research-handoff-copy"><span className={styles.kicker}>Tool 2 / Growth intelligence</span><h2 id="research-handoff-heading">Choose a company. Find its next move.</h2><p>Hand an approved business profile to competitor, positioning, brand, audience, and channel research. Draft profiles can be opened for review first.</p></div>
      <div className="research-handoff-controls"><label htmlFor="growth-profile">Company profile</label><select id="growth-profile" value={growthSelection} onChange={e => setGrowthSelection(e.target.value)}><option value="">Select a company profile</option>{items.map(item => <option key={item.id} value={item.id}>{item.businessName} / {item.status}</option>)}</select><button className={styles.primary} type="button" disabled={!growthSelection} onClick={() => router.push(`/business-research/${growthSelection}?view=growth`)}>Open growth intelligence</button></div>
    </section>
  </div>;
}

function SourceLinks({ ids, sources }: { ids: string[]; sources: ResearchSource[] }) {
  const matching = sources.filter(s => ids.includes(s.id));
  return matching.length ? <div className={styles.sources}>{matching.map(s => s.url.startsWith("https://") ? <a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : <span key={s.id}>{s.title}  {s.type.replaceAll("_", " ")}</span>)}</div> : <span className={styles.muted}>No linked source</span>;
}

export function ResearchDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [selected, setSelected] = useState("");
  const [selectedPillar, setSelectedPillar] = useState("BUSINESS_INTELLIGENCE");
  const [value, setValue] = useState("");
  const [kind, setKind] = useState<ResearchAnswer["kind"]>("VERIFIED");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<ResearchSource["type"]>("PUBLIC_WEB");
  const [sourceTitle, setSourceTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const advancing = useRef(false);
  const reload = useCallback(async () => { setDetail(await request<Detail>(`/api/business-research/${id}`)); }, [id]);
  useEffect(() => {
    const controller = new AbortController();
    void request<Detail>(`/api/business-research/${id}`, { signal: controller.signal })
      .then(setDetail)
      .catch(e => { if (!(e instanceof DOMException && e.name === "AbortError")) setError(e instanceof Error ? e.message : "Unable to load profile"); });
    return () => controller.abort();
  }, [id]);
  useEffect(() => {
    if (detail && new URLSearchParams(window.location.search).get("view") === "growth") {
      document.getElementById("growth-intelligence")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [detail?.id]);
  const active = detail?.runs.find(r => r.status === "QUEUED" || r.status === "RUNNING");
  const activeRunId = active?.id;
  const activeStatus = active?.status;
  useEffect(() => {
    if (!activeRunId) return;
    const runId = activeRunId;
    async function tick() {
      if (advancing.current) return; advancing.current = true;
      try { await request(`/api/business-research/${id}/runs/${runId}/advance`, payload("POST")); await reload(); }
      catch (e) { setError(e instanceof Error ? e.message : "Research could not advance"); }
      finally { advancing.current = false; }
    }
    void tick();
    const timer = window.setInterval(() => void tick(), 12000);
    return () => window.clearInterval(timer);
  }, [activeRunId, activeStatus, id, reload]);
  const question = detail?.questions.find(q => q.id === selected);
  const answer = detail?.profile.answers.find(a => a.questionId === selected);
  const growth = detail?.runs.find(r => r.stage === "GROWTH" && r.result);
  const latestProfileRun = detail?.runs.find(r => r.stage === "PROFILE");
  const progress = detail?.progress;
  const groups = useMemo(() => detail ? Array.from(new Set(detail.questions.map(q => q.pillar))).map(pillar => ({ pillar, items: detail.questions.filter(q => q.pillar === pillar) })) : [], [detail]);
  function pick(q: Question) {
    const current = detail?.profile.answers.find(a => a.questionId === q.id);
    setSelected(q.id); setValue(current?.value || ""); setKind(current?.kind === "UNKNOWN" ? "VERIFIED" : current?.kind || "VERIFIED"); setSourceUrl(""); setSourceType("PUBLIC_WEB"); setSourceTitle("");
    setRationale(current?.rationale || ""); setError(""); setNotice("");
  }
  async function run(stage: "PROFILE" | "GROWTH") {
    setBusy(stage); setError(""); setNotice("");
    try { await request(`/api/business-research/${id}/runs`, payload("POST", { stage })); await reload(); setNotice(`${stage === "PROFILE" ? "Profile" : "Growth"} research queued.`); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to start research"); }
    finally { setBusy(""); }
  }
  async function saveAnswer(event: FormEvent) {
    event.preventDefault(); setBusy("answer"); setError(""); setNotice("");
    try {
      const saved = await request<Detail>(`/api/business-research/${id}/answers`, payload("PATCH", { questionId: selected, value: kind === "UNKNOWN" ? null : value, kind, sourceUrl: sourceUrl || undefined, sourceTitle: sourceTitle || undefined, sourceType, rationale, status: "APPROVED" }));
      setDetail(saved); setNotice("Reviewed answer saved. Profile approval will need to be renewed.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save answer"); }
    finally { setBusy(""); }
  }
  async function approve() {
    setBusy("approve"); setError("");
    try { await request(`/api/business-research/${id}/approve`, payload("POST")); await reload(); setNotice("Profile approved for growth research."); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to approve profile"); }
    finally { setBusy(""); }
  }
  async function reviewOpportunity(runId: string, opportunityId: string, status: "APPROVED" | "REJECTED") {
    setBusy(opportunityId); setError("");
    try { await request(`/api/business-research/${id}/runs/${runId}/opportunities`, payload("PATCH", { opportunityId, status })); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to review opportunity"); }
    finally { setBusy(""); }
  }
  function exportProfile() {
    if (!detail) return;
    const file = new Blob([JSON.stringify(detail, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${detail.businessName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-five-pillar-research.json`; anchor.click();
    URL.revokeObjectURL(url);
  }
  if (!detail) return <div className={styles.space}><Link href="/business-research"> Business research</Link><p>{error || "Loading company profile"}</p></div>;
  return <div className={styles.space}>
    <Link href="/business-research" className={styles.back}> All profiles</Link>
    <section className={styles.hero}><span className={styles.kicker}>Business profile / Version {detail.version}</span><h1>{detail.businessName}</h1><p>{detail.description}</p><div className={styles.meta}>{detail.website && <a href={detail.website} target="_blank" rel="noreferrer">{detail.website}</a>}<span>{detail.location || "Location unknown"}</span><span>{detail.status}</span></div></section>
    {!detail.researchAvailable && <p className={styles.error} role="alert">{detail.researchUnavailableReason} The profile is saved, but company research cannot run until this is resolved.</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}{notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.actionBar}>
      <button className={styles.primary} disabled={!!busy || !!active || !detail.researchAvailable} onClick={() => void run("PROFILE")}>{latestProfileRun ? "Refresh company research" : "Start company research"}</button>
      <button className={styles.secondary} disabled={!!busy || !!active || detail.status !== "APPROVED"} onClick={() => void run("GROWTH")}>Run growth intelligence</button>
      <button className={styles.secondary} disabled={!!busy || detail.status === "APPROVED"} onClick={() => void approve()}>Approve profile</button>
      <button className={styles.secondary} onClick={exportProfile}>Export research</button>
    </div>
    {active && <section className={styles.card}><h2>{active.stage === "PROFILE" ? "Company research" : "Growth intelligence"} in progress</h2><div className={styles.tasks}>{active.tasks.map(t => <span key={t.lane}>{t.lane}: {t.status}{t.error ? `  ${t.error}` : ""}</span>)}</div><p className={styles.muted}>Research continues while this page is open. A scheduled job can also advance it when you leave.</p></section>}
    {!active && latestProfileRun && (latestProfileRun.status === "FAILED" || latestProfileRun.status === "PARTIAL") && <section className={styles.error} role="alert"><strong>Company research {latestProfileRun.status.toLowerCase()}.</strong><p>{latestProfileRun.tasks.filter(t => t.error).map(t => `${t.lane}: ${t.error}`).join(" / ") || latestProfileRun.error || "Some agents did not finish. Retry research."}</p></section>}
    <section className="research-stage" id="growth-intelligence"><div><span className={styles.kicker}>02 / Growth intelligence</span><h2>{detail.status === "APPROVED" ? "Ready to investigate the market" : "Next: review and hand off this profile"}</h2><p>{detail.status === "APPROVED" ? "Run the competitor, brand, audience, channel, and strategic gap audit using this approved company profile." : "Review sourced answers below, approve the profile, then launch the second research tool for this company."}</p></div><button className={styles.primary} disabled={!!busy || !!active || detail.status !== "APPROVED" || !detail.researchAvailable} onClick={() => void run("GROWTH")}>Research growth opportunities</button></section>
    <div className={styles.stats}>{groups.map(g => {
      const approved = g.items.filter(q => detail.profile.answers.find(a => a.questionId === q.id)?.status === "APPROVED").length;
      return <div className={styles.stat} key={g.pillar}><strong>{approved}/{g.items.length}</strong><span>{g.pillar.replaceAll("_", " ").toLowerCase()}</span><div className={styles.bar}><i style={{ width: `${approved / g.items.length * 100}%` }} /></div></div>;
    })}</div>
    <section className={styles.card}><span className={styles.kicker}>01 / Reviewed questionnaire</span><h2>Five Pillar company profile</h2><p>{progress?.answered}/{progress?.total} answered  {progress?.approved} reviewed and approved. Unknowns remain visible for owner follow-up.</p>
      <div className="research-pillars" role="tablist" aria-label="Five Pillar questions">{groups.map(g => <button type="button" role="tab" aria-selected={selectedPillar === g.pillar} className={selectedPillar === g.pillar ? "active" : ""} key={g.pillar} onClick={() => { setSelectedPillar(g.pillar); setSelected(""); }}>{g.pillar.replaceAll("_", " ").toLowerCase()}</button>)}</div>
      <div className={styles.questionLayout}><div className={styles.questionList}>{groups.filter(g => g.pillar === selectedPillar).map(g => <div key={g.pillar}><h3>{g.pillar.replaceAll("_", " ")}</h3>{g.items.map(q => {
        const a = detail.profile.answers.find(x => x.questionId === q.id);
        return <button key={q.id} className={selected === q.id ? styles.selected : ""} onClick={() => pick(q)}><span>{q.prompt}</span><small>{a?.status === "APPROVED" ? "Reviewed" : a?.kind === "UNKNOWN" ? "Unknown" : "Needs review"}</small></button>;
      })}</div>)}</div>
      <div className={styles.editor}>{question ? <><span className={styles.kicker}>{question.category}</span><h3>{question.prompt}</h3><p>{answer?.value || "No answer yet."}</p><SourceLinks ids={answer?.sourceIds || []} sources={detail.profile.sources} />
        <form onSubmit={saveAnswer}><label>Answer<textarea rows={5} value={value} onChange={e => setValue(e.target.value)} disabled={kind === "UNKNOWN"} /></label>
          <div className={styles.two}><label>Evidence status<select value={kind} onChange={e => setKind(e.target.value as ResearchAnswer["kind"])}><option>VERIFIED</option><option>INFERRED</option><option>HYPOTHESIS</option><option>UNKNOWN</option></select></label>
          <label>Source type<select value={sourceType} onChange={e => setSourceType(e.target.value as ResearchSource["type"])}><option value="PUBLIC_WEB">Public web</option><option value="CLIENT_STATEMENT">Client statement</option><option value="CLIENT_DOCUMENT">Client document</option></select></label></div>
          <div className={styles.two}><label>Source URL <small>for web sources</small><input type="url" placeholder="https://" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} /></label><label>Source title <small>for client interviews or documents</small><input value={sourceTitle} onChange={e => setSourceTitle(e.target.value)} /></label></div>
          <label>Reason or review note<textarea rows={3} value={rationale} onChange={e => setRationale(e.target.value)} /></label><button className={styles.primary} disabled={busy === "answer"}>Save reviewed answer</button></form></> : <p>Select a question to inspect its sources and review the answer.</p>}</div></div>
    </section>
    {growth && growth.result && <section className={styles.card}><span className={styles.kicker}>02 / Growth intelligence</span><h2>Company and audience audit</h2>
      {growth.profileVersion !== detail.version && <p className={styles.error}>This audit used profile version {growth.profileVersion}; the current profile is version {detail.version}. Rerun growth intelligence before approving its opportunities.</p>}
      <p>{growth.result.findings.length} findings  {growth.result.opportunities.length} evidence-linked opportunities. Every recommendation is a draft until reviewed.</p>
      <h3>Competitor landscape</h3><div className={styles.auditColumns}>{growth.result.competitors.length ? growth.result.competitors.map((c, i) => <article className={styles.finding} key={`${c.name}-${i}`}><div className={styles.tag}>{c.type}</div><h4>{c.name}</h4><p><strong>Position:</strong> {c.positioning}<br /><strong>Offers:</strong> {c.offers}<br /><strong>Pricing:</strong> {c.pricing}<br /><strong>Advantages:</strong> {c.advantages}<br /><strong>Gaps to investigate:</strong> {c.gaps}</p><SourceLinks ids={c.sourceIds} sources={growth.result!.sources} /></article>) : <p>Competitor details are still unknown.</p>}</div>
      <h3>Audience evidence map</h3>{growth.result.segments.length > 0 && <div className={styles.segmentMap}>{growth.result.segments.map((s, i) => <div key={`${s.name}-map-${i}`}><span>{s.name}</span><div className={styles.bar}><i style={{ width: `${s.confidence * 100}%` }} /></div><small>{s.sourceIds.length} linked sources  {Math.round(s.confidence * 100)}% stated confidence</small></div>)}</div>}
      <div className={styles.auditColumns}>{growth.result.segments.length ? growth.result.segments.map((s, i) => <article className={styles.finding} key={`${s.name}-${i}`}><div className={styles.tag}>{s.geography}  {s.sample}  {Math.round(s.confidence * 100)}% confidence</div><h4>{s.name}</h4><p>{s.description}</p><dl className={styles.facets}>{([
        ["Demographics", s.demographics], ["Psychographics and values", s.psychographics], ["Needs", s.needs], ["Buying triggers", s.triggers], ["Objections", s.objections], ["Lifestyle", s.lifestyle], ["Adjacent ownership", s.adjacentOwnership], ["Content habits", s.contentHabits], ["Entertainment affinities", s.entertainmentAffinities],
      ] as const).map(([label, val]) => <div key={label}><dt>{label}</dt><dd>{val}</dd></div>)}</dl><SourceLinks ids={s.sourceIds} sources={growth.result!.sources} /></article>) : <p>Audience segments require further evidence.</p>}</div>
      <div className={styles.auditColumns}><div><h3>Research findings</h3>{growth.result.findings.map(f => <article className={styles.finding} key={f.id}><div className={styles.tag}>{f.topic}  {f.kind}  {Math.round(f.confidence * 100)}% confidence</div><h4>{f.field}</h4><p>{f.value || "Unknown  client or audience research required."}</p><small>{f.rationale}</small><SourceLinks ids={f.sourceIds} sources={growth.result!.sources} /></article>)}</div>
      <div><h3>Opportunity roadmap</h3>{growth.result.opportunities.length ? growth.result.opportunities.map(o => <article className={styles.finding} key={o.id}><div className={styles.tag}>{o.pillar.replaceAll("_", " ")}  {o.status}</div><h4>{o.title}</h4><p>{o.action}</p><p><strong>Audience:</strong> {o.targetSegment}<br /><strong>Measure:</strong> {o.successMetric}</p><div className={styles.sources}>{o.bookRefs.map(ref => ref.url ? <a key={ref.title} href={ref.url} target="_blank" rel="noreferrer">{ref.title}, PDF pp. {ref.pages.join(", ")}</a> : <span key={ref.title}>{ref.title}, PDF pp. {ref.pages.join(", ")}</span>)}</div><div className={styles.sources}>{o.evidenceFindingIds.flatMap(fid => growth.result!.findings.find(f => f.id === fid)?.sourceIds || []).map(sid => growth.result!.sources.find(s => s.id === sid)).filter((s): s is ResearchSource => !!s).map(s => <a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}</div><div className={styles.inlineActions}><button onClick={() => void reviewOpportunity(growth.id, o.id, "APPROVED")} disabled={busy === o.id || growth.profileVersion !== detail.version}>Approve</button><button onClick={() => void reviewOpportunity(growth.id, o.id, "REJECTED")} disabled={busy === o.id || growth.profileVersion !== detail.version}>Reject</button></div></article>) : <p>Research found no source-backed opportunities yet. Review the findings and add client data.</p>}</div></div>
      <details><summary>Research limits</summary>{growth.result.limitations.map(x => <p key={x}>{x}</p>)}</details>
    </section>}
  </div>;
}




