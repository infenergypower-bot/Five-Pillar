# Business research and growth intelligence

The internal **Business research** workspace is at `/business-research`. Create a profile from a business name and description; website and location are optional. Creation immediately queues five specialist profile agents when live research is configured. Each agent drafts every question in its pillar, distinguishing sourced facts, evidence-based inferences, and low-confidence best estimates. Private metrics receive a calculation and validation path instead of invented values. Manual editing and signoff are optional for handing a completed research draft to Tool 2. Choose the company in the selector to open the growth workspace; five specialist growth agents then analyze competitors, audience, brand, channels, and strategy.

The existing **Infenergy Power** profile receives a dated public research baseline automatically when it opens. This fills all 46 fields using Infenergy's About, catalog, product, comparison, and support pages while preserving any owner-approved answers. Private financials, customer behavior, demographics, and entertainment affinities are clearly marked provisional with a way to validate them. The baseline works without an API key; live refresh and the growth audit still require one.

## Configuration and operation

Set `OPENAI_API_KEY` in the server environment. `OPENAI_RESEARCH_MODEL` defaults to `gpt-6.2-astra`. This implementation calls the OpenAI Responses API with web search and background mode. Each run launches five independent web research responses. These calls incur API and web-search costs. Research cannot start without the API key, and public `DEMO_MODE` blocks paid research. The app permits at most eight runs per organization per UTC day.

The app UI advances active runs while the profile page is open. For durable unattended progress, schedule an authenticated POST to `/api/jobs/research` every minute with the existing `JOB_RUNNER_SECRET` header convention used by `/api/jobs/integrations`. The route processes at most two runs per call by default. Responses, task states, citations, and results are stored in PostgreSQL; restarting the app does not erase a run. A stalled lease can be resumed after 90 seconds.

Run `prisma migrate deploy` and `prisma generate` during deployment. No book PDFs, raw index text, or private Drive IDs are committed to this public repository. The nine curated methods in `src/lib/research/books.ts` carry titles and PDF page numbers; they are methodological prompts, never evidence that a particular client has a problem. Set `PRIVATE_BOOK_LINKS_JSON` to a server-only JSON map from method key to private PDF URL if operators need clickable links. The full 24-book private index is maintained separately.

## Evidence and review

Research agents return structured findings with source URLs. The server accepts URLs only when the provider reports those pages among its web-search sources. Unsupported findings are downgraded to hypotheses. Staff may edit and approve answers before external delivery. A completed research draft with meaningful answers can proceed to the audit without manual questionnaire approval. Public research cannot establish actual private financials or customer behavior; provisional answers are labeled and include a validation path.

Growth opportunities require at least one source-linked competitor or market finding. All begin as drafts, with unscored impact, effort, uncertainty, and ROI; staff can approve or reject them. The profile and audit can be exported as JSON. All routes require an authenticated internal CRM role and organization scope; client portal roles cannot access this workspace.

This is a research workflow, not a guarantee of success. Validate source quality, market fit, segment claims, rights, and test results before client delivery. Cultural or entertainment affinities require direct segment-specific evidence; unsupported preferences stay unknown.

