"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Plus, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ModuleDefinition, ResourceField } from "@/lib/modules";
import { useDemoMode } from "@/components/demo-mode-provider";

type RecordValue = string | number | boolean | null | undefined | Record<string, unknown>;
type ResourceRecord = Record<string, RecordValue>;

function errorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("error" in body)) return fallback;
  const error = body.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return fallback;
}

function collection(body: unknown): ResourceRecord[] {
  const envelope = typeof body === "object" && body && "data" in body ? (body as { data: unknown }).data : body;
  const source = typeof envelope === "object" && envelope && "items" in envelope ? (envelope as { items: unknown }).items : envelope;
  if (Array.isArray(source)) return source as ResourceRecord[];
  return source && typeof source === "object" ? [source as ResourceRecord] : [];
}

function display(value: RecordValue): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return "View details";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString();
  return String(value);
}

function Field({ field }: { field: ResourceField }) {
  if (field.type === "textarea") return <label>{field.label}<textarea name={field.name} required={field.required} /></label>;
  if (field.type === "select") {
    return <label>{field.label}<select name={field.name} required={field.required} defaultValue=""><option value="" disabled>Select…</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  }
  return <label>{field.label}<input name={field.name} type={field.type ?? "text"} required={field.required} step={field.type === "number" ? "0.01" : undefined} /></label>;
}

export function ResourceWorkspace({ module }: { module: ModuleDefinition }) {
  const demoMode = useDemoMode();
  const [records, setRecords] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);

  const readRecords = useCallback(async (signal?: AbortSignal) => {
    if (!module.endpoint) return [];
    const response = await fetch(module.endpoint, { headers: { accept: "application/json" }, cache: "no-store", signal });
    if (response.status === 401) throw new Error("Sign in is required to access this workspace.");
    const body: unknown = await response.json();
    if (!response.ok) throw new Error(errorMessage(body, `Request failed with HTTP ${response.status}.`));
    return collection(body);
  }, [module.endpoint]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRecords(await readRecords());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [readRecords]);

  useEffect(() => {
    const controller = new AbortController();
    void readRecords(controller.signal)
      .then(setRecords)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Unable to load records.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [readRecords]);

  const rows = useMemo(() => records.map((record, index) => ({ id: String(record.id ?? index), record })), [records]);

  async function create(formData: FormData) {
    if (!module.endpoint) return;
    setError("");
    setNotice("");
    const payload: Record<string, unknown> = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]));
    if (module.slug === "leads") {
      payload.serviceInterests = payload.servicePath ? [payload.servicePath] : [];
      delete payload.servicePath;
    }
    if (module.slug === "clients") {
      payload.primaryContact = {
        name: payload.primaryContactName,
        email: payload.primaryContactEmail,
      };
      delete payload.primaryContactName;
      delete payload.primaryContactEmail;
    }
    try {
      const response = await fetch(module.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(errorMessage(body, `Request failed with HTTP ${response.status}.`));
      setNotice(`${module.createLabel ?? "Record"} saved.`);
      setCreating(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the record.");
    }
  }

  return (
    <>
      <section className="module-hero">
        <div><span className="kicker">{module.eyebrow}</span><h1>{module.title}</h1><p>{module.description}</p></div>
        <div className="module-actions">
          <button className="secondary-button" onClick={() => void load()} type="button"><RefreshCw size={15} /> Refresh</button>
          {module.fields && !demoMode && <button className="primary-button" onClick={() => setCreating(true)} type="button"><Plus size={15} /> {module.createLabel}</button>}
        </div>
      </section>

      {error && <div className="system-message error"><AlertCircle size={18} /><span>{error}</span>{error.startsWith("Sign in") && <Link href="/login">Sign in</Link>}</div>}
      {notice && <div className="system-message success"><CheckCircle2 size={18} /><span>{notice}</span></div>}

      <section className="resource-layout">
        <article className="panel resource-panel">
          <header><div><span className="kicker">Persisted records</span><h2>{module.title}</h2></div><span className="count-badge">{records.length}</span></header>
          {loading ? <div className="empty-state"><LoaderCircle className="spin" size={25} /><strong>Loading authorized records</strong></div> :
            rows.length === 0 ? <div className="empty-state"><strong>No records available</strong><span>{demoMode ? "No demonstration records are available in this section." : "Create the first authorized record or adjust your filters."}</span></div> :
              <div className="data-table" role="table">
                <div className="data-row data-head" role="row">{module.columns.map((column) => <span key={column}>{column.replaceAll(/([A-Z])/g, " $1")}</span>)}</div>
                {rows.map(({ id, record }) => <div className="data-row" role="row" key={id}>{module.columns.map((column) => <span key={column} data-label={column}>{display(record[column])}</span>)}</div>)}
              </div>}
        </article>
        <aside className="panel guidance-panel"><span className="kicker">Operating controls</span><h2>Built-in safeguards</h2>{module.guidance.map((item) => <p key={item}><CheckCircle2 size={15} />{item}</p>)}</aside>
      </section>

      {creating && module.fields && !demoMode && <div className="modal-backdrop" role="presentation" onMouseDown={() => setCreating(false)}>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className="kicker">New persisted record</span><h2 id="create-title">{module.createLabel}</h2></div><button aria-label="Close" className="icon-button" onClick={() => setCreating(false)} type="button"><X size={18} /></button></header>
          <form action={create} className="resource-form">
            {module.fields.map((field) => <Field field={field} key={field.name} />)}
            <div className="form-actions"><button className="secondary-button" onClick={() => setCreating(false)} type="button">Cancel</button><button className="primary-button" type="submit">Save record</button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
