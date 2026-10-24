# Administrator guide

## Initial production setup

1. Provision PostgreSQL and configure `DATABASE_URL`.
2. Generate independent high-entropy values for `AUTH_SECRET`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, and `JOB_RUNNER_SECRET`.
3. Run `npm run db:deploy`.
4. Run the seed only in a controlled environment.
5. Replace the local founder password immediately.
6. Verify the 50%, 55%, and 60% margin settings.
7. Verify labor rates, overhead, packages, contract terms, subscriptions, and OpenArt rates.
8. Configure S3-compatible storage before enabling uploads.
9. Configure provider adapters individually and test them in a non-production account.

The seed password is intentionally unsafe for shared deployment. Do not expose a seeded database publicly.

## Daily operations

- Start inquiries in **Leads** and record every material interaction.
- Convert qualified work into a client and versioned intake.
- Resolve required discovery gaps before fixed quoting.
- Build estimates from labor, direct costs, allocated subscriptions, overhead, contingency, and credit usage.
- Review margin warnings before requesting approval.
- Generate a client-safe proposal from an approved quote version.
- Do not start production until the configured agreement and deposit gates are met.
- Record approvals at their formal checkpoints.
- Classify revision requests before doing work.
- Create a change order for out-of-scope requests.
- Reconcile payment confirmations from the provider.
- Release final deliverables only after approval, rights clearance, and payment gates.

## Configurable provisional values

The package prices, OpenArt allowance and rate, labor rates, overhead, subscription allocations, managed-service tiers, and contract terms are planning assumptions. Administrators must verify them against actual agreements and invoices.

## Margin exception

A quote below the minimum cannot proceed through ordinary approval. A permitted founder or finance user must provide a material reason. The application stores the proposed margin, configured minimum, actor, decision, and audit event.

## Provider status

`PENDING` means the application preserved an intended external action but has not received provider confirmation. Never manually change pending email, signature, payment, generation, storage, or Alphi records to successful without verified evidence.

## Data lifecycle

- Revoke user sessions immediately when access changes.
- Retain financial and contractual audit history according to legal requirements.
- Remove expired object-storage access while preserving required metadata.
- Use targeted client deletion/anonymization procedures; do not delete shared financial records blindly.
- Test PostgreSQL restore procedures on a schedule.
