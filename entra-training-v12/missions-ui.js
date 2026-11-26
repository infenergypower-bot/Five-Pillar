/* Four connected admin missions, 25 realistic actions, and eight diagnostic reasoning questions. */
(function installV12MissionEngine(){
  if(!Array.isArray(V12_MISSIONS)||V12_MISSIONS.length!==4)throw Error("Missing connected missions");
  db.v12=db.v12||{active:{},history:[],quizzes:{},notes:{},last:null};
  const state=()=>db.v12,prevRender=render,prevAction=action,prevShell=shell,esc=x=>safe(String(x??""));
  const find=id=>V12_MISSIONS.find(m=>m.id===id);
  const get=id=>state().active[id];
  const values=a=>({
    CODE:a?.code||"",
    USER:"Lab Analyst "+(a?.code||""),
    GROUP:"Lab Finance "+(a?.code||""),
    POLICY:"Lab MFA "+(a?.code||""),
    IDENTITY:"Lab Payroll "+(a?.code||""),
    REG:"Lab Graph "+(a?.code||""),
    GUEST:"Lab Vendor "+(a?.code||""),
    PACKAGE:"Lab Project "+(a?.code||"")
  });
  const labNames=(m,a)=>{
    const v=values(a);
    if(m.id==="pilot"){v.USER="Lab Pilot "+a.code;v.GROUP="Lab Pilot Group "+a.code;}
    if(m.id==="contractor"){v.GROUP="Lab Contractors "+a.code;}
    return v;
  };
  const replace=(s,m,a)=>{
    const v=labNames(m,a);return String(s||"").replace(/\{\{([A-Z]+)\}\}/g,(_,k)=>v[k]||"");
  };
  function refs(m,a){
    const v=labNames(m,a);
    const user=db.users.find(u=>u.name===v.USER),group=db.groups.find(g=>g.name===v.GROUP);
    const guest=db.users.find(u=>u.name===v.GUEST),app=db.apps.find(x=>x.name=== (m.id==="contractor"?"Vendor Portal":"Finance Reports"));
    const reg=db.regs.find(r=>r.name===v.REG),managed=db.managed.find(x=>x.name===v.IDENTITY);
    const policy=db.policies.find(p=>p.name===v.POLICY),pkg=db.packages.find(p=>p.name===v.PACKAGE);
    return {v,user,guest,group,app,reg,managed,policy,pkg};
  }
  function stepResult(m,a,index){
    const key=m.steps[index]?.check,r=refs(m,a),v=r.v;
    const members=Array.isArray(r.group?.members)?r.group.members:[];
    const assignees=Array.isArray(r.app?.assignees)?r.app.assignees:[];
    const finance=db.apps.find(x=>x.name==="Finance Reports");
    const contractorGroups=db.groups.filter(g=>r.guest&&Array.isArray(g.members)&&g.members.includes(r.guest.id));
    const excluded=!!r.guest&&!(finance?.assignees||[]).some(id=>id===r.guest.id||contractorGroups.some(g=>g.id===id));
    const dedicatedOnly=(person)=>!!person&&members.length===1&&members[0]===person.id;
    const safeRole=(u)=>!!u&&!/(administrator|admin|owner)/i.test(String(u.role||""))&&!db.roles.some(x=>x.user===u.name&&!/reader/i.test(x.role||""));
    let ok=false,reason="",actual="";
    if(m.id==="joiner"){
      if(key==="user"){ok=!!r.user&&r.user.type==="Member"&&r.user.email?.toLowerCase().includes(a.code.toLowerCase());reason="Create a Member with the exact lab display name and a unique training-only sign-in.";actual=r.user?`${r.user.name}, ${r.user.email}, type ${r.user.type}`:"No attempt-specific member identity found";}
      if(key==="group"){ok=!!r.group;reason="Create the exact dedicated Finance group.";actual=r.group?`Group ${r.group.name} exists`:"Group not yet created";}
      if(key==="member"){ok=dedicatedOnly(r.user);reason="The dedicated Finance group should contain only the new employee, with no unapproved additional members.";actual=members.length?`${members.length} group member(s), employee included: ${ok}`:"Group has no members";}
      if(key==="app"){ok=!!r.app&&!!r.group&&assignees.includes(r.group.id);reason="Assign Finance Reports to the dedicated group, not All Staff.";actual=`Finance Reports assignees: ${assignees.length}`;}
      if(key==="license"){ok=!!r.user&&r.user.licenses?.length>0;reason="Assign a simulated Microsoft service license to the new employee.";actual=`Licenses for this employee: ${(r.user?.licenses||[]).join(", ")||"none"}`;}
      if(key==="least"){ok=safeRole(r.user)&&dedicatedOnly(r.user)&&assignees.includes(r.group?.id)&&!members.includes("u0");reason="No directory administration or emergency member in the dedicated group; ordinary group-based app entitlement is sufficient.";actual=r.user?`Role ${r.user.role||"none"}; emergency excluded: ${!members.includes("u0")}`:"User missing";}
    }
    if(m.id==="pilot"){
      if(key==="user"){ok=!!r.user&&r.user.type==="Member"&&r.user.email?.toLowerCase().includes(a.code.toLowerCase());reason="Create the unique pilot Member identity.";actual=r.user?`${r.user.name}, ${r.user.type}`:"Pilot not created";}
      if(key==="group"){ok=!!r.group&&r.group.name!=="All Staff";reason="Create the dedicated pilot group.";actual=r.group?`Group ${r.group.name}`:"No pilot group";}
      if(key==="member"){ok=dedicatedOnly(r.user)&&!members.includes("u0");reason="Include only the pilot identity; never Training Emergency or other unapproved people.";actual=`Included user: ${!!r.user&&members.includes(r.user.id)}; emergency included: ${members.includes("u0")}`;}
      if(key==="policy"){ok=!!r.policy&&r.policy.group===r.group?.name&&r.policy.app==="Finance Reports"&&r.policy.control==="Require MFA"&&r.policy.state==="Report-only";reason="Create an MFA policy for the exact group and Finance Reports, state Report-only.";actual=r.policy?`Scope ${r.policy.group}; app ${r.policy.app}; control ${r.policy.control}; state ${r.policy.state}`:"Policy not created";}
      if(key==="whatif"){ok=!!r.user&&db.whatif?.user===r.user.name&&db.whatif?.app==="Finance Reports";reason="Run What If as the created pilot user against Finance Reports.";actual=db.whatif?`${db.whatif.user} → ${db.whatif.app} (${db.whatif.result})`:"No What If evaluation recorded";}
      if(key==="scope"){ok=!!r.policy&&r.policy.group===r.group?.name&&r.policy.app==="Finance Reports"&&r.policy.control==="Require MFA"&&r.policy.state==="Report-only"&&!members.includes("u0");reason="Keep the exact targeted policy in Report-only and emergency account excluded.";actual=r.policy?`Policy state ${r.policy.state}; emergency excluded ${!members.includes("u0")}`:"Policy missing";}
    }
    if(m.id==="workload"){
      if(key==="managed"){ok=!!r.managed;reason="Create the named managed identity under the Managed identities screen.";actual=r.managed?`${r.managed.name}`:"No identity found";}
      if(key==="grant"){ok=!!r.managed&&r.managed.grant==="Secrets User on PayrollVault";reason="Grant Secrets User on PayrollVault; subscription Owner is too broad.";actual=`Current grant: ${r.managed?.grant||"none"}`;}
      if(key==="reg"){ok=!!r.reg;reason="Create a separate app registration for the API client.";actual=r.reg?`${r.reg.name}`:"No registration found";}
      if(key==="permission"){ok=!!r.reg&&r.reg.permissions?.includes("Delegated User.Read")&&!r.reg.permissions.some(x=>x.startsWith("Application "));reason="Use Delegated User.Read; remove broad application permissions if accidentally requested.";actual=`Permissions: ${(r.reg?.permissions||[]).join(", ")||"none"}`;}
      if(key==="consent"){ok=!!r.reg&&r.reg.consented===true;reason="Record simulated consent after selecting the narrow API permission.";actual=`Consent: ${!!r.reg?.consented}`;}
      if(key==="least"){ok=!!r.reg&&!!r.managed&&r.managed.grant==="Secrets User on PayrollVault"&&r.reg.consented===true&&r.reg.permissions?.length===1&&r.reg.permissions[0]==="Delegated User.Read";reason="Verify exactly one delegated permission and a narrow vault grant, not subscription Owner.";actual=`Vault ${r.managed?.grant||"none"}; app permissions ${(r.reg?.permissions||[]).join(", ")||"none"}`;}
    }
    if(m.id==="contractor"){
      if(key==="guest"){ok=!!r.guest&&r.guest.type==="Guest"&&r.guest.email?.toLowerCase().includes(a.code.toLowerCase());reason="Invite the named fictional user as Guest using a unique training-only email.";actual=r.guest?`${r.guest.name}, type ${r.guest.type}`:"Guest not created";}
      if(key==="group"){ok=!!r.group;reason="Create a dedicated contractor security group.";actual=r.group?`Group ${r.group.name}`:"Group missing";}
      if(key==="member"){ok=dedicatedOnly(r.guest);reason="Only the invited contractor belongs in the dedicated project group.";actual=`Guest included: ${!!r.guest&&members.includes(r.guest.id)}`;}
      if(key==="app"){ok=!!r.app&&!!r.group&&assignees.includes(r.group.id);reason="Create Vendor Portal if absent and assign the exact contractor group.";actual=`Vendor Portal exists: ${!!r.app}; group assigned: ${!!r.group&&assignees.includes(r.group.id)}`;}
      if(key==="package"){ok=!!r.pkg&&r.pkg.approval==="Required"&&Number(r.pkg.expiry)===30;reason="Create the attempt-specific access package with Required approval and exactly 30-day expiry.";actual=r.pkg?`Approval ${r.pkg.approval}; expiry ${r.pkg.expiry} days`:"Package missing";}
      if(key==="review"){ok=!!r.group&&db.reviews.some(x=>x.target===r.group.name&&x.reviewer);reason="Create a review targeting the contractor group with a named responsible reviewer.";actual=`Review count: ${db.reviews.filter(x=>x.target===r.group?.name).length}`;}
      if(key==="least"){ok=excluded&&!!r.guest&&safeRole(r.guest)&&!!r.group&&dedicatedOnly(r.guest)&&!!r.app&&assignees.includes(r.group.id)&&!members.includes("u0");reason="Verify Vendor Portal access while preventing direct or group-assigned Finance Reports access.";actual=`No Finance Reports assignment: ${excluded}; Vendor Portal assigned: ${!!r.app&&assignees.includes(r.group.id)}`;}
    }
    return {ok:!!ok,reason,actual,step:index,check:key};
  }
  function all(m,a){return m.steps.map((_,i)=>stepResult(m,a,i));}
  function stillValid(m,a){return !!a?.submitted&&all(m,a).every(x=>x.ok);}

  const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
  function start(m,mode){
    mode=["guided","practice","exam"].includes(mode)?mode:"guided";
    const code=(Math.random().toString(36).slice(2,7)+Date.now().toString(36).slice(-2)).toUpperCase();
    state().active[m.id]={code,mode,step:0,checked:{},started:Date.now(),submitted:false,questions:{},orders:Object.fromEntries(m.questions.map((q,i)=>[i,shuffle(q.options.map((_,j)=>j))])),hiddenHint:{},done:false};
    if(db.v8)db.v8.coach=null;
    if(db.v11)db.v11.coach=null;
    if(db.v6)db.v6.activeTutor=null;
    state().last=m.id;save();go("v12/mission/"+m.id);
  }
  function check(m,index){
    const a=get(m.id);if(!a||a.submitted)return;
    const r=stepResult(m,a,index);
    a.checked[index]={...r,time:new Date().toISOString()};
    if(r.ok){a.step=index;toast("Configuration verified for this step","good");}
    else toast("Not yet: "+r.reason,"bad");
    save();render();
  }
  function next(m,delta){
    const a=get(m.id);if(!a||a.submitted)return;
    if(delta>0&&!stepResult(m,a,a.step).ok){toast("Complete this configuration step before advancing","bad");return;}
    a.step=Math.max(0,Math.min(m.steps.length-1,a.step+delta));save();render();
  }
  function submit(m){
    const a=get(m.id);if(!a||a.submitted)return;
    const results=all(m,a);a.submitted=true;a.results=results;a.passed=results.every(x=>x.ok);
    a.finished=new Date().toISOString();
    state().history.push({id:m.id,code:a.code,mode:a.mode,passed:a.passed,time:a.finished});
    state().history=state().history.slice(-50);
    save();render();
  }
  function quiz(m,idx,k){
    const a=get(m.id);if(!a?.submitted)return;
    const q=m.questions[idx],ok=k===q.answer;
    a.questions[idx]={choice:k,correct:ok,time:new Date().toISOString()};
    a.knowledge=m.questions.every((_,i)=>a.questions[i]?.correct===true);
    save();render();toast(ok?"Correct reasoning":"Review the explanation and retry",ok?"good":"bad");
  }
  function namesBox(m,a){
    const v=labNames(m,a);
    const want=m.id==="joiner"?["USER","GROUP"]:m.id==="pilot"?["USER","GROUP","POLICY"]:m.id==="workload"?["IDENTITY","REG"]:["GUEST","GROUP","PACKAGE"];
    return `<div class="v12-names">${want.map(k=>`<div><span>${esc(k)}</span><b>${esc(v[k])}</b><button class="btn xs" data-action="v12-copy" data-key="${k}" data-id="${m.id}" aria-label="Copy ${k}">Copy</button></div>`).join("")}</div>`;
  }
  const css=`<style>
  .v12-main{max-width:1190px;margin:0 auto}
  .v12-banner{border:1px solid #b6d2e7;border-radius:16px;background:linear-gradient(110deg,#eaf6fc,#f4f7fc);padding:23px;color:#173550}
  .v12-names{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin:15px 0}
  .v12-names>div{background:#f5f9fd;border:1px solid #c5d8eb;border-radius:11px;padding:12px;display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;min-width:0}
  .v12-names span{grid-column:1/-1;font-size:10px;letter-spacing:.12em;color:#486785;font-weight:700}.v12-names b{font-size:13px;overflow-wrap:anywhere}
  .v12-steps{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0}.v12-steps button{background:#f1f6fb;border:1px solid #c2d3e2;color:#1b3e61;border-radius:9px;min-width:43px;min-height:44px;cursor:pointer;font-weight:700}
  .v12-steps button.current{background:#1f5d91;color:white}.v12-steps button.complete{background:#e5f6e9;border-color:#57aa70;color:#185634}
  .v12-task{background:var(--surface,#fff);border:1px solid #c8d8e7;border-radius:14px;padding:20px}
  .v12-why{background:#eaf4fb;border-left:4px solid #267db0;border-radius:8px;padding:15px;margin:13px 0;color:#1e476a}
  .v12-evidence{border:1px solid #bddac8;background:#eff9f2;border-radius:10px;padding:13px;color:#1e5e38;margin:11px 0}
  .v12-errors{border:1px solid #ecc48c;background:#fff5e9;border-radius:10px;padding:13px;color:#6b4218;margin:11px 0}
  .v12-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:16px}.v12-side{position:sticky;top:12px;align-self:start}
  .v12-coach{border:2px solid #277da5;border-radius:14px;background:#eaf6fd;padding:16px;color:#153f59}
  .v12-choice{display:block;border:1px solid #cedce9;padding:14px;border-radius:9px;margin:7px 0;cursor:pointer}
  .v12-choice:has(input:checked){background:#e6f4ff;border-color:#1687b7}
  .v13-screen{background:#f8fbfe;border:1px solid #bed4e6;border-radius:12px;overflow:hidden;margin:14px 0}
  .v13-nav{display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:#e7f1f8;color:#17466a;font-size:11px}
  .v13-path{padding:14px;border-bottom:1px solid #d0dfeb;color:#193d56;font-size:13px;overflow-wrap:anywhere}
  .v13-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:13px}
  .v13-grid>section{border:1px solid #d0dfea;background:white;padding:13px;border-radius:9px}
  .v13-grid h4{margin:0 0 7px;font-size:13px;color:#1a547a}.v13-grid p{margin:5px 0;font-size:13px;line-height:1.5;color:#253e51}
  .v13-more{border-top:1px solid #d0dfeb;padding:12px;background:#f5f9fc}
  .v13-more details{padding:9px 0}.v13-more summary{font-weight:700;color:#1b4b69;cursor:pointer}
  @media(max-width:650px){.v13-grid{grid-template-columns:1fr}}
  @media(max-width:820px){.v12-layout{grid-template-columns:1fr}.v12-side{position:static}}
  </style>`;
  const head=()=>`<div class="v12-banner"><div class="eyebrow">SC-300 CONNECTED SKILL PRACTICE · REAL FICTIONAL CONFIGURATION</div><h1>Practice the whole workflow, not just one setting</h1><p>Create users, groups, application access, policies and governance resources using the SAME practice directory. The instructor tells you why each action matters, while the checks inspect what was actually saved.</p><div class="v12-why"><b>Not Microsoft cloud:</b> no real credentials or subscriptions are used. Every result is limited to the fictional model; success does not certify a production configuration.</div></div>`;
  function hub(){
    const passed=V12_MISSIONS.filter(m=>stillValid(m,get(m.id))).length;
    const mastered=V12_MISSIONS.filter(m=>get(m.id)?.mode==="exam"&&stillValid(m,get(m.id))&&get(m.id)?.knowledge).length;
    return `<div class="page v12-main">${css}${head()}
    <div class="grid3" style="margin:16px 0"><div class="panel"><div class="statnum">4</div><div class="statlabel">Connected business missions</div></div><div class="panel"><div class="statnum">25</div><div class="statlabel">Actual state-checked admin steps</div></div><div class="panel"><div class="statnum">${mastered}/4</div><div class="statlabel">Independent simulated missions plus reasoning</div></div></div>
    <div class="grid2">${V12_MISSIONS.map(m=>{const a=get(m.id),results=a?all(m,a):[],n=results.filter(x=>x.ok).length;return `<div class="panel"><div class="eyebrow">${esc(m.domain)} · ${m.minutes} min</div><h3>${esc(m.title)}</h3><p>${esc(m.scenario)}</p><p class="small muted"><b>Why:</b> ${esc(m.why)}</p>
     <p class="small"><b>Current saved configuration:</b> ${n}/${m.steps.length} required conditions met${a?" for attempt "+esc(a.code):""}</p>
     <div class="flex wrap"><button class="btn primary" data-action="v12-start" data-id="${m.id}" data-mode="guided">Learn with coach →</button><button class="btn" data-action="v12-start" data-id="${m.id}" data-mode="practice">Practice with hints →</button><button class="btn" data-action="v12-start" data-id="${m.id}" data-mode="exam">Try independently →</button>${a?`<button class="btn" data-route="v12/mission/${m.id}">Resume attempt →</button>`:""}</div>
    </div>`}).join("")}</div>
    <div class="panel" style="margin-top:17px"><h3>What an independent pass means here</h3><p>The required fictional records and links existed at submission, and you answered the corresponding reasoning questions. This is a controlled local simulation, not an official exam score or real enterprise tenant validation.</p>
    <button class="btn" data-route="v12/results">Review saved mission results →</button><button class="btn" data-action="v12-export">Export this mission learning record ↓</button><a class="btn" href="./qa-connected.html">Run free browser and iPad workflow checks →</a></div>${footer()}</div>`;
  }
  function visualGuide(s,includeTroubleshooting=true){
    if(!s.path)return "";
    return `<div class="v13-screen" aria-label="Annotated administrative procedure">
      <div class="v13-nav"><b>IDENTITY PRACTICE CONSOLE</b><span>›</span><span>SIMULATION</span><span>›</span><span>CONFIGURATION</span></div>
      <div class="v13-path"><b>Where to look:</b> ${esc(s.path)}</div>
      <div class="v13-grid">
       <section><h4>WATCH · What you are working with</h4><p>${esc(s.observe)}</p></section>
       <section><h4>VERIFY · What success looks like</h4><p>${esc(s.expected)}</p></section>
      </div>
      ${includeTroubleshooting?`<div class="v13-more"><details><summary>Common mistake and its consequence</summary><p>${esc(s.pitfall)}</p></details><details><summary>How to diagnose and safely recover</summary><p>${esc(s.recovery)}</p></details></div>`:""}
     </div>`;
  }
  function stepContent(m,a){
    const i=a.step,s=m.steps[i],status=stepResult(m,a,i),names=labNames(m,a);
    const content=replace(s.do,m,a),where=s.where,passed=status.ok;
    return `<div class="v12-task"><div class="eyebrow">STEP ${i+1} / ${m.steps.length} · ${a.mode==="guided"?"GUIDED INSTRUCTION":a.mode==="practice"?"PRACTICE — OPTIONAL HINTS":"INDEPENDENT ASSESSMENT"}</div>
     <h2>${esc(s.title)}</h2>${a.mode==="guided"?`<p><b>Do this:</b> ${esc(content)}</p><div class="v12-why"><b>Why this matters</b><p>${esc(s.why)}</p></div>${visualGuide(s)}`:a.mode==="practice"?`<p>Complete this stage using the business requirement and named training records. You can request an optional clue, but the coach will not complete any setting for you.</p>
      <button class="btn" data-action="v12-hint" data-id="${m.id}" data-index="${i}">${a.hiddenHint?.[i]?"Hide optional hint":"Show a hint for this step"}</button>
      ${a.hiddenHint?.[i]?`<div class="v12-why"><b>Practice hint</b><p>${esc(content)}</p><p><b>Why:</b> ${esc(s.why)}</p></div>${visualGuide(s,false)}`:""}`: `<p>Use the business requirement and your own knowledge. The required procedure stays hidden until submission.</p>`}
     <div class="flex wrap"><button class="btn primary" data-route="${esc(where)}" data-v12-open="${m.id}">Open the matching Entra-style practice screen →</button><button class="btn" data-action="v12-check" data-id="${m.id}" data-index="${i}">Check saved configuration</button></div>
     ${a.checked[i]?`<div class="${a.checked[i].ok?"v12-evidence":"v12-errors"}"><b>${a.checked[i].ok?"✓ Requirement currently satisfied":"Not satisfied yet"}</b>
       ${a.mode==="guided"||a.mode==="practice"&&a.hiddenHint?.[i]||a.submitted?`<p>${esc(status.reason)}</p><p class="small">Observed: ${esc(status.actual)}</p>`:`<p>Review the fictional resource and its relationships, then try again.</p>`}</div>`:""}
     <div class="flex between wrap" style="margin-top:17px"><button class="btn" data-action="v12-previous" data-id="${m.id}" ${i===0?"disabled":""}>← Previous step</button>
       ${i<m.steps.length-1?`<button class="btn primary" data-action="v12-next" data-id="${m.id}">Next configuration step →</button>`:`<button class="btn primary" data-action="v12-submit" data-id="${m.id}">Submit full mission configuration →</button>`}</div>
    </div>`;
  }
  function quizView(m,a){
    const allOk=stillValid(m,a),questions=m.questions;
    return `<div class="panel" style="margin-top:17px"><div class="eyebrow">TROUBLESHOOT AND MASTER · TWO SEPARATE QUESTIONS</div><h3>Show you understand the cause, not only the clicks</h3><p>Answer both cases. A correct configuration and correct reasoning are recorded separately.</p>
    ${questions.map((q,idx)=>{const k=a.questions[idx],order=a.orders?.[idx]||[...q.options.map((_,i)=>i)];
      return `<div style="padding:13px 0;border-bottom:1px solid #d6e1ec"><p><b>${idx+1}. ${esc(q.q)}</b></p><form id="v12-quiz" data-id="${m.id}" data-index="${idx}">
      ${order.map(i=>`<label class="v12-choice"><input type="radio" name="answer" value="${i}" ${k?.choice===i?"checked":""} required> ${esc(q.options[i])}</label>`).join("")}
      <button class="btn primary" type="submit">Explain my answer →</button></form>
      ${k?`<div class="${k.correct?"v12-evidence":"v12-errors"}"><b>${k.correct?"✓ Correct reasoning":"Not yet correct"}</b><p>${esc(q.why)}</p>${k.correct?"":`<p>Best answer: ${esc(q.options[q.answer])}</p>`}</div>`:""}</div>`;
    }).join("")}
    <div class="${allOk&&a.knowledge?"v12-evidence":"v12-errors"}"><b>${allOk&&a.knowledge?"All limited mission requirements and reasoning checks passed":"Your full learning objective still has an outstanding requirement"}</b>
    <p>The source and security enforcement remain simulated. Review a real test tenant and Microsoft Learn to validate professional competence.</p></div></div>`;
  }
  function mission(m){
    const a=get(m.id);if(!a)return `<div class="page v12-main">${css}<button class="btn xs" data-route="v12/missions">← All missions</button><h1>${esc(m.title)}</h1><p>${esc(m.scenario)}</p><button class="btn primary" data-action="v12-start" data-id="${m.id}" data-mode="guided">Start guided learning →</button><button class="btn" data-action="v12-start" data-id="${m.id}" data-mode="practice">Start Practice mode (optional hints) →</button><button class="btn" data-action="v12-start" data-id="${m.id}" data-mode="exam">Start independent attempt →</button></div>`;
    const completed=all(m,a),n=completed.filter(x=>x.ok).length,mode=a.mode,currentPass=stillValid(m,a);
    return `<div class="page v12-main">${css}<button class="btn xs" data-route="v12/missions">← All missions</button><div class="eyebrow" style="margin-top:16px">${esc(m.domain)} · ${mode==="guided"?"GUIDED":mode==="practice"?"PRACTICE":"INDEPENDENT"} · ATTEMPT ${esc(a.code)}</div><h1>${esc(m.title)}</h1>
      <div class="v12-banner"><h3>Business requirement</h3><p>${esc(m.scenario)}</p><p class="small"><b>Why this configuration exists:</b> ${esc(m.why)}</p></div>
      ${namesBox(m,a)}
      <div class="panel" style="margin:14px 0"><div class="flex between wrap"><b>${n} of ${m.steps.length} fictional requirements currently satisfied</b><span class="pill">${esc(mode.toUpperCase())}</span></div>
      <div class="v12-steps" aria-label="Administrative mission steps">${m.steps.map((s,i)=>`<button data-action="v12-goto" data-id="${m.id}" data-index="${i}" class="${completed[i].ok?"complete":""} ${a.step===i?"current":""}" aria-label="Step ${i+1}: ${esc(s.title)}, ${completed[i].ok?"satisfied":"pending"}">${completed[i].ok?"✓":i+1}</button>`).join("")}</div>
      <p class="small muted">Green means the current fictional tenant meets the modeled requirement, regardless of whether this button was previously clicked. The actual state is rechecked after every configuration change.</p></div>
      ${a.submitted?`<div class="${currentPass?"v12-evidence":"v12-errors"}"><h3>${currentPass?"Configuration currently meets the limited requirements":"Current configuration no longer meets every requirement"}</h3><p class="small">Original submission: ${a.passed?"passed":"incomplete"}; current state: ${currentPass?"all modeled checks still satisfied":"one or more checks need repair"}.</p><p>${n}/${m.steps.length} of the expected fictional state conditions are currently met.</p>
       ${completed.map((r,i)=>`<details style="margin:7px 0"><summary>${r.ok?"✓":"✕"} Step ${i+1}: ${esc(m.steps[i].title)}</summary><p>${esc(r.reason)}</p><p>Observed: ${esc(r.actual)}</p><p>At submission: ${a.results?.[i]?.ok?"met":"not met"}; now: ${r.ok?"met":"not met"}.</p>${m.steps[i].path?`<p><b>Expected:</b> ${esc(m.steps[i].expected)}</p><p><b>Common mistake:</b> ${esc(m.steps[i].pitfall)}</p><p><b>Recovery:</b> ${esc(m.steps[i].recovery)}</p>`:""}</details>`).join("")}
       ${!currentPass?`<button class="btn" data-action="v12-reopen" data-id="${m.id}">Continue correcting the configuration →</button>`:""}</div>${quizView(m,a)}`:
        `<div class="v12-layout"><div>${stepContent(m,a)}</div><aside class="v12-side"><div class="v12-coach"><b>${mode==="guided"?"Your instructor":mode==="practice"?"Independent practice with optional hints":"Independent exam assessment"}</b>
          <p>${mode==="guided"?"I will show the target screen, the exact action and why the setting matters. You must perform it. Use Check configuration before moving on.":mode==="practice"?"Practice using the business requirement. Reveal a hint only when needed. Your fictional configuration is checked just like the other modes.":"Use the business requirement, your knowledge and the fictional console. I will not reveal the expected configuration until you submit."}</p>
          <p class="small">The available controls are a simplified educational replica; real tenant validations and licenses vary.</p>
          <button class="btn" data-route="v9/signin">Explore sign-in decision consequences →</button></div></aside></div>`}
      <div class="panel" style="margin-top:16px"><h3>Document what you learned</h3><form id="v12-notes" data-id="${m.id}">
       <label class="field">Why were these controls required, what evidence did you inspect, and how would you undo an unsafe change?
         <textarea name="notes" rows="5" placeholder="I configured… because… I verified… A safe rollback would…">${esc(state().notes[m.id]||"")}</textarea></label><button class="btn primary" type="submit">Save evidence notes</button></form>
       <p class="small muted">Notes are not automatically certified as technically correct. Do not enter actual credentials or organization secrets.</p></div>${footer()}</div>`;
  }
  function openAction(m,a){
    const key=m.steps[a.step]?.check,actionFor={
      user:"new-user",guest:"new-guest",group:"new-group",member:"group-add-member",
      app:m.id==="contractor"&&!db.apps.some(x=>x.name==="Vendor Portal")?"new-app":"assign-app",
      license:"user-license",policy:"new-policy",whatif:"go-whatif",
      managed:"new-managed",grant:"assign-managed",reg:"new-reg",
      permission:"set-reg-permission",consent:"consent-reg",package:"new-package",review:"new-review"
    };
    return actionFor[key]||null;
  }
  function coach(){
    const active=state().last,a=get(active),m=find(active);
    if(!a||!m||a.submitted||a.mode!=="guided")return "";
    const step=m.steps[a.step],status=stepResult(m,a,a.step);
    const control=openAction(m,a);
    return `<section class="v12-coach" aria-label="Active in-console SC-300 instructor"><b>🧭 Practical mission coach · Step ${a.step+1}/${m.steps.length}</b>
      <h3>${esc(step.title)}</h3><p>${esc(replace(step.do,m,a))}</p>
      <div class="v12-why"><b>Why:</b> ${esc(step.why)}</div><div class="v12-why"><b>Look for:</b> ${esc(step.observe||"Open the corresponding fictional configuration screen.")}<p><b>Expected:</b> ${esc(step.expected||"Confirm the saved record matches the task.")}</p></div>
      <p class="small">${status.ok?"✓ Current saved fictional state meets this condition.":"Current fictional configuration does not yet satisfy this condition."}</p>
      <div class="flex wrap">${control?`<button class="btn primary" data-action="v12-coach-open" data-id="${m.id}">Open ${esc(control.replace(/-/g," "))} form →</button>`:""}<button class="btn" data-action="v12-coach-check" data-id="${m.id}">Check this step</button><button class="btn" data-route="v12/mission/${m.id}">Return to instruction and advance →</button><button class="btn xs" data-action="v12-coach-hide">Close coach</button></div></section>`;
  }
  function results(){
    const hist=[...state().history].reverse();
    return `<div class="page v12-main">${css}<div class="eyebrow">LEARNING EVIDENCE · NOT CERTIFICATION</div><h1>Connected mission practice history</h1><p>Each attempt is evaluated against the current fictional tenant at submission. A new attempt code prevents a stale preexisting record from satisfying requirements accidentally.</p>
      <div class="panel"><div class="scrolltable"><table class="ptable"><thead><tr><th>Mission</th><th>Date</th><th>Mode</th><th>Outcome</th></tr></thead><tbody>${hist.length?hist.map(h=>`<tr><td>${esc(find(h.id)?.title||h.id)}</td><td>${esc(h.time)}</td><td>${esc(h.mode)}</td><td>${h.passed?"Simulated configuration passed":"Not passed"}</td></tr>`).join(""):'<tr><td colspan="4">No attempts yet</td></tr>'}</tbody></table></div></div>
      <div class="flex wrap"><button class="btn primary" data-route="v12/missions">Return to connected missions →</button><button class="btn" data-action="v12-export">Export mission evidence JSON ↓</button></div>${footer()}</div>`;
  }
  const oldShell=shell,oldRender=render,oldAction=action;
  shell=(content,where)=>oldShell(content,where).replace('<div class="sidefoot">','<div class="sectioncap">SC-300 · Do the real work</div><button class="navitem" data-route="v12/missions"><span class="navicon">◉</span>Connected hands-on missions</button><div class="sidefoot">');
  render=()=>{
    const r=current();
    if(r==="v12/missions"||r==="v12/results"||r.startsWith("v12/mission/")){
      const m=find(r.split("/").at(-1));
      const content=r==="v12/missions"?hub():r==="v12/results"?results():m?mission(m):"<div class='page'><h1>Mission not found</h1></div>";
      $("root").innerHTML=shell(content,r);document.title="Identity Architect · Connected Missions";
      lastRenderedHash=location.hash;window.scrollTo(0,0);return;
    }
    oldRender();
    if(r.startsWith("portal/")&&state().last&&get(state().last)?.mode==="guided"&&!get(state().last)?.submitted){
      const host=document.getElementById("portalContent");
      if(host&&!host.querySelector(".v12-coach"))host.insertAdjacentHTML("afterbegin",css+coach());
    }
    if(r==="v8/academy"||r==="v11/clinics"){
      const target=document.querySelector(".v8-hero,.clinic-banner");
      if(target&&!target.querySelector('[data-route="v12/missions"]'))target.insertAdjacentHTML("beforeend",'<div style="margin-top:14px"><button class="btn primary" data-route="v12/missions">Practice connected real-work missions →</button></div>');
    }
  };
  action=(name,el)=>{
    const m=find(el?.dataset?.id);
    if(name==="v12-start"&&m){const mode=el.dataset.mode;start(m,mode==="exam"?"exam":mode==="practice"?"practice":"guided");return;}
    if(name==="v12-hint"&&m){const a=get(m.id),i=Number(el.dataset.index);if(a?.mode==="practice"&&!a.submitted&&i>=0&&i<m.steps.length){a.hiddenHint=a.hiddenHint||{};a.hiddenHint[i]=!a.hiddenHint[i];save();render();}return;}
    if(name==="v12-check"&&m){check(m,Number(el.dataset.index));return;}
    if(name==="v12-next"&&m){next(m,1);return;}
    if(name==="v12-previous"&&m){next(m,-1);return;}
    if(name==="v12-submit"&&m){submit(m);return;}
    if(name==="v12-reopen"&&m){const a=get(m.id);a.submitted=false;a.step=all(m,a).findIndex(x=>!x.ok);if(a.step<0)a.step=0;save();render();return;}
    if(name==="v12-goto"&&m){const a=get(m.id),i=Number(el.dataset.index);if(a&&!a.submitted&&i>=0&&i<m.steps.length){a.step=i;save();render();}return;}
    if(name==="v12-coach-open"&&m){
      const a=get(m.id),control=a&&openAction(m,a);
      if(control&&a?.mode==="guided"){
        const u=db.users.find(x=>x.name===labNames(m,a).USER);
        portalAction(control,{dataset:{id:control==="user-license"?u?.id:""}});
      }
      return;
    }
    if(name==="v12-coach-check"&&m){const a=get(m.id);if(a)check(m,a.step);return;}
    if(name==="v12-coach-hide"){state().last=null;save();render();return;}
    if(name==="v12-copy"&&m){const a=get(m.id);if(a&&navigator?.clipboard?.writeText)navigator.clipboard.writeText(labNames(m,a)[el.dataset.key]||"").then(()=>toast("Copied training name","good")).catch(()=>toast("Select and copy the visible name instead","bad"));return;}
    if(name==="v12-export"){downloadText("identity-academy-connected-missions.json",JSON.stringify({schema:"identity-academy-v12",at:new Date().toISOString(),missions:state()},null,2));return;}
    oldAction(name,el);
  };
  document.addEventListener("click",event=>{
    const x=event.target.closest("[data-v12-open]");if(!x)return;
    const a=get(x.dataset.v12Open),m=find(x.dataset.v12Open);
    if(a&&m){state().last=a.mode==="guided"?m.id:null;if(db.v8)db.v8.coach=null;if(db.v11)db.v11.coach=null;save();}
  },true);
  document.addEventListener("submit",event=>{
    const form=event.target;if(form?.id==="v12-quiz"){
      event.preventDefault();const m=find(form.dataset.id),idx=Number(form.dataset.index),picked=new FormData(form).get("answer");
      if(m&&picked!==null)quiz(m,idx,Number(picked));
    }
    if(form?.id==="v12-notes"){
      event.preventDefault();state().notes[form.dataset.id]=String(new FormData(form).get("notes")||"").slice(0,5000);save();toast("Training evidence saved locally","good");
    }
  });
  window.__V12_TESTS={getMission:find,getAttempt:get,stepResult,all,stillValid,labels:labNames};
})();
