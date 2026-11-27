/* MD-102 Academy v4: enterprise practice engine extension. No Microsoft service calls. */
(()=>{'use strict';
const V4VERSION='4.0.0';
const deptNames=['Accounting','Engineering','Sales','Operations','HR','IT','Customer Support','Field Services','Design','Compliance'];
const places=['Houston','Chicago','Seattle','Atlanta','Denver'];
const platforms=['Windows','Windows','Windows','Windows','Windows','Windows','macOS','iOS/iPadOS','Android','Android'];
const first=['Avery','Morgan','Taylor','Jordan','Skyler','Parker','Quinn','Cameron','Casey','Riley','Drew','Jamie','Hayden','Alex','Ellis','Logan','Kendall','Noah','Robin','Blake'];
const last=['Chen','Brooks','Patel','Johnson','Reed','Washington','Nguyen','Thompson','Martinez','Singh','Morgan','Roberts','Wells','Bennett','Bailey','Williams'];
const shortID=(x)=>String(x).replace(/[^a-z0-9]/gi,'-').toLowerCase();
function setupNorthstar(){
  if(!state.v4) state.v4={};
  let v=state.v4;
  v.events ||= [];v.mastery ||= {};v.exams ||= [];v.quizHistory ||= [];v.objectiveNotes ||= {};v.missionResults ||= {};v.realtasks ||= {};v.tutor ||= {mode:'guide',step:0,mission:0};v.evalHistory ||= {};v.lastSearch ||= '';
  v.version=V4VERSION;
  if(!v.enterpriseSeeded){
    const u=state.records.users,d=state.records.devices,g=state.records.groups;
    for(let i=0;i<155;i++){
      let name=first[i%first.length]+' '+last[Math.floor(i/first.length)%last.length];
      if(u.some(x=>x.upn===shortID(name).replaceAll('-','.')+'@northstar.example')) name+=' '+i;
      u.push({id:'ns-u'+i,name,upn:shortID(name).replaceAll('-','.')+'@northstar.example',license:i%13===0?'None':i%8===0?'Microsoft 365 Business Premium':'Intune Plan 1',role:i%50===0?'Intune Administrator':'User',department:deptNames[i%deptNames.length],location:places[i%places.length]});
    }
    const groupSpec=[['Northstar - Accounting','Department:Accounting'],['Northstar - IT Pilot','Department:IT'],['Northstar - Engineering','Department:Engineering'],['Northstar - Field','Department:Field Services'],['Northstar - Corporate Windows','Corporate Windows'],['Northstar - iOS','iOS/iPadOS'],['Northstar - Android','Android'],['Northstar - macOS','macOS'],['Northstar - All Managed','All enrolled'],['Northstar - Pilot','Pilot'],['Northstar - Unmanaged','Unmanaged']];
    groupSpec.forEach(([name,rule],i)=>{if(!g.some(x=>x.name===name))g.push({id:'ns-g'+i,name,rule,description:'Northstar Technologies simulated dynamic population; membership is computed from device properties.'})});
    for(let i=0;i<210;i++){
      const platform=platforms[i%platforms.length],dept=deptNames[i%deptNames.length],location=places[Math.floor(i/10)%places.length];
      const tag=platform==='Windows'?'W11':platform==='macOS'?'MAC':platform==='Android'?'AND':'IOS';
      const enrolled=i%23!==0,owned=i%7!==0,bitlocker=i%8!==0&&i%30!==5,defender=i%9!==0,updated=i%11!==0;
      const name=tag+'-'+dept.slice(0,3).toUpperCase()+'-'+String(i+1).padStart(3,'0');
      d.push({id:'ns-d'+i,name,platform,department:dept,location,ownership:owned?'Corporate':'Personal',join:platform==='Windows'?'Entra joined':'Entra registered',mode:enrolled?'MDM enrolled':'Not enrolled',user:u[i%u.length].name,enrolled,bitlocker,defender,compliant:enrolled&&bitlocker&&defender,updated,issues:!enrolled?'Not enrolled':!bitlocker?'Encryption not enabled':!defender?'Endpoint protection missing':!updated?'Update pending':'None',lastSync:'Initial tenant seed',syncCount:0,osBuild:'10.0.26100',diskGB:256+i%4*128,appInstalled:[],updateStatus:updated?'Installed':'Update pending',managedBy:'Intune',pilot:i%19===0,simulated:true});
    }
    v.enterpriseSeeded=true;v.seededAt=new Date().toISOString();
    v.events.unshift({at:v.seededAt,type:'Seed',detail:'Added 155 fictional users, 210 fictional devices and 11 dynamic groups (existing data retained).'});
  }
  // Add choices to existing policy wizards without disturbing saved records or historic answers.
  Object.entries(schema).forEach(([key,item])=>{(item.fields||[]).forEach(field=>{if((field[0]==='group'||field[0]==='scope')&&Array.isArray(field[3])){
    ['Northstar - Accounting','Northstar - IT Pilot','Northstar - Engineering','Northstar - Corporate Windows','Northstar - Android','Northstar - Pilot','Northstar - All Managed'].forEach(name=>{if(!field[3].includes(name))field[3].push(name)});
  }})});
  save();
}
const priorMatches=matchesGroup;
matchesGroup=function(d,group){if(!group)return true;let g=state.records.groups.find(x=>x.name===group);if(g){let r=g.rule||'';
 if(r.startsWith('Department:'))return d.department===r.slice(11);
 if(r==='Corporate Windows')return d.platform==='Windows'&&d.ownership==='Corporate';
 if(r==='All enrolled')return !!d.enrolled;
 if(r==='Unmanaged')return !d.enrolled;
 if(r==='Pilot')return !!d.pilot;
 }
 return priorMatches(d,group)
};
const priorApplies=applies;
applies=function(policy,d){if(!priorApplies(policy,d))return false;
 if(policy.excludedGroup&&matchesGroup(d,policy.excludedGroup))return false;
 if(policy.minOS&&Number(d.osBuild?.replace(/\D/g,''))<Number(policy.minOS.replace(/\D/g,'')))return false;
 if(policy.ownershipFilter&&policy.ownershipFilter!=='All'&&d.ownership!==policy.ownershipFilter)return false;
 return true;
};
/* Deterministic teaching evaluator. No live Intune requests. Policy/device states are intentionally simplified. */
function evaluateSnapshot(device,records,eligible,now){
 const d=JSON.parse(JSON.stringify(device)),all=['configuration','security','compliance','apps','updates'].flatMap(category=>(records[category]||[]).map(p=>({...p,category}))),evaluations=[];
 if(!d.enrolled)return {device:d,evaluations:[],ok:false,reason:'Device is not MDM-enrolled'};
 if(d.online===false)return {device:d,evaluations:d.evaluations||[],ok:false,reason:'Device offline; no new check-in or policy result'};
 const assigned=all.filter(p=>eligible(p,d));
 const emit=(p,status,reason)=>evaluations.push({id:p.id,name:p.name,category:p.category,status,reason,checked:now});
 const config=assigned.filter(p=>p.category==='configuration'),groups=new Map();
 for(const p of config){const key=p.setting||p.name;let g=groups.get(key)||[];g.push(p);groups.set(key,g)}
 d.settings={...(d.settings||{})};
 for(const [key,policies] of groups){let vals=new Set(policies.map(p=>String(p.value??'Configured')));if(vals.size>1){for(const p of policies)emit(p,'Conflict','Different values for this setting; no new value applied.')}else{d.settings[key]=policies[0].value??'Configured';for(const p of policies)emit(p,'Succeeded','Applicable setting evaluated in the offline model.')}}
 for(const p of assigned.filter(x=>x.category==='security')){
  if(p.mode==='Audit'){emit(p,'Audit','Audit mode: no enforcing change in this model.');continue}
  if(p.mode!=='Enforce'){emit(p,'Not configured','No supported enforcing action configured.');continue}
  if(p.type==='Disk encryption')d.bitlocker=true;
  if(p.type==='Antivirus')d.defender=true;
  d.securitySettings={...(d.securitySettings||{}),[p.type]:'Enforced'};
  emit(p,'Succeeded','Applicable security configuration evaluated in the offline model.');
 }
 const checks=assigned.filter(p=>p.category==='compliance'),outcomes=[];
 for(const p of checks){let failed=[];if(p.requiresEncryption&&!d.bitlocker)failed.push('Encryption requirement failed');if(p.requiresDefender&&!d.defender)failed.push('Antivirus requirement failed');let ok=!failed.length;outcomes.push(ok);emit(p,ok?'Compliant':'Noncompliant',ok?'This policy’s modeled requirements are satisfied.':failed.join('; '))}
 // With no evaluated compliance policy, preserve the prior simulator status but report the absence of a fresh evaluation.
 if(checks.length){d.compliant=outcomes.every(Boolean);d.complianceEvidence=d.compliant?'Compliant':'Noncompliant'}else{d.complianceEvidence='No applicable policy evaluated'}
 const apps=assigned.filter(p=>p.category==='apps'),installed=new Set(d.appInstalled||[]),byApp=new Map();
 for(const p of apps){let key=p.name||p.id,arr=byApp.get(key)||[];arr.push(p);byApp.set(key,arr)}
 for(const [name,policies] of byApp){
  let intents=new Set(policies.map(p=>p.intent));
  if(intents.has('Required')&&intents.has('Uninstall')){for(const p of policies)emit(p,'Conflict','Required and Uninstall intents conflict in this training model.');continue}
  for(const p of policies){
   if(p.intent==='Available'){emit(p,installed.has(name)?'Succeeded':'Available',installed.has(name)?'Already installed.':'Optional app awaiting user action.');continue}
   if(p.intent==='Uninstall'){installed.delete(name);emit(p,'Succeeded','Explicit simulated uninstall removed the app.');continue}
   if(p.intent!=='Required'){emit(p,'Not configured','Unknown assignment intent.');continue}
   if(d.diskFull===true||/disk full|insufficient disk/i.test(String(device.issues||''))){emit(p,'Failed','Insufficient disk capacity.');continue}
   if(p.requiresRuntime&&d.runtimeInstalled===false){emit(p,'Failed','Required runtime absent.');continue}
   if(/incorrect|invalid|missing/i.test(String(p.detection||''))){emit(p,'Failed','Detection rule cannot verify the intended artifact.');continue}
   installed.add(name);emit(p,'Succeeded','Required application detected in this simulation.');
  }
 }
 d.appInstalled=[...installed]; // Assignment removal is not an uninstall.
 for(const p of assigned.filter(x=>x.category==='updates')){
  if(d.platform!=='Windows'){emit(p,'Not applicable','Windows update ring does not apply to this platform.');continue}
  if(d.updateBlocked===true){emit(p,'Failed','Simulated update eligibility/hold blocks completion.');continue}
  if(Number(p.qualityDeferral)<=2){d.updated=true;d.updateStatus='Installed';emit(p,'Succeeded','Eligible quality update installed in this training model.')}else{emit(p,'Pending','Deferral means the simulated quality update is not yet offered.')}
 }
 d.evaluations=evaluations;d.lastEvaluation=now;d.lastSync='Just now';d.syncCount=(d.syncCount||0)+1;
 d.issues=evaluations.some(x=>x.status==='Conflict')?'Policy conflict detected':evaluations.some(x=>x.category==='apps'&&x.status==='Failed')?'App installation failure':evaluations.some(x=>x.category==='updates'&&x.status==='Failed')?'Update blocked':!d.compliant?'Compliance requirements not met':d.updated?'None':'Update pending';
 return {device:d,evaluations,ok:true,reason:'Evaluated '+d.name+' (simulated)'};
}
syncDevice=function(dev){
 const before={compliant:dev.compliant,bitlocker:dev.bitlocker,installed:(dev.appInstalled||[]).slice()};
 const outcome=evaluateSnapshot(dev,state.records,applies,new Date().toISOString());
 if(!outcome.ok){log('Sync not completed: '+dev.name+'; '+outcome.reason,'Warning',dev.name,'Sync');return outcome.reason}
 Object.assign(dev,outcome.device);
 state.v4.evalHistory[dev.id] ||= [];
 state.v4.evalHistory[dev.id].unshift({at:dev.lastEvaluation,before,after:{compliant:dev.compliant,bitlocker:dev.bitlocker,appInstalled:dev.appInstalled},outcomes:outcome.evaluations});
 state.v4.evalHistory[dev.id]=state.v4.evalHistory[dev.id].slice(0,10);
 state.v4.events.unshift({at:dev.lastEvaluation,type:'Device evaluation',detail:dev.name+': '+outcome.evaluations.length+' assignments evaluated'});
 state.v4.events=state.v4.events.slice(0,300);
 log('Device sync: '+dev.name+'; '+outcome.evaluations.length+' assignments evaluated','Device',dev.name,'Sync');save();return outcome.reason;
};
window.MD102PolicyEvaluator={evaluateSnapshot};
window.MD102V4={version:V4VERSION,setupNorthstar,get objectives(){return window.MD102_OBJECTIVES||[]},get enterprise(){return state.v4},get data(){return state},evaluateDevice:(id)=>{let d=state.records.devices.find(x=>x.id===id);return d?syncDevice(d):'No device found'},getGroupMembers:(name)=>state.records.devices.filter(d=>matchesGroup(d,name)),audit:()=>({lessons:ACADEMY.lessons.length,missions:ACADEMY.missions.length,cases:ACADEMY.cases.length,legacyQuestions:ACADEMY.questions.length,devices:state.records.devices.length,users:state.records.users.length,objectives:window.MD102_OBJECTIVES?.length||0})};
setupNorthstar();
// Keep real navigation reachable from the entire console.
LEARN_NAV.push(['objectives','◎','Official objective matrix'],['workshop','⚒','Guided / independent workshop'],['practice-exams','◷','Advanced assessments'],['real-labs','▣','Authorized tenant labs']);
BLADE_GROUPS.academy[0][1].push(['objectives','Objective coverage'],['workshop','Practice workshop'],['practice-exams','Advanced exams'],['real-labs','Real tenant guide']);
const priorActiveArea=activeArea;
activeArea=function(){if(['objectives','workshop','practice-exams','real-labs','objective-detail'].includes(state.route)||String(state.route).startsWith('objective:'))return 'academy';return priorActiveArea()};
// This release intentionally does not enable any paid tenant, app, billing integration, or service.
})();