/* Connected SC-300 practical simulations: Finance, contractor, managed workload, access governance. */
(function installIntegratedChallenges(){
 db.v7=db.v7||{};db.v7.activeCase=db.v7.activeCase||null;db.v7.caseAttempts=db.v7.caseAttempts||[];
 const priorRender=render,priorAction=action,priorShell=shell,esc=v=>safe(String(v??""));
 const defs=[
 {id:"finance",title:"Finance onboarding and phishing-resistant rollout",difficulty:"Intermediate · SC-300",story:"Contoso Learning has hired a Finance analyst. You must provide just enough app access and pilot MFA safely, without accidentally giving administrator rights or locking out the emergency account.",
 why:"A safe onboarding path combines user provisioning, group-based authorization, least-privilege access and report-only Conditional Access. The controls must work together.",
 tasks:[
  {label:"Create a training employee",route:"portal/users",why:"A unique member account represents the employee; a user account does not itself give application access.",test:(db,k)=>db.users.some(u=>u.name===`Finance Trainee ${k}`&&u.type==="Member"&&!/administrator/i.test(u.role||""))},
  {label:"Create the Finance Pilot security group",route:"portal/groups",why:"An explicit pilot group prevents security controls from accidentally targeting the whole tenant.",test:(db,k)=>db.groups.some(g=>g.name===`Finance Pilot ${k}`)},
  {label:"Put the employee in the pilot group",route:"portal/groups",why:"Membership is required before group-based application or policy targeting can work.",test:(db,k)=>{let u=db.users.find(x=>x.name===`Finance Trainee ${k}`),g=db.groups.find(x=>x.name===`Finance Pilot ${k}`);return !!u&&!!g&&g.members.includes(u.id)}},
  {label:"Assign the group to Finance Reports",route:"portal/apps",why:"Authorization to an enterprise application is distinct from signing in to Entra.",test:(db,k)=>{let g=db.groups.find(x=>x.name===`Finance Pilot ${k}`),a=db.apps.find(x=>x.name==="Finance Reports");return !!g&&!!a&&a.assignees.includes(g.id)}},
  {label:"Create a Report-only MFA policy scoped to the group and Finance Reports",route:"portal/policies",why:"Pilot report-only mode evaluates impact without immediately enforcing a potentially disruptive rule.",test:(db,k)=>db.policies.some(p=>p.name===`Finance MFA Pilot ${k}`&&p.group===`Finance Pilot ${k}`&&p.app==="Finance Reports"&&p.control==="Require MFA"&&p.state==="Report-only")},
  {label:"Confirm the emergency admin is outside this group",route:"portal/groups",why:"Emergency identities must remain protected and usable during policy mistakes and outages.",test:(db,k)=>{let emergency=db.users.find(x=>/emergency/i.test(x.name)),g=db.groups.find(x=>x.name===`Finance Pilot ${k}`);return !!emergency&&!!g&&!g.members.includes(emergency.id)}},
  {label:"Run What If to inspect the proposed policy decision",route:"portal/whatif",why:"What If can show report-only impact; it does not replace observed real tenant sign-in data.",test:(db,k)=>!!db.whatif}
 ]},
 {id:"vendor",title:"External contractor access and offboarding",difficulty:"Intermediate · SC-300",story:"A temporary outside analyst needs access to Vendor Portal. They must not gain Finance Reports or administrator privileges. A reviewer must own the access lifecycle.",
 why:"Authentication of a B2B guest, local application authorization, assignment review and revocation are distinct security controls.",
 tasks:[
  {label:"Invite a Guest with the specified training name",route:"portal/external",why:"A guest uses an external identity; it should not be given an internal administration role.",test:(db,k)=>db.users.some(u=>u.name===`Vendor Guest ${k}`&&u.type==="Guest")},
  {label:"Create Vendor Pilot security group",route:"portal/groups",why:"The group scopes all vendor access and makes quarterly review easier.",test:(db,k)=>db.groups.some(g=>g.name===`Vendor Pilot ${k}`)},
  {label:"Assign guest membership to the Vendor Pilot group",route:"portal/groups",why:"Only users in the intended entitlement group should gain Vendor Portal access.",test:(db,k)=>{const u=db.users.find(x=>x.name===`Vendor Guest ${k}`),g=db.groups.find(x=>x.name===`Vendor Pilot ${k}`);return !!u&&!!g&&g.members.includes(u.id)}},
  {label:"Create Vendor Portal and assign its access to Vendor Pilot",route:"portal/apps",why:"Application assignment turns a directory identity into a scoped resource authorization.",test:(db,k)=>{const g=db.groups.find(x=>x.name===`Vendor Pilot ${k}`),a=db.apps.find(x=>x.name==="Vendor Portal");return !!g&&!!a&&a.assignees.includes(g.id)}},
  {label:"Ensure the guest has no Finance Reports access or admin role",route:"portal/apps",why:"Successful guest access must not include unrelated business resources.",test:(db,k)=>{const u=db.users.find(x=>x.name===`Vendor Guest ${k}`),g=db.groups.find(x=>x.name===`Vendor Pilot ${k}`),a=db.apps.find(x=>x.name==="Finance Reports");return !!u&&!!g&&!!a&&!/administrator/i.test(u.role||"")&&!a.assignees.includes(u.id)&&!a.assignees.includes(g.id)}},
  {label:"Add an access review for Vendor Pilot",route:"portal/reviews",why:"The business or security owner needs an auditable periodic decision on vendor access.",test:(db,k)=>db.reviews.some(r=>r.target===`Vendor Pilot ${k}`)}
 ]},
 {id:"workload",title:"Workload identity without an exposed secret",difficulty:"Intermediate · SC-300",story:"A payroll workload needs to read secrets from PayrollVault, but must never receive Owner at Subscription. Configure managed identity authentication with the minimum resource grant.",
 why:"Cloud workloads should avoid long-lived embedded secrets where a supported managed identity exists; authentication does not replace authorization.",
 tasks:[
  {label:"Create payroll managed identity",route:"portal/managed",why:"The workload principal is distinct from an employee and can obtain tokens using supported Azure facilities.",test:(db,k)=>db.managed.some(m=>m.name===`Payroll Worker ${k}`)},
  {label:"Assign Secrets User on PayrollVault",route:"portal/managed",why:"The resource grant must reflect the actual task and remain scoped to the intended vault.",test:(db,k)=>db.managed.some(m=>m.name===`Payroll Worker ${k}`&&m.grant==="Secrets User on PayrollVault")},
  {label:"Confirm no Owner at Subscription grant",route:"portal/managed",why:"Owner is far too powerful for a workload that only needs to read vault secrets.",test:(db,k)=>db.managed.some(m=>m.name===`Payroll Worker ${k}`&&m.grant!=="Owner at Subscription")},
  {label:"Review app registration vs managed identity token paths",route:"portal/flows",why:"An app registration and managed identity are not interchangeable in every hosting or token-flow scenario.",test:(db,k)=>!!db.flowRan}
 ]},
 {id:"governance",title:"Govern privilege and entitlement lifecycle",difficulty:"Advanced · SC-300",story:"Contoso needs a temporary privileged engineer and 30-day contractor access with approval, plus a scheduled access review. Configure governed access and inspect evidence.",
 why:"Access packages handle lifecycle approvals; PIM handles privileged activation; access reviews confirm entitlement is still justified.",
 tasks:[
  {label:"Create Contractor Access package requiring approval with <=30 day expiration",route:"portal/packages",why:"Approval and expiry prevent silent indefinite contractor entitlements.",test:(db,k)=>db.packages.some(p=>/Contractor Access/i.test(p.name)&&p.approval==="Required"&&Number(p.expiry)>0&&Number(p.expiry)<=30)},
  {label:"Create access review for Finance-Restricted group",route:"portal/groups",why:"A group must exist to have a meaningful review target.",test:(db,k)=>db.groups.some(g=>g.name==="Finance-Restricted")},
  {label:"Assign an access review to Finance-Restricted",route:"portal/reviews",why:"A reviewer should be responsible for applying allow/revoke decisions.",test:(db,k)=>db.reviews.some(r=>r.target==="Finance-Restricted")},
  {label:"Make Jamie Cole eligible for Conditional Access Administrator",route:"portal/pim",why:"Eligibility avoids granting standing privilege when the user does not need it.",test:(db,k)=>db.pim.some(p=>p.user==="Jamie Cole"&&p.role==="Conditional Access Administrator")},
  {label:"Activate the eligible role for the simulated one-hour incident",route:"portal/pim",why:"A fixed time window and audit record reduce privileged access exposure.",test:(db,k)=>db.pim.some(p=>p.user==="Jamie Cole"&&p.role==="Conditional Access Administrator"&&p.active===true)}
 ]}
 ];
 const idCase=id=>defs.find(x=>x.id===id);
 function getState(){return JSON.stringify({users:db.users,groups:db.groups,apps:db.apps,policies:db.policies,whatif:db.whatif,managed:db.managed,flowRan:db.flowRan,packages:db.packages,reviews:db.reviews,pim:db.pim});}
 const sample=k=>`${k}`; 
 function nav(){return '<div class="sectioncap">Integrated SC-300 missions</div><button class="navitem" data-route="v7/integrated"><span class="navicon">⚙</span>Multi-step practical case labs</button>';}
 shell=function(content,where){return priorShell(content,where).replace('<div class="sidefoot">',nav()+'<div class="sidefoot">');};
 function start(id,mode){
  const def=idCase(id);if(!def||!["guided","exam"].includes(mode))return;
  const code=Math.random().toString(36).slice(2,7).toUpperCase();
  db.v7.activeCase={id,mode,code,started:Date.now(),baseline:getState(),results:[],submitted:false,passed:false};
  save();go("v7/case/"+id);
 }
 function checkCase(){
  const c=db.v7.activeCase,def=idCase(c?.id);if(!def)return null;
  const evaluated=def.tasks.map((t,i)=>{let ok=false;try{ok=!!t.test(db,c.code)}catch(e){}return {i,ok,label:t.label,why:t.why,route:t.route}});
  const changed=getState()!==c.baseline;
  const all=evaluated.every(x=>x.ok)&&changed;
  return {evaluated,changed,all,percent:Math.round(evaluated.filter(x=>x.ok).length/evaluated.length*100)};
 }
 function missionList(){
  const completed=(db.v7.caseAttempts||[]).filter(x=>x.passed).length;
  return `<div class="page"><div class="eyebrow">MULTI-RESOURCE SC-300 LABS</div><h1>Practice an entire business security workflow</h1>
   <p class="muted maincopy">These tasks check several connected fictional objects together, not whether you clicked a completion button. Guided mode shows the exact tasks and why they matter. Exam mode provides the business requirement and grades the end state after you submit.</p>
   <div class="caution"><b>Safe simulated environment.</b><p class="small">No production identities, Microsoft tokens, real tenants or charges. These exercises test a simplified educational backend, so production competence still requires an authorized real tenant.</p></div>
   <div class="grid2" style="margin-top:18px">${defs.map(d=>`<div class="panel"><div class="eyebrow">${esc(d.difficulty)}</div><h3>${esc(d.title)}</h3><p>${esc(d.story)}</p><p class="small muted">${esc(d.why)}</p>
    <div class="pillrow"><button class="btn primary" data-action="v7-case-start" data-id="${d.id}" data-mode="guided">Guided mode →</button><button class="btn" data-action="v7-case-start" data-id="${d.id}" data-mode="exam">Independent exam →</button></div></div>`).join("")}</div>
    <div class="panel" style="margin-top:16px"><h3>Saved attempt record</h3><p>${db.v7.caseAttempts.length} attempts · ${completed} simulated passes. These are not Microsoft official exam results.</p></div>
   ${footer()}</div>`;
 }
 function detail(id){
  const d=idCase(id);if(!d)return "<div class='page'><h1>Case not found</h1></div>";
  let c=db.v7.activeCase,active=!!(c&&c.id===id),r=active?checkCase():null,show=active&&c.mode==="guided";
  return `<div class="page"><button class="btn xs" data-route="v7/integrated">← All practical cases</button><div class="eyebrow" style="margin-top:16px">${esc(d.difficulty)} · ${active?c.mode.toUpperCase():"NOT STARTED"}</div>
   <h1>${esc(d.title)}</h1><p class="muted maincopy">${esc(d.story)}</p>
   ${!active?`<button class="btn primary" data-action="v7-case-start" data-id="${d.id}" data-mode="guided">Start guided case</button><button class="btn" data-action="v7-case-start" data-id="${d.id}" data-mode="exam">Start independent exam</button>`:`
    <div class="panel"><div class="eyebrow">Attempt ${esc(c.code)} · Fictional organization</div><h3>Design your correct security state</h3><p>${esc(d.why)}</p>
     ${show?`<p><b>Use these exact training record names:</b></p><ul>${d.id==="finance"?`<li>Finance Trainee ${esc(c.code)}</li><li>Finance Pilot ${esc(c.code)}</li><li>Finance MFA Pilot ${esc(c.code)}</li>`:d.id==="vendor"?`<li>Vendor Guest ${esc(c.code)}</li><li>Vendor Pilot ${esc(c.code)}</li>`:d.id==="workload"?`<li>Payroll Worker ${esc(c.code)}</li>`:"<li>Contractor Access, Finance-Restricted, Jamie Cole</li>"}</ul>`: `<p class="small muted">Exam mode: configuration checklist and solutions are hidden until you submit. Use the administration menus to meet the business requirement.</p>`}
     <div class="flex wrap">
       <button class="btn primary" data-route="portal/overview">Open practice tenant →</button>
       <button class="btn" data-action="v7-case-grade" data-id="${d.id}">Grade configuration</button>
       <button class="btn xs" data-action="v7-case-start" data-id="${d.id}" data-mode="${c.mode}">New attempt code</button>
     </div></div>
    ${show||c.submitted?`<div class="panel" style="margin-top:16px"><div class="eyebrow">Connected configuration checks</div><h3>${r.percent}% of required simulated state</h3><div class="progress"><span style="width:${r.percent}%"></span></div>
       ${r.evaluated.map(t=>`<div style="padding:13px 0;border-bottom:1px solid #dce5f0"><div class="flex between wrap"><b>${t.ok?"✓":"○"} ${esc(t.label)}</b><span class="pill ${t.ok?"success":"warning"}">${t.ok?"Valid state":"Not met"}</span></div><p class="small muted">${esc(t.why)}</p><button class="btn xs" data-route="${t.route}">Open relevant screen →</button></div>`).join("")}</div>`:""}
    ${c.submitted?`<div class="${c.passed?"success":"caution"}" style="padding:16px;margin-top:14px"><b>${c.passed?"Simulated case passed":"Simulated case not passed"}</b><p>${r.evaluated.filter(x=>x.ok).length} of ${r.evaluated.length} configuration rules satisfied, with ${r.changed?"a relevant data change observed":"no changes since this attempt started"}.</p><p class="small">This is a training result, not production tenant competence or Microsoft certification readiness.</p></div>`:""}
  `} ${footer()}</div>`;
 }
 function overlay(){
  const c=db.v7.activeCase;if(!c||c.submitted||c.mode!=="guided")return;
  const d=idCase(c.id),el=document.getElementById("portalContent");if(!d||!el)return;
  const r=checkCase(),done=r.evaluated.filter(x=>x.ok).length,first=r.evaluated.find(x=>!x.ok);
  el.insertAdjacentHTML("afterbegin",`<section role="region" aria-label="Integrated guided exercise" style="background:#edf6ff;border:2px solid #4388bd;border-radius:12px;padding:16px;margin:0 0 18px">
     <div class="flex between wrap"><b>Instructor · ${esc(d.title)}</b><span class="pill">${done}/${r.evaluated.length} rules met</span></div>
     ${first?`<p><b>Next unmet requirement:</b> ${esc(first.label)}</p><p class="small muted"><b>Why:</b> ${esc(first.why)}</p><div class="flex wrap"><button class="btn primary" data-route="${first.route}">Go to this setting →</button><button class="btn" data-route="v7/case/${d.id}">Review full checklist</button></div>`:"<p>All requirements currently match the fictional tenant. Submit the case for an independent end-state grade.</p>"}
   </section>`);
 }
 render=function(){
  const r=current();
  if(r==="v7/integrated"||r.startsWith("v7/case/")){
   $("root").innerHTML=shell(r==="v7/integrated"?missionList():detail(r.slice("v7/case/".length)),r);
   document.title="Identity Architect Academy · Practical case";lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  priorRender();
  if(r.startsWith("portal/"))overlay();
 };
 action=function(a,el){
  if(a==="v7-case-start"){start(el.dataset.id,el.dataset.mode);return;}
  if(a==="v7-case-grade"){const c=db.v7.activeCase,def=idCase(el.dataset.id);if(!c||!def||c.id!==def.id){toast("Start a case first","bad");return;}
   const r=checkCase();c.submitted=true;c.passed=r.all;c.results=r.evaluated.map(x=>({i:x.i,ok:x.ok,label:x.label}));db.v7.caseAttempts.push({id:c.id,mode:c.mode,date:new Date().toLocaleString(),passed:r.all,percent:r.percent,elapsedSeconds:Math.round((Date.now()-c.started)/1000)});save();render();return;
  }
  return priorAction(a,el);
 };
})();
