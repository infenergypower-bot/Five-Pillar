"use client";

import { Check, Download, RefreshCw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RecordData = Record<string, unknown>;

const leadStages = ["NEW", "CONTACTED", "QUALIFIED", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const quoteStatuses = ["DRAFT", "INTERNAL_REVIEW", "APPROVED", "SENT", "ACCEPTED", "DECLINED", "EXPIRED", "ARCHIVED"];
const projectStatuses = ["INTAKE", "AWAITING_ASSETS", "DISCOVERY_COMPLETE", "CONCEPT_DEVELOPMENT", "SCRIPT_DEVELOPMENT", "SCRIPT_REVIEW", "VISUAL_DEVELOPMENT", "STORYBOARDING", "PRODUCTION_READY", "GENERATION", "EDITING", "INTERNAL_REVIEW", "CLIENT_REVIEW", "REVISIONS", "FINAL_APPROVAL", "AWAITING_FINAL_PAYMENT", "DELIVERY", "COMPLETED", "ARCHIVED", "ON_HOLD", "CANCELLED"];

function message(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) return String(error.message);
  }
  return fallback;
}

export function WorkflowActions({ module, id, record }: { module: string; id: string; record: RecordData }) {
  const router = useRouter();
  const [status, setStatus] = useState(String(record.status ?? ""));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function post(path: string, payload?: Record<string, unknown>) {
    setWorking(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        ...(payload ? { body: JSON.stringify(payload) } : {}),
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(message(body, `Operation failed with HTTP ${response.status}.`));
      setNotice("Operation completed and audited.");
      router.refresh();
      return body;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Operation failed.");
      return null;
    } finally {
      setWorking(false);
    }
  }

  const statusControl = (options: string[], path: string) => <div className="workflow-row">
    <label>Next status<select value={status} onChange={(event) => setStatus(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>
    <button className="primary-button" disabled={working || status === record.status} onClick={() => void post(path, { status })} type="button"><RefreshCw size={15} /> Apply transition</button>
  </div>;

  return (
    <section className="panel workflow-panel">
      <header><div><span className="kicker">Authorized operations</span><h2>Workflow actions</h2></div></header>
      {module === "leads" && statusControl(leadStages, `/api/leads/${encodeURIComponent(id)}/stage`)}
      {module === "quotes" && <>
        {statusControl(quoteStatuses, `/api/quotes/${encodeURIComponent(id)}/status`)}
        <button className="secondary-button" disabled={working || record.status !== "ACCEPTED"} onClick={() => void post(`/api/quotes/${encodeURIComponent(id)}/project`)} type="button">Convert accepted quote to project</button>
      </>}
      {(module === "projects" || module === "productions") && statusControl(projectStatuses, `/api/projects/${encodeURIComponent(id)}/transition`)}
      {module === "proposals" && <>
        <a className="secondary-button" href={`/api/proposals/${encodeURIComponent(id)}/pdf`}><Download size={15} /> Download PDF</a>
        {record.status !== "ACCEPTED" && <form className="workflow-form" action={(formData) => void post(`/api/proposals/${encodeURIComponent(id)}/accept`, { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? ""), accepted: true })}>
          <label>Authorized name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><button className="primary-button" disabled={working} type="submit"><Check size={15} /> Accept current version</button>
        </form>}
      </>}
      {module === "invoices" && <form className="workflow-form" action={(formData) => void post(`/api/invoices/${encodeURIComponent(id)}/payments`, {
        idempotencyKey: String(formData.get("idempotencyKey") ?? ""),
        provider: String(formData.get("provider") ?? ""),
        externalId: String(formData.get("externalId") ?? ""),
        amount: Number(formData.get("amount")),
        currency: String(record.currency ?? "USD"),
        status: "SUCCEEDED",
      })}>
        <label>Provider<input name="provider" required /></label><label>Provider confirmation ID<input name="externalId" required /></label><label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label><label>Idempotency key<input name="idempotencyKey" minLength={8} required /></label><button className="primary-button" disabled={working} type="submit">Reconcile confirmed payment</button>
      </form>}
      {!["leads", "quotes", "projects", "productions", "proposals", "invoices"].includes(module) && <p className="workflow-note">This record is managed through its parent project or dedicated service endpoint.</p>}
      {error && <div className="system-message error"><TriangleAlert size={16} />{error}</div>}
      {notice && <div className="system-message success"><Check size={16} />{notice}</div>}
    </section>
  );
}
