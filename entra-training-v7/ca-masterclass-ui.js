/* Visual Conditional Access Masterclass with instructional diagrams and a safe policy-evaluation simulator. */
(function addConditionalAccessMasterclass(){
 db.v7=db.v7||{};db.v7.ca=db.v7.ca||{passed:{},node:0,chapter:0,order:{},inputs:{},last:null};
 const priorRender=render,priorAction=action,priorShell=shell,esc=v=>safe(String(v??""));
 function getChapter(id){return V7_CA_LESSONS.find(x=>x.id===id)}
 const prog=()=>V7_CA_LESSONS.filter(x=>db.v7.ca.passed[x.id]).length;
 function chapterOrder(l){let o=db.v7.ca.order[l.id];if(!o){o=[...l.options.map((_,i)=>i)];for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]];}db.v7.ca.order[l.id]=o;save();}return o;}
 function nav(){
  return '<div class="sectioncap">Visual instructor course</div><button class="navitem" data-route="v7/ca-masterclass"><span class="navicon">▧</span>Conditional Access Masterclass</button>';
 }
 shell=function(content,where){return priorShell(content,where).replace('<div class="sidefoot">',nav()+'<div class="sidefoot">');};
 const firstRoute=id=>{
  const r={mental:"portal/overview",anatomy:"portal/policies",scope:"portal/groups",methods:"portal/methods",device:"portal/devices",risk:"portal/risks",report:"portal/whatif",overlap:"portal/policies",rollout:"portal/policies",master:"v7/integrated"};return r[id]||"portal/overview";
 };
 function hub(){
  const complete=prog(),fin=db.v7.caseAttempts?.some(x=>x.id==="finance"&&x.passed);
  return `<div class="page"><div class="eyebrow">VISUAL TECHNICAL INSTRUCTION · MICROSOFT ENTRA</div><h1>Conditional Access — From beginner to safe pilot</h1>
   <p class="muted maincopy">Ten connected chapters teach you how authentication policies evaluate real business requirements. Click each step in the diagrams to learn the reason behind it, practice in the fictional admin center, and complete a linked multi-object capstone.</p>
   <div class="grid3" style="margin-top:18px"><div class="panel"><div class="statnum">${complete}/10</div><div class="statlabel">Knowledge checks passed</div></div>
   <div class="panel"><div class="statnum">${fin?"Passed":"Pending"}</div><div class="statlabel">Finance case simulation</div></div><div class="panel"><div class="statnum">Simulation</div><div class="statlabel">Not a real Entra tenant</div></div></div>
   <div class="panel" style="margin-top:18px"><h3>Watch → Understand → Follow → Practice → Troubleshoot → Master</h3><p>Complete lessons in order at first. Then revisit any chapter, repeat the quiz, or launch the policy-scenario evaluator. Progress is saved in this browser.</p><button class="btn primary" data-route="v7/ca-simulator">Open visual sign-in policy evaluator →</button></div>
   <div class="grid2" style="margin-top:17px">${V7_CA_LESSONS.map((l,i)=>`<div class="panel">
    <div class="eyebrow">${i+1}. ${esc(l.topic)}</div><h3>${esc(l.title)}</h3><p class="small muted">${esc(l.intro.slice(0,205))}…</p>
    <div class="flex between wrap"><span class="pill ${db.v7.ca.passed[l.id]?"success":"warning"}">${db.v7.ca.passed[l.id]?"✓ Knowledge passed":"Practice pending"}</span><button class="btn primary" data-route="v7/ca/${l.id}">Learn visually →</button></div></div>`).join("")}</div>
   <div class="caution" style="margin-top:18px"><b>What this does not certify.</b><p class="small">A visual training module and a fictional policy evaluator cannot replicate every licensed Microsoft Conditional Access feature, global policy interaction, or cloud sign-in signal. Use a real authorized test tenant and official Microsoft practice assessment to establish external competence.</p></div>${footer()}</div>`;
 }
 function diagram(l){
  const current=db.v7.ca.chapter===V7_CA_LESSONS.indexOf(l)?db.v7.ca.node:0,n=Math.max(0,Math.min(l.diagram.length-1,current));
  return `<div class="panel" style="margin-top:17px"><div class="eyebrow">WATCH · Interactive decision diagram</div><h3>Tap a stage to understand what happens</h3>
   <div class="flex wrap" style="gap:7px;margin:16px 0" role="group" aria-label="Interactive Conditional Access decision stages">${l.diagram.map((d,i)=>`<button class="btn ${i===n?"primary":""}" data-action="v7-ca-node" data-index="${i}" style="flex:1;min-width:108px;line-height:1.5;min-height:64px"><span class="tiny">${i+1} →</span><span style="display:block">${esc(d[0])}</span></button>`).join("")}</div>
   <div class="scenario" role="status"><h3>${esc(l.diagram[n][0])}</h3><p>${esc(l.diagram[n][1])}</p></div>
   <p class="small muted">This learning diagram shows the conceptual decision flow. It is not a screenshot of an actual Microsoft administrative portal.</p>
  </div>`;
 }
 function lessonView(id){
  const l=getChapter(id);if(!l)return '<div class="page"><h1>Unknown chapter</h1></div>';
  const idx=V7_CA_LESSONS.indexOf(l);
  db.v7.ca.chapter=idx;
  const order=chapterOrder(l);
  return `<div class="page"><button class="btn xs" data-route="v7/ca-masterclass">← All chapters</button>
   <div class="eyebrow" style="margin-top:18px">CHAPTER ${idx+1} / 10 · ${esc(l.topic)}</div><h1>${esc(l.title)}</h1>
   <p class="muted maincopy">${esc(l.intro)}</p>
   ${diagram(l)}
   <div class="grid2" style="margin-top:16px"><div class="panel"><div class="eyebrow">UNDERSTAND · Why this matters</div><p>${esc(l.why)}</p><h3>Expected result</h3><p>${esc(l.expected)}</p></div>
   <div class="panel"><div class="eyebrow">FOLLOW · Guided practice</div><p>${esc(l.steps)}</p><button class="btn primary" data-route="${firstRoute(id)}">Open the matching practice screen →</button>
    ${id==="master"?'<button class="btn" style="margin-top:8px" data-route="v7/case/finance">Open Finance independent case →</button>':''}</div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">TROUBLESHOOT · Common failure</div><p>${esc(l.trouble)}</p><button class="btn" data-route="v7/ca-simulator">Test different sign-in outcomes →</button></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">MASTER · Explain the decision</div><h3>${esc(l.question)}</h3>
     <form id="v7-ca-quiz" data-id="${id}">${order.map((option,i)=>`<label class="choice"><input type="radio" name="choice" value="${option}" required> <b>${String.fromCharCode(65+i)}.</b> ${esc(l.options[option])}</label>`).join("")}
      <button class="btn primary" type="submit" style="margin-top:12px">Check understanding</button></form>
     <p class="small" role="status" id="v7-ca-feedback">${db.v7.ca.passed[id]?"✓ Previously answered correctly.":""}</p>
   </div>
   <div class="flex between wrap" style="margin-top:15px"><button class="btn" data-route="v7/ca/${V7_CA_LESSONS[Math.max(0,idx-1)].id}" ${idx===0?"disabled":""}>← Previous chapter</button>
    <button class="btn primary" data-route="v7/ca/${V7_CA_LESSONS[Math.min(9,idx+1)].id}">${idx===9?"Review capstone":"Next chapter →"}</button></div>${footer()}</div>`;
 }
 function evaluate(){
  const p=db.v7.ca.inputs||{},u=db.users.find(x=>x.id===p.user)||db.users[0],app=p.app||"Finance Reports",mfa=p.mfa==="yes",device=p.compliant==="yes",legacy=p.legacy==="yes";
  let enforced=[],reported=[],matched=[];
  for(const pol of db.policies){
   if(pol.state==="Off")continue;
   const g=pol.group==="All users"||db.groups.some(x=>x.name===pol.group&&x.members.includes(u.id));
   const a=pol.app==="All cloud apps"||pol.app===app;
   if(!g||!a)continue;
   matched.push(pol.name);
   let reason=null;
   if(/legacy client/i.test(pol.control)&&legacy)reason="Block: legacy client type";
   if(pol.control==="Block access")reason="Block access";
   if(pol.control==="Require MFA"&&!mfa)reason="MFA required but not satisfied";
   if(pol.control==="Require compliant device"&&!device)reason="Compliant device required but absent";
   if(pol.state==="Report-only"){if(reason)reported.push(pol.name+": "+reason);continue;}
   if(pol.state==="On"&&reason)enforced.push(pol.name+": "+reason);
  }
  const out={user:u.name,app,matched,enforced,reported,decision:enforced.length?"Blocked in this simplified simulator":"No simulated enforced restriction",mfa,device,legacy,time:new Date().toLocaleString()};
  db.v7.ca.last=out;save();return out;
 }
 function simView(){
  const last=db.v7.ca.last;
  return `<div class="page"><button class="btn xs" data-route="v7/ca-masterclass">← Conditional Access Masterclass</button><div class="eyebrow" style="margin-top:18px">INTERACTIVE POLICY DECISION LAB</div>
   <h1>Change the sign-in signals. See which controls apply.</h1><p class="muted maincopy">This simplified evaluator reads the same fictional policies and group memberships as your training console. It demonstrates matching assignments and report-only versus enforced grant controls. It is not Microsoft's actual What If engine.</p>
   <div class="grid2" style="margin-top:16px"><div class="panel"><h3>Build a hypothetical sign-in</h3>
      <form id="v7-ca-evaluate">
       <label class="field">Which fictional user?<select name="user">${db.users.map(u=>`<option value="${esc(u.id)}" ${db.v7.ca.inputs.user===u.id?"selected":""}>${esc(u.name)}</option>`).join("")}</select></label>
       <label class="field">Target application<select name="app">${["Finance Reports","Vendor Portal","Microsoft 365"].map(x=>`<option value="${x}" ${db.v7.ca.inputs.app===x?"selected":""}>${x}</option>`).join("")}</select></label>
       <label class="field">MFA satisfied?<select name="mfa"><option value="no">No</option><option value="yes" ${db.v7.ca.inputs.mfa==="yes"?"selected":""}>Yes</option></select></label>
       <label class="field">Device compliant?<select name="compliant"><option value="no">No</option><option value="yes" ${db.v7.ca.inputs.compliant==="yes"?"selected":""}>Yes</option></select></label>
       <label class="field">Legacy client?<select name="legacy"><option value="no">No</option><option value="yes" ${db.v7.ca.inputs.legacy==="yes"?"selected":""}>Yes</option></select></label>
       <button class="btn primary" type="submit">Evaluate hypothetical sign-in →</button>
      </form></div>
    <div class="panel"><h3>Policy evaluation model</h3><div class="flow"><div class="flownode">User + group</div><div class="flownode">App target</div><div class="flownode">Policy state</div><div class="flownode">Grant controls</div></div>
    <p>For each policy, check whether the user and app are in scope. Evaluate grant controls only for matching policies. Separate report-only impacts from enforced results. Then remember: application authorization is an additional step.</p>
    <div class="caution"><b>Important limits</b><p class="small">This model does not implement every real Conditional Access condition, authentication strength, session control, sign-in risk, protected action, service principal policy, or license. The result is not production evidence.</p></div>
    <button class="btn" data-route="portal/policies">Edit simulated policies</button></div></div>
   ${last?`<div class="panel" style="margin-top:17px"><div class="eyebrow">SIMULATED WHAT IF RESULT</div><h3>${esc(last.decision)}</h3><p><b>Principal:</b> ${esc(last.user)} · <b>Resource:</b> ${esc(last.app)}</p><p><b>Matched policies:</b> ${last.matched.length?last.matched.map(esc).join("; "):"None"}</p><p><b>Enforced restrictions:</b> ${last.enforced.length?last.enforced.map(esc).join("; "):"None"}</p><p><b>Report-only hypothetical impacts:</b> ${last.reported.length?last.reported.map(esc).join("; "):"None"}</p><p class="small muted">Other enforced policies and resource authorization may still affect a real sign-in. To validate the real service, use an authorized test tenant and actual sign-in logs.</p></div>`:""}${footer()}</div>`;
 }
 const oldShell=shell,oldRender=render,oldAction=action;
 shell=function(content,where){return oldShell(content,where).replace('<div class="sidefoot">',nav()+'<div class="sidefoot">');};
 render=function(){
  const r=current();
  if(r==="v7/ca-masterclass"||r==="v7/ca-simulator"||r.startsWith("v7/ca/")){
   $("root").innerHTML=shell(r==="v7/ca-masterclass"?hub():r==="v7/ca-simulator"?simView():lessonView(r.slice(6)),r);
   document.title="Identity Architect · Visual Conditional Access Masterclass";
   lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  oldRender();
 };
 action=function(a,el){
  if(a==="v7-ca-node"){db.v7.ca.node=Number(el.dataset.index)||0;save();render();return;}
  return oldAction(a,el);
 };
 document.addEventListener("submit",function(e){
  if(e.target?.id==="v7-ca-quiz"){e.preventDefault();const id=e.target.dataset.id,l=getChapter(id),val=Number(new FormData(e.target).get("choice"));
   const ok=val===l.answer;if(ok)db.v7.ca.passed[id]=true;save();
   const x=document.getElementById("v7-ca-feedback");if(x)x.textContent=(ok?"✓ Correct. ":"Not quite. ")+l.explain;
   toast(ok?"Understanding verified":"Review this chapter",ok?"good":"bad");}
  if(e.target?.id==="v7-ca-evaluate"){e.preventDefault();db.v7.ca.inputs=Object.fromEntries(new FormData(e.target).entries());evaluate();render();}
 });
})();
