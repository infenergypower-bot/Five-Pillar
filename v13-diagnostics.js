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


/* v15: official Microsoft lab companion, original instructional simulations, no tenant calls. */
(function officialLabAcademy(){
'use strict';
const root="https://microsoftlearning.github.io/MD-102T00-Microsoft-365-Endpoint-Administrator/";
const docs="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102";
const groups=[
["Foundation: identity, enrollment and provisioning",90,"Lab01-Foundation.html"],
["Manage and maintain endpoints",100,"Lab02-Manage-Maintain.html"],
["Application delivery and protection",100,"Lab03-Applications.html"],
["Endpoint security",110,"Lab04-Protect-Devices.html"],
["Automation and operations",100,"Lab05-Automate-Operate.html"],
["Extended endpoint capabilities",90,"Lab06-Extend-Capabilities.html"]
];
// Each original practice exercise: lesson, title, vocabulary, rationale, situation, action options, expected evidence options, failure investigation, state artifact.
const raw=[
[
[3,"Users and targeting groups","Assigned group|Membership is explicitly maintained.;Dynamic group|Membership is evaluated from an identity rule.;Compound rule|Combines multiple conditions.",
"Targeting by attributes supports consistent policy assignment and makes exceptions visible.",
"Create a pilot for Engineering employees whose usage location is US. One Engineering user has no usage location.",
"Create a dynamic user group with department AND usageLocation conditions","Create a dynamic device group using department","Assign the policy to All users because a group is unnecessary",
"Expected qualifying members are present after processing; user without usage location is excluded","All employees must appear immediately","The existence of a group proves membership and policy application",
"Review attribute values, membership-rule validation and processing status before changing policy.","Pilot group: Engineering + US"],
[27,"Administrative delegation","Directory role|Permissions in Microsoft Entra.;Intune RBAC role|Allowed Intune administrative operations.;Scope tag|Limits visibility of tagged Intune objects within role assignments.",
"Permissions, group scope and object visibility are separate boundaries.",
"Delegate support for a department's devices without making its technician a tenant-wide administrator.",
"Assign a narrowly scoped Intune role with support group, managed population and relevant tag","Grant permanent Global Administrator to every technician","Assign a tag without any role or scope",
"Technician can act on authorized test devices but not out-of-scope devices","Every device is accessible because the technician can sign in","Tag is visible but no positive or negative authorization test is performed",
"Inspect role permissions, scope groups, tag assignment, sign-in identity and effective access.","Delegated department support role"],
[3,"Device identity and registration settings","Entra join|Organization device identity.;Registration|Work identity associated with an existing device.;LAPS|Local administrator password management with rotation and controlled recovery.",
"Identity settings govern who can create device identities and affect enrollment eligibility.",
"Plan corporate Windows join, limited personal registration and controlled local administrator password recovery.",
"Review device join settings and choose eligible users; separately enable supported LAPS prerequisites","Disable all identity restrictions and store a shared local password","Use a compliance policy to join a device",
"Expected test identity can join and unauthorized identity is rejected; LAPS settings verified separately","Any visible device is automatically managed and encrypted","Recovery password is printed in a shared report",
"Check join permission, device limits, license/edition, directory identity and authorized recovery access.","Device registration guardrails"],
[6,"Windows enrollment policies","MDM user scope|Users eligible for automatic MDM enrollment.;Enrollment restriction|Limits enrollment by supported device characteristics.;ESP|Enrollment Status Page for setup tracking in applicable scenarios.",
"Enrollment gates protect the organization from unsupported or unwanted managed devices.",
"Corporate Windows users need automatic management; personal Android full-device enrollment must be restricted per lab design.",
"Scope automatic MDM enrollment to pilot; set applicable enrollment restriction and an ESP profile","Enroll every device platform without checking ownership","Make app protection the Windows automatic enrollment setting",
"Pilot Windows devices are eligible and blocked enrollment scenario is documented; ESP applies where assigned","The policy name is enough proof","An unsupported device is enrolled by force",
"Check scope, licenses, platform restrictions, priority and enrollment error details.","Pilot enrollment rules and ESP"],
[6,"Enroll Windows 11 devices","MDM enrollment|Establishes management relationship.;Device object|Directory representation of an endpoint.;Check-in|Management communication and status reporting.",
"An identity record alone does not establish device management.",
"Two disposable corporate Windows 11 machines must join Entra and become managed.",
"Use the intended organizational join/enrollment flow with authorized licensed users","Create duplicate objects in Intune without device enrollment","Add a personal Microsoft account and assume corporate management",
"Both devices show expected join state, Intune record and successful check-in","Only a local account is present","Only an Entra record is visible with no management evidence",
"Check dsregcmd /status, MDM diagnostics, entitlement, enrollment scope and connectivity.","Two enrolled training devices"],
[7,"Classic Windows Autopilot","Hardware hash|Registration identifier for classic Autopilot.;Deployment profile|Settings governing applicable provisioning.;OOBE|Windows first-run setup.",
"Autopilot reduces manual provisioning, but registration and profile assignment must precede the intended setup.",
"A third disposable device is to be shipped ready for organization-controlled onboarding.",
"Register the test device, target its classic deployment profile, verify assignment before OOBE","Use device preparation settings as though they were the classic profile","Reset a production laptop to discover whether it is registered",
"Registered device has assigned profile and expected join/enrollment/setup outcome","Hash was collected but never imported","Login prompt alone proves all required apps installed",
"Inspect registration status, assignment processing, network and blocking setup errors; avoid destructive retry on real devices.","Third device: classic Autopilot registered"]
],
[
[10,"Configuration profiles","Settings Catalog|Searchable supported configuration settings.;CSP|Windows management interface for settings.;Assignment|Target population for a policy.",
"Configuration changes device behavior; assignment expresses intended delivery.",
"A pilot group needs a standard Windows desktop configuration.",
"Build a targeted Windows profile with applicable settings and verify per-setting result","Require compliance only and assume desktop settings change","Apply two opposing settings to all devices",
"Pilot per-setting status succeeds and local behavior matches the configured values","Profile is saved with zero assignments","A dashboard is green but the local setting is wrong",
"Inspect platform applicability, assignment filters, per-setting errors and competing policies.","Pilot configuration policy"],
[11,"Compliance policies","Compliance|Evaluation against defined requirements.;Grace period|Time allowed before selected noncompliance actions.;Conditional Access|Entra access decision based on configured conditions.",
"Evaluation and remediation are distinct; reported status can lag.",
"A Windows device must be encrypted to access protected resources.",
"Define supported compliance criteria, scope a pilot and configure encryption separately","Assume compliance alone enables encryption","Set every device to compliant without checking",
"Encrypted pilot device reports compliant after evaluation; unencrypted case reports expected failure","Configuration was assigned but no device status checked","Delete the failed device instead of diagnosing it",
"Review last check-in, per-setting evidence, grace period and enforcement in Entra.","Pilot compliance policy"],
[10,"Group Policy analytics","GPO|Traditional Group Policy object.;XML export|Structured settings exported from a GPO.;Mapping|Relationship between a legacy setting and supported MDM configuration.",
"Migration requires identifying supported settings and avoiding conflicting authority.",
"Review the official desktop GPO sample before recreating it for the pilot.",
"Import reviewed GPO XML into analytics, identify supported/unmapped items and pilot mapped settings","Blindly import a registry dump to production endpoints","Assume every GPO automatically converts and applies",
"Mapping report documents supported and unsupported settings and pilot confirms behavior","Every setting is declared migrated without review","A GPO file exists but no target setting is evaluated",
"Review unsupported/deprecated settings, co-management ownership and policy conflicts.","GPO migration assessment"],
[18,"Windows Update policies","Update ring|Update experience and timing controls.;Feature update|Target operating-system release.;Quality update|Servicing and security update.",
"Different policy types control rollout experience, feature version and quality servicing.",
"Deploy patches to pilot laptops before a broad rollout, with predictable restarts.",
"Configure pilot update ring, evaluate target release and monitor deployment/restart evidence","Force all updates and restarts immediately across the company","Use a compliance policy as a substitute for update management",
"Pilot receives applicable update, installs it and reports expected restart state","A ring was created but no device received it","Only the device name is checked",
"Inspect eligibility, safeguards, deferrals, deadlines, restarts and report freshness.","Windows update pilot ring"],
[20,"Endpoint analytics and Remediations","Endpoint analytics|Supported device-experience signals.;Detection script|Determines whether a specified problem exists.;Remediation script|Attempts a defined corrective action.",
"Experience telemetry and repair scripts answer different operational questions.",
"Use the official temporary-file detection and remediation example as a lab-only design reference.",
"Review both scripts, restrict to a disposable pilot and validate pre/post state without removing unrelated data","Deploy an unreviewed cleanup script to every employee","Treat a startup score as proof of every repair",
"Detection identifies intended condition; simulated repair resolves it and re-detection confirms outcome","Script is uploaded but never evaluated","All files are removed indiscriminately",
"Check entitlement, assignment, execution context, output, return code and data safety.","Analytics and pilot remediation design"],
[22,"Troubleshooting blade","Troubleshooting blade|User-focused management and assignment diagnostics.;MDM event log|Device policy/enrollment events.;Service health|Cloud service availability and incidents.",
"An evidence-based investigation isolates the affected control plane.",
"A pilot user reports an assigned setting is absent on their enrolled device.",
"Inspect user/device assignment, status, last contact and local logs before changing settings","Delete all policies and start over","Disable every security policy to test the symptom",
"Trace identifies the failing setting and affected assignment; narrow correction and recheck","A tenant-wide change happens without diagnosis","A successful sign-in alone proves MDM policy application",
"Check service health, connectivity, group membership, filters and relevant local events.","Documented incident investigation"]
],
[
[13,"Microsoft Store apps","Store app (new)|Current Intune integration for supported Microsoft Store apps.;Required|Assigned for managed installation.;Available|Offered for user self-service where supported.",
"Assignment intent affects the delivery and support experience.",
"Publish a supported Store productivity app to the pilot group.",
"Select current Store app integration, assign appropriate intent and confirm installation state","Use retired Store for Business synchronization","Create a compliance rule to install the app",
"Pilot shows applicable assignment and expected install or Company Portal availability","App is listed in Store but not assigned","A package name proves installation",
"Review support, assignment, store access, install context and app status.","Store application assignment"],
[13,"Package and deploy Win32","IntuneWinAppUtil|Microsoft tool for wrapping installer content.;intunewin|Wrapped Win32 package.;Detection rule|Determines installed state.",
"Reliable application delivery needs packaging, execution and detection evidence.",
"Package a fictional signed application from a clean source folder and target only pilot devices.",
"Wrap installer with Content Prep Tool; specify tested install/uninstall and version-specific detection","Upload an arbitrary folder containing personal files","Consider installer exit code alone sufficient proof",
"Expected version exists, detection matches and Intune reports success","Only package upload succeeded","Detection checks the wrong version",
"Review trusted source, requirements, context, exit code and IME logs.","Win32 package and deployment evidence"],
[14,"Microsoft 365 Apps","Deployment configuration|Selected applications, architecture and update options.;Architecture|32-bit or 64-bit app compatibility.;Update channel|Servicing release cadence.",
"Correct Office configuration avoids unnecessary components and compatibility conflicts.",
"Pilot devices require selected Microsoft 365 desktop apps and defined servicing behavior.",
"Configure supported app suite, architecture, channel and scoped assignment","Install both architectures blindly","Use a Store for Business connector to deploy Office",
"Pilot has intended apps, architecture and update configuration","App suite appears in portal only","Unrelated Office installation proves the new configuration",
"Inspect preexisting installs, disk/network conditions, assignment and app deployment reporting.","Microsoft 365 Apps configuration"],
[34,"Enterprise App Catalog","Enterprise App Management|Intune capability for catalog-based app management.;Catalog app|Supported prepackaged application entry.;Entitlement|License permission for the capability.",
"Catalog packaging can simplify maintenance but does not eliminate testing or licensing.",
"Evaluate an enterprise app catalog candidate without activating a trial.",
"Compare catalog metadata, applicable licenses and pilot assignment design using simulated data","Start a paid add-on automatically","Assume catalog apps never need detection or deployment monitoring",
"Plan documents license eligibility, app version and pilot results required before release","Menu visibility is treated as proof of entitlement","All apps deploy automatically without assignment",
"Check feature licensing, catalog entry version, assignment and deployment evidence.","Catalog app deployment design"],
[13,"App supersedence","Supersedence|Relationship indicating a newer Win32 app replaces or updates another.;Uninstall previous|Option affecting removal behavior.;Dependency|Required supporting application relationship.",
"Upgrade relationships must protect existing user data and prevent conflicting installations.",
"Upgrade a fictional app from v1 to v2 for enrolled pilot devices.",
"Configure tested supersedence behavior and detection for both versions; pilot before expanding","Uninstall every app on every device first","Treat dependency and supersedence as identical",
"Pilot reaches intended v2, v1 remains or is removed according to design and user data is preserved","Both versions are present but no outcome is verified","Package upload alone proves upgrade",
"Check assignment intent, supersedence options, return codes and version detection.","Version upgrade relationship"],
[15,"App protection policy","MAM|Application-level management.;APP|App protection policy for supported apps.;Data transfer restriction|Controls allowed flow of organizational data.",
"Protect work data on supported personal devices without assuming full MDM.",
"BYOD employees need work mail; protect corporate content without wiping personal files.",
"Assign supported APP to pilot users and verify work-data transfer boundaries","Wipe each personal phone","Deploy a Windows firewall profile to the mobile app",
"Managed work data follows configured transfer behavior; personal content remains outside policy scope","App policy exists but user never receives it","All personal data is removed",
"Check platform support, app SDK integration, user assignment and app-based access requirements.","BYOD data protection policy"],
[22,"App deployment monitoring","IME|Intune Management Extension.;Install status|Reported deployment state.;Detection|Proof of installed app state.",
"Installation, assignment and detection are separate stages.",
"A Win32 install returns success but Intune reports not detected.",
"Compare actual installed file/version with detection rule and IME log","Reset every laptop","Change an unrelated Conditional Access rule",
"Repaired detection matches actual intended app version and report reflects success","Installer exit code alone is treated as final result","All protection policies are turned off",
"Inspect IME logs, context, requirements, return codes and per-device app result.","Resolved app deployment ticket"]
],
[
[17,"Defender for Endpoint integration","MDE|Microsoft Defender for Endpoint threat detection and response.;Connector|Service integration exchanging supported signals.;Onboarding|Registers endpoint for security monitoring.",
"Intune configuration and Defender telemetry are complementary.",
"Plan to onboard authorized Windows pilot devices and assess risk signals.",
"Check licensing and service integration, use supported onboarding and verify sensor/device status","Disable Defender Antivirus to connect the service","Assume an Intune device is already onboarded to MDE",
"Pilot has expected Defender device presence and healthy onboarding signal","A connector appears but no device reports","Compliance alone proves no threats",
"Inspect service connection, sensor status, permissions, network and onboarding eligibility.","MDE integration and pilot onboarding design"],
[17,"Endpoint security policies","ASR|Attack surface reduction rules.;Firewall|Network traffic control.;Baseline|Recommended versioned security settings.",
"Layered endpoint controls need scoped compatibility tests.",
"Set antivirus, firewall and ASR protections for the pilot.",
"Configure applicable security profiles, compare overlapping settings and test audit/block behavior","Disable all controls for application compatibility","Apply conflicting baselines without reviewing settings",
"Policy results and local settings match; affected applications validated","Policy is named secure but no device verifies it","Every application is blocked without review",
"Review per-setting results, rule events, policy conflict and narrowly scoped exceptions.","Layered endpoint security baseline"],
[16,"BitLocker encryption","BitLocker|Windows volume encryption.;Recovery key|Protected material used to recover locked data.;TPM|Hardware-backed security module on supported devices.",
"Encryption protects data at rest; recovery access is a separate security responsibility.",
"Require encryption on corporate pilot laptops without losing recovery capability.",
"Assign supported disk encryption settings and verify encryption and authorized escrow","Require compliance alone and assume encryption starts","Publish recovery keys in a shared worksheet",
"Local volume reports encrypted and authorized recovery-key evidence exists without exposing secret","Policy created but encryption not started","User knows a recovery key so policy is presumed applied",
"Check TPM readiness, disk state, prerequisites, existing encryption and recovery escrow.","Pilot encryption and recovery verification"],
[34,"Microsoft Tunnel Gateway","Tunnel|Secure access path to applicable internal resources.;Gateway|Server providing the tunnel service.;VPN profile|Client settings for a supported connection.",
"Tunnel requires server, client, network, authentication and entitlement planning.",
"Design access to an internal mobile application without purchasing infrastructure.",
"Document supported gateway, TLS/network prerequisites and client policy; simulate connection verification","Provision billable servers without authorization","Assume Tunnel is a replacement for Conditional Access",
"Simulated client establishes expected access path and unavailable/internal resource test behaves correctly","Gateway is named but no client path exists","All internal services are exposed publicly",
"Inspect gateway health, certificate trust, routes, client prerequisites and authentication.","Tunnel architecture and connection evidence design"],
[34,"Microsoft Cloud PKI","PKI|Public key infrastructure issuing and trusting certificates.;CA|Certificate authority.;SCEP|Certificate enrollment protocol supported by applicable profiles.",
"Certificate issuance and trust enable identity-based authentication without sharing secrets.",
"Plan certificate issuance for supported pilot endpoints using no paid trial.",
"Design CA hierarchy, trusted certificate and applicable enrollment profile with scoped assignment","Export a CA private key to every device","Use an unrelated Store app for certificate enrollment",
"Simulated certificate chain validates, expected subject and validity are correct, authorized enrollment confirmed","Only the profile name is checked","Private keys are disclosed to prove success",
"Inspect trust chain, subject/SAN, profile assignment, licensing and issuance status.","Cloud PKI architecture and validation design"],
[20,"Security posture monitoring","Risk signal|Indicator used in security decisions.;Compliance report|Reported policy evaluation.;Incident|Security investigation grouping related evidence.",
"Operational security requires correlating different signals rather than relying on a single green metric.",
"Review a fictional device that is compliant but has a high-risk Defender alert.",
"Investigate incident and risk signal with device identity and timestamp; apply approved containment as appropriate","Ignore the alert because compliance is green","Turn off all access controls for the fleet",
"Incident evidence, affected device and justified response recorded; recheck risk and access","Compliance alone is considered incident closure","An unrelated alert is resolved",
"Check time, data freshness, MDE integration, policy thresholds and incident owner.","Security posture review"]
],
[
[24,"Microsoft Graph PowerShell","Graph|Microsoft cloud API surface.;SDK|Software development kit wrapping API operations.;Permission scope|Authorized access boundary.",
"Programmatic inventory can improve consistency, but every operation has permission and impact.",
"Collect an inventory of managed pilot devices with no writes.",
"Use documented read-only Graph permission and SDK query; handle paging and redact exports","Grant broad write/delete access to inventory script","Hard-code a tenant admin password in source",
"Read-only result lists expected device identifiers and status; access and pagination validated","A token is printed in a public log","The script deletes records after reading",
"Check SDK module, consent, endpoint version, throttling and 401/403 responses.","Read-only inventory design"],
[24,"Deploy Remediations","Detection|Evaluates a specific condition.;Exit code|Script result signal.;Remediation|Targeted corrective script paired with detection.",
"Idempotent repairs and safe targeting reduce unintended side effects.",
"A known configuration drift needs a recurring approved pilot correction.",
"Design detect/repair scripts with limited scope, test failure/success branches and review output","Run arbitrary code from an unknown download as admin","Remediate all devices before knowing which are affected",
"Only intended drift is corrected; repeat detection confirms normal state without unrelated changes","Script reports success but drift remains","Every device is modified regardless of condition",
"Check script context, exit code, encoding, assignment, schedule and license.","Controlled remediation package design"],
[27,"Department helpdesk delegated access","RBAC|Role-based access control.;Scope group|Population a role assignment can manage.;Scope tag|Visibility boundary for applicable objects.",
"Authorization requires actual positive and negative access testing.",
"Give the pharmacy support team only approved actions on the department population in the fictional company.",
"Create scoped assignment, tag relevant objects and validate with a non-global test admin","Use the same Global Administrator account for testing","Assume tag alone creates permissions",
"Authorized test action succeeds in scope and equivalent out-of-scope action is denied","All device objects are visible and editable","Global Admin access is used as proof delegation works",
"Check role permissions, scope group membership, tags and administrator role overlap.","Pharmacy-style helpdesk authorization evidence"],
[41,"Audit logs and operational health","Audit log|Record of administrative changes.;Service health|Known cloud incidents.;Change record|Documented approval, purpose and outcome.",
"Auditability helps identify who changed what and whether a widespread issue is service-related.",
"A pilot policy changed unexpectedly just before failures began.",
"Correlate authorized audit events, policy changes, service health and device timestamps","Delete audit history to reduce clutter","Assume the latest admin to sign in caused the incident",
"Relevant change, actor, timing, affected scope and safe response are documented","Only administrator names are listed","A rollback occurs before evidence is collected",
"Check audit retention/permissions, event timestamps and approved change records.","Change investigation record"],
[20,"Built-in Intune reports","Report|Aggregated or detailed management result.;Export|Portable report data.;Cohort|Defined comparison population.",
"Reports are useful only when the metric, population and freshness are understood.",
"Prepare a pilot rollout readiness report for management.",
"Compare enrollment, app, policy, compliance and update evidence for the target cohort","Mix all tenant devices and declare pilot complete","Export recovery secrets as part of the report",
"Report states denominators, timestamps, failure cases and evidence-backed next action","A screenshot of total device count is the only artifact","No failures or missing devices are investigated",
"Check report delay, stale devices, filters, data source and authorized export scope.","Pilot readiness report"]
],
[
[33,"Endpoint Privilege Management","EPM|Managed elevation for supported Windows scenarios.;Elevation rule|Criteria authorizing elevated execution.;Standard user|Account without permanent local administrator privileges.",
"Controlled elevation can support specific business tasks without granting broad privilege.",
"Design an approved installer elevation workflow for a standard pilot user.",
"Review publisher/file criteria, choose scoped elevation behavior and simulate approved/denied cases","Make every employee a local administrator","Allow every executable to elevate silently",
"Approved process elevates as designed; unrelated executable is denied; audit evidence retained","All applications run as admin","The menu appears but no test is performed",
"Check entitlement, client support, rule matching, assignment and audit results.","EPM rule and negative test design"],
[33,"Remote Help","Remote Help|Supported remote assistance service.;Helper|Authorized support operator.;Sharer|User receiving support.",
"Remote support requires controlled identity, permissions, consent and audit.",
"Plan a helpdesk assistance session for an authorized test user.",
"Verify entitlement, roles and client setup; model consent and permitted session actions","Start unconsented remote control of personal endpoints","Share a global admin password with a technician",
"Authorized helper and sharer complete modeled session with consent and audit record","Any external person can control devices","Only a screen screenshot proves authorization",
"Check client availability, permission, licensing, connectivity and session consent.","Remote Help workflow and audit design"],
[35,"Advanced Analytics and Device Query","Advanced Analytics|Additional supported device-experience insights.;Device Query|Supported device-data query capability.;KQL|Query language used by relevant Microsoft data surfaces.",
"Query results depend on eligibility, permissions, data source and freshness.",
"Investigate which pilot devices show repeated app crashes or a missing app using sample data.",
"Select appropriate supported query/report surface, target pilot and interpret returned rows","Query all secrets across the fleet","Assume every KQL table exists in every product",
"Result identifies affected cohort with timestamps and query limitations stated","An empty result is treated as proof of health","A query is copied without checking schema",
"Check feature entitlement, eligible devices, table/schema, permissions and stale telemetry.","Advanced query investigation"],
[32,"Windows 365 provisioning","Cloud PC|A persistent cloud-hosted Windows desktop.;Provisioning policy|Defines configuration for eligible Cloud PC creation.;Assignment|Targets eligible licensed users/groups.",
"Cloud PCs and physical endpoints use related management but different provisioning.",
"Design a Cloud PC for a remote employee without assigning a paid license.",
"Map user eligibility, provisioning policy, network/image choice and enrollment evidence","Provision a billable Cloud PC to test a menu","Assume a local Windows VM automatically becomes a Cloud PC",
"Simulated eligible user gets expected Cloud PC configuration and management state","Subscription is purchased without authorization","A physical device is mislabeled as Cloud PC",
"Check license, policy targeting, provisioning status, network and supported images.","Windows 365 provisioning design"],
[25,"Azure Virtual Desktop session host enrollment","AVD|Azure-hosted virtual desktop and app delivery service.;Host pool|Collection of session hosts.;Session host|Virtual machine hosting user sessions.",
"AVD management differs by host OS, join and enrollment scenario.",
"Plan a supported Intune-managed session-host scenario without creating Azure resources.",
"Identify host pool, OS/join support, enrollment requirements, user access and cost boundary","Deploy paid Azure hosts without approval","Assume all multi-session and single-session settings are identical",
"Architecture records supported management path, assignment limits and required validation","A Cloud PC is assumed identical to an AVD pool","Azure consumption occurs before approval",
"Check supported platform, join, enrollment, assignment applicability and virtual desktop access design.","AVD session-host management design"]
]
];
const support=[
[2,"SC-900: identity and security fundamentals","https://microsoftlearning.github.io/SC-900-Microsoft-Security-Compliance-and-Identity-Fundamentals/","Identity|A representation of a principal.;Authentication|Verifies identity.;Authorization|Evaluates permitted access.","Read identity, Conditional Access, PIM and Defender portal exercises. Distinguish identity proof, permission and device trust.","Match MFA to identity proof, Intune compliance to device evaluation and Entra CA to access decisions.","MFA verifies identity; compliance evaluates device; CA applies access policy.","No new tenant or Azure infrastructure."],
[2,"MS-102: tenant users, groups, licenses and health","https://github.com/MicrosoftLearning/MS-102T00-Microsoft-365-Administrator-Essentials","Tenant|Organization-specific cloud directory/service boundary.;License|Entitlement.;Service health|Reported service incidents.","Use user/group and health exercises as references, not broad lab administrator assignments.","Create a fictional licensing matrix and investigate a simulated service incident before changing policy.","Expected user entitlement, scope and health evidence are documented.","No account creation, domain registration or service requests."],
[3,"SC-300: directory roles, group licensing and hybrid identity","https://microsoftlearning.github.io/SC-300-Identity-and-Access-Administrator/","Group-based licensing|License assignment driven by eligible group membership.;Hybrid identity|Identity integrating on-premises and cloud directory.;Directory role|Administrative permission set.","Use labs 01–03 and optional hybrid lab 07 for identity context.","Distinguish group membership, licensing, role eligibility and device join using a test user.","Four states separately verified; no broad role assigned.","No synchronization setup in a real tenant."],
[12,"SC-300: MFA, Conditional Access and PIM","https://microsoftlearning.github.io/SC-300-Identity-and-Access-Administrator/","PIM|Privileged Identity Management enabling controlled role activation.;Report-only|Access-policy evaluation without enforcing grant/block controls.;Emergency access|Protected recovery account.","Use authentication, conditional access and governance labs 08, 13, 14 and 26.","Plan a report-only pilot with appropriate exclusions and verify allowed/blocked hypothetical sign-ins.","Sign-in evaluation and least-privilege eligible activation are separate from device management.","No live enforcement or privilege changes."],
[23,"AZ-040: PowerShell command discovery","https://microsoftlearning.github.io/AZ-040T00-Automating-Administration-with-PowerShell/","Cmdlet|A PowerShell command.;Parameter|Named input to a command.;Object|Structured output with properties.","Modules 1–3: discovery, local administration and object pipeline.","Use Get-Command, Get-Help, Get-Member and filtering on sample output.","Explain a cmdlet, parameter, property and filtered output.","The terminal below simulates safe commands."],
[23,"AZ-040: CIM, arrays, variables and scripts","https://microsoftlearning.github.io/AZ-040T00-Automating-Administration-with-PowerShell/","CIM|Common Information Model for management information.;Array|Ordered collection.;Hashtable|Key/value mapping.","Modules 4–7: providers/drives, CIM/WMI and scripting; favor documented modern cmdlets.","Read OS information and filter a small object collection; design script input validation.","Read-only OS data and predictable output; no arbitrary execution.","No remote execution or scheduled jobs."],
[24,"Official Microsoft Graph Intune samples","https://github.com/microsoft/mggraph-intune-samples","Delegated permission|Acts on behalf of a signed-in user.;Application permission|Acts as application identity.;Paging|Multiple response pages.","Study read-only inventory examples first; sample repository includes writes and legacy prerequisites, so independently check current SDK and permissions.","Model a managed-device GET and explain scope, pagination and 403.","Read-only records with clear scope and redacted export.","No tokens, consent, tenant API calls or sample execution."],
[13,"Official Win32 Content Prep Tool","https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool","Source folder|Contains only intended setup files.;Setup file|Installer entry point.;Output folder|Separate location receiving wrapped package.","Study tool help and source/output separation.","Practice IntuneWinAppUtil command syntax in simulation; review detection and uninstall design.","A simulated .intunewin filename is produced; no actual installer or package generated.","No binary downloads or installer execution."],
[17,"SC-200: Defender XDR and endpoint investigations","https://microsoftlearning.github.io/SC-200T00A-Microsoft-Security-Operations-Analyst/","XDR|Cross-domain detection and response.;Alert|Security detection signal.;Incident|Correlated investigation.","Use learning paths 1 and 4 to study Defender evidence and incident workflow.","Investigate a sample device alert, correlate device ID, time and incident status.","Document a justified response without weakening endpoint protection.","No attack simulation, malicious payload or paid service."],
[35,"SC-200: KQL query reasoning","https://microsoftlearning.github.io/SC-200T00A-Microsoft-Security-Operations-Analyst/","KQL|Query language for supported Microsoft datasets.;where|Filters rows.;project|Selects columns.","Use learning path 5 for query structure; distinguish Sentinel schema from Defender and Intune query surfaces.","Filter fictional device data and project only relevant fields.","Expected matching rows and correct explanation of missing data.","No Sentinel workspace or Azure consumption."],
[15,"SC-401: endpoint data loss prevention","https://microsoftlearning.github.io/SC-401T00-Information-Security-Administrator/","DLP|Data loss prevention.;Sensitive information type|Pattern describing sensitive data.;Sensitivity label|Classification and optional protection metadata.","Use information protection and endpoint DLP modules; Purview is not Intune MAM.","Design a test policy in audit/simulation for restricted handling of sample sensitive data.","Differentiate device management, app protection and Purview data policies.","No real sensitive data or Purview license changes."],
[15,"SC-5003: classification and DLP workshop","https://microsoftlearning.github.io/SC-5003_Information-protection-and-Data-Loss-Prevention/","Classification|Identification of data category.;Published label|Label made available to targeted users.;Policy match|Content/activity meeting rule criteria.","Use exercises 1–3: custom information type, label publishing and DLP design.","Create a fictional classification/label mapping and test expected allowed/blocked activity on paper.","Policy scope, test evidence and user impact are documented.","No real policy creation."],
[32,"AZ-140: virtual desktop architecture","https://microsoftlearning.github.io/AZ-140-Configuring-and-Operating-Microsoft-Azure-Virtual-Desktop/","Host pool|Collection of session hosts.;Session host|VM running user sessions.;Autoscaling|Changes capacity according to configured rules.","Review Entra and AD DS architecture variants and monitoring concepts.","Draw an AVD architecture, identify join/enrollment and distinguish Cloud PC from pooled sessions.","Supported management design and cost considerations are explicit.","No host deployment, scaling or Azure billing."]
];
const H=v=>esc(String(v??''));
const store=()=>{state.officialLabs ||= {v:1,done:{},draft:{},support:{},terminal:[],notes:{}};return state.officialLabs};
const exercises=raw.flatMap((g,gi)=>g.map((a,ei)=>({id:`${gi+1}.${ei+1}`,group:gi,index:ei,a})));
const find=id=>exercises.find(x=>x.id===id);
const progress=()=>exercises.filter(x=>store().done[x.id]).length;
const allowed=id=>{const i=exercises.findIndex(x=>x.id===id);return i===0||i>0&&exercises.slice(0,i).every(x=>store().done[x.id])};
const btn=(r,t)=>`<button type="button" class="btn" data-route="${H(r)}">${H(t)}</button>`;
const external=(u,t)=>`<a href="${H(u)}" target="_blank" rel="noopener noreferrer">${H(t)} ↗</a>`;
const vocab=s=>s.split(/;(?=[^;|]+\|)/).map(t=>{const [a,b]=t.split('|');return `<div class="concept"><b>${H(a)}</b><p>${H(b)}</p></div>`}).join('');
const refFor=g=>root+"Instructions/Labs/"+groups[g][2];
const artifactList=()=>exercises.filter(x=>store().done[x.id]).map(x=>`<li><b>${H(x.id)}</b> ${H(x.a[12])}</li>`).join('');
function overview(){
let s=store();return `<section class="card"><div class="super">MD-102 · official Microsoft lab companion · November 2026</div><h1>One connected enterprise practice sequence</h1><p>Learn from Microsoft's six official labs in the original order, but work through original, safe decision-and-evidence exercises in this academy. Microsoft lists 590 minutes for the actual labs; our practice time is separate. Start with foundational lessons, then use the guided exercises alongside the simulator. No real tenant operations occur here.</p><p><b>${progress()}/35</b> simulated checkpoints passed · <b>${Object.keys(s.support).filter(k=>s.support[k]).length}/13</b> supporting study reviews completed.</p><progress max="35" value="${progress()}"></progress><p>${external(root,'Microsoft official lab index')} · ${external(docs,'Current MD-102 skills guide')} · ${external('https://microsoftlearning.github.io/lab-explorer/','Lab Explorer')}</p><p>These are educational simulations of decisions and evidence, not Microsoft's hosted training VMs, not a high-fidelity recreation of every portal task, and not proof of live administration. Do not activate trial licenses or deploy resources unless separately authorized.</p></section>${groups.map((g,i)=>`<section class="card section"><h2>Lab ${i+1} · ${H(g[0])}</h2><p>${g[1]} minutes in Microsoft's original lab · ${raw[i].length} adapted checkpoints · ${external(refFor(i),'Official instructions')}</p><div class="tiles">${exercises.filter(x=>x.group===i).map(x=>`<button class="tile" data-route="official-lab:${H(x.id)}"><b>${H(x.id)} · ${H(x.a[1])}</b><p>${s.done[x.id]?'✓ Passed':allowed(x.id)?'Ready to practice':'Locked until earlier checkpoints pass'}</p></button>`).join('')}</div></section>`).join('')}<section class="card"><h2>Your simulated company evidence ledger</h2><p>Artifacts accumulate when both decisions in a checkpoint are correct. These are fictional completion records, not actual policies or device telemetry.</p>${progress()?`<ol>${artifactList()}</ol>`:'<p>No checkpoints passed yet.</p>'}</section><section class="card section"><h2>Supporting official repositories — integrated study</h2><p>These supplements are mapped to existing lessons. Study them at the relevant lesson rather than as unrelated certifications.</p><div class="tiles">${support.map((a,i)=>`<button class="tile" data-route="official-support:${i}"><b>${H(a[1])}</b><p>Lesson ${a[0]} · ${s.support[i]?'Reviewed':'Not reviewed'}</p></button>`).join('')}</div><p>${btn('official-terminal','Open practice terminal')}</p></section>`;
}
function ordered(x,phase){let n=exercises.indexOf(x)+phase;return [[0,1,2],[1,2,0],[2,0,1]][n%3]}
function showExercise(x){
let [lesson,title,terms,why,scenario,...rest]=x.a;
let s=store(),d=s.draft[x.id]||{},a=x.a;
let prev=exercises[exercises.indexOf(x)-1],next=exercises[exercises.indexOf(x)+1];
if(!allowed(x.id))return `<section class="card"><h1>${H(x.id)} · ${H(title)}</h1><p>Complete preceding checkpoints before this exercise. The official labs depend on the prior environment.</p>${btn('official-labs','Return to lab sequence')}${prev?btn('official-lab:'+prev.id,'Previous checkpoint'):''}<p>${external(refFor(x.group),'Read original Microsoft lab')}</p></section>`;
let options=(phase,offset)=>ordered(x,phase).map(i=>`<button class="answer ${d[phase]===i?'selected':''}" data-ol-choice="${H(x.id)}:${phase}:${i}" aria-pressed="${d[phase]===i}">${H(a[offset+i])}</button>`).join('');
let feedback=d.result===undefined?'':`<p role="status"><b>${d.result?'Checkpoint passed.':'Review and retry.'}</b> ${H(d.result?'Both the selected implementation and the validation evidence match the scenario.':`Appropriate action: ${a[5]}. Appropriate evidence: ${a[8]}.`)}</p>`;
return `<section class="card"><div class="super">Official-lab companion · exercise ${H(x.id)} · lesson ${lesson}</div><h1>${H(title)}</h1><p>${btn('official-labs','All labs')} ${btn('lesson:'+lesson,'Study prerequisite lesson')} ${external(refFor(x.group),'Microsoft original exercise instructions')}</p><h2>Vocabulary before action</h2>${vocab(terms)}<h2>What and why</h2><p>${H(why)}</p><h2>Workplace assignment</h2><p>${H(scenario)}</p><p><b>Prior simulated artifacts:</b> ${exercises.indexOf(x)} expected prerequisite checkpoints; ${progress()} total recorded. ${prev?H(prev.a[12]):'First exercise: no prior artifacts needed.'}</p><h2>Step 1 — choose your implementation</h2>${options(0,5)}<h2>Step 2 — choose proof of success</h2>${options(1,8)}<p><button class="btn primary" data-ol-submit="${H(x.id)}" ${d[0]===undefined||d[1]===undefined?'disabled':''}>Validate both decisions</button> ${s.done[x.id]?'✓ Saved to evidence ledger':''}</p>${feedback}<h2>When the result fails</h2><p>${H(a[11])}</p><p><b>Artifact after passing:</b> ${H(a[12])}</p><p><b>Real lab:</b> Follow the linked official steps only in an authorized, licensed disposable environment. Do not enable a new trial, upload secrets, run destructive scripts, or provision paid resources merely for practice.</p>${s.done[x.id]&&next?btn('official-lab:'+next.id,'Continue to next exercise') : ''}</section>`;
}
function showSupport(i){let a=support[i];if(!a)return overview();return `<section class="card"><h1>${H(a[1])}</h1><p>${btn('official-labs','All labs')} ${btn('lesson:'+a[0],'Open connected lesson')} ${external(a[2],'Official source')}</p><h2>Vocabulary</h2>${vocab(a[3])}<h2>Study scope</h2><p>${H(a[4])}</p><h2>Practice task</h2><p>${H(a[5])}</p><h2>Expected result</h2><p>${H(a[6])}</p><h2>Safety and licensing</h2><p>${H(a[7])}</p><p>Write your own explanation of why the expected result demonstrates success. This note is self-assessed, not automatically scored.</p><textarea data-ol-note="${i}" rows="5" style="width:100%" placeholder="My explanation and evidence...">${H(store().notes[i]||'')}</textarea><p><button class="btn primary" data-ol-review="${i}">${store().support[i]?'Reviewed ✓':'Save review'}</button></p>${[4,5,6,7,9].includes(i)?btn('official-terminal','Practice supported sample commands'):''}</section>`}
const commands=[
["Get-Command Get-CimInstance","CommandType Name\\n----------- ----\\nCmdlet      Get-CimInstance","Discovers a management-information cmdlet."],
["Get-Help Get-CimInstance -Examples","Examples: Get-CimInstance -ClassName Win32_OperatingSystem","Help explains syntax and supported examples."],
["Get-CimInstance -ClassName Win32_OperatingSystem","Caption: Microsoft Windows 11 Enterprise\\nVersion: 10.0 (fictional training data)","CIM retrieves structured OS information."],
["Get-CimInstance -ClassName Win32_OperatingSystem | Get-Member","TypeName: Microsoft.Management.Infrastructure.CimInstance\\nCaption   Property\\nVersion   Property","Get-Member describes object members."],
["Get-MgDeviceManagementManagedDevice -All","DeviceName         ComplianceState\\nLAB-W11-01         compliant\\nLAB-W11-02         noncompliant","Read-only Graph SDK example; real use requires documented device-management read permission."],
["GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices","HTTP 200 (simulated)\\nvalue: [{deviceName: LAB-W11-01}, {deviceName: LAB-W11-02}]","An HTTP GET retrieves records; actual paging and authentication must be handled."],
["IntuneWinAppUtil.exe -c C:\\Lab\\Source -s setup.msi -o C:\\Lab\\Output","Simulated output: C:\\Lab\\Output\\setup.intunewin","The wrapper consumes only intended installer content and writes to a separate output folder."],
["DeviceInventory | where ComplianceState == 'noncompliant' | project DeviceName","DeviceName\\nLAB-W11-02","Fictional table: where filters rows, project selects columns. This is not a real product table."]
];
function terminal(){return `<section class="card"><h1>Offline command reasoning terminal</h1><p>${btn('official-labs','Back to lab sequence')}</p><p>These eight allowlisted examples are string-matched against fictional output; this is not a PowerShell interpreter, Graph client, package builder, or KQL execution engine. It cannot access your files, tenant, or network. Choose or type a sample to study its purpose.</p><div class="tiles">${commands.map((c,i)=>`<button class="tile" data-ol-command="${i}"><code>${H(c[0])}</code></button>`).join('')}</div><form data-ol-terminal><label for="ol-command">Example command</label><input id="ol-command" name="command" style="width:100%" autocomplete="off"><button class="btn primary" type="submit">Simulate</button></form><div style="background:#172332;color:#e3f0fa;padding:16px;white-space:pre-wrap;font-family:monospace;overflow-wrap:anywhere">${store().terminal.map(t=>H(t)).join('\n\n')||'No commands entered.'}</div><button class="btn" data-ol-clear>Clear output</button></section>`}
function exec(input){let c=commands.find(x=>x[0].trim().toLowerCase()===input.trim().toLowerCase());store().terminal.push(c?`> ${c[0]}\n${c[1].replace(/\\n/g,'\n')}\nExplanation: ${c[2]}`:`> ${input.slice(0,200)}\nUnsupported example. Choose an allowlisted command. No code was executed.`);store().terminal=store().terminal.slice(-15);save();render()}
let prevRender=render;render=function(){let r=String(state.route||'');if(r==='official-labs'||r==='official-terminal'||r.startsWith('official-lab:')||r.startsWith('official-support:')){ $('sidenav').innerHTML=navSidebar();$('bladenav').innerHTML=modernBladeNav();$('coachroot').innerHTML='';$('content').innerHTML=r==='official-labs'?overview():r==='official-terminal'?terminal():r.startsWith('official-lab:')?(find(r.slice(13))?showExercise(find(r.slice(13))):overview()):showSupport(Number(r.slice(17)));return;}prevRender();let c=$('content');if(!c)return;if(r==='curriculum'||r==='academy-home')c.insertAdjacentHTML('afterbegin',`<section class="card"><h2>Official Microsoft lab companion</h2><p>35 connected practice checkpoints, 13 supporting source studies and an offline command terminal. ${progress()}/35 passed.</p>${btn('official-labs','Continue Microsoft lab practice')}</section>`);if(/^lesson:\d+$/.test(r)){let n=Number(r.slice(7)),related=exercises.filter(x=>x.a[0]===n),supp=support.map((x,i)=>({x,i})).filter(z=>z.x[0]===n);if(related.length||supp.length)c.insertAdjacentHTML('beforeend',`<section class="card"><h2>Official Microsoft practical references</h2>${related.map(x=>`<p>${btn('official-lab:'+x.id,x.id+' · '+x.a[1])} ${external(refFor(x.group),'Original instructions')}</p>`).join('')}${supp.map(z=>`<p>${btn('official-support:'+z.i,z.x[1])}</p>`).join('')}</section>`)}};let prevArea=activeArea;activeArea=function(){return String(state.route||'').startsWith('official-')?'academy':prevArea()};
try{LEARN_NAV.unshift(['official-labs','▤','Microsoft official lab companion']);BLADE_GROUPS.academy[0][1].unshift(['official-labs','Microsoft official lab companion'])}catch(e){console.warn('Official lab navigation',e)}
document.addEventListener('click',ev=>{let b=ev.target.closest('[data-ol-choice],[data-ol-submit],[data-ol-review],[data-ol-command],[data-ol-clear]');if(!b)return;let r=String(state.route||'');if(b.hasAttribute('data-ol-choice')){let [id,p,a]=b.dataset.olChoice.split(':');if(r!=='official-lab:'+id||!allowed(id)||!['0','1'].includes(p)||!['0','1','2'].includes(a))return;let d=store().draft[id] ||= {};d[p]=Number(a);delete d.result;save();render();return}if(b.hasAttribute('data-ol-submit')){let id=b.dataset.olSubmit;if(r!=='official-lab:'+id||!allowed(id))return;let d=store().draft[id];if(!d||d[0]===undefined||d[1]===undefined)return;d.result=d[0]===0&&d[1]===0;if(d.result)store().done[id]=true;save();render();return}if(b.hasAttribute('data-ol-review')){let i=Number(b.dataset.olReview);if(r!=='official-support:'+i||!support[i])return;let note=document.querySelector('[data-ol-note="'+i+'"]');if(note)store().notes[i]=note.value.slice(0,8000);if((store().notes[i]||'').trim().length<15){if(note){note.setCustomValidity('Write at least a short explanation before recording this self-review.');note.reportValidity()}return}store().support[i]=true;save();render();return}if(r==='official-terminal'){if(b.hasAttribute('data-ol-command')){let c=commands[Number(b.dataset.olCommand)];if(c)exec(c[0]);}else{store().terminal=[];save();render()}}});
document.addEventListener('input',ev=>{if(ev.target.hasAttribute('data-ol-note')){ev.target.setCustomValidity('');let i=Number(ev.target.dataset.olNote);if(String(state.route)==='official-support:'+i&&support[i]){store().notes[i]=ev.target.value.slice(0,8000);save()}}});
document.addEventListener('submit',ev=>{if(ev.target.hasAttribute('data-ol-terminal')){ev.preventDefault();if(state.route==='official-terminal'){let c=$('ol-command');if(c&&c.value.trim())exec(c.value)}}});
window.MD102OfficialLabs={groups,exercises,support,commands,allowed,progress,overview,showExercise,showSupport,store};
store();render();
})();
