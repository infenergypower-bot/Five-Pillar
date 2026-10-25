"use client";

import { ArrowLeft, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FriendlyData, humanLabel } from "@/components/friendly-data";
import { WorkflowActions } from "@/components/workflow-actions";

type DetailRecord = Record<string, unknown>;
const hiddenKeys = new Set(["id", "clientId", "quoteId", "projectId", "organizationId", "questionnaireVersionId", "packageId"]);

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
        <header><div><span className="kicker">Saved and available across Pillar One</span><h2>{String(record.title ?? record.projectTitle ?? record.displayName ?? record.businessName ?? record.name ?? id)}</h2></div>{module === "proposals" && <a className="secondary-button" download href={`/api/proposals/${encodeURIComponent(id)}/pdf`}>Download PDF</a>}</header>
        <dl className="detail-grid">{Object.entries(record).filter(([key, value]) => !hiddenKeys.has(key) && !["passwordHash", "tokenHash", "secretCiphertext"].includes(key) && (value === null || typeof value !== "object")).map(([key, value]) => <div key={key}><dt>{humanLabel(key)}</dt><dd><FriendlyData label={key} value={value} /></dd></div>)}</dl>
      </section><WorkflowActions module={module} id={id} record={record} /></>}
      {record && Object.entries(record).filter(([key, value]) => !hiddenKeys.has(key) && value !== null && typeof value === "object").map(([key, value]) =>
        <section className="panel detail-section" key={key}><header><div><span className="kicker">Linked information</span><h2>{humanLabel(key)}</h2></div>{Array.isArray(value) && <span className="count-badge">{value.length}</span>}</header><FriendlyData label={key} value={value} /></section>
      )}
    </>
  );
}
