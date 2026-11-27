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