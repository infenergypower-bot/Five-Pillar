/* Identity Architect V8 learning by doing: 14 guided technical lessons, state-checked fictional labs, replay, notes and browser-local backup. */
(function installV8LearningStudio(){
 if(!Array.isArray(V8_LESSONS)||V8_LESSONS.length!==14)throw Error("V8 lessons failed initialization");
 db.v8=db.v8||{current:"",screen:{},passed:{},simulation:{},notes:{},attempt:{},records:[],choiceOrder:{},coach:null,filter:"All",focus:0};
 const oldRender=render,oldShell=shell,oldAction=action,esc=v=>safe(String(v??""));
 const terms={
 "Tenant":"The Microsoft Entra directory boundary that owns identities, policies and local applications.",
 "UPN":"User Principal Name, normally the sign-in identifier such as name@verified-domain.",
 "RBAC":"Role-Based Access Control: roles grant specific administrative or resource operations.",
 "AU":"Administrative unit: a scope for supported delegated directory administration, not a separate tenant.",
 "MFA":"Multifactor authentication: proof from qualifying independent factors.",
 "TAP":"Temporary Access Pass: a time-limited credential often used to register or recover approved sign-in methods.",
 "FIDO2":"A standard for public-key, origin-bound authentication using compatible security keys or passkeys.",
 "CA":"Conditional Access: policy evaluation that combines user, resource and signals with access or session controls.",
 "SSO":"Single sign-on: authentication experience shared across configured applications through an identity provider.",
 "SAML":"An XML-based protocol often used for federated enterprise web-application authentication.",
 "OIDC":"OpenID Connect, an authentication identity layer built on OAuth 2.0.",
 "OAuth":"A framework for authorizing access to resource APIs; not by itself a user authentication protocol.",
 "SCIM":"System for Cross-domain Identity Management; a standardized interface for user/group provisioning.",
 "PIM":"Privileged Identity Management: eligible roles, activation controls and privileged-access auditing.",
 "Managed identity":"An identity issued to a supported Azure workload that obtains tokens without embedded long-lived client secrets.",
 "Token":"A digitally signed credential issued for a particular audience and allowed uses.",
 "Source anchor":"Identity-matching value used to correlate synchronized objects across directories.",
 "Sign-in risk":"An estimate of suspiciousness for a specific authentication event.",
 "User risk":"An estimate of the likelihood an identity itself may be compromised.",
 "Access package":"A governed bundle of requestable groups, application roles or resources with eligibility, approval and lifecycle policy.",
 "KQL":"Kusto Query Language, a language for exploring and aggregating ingested telemetry records.",
 "Service principal":"An application or workload identity object in a particular tenant.",
 "Guest":"An external collaboration identity represented as an object in the resource tenant.",
 "Report-only":"A Conditional Access state that evaluates hypothetical policy impact without enforcing that policy."
 };
 const termOrder={
 "User identities":["Tenant","UPN","RBAC","AU","Guest","Source anchor"],
 "Authentication and access":["CA","MFA","FIDO2","TAP","Sign-in risk","Report-only"],
 "Workload identities":["Service principal","OIDC","OAuth","SAML","Managed identity","Token"],
 "Identity governance":["PIM","Access package","SCIM","KQL","RBAC","Token"]
 };
 const glossary=lesson=>termOrder[lesson.domain].map(term=>`<details class="v8-term"><summary>${esc(term)}</summary><p>${esc(terms[term])}</p></details>`).join("");
 function get(id){return V8_LESSONS.find(x=>x.id===id);}
 function progress(id){return db.v8.screen[id]||{node:0,step:0,stage:"watch"};}
 function choiceOrder(lesson){if(!db.v8.choiceOrder[lesson.id]){let a=lesson.choices.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}db.v8.choiceOrder[lesson.id]=a;save();}return db.v8.choiceOrder[lesson.id];}
 function frame(x){return `<div class="v8-frame">${x}</div>`;}
 const styles=`<style>
 .v8-frame{max-width:1200px;margin:0 auto}.v8-stage{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0}
 .v8-stage button{flex:1;min-width:130px;padding:13px;min-height:58px;border:1px solid #b5cbdc;border-radius:11px;cursor:pointer;background:var(--surface,#fff);color:inherit;font-size:13px;line-height:1.45;text-align:left}
 .v8-stage button[aria-current=step]{border:2px solid #2387b7;background:#eaf5ff;color:#143e63;font-weight:700}
 .v8-detail{padding:22px;border-radius:12px;background:#edf6ff;color:#17314d;border-left:4px solid #2187ad;min-height:105px}
 .v8-detail h3{margin:0 0 10px}.v8-detail p{margin:0;line-height:1.55}
 .v8-terms{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}
 .v8-term{border:1px solid #d5e2f0;border-radius:9px;padding:11px;background:var(--card,#fff)}
 .v8-term summary{font-size:13px;font-weight:700;cursor:pointer}.v8-term p{font-size:13px;line-height:1.55;margin:12px 0 0}
 .v8-phase{display:flex;gap:8px;flex-wrap:wrap;padding:10px 0}.v8-phase span{padding:7px 9px;border:1px solid #c9d6e5;border-radius:50px;font-size:12px}
 .v8-phase span.active{background:#205d99;color:#fff;border-color:#205d99}
 .v8-step{display:flex;align-items:flex-start;gap:15px;padding:18px;border:1px solid #d7e4ef;border-radius:12px;margin-bottom:10px}
 .v8-stepnum{border-radius:50%;height:33px;min-width:33px;background:#164979;color:#fff;display:grid;place-items:center;font-weight:700}
 .v8-step h3{margin:0 0 6px}.v8-step p{margin:6px 0;line-height:1.55}
 .v8-coach{padding:18px;border:2px solid #2f80ac;border-radius:14px;background:#eef8ff;margin-bottom:17px;color:#153a5a}
 .v8-challenge{border-left:4px solid #ea8a3b;padding:16px;background:#fff7ef;border-radius:9px}
 .v8-hero{padding:20px;border:1px solid #cee0ee;border-radius:14px;background:linear-gradient(125deg,#eef7ff,#fafcff)}
 .v8-status{font-size:12px;padding:5px 9px;border:1px solid #d1dbe7;border-radius:30px}
 .v8-status.complete{background:#e8f7ed;color:#166b3f}
 .v8-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
 @media(max-width:800px){.v8-grid{grid-template-columns:1fr}.v8-stage button{min-width:115px}.v8-frame{padding:0}}
 </style>`;
 function lessonState(l){const known=!!db.v8.passed[l.id],lab=db.v8.simulation[l.id]||null,history=db.v8.records.filter(x=>x.id===l.id);return {known,lab,history};}
 const supported=new Set(["user","group-app","guest","policy","managed","registration","apps","governance","pim","methods","risk","hybrid","logs"]);
 const supportedText=l=>l.lab==="design"?"This topic is a design-only rehearsal in this simulator. Exact scope and effective permission rules require a real authorized test tenant.":supported.has(l.lab)?"The checker examines selected fictional records. It does not model every Microsoft Entra enforcement or licensing behavior.":"This exercise requires external validation.";
 function snapshot(l){
  const obj=db;
  const k=l.lab;
  if(k==="user")return JSON.stringify([obj.users]);
  if(k==="group-app")return JSON.stringify([obj.users,obj.groups,obj.apps]);
  if(k==="guest")return JSON.stringify([obj.users,obj.groups,obj.apps]);
  if(k==="policy")return JSON.stringify([obj.policies,obj.groups,obj.users,obj.whatif]);
  if(k==="managed")return JSON.stringify([obj.managed]);
  if(k==="registration")return JSON.stringify([obj.regs]);
  if(k==="apps")return JSON.stringify([obj.apps]);
  if(k==="governance")return JSON.stringify([obj.packages,obj.groups,obj.reviews]);
  if(k==="pim")return JSON.stringify([obj.pim]);
  if(k==="methods")return JSON.stringify([obj.passkeys,obj.users.map(x=>[x.id,x.tap])]);
  if(k==="risk")return JSON.stringify(obj.risks);
  if(k==="hybrid")return String(obj.hybridFixed);
  if(k==="logs")return JSON.stringify([obj.diagnostics,obj.queryFailed]);
  return "";
 }
 function validate(l,c){
  const tag=c.code,byName=(list,name)=>list.find(x=>x.name===name);
  switch(l.lab){
   case "user": {let u=byName(db.users,"V8 Employee "+tag);return {valid:!!u&&u.type==="Member"&&u.licenses?.length>0&&u.revoked===true,why:"Create V8 Employee "+tag+", assign a simulated service license, and revoke that specific user’s sessions. A real tenant also needs deprovisioning and access-token verification."};}
   case "group-app":{let u=byName(db.users,"V8 Analyst "+tag),g=byName(db.groups,"V8 Finance "+tag),a=byName(db.apps,"Finance Reports");return {valid:!!u&&!!g&&!!a&&g.members.includes(u.id)&&a.assignees.includes(g.id)&&!/administrator/i.test(u.role||""),why:"Create V8 Analyst "+tag+" and V8 Finance "+tag+", add the analyst to the group, then assign the group to Finance Reports without granting admin privileges."};}
   case "guest":{let u=byName(db.users,"V8 Vendor "+tag),g=byName(db.groups,"V8 Vendor Group "+tag),vendor=byName(db.apps,"Vendor Portal"),finance=byName(db.apps,"Finance Reports");return {valid:!!u&&u.type==="Guest"&&!!g&&g.members.includes(u.id)&&!!vendor&&vendor.assignees.includes(g.id)&&!!finance&&!finance.assignees.includes(g.id)&&!finance.assignees.includes(u.id),why:"Create V8 Vendor "+tag+" as Guest, group V8 Vendor Group "+tag+", assign Vendor Portal to the group, and ensure no Finance Reports entitlement."};}
   case "policy":{let g=byName(db.groups,"V8 CA Group "+tag),u=byName(db.users,"V8 CA User "+tag),p=byName(db.policies,"V8 MFA Pilot "+tag);return {valid:!!g&&!!u&&g.members.includes(u.id)&&!!p&&p.group===g.name&&p.app==="Finance Reports"&&p.state==="Report-only"&&p.control==="Require MFA"&&!!db.whatif,why:"Create V8 CA User "+tag+", V8 CA Group "+tag+", link membership, create V8 MFA Pilot "+tag+" targeting that group/Finance Reports with Require MFA and Report-only, then run What If."};}
   case "apps":{let app=byName(db.apps,"V8 SSO App "+tag);return {valid:!!app&&app.sso&&app.sso!=="Not configured",why:"Create V8 SSO App "+tag+" in Enterprise applications and configure its fictional SSO method. Real SAML/OIDC metadata and token validation cannot be checked here."};}
   case "registration":{let a=byName(db.regs,"V8 Graph App "+tag);return {valid:!!a&&a.consented&&a.permissions?.some(x=>x==="Delegated User.Read"),why:"Create V8 Graph App "+tag+", request Delegated User.Read rather than tenant-wide app permissions, then record fictional consent."};}
   case "managed":{let a=byName(db.managed,"V8 Payroll "+tag);return {valid:!!a&&a.grant==="Secrets User on PayrollVault",why:"Create V8 Payroll "+tag+" and grant Secrets User on PayrollVault rather than subscription Owner."};}
   case "governance":{let a=byName(db.packages,"V8 Contractor "+tag),g=byName(db.groups,"V8 Review "+tag),rev=db.reviews.find(x=>x.target===g?.name);return {valid:!!a&&a.approval==="Required"&&Number(a.expiry)>0&&Number(a.expiry)<=30&&!!rev,why:"Create V8 Contractor "+tag+" access package with Required approval and <=30-day expiry; create V8 Review "+tag+" security group and an access review for it."};}
   case "pim":{let a=db.pim.find(x=>x.user==="Jamie Cole"&&x.role==="Conditional Access Administrator");return {valid:!!a&&a.active===true,why:"Create Jamie Cole’s eligible Conditional Access Administrator assignment, then activate it in the fictional PIM screen."};}
   case "methods":return {valid:db.passkeys===true&&db.users.some(x=>x.tap===true),why:"Enable the fictional passkey method and issue a simulated Temporary Access Pass to a test user. Real key enrollment is not possible here."};
   case "risk":return {valid:db.risks.some(x=>x.status&&x.status!=="Open"),why:"Investigate the seeded risky sign-in and record the fictional triage change. Correlation and true root-cause evidence still require a real tenant."};
   case "hybrid":return {valid:db.hybridFixed===true,why:"Repair the fictional sync conflict. This does not implement real AD DS, Cloud Sync agents or Connect Health."};
   case "logs":return {valid:db.queryFailed===true&&db.diagnostics===true,why:"Run the fictional failed sign-in filter and configure the in-memory diagnostics marker. No Azure workspace or billing resources were created."};
   default:return {valid:false,why:"This topic cannot be independently verified in the simplified simulator. Practice in an authorized test tenant."};
  }
 }
 function startAttempt(l,mode){
  const code=Math.random().toString(36).slice(2,7).toUpperCase();
  db.v8.attempt[l.id]={mode,code,baseline:snapshot(l),started:Date.now(),finished:false};
  if(db.v6?.activeTutor)db.v6.activeTutor=null;
  db.v8.coach=mode==="guided"?{id:l.id,step:0}:null;
  db.v8.current=l.id;save();go("v8/learn/"+l.id);
 }
 function gradeAttempt(l){
  const c=db.v8.attempt[l.id];
  if(!c)return;
  const checked=validate(l,c),changed=snapshot(l)!==c.baseline;
  const valid=!!checked.valid&&changed&&l.lab!=="design";
  c.finished=true;c.result={valid,changed,why:checked.why,scoped:l.lab!=="design",at:new Date().toISOString()};
  if(valid&&c.mode==="guided")db.v8.simulation[l.id]={guided:true,...(db.v8.simulation[l.id]||{})};
  if(valid&&c.mode==="exam")db.v8.simulation[l.id]={...(db.v8.simulation[l.id]||{}),independent:true};
  db.v8.records.push({id:l.id,mode:c.mode,passed:valid,date:new Date().toISOString()});
  db.v8.coach=null;save();render();
 }
 const lessonsByDomain=["User identities","Authentication and access","Workload identities","Identity governance"];
 function nav(){return '<div class="sectioncap">Learn by Doing · SC-300</div><button class="navitem" data-route="v8/academy"><span class="navicon">▧</span>Visual instructor academy</button><button class="navitem" data-route="v8/progress"><span class="navicon">☑</span>Skill learning & evidence</button>';}
 function head(l){return `<button class="btn xs" data-route="v8/academy">← All SC-300 learning units</button><div class="eyebrow" style="margin-top:15px">${esc(l.domain)} · ${esc(l.group)} · approx. ${l.minutes} min</div><h1>${esc(l.title)}</h1><p class="muted maincopy">${esc(l.objective)}</p>`;}
 function academy(){
  const track=db.v8.filter||"All",lst=V8_LESSONS.filter(l=>track==="All"||l.domain===track),known=V8_LESSONS.filter(l=>db.v8.passed[l.id]).length,indep=V8_LESSONS.filter(l=>db.v8.simulation[l.id]?.independent).length;
  return frame(`<div class="page">${styles}<div class="eyebrow">SC-300 · BEGINNER TO INDEPENDENT PRACTICE</div><h1>Learn by seeing, doing, and understanding why</h1>
  <p class="muted maincopy">Four domains. Fourteen detailed instructional units. This new learning path is deliberately separate from a mere topic checklist: each lesson explains the system, displays an interactive flow, sends you into the practice console with an instructor, challenges you to troubleshoot, and checks your reasoning and fictional configuration.</p>
  <div class="v8-hero"><h3>WATCH → UNDERSTAND → FOLLOW → PRACTICE → TROUBLESHOOT → MASTER</h3><p>Use Guided mode first. Then repeat the workflow in Independent Exam mode. Passing a simulated state check is evidence of practice, not verified production competence or Microsoft certification readiness.</p>
    <button class="btn primary" data-route="${db.v8.current?"v8/learn/"+db.v8.current:"v8/learn/"+V8_LESSONS[0].id}">${db.v8.current?"Continue last lesson":"Start lesson 1"} →</button></div>
  <div class="grid3" style="margin-top:18px"><div class="panel"><div class="statnum">${known}/14</div><div class="statlabel">Knowledge questions passed</div></div><div class="panel"><div class="statnum">${indep}/14</div><div class="statlabel">Independent simulator checks</div></div><div class="panel"><div class="statnum">98</div><div class="statlabel">SC-300 official subskills — all still require full external verification</div></div></div>
  <div class="pillrow" style="margin:18px 0">${["All",...lessonsByDomain].map(x=>`<button class="btn ${track===x?"primary":""}" data-action="v8-filter" data-domain="${esc(x)}">${esc(x)}</button>`).join("")}</div>
  <div class="v8-grid">${lst.map((l,i)=>`<div class="panel"><div class="eyebrow">${esc(l.domain)} · ${l.minutes} min</div><h3>${esc(l.title)}</h3><p class="small muted">${esc(l.caseStudy)}</p><p class="small muted"><b>You'll be able to:</b> ${esc(l.objective)}</p>
   <div class="flex wrap"><span class="v8-status ${db.v8.passed[l.id]?"complete":""}">${db.v8.passed[l.id]?"✓ Concept understood":"Knowledge pending"}</span><span class="v8-status ${db.v8.simulation[l.id]?.independent?"complete":""}">${db.v8.simulation[l.id]?.independent?"✓ Independent fictional lab":"Independent practice pending"}</span></div>
   <button class="btn primary" data-route="v8/learn/${l.id}" style="margin-top:14px">Learn this skill →</button></div>`).join("")}</div>
   <div class="caution" style="margin-top:18px"><b>Curriculum status: incomplete.</b><p>There are 98 official SC-300 measured subskills; these fourteen broad guided modules cannot replace every individual subskill or all licensed real-world labs. See the full official skill tracker for outstanding details.</p><button class="btn" data-route="v7/skills">Open measured-skill coverage</button></div>${footer()}</div>`);
 }
 function lesson(l){
  const p=progress(l.id),node=Math.min(Math.max(0,p.node),l.visual.length-1),step=Math.min(Math.max(0,p.step),l.steps.length-1),c=db.v8.attempt[l.id],qOrder=choiceOrder(l);
  db.v8.current=l.id;
  return frame(`<div class="page">${styles}${head(l)}
   <div class="v8-phase">${["WATCH","UNDERSTAND","FOLLOW","PRACTICE","TROUBLESHOOT","MASTER"].map((s,i)=>`<span class="${p.stage.toLowerCase()===s.toLowerCase()?"active":""}">${i+1}. ${s}</span>`).join("")}</div>
   <div class="panel"><div class="eyebrow">WATCH · Interactive technical system map</div><h3>Tap each component to see what it actually does</h3>
    <div class="v8-stage" role="group" aria-label="Interactive workflow stages">${l.visual.map((n,i)=>`<button data-action="v8-node" data-id="${l.id}" data-index="${i}" aria-current="${i===node?"step":"false"}"><b>${i+1}.</b> ${esc(n[0])}</button>`).join("")}</div>
    <div class="v8-detail" role="status"><h3>${esc(l.visual[node][0])}</h3><p>${esc(l.visual[node][1])}</p></div>
    <div class="flex wrap" style="margin-top:12px"><button class="btn" data-action="v8-node-prev" data-id="${l.id}" ${node===0?"disabled":""}>← Back</button><button class="btn primary" data-action="v8-node-next" data-id="${l.id}" ${node===l.visual.length-1?"disabled":""}>Next component →</button><button class="btn" data-action="v8-node-replay" data-id="${l.id}">Replay from first component</button></div>
   </div>
   <div class="v8-grid" style="margin-top:16px"><div class="panel"><div class="eyebrow">UNDERSTAND · Plain-language explanation</div><p>${esc(l.beginner)}</p>
    <div class="scenario"><b>Think of it like this</b><p>${esc(l.analogy)}</p></div></div>
   <div class="panel"><div class="eyebrow">UNDERSTAND · Engineering explanation</div><p>${esc(l.technical)}</p><p><b>Why this matters:</b> ${esc(l.objective)}</p></div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">VOCABULARY · Tap any unfamiliar technical term</div><div class="v8-terms">${glossary(l)}</div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">REAL WORKPLACE SCENARIO</div><h3>You're the identity administrator</h3><p>${esc(l.caseStudy)}</p></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">FOLLOW · Instructor-guided practical workflow</div>
    <h3>Step ${step+1} of ${l.steps.length}</h3><div class="v8-step"><div class="v8-stepnum">${step+1}</div><div><h3>${esc(l.steps[step][0])}</h3><p><b>What to do:</b> ${esc(l.steps[step][2])}</p><p><b>Why:</b> ${esc(l.steps[step][3])}</p></div></div>
    <div class="flex wrap"><button class="btn" data-action="v8-step-prev" data-id="${l.id}" ${step===0?"disabled":""}>← Previous</button>
     <button class="btn primary" data-route="${l.steps[step][1]}" data-v8-start="${l.id}">Open that console screen →</button>
     <button class="btn" data-action="v8-step-next" data-id="${l.id}" ${step===l.steps.length-1?"disabled":""}>Next step →</button></div>
    <details style="margin-top:13px"><summary><b>Show the complete guided procedure</b></summary>
     ${l.steps.map((s,i)=>`<div class="v8-step"><div class="v8-stepnum">${i+1}</div><div><h3>${esc(s[0])}</h3><p>${esc(s[2])}</p><p><b>Why it matters:</b> ${esc(s[3])}</p><button class="btn xs" data-route="${s[1]}" data-v8-start="${l.id}">Open relevant console screen</button></div></div>`).join("")}</details>
   </div>
   <div class="v8-grid" style="margin-top:16px"><div class="panel"><div class="eyebrow">PRACTICE · Real changes to fictional records</div>
     <p>${esc(supportedText(l))}</p><p>Guided mode shows the requirements. Independent mode withholds the checklist until you submit. Both check the saved fictional configuration rather than the Next button.</p>
     <div class="flex wrap"><button class="btn primary" data-action="v8-start" data-id="${l.id}" data-mode="guided">Start Guided practice</button>
     <button class="btn" data-action="v8-start" data-id="${l.id}" data-mode="exam">Independent exam mode</button></div>
     ${c?`<p class="small"><b>Current attempt:</b> ${esc(c.code)} · ${esc(c.mode)} · ${c.finished?(c.result?.valid?"Simulated state passed":"Not passed"):"In progress"}</p><button class="btn" data-route="v8/practice/${l.id}">Resume current practice →</button>`:""}
    </div>
    <div class="panel"><div class="eyebrow">TROUBLESHOOT · Diagnose the failure</div>
     <p><b>What you observe:</b> ${esc(l.symptom)}</p><details><summary><b>Reveal the likely root cause and safe recovery</b></summary><p><b>Reason:</b> ${esc(l.reason)}</p><p><b>Recovery:</b> ${esc(l.recover)}</p></details>
     <button class="btn" style="margin-top:13px" data-route="portal/logs" data-v8-start="${l.id}">Inspect fictional sign-in logs →</button>
    </div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">MASTER · Explain why, not just which button</div><h3>${esc(l.q)}</h3>
    <form id="v8-quiz" data-id="${l.id}">${qOrder.map((k,i)=>`<label class="choice"><input type="radio" name="v8choice" value="${k}" required><b>${String.fromCharCode(65+i)}.</b> ${esc(l.choices[k])}</label>`).join("")}
     <button class="btn primary" type="submit">Grade and explain the result</button></form>
    <p role="status" id="v8-quiz-feedback">${db.v8.passed[l.id]?"✓ Previously answered correctly; explain your reasoning again for mastery.":""}</p></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">INDEPENDENT EVIDENCE · Why a real administrator would do this</div><p>${esc(l.evidence)}</p>
    <form id="v8-note" data-id="${l.id}"><label class="field">My explanation and lab evidence (no credentials, tokens or actual tenant identifiers)
      <textarea name="notes" rows="5" placeholder="I configured…, expected…, observed…, diagnosed…, and would safely roll back by…">${esc(db.v8.notes[l.id]||"")}</textarea></label>
     <button class="btn primary" type="submit">Save my learning notes</button></form><a href="${esc(l.docs)}" target="_blank" rel="noopener">Microsoft Learn technical reference ↗</a></div>
   <div class="flex wrap" style="margin-top:15px"><button class="btn" data-route="v8/learn/${V8_LESSONS[Math.max(0,V8_LESSONS.indexOf(l)-1)].id}" ${V8_LESSONS.indexOf(l)===0?"disabled":""}>← Previous topic</button>
    <button class="btn primary" data-route="v8/learn/${V8_LESSONS[Math.min(V8_LESSONS.length-1,V8_LESSONS.indexOf(l)+1)].id}" ${V8_LESSONS.indexOf(l)===V8_LESSONS.length-1?"disabled":""}>Next topic →</button></div>
   ${footer()}</div>`);
 }
 function practice(l){
  const c=db.v8.attempt[l.id],status=c?validate(l,c):null,show=!!c&&(c.mode==="guided"||c.finished);
  return frame(`<div class="page">${styles}<button class="btn xs" data-route="v8/learn/${l.id}">← Return to complete lesson</button><div class="eyebrow" style="margin-top:16px">${esc(l.domain)} · ${c?esc(c.mode.toUpperCase()):"NOT STARTED"}</div>
   <h1>Put the business requirement into practice</h1><p class="muted maincopy">${esc(l.caseStudy)}</p>
   ${!c?`<button class="btn primary" data-action="v8-start" data-id="${l.id}" data-mode="guided">Start Guided mode</button><button class="btn" data-action="v8-start" data-id="${l.id}" data-mode="exam">Start Independent mode</button>`:`
   <div class="panel"><div class="eyebrow">TRAINING ATTEMPT ${esc(c.code)} · ${esc(c.mode)}</div><h3>${esc(l.objective)}</h3>
     <div class="v8-challenge"><b>Completion standard</b><p>Make the required changes in the simulated Entra tenant and explain why they satisfy the business requirement. Your current task does not change real Microsoft services.</p>
      ${c.mode==="guided"?`<p><b>Checklist and expected training settings:</b> ${esc(status.why)}</p>`:"<p><b>Independent exam:</b> Work without the expected setting checklist. The full explanation appears after grading.</p>"}
     </div>
     <div class="flex wrap" style="margin-top:14px"><button class="btn primary" data-route="${l.steps[0][1]}" data-v8-start="${l.id}">Open practice console →</button>
      <button class="btn" data-action="v8-grade" data-id="${l.id}">Submit current configuration</button><button class="btn" data-action="v8-start" data-id="${l.id}" data-mode="${c.mode}">New attempt code</button></div>
     ${c.finished?`<div class="${c.result?.valid?"scenario":"caution"}" style="margin-top:16px;padding:15px"><b>${c.result?.valid?"Simulated configuration meets this lab's limited checks":"Not yet a passing configuration"}</b><p>${esc(c.result?.why||"")}</p><p>${c.result?.changed?"Relevant fictional data changed during your attempt.":"No relevant fictional state change was detected after the attempt started."}</p>
       <p class="small">These checks do not validate actual Microsoft Entra permissions, token security or licensing. Independent full mastery requires the authorized real-tenant companion.</p></div>`:""}
   </div>
   ${show?`<div class="panel" style="margin-top:16px"><h3>Guided procedure and explanations</h3>
     ${l.steps.map((s,i)=>`<div class="v8-step"><div class="v8-stepnum">${i+1}</div><div><h3>${esc(s[0])}</h3><p>${esc(s[2])}</p><p><b>Why:</b> ${esc(s[3])}</p><button class="btn xs" data-route="${s[1]}" data-v8-start="${l.id}">Open this setting →</button></div></div>`).join("")}</div>`:""}
   `}${footer()}</div>`);
 }
 function overview(){
  const known=V8_LESSONS.filter(l=>db.v8.passed[l.id]).length,guided=V8_LESSONS.filter(l=>db.v8.simulation[l.id]?.guided).length,solo=V8_LESSONS.filter(l=>db.v8.simulation[l.id]?.independent).length;
  return frame(`<div class="page">${styles}<div class="eyebrow">PERSONAL LEARNING RECORD · SC-300 TRAINING</div><h1>Understanding and fictional practice are different achievements</h1>
   <div class="grid3" style="margin:16px 0"><div class="panel"><div class="statnum">${known}/14</div><div class="statlabel">Knowledge questions correct</div></div><div class="panel"><div class="statnum">${guided}/14</div><div class="statlabel">Guided simulator passes</div></div><div class="panel"><div class="statnum">${solo}/14</div><div class="statlabel">Independent simulator passes</div></div></div>
   <div class="caution"><b>Not an official readiness calculation.</b><p>The 98 current SC-300 measured subskills require substantive mapping and real-world verification beyond these fourteen practice modules. Passing a fictional exercise alone does not demonstrate a secure production deployment.</p></div>
   <div class="panel" style="margin-top:16px"><h3>Resume and protect your work</h3><p>Your learning record lives in this browser. Export a backup before changing devices or browser storage. The import function restores only V8 learning records, not Microsoft accounts or the old simulator dataset.</p>
   <div class="flex wrap"><button class="btn primary" data-route="${db.v8.current?"v8/learn/"+db.v8.current:"v8/academy"}">Resume learning →</button>
    <button class="btn" data-action="v8-export">Export V8 learning backup ↓</button><a class="btn" href="./qa-learning.html">Run Safari/on-device functional tests →</a><label class="btn" for="v8-import">Import V8 backup</label><input id="v8-import" type="file" accept=".json,application/json" style="display:none"/></div></div>
   <div class="panel" style="margin-top:16px"><h3>Where you need more practice</h3>
   ${V8_LESSONS.map(l=>`<div class="flex wrap between" style="border-bottom:1px solid #dae5ed;padding:12px 0"><div><b>${esc(l.title)}</b><p class="small muted">${db.v8.passed[l.id]?"✓ Concept check passed":"Concept check pending"} · ${db.v8.simulation[l.id]?.independent?"✓ Fictional independent check passed":"Independent lab pending"}</p></div><button class="btn xs" data-route="v8/learn/${l.id}">Study →</button></div>`).join("")}
    </div>${footer()}</div>`);
 }
 function coachMarkup(){
  const c=db.v8.coach,l=get(c?.id);
  if(!l||!c)return "";
  const i=Math.min(Math.max(0,c.step||0),l.steps.length-1),s=l.steps[i];
  return `<section class="v8-coach" role="region" aria-label="In-console guided identity instructor">
   <div class="flex between wrap"><b>🧭 Learn-by-doing instructor · ${esc(l.title)}</b><span class="v8-status">Step ${i+1}/${l.steps.length}</span></div>
   <h3 style="margin:12px 0">${esc(s[0])}</h3><p><b>Do:</b> ${esc(s[2])}</p><p><b>Why:</b> ${esc(s[3])}</p>
   <div class="flex wrap"><button class="btn xs" data-action="v8-coach-prev" ${i===0?"disabled":""}>← Previous</button><button class="btn primary" data-action="v8-coach-next" ${i===l.steps.length-1?"disabled":""}>Next instruction →</button>
    <button class="btn" data-route="v8/practice/${l.id}">Review practice or grade →</button>
    <button class="btn xs" data-action="v8-coach-close">Close instructor</button></div>
   <p class="small muted">The instructor does not make changes for you. Use the fictional administrator controls on this screen. Your next independent attempt can hide this guidance.</p></section>`;
 }
 function augmentPortal(){
  if(!current().startsWith("portal/")||!db.v8.coach)return;
  const el=document.getElementById("portalContent");if(el){el.insertAdjacentHTML("afterbegin",styles+coachMarkup());}
 }
 shell=function(content,where){return oldShell(content,where).replace('<div class="sidefoot">',nav()+'<div class="sidefoot">')};
 render=function(){
  const r=current();
  if(r==="v8/academy"||r==="v8/progress"||r.startsWith("v8/learn/")||r.startsWith("v8/practice/")){
   const l=get(r.split("/").pop()),html=r==="v8/academy"?academy():r==="v8/progress"?overview():r.startsWith("v8/practice/")?(l?practice(l):"<div>Unknown practice lesson</div>"):(l?lesson(l):"<div>Unknown instructional lesson</div>");
   $("root").innerHTML=shell(html,r);document.title="Identity Architect Academy · Learning Studio";
   lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  oldRender();augmentPortal();
 };
 action=function(a,el){
  if(a==="v8-filter"){db.v8.filter=el.dataset.domain;save();render();return;}
  if(["v8-node","v8-node-next","v8-node-prev","v8-node-replay","v8-step-next","v8-step-prev"].includes(a)){
   const l=get(el.dataset.id);if(!l)return;const p=progress(l.id);
   if(a==="v8-node")p.node=Number(el.dataset.index);
   if(a==="v8-node-next")p.node=Math.min(l.visual.length-1,p.node+1);
   if(a==="v8-node-prev")p.node=Math.max(0,p.node-1);
   if(a==="v8-node-replay")p.node=0;
   if(a==="v8-step-next")p.step=Math.min(l.steps.length-1,p.step+1);
   if(a==="v8-step-prev")p.step=Math.max(0,p.step-1);
   p.stage=a.includes("step")?"follow":"watch";db.v8.screen[l.id]=p;save();render();return;
  }
  if(a==="v8-start"){const l=get(el.dataset.id);if(l)startAttempt(l,el.dataset.mode);return;}
  if(a==="v8-grade"){const l=get(el.dataset.id);if(l)gradeAttempt(l);return;}
  if(a==="v8-coach-next"||a==="v8-coach-prev"){
   const c=db.v8.coach,l=get(c?.id);if(!l)return;c.step=Math.max(0,Math.min(l.steps.length-1,c.step+(a==="v8-coach-next"?1:-1)));
   const p=progress(l.id);p.step=c.step;db.v8.screen[l.id]=p;save();go(l.steps[c.step][1]);return;
  }
  if(a==="v8-coach-close"){db.v8.coach=null;save();render();return;}
  if(a==="v8-export"){
   const pack={schema:"identity-architect-v8-learning",version:1,date:new Date().toISOString(),data:db.v8};
   downloadText("identity-academy-v8-learning-backup.json",JSON.stringify(pack,null,2));return;
  }
  oldAction(a,el);
 };
 document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-v8-start]");if(!btn)return;
  const id=btn.dataset.v8Start;if(!get(id))return;
  const task=db.v8.attempt[id];if(task?.mode==="exam"&&!task.finished){db.v8.coach=null;save();return;}
  db.v8.coach={id,step:progress(id).step||0};
  if(db.v6?.activeTutor)db.v6.activeTutor=null;
  save();
 },true);
 document.addEventListener("submit",e=>{
  const form=e.target;
  if(form?.id==="v8-quiz"){
   e.preventDefault();const l=get(form.dataset.id);if(!l)return;
   const v=new FormData(form).get("v8choice");if(v===null)return;
   const correct=Number(v)===l.answer;if(correct)db.v8.passed[l.id]=true;
   const p=progress(l.id);p.stage="master";db.v8.screen[l.id]=p;save();
   const status=document.getElementById("v8-quiz-feedback");if(status)status.textContent=(correct?"✓ Correct. ":"Not yet. ")+l.feedback+" Correct answer: "+l.choices[l.answer]+".";
   toast(correct?"Concept understood":"Review why the other answers fail",correct?"good":"bad");
  }
  if(form?.id==="v8-note"){
   e.preventDefault();db.v8.notes[form.dataset.id]=String(new FormData(form).get("notes")||"").slice(0,5000);save();toast("Explanation saved to this browser","good");
  }
 });
 document.addEventListener("change",e=>{
  if(e.target?.id!=="v8-import")return;
  const file=e.target.files?.[0];if(!file||file.size>2e6){toast("Select a small V8 JSON backup file","bad");return;}
  const reader=new FileReader();
  reader.onload=()=>{
   try{
    const obj=JSON.parse(String(reader.result||""));
    if(obj.schema!=="identity-architect-v8-learning"||obj.version!==1||!obj.data||!obj.data.passed||!obj.data.notes||!obj.data.screen)throw Error("Invalid V8 learning backup schema");
    const d=obj.data;
    db.v8={current:String(d.current||""),screen:d.screen||{},passed:d.passed||{},simulation:d.simulation||{},notes:d.notes||{},attempt:{},records:Array.isArray(d.records)?d.records:[],choiceOrder:{},coach:null,filter:"All",focus:0};
    save();toast("V8 learning backup imported","good");go("v8/progress");
   }catch(err){toast("Cannot import this backup: "+String(err.message||err),"bad");}
  };
  reader.readAsText(file);
 });
})();
