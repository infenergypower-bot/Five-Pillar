# Identity Architect Academy — Learning-Focused Completion Audit

**Verification date:** November 26, 2026  
**Live academy:** https://entra-console-site-production.up.railway.app/  
**Unified learning home:** https://entra-console-site-production.up.railway.app/#/v14/path  
**Connected practical missions:** https://entra-console-site-production.up.railway.app/#/v12/missions  
**Device functional QA:** https://entra-console-site-production.up.railway.app/qa-connected.html  
**Current source:** `training-entra-v6-exam-20261126`  
**Final acceptance:** **PARTIALLY COMPLETE — NOT CERTIFICATION-READY**

## 1. Verified current Microsoft curriculum

Official Microsoft Learn exam study guides checked November 26, 2026:
- [SC-300](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300) — skills measured as of October 28, 2026.
- [SC-900](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900) — skills measured as of October 21, 2026.
- [SC-100](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-100) — skills measured as of October 21, 2026.

The pre-existing local coverage matrix has 237 measured-skill entries (98 SC-300, 58 SC-900, 81 SC-100). These entries remain **Not verified** for complete instruction, lab evidence and exam readiness. Merely linking a lesson to a measured objective never marks mastery complete.

## 2. New build delivered

### A. One connected beginner-to-independent learning path (V14)
- A unified home that links **14 visual SC-300 foundational lessons**, **17 advanced technical clinics**, and **four connected multi-resource fictional tenant missions**.
- Four explicit official SC-300 domains, each with an interactive security-decision flow, beginner-through-engineering sequence, and link to the relevant practical mission.
- Recommended next lesson based on recorded knowledge and simulated practice. An independent **Resume the lesson or mission I last opened** link is also available.
- Learner-visible progress separates foundation checks, advanced reasoning checks and independent fictional state validation. It is explicitly **not** a measured certification readiness percentage.
- A button exports the **complete training record** including saved fictional tenant state, lesson notes, practice results and current learning-path preferences. No cross-device cloud sync is claimed.

### B. Expanded instruction for all 25 practical configuration steps (V13)
Every V12 mission action now includes:
1. Real-world reference navigation path, explicitly labeled as a reference and distinct from the fictional screen.
2. What the learner should observe in the administration UI.
3. Exact simulated expected resource relationship/result.
4. A plausible mistake and its operational or security consequence.
5. A specific recovery and verification procedure.

Guided mode displays an annotated fictional console tour, the setting reason and the task steps. Practice mode reveals a hint only when asked. Independent Exam mode hides solution steps until the attempt is submitted.

### C. Connected simulation correctness and negative-security testing (V12)
Four original business missions spanning every SC-300 domain:
- Hire an employee, create a dedicated group, grant correct app access and license, and avoid administrative privilege.
- Build a dedicated Conditional Access MFA pilot in Report-only, run What If, and protect emergency access.
- Create a managed workload, grant Secrets User on the correct vault, and configure a separate Graph registration with delegated User.Read.
- Invite a contractor guest, grant Vendor Portal access, configure approval and 30-day expiry, create an access review, and deny Finance Reports.

**25** configuration requirements are validated against the same fictional tenant. The validator was tightened to ensure:
- Dedicated training security groups contain only the intended user.
- Guest negative authorization evaluates all groups containing that guest, not only the newly created contractor group.
- Correctly scoped Report-only is distinct from an enforced policy.
- Resource-scoped privileges are distinct from subscription-wide Owner.
- Submitting a configuration does not create a permanent green status: current validity is re-evaluated when group/app/permission state changes. Historical submission results remain distinguishable from current state.

Eight related original mission reasoning questions are separately randomized and assessed. These are not counted as substitutes for comprehensive mock exams.

### D. Persistence and reliable learning continuity
- Fictional tenant reset preserves V8, V11, V12 and V14 learning history and invalidates stale active mission attempts.
- Full-progress JSON import updates the underlying shared state rather than replacing objects retained by existing learning modules; newer progress is not silently discarded when importing an older archive.
- User can export full progress from the unified learning home, and deep links and other course sections remain available.

## 3. Tests actually performed

### Source and backend simulation tests: PASSED
- Hosted homepage HTTP 200.
- JavaScript assets for V12/V13/V14 and the free browser QA page HTTP 200.
- Existing real-tenant learning companion and text reader HTTP 200.
- Source syntax and content integrity tests passed.
- Isolated JavaScript execution tested all four mission validators, normal and invalid access states, unauthorized extra group members, and inherited guest Finance access.
- State-drift tests showed that removing an accepted group-to-app assignment invalidates the current success status, and restoring that assignment restores the modeled result.
- HTML rendering smoke tests exercised the unified home, the domain decision map, foundational/clinic routes, guided task explanation, practice hint reveal, independent hint suppression, and results screens.
- Live Railway static/runtime validation endpoint **/qa-static** returned HTTP 200 in the final verification.
- Railway environment reported **Online**, one running replica, no crashes, no unresolved warnings/criticals, and no staged changes.
- Latest deployment status: **SUCCESS**. Current Railway Function source matched deployed code.
- GitHub comparison with the pre-upgrade training branch showed only paths beginning with `entra-training-` changed; no unrelated repository files in that comparison.

### Tests not performed
- A genuine end-to-end browser automation run (real click/touch/persistence) against this exact latest release.
- Real device testing on Safari under iPadOS; the on-device functional QA page exists and is reachable, but the user has not run it on their device in this audit.
- Any live Microsoft tenant creation, paid license activation, Conditional Access enforcement, Graph credential authentication, real token issuance, SaaS provisioning or network proxy/connector validation.
- Actual Microsoft practice assessment performance by the learner.

TinyFish browser access was unavailable due to a negative wallet balance and no auto-reload. The connected Browser tab reader requires the originating browser extension context and was unavailable in this session. These limitations were not bypassed by activating paid resources.

## 4. Current costs and infrastructure safety
- No new Railway service, paid vendor subscription, continuous-monitoring task or recurring automation was created.
- The existing Railway Function was reused.
- Existing hosting remains usage-metered; the connector's metrics provide CPU, memory and network usage rather than the current bill, so a zero-cost claim would be unjustified.
- The active service had approximately 0.026 GB mean memory use in the last observed hour and very low average CPU utilization (read-only metrics); these are **not billing totals**.

## 5. Acceptance results versus the original master specification

| Requirement | Status |
|---|---|
| Preserve the original V5 app, student data and unrelated projects | **Implemented and source-verified**, but external device persistence still needs browser testing |
| Latest Microsoft exam blueprints | **Verified** as current official guides; 237-item matrix exists but coverage status remains unverified |
| Visual Watch → Understand → Follow → Practice → Troubleshoot → Master | **Expanded** for the connected SC-300 path; not implemented for every measured subskill |
| High-fidelity Microsoft Entra UI and backend | **Partially implemented** fictional educational console; not a faithful live service duplicate |
| Entire SC-300 measured curriculum | **Incomplete**, particularly exact individual objective instruction, enterprise implementation and real-tenant validation |
| Entire SC-900 measured curriculum | **Incomplete** |
| Entire SC-100 measured curriculum | **Incomplete** |
| Workforce Identity Architect job skill portfolio | **Incomplete** |
| Three learning modes for every lab | **Implemented for V12 connected missions**, not all historic academy labs |
| 250 + 500 + 500 rigorous original exam questions | **Incomplete**; pre-existing formal exam record count is 193, plus separate new lesson/clinic/mission questions |
| Dashboard, remediation, saved learning progress | **Improved**; browser and cross-device correctness still need verification |
| Visual instruction attached to actual admin screens | **Improved for 25 mission actions**; the simulated screens are educational, not Microsoft parity |
| Authorized real Microsoft tenant companion | **Written guide exists**, no live tenant validation |
| Startup, navigation, browser refresh, iPad Safari | Source and simulated render checks pass; **full browser and iPad acceptance tests incomplete** |
| Automated QA coverage | Extensive source/runtime smoke checks, free on-device self-test; **full true E2E not demonstrated** |
| 85–90% independent mock benchmark + official practice assessments | **No learner assessment evidence**; not passed |
| Deploy without unapproved new recurring services | **Verified** same service and training branch |
| Final deliverables and certification completeness | **Partial** |

## 6. Suggested order to study

1. **[Learning Home](https://entra-console-site-production.up.railway.app/#/v14/path)** — begin with identity foundations.
2. Complete the foundational diagrams, vocabulary and reasoning checks.
3. Move to the matching advanced clinics and solve both technical scenarios.
4. Complete the related **connected mission** first in Guided mode, then Practice with optional hints, then Independent Exam mode with a fresh attempt code.
5. Observe what happens when group membership, app assignment, Conditional Access policy state or workload permission is changed. Correct the resulting simulated denial and explain why.
6. Export your full progress. In Safari on the iPad, run the **[no-cost on-device functional tests](https://entra-console-site-production.up.railway.app/qa-connected.html)**.
7. Complete additional authorized real Microsoft test-tenant exercises, current Microsoft AI Skills Navigator Practice Assessments and independent original domain-balanced mocks before registering for a certification exam.

**Verified certification readiness: NONE.** Do not count simulator completion as Microsoft certification or complete professional operational competence. The current build is a more coherent and technically credible SC-300 learning platform, but it is still not the fully complete SC-300, SC-900, SC-100 and Workforce Identity Architect academy specified in the original acceptance criteria.
