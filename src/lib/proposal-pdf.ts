import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface ClientProposalDocument {
  proposalNumber: string;
  clientName: string;
  projectTitle: string;
  overview: string;
  scope: string[];
  deliverables: string[];
  timeline: string;
  revisionPolicy: string;
  paymentSchedule: string[];
  usageRights: string;
  exclusions: string[];
  totalInvestment: string;
  currency: string;
  expiresAt?: Date;
  nextSteps: string;
}

const forbiddenKeys = /(?:^|_)(?:unit)?cost|margin|profit|creditEconomics|hourlyRate/i;

export function assertClientSafe(value: unknown, path = "proposal"): void {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenKeys.test(key)) throw new Error(`Client proposal contains forbidden internal field at ${path}.${key}.`);
    assertClientSafe(nested, `${path}.${key}`);
  }
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.replaceAll(/\s+/g, " ").trim().split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function renderProposalPdf(input: ClientProposalDocument): Promise<Uint8Array> {
  assertClientSafe(input);
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRomanBold);
  const pageSize: [number, number] = [612, 792];
  const margin = 54;
  const contentWidth = pageSize[0] - margin * 2;
  let page: PDFPage;
  let y: number;

  const addPage = () => {
    page = document.addPage(pageSize);
    y = pageSize[1] - margin;
    page.drawText("FIVE PILLAR TECH VENTURES", { x: margin, y, size: 9, font: bold, color: rgb(0.15, 0.42, 0.4) });
    page.drawText(input.proposalNumber, { x: pageSize[0] - margin - regular.widthOfTextAtSize(input.proposalNumber, 8), y, size: 8, font: regular, color: rgb(0.35, 0.38, 0.37) });
    y -= 30;
  };

  const ensure = (height: number) => {
    if (y - height < margin) addPage();
  };

  const paragraph = (text: string, options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const size = options.size ?? 10;
    const selectedFont = options.font ?? regular;
    const lineHeight = size * 1.45;
    const lines = wrap(text, selectedFont, size, contentWidth);
    ensure(lines.length * lineHeight + (options.gap ?? 10));
    for (const line of lines) {
      page.drawText(line, { x: margin, y, size, font: selectedFont, color: options.color ?? rgb(0.12, 0.14, 0.14) });
      y -= lineHeight;
    }
    y -= options.gap ?? 10;
  };

  const heading = (text: string) => {
    ensure(38);
    y -= 5;
    page.drawText(text.toUpperCase(), { x: margin, y, size: 9, font: bold, color: rgb(0.62, 0.47, 0.2) });
    y -= 21;
  };

  const list = (items: string[]) => {
    for (const item of items) paragraph(`- ${item}`, { size: 9, gap: 3 });
    y -= 6;
  };

  addPage();
  paragraph(input.projectTitle, { size: 28, font: serif, gap: 7 });
  paragraph(`Prepared for ${input.clientName}`, { size: 12, font: bold, color: rgb(0.15, 0.42, 0.4), gap: 20 });
  paragraph(input.overview, { size: 10, gap: 15 });

  heading("Scope of services");
  list(input.scope);
  heading("Deliverables");
  list(input.deliverables);
  heading("Timeline");
  paragraph(input.timeline);
  heading("Revision policy");
  paragraph(input.revisionPolicy);
  heading("Payment schedule");
  list(input.paymentSchedule);
  heading("Usage rights");
  paragraph(input.usageRights);
  heading("Assumptions and exclusions");
  list(input.exclusions);
  heading("Client investment");
  paragraph(`${input.totalInvestment} ${input.currency}`, { size: 20, font: serif, color: rgb(0.15, 0.42, 0.4), gap: 10 });
  if (input.expiresAt) paragraph(`This proposal expires ${input.expiresAt.toLocaleDateString("en-US", { timeZone: "UTC" })}.`, { size: 9 });
  heading("Next steps");
  paragraph(input.nextSteps);

  document.setTitle(`${input.projectTitle} - Proposal`);
  document.setAuthor("Five Pillar Tech Ventures");
  document.setSubject("Client proposal");
  document.setCreator("Pillar One");
  return document.save();
}
