/* V6 integrated learning upgrade. Retains V5 schema and routes. */
(function installV6(){
  const special=["v6/academy","v6/blueprint","v6/lesson/","v6/readiness","v6/cases","v6/lab"];
  db.v6=db.v6||{steps:{},quiz:{},labs:{},attempts:[],active:{},lastCourse:null};
  const oldShell=shell, oldRender=render,oldAction=action,oldHome=home;
  function esc(v){return safe(v);}
  const badge=(s)=>`<span class="pill ${s==="Validated"?"success":s==="Lesson available"?"dark":"warning"}">${esc(s)}</span>`;
  function v6Nav(){return `<div class="sectioncap">V6 · Certification preparation</div>
    <button class="navitem" data-route="v6/academy"><span class="navicon">◫</span>Deep learning academy</button>
    <button class="navitem" data-route="v6/blueprint"><span class="navicon">☷</span>2026 exam blueprint</button>
    <button class="navitem" data-route="v6/cases"><span class="navicon">◉</span>Advanced case assessment</button>
    <button class="navitem" data-route="v6/readiness"><span class="navicon">◴</span>Verified readiness</button>
    <a class="navitem" href="./real-labs.html"><span class="navicon">▣</span>Real-tenant guided labs</a>`;}
  shell=function(content,where){let html=oldShell(content,where);return html.replace('<div class="sidefoot">',v6Nav()+'<div class="sidefoot">')};
  home=function(){return oldHome().replace('<section class="hero">',`<div class="panel" style="border-left:4px solid #2374a8;margin-bottom:18px"><div class="eyebrow">V6 exam preparation — in progress</div><h3>Learn by watching, following, practicing and troubleshooting</h3><p class="muted small">Sixteen deep SC-300 lessons, official objective group inventory, connected practice checks and additional original case questions. This is not yet a complete SC-300/SC-900/SC-100 exam curriculum.</p><div class="flex wrap"><button class="btn primary" data-route="v6/academy">Start visual guided lessons →</button><button class="btn" data-route="v6/blueprint">Inspect exam coverage</button><a class="btn" href="./real-labs.html">Real Entra lab companion ↗</a></div></div><section class="hero">`)};
  function allSkillGroups(exam){return V6_BLUEPRINT.filter(x=>exam==="All"||x.exam===exam);}
  const linkMap={
    "tenant":"identity","identities":"identity","external":"external","hybrid":"external",
    "authentication":"passkeys","conditional":"conditional","risk":"monitoring","global secure":"conditional",
    "application":"apps","workload":"workload","entitlement":"governance","access review":"governance",
    "privileged":"governance","monitor":"monitoring"
  };
  function mappedUnit(row){if(row.exam!=="SC-300")return null;let q=row.group.toLowerCase();for(let [k,v] of Object.entries(linkMap))if(q.includes(k))return V6_UNITS.find(z=>z.id===v);return null;}
  function v6title(t,sub){return `<div class="eyebrow">SC-300 FIRST · V6 guided learning</div><h1>${esc(t)}</h1><p class="muted maincopy">${esc(sub)}</p>`;}
  function academyView(){let done=V6_UNITS.filter(x=>db.v6.quiz[x.id]===true).length,validated=V6_UNITS.filter(x=>db.v6.labs[x.id]===true).length;return `<div class="page">${v6title("Learn it. Configure it. Prove it.","These modules expand V5 with structured guided learning, actual practice navigation and independent checks. Practical labs only count when the simulated tenant state matches the expected result.")}
   <div class="grid3" style="margin:18px 0">
   <div class="panel"><div class="statnum">${V6_UNITS.length}</div><div class="statlabel">Deep learning units</div></div>
   <div class="panel"><div class="statnum">${done}</div><div class="statlabel">Knowledge checks passed</div></div>
   <div class="panel"><div class="statnum">${validated}</div><div class="statlabel">State-based practice checks passed</div></div></div>
   <div class="grid2">${V6_UNITS.map((u,i)=>`<div class="panel"><div class="eyebrow">UNIT ${String(i+1).padStart(2,"0")} · ${esc(u.domain)}</div><h3>${esc(u.title)}</h3><p class="muted small">${esc(u.why.slice(0,155))}…</p><div class="flex wrap"><span class="pill ${db.v6.quiz[u.id]?"success":""}">${db.v6.quiz[u.id]?"✓ Knowledge":"Knowledge pending"}</span><span class="pill ${db.v6.labs[u.id]?"success":"warning"}">${db.v6.labs[u.id]?"✓ Simulator verified":"Practice not verified"}</span></div><button class="btn primary" style="margin-top:14px" data-route="v6/lesson/${u.id}">${db.v6.quiz[u.id]?"Review lesson":"Start guided lesson"} →</button></div>`).join("")}</div>${footer()}</div>`;}
  function lessonView6(id){let u=V6_UNITS.find(x=>x.id===id);if(!u)return notfound();let n=db.v6.steps[id]||0,step=u.steps[n],checked=db.v6.quiz[id],lab=db.v6.labs[id];return `<div class="page">
   <div class="flex between wrap"><button class="btn xs" data-route="v6/academy">← All guided lessons</button><span class="pill">${esc(u.domain)}</span></div>
   ${v6title(u.title,"WATCH → UNDERSTAND → FOLLOW → PRACTICE → TROUBLESHOOT → MASTER")}
   <div class="panel" style="margin-top:18px"><div class="eyebrow">WATCH · Animated concept as a decision flow</div><h3>Follow this access path</h3><div class="flow" aria-label="Concept diagram">${u.flow.map((s,i)=>`<div class="flownode"><div class="eyebrow">0${i+1}</div>${esc(s)}</div>`).join("")}</div><p class="hint">Read the flow left to right. Each transition is a security decision, not merely a screen to click.</p></div>
   <div class="grid2" style="margin-top:15px"><div class="panel"><div class="eyebrow">UNDERSTAND · Everyday analogy</div><p>${esc(u.analogy)}</p><h3>Why organizations use this</h3><p>${esc(u.why)}</p></div><div class="panel"><div class="eyebrow">UNDERSTAND · Real-world implementation</div><p>${esc(u.how)}</p><div class="caution"><b>What can go wrong</b><p class="small">${esc(u.pitfall)}</p></div></div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">FOLLOW · Guided walkthrough</div><h3>Step ${n+1} of ${u.steps.length}: ${esc(step[0])}</h3>
     <div class="progress" style="margin-bottom:17px"><span style="width:${(n+1)/u.steps.length*100}%"></span></div>
     <div class="scenario"><b>Why this step?</b><p>${esc(step[2])}</p></div>
     <div class="flex wrap" style="margin-top:14px"><button class="btn" data-action="v6-previous" data-id="${id}" ${n===0?"disabled":""}>← Previous</button><button class="btn primary" data-route="${step[1]}">Open practice screen ↗</button><button class="btn" data-action="v6-next" data-id="${id}" ${n===u.steps.length-1?"disabled":""}>Next step →</button><span class="pill">${n+1}/${u.steps.length}</span></div>
     <details class="detailsummary" style="margin-top:16px"><summary>Open full step-by-step checklist</summary><div>${u.steps.map((s,i)=>`<div class="step"><div class="stepno">${i+1}</div><div class="details"><b>${esc(s[0])}</b><p class="small muted">${esc(s[2])}</p><button class="btn xs" data-route="${s[1]}">Go to console</button></div></div>`).join("")}</div></details>
   </div>
   <div class="grid2" style="margin-top:16px">
     <div class="panel"><div class="eyebrow">PRACTICE · Validate the state, not the click</div><h3>Have you actually made the changes?</h3><p class="muted small">The checker examines objects saved inside your fictional practice tenant. It does not accept simply pressing Next as proof.</p><button class="btn primary" data-action="v6-check-lab" data-id="${id}">Check my simulated configuration</button><p id="v6-lab-feedback" role="status">${lab?"✓ Previously passed in this browser.":"Not yet validated."}</p><div class="caution small"><b>Simulator limit:</b> this is not equivalent to configuring a licensed real Microsoft tenant.</div></div>
     <div class="panel"><div class="eyebrow">MASTER · Check your reasoning</div><h3>${esc(u.quiz.stem)}</h3><form id="v6-unit-quiz" data-unit="${id}">${u.quiz.options.map((v,i)=>`<label class="choice"><input type="radio" name="q" value="${i}" required> <b>${String.fromCharCode(65+i)}.</b> ${esc(v)}</label>`).join("")}<button class="btn primary" type="submit">Grade my explanation</button></form><p role="status" id="v6-quiz-feedback">${checked?"✓ Previously answered correctly.":"Answer this independently to record knowledge."}</p></div>
   </div><div class="panel" style="margin-top:16px"><div class="eyebrow">TROUBLESHOOT · What would you do?</div><p>${esc(u.pitfall)}</p><p class="muted small">Reopen the relevant practice screen, inspect the configuration, and explain the observed security effect before changing anything.</p></div>${footer()}</div>`;}
  function checkState(u){
    if(u.validate==="memberGroup")return db.groups.some(g=>/finance/i.test(g.name)&&g.members.some(id=>!["u0","u1","u2","u3"].includes(id)));
    if(u.validate==="reportPolicy")return db.policies.some(p=>/finance/i.test(p.name)&&/report/i.test(p.state)&&/mfa/i.test(p.control)&&p.app==="Finance Reports"&&p.group!=="All users");
    if(u.validate==="passwordless")return !!db.passkeys&&db.users.some(x=>x.tap);
    if(u.validate==="guest")return db.users.some(x=>x.type==="Guest");
    if(u.validate==="managed")return db.managed.length>0;
    if(u.validate==="registration")return db.regs.length>0;
    if(u.validate==="governance")return db.packages.length>0&&db.reviews.length>0&&db.pim.length>0;
    if(u.validate==="risk")return db.risks.some(x=>x.status&&x.status!=="Open")||!!db.caseSolved;
    if(u.validate==="unit")return db.units.length>0;
    if(u.validate==="hybrid")return !!db.hybridFixed;
    if(u.validate==="gsa")return db.gsa.length>0;
    if(u.validate==="oauth")return !!db.oauthDenied;
    if(u.validate==="package")return db.packages.length>0;
    if(u.validate==="pim")return db.pim.length>0;
    if(u.validate==="diagnostics")return !!db.diagnostics||!!db.queryFailed;
    return false;
  }
  function coverageView(){
   let track=db.v6.blueprintTrack||"SC-300",rows=allSkillGroups(track),total=V6_BLUEPRINT.length;
   return `<div class="page">${v6title("Verified 2026 exam objective inventory","All ${total} groupings are sourced from current Microsoft study guides. The group labels represent ${V6_BLUEPRINT.reduce((a,b)=>a+b.count,0)} listed measured subskills across the three exams. These counts are an inventory, NOT completed coverage.")}
   <div class="caution"><b>Audit rule</b><p class="small">A linked lesson or a pass in a fictional simulator does not verify that an entire exam objective is mastered. The coverage label stays unverified until substantive training, practical evidence, and independently checked assessments exist for the full group.</p></div>
   <div class="pillrow" style="margin:18px 0">${["SC-300","SC-900","SC-100","All"].map(x=>`<button class="btn ${track===x?"primary":""}" data-action="v6-blueprint-filter" data-id="${x}">${x}</button>`).join("")}</div>
   <div class="panel"><div class="flex between wrap"><h3>${rows.length} objective groups · ${rows.reduce((n,x)=>n+x.count,0)} listed subskills</h3><button class="btn xs" data-action="v6-export-blueprint">Export coverage CSV ↓</button></div>
   <div class="scrolltable"><table class="ptable"><thead><tr><th>Exam</th><th>Official group</th><th>Subskills</th><th>Instruction</th><th>Status</th></tr></thead><tbody>${rows.map((x,i)=>{let u=mappedUnit(x);return `<tr><td><b>${esc(x.exam)}</b></td><td><b>${esc(x.group)}</b><div class="small muted">${esc(x.domain)}</div><a href="${esc(x.source)}" target="_blank" rel="noopener">See complete official skill list ↗</a></td><td>${x.count}</td><td>${u?`<button class="btn xs" data-route="v6/lesson/${u.id}">Related: ${esc(u.title)}</button>`:'<span class="muted tiny">Full guided unit not built</span>'}</td><td>${badge("Not validated")}</td></tr>`}).join("")}</tbody></table></div></div>${footer()}</div>`;
  }
  function readinessView(){
    const known=V6_UNITS.filter(x=>db.v6.quiz[x.id]===true).length,lab=V6_UNITS.filter(x=>db.v6.labs[x.id]===true).length,
     attempts=db.v6.attempts||[],best=attempts.length?Math.max(...attempts.map(x=>x.percent)):0;
    return `<div class="page">${v6title("Your honest readiness dashboard","Knowledge mastery and simulated tenant task success are tracked separately. Neither proves an official Microsoft exam pass.")}
    <div class="grid4"><div class="panel"><div class="statnum">${known}/${V6_UNITS.length}</div><div class="statlabel">Knowledge checks passed</div></div><div class="panel"><div class="statnum">${lab}/${V6_UNITS.length}</div><div class="statlabel">Simulated labs passed</div></div><div class="panel"><div class="statnum">${attempts.length}</div><div class="statlabel">Advanced case attempts</div></div><div class="panel"><div class="statnum">${best}%</div><div class="statlabel">Best pilot case score</div></div></div>
    <div class="caution" style="margin-top:18px"><b>Certification verdict: NOT YET EXAM-READY.</b><p class="small">V6 currently provides sixteen expanded SC-300 learning units and a 36-question original scenario case assessment. Most official subskills across SC-300, SC-900 and SC-100 still lack comprehensive independently tested implementation labs, and this browser cannot validate production tenant configuration.</p></div>
    <div class="panel" style="margin-top:18px"><h3>Recommended next skills</h3>${V6_UNITS.filter(x=>!db.v6.quiz[x.id]||!db.v6.labs[x.id]).map(x=>`<div class="flex between wrap" style="padding:10px 0;border-bottom:1px solid #eee"><b>${esc(x.title)}</b><button class="btn xs" data-route="v6/lesson/${x.id}">Learn & practice →</button></div>`).join("")||"<p>Your eight pilot units are completed. Continue into the full official Microsoft labs.</p>"}</div>
    <div class="panel" style="margin-top:16px"><h3>Official verification</h3><p>Use the latest Microsoft AI Skills Navigator practice assessments, then conduct independently verifiable labs in an authorized Entra tenant. A practical preparation target is several fresh assessment scores near 85–90% with explainable reasoning; that is not Microsoft's official passing rule.</p><div class="pillrow"><a class="btn" href="${LINKS["SC-300"]}" target="_blank" rel="noopener">Official SC-300 guide ↗</a><a class="btn" href="${LINKS["SC-900"]}" target="_blank" rel="noopener">Official SC-900 guide ↗</a><a class="btn" href="${LINKS["SC-100"]}" target="_blank" rel="noopener">Official SC-100 guide ↗</a></div></div>${footer()}</div>`;
  }
  function startCase(mode){
    const ids=V6_CASES.map(x=>x.id);
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
    const orders={};
    for(const q of V6_CASES){let choices=q.options.map((_,i)=>i);for(let i=choices.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]]}orders[q.id]=choices;}
    db.v6.active={ids,orders,answer:{},at:0,mode,started:Date.now(),submitted:false};
    save();go("v6/cases");
  }
  function caseView(){
    let a=db.v6.active||{};
    if(!a.ids||a.submitted){
      const attempts=db.v6.attempts||[];
      return `<div class="page">${v6title("SC-300 scenario assessment pilot","Original practice cases. Answer positions are randomized for each attempt. These are deliberately a limited pilot and not a reliable prediction of the official exam.")}
        <div class="grid2"><div class="panel"><h3>Practice with feedback</h3><p class="muted">${V6_CASES.length} original policy, identity, app and governance cases.</p><button class="btn primary" data-action="v6-start-cases" data-id="practice">Start practice →</button></div><div class="panel"><h3>Independent mock mode</h3><p class="muted">No guidance until the results page. Compare explanations after submitting.</p><button class="btn primary" data-action="v6-start-cases" data-id="exam">Start mock →</button></div></div>
        <div class="panel" style="margin-top:16px"><h3>Past attempts</h3>${attempts.length?`<table class="ptable"><thead><tr><th>Date</th><th>Score</th><th>Mode</th></tr></thead><tbody>${[...attempts].reverse().slice(0,12).map(x=>`<tr><td>${esc(x.date)}</td><td>${x.percent}%</td><td>${esc(x.mode)}</td></tr>`).join("")}</tbody></table>`:'No attempts yet.'}</div>${footer()}</div>`;}
    let id=a.ids[a.at],q=V6_CASES.find(x=>x.id===id),choiceOrder=a.orders[id],selected=a.answer[id],seconds=Math.floor((Date.now()-a.started)/1000);
    return `<div class="page examcard">${v6title("SC-300 scenario practice","Question "+(a.at+1)+" of "+a.ids.length+" · "+q.domain)}
       <div class="panel"><div class="progress" style="margin:15px 0"><span style="width:${(a.at+1)/a.ids.length*100}%"></span></div>
       <p class="examquestion">${esc(q.stem)}</p><div class="questionopts">${choiceOrder.map((orig,i)=>`<label class="choice ${selected===orig?"selected":""}"><input type="radio" name="v6case" value="${orig}" ${selected===orig?"checked":""}> <b>${String.fromCharCode(65+i)}.</b> ${esc(q.options[orig])}</label>`).join("")}</div>
       ${a.mode==="practice"&&selected!==undefined?`<details class="detailsummary"><summary>Reveal reasoning (practice only)</summary><div><b>${selected===q.answer?"Correct":"Review your decision"}</b><p>${esc(q.why)}</p></div></details>`:""}
       <div class="flex wrap" style="margin-top:20px"><button class="btn" data-action="v6-case-prev" ${a.at===0?"disabled":""}>← Previous</button><button class="btn" data-action="v6-case-save">Save answer</button><span class="right"></span>${a.at<a.ids.length-1?'<button class="btn primary" data-action="v6-case-next">Next →</button>':'<button class="btn primary" data-action="v6-case-submit">Submit & grade →</button>'}</div>
       <p class="small muted">Answered ${Object.keys(a.answer).length}/${a.ids.length} · Time elapsed about ${Math.round(seconds/60)} minutes</p></div>${footer()}</div>`;
  }
  function caseResult(){
    let a=db.v6.active,qs=a.ids.map(id=>V6_CASES.find(q=>q.id===id)),score=qs.filter(q=>a.answer[q.id]===q.answer).length,p=Math.round(score/qs.length*100),by={};
    qs.forEach(q=>{by[q.domain]=by[q.domain]||{ok:0,total:0};by[q.domain].total++;if(a.answer[q.id]===q.answer)by[q.domain].ok++;});
    return `<div class="page">${v6title("Exam simulation review","Results from independent original questions — not a Microsoft exam score")}
      <div class="grid3"><div class="panel"><div class="statnum">${p}%</div><div class="statlabel">Raw practice score</div></div><div class="panel"><div class="statnum">${score}/${qs.length}</div><div class="statlabel">Correct</div></div><div class="panel"><div class="statnum">${Object.keys(by).length}</div><div class="statlabel">Domains sampled</div></div></div>
      <div class="panel" style="margin-top:16px"><h3>Subject feedback</h3>${Object.entries(by).map(([name,v])=>`<div><div class="flex between"><b>${esc(name)}</b><b>${v.ok}/${v.total}</b></div><div class="progress"><span style="width:${v.ok/v.total*100}%"></span></div></div>`).join("")}</div>
      <h3 style="margin-top:20px">Review all reasoning</h3>${qs.map((q,i)=>`<details class="detailsummary"><summary>${a.answer[q.id]===q.answer?"✓":"✕"} ${i+1}. ${esc(q.stem)}</summary><div><p><b>Correct:</b> ${esc(q.options[q.answer])}</p><p><b>Your response:</b> ${a.answer[q.id]===undefined?"No answer":esc(q.options[a.answer[q.id]])}</p><div class="explanation">${esc(q.why)}</div></div></details>`).join("")}
      <button class="btn primary" data-action="v6-restart-cases">Try fresh order →</button>${footer()}</div>`;
  }
  const originalRender=render;
  render=function(){
    const r=current();
    let content=null;
    if(r==="v6/academy")content=academyView();
    else if(r==="v6/blueprint")content=coverageView();
    else if(r.startsWith("v6/lesson/"))content=lessonView6(r.slice(10));
    else if(r==="v6/readiness")content=readinessView();
    else if(r==="v6/cases")content=db.v6.active?.submitted?caseResult():caseView();
    if(content!==null){
      $("root").innerHTML=shell(content,r);
      document.title="Identity Architect Academy V6 · "+r.split("/").slice(1).join(" / ");
      lastRenderedHash=location.hash;
      window.scrollTo(0,0);
      return;
    }
    return originalRender();
  };
  function csvExport(){
    const header=["Exam","Domain","Objective group","Subskill count","Suggested lesson","Evidence","Status","Official URL"];
    const rows=V6_BLUEPRINT.map(x=>{const u=mappedUnit(x);return [x.exam,x.domain,x.group,x.count,u?.title||"Not built",u?"Instruction + simulated practice only":"No validated instruction","Not verified",x.source]});
    downloadText("v6-exam-coverage-matrix.csv",[header,...rows].map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(",")).join("\n"));
  }
  const originalAction=action;
  action=function(a,el){
    if(a==="v6-previous"||a==="v6-next"){
      const u=V6_UNITS.find(x=>x.id===el.dataset.id);
      db.v6.steps[u.id]=Math.max(0,Math.min(u.steps.length-1,(db.v6.steps[u.id]||0)+(a==="v6-next"?1:-1)));
      save();render();return;
    }
    if(a==="v6-check-lab"){
      let u=V6_UNITS.find(x=>x.id===el.dataset.id);let ok=checkState(u);
      if(ok){db.v6.labs[u.id]=true;save();}
      const msg=document.getElementById("v6-lab-feedback");if(msg)msg.textContent=ok?"✓ Verified: the fictional tenant has the required state.":"Not verified yet. Recheck the guided actions and the relevant records; a navigation click alone does not pass.";
      toast(ok?"Practice state verified":"Not yet completed",ok?"good":"bad");return;
    }
    if(a==="v6-blueprint-filter"){db.v6.blueprintTrack=el.dataset.id;save();render();return;}
    if(a==="v6-export-blueprint"){csvExport();return;}
    if(a==="v6-start-cases"){startCase(el.dataset.id);return;}
    if(a==="v6-restart-cases"){db.v6.active={};save();go("v6/cases");return;}
    if(["v6-case-prev","v6-case-next","v6-case-save","v6-case-submit"].includes(a)){
      let s=db.v6.active,id=s.ids[s.at],checked=document.querySelector("input[name=v6case]:checked");
      if(checked)s.answer[id]=Number(checked.value);
      if(a==="v6-case-prev")s.at=Math.max(0,s.at-1);
      if(a==="v6-case-next")s.at=Math.min(s.ids.length-1,s.at+1);
      if(a==="v6-case-submit"){
        if(Object.keys(s.answer).length<s.ids.length&&!confirm("You have unanswered questions. Grade anyway?"))return;
        const pct=Math.round(s.ids.filter(id=>s.answer[id]===V6_CASES.find(x=>x.id===id).answer).length/s.ids.length*100);
        db.v6.attempts.push({date:new Date().toLocaleString(),percent:pct,mode:s.mode,questionCount:s.ids.length});s.submitted=true;
      }
      save();render();return;
    }
    return originalAction(a,el);
  };
  document.addEventListener("submit",function(e){
    if(e.target?.id==="v6-unit-quiz"){
      e.preventDefault();const id=e.target.dataset.unit,u=V6_UNITS.find(x=>x.id===id),v=Number(new FormData(e.target).get("q")),correct=v===u.quiz.answer;
      if(correct){db.v6.quiz[id]=true;save();}
      const dest=document.getElementById("v6-quiz-feedback");
      if(dest)dest.textContent=(correct?"✓ Correct. ":"Try again. ")+u.quiz.why;
      toast(correct?"Knowledge check passed":"Review the explanation",correct?"good":"bad");
    }
  });
  // Append the new original cases to V5's existing question bank, without replacing older student results.
  for(const q of V6_CASES){if(!QUESTIONS.some(x=>x.id===q.id))QUESTIONS.push({id:q.id,track:"SC-300",domain:q.domain,type:"single",stem:q.stem,choices:q.options,answers:[q.answer],why:q.why});}
})();
