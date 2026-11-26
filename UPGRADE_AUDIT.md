# MD-102 Academy v4 — implementation audit (2026-11-26)

## Source of truth
Microsoft published study guide, skills measured as of October 27, 2026:
https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102

The source guide currently lists 83 individual skills in 13 major skill groups across five weighted domains. The source's illustrative bullets are an exam-planning baseline, not guaranteed coverage of all possible exam questions.

## Baseline (before this change)
- 42 existing HTML learning lessons, typically four teaching concepts each
- 30 guided missions
- 18 troubleshooting scenarios
- 53 unique scenario questions in original exam bank
- 126 original lesson knowledge checks (3 per lesson)
- 7 seeded simulated devices and 3 users
- Four-stage policy creation wizards had a **confirmed event-handling bug**: empty `data-wiznext` and `data-wizprev` attributes were treated as false, leaving learners stuck on Basics. Fixed in v4 index.html.

## Implemented in v4
- Isolated backup GitHub branch: `intune-md102-backup-2026-11-26`
- Modular JS/CSS data files for future curriculum revisions
- 83 official skills identified in downloadable objective matrix and UI, with *unverified* statuses rather than inflated completion claims
- 155 fictional Northstar Technologies users and 210 simulated devices added without destroying the existing seven devices or saved records
- 11 additional dynamic enrollment/department groups; extended assignment options
- Distinct simulated security/configuration/application/compliance evaluation events after device sync, including errors and conflicts
- Twelve action-verified workshop missions with functioning Show Me / Guide Me / Let Me Try / Explain Why / Check My Work controls
- 5-step visual flow guides and lesson links for all official objectives; deeper explanations for selected common workloads
- 12-step real Microsoft tenant practice path, with explicit billing and authorization boundary
- 91 newly authored scenario/multi-answer/sequencing questions and preserved 53 legacy scenario questions; advanced exam interface with six learning modes, answer ordering, flags, timer, scored reviews, and weakness history
- 297 *supplemental* basic knowledge / troubleshooting drills, **not** equivalent to difficult certification-style exam questions
- Thus 441 total distinct prompt records across tiers, but **only 144 scenario candidates**, and **zero independently SME-reviewed**. The requested bank of 400 reviewed exam-quality questions is NOT completed.

## Verification performed
- Local headless Chromium rendered all new screens with injected modular JS; 17/17 visual/navigation checks passed on desktop/mobile-sized viewports.
- Hands-on integration tested creation of a compliance policy and security Disk encryption policy through the four-stage wizard, assignment to `Northstar - IT Pilot`, and subsequent device sync. Device `W11-IT-006` changed from unencrypted to encrypted and produced evaluation history, as expected in a simulated sandbox.
- 12/13 integration assertions passed. The remaining assertion (localStorage persistence) was **untestable in the local browser test harness** because the browser prohibits local file and localhost origin storage. Live HTTPS persistence must be retested after deployment.
- iPad Safari was **not** tested natively. Chromium mobile emulation is not a substitute.

## Remaining exam-readiness blockers
1. Many of the 83 objectives currently have introductory/linked teaching but not full independent lab, incident, verified authentic visual instruction and final mastery evidence.
2. 400 independently expert-reviewed, challenging original mock-exam questions are not present; supplemental easy drills must not count.
3. A full real Microsoft Intune/Windows 365/Graph test-tenant setup has not been executed (must use authorized tenant, real licenses and devices).
4. Native iPad Safari, accessibility screen-reader tests, and all existing routes/wizards have not all been independently exercised end-to-end.
5. The app remains a realistic *simulator*, not an identical licensed Microsoft service.
6. Learner state is browser local, without account-linked multi-device synchronization. Keeping the original storage key preserves existing progress on the same origin.

## Operational safety
No paid Microsoft tenant, Cloudflare feature, or recurring monitoring is enabled. No production device operations, credentials or personal data are requested. The application's synthetic device data remains local in the learner's browser.

## Recommended certification readiness judgment
**Not certified exam-ready.** Meaningfully improved training simulator and objective tracking, but do not use as a sole preparation resource. The official Microsoft practice assessment and authorized real-tenant labs remain essential.