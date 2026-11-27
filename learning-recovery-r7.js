/* Recovery recommendations derived from retained assessment history; no mastery claims. */
(function(){'use strict';
function inventory(){return [...(window.MD102_SCENARIO_QUESTIONS||[]),...(window.MD102_SUPPLEMENTAL_DRILLS||[]),...ACADEMY.questions.map(q=>({...q,id:'legacy-scenario-'+q.id,objectiveId:null}))];}
function analyze(history=state.v4?.quizHistory||[],bank=inventory()){
 const questions=new Map(bank.map(q=>[q.id,q])),objectives=new Map((window.MD102_OBJECTIVES||[]).map(o=>[o.id,o]));
 const latest=new Map(),misses=new Map();let ignored=0;
 for(const [index,r] of (Array.isArray(history)?history:[]).entries()){
  if(!r||typeof r.id!=='string'||typeof r.correct!=='boolean'||!Number.isFinite(r.at)||r.at<0){ignored++;continue;}
  if(!r.correct)misses.set(r.id,(misses.get(r.id)||0)+1);
  const old=latest.get(r.id);if(!old||r.at>old.at||(r.at===old.at&&index>old.index))latest.set(r.id,{...r,index});
 }
 const groups=new Map(),unmapped=[];let recovered=0;
 for(const r of latest.values()){
  if(r.correct){if(misses.has(r.id))recovered++;continue;}
  const q=questions.get(r.id),o=q&&objectives.get(q.objectiveId);
  if(!o){unmapped.push({id:r.id,available:!!q});continue;}
  if(!groups.has(o.id))groups.set(o.id,{id:o.id,title:o.title,items:[],misses:0});
  const g=groups.get(o.id);g.items.push({id:r.id,prompt:q.prompt,at:r.at});g.misses+=misses.get(r.id)||1;
 }
 const order=window.MD102ObjectiveOrderR4.flat;
 return {groups:[...groups.values()].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id)),unmapped,recovered,ignored,pendingIds:[...latest.values()].filter(r=>!r.correct).map(r=>r.id)};
}
function retryPool(bank,history,objectiveId){const pending=new Set(analyze(history,bank).pendingIds);return bank.filter(q=>pending.has(q.id)&&(!objectiveId||q.objectiveId===objectiveId));}
const H=x=>esc(String(x??'')),B=(route,title)=>'<button type="button" class="btn" data-route="'+H(route)+'">'+H(title)+'</button>';
function view(){const a=analyze();return '<section class="card"><div class="super">PERSONAL RECOVERY PLAN</div><h1>Learn from missed decisions</h1><p>Review the concept, practice the procedure, then retry the missed questions. Objectives follow your prerequisite learning order.</p><p>Objectives needing review: '+a.groups.length+' · Previously missed questions now correct: '+a.recovered+'.</p><p>Retry success is practice evidence, not an unseen assessment or proof of lasting mastery. Recommendations use retained history and current question mappings; clearing history removes this evidence.</p>'+B('curriculum','Primary learning path')+' '+B('practice-exams','Assessment laboratory')+'</section>'+(a.groups.length?a.groups.map(g=>{const labs=window.MD102ProceduresR6.labs.filter(l=>l.objective===g.id);return '<section class="card" data-recovery-objective="'+H(g.id)+'"><h2>'+H(g.id+' · '+g.title)+'</h2><p>Questions still missed: '+g.items.length+' · Missed attempts in retained history: '+g.misses+'.</p><ol><li>'+B('objective-depth:'+g.id,'Review concepts')+'</li><li>'+B('objective:'+g.id,'Practice guided skill')+' '+labs.map(l=>B('procedure-r6:'+l.id,l.title)).join(' ')+'</li><li><button type="button" class="btn primary" data-recovery-retry="'+H(g.id)+'">Prepare targeted retry</button></li></ol><details><summary>Questions needing review</summary>'+g.items.map(q=>'<p>'+H(q.prompt)+'</p>').join('')+'</details></section>';}).join(''):'<section class="card"><h2>No mapped recovery tasks</h2><p>Complete an assessment to identify areas to review. An empty queue is not a certification-readiness result.</p></section>')+(a.unmapped.length?'<section class="card"><h2>Misses without an objective route</h2><p>'+a.unmapped.length+' retained question IDs are unavailable or lack a current objective mapping. Available items can still appear in general weak-area practice.</p>'+B('practice-exams','Open assessment modes')+'</section>':'');}
const prior=render;render=function(){const route=String(state.route||'');if(route==='learning-recovery'){$('sidenav').innerHTML=navSidebar();$('bladenav').innerHTML=modernBladeNav();$('coachroot').innerHTML='';$('content').innerHTML=view();return;}prior();if(['curriculum','competency-quality'].includes(route)||(route==='practice-exams'&&(!state.v4.activeExam||state.v4.activeExam.submitted)))$('content')?.insertAdjacentHTML('afterbegin','<section class="card"><h2>Your next learning steps</h2><p>Turn missed decisions into concept review, procedural practice and targeted retries.</p>'+B('learning-recovery','Open recovery plan')+'</section>');};
const oldArea=activeArea;activeArea=function(){return state.route==='learning-recovery'?'academy':oldArea();};
LEARN_NAV.push(['learning-recovery','+','Personal recovery plan']);BLADE_GROUPS.academy[0][1].push(['learning-recovery','Personal recovery plan']);
document.addEventListener('click',e=>{const b=e.target.closest('[data-recovery-retry]');if(!b||state.route!=='learning-recovery')return;const id=b.dataset.recoveryRetry;if(!analyze().groups.some(g=>g.id===id))return;if(state.v4.activeExam&&!state.v4.activeExam.submitted){toast('Finish your active assessment before preparing a retry.');return;}state.v4.examSetup={mode:'weakness',domain:'all',size:10,objectiveId:id};save();location.hash='practice-exams';});
window.MD102RecoveryR7={analyze,retryPool,inventory,view};render();
})();
