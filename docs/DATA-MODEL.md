# Data model and dictionary

The Prisma schema is the authoritative field-level dictionary. This guide explains the aggregate boundaries.

## Identity and tenant security

- `Organization`: tenant, currency, timezone, and default margins.
- `User`: identity and primary system role.
- `Session`: hashed opaque session token, expiry, and revocation.
- `PasswordResetToken`: single-use hashed reset token.
- `MfaEnrollment`: encrypted-secret reference and hashed recovery codes.
- `LoginAttempt` and `RateLimitBucket`: durable authentication-abuse controls.
- `AccessRole`, `Permission`, `RolePermission`, and `UserRole`: configurable RBAC.

## Customer lifecycle

- `Lead`, `LeadStageHistory`, and `CrmActivity`: inquiry through won/lost with communication history.
- `Client`, `Contact`, `Brand`, and `Product`: account hierarchy.
- `QuestionnaireDefinition`, `QuestionnaireVersion`, `QuestionnaireSection`, `QuestionDefinition`, `QuestionOption`, and `QuestionCondition`: configurable intake definitions.
- `Intake`, `IntakeAnswer`, `ServiceSelection`, and `ProductionBrief`: resumable client discovery and its structured output.

## Catalog and estimation

- `ServicePackage` and `CatalogItem`: configurable commercial and marketing offers.
- `PriceBook` and `PriceBookItem`: effective-dated pricing.
- `LaborRole` and `LaborRate`: loaded internal labor cost.
- `MarginSetting` and `OverheadRule`: effective-dated financial controls.
- `Quote`, `QuoteVersion`, `QuoteLine`, `CostEstimate`, and `EstimateLine`: immutable quote versions and detailed internal estimates.
- `MarginOverride`: permissioned exception request and decision.

## Commercial operations

- `Proposal`, `ProposalVersion`, and `ProposalAcceptance`: client-safe offer and acceptance history.
- `Contract`, `ContractVersion`, and `PaymentSchedule`: agreement and configurable milestone terms.
- `Invoice`, `InvoiceLine`, and `Payment`: invoicing and provider reconciliation.
- `ServiceSubscription`: client retainer and recurring deliverables.

## Production

- `Project` and `ProjectTeamMember`: delivery aggregate and assignment.
- `Milestone` and `Task`: schedule, gates, hours, and capacity.
- `ProductionBible` and `ProductionBibleVersion`: versioned creative truth.
- `Scene`, `Shot`, and `Take`: cinematic plan and approved generation.
- `Review`, `ReviewComment`, and `Approval`: timecoded review and formal decisions.
- `RevisionRequest`, `ChangeOrder`, and `ChangeOrderLine`: included corrections versus paid scope change.
- `Deliverable`: rights-cleared final output and delivery status.

## Assets and rights

- `Asset`: object-storage metadata and scan/approval state.
- `AssetLink`: reuse within permitted entities.
- `AssetRight`: ownership, channel, territory, exclusivity, dates, and restrictions.

## Costs and AI generation

- `Subscription` and `SubscriptionAllocation`: real tool expense and transparent allocation.
- `ModelRate`: effective-dated provider/model credit rate.
- `CreditLedgerEntry`: allowance, consumption, purchases, and adjustments.
- `GenerationEvent`: attempt, status, expected/actual credits, and provider reference.
- `Expense`: planned/actual project or studio expense.

## Messaging, integrations, and automation

- `Notification` and `EmailMessage`: in-app messages and outbox-backed email.
- `IntegrationConnection` and `IntegrationOutboxEvent`: provider configuration references and idempotent handoffs.
- `BackgroundJob`: retryable asynchronous work.
- `AutomationRule` and `AutomationRun`: visible rule execution and override history.
- `AuditEvent`: actor, entity, before/after state, reason, and request metadata.

## Original entertainment

- `OriginalTitle`: internally or externally sponsored IP.
- `RightsRecord`: ownership and participation.
- `FinancingSource` and `FinancingContribution`: financing assumptions and received funds.
- `DistributionAssumption`: fees and distribution deductions.
- `RecoupmentTier`: waterfall order and basis.
- `FinancialProjection`: explicitly speculative break-even and target-margin scenarios.

## Relationship summary

An organization owns its users, accounts, catalog, pricing, projects, costs, IP, integrations, and audit history. A client may own multiple contacts, brands, products, intakes, quotes, projects, invoices, assets, and retainers. An accepted quote creates at most one project. Original titles can create projects without a client or external quote. Projects aggregate production, review, financial, and delivery records.
