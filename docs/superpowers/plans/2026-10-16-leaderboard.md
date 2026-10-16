# Shared leaderboard implementation plan

> **For agentic workers:** Use superpowers:executing-plans task by task. Existing explicit authorization covers implementation and publication; Supabase activation requires owner-provided public project configuration.

**Goal:** Public per-boss scores with damage/time and equipment filters.
**Architecture:** Passive shared battle metrics, immutable run model, Supabase REST/RPC transport, separate leaderboard hub UI. Preserve encounter and preparation flows.
**Tech stack:** Existing TypeScript, DOM/CSS, Vitest, Playwright; Supabase Postgres/Auth REST without a new client dependency.
**Spec:** docs/superpowers/specs/2026-10-16-leaderboard-design.md

## Constraints

- Preserve source behavior, RNG order and chapter strategy rules. No boss-specific counters.
- No secrets, fabricated public data, native/practice submissions or local-only global-board fallback.
- Apply combined filters before pagination. Keep duplicate bag entries and actual participating members.
- Current untracked encounter15 scripts are unrelated and must remain untouched.

## Review focus

- Heal and damage in the same frame; overheal cap corrections and knockout overflow.
- Canceled item selection versus actual item execution, including a retained/replaced item.
- Missing configuration, timeout, stale query responses, duplicate submit and expired auth.
- Gear on absent characters and chapter-local item IDs.
- Empty filters, zero damage, bounds, mobile overflow and keyboard access.

## Tasks

- [x] Finish and publish the already-tested preparation arrow fix independently. Source c86f1c3, Pages 89c0e98; nine live browser tests passed (37.2 seconds).
- [x] Add run model and passive tracker tests: begin at setup; count every HP write; pause excluded; victory once; immutable equipment snapshot; track actual item execution; reject replaced HP arrays. Observe tests fail, implement, run focused tests.
- [x] Add transport query tests for combined ranges/challenges/gear, ordering/pagination, config absence and submission retry. Implement timeout-bounded Supabase REST/Auth RPC with no private browser key. Provide SQL migration enforcing row shape, owner insert, immutable rows, category consistency and idempotency; document activation. Thirteen API tests and seventeen PostgreSQL integration assertions passed. Owner applied migration and enabled anonymous auth; actual public reads and a genuine completed Lancer publication were verified.
- [x] Add boss-context modal UI with stable labelled filters, honest loading/error/empty states, equipment details and voluntary result submission. Add browser coverage for query filters, details, absent config, mobile, keyboard, persistent name and separate NEO modes. Ruling: owner corrected the location after initial implementation; retain original chapter hub and open from beside the selected boss instead. Eleven isolated browser tests passed.
- [x] Integrate tracker at shared host boundaries; retain pause/restart/outcome paths. Full 531-test suite passed; post-review configuration recovery added one more passing regression (all thirteen API tests passed). Typecheck and sequential Pages build passed. Production-browser acceptance is recorded in HANDOFF.
- [ ] Review changes, update HANDOFF, publish authorized frontend. Activate and verify live shared storage only after a real Supabase project is available; otherwise report that specific remaining dependency.
