/* Identity learning decision explorer. Fictional local Entra authorization and Conditional Access consequences. */
(function installV9SignInLab(){
 db.v9=db.v9||{inputs:{},history:[],last:null};
 const oldShell=shell,oldRender=render,oldAction=action,esc=v=>safe(String(v??""));
 const docs="https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview";
 const defaultApp="Finance Reports";
 function evalSignIn(o){
  const user=db.users.find(x=>x.id===o.user)||db.users[0],
  app=db.apps.find(x=>x.name===o.app),
  groups=db.groups.filter(x=>x.members.includes(user.id)),
  isLegacy=o.client==="legacy",
  mfa=o.mfa==="yes",device=o.device==="yes",
  trace=[],enforced=[],reported=[];
  trace.push({stage:"1. Principal",state:"evaluated",headline:user.name,detail:"The fictional identity exists. Its type is "+user.type+". Authentication is modeled as a conceptual step; no real password or token is checked.",route:"portal/users"});
  trace.push({stage:"2. Group scope",state:"evaluated",headline:groups.length?groups.map(x=>x.name).join(", "):"No group memberships",detail:"Membership determines which group-targeted policies and group-based app assignments match. A group name alone grants no rights until used by another rule.",route:"portal/groups"});
  const matched=[];
  for(const p of db.policies){
   if(p.state==="Off")continue;
   if(p.group!=="All users"&&!groups.some(g=>g.name===p.group))continue;
   if(p.app!=="All cloud apps"&&p.app!==o.app)continue;
   let impact="";
   if(/block legacy/i.test(p.control)&&isLegacy)impact="Legacy-client block";
   else if(p.control==="Block access")impact="Access blocked";
   else if(p.control==="Require MFA"&&!mfa)impact="MFA needs to be satisfied";
   else if(p.control==="Require compliant device"&&!device)impact="Compliant device required";
   const item={name:p.name,state:p.state,control:p.control,impact:impact||"Requirement satisfied or irrelevant under modeled signals"};
   matched.push(item);
   if(impact){if(p.state==="On")enforced.push(item);else if(p.state==="Report-only")reported.push(item);}
  }
  const block=enforced.find(x=>/block/i.test(x.impact)),
  needsMfa=enforced.find(x=>/MFA needs/.test(x.impact)),
  needsDevice=enforced.find(x=>/Compliant device/.test(x.impact));
  const authProblem=block||needsMfa||needsDevice;
  trace.push({stage:"3. Conditional Access",state:authProblem?"problem":"evaluated",
   headline:authProblem?authProblem.impact:(reported.length?"Report-only impact; no simulated enforcement":"No unmet enforced policy conditions"),
   detail:matched.length?"Matched "+matched.length+" policy/policies. On enforces modeled requirements; Report-only predicts impact only. Matching Block policies can deny a request even when MFA is satisfied.":"No enabled or report-only policies matched these hypothetical signals.",route:"portal/policies"});
  // For this fictional demonstration, Finance Reports and Vendor Portal require assignment.
  // The actual Entra application service has a separate assignment-required property.
  const assignmentRequired=["Finance Reports","Vendor Portal"].includes(o.app);
  const assigned=app?app.assignees.some(id=>id===user.id||groups.some(g=>g.id===id)):false;
  const accessOk=!!app&&(!assignmentRequired||assigned);
  trace.push({stage:"4. App authorization",state:accessOk?"evaluated":"problem",
   headline:!app?"Application absent":assignmentRequired?(assigned?"User/group entitlement found":"Required assignment missing"):"App assignment not modeled as mandatory",
   detail:"A successful authentication does not grant every app permission. This training exercise treats Finance Reports and Vendor Portal as assignment-required. Real apps have a configurable assignment-required setting and may perform their own in-app authorization.",route:"portal/apps"});
  trace.push({stage:"5. Session and audit",state:"evaluated",
   headline:user.revoked?"Existing refresh sessions marked revoked":"No previous session revocation marked",
   detail:"Revoking a session in this fictional model does not automatically disable the account or block a fresh sign-in. Real token lifetime, continuous access evaluation and downstream revocation vary by application.",route:"portal/logs"});
  let verdict,kind;
  if(block){kind="deny-ca";verdict="Denied: matching enforced block policy";}
  else if(needsDevice){kind="deny-device";verdict="Denied: compliant device requirement not satisfied";}
  else if(needsMfa){kind="challenge";verdict="Additional authentication required: MFA not satisfied";}
  else if(!accessOk){kind="deny-app";verdict="Authentication may succeed, but app assignment denies access";}
  else{kind="granted";verdict="Simulated sign-in and app assignment satisfied";}
  const out={user:user.name,email:user.email,app:o.app,kind,verdict,groups:groups.map(g=>g.name),matched,enforced,reported,trace,revoked:user.revoked===true,time:new Date().toISOString(),inputs:o};
  db.v9.last=out;
  db.v9.history.push(out);
  db.v9.history=db.v9.history.slice(-30);
  // Reflect the simulated result in the existing fictional sign-in log, enabling a learning feedback loop.
  db.logs.push({user:user.email,app:o.app,result:kind==="granted"?"Success":kind==="challenge"?"Interrupted":"Denied",policy:authProblem?.name||(!accessOk?"App access not granted":"Training decision"),time:new Date().toLocaleString(),source:"V9 simulation"});
  db.logs=db.logs.slice(-150);
  save();
  return out;
 }
 function demoCard(head,desc,data){
  return `<div class="panel"><h3>${esc(head)}</h3><p class="small muted">${esc(desc)}</p><button class="btn xs" data-action="v9-scenario" data-scenario="${data}">Try this sign-in →</button></div>`;
 }
 function dashboard(){
  const inputs=db.v9.inputs||{},last=db.v9.last,previous=db.v9.history.at(-2);
  const userList=db.users.map(u=>`<option value="${esc(u.id)}" ${inputs.user===u.id?"selected":""}>${esc(u.name)} · ${esc(u.type)}</option>`).join("");
  const appList=[...new Set([...db.apps.map(x=>x.name),"Finance Reports","Vendor Portal","Microsoft 365"])].map(x=>`<option value="${esc(x)}" ${inputs.app===x?"selected":""}>${esc(x)}</option>`).join("");
  const known=`<div class="grid3">
   ${demoCard("Why does an employee get Access not assigned?","Select an app and see whether group or direct assignment exists.","assignment")}
   ${demoCard("What happens if MFA is not satisfied?","Compare a matching enforced MFA grant with an unsatisfied sign-in.","mfa")}
   ${demoCard("Report-only cannot enforce","Inspect how a report-only policy is recorded but does not block by itself.","report")}
  </div>`;
  return `<div class="page"><div class="eyebrow">LEARNING LAB · CONNECTED FICTIONAL ENTRA TENANT</div><h1>Why did this sign-in succeed or fail?</h1>
   <p class="muted maincopy">Change a fictional user's groups, app assignments and Conditional Access policies, then run the same sign-in again. Each stage explains what was checked, what changed and what you should inspect when it goes wrong.</p>
   <div class="caution"><b>Educational behavior, not a Microsoft authentication service.</b><p>This offline simulator uses simplified policy, token and assignment rules. No real credentials are collected, no Microsoft service is contacted, and no production decisions should be based on this simulated result.</p></div>
   <div class="panel" style="margin-top:16px"><h3>Choose a training scenario</h3>${known}</div>
   <div class="grid2" style="margin-top:16px"><div class="panel"><div class="eyebrow">FOLLOW · Construct an authentication attempt</div>
    <form id="v9-evaluate"><label class="field">Fictional user<select name="user">${userList}</select></label>
    <label class="field">Target enterprise application<select name="app">${appList}</select></label>
    <label class="field">MFA result<select name="mfa"><option value="no">Not satisfied</option><option value="yes" ${inputs.mfa==="yes"?"selected":""}>Satisfied</option></select></label>
    <label class="field">Device compliance<select name="device"><option value="no">Not compliant</option><option value="yes" ${inputs.device==="yes"?"selected":""}>Compliant</option></select></label>
    <label class="field">Client type<select name="client"><option value="modern">Modern auth client</option><option value="legacy" ${inputs.client==="legacy"?"selected":""}>Legacy client</option></select></label>
    <button class="btn primary" type="submit">Evaluate and explain each decision →</button></form></div>
   <div class="panel"><div class="eyebrow">WATCH · Decision pipeline</div>
    <div class="flow"><div class="flownode">Identity</div><div class="flownode">Groups</div><div class="flownode">CA</div><div class="flownode">App</div><div class="flownode">Session / log</div></div>
    <h3>How to learn from a denial</h3><p>First distinguish user authentication from policy controls and the application's own assignment. A client can satisfy MFA but fail authorization. A policy can require a compliant device even when a user belongs to the correct app group.</p>
    <p>When you get an unexpected answer, open the indicated administrative screen, correct the fictional configuration, and rerun the same inputs.</p>
    <div class="flex wrap"><button class="btn" data-route="portal/users">Users</button><button class="btn" data-route="portal/groups">Groups</button><button class="btn" data-route="portal/apps">Enterprise apps</button><button class="btn" data-route="portal/policies">Policies</button><button class="btn" data-route="portal/logs">Sign-in logs</button></div></div></div>
   ${last?`<div class="panel" style="margin-top:17px"><div class="eyebrow">LATEST SIMULATED DECISION · ${esc(new Date(last.time).toLocaleTimeString())}</div><h2>${esc(last.verdict)}</h2>
     <p><b>${esc(last.user)}</b> attempted <b>${esc(last.app)}</b> using a ${last.inputs.client==="legacy"?"legacy":"modern"} client.</p>
     ${last.trace.map((t,i)=>`<details class="detailsummary" ${i===2||t.state==="problem"?"open":""}><summary>${t.state==="problem"?"✕":"✓"} ${esc(t.stage)} — ${esc(t.headline)}</summary><div><p>${esc(t.detail)}</p><button class="btn xs" data-route="${esc(t.route)}">Inspect this administrative control →</button></div></details>`).join("")}
     ${last.matched.length?`<h3>Matched policies and why</h3><div class="scrolltable"><table class="ptable"><thead><tr><th>Policy</th><th>State</th><th>Modeled effect</th></tr></thead><tbody>${last.matched.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.state)}</td><td>${esc(p.impact)}</td></tr>`).join("")}</tbody></table></div>`:""}
     ${previous?`<div class="scenario"><b>Compare with the previous attempt</b><p>Previous: ${esc(previous.verdict)} → Current: ${esc(last.verdict)}.</p><p class="small">Check which user, policy state, group membership, device or MFA input changed before concluding that a policy is effective.</p></div>`:""}
    </div>`:""}
   <div class="panel" style="margin-top:17px"><h3>What this lab can and cannot demonstrate</h3>
    <p><b>Modeled:</b> specific group memberships, limited app assignments, basic policy scope, Report-only versus On, MFA and device signal effects, legacy-client blocking, simulated session markers and sign-in audit records.</p>
    <p><b>Not modeled:</b> Microsoft's actual token issuance, user authentication, real-time risk, authentication strengths, PIM claims, network location, protected actions, complex session controls, app-specific roles, external tenant trust or actual device compliance integration.</p>
    <a href="${docs}" target="_blank" rel="noopener">Microsoft Learn Conditional Access reference ↗</a></div>${footer()}</div>`;
 }
 function nav(){return '<div class="sectioncap">Connected identity decision lab</div><button class="navitem" data-route="v9/signin"><span class="navicon">◈</span>Why did sign-in fail?</button>';}
 const originalShell=shell,originalRender=render,originalAction=action;
 shell=function(content,where){return originalShell(content,where).replace('<div class="sidefoot">',nav()+'<div class="sidefoot">');};
 render=function(){
  if(current()==="v9/signin"){
   $("root").innerHTML=shell(dashboard(),current());
   document.title="Identity Architect Academy · Sign-in Decisions";
   lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  originalRender();
  if(current()==="v8/academy"){const hero=document.querySelector(".v8-hero");if(hero&&!hero.querySelector('[data-route="v9/signin"]'))hero.insertAdjacentHTML("beforeend",'<div style="margin-top:12px"><button class="btn" data-route="v9/signin">Practice the full identity → policy → app decision chain</button></div>');}
 };
 action=function(a,el){
  if(a==="v9-scenario"){
    const s=el.dataset.scenario,first=db.users.find(x=>x.type==="Member"&&!/emergency/i.test(x.name))||db.users[0];
    db.v9.inputs={user:first.id,app:s==="report"?"Finance Reports":s==="mfa"?"Finance Reports":"Finance Reports",mfa:"no",device:"no",client:"modern"};
    save();render();return;
  }
  originalAction(a,el);
 };
 document.addEventListener("submit",function(e){
  if(e.target?.id!=="v9-evaluate")return;e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target).entries());
  db.v9.inputs=d;evalSignIn(d);render();
 });
 // Expose the deterministic pure educational decision procedure to the isolated on-device QA runner.
 window.__identityV9Evaluate=(data)=>evalSignIn(data);
})();
