# Identity Architect Academy — Visual Learning Expansion and Completion Audit

**Verification date:** November 26, 2026  
**Live site:** https://entra-console-site-production.up.railway.app/  
**Advanced clinics:** https://entra-console-site-production.up.railway.app/#/v11/clinics  
**On-device QA:** https://entra-console-site-production.up.railway.app/qa-advanced-clinics.html  
**GitHub branch:** `training-entra-v6-exam-20261126`  
**Actual completion status:** **Partially implemented and deployed. NOT certification-ready.**

## Verified implementations in this release

- Built 17 advanced SC-300 clinics centered on exact objectives in the October 28, 2026 Microsoft Learn study guide.
- Each clinic has unique plain-language instruction, a technical explanation, a real-world risk/operational reason, a five-stage interactive architecture diagram, and a labeled educational administration-screen walkthrough.
- Each clinic links to four guided instructor actions and the relevant local fictional Entra console screen.
- The in-console coach explains its next instruction and why it matters, without automatically performing administrative changes.
- Guided and independent practice modes are distinct. Independent mode conceals the steps before configuration submission.
- Fictional state evaluation is used for selected topics; unsupported real-tenant configurations remain labeled design-only or partial.
- Two original, separately shuffled troubleshooting/transfer reasoning questions per clinic, for 34 additional knowledge checks. BOTH must be correct for a concept badge.
- Four-part teach-back prompt: configuration, business/security reason, validation evidence, rollback. Notes are self-submitted and never described as independently validated mastery.
- Quiz, clinic attempts, notes, teach-back responses and recent progress are stored browser-locally with JSON export/import.
- All 17 clinics are linked to the matching SC-300 official subskill detail record; the official coverage record stays unverified.

### Content topics

Domain verification; custom security attributes; safe Microsoft Graph PowerShell/bulk operations; device join vs registration vs compliance; cross-tenant trust; Cloud Sync vs Connect Sync; SSPR; continuous access evaluation; authentication context; protected actions; Global Secure Access; Application Proxy; SCIM provisioning; Defender for Cloud Apps controls; access packages and Terms of Use; PIM for Groups; and KQL/diagnostic ingestion.

### Preexisting training preserved

- Existing V5: 40 shorter foundational lessons, 31 practice missions, 129 questions.
- V6: 16 additional guided units, 36 scenario questions.
- V7: 10 Conditional Access Masterclass chapters, four multi-resource practical cases, 28 mixed-format questions and 237 current official exam-subskill inventory rows.
- V8: 14 expanded visual SC-300 lessons with in-console coaching and limited state-based checks.
- V9: fictional sign-in decision explorer.
- V11 adds 17 advanced clinics, including 34 separate reasoning checks.
- **Formal exam question bank remains 193 original records**; the 34 new clinic questions are in guided lessons, not incorrectly counted as a full mock-exam bank.
- Current official measured-subskill inventory: SC-300 **98**, SC-900 **58**, SC-100 **81**, total **237**.
- All 237 objective records remain explicitly **not independently verified**.

## Verification performed

- Queried Railway production environment: existing service online, one running replica, no reported crashes.
- Queried most recent deployment: SUCCESS.
- Independently checked the live homepage and every newly served clinic/checkpoint/QA asset: HTTP 200.
- Ran the built-in Railway source-syntax, asset inventory, objective matching, content presence and count checks: HTTP 200.
- Repaired a new static validation script issue during this pass and retested it successfully.
- Confirmed new code was written to the existing training branch rather than altering unrelated business apps.
- No new Railway service, paid SaaS subscription, monitoring task, scheduled automation or browser-testing top-up was enabled.

## **Important tests NOT completed**

1. The advanced learning clinics have not yet been run through a successful independent full browser automation pass. Existing external browser testing cannot run because TinyFish has a negative wallet balance (about -$0.44 at check) and auto-reload is disabled. The connected desktop is offline.
2. Physical iPadOS Safari remains unverified. The self-test page is provided to run on the actual device without charging a new external testing service. Merely serving that page is not evidence the tests pass when executed.
3. No authorized real Microsoft Entra tenant or network/private app environment has been created or modified. The educational console does not prove actual Microsoft authentication, provisioning, Conditional Access enforcement, PIM for Groups, Global Secure Access, Graph, or licensed feature behavior.
4. Fine-grained subskill mapping is only partially instructed and cannot be marked mastery-complete. There are still 81 SC-300 measured subskills without an exact new V11 clinic, though earlier lessons may relate to some.
5. The original target of **250 SC-900, 500 SC-300 and 500 SC-100 original reviewed questions** is not met. Existing formal exam-bank question count is 193 across the three tracks plus job specialization.
6. The original full SC-900 and SC-100 curricula, professional architecture portfolio, strict exam readiness system, exact Entra interface parity, and comprehensive multi-browser QA remain incomplete.
7. The current exact Railway monetary usage and billing amount was not available from the connected metrics tools. The existing service was reused; normal hosting usage remains metered.

## Acceptance matrix

| Requirement | Status |
|---|---|
| Current official blueprints | Subskill inventory complete; evidence-backed curriculum coverage incomplete |
| Complete beginner-through-expert visual teaching | Expanded with 17 clinics; not complete for all 237 skills |
| Realistic interactive Entra practice console | Some connected fictional workflows; not Microsoft service parity |
| Complete SC-300 training | 17 newly deepened skills plus other previous lessons; 98 objective-level mastery requirements not all met |
| Complete SC-900 | Not complete |
| Complete SC-100 | Not complete |
| Workforce Identity Architect job skills | Partial practice and design concepts |
| Guided, Practice, Exam for every lab | Partial |
| 1,250 quality original reviewed exam questions | Not complete |
| Dashboard, remediation and notes | Implemented in learning modes; latest device/browser behavior not independently verified |
| Microsoft real-tenant lab companion | Instructions available; live lab validation absent |
| Safari and mobile QA | New free self-test page available; physical device execution not done |
| Automated unit/integration/E2E coverage | Source tests pass; live E2E incomplete |
| Certification-ready acceptance gates | **NOT MET** |
| Production deployment and isolation | Verified online and existing training branch |
| No unapproved recurring services | No additional paid product/job explicitly enabled; hosting is metered |

## Student instructions

1. Start at [Visual SC-300 Learning Studio](https://entra-console-site-production.up.railway.app/#/v8/academy).
2. Open [Advanced Visual Skill Clinics](https://entra-console-site-production.up.railway.app/#/v11/clinics) for advanced topics or revisit the same technique when a quiz is missed.
3. Study the five-stage technical tour; take the instructor through all four actions, focusing on the reason for every change.
4. Start a Guided fictional practice attempt; open the linked Entra-style admin screen and make actual changes yourself where the simulator supports them.
5. Then start an Independent attempt. It hides the guided procedure and evaluates the limited fictional state after the attempt begins. Design-only exercises cannot be passed as real tenant configuration.
6. Solve both original case questions, then complete the four-part written teach-back to explain your configuration and rollback.
7. Download the local progress JSON before switching devices. Run [On-device QA](https://entra-console-site-production.up.railway.app/qa-advanced-clinics.html) on an iPad to inspect the test report.
8. Use the [Current Microsoft SC-300 guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300) and authorized Microsoft tenant exercises for independent proficiency.
9. Before booking any exam, corroborate performance with the current Microsoft AI Skills Navigator Practice Assessment and multiple new, domain-balanced independent mocks.

**Verdict:** Learning depth and assessment quality improved materially. The platform is **not yet complete**, and none of the SC-900, SC-300, or SC-100 tracks is independently certified exam-ready.
