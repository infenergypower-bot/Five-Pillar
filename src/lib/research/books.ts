/** Internal method references. PDF page numbers, not printed page numbers.
 * Source PDFs are private and must not be copied into this public repository.
 */
export const bookMethods = [
  { key: "discovery", title: "Jay Abraham Consult Form / Monster Questionnaire", pages: [38], use: "Offer, complementary purchases, customer benefits, differentiation" },
  { key: "positioning", title: "Jay Abraham PEQ Transcript", pages: [520], use: "Buyer reason to choose the business" },
  { key: "unitEconomics", title: "Powerful Selling", pages: [115, 130], use: "Repeat purchasing, margin, relationship value" },
  { key: "metrics", title: "The Big Book of Key Performance Indicators", pages: [20, 62, 72], use: "Decision-ready funnel metrics" },
  { key: "referrals", title: "93 Referral Systems", pages: [7, 20], use: "Structured customer referral asks" },
  { key: "lifecycle", title: "Invisible Selling Machine", pages: [34, 83], use: "Consent-based lifecycle follow-up" },
  { key: "partnerships", title: "Jay Abraham PEQ Transcript", pages: [88, 89], use: "Complementary partner channels" },
  { key: "sales", title: "Powerful Selling", pages: [536, 581, 678], use: "Needs, objections, post-sale service" },
  { key: "noncustomers", title: "Blue Ocean Strategy", pages: [24, 61, 62], use: "Overlooked nonbuyers and value innovation" },
] as const;

export function methodRef(key: string) {
  const method = bookMethods.find(x => x.key === key);
  if (!method) return [];
  let links: Record<string, string> = {};
  try { links = JSON.parse(process.env.PRIVATE_BOOK_LINKS_JSON || "{}"); } catch { /* References remain page-addressable without links. */ }
  const url = links[key];
  return [{ title: method.title, url: typeof url === "string" && url.startsWith("https://") ? url : "", pages: [...method.pages] }];
}
