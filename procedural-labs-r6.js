/* Original offline teaching fixtures. These models do not call Microsoft services. */
(function(){'use strict';
const labs=[
 {id:'targeting',objective:'MAN-032',title:'Target the right endpoint',
  task:'Sales has one corporate and one personal Windows laptop. Deliver the profile only to the corporate laptop.',
  terms:'Assignment selects recipients. A filter narrows that selection using device properties.',
  steps:['Keep the Sales user assignment.','Choose a supported ownership filter and its mode.','Predict both recipients before running the fixture.'],
  fields:[['filter','Ownership filter',['none','corporate','personal']],['mode','Filter mode',['include','exclude']]],
  source:'https://learn.microsoft.com/en-us/intune/device-configuration/assign-device-profile',
  verify:'The corporate fixture receives the profile; the personal fixture does not.',
  cleanup:'Restore the initial filter selection. In an authorized tenant, remove only the pilot assignment and verify the resulting endpoint setting.'},
 {id:'access',objective:'INF-015',title:'Separate evaluation from enforcement',
  task:'Investigate a noncompliant Windows pilot device. First observe failure without blocking; then enforce for this fixture only.',
  terms:'Report-only observes. Enforcement applies the control. A sign-in can succeed while a report-only result fails.',
  steps:['Run the noncompliant fixture in Report-only.','Compare sign-in outcome with policy result.','Switch to On and repeat.'],
  fields:[['mode','Policy state',['report-only','on','off']],['compliant','Device compliant',['no','yes']]],
  source:'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only',
  verify:'Observe allowed/report-only failure, then blocked/failure for the same noncompliant fixture.',
  cleanup:'Return the fixture to Report-only. Real policy rollout also requires entitlement, roles, protected emergency access and pilot approval.'},
 {id:'paging',objective:'OPE-073',title:'Prove an inventory is complete',
  task:'A synthetic service has two pages: [PC-A, PC-B] and [PC-C]. Choose collection behavior and inspect the returned inventory.',
  terms:'A page is one response batch. A continuation link points to the next batch.',
  steps:['Start with first-page-only collection.','Inspect the missing identifier.','Follow continuation links and reconcile all three identifiers.'],
  fields:[['paging','Collector behavior',['first-page-only','follow-next-link']]],
  source:'https://learn.microsoft.com/en-us/graph/paging',
  verify:'All three fixture IDs appear after two requests and no continuation remains.',
  cleanup:'Reset the synthetic collector. No tokens, network requests or tenant data are used.'},
 {id:'remediation',objective:'OPE-080',title:'Trigger and verify a remediation',
  task:'The fixture is missing an approved setting. Configure the detection result and repair action, then inspect the final state.',
  terms:'Detection reports a condition. Remediation changes it. A successful trigger alone does not prove a repair.',
  steps:['Try exit 0 with repair enabled.','Try exit 1 with no repair.','Choose the trigger and repair together; rerun detection.'],
  fields:[['exit','Detection exit code',['0','1','2']],['action','Remediation action',['no-change','repair']]],
  source:'https://learn.microsoft.com/en-us/intune/device-management/tools/deploy-remediations',
  verify:'The repair runs, the setting exists, and post-repair detection is healthy.',
  cleanup:'Reset this fixture. A real package needs eligible licensing, supported endpoints, appropriate permissions and a tested rollback.'}
];
const byId=new Map(labs.map(x=>[x.id,x])),extensions=new Map();
function register(lab,evaluator){if(!lab?.id||byId.has(lab.id)||typeof evaluator!=='function')throw new Error('Invalid or duplicate procedure');labs.push(lab);byId.set(lab.id,lab);extensions.set(lab.id,evaluator);}
function evaluate(id,input){
 const lab=byId.get(id);if(!lab||!input||lab.fields.some(([key,,choices])=>!choices.includes(input[key])))return {valid:false,pass:false,evidence:['Choose a valid value for every field.']};
 if(extensions.has(id))return extensions.get(id)(input);
 if(id==='targeting'){const receives=owner=>input.filter==='none'||(input.mode==='include'?owner===input.filter:owner!==input.filter);const corporate=receives('corporate'),personal=receives('personal');return {valid:true,pass:corporate&&!personal,evidence:['Corporate laptop: '+(corporate?'receives profile':'excluded'),'Personal laptop: '+(personal?'receives profile':'excluded')]};}
 if(id==='access'){const bad=input.compliant==='no',blocked=input.mode==='on'&&bad,result=input.mode==='off'?'Not evaluated':(input.mode==='report-only'?'Report-only: ':'')+(bad?'Failure':'Success');return {valid:true,pass:bad&&input.mode==='on',observation:bad&&input.mode==='report-only',evidence:['Sign-in: '+(blocked?'blocked':'allowed'),'Policy result: '+result,'Model includes one policy and assumes its assignment matches.']};}
 if(id==='paging'){const complete=input.paging==='follow-next-link';return {valid:true,pass:complete,evidence:['Inventory: '+(complete?'PC-A, PC-B, PC-C':'PC-A, PC-B'),'Requests: '+(complete?2:1),'Continuation remaining: '+(!complete)]};}
 const runs=input.exit==='1',fixed=runs&&input.action==='repair';return {valid:true,pass:fixed,evidence:['Remediation ran: '+runs,'Setting exists: '+fixed,'Post-check: '+(fixed?'healthy (exit 0)':'issue remains')]};
}
function progress(){state.masteryPath ||= {};state.masteryPath.proceduralR6 ||= {};return state.masteryPath.proceduralR6;}
function record(id,input){const result=evaluate(id,input);if(!result.valid)return result;const prev=progress()[id]||{};progress()[id]={input:{...input},attempts:(prev.attempts||0)+1,observed:!!prev.observed||!!result.observation};save();return result;}
function status(id){const s=progress()[id];if(!s)return false;const result=evaluate(id,s.input);return result.pass&&(id!=='access'||s.observed===true);}
const H=x=>esc(String(x??'')),B=(route,label)=>'<button type="button" class="btn" data-route="'+H(route)+'">'+H(label)+'</button>';
function view(id){const lab=byId.get(id);if(!lab)return '<section class="card"><h1>Procedural practice</h1><p>Offline fixtures connect configuration choices to observable results. Study the linked objective first. Passing these models does not establish tenant competency.</p>'+labs.map(l=>'<p>'+B('procedure-r6:'+l.id,l.title)+' '+(status(l.id)?'Model passed':'Practice pending')+'</p>').join('')+B('curriculum','Return to learning path')+'</section>';
 const saved=progress()[id],result=saved?evaluate(id,saved.input):null;
 return '<section class="card"><div class="super">'+H(lab.objective)+' · OFFLINE PROCEDURAL PRACTICE</div><h1>'+H(lab.title)+'</h1><p>'+H(lab.task)+'</p><p>'+H(lab.terms)+'</p>'+B('objective-depth:'+lab.objective,'Study prerequisite concepts')+' '+B('procedures-r6','All procedural practice')+'<h2>Guided procedure</h2><ol>'+lab.steps.map(x=>'<li>'+H(x)+'</li>').join('')+'</ol><h2>Configure and observe</h2><form data-procedure-r6="'+H(id)+'">'+lab.fields.map(([key,label,choices])=>'<div class="field"><label for="r6-'+key+'">'+H(label)+'</label><select required id="r6-'+key+'" name="'+key+'">'+choices.map(x=>'<option value="'+H(x)+'" '+(saved?.input?.[key]===x?'selected':'')+'>'+H(x)+'</option>').join('')+'</select></div>').join('')+'<button type="submit" class="btn primary">Run fixture</button></form>'+(result?'<div role="status"><h3>'+(status(id)?'Model passed':'Inspect the evidence')+'</h3><ul>'+result.evidence.map(x=>'<li>'+H(x)+'</li>').join('')+'</ul>'+(id==='access'?'<p>Report-only failure observed: '+!!saved.observed+'</p>':'')+'</div>':'')+'<h2>Verify independently</h2><p>'+H(lab.verify)+'</p><p>Explain which input caused each result, then reproduce it without the guided steps.</p><h2>Cleanup</h2><p>'+H(lab.cleanup)+'</p><button type="button" class="btn" data-r6reset="'+H(id)+'">Reset this fixture</button><p><a href="'+H(lab.source)+'" target="_blank" rel="noopener">Microsoft technical reference</a> · Documentation reviewed November 27, 2026; independent review pending.</p><p class="small">This deliberately limited model uses synthetic data. It does not implement every service behavior or change a Microsoft tenant.</p></section>';
}
const prior=render;render=function(){const r=String(state.route||'');if(r==='procedures-r6'||r.startsWith('procedure-r6:')){$('sidenav').innerHTML=navSidebar();$('bladenav').innerHTML=modernBladeNav();$('coachroot').innerHTML='';$('content').innerHTML=view(r.startsWith('procedure-r6:')?r.slice(13):null);return;}prior();const objective=r.startsWith('objective-depth:')?r.slice(16):r.startsWith('objective:')?r.slice(10):null;const linked=labs.filter(l=>l.objective===objective);if(linked.length)$('content')?.insertAdjacentHTML('beforeend','<section class="card"><h2>Practice the procedure</h2>'+linked.map(l=>B('procedure-r6:'+l.id,l.title)).join(' ')+'</section>');if(r==='curriculum')$('content')?.insertAdjacentHTML('afterbegin','<section class="card"><h2>New procedural practice</h2><p>Targeting, access evaluation, inventory collection, remediation and application troubleshooting.</p>'+B('procedures-r6','Open procedural practice')+'</section>');};
const oldArea=activeArea;activeArea=function(){return /^procedures?-r6/.test(String(state.route||''))?'academy':oldArea();};
LEARN_NAV.push(['procedures-r6','+','Procedural practice']);BLADE_GROUPS.academy[0][1].push(['procedures-r6','Procedural practice']);
document.addEventListener('submit',e=>{const id=e.target.getAttribute('data-procedure-r6');if(!byId.has(id)||state.route!=='procedure-r6:'+id)return;e.preventDefault();const input=Object.fromEntries(byId.get(id).fields.map(([key])=>[key,e.target.elements[key].value]));record(id,input);render();});
document.addEventListener('click',e=>{const button=e.target.closest('[data-r6reset]'),id=button?.dataset.r6reset;if(!byId.has(id)||state.route!=='procedure-r6:'+id)return;delete progress()[id];save();render();});
window.MD102ProceduresR6={labs,evaluate,record,status,progress,view,register};render();
})();
