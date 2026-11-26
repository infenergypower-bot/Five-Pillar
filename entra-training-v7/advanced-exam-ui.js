/* Mixed-format original cybersecurity assessment engine: single, multi, matching, sequence. */
(function installAdvancedAssessment(){
 db.v7=db.v7||{};db.v7.advancedHistory=db.v7.advancedHistory||[];db.v7.advancedExam=db.v7.advancedExam||null;
 const oldRender=render,oldAction=action,oldShell=shell,esc=v=>safe(String(v??""));
 const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;};
 const byId=id=>V7_ADVANCED_QUESTIONS.find(x=>x.id===id);
 const clean=(a)=>JSON.stringify(a);
 function choiceIndexes(q){return shuffle(q.options.map((_,i)=>i))}
 function openExam(track,count,mode,minutes){
  const qs=shuffle(V7_ADVANCED_QUESTIONS.filter(x=>track==="All"||x.track===track)).slice(0,count);
  const order={},answers={};
  qs.forEach(q=>{
    if(q.type==="single"||q.type==="multi"){order[q.id]=choiceIndexes(q);}
    if(q.type==="matching"){order[q.id]=shuffle(q.pairs.map((_,i)=>i));}
    if(q.type==="sequence"){answers[q.id]=shuffle(q.steps.map((_,i)=>i));}
  });
  db.v7.advancedExam={track,mode,minutes:Number(minutes)||0,started:Date.now(),ids:qs.map(x=>x.id),orders:order,answers,at:0,submitted:false};
  save();go("v7/advanced-exam/session");
 }
 function isAnswered(q,a){
  if(q.type==="sequence")return Array.isArray(a)&&a.length===q.steps.length;
  if(q.type==="multi")return Array.isArray(a)&&a.length>0;
  if(q.type==="matching")return a&&typeof a==="object"&&q.pairs.every((_,i)=>Number.isInteger(a[i]));
  return Number.isInteger(a);
 }
 function isCorrect(q,a){
  if(!isAnswered(q,a))return false;
  if(q.type==="single")return a===q.correct;
  if(q.type==="multi")return clean([...a].sort((x,y)=>x-y))===clean([...q.correct].sort((x,y)=>x-y));
  if(q.type==="matching")return q.pairs.every((_,i)=>a[i]===i);
  if(q.type==="sequence")return a.every((id,i)=>id===i);
  return false;
 }
 function scoreExam(){
  const s=db.v7.advancedExam,qs=s.ids.map(byId);
  const n=qs.filter(q=>isCorrect(q,s.answers[q.id])).length;
  const byTrack=qs.reduce((acc,q)=>{let x=acc[q.track]||{right:0,total:0};x.total++;if(isCorrect(q,s.answers[q.id]))x.right++;acc[q.track]=x;return acc;},{});
  return {n,total:qs.length,pct:Math.round(n/qs.length*100),byTrack};
 }
 function submit(){
  const s=db.v7.advancedExam;if(!s||s.submitted)return;
  const r=scoreExam();
  s.submitted=true;s.submittedAt=Date.now();s.result=r;
  db.v7.advancedHistory.push({track:s.track,mode:s.mode,date:new Date().toLocaleString(),score:r.n,total:r.total,pct:r.pct,minutes:Math.round((Date.now()-s.started)/60000)});
  save();render();
 }
 function hub(){
  const hist=db.v7.advancedHistory||[];
  return `<div class="page"><div class="eyebrow">ORIGINAL CERTIFICATION ASSESSMENT LAB</div><h1>Practice authentic decisions, not answer patterns</h1>
   <p class="muted maincopy">28 additional original scenario questions include matching, sequencing, multiple-answer, and decision-making formats. Choices are shuffled for each attempt; explanations appear after the exam in independent mode. This supplementary question pool is not large enough to establish certification readiness.</p>
   <div class="grid4">${["SC-300","SC-900","SC-100","All"].map(t=>`<div class="panel"><div class="statnum">${V7_ADVANCED_QUESTIONS.filter(x=>t==="All"||x.track===t).length}</div><div class="statlabel">${t} questions</div></div>`).join("")}</div>
   <div class="grid2" style="margin-top:18px">
     <div class="panel"><h3>Configure an original scenario assessment</h3>
      <form id="v7-advanced-setup">
       <label class="field">Exam track<select name="track">${["SC-300","SC-900","SC-100","All"].map(t=>`<option value="${t}">${t}</option>`).join("")}</select></label>
       <label class="field">Number of questions<select name="count"><option value="8">8</option><option value="12">12</option><option value="28">All available in this track</option></select></label>
       <label class="field">Mode<select name="mode"><option value="practice">Practice · explanations on submission</option><option value="exam">Independent mock · no hints</option></select></label>
       <label class="field">Duration<select name="minutes"><option value="0">Untimed</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label>
       <button class="btn primary" type="submit">Begin new assessment →</button>
      </form></div>
     <div class="panel"><h3>Why these interactions matter</h3>
      <div class="flow"><div class="flownode">Apply evidence</div><div class="flownode">Prioritize controls</div><div class="flownode">Choose a configuration</div><div class="flownode">Explain why</div></div>
      <p>Matching tests which technology fits a requirement. Sequencing tests the safe implementation order. Multi-select tests whether you can distinguish several valid controls from tempting but unsafe alternatives.</p>
      <div class="caution"><b>Limit:</b> These are original teaching assessments, not leaked Microsoft questions or a reproduction of Microsoft's actual examination. An 85–90% result here alone does not establish readiness.</div></div>
   </div>
   ${db.v7.advancedExam&&!db.v7.advancedExam.submitted?'<button class="btn primary" data-route="v7/advanced-exam/session">Resume current assessment</button>':""}
   <div class="panel" style="margin-top:18px"><h3>Previous scenario attempts</h3>${hist.length?`<div class="scrolltable"><table class="ptable"><thead><tr><th>Date</th><th>Track</th><th>Correct</th><th>Percent</th></tr></thead><tbody>${[...hist].reverse().slice(0,15).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.track)}</td><td>${x.score}/${x.total}</td><td>${x.pct}%</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted">No attempts saved yet.</p>'}</div>${footer()}</div>`;
 }
 function answerControl(q,s){
  const a=s.answers[q.id],order=s.orders[q.id]||[];
  if(q.type==="single"||q.type==="multi"){
   return `<div class="questionopts">${order.map((id,j)=>`<label class="choice ${q.type==="multi"?(Array.isArray(a)&&a.includes(id)?"selected":""):(a===id?"selected":"")}">
     <input type="${q.type==="multi"?"checkbox":"radio"}" name="v7-answer" data-original="${id}" value="${id}" ${q.type==="multi"?(Array.isArray(a)&&a.includes(id)?"checked":""):(a===id?"checked":"")}><b>${String.fromCharCode(65+j)}.</b> ${esc(q.options[id])}</label>`).join("")}</div>`;
  }
  if(q.type==="matching"){
   return `<p class="small muted">Match each left-hand technology to its correct function. Each description should be used once.</p>
   ${q.pairs.map((pair,i)=>`<label class="field" style="margin:13px 0"><b>${esc(pair[0])}</b>
    <select name="v7-match" data-left="${i}"><option value="">Choose the correct description</option>${order.map(id=>`<option value="${id}" ${a?.[i]===id?"selected":""}>${esc(q.pairs[id][1])}</option>`).join("")}</select></label>`).join("")}`;
  }
  if(q.type==="sequence"){
   return `<p class="small muted">Move the steps up and down until the order is correct. On a touch device, tap the arrow buttons.</p>
     <div class="panel">${a.map((id,i)=>`<div class="flex wrap between" style="gap:10px;padding:11px 0;border-bottom:1px solid #dbe4f0">
      <div class="flex" style="flex:1;align-items:center;gap:8px"><span class="pill">${i+1}</span><span>${esc(q.steps[id])}</span></div>
      <div class="flex"><button class="btn xs" data-action="v7-move" data-index="${i}" data-dir="-1" ${i===0?"disabled":""} aria-label="Move step ${i+1} up">↑</button><button class="btn xs" data-action="v7-move" data-index="${i}" data-dir="1" ${i===a.length-1?"disabled":""} aria-label="Move step ${i+1} down">↓</button></div></div>`).join("")}</div>`;
  }
  return "";
 }
 function attempt(){
  const s=db.v7.advancedExam;
  if(!s)return hub();
  if(s.submitted)return result();
  const q=byId(s.ids[s.at]);
  if(!q)return hub();
  const answered=s.ids.filter(id=>isAnswered(byId(id),s.answers[id])).length;
  return `<div class="page"><button class="btn xs" data-route="v7/advanced-exam">← Assessment setup</button>
    <div class="eyebrow" style="margin-top:16px">ORIGINAL ${esc(q.type.toUpperCase())} · ${esc(q.track)} · ${esc(q.domain)}</div>
    <h1>Question ${s.at+1} of ${s.ids.length}</h1><div class="panel"><div class="flex between wrap"><b>${esc(s.mode==="exam"?"Independent assessment":"Practice assessment")}</b><span class="pill" id="v7-time">${s.minutes?`Time limit: ${s.minutes} minutes`:"Untimed"}</span></div>
     <div class="progress" style="margin:14px 0"><span style="width:${(s.at+1)/s.ids.length*100}%"></span></div>
     <p class="examquestion">${esc(q.stem)}</p>
     ${q.type==="multi"?'<span class="pill warning">Select all appropriate options</span>':q.type==="matching"?'<span class="pill">Match all terms</span>':q.type==="sequence"?'<span class="pill">Put in the correct order</span>':''}
     ${answerControl(q,s)}
     <div class="stickybar" style="margin-top:18px">
      <button class="btn" data-action="v7-adv-prev" ${s.at===0?"disabled":""}>← Previous</button>
      <button class="btn" data-action="v7-adv-save">Save answer</button><span class="right"></span>
      ${s.at<s.ids.length-1?'<button class="btn primary" data-action="v7-adv-next">Next →</button>':'<button class="btn primary" data-action="v7-adv-submit">Submit & grade →</button>'}
     </div><p class="small muted">${answered}/${s.ids.length} questions with an answer. Answers and order remain saved in this browser for this attempt.</p>
    </div>${footer()}</div>`;
 }
 function result(){
  const s=db.v7.advancedExam,r=s.result||scoreExam();
  return `<div class="page"><div class="eyebrow">ASSESSMENT REVIEW</div><h1>${esc(s.track)} original scenario assessment</h1>
   <div class="grid3"><div class="panel"><div class="statnum">${r.pct}%</div><div class="statlabel">Raw practice result</div></div><div class="panel"><div class="statnum">${r.n}/${r.total}</div><div class="statlabel">Correct decisions</div></div><div class="panel"><div class="statnum">${Math.round((s.submittedAt-s.started)/60000)}</div><div class="statlabel">Minutes</div></div></div>
   <div class="caution" style="margin-top:16px"><b>Not a certification readiness verdict</b><p>A short educational assessment cannot measure complete domain competence. Review mistakes, complete all official subskills, and independently validate real configuration ability before booking an exam.</p></div>
   <h2>Review each decision</h2>
   ${s.ids.map((id,i)=>{const q=byId(id),a=s.answers[id],ok=isCorrect(q,a);
     let right=q.type==="single"?q.options[q.correct]:q.type==="multi"?q.correct.map(k=>q.options[k]).join("; "):q.type==="matching"?q.pairs.map(p=>p[0]+" → "+p[1]).join("; "):q.steps.join(" → ");
     let selected=q.type==="single"?(isAnswered(q,a)?q.options[a]:"No answer"):q.type==="multi"?(a?.length?a.map(k=>q.options[k]).join("; "):"No answer"):q.type==="matching"?(a?Object.entries(a).map(([k,v])=>q.pairs[k][0]+" → "+q.pairs[v]?.[1]).join("; "):"No answer"):a?.map(j=>q.steps[j]).join(" → ")||"No answer";
     return `<details class="detailsummary"><summary>${ok?"✓":"✕"} ${i+1}. ${esc(q.stem)}</summary><div>
      <p class="small"><b>Your response:</b> ${esc(selected)}</p><p class="small"><b>Correct response:</b> ${esc(right)}</p>
      <div class="explanation"><b>Why:</b> ${esc(q.why)}</div><p class="small"><a href="${esc(q.source)}" target="_blank" rel="noopener">Microsoft Learn official exam skills ↗</a></p></div></details>`;}).join("")}
   <button class="btn primary" data-route="v7/advanced-exam">Choose another independent assessment</button>${footer()}</div>`;
 }
 let clock=null;
 function startExamClock(){
  if(clock!==null){clearInterval(clock);clock=null;}
  const s=db.v7.advancedExam;
  if(!s||s.submitted||!s.minutes)return;
  const update=()=>{
   const remain=s.minutes*60-Math.floor((Date.now()-s.started)/1000);
   const el=document.getElementById("v7-time");
   if(el)el.textContent=remain>0?`Remaining ${Math.floor(remain/60)}:${String(remain%60).padStart(2,"0")}`:"Time finished";
   if(remain<=0){if(clock!==null)clearInterval(clock);clock=null;submit();}
  };
  update();
  if(!s.submitted)clock=setInterval(update,1000);
 }
 const prevShell=shell,prevRender=render,prevAction=action;
 shell=function(content,where){return prevShell(content,where).replace('<div class="sidefoot">','<div class="sectioncap">Examination practice</div><button class="navitem" data-route="v7/advanced-exam"><span class="navicon">◈</span>Mixed-format assessment lab</button><div class="sidefoot">');};
 render=function(){const r=current();if(r==="v7/advanced-exam"||r==="v7/advanced-exam/session"){
   $("root").innerHTML=shell(r.endsWith("/session")?attempt():hub(),r);
   document.title="Identity Architect Academy · Original assessment";
   lastRenderedHash=location.hash;window.scrollTo(0,0);
   if(r.endsWith("/session"))startExamClock();else if(clock!==null){clearInterval(clock);clock=null;}
   return;}
  if(clock!==null){clearInterval(clock);clock=null;}prevRender();
 };
 function collect(){
  const s=db.v7.advancedExam;if(!s||s.submitted)return;
  const q=byId(s.ids[s.at]);
  if(q.type==="single"){const r=document.querySelector('input[name="v7-answer"]:checked');if(r)s.answers[q.id]=Number(r.value);}
  if(q.type==="multi"){s.answers[q.id]=[...document.querySelectorAll('input[name="v7-answer"]:checked')].map(x=>Number(x.value));}
  if(q.type==="matching"){let m={};for(const el of document.querySelectorAll('select[name="v7-match"]')){if(el.value!=="")m[el.dataset.left]=Number(el.value);}s.answers[q.id]=m;}
  save();
 }
 action=function(a,el){
  const s=db.v7.advancedExam;
  if(a==="v7-adv-prev"||a==="v7-adv-next"||a==="v7-adv-save"||a==="v7-adv-submit"){
   if(!s||s.submitted)return;collect();
   if(a==="v7-adv-prev")s.at=Math.max(0,s.at-1);
   if(a==="v7-adv-next")s.at=Math.min(s.ids.length-1,s.at+1);
   if(a==="v7-adv-submit"){const n=s.ids.filter(id=>!isAnswered(byId(id),s.answers[id])).length;if(n&& !confirm(`${n} question(s) are unanswered. Submit anyway?`))return;submit();return;}
   save();render();return;
  }
  if(a==="v7-move"){
   if(!s||s.submitted)return;const q=byId(s.ids[s.at]);if(q?.type!=="sequence")return;
   const pos=Number(el.dataset.index),to=pos+Number(el.dataset.dir),arr=s.answers[q.id];
   if(to<0||to>=arr.length)return;[arr[pos],arr[to]]=[arr[to],arr[pos]];save();render();return;
  }
  prevAction(a,el);
 };
 document.addEventListener("submit",e=>{if(e.target?.id==="v7-advanced-setup"){
   e.preventDefault();const f=new FormData(e.target);openExam(String(f.get("track")),Math.min(28,Math.max(1,Number(f.get("count")))),String(f.get("mode")),Number(f.get("minutes")));
 }});
})();
