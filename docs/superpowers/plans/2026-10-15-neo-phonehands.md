# NEO phone-hand migration

> Use superpowers:executing-plans inline, with one fresh final source review.

**Tech stack:** TypeScript, Vitest, original-game recordings, headless Playwright.

**Goal:** Replace the four archived phone-hand objects with explicit TypeScript events without changing the shared engine or observed battle behaviour.

**Spec:** docs/HANDOFF.md sections 2, 3 and 5.3; the owner's approved continuation of Claude's method.

**Architecture:** Ordered canonical host factories, the existing basic-bullet/regular-bullet parents, and source-required caller fields. Add a Chapter 2 bullet-inheritance script preserving -1 sentinels and element; leave Chapter 1's helper unchanged.

## Responsibility audit and destinations

| Object | Events and responsibilities moving to phonehands.ts |
| --- | --- |
| obj_sneo_phonehand_master (653) | Parent Create, child handles/positions/targets, source defaults and misspelt visibiliytimer; Step tint/graze reset, camera clamp/soul barrier, difficulty motion, firing thresholds/pose; Draw delayed fade; Alarm 0 head sprite; Destroy exits immediately; shot collision decrements HP, pushes head/hands, plays damage and consumes even charged shots. |
| obj_sneo_phonehand (655) | Parent Create and joint/crawl defaults; Step top/bottom joints, stretch recovery, alternating crawl and difficulty-2 orbit, sound bullets and difficulty-99 bursts; Draw fade, green joint lines/beads and persistent i=4. Parent supplies shot and soul interactions. |
| obj_sneo_phonehand_master_hurtbox (654) | Create bullet defaults/scale/element/grazed; empty End Step; user5 calls the shared single/all-party damage scripts and conditionally destroys, as the original. Other events remain inherited. |
| obj_sneo_mmx_spreadshot (656) | Parent Create then source bullet defaults and optional club-enemy damage; Step room bounds, continuation after Destroy, rotation and alarm flashes; Alarm 0 three regular bullets, persistent i/shot fields and inherited damage/target/sentinels; Draw yellow fog flash and decrement. |
| bulletInherit2 | Chapter 2 scr_bullet_inherit in chapter2-battle.ts: a live recipient keeps defaults when source fields are -1, resets eligible graze fields, always takes element. Required caller/recipient. |
| Canonical host | Register createNeoPhonehands after support and phonecall factories; retain previous-definition aliases and original metadata. |

No settings, shortcuts, UI state, external file writes or new dependencies. No game text, bytecode or decompiled source added. Archived files remain until all NEO families are migrated. Reuse the authorized feat/boss-battles checkout. Do not touch the two encounter-15 scripts.

## Review focus

1. Head collisions consume charged shots and push all hands; hurtbox user5 uses shared contact damage.
2. Top/bottom joint and mirrored scale changes preserve event order.
3. Fade and flash logic runs in Draw, not Step.
4. Spread-shot target -1 preserves regular-bullet default; graze points are overwritten by inheritance and element is copied.
5. Parent lookup uses migrated canonical definitions; alarm children retain instance counters and handles.

## Task 1: Port family and inheritance

- [x] Add tests through installNeoHost: require four non-archived definitions; child targets, fade, head push/HP and hurtbox damage, soul clamp, difficulty-2 bullets, joints, spread inheritance, flash and post-Destroy continuation.
- [x] Run focused tests; expected migration assertion failures on archived definitions.
- [x] Add phonehands.ts, bulletInherit2, host registration; preserve all source events and fields.
- [x] Run focused tests and both NEO recordings; expected zero mismatches without exemptions.

## Task 2: Acceptance and handoff

- [x] Run typecheck, full tests, Pages build and production NEO browser turn.
- [x] Fresh source review; reproduce/fix material findings with failing tests.
- [x] Update handoff and ledger, commit and push source with Codex co-author. Pages publication remains separate.

## Ledger

- Base 0442f22; baseline 379 tests passed in the preceding review. Existing architecture and migration scope were accepted by the owner; this continues that scope without a new subsystem.
- Source inventory: all 12 phone-hand event files and all 4 spread-shot event files read from local extracted original code. Metadata verified; nothing modifies the installed game.

- Focused migration tests first failed on archived definitions (11 failures), then passed after registration. Typecheck exposed test calls to a private runtime method; tests now invoke resolved public event definitions instead.
- The near--1 inheritance test failed before GML-tolerant comparison was added, then passed.
- Initial parity failed at 2815/2975: one extra yellow shot. Root cause was an implementation error when reading concatenated event files: the preceding Destroy/End Step exit was attributed to Collision/user5. Freshly re-extracted all 16 original events into local .tools/phonehands-original-20261015; every event matched both the archive and cache. Installed Chapter 2 package hash stayed 047c5ab003e3e017a709c02757e119c81e0327760169512110fd276b19241e68. No stale cache or game modification.
- Added failing regressions for head HP/charged-shot consumption/hand push and hurtbox contact damage, then restored the original handlers. The audit above was corrected to match the actual file boundaries. Future event reads must label each file explicitly.
- Existing recordings contain master/hands/spread at 2820–3040 (z) and 2980–3200 (menu); the hurtbox is covered by a focused test rather than these recordings.

- Task 1 complete: 12 focused tests and both full-state NEO runs pass (14 tests, 49.82 seconds), typecheck passes. No parity exemptions added. Final fresh review and full-suite/build/browser acceptance underway.

- Task 2 acceptance: all 391 tests in 44 files passed (73.01 seconds), typecheck passed, npm run build:pages passed, and production NEO/public PLAY browser checks passed (2 tests, 35.2 seconds). Yellow-soul screenshot inspected with party and bottom HUD intact. Build keeps the existing unused-sprite and large-chunk warnings; native files remain excluded.
- Fresh read-only review of all 16 events: no material correctness findings. Final: minor (deferred): difficulty-99 developer burst paths match the source but lack their own focused simultaneous-burst/RNG regression; normal-route and difficulty-2 coverage remain enabled.
- Final review's acceptance-check exclusion is resolved by the coordinator's fresh full-suite/build/browser evidence. Whole-game guarantees beyond the two recordings remain outside acceptance; no such guarantee is claimed.
- Handoff and ledger updated. Commit/push source with Codex co-author; Pages publication remains separate.
