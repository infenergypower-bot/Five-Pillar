# Identity Architect Academy — Independent build verification

**Audit date:** 2026-11-26  
**Release branch:** `training-entra-v6-exam-20261126`  
**Hosted academy:** https://entra-console-site-production.up.railway.app/  
**Status:** **PARTIALLY IMPLEMENTED — NOT CERTIFICATION-READY**

## Actual deployed inventory

- Existing V5: **40 introductory lessons, 31 guided missions, 129 original questions**.
- V6: **16 expanded SC-300 units, 36 original scenario questions**, a lab companion with 8 documented real-tenant exercises, simulated Guided/Practice/Exam modes, and an in-console teaching panel.
- Additional 2026-11-26 work: **237 individually enumerated official Microsoft exam subskills** (SC-300 98, SC-900 58, SC-100 81), searchable with a detailed 10-field coverage CSV, evidence notes, and explicit unverified statuses.
- Additional **four connected multi-resource practical case labs** for Finance onboarding and CA rollout, guest access, workload identities, and PIM/entitlement governance.
- Additional **28 original interactive exam questions** spanning single-answer, multi-answer, matching and ordering. Existing exam question positions randomized.
- Additional **10-chapter interactive Conditional Access Masterclass** with clickable decision diagrams, instruction, troubleshooting, chapter checks, a fictional sign-in simulator, and an SC-300 case capstone.
- **193 question-bank records in total:** SC-300 115, SC-900 39, SC-100 35, role specialization 4. Chapter quizzes are separate, not double-counted.
- A **no-cost on-device test page**: https://entra-console-site-production.up.railway.app/qa-on-device.html

## Verification evidence and limits

- The production Railway service is online: one running replica; latest deployment status SUCCESS; no reported crashes in the environment check.
- Deployed homepage and the new script assets return HTTP 200.
- A read-only server-side **source-syntax, file-content, and count check** now returns HTTP 200 at /qa-static; it verifies the 237 official subskills, 28 advanced questions, 10 masterclass chapters, and referenced scripts.
- Previous V6 in-browser QA passed **95 tests** before the newly added features. This evidence does not automatically apply to the V7 enhancements.
- **New-feature browser interaction testing remains incomplete.** Connected TinyFish browser automation could not start because its wallet lacked credits; no top-up or auto-reload was activated. Connected desktop was offline.
- **A physical Safari/iPad test has not been performed.** The in-app QA page is provided to enable a device-specific test without that paid service.
- **Real Microsoft Entra tenant validation is absent**, by design; no customer data or credentials are connected. The practice console remains a simplified fictional simulator.
- Existing learner progress remains browser-local under the original storage key. It is not synchronized across devices.
- No new Railway service, paid product, monitoring automation, or scheduled job was intentionally created. Existing Railway usage is metered and additional traffic may affect consumption; the actual billing total has not been verified.

## 17 acceptance sections — findings

| # | Master prompt area | Status | Specific limitation |
|---|---|---|---|
| 1 | Existing code preservation, isolation, cost | Partial | Existing source preserved on training branch and service reused; actual billing total and cross-device migration unverified |
| 2 | Official exam blueprints | Partial | All 237 subskills are inventoried, but not every skill has verified teaching, lab and assessment evidence |
| 3 | Beginner-to-expert visual learning | Partial | More visual teaching now exists; most subskills still lack complete lessons |
| 4 | High-fidelity Entra practice console | Partial | Useful fictional workflows; not backend-equivalent or visually identical to Microsoft |
| 5 | Complete SC-300 | Not complete | All 98 subskills require full instructional/lab coverage and external validation |
| 6 | Complete SC-900 and SC-100 | Not complete | Broad current objectives far exceed existing instructional and exam depth |
| 7 | Workforce Identity Architect skills | Partial | Topics and pilot scenarios exist, but no full enterprise integration portfolio evidence |
| 8 | Guided/Practice/Exam for every lab | Partial | Modes in added units and integrated cases, not every required official subskill |
| 9 | Exam engine and question bank | Not complete | 193 total vs requested 1250; advanced interaction types added but full assessments missing |
| 10 | Visual learner dashboard and persistence | Partial | Browser-local records and strict readiness gate; true per-subskill mastery not evidenced |
| 11 | Exact visual technical instruction | Partial | Ten-chapter CA Masterclass, diagrams and simulated screens; most subjects lack screen-level instructions |
| 12 | Real Microsoft practice tenant | Partial | Written lab companion, no live authorized tenant verification |
| 13 | iPad/mobile reliability | Unverified | No physical iPad Safari run of the latest build |
| 14 | Comprehensive QA | Partial | Server-source checks pass; full modern-browser/mobile regression unavailable |
| 15 | Exam-readiness acceptance criteria | **Not met** | Must validate every objective and performance on fresh mocks and official assessments |
| 16 | Full execution through deployment | Partial | Deployed changes, not every scope requirement |
| 17 | All final deliverables | Partial | Live URL/source/case studies/QA page exist; complete curriculum/bank/practical validation outstanding |

## Exam readiness

**SC-900: NOT VERIFIED READY. SC-300: NOT VERIFIED READY. SC-100: NOT VERIFIED READY.**

The full target is 250 original SC-900, 500 SC-300 and 500 SC-100 questions with reviewed explanations and diverse interactions, and substantive training of all 237 measured skills. The app currently has only 39, 115 and 35 exam-specific questions respectively, and 4 additional job-focused questions. There are thus 211, 385 and 465 missing questions respectively, even before quality assurance.

A score on an educational simulator is not equivalent to Microsoft's scaled exam score. In addition to complete curriculum QA, students should practice on authorized licensed Microsoft Entra test resources and Microsoft's current AI Skills Navigator practice exams.

## Prioritize next development

1. Finish all **98 SC-300 measured subskills** at true visual, practical and troubleshooting depth; map each to exactly identified official objectives and validated labs.
2. Create and independently review additional varied original SC-300 questions and full case-study exams, then validate realistic production-tenant workflows under safe licensing.
3. Finish SC-900 and SC-100 as distinct tracks rather than assuming SC-300 transfers all required knowledge.
4. Perform accessibility, iPad Safari, persistence, backup/restore, scoring, timer, and failure-path browser QA, including the on-device self-test.
5. Only label a certification track curriculum-complete after all acceptance evidence exists.

**No content or QA status in this report constitutes a guarantee of certification exam success.**
