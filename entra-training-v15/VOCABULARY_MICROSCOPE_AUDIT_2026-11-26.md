# Identity Architect Academy — Vocabulary Microscope V15

**Date:** 2026-11-26  
**Live learning home:** https://entra-console-site-production.up.railway.app/#/v14/path  
**Vocabulary microscope:** https://entra-console-site-production.up.railway.app/#/v15/vocabulary  
**13 interactive micro-to-macro stories:** https://entra-console-site-production.up.railway.app/#/v15/systems  
**In-browser vocabulary QA:** https://entra-console-site-production.up.railway.app/qa-vocabulary.html  
**Training branch:** `training-entra-v6-exam-20261126`  
**Certification completeness:** NOT COMPLETE; this release improves instruction, not official exam coverage.

## User learning complaint addressed

Prior V8 lessons had an approximately six-term one-line glossary per SC-300 domain and used terms like `UPN`, `MFA`, `OIDC`, `SCIM` and `PIM` before fully defining their constituent concepts. Clicking a simple definition was not enough to understand its operational reason, microscopic implementation and system-wide consequences.

V15 adds a **157-term curated original glossary**:
- 26 zero-assumption computer, web, networking, API, JSON and cryptography building blocks;
- 32 directory/identity concepts;
- 32 authentication, passwordless and Conditional Access concepts;
- 32 application, service principal, workload and Graph concepts;
- 35 governance, B2B, NIST assurance and investigation concepts.

Every term explicitly contains **what it is, what it does, why it exists, when to use it, how to work with it, smallest-level mechanism, organizational role, and a concrete failure/misconception**. There is also a separate full-name expansion for key acronyms and 17 compare-and-contrast pairs.

## Interactive instruction

- **15 field-by-field anatomy exercises** explain the real-looking structure of UPNs, object IDs, groups, directory RBAC, MFA, passkeys, Conditional Access policy fields, JWT structures, access token claims, app registration identifiers, managed identities, guest access, packages and KQL. No real secrets or production credentials are used.
- **13 interactive system stories** connect individual technical terms into meaningful workflows. The new beginner's flow traces **16 steps** from a computer button click and browser through URL, DNS, HTTPS/TLS, client/server, HTTP, API, authentication, authorization, response and JSON.
- Each original V8 foundational lesson now **replaces** the shallow one-line glossary with relevant, expanded vocabulary cards, including prerequisite computer-level terms, their function, reason and microscopic mechanism. A button opens the full word study.
- Key terms and common abbreviations in ordinary lesson/console paragraphs are recognized and converted into accessible **tap-to-explain** controls. The popover links to the detailed vocabulary page and closes on route changes. If annotation APIs are unavailable, lessons remain usable.
- Learners can search by term, definition, scenario, micro/macro mechanism or symptom; narrow by domain; save a written teach-back explanation; self-mark words reviewed; mark confusing terms for repetition; resume the last vocabulary term; and replay system flows.
- Review markers are **self-reported** and never counted as certification mastery.
- New V15 state is preserved through existing training backup import and fictional tenant reset.

## Original source and grounding

These are original educational explanations checked against broad official sources; do not treat them as quotations:
- Microsoft Entra admin center and directory concepts: https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center
- Microsoft Conditional Access overview: https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview
- App object vs service principal: https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals
- Identity governance: https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview
- Basic web vocabulary: https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works

The simulator remains educational and is not a Microsoft Entra production tenant.

## Tested and verified in this release

1. All seven V15 JavaScript files, index and QA HTML assets returned live HTTP 200.
2. Source syntax passed.
3. Exactly **157 uniquely keyed** multi-angle entries have complete structured instructional fields.
4. All 13 flow diagrams reference defined vocabulary entries; a 16-step from-zero story works.
5. All 15 clickable anatomy examples reference real defined terms.
6. Simulated JS runtime smoke checks passed for glossary launch, acronym/term detail, step selection, field dissection, system navigation and saved self-review state.
7. The existing Railway /qa-static suite returned HTTP 200 at final verification, including V15 source and runtime checks.
8. Existing Railway deployment preserved one service; no additional cloud resources, paid subscriptions, cron jobs or paid browser service enabled.
9. Full on-device QA at `/qa-vocabulary.html` is deployed and loads; results from a **physical iPad Safari session are not available** in this audit.

## Limits: do not exaggerate

- The 157-term vocabulary is a serious beginner-to-architect foundation, **not every term** in the Microsoft product ecosystem.
- Microscopic examples are schematic and may not capture all details of production token standards, cloud implementations, protocols or commercial licensing.
- Interactive simulated state validation and course notes are not evidence of real cloud permission changes.
- A complete objective-by-objective curriculum for SC-300, SC-900 and SC-100, 1,250 substantial original exam cases, full real-tenant labs and real-device end-to-end regression remain unfinished.
- **Certification readiness is not claimed.**

## How to use it

Start in **Vocabulary Microscope** and first select **Start at zero: one button click becomes an authorized API result** under the System Stories. Tap each component before starting identity work. Then study **Tenant**, **Identity**, **UPN**, **Object ID**, **Group**, **Authentication**, **Authorization**, **MFA** and **Conditional Access** in that order.

Return to the existing SC-300 foundational lessons; tap any linked unfamiliar word, read all eight angles, try the corresponding field anatomy, save your teach-back explanation and only then complete the guided/practice/independent administration mission. If a term remains unclear, use **I need another explanation**, not **Reviewed**.

To test on iPad Safari, open `/qa-vocabulary.html` and inspect the per-check pass/fail record. The automated server checks do not substitute for that real Safari result.
