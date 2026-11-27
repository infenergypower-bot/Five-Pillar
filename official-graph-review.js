/* Pattern-based original source study; not a PowerShell interpreter. */
(function scriptReview(){
'use strict';
const source=window.MD102SupportStudy;if(!source)return;
const H=s=>esc(String(s??''));
const B=(r,t)=>`<button type="button" class="btn" data-route="${H(r)}">${H(t)}</button>`;
const scripts=source.files.filter(f=>f.repository==="microsoft/mggraph-intune-samples"&&/\.ps1$/i.test(f.path));
const scopes={read:"Retrieves or inspects information; exact resource-specific read permissions still need validation.",write:"Creates, modifies, deletes, uploads, assigns or invokes an operation. Requires approved scope and exact current documentation.",local:"May change local files or perform local output work. Review path, content and overwrite behavior.",sensitive:"May process or disclose credential-like, recovery, passcode or identifying data. Do not execute or export for training.",logic:"Controls how data flows; verify conditions, types, errors and assumptions.",context:"Establishes runtime, module, authentication or permission context. Review dependencies and least privilege.",comment:"Nonexecuting comment in the source, subject to limited static recognition."};
const specific=[
[/New-MgDeviceManagementDeviceConfigurationAssignment\b/i,'write','Creates a device configuration assignment using the policy ID and target object. This is why the upstream Get_Assign sample is not read-only.'],
[/Get-MgDeviceManagementManagedDevice\s+-All\b/i,'read','Retrieves managed-device records and requests all pages through the SDK. Device inventory is separate from Entra directory device objects.'],
[/Get-MgDeviceManagementManagedDeviceUser\b/i,'read','Retrieves the supported user relationship for a selected managed-device resource. Verify the actual resource ID.'],
[/Get-MgBetaDeviceManagementAssignmentFilter\b/i,'read','Requests assignment-filter definitions through the beta SDK. Review version stability and pagination; these definitions do not prove applied policy.'],
[/Get-MgBetaDeviceManagementDeviceEnrollmentConfiguration\b/i,'read','Retrieves supported enrollment configuration objects; the filter narrows the selected resource family. This is not actual enrollment status.'],
[/Get-MgGroup\b/i,'read','Looks up an Entra group. Use the intended directory group object ID, not a guessed display name.'],
[/Get-MgDeviceManagementDeviceConfiguration\b/i,'read','Retrieves supported classic device-configuration resources; Settings Catalog uses different applicable resources.'],
[/New-Mg.*Assignment\b/i,'write','Creates a target relationship. A policy assignment changes intended targeting but does not prove device or app delivery.'],
[/\bInvoke-MgGraphRequest\b/i,'context','Calls a Graph REST resource. Inspect the method, URI, body, response handling and current permissions; dynamic variables can hide the actual operation.'],
[/\bConnect-MgGraph\b/i,'context','Establishes Graph SDK authentication context. The requested permission, consent and signed-in or app identity must be verified separately.'],
[/\bImport-Module\b/i,'context','Loads commands from the named PowerShell module. The module must be installed and supported; import does not establish Graph authentication.'],
[/\bFind-MgGraphCommand\b/i,'context','Discovers SDK command information and can help identify permission candidates; confirm exact endpoint requirements independently.'],
[/\b(?:ConvertTo-Json|ConvertFrom-Json)\b/i,'logic','Serializes objects into JSON or parses JSON into objects. Review nested fields, schema, types and depth.'],
[/\b(?:Export-Csv|Out-File|Set-Content|Add-Content|WriteAllBytes)\b/i,'local','Writes data to a file. Review selected properties, path, encoding, overwrite behavior and sensitive fields.'],
[/\b(?:activationLockBypassCode|passcodeReset|recoveryKey|enrollmentToken|clientSecret|accessToken|password)\b/i,'sensitive','Potentially sensitive field or credential-related value. Never copy actual values to study notes, screenshots, exports or reports.'],
[/\b(?:Remove|Set|Update|New|Add|Invoke|Reset|Clear|Sync|Restart|Stop|Start|Initialize|Register|Submit|Publish|Restore|Revoke|Grant|Disable|Enable)-Mg(?:Beta)?[\w-]+\b/i,'write','Graph cmdlet whose verb suggests a state-changing or action operation. Verify the actual cmdlet and its effect before any approved use.'],
[/\bGet-Mg(?:Beta)?[\w-]+\b/i,'read','Graph SDK retrieval command. Verify exact resource, API version, permission, filter support and result paging.'],
[/\b(?:Invoke-RestMethod|Invoke-WebRequest)\b/i,'context','HTTP request: inspect resolved method, destination, body, authorization and whether it sends or downloads sensitive content.'],
[/\b(?:-Method\s+["']?(?:POST|PATCH|PUT|DELETE)|method\s*=\s*["'](?:POST|PATCH|PUT|DELETE))\b/i,'write','HTTP method may modify resources or invoke an action, including creation of an asynchronous report-export job.'],
[/\b(?:Read-Host|Get-Credential)\b/i,'context','Requests interactive input. Inspect whether the expected value is an object ID, file path or secret; use only fictional inputs here.'],
[/\b(?:Get-Content|Get-Item|Get-ChildItem|Test-Path)\b/i,'logic','Reads or checks local content/path. Validate input location and avoid importing unrelated personal data.'],
[/\b(?:New-Item|Remove-Item|Copy-Item|Move-Item|Expand-Archive|Compress-Archive)\b/i,'local','Changes or prepares local files or folders. Scope the exact path and review overwrite or removal behavior.'],
[/\b(?:foreach|ForEach-Object)\b/i,'logic','Iterates over a collection; a subsequent operation may run once per input item, multiplying impact.'],
[/\b(?:if|elseif|else|switch)\s*[\({]/i,'logic','Branches on a condition. Inspect null, missing, unexpected and error cases; no successful result is assumed.'],
[/\b(?:try|catch|finally|throw|exit)\b/i,'logic','Controls error handling or script termination. Check whether errors are terminating, and how cleanup and failure reporting occur.'],
[/\b(?:Where-Object|Select-Object|Sort-Object|Group-Object|Measure-Object)\b/i,'logic','Filters, projects, sorts, groups or measures structured objects; inspect properties and whether the selected output is complete.'],
[/@(?:\{|\()/,'logic','Constructs a hashtable or array; identify keys, values, object types and how they are passed to later operations.'],
[/\$\w+\s*=/,'logic','Assigns a value or command output to a variable; follow later uses to understand the value and its lifetime.'],
[/\b(?:Write-Host|Write-Output|Write-Warning|Write-Error)\b/i,'logic','Outputs information or diagnostics. A displayed message alone does not prove a service operation succeeded.'],
[/\b(?:function|param)\b/i,'logic','Defines a reusable function or input parameters. Review validation, defaults and callers.']
];
function analyze(md){
 let block=false;const rows=String(md).split(/\r?\n/).map((line,i)=>{
  let t=line.trim().replace(/^\uFEFF/,'');let tags=[],why=[];
  if(block||t.startsWith('<#')){if(!t.includes('#>'))block=true;else block=false;return {n:i+1,line,kind:'comment',tags:['comment'],why:['Block comment; read as documentation, not an executable instruction.']}}
  if(!t)return {n:i+1,line,kind:'blank',tags:[],why:[]};
  if(t.startsWith('#'))return {n:i+1,line,kind:'comment',tags:['comment'],why:['Comment; it describes intended behavior but the executable source is authoritative.']};
  for(let [re,k,d] of specific){if(re.test(t)){if(!tags.includes(k))tags.push(k);if(why.length<4&&!why.includes(d))why.push(d)}}
  const rank=['sensitive','write','local','context','read','logic'];let kind=rank.find(k=>tags.includes(k))||'review';
  if(!why.length)why.push('Unclassified executable-looking text or continuation. Trace its surrounding expression or function before concluding its effect.');
  return {n:i+1,line,kind,tags,why};
 });
 return {rows,counts:Object.fromEntries(['write','read','local','sensitive','context','logic','review'].map(k=>[k,rows.filter(r=>r.tags.includes(k)||r.kind===k).length]))}
}
const st=()=>{state.scriptReview ||= {notes:{},read:{}};return state.scriptReview};
const by=id=>scripts.find(f=>f.id===id);
function panel(f){
 let a=analyze(f.markdown),interesting=a.rows.filter(r=>r.kind!=='blank'&&r.kind!=='comment'),kind=f.kind||'source-reference';
 let label=kind.includes('sensitive')?'Sensitive operation reference only':kind.includes('write')||a.counts.write?'Potential write/action operation — reference only':'Source review only';
 return `<section class="card"><div class="super">PowerShell source walkthrough · static inspection</div><h2>${H(f.path)}</h2><p><b>${H(label)}</b>. ${interesting.length} nonblank, noncomment lines reviewed by pattern-based cues. This is not a PowerShell parser, runtime, security audit or proof of the exact permissions. Some methods and effects are dynamic or hidden in functions; no source is executed.</p><p>Potential write/action matches: <b>${a.counts.write}</b> · read matches: <b>${a.counts.read}</b> · local-file matches: <b>${a.counts.local}</b> · sensitive matches: <b>${a.counts.sensitive}</b> · unclassified: <b>${a.counts.review}</b>.</p><p><a href="https://learn.microsoft.com/en-us/graph/permissions-reference" target="_blank" rel="noopener noreferrer">Current Graph permission reference ↗</a> · <a href="https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands" target="_blank" rel="noopener noreferrer">Authentication guidance ↗</a> · ${B('script-review','All Graph source walkthroughs')}</p><details><summary>Inspect every source line and its learning cue</summary><div class="tablewrap"><table class="datatable"><thead><tr><th>Line / source</th><th>Meaning and review cue</th></tr></thead><tbody>${a.rows.filter(r=>r.kind!=='blank').map(r=>`<tr><td><span class="small muted">${r.n} · ${H(r.kind)}</span><pre style="white-space:pre-wrap;overflow-wrap:anywhere;max-width:550px;font-size:12px">${H(r.line)}</pre></td><td>${r.why.map(q=>`<p>${H(q)}</p>`).join('')}</td></tr>`).join('')}</tbody></table></div></details><div class="concept"><h3>Explain it before use</h3><p>Identify authentication context, input types, the intended resource, each read/write operation, output destination, sensitive fields and failure handling. Do not enter secrets. This is self-assessed code review, not proof of permissions.</p><textarea data-graph-review-note="${H(f.id)}" rows="5" style="width:100%">${H(st().notes[f.id]||'')}</textarea><p><button type="button" class="btn" data-graph-review-read="${H(f.id)}">${st().read[f.id]?'Reviewed ✓ (undo)':'Record self-reviewed walkthrough'}</button></p></div></section>`;
}
function home(){
 return `<section class="card"><h1>Microsoft Graph script walkthroughs</h1><p>${scripts.length} original PowerShell samples across the imported functional folders. Each sample is available as preserved source, annotated with read/write/action, local operation, context, logic and sensitive-field cues. ${scripts.filter(f=>st().read[f.id]).length}/${scripts.length} self-reviewed. No script can execute from this interface.</p><p>${B('supp-library','Full source library')} ${B('repo-studio','Offline result-graded workbench')}</p></section>${[...new Set(scripts.map(f=>f.path.split('/')[0]))].map(group=>`<section class="card"><h2>${H(group)}</h2><div class="tiles">${scripts.filter(f=>f.path.startsWith(group+'/')).map(f=>{let a=analyze(f.markdown);return `<button class="tile" data-route="supp-source:${H(f.id)}"><b>${H(f.path.split('/').at(-1))}</b><p>${f.kind?.includes('sensitive')?'Sensitive reference':f.kind?.includes('write')||a.counts.write?'Potential state change':'Inspect source'} · ${st().read[f.id]?'Reviewed':'Not reviewed'}</p></button>`}).join('')}</div></section>`).join('')}`;
}
let prev=render;render=function(){let r=String(state.route||'');if(r==='script-review'){$('sidenav').innerHTML=navSidebar();$('bladenav').innerHTML=modernBladeNav();$('coachroot').innerHTML='';$('content').innerHTML=home();return}prev();let c=$('content');if(!c)return;if(r.startsWith('supp-source:')){let f=by(r.slice(12));if(f)c.insertAdjacentHTML('afterbegin',panel(f))}else if(['supp-library','curriculum','repo-studio','official-terminal'].includes(r))c.insertAdjacentHTML('afterbegin',`<section class="card"><h2>Learn Microsoft Graph samples line by line</h2><p>Inspect actual source statements, authorization context, data transformations, state-changing operations and sensitive output.</p>${B('script-review','Open Graph code walkthroughs')}</section>`)};
let old=activeArea;activeArea=function(){return state.route==='script-review'?'academy':old()};
try{LEARN_NAV.unshift(['script-review','▤','Graph code walkthroughs']);BLADE_GROUPS.academy[0][1].unshift(['script-review','Graph code walkthroughs'])}catch(e){console.warn(e)}
document.addEventListener('input',e=>{let el=e.target;if(!el.hasAttribute('data-graph-review-note'))return;let id=el.dataset.graphReviewNote;if(by(id)&&state.route==='supp-source:'+id){st().notes[id]=el.value.slice(0,8000);save()}});
document.addEventListener('click',e=>{let el=e.target.closest('[data-graph-review-read]');if(!el)return;let id=el.dataset.graphReviewRead;if(!by(id)||state.route!=='supp-source:'+id)return;st().read[id]=!st().read[id];save();render()});
window.MD102GraphReview={scripts,analyze,panel,home};st();render()
})();
