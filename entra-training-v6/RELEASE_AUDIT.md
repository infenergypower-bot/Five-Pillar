# Identity Architect Academy V6 — Release and readiness audit

Date: 2026-11-26
Status: **DEPLOYED — NOT CERTIFICATION-READY**
User-facing URL: https://entra-console-site-production.up.railway.app/
Repository: https://github.com/infenergypower-bot/Five-Pillar
Release branch: `training-entra-v6-exam-20261126`
New app source: `entra-training-v6/`
Preserved V5 base: `entra-training-v5/` on the same release branch
Production service: Railway project "Entra Practice Console", existing function "Entra Console Site"

## Delivered and tested
- Existing fictional Entra administration simulation retained without changing unrelated company applications or main branch.
- 2026 official exam group inventory: **SC-300: 16 groups / 98 enumerated subskills; SC-900: 14 / 58; SC-100: 14 / 81**. These are *inventory counts*, not verified coverage. Sources: official Microsoft Learn study guides.
- **Eight additional SC-300 deep learning units** using diagrams, concepts, guided navigation, checklists, troubleshooting, and new knowledge checks.
- **Eight state-based simulated configuration checks**, validating fictional tenant state rather than merely counting clicks.
- **18 additional original case-based SC-300 questions**, with randomized answer order and detailed explanations.
- Existing 40 lessons, 31 original guided missions, and 129 questions retained (new case bank brings question inventory to 147; depth varies).
- V6 sidebar navigation, progress and readiness dashboard, objective matrix with CSV export, independent scenario practice, and real-tenant lab companion.
- Eight real-lab worksheets covering tenant safety, users/groups, CA report-only, passwordless recovery, applications, B2B governance, logging/KQL and architecture capstone, with a local checklist export.
- Existing V5 localStorage key `entra_practice_console_v4` preserved. V6 progress is stored under `db.v6` within the same saved object.

## Verification evidence
- Browser walkthrough of V6 preview: 13 interactions passed (academy, next step, blueprint filters, exam answer saving, simulated Users, readiness).
- Automated in-browser test suite: **74 passed / 0 failed**. Test page: https://entra-console-site-production.up.railway.app/test.html
- Production browser walkthrough: **6 checks passed**, covering V6 homepage, guided Conditional Access lesson, practice-console link, readiness verdict, and eight-lab companion.
- Railway function deployment status: SUCCESS. Existing service reused; no new paid subscription, monitoring schedule, or background job activated.
- iPadOS Safari physical-device test: **NOT VERIFIED**. Browser automation did not emulate an actual iPad.

## Explicitly incomplete — do not mark as exam-ready
- Full substantive instruction for all 98 SC-300, 58 SC-900, and 81 SC-100 measured subskills.
- 250/500/500 independently reviewed, sufficiently diverse, high-quality original questions.
- Complete independent practical lab coverage, including integration and troubleshooting for licensing-bound enterprise features.
- Exact behavior parity with Microsoft's cloud backends and current production interfaces (the console is educational only).
- Comprehensive matching, sequencing, interactive case study and full timed exam simulations.
- Independent assessment on official Microsoft AI Skills Navigator and actual score evidence.
- Authorized live test-tenant practical validation and screenshots/evidence from real configurations.
- Professional external security/penetration review and physical Safari QA.
- Cross-device server-side progress synchronization (progress persists in the browser where it was recorded).

## Core limitations
- Simulated records are fictional and persisted locally per browser; there is no Microsoft tenant connection.
- V6 lesson walkthroughs use explanatory diagrams and guided steps. They do not replace all real screen-level demonstrations or training videos.
- Coverage linking is advisory. The objective matrix correctly labels groups as *Not validated* until sufficient evidence exists.
- Student exam readiness and curriculum completeness are separate questions.
- Developer sandbox entitlement is not universal. CA generally requires P1; risk-based protections and PIM may require P2/additional licensing. Azure/Log Analytics resources may incur costs. Do not activate subscriptions without approval.

## Delivery safeguards and rollback
- Main branch was not modified.
- No new Railway project or function service was created for V6; existing project and deployed function were reused.
- To rollback: update the current Railway Function's `index.html` origin to `entra-training-v5/index.html` in the preserved release branch; keep shared V5 assets on the branch.
- Source content is public on this user-owned repository branch and should not contain secrets, personal data, real passwords, access tokens, or production tenant configuration.

## Verified official scope and licensing references
- SC-300: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300
- SC-900: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900
- SC-100: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-100
- Entra licensing: https://learn.microsoft.com/en-us/entra/fundamentals/licensing
- Emergency access: https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access
- Microsoft 365 developer sandbox eligibility: https://learn.microsoft.com/en-us/office/developer-program/microsoft-365-developer-program-faq

## Next development milestone
Build comprehensive SC-300 subskill-level instruction and independently verified practical labs before expanding SC-900 and SC-100. Keep QA passing on every release. Add accessibility and Safari verification before claiming supported production compatibility.
