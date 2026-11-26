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
const priorSync=syncDevice;
syncDevice=function(dev){
 if(!dev.enrolled)return priorSync(dev);
 // Capture the lifecycle of simulated policy evaluation; sync is distinct from deployment success.
 const before={compliant:dev.compliant,bitlocker:dev.bitlocker,installed:(dev.appInstalled||[]).slice()};
 const msg=priorSync(dev);
 const all=[...state.records.configuration.map(p=>({...p,category:'configuration'})),...state.records.security.map(p=>({...p,category:'security'})),...state.records.compliance.map(p=>({...p,category:'compliance'})),...state.records.apps.map(p=>({...p,category:'apps'}))];
 const applicable=all.filter(p=>applies(p,dev));
 const evaluations=[];
 const conflict=applicable.filter(x=>x.category==='configuration').some(p=>applicable.some(q=>q!==p&&q.category==='configuration'&&q.setting===p.setting&&q.value!==p.value&&q.value!=null));
 for(const pol of applicable){let status='Succeeded',reason='Assignment evaluated on simulated device sync';
  if(conflict&&pol.category==='configuration'){status='Conflict';reason='Incompatible configuration settings apply to the same device';}
  if(pol.category==='apps'){
   if(pol.platform&&pol.platform!==dev.platform){status='Not applicable';reason='Application OS does not match device OS';}
   else if(/incorrect|invalid|missing/i.test(pol.detection||'')){status='Failed';reason='Detection rule cannot verify expected installed artifact';}
   else if(pol.intent==='Available'){status='Available';reason='User must initiate optional installation';}
   else if(dev.issues?.includes('disk full')){status='Failed';reason='Insufficient disk capacity';}
  }
  if(pol.category==='compliance'){status=dev.compliant?'Compliant':'Noncompliant';reason=dev.compliant?'Requirements satisfied':'Device failed one or more required signals';}
  if(pol.category==='security'&&pol.type==='Disk encryption'&&pol.mode!=='Enforce'){status='Not configured';reason='Policy does not enable encryption in this simulation';}
  evaluations.push({id:pol.id,name:pol.name,category:pol.category,status,reason,checked:new Date().toISOString()});
 }
 dev.evaluations=evaluations;
 const installedApps=applicable.filter(p=>p.category==='apps'&&p.intent==='Required'&&!evaluations.find(x=>x.id===p.id&&x.status==='Failed'));
 dev.appInstalled=installedApps.map(p=>p.name);
 dev.issues=conflict?'Policy conflict detected':!dev.compliant?'Compliance requirements not met':evaluations.some(x=>x.status==='Failed')?'App installation failure':dev.updated?'None':'Update pending';
 dev.lastEvaluation=new Date().toISOString();
 state.v4.evalHistory[dev.id] ||= [];
 state.v4.evalHistory[dev.id].unshift({at:dev.lastEvaluation,before,after:{compliant:dev.compliant,bitlocker:dev.bitlocker,appInstalled:dev.appInstalled},outcomes:evaluations});
 state.v4.evalHistory[dev.id]=state.v4.evalHistory[dev.id].slice(0,10);
 state.v4.events.unshift({at:dev.lastEvaluation,type:'Device evaluation',detail:dev.name+': '+evaluations.length+' assignments evaluated'});
 state.v4.events=state.v4.events.slice(0,300);
 save();return msg;
};
window.MD102V4={version:V4VERSION,setupNorthstar,get objectives(){return window.MD102_OBJECTIVES||[]},get enterprise(){return state.v4},get data(){return state},evaluateDevice:(id)=>{let d=state.records.devices.find(x=>x.id===id);return d?syncDevice(d):'No device found'},getGroupMembers:(name)=>state.records.devices.filter(d=>matchesGroup(d,name)),audit:()=>({lessons:ACADEMY.lessons.length,missions:ACADEMY.missions.length,cases:ACADEMY.cases.length,legacyQuestions:ACADEMY.questions.length,devices:state.records.devices.length,users:state.records.users.length,objectives:window.MD102_OBJECTIVES?.length||0})};
setupNorthstar();
// Keep real navigation reachable from the entire console.
LEARN_NAV.push(['objectives','◎','Official objective matrix'],['workshop','⚒','Guided / independent workshop'],['practice-exams','◷','Advanced assessments'],['real-labs','▣','Authorized tenant labs']);
BLADE_GROUPS.academy[0][1].push(['objectives','Objective coverage'],['workshop','Practice workshop'],['practice-exams','Advanced exams'],['real-labs','Real tenant guide']);
const priorActiveArea=activeArea;
activeArea=function(){if(['objectives','workshop','practice-exams','real-labs','objective-detail'].includes(state.route)||String(state.route).startsWith('objective:'))return 'academy';return priorActiveArea()};
// This release intentionally does not enable any paid tenant, app, billing integration, or service.
})();