/* Advanced SC-300 Skills Clinics: Watch → Understand → Follow → Practice → Troubleshoot → Master. Conceptual educational simulation. */
(function installV11Clinics(){
 const clinics=[...V11_CLINICS_A,...V11_CLINICS_B];
 if(clinics.length!==17||new Set(clinics.map(x=>x.id)).size!==17)throw Error("Advanced clinic curriculum unavailable");
 if(!Array.isArray(V11_CHECKPOINTS)||V11_CHECKPOINTS.length!==17||V11_CHECKPOINTS.some(x=>!clinics.find(c=>c.id===x.id)))throw Error("Second advanced reasoning checkpoints missing");
 db.v11=db.v11||{current:null,views:{},quiz:{},attempts:{},practice:{},notes:{},coach:null,filter:"All",history:[]};
 db.v11.orders=db.v11.orders||{};
 db.v11.teachback=db.v11.teachback||{};
 for(const state of Object.values(db.v11.quiz||{})){if(state&&state.first===undefined){state.first=!!state.correct;state.second=false;state.correct=false;}}
 const S=db.v11,oldRender=render,oldShell=shell,oldAction=action,esc=x=>safe(String(x??""));
 const find=id=>clinics.find(x=>x.id===id);
 const checkpoint=id=>V11_CHECKPOINTS.find(x=>x.id===id);
 const getView=id=>S.views[id]||(S.views[id]={stage:0,step:0,mode:"watch"});
 const optionOrder=c=>{let a=S.orders[c.id];if(!Array.isArray(a)||a.length!==c.options.length){a=c.options.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}S.orders[c.id]=a;save();}return a;};
 const orderSecond=c=>{const q=checkpoint(c.id);if(!q)return [];const key=c.id+"-second";let a=S.orders[key];if(!Array.isArray(a)||a.length!==q.choices.length){a=q.choices.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}S.orders[key]=a;save();}return a;};
 const supported=new Set(["custom-attributes","cloudsync-choice","gsa-connectivity","app-proxy","defender-cloud-apps","entitlement-tou","pim-groups","diagnostic-kql"]);
 const isRealCheck=id=>supported.has(id);
 const css=`<style>
 .clinic-root{max-width:1180px;margin:0 auto}.clinic-banner{padding:20px;border-radius:15px;background:linear-gradient(130deg,#e8f6fc,#f7f9ff);border:1px solid #b3cfdf}
 .clinic-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:16px 0}
 .clinic-flow button{background:var(--surface,#fff);border:1px solid #c4d7e2;border-radius:12px;padding:12px 7px;min-height:84px;color:inherit;cursor:pointer;font-size:13px;line-height:1.35}
 .clinic-flow button.active{background:#dcf2fb;color:#0e425d;outline:2px solid #267fa6}
 .clinic-visual{border-left:4px solid #287fa9;padding:16px;background:#eef8fc;color:#183f59;border-radius:8px;min-height:110px}
 .clinic-console{border:1px solid #bed5e5;border-radius:13px;overflow:hidden;display:grid;grid-template-columns:195px minmax(0,1fr);background:#fff;color:#23384e;margin:16px 0}
 .clinic-console-nav{background:#eaf1f7;border-right:1px solid #c2d7e5;padding:15px 12px}
 .clinic-console-nav .clinic-navtitle{font-weight:800;color:#173b57;display:block;margin:0 0 12px;font-size:13px}
 .clinic-console-nav button{display:block;width:100%;font-size:12px;color:#244966;border:0;border-radius:7px;background:transparent;text-align:left;padding:12px 9px;cursor:pointer}
 .clinic-console-nav button.active,.clinic-console-nav button:hover{background:#d6e8f4;font-weight:700}
 .clinic-console-body{padding:17px;min-width:0}
 .clinic-console-body .clinic-crumb{font-size:11px;color:#647a90;overflow-wrap:anywhere;margin:0 0 12px}
 .clinic-console-settings{display:grid;gap:6px}
 .clinic-console-settings button{border:1px solid #d9e4ee;background:#f8fbff;color:#1f3d56;text-align:left;padding:12px;border-radius:8px;cursor:pointer;display:flex;gap:11px;align-items:center}
 .clinic-console-settings button.selected{border:2px solid #187ca8;background:#e5f5fe;font-weight:700}
 .clinic-console-settings span{display:inline-grid;place-items:center;width:26px;height:26px;min-width:26px;border-radius:7px;background:#e0ecf5;font-weight:700}
 @media(max-width:760px){.clinic-console{grid-template-columns:1fr}.clinic-console-nav{border-right:0;border-bottom:1px solid #c2d7e5}.clinic-console-nav button{display:inline-block;width:auto;margin-right:4px}}
 .clinic-sequence{display:flex;flex-wrap:wrap;gap:7px}.clinic-sequence span{font-size:12px;padding:6px 10px;border-radius:99px;background:var(--surface,#fff);border:1px solid #c6d9e6}
 .clinic-sequence span.active{background:#225a8c;color:white}
 .clinic-coach{border:2px solid #267ba6;border-radius:14px;background:#eaf5fc;color:#13344f;padding:18px;margin:0 0 17px}
 .clinic-step{display:flex;gap:13px;margin:11px 0;padding:14px;border-radius:11px;border:1px solid #d6e5ef}
 .clinic-stepno{width:32px;height:32px;min-width:32px;border-radius:50%;display:grid;place-items:center;background:#205981;color:#fff;font-weight:700}
 .clinic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
 .clinic-meta{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
 .clinic-flag{font-size:12px;border-radius:99px;background:var(--surface,#fff);border:1px solid #cbdbe7;padding:5px 10px}
 .clinic-warn{padding:15px;border-radius:10px;background:#fff3e6;border:1px solid #e7bf82;color:#633d1a}
 .clinic-choice{display:block;padding:14px;margin:7px 0;border:1px solid #d2dfeb;border-radius:9px;cursor:pointer}
 .clinic-choice:has(input:checked){background:#e8f5ff;border-color:#308cc0}
 @media(max-width:760px){.clinic-flow{grid-template-columns:repeat(2,minmax(0,1fr))}.clinic-grid{grid-template-columns:1fr}}
 </style>`;
 const banner=c=>`<div class="clinic-banner"><div class="eyebrow">VISUAL IDENTITY ENGINEERING CLINIC · ${esc(c.group)}</div><h1>${esc(c.topic)}</h1><p>${esc(c.intro)}</p><div class="clinic-meta"><span class="clinic-flag">${c.duration} min practice guide</span><span class="clinic-flag">${esc(c.level)}</span><span class="clinic-flag">SC-300 official skill</span></div></div>`;
 const limitations=c=>isRealCheck(c.id)?"Some fictional records can be checked, but the simulator cannot reproduce real Microsoft role scope, network traffic, credentials or licensed enforcement.":"This activity requires a real service or design verification; a local selection or text note cannot establish the official skill.";
 const learningStatus=c=>({knowledge:!!S.quiz[c.id]?.correct, guided:!!S.practice[c.id]?.guided,independent:!!S.practice[c.id]?.independent, design:!!S.practice[c.id]?.design});
 const selectMode=(c,mode)=>{
  S.attempts[c.id]={mode,code:Math.random().toString(36).slice(2,7).toUpperCase(),baseline:JSON.stringify(readState(c)),began:Date.now(),finished:false,passed:false};
  S.coach=mode==="guided"?{id:c.id,step:0}:null;
  if(db.v8)db.v8.coach=null;if(db.v6)db.v6.activeTutor=null;
  S.current=c.id;save();go("v11/practice/"+c.id);
 };
 function readState(c){
  switch(c.id){
   case "custom-attributes":return db.attributes;
   case "cloudsync-choice":return db.hybridFixed;
   case "gsa-connectivity":return db.gsa;
   case "app-proxy":return db.proxy;
   case "defender-cloud-apps":return db.oauthDenied;
   case "entitlement-tou":return db.packages;
   case "pim-groups":return db.pim;
   case "diagnostic-kql":return [db.diagnostics,db.queryFailed];
   default:return null;
  }
 }
 function evaluate(c){
  let possible=isRealCheck(c.id),good=false,why="This is a design-only or external-cloud skill. The fictional console cannot verify a real implementation.";
  switch(c.id){
   case "custom-attributes":good=Object.values(db.attributes||{}).some(x=>String(x).trim().length>0);why="A fictional attribute value was stored. Definition-level RBAC and consuming application enforcement are not modeled.";break;
   case "cloudsync-choice":good=db.hybridFixed===true;why="The simulated hybrid synchronization discrepancy was repaired. This does not prove real sync agents or sign-in.";break;
   case "gsa-connectivity":good=Array.isArray(db.gsa)&&db.gsa.some(x=>x.name&&x.group);why="A simulated traffic profile and a group assignment are present. No real packets or connectors are tested.";break;
   case "app-proxy":good=!!db.proxy;why="The fictional Legacy HR Application Proxy publication is active. Network reachability is not tested.";break;
   case "defender-cloud-apps":good=!!db.oauthDenied;why="The fictional OAuth app was restricted. Real grants or SaaS sessions have not been changed.";break;
   case "entitlement-tou":good=db.packages.some(x=>x.approval==="Required"&&x.expiry>0&&x.expiry<=30);why="A training package with approval and <=30-day expiry exists; actual ToU and connected organization claims are not simulated.";break;
   case "pim-groups":good=db.pim.some(x=>x.active===true);why="An eligible training role was activated. This is NOT a real PIM for Groups configuration.";break;
   case "diagnostic-kql":good=!!db.diagnostics&&!!db.queryFailed;why="The simulated diagnostic and failed-sign-in query markers are present; no live Log Analytics workspace or ingestion exists.";break;
  }
  return {possible,valid:!!good,why};
 }
 function complete(c){
  const a=S.attempts[c.id];if(!a)return;
  const x=evaluate(c),changed=JSON.stringify(readState(c))!==a.baseline;
  const valid=x.valid&&changed&&x.possible&&c.id!=="pim-groups"&&c.id!=="entitlement-tou";
  a.finished=true;a.passed=valid;a.result={...x,changed,passed:valid,at:new Date().toISOString()};
  const prev=S.practice[c.id]||{};
  if(valid){if(a.mode==="guided")prev.guided=true;if(a.mode==="exam")prev.independent=true;}
  S.practice[c.id]=prev;
  S.coach=null;S.history.push({id:c.id,mode:a.mode,correct:valid,time:new Date().toISOString()});
  S.history=S.history.slice(-300);save();render();
 }
 const courses=new Set(clinics.map(x=>x.group));
 const nav=`<div class="sectioncap">Deep Skill Clinics · SC-300</div><button class="navitem" data-route="v11/clinics"><span class="navicon">◇</span>Advanced visual skill clinics</button><button class="navitem" data-route="v11/progress"><span class="navicon">□</span>Skill clinic progress</button>`;
 function home(){
  const items=clinics.filter(c=>S.filter==="All"||S.filter===c.group),done=clinics.filter(c=>!!S.quiz[c.id]?.correct).length,ind=clinics.filter(c=>S.practice[c.id]?.independent).length;
  return `<div class="page clinic-root">${css}<div class="eyebrow">SC-300 · ADVANCED SKILLS FOR REAL WORK</div><h1>Learn the skills that simple quizzes leave out</h1><p class="muted maincopy">Seventeen in-depth topic clinics teach security decisions, annotated workflows, guided practice, expected outcomes, root-cause troubleshooting and technical reasoning. They extend—not replace—the Visual Learning Studio.</p>
  <div class="clinic-banner"><h3>See the workflow → Understand why → Do it → Diagnose the failure → Prove what you learned</h3><p>Use the guided mode to learn. Practice it independently to avoid relying on hints. Design-only tasks never receive a misleading technical pass.</p><button class="btn primary" data-route="${S.current?"v11/clinic/"+S.current:"v11/clinic/"+clinics[0].id}">Start or resume a skill clinic →</button></div>
  <div class="grid3" style="margin:17px 0"><div class="panel"><div class="statnum">${clinics.length}</div><div class="statlabel">Advanced practical topics</div></div><div class="panel"><div class="statnum">${done}</div><div class="statlabel">Knowledge questions answered correctly</div></div><div class="panel"><div class="statnum">${ind}</div><div class="statlabel">Independent fictional-state passes</div></div></div>
  <div class="pillrow" style="margin:15px 0"><button class="btn ${S.filter==="All"?"primary":""}" data-action="v11-filter" data-group="All">All clinics</button>${[...courses].map(g=>`<button class="btn ${S.filter===g?"primary":""}" data-action="v11-filter" data-group="${esc(g)}">${esc(g)}</button>`).join("")}</div>
  <div class="clinic-grid">${items.map(c=>{const st=learningStatus(c);return `<div class="panel"><div class="eyebrow">${esc(c.group)} · ${c.duration} min</div><h3>${esc(c.topic)}</h3><p class="small muted"><b>Official objective:</b> ${esc(c.skill)}</p><p>${esc(c.why)}</p><div class="clinic-meta"><span class="clinic-flag">${st.knowledge?"✓":"○"} Knowledge</span><span class="clinic-flag">${st.independent?"✓ Fictional lab":"○ Independent practice"}</span><span class="clinic-flag">${isRealCheck(c.id)?"Partial simulation":"Design-only"}</span></div><button class="btn primary" data-route="v11/clinic/${c.id}">Study with the instructor →</button></div>`}).join("")}</div>
  <div class="clinic-warn" style="margin-top:20px">Completing these clinics does not establish full coverage of all 98 SC-300 official measured subskills. Consult the official subskill matrix and practice applicable features in an authorized test tenant.</div>${footer()}</div>`;
 }
 function stage(c,i){
  const n=c.visual[i];
  return `<div class="clinic-console" role="region" aria-label="Annotated fictional administration screen">
    <aside class="clinic-console-nav"><span class="clinic-navtitle">Identity practice console</span>
      <button data-route="portal/overview">⌂ Overview</button>
      <button data-route="portal/users">♙ Users and groups</button>
      <button data-route="portal/policies">▦ Conditional Access</button>
      <button data-route="portal/apps">◇ Enterprise applications</button>
      <button class="active" data-route="${esc(c.route)}">◉ Related training screen</button>
      <button data-route="portal/logs">▤ Sign-in &amp; audit logs</button>
    </aside>
    <div class="clinic-console-body"><p class="clinic-crumb">TRAINING SCREEN TOUR · ${esc(c.path)}</p>
      <h3>${esc(c.topic)}</h3><p class="small muted">Illustrative layout, not a screenshot of Microsoft's service. Tap a setting below to see its function and why it matters.</p>
      <div class="clinic-console-settings">${c.visual.map((p,k)=>`<button class="${k===i?"selected":""}" data-action="v11-node" data-id="${c.id}" data-index="${k}"><span>${k+1}</span><b>${esc(p[0])}</b></button>`).join("")}</div>
      <div class="clinic-visual" role="status" style="margin-top:12px"><h3>${esc(n[0])}</h3><p>${esc(n[1])}</p>
        <p class="small" style="margin-top:10px"><b>Why this setting matters:</b> ${esc(c.why)}</p></div>
      <button class="btn primary" data-route="${esc(c.route)}" data-v11-open="${c.id}" style="margin-top:12px">Open the actual fictional admin controls →</button>
    </div></div>`;
 }
 function chapter(c){
  S.current=c.id;const v=getView(c.id),i=Math.max(0,Math.min(v.stage||0,4)),step=Math.max(0,Math.min(v.step||0,3)),z=c.guided[step],q=S.quiz[c.id],a=S.attempts[c.id];
  const official=V7_SKILLS.find(x=>x.exam==="SC-300"&&x.skill===c.skill);
  return `<div class="page clinic-root">${css}<button class="btn xs" data-route="v11/clinics">← All advanced clinics</button>${banner(c)}
   ${official?`<div class="panel" style="margin-top:12px"><div class="eyebrow">Exact current Microsoft SC-300 measured skill</div><p>${esc(official.skill)}</p><button class="btn xs" data-route="v7/skill/${official.id}">Open official objective and evidence record →</button><span class="clinic-flag">Coverage still unverified</span></div>`:""}
   <div class="clinic-sequence" style="margin:15px 0">${["WATCH","UNDERSTAND","FOLLOW","PRACTICE","TROUBLESHOOT","MASTER"].map((x,k)=>`<span class="${k===0?"active":""}">${k+1}. ${x}</span>`).join("")}</div>
   <div class="panel"><div class="eyebrow">WATCH · Interactive administrative architecture</div><h3>Tap each stage to explore how it works</h3>
   <div class="clinic-flow">${c.visual.map((n,k)=>`<button class="${k===i?"active":""}" data-action="v11-node" data-id="${c.id}" data-index="${k}"><b>${k+1}.</b> ${esc(n[0])}</button>`).join("")}</div>${stage(c,i)}
   <div class="flex wrap" style="margin-top:14px"><button class="btn" data-action="v11-node-prev" data-id="${c.id}" ${i===0?"disabled":""}>← Earlier</button><button class="btn primary" data-action="v11-node-next" data-id="${c.id}" ${i===4?"disabled":""}>Next stage →</button><button class="btn" data-action="v11-node-replay" data-id="${c.id}">Replay explanation</button></div></div>
   <div class="clinic-grid" style="margin-top:16px"><div class="panel"><div class="eyebrow">UNDERSTAND · Beginner explanation</div><p>${esc(c.intro)}</p><h3>Why does the company need this?</h3><p>${esc(c.why)}</p></div>
    <div class="panel"><div class="eyebrow">UNDERSTAND · Engineer explanation</div><p>${esc(c.tech)}</p><p class="small muted">Licensed features and administration menus may differ from this educational screen; use current Microsoft Learn documentation when practicing in a real tenant.</p></div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">FOLLOW · Exact mental map of the admin workflow</div><h3>Where would you perform this?</h3><div class="clinic-visual"><b>${esc(c.path)}</b><p class="small">${esc(c.level)}. This is a reference navigation path, not a promise that every option exists in our fictional console or every license.</p></div>
    <div class="clinic-step"><div class="clinic-stepno">${step+1}</div><div><h3>${esc(z[0])}</h3><p>${esc(z[1])}</p></div></div>
    <div class="flex wrap"><button class="btn" data-action="v11-step-prev" data-id="${c.id}" ${step===0?"disabled":""}>← Previous instructor step</button><button class="btn primary" data-route="${esc(c.route)}" data-v11-open="${c.id}">Open matching simulated screen →</button><button class="btn" data-action="v11-step-next" data-id="${c.id}" ${step===3?"disabled":""}>Next explained step →</button></div>
    <details style="margin-top:12px"><summary><b>View all four guided actions and why they matter</b></summary>${c.guided.map((x,k)=>`<div class="clinic-step"><div class="clinic-stepno">${k+1}</div><div><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div></div>`).join("")}</details>
   </div>
   <div class="clinic-grid" style="margin-top:16px"><div class="panel"><div class="eyebrow">PRACTICE · A real configuration decision</div><p>${esc(c.practice)}</p><div class="clinic-meta"><span class="clinic-flag">${isRealCheck(c.id)?"Fictional state partially testable":"External verification necessary"}</span></div><p>${esc(limitations(c))}</p>
    <div class="flex wrap"><button class="btn primary" data-action="v11-start" data-id="${c.id}" data-mode="guided">Guided practice →</button><button class="btn" data-action="v11-start" data-id="${c.id}" data-mode="exam">Independent mode →</button></div>
    ${a?`<p class="small">Current attempt: ${esc(a.code)} · ${esc(a.mode)} · ${a.finished?(a.passed?"Fictional check passed":"Not verified"):"In progress"}</p><button class="btn" data-route="v11/practice/${c.id}">Resume attempt</button>`:""}
   </div><div class="panel"><div class="eyebrow">TROUBLESHOOT · Diagnose an incident</div><p><b>Symptom:</b> ${esc(c.incident)}</p><details><summary><b>Reveal the most likely cause only after forming your own hypothesis</b></summary><p>${esc(c.diagnosis)}</p></details>
    <button class="btn" style="margin-top:12px" data-route="portal/logs" data-v11-open="${c.id}">Inspect fictional sign-in logs →</button></div></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">MASTER · Reason through a real-world failure</div><h3>${esc(c.incident)}</h3><form id="v11-quiz" data-id="${c.id}"><fieldset><legend>Which next action is the most defensible?</legend>${optionOrder(c).map(k=>`<label class="clinic-choice"><input type="radio" name="answer" value="${k}" required> ${esc(c.options[k])}</label>`).join("")}</fieldset><button class="btn primary" type="submit">Check my reasoning and explain why</button></form>
     ${q?.first!==undefined?`<div class="${q.first?"scenario":"clinic-warn"}" role="status" style="padding:15px;margin-top:14px"><b>${q.first?"✓ First reasoning check correct":"Review the diagnosis and try again"}</b><p>${esc(c.diagnosis)}</p><p>Best next action: ${esc(c.options[c.correct])}</p></div>`:""}
   <div class="panel" style="margin-top:16px"><div class="eyebrow">TRANSFER THE SKILL · A second independent question</div>
     <p>Apply the same technical principle to a different workplace situation. Both reasoning checks must be correct to earn the knowledge badge.</p>
     <h3>${esc(checkpoint(c.id).question)}</h3>
     <form id="v11-checkpoint" data-id="${c.id}"><fieldset><legend>Which option best matches the requirements?</legend>
       ${orderSecond(c).map(k=>`<label class="clinic-choice"><input type="radio" name="second" value="${k}" required> ${esc(checkpoint(c.id).choices[k])}</label>`).join("")}
       </fieldset><button class="btn primary" type="submit">Grade second reasoning problem</button></form>
     ${q?.second!==undefined?`<div class="${q.second?"scenario":"clinic-warn"}" role="status" style="padding:14px;margin-top:12px"><b>${q.second?"✓ Second scenario correct":"Incorrect — review and retry"}</b>
       <p>${esc(checkpoint(c.id).explain)}</p>${q.second?"":`<p>${esc(checkpoint(c.id).wrong)}</p>`}</div>`:""}
     <p class="small">${q?.correct?"✓ Both reasoning problems solved":"Knowledge badge pending: solve both scenarios. Fictional administrative competence is measured separately."}</p>
   </div>
   </div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">PROVE · What an independent reviewer should see</div><p>${esc(c.evidence)}</p>
     <form id="v11-note" data-id="${c.id}"><label class="field">My procedure, expected output, actual evidence and rollback (fictional data only)<textarea name="notes" rows="5" placeholder="I would configure…, then observe…, and test failure by…, recovering via…">${esc(S.notes[c.id]||"")}</textarea></label><button class="btn primary" type="submit">Save my explanation</button></form>
     <a href="${esc(c.src)}" target="_blank" rel="noopener">Microsoft Learn subject reference ↗</a></div>
   <div class="panel" style="margin-top:16px"><div class="eyebrow">TEACH IT BACK · Explain the work in your own words</div>
    <p>This is deliberate practice. Four specific answers help reveal whether you truly understand the procedure. Your answers are stored in this browser but are not automatically judged technically correct.</p>
    <form id="v11-teachback" data-id="${c.id}">
     <label class="field">1. What would you actually configure?<textarea name="configured" rows="2" required placeholder="Name the resource, setting and approved scope.">${esc(S.teachback[c.id]?.configured||"")}</textarea></label>
     <label class="field">2. Why does that setting matter?<textarea name="reason" rows="2" required placeholder="Describe the threat, business requirement, or access decision it changes.">${esc(S.teachback[c.id]?.reason||"")}</textarea></label>
     <label class="field">3. How will you prove the result works?<textarea name="verification" rows="2" required placeholder="Expected result, log, negative test, and which user/resource to inspect.">${esc(S.teachback[c.id]?.verification||"")}</textarea></label>
     <label class="field">4. How would you fix or roll back a mistake?<textarea name="rollback" rows="2" required placeholder="Safe recovery procedure and who must approve it.">${esc(S.teachback[c.id]?.rollback||"")}</textarea></label>
     <button class="btn primary" type="submit">Save my four-part learning evidence</button>
    </form>
    <p class="small muted" role="status">${S.teachback[c.id]?"✓ Explanation drafted, but not independently reviewed.":"Responses must be specific enough to justify the configuration; do not enter real credentials or tenant identifiers."}</p>
   </div>
   <div class="flex wrap" style="margin-top:15px"><button class="btn" data-route="v11/clinics">All advanced topics</button><button class="btn primary" data-route="v11/clinic/${clinics[Math.min(clinics.length-1,clinics.indexOf(c)+1)].id}">Next clinic →</button></div>${footer()}</div>`;
 }
 function practice(c){
  const a=S.attempts[c.id];
  if(!a)return `<div class="page"><h1>${esc(c.topic)}</h1><button class="btn primary" data-action="v11-start" data-id="${c.id}" data-mode="guided">Start guided practice →</button></div>`;
  const r=evaluate(c),show=a.mode==="guided"||a.finished;
  return `<div class="page clinic-root">${css}<button class="btn xs" data-route="v11/clinic/${c.id}">← Return to lesson</button><div class="eyebrow" style="margin-top:15px">${esc(a.mode.toUpperCase())} · TRAINING ATTEMPT ${esc(a.code)}</div><h1>${esc(c.topic)}</h1>
   <div class="clinic-banner"><h3>Business requirement</h3><p>${esc(c.practice)}</p><p><b>Observed issue:</b> ${esc(c.incident)}</p></div>
   <div class="panel" style="margin-top:16px"><p><b>What is checked:</b> ${isRealCheck(c.id)?"A limited part of the connected fictional tenant's configuration. No real service.":"This skill is design-only or requires an authorized real Microsoft environment."}</p>
    ${show?`<div class="clinic-visual"><b>Guided instructor checklist</b>${c.guided.map((x,k)=>`<p><b>${k+1}. ${esc(x[0])}</b> — ${esc(x[1])}</p>`).join("")}</div>`:"<div class='clinic-warn'>Independent mode: the complete procedure and suggested resolution are hidden until you submit the configuration. Use the administrative controls to investigate and solve the scenario.</div>"}
    <div class="flex wrap" style="margin-top:16px"><button class="btn primary" data-route="${esc(c.route)}" data-v11-open="${c.id}">Open practice console →</button><button class="btn" data-action="v11-grade" data-id="${c.id}">Submit simulated configuration</button><button class="btn" data-action="v11-start" data-id="${c.id}" data-mode="${a.mode}">Start a fresh attempt</button></div>
    ${a.finished?`<div class="${a.passed?"scenario":"clinic-warn"}" style="margin-top:15px;padding:15px"><b>${a.passed?"Limited fictional state check passed":"Not verified by the training simulator"}</b><p>${esc(a.result?.why||r.why)}</p><p>${a.result?.changed?"Relevant fictional data changed during this attempt.":"No relevant state change was detected."}</p><p>The official exam skill still requires the applicable independent real-tenant work and/or human review.</p></div>`:""}
   </div>${footer()}</div>`;
 }
 function progress(){
  const right=clinics.filter(c=>S.quiz[c.id]?.correct).length,guided=clinics.filter(c=>S.practice[c.id]?.guided).length,exam=clinics.filter(c=>S.practice[c.id]?.independent).length;
  return `<div class="page clinic-root">${css}<div class="eyebrow">SC-300 · ADVANCED CLINIC LEARNING</div><h1>What you understand versus what you can actually administer</h1>
   <div class="grid3"><div class="panel"><div class="statnum">${right}/${clinics.length}</div><div class="statlabel">Correct knowledge checks</div></div><div class="panel"><div class="statnum">${guided}</div><div class="statlabel">Guided fictional-state checks</div></div><div class="panel"><div class="statnum">${exam}</div><div class="statlabel">Independent fictional-state checks</div></div></div>
   <div class="clinic-warn" style="margin-top:16px">No recorded score in this learning app is Microsoft exam certification or validation of all 98 subskills. Design-only activities and simulated policy features require further evidence.</div>
   <div class="panel" style="margin-top:16px"><h3>Resume and back up learning</h3><button class="btn primary" data-route="${S.current?"v11/clinic/"+S.current:"v11/clinics"}">Resume studying →</button><button class="btn" data-action="v11-export">Export clinic progress JSON ↓</button><a class="btn" href="./qa-advanced-clinics.html">Run Safari and browser interaction tests →</a><label class="btn" for="v11-import">Import saved clinic progress</label><input id="v11-import" type="file" accept=".json,application/json" style="display:none"/></div>
   <div class="panel" style="margin-top:16px"><h3>Explain your configuration in writing</h3><p><b>${clinics.filter(c=>!!S.teachback[c.id]).length} of ${clinics.length}</b> four-part teach-back records drafted. Written evidence is not automatically verified.</p><button class="btn" data-route="v11/clinics">Continue teach-back exercises →</button></div>
   <div class="panel" style="margin-top:16px"><h3>Targeted remediation</h3>${clinics.map(c=>{const a=S.quiz[c.id],hist=S.history.filter(x=>x.id===c.id&&!x.correct).length;return `<div class="flex between wrap" style="padding:10px 0;border-bottom:1px solid #dde7ef"><div><b>${esc(c.topic)}</b><p class="small muted">${a?.correct?"Concept check correct":"Concept check pending"} · ${hist} incorrect or incomplete attempts</p></div><button class="btn xs" data-route="v11/clinic/${c.id}">${hist?"Review mistakes →":"Study →"}</button></div>`}).join("")}</div>${footer()}</div>`;
 }
 function coach(){
  const c=find(S.coach?.id);if(!c)return "";
  const idx=Math.max(0,Math.min(3,S.coach.step)),s=c.guided[idx];
  return `<section class="clinic-coach" aria-label="SC-300 Skill Clinic Instructor"><div class="flex between wrap"><b>Instructor · ${esc(c.topic)}</b><span class="clinic-flag">${idx+1} of 4</span></div><h3 style="margin-top:12px">${esc(s[0])}</h3><p>${esc(s[1])}</p><div class="flex wrap"><button class="btn xs" data-action="v11-coach-prev" ${idx===0?"disabled":""}>← Previous</button><button class="btn primary" data-action="v11-coach-next" ${idx===3?"disabled":""}>Next guided action →</button><button class="btn" data-route="v11/practice/${c.id}">Review or grade practice →</button><button class="btn xs" data-action="v11-coach-close">Hide coach</button></div><p class="small muted">Use the fictional controls beneath the coach yourself. The instructor cannot make changes for you.</p></section>`;
 }
 function attachCoach(){
  if(!current().startsWith("portal/")||!S.coach)return;
  const host=document.getElementById("portalContent");if(host)host.insertAdjacentHTML("afterbegin",css+coach());
 }
 shell=function(content,route){return oldShell(content,route).replace('<div class="sidefoot">',nav+'<div class="sidefoot">');};
 render=function(){
  const r=current();
  if(r==="v11/clinics"||r==="v11/progress"||r.startsWith("v11/clinic/")||r.startsWith("v11/practice/")){
   const c=find(r.split("/").at(-1)),content=r==="v11/clinics"?home():r==="v11/progress"?progress():r.startsWith("v11/clinic/")?(c?chapter(c):"<div class='page'><h1>Clinic not found</h1></div>"):(c?practice(c):"<div class='page'><h1>Practice not found</h1></div>");
   $("root").innerHTML=shell(content,r);document.title="Identity Architect · SC-300 Skill Clinics";lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  oldRender();attachCoach();
  if(r.startsWith("v7/skill/")){
   const skill=V7_SKILLS.find(x=>x.id===r.slice("v7/skill/".length));
   const clinic=skill?clinics.find(x=>x.skill===skill.skill):null;
   const host=document.querySelector("#root .page");
   if(host&&clinic&&!document.getElementById("v11-exact-skill")){
    const block='<div id="v11-exact-skill" class="panel" style="margin-top:15px;border-left:3px solid #2383ad"><div class="eyebrow">Advanced visual clinic for this exact measured objective</div><h3>'+esc(clinic.topic)+'</h3><p class="small">Includes a five-stage diagram, a four-action guided procedure, a troubleshooting scenario and practice. It does not mark this objective completely verified.</p><button class="btn primary" data-route="v11/clinic/'+clinic.id+'">Start advanced skill clinic →</button></div>';
    const caution=host.querySelector(".caution");
    if(caution)caution.insertAdjacentHTML("afterend",block);else host.insertAdjacentHTML("afterbegin",block);
   }
  }
  if(r==="v8/academy"){
   const hero=document.querySelector(".v8-hero");
   if(hero&&!hero.querySelector('[data-route="v11/clinics"]'))hero.insertAdjacentHTML("beforeend",'<div style="margin-top:13px"><button class="btn primary" data-route="v11/clinics">Continue to advanced hands-on skill clinics →</button></div>');
  }
 };
 function adjust(c,type,el){
  const v=getView(c.id);
  if(type==="v11-node")v.stage=Number(el.dataset.index)||0;
  if(type==="v11-node-next")v.stage=Math.min(4,(v.stage||0)+1);
  if(type==="v11-node-prev")v.stage=Math.max(0,(v.stage||0)-1);
  if(type==="v11-node-replay")v.stage=0;
  if(type==="v11-step-next")v.step=Math.min(3,(v.step||0)+1);
  if(type==="v11-step-prev")v.step=Math.max(0,(v.step||0)-1);
  S.views[c.id]=v;save();render();
 }
 action=function(a,el){
  if(a==="v11-filter"){S.filter=el.dataset.group||"All";save();render();return;}
  if(["v11-node","v11-node-next","v11-node-prev","v11-node-replay","v11-step-next","v11-step-prev"].includes(a)){
   const c=find(el.dataset.id);if(c)adjust(c,a,el);return;
  }
  if(a==="v11-start"){const c=find(el.dataset.id);if(c)selectMode(c,el.dataset.mode);return;}
  if(a==="v11-grade"){const c=find(el.dataset.id);if(c)complete(c);return;}
  if(a==="v11-coach-prev"||a==="v11-coach-next"){
   const c=find(S.coach?.id);if(!c)return;
   S.coach.step=Math.max(0,Math.min(3,S.coach.step+(a==="v11-coach-next"?1:-1)));
   save();go(c.route);return;
  }
  if(a==="v11-coach-close"){S.coach=null;save();render();return;}
  if(a==="v11-export"){
   downloadText("identity-architect-v11-skill-clinics.json",JSON.stringify({type:"identity-architect-v11-learning",created:new Date().toISOString(),learning:S},null,2));return;
  }
  oldAction(a,el);
 };
 document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-v11-open]");if(!btn)return;
  const c=find(btn.dataset.v11Open);if(!c)return;
  const a=S.attempts[c.id];
  if(a?.mode==="exam"&&!a.finished){S.coach=null;save();return;}
  S.coach={id:c.id,step:getView(c.id).step||0};
  if(db.v8)db.v8.coach=null;if(db.v6)db.v6.activeTutor=null;
  save();
 },true);
 document.addEventListener("change",e=>{
  if(e.target?.id!=="v11-import")return;
  const file=e.target.files?.[0];if(!file||file.size>2000000){toast("Choose a clinic JSON backup under 2 MB","bad");return;}
  const reader=new FileReader();
  reader.onload=()=>{
    try{
     const parsed=JSON.parse(String(reader.result||""));
     if(parsed.type!=="identity-architect-v11-learning"||!parsed.learning||typeof parsed.learning.quiz!=="object"||typeof parsed.learning.notes!=="object")throw Error("Invalid clinic backup");
     const data=parsed.learning;
     S.current=typeof data.current==="string"&&find(data.current)?data.current:null;
     S.quiz=data.quiz||{};S.notes=data.notes||{};S.views=data.views||{};S.practice=data.practice||{};S.teachback=data.teachback||{};
     S.history=Array.isArray(data.history)?data.history.slice(-300):[];
     S.orders={};S.attempts={};S.coach=null;S.filter="All";save();toast("Advanced clinic progress restored on this device","good");go("v11/progress");
    }catch(err){toast("Could not import this learning backup: "+String(err.message||err),"bad");}
  };
  reader.readAsText(file);
 });
 document.addEventListener("submit",e=>{
  const form=e.target;if(form?.id==="v11-quiz"){
   e.preventDefault();const c=find(form.dataset.id);if(!c)return;
   const answer=Number(new FormData(form).get("answer")),correct=answer===c.correct;
   const old=S.quiz[c.id]||{};
   S.quiz[c.id]={...old,first:correct,correct:correct&&!!old.second,answered:answer,date:new Date().toISOString()};
   S.history.push({id:c.id,mode:"reasoning-first",correct,time:new Date().toISOString()});save();render();toast(correct?"First reasoning check correct":"Review the root cause and retry",correct?"good":"bad");
  }
  if(form?.id==="v11-checkpoint"){
   e.preventDefault();const c=find(form.dataset.id),q=checkpoint(c?.id);if(!c||!q)return;
   const answer=Number(new FormData(form).get("second")),correct=answer===q.answer,old=S.quiz[c.id]||{};
   S.quiz[c.id]={...old,second:correct,correct:correct&&!!old.first,secondAnswered:answer,date:new Date().toISOString()};
   S.history.push({id:c.id,mode:"reasoning-second",correct,time:new Date().toISOString()});save();render();toast(correct?"Second scenario correct":"Review the alternative reasoning",correct?"good":"bad");
  }
  if(form?.id==="v11-teachback"){
   e.preventDefault();const c=find(form.dataset.id);if(!c)return;
   const raw=Object.fromEntries(new FormData(form).entries());
   const fields=["configured","reason","verification","rollback"];
   if(fields.some(k=>String(raw[k]||"").trim().length<25)){toast("Expand each explanation to at least one meaningful sentence","bad");return;}
   S.teachback[c.id]=Object.fromEntries(fields.map(k=>[k,String(raw[k]).trim().slice(0,2000)]));
   S.teachback[c.id].date=new Date().toISOString();save();toast("Teach-back evidence saved; independent review still required","good");render();
  }
  if(form?.id==="v11-note"){
   e.preventDefault();const c=find(form.dataset.id);if(!c)return;
   S.notes[c.id]=String(new FormData(form).get("notes")||"").slice(0,4000);save();toast("Technical notes saved to this browser","good");
  }
 });
})();
