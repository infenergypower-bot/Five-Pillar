/* Synthetic Win32 fixtures. No installers or tenant operations are executed. */
(function(){'use strict';
const api=window.MD102ProceduresR6,add='https://learn.microsoft.com/en-us/intune/app-management/deployment/add-win32';
api.register({id:'app-detection',objective:'APP-069',title:'Detect the intended application',
 task:'Two fixtures: Atlas 2.0 is installed on PC-A and absent on PC-B. Make detection distinguish them.',
 terms:'STDOUT carries output; STDERR carries errors. Detection reports presence, not installer success.',
 steps:['Compare unconditional output with verified presence.','Change the exit code and error stream.','Inspect both fixtures.'],
 fields:[['test','Presence test',['always','verify']],['exit','Installed-case exit',['1','0']],['output','Installed-case STDOUT',['empty','present']],['error','STDERR',['empty','present']]],
 source:add,verify:'Detect PC-A without falsely detecting PC-B.',cleanup:'Reset these fixtures; nothing is installed.'},input=>{
 const signal=input.exit==='0'&&input.output==='present'&&input.error==='empty';
 const a=signal,b=signal&&input.test==='always';
 return {valid:true,pass:a&&!b,evidence:['PC-A detected: '+a,'PC-B detected: '+b,'Truth: PC-A installed; PC-B absent.']};
});
api.register({id:'app-dependency',objective:'APP-062',title:'Resolve an application prerequisite',
 task:'Atlas requires runtime R. Both are Win32 packages. Atlas is targeted; R is absent and not separately assigned.',
 terms:'A dependency is a prerequisite relationship.',
 steps:['Choose the relationship direction.','Set automatic installation.','Compare the execution trace.'],
 fields:[['relationship','Dependency',['none','R-needs-Atlas','Atlas-needs-R']],['automatic','Install dependency automatically',['no','yes']]],
 source:add,verify:'R installs before Atlas.',cleanup:'Reset the model. Preserve unrelated applications.'},input=>{
 const ready=input.relationship==='Atlas-needs-R'&&input.automatic==='yes';
 return {valid:true,pass:ready,evidence:ready?['Trace: install R, detect R, install Atlas.']:input.relationship==='Atlas-needs-R'?['R absent; automatic dependency installation disabled.','Atlas installation not attempted.']:['No usable prerequisite relationship for targeted Atlas.','Fixture installer fails because R is missing.']};
});
api.register({id:'app-upgrade',objective:'APP-062',title:'Upgrade without losing settings',
 task:'Atlas 1.0 is installed. The tested 2.0 installer upgrades it and preserves settings; the old uninstaller deletes those settings. Deploy 2.0 to the pilot while keeping settings.',
 terms:'Supersedence defines replacement. Targeting determines who receives the new app.',
 steps:['Make 2.0 supersede 1.0.','Choose whether to uninstall first.','Target 2.0 and inspect version plus settings.'],
 fields:[['target','2.0 assignment',['none','pilot-required']],['uninstall','Uninstall previous version',['yes','no']],['detection','2.0 detection',['version-1','version-2']]],
 source:'https://learn.microsoft.com/en-us/intune/app-management/deployment/configure-win32-supersedence',
 verify:'Version 2.0 is detected and the fixture settings survive.',cleanup:'Reset the fixture. Real rollback needs a tested installer and settings backup; removing targeting does not undo an upgrade.'},input=>{
 const applied=input.target==='pilot-required',preserved=!applied||input.uninstall==='no',version=applied?2:1,detected=version===(input.detection==='version-2'?2:1);
 return {valid:true,pass:applied&&preserved&&detected,evidence:['Installed version: '+version+'.0','Settings preserved: '+preserved,'New app detection: '+detected,...(!applied?['No assignment: supersedence does not initiate deployment.']:[])]};
});
render();
})();
