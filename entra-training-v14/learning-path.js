/* One unified beginner-to-independent-identity-architect learning pathway; preserves existing V5-V13 source, progress and fictional tenant. */
(function installV14LearningPath(){
 const modules=[
 {id:"identities",name:"1 · Identity foundations",domain:"User identities",weight:"20–25% of SC-300",tag:"Who is the person and what can they reach?",description:"Understand identity creation and directory boundaries. Configure a new user, manage groups and roles, grant access only to the correct app, and validate external partner boundaries.",lessons:["tenant-boundary","user-lifecycle","group-app-access","external-b2b","hybrid-sync"],clinics:["domain-dns","custom-attributes","bulk-automation","device-identity","cross-tenant","cloudsync-choice"],mission:"joiner",nodes:[["Identity","A person or workload has a directory object; UPN and type matter"],["Group","Membership groups related identities; a group alone is not app access"],["Entitlement","The app assigns users/groups to access the correct resource"],["Least privilege","Directory admin roles are separate from business app access"],["Evidence","Inspect the user, membership, app assignment and audit trail"]]},
 {id:"authentication",name:"2 · Authentication and access",domain:"Authentication and access",weight:"25–30% of SC-300",tag:"Should this sign-in be allowed?",description:"Explore passkeys and account recovery, Conditional Access targeting and report-only pilots, risky sign-ins, network access signals and session revocation.",lessons:["passwordless-recovery","ca-policy","risk-and-logs"],clinics:["sspr","cae","auth-context","protected-actions","gsa-connectivity"],mission:"pilot",nodes:[["Subject","Identify the user, groups, authentication methods and risk signals"],["Resource","Which enterprise app or action is the sign-in targeting?"],["Policy","Check include/exclude scope, client/device conditions and grant controls"],["Decision","Compare On enforcement with Report-only predicted impact"],["Evidence","Use What If and sign-in logs, then verify the actual app result"]]},
 {id:"workloads",name:"3 · Applications and workload identities",domain:"Workload identities",weight:"20–25% of SC-300",tag:"What may the application or service do?",description:"Distinguish app registration, enterprise application, service principal, delegated permissions and managed identities. Learn single sign-on, proxy publishing, provisioning and token-related failure analysis.",lessons:["app-federation","app-consent","managed-workload"],clinics:["app-proxy","scim-provisioning","defender-cloud-apps"],mission:"workload",nodes:[["Client identity","The software identifies itself using registration or managed identity"],["Token","An authorized issuer provides audience/scope-limited claims"],["Permission","Delegated versus application-only API scopes carry different authority"],["Resource","Vault/API evaluates its own RBAC and application authorization"],["Evidence","Validate an allowed operation, denied operation and grant review"]]},
 {id:"governance",name:"4 · Identity governance",domain:"Identity governance",weight:"20–25% of SC-300",tag:"Who should keep access and for how long?",description:"Build time-limited vendor access with approvals, packages and reviews, then analyze privileged eligible activation, offboarding, diagnostics and governance assurance.",lessons:["governance-package","pim-operations","scim-monitoring"],clinics:["entitlement-tou","pim-groups","diagnostic-kql"],mission:"contractor",nodes:[["Eligibility","Who can request a project resource and from which tenant?"],["Approval","Which sponsor or manager approves the business need?"],["Grant","What technical group/app assignment actually permits use?"],["Review","Who confirms the need still exists at a later date?"],["Remove","Expiration and deprovisioning must be verified at target apps"]]}
 ];
 db.v14=db.v14||{selected:"identities",node:{},notes:{},focus:"SC-300"};
 const oldRender=render,oldShell=shell,oldAction=action;
 const esc=x=>safe(String(x??"")),get=id=>modules.find(x=>x.id===id);
 const passLesson=id=>!!db.v8?.passed?.[id],passClinic=id=>!!db.v11?.quiz?.[id]?.correct,missionAttempt=id=>db.v12?.active?.[id]||null;
 function stats(m){
  const studied=m.lessons.filter(passLesson).length,checked=m.clinics.filter(passClinic).length,attempt=missionAttempt(m.mission);
  return {studied,checked,attempt,guided:!!(attempt?.submitted&&attempt.passed&&attempt.mode==="guided"),independent:!!(attempt?.submitted&&attempt.passed&&attempt.knowledge&&attempt.mode==="exam")};
 }
 function nextStep(m){
  const l=m.lessons.find(id=>!passLesson(id));if(l)return {route:"v8/learn/"+l,label:"Learn the next concept",why:"Build your mental model before changing fictional tenant settings."};
  const c=m.clinics.find(id=>!passClinic(id));if(c)return {route:"v11/clinic/"+c,label:"Apply the concept to a harder problem",why:"Two different reasoning cases and a teach-back test whether you can explain the decision."};
  const a=missionAttempt(m.mission);if(!a||!a.submitted||!a.passed||!a.knowledge||a.mode!=="exam")return {route:"v12/missions",label:"Complete your connected mission",why:"Configure the same fictional tenant, explain the decisions and validate a fresh independent attempt."};
  return {route:"v7/skills",label:"Review missing official exam objectives",why:"A passed local exercise does not validate all measured exam objectives."};
 }
 const css=`<style>
 .v14-root{max-width:1170px;margin:0 auto}.v14-hero{padding:24px;border-radius:17px;border:1px solid #b8d5e7;background:linear-gradient(130deg,#e4f3fc,#f7f9ff);color:#1b405f}
 .v14-hero h1{margin:6px 0 10px}.v14-stage-line{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:15px 0 20px}
 .v14-stage-line span{font-weight:700;text-align:center;border:1px solid #bfd3e5;background:#f8fbff;color:#244966;border-radius:9px;padding:11px 5px;font-size:12px}
 .v14-card{border:1px solid #cfdfeb;border-radius:12px;padding:17px;background:var(--surface,#fff)}
 .v14-domain{border:1px solid #c5d9e7;border-radius:11px;padding:16px;background:var(--surface,#fff)}
 .v14-domain button{min-height:44px}.v14-domain h3{margin:4px 0}
 .v14-mini{display:inline-block;padding:5px 9px;border:1px solid #c5d8e7;border-radius:30px;font-size:12px;margin:5px 5px 5px 0}
 .v14-domain-head{margin-top:17px;display:flex;gap:10px;flex-wrap:wrap}
 .v14-topic-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .v14-topic{border:1px solid #d4e3ee;border-radius:10px;padding:13px;background:var(--surface,#fff)}
 .v14-topic button{min-height:42px}
 .v14-map{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:15px 0}
 .v14-map button{border:1px solid #c8d8e7;border-radius:9px;min-height:82px;padding:11px 5px;cursor:pointer;background:var(--surface,#fff);color:inherit;font-size:12px}
 .v14-map button.active{background:#e4f2fb;color:#174267;border:2px solid #2681a9;font-weight:700}
 .v14-meaning{padding:16px;border-radius:10px;border-left:4px solid #2882ab;background:#eef7fd;color:#1d4d6a}
 .v14-warning{padding:13px;border:1px solid #e9c18b;border-radius:10px;background:#fff8ef;color:#6c441b}
 @media(max-width:800px){.v14-stage-line{grid-template-columns:repeat(3,minmax(0,1fr))}.v14-map{grid-template-columns:repeat(2,minmax(0,1fr))}.v14-topic-list{grid-template-columns:1fr}}
 </style>`;
 const header=()=>`<div class="v14-hero"><div class="eyebrow">IDENTITY ARCHITECT ACADEMY · LEARNING FIRST</div><h1>See it. Understand it. Do it. Explain why.</h1>
   <p>Follow one connected path: visual explanations → guided console exercises → practice with optional hints → independent tasks → troubleshooting → mastery evidence. All administrative records are fictional. This is not an official Microsoft simulator or a guarantee of exam success.</p>
   <div class="v14-stage-line"><span>1 · WATCH</span><span>2 · UNDERSTAND</span><span>3 · FOLLOW</span><span>4 · PRACTICE</span><span>5 · TROUBLESHOOT</span><span>6 · MASTER</span></div></div>`;
 function domainCard(m){
  const x=stats(m),n=nextStep(m);
  return `<article class="v14-domain"><div class="eyebrow">${esc(m.weight)} · CURRENT SC-300 TRACK</div><h3>${esc(m.name)}</h3><p class="small muted"><b>${esc(m.tag)}</b> ${esc(m.description)}</p>
   <div><span class="v14-mini">${x.studied}/${m.lessons.length} foundational knowledge checks</span><span class="v14-mini">${x.checked}/${m.clinics.length} advanced reasoning checks</span><span class="v14-mini">${x.independent?"Independent fictional mission passed":"Independent mission pending"}</span></div>
   <div class="flex wrap" style="margin-top:12px"><button class="btn primary" data-route="${n.route}">${esc(n.label)} →</button><button class="btn" data-route="v14/domain/${m.id}">View this learning path →</button></div>
  </article>`;
 }
 function home(){
  const total=modules.reduce((acc,m)=>acc+stats(m).studied,0),advanced=modules.reduce((acc,m)=>acc+stats(m).checked,0);
  const ids=modules.filter(m=>!stats(m).independent),next=ids[0]||modules[0],task=nextStep(next);
  const recentWrong=(db.v8?.quizHistory||[]).filter(x=>x.correct===false).slice(-3).map(x=>V8_LESSONS.find(y=>y.id===x.id)?.title).filter(Boolean);
  return `<div class="page v14-root">${css}${header()}
   <div class="grid3" style="margin:17px 0"><div class="panel"><div class="statnum">${total}/14</div><div class="statlabel">Foundational knowledge checks completed</div></div>
   <div class="panel"><div class="statnum">${advanced}/17</div><div class="statlabel">Advanced two-question checks passed</div></div>
   <div class="panel"><div class="statnum">${modules.filter(m=>stats(m).independent).length}/4</div><div class="statlabel">Independent fictional mission results</div></div></div>
   <div class="panel" style="margin-top:14px"><div class="eyebrow">RECOMMENDED NEXT STEP · SC-300</div><h3>${esc(next.name)}</h3><p>${esc(task.why)}</p>
    <div class="flex wrap"><button class="btn primary" data-route="${task.route}">Continue learning →</button><button class="btn" data-route="v12/missions">Hands-on missions</button><button class="btn" data-route="v11/clinics">Advanced clinics</button></div></div>
   <h2 style="margin-top:22px">Four connected identity engineering domains</h2><div class="v14-topic-list">${modules.map(domainCard).join("")}</div>
   ${recentWrong.length?`<div class="panel" style="margin-top:17px"><h3>Review concepts previously missed</h3><p class="small muted">${recentWrong.map(esc).join(" · ")}</p><button class="btn" data-route="v8/progress">Open my error-based learning record →</button></div>`:""}
   <div class="v14-warning" style="margin-top:17px"><b>Measured objective coverage remains unverified.</b><p>This dashboard reports only learning activity and fictional state validation. The academy cannot call any SC-300, SC-900 or SC-100 domain fully exam-ready until the full official blueprint, independent practice and browser testing gates are met.</p></div>
   <div class="flex wrap" style="margin-top:16px"><button class="btn" data-route="v7/skills">237 official objective records →</button><a class="btn" href="./real-labs.html">Real Microsoft practice tenant companion ↗</a><a class="btn" href="./qa-connected.html">Run functional browser self-tests ↗</a></div>
   ${footer()}</div>`;
 }
 function topicList(ids,course){
  return ids.map((id,i)=>{
    const l=course==="v8"?V8_LESSONS.find(x=>x.id===id):[...V11_CLINICS_A,...V11_CLINICS_B].find(x=>x.id===id);
    const done=course==="v8"?passLesson(id):passClinic(id);
    return `<div class="v14-topic"><div class="eyebrow">${done?"✓ Knowledge check completed":"Knowledge check pending"} · ${course==="v8"?"FOUNDATIONS":"ADVANCED ANALYSIS"}</div>
     <h4>${esc(l?.title||l?.topic||id)}</h4><p class="small muted">${course==="v8"?esc(l?.objective||"Build a visual mental model of the administrative task."):esc(l?.why||"Practice technical reasoning and troubleshooting.")}</p>
     <button class="btn" data-route="${course==="v8"?"v8/learn/":"v11/clinic/"}${id}">Open guided lesson →</button></div>`;
  }).join("");
 }
 function domain(m){
  const x=stats(m),n=nextStep(m),idx=Math.max(0,Math.min(4,db.v14.node?.[m.id]||0)),node=m.nodes[idx];
  return `<div class="page v14-root">${css}<button class="btn xs" data-route="v14/path">← All identity learning paths</button>
  <div class="v14-hero" style="margin-top:12px"><div class="eyebrow">SC-300 · ${esc(m.weight)}</div><h1>${esc(m.name)}</h1><p>${esc(m.description)}</p></div>
  <div class="panel" style="margin-top:16px"><h3>WATCH · Explore the security decision chain</h3><p>Tap each part of the system and explain how it affects the next stage.</p>
    <div class="v14-map">${m.nodes.map((p,i)=>`<button class="${idx===i?"active":""}" data-action="v14-node" data-id="${m.id}" data-index="${i}">${i+1}. ${esc(p[0])}</button>`).join("")}</div>
    <div class="v14-meaning" role="status"><b>${esc(node[0])}</b><p>${esc(node[1])}</p></div>
    <div class="flex wrap" style="margin-top:10px"><button class="btn" data-action="v14-node-prev" data-id="${m.id}" ${idx===0?"disabled":""}>← Previous</button><button class="btn primary" data-action="v14-node-next" data-id="${m.id}" ${idx===4?"disabled":""}>Next part →</button><button class="btn" data-action="v14-node-replay" data-id="${m.id}">Replay explanation</button></div>
  </div>
  <h2 style="margin-top:20px">1. Understand the foundation</h2><p>Complete the visual lessons in order and explain the concepts before making configuration changes. ${x.studied} of ${m.lessons.length} lesson checks recorded.</p>
  <div class="v14-topic-list">${topicList(m.lessons,"v8")}</div>
  <h2 style="margin-top:20px">2. Apply the deeper reasoning</h2><p>These clinics provide additional technical workflows, tricky failures, and two independent reasoning questions per topic. ${x.checked} of ${m.clinics.length} advanced checks recorded.</p>
  <div class="v14-topic-list">${topicList(m.clinics,"v11")}</div>
  <div class="panel" style="margin-top:20px"><div class="eyebrow">3. DO · CONNECTED FICTIONAL TENANT</div><h3>Guided → Practice with hints → Independent Exam</h3><p>Use the same employee, group, application, policy and audit records through a whole business workflow. The evaluation rechecks the actual saved fictional state, including unauthorized permissions.</p>
    <p class="small"><b>Current evidence:</b> ${x.attempt?.submitted?(x.attempt.passed?"configuration passed":"configuration incomplete"):"not submitted"} · ${x.attempt?.knowledge?"reasoning questions correct":"reasoning pending"} · ${x.attempt?.mode?esc(x.attempt.mode)+" mode":"no active attempt"}</p>
    <div class="flex wrap"><button class="btn primary" data-route="v12/missions">Open all three mission modes →</button>${x.attempt?`<button class="btn" data-route="v12/mission/${m.mission}">Resume this mission →</button>`:""}</div>
  </div>
  <div class="v14-warning" style="margin-top:15px"><b>4. PROVE · Independent real-world validation</b><p>Even after a simulated pass, verify an approved real Microsoft tenant where licensing permits, complete fresh objective-balanced mock assessments, and review Microsoft’s current study guide. These requirements have not been automatically signed off.</p></div>
  <div class="flex wrap" style="margin-top:17px"><button class="btn primary" data-route="${n.route}">Recommended next action →</button><button class="btn" data-route="v14/path">Back to the full learning path</button></div>${footer()}</div>`;
 }
 const navigation='<div class="sectioncap">One complete learning pathway</div><button class="navitem" data-route="v14/path"><span class="navicon">▣</span>Start here · Guided learning</button>';
 shell=(content,where)=>oldShell(content,where).replace('<div class="sidefoot">',navigation+'<div class="sidefoot">');
 render=()=>{
  const r=current();
  if(r==="v14/path"||r.startsWith("v14/domain/")){
   const m=get(r.split("/").at(-1));
   $("root").innerHTML=shell(r==="v14/path"?home():m?domain(m):"<div class='page'><h1>Learning path not found</h1><button class='btn' data-route='v14/path'>Return to learning home</button></div>",r);
   document.title="Identity Architect Academy · Learning Path";lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  oldRender();
 };
 action=(a,el)=>{
  if(["v14-node","v14-node-prev","v14-node-next","v14-node-replay"].includes(a)){
   const m=get(el?.dataset?.id);if(!m)return;
   const prev=Number(db.v14.node[m.id]||0);
   let n=a==="v14-node"?Number(el.dataset.index):a==="v14-node-prev"?prev-1:a==="v14-node-next"?prev+1:0;
   db.v14.node[m.id]=Math.max(0,Math.min(4,n));save();render();return;
  }
  oldAction(a,el);
 };
 window.__V14_MODULES=modules;
})();
