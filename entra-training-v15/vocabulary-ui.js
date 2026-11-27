/* V15 Micro-to-Macro Vocabulary Microscope. One existing academy; no new backend, services or subscriptions. */
(function initV15Vocabulary(){
 const categoryNames=["Directory and identity","Authentication and access","Apps and workload identities","Governance, NIST and security operations"];
 const sources=[
  "https://learn.microsoft.com/en-us/entra/fundamentals/entra-admin-center",
  "https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview",
  "https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals",
  "https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview"
 ];
 const entries=[V15_DIRECTORY,V15_AUTH,V15_APPLICATIONS,V15_GOVERNANCE].flatMap((rows,category)=>rows.map((r,i)=>{
  if(r.length!==9||!r[0]||r.slice(1).some(x=>typeof x!=="string"||x.length<15))throw Error("Incomplete granular vocabulary entry "+category+"-"+i);
  const [term,definition,does,why,when,how,micro,macro,failure]=r;
  return {id:term.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),term,definition,does,why,when,how,micro,macro,failure,category,source:sources[category]};
 }));
 const termById=new Map(entries.map(x=>[x.id,x]));
 const expansions={
 "upn":"User Principal Name","rbac":"Role-Based Access Control","mfa":"Multi-Factor Authentication",
 "fido2":"FIDO2 — modern specifications from the FIDO (Fast IDentity Online) Alliance and W3C WebAuthn",
 "jwt":"JSON Web Token","kql":"Kusto Query Language","b2b-collaboration":"Business-to-Business collaboration",
 "saml":"Security Assertion Markup Language","openid-connect":"OpenID Connect (OIDC)",
 "scim-provisioning":"System for Cross-domain Identity Management (SCIM)",
 "privileged-identity-management":"Privileged Identity Management (PIM)",
 "temporary-access-pass":"Temporary Access Pass (TAP)",
 "siem":"Security Information and Event Management",
 "pkce":"Proof Key for Code Exchange",
 "http-403":"HTTP status 403: Forbidden",
 "microsoft-graph":"Microsoft Graph API (Application Programming Interface)"
 };
 const contrasts={
 "authentication":["authorization","Proves identity, not permission for a specific operation."],
 "authorization":["authentication","Determines permitted operations; authentication is evidence of identity."],
 "upn":["object-id","UPN can change and resembles a name; object ID identifies an exact directory record."],
 "object-id":["upn","Object ID references the directory record; UPN is used as a sign-in style name."],
 "application-registration":["enterprise-application","App registration describes a client; enterprise application manages a service principal inside a tenant."],
 "enterprise-application":["application-registration","Enterprise app is tenant-local; registration defines the app itself."],
 "mfa":["conditional-access","MFA is authentication proof; Conditional Access is policy evaluating when certain proof is needed."],
 "conditional-access":["mfa","CA evaluates signals and rules; MFA is one possible grant requirement."],
 "id-token":["access-token","ID token authenticates a user to a client; access token is for an API resource."],
 "access-token":["id-token","Access tokens target resources; ID tokens target the signing-in client."],
 "sign-in-risk":["user-risk","Sign-in risk concerns an event; user risk concerns likelihood the account itself is compromised."],
 "user-risk":["sign-in-risk","User compromise signal differs from event-specific anomaly signal."],
 "managed-identity":["application-registration","Managed identity uses platform-managed workload identity; typical app registrations require separate authentication design."],
 "resource-rbac":["rbac","Azure resource RBAC and Entra directory roles protect different resources and operations."],
 "guest-user":["member-user","Guest is commonly external collaboration; user type alone does not determine effective authorization."],
 "eligible-role":["role-activation","Eligible is potential privileged authority; activation provides time-limited current authority."],
 "access-package":["application-entitlement","Governed request/approval workflow differs from actual effective application authorization."]
 };

 if(termById.size!==entries.length)throw Error("Duplicate vocabulary term ID");
 const get=id=>termById.get(id);
 const alias={"CA":"conditional-access","PIM":"privileged-identity-management","UPN":"upn","MFA":"mfa","RBAC":"rbac","FIDO2":"fido2","TAP":"temporary-access-pass","OIDC":"openid-connect","SCIM":"scim-provisioning","OAuth":"oauth-2-0","JWT":"jwt","Graph":"microsoft-graph","AAL":"authentication-assurance-level","AU":"administrative-unit"};
 const flows=[
  {id:"who",title:"From one identity property to company-wide access",category:0,goal:"Understand exactly how a user, group, role and application entitlement relate—and why names are not permissions.",terms:["directory-object","object-id","upn","security-group","application-entitlement","least-privilege"],question:"A user is in the directory and can sign in, but Finance Reports denies access. What is the next question?",answer:"Is the correct user or group assigned to that enterprise application, and does the app allow the requested operation?"},
  {id:"signin",title:"Watch one sign-in from the first request to the app",category:1,goal:"Trace the request, identity proof, Conditional Access, token contents, app-side authorization and session.",terms:["sign-in","identity-provider","authentication","conditional-access","access-token","authorization","session-control"],question:"The user passes MFA but the application rejects them. Was authentication necessarily the problem?",answer:"No. Authentication succeeded. Check app assignments, token audience, resource permissions and application errors."},
  {id:"passkey",title:"Follow a passkey challenge at the microscopic level",category:1,goal:"Distinguish public keys, private keys, challenge signing, local user verification and phishing resistance.",terms:["credential","passkey","fido2","authentication-factor","passwordless","authentication-strength"],question:"Does the website receive the private key or face biometric?",answer:"No. A compatible authenticator signs the challenge locally; the relying service verifies using the registered public key."},
  {id:"policy",title:"Conditional Access: from one signal to enterprise policy",category:1,goal:"Understand why scope, control and enforcement state are separate.",terms:["sign-in-risk","policy-scope","grant-control","report-only","what-if","conditional-access","audit-log"],question:"You set Require MFA but the policy is Report-only. Why did the user not get an MFA prompt from that policy?",answer:"Report-only evaluates/logs the rule but does not enforce it. Other enforced policies can still impose requirements."},
  {id:"app",title:"App registration vs enterprise application vs service principal",category:2,goal:"See which object identifies the software, which object lives in a tenant, and where app assignments go.",terms:["application-registration","application-client-id","service-principal","enterprise-application","app-role","application-entitlement"],question:"Where do you investigate a user's app assignment, rather than the developer's app definition?",answer:"In the enterprise application/service principal for the consuming tenant, including user/group assignments and app roles."},
  {id:"graph",title:"Follow a Graph request from permission to 403",category:2,goal:"See why authentication, scope, consent and resource authorization are separate checks.",terms:["microsoft-graph","oauth-2-0","delegated-permission","scope","consent","access-token","http-403"],question:"Your token is valid but Graph returns 403. What does the 403 suggest?",answer:"The request did not meet required authorization. Check API scopes/roles, user permissions, resource rules and endpoint conditions."},
  {id:"managed",title:"A managed identity needs more than a token",category:2,goal:"Trace the identity, token and resource-level authorization for a payroll app.",terms:["managed-identity","service-principal","service-to-service-authentication","access-token","resource-rbac","least-privilege"],question:"A payroll workload has a token but Key Vault denies secret read. What is missing?",answer:"Likely an appropriate Key Vault-specific role/permission at the correct resource scope; do not grant subscription Owner."},
  {id:"guest",title:"One contractor: invitation to actual least-privilege access",category:3,goal:"Connect external identity, group, entitlement and negative-access verification.",terms:["b2b-collaboration","guest-user","cross-tenant-access-settings","security-group","enterprise-application","access-review","deprovisioning"],question:"The guest can open Vendor Portal. How do you prove they cannot see Finance Reports?",answer:"Inspect all direct app assignments and every group the guest belongs to, including old groups; test an actual denied operation."},
  {id:"lifecycle",title:"Joiner, mover, leaver across interconnected systems",category:3,goal:"Learn the difference between directory edits, actual SaaS provisioning and token/session cleanup.",terms:["joiner","source-of-authority","dynamic-membership","attribute-mapping","scim-provisioning","mover","leaver","deprovisioning"],question:"The Entra account is disabled but the SaaS session still works. Is offboarding finished?",answer:"No. Check token/session behavior, target SaaS account state, provisioning, entitlement and recovery evidence."},
  {id:"pim",title:"Eligible privilege is not active privilege",category:3,goal:"Understand how PIM, role scopes, approvals and audits work together.",terms:["rbac","role-assignment","eligible-role","privileged-identity-management","role-activation","audit-evidence"],question:"An engineer is eligible for a privileged role. Is every privileged action already allowed?",answer:"No. Eligibility ordinarily requires activation under policy before the role is active."},
  {id:"evidence",title:"What really happened: one failure across multiple logs",category:3,goal:"Separate app sign-in, directory changes, API permissions and security analytics.",terms:["sign-in","audit-log","correlation-id","microsoft-graph","http-403","kql","microsoft-sentinel"],question:"No Sentinel event is found. Does that prove the sign-in never happened?",answer:"No. Verify ingestion, workspace, table, retention, permissions and time window before drawing that conclusion."},
  {id:"architecture",title:"The full organization: people, services, decisions and governance",category:3,goal:"Follow security from small object values to organization-wide identity architecture.",terms:["directory-object","tenant","identity-provider","conditional-access","resource-rbac","identity-governance","zero-trust","audit-evidence"],question:"Can any single policy checkbox deliver Zero Trust for an enterprise?",answer:"No. It requires coordinated authentication, authorization, device/data controls, monitoring, lifecycle and response."}
 ];
 const preferred={
  "tenant-boundary":["tenant","directory-object","object-id","rbac","administrative-unit","role-assignment","global-administrator","least-privilege"],
  "user-lifecycle":["member-user","upn","license","source-of-authority","soft-delete","session-revocation","joiner","leaver"],
  "group-app-access":["security-group","application-entitlement","enterprise-application","group-owner","least-privilege","authorization"],
  "external-b2b":["b2b-collaboration","guest-user","cross-tenant-access-settings","cross-tenant-synchronization","access-review"],
  "hybrid-sync":["active-directory-domain-services","hybrid-identity","microsoft-entra-connect-sync","microsoft-entra-cloud-sync","source-anchor","source-of-authority"],
  "passwordless-recovery":["authentication-factor","mfa","passkey","fido2","windows-hello-for-business","temporary-access-pass","authentication-strength"],
  "ca-policy":["conditional-access","policy-scope","grant-control","report-only","what-if","session-control","compliant-device"],
  "risk-and-logs":["sign-in-risk","user-risk","audit-log","session-revocation","correlation-id","kql"],
  "app-federation":["application-registration","enterprise-application","service-principal","saml","openid-connect","oauth-2-0","single-sign-on"],
  "app-consent":["application-client-id","delegated-permission","application-permission","consent","admin-consent","microsoft-graph","scope"],
  "managed-workload":["managed-identity","system-assigned-managed-identity","user-assigned-managed-identity","resource-rbac","access-token"],
  "governance-package":["identity-governance","entitlement-management","access-package","access-review","catalog","expiration"],
  "pim-operations":["privileged-identity-management","eligible-role","role-activation","role-assignment","least-privilege"],
  "scim-monitoring":["scim-provisioning","attribute-mapping","audit-log","microsoft-sentinel","kql","deprovisioning"]
 };
 db.v15=db.v15||{reviewed:{},needsReview:{},notes:{},last:null,category:"All",query:"",flowProgress:{}};
 db.v15.anatomy=db.v15.anatomy||{};
 const memory=db.v15;
 const oldRender=render,oldShell=shell,oldAction=action,esc=s=>safe(String(s??""));
 const base="v15",link=id=>`${base}/term/${id}`;
 const currentTitle=()=>{const r=current();return r.startsWith("v15/term/")?get(r.split("/").at(-1))?.term:"Vocabulary Microscope";};
 const css=`<style>
 .v15{max-width:1220px;margin:0 auto}.v15-hero{border:1px solid #bfd8e7;border-radius:18px;padding:22px;background:linear-gradient(115deg,#e6f5fd,#fff);color:#1d405b}
 .v15-hero h1{margin:6px 0}.v15-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .v15-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px}
 .v15-item{border:1px solid #d4e3ec;border-radius:12px;background:var(--surface,#fff);padding:14px;min-width:0}
 .v15-item h3{margin:4px 0 7px}.v15-item p{margin:7px 0;font-size:13px;line-height:1.5}
 .v15-lenses{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .v15-lens{border:1px solid #cedfe9;border-radius:12px;padding:17px;background:var(--surface,#fff)}
 .v15-lens h3{color:#1b6084;margin:4px 0 10px;font-size:16px}.v15-lens p{line-height:1.65}
 .v15-micro{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:15px 0}
 .v15-micro>div{background:#f0f7fc;border:1px solid #bed7e7;border-radius:10px;padding:15px;color:#193d5b}
 .v15-micro strong{font-size:12px;color:#27567a}.v15-micro p{font-size:13px;line-height:1.5}
 .v15-decision{border:1px solid #b4d3e5;border-radius:12px;background:#eff8fc;padding:17px;color:#1d4b67}
 .v15-danger{border-left:4px solid #b77925;background:#fff6e9;padding:15px;border-radius:10px;color:#684315}
 .v15-form{border:1px solid #cbdfea;padding:15px;border-radius:12px;background:var(--surface,#fff)}
 .v15-inline{border:none;border-bottom:1px dotted #19759b;background:#e8f6fe;color:#154f7c;padding:0 3px;border-radius:3px;font-size:inherit;display:inline;cursor:pointer;font-weight:650;line-height:inherit}
 .v15-inline:hover,.v15-inline:focus-visible{background:#d3ebfb;outline:2px solid #6bacc8}
 .v15-modal{position:fixed;inset:0;background:rgba(13,31,48,.55);display:grid;place-items:center;z-index:10000;padding:16px}
 .v15-dialog{background:#fff;color:#173650;padding:22px;border-radius:16px;max-width:620px;width:100%;max-height:85vh;overflow:auto;box-shadow:0 15px 45px #0b274a55}
 .v15-flows{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
 .v15-flowline{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}.v15-flowline button{border-radius:10px;min-height:62px;padding:11px;border:1px solid #b8d3e5;background:var(--surface,#fff);color:inherit;font-weight:650}
 .v15-flowline button[aria-current=step]{background:#d9efff;border:2px solid #187eab;color:#164562}
 .v15-chip{display:inline-block;font-size:12px;padding:5px 9px;background:#edf5fb;border-radius:20px;margin:4px;border:1px solid #d4e5ed}
 .v15-filter{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
 .v15-filter button{min-height:42px}
 .v15-search{width:100%;min-height:48px;border:1px solid #adcadc;border-radius:12px;padding:12px;font-size:16px;background:#fff;color:#153650}
 .v15-crumb{font-size:13px;color:#486b80;margin:12px 0}
 .v15-crumb button{background:none;border:none;text-decoration:underline;cursor:pointer;color:#206d9a}
 @media(max-width:700px){.v15-cards,.v15-lenses{grid-template-columns:1fr}.v15-micro{grid-template-columns:1fr}.v15-flowline{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}
 </style>`;
 function catalog(){
  const category=memory.category||"All",query=String(memory.query||"").toLowerCase().trim();
  const list=entries.filter(e=>(category==="All"||categoryNames[e.category]===category)&&(!query||[e.term,e.definition,e.does,e.micro,e.macro,e.when,e.why].join(" ").toLowerCase().includes(query)));
  return `<div class="page v15">${css}<div class="v15-hero"><div class="eyebrow">VOCABULARY MICROSCOPE · BEGINNER → ENGINEER → ARCHITECT</div><h1>Understand every word before using the console</h1><p>Use the same words an identity engineer uses, but examine them at the smallest technical level and at enterprise scale. ${entries.length} distinct guided terms are defined. This is a structured foundation, not the entire Microsoft terminology universe.</p></div>
    <div class="grid3" style="margin:15px 0"><div class="panel"><div class="statnum">${entries.length}</div><div class="statlabel">Multi-layer technical explanations</div></div><div class="panel"><div class="statnum">${Object.keys(memory.reviewed).length}</div><div class="statlabel">Read and self-reviewed</div></div><div class="panel"><div class="statnum">${Object.keys(memory.needsReview).filter(x=>memory.needsReview[x]).length}</div><div class="statlabel">Marked for another explanation</div></div></div>
    <div class="v15-cards" style="margin:14px 0"><div class="panel"><h3>Start with the whole system</h3><p>Follow twelve interactive flows. Tap identity, groups, sign-in, tokens and policies to watch one decision from beginning to end.</p><button class="btn primary" data-route="v15/systems">Open system flow stories →</button></div><div class="panel"><h3>Continue an unfamiliar word</h3><p>Resume the last term, or review vocabulary you marked confusing. Progress is saved in this browser.</p><button class="btn" data-route="${memory.last?link(memory.last):"v15/term/identity"}">Resume my vocabulary →</button><button class="btn" data-route="v15/review">Words I still need to understand →</button></div></div>
    <div class="panel"><h3>Find a term by name or by meaning</h3><label for="v15-query">Search vocabulary, symptoms, definitions or system concepts</label><input class="v15-search" type="search" id="v15-query" value="${esc(memory.query||"")}" placeholder="Try: token, passkey, permission, why access denied" autocomplete="off"/>
     <div class="v15-filter">${["All",...categoryNames].map(c=>`<button class="btn ${category===c?"primary":""}" data-action="v15-filter" data-value="${esc(c)}">${esc(c)}</button>`).join("")}</div>
     <p class="small muted" id="v15-result-count">${list.length} matching concepts</p></div>
     <div class="v15-list" id="v15-list">${cards(list)}</div><div style="margin-top:15px">${footer()}</div></div>`;
 }
 function cards(list){
  return list.map(e=>`<article class="v15-item" data-v15-card><div class="eyebrow">${esc(categoryNames[e.category])}</div><h3>${esc(e.term)}</h3><p>${esc(e.definition)}</p><p class="small muted"><b>Why:</b> ${esc(e.why)}</p><button class="btn primary" data-route="${link(e.id)}">Explain it from micro to macro →</button> ${memory.needsReview[e.id]?'<span class="v15-chip">Revisit</span>':""}</article>`).join("");
 }
 function anatomySection(e){
  const a=V15_ANATOMY.find(x=>x[0]===e.id);if(!a)return "";
  const selected=Number(memory.anatomy?.[e.id]||0),idx=Math.max(0,Math.min(a[2].length-1,selected)),part=a[2][idx];
  return `<div class="panel" style="margin-top:15px"><div class="eyebrow">UNDER THE MICROSCOPE · CLICK ANY FIELD</div>
    <h3>Dissect an actual-looking ${esc(e.term)} example</h3><p class="small muted">Fictional or schematic example. No real Microsoft secret, token or customer identity is used.</p>
    <div class="v15-decision" style="overflow-wrap:anywhere"><code>${esc(a[1])}</code></div>
    <div class="v15-flowline">${a[2].map((p,i)=>`<button data-action="v15-part" data-id="${e.id}" data-index="${i}" aria-current="${idx===i?"step":"false"}">${i+1}. ${esc(p[0])}</button>`).join("")}</div>
    <div class="v15-decision" role="status"><b>${esc(part[0])}</b><p>${esc(part[1])}</p></div>
    <p><b>What can go wrong:</b> ${esc(a[3])}</p></div>`;
 }
 function termPage(e){
  if(memory.last!==e.id){memory.last=e.id;save();}
  const nearby=entries.filter(x=>x.category===e.category&&x.id!==e.id).slice(Math.max(0,entries.filter(x=>x.category===e.category).indexOf(e)-2),Math.max(0,entries.filter(x=>x.category===e.category).indexOf(e)-2)+4).slice(0,3);
  const paired=flows.filter(f=>f.terms.includes(e.id));
  const related=Object.entries(preferred).filter(([,ids])=>ids.includes(e.id)).slice(0,4);
  return `<div class="page v15">${css}<div class="v15-crumb"><button data-route="v15/vocabulary">All vocabulary</button> › ${esc(categoryNames[e.category])} › ${esc(e.term)}</div><div class="v15-hero"><div class="eyebrow">IDENTITY ENGINEERING VOCABULARY · ${esc(categoryNames[e.category])}</div><h1>${esc(e.term)}</h1>${expansions[e.id]?`<p><b>Full name:</b> ${esc(expansions[e.id])}</p>`:""}<p style="font-size:17px">${esc(e.definition)}</p></div>
   <div class="v15-micro"><div><strong>MICRO · ONE OBJECT / FIELD / EVENT</strong><p>${esc(e.micro)}</p></div><div><strong>MIDDLE · HOW IT OPERATES</strong><p>${esc(e.does)}</p></div><div><strong>MACRO · THE ORGANIZATION</strong><p>${esc(e.macro)}</p></div></div>
   <div class="v15-lenses">
    <section class="v15-lens"><div class="eyebrow">01 · WHAT IS IT?</div><h3>Start with the meaning</h3><p>${esc(e.definition)}</p></section>
    <section class="v15-lens"><div class="eyebrow">02 · WHAT DOES IT ACTUALLY DO?</div><h3>Its function in a real system</h3><p>${esc(e.does)}</p></section>
    <section class="v15-lens"><div class="eyebrow">03 · WHY DOES IT EXIST?</div><h3>The problem it solves</h3><p>${esc(e.why)}</p></section>
    <section class="v15-lens"><div class="eyebrow">04 · WHEN WOULD I USE IT?</div><h3>Recognize the situation</h3><p>${esc(e.when)}</p></section>
    <section class="v15-lens"><div class="eyebrow">05 · HOW DOES IT WORK / WHAT DO I DO?</div><h3>The operational sequence</h3><p>${esc(e.how)}</p></section>
    <section class="v15-lens"><div class="eyebrow">06 · WHAT GOES WRONG?</div><h3>What to diagnose first</h3><p>${esc(e.failure)}</p></section>
   </div>
   <div class="v15-decision" style="margin-top:15px"><b>Make the connections</b><p>${esc(e.micro)}</p><p><b>That allows:</b> ${esc(e.does)}</p><p><b>At company scale:</b> ${esc(e.macro)}</p></div>
   <div class="v15-danger" style="margin-top:15px"><b>Important distinction</b><p>${esc(e.failure)}</p></div>
   ${anatomySection(e)}
   ${contrasts[e.id]?`<div class="panel" style="margin-top:15px"><h3>Do not confuse these two words</h3><p><b>${esc(e.term)}</b> versus <button class="btn xs" data-route="${link(contrasts[e.id][0])}">${esc(get(contrasts[e.id][0])?.term||contrasts[e.id][0])}</button></p><p>${esc(contrasts[e.id][1])}</p></div>`:""}
   ${paired.length?`<div class="panel" style="margin-top:15px"><h3>Watch this word in a working system</h3>${paired.slice(0,3).map(f=>`<button class="btn" data-route="v15/system/${f.id}">${esc(f.title)} →</button>`).join(" ")}</div>`:""}
   <div class="panel" style="margin-top:15px"><h3>Now you explain it back</h3><p>Without looking at the explanation, describe what the term does, when you would need it, and how you would recognize an incorrect configuration. This is your own reflection, not an automatically graded certification assessment.</p>
    <form id="v15-reflection" data-id="${e.id}"><label class="field">My explanation in my own words<textarea name="notes" rows="4" maxlength="4000" placeholder="It is… It is used when… At the smallest level… In an organization… If wrong, I would check…">${esc(memory.notes[e.id]||"")}</textarea></label>
    <button class="btn primary" type="submit">Save my explanation</button></form>
    <div class="flex wrap" style="margin-top:13px"><button class="btn" data-action="v15-review" data-id="${e.id}">I understand this explanation (self-review)</button><button class="btn" data-action="v15-confusing" data-id="${e.id}">${memory.needsReview[e.id]?"Remove from revisit list":"I need another explanation"}</button><span class="v15-chip">${memory.reviewed[e.id]?"Reviewed (not tested)":"Not reviewed yet"}</span></div></div>
   <div class="panel" style="margin-top:15px"><h3>Learn it in context</h3><p><b>Related lessons:</b> ${related.length?related.map(([id])=>`<button class="btn xs" data-route="v8/learn/${id}">${esc(V8_LESSONS.find(l=>l.id===id)?.title||id)}</button>`).join(" "):"Explore this term in the interactive systems or related Entra lessons."}</p>
    <p><b>Other related concepts:</b> ${nearby.map(x=>`<button class="btn xs" data-route="${link(x.id)}">${esc(x.term)}</button>`).join(" ")}</p><a class="btn" href="${e.source}" target="_blank" rel="noopener noreferrer">Verify in Microsoft Learn ↗</a><p class="small muted">Official documentation may require feature-specific licensing or updated navigation. This app does not connect to a real tenant.</p></div>
   ${footer()}</div>`;
 }
 function systems(){
  return `<div class="page v15">${css}<button class="btn" data-route="v15/vocabulary">← Vocabulary library</button><div class="v15-hero" style="margin-top:12px"><div class="eyebrow">VISUAL LEARNING · MICRO TO MACRO</div><h1>12 system stories: follow every decision</h1><p>Each step is a real concept used in the academy. Tap it, learn the small mechanism, then move to the organization-wide consequence.</p></div>
    <div class="v15-flows" style="margin-top:16px">${flows.map(f=>`<article class="v15-item"><div class="eyebrow">${esc(categoryNames[f.category])} · ${f.terms.length} technical stages</div><h3>${esc(f.title)}</h3><p>${esc(f.goal)}</p><button class="btn primary" data-route="v15/system/${f.id}">Walk through the flow →</button></article>`).join("")}</div>${footer()}</div>`;
 }
 function systemPage(f){
  const i=Number(memory.flowProgress[f.id]||0),currentIndex=Math.min(f.terms.length-1,Math.max(0,i)),e=get(f.terms[currentIndex]);
  return `<div class="page v15">${css}<button class="btn" data-route="v15/systems">← All twelve stories</button><div class="v15-hero" style="margin-top:12px"><div class="eyebrow">MICROSCOPIC → OPERATIONAL → ENTERPRISE</div><h1>${esc(f.title)}</h1><p>${esc(f.goal)}</p></div>
  <div class="panel" style="margin-top:16px"><h3>Tap each component of the flow</h3><div class="v15-flowline">${f.terms.map((t,j)=>`<button data-action="v15-flow" data-id="${f.id}" data-index="${j}" aria-current="${currentIndex===j?"step":"false"}">${j+1}. ${esc(get(t)?.term||t)}</button>`).join("")}</div>
  <div class="v15-decision" role="status"><div class="eyebrow">STEP ${currentIndex+1} OF ${f.terms.length}</div><h3>${esc(e.term)}</h3><p><b>What this means:</b> ${esc(e.definition)}</p><p><b>Exactly what happens:</b> ${esc(e.does)}</p><p><b>Smallest-level evidence:</b> ${esc(e.micro)}</p><p><b>Why the next stage needs it:</b> ${esc(e.why)}</p>
  <p><b>When something fails:</b> ${esc(e.failure)}</p><button class="btn" data-route="${link(e.id)}">Study this word in full →</button></div>
  <div class="flex wrap" style="margin-top:12px"><button class="btn" data-action="v15-flow-prev" data-id="${f.id}" ${currentIndex===0?"disabled":""}>← Previous stage</button><button class="btn primary" data-action="v15-flow-next" data-id="${f.id}" ${currentIndex===f.terms.length-1?"disabled":""}>Next stage →</button><button class="btn" data-action="v15-flow-replay" data-id="${f.id}">Replay this flow</button></div></div>
  <div class="panel" style="margin-top:15px"><h3>Think like an identity engineer</h3><p>${esc(f.question)}</p><details><summary>Show the engineering reasoning</summary><p>${esc(f.answer)}</p></details><p class="small muted">Reading the answer does not count as assessed mastery. Recreate the decision in an appropriate practice mission.</p></div>${footer()}</div>`;
 }
 function reviewPage(){
  const pending=entries.filter(e=>memory.needsReview[e.id]),unread=entries.filter(e=>!memory.reviewed[e.id]);
  return `<div class="page v15">${css}<button class="btn" data-route="v15/vocabulary">← Vocabulary</button><h1>Words to revisit</h1><p>These are your self-identified gaps, not an automatically scored exam result.</p><h3>${pending.length} flagged for another explanation</h3><div class="v15-list">${cards(pending)}</div>
    <h3 style="margin-top:17px">${unread.length} have not been self-reviewed</h3><div class="v15-list">${cards(unread.slice(0,30))}</div>${footer()}</div>`;
 }
 function dialog(e){
  const target=document.getElementById("v15-peek");
  if(target)target.remove();
  const div=document.createElement("div");div.id="v15-peek";div.className="v15-modal";div.setAttribute("role","presentation");
  div.innerHTML=`${css}<section class="v15-dialog" role="dialog" aria-modal="true" aria-label="${esc(e.term)} definition"><div class="flex between"><span class="eyebrow">TECHNICAL VOCABULARY · QUICK UNDERSTANDING</span><button class="btn xs" data-action="v15-close" aria-label="Close definition">✕ Close</button></div>
    <h2>${esc(e.term)}</h2><p><b>What:</b> ${esc(e.definition)}</p><p><b>What it does:</b> ${esc(e.does)}</p><p><b>Why:</b> ${esc(e.why)}</p><p><b>When:</b> ${esc(e.when)}</p>
    <p><b>At the small scale:</b> ${esc(e.micro)}</p><p><b>At the organization scale:</b> ${esc(e.macro)}</p>
    <p><b>What can go wrong:</b> ${esc(e.failure)}</p><button class="btn primary" data-route="${link(e.id)}">Explore all technical layers →</button></section>`;
  div.addEventListener("click",e=>{if(e.target===div)div.remove();});document.body.appendChild(div);
  div.querySelector('[data-action="v15-close"]')?.focus();
 }
 function annotate(){
  if(typeof document.querySelectorAll!=="function"||typeof document.createTreeWalker!=="function")return;
  const route=current();
  if(route.startsWith("v15/"))return;
  const root=document.querySelector(".v8-frame,.v11-frame,.v12-main,.v14-root,#portalContent");if(!root)return;
  const focus=route.startsWith("v8/learn/")?new Set(preferred[route.split("/").at(-1)]||[]):null;
  const ordered=entries.filter(x=>!focus||focus.has(x.id)).sort((a,b)=>b.term.length-a.term.length);
  const byName=new Map(ordered.map(x=>[x.term.toLowerCase(),x]));
  const re=new RegExp("\\b("+ordered.map(x=>x.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")\\b","gi");
  const nodes=[];
  for(const p of root.querySelectorAll("p,li")){
   if(p.closest(".v15"))continue;
   const tree=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
   let n;while((n=tree.nextNode())){
    if(!n.nodeValue||n.nodeValue.length<12||n.parentElement?.closest("button,a,summary,code,pre,textarea,label,.v15-inline"))continue;
    nodes.push(n);if(nodes.length>450)break;
   }
   if(nodes.length>450)break;
  }
  let total=0;
  for(const node of nodes){
   if(total>=32)break;
   const str=node.nodeValue;re.lastIndex=0;
   if(!re.test(str))continue;re.lastIndex=0;
   let last=0,match,changed=false,fragment=document.createDocumentFragment();
   while((match=re.exec(str))&&total<32){
    const entry=byName.get(match[0].toLowerCase());if(!entry)continue;
    fragment.appendChild(document.createTextNode(str.slice(last,match.index)));
    const b=document.createElement("button");b.type="button";b.className="v15-inline";b.dataset.action="v15-peek";b.dataset.id=entry.id;
    b.setAttribute("aria-label","Explain "+entry.term);b.textContent=match[0];fragment.appendChild(b);
    last=match.index+match[0].length;total++;changed=true;
   }
   if(changed){fragment.appendChild(document.createTextNode(str.slice(last)));node.parentNode.replaceChild(fragment,node);}
  }
  if(route.startsWith("v8/learn/")){
    const id=route.split("/").at(-1),termList=preferred[id]||[];
    const vocabulary=root.querySelector(".v8-terms");
    if(vocabulary&&!vocabulary.dataset.v15Upgraded){
      vocabulary.dataset.v15Upgraded="true";
      vocabulary.innerHTML=termList.filter(t=>get(t)).map(t=>{
        const e=get(t);
        return `<article class="v15-item"><h4>${esc(e.term)}</h4>
           <p><b>What:</b> ${esc(e.definition)}</p><p><b>What it does:</b> ${esc(e.does)}</p>
           <p><b>Why:</b> ${esc(e.why)}</p><p><b>Micro detail:</b> ${esc(e.micro)}</p>
           <button class="btn xs" data-route="${link(e.id)}">Why, when, how & failure modes →</button></article>`;
      }).join("");
    }
    const host=vocabulary?.closest(".panel");
    if(host&&!host.querySelector("[data-v15-lesson]")){
      const el=document.createElement("div");el.dataset.v15Lesson="true";el.className="v15-lesson-block";
      el.innerHTML=`<div class="v15-decision" style="margin-top:16px"><h3>GO DEEPER · Every term from microscopic detail to architecture</h3>
        <p>For this lesson, the following concepts matter. Tap one to learn what it is, why it exists, how it works and what goes wrong.</p>
        <div class="flex wrap">${termList.filter(t=>get(t)).map(t=>`<button class="btn" data-route="${link(t)}">${esc(get(t).term)}</button>`).join("")}</div>
        <button class="btn primary" data-route="v15/vocabulary">Explore the complete 131-term technical vocabulary →</button></div>`;
      host.appendChild(el);
    }
  }
 }
 if(document.head&&typeof document.head.insertAdjacentHTML==="function"&&!document.getElementById("v15-global-style")){
    document.head.insertAdjacentHTML("beforeend",css.replace("<style>",'<style id="v15-global-style">'));
 }
 const navigation='<div class="sectioncap">Terminology · every detail explained</div><button class="navitem" data-route="v15/vocabulary"><span class="navicon">◎</span>Vocabulary Microscope</button><button class="navitem" data-route="v15/systems"><span class="navicon">⤳</span>Visual System Stories</button>';
 shell=(content,where)=>oldShell(content,where).replace('<div class="sidefoot">',navigation+'<div class="sidefoot">');
 render=()=>{
  const route=current();
  if(route.startsWith("v15/")){
   let content;
   if(route==="v15/vocabulary")content=catalog();
   else if(route==="v15/systems")content=systems();
   else if(route==="v15/review")content=reviewPage();
   else if(route.startsWith("v15/term/")){const e=get(route.split("/").at(-1));content=e?termPage(e):`<div class="page"><h1>Unknown vocabulary term</h1><button class="btn" data-route="v15/vocabulary">Return to vocabulary</button></div>`;}
   else if(route.startsWith("v15/system/")){const flow=flows.find(x=>x.id===route.split("/").at(-1));content=flow?systemPage(flow):`<div class="page"><h1>Unknown system story</h1></div>`;}
   else content=catalog();
   $("root").innerHTML=shell(content,route);document.title="Identity Academy · "+(currentTitle()||"Vocabulary Microscope");
   lastRenderedHash=location.hash;if(window.scrollTo)window.scrollTo(0,0);return;
  }
  oldRender();
  annotate();
 };
 action=(name,el)=>{
  const term=get(el?.dataset?.id),flow=flows.find(x=>x.id===el?.dataset?.id);
  if(name==="v15-part"&&term){
   const a=V15_ANATOMY.find(x=>x[0]===term.id);const i=Number(el.dataset.index);
   if(a&&i>=0&&i<a[2].length){memory.anatomy[term.id]=i;save();render();}return;
  }
  if(name==="v15-peek"&&term){dialog(term);return;}
  if(name==="v15-close"){document.getElementById("v15-peek")?.remove();return;}
  if(name==="v15-review"&&term){memory.reviewed[term.id]=new Date().toISOString();delete memory.needsReview[term.id];save();render();toast("Self-review saved. This is not tested mastery.","good");return;}
  if(name==="v15-confusing"&&term){memory.needsReview[term.id]=!memory.needsReview[term.id];save();render();return;}
  if(name==="v15-filter"){memory.category=el.dataset.value||"All";save();render();return;}
  if(name.startsWith("v15-flow")&&flow){
   const prev=Number(memory.flowProgress[flow.id]||0);
   let next=name==="v15-flow"?Number(el.dataset.index):name==="v15-flow-next"?prev+1:name==="v15-flow-prev"?prev-1:0;
   memory.flowProgress[flow.id]=Math.max(0,Math.min(flow.terms.length-1,next));save();render();return;
  }
  oldAction(name,el);
 };
 document.addEventListener("input",event=>{
  if(event.target?.id!=="v15-query")return;
  memory.query=event.target.value;
  const q=memory.query.toLowerCase().trim(),category=memory.category||"All";
  const list=entries.filter(e=>(category==="All"||categoryNames[e.category]===category)&&(!q||[e.term,e.definition,e.does,e.micro,e.macro,e.when,e.why].join(" ").toLowerCase().includes(q)));
  const results=document.getElementById("v15-list");if(results)results.innerHTML=cards(list);
  const count=document.getElementById("v15-result-count");if(count)count.textContent=list.length+" matching concepts";
  save();
 });
 document.addEventListener("submit",event=>{
  if(event.target?.id!=="v15-reflection")return;
  event.preventDefault();const id=event.target.dataset.id;
  if(!get(id))return;
  memory.notes[id]=String(new FormData(event.target).get("notes")||"").slice(0,4000);save();toast("Your explanation saved locally. Keep practicing.","good");
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape")document.getElementById("v15-peek")?.remove();});
 window.__V15_TESTS={entries,get,flows,preferred,categoryNames,anatomy:V15_ANATOMY};
})();
