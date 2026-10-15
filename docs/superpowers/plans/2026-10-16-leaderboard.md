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

- [ ] Finish and publish the already-tested preparation arrow fix independently.
- [ ] Add run model and passive tracker tests: begin at setup; count every HP write; pause excluded; victory once; immutable equipment snapshot; track actual item execution; reject replaced HP arrays. Observe tests fail, implement, run focused tests.
- [ ] Add transport query tests for combined ranges/challenges/gear, ordering/pagination, config absence and submission retry. Implement timeout-bounded Supabase REST/Auth RPC with no private browser key. Provide SQL migration enforcing row shape, owner insert, immutable rows, category consistency and idempotency; document activation.
- [ ] Add hub UI with stable labelled filters, honest loading/error/empty states, equipment details, chapter navigation and voluntary result submission. Add browser coverage for query filters, details, absent config, mobile and keyboard; first observe failures, implement and verify.
- [ ] Integrate tracker at shared host boundaries, route hub from room, retain pause/restart/outcome paths. Run typecheck, focused units and preparation/leaderboard/production battle browser checks against a sequentially built artifact.
- [ ] Review changes, update HANDOFF, publish authorized frontend. Activate and verify live shared storage only after a real Supabase project is available; otherwise report that specific remaining dependency.
