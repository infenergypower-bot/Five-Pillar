/* V6 lab Guided / Practice / Exam modes; direct fictional tenant state validation */
(function enableV6Modes(){
 const prevRender=render,prevAction=action,prevShell=shell;
 db.v6.challengeAttempts=db.v6.challengeAttempts||[];
 db.v6.activeChallenge=db.v6.activeChallenge||null;
 function esc(v){return safe(v)}
 function check(unit){
  if(unit.id==="identity")return db.groups.some(g=>/finance/i.test(g.name)&&g.members.some(id=>!["u0","u1","u2","u3"].includes(id)));
  if(unit.id==="conditional")return db.policies.some(p=>/finance/i.test(p.name)&&/report/i.test(p.state)&&/mfa/i.test(p.control)&&p.app==="Finance Reports"&&p.group!=="All users");
  if(unit.id==="passkeys")return !!db.passkeys&&db.users.some(x=>x.tap);
  if(unit.id==="external")return db.users.some(x=>x.type==="Guest");
  if(unit.id==="workload")return db.managed.length>0;
  if(unit.id==="apps")return db.regs.length>0;
  if(unit.id==="governance")return db.packages.length>0&&db.reviews.length>0&&db.pim.length>0;
  if(unit.id==="monitoring")return db.risks.some(x=>x.status&&x.status!=="Open")||!!db.caseSolved;
  if(unit.id==="tenant")return db.units.length>0;
  if(unit.id==="hybrid")return !!db.hybridFixed;
  if(unit.id==="gsa")return db.gsa.length>0;
  if(unit.id==="cloudapps")return !!db.oauthDenied;
  if(unit.id==="entitlements")return db.packages.length>0;
  if(unit.id==="pim")return db.pim.length>0;
  if(unit.id==="scim")return db.regs.length>0;
  if(unit.id==="kql")return !!db.diagnostics||!!db.queryFailed;
  return false;
 }
 function snapshot(unit){
  if(unit.id==="identity")return JSON.stringify([db.users,db.groups]);
  if(unit.id==="conditional")return JSON.stringify(db.policies);
  if(unit.id==="passkeys")return JSON.stringify([db.passkeys,db.users.map(u=>[u.id,u.tap])]);
  if(unit.id==="external")return JSON.stringify(db.users);
  if(unit.id==="workload")return JSON.stringify(db.managed);
  if(unit.id==="apps")return JSON.stringify(db.regs);
  if(unit.id==="governance")return JSON.stringify([db.packages,db.reviews,db.pim]);
  if(unit.id==="monitoring")return JSON.stringify([db.risks,db.caseSolved]);
  if(unit.id==="tenant")return JSON.stringify(db.units);
  if(unit.id==="hybrid")return JSON.stringify(db.hybridFixed);
  if(unit.id==="gsa")return JSON.stringify(db.gsa);
  if(unit.id==="cloudapps")return JSON.stringify(db.oauthDenied);
  if(unit.id==="entitlements")return JSON.stringify(db.packages);
  if(unit.id==="pim")return JSON.stringify(db.pim);
  if(unit.id==="scim")return JSON.stringify(db.regs);
  if(unit.id==="kql")return JSON.stringify([db.diagnostics,db.queryFailed]);
  return "";
 }
 function modeTabs(unit){
  let c=db.v6.activeChallenge;
  return `<div class="panel" style="margin:14px 0"><div class="eyebrow">Choose how to learn this skill</div><div class="pillrow">
   <button class="btn primary" data-route="v6/lesson/${unit.id}">1 · Guided</button>
   <button class="btn" data-action="v6-start-challenge" data-mode="practice" data-id="${unit.id}">2 · Practice (optional hints)</button>
   <button class="btn" data-action="v6-start-challenge" data-mode="exam" data-id="${unit.id}">3 · Exam (no hints)</button>
   </div><p class="small muted">In practice and exam modes you must make real changes in the fictional tenant. A click-through alone cannot pass validation. A challenge checks for a state change after the attempt begins.</p></div>`;
 }
 const challengeUrl=(c)=>"v6/challenge/"+c.mode+"/"+c.id;
 shell=function(content,where){let html=prevShell(content,where);let c=db.v6.activeChallenge;if(c?.id&&!c?.finished){let addition=`<button class="navitem" data-route="${challengeUrl(c)}"><span class="navicon">↻</span>Resume active ${esc(c.mode)} task</button>`;return html.replace('<div class="sidefoot">',addition+'<div class="sidefoot">')}return html};
 function challengeView(mode,id){
  let u=V6_UNITS.find(x=>x.id===id);if(!u)return notfound();let c=db.v6.activeChallenge,same=c?.id===id&&c?.mode===mode&&!c.finished;let result=c?.finished&&c.id===id&&c.mode===mode;
  return `<div class="page"><div class="flex between wrap"><button class="btn xs" data-route="v6/academy">← Deep learning academy</button><span class="pill warning">SC-300 simulated task · ${esc(mode.toUpperCase())}</span></div><div class="eyebrow" style="margin-top:20px">Independent administration challenge</div><h1>${esc(u.title)}</h1>
   <div class="panel" style="margin-top:18px"><h3>Business requirement</h3><p>${esc(u.analogy)}</p><p>Using the Contoso Learning fictional tenant, demonstrate the necessary configuration and produce a defensible access/security outcome. A named business requirement is given; you must decide which record or policy changes are appropriate.</p>
   <div class="visual"><div class="diagramlabel">Business outcome to demonstrate</div><div class="flow">${u.flow.map((s,i)=>`<div class="flownode">${i+1}. ${esc(s)}</div>`).join("")}</div></div>
   ${mode==="practice"?`<details class="detailsummary" style="margin-top:14px"><summary>Reveal optional practice hints</summary><div><p>${esc(u.how)}</p>${u.steps.map((s,i)=>`<p><b>${i+1}.</b> ${esc(s[0])} — ${esc(s[2])}</p>`).join("")}</div></details>`:"<div class='caution'><b>Exam mode:</b> No walkthrough or hints are shown. Solve the task independently, then submit the configuration for assessment.</div>"}
   ${!same&&!result?`<button class="btn primary" data-action="v6-start-challenge" data-id="${id}" data-mode="${mode}">Start a fresh attempt</button>`:`<div class="flex wrap" style="margin-top:16px"><button class="btn primary" data-route="${u.steps[0][1]}">Open practice console ↗</button><button class="btn" data-action="v6-evaluate-challenge" data-id="${id}">Grade the simulated configuration</button><button class="btn" data-action="v6-reset-challenge" data-id="${id}" data-mode="${mode}">Restart attempt</button></div>`}
   ${result?`<div class="${c.passed?"success":"caution"}" style="padding:16px;margin-top:14px"><b>${c.passed?"Pass":"Not passed"}</b><p>${esc(c.message)}</p></div>`:""}
   <p class="small muted">State changes are stored only in this browser. Lab competence in a real Microsoft Entra tenant is not confirmed.</p>
   </div><div class="panel" style="margin-top:16px"><h3>Security review questions</h3><p>Why does this control matter? How would you validate the outcome with logs or access reviews? What is your rollback plan, and how would you limit the scope of its privileges?</p></div>${footer()}</div>`;
 }
 render=function(){
  let r=current();
  if(r.startsWith("v6/challenge/")){
    const rest=r.slice(13).split("/"),mode=rest[0],id=rest[1];
    const content=challengeView(mode,id);
    $("root").innerHTML=shell(content,r);
    document.title="Identity Architect V6 · "+id+" "+mode;
    lastRenderedHash=location.hash;
    window.scrollTo(0,0);
    return;
  }
  prevRender();
  r=current();
  if(r.startsWith("v6/lesson/")){
    const id=r.slice(10),u=V6_UNITS.find(x=>x.id===id),h=document.querySelector("#view .page");
    if(u&&h){const first=h.querySelector(".panel");if(first)first.insertAdjacentHTML("beforebegin",modeTabs(u));}
  }
  if(r==="v6/academy"){
    document.querySelectorAll('#view button[data-route^="v6/lesson/"]').forEach(btn=>{
      const id=btn.dataset.route.split("/").pop();
      if(!V6_UNITS.some(u=>u.id===id))return;
      const p=btn.parentElement;
      if(p&&!p.querySelector('button[data-mode="practice"]')){
       p.insertAdjacentHTML("beforeend",`<div class="flex wrap" style="margin-top:9px"><button class="btn xs" data-action="v6-start-challenge" data-mode="practice" data-id="${id}">Practice mode</button><button class="btn xs" data-action="v6-start-challenge" data-mode="exam" data-id="${id}">Exam mode</button></div>`);
      }
    });
  }
 };
 action=function(a,el){
  if(a==="v6-start-challenge"||a==="v6-reset-challenge"){
    let id=el.dataset.id,mode=el.dataset.mode,u=V6_UNITS.find(x=>x.id===id);
    if(!u||!["practice","exam"].includes(mode)){toast("Invalid challenge","bad");return;}
    db.v6.activeChallenge={id,mode,baseline:snapshot(u),started:Date.now(),finished:false};
    save();go(challengeUrl(db.v6.activeChallenge));return;
  }
  if(a==="v6-evaluate-challenge"){
    let c=db.v6.activeChallenge,u=V6_UNITS.find(x=>x.id===el.dataset.id);
    if(!c||c.id!==u?.id){toast("Start the task first","bad");return;}
    let changed=snapshot(u)!==c.baseline,correct=check(u),pass=changed&&correct;
    c.finished=true;c.passed=pass;c.message=!changed?"No change in the relevant fictional records was detected during this attempt.":correct?"The modified fictional tenant meets the training assertion; real cloud behavior remains unverified.":"A change was detected, but the final fictional configuration does not yet satisfy the business requirement.";
    db.v6.challengeAttempts.push({id:u.id,mode:c.mode,passed:pass,date:new Date().toLocaleString(),elapsedSeconds:Math.round((Date.now()-c.started)/1000)});
    save();render();return;
  }
  return prevAction(a,el);
 };
})();
