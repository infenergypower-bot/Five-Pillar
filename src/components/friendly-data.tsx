import Link from "next/link";

type FriendlyDataProps = {
  value: unknown;
  label?: string;
};

const hiddenKeys = new Set(["id", "clientId", "quoteId", "projectId", "organizationId", "questionnaireVersionId", "packageId"]);

export function humanLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function routeFor(label: string | undefined, id: unknown): string | null {
  if (typeof id !== "string") return null;
  const routes: Record<string, string> = {
    intakes: "intake",
    quotes: "quotes",
    proposals: "proposals",
    contracts: "contracts",
    projects: "projects",
    invoices: "invoices",
    subscriptions: "subscriptions",
  };
  const route = label ? routes[label] : undefined;
  return route ? `/${route}/${encodeURIComponent(id)}` : null;
}

function scalar(value: unknown, key?: string): string {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  if (typeof value === "string" && /^[A-Z][A-Z0-9_]*$/.test(value)) return humanLabel(value);
  if (typeof value === "number" || (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value))) {
    const number = Number(value);
    if (key && /(amount|budget|cost|price|subtotal|discount|profit|value|paid)$/i.test(key)) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number);
    }
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(number);
  }
  return String(value);
}

function titleFor(record: Record<string, unknown>, index: number): string {
  const title = record.title ?? record.projectTitle ?? record.displayName ?? record.businessName ??
    record.name ?? record.label ?? record.description ?? record.subject ?? record.email;
  if (typeof title === "string" && title) return title;
  if (typeof record.servicePath === "string") return `${humanLabel(record.servicePath)} discovery`;
  return `Item ${index + 1}`;
}

function ObjectFields({ value }: { value: Record<string, unknown> }) {
  const entries = Object.entries(value).filter(([key]) => !hiddenKeys.has(key));
  return <dl className="friendly-fields">{entries.map(([key, item]) => <div key={key}>
    <dt>{humanLabel(key)}</dt>
    <dd><FriendlyData label={key} value={item} /></dd>
  </div>)}</dl>;
}

export function FriendlyData({ value, label }: FriendlyDataProps) {
  if (Array.isArray(value)) {
    if (!value.length) return <span className="empty-value">None yet</span>;
    if (value.every((item) => item === null || typeof item !== "object")) {
      return <div className="friendly-tags">{value.map((item, index) => <span key={`${String(item)}-${index}`}>{scalar(item)}</span>)}</div>;
    }
    return <div className="friendly-cards">{value.map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return <span key={index}>{scalar(item)}</span>;
      const record = item as Record<string, unknown>;
      const href = routeFor(label, record.id);
      const content = <><strong>{titleFor(record, index)}</strong><ObjectFields value={record} /></>;
      return href
        ? <Link className="friendly-card linked" href={href} key={String(record.id ?? index)}>{content}<span className="friendly-link">Open {humanLabel(label ?? "record")} →</span></Link>
        : <article className="friendly-card" key={String(record.id ?? index)}>{content}</article>;
    })}</div>;
  }
  if (value && typeof value === "object") return <ObjectFields value={value as Record<string, unknown>} />;
  return <>{scalar(value, label)}</>;
}
