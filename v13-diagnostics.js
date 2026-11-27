/* Northstar v13: structured diagnostic reasoning alongside the existing v9 workplace tickets. No Microsoft API calls. */
(()=>{'use strict';
const CASES=window.MD102_V13_DIAGNOSTICS||{};
if(!window.MD102V9||Object.keys(CASES).length!==12)return;
const E=s=>esc(String(s??''));
function store(){state.v13 ||= {version:'13.0',cases:{}};return state.v13;}
function record(id){let v=store();v.cases[id] ||= {choices:{},attempts:[]};return v.cases[id];}
function latest(id){const a=record(id).attempts;return a.length?a[a.length-1]:null}
function diagnosticPass(id){const a=latest(id);return !!(a&&a.passed);}
function fullMastery(id){const t=(window.MD102V9.tickets||[]).find(x=>x.id===id);return !!(t&&window.MD102V9.status(t).pass&&diagnosticPass(id));}
function shuffle(id,idx){let seed=2166136261;for(const char of id+':'+idx)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;let out=[0,1,2];for(let k=2;k>0;k--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let j=seed%(k+1);[out[k],out[j]]=[out[j],out[k]]}return out}
function opts(q,id,i,choice){return shuffle(id,i).map(j=>'<button type="button" class="'+(choice===j?'selected':'')+'" data-v13choose="'+i+':'+j+'" aria-pressed="'+(choice===j)+'">'+E(q.options[j])+'</button>').join('')}
function assessment(id){
 const item=CASES[id];if(!item)return '';
 const progress=window.MD102V9.progress(id);
 if(!progress.started)return '<div class="v13-card"><p><b>Diagnostic workshop:</b> Start the workplace ticket to unlock the scenario questions and study its prerequisites.</p></div>';
 const r=record(id),a=r.draftActive?null:latest(id),completed=item.steps.every((q,i)=>r.choices[i]!==undefined);
 const originalTicket=(window.MD102V9.tickets||[]).find(t=>t.id===id);
 const practiceStatus=originalTicket&&window.MD102V9.status(originalTicket).pass;
 return '<section class="v13-card" aria-label="Structured diagnostic reasoning"><div class="v13-head"><span>NEW · STRUCTURED TROUBLESHOOTING</span><h2>Diagnose → verify → correct</h2><p>Three workplace decisions assess your troubleshooting reasoning separately from the simulated device/policy state. Do not change a real device based on this educational simulation.</p><div class="v13-summary"><span>'+(practiceStatus?'✓':'○')+' Configuration evidence '+(practiceStatus?'passed':'pending')+'</span><span>'+(diagnosticPass(id)?'✓':'○')+' Diagnosis '+(diagnosticPass(id)?'passed':'pending')+'</span><span>'+(fullMastery(id)?'✓ Combined training checkpoint passed':'Two independent outcomes required for combined checkpoint')+'</span></div></div>'+
 item.steps.map((q,i)=>'<div class="v13-question"><span>STEP '+(i+1)+' / 3 · '+E(q.kind)+'</span><h3>'+E(q.prompt)+'</h3><div class="v13-options">'+opts(q,id,i,r.choices[i])+'</div>'+(a?'<p class="v13-feedback '+(a.answers[i]===q.answer?'ok':'bad')+'" role="status"><strong>'+(a.answers[i]===q.answer?'✓ Appropriate reasoning. ':'✕ Revisit this decision. ')+'</strong>'+E(q.explanation)+(a.answers[i]!==q.answer?'<br>Better action: '+E(q.options[q.answer]):'')+'</p>':'')+'</div>').join('')+
 '<div class="v13-actions"><button class="btn primary" type="button" data-v13score="'+E(id)+'" '+(completed?'':'disabled')+'>Evaluate my incident decisions</button><button class="btn" type="button" data-v13clear="'+E(id)+'">Retry with fresh choices</button></div>'+
 (a?'<div class="v13-result" role="status"><b>'+a.score+'/3</b> on the latest attempt · '+(a.passed?'independent diagnostic reasoning demonstrated in this simulation':'review the missed evidence and retry')+'. Attempts saved: '+r.attempts.length+'.</div>':'<p class="v13-ungraded">No results displayed until you submit all three choices. Previously submitted answers are explained afterward.</p>')+
 '<p class="v13-limits">This is a conceptual diagnosis check. It is not a proctored Microsoft exam, an actual device investigation, or proof of live Intune competency.</p></section>';
}
function overview(){let ids=Object.keys(CASES),done=ids.filter(diagnosticPass).length,mastered=ids.filter(fullMastery).length;
 return '<div class="v13-overview"><header class="v13-intro"><small>NORTHSTAR ACADEMY · INCIDENT REASONING</small><h1>Prove that you can troubleshoot, not just configure.</h1><p>For each IT ticket, independently choose the most likely cause, the best evidence and the least disruptive next action. A correct configuration and a correct diagnosis are scored separately.</p><div class="v13-figures"><span><b>'+done+'/12</b> diagnostic checks passed</span><span><b>'+mastered+'/12</b> combined simulated checkpoints</span><span><b>36</b> distinct decision questions</span></div><div class="v13-notice">All endpoints, policies and results are simulated. No actual cloud accounts or devices are accessed.</div></header><div class="v13-catalog">'+ids.map(id=>{const t=CASES[id],v=record(id);return '<article><small>'+id+'</small><h2>'+E(t.title)+'</h2><p>Investigate symptoms, identify decisive evidence and choose a safe fix.</p><span>'+ (diagnosticPass(id)?'✓ Diagnosis passed':v.attempts.length?'Review required':'Not attempted') +'</span><button type="button" class="btn primary" data-route="ticket:'+E(id)+'">Open workplace case →</button></article>'}).join('')+'</div></div>';
}
const oldRender=render;
render=function(){const route=String(state.route||'');
 if(route==='incident-workshop'){$('sidenav').innerHTML=navSidebar();$('bladenav').innerHTML=modernBladeNav();$('content').innerHTML=overview();$('coachroot').innerHTML='';return}
 oldRender();
 if(route.startsWith('ticket:')){
  let c=$('content'),id=route.slice(7),html=assessment(id);if(c&&html){
   const anchor='<section class="v9-outcome';
   if(c.innerHTML.includes(anchor))c.innerHTML=c.innerHTML.replace(anchor,html+anchor);
   else c.insertAdjacentHTML('beforeend',html);
  }
 }
 if(route==='performance'){
  $('content')?.insertAdjacentHTML('afterbegin','<div class="v13-banner"><b>New: practical diagnostic reasoning</b><span>12 workplace incidents · 36 decisions · separate reasoning and configuration results.</span><button class="btn primary" data-route="incident-workshop">Open diagnostic workshop →</button></div>');
 }
};
const prevArea=activeArea;
activeArea=function(){return String(state.route||'')==='incident-workshop'?'academy':prevArea()};
try{LEARN_NAV.unshift(['incident-workshop','⚒','Incident diagnosis practice']);BLADE_GROUPS.academy[0][1].unshift(['incident-workshop','Incident diagnosis · 12 cases'])}catch(e){console.warn('Diagnostics navigation registration:',e)}
document.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-v13choose],[data-v13score],[data-v13clear]');if(!b)return;
 let route=String(state.route||'');if(!route.startsWith('ticket:'))return;
 let id=route.slice(7),item=CASES[id];if(!item||!window.MD102V9.progress(id).started)return;
 let r=record(id);
 if(b.hasAttribute('data-v13choose')){let [i,j]=b.dataset.v13choose.split(':').map(Number);if(!item.steps[i]||!Number.isInteger(j)||j<0||j>=3)return;r.choices[i]=j;r.draftActive=true;save();render();return;}
 if(b.hasAttribute('data-v13score')){if(item.steps.some((q,i)=>r.choices[i]===undefined))return;let answers=item.steps.map((_,i)=>r.choices[i]),score=answers.filter((a,i)=>a===item.steps[i].answer).length;r.attempts.push({at:Date.now(),score,answers,passed:score===3});r.attempts=r.attempts.slice(-30);r.draftActive=false;save();render();return;}
 if(b.hasAttribute('data-v13clear')){r.choices={};r.draftActive=true;save();render();return;}
});
window.MD102V13={cases:CASES,record,diagnosticPass,fullMastery,get summary(){return {cases:Object.keys(CASES).length,questions:Object.values(CASES).reduce((n,v)=>n+v.steps.length,0),diagnosticsPassed:Object.keys(CASES).filter(diagnosticPass).length,combinedPassed:Object.keys(CASES).filter(fullMastery).length}}};
store();render();
})();

/* v14: Four-book qualification, inline lesson enrichment; original text, no cloud calls. */
(function bookUpgrade(){
'use strict';
const reviewed="2026-11-27";
const official="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102";
const base="https://learn.microsoft.com/en-us/";
const source={
 A:"Windows Intune Product Guide, Spring 2012",
 B:"Hypershift, Your Complete Guide to Microsoft Intune, updated for 2026",
 C:"Managing Windows 10 Devices with Microsoft Intune and Autopilot, June 2021 workshop",
 D:"Madhanagopal P, Comprehensive Microsoft Intune Learning Path, July 2025"
};
const cards=[
[1,"From legacy inventory to modern management","A pp. 4–9, 14–16, 32–38; B pp. 5–10; D pp. 11–15","Keep the management objectives; replace old console, supported OS lists and promises of real-time visibility.",
"Endpoint inventory|A record of device attributes; it can lag behind the actual device.;Check-in|The device communicates with its management service to exchange applicable commands and status.;UEM|Unified endpoint management across supported device types, with different capabilities per platform.",
"Cloud management reduces dependence on an office network. It does not make every device visible or every setting instantaneous. A device may be known to Entra but unmanaged; an enrolled offline device may have stale status.",
"Use when comparing fleet inventory, management reachability and reported health.",
"Compare three fictional endpoints: A is Entra registered only, B is enrolled and checked in today, C is enrolled but offline for a week. Identify which can receive a new Intune device policy now. Check management state and last contact separately.",
"B has a plausible delivery path; C may receive it upon reconnecting; A needs management enrollment for MDM policy. A recent check-in is not proof of successful application.",
"Check platform/edition, network and enrollment before troubleshooting assignment. Never treat dashboard count as real-time ground truth.",
"Which record establishes that a new MDM policy actually applied?","Device-level setting status and corroborating local state","The existence of an Entra device object","The presence of a purchased license","Assignment establishes intent, not implementation.",
"intune/fundamentals/what-is-intune/"],
[2,"License and platform qualification","A pp. 46–52; B pp. 8–10; C pp. 21–26; D pp. 11–14","Replace old subscription and Windows upgrade-right assumptions with current licensing and platform prerequisites.",
"License entitlement|Permission to use a service or capability under the applicable subscription.;Device-only license|An entitlement for eligible shared or userless scenarios, not a substitute for every user-based feature.;Add-on|A capability whose entitlement must be confirmed separately from baseline Intune.",
"A product being visible in the admin center does not prove entitlement. Each feature may require a qualifying platform, license or connected service. Windows 10 general support ended October 14, 2025; Intune still allows core management, but that does not restore OS security support. Check LTSC and ESU exceptions separately.",
"Use before purchasing, enabling, or choosing an enrollment/management feature.",
"Build an entitlement matrix for a Windows 11 employee, shared kiosk, BYOD phone and Remote Help. Record ownership, intended feature, OS edition, user/device entitlement and unresolved dependencies. Do not start a trial or purchase anything.",
"Four distinct rows with current official licensing and support links; mark unknown entitlements as unverified.",
"If the feature fails, check entitlement and edition before changing policy. Do not assume an existing Microsoft 365 plan includes every Intune add-on.",
"An add-on appears in the portal; what proves the team can use it?","Current feature entitlement plus platform and tenant prerequisites","A historical Windows Intune subscription description","A visible menu item","License, platform and prerequisite validation are separate.",
"intune/fundamentals/licensing"],
[3,"Identity lab: three device identities","A pp. 6–7, 45; C pp. 27–64; D pp. 17–21","Retain the workshop's three-client comparison; update Azure AD and legacy directory tools.",
"Entra registered|A device identity typically associated with a personal device retaining its existing sign-in.;Entra joined|A device joined directly to the organization's cloud identity directory.;Hybrid joined|A device joined to on-premises AD and also represented as joined in Entra.",
"Join establishes device identity. Enrollment establishes management. Compliance evaluates health. They are distinct. DirSync and old Azure AD portal instructions are history, not current setup steps.",
"Use when selecting corporate, personal and existing domain-joined device architecture.",
"On paper or disposable Windows 11 VMs, compare a personal work-account registration, corporate Entra join and a legacy AD/Entra hybrid join design. For authorized VMs use dsregcmd /status and inspect AzureAdJoined, DomainJoined and WorkplaceJoined in the appropriate user context; compare the Entra device and Intune management records.",
"Expected identity: registered typically WorkplaceJoined YES; Entra joined AzureAdJoined YES and DomainJoined NO; hybrid joined both AzureAdJoined and DomainJoined YES. Intune enrollment requires separate evidence.",
"Check user context, tenant, enrollment restrictions and identity records; do not delete a device identity as a first troubleshooting action.",
"A registered personal laptop is missing from Intune. What can be inferred?","Registration alone does not prove MDM enrollment","It must be hybrid joined","It must already be compliant","Identity and management are separate.",
"intune/device-enrollment/windows/guide"],
[5,"Safe lab construction and change controls","C pp. 1–26, 360–380; B pp. 15–21; D pp. 11–15, 65–70","Rebuild the workshop environment without old shared passwords, pre-created subscriptions or unrestricted script policy.",
"Disposable VM|A virtual computer reserved for practice, with no production or personal data.;Pilot|A small, explicitly selected test population.;Rollback|A documented action that reverses or contains an approved change.",
"Windows 11 VMs with supported configuration and unique identities are preferable for modern exercises. Snapshot before destructive tests, use separate named test accounts, and never weaken PowerShell execution policy tenant-wide or reuse book credentials. A VM does not reproduce every TPM or attestation scenario.",
"Use before each real enrollment, reset or script exercise.",
"Design three labeled test clients: BYOD, Entra joined and Autopilot. List licenses, roles, ownership, network, expected identity and enrollment for each. Plan isolation and rollback; use simulator if no authorized licensed tenant is available.",
"An approved test matrix and recovery plan, not a change to any real device. Do not use production credentials or initiate new paid services.",
"Check for personal data, existing VM registration and tenant ownership. Stop if an exercise cannot be safely isolated.",
"What is the safest starting point for a reset lab?","An authorized disposable device with a recovery plan","A user's production laptop","A VM copied with the same registered hardware identity","Reset can remove data and identity; isolation is mandatory.",
"intune/device-enrollment/windows/guide"],
[6,"Enrollment failure isolation","C pp. 27–64; B pp. 11–15; D pp. 23–27","Use the lab workflow, not its outdated MDM scope screenshots.",
"MDM user scope|Eligible users for automatic Windows MDM enrollment when other prerequisites hold.;Enrollment restriction|A rule controlling which devices can enroll.;Management record|Intune's representation of an enrolled device.",
"Automatic enrollment requires appropriate identity, entitlement, scope and supported Windows configuration. Enrollment restrictions, device limits, network endpoints and stale records can affect the outcome. Group membership and management sync are not identical.",
"Use when a laptop joins Entra but never appears as managed.",
"In a test tenant or simulated case, verify the user's license and automatic enrollment eligibility; inspect the device's join state, restriction and last check-in. Compare Entra and Intune identifiers, then collect MDM diagnostics before changing anything.",
"Correctly identify the failing layer and capture timestamped evidence; enrollment is successful only when the expected Intune device record and check-in exist.",
"Check MDM event logs, service health, clock, proxy and DNS. Avoid repeatedly joining and deleting objects.",
"Entra join succeeded but no Intune record exists. What should you inspect first?","Enrollment scope, license, restrictions and MDM diagnostics","The app's MSI product code","A BitLocker recovery-key rotation","A join is not an enrollment.",
"intune/device-enrollment/windows/guide"],
[7,"Modernize the complete Autopilot workshop","C pp. 65–88, 359–380; D pp. 47–51; B pp. 7–9","Retain registration, profile targeting, OOBE and diagnostic reasoning; teach device preparation separately.",
"Hardware hash|Device registration information used by classic Windows Autopilot.;OOBE|Out-of-box experience, Windows' first-run setup.;ESP|Enrollment Status Page, a classic Autopilot setup progress and blocking experience.;Device preparation|A distinct Windows Autopilot provisioning workflow with a device preparation policy and different prerequisites.",
"Classic Autopilot and device preparation are not interchangeable. Choose the documented mode according to device ownership, identity, setup and hardware-registration requirements. Do not reuse the old Windows 10 lab screens or assume every mode supports VMs.",
"Use for remote employee setup, device refresh or shared/kiosk planning.",
"Draw a decision tree for user-driven, pre-provisioning and self-deploying classic Autopilot versus device preparation. For classic authorized test deployment, confirm registration and profile assignment, reset only the disposable test device to OOBE, sign in and inspect ESP, required app state and final enrollment. For device preparation, separately validate supported Windows 11, assignment and required device group ownership.",
"Provisioning method chosen with rationale; successful final join, enrollment and intended app/settings evidence. Do not claim success merely from the first sign-in screen.",
"If ESP stalls, inspect deployment profile, network, enrollment and blocking app status; collect MDM diagnostic logs; isolate the failing app rather than globally disabling ESP.",
"Which is the right approach when designing a device preparation deployment?","Use its own prerequisites and policy, not the classic hash/ESP recipe","Assume every classic mode works identically","Register all devices in a production tenant to test","The workflows have different prerequisites.",
"autopilot/device-preparation/compare"],
[9,"Android enrollment: retire the legacy path","B pp. 12–14, 24; D pp. 23–27; A pp. 18–23","Reject Android device administrator for GMS devices; teach current Android Enterprise options.",
"GMS|Google Mobile Services, including supported Google service infrastructure.;Work profile|A managed separation of work apps/data from personal apps/data.;Dedicated device|An organization-owned device intended for a specific task rather than general personal use.",
"Android device administrator on devices with GMS is no longer supported. Android Enterprise enrollment mode depends on ownership and user affinity; non-GMS cases require separate official review.",
"Use for personally owned phones, corporate phones and kiosk deployments.",
"Match BYOD to personally owned work profile, corporate mixed-use to corporate-owned work profile, corporate work-only to fully managed, and kiosk to dedicated. Record Managed Google Play and provisioning prerequisites; simulate assignment rather than modifying a personal phone.",
"Each ownership scenario has a distinct appropriate enrollment profile and expected separation or management scope.",
"Check GMS availability, enrollment token validity, platform version and restrictions. Do not use obsolete Android device administrator walkthroughs.",
"Which route is normally appropriate for employee-owned Android with separate work data?","Android Enterprise personally owned work profile","Retired GMS device administrator","Corporate dedicated kiosk","Ownership and intended management scope drive the choice.",
"intune/device-enrollment/android/guide"],
[10,"Policy conflict and legacy GPO migration","C pp. 166–220; D pp. 29–33; B pp. 12–13, 18–21","Keep profile monitoring and Group Policy analytics; replace old profile recipes with supported Settings Catalog and workload ownership.",
"CSP|Configuration Service Provider, a Windows management interface for specific settings.;Settings Catalog|Intune's searchable collection of supported configuration settings.;GPO|Group Policy Object used to manage settings in traditional AD environments.",
"Creating two policies that set the same item differently can cause a conflict. There is no universal last-policy-wins rule. Co-managed devices may still have an authoritative Configuration Manager workload.",
"Use when converting GPOs, consolidating profiles or investigating drift.",
"Map an exported fictional GPO for Edge and OneDrive to current settings; note unsupported settings. Target a pilot group, inspect per-setting status and local state. In a co-management scenario, record which workload owns configuration before migration.",
"An explicit mapping with supported/unmapped settings and no conflicting assignment; per-setting evidence confirms the chosen behavior.",
"Review both profiles, filter scope, ownership and local policy logs. Do not assume removing one profile automatically restores every prior setting.",
"What evidence best diagnoses a conflicting configuration?","Per-setting status, competing assignments and local state","A green tenant home page","Creating a third contradictory profile","Identify the setting and its sources before fixing.",
"intune/configmgr/comanage/workloads"],
[11,"Compliance is evaluation, not automatic repair","C pp. 221–271; D pp. 41–45; B pp. 18–21","Correct the assumption that compliance evaluation automatically enables a setting or isolates a device.",
"Compliance policy|Rules evaluating managed-device conditions.;Grace period|Configured time before certain noncompliance actions apply.;Remediation|An authorized action to correct an underlying problem.",
"Configuration can turn on a security feature; compliance can evaluate it; Conditional Access can use the reported state. These are different controls. Available actions vary by platform and policy; compliance is not automatic endpoint isolation.",
"Use when diagnosing an encrypted-device requirement or a noncompliant endpoint.",
"Simulate requiring BitLocker in compliance without assigning encryption configuration. Record noncompliant evidence, then plan a separate encryption configuration, sync and confirm actual encryption plus reevaluated status. Keep recovery-key handling safe.",
"Two distinct policy artifacts with an evidence chain. Compliance changes after encryption is actually present and the device reports/evaluates it.",
"Check per-setting status, grace period, last contact, applicable policy and reporting latency; do not mark a noncompliant device safe by disabling the check.",
"How do you make an unencrypted device meet an encryption requirement?","Configure or remediate encryption and verify compliance afterward","Set compliance alone and assume encryption starts","Remove the compliance requirement","Evaluation is not configuration.",
"intune/intune-service/protect/device-compliance-get-started"],
[12,"Conditional Access: safe rollout and authentication strengths","B pp. 14, 18–21; C pp. 221–271; D pp. 41–45","Retain staged policy tests; qualify MFA examples and avoid universal enforcement claims.",
"Report-only|Evaluates a Conditional Access policy without enforcing its grant/block controls.;Emergency access|Protected recovery administrator access used if normal administration fails.;Authentication strength|An Entra control specifying acceptable authentication method combinations.",
"Entra makes the access decision using policy conditions and signals; Intune supplies device compliance signals. Ordinary Authenticator push is not automatically phishing-resistant. Examples of phishing-resistant methods include Windows Hello for Business, FIDO2 passkeys and qualifying certificate-based authentication.",
"Use before requiring compliant devices or stronger authentication for protected resources.",
"Design a test-only CA policy for a pilot group, test resource and appropriate grant control. Exclude protected emergency access accounts per Microsoft guidance, use report-only and review sign-in results for compliant and noncompliant cases. Enable only after approved review in an authorized test tenant.",
"Record report-only outcome, affected users, expected access behavior and rollback; no live enforcement or new licensing required for the simulator.",
"Look at the Entra sign-in's evaluated policies, grant controls, device ID and compliance; do not disable all CA policies to resolve one blocked user.",
"Does ordinary Authenticator push automatically satisfy phishing-resistant authentication strength?","No; use a supported phishing-resistant method and check the strength","Yes, every MFA method qualifies","Yes, because the device is enrolled","MFA and phishing resistance are distinct.",
"entra/identity/authentication/overview-authentication"],
[13,"Replace Store for Business; preserve Win32 deployment skills","C pp. 89–165; D pp. 35–39; A pp. 27–28; B p. 12","Reject retired Store for Business connector exercises; use Microsoft Store app (new), Win32 and appropriate LOB/MSIX paths.",
"IME|Intune Management Extension, the Windows agent for supported workloads such as Win32 apps and scripts.;Detection rule|Evidence Intune uses to determine whether the required app/version is installed.;Requirement rule|A prerequisite determining whether the package is applicable.",
"Package installation, assignment, applicability, execution context and detection are distinct. Old Store for Business synchronization workflows are retired. Select the current Store integration or appropriate package type.",
"Use when publishing a required or self-service Windows application or troubleshooting failures.",
"Choose a harmless test package. Document trusted installer source, install/uninstall commands, system or user context, detection criteria and pilot group. In simulator test required versus available. Inspect deployment status and IME logs if authorized.",
"Evidence of applicable assignment, actual install and matching detection. A successful exit code without detection does not establish deployment success.",
"Use app install status and C:\\ProgramData\\Microsoft\\IntuneManagementExtension\\Logs; compare context, return code and detection before repackaging.",
"Installer returns success but Intune reports failed detection. What is the next check?","Inspect detection criteria versus the actual installed version/path/context","Wipe every affected device","Restore Store for Business integration","Detection and installation can disagree.",
"intune/app-management/deployment/add-microsoft-store"],
[15,"MDM versus MAM and real data boundaries","B pp. 7, 13, 20; C pp. 221–271; D pp. 35–45","Retain personal-data separation; do not conflate app protection, Enterprise App Management, VPN and full-device compliance.",
"MDM|Mobile device management, managing enrolled devices.;MAM|Mobile application management, protecting/configuring supported corporate app data.;APP|App protection policy, controls that apply to supported apps and user identities.",
"App protection can work with or without device enrollment on supported platforms. Enterprise App Management is a separate app catalog capability, not another name for MAM. A MAM-only phone is not a generally compliant enrolled device.",
"Use when employees need corporate email on personal phones without full device management.",
"Design an Outlook/Teams test scenario: protect company data with a supported app protection policy, prevent transfers to unmanaged apps as appropriate, and use app protection-aware access controls. Compare managed-device versus managed-app configuration and plan selective removal of work data.",
"Expected managed data-transfer behavior with personal files unaffected; verify supported apps, assignment and app protection report. Do not assume unrestricted support for any app.",
"Check user identity, app support, app protection assignment, platform prerequisites and Entra sign-in result. Avoid full wipe of a personal device.",
"Which control best fits supported corporate app data on an unenrolled personal phone?","App protection policy and appropriate app-based access controls","A Windows Settings Catalog profile","Full device wipe","MAM can protect supported app data without MDM.",
"intune/app-management/protection/overview"],
[17,"Endpoint security controls: separate prevention, detection and response","A pp. 29, 33; C pp. 272–307; B pp. 8–9; D pp. 59–63","Keep layered defense; replace old Security Essentials/System Center endpoint protection recipes.",
"ASR|Attack surface reduction, rules reducing opportunities for common attacks.;EDR|Endpoint detection and response, telemetry and investigation of endpoint threats.;Security baseline|A versioned collection of recommended security settings.",
"Intune deploys supported security configuration. Defender for Endpoint supplies threat detection and response subject to onboarding, licensing and configuration. Security baselines need compatibility review. A compliant device can still have an active security incident.",
"Use when planning endpoint security or investigating a reported threat.",
"Map antivirus, firewall, ASR, encryption and EDR to prevention or detection/response. Pilot a harmless simulated ASR audit-versus-block case; identify the exact rule and impact. In an authorized environment use Microsoft Defender incident evidence, not malware execution.",
"Policy settings, local status and security event evidence align; a narrowly scoped adjustment is justified rather than removing protection.",
"Check policy overlaps, platform support, Defender onboarding and exact alerts. Treat attack simulations as separate authorized activities.",
"A security baseline causes a business app failure. What is safest?","Investigate the exact setting and pilot a narrowly scoped adjustment","Disable antivirus fleet-wide","Ignore the affected cohort","Least-disruptive evidence-based adjustment preserves defense.",
"intune/fundamentals/what-is-intune/"],
[18,"Modern Windows patching and rollout rings","A pp. 24–26, 52; C pp. 272–307; D pp. 65–69; B pp. 7–8","Replace old approval-console model with modern update policies; preserve phased testing.",
"Update ring|Controls Windows update experience, deferral, deadlines and related behavior.;Feature update policy|Targets a Windows feature release.;Quality update|A servicing update, including security and reliability fixes.",
"Windows update policies, Autopatch, Hotpatch and Delivery Optimization have separate purposes and prerequisites. Do not assume Windows 10 management equals security support or that every patch is hotpatchable.",
"Use for patch rollout and Windows 11 migration planning.",
"Design test, pilot and broad cohorts. Define expected release, restart behavior, deadlines and hold/rollback criteria. In simulated reports compare update offer, installation and restart state; identify stalled cohort.",
"A documented ring plan with distinct feature-release targeting and quality update strategy, measurable success and escalation thresholds.",
"Inspect OS eligibility, safeguard holds, active hours, pending restart and reporting time before modifying settings or forcing update.",
"Which tool is primarily used to target a specific Windows release?","Feature update policy","An app protection policy","A compliance notification template","Update ring experience and target release serve different purposes.",
"intune/whats-new"],
[19,"Device lifecycle and destructive-action safeguards","A pp. 31, 39; C pp. 309–359, 359–380; D pp. 23–27","Preserve remote-support and reuse scenarios; never equate every remote action.",
"Sync|Requests a management check-in; not a guaranteed immediate fix.;Retire|Removes management and supported corporate data/settings as applicable.;Wipe|Resets a device with platform- and option-specific data consequences.",
"Remote action behavior differs by platform, ownership, connectivity and options. Classic Autopilot Reset has its own supported prerequisites. Remote Help is separately licensed where required. A portal delete is not proof that the physical device was erased.",
"Use for leavers, reassignment, lost devices and device refresh.",
"Choose the least disruptive action for three simulated tickets: missing policy, employee-owned phone with work data and company laptop to be reassigned. For destructive options document identifiers, authorization, backup, recovery, approval and expected result before acting.",
"Appropriate action plus device-specific evidence; no real wipe, retire or reset performed.",
"Verify ownership, device identity, last contact and command outcome. If offline, distinguish queued from completed.",
"What should be done before an authorized destructive action?","Verify identity, ownership, approvals, backup/recovery and action effects","Choose a device by similar name only","Assume portal deletion wipes the hardware","Remote actions must have verified scope and effects.",
"intune/fundamentals/what-is-intune/"],
[20,"Evidence-based reporting and Endpoint Analytics","A pp. 32–38; C pp. 308–358; D pp. 53–57; B pp. 11–16","Retain operational dashboards; qualify real-time and mandatory Log Analytics claims.",
"Telemetry|Reported measurements such as startup and app reliability.;Cohort|A comparable group used to evaluate performance or change.;Baseline|A recorded starting measurement against which later results are compared.",
"Endpoint Analytics requires appropriate data collection and supported prerequisites, not a mandatory Log Analytics workspace for all core analytics. Reporting can lag. KQL queries must be interpreted in the correct data/query surface.",
"Use to improve startup reliability and distinguish deployment progress from user experience.",
"Compare simulated startup data before/after a pilot; record affected cohort, timestamp and metric definition. Compare compliance, app failures and startup experience separately. Export non-sensitive sample records; do not create a paid workspace.",
"An evidence table with metric, cohort, timestamp, before/after and caveats; meaningful improvement is linked to specific affected devices.",
"Check data collection eligibility and reporting freshness before interpreting missing telemetry as healthy.",
"Does an improved fleet-wide average prove a specific user's problem is fixed?","No; inspect the affected cohort and device-level evidence","Yes, averages prove every device improved","Yes, if compliance is green","Aggregate metrics can hide individual failures.",
"intune/endpoint-analytics/index"],
[22,"A reproducible troubleshooting ladder","C pp. 87–88, 155–165, 308–358; B pp. 11–21; D pp. 53–57","Retain log-driven investigation; modernize agent and event-log locations.",
"MDM log|Windows management event and diagnostic evidence.;IME log|Intune Management Extension workload evidence for applicable scripts and Win32 apps.;Sign-in log|Entra authentication and Conditional Access evaluation evidence.",
"Different control planes produce different evidence. Start with symptom, affected population and time; test service health/network, identity, enrollment, assignment, applicable state and local execution in order appropriate to the symptom.",
"Use when enrollment, configuration, application or access fails.",
"Given four simulated tickets, choose evidence: enrollment error -> MDM diagnostics; policy conflict -> per-setting status and MDM event logs; Win32 failure -> IME app logs; access block -> Entra sign-in logs. Record hypothesis, evidence, minimal fix and re-test.",
"Each ticket has a distinct evidence source, likely cause and least-disruptive action; no reset merely because a portal shows failure.",
"Use Windows Settings access-work-or-school diagnostic report and DeviceManagement-Enterprise-Diagnostics-Provider/Admin logs where applicable; IME logs for app execution. Redact identifiers before sharing.",
"Where is the strongest first evidence for a Conditional Access block?","Entra sign-in log and evaluated policy details","Only the Windows app installer log","The old Windows Intune licensing console","Use the evidence source for the failing decision.",
"windows/client-management/mdm-collect-logs"],
[24,"Graph and scripting: modernize the 2021 optional labs","C pp. 308–358, 359–380; D pp. 65–69","Keep read-only inventory, exports and scripting practice; do not blindly execute old module/API commands or broad permissions.",
"Microsoft Graph|An API surface for Microsoft cloud resources.;Delegated permission|Authorization on behalf of a signed-in user within granted scope.;Application permission|Authorization for an application identity without a signed-in user, where supported.",
"Graph and PowerShell automation requires appropriate least-privilege permission, endpoint version and authorization. Do not assume a beta API or old module remains supported. Custom compliance, scripts and Remediations have separate execution and licensing requirements.",
"Use for repeated inventory, audit and controlled operations.",
"Sketch a read-only managed-device inventory query, identify the documented permission and endpoint, then use sample JSON in the academy or an authorized existing tenant. Compare pagination and error handling. For write exercises, use fictional data and require a separate approval/dry-run design.",
"An inventory export design with scoped authorization, pagination, no secrets in code, and logged errors. No real tenant writes or credential creation.",
"If Graph returns 401/403, inspect authentication and granted scopes; never request broad admin privileges merely to get past an error.",
"What is the best initial automation exercise?","A documented least-privilege read-only inventory with test data","A script that deletes all device categories","An unrestricted service principal with stored credentials","Start read-only and expand only with explicit authorization.",
"intune/fundamentals/index"],
[42,"Enterprise migration and governance capstone","A pp. 4–12, 40–45; B pp. 11–33; D pp. 65–73; C pp. 359–380","Keep phased migration and business-case reasoning; do not rely on vendor rankings, outdated branding or blanket hybrid claims.",
"Co-management|Supported Windows device management using both Configuration Manager and Intune, with workload authority assigned.;Blast radius|The population and services a change could affect.;Exit criteria|Measured conditions that must hold before a pilot progresses.",
"Configuration Manager remains relevant for supported existing workloads. Migration is a workload-by-workload decision, not an automatic requirement or instant replacement. Separate business goals, security, user experience, licensing and technical feasibility.",
"Use when planning enterprise transition, introducing a new policy or evaluating a management platform.",
"Design a fictional 500-device migration: inventory and segment endpoints, choose join/enrollment, map GPOs, identify workload owner, select pilot cohort, define app/security/access/update controls, prepare support communications, success metrics and rollback. Review with least-privilege and approval requirements.",
"Signed-off simulated architecture with explicit workload authority, measured pilot exit gates, incident escalation and cost/entitlement questions. No real purchase or tenant deployment.",
"Do not migrate all workloads at once; investigate failed pilot cohort before expanding. Keep alternative vendor claims unverified unless sourced separately.",
"What is the correct co-management migration approach?","Pilot a defined workload, verify authority and results, then expand","Switch every workload immediately because Intune is cloud-based","Apply conflicting policies everywhere","Co-management allows staged workload ownership.",
"intune/configmgr/comanage/overview"]
];
const audit=[
["A · 2012 Microsoft guide · 56 pages","Historical concepts only","Retain inventory, centralized policy, app distribution, updates, remote support and reporting. Exclude Windows XP/Vista/7 instructions, legacy client/console, Silverlight-era UI, DirSync, old endpoint protection and upgrade/license assumptions. Modern terminology and procedures replace them."],
["C · 2021 workshop · 380 pages","Modernized lab design","Nine module groups: lab setup (1–26), identity (27–64), Autopilot (65–88), apps (89–165), profiles (166–220), data control (221–271), security (272–307), operations (308–358), optional labs (359–380). Reuse the lab structure, not credentials, screenshots, obsolete Store for Business integration, broad script settings or unverified legacy API commands. Endpoint DLP belongs to Microsoft Purview and requires separate current entitlement and scope verification; do not treat the old lab as an Intune-only feature."],
["D · 2025 learning book · 73 pages","Keep structure with corrections","All eleven chapters mapped conceptually: foundations, identity, enrollment, profiles, apps, compliance/access, Autopilot, reporting, security, maintenance and next steps. Replace old Azure AD and Endpoint Manager wording; qualify real-time reporting, analytics workspace assumptions and license-specific functionality."],
["B · 2026 Hypershift guide · 37 pages","Keep deployment practice; qualify claims","Use pilot, migration, connectivity, policy review, RBAC, access tests, operational ownership and support design. Exclude unsupported vendor rankings and marketing statistics. Distinguish MAM from Enterprise App Management; phishing-resistant authentication from standard MFA; compliance evaluation from remediation or isolation."]
];
const H=v=>esc(String(v??''));
const get=()=>{state.bookEvidence ||= {version:1,answers:{}};return state.bookEvidence};
const byId=new Map(cards.map(c=>[c[0],c]));
function auditHtml(){return '<section class="card section"><div class="super">Source qualification · '+reviewed+'</div><h2>Four-book knowledge audit, integrated into your existing lessons</h2><p>546 PDF pages inventoried across four sources. The academy uses current Microsoft documentation for operational decisions. These are original learning exercises, not copies of historical portal walkthroughs. Each enrichment is attached to its existing lesson, not a new learning path.</p>'+audit.map(a=>'<details class="concept"><summary><b>'+H(a[0])+'</b> · '+H(a[1])+'</summary><p>'+H(a[2])+'</p></details>').join('')+'<p><b>Exam authority:</b> October 27, 2026 MD-102 outline. <a href="'+official+'" target="_blank" rel="noopener noreferrer">Microsoft study guide</a> · <a href="'+base+'intune/whats-new" target="_blank" rel="noopener noreferrer">Intune release notes</a> · <a href="'+base+'intune/fundamentals/ref-supported-platforms" target="_blank" rel="noopener noreferrer">Supported platforms</a>.</p><p>Newer exam areas (Suite, Cloud PKI, Hotpatch, KQL, Windows 365, Windows Backup, agents and automation) remain in the existing academy; the books are not the sole exam authority. No live tenant exercise has been executed.</p><div class="tiles">'+cards.map(c=>'<button class="tile" data-route="lesson:'+c[0]+'"><b>Lesson '+c[0]+' · '+H(c[1])+'</b><p>'+ (get().answers[c[0]]===0?'Knowledge check passed':'Practice and evidence check')+'</p></button>').join('')+'</div></section>'}
function cardHtml(c){const [id,title,refs,status,terms,what,when,lab,proof,fail,q,...rest]=c;const [correct,wrong1,wrong2,reason,doc]=rest;const ans=get().answers[id];const opts=[correct,wrong1,wrong2];const order=id%3===0?[2,0,1]:id%3===1?[1,2,0]:[0,2,1];return '<section class="card section" id="book-evidence-'+id+'"><div class="super">Qualified book material · '+reviewed+'</div><h2>'+H(title)+'</h2><p class="small muted">Source pages: '+H(refs)+' (A–D correspond to the four-book audit in the curriculum). '+H(status)+'</p><h3>Vocabulary first</h3>'+terms.split(/;(?=[^;|]+\|)/).map(t=>{const [term,...definition]=t.split('|');return '<div class="concept"><strong>'+H(term.trim())+'</strong><p>'+H(definition.join('|').trim())+'</p></div>'}).join('')+'<h3>What it is and why it matters</h3><p>'+H(what)+'</p><h3>When to use it</h3><p>'+H(when)+'</p><h3>How to practice · safe lab</h3><p>'+H(lab)+'</p><h3>Expected result and evidence</h3><p>'+H(proof)+'</p><h3>If it fails</h3><p>'+H(fail)+'</p><div class="questionbox"><h3>Independent knowledge check</h3><p>'+H(q)+'</p>'+order.map(i=>'<button class="answer '+(ans===i?(i===0?'correct':'incorrect'):'')+'" data-book-answer="'+id+':'+i+'">'+H(opts[i])+'</button>').join('')+(ans!==undefined?'<p role="status"><b>'+(ans===0?'Correct.':'Review and retry.')+'</b> '+H(reason)+'</p><button class="btn small" data-book-reset="'+id+'">Reset check</button>':'')+'</div><p><a href="'+H(base+doc)+'" target="_blank" rel="noopener noreferrer">Current Microsoft documentation ↗</a> · <a href="'+official+'" target="_blank" rel="noopener noreferrer">MD-102 skills outline ↗</a></p><p class="small muted">This supplement is a learning exercise. A correct answer is not evidence of live tenant administration or certification readiness. Verify feature-specific licensing and UI before execution.</p></section>'}
const prior=render;
render=function(){prior();const r=String(state.route||'');const target=$('content');if(!target)return;if(r==='curriculum')target.insertAdjacentHTML('beforeend',auditHtml());if(/^lesson:\d+$/.test(r)){const id=Number(r.slice(7));const c=byId.get(id);if(c)target.insertAdjacentHTML('beforeend',cardHtml(c));}};
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-book-answer],[data-book-reset]');if(!el)return;const r=String(state.route||'');if(!/^lesson:\d+$/.test(r))return;const id=Number(r.slice(7));if(!byId.has(id))return;if(el.hasAttribute('data-book-answer')){const [n,a]=el.dataset.bookAnswer.split(':').map(Number);if(n!==id||!Number.isInteger(a)||a<0||a>2)return;get().answers[id]=a;}else{if(Number(el.dataset.bookReset)!==id)return;delete get().answers[id];}save();render();document.getElementById('book-evidence-'+id)?.scrollIntoView({block:'start'});});
window.MD102BookEvidence={reviewed,source,audit,cards,summary:()=>({lessons:cards.length,checks:cards.length,passed:cards.filter(c=>get().answers[c[0]]===0).length})};
get();render();
})();
