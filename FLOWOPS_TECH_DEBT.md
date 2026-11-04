# FlowOps AI — Technical Debt & Product Backlog

**Status:** Working backlog, 2026-11-03. Based on the implementation discussed so far; verify against the repository before closing items. This is not a claim that every item is a confirmed bug.

## Priority guide
- **P0:** Security/data isolation/correctness; address before production or external demos with real users.
- **P1:** Reliability, maintainability, and core user experience; address before portfolio release.
- **P2:** Scalability and differentiated features; implement when the product requires them.

## P0 — Security and correctness

- [ ] **Audit tenant isolation across all endpoints.** Verify every organization/project/task lookup is constrained to the authenticated user's membership and the parent resource. Add negative cross-tenant API tests.
- [ ] **Complete role-aware UX without relying on it for security.** Owners/admins can create/manage tasks; assigned members can PATCH only `status`. Django permissions remain authoritative. Test 403/404 behavior for all actions.
- [ ] **Review JWT refresh-token concurrency.** Next.js `proxy.ts` refreshes near expiry; concurrent requests may rotate/blacklist the same refresh token. Design a race-safe strategy and test multiple tabs, navigation, and expiry.
- [ ] **Review expired-access-token logout.** Backend logout blacklisting can fail when the access token has expired. Ensure refresh-token revocation works independently of an unexpired access token, with appropriate authentication and CSRF protections.
- [ ] **Verify origin/CSRF controls for all cookie-authenticated mutation routes.** Ensure consistent same-origin checks, cookie flags, and failure handling.
- [ ] **Audit API input validation and error propagation.** Preserve Django validation errors safely; validate numeric route parameters, allowed filters/orderings, and request body sizes.
- [ ] **Check task permissions implementation.** `has_object_permission` currently implicitly returns `None` for denied cases; make `return False` explicit and add tests for member status-only updates and full edits.
- [ ] **Verify assignee belongs to the organization.** Backend serializer validates membership; keep it enforced on create/update and test cross-organization assignee IDs.

## P1 — Backend and frontend architecture

- [ ] **Add an organization detail endpoint.** Current workspace page loads the entire accessible organization list and finds the requested ID in memory. Add a tenant-scoped `GET /api/organization/<id>/` (or standardize paths) and use it on the detail page.
- [ ] **Standardize API naming.** Organization routes use singular `/api/organization/` while projects/tasks use plural `/api/organizations/...`; choose a consistent versioned convention when safe to migrate.
- [ ] **Fix Next.js 16 uncached-data navigation warnings.** Add Suspense boundaries around dynamic server data on `/organizations` and `/organizations/[organizationId]`; inspect parent layout if warnings persist. Keep private requests uncached unless an explicit tenant-safe caching policy is designed.
- [ ] **Refactor projects list to server-first fetching.** Replace initial client `useEffect` fetch with server data access, URL-based pagination, and mutation refresh. Maintain explicit loading/error boundaries.
- [ ] **Complete task UI.** Assignee selection from organization members; owner/admin role-aware controls; status-only edit for assigned members; robust errors, filtering, search, pagination, and empty states.
- [ ] **Fix stale form state after server refresh.** Project/task client forms may retain old values after `router.refresh()`. Prefer controlled editor lifecycles, server-provided version keys, or update from mutation response.
- [ ] **Review task timestamps.** `Task.created_at` and `updated_at` use `DateField`, so same-day edits are indistinguishable. Consider `DateTimeField` and migration before relying on version keys/audit chronology.
- [ ] **Handle task pagination edge cases.** Deleting the last task on a page, empty search results, invalid page numbers, preserving filters after mutations, and back/forward navigation.
- [ ] **Add structured API errors, logging, and observability.** Standardize error messages and request correlation IDs; avoid leaking sensitive internals.
- [ ] **Add automated tests and CI.** Django permission/tenant tests; API integration tests; frontend component/e2e smoke tests; lint, typecheck, build, migrations check.
- [ ] **Review database performance.** Query counts, select_related/prefetch_related, organization membership indexes, pagination, and N+1 behavior under realistic sample data.
- [ ] **Harden deployment configuration.** Environment secrets, CORS/CSRF, HTTPS, cookie flags, static files, database backups, and migrations/rollback.

## P1 — Product and design quality

- [ ] **Establish a cohesive SaaS design system.** Typography, contrast, accent colors, spacing, surfaces, tables, badges, cards, light/dark themes, responsive layouts, and accessible focus states.
- [ ] **Build a workspace-centric navigation model.** Clear breadcrumbs, project/task context, workspace switcher, meaningful sidebar IA, and mobile behavior.
- [ ] **Replace temporary browser confirmation dialogs with accessible confirmation dialogs.** Add success/error feedback and pending states.
- [ ] **Add meaningful dashboard KPIs.** Workload by status, overdue tasks, completion trends, assigned tasks, and project health; do not use fabricated metrics.
- [ ] **Seed realistic demo data and write a recruiter walkthrough.** Demonstrate multiple organizations, role restrictions, real workflows, and tenant isolation.

## P2 — Infrastructure and scale (not automatically required)

- [ ] **Evaluate Redis only for a measured need.** Candidate uses: caching frequently accessed non-sensitive aggregates, rate limiting, broker/backend for background jobs. Redis is *not* a prerequisite for a credible portfolio MVP.
- [ ] **Introduce a background job queue when automation needs asynchronous execution.** Compare Celery + Redis with simpler alternatives; include retries, idempotency, failure handling, and task visibility.
- [ ] **Consider safe tenant-aware caching.** Define invalidation, cache keys, permissions, and leakage tests before caching organization data.
- [ ] **Add rate limiting and abuse protection** to authentication, AI endpoints, and costly operations.
- [ ] **Add audit events** for membership changes, task updates, and automation actions.

## P2 — Differentiated FlowOps AI features

- [ ] **Workflow automation MVP.** Example: trigger on task status change or due date, evaluate conditions, create follow-up task/notification; add idempotency and execution history.
- [ ] **Organization-scoped document ingestion and RAG.** Free/local embedding model and vector storage (consider PostgreSQL + pgvector); enforce document-level tenant authorization, citations, and deletion.
- [ ] **AI-assisted operations.** Summaries, suggested next steps, blocker detection; require explicit user confirmation for mutations.
- [ ] **Operational reporting.** Real data, clear time windows, and explainable metrics.
- [ ] **Subscription/payments demo only if it advances portfolio goals.** Sandbox mode, no recurring costs, no unnecessary billing complexity.

## Suggested execution order

1. **Stabilize core flows:** navigation/Suspense warnings, organization detail API, role/tenant tests, task assignment and UI correctness.
2. **Design milestone:** polished workspace, projects, task management, and actionable overview dashboard.
3. **Differentiator milestone:** one complete automation flow with execution history.
4. **AI milestone:** organization-scoped document Q&A with citations and approved actions.
5. **Release milestone:** tests/CI, realistic demo seed, documentation, deployment and security review.

## How to maintain this file

Keep this at the repository root as `TECH_DEBT.md`. For each item, add an issue/PR reference and mark complete only after a reproducible test. Review at each milestone; don't blindly implement optional infrastructure merely because it appears on this list.
