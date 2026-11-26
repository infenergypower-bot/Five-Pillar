/* 2026 Microsoft exam measured-subskill audit. Does not falsely certify mastery. */
(function installGranularAudit(){
 if(!Array.isArray(V7_SKILLS)||V7_SKILLS.length!==237)throw Error("Missing 237 official skills");
 db.v7=db.v7||{track:"SC-300",filter:"",page:0,proof:{},rubric:{},capstone:null};
 const previousShell=shell,previousRender=render,previousAction=action;
 const escape=s=>safe(String(s??""));
 const trackOptions=["SC-300","SC-900","SC-100","All"];
 function exportMatrix(){
  const cols=["Exam","Domain","Objective group","Official subskill","Official date","Related lesson","Visual demonstration","Guided lab","Independent practice","Troubleshooting","Exam questions","Evidence","Validation status","Source"];
  const rows=V7_SKILLS.map(s=>[s.exam,s.domain,s.group,s.skill,s.asOf,s.relatedUnit?`Related: v6/lesson/${s.relatedUnit}`:"None mapped",s.visual,s.guidedLab,s.independent,s.troubleshooting,s.questions,db.v7.proof[s.id]?.notes||"None","Not independently validated",s.source]);
  const csv=[cols,...rows].map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
  downloadText("identity-academy-2026-exam-subskill-audit.csv",csv);
 }
 const proof=(s)=>db.v7.proof[s.id]||{watched:false,guided:false,solo:false,notes:""};
 function summary(){
  let list=V7_SKILLS,withRelated=list.filter(x=>!!x.relatedUnit).length,self=list.filter(x=>proof(x).watched&&proof(x).guided&&proof(x).solo).length;
  return `<div class="grid4" style="margin-top:18px">
     <div class="panel"><div class="statnum">237</div><div class="statlabel">Official measured subskills</div></div>
     <div class="panel"><div class="statnum">${withRelated}</div><div class="statlabel">SC-300 skills with related lesson</div></div>
     <div class="panel"><div class="statnum">${self}</div><div class="statlabel">Self-reported practice complete</div></div>
     <div class="panel"><div class="statnum">0</div><div class="statlabel">Independently verified skills</div></div>
    </div>`;
 }
 function navHtml(){
  return `<div class="sectioncap">Exam readiness — detailed audit</div>
   <button class="navitem" data-route="v7/skills"><span class="navicon">▤</span>237-skill exam blueprint</button>
   <button class="navitem" data-route="v7/readiness"><span class="navicon">◩</span>Exam acceptance gates</button>`;
 }
 shell=function(content,where){return previousShell(content,where).replace('<div class="sidefoot">',navHtml()+'<div class="sidefoot">');};
 function listView(){
  let q=(db.v7.filter||"").trim().toLowerCase(),t=db.v7.track||"SC-300";
  let items=V7_SKILLS.filter(s=>(t==="All"||s.exam===t)&&(!q||[s.skill,s.domain,s.group].some(x=>x.toLowerCase().includes(q))));
  const pageSize=20,nPages=Math.ceil(items.length/pageSize)||1,page=Math.min(db.v7.page||0,nPages-1),shown=items.slice(page*pageSize,(page+1)*pageSize);
  return `<div class="page">
   <div class="eyebrow">Current official Microsoft Learn exam blueprint · 2026</div><h1>Every measured skill, no inflated coverage claims</h1>
   <p class="muted maincopy">This is the granular examination inventory V6 was missing: 98 SC-300, 58 SC-900 and 81 SC-100 subskills. Related lessons are reference links only. A completed click or self-report never establishes official skill mastery.</p>
   ${summary()}
   <div class="caution" style="margin:18px 0"><b>Coverage verdict: NOT VERIFIED.</b><p class="small">Each row is conservatively marked unverified until a detailed visual lesson, validated practical exercise, original exam assessment, and independent evidence all exist. All 237 rows currently remain unverified. Self-reported checkboxes are learning records, not external certification evidence.</p></div>
   <div class="panel"><div class="flex wrap between"><div class="pillrow">${trackOptions.map(x=>`<button class="btn ${x===t?'primary':''}" data-action="v7-track" data-track="${x}">${x}</button>`).join("")}</div>
   <button class="btn" data-action="v7-export">Export 10-field coverage CSV ↓</button></div>
   <form id="v7-search" class="flex wrap" style="margin:15px 0">
    <label class="field" style="flex:1">Find a measured skill<input name="keyword" placeholder="Try passkeys, hybrid identity, SAML, Azure policy…" value="${escape(db.v7.filter||"")}"></label>
    <button class="btn primary" type="submit">Find skill</button>
    <button class="btn" type="button" data-action="v7-clear">Clear</button>
   </form>
   <p class="small muted">${items.length} matching official subskills · Page ${page+1} of ${nPages}</p>
   <div class="scrolltable"><table class="ptable" style="min-width:620px"><thead><tr><th>Official measured skill</th><th>Related learning</th><th>Verification</th></tr></thead>
    <tbody>${shown.map(s=>`<tr>
     <td><div class="eyebrow">${s.exam} · ${escape(s.id)}</div><b>${escape(s.skill)}</b><div class="muted tiny">${escape(s.group)}</div></td>
     <td>${s.relatedUnit?`<button class="btn xs" data-route="v6/lesson/${s.relatedUnit}">Related guided unit →</button>`:'<span class="pill warning">Detailed unit missing</span>'}</td>
     <td><span class="pill warning">Unverified</span><br><button class="btn xs" style="margin-top:8px" data-route="v7/skill/${s.id}">Open skill record →</button></td>
    </tr>`).join("")}</tbody></table></div>
   <div class="flex wrap" style="margin-top:14px">
    <button class="btn" data-action="v7-prev" ${page===0?"disabled":""}>← Previous 20</button><button class="btn" data-action="v7-next" ${page>=nPages-1?"disabled":""}>Next 20 →</button></div>
   </div>${footer()}</div>`;
 }
 const suggested=s=>{const v=s.skill.toLowerCase();
  if(/\b(describe|define|explain)\b/.test(v))return "Explain this concept in your own words; distinguish it from two adjacent services; identify an example where it does NOT apply.";
  if(/\bdesign\b|\brecommend\b|\bplan\b|\bselect\b/.test(v))return "Create a diagram showing actors, trust boundaries, licensing and attack paths. Compare at least two viable designs, select one, and justify the tradeoffs and rollback.";
  if(/\b(monitor|investigate|report|troubleshoot|evaluate)\b/.test(v))return "Collect a sanitized log or decision record, form a hypothesis, reproduce or explain the failure, test a fix, and document before/after evidence.";
  return "In an authorized isolated tenant or clearly labeled simulator, perform the configuration; record input, expected behavior, observed behavior, role/license prerequisites, and a safe rollback. Repeat without prompts.";
 };
 function detailView(id){
  const s=V7_SKILLS.find(x=>x.id===id);
  if(!s)return `<div class="page"><h1>Skill not found</h1><button class="btn" data-route="v7/skills">Back to skills</button></div>`;
  const p=proof(s),axes=[["Visual demonstration",s.visual],["Guided lab",s.guidedLab],["Independent practice",s.independent],["Troubleshooting case",s.troubleshooting],["Mapped original questions",s.questions],["Verification evidence",s.evidence]];
  return `<div class="page"><button class="btn xs" data-route="v7/skills">← All official skills</button>
   <div class="eyebrow" style="margin-top:18px">${escape(s.exam)} · ${escape(s.id)} · ${escape(s.asOf)}</div>
   <h1>${escape(s.skill)}</h1>
   <p class="muted maincopy"><b>${escape(s.group)}</b> · ${escape(s.domain)}</p>
   <div class="caution"><b>Mastery status: NOT VERIFIED</b><p class="small">This objective is taken from Microsoft’s official study guide. Existing training related to the subject may help, but there is no verified evidence yet that it covers and tests the entire skill.</p></div>
   <div class="grid2" style="margin-top:18px"><div class="panel"><div class="eyebrow">UNDERSTAND · What this skill requires</div><p>${escape(s.skill)}</p>
   <p><b>What to demonstrate</b></p><p>${escape(suggested(s))}</p>
   <div class="pillrow">${s.relatedUnit?`<button class="btn primary" data-route="v6/lesson/${s.relatedUnit}">Open related guided lesson →</button>`:'<span class="pill warning">Dedicated visual lesson not developed</span>'}
    <a class="btn" href="${escape(s.source)}" target="_blank" rel="noopener">Microsoft Learn source ↗</a></div></div>
   <div class="panel"><div class="eyebrow">CERTIFICATION EVIDENCE · 10-field audit</div>
    ${axes.map(v=>`<div class="flex between" style="gap:8px;padding:10px 0;border-bottom:1px solid var(--border,#ddd)"><b class="small">${escape(v[0])}</b><span class="pill warning">${escape(v[1])}</span></div>`).join("")}
    <p class="small muted">A related lesson is not proof that this exam objective is taught completely. An audited assessment must exercise the actual decision or configuration.</p></div></div>
   <div class="panel" style="margin-top:18px"><h3>Personal study and evidence log</h3>
    <p class="muted small">This is a private, browser-local record of what you studied. It is not independently verified or transferable to your official certification profile.</p>
    <form id="v7-proof" data-skill="${s.id}">
     <label class="choice"><input type="checkbox" name="watched" ${p.watched?"checked":""}> I reviewed an explanation and relevant visual demonstration</label>
     <label class="choice"><input type="checkbox" name="guided" ${p.guided?"checked":""}> I attempted a guided relevant lab</label>
     <label class="choice"><input type="checkbox" name="solo" ${p.solo?"checked":""}> I independently practiced and documented outcomes</label>
     <label class="field">Evidence notes (do not paste passwords, tokens, tenant identifiers, or personal data)
      <textarea name="notes" rows="5" placeholder="Evidence, settings, expected vs actual result, troubleshooting and rollback…">${escape(p.notes||"")}</textarea></label>
     <button class="btn primary" type="submit">Save my study record</button>
    </form></div>${footer()}</div>`;
 }
 function readinessView(){
 const tCounts=["SC-300","SC-900","SC-100"].map(t=>({name:t,count:V7_SKILLS.filter(x=>x.exam===t).length,done:V7_SKILLS.filter(x=>x.exam===t&&proof(x).watched&&proof(x).guided&&proof(x).solo).length}));
 return `<div class="page"><div class="eyebrow">Independent acceptance criteria</div><h1>Readiness cannot be declared from a quiz score alone</h1>
  <p class="muted maincopy">Three different things are measured separately: whether the curriculum has complete content, whether the simulated lab behaves realistically, and whether you personally demonstrate mastery.</p>
  <div class="grid3">${tCounts.map(x=>`<div class="panel"><h3>${x.name}</h3><div class="statnum">0/${x.count}</div><p class="small muted">Verified subskills (of ${x.count})</p><p class="small">Self-reported practice: ${x.done} of ${x.count}</p><span class="pill warning">Not certification-ready</span></div>`).join("")}</div>
  <div class="panel" style="margin-top:18px"><h3>Required acceptance gates</h3>
   ${[
    ["Official coverage","Every measured subskill has full, accurate instructional content and a direct evidence mapping.",false],
    ["Real-world training","Applicable skills are configured and troubleshot in an authorized Microsoft test tenant, with license and safety review.",false],
    ["Assessment quality","Fresh, nonduplicative, domain-balanced original mocks and interactive scenarios have been independently reviewed.",false],
    ["Exam performance","Repeated independent fresh practice and official Microsoft AI Skills Navigator assessment with mistake review.",false],
    ["Device quality","Physical iPadOS Safari, desktop, accessible keyboard/touch, storage and failure-path verification.",false]
   ].map(a=>`<div class="flex wrap" style="border-bottom:1px solid #ddd;padding:14px 0"><span class="pill warning">Not verified</span><div style="flex:1"><b>${escape(a[0])}</b><p class="small muted">${escape(a[1])}</p></div></div>`).join("")}</div>
  <div class="caution"><b>Do not purchase an exam based solely on this application's readiness score.</b><p class="small">The official Microsoft study guide, authorized lab competence, and Microsoft’s current practice assessment remain the final external checks.</p></div>${footer()}</div>`;
 }
 render=function(){
  const r=current();
  if(r==="v7/skills"||r.startsWith("v7/skill/")||r==="v7/readiness"){
   $("root").innerHTML=shell(r==="v7/skills"?listView():r==="v7/readiness"?readinessView():detailView(r.slice("v7/skill/".length)),r);
   document.title="Identity Architect V6 · "+r.replace("v7/","");
   lastRenderedHash=location.hash;window.scrollTo(0,0);return;
  }
  previousRender();
 };
 action=function(a,el){
  if(a==="v7-track"){db.v7.track=el.dataset.track;db.v7.page=0;save();render();return;}
  if(a==="v7-prev"||a==="v7-next"){db.v7.page=Math.max(0,db.v7.page+(a==="v7-next"?1:-1));save();render();return;}
  if(a==="v7-clear"){db.v7.filter="";db.v7.page=0;save();render();return;}
  if(a==="v7-export"){exportMatrix();return;}
  previousAction(a,el);
 };
 document.addEventListener("submit",e=>{
  const form=e.target;
  if(form?.id==="v7-search"){e.preventDefault();db.v7.filter=new FormData(form).get("keyword")||"";db.v7.page=0;save();render();}
  if(form?.id==="v7-proof"){e.preventDefault();const v=new FormData(form),id=form.dataset.skill;db.v7.proof[id]={watched:v.has("watched"),guided:v.has("guided"),solo:v.has("solo"),notes:String(v.get("notes")||"").slice(0,2500)};save();toast("Study record saved on this device","good");render();}
 });
})();
