export function serializeForClient(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeForClient);
  if (value && typeof value === "object") {
    if ("toDecimalPlaces" in value && "toSignificantDigits" in value && "toString" in value) {
      return (value as { toString(): string }).toString();
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeForClient(item)]));
  }
  return value;
}

const internalKey = /(cost|margin|profit|overhead|economics|internal|password|secret|tokenhash)/i;

export function stripInternalEconomics(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripInternalEconomics);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("toDecimalPlaces" in value && "toSignificantDigits" in value) return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !internalKey.test(key))
        .map(([key, item]) => [key, stripInternalEconomics(item)]),
    );
  }
  return value;
}
