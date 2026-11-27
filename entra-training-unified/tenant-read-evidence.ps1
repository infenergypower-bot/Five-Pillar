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
# Refuse sessions with common write scopes to reduce accidental misuse.
if (@($context.Scopes | Where-Object { $_ -match '(?i)ReadWrite|Write|Manage|FullControl' }).Count -gt 0) { throw 'Use a separate approved read-only session; this session contains write/manage scopes.' }
$record = [ordered]@{ schema='identity-academy-tenant-read-v1'; exercise=$Exercise; challenge=$Challenge; observedAt=[DateTime]::UtcNow.ToString('o'); outcome='error'; sampleCount=0; morePages=$false; method='GET'; apiVersion='v1.0'; scope=$task.Scope }
try {
 $response=Invoke-MgGraphRequest -Method GET -Uri ('https://graph.microsoft.com/v1.0'+$task.Path) -OutputType Hashtable
 if ($Exercise -eq 'profile') { if ($response['id']) { $record.sampleCount=1 } }
 else { $record.sampleCount=@($response['value'] | Where-Object { $_ -ne $null }).Count; $record.morePages=[bool]$response['@odata.nextLink'] }
 $record.outcome='read-ok'
} catch {
 # Never export raw errors, request bodies, identifiers, tokens or account information.
 $record.outcome='read-error'
}
$record | ConvertTo-Json -Depth 3
