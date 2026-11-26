/* Direct SC-300 official exam objective to relevant visual teaching links; never marks independent skill coverage complete. */
(function linkOfficialSkillsToLearning(){
 const prevRender=render;
 const hints=[
  [/administrative unit|microsoft entra roles|tenant properties|custom role|permissions/,"tenant-boundary"],
  [/external|b2b|cross-tenant|collaboration|guest/,"external-b2b"],
  [/connect sync|cloud sync|hybrid|password hash|pass-through|seamless single|ad fs|connect health/,"hybrid-sync"],
  [/passwordless|passkey|fido2|windows hello|temporary access pass|authentication method|password reset|certificate-based/,"passwordless-recovery"],
  [/identity protection|user risk|sign-in risk|risky|monitor sign-ins/,"risk-and-logs"],
  [/conditional access|authentication strength|session control|device compliance/,"ca-policy"],
  [/managed identit|workload identit|federated credential/,"managed-workload"],
  [/app registration|consent|api permission|graph permission|app-only/,"app-consent"],
  [/enterprise application|saml|open id|openid|oauth|single sign-on|application proxy/,"app-federation"],
  [/provisioning|scim|microsoft graph|powershell|monitor|diagnostic|audit|lifecycle workflow/,"scim-monitoring"],
  [/privileged identity|pim|eligible role|role activation/,"pim-operations"],
  [/access package|entitlement|access review|identity governance/,"governance-package"],
  [/user|group|license|security attribute|bulk|device join|device registration/,"user-lifecycle"]
 ];
 function best(s){
  if(!s||s.exam!=="SC-300")return null;
  const txt=(s.group+" "+s.skill).toLowerCase();
  const exact=hints.find(x=>x[0].test(s.skill.toLowerCase()))||hints.find(x=>x[0].test(txt));
  const l=exact?V8_LESSONS.find(y=>y.id===exact[1]):null;
  return l||null;
 }
 const linked=V7_SKILLS.filter(s=>!!best(s)).length;
 render=function(){
  prevRender();
  const r=current();
  if(r.startsWith("v7/skill/")){
   const id=r.slice("v7/skill/".length),s=V7_SKILLS.find(x=>x.id===id),l=best(s);
   if(!s||!l)return;
   const host=document.querySelector("#root .page");
   if(!host||host.querySelector("#v10-related-lesson"))return;
   const text=`<div id="v10-related-lesson" class="panel" style="margin-top:15px;border-left:3px solid #378bb7">
    <div class="eyebrow">Related learning · not independent mastery proof</div><h3>${safe(l.title)}</h3>
    <p class="small">This guided module is relevant to the official skill <b>${safe(s.skill)}</b>, but may cover only part of it. The official coverage row remains UNVERIFIED until hands-on proficiency and assessment evidence are independently checked.</p>
    <button class="btn primary" data-route="v8/learn/${l.id}">Learn this related skill →</button>
   </div>`;
   const caution=host.querySelector(".caution");
   if(caution)caution.insertAdjacentHTML("afterend",text);else host.insertAdjacentHTML("afterbegin",text);
  }
  if(r==="v8/academy"){
   const hero=document.querySelector(".v8-hero");
   if(hero&&!hero.querySelector('[data-route="v7/skills"]')){
    hero.insertAdjacentHTML("beforeend",'<div class="flex wrap" style="margin-top:12px"><button class="btn" data-route="v7/skills">Browse all 237 official exam skills →</button><a class="btn" href="./real-labs.html">Authorized real-tenant practice guide ↗</a></div>');
   }
  }
 };
 window.__v10CoverageBridgeCount=linked;
})();
