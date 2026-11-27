/* Conservative source review; original documents remain unchanged. */
(function currency(){
'use strict';
const H=s=>esc(String(s??''));
const source=window.MD102SupportStudy,primary=window.MD102SourceLibrary;
if(!source||!primary)return;
const docs={
 graph:'https://learn.microsoft.com/en-us/powershell/microsoftgraph/migration-steps',
 map:'https://learn.microsoft.com/en-us/powershell/microsoftgraph/azuread-msoline-cmdlet-map',
 permission:'https://learn.microsoft.com/en-us/graph/permissions-reference',
 inventory:'https://learn.microsoft.com/en-us/graph/api/intune-devices-manageddevice-list?view=graph-rest-1.0',
 auth:'https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands',
 attach:'https://learn.microsoft.com/en-us/azure/virtual-desktop/app-attach-overview',
 cim:'https://learn.microsoft.com/en-us/powershell/module/cimcmdlets/get-ciminstance',
 updates:'https://learn.microsoft.com/en-us/windows/whats-new/',
 licensing:'https://learn.microsoft.com/en-us/intune/intune-service/fundamentals/licenses',
 portal:'https://learn.microsoft.com/en-us/intune/'
};
const rules=[
 {id:'legacy-graph',re:/\b(?:Connect-AzureAD|Get-AzureAD\w*|Set-AzureAD\w*|New-AzureAD\w*|Remove-AzureAD\w*|Connect-MsolService|Get-Msol\w*|Set-Msol\w*|New-Msol\w*|Remove-Msol\w*|Import-Module\s+(?:AzureAD(?:Preview)?|MSOnline))\b/i,title:'Legacy directory PowerShell',note:'AzureAD, AzureAD Preview and MSOnline are deprecated. Learn the underlying directory operation, then consult the official Graph migration and cmdlet map for an equivalent. Recheck permission and behavior; no automatic replacement is assumed.',url:docs.graph,more:docs.map},
 {id:'wmi',re:/\b(?:Get-WmiObject|Invoke-WmiMethod|Set-WmiInstance|Remove-WmiObject|wmic(?:\.exe)?)\b/i,title:'Historical Windows management commands',note:'Study the WMI management model, but distinguish Windows PowerShell 5.1-only cmdlets from current CIM cmdlets. Verify method semantics and support before choosing a replacement.',url:docs.cim},
 {id:'ise',re:/\b(?:PowerShell ISE|powershell_ise(?:\.exe)?)\b/i,title:'Legacy editor reference',note:'Windows PowerShell ISE is a Windows PowerShell editor, not a PowerShell 7 host. Study commands separately from editor-specific steps. Use a supported editor/runtime for modern work.',url:docs.cim},
 {id:'beta',re:/graph\.microsoft\.com\/beta\b|\b(?:Get|New|Update|Remove|Invoke)-MgBeta\w+\b/i,title:'Graph preview API',note:'Preview endpoints may change. Check whether the operation has a supported v1.0 endpoint, and verify schema and permissions before using beta. The managed-device inventory workbench uses the documented stable GET endpoint.',url:docs.inventory,more:docs.permission},
 {id:'credentials',re:/\b(?:client secret|password\s*[:=]|SkipPublisherCheck|Set-ExecutionPolicy|Global Administrator|Global admin)\b/i,title:'Privileged access, credentials or trust changes',note:'Do not reproduce shared lab credentials, broad roles, execution policy changes or trust bypasses in a real environment. Study the operation with a scoped test identity and approved authentication; never enter real secrets in the academy.',url:docs.auth},
 {id:'trial',re:/\b(?:free trial|start trial|activate trial|Azure subscription|create storage|Log Analytics workspace|Security Copilot capacity)\b/i,title:'Potential entitlement or consumption prerequisite',note:'The source assumes a provisioned lab or Azure service. Keep this exercise design-only unless an explicitly authorized existing environment and its cost boundary have been verified. No trial or billing change is needed to study.',url:docs.licensing},
 {id:'attach',re:/\b(?:MSIX app attach|MSIX App Attach|MSIX Packaging Tool|CimFS)\b/i,title:'AVD app packaging version-sensitive',note:'Use the currently documented App Attach workflow and supported image/identity formats for actual implementation. Historical host and package tooling can differ.',url:docs.attach},
 {id:'windows',re:/\b(?:Windows 10|Windows 11)\b/i,title:'Windows release and support applicability',note:'Check edition, supported release, lifecycle and enrollment requirements. Do not infer that a historical Windows 10 lab configuration is an appropriate production baseline.',url:docs.updates},
 {id:'danger',re:/\b(?:Remove-CimInstance|Remove-AzResourceGroup|Restart-Computer|wipe device|delete all resources|Delete Azure lab resources)\b/i,title:'Potentially disruptive operation',note:'Read and understand the target and effect. Do not execute cleanup, restart, removal or wipe operations against a real device or subscription for study. Simulate using disposable fictional records.',url:docs.portal}
];
function flags(md){let lines=String(md).split(/\r?\n/);return rules.map(r=>({...r,lines:lines.map((l,i)=>r.re.test(l)?i+1:0).filter(Boolean)})).filter(r=>r.lines.length)}
function panel(title,md){let list=flags(md);return `<section class="card"><div class="super">Source qualification · November 27, 2026</div><h2>Read with current-product context</h2><p>${H(title)} · ${list.length} categories flagged by a conservative text scan. These are review cues, not a line-by-line validation, and a document with no flags may still contain obsolete instructions. The source is preserved unchanged.</p>${list.map(r=>`<div class="concept"><b>${H(r.title)}</b><p>${H(r.note)}</p><p class="small">Source lines: ${H(r.lines.slice(0,12).join(', '))}${r.lines.length>12?' … ('+r.lines.length+' matches)':''}. <a href="${H(r.url)}" target="_blank" rel="noopener noreferrer">Current Microsoft reference ↗</a>${r.more?` · <a href="${H(r.more)}" target="_blank" rel="noopener noreferrer">Additional reference ↗</a>`:''}</p></div>`).join('')||'<p>No listed pattern was detected; still review prerequisites and current product documentation before performing anything.</p>'}<p class="small">No source commands are executed; pattern matching may produce false positives or miss wording variants.</p></section>`}
let prior=render;render=function(){prior();let r=String(state.route||''),c=$('content');if(!c)return;
if(r.startsWith('supp-source:')){let f=source.files.find(f=>f.id===r.slice(12));if(f)c.insertAdjacentHTML('afterbegin',panel(f.topic,f.markdown))}
else if(r.startsWith('source-task:')){let t=primary.lookup(r.slice(12));if(t)c.insertAdjacentHTML('afterbegin',panel(t.title,t.body))}
else if(r.startsWith('source-exercise:')){let id=r.slice(16),e=primary.labs.flatMap(l=>l.exercises).find(e=>e.id===id);if(e)c.insertAdjacentHTML('afterbegin',panel(e.title,e.body))}
else if(r==='supp-library'||r==='source-library')c.insertAdjacentHTML('afterbegin',`<section class="card"><h2>Current-product review layer</h2><p>Every imported supporting file and MD-102 task is scanned for legacy directory tools, WMI/editor references, Graph beta, privileges, possible costs, Windows version and disruptive operations. Matching source-line numbers and current Microsoft guidance are shown before you study. This is not comprehensive validation of all steps.</p></section>`);
};
window.MD102SourceCurrency={flags,rules,docs};render()
})();
