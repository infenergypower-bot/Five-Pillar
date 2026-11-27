# Microsoft Identity Architect Academy — master phase tracker

Saved 2026-11-27. User-directed execution: finish one phase and verify against its acceptance criteria before advancing. Report next phase only after current phase passes; keep unfinished work explicit. Primary SC-300, supporting SC-900 and SC-100. Preserve unified sequence, local progress and existing cost structure. No trials, paid resources, or unauthorized tenant changes. Phase numbers are stable; actual tenant demonstration (7) depends on authorization and may be scheduled after software phases.

## Phase 1 — Repository research and content qualification

**Status:** IN PROGRESS

**Acceptance criteria:** Enumerate pinned upstream inventories (including previously truncated Learn/Graph); classify all files as in scope, excluded or unresolved; retrieve relevant docs/code/scripts/labs/keys/decks/notes/assets; deduplicate; check current official guidance, supported APIs, portal procedures, licensing, permissions and costs; document accept/adapt/exclude/supersede decisions with citations; integrate accepted concepts in sequence; verify source-to-lesson traceability.

## Phase 2 — Exhaustive vocabulary and granular technical understanding

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Audit all lessons, guides, labs, questions, simulators, commands, parameters, queries, endpoints, JSON and fields. Teach what/why/when/where/how/who/input/output/dependencies/failure/verification/micro/macro; contrast related concepts, examples, diagrams and errors; contextual first-use definitions and mastery exercises.

## Phase 3 — Instructional completeness and learning sequence

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Audit 18 stages and prerequisites; remove gaps; build internal mechanisms, visual flows, worked examples, guided then independent practice, troubleshooting, written explanation, mastery gates, cumulative review, spaced retrieval and targeted remediation.

## Phase 4 — High-fidelity practice environments

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Complete Windows Server, networking, AD DS, Kerberos, Entra, hybrid sync, authentication, CA, risk, SAML/OIDC/SCIM, app registration, managed identities, GSA, governance, PIM, reviews, terms, Defender for Cloud Apps, Sentinel, Graph, PowerShell, KQL and agent identity models. Test state, errors, logs, recovery and cleanup.

## Phase 5 — Official Microsoft laboratory reproduction

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Review 29 labs, 179 headings, 1070 numbered lines and nonnumbered text/images/tables; map each operation; implement safe reproducible operations with starting state, prerequisites, grading, positive/negative tests, cleanup and guided/independent modes; explicitly identify external requirements.

## Phase 6 — Certification preparation

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Verify current SC-900/SC-300/SC-100 objectives and crosswalks; proposed original banks 250/500/500; mixed response types, log/config cases, independent timed forms, randomized order, all distractor rationales, objective analytics and remediation; verify content accuracy and first attempts.

## Phase 7 — Actual Microsoft tenant competency

**Status:** BLOCKED for actual execution; pathway exists

**Acceptance criteria:** Build and validate authorization/preflight, guided and independent real operations, negative tests, incident handling, recovery and assessor evidence. Actual learner execution requires an approved tenant, existing licenses and permissions; never fabricate or activate paid resources.

## Phase 8 — Enterprise architecture capstone projects

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Ten projects: company infrastructure, hybrid, M365 security, external collaboration, enterprise app, privilege, incident, Zero Trust, AI workload, modernization. Requirements, architecture diagrams, implementation, troubleshooting, independent assessment, measurable acceptance.

## Phase 9 — Learning platform functionality

**Status:** NOT STARTED — prior partial implementation exists

**Acceptance criteria:** Verify navigation, prerequisite progression, objective/vocabulary/lab mastery, readiness and tenant dashboards, personalized remediation, search/bookmarks/notes/resume/review, export/restore, portfolio download, source dashboard, tablet/mobile/accessibility/performance/link/browser/storage.

## Phase 10 — Final QA and verification

**Status:** NOT STARTED — earlier release tests exist

**Acceptance criteria:** Verify source qualification, vocabulary, prerequisites, exam coverage, reproducible labs, state transitions, scoring, navigation, persistence, backup, security, costs, production and genuine competency. Record tests and outstanding external blockers; do not equate software tests with competency.

## Baseline at start

Version 7.0 index served; health HTTP 200; complete QA request timed out. Prior verified v6.9: 3,727 unified automated checks. 944 source files screened, 481 integrated versioned text docs, 29 lab topic decisions, 227 glossary entries in v7 source. Screening is not manual qualification. Next action: Phase 1 only.

## Phase 1 execution log

- 2026-11-27: tracker created. Scope is all useful identity/architecture training content in the 15 pinned repositories; irrelevant files must be explicitly classified, not indiscriminately taught. No claim of exhaustive manual qualification until independently verified.

### Phase 1 checkpoint — 2026-11-27, release 7.1

**Status: IN PROGRESS. Do not advance to Phase 2.**

- Recovered nontruncated trees for Microsoft Learn `learn-pr/wwl-sci` (5,988 entries including directories) and `learn-pr/wwl-windows-server` (716 entries including directories) at pin `4103ffa93b8effc15a86bd5106c876ed324c4b20`. Root and learn-pr directory inventories recovered; entire Learn repository remains unenumerated.
- Recovered complete Graph API and resource subtrees at pin `951930b591f9248117793f036e0b13cb779769d1`: v1.0 API 3,974 files; v1.0 resources 3,392; beta API 8,425; beta resources 6,709. Total 22,500 files in these four nontruncated subtrees. Initial filename-prefix filter found 513, 276, 640, and 324 candidates respectively (1,753 total); other Graph trees, alternate names, embedded examples and semantic relevance remain unresolved. This is an inventory, not source qualification.
- Retrieved 39 additional pinned Microsoft Learn text documents, 16 external identities, 10 entitlement management, 8 AI identity and 5 Defender XDR AI-agent risk. Manifest: [phase1-learn-expansion.json](phase1-learn-expansion.json). Full content retrieved; headings and opening passages inspected; topic-level validation against current official docs. Placeholders and linked demos reference-only; embedded assets and per-line review pending.
- Added four original learning adaptations to the existing Users, Governance, Apps and Operations chapters. Corrected legacy governance delegation, distinguished resource grants from redemption and Foundry identity/key flows, and gated preview/paid Defender features. Current Microsoft references linked inside each lesson. No resources activated.
- Curriculum commit `2eb9657914518f5d0a89f5382c91190ff8dac654` deployed as 7.1. Live isolated browser confirmed all four lessons render, 39 source references mapped, master tracker link present, two new audit checks pass and zero page errors. Existing full regression suite has not been reconfirmed after v7.0 timeout.
- **Next Phase 1 work:** persist and classify full subtree candidate inventories; retrieve remaining relevant Learn, Graph and Entra documents in batches; review actual technical bodies and linked media, not only headings; review applicable licenses and current official evidence per operation; reconcile prior 944 screened records with the new source inventory; create deduplicated file-level qualification decisions, source-to-concept-to-lesson mapping and integrated teaching; verify all accepted material and exclusions. Confirm full regression suite. Phase 1 acceptance requires no unresolved in-scope items; do not mark complete based on counts or regex screening.

**Next phase after Phase 1 acceptance:** Phase 2 — exhaustive vocabulary and granular technical understanding. It has not been started as a new phase.
