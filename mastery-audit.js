/* Read-only verification of installed curriculum inventories and dependency order. */
(function auditPath(){
'use strict';
const m=window.MD102MasteryPath;if(!m)return;
const VERSION='MASTERY-2026-11-27-R1',H=x=>esc(String(x??'')),B=(r,t)=>`<button class="btn" type="button" data-route="${H(r)}">${H(t)}</button>`;
function verify(){
 const links=m.levels.map(l=>m.links(l)),out=[];
 const add=(name,actual,expected,notes='')=>out.push({name,actual,expected,pass:actual===expected,notes});
 const unique=(a)=>new Set(a).size;
 const map=(k)=>m.levels.flatMap(l=>l[k]);
 const linked=(k,key='id')=>links.flatMap(l=>l[k].map(x=>x[key]));
 const exact=(name,observed,wanted)=>{let a=new Set(observed),b=new Set(wanted),missing=wanted.filter(v=>!a.has(v)),extra=observed.filter(v=>!b.has(v));let dup=observed.length-a.size;add(name,missing.length+extra.length+dup,0,`Mapped ${a.size}/${b.size}; missing ${missing.join(', ')||'none'}; extra ${extra.join(', ')||'none'}; duplicates ${dup}.`)};
 add('Mastery levels',m.levels.length,14);
 exact('Legacy lessons preserved and mapped once',map('lessons'),ACADEMY.lessons.map(x=>x.id));
 exact('Original glossary terms mapped once',map('terms'),(window.MD102_V10_TERMS||[]).map(x=>x.id));
 add('Additional foundation explanations',Object.values(window.MD102_MASTERY_FOUNDATIONS||{}).flat().length,67);
 exact('Exam objective routes mapped once',linked('objectives'),(window.MD102_OBJECTIVES||[]).map(x=>x.id));
 exact('Microsoft Learn module routes',linked('modules'),(window.MD102ModuleStudy?.modules||[]).map(x=>x.id));
 exact('Official lab exercise routes',linked('exercises'),(window.MD102SourceLibrary?.labs||[]).flatMap(l=>l.exercises.map(e=>e.id)));
 add('Original official lab tasks loaded',window.MD102SourceLibrary?.all?.length||0,141);
 exact('Supporting source routes',linked('sources'),(window.MD102SupportStudy?.files||[]).map(x=>x.id));
 add('Supporting source documents loaded',window.MD102SupportStudy?.files?.length||0,239);
 add('Primary official lab documents loaded',window.MD102SourceLibrary?.labs?.length||0,6);
 exact('Independent studio routes',linked('studio'),(window.MD102V6?.labs||[]).map(x=>x.id));
 exact('State-graded endpoint labs',linked('evidence'),(window.MD102EvidenceLab?.cases||[]).map(x=>x.id));
 exact('Computed workbench routes',linked('work'),(window.MD102RepositoryStudio?.labs||[]).map(x=>x.id));
 exact('Configuration field cases',links.flatMap(l=>l.gaps.map(x=>x[0])),(window.MD102GapStudio?.data||[]).map(x=>x[0]));
 exact('Deep learning paths',linked('deep'),(window.MD102V7?.paths||[]).map(x=>x.id));
 exact('Performance ticket routes',linked('tickets'),(window.MD102V9?.tickets||[]).map(x=>x.id));
 exact('Focused clinics',linked('clinics'),(window.MD102V8?.clinics||[]).map(x=>x.id));
 exact('Cookbook lessons',linked('cook'),(window.MD102COOKBOOK?.lessons||[]).map(x=>x.id));
 add('Source-driven asset exercises',links.flatMap(l=>l.assets).length,2);
 add('Immediate and delayed retrieval questions',m.levels.reduce((n,l)=>n+l.questions.length,0),56);
 const seq=map('lessons');
 add('Autopilot follows core application deployment',seq.indexOf(7)>seq.indexOf(38),true);
 add('Final capstone is the final original lesson',seq.at(-1),26);
 add('RBAC and assignment filters precede enrollment',seq.indexOf(27)<seq.indexOf(6)&&seq.indexOf(31)<seq.indexOf(6),true);
 add('Apple enrollment topics are adjacent',seq.indexOf(29)-seq.indexOf(8),1);
 add('Android enrollment topics are adjacent',seq.indexOf(30)-seq.indexOf(9),1);
 add('PowerShell precedes Graph and custom compliance',seq.indexOf(23)<seq.indexOf(24)&&seq.indexOf(24)<seq.indexOf(40),true);
 const files=window.MD102SupportStudy?.files||[];
 add('Graph sources deferred to automation',files.filter(f=>f.repository==='microsoft/mggraph-intune-samples'&&m.sourceLevel(f)!==11).length,0);
 add('AVD sources deferred to architecture',files.filter(f=>f.repository.includes('/AZ-140-')&&m.sourceLevel(f)!==12).length,0);
 add('Offline official checkpoint availability',(window.MD102OfficialLabs?.exercises||[]).filter(x=>window.MD102OfficialLabs.allowed(x.id)).length,35);
 const n=m.foundation(m.by(1),{dns:'Resolve the service name',tls:'Validate the certificate chain',http:'Inspect the HTTP status'});
 const wrong=m.foundation(m.by(1),{dns:'Ignore name resolution',tls:'Validate the certificate chain',http:'Inspect the HTTP status'});
 add('Network dependency model passes valid / rejects invalid',n.pass===true&&wrong.pass===false,true);
 const y=m.foundation(m.by(2),{tenant:'Isolated fictional tenant',license:'Eligible existing test entitlement',role:'Scoped test administrator',cost:'No new subscription or trial'});
 const bad=m.foundation(m.by(2),{tenant:'Production tenant',license:'Eligible existing test entitlement',role:'Scoped test administrator',cost:'No new subscription or trial'});
 add('Tenant eligibility model passes valid / rejects unsafe',y.pass===true&&bad.pass===false,true);
 return out;
}
function view(){let rows=verify();return `<section class="card"><div class="super">READ-ONLY RUNTIME COVERAGE AUDIT</div><h1>Mastery path installation verification</h1><p><b>Build marker:</b> ${VERSION}</p><p><b>${rows.filter(r=>r.pass).length}/${rows.length}</b> local runtime checks passed.</p><p>This checks the loaded application inventory, stable identifiers, dependency order and two foundational models. It does not change your study progress, call Microsoft services, or establish actual tenant competency. The build marker helps distinguish the new browser build from an older deployment.</p><p>${B('curriculum','Return to primary mastery path')} ${B('diagnostics','Existing application diagnostics')}</p><div class="tablewrap"><table class="datatable"><thead><tr><th>Check</th><th>Actual / expected</th><th>Result</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${H(r.name)}</b><p class="small">${H(r.notes)}</p></td><td>${H(r.actual)} / ${H(r.expected)}</td><td>${r.pass?'Passed':'Investigate'}</td></tr>`).join('')}</tbody></table></div></section>`}
let prior=render;render=function(){if(state.route==='mastery-audit'){$('sidenav').innerHTML=navSidebar();$('bladenav').innerHTML=modernBladeNav();$('coachroot').innerHTML='';$('content').innerHTML=view();return}prior();if(['curriculum','mastery-path','diagnostics'].includes(state.route))$('content')?.insertAdjacentHTML('afterbegin',`<section class="card"><div class="between"><div><b>Verify the installed mastery build</b><p class="small">Check all loaded learning inventories and prerequisite order.</p></div>${B('mastery-audit','Open installation audit')}</div></section>`)};
let ar=activeArea;activeArea=function(){return state.route==='mastery-audit'?'academy':ar()};
try{LEARN_NAV.push(['mastery-audit','✓','Mastery path installation audit']);BLADE_GROUPS.academy[0][1].push(['mastery-audit','Mastery path installation audit'])}catch(e){console.warn(e)}
window.MD102MasteryAudit={version:VERSION,verify,view};render()
})();
