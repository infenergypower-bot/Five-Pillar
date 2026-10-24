# Accepted Build Mandate

Build **Five Pillar Client & Production OS** as a new, standalone application in this repository. Never modify, embed into, or couple this application to Infenergy Social Engine.

Act as principal architect, senior full-stack engineer, product designer, production operations director, financial systems architect, and security-conscious SaaS engineer. Make reasonable implementation decisions and proceed with working code rather than stopping at plans.

## Non-negotiable outcomes

1. Deliver a Railway-ready TypeScript modular monolith using Next.js, PostgreSQL, Prisma, server-side validation, role-based authorization, audit trails, and adapter-based integrations.
2. Implement a real persisted lifecycle: inquiry/lead → conditional intake → quote → proposal → approval → project → production → invoice/payment status → delivery/reporting.
3. Keep customer lifecycle, production lifecycle, and original entertainment workflows related but distinct.
4. Calculate currency with decimal-safe arithmetic. Margin is `price = all-in cost / (1 - target margin)`. Count all labor, overhead, subscriptions, generation attempts, contingency, and third-party costs exactly once.
5. Default to a 55% target margin, warn below target, and block ordinary approval below 50% without a permissioned, audited exception.
6. Never expose internal costs, credits, or margins to clients. Enforce tenant and client isolation server-side.
7. Never invent external integration success. Use outbox-based, idempotent adapters for Alphi AI, email, signatures, payments, storage, and generation providers.
8. Never collect social passwords or payment card data. Require approved OAuth/payment integrations.
9. Treat OpenArt pricing, package rates, subscriptions, labor rates, overhead, service tiers, and contract terms as administrator-configurable provisional data.
10. Build accessible, responsive, polished graphite/ivory/champagne/teal interfaces with useful empty, loading, validation, and error states. No dummy buttons may be represented as finished functionality.

## Delivery order

- **Foundation:** identity, permissions, organization isolation, CRM, intake, service catalog, decimal-safe quote engine, proposals, audit history.
- **Production:** projects, milestones, tasks, bibles, scenes, shots, assets, credits, reviews, revisions, change orders.
- **Commercial operations:** contracts, invoices, payments, subscriptions, client portal, notifications, reporting.
- **Advanced operations:** Alphi outbox adapter, original-IP budgeting/rights/recoupment, analytics, estimation improvements.

For each slice: model the data, implement server authorization and validation, build the complete interface, add tests for the business invariants, document configuration, and verify lint/test/build. Keep incomplete future capabilities explicitly labeled in the roadmap instead of simulating them.
