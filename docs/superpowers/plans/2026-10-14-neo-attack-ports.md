# NEO attack object migration plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation and a fresh final review.

**Goal:** Replace NEO's archived attack-controller and flying-head execution with explicit TypeScript objects, preserving source events and frame/state parity.

**Architecture:** Keep GmRuntime and the shared soul, bullets, party and controller. Boss objects use source-derived event handlers and lazy canonical resource lookup; dependent attack objects can remain archived until their own migration. Unsupported developer routes keep named errors.

**Tech stack:** TypeScript, Vitest, local original-game oracle dumps and headless production browser tests.

**Spec:** docs/HANDOFF.md sections 2, 3 and 5.3.

## Constraints

- No archived GML, bytecode, dialogue or data.win in new files.
- Never alter the original installed game or the two unrelated encounter-15 scripts.
- Preserve source caller fields, RNG order, independent if branches and Destroy cleanup.
- Never exempt a newly ported object from full-state checks.
- Reuse the authorized feature checkout and push source to main; Pages publication is separate.

## Responsibility audit

| Object | Responsibilities and destination |
| --- | --- |
| obj_sneo_bulletcontroller | Create defaults and source resource references; attack-name counters and cached box bounds; timers; normal types 0/1/1.5/6/8.5/9/12; NEO slides, arm poses, face component timers, finale spawns; Destroy resets poses/heart state/position and tracks HP/mercy. All move to bullet-controller.ts with explicit event handlers. Existing non-normal type guard remains. |
| Canonical host | Resolve original object metadata, parents, depths and aliases; mark hand-written definitions non-archived. Register new factory output without copying engine code. |
| obj_sneo_guymaker | Create defaults, invisible maker; Step row RNG, spawn order and counters; Alarm 0 row reset and schedule. All move to flying-heads.ts. Developer difficulty 7 remains a named boundary. |
| obj_sneo_lilguy | Create bullet defaults; Step movement, room boundaries, rotation, tint and yellow-shot rectangle detection; Draw self; Alarm 0 direction, Alarm 1 soul targeting, Alarm 2 sprite; animationEnd freezes; pathEnd destroys; User 0 shot reactions, bombs, cut effect, caller afterimage and TP; yellow-shot collision. All explicit events move to flying-heads.ts; cut/doom dependencies remain canonical archived objects. |
| obj_sneo_lilguy_bullet | Step room bounds and post-Destroy rotation move to flying-heads.ts. Parent obj_basicbullet_sneo still supplies Create, Draw and inherited collisions until the next migration. |
| Acceptance | Both existing NEO recordings include all ported instance fields, RNG and entity traces. Focused tests cover source fields and rare timing/cleanup paths; browser verifies one full NEO turn. |

## Review focus

1. Timer-one cleanup must restore NEO and continue after Destroy where source does.
2. Full mercy shortens the enemy turn before attack-specific timers execute.
3. Face user event 0 may create more face instances; post-event adjustments must include them.
4. Cached box bounds must be computed from scaled sprite dimensions at first Step.
5. Random laser positions must evaluate y before x creation arguments and store handles as instance ids.

## Task 1: Normal-route bullet controller

- [x] Add a failing acceptance assertion that the canonical controller is non-archived; add lifecycle/rare-path tests using synthetic dependent objects.
- [x] Implement bullet-controller.ts, remove its pending stub, wire canonical registration and preserve normal-route guard.
- [x] Run focused tests and both full-state NEO recordings; fix source divergences without exemptions.

## Task 2: Flying-head family

- [x] Read every source event and record the full responsibility audit.
- [x] Add failing non-archived and source-event tests, then hand-port the maker, head and bullet.
- [x] Verify both NEO recordings and inherited projectile collision behaviour.

## Task 3: Acceptance and handoff

- [x] Run typecheck, full tests, production build and NEO browser turn.
- [x] Get a fresh review and reproduce/fix material findings with failing tests first.
- [x] Update handoff and ledger with exact coverage, then commit/push with co-author.

## Execution ledger

- Start: 7a140af. Only the two unrelated encounter-15 scripts are untracked.
- Ruling: the currently enabled archived controller already rejects types outside the NORMAL rotation. Preserve that supported route rather than silently enable developer/unused attacks.
- Existing recordings exercise type/difficulty pairs 0:1, 0:3, 1:0, 1.5:0, 1.5:2, 6:0, 8.5:0 and 12:0. Finale type 9 needs focused tests and a future ending recording.

- All four canonical objects are now non-archived. Old archived files remain for audit until all dependent attacks are migrated.
- Red-to-green checks caught a fifth-power ease-out sign mismatch and an old-registry alias gap: archived children inherited target 0 instead of party target 4. Canonical registration now aliases previous definitions as well as factory references.
- Full-state checks exposed an oracle VM bug: creation builtins overwrote game-owned creator after Create. Removed all four writes in the reviewed browser patch, updated its locked hash, rebuilt both shared and portable runtimes and re-recorded both NEO runs. Backed up 502 old recording files locally. No reference normalization or comparison exemption was added.
- Fourteen focused tests cover defaults, lifecycle, phonehand cleanup, mercy, face-created siblings, finale scale cycles, flying-head RNG/schedules, projectile targeting, charged shots, caller fields and continuation after Destroy.
- Fresh source review: no material findings. Final acceptance: typecheck passed; 377 tests across 43 files passed, including all 8 Chapter 1 runs and 3960 + 5960 NEO frames with ported full state; production build passed; both NEO and public PLAY/JEVIL browser checks passed (2 tests, 34.7 seconds).
- Source whitespace check excludes the patch's meaningful blank context lines. The reviewed patch passes git apply --check against the pristine pinned VM clone; both build manifests match its SHA-256 and tools-lock.json.
- Handoff updated. Source commit/push closes this milestone; Pages publication remains separate. Next: afterimage_cut, lerpvar, basicbullet_sneo and doom, then the remaining attack families and extra recordings.
