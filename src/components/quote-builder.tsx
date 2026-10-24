"use client";

import Decimal from "decimal.js";
import { ArrowLeft, Check, CircleAlert, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const roles = [
  { activity: "Discovery & strategy", role: "Founder", hours: 4, rate: 75 },
  { activity: "Concept & script", role: "Creative Director", hours: 7, rate: 68 },
  { activity: "Production & prompting", role: "AI Production", hours: 14, rate: 55 },
  { activity: "Editing & sound", role: "Editor", hours: 10, rate: 52 },
  { activity: "Project management", role: "Producer", hours: 5, rate: 48 },
];

function money(value: Decimal) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value.toNumber());
}

export function QuoteBuilder() {
  const [projectTitle, setProjectTitle] = useState("New production");
  const [clientId, setClientId] = useState("");
  const [servicePath, setServicePath] = useState("VISUAL_PRODUCTION");
  const [price, setPrice] = useState(2995);
  const [aiCost, setAiCost] = useState(420);
  const [thirdParty, setThirdParty] = useState(180);
  const [overhead, setOverhead] = useState(12);
  const [contingency, setContingency] = useState(10);
  const [quoteId, setQuoteId] = useState("");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const result = useMemo(() => {
    const labor = roles.reduce((sum, line) => sum.plus(new Decimal(line.hours).times(line.rate)), new Decimal(0));
    const direct = new Decimal(aiCost).plus(thirdParty);
    const overheadValue = labor.plus(direct).times(new Decimal(overhead).div(100));
    const preContingency = labor.plus(direct).plus(overheadValue);
    const contingencyValue = preContingency.times(new Decimal(contingency).div(100));
    const cost = preContingency.plus(contingencyValue);
    const selling = new Decimal(price);
    const profit = selling.minus(cost);
    const margin = selling.gt(0) ? profit.div(selling).times(100) : new Decimal(0);
    return { labor, direct, overheadValue, contingencyValue, cost, profit, margin };
  }, [aiCost, contingency, overhead, price, thirdParty]);

  const belowMinimum = result.margin.lt(50);

  async function saveDraft(): Promise<string> {
    setWorking(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          ...(clientId.trim() ? { clientId: clientId.trim() } : {}),
          projectTitle,
          servicePath,
          currency: "USD",
          pricing: {
            laborSubtotal: result.labor.toNumber(),
            nonLaborSubtotal: result.direct.toNumber(),
            overhead: result.overheadValue.toNumber(),
            contingency: result.contingencyValue.toNumber(),
            allInCost: result.cost.toNumber(),
            subtotal: price,
            discount: 0,
            finalPrice: price,
            targetMargin: 0.55,
            operatingProfit: result.profit.toNumber(),
            operatingMargin: result.margin.div(100).toNumber(),
            minimumPrice: result.cost.div(0.5).toDecimalPlaces(2).toNumber(),
            recommendedPrice: result.cost.div(0.45).toDecimalPlaces(2).toNumber(),
            premiumPrice: result.cost.div(0.4).toDecimalPlaces(2).toNumber(),
          },
          lines: [
            ...roles.map((line, index) => ({
              category: "LABOR",
              description: `${line.activity} — ${line.role}`,
              quantity: line.hours,
              unitCost: line.rate,
              internalOnly: true,
              servicePath,
              sortOrder: index,
            })),
            { category: "AI_PRODUCTION", description: "AI generation allowance", quantity: 1, unitCost: aiCost, internalOnly: true, servicePath, sortOrder: 10 },
            { category: "THIRD_PARTY", description: "Third-party production expenses", quantity: 1, unitCost: thirdParty, internalOnly: true, servicePath, sortOrder: 11 },
            { category: "CLIENT_SCOPE", description: projectTitle, quantity: 1, unitCost: result.cost.toNumber(), clientUnitPrice: price, internalOnly: false, servicePath, sortOrder: 20 },
          ],
        }),
      });
      const body = await response.json() as { data?: { id?: string }; error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? `Save failed with HTTP ${response.status}.`);
      const savedId = body.data?.id;
      if (!savedId) throw new Error("The quote was saved without returning its identifier.");
      setQuoteId(savedId);
      setNotice("Draft quote saved.");
      return savedId;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to save the quote.";
      setError(message);
      throw cause;
    } finally {
      setWorking(false);
    }
  }

  async function requestApproval() {
    try {
      const id = quoteId || await saveDraft();
      setWorking(true);
      const response = await fetch(`/api/quotes/${encodeURIComponent(id)}/status`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ status: "INTERNAL_REVIEW" }),
      });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? `Approval request failed with HTTP ${response.status}.`);
      setNotice("Quote submitted for internal review.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request approval.");
    } finally {
      setWorking(false);
    }
  }

  async function generateProposal() {
    try {
      const id = quoteId || await saveDraft();
      setWorking(true);
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ quoteId: id, templateKey: servicePath.toLowerCase() }),
      });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? `Proposal generation failed with HTTP ${response.status}.`);
      setNotice("Client-safe proposal generated as a draft.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to generate the proposal.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="quote-page">
      <div className="quote-heading">
        <div><Link href="/quotes"><ArrowLeft size={16} /> Quotes</Link><h1>{projectTitle}</h1><p>{quoteId ? `Saved draft · ${quoteId}` : "Unsaved draft"}</p></div>
        <div><button className="secondary-button" disabled={working} onClick={() => void saveDraft().catch(() => undefined)} type="button"><Save size={16} /> Save draft</button><button className="primary-button" disabled={working || belowMinimum} onClick={() => void requestApproval()} type="button">Request approval</button></div>
      </div>
      {error && <div className="system-message error"><CircleAlert size={17} />{error}</div>}
      {notice && <div className="system-message success"><Check size={17} />{notice}</div>}
      <div className="quote-layout">
        <section className="quote-column">
          <div className="quote-card"><span className="kicker">01 · Configuration</span><h2>Project scope</h2>
            <label>Project title<input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} /></label>
            <label>Client ID <small>Optional for internally sponsored work</small><input value={clientId} onChange={(event) => setClientId(event.target.value)} /></label>
            <label>Service path<select value={servicePath} onChange={(event) => setServicePath(event.target.value)}><option value="VISUAL_PRODUCTION">Standalone visual production</option><option value="MANAGED_MARKETING">Managed marketing</option><option value="COMBINED">Combined production + marketing</option><option value="ORIGINAL_ENTERTAINMENT">Original entertainment</option><option value="CUSTOM">Custom</option></select></label>
            <div className="two-fields"><label>Deliverables<input defaultValue="1 master + 3 cutdowns" /></label><label>Deadline<input type="date" /></label></div>
            <label>Creative scope<textarea defaultValue="Cinematic launch film featuring the NX-4 warehouse robot, with narration and three platform cutdowns." /></label>
          </div>
          <div className="quote-card"><span className="kicker">02 · Labor</span><h2>Production estimate</h2>
            <div className="labor-grid labor-head"><span>Activity</span><span>Role</span><span>Hours</span><span>Cost</span></div>
            {roles.map((line) => <div className="labor-grid" key={line.activity}><strong>{line.activity}</strong><span>{line.role}</span><span>{line.hours}</span><span>${line.hours * line.rate}</span></div>)}
            <button className="text-button"><Plus size={15} /> Add labor line</button>
          </div>
        </section>
        <section className="quote-column">
          <div className="quote-card"><span className="kicker">03 · Production costs</span><h2>Direct & allocated costs</h2>
            <label>OpenArt / AI generation<input type="number" value={aiCost} onChange={(e) => setAiCost(Number(e.target.value))} /></label>
            <label>Third-party expenses<input type="number" value={thirdParty} onChange={(e) => setThirdParty(Number(e.target.value))} /></label>
            <div className="two-fields"><label>Overhead %<input type="number" value={overhead} onChange={(e) => setOverhead(Number(e.target.value))} /></label><label>Contingency %<input type="number" value={contingency} onChange={(e) => setContingency(Number(e.target.value))} /></label></div>
          </div>
          <div className="quote-card scope-check"><span className="kicker">Scope safeguards</span><h2>Readiness check</h2>
            <p><Check size={16} /> Creative brief approved</p><p><Check size={16} /> Product references received</p><p><Check size={16} /> Usage rights documented</p><p className="pending"><CircleAlert size={16} /> Voice direction needs confirmation</p>
          </div>
        </section>
        <aside className="pricing-card">
          <span className="kicker">Live profitability</span><h2>Price & margin</h2>
          <label>Client investment<div className="price-input"><span>$</span><input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div></label>
          <div className={`margin-orb ${belowMinimum ? "danger" : ""}`}><strong>{result.margin.toFixed(1)}%</strong><span>operating margin</span></div>
          {belowMinimum && <div className="margin-warning"><CircleAlert size={17} /><span><strong>Below 50% minimum</strong>Authorized exception or revised scope required.</span></div>}
          <dl>
            <div><dt>Labor</dt><dd>{money(result.labor)}</dd></div><div><dt>Direct costs</dt><dd>{money(result.direct)}</dd></div>
            <div><dt>Allocated overhead</dt><dd>{money(result.overheadValue)}</dd></div><div><dt>Contingency</dt><dd>{money(result.contingencyValue)}</dd></div>
            <div className="total"><dt>All-in cost</dt><dd>{money(result.cost)}</dd></div><div className="profit"><dt>Expected profit</dt><dd>{money(result.profit)}</dd></div>
          </dl>
          <div className="targets"><p><span>Minimum · 50%</span><strong>{money(result.cost.div(0.5))}</strong></p><p><span>Recommended · 55%</span><strong>{money(result.cost.div(0.45))}</strong></p><p><span>Premium · 60%</span><strong>{money(result.cost.div(0.4))}</strong></p></div>
          <button className="primary-button wide" disabled={belowMinimum || working} onClick={() => void generateProposal()} type="button">Generate proposal</button>
          <small>Internal costs and margins never appear in the client proposal.</small>
        </aside>
      </div>
    </div>
  );
}
