# Identity Architect Academy — Visual Learning Build & Verification
**Release:** 2026-11-26, Visual Learning Studio + Connected Sign-In Lab  
**Status:** DEPLOYED, PARTIALLY COMPLETE, **NOT CERTIFICATION-READY**  
**Live:** https://entra-console-site-production.up.railway.app/  
**Source branch:** training-entra-v6-exam-20261126  
**Learning:** https://entra-console-site-production.up.railway.app/#/v8/academy  
**Simulation:** https://entra-console-site-production.up.railway.app/#/v9/signin  
**On-device tests:** https://entra-console-site-production.up.railway.app/qa-learning.html

## What was actually implemented

### Four-domain visual SC-300 learning studio
- **14 additional detailed lessons** spanning user identities, authentication and access, workload identities, and identity governance.
- Every new lesson has a beginner-facing explanation, deeper technical mechanism, real-world business case, tap-through system diagram, glossary, step-by-step console procedure with reasons, troubleshooting scenario, original question with explanatory feedback, and independent evidence notes.
- Learning cycle: **Watch → Understand → Follow → Practice → Troubleshoot → Master**.
- Contextual instructor appears inside supported fictional Entra console pages while taking guided actions. Independent practice suppresses the instructor until submission.
- Lab checks analyze relevant fictional tenant state changes and, for several workflows, enforce unique attempt-specific objects and least-privilege conditions.
- **13 limited simulated lab check types + 1 design-only topic**; the design-only topic does not falsely pass administrative-scope simulation.
- Browser-local progress, recent lesson, saved teaching notes, quiz attempt/mistake records, error-based review suggestions, and JSON progress export/import.

### Connected cause-and-effect sign-in practice
- Reads simulated users, groups, app assignments, and Conditional Access policies.
- Models scope, basic MFA/device/legacy client enforcement, report-only impact, resource assignment, a session-revocation indicator, and fictional sign-in log consequences.
- Differentiates a denied application assignment from unmet authentication controls. Does **not** claim to emulate Microsoft token issuance, all CA signal types, real device compliance, external trust, or production enforcement.
- Links to exactly the simulated administration screen for a decision the learner needs to inspect.

### Existing content preserved
- Existing V5: 40 foundational lessons, 31 guided missions, 129 questions.
- V6: 16 additional guided units and 36 original cases.
- V7: 10 Conditional Access Masterclass chapters, four multi-resource practical cases, 28 mixed-format original practice questions, 237-item official measured-subskill inventory, real-tenant lab companion.
- Total original question records from V5/V6/V7: **193**, not including the new individual lesson checks. This does **not** meet the 1,250-question target.

### Current official Microsoft exam inventory
- SC-300 **98** listed measured subskills.
- SC-900 **58** listed measured subskills.
- SC-100 **81** listed measured subskills.
- All 237 remain **unverified for full mastery** until exact subskill-level teaching, practical lab, and assessment evidence exists. A related lesson is not the same as completed coverage.

## Verification completed
- Railway service health checked: one online running instance, no reported crashes or active warnings at last check.
- Main learning homepage, the new script assets, the sign-in lab and on-device QA HTML all returned **HTTP 200**.
- Railway server-side **source syntax, data integrity, registered asset and content presence checks** returned **HTTP 200** at /qa-static.
- Changed the default app route from the console overview to the Visual Instructor Academy.
- Pinned release index/source references to immutable GitHub commit snapshots for consistent serving.
- No new paid services, recurring background jobs, or monitoring tasks were deliberately enabled.

## Not yet verified
- **The newly added V8/V9/V10 controls have not completed an independent, real browser end-to-end run.** Connected external browser automation was unavailable because its wallet was depleted; the authorized remote desktop was offline. The downloadable on-device self-test is installed but has not been executed on the user's iPad.
- **Physical iPadOS Safari and cross-browser accessibility remain unverified**, including actual touch behavior, navigation, file import/export, and refresh persistence.
- Real Microsoft Entra authentication, Graph APIs, Conditional Access enforcement, administrative units and licensed identity governance functionality **cannot be validated by a fictional offline simulator**.
- Per-subskill complete instruction and independent proficiency evidence for all **237 official Microsoft measured skills** remains outstanding.
- The requested **250 SC-900 / 500 SC-300 / 500 SC-100** original reviewed scenario-question banks remain incomplete.
- Real official AI Skills Navigator practice-assessment performance and learner-level preparedness are **not available**.
- Current Railway invoice / exact ongoing billing total was **not retrieved**; an existing service was reused, and normal hosting usage may still be metered.

## Compliance verdict on original 17 sections
| Requirement | Status |
|---|---|
| Preserve V5, existing service, unrelated main branch | Implemented for new changes; individual saved-progress migration not independently browser tested |
| Updated official blueprint | 237 skills inventoried; complete lesson-to-evidence coverage missing |
| Visual beginner-to-expert instruction | Greatly expanded but incomplete across all exams |
| Realistic Entra interface and behavior | Fictional multi-object simulator; not Microsoft parity |
| SC-300 full lab curriculum | Partially developed; all 98 subskills not individually verified |
| SC-900 and SC-100 full curricula | Incomplete |
| Workforce architect job abilities | Partial; real enterprise design evidence still needed |
| Every lab Guided / Practice / Exam modes | Expanded for V8, not all official objectives |
| Comprehensive exam engine, 1,250 questions | Incomplete: 193 question records + separate lesson checks |
| Dashboard, remediation and progress | Browser-local working design; latest interactive behavior not yet browser verified |
| Real administration screen-level visual instruction | Incomplete outside supported fictional workflows |
| Authorized real-tenant practice companion | Documentary guide exists; actual tenant validation absent |
| Safari/iPad production reliability | Unverified |
| Complete repeatable E2E, integration and mobile QA | Server syntax/content checks pass; full latest-browser run pending |
| Certification readiness gates | **NOT MET** |
| Full implementation phases through verified production | Partial |
| All 17 deliverables | Partial |

## Student use
1. Open the learning academy and start with **Tenants, roles, and delegated administration**.
2. Follow the interactive diagram, beginner and engineering explanation, vocabulary, and guided console practice.
3. Run a **Guided** simulated task; submit only after changing the fictional settings yourself.
4. Repeat in **Independent** mode with a new attempt code and no instructor.
5. Review mistakes on **Skill learning & evidence** and write a teach-back explanation in the lesson's personal notes.
6. Use the **Connected Sign-In Decision Lab** to test group and policy consequences; inspect mock sign-in logs.
7. Export the browser-local learning backup, and open **qa-learning.html** on an actual iPad to see the on-device self-test results.
8. Validate advanced features in an **authorized test tenant** when licensing, administrative permissions and safety precautions allow.
9. Use the current Microsoft Learn study guide and official AI Skills Navigator Practice Assessments before deciding to schedule an exam.

## Official sources
- https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300
- https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900
- https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-100
- https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/administrative-units
- https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview
- https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview

**Certification statement:** None of SC-900, SC-300 or SC-100 is verified exam-ready. Do not mistake a completed simulated lesson or a passing source check for passing the official Microsoft certification examination.
