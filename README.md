# Five Pillar Client & Production OS

A standalone operating platform for Five Pillar Tech Ventures. It unifies CRM, conditional discovery, pricing, proposals, contracts, production, approvals, costs, payments, delivery, original entertainment, and controlled Alphi handoffs. It is intentionally separate from Infenergy Social Engine.

## Implemented capabilities

- Secure opaque database sessions, bcrypt credentials, durable login throttling, session revocation, password-reset records, and optional TOTP MFA.
- Organization, client, role, and project authorization enforced by server services.
- CRM for leads, stage history, clients, contacts, brands, products, and activity.
- Intelligent adaptive discovery with an administrator-configurable question bank, conditional branches, versioned/source-attributed answers, deterministic readiness gates, clarification recommendations, risk detection, verified answer reuse, uploaded-material extraction review, locked-decision impact analysis, and final client confirmation.
- Decimal-safe quote engine with labor, direct costs, subscriptions, overhead, contingency, discounts, OpenArt credits, and margin protection.
- Client-safe proposals, acceptance history, contracts, configurable payment schedules, invoices, and provider payment reconciliation.
- Projects, teams, milestones, tasks, production bibles, scenes, shots, takes, generation attempts, reviews, approvals, revisions, change orders, and deliverables.
- Rights-aware asset metadata and secure object-storage adapter boundaries.
- Managed-service subscriptions, allocation rules, model rates, credit ledger, expenses, and profitability reporting.
- Original-IP rights, financing, distribution assumptions, recoupment, and explicitly speculative projections.
- Idempotent outbox records and truthful adapters for email, signatures, payments, storage, generation, and Alphi.
- Railway Docker deployment, versioned Prisma migration, health check, and idempotent demonstration seed.

## Local setup

Requirements: Node.js 24 and PostgreSQL.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `APP_URL`, and `JOB_RUNNER_SECRET`.
3. Run `npm ci`.
4. Run `npm run db:generate`.
5. Run `npm run db:deploy`.
6. For local demonstration data only, run `npm run db:seed`.
7. Run `npm run dev` and open `http://localhost:3000`.

The local seed creates `founder@fivepillar.local` with password `ChangeMeImmediately!`. Change it before any shared use. The seed does not require MFA until the founder enrolls and verifies it.

## Validation

```text
npm run lint
npm test
npm run build
npm audit
```

`npm run check` runs lint, tests, and the production build.

## Adaptive discovery

The **Discovery & intake** workspace asks only questions activated by the selected
service and prior answers. Critical budget, deliverable, approval, rights, claims,
and production requirements are evaluated deterministically; clarification
recommendations supplement these rules but never bypass them.

Verified information generates versioned business, brand, audience, creative,
technical, script, character, scene, labor, pricing, readiness, and optional
Alphi payloads. Document-extracted values remain unverified until a client or
authorized staff member confirms them. Changes made after brief confirmation
create explicit impact records instead of overwriting locked production
decisions.

## Railway deployment

1. Create a new Railway project for this application.
2. Add PostgreSQL.
3. Configure every required variable from `.env.example`.
4. Deploy using `Dockerfile` and `railway.toml`.
5. Railway and the container startup both run the idempotent `prisma migrate deploy` command before the application starts.
6. Configure `/api/health` as the health endpoint.
7. Do not automatically seed production.

`/api/health` is the fast Railway liveness endpoint. `/api/ready` verifies PostgreSQL connectivity for operational readiness monitoring.

Set `DEMO_MODE=true` to expose the seeded workspace without a sign-in screen.
Demo mode supplies a read-only principal,
hides persistence controls, and rejects non-read API methods with HTTP 403.
The production container refreshes the idempotent demonstration dataset at startup only when demo mode is enabled.

For a new empty production database, set `BOOTSTRAP_ADMIN_EMAIL` and a temporary
`BOOTSTRAP_ADMIN_PASSWORD` of at least 14 characters, run
`npm run db:bootstrap-admin` once, and then remove both variables. This creates
only the Five Pillar organization, founder role, permissions, and founder user;
it does not load demonstration data.

## External providers

Provider operations remain pending until credentials are configured and a provider returns a durable external identifier. The application never reports a successful payment, signature, email, upload, generation, or Alphi synchronization merely because it attempted a request.

Required production integrations:

- S3-compatible object storage for approved files.
- Email delivery for proposals, notifications, and password recovery.
- Compliant e-signature provider.
- Payment processor; card data is never stored here.
- Optional Alphi API connection.
- Optional generation providers such as OpenArt.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA-MODEL.md)
- [Administrator guide](docs/ADMIN-GUIDE.md)
- [Production operations](docs/OPERATIONS.md)
- Live API index: `/api`

## Production safeguards

- Internal costs, credits, labor rates, profit, and margins are excluded from client responses and proposal PDFs.
- Quotes below the configured 50% minimum require a permissioned, reasoned, audited exception.
- Included credits and subscription cost are not counted twice.
- Standalone production excludes unrelated Alphi infrastructure.
- Unpaid invoices are not collected revenue.
- Publishing is never triggered solely by production approval.
- Original entertainment revenue assumptions are never represented as guaranteed.

## Configuration still required

Package prices, labor rates, overhead, subscription invoices, model-credit rates, managed-service tiers, contract language, retention policy, provider credentials, and actual OpenArt plan details are intentionally administrator-configurable and must be verified before selling or processing production work.
