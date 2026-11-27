# Identity Academy — read-only evidence collector. No login, consent, resource creation or writes to Microsoft Graph.
# Run in a dedicated PowerShell process with an existing authorized delegated Microsoft Graph context.
# Inspect this script before use. Only run a selected exercise using already approved read-only scopes.
param(
 [Parameter(Mandatory=$true)][ValidateSet('profile','users','memberships','policies','signins','applications','roles','packages')][string]$Exercise,
 [Parameter(Mandatory=$true)][ValidatePattern('^[A-Z0-9-]{8,80}$')][string]$Challenge,
 [Parameter(Mandatory=$true)][guid]$ExpectedTenantId
)
$ErrorActionPreference = 'Stop'
$spec = @{
 'profile' = @{ Scope = 'User.Read'; Path = '/me?$select=id' }
 'users' = @{ Scope = 'User.ReadBasic.All'; Path = '/users?$top=10&$select=id' }
 'memberships' = @{ Scope = 'User.Read'; Path = '/me/memberOf?$top=10&$select=id' }
 'policies' = @{ Scope = 'Policy.Read.All'; Path = '/identity/conditionalAccess/policies?$top=10&$select=id,state' }
 'signins' = @{ Scope = 'AuditLog.Read.All'; Path = '/auditLogs/signIns?$top=10&$select=id,status' }
 'applications' = @{ Scope = 'Application.Read.All'; Path = '/applications?$top=10&$select=id,appId' }
 'roles' = @{ Scope = 'RoleManagement.Read.Directory'; Path = '/roleManagement/directory/roleAssignments?$top=10&$select=id,roleDefinitionId,directoryScopeId' }
 'packages' = @{ Scope = 'EntitlementManagement.Read.All'; Path = '/identityGovernance/entitlementManagement/accessPackages?$top=10&$select=id' }
}
$context = Get-MgContext
if (-not $context -or $context.AuthType -ne 'Delegated') { throw 'An existing authorized delegated Graph PowerShell session is required. This script does not sign in.' }
if ($context.TenantId -ne $ExpectedTenantId.ToString()) { throw 'Wrong tenant; stop and verify the intended authorized training tenant.' }
if ($context.Environment -ne 'Global') { throw 'Only global Microsoft Graph is supported by this training collector.' }
$task = $spec[$Exercise]
if ($context.Scopes -notcontains $task.Scope) { throw 'Required exact read-only scope is absent. Do not grant new consent merely for this exercise.' }
# Refuse any scope outside this deliberately narrow allowlist, including write/manage scopes.
$approvedScopes = @('User.Read','User.ReadBasic.All','Policy.Read.All','AuditLog.Read.All','Application.Read.All','RoleManagement.Read.Directory','EntitlementManagement.Read.All','openid','profile','email','offline_access')
if (@($context.Scopes | Where-Object { $_ -notin $approvedScopes }).Count -gt 0) { throw 'Use a separate approved read-only session; an unapproved scope is present.' }
$record = [ordered]@{ schema='identity-academy-tenant-read-v1'; exercise=$Exercise; challenge=$Challenge; observedAt=[DateTime]::UtcNow.ToString('o'); outcome='read-error'; sampleCount=0; morePages=$false; method='GET'; apiVersion='v1.0'; scope=$task.Scope }
try {
 $response=Invoke-MgGraphRequest -Method GET -Uri ('https://graph.microsoft.com/v1.0'+$task.Path) -OutputType Hashtable
 if ($Exercise -eq 'profile') { if (-not $response['id']) { throw 'Profile response has no ID.' }; $record.sampleCount=1 }
 else { if (-not $response.ContainsKey('value')) { throw 'Unexpected collection response.' }; $record.sampleCount=@($response['value'] | Where-Object { $_ -ne $null }).Count; if ($record.sampleCount -gt 10) { throw 'Unexpected sample size.' }; $record.morePages=[bool]$response['@odata.nextLink'] }
 $record.outcome='read-ok'
} catch {
 # Never export raw errors, request bodies, identifiers, tokens or account information.
 $record.outcome='read-error'; $record.sampleCount=0; $record.morePages=$false
}
$record | ConvertTo-Json -Depth 3
