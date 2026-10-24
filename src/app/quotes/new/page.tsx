import { AppShell } from "@/components/app-shell";
import { QuoteBuilder } from "@/components/quote-builder";

export default function NewQuotePage() {
  return (
    <AppShell title="Quote builder" eyebrow="Commercial operations">
      <QuoteBuilder />
    </AppShell>
  );
}
