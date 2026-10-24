# Production operations

## Required gates

1. Discovery identifies missing creative, legal, asset, and financial requirements.
2. Quote approval enforces the configured minimum margin.
3. Proposal acceptance preserves the accepted version.
4. Contract and deposit conditions permit production.
5. Script and storyboard approvals advance production.
6. Approved master triggers final-payment workflow.
7. Confirmed final payment permits final delivery.
8. Delivery creates closeout and permitted follow-up work.

Every automated gate produces visible history and supports authorized, reasoned overrides.

## Railway deployment

- Deploy from the standalone Five Pillar repository only.
- Use the included Dockerfile.
- Run `npm run db:deploy` as the pre-deploy migration command.
- Set the liveness endpoint to `/api/health` and monitor `/api/ready` for database readiness.
- Keep at least one recent tested PostgreSQL backup.
- Do not run development seed data automatically in production.

## Validation

Run:

```text
npm ci
npm run db:generate
npm run lint
npm test
npm run build
```

Run migration validation against a temporary PostgreSQL database before promoting schema changes.

## Incident handling

- Authentication abuse: revoke sessions, inspect login attempts and rate-limit records, rotate affected secrets.
- Duplicate provider action: stop retries and reconcile by idempotency key and external ID.
- Payment discrepancy: keep invoice status unchanged until provider reconciliation is complete.
- Asset concern: block the asset, revoke signed access, and preserve scan and audit records.
- Queue failure: inspect explicit `lastError`, retry classification, attempt count, and availability time.
- Cost overrun: halt discretionary generation, compare planned and actual ledger records, and revise scope or obtain authorization.
