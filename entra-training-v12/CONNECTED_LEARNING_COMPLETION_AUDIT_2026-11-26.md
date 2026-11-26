# Identity Architect Academy — Connected Learning Upgrade & Certification Acceptance Review

**Audit date:** 2026-11-26  
**Live application:** https://entra-console-site-production.up.railway.app/  
**New SC-300 connected missions:** https://entra-console-site-production.up.railway.app/#/v12/missions  
**On-device regression suite:** https://entra-console-site-production.up.railway.app/qa-connected.html  
**Source branch:** training-entra-v6-exam-20261126  
**Status:** **DEPLOYED, EXPANDED, PARTIALLY COMPLETE — NOT CERTIFICATION-READY**

## Independent verification summary

### 1. Current official study-guide versions
Official Microsoft Learn study guides reviewed on 2026-11-26:
- SC-300: skills measured as of **October 28, 2026**.
- SC-900: skills measured as of **October 21, 2026**.
- SC-100: skills measured as of **October 21, 2026**.
- Microsoft recommends the new AI Skills Navigator Practice Assessment experience over legacy Learn assessments.

The preexisting skill inventory contains 237 measured-skill rows: SC-300 98, SC-900 58, and SC-100 81. All remain explicitly **Not verified** for complete instruction, real-tenant practice and exam mastery. A related lesson or a passing local lab alone does not establish full objective coverage.

### 2. New completed V12 learning features
A single integrated **Connected Practical Mission Engine** was added to the existing app; it is not a separate site or service.

| Mission | Domain | Tested fictional configuration requirements |
|---|---|---:|
| Hire an analyst and scope Finance Reports access | SC-300 user identities | 6 |
| Pilot Conditional Access MFA in Report-only | SC-300 authentication and access | 6 |
| Grant narrowly scoped payroll workload privileges | SC-300 workload identities | 6 |
| Govern limited contractor B2B access | SC-300 identity governance | 7 |
| **Total** | **All four SC-300 domains** | **25** |

For each mission the learner can select Guided or Independent mode, receive unique attempt-specific training-object names, open the **existing Entra-style administration console**, perform actual fictional admin changes, and check the configured state step by step. An in-console coach explains the next operation and the security reason. Relevant forms can now be opened directly from the coach; opening a form does **not** auto-complete the task.

Independent mode withholds exact configuration instructions until submission. The evaluator verifies user/group/app relationships, Conditional Access assignment/state and pilot What If, resource-scoped managed identity grants, delegated vs app-only Graph permissions, guest app separation, package approvals/expiry and group access reviews. The program also performs negative checks (wrong policy mode, broad application permission, unwanted admin role, unexpected guest Finance access).

Eight additional original in-mission reasoning cases (two per mission) are provided with answer explanations and independently shuffled option order. The learner's simulated configuration and two reasoning answers are tracked **separately**; neither is represented as a Microsoft exam score.

### 3. Preserved or improved learning reliability
- Repaired fictional-tenant reset to preserve learning history (including V8, V11 and V12 records), invalidate the currently active connected mission and keep the same shared state object to avoid breaking module references.
- Repaired legacy full-progress JSON import to update state in place and preserve newer module state when importing an older backup.
- Added local connected-mission progress and notes, independent attempt history and export.
- Retained the existing V5/V6/V7/V8/V9/V10/V11 learning modules, practice tenant and exam engines on the same hosted service.
- No new paid services, monitoring, recurring jobs or cloud accounts were enabled.

### 4. Actual tests executed

**Passed**:
- Railway live homepage HTTP 200.
- New source files, question data, and QA page HTTP 200.
- Source syntax and integrity checks, unique mission and objective names, 25-step checklist count, missing resource detection, unrelated-course preservation checks.
- Server-side isolated JavaScript execution **of the actual V12 mission evaluator**, using a disposable fictional tenant:
  - Empty tenant fails.
  - Correct user/group/application/license joins pass all six requirements.
  - Global Administrator given to a normal employee fails least-privilege test.
  - An enforced Conditional Access policy fails the required Report-only pilot test.
  - Correctly scoped Report-only policy and matching What If pass.
  - Subscription Owner on the workload fails.
  - Narrow Secrets User permission and delegated User.Read app permission pass all six workload steps.
  - Guest with narrowly scoped Vendor Portal access passes seven governance steps.
  - Guest accidentally given Finance Reports assignment fails isolation check.
- Server-side render smoke tests of the main mission landing, guided mission page, and results page (HTML generated successfully).
- Legacy core and portal JavaScript syntax after reset/import safety repair.
- All /qa-static checks returned HTTP 200 after the changes.

**Still unverified**:
- Actual visual browser E2E results on iPad Safari or desktop after these changes.
- The on-device QA suite was created and loaded over HTTP 200, but not executed on a physical device.
- Real Microsoft Entra cloud sign-in, Graph authentication, actual Conditional Access enforcement and administration flows.
- Any external-tenant B2B trust, actual Azure Key Vault permissions, Microsoft 365 licenses, or SCIM/provisioning API behavior.

The external browser automation connector's wallet was depleted and the linked remote desktop was offline. **No funds, subscription or automatic reload were added.**

### 5. Completion relative to master V6 prompt

| Acceptance requirement | Current status |
|---|---|
| Existing app, source, branch and unrelated system protection | Verified existing training branch and service reused |
| Official blueprints | 237 measured skills inventoried; substantive evidence gaps remain |
| Beginner-to-expert visual teaching | Expanded V8 14 and V11 17 instructional units; not exhaustive |
| High-fidelity equivalent to actual Entra | **Not complete**; fictional operational subset |
| Complete 98-subskill SC-300 | **Not complete** |
| Complete SC-900 and SC-100 | **Not complete** |
| Workforce Identity Architect role skills | Partial |
| Guided / Practice / Exam for every official skill | Partial; V12 guided and independent modes implemented in four combined missions |
| 250 SC-900 + 500 SC-300 + 500 SC-100 reviewed exam questions | **Not complete**; 193 preexisting formal exam records, plus new in-lesson/mission checks |
| Visual dashboard, notes, saved progress and remediation | Implemented in multiple layers; cross-device sync unavailable |
| Screen-level visual technical workflows | Partial; the V11 clinic tours and V12 in-console guided forms are educational |
| Real-authorized-tenant lab companion | Written instructions exist; live lab execution absent |
| Safari iPad reliability | **Not verified** |
| Full modern-browser end-to-end QA | **Not complete** |
| All exam-readiness acceptance gates | **NOT MET** |
| Deployed and verifiably running | Yes; source/runtime/HTTP tests pass |
| Full deliverable set | Partial |

### 6. Remaining roadmap, learning first

1. Expand the **98 exact SC-300 measured subskills** into individually reviewed, visual teaching workflows with meaningful hands-on validation.
2. Implement realistic additional connected admin capabilities, particularly custom security attribute role scoping, device compliance integration, external tenant trust, SCIM, actual PIM group workflows, and application token validation; where no faithful offline simulation is safe, use an authorized real-tenant lab with documented expected evidence.
3. Build original varied assessment cases domain by domain and independently audit their reasoning quality. Do not inflate question counts with superficial variants.
4. Complete SC-900 and SC-100 as distinct visual teaching programs including Defender, Sentinel, Purview, Azure security architecture, GRC and architectural tradeoffs.
5. Execute the complete browser QA suite on real desktop and iPad Safari. Fix any failures and retest.
6. Independently validate applicable real-tenant tasks and official Microsoft practice assessments before describing a track as certification-ready.

### 7. Start learning now
- Open **Connected missions**: https://entra-console-site-production.up.railway.app/#/v12/missions
- Start the onboarding mission in **Guided mode** and use the on-screen training names for user/group/app access.
- Perform every change yourself; use **Check saved configuration** and observe whether the actual tenant records meet the requirement.
- Repeat with a new attempt in **Independent mode**, then answer the two troubleshooting questions.
- Review the **Sign-in Decision Lab** to distinguish actual user authentication, CA conditions and app assignment.
- Export your learning record and visit the no-cost [On-device test page](https://entra-console-site-production.up.railway.app/qa-connected.html) on your own iPad for specific browser compatibility evidence.

**Certification statement:** The platform is **not yet complete or independently exam-ready for SC-900, SC-300 or SC-100**. The new connected missions are a genuine, limited simulation of configuration reasoning, not a licensed Microsoft tenant, an exam dump, or a guarantee of passing certification.
