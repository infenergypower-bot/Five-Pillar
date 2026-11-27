const assert=require('node:assert/strict'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});try{
 const p=await b.newPage({viewport:{width:1366,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const url=process.argv[2]||pathToFileURL(path.resolve('index.html')).href;
 await p.goto(url+'#learning-recovery');await p.getByRole('heading',{name:'Learn from missed decisions',exact:true}).waitFor();
 await p.getByRole('heading',{name:'No mapped recovery tasks'}).waitFor();
 const results=await p.evaluate(()=>{
  const api=MD102ProceduresR6,ids=['app-detection','app-dependency','app-upgrade'];let evaluated=[];
  for(const id of ids){const lab=api.labs.find(x=>x.id===id);let inputs=[{}];for(const [key,,values] of lab.fields)inputs=inputs.flatMap(input=>values.map(value=>({...input,[key]:value})));evaluated.push({id,cases:inputs.map(input=>({input,result:api.evaluate(id,input)})),invalid:api.evaluate(id,{})});}
  const r=MD102RecoveryR7,q='v4-curated-047',other='v4-curated-048',late='v4-curated-063';
  const history=[{id:q,objectiveId:'APP-062',at:10,correct:false},{id:other,at:20,correct:false},{id:late,at:30,correct:false},{id:q,at:5,correct:true},{id:'gone',at:40,correct:false},{id:q,at:'bad',correct:true},null];
  const a=r.analyze(history),recovered=r.analyze([...history,{id:q,at:11,correct:true}]),relapsed=r.analyze([...history,{id:q,at:11,correct:true},{id:q,at:12,correct:false}]);
  return {evaluated,a,recovered,relapsed,pool:r.retryPool(r.inventory(),history,'APP-069').map(q=>q.id),empty:r.analyze(null),equal:r.analyze([{id:q,at:1,correct:false},{id:q,at:1,correct:true}]),quality:MD102CompetencyQuality.bankAudit(),checks:MD102MasteryAudit.verify()};
 });
 let combinations=0;
 for(const row of results.evaluated){assert(!row.invalid.valid);let passed=0;for(const {input,result} of row.cases){combinations++;assert(result.valid);let expected=row.id==='app-detection'?JSON.stringify(input)===JSON.stringify({test:'verify',exit:'0',output:'present',error:'empty'}):row.id==='app-dependency'?input.relationship==='Atlas-needs-R'&&input.automatic==='yes':input.target==='pilot-required'&&input.uninstall==='no'&&input.detection==='version-2';assert.equal(result.pass,expected,JSON.stringify({id:row.id,input}));if(result.pass)passed++;}assert.equal(passed,1);}
 assert.equal(combinations,30);assert.deepEqual(results.a.groups.map(g=>g.id),['APP-062','APP-069','OPE-080']);assert.equal(results.a.unmapped.length,1);assert.equal(results.a.ignored,2);assert.equal(results.recovered.recovered,1);assert(!results.recovered.groups.some(g=>g.id==='APP-069'));assert(results.relapsed.groups.some(g=>g.id==='APP-069'));assert.deepEqual(results.pool,['v4-curated-047']);assert.equal(results.empty.groups.length,0);assert.equal(results.equal.groups.length,0);assert(results.checks.every(x=>x.pass));assert.equal(results.quality.issues.length,0);
 const targets={'app-detection':{test:'verify',exit:'0',output:'present',error:'empty'},'app-dependency':{relationship:'Atlas-needs-R',automatic:'yes'},'app-upgrade':{target:'pilot-required',uninstall:'no',detection:'version-2'}};
 for(const [id,input] of Object.entries(targets)){
  await p.evaluate(id=>location.hash='procedure-r6:'+id,id);const f=p.locator('form[data-procedure-r6="'+id+'"]');await f.waitFor();await f.locator('button').click();assert.equal(await p.evaluate(id=>MD102ProceduresR6.status(id),id),false);
  for(const [key,value] of Object.entries(input))await f.locator('[name='+key+']').selectOption(value);
  await f.locator('button').click();await p.getByRole('heading',{name:'Model passed'}).waitFor();
 }
 await p.reload();assert(await p.evaluate(()=>['app-detection','app-dependency','app-upgrade'].every(id=>MD102ProceduresR6.status(id))));
 await p.evaluate(()=>{state.v4.quizHistory=[{id:'v4-curated-047',objectiveId:'APP-062',domain:'applications',at:1,correct:false,mode:'learning'},{id:'v4-curated-048',objectiveId:'APP-062',domain:'applications',at:2,correct:false,mode:'learning'}];save();location.hash='learning-recovery';});
 await p.locator('[data-recovery-objective="APP-069"]').waitFor();assert.equal(await p.locator('[data-route="procedure-r6:app-detection"]').count(),1);
 await p.locator('[data-recovery-retry="APP-069"]').click();await p.getByText('Targeted retry: APP-069',{exact:true}).waitFor();await p.locator('[data-v4startexam]').click();
 assert.deepEqual(await p.evaluate(()=>state.v4.activeExam.items.map(x=>x.id)),['v4-curated-047']);assert.equal(await p.evaluate(()=>state.v4.activeExam.unseenAtStart),false);
 await p.evaluate(()=>location.hash='learning-recovery');await p.locator('[data-recovery-retry="APP-062"]').click();assert.equal(await p.evaluate(()=>state.route),'learning-recovery');assert.deepEqual(await p.evaluate(()=>state.v4.activeExam.items.map(x=>x.id)),['v4-curated-047']);
 await p.evaluate(()=>location.hash='practice-exams');await p.locator('[data-v4answer="0"]').click();await p.locator('[data-v4submit]').first().click();await p.getByText('Exam review: 1/1 · 100%',{exact:true}).waitFor();
 assert.equal(await p.evaluate(()=>MD102CompetencyQuality.readiness().qualifying),0);
 await p.locator('[data-route="learning-recovery"]').first().click();assert.equal(await p.locator('[data-recovery-objective="APP-069"]').count(),0);assert.equal(await p.locator('[data-recovery-objective="APP-062"]').count(),1);
 await p.reload();assert.equal(await p.evaluate(()=>MD102RecoveryR7.analyze().recovered),1);
 await p.locator('[data-recovery-retry="APP-062"]').click();await p.getByText('Targeted retry: APP-062',{exact:true}).waitFor();await p.locator('[data-v4setmode="learning"]').click();assert.equal(await p.evaluate(()=>state.v4.examSetup.objectiveId),undefined);
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>location.hash='learning-recovery');await p.getByRole('heading',{name:'Learn from missed decisions'}).waitFor();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(process.env.R7_SCREENSHOT)await p.screenshot({path:process.env.R7_SCREENSHOT,fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({combinations,interactiveLabs:3,persistence:true,latestAttempt:true,relapse:true,canonicalMapping:true,prerequisiteOrder:true,targetedRetry:true,activeExamProtected:true,retryNonqualifying:true,phoneViewport:true,runtimeChecks:results.checks.length,pageErrors:errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
