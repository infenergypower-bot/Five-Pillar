const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=process.argv[2]||pathToFileURL(path.resolve('index.html')).href;
  await page.goto(url+'#procedures-r6');await page.getByRole('heading',{name:'Procedural practice',exact:true}).waitFor();
  const results=await page.evaluate(()=>{
   const api=MD102ProceduresR6;
   const cases=[
    ['targeting',{filter:'none',mode:'include'},false],['targeting',{filter:'none',mode:'exclude'},false],
    ['targeting',{filter:'corporate',mode:'include'},true],['targeting',{filter:'corporate',mode:'exclude'},false],
    ['targeting',{filter:'personal',mode:'include'},false],['targeting',{filter:'personal',mode:'exclude'},true],
    ['access',{mode:'off',compliant:'no'},false],['access',{mode:'off',compliant:'yes'},false],
    ['access',{mode:'report-only',compliant:'no'},false],['access',{mode:'report-only',compliant:'yes'},false],
    ['access',{mode:'on',compliant:'no'},true],['access',{mode:'on',compliant:'yes'},false],
    ['paging',{paging:'first-page-only'},false],['paging',{paging:'follow-next-link'},true],
    ['remediation',{exit:'0',action:'no-change'},false],['remediation',{exit:'0',action:'repair'},false],
    ['remediation',{exit:'1',action:'no-change'},false],['remediation',{exit:'1',action:'repair'},true],
    ['remediation',{exit:'2',action:'no-change'},false],['remediation',{exit:'2',action:'repair'},false]
   ];
   return {cases:cases.map(([id,input,expected])=>({id,input,expected,result:api.evaluate(id,input)})),invalid:api.labs.map(l=>api.evaluate(l.id,{})),unknown:api.evaluate('missing',{}),revised:MD102_SCENARIO_QUESTIONS.filter(q=>q.revision==='R6'),quality:MD102CompetencyQuality.bankAudit(),checks:MD102MasteryAudit.verify()};
  });
  for(const c of results.cases){assert(c.result.valid);assert.equal(c.result.pass,c.expected,JSON.stringify(c));}
  assert(results.invalid.every(r=>!r.valid&&!r.pass));assert(!results.unknown.valid);
  assert.equal(results.revised.length,8);assert(results.revised.every(q=>q.explanations.length===q.choices.length&&new Set(q.explanations).size===q.choices.length));
  assert.equal(results.quality.issues.length,0);assert(results.checks.every(c=>c.pass));
  const targets={targeting:{filter:'corporate',mode:'include'},access:{mode:'on',compliant:'no'},paging:{paging:'follow-next-link'},remediation:{exit:'1',action:'repair'}};
  for(const [id,input] of Object.entries(targets)){
   await page.evaluate(id=>location.hash='procedure-r6:'+id,id);const form=page.locator('form[data-procedure-r6="'+id+'"]');await form.waitFor();
   if(id==='access'){
    await form.locator('[name=mode]').selectOption('on');await form.locator('button').click();
    assert.equal(await page.evaluate(()=>MD102ProceduresR6.status('access')),false,'enforcement alone must not pass the two-stage lab');
    await form.locator('[name=mode]').selectOption('report-only');await form.locator('button').click();
    await page.getByText('Sign-in: allowed',{exact:true}).waitFor();
   }else{await form.locator('button').click();assert.equal(await page.evaluate(id=>MD102ProceduresR6.status(id),id),false);}
   for(const [key,value] of Object.entries(input))await form.locator('[name='+key+']').selectOption(value);
   await form.locator('button').click();await page.getByRole('heading',{name:'Model passed',exact:true}).waitFor();
  }
  await page.reload();assert.equal(await page.evaluate(()=>MD102ProceduresR6.labs.filter(l=>MD102ProceduresR6.status(l.id)).length),4);
  for(const [id,objective] of [['targeting','MAN-032'],['access','INF-015'],['paging','OPE-073'],['remediation','OPE-080']]){
   await page.evaluate(objective=>location.hash='objective-depth:'+objective,objective);await page.locator('[data-route="procedure-r6:'+id+'"]').waitFor();
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>location.hash='procedure-r6:targeting');await page.locator('[data-r6reset=targeting]').click();
  assert.equal(await page.evaluate(()=>MD102ProceduresR6.status('targeting')),false);assert.equal(await page.evaluate(()=>MD102ProceduresR6.status('paging')),true);
  assert.equal(await page.evaluate(()=>MD102CompetencyQuality.readiness().certified),false);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({combinations:20,invalidInputs:5,revisedQuestions:8,runtimeChecks:results.checks.length,interactiveLabs:4,persistence:true,prerequisiteLinks:4,scopedReset:true,phoneViewport:true,pageErrors:errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
