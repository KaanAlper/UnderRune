# Battle controller chapter parts implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline. Steps use checkbox syntax for tracking.

**Goal:** Preserve one battle engine while moving the controller's actual chapter differences into explicit parts and matching Chapter 2 controller state against the local original-game recordings.

**Architecture:** The shared controller owns lifecycle, input buffering, turn progression, damage delegation, enemy timing and victory. Chapter parts own command table differences and HUD/menu drawing; small differences use named script strategies. No second battle engine and no boss names in shared controller code.

**Tech stack:** TypeScript, GmRuntime, Vitest, local original-game recordings, Vite and headless Playwright.

**Spec:** `docs/HANDOFF.md`, sections 2, 3 and 5.2.

## Constraints

- No data.win, bytecode, archived GML or game dialogue in new source.
- Preserve caller fields, event ordering, RNG consumption and destroy-without-return semantics.
- Missing chapter parts throw named errors.
- Leave the two unrelated encounter-15 scripts untouched.
- Source pushes are authorized; this task does not deploy Pages.

## Responsibility audit and destinations

| Existing responsibility | Destination |
| --- | --- |
| Arrow/Z/X/C/Enter/Shift/Ctrl shortcuts, key buffers, command sounds | Shared controller and keys.ts; preserve exported APIs |
| Create: encounter setup, enemy event 12, hero positions/stats, TP bar | Shared controller; chapter preparation callbacks initialize extra tables and fields |
| Spell/item information, consumption, replacement and temporary inventory | Shared scripts dispatched by named chapter strategies; keep caller writes |
| Next/previous hero, ACT coordination, FIGHT/spell phase creation | Shared turn pipeline; chapter ACT callbacks; attackPress and spellPhase remain shared |
| Enemy timer, bullet cleanup, returning soul, Alarm 2 | Shared controller and existing onTurnEnd hooks |
| Victory rewards, hero poses, writer cleanup, exit room | Shared lifecycle with chapter reward/text strategy |
| Panel growth, selection matrix, party boxes, HP/TP | Chapter HUD parts; same runtime/drawing objects |
| Target, magic, ACT, item and ally menus | Chapter menu parts; original caller fields remain on controller |
| Portrait/writer depths including small-face descendants | Shared helper with chapter part extension |
| Boss-specific menu/HUD overrides | BattleHooks on boss definitions; never names in shared code |
| Host APIs (findController, attackPhase, nextAct, setHudMeasure), room result | Preserve signatures and host ownership |
| Configuration: flag 14 cursor memory, flag 34 merged menus, charauto/charmove, equipment, target state | Source-derived chapter scripts; preserve cancellation and unavailable actors |
| Error/loading boundaries, renderer absence in tests | Runtime contextual errors; explicit unported dependencies; no silent substitute |
| Draw_64 | Installed stock scr_debug returns zero; event has no active work |

## Review focus

1. Unsupported chapter must fail at dispatch rather than silently use Chapter 1.
2. Two-person/reordered parties must position and highlight the actual slot correctly.
3. Camera shake must move the HUD using the offsets computed before panel growth.
4. Selecting a command must preserve instance counters and per-hero bag propagation through slot 3.
5. Cancelled/disabled partner ACTs and merged spell menus must preserve source eligibility and cost checks.

## Task 1: HUD part and source state

- [x] Add focused controller tests for chapter dispatch, party coordinates, camera offsets and ACT row availability; run them and observe failure.
- [x] Add `controller-chapter2.ts` for Chapter 2 HUD drawing and source fields; retain Chapter 1 drawing through a `Record<number, ...>` dispatch.
- [x] Run the focused tests, then both NEO surveys and all Chapter 1 parity recordings.

## Task 2: Menu and turn strategies

- [x] Pin merged-menu/cancellation/temporary-item behaviour in tests before implementation.
- [x] Move Chapter 2 command differences into a menu part; remove direct chapter tests in shared controller scripts using named strategies.
- [x] Restore source caller fields in next/previous hero, end-turn, attack setup and turn reset.
- [x] Compare controller full state at every available dump; remove its pending exemption only after both recordings agree.

## Task 3: Acceptance

- [x] Run TypeScript, the complete unit/parity suite, Pages build and production browser battle checks.
- [x] Obtain a fresh whole-change review, fix material findings with a failing test first.
- [x] Update handoff with actual coverage and remaining explicit dependencies, commit with co-author and push source.

## Execution ledger

- Baseline: d8ed54a. Working tree clean except the two unrelated untracked scripts.
- Ruling: existing authorized feat/boss-battles checkout is reused; no additional checkout or engine copy.
- Baseline survey at frames 40-900: 17 controller fields differ in FIGHT replay, 40 in menu replay; traces agree. Full-state controller exemption stays until resolved.
- Ruling: original scr_endturn/mnendturn copy three item columns; scr_nexthero creates column 3 when commands finish. Do not replace all inventory loops with four columns.

- Task 1: complete. Four failing HUD tests passed; the controller remains shared and Chapter 2 has an explicit HUD part.
- Task 2: complete. Both recordings match all 9920 frames with all controller fields included. Caller-required spell-table and simultaneous-ACT helpers are wired through both hosts.
- Review: one P2 inventory input-order regression; failing simultaneous-left/down test reproduced it, then the fix passed. Final delta review has no further blocking/high/medium findings.
- Verification: full suite 361/42 passes; two additional boundary tests pass in the focused 33-test controller suite. Fresh Chapter 1 parity plus controller tests passed (37 tests), TypeScript and the Pages asset/build pipeline pass.
- Ruling: optional Japanese HUD, A-held preview, Noelle creation and level progression explicitly fail with named dependency errors; existing-recording acceptance must not be described as whole-game completion.
- Final acceptance: fresh NEO runs match 3960 + 5960 frames with full controller state; both production-browser tests pass (NEO complete turn and public PLAY/JEVIL), no native files requested.
