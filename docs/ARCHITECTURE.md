# Application architecture

Five Pillar Client & Production OS is a standalone TypeScript modular monolith. It does not import from, deploy with, or share runtime state with Infenergy Social Engine.

## Runtime boundaries

- Next.js App Router renders the administrative and client experiences.
- Route Handlers form the authenticated HTTP boundary.
- Server services own authorization, validation, transactions, audit events, and client-safe DTO shaping.
- Prisma owns the PostgreSQL data model and migrations.
- Pure domain modules own pricing, intake completeness, authorization policy, workflow transitions, allocation, and financial projections.
- External actions pass through idempotent adapters and persisted outbox records.
- S3-compatible object storage holds approved uploads; PostgreSQL stores metadata and rights.

## Isolation and permissions

`Organization` is the tenant boundary. Every internal request resolves an active database session and organization before reading data. Client users are additionally constrained to one client. External collaborators are constrained to assigned projects.

Navigation visibility is convenience only. Authorization is repeated in every service and mutation.

Internal labor rates, model-credit economics, costs, profit, and margin must never be included in client DTOs.

## Financial invariants

- Currency calculations use `Decimal`.
- Selling price is `all-in cost / (1 - target margin)`.
- The default target is 55%, configurable by effective-dated settings.
- Ordinary approval is blocked below 50%.
- Only permitted roles may approve a below-minimum exception, and a reason and audit event are required.
- Subscription expense and included-credit value cannot both be charged for the same cost.
- Alphi infrastructure is excluded from standalone production unless the project actually uses it.
- Open invoices are not collected cash.
- Original-IP revenue is speculative and must be labeled accordingly.

## External action lifecycle

Email, signatures, payments, storage, Alphi, and generation providers receive stable idempotency keys. An adapter may return:

- `CONFIRMED` only with a provider identifier.
- `PENDING` when configuration or confirmation is unavailable.
- `FAILED` with an explicit retry classification.

No provider-dependent record becomes successful based only on an outbound request.

## Request lifecycle

1. Validate the HTTP payload with Zod.
2. Resolve and validate the database session.
3. Check role, organization, client, and project scope.
4. Execute the state change in a database transaction.
5. Write its audit event.
6. Enqueue external work if required.
7. Return a deliberately shaped DTO.

## Production topology

Railway runs one Next.js service and one PostgreSQL service. Object storage and external providers remain separate. Migrations run before deployment. `/api/health` is a fast liveness endpoint; `/api/ready` checks PostgreSQL readiness separately so a blocked database connection cannot stall liveness traffic.
