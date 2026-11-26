/* Contextual guided instructor shown while navigating simulated Entra administrative screens. */
(function enableTutor(){
 db.v6.activeTutor=db.v6.activeTutor||null;
 const oldRender=render,oldAction=action;
 document.addEventListener("click",function(e){
   const btn=e.target.closest('button[data-route^="portal/"]');
   if(!btn)return;
   const route=current();
   if(!route.startsWith("v6/lesson/"))return;
   const id=route.slice(10);
   const u=V6_UNITS.find(x=>x.id===id);
   if(!u)return;
   db.v6.activeTutor={id,at:db.v6.steps[id]||0};
   save();
 },true);
 function tutorMarkup(t){
   const u=V6_UNITS.find(x=>x.id===t.id);if(!u)return "";
   const index=Math.max(0,Math.min(t.at||0,u.steps.length-1)),s=u.steps[index];
   return `<section id="v6-teaching-coach" role="region" aria-label="Guided lab coach" style="border:2px solid #2782b9;background:#f0f8ff;border-radius:12px;margin:0 0 17px;padding:18px;box-shadow:0 6px 20px rgba(37,91,145,.1)">
      <div class="flex between wrap"><b style="color:#174b82">👩‍🏫 Guided lab instructor</b><span class="pill">Step ${index+1} / ${u.steps.length}</span></div>
      <h3 style="margin:13px 0 8px">${safe(s[0])}</h3><p>${safe(s[2])}</p>
      <div class="flex wrap" style="margin-top:10px">
      <button class="btn xs" data-action="v6-tutor-back" ${index===0?"disabled":""}>← Back</button>
      <button class="btn primary" data-action="v6-tutor-next" ${index===u.steps.length-1?"disabled":""}>Next guided step →</button>
      <button class="btn xs" data-action="v6-tutor-verify">Verify final configuration</button>
      <button class="btn xs" data-action="v6-tutor-finish">Return to lesson</button></div>
      <p class="small muted" style="margin:12px 0 0">Try the configuration yourself in the fictional controls below. Guidance does not automatically perform administrative actions. The final check tests the simulator state, not only navigation.</p>
   </section>`;
 }
 render=function(){
   oldRender();
   if(!current().startsWith("portal/"))return;
   let t=db.v6.activeTutor;
   if(!t)return;
   if(db.v6.activeChallenge?.mode==="exam"&&!db.v6.activeChallenge.finished)return;
   const content=document.getElementById("portalContent");
   if(!content)return;
   content.insertAdjacentHTML("afterbegin",tutorMarkup(t));
   const u=V6_UNITS.find(x=>x.id===t.id),step=u?.steps[t.at||0];
   if(step){let route=step[1].replace("portal/","");const target=document.querySelector('.portalnav button[data-page="'+route+'"]');if(target){target.style.outline="2px solid #2474ac";target.style.outlineOffset="1px";target.setAttribute("aria-label",target.textContent.trim()+" — current guided target");}}
 };
 action=function(a,el){
   if(!a.startsWith("v6-tutor-"))return oldAction(a,el);
   const t=db.v6.activeTutor;
   if(!t)return;
   const u=V6_UNITS.find(x=>x.id===t.id);
   if(!u)return;
   if(a==="v6-tutor-finish"){db.v6.activeTutor=null;save();go("v6/lesson/"+u.id);return;}
   if(a==="v6-tutor-verify"){oldAction("v6-check-lab",{dataset:{id:u.id}});return;}
   if(a==="v6-tutor-next"||a==="v6-tutor-back"){
     t.at=Math.max(0,Math.min(u.steps.length-1,(t.at||0)+(a==="v6-tutor-next"?1:-1)));
     db.v6.steps[u.id]=t.at;
     save();
     go(u.steps[t.at][1]);
     return;
   }
 };
})();
