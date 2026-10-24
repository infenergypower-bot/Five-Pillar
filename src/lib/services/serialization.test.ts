import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { serializeForClient, stripInternalEconomics } from "./serialization";

describe("client-safe serialization", () => {
  it("serializes BigInt, Decimal, dates, arrays, and nested values", () => {
    const timestamp = new Date("2026-10-24T12:00:00.000Z");
    expect(serializeForClient({
      bytes: BigInt(42),
      amount: new Prisma.Decimal("19.9900"),
      timestamp,
      nested: [BigInt(1), new Prisma.Decimal("2.5")],
    })).toEqual({
      bytes: "42",
      amount: "19.99",
      timestamp: timestamp.toISOString(),
      nested: ["1", "2.5"],
    });
  });

  it("removes internal economics recursively from client-role payloads", () => {
    expect(stripInternalEconomics({
      total: "5000",
      finalPrice: "5000",
      allInCost: "2000",
      versions: [{ operatingMargin: "0.6", scope: "public" }],
    })).toEqual({
      total: "5000",
      finalPrice: "5000",
      versions: [{ scope: "public" }],
    });
  });
});
