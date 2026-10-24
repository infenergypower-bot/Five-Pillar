"use client";

import { ArrowLeft, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkflowActions } from "@/components/workflow-actions";

type DetailRecord = Record<string, unknown>;

function printable(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return String(value);
}

export function RecordDetail({ module, id, title }: { module: string; id: string; title: string }) {
  const [record, setRecord] = useState<DetailRecord>();
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${module}/${encodeURIComponent(id)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json() as { data?: DetailRecord; error?: string } & DetailRecord;
        if (!response.ok) throw new Error(body.error ?? `Request failed with HTTP ${response.status}.`);
        setRecord(body.data ?? body);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Unable to load the record.");
      });
    return () => controller.abort();
  }, [id, module]);

  return (
    <>
      <Link className="back-link" href={`/${module}`}><ArrowLeft size={15} /> Back to {title}</Link>
      {error && <div className="system-message error"><TriangleAlert size={18} />{error}</div>}
      {!record && !error && <div className="dashboard-loading"><LoaderCircle className="spin" /><span>Loading authorized record</span></div>}
      {record && <><section className="panel detail-panel">
        <header><div><span className="kicker">Persisted record</span><h2>{String(record.title ?? record.displayName ?? record.businessName ?? record.name ?? id)}</h2></div></header>
        <dl className="detail-grid">{Object.entries(record).filter(([key]) => !["passwordHash", "tokenHash", "secretCiphertext"].includes(key)).map(([key, value]) => <div key={key}><dt>{key.replaceAll(/([A-Z])/g, " $1")}</dt><dd className={typeof value === "object" ? "structured-value" : ""}>{printable(value)}</dd></div>)}</dl>
      </section><WorkflowActions module={module} id={id} record={record} /></>}
    </>
  );
}
