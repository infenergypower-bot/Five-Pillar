"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  LoaderCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDemoMode } from "@/components/demo-mode-provider";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface ApiEnvelope<T> {
  data?: T;
  error?: { message?: string };
}

interface DiscoveryListItem {
  id: string;
  servicePath: string;
  status: string;
  completeness: number;
  readinessStatus: string;
  compiledBriefVersion: number;
  confirmedBriefVersion?: number | null;
  updatedAt: string;
  client?: { displayName: string } | null;
  project?: { title: string; status: string } | null;
  _count: { answers: number; materials: number; clarifications: number; risks: number };
}

interface DiscoveryOption {
  id: string;
  label: string;
  value: JsonValue;
}

interface DiscoveryQuestion {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  helpText?: string | null;
  type: string;
  category: string;
  required: boolean;
  recommended: boolean;
  critical: boolean;
  active: boolean;
  options: DiscoveryOption[];
}

interface DiscoverySection {
  id: string;
  title: string;
  description?: string | null;
  questions: DiscoveryQuestion[];
}

interface DiscoveryAnswer {
  id: string;
  questionId: string;
  value: JsonValue;
  source: string;
  verificationStatus: string;
  version: number;
}

interface DiscoveryRisk {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: string;
  blocking: boolean;
}

interface DiscoveryClarification {
  id: string;
  reasonCode: string;
  prompt: string;
  rationale?: string | null;
}

interface DiscoveryOutput {
  id: string;
  type: string;
  version: number;
  payload: JsonValue;
}

interface DiscoveryWorkspaceData {
  id: string;
  servicePath: string;
  status: string;
  completeness: number;
  readinessStatus: string;
  compiledBriefVersion: number;
  confirmedBriefVersion?: number | null;
  client?: { displayName: string } | null;
  project?: { title: string; status: string } | null;
  questionnaireVersion: { sections: DiscoverySection[] };
  answers: DiscoveryAnswer[];
  materials: Array<{ id: string; category: string; verificationStatus: string; asset: { name: string; mimeType?: string | null } }>;
  clarifications: DiscoveryClarification[];
  risks: DiscoveryRisk[];
  latestOutputs: DiscoveryOutput[];
  impacts: Array<{ id: string; answerKey: string; explanation: string; affectedAreas: string[] }>;
  collaborators: Array<{ id: string; name: string; email: string; role: string }>;
  assessment: {
    completeness: number;
    readinessStatus: string;
    missingRequired: Array<{ key: string; label: string }>;
    missingRecommended: Array<{ key: string; label: string }>;
    unverifiedCritical: Array<{ key: string; label: string }>;
  };
}

function humanize(value: string): string {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function errorFrom<T>(body: ApiEnvelope<T>, fallback: string): string {
  return body.error?.message ?? fallback;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || body.data === undefined) throw new Error(errorFrom(body, `Request failed with HTTP ${response.status}.`));
  return body.data;
}

async function sendJson<T>(url: string, method: "POST" | "PATCH", payload?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { accept: "application/json", "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || body.data === undefined) throw new Error(errorFrom(body, `Request failed with HTTP ${response.status}.`));
  return body.data;
}

function ReadinessBadge({ status }: { status: string }) {
  const ready = status.startsWith("READY_");
  return <span className={`discovery-status ${ready ? "ready" : "attention"}`}>{ready ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}{humanize(status)}</span>;
}

export function DiscoveryWorkspace() {
  const demoMode = useDemoMode();
  const [sessions, setSessions] = useState<DiscoveryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSessions(await getJson<DiscoveryListItem[]>("/api/discovery"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load discovery sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getJson<DiscoveryListItem[]>("/api/discovery")
      .then((records) => { if (active) setSessions(records); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load discovery sessions."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const totals = useMemo(() => ({
    active: sessions.length,
    ready: sessions.filter((session) => session.readinessStatus.startsWith("READY_")).length,
    blockers: sessions.reduce((sum, session) => sum + session._count.risks + session._count.clarifications, 0),
    average: sessions.length ? Math.round(sessions.reduce((sum, session) => sum + session.completeness, 0) / sessions.length) : 0,
  }), [sessions]);

  return (
    <>
      <section className="module-hero discovery-hero">
        <div>
          <span className="kicker">Intelligent qualification and readiness</span>
          <h1>Adaptive discovery</h1>
          <p>Relevant questions only, deterministic production gates, verified answer reuse, and structured briefs.</p>
        </div>
        <button className="secondary-button" onClick={() => void load()} type="button"><RefreshCw size={15} /> Refresh</button>
      </section>
      {!demoMode && <div className="discovery-callout"><ShieldCheck size={18} /><div><strong>Production workspace</strong><span>Create, update, verify, and advance discovery records without signing in.</span></div></div>}
      {error && <div className="system-message error"><AlertCircle size={18} />{error}</div>}
      <section className="metric-grid">
        <div className="metric-card"><div className="metric-icon"><Sparkles size={17} /></div><span>Discovery sessions</span><strong>{totals.active}</strong><small>Resumable client and staff interviews</small></div>
        <div className="metric-card"><div className="metric-icon green"><CheckCircle2 size={17} /></div><span>Ready to advance</span><strong>{totals.ready}</strong><small>Passed deterministic readiness gates</small></div>
        <div className="metric-card"><div className="metric-icon gold"><CircleAlert size={17} /></div><span>Open signals</span><strong>{totals.blockers}</strong><small>Risks and clarification prompts</small></div>
        <div className="metric-card"><div className="metric-icon violet"><FileCheck2 size={17} /></div><span>Average completion</span><strong>{totals.average}%</strong><small>Required visible information supplied</small></div>
      </section>
      <section className="panel discovery-list">
        <header><div><span className="kicker">Customer journeys</span><h2>Qualification pipeline</h2></div><span className="count-badge">{sessions.length}</span></header>
        {loading ? <div className="empty-state"><LoaderCircle className="spin" size={24} /><strong>Loading adaptive discovery</strong></div> :
          sessions.length === 0 ? <div className="empty-state"><strong>No discovery sessions yet</strong><span>Start an intake to begin structured qualification.</span></div> :
          <div className="discovery-session-grid">
            {sessions.map((session) => (
              <Link className="discovery-session-card" href={`/intake/${encodeURIComponent(session.id)}`} key={session.id}>
                <div className="discovery-card-top">
                  <div><span className="kicker">{humanize(session.servicePath)}</span><h3>{session.client?.displayName ?? session.project?.title ?? "Unassigned discovery"}</h3></div>
                  <ArrowRight size={17} />
                </div>
                <ReadinessBadge status={session.readinessStatus} />
                <div className="discovery-progress"><i style={{ width: `${session.completeness}%` }} /></div>
                <div className="discovery-card-meta">
                  <span>{session.completeness}% complete</span>
                  <span>{session._count.answers} answers</span>
                  <span>{session._count.materials} materials</span>
                </div>
              </Link>
            ))}
          </div>}
      </section>
      {!demoMode && <AdminQuestionBank />}
    </>
  );
}

function AdminQuestionBank() {
  const [open, setOpen] = useState(false);
  const [definitions, setDefinitions] = useState<Array<{ id: string; name: string; versions: Array<{ sections: DiscoverySection[] }> }>>([]);
  const [error, setError] = useState("");

  async function load() {
    setOpen(true);
    try {
      setDefinitions(await getJson("/api/discovery/questions"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the question bank.");
    }
  }

  async function update(question: DiscoveryQuestion, changes: Record<string, unknown>) {
    try {
      await sendJson(`/api/discovery/questions/${encodeURIComponent(question.id)}`, "PATCH", changes);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the question.");
    }
  }

  return (
    <section className="panel discovery-admin">
      <header><div><span className="kicker">Administrator controls</span><h2>Configurable question bank</h2></div><button className="secondary-button" onClick={() => open ? setOpen(false) : void load()} type="button">{open ? "Close" : "Manage questions"}</button></header>
      {error && <div className="system-message error"><AlertCircle size={16} />{error}</div>}
      {open && <div className="question-bank">
        {definitions.flatMap((definition) => definition.versions[0]?.sections ?? []).flatMap((section) => section.questions.map((question) => (
          <div className="question-admin-row" key={question.id}>
            <div><strong>{question.label}</strong><span>{question.category} · {question.type}</span></div>
            <label><input checked={question.required} onChange={(event) => void update(question, { required: event.target.checked })} type="checkbox" /> Required</label>
            <label><input checked={question.active} onChange={(event) => void update(question, { active: event.target.checked })} type="checkbox" /> Active</label>
          </div>
        )))}
      </div>}
    </section>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: DiscoveryQuestion;
  value: JsonValue | undefined;
  onChange: (value: JsonValue) => void;
}) {
  const stringValue = typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (question.type === "LONG_TEXT") return <textarea value={stringValue} onChange={(event) => onChange(event.target.value)} rows={5} />;
  if (question.type === "BOOLEAN") return <select value={value === true ? "true" : value === false ? "false" : ""} onChange={(event) => onChange(event.target.value === "true")}><option value="">Select…</option><option value="true">Yes</option><option value="false">No</option></select>;
  if (["SINGLE_SELECT", "RADIO"].includes(question.type)) {
    return <select value={stringValue} onChange={(event) => onChange(event.target.value)}><option value="">Select…</option>{question.options.map((option) => <option key={option.id} value={String(option.value)}>{option.label}</option>)}</select>;
  }
  if (["MULTI_SELECT", "CHECKBOX"].includes(question.type)) {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return <div className="discovery-options">{question.options.map((option) => {
      const optionValue = String(option.value);
      return <label key={option.id}><input checked={selected.includes(optionValue)} onChange={(event) => onChange(event.target.checked ? [...selected, optionValue] : selected.filter((item) => item !== optionValue))} type="checkbox" />{option.label}</label>;
    })}</div>;
  }
  const inputType = question.type === "DATE" ? "date" : question.type === "NUMBER" || question.type === "CURRENCY" ? "number" : "text";
  return <input type={inputType} value={stringValue} onChange={(event) => onChange(inputType === "number" ? Number(event.target.value) : event.target.value)} />;
}

export function DiscoverySession({ id }: { id: string }) {
  const demoMode = useDemoMode();
  const [data, setData] = useState<DiscoveryWorkspaceData | null>(null);
  const [values, setValues] = useState<Record<string, JsonValue>>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"questions" | "readiness" | "outputs" | "materials">("questions");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const workspace = await getJson<DiscoveryWorkspaceData>(`/api/discovery/${encodeURIComponent(id)}`);
      setData(workspace);
      setValues(Object.fromEntries(workspace.answers.map((answer) => [answer.questionId, answer.value])));
      setSectionIndex((index) => Math.min(index, Math.max(workspace.questionnaireVersion.sections.length - 1, 0)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load this discovery session.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    void getJson<DiscoveryWorkspaceData>(`/api/discovery/${encodeURIComponent(id)}`)
      .then((workspace) => {
        if (!active) return;
        setData(workspace);
        setValues(Object.fromEntries(workspace.answers.map((answer) => [answer.questionId, answer.value])));
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load this discovery session."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const section = data?.questionnaireVersion.sections[sectionIndex];
  const answered = data ? data.questionnaireVersion.sections.flatMap((item) => item.questions).filter((question) => values[question.id] !== undefined && values[question.id] !== "").length : 0;
  const visibleCount = data?.questionnaireVersion.sections.flatMap((item) => item.questions).length ?? 0;

  async function saveSection() {
    if (!section) return;
    const answers = section.questions.filter((question) => values[question.id] !== undefined).map((question) => ({
      questionId: question.id,
      value: values[question.id],
      source: "STAFF_INTERVIEW",
      verificationStatus: "STAFF_VERIFIED",
    }));
    if (!answers.length) return;
    setSaving(true);
    setError("");
    try {
      await sendJson(`/api/discovery/${encodeURIComponent(id)}/answers`, "POST", { answers });
      setNotice("Answers saved, versioned, and reassessed.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save discovery answers.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state"><LoaderCircle className="spin" size={25} /><strong>Building adaptive discovery workspace</strong></div>;
  if (!data) return <div className="system-message error"><AlertCircle size={18} />{error || "Discovery session not found."}</div>;

  return (
    <>
      <section className="module-hero discovery-hero">
        <div><span className="kicker">{humanize(data.servicePath)}</span><h1>{data.client?.displayName ?? data.project?.title ?? "Discovery session"}</h1><p>Version {data.compiledBriefVersion} · {answered} of {visibleCount} currently relevant questions answered</p></div>
        <ReadinessBadge status={data.readinessStatus} />
      </section>
      {error && <div className="system-message error"><AlertCircle size={18} />{error}</div>}
      {notice && <div className="system-message success"><CheckCircle2 size={18} />{notice}</div>}
      <div className="discovery-progress large"><i style={{ width: `${data.assessment.completeness}%` }} /></div>
      <nav className="discovery-tabs" aria-label="Discovery workspace">
        {(["questions", "readiness", "outputs", "materials"] as const).map((item) => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)} type="button">{humanize(item)}</button>)}
      </nav>

      {tab === "questions" && <div className="discovery-editor">
        <aside className="panel discovery-sections">
          <span className="kicker">Relevant sections</span>
          {data.questionnaireVersion.sections.map((item, index) => <button className={index === sectionIndex ? "active" : ""} key={item.id} onClick={() => setSectionIndex(index)} type="button"><span>{index + 1}</span><div><strong>{item.title}</strong><small>{item.questions.length} questions</small></div></button>)}
        </aside>
        <section className="panel discovery-question-panel">
          <header><div><span className="kicker">Section {sectionIndex + 1} of {data.questionnaireVersion.sections.length}</span><h2>{section?.title}</h2><p>{section?.description}</p></div></header>
          <div className="discovery-questions">
            {section?.questions.map((question) => {
              const saved = data.answers.find((answer) => answer.questionId === question.id);
              return <label className="discovery-question" key={question.id}>
                <div className="question-title"><strong>{question.label}</strong><span>{question.required ? "Required" : question.recommended ? "Recommended" : "Optional"}{question.critical ? " · Production gate" : ""}</span></div>
                {question.description && <p>{question.description}</p>}
                <QuestionInput question={question} value={values[question.id]} onChange={(value) => setValues((current) => ({ ...current, [question.id]: value }))} />
                <div className="question-foot"><small>{question.helpText}</small>{saved && <em>{humanize(saved.verificationStatus)} · v{saved.version}</em>}</div>
              </label>;
            })}
          </div>
          <footer className="discovery-editor-actions">
            <button className="secondary-button" disabled={sectionIndex === 0} onClick={() => setSectionIndex((index) => Math.max(0, index - 1))} type="button"><ChevronLeft size={15} /> Previous</button>
            {!demoMode && <button className="primary-button" disabled={saving} onClick={() => void saveSection()} type="button">{saving ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />} Save progress</button>}
            <button className="secondary-button" disabled={sectionIndex >= data.questionnaireVersion.sections.length - 1} onClick={() => setSectionIndex((index) => Math.min(data.questionnaireVersion.sections.length - 1, index + 1))} type="button">Next <ChevronRight size={15} /></button>
          </footer>
        </section>
      </div>}

      {tab === "readiness" && <div className="discovery-two-column">
        <section className="panel"><header><div><span className="kicker">Deterministic gates</span><h2>Production readiness</h2></div><strong className="readiness-score">{data.assessment.completeness}%</strong></header>
          <div className="readiness-list">
            <ReadinessGroup title="Missing required information" items={data.assessment.missingRequired.map((item) => item.label)} />
            <ReadinessGroup title="Critical answers awaiting verification" items={data.assessment.unverifiedCritical.map((item) => item.label)} />
            <ReadinessGroup title="Recommended improvements" items={data.assessment.missingRecommended.map((item) => item.label)} />
          </div>
        </section>
        <section className="panel"><header><div><span className="kicker">Account strategist signals</span><h2>Clarifications and risks</h2></div></header>
          {data.clarifications.map((item) => <div className="discovery-signal" key={item.id}><Sparkles size={16} /><div><strong>{item.prompt}</strong><span>{item.rationale}</span></div></div>)}
          {data.risks.map((risk) => <div className={`discovery-signal risk ${risk.blocking ? "blocking" : ""}`} key={risk.id}><CircleAlert size={16} /><div><strong>{risk.title}</strong><span>{risk.description}</span></div></div>)}
          {!data.clarifications.length && !data.risks.length && <div className="empty-state"><CheckCircle2 size={24} /><strong>No open clarification or risk signals</strong></div>}
        </section>
        {data.impacts.length > 0 && <section className="panel discovery-impact"><header><div><span className="kicker">Change control</span><h2>Locked decision impacts</h2></div></header>{data.impacts.map((impact) => <div key={impact.id}><strong>{humanize(impact.answerKey)}</strong><span>{impact.explanation}</span><small>{impact.affectedAreas.join(" · ")}</small></div>)}</section>}
      </div>}

      {tab === "outputs" && <section className="panel"><header><div><span className="kicker">Verified information only</span><h2>Generated operational records</h2></div><span className="count-badge">{data.latestOutputs.length}</span></header>
        <div className="discovery-output-grid">{data.latestOutputs.map((output) => <article key={output.id}><span>{humanize(output.type)}</span><strong>Version {output.version}</strong><pre>{JSON.stringify(output.payload, null, 2)}</pre></article>)}</div>
      </section>}

      {tab === "materials" && <div className="discovery-two-column">
        <section className="panel"><header><div><span className="kicker">Reference library</span><h2>Uploaded materials</h2></div><span className="count-badge">{data.materials.length}</span></header>
          {data.materials.map((material) => <div className="material-row" key={material.id}><FileCheck2 size={18} /><div><strong>{material.asset.name}</strong><span>{humanize(material.category)} · {humanize(material.verificationStatus)}</span></div></div>)}
          {!data.materials.length && <div className="empty-state"><strong>No reference materials linked</strong><span>Register files in Assets, then link them to discovery for extraction and verification.</span></div>}
        </section>
        <section className="panel"><header><div><span className="kicker">Shared discovery</span><h2>Authorized stakeholders</h2></div><Users size={18} /></header>
          {data.collaborators.map((collaborator) => <div className="material-row" key={collaborator.id}><Users size={18} /><div><strong>{collaborator.name}</strong><span>{collaborator.email} · {humanize(collaborator.role)}</span></div></div>)}
          {!data.collaborators.length && <div className="empty-state"><strong>No additional stakeholders</strong></div>}
        </section>
      </div>}
    </>
  );
}

function ReadinessGroup({ title, items }: { title: string; items: string[] }) {
  return <div className="readiness-group"><div><strong>{title}</strong><span>{items.length ? `${items.length} outstanding` : "Complete"}</span></div>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <CheckCircle2 size={18} />}</div>;
}
