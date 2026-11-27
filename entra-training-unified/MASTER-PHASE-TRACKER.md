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


### Phase 1 checkpoint — 2026-11-27, second pass

**Status: IN PROGRESS. Do not advance to Phase 2.**

- Complete pinned Git tree enumeration for all 15 repositories succeeded, with 168,509 file/submodule entries, no retrieval failures at the inventory level, and 944/944 previous screen records reconciled. The complete Microsoft Learn and Microsoft Graph inventories are now included, not merely selected subtrees. Compressed exact inventory retained in the local checkout at `Documents/IdentityAcademy-Phase1/entra-training-unified/phase1-full-inventory.tsv.gz`; reproduce from the pinned inventory script if needed, [summary and hash](phase1-inventory-summary.json), [reproducible inventory script](phase1-inventory.py). Filename screening is not technical review: 37,892 priority candidates, 129,626 unresolved relevance records, 896 previously screened but unresolved records, one unresolved submodule, 39 policy/license references, and 55 explicit repository-maintenance exclusions. The archive is a local evidence artifact, not a learner download requirement; the desktop GitHub credential could not push the binary archive. The source-control summary contains the SHA-256 of its uncompressed content.
- Four official SC-300 lab Markdown bodies were retrieved from the pinned repository and reviewed: Lab 13 (Conditional Access), Lab 21 (tenant-wide admin consent), Lab 22 (catalog management), and Lab 25 (access reviews). Current Microsoft guidance was cross-checked. [Source-specific decisions and exercises](phase1-lab-qualification-batch.json). Superseded unsafe or overly broad prerequisites and role assumptions; taught report-only versus enforcement, delegated versus application grants, catalog membership versus package assignments, and group reviews versus PIM role reviews. Four adaptations are inserted in the existing policy, apps and governance chapters; referenced screenshot pixels, detailed operation-level validation and real tenant execution remain unverified.
- Live 7.1 unified built-in audit rerun in isolated Edge: 1,770 passed, zero failed and zero browser errors. [Live result](phase1-browser-regression.json). This is the built-in unified audit, not every historical QA suite or an actual tenant test.
- Patched local JavaScript tested via interception of the existing live script in isolated Edge: 1,771 passed, zero failed, zero browser errors; all four new chapter sections render. [Patched regression](phase1-patched-browser-regression.json). This is not production deployment confirmation.
- Remaining: qualify the full candidate inventory semantically and classify all unresolved entries, retrieve and review all in-scope source bodies including scripts, answer keys and linked media, validate operation-level prerequisites and current licenses, reconcile duplicates, integrate all accepted concepts, verify the source-to-lesson crosswalk and all regression suites, and confirm production release. Inventory closure alone does not satisfy Phase 1.
- No Microsoft tenant resources, trials, subscriptions or paid add-ons created. Existing local learner progress is untouched; isolated browser profiles were used.

**Exact next action:** begin with the remaining 25 official SC-300 lab text bodies and their linked assets, then the full pinned Learn/Graph/Entra candidate backlog. Record evidence and decision per file; use semantic triage for nonidentity areas rather than treating filename matches as qualification. Retain Phase 1 until no in-scope item remains unresolved.

### Release 7.2 production verification — 2026-11-27

- GitHub curriculum commit `4da439e448094d128c2e35f31178da3522f96e12` deployed to the existing Entra Console Site Railway Function. Deployment `ae2eb4b1-47be-4a91-9adb-273bf1569561` reported SUCCESS. No new service or paid feature activated.
- Full production `/qa-unified` endpoint returned HTTP 200; **3,734 passed, 0 failed, including 1,963 interaction checks**. [Full regression evidence](phase1-release72-full-regression.json). This covers source/simulated render and interactions, not actual Microsoft tenant competency.
- Separate isolated live Edge session verified script version 7.2, HTTP 200, all four lab sections visible, 1,771 built-in checks passed, zero failed and zero JavaScript errors. [Live browser evidence](phase1-release72-live-browser.json).
- Built-in unified regression gap is closed for release 7.2. Exhaustive file-level source qualification, linked media review, operation-level prerequisites, full crosswalk and accepted learning integration remain open. Retain Phase 1; do not mark Phase 2 started. Next action is unchanged.

### Phase 1 checkpoint — all official SC-300 laboratory topic adaptations (2026-11-27)

**Phase 1 remains open.** All 29 pinned lab bodies retrieved and all 29 now have source decision, prerequisites, mechanism, independent scenario, verification and guidance links in ordered chapters, lab cards and qualification register. Some long bodies were condensed for topic review. Source-specific corrections include legacy MFA/SSPR settings, shared passwords, overscoped invitations, unsafe RDP configuration, unnecessary paid provisioning, Key Vault access policy privilege, and governed guest removal. See [all lab adaptations](phase1-lab-qualification-batch.json) and [pinned lab/media inventory](phase1-sc300-source-manifest.json), including 93 media files. Individual operation validation, media pixels, and full reference validation still open. This is not certification of all upstream procedures. No actual tenant changes.

The larger Learn/Graph/Entra and remaining repository semantic qualification, deduplication, licensing review, and complete crosswalk remain unresolved; do not advance to Phase 2. New regression and deployment must be verified.

### Phase 1 checkpoint — source evidence, release 7.3 regression and strict acceptance gate (2026-11-27)

**OPEN. Phase 2 is not authorized to advance until every acceptance criterion is satisfied.** No partial phase may be certified complete. Existing learner materials are preserved rather than removed.

- [Exact retrieval evidence](phase1-sc300-retrieval-evidence.json): all 29 lab bodies and 93 available PNGs matched pinned Git blob hashes; 1,070 numbered lines, 37 fenced blocks and 77 image references (75 present, two absent). Retrieval is not technical approval.
- [Visual qualification](phase1-sc300-visual-qualification.json): all 93 PNGs inspected at contact-sheet resolution; 64 historical reference-only, 29 superseded. Two absent Lab 15 assets superseded by current textual instruction, not fabricated screenshots. Every disposition is mapped to a lab; not full-resolution validation of every label.
- [Code qualification](phase1-sc300-code-qualification.json): all 37 fenced blocks individually reviewed; 3 read-only concepts accepted, 17 adapted, 2 unnecessary and 4 unsafe excluded, 5 reference-only, 1 external link not qualified, and 5 superseded. No commands executed against real resources. Technical and licensing validation for every operation and external linked code is still open.
- All 29 lab adaptations shipped in release 7.3: [full regression](phase1-release73-full-regression.json) 3,734 checks passed, 0 failed, including 1,963 simulated interaction checks; [isolated live Edge](phase1-release73-live-browser.json) verified 1,771 built-in checks, all 29 lab sections visible, practice and answer visible, all card mappings correct, 0 page errors.
- New acceptance gate [machine-readable status](phase1-acceptance-gate.json) exposes outstanding criteria on the execution register. New lesson evidence displays visual and code dispositions beside each source-specific lab. This gate governs certification and phase advancement, not existing learner navigation. Phase 1 remains open because semantic classification, current technical/license validation and deduplicated lesson integration across all 15 repositories remain incomplete. Full final Phase 1 regression can only be certified after these are resolved. No paid resource or actual tenant change.
