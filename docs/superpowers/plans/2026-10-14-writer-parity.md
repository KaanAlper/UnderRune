# Chapter 2 Writer Parity Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. No parallel edits to the shared engine.

**Goal:** Match the original Chapter 2 battle writer's execution and instance state while preserving all eight Chapter 1 recordings.

**Architecture:** A chapter part table dispatches the writer's create, alarms, format, draw, voice and page transitions. Shared callers keep the existing object identity. Chapter 1 behavior stays in its own part; Chapter 2 uses explicit TypeScript state and hooks without interpreted source bodies.

**Tech Stack:** TypeScript, GameMaker-compatible runtime, Vitest, local original-game oracle recordings.

**Spec:** docs/HANDOFF.md sections 2–5.

## Global Constraints

- English code, comments and commits; Turkish user updates.
- No archived GML, bytecode, data.win or literal game dialogue added to the repository.
- Use forChapter for version dispatch; missing versions throw.
- Preserve caller variables, instance loop counters, right-to-left RNG evaluation and event continuation after destruction.
- Keep strict instance reads and contextual event errors enabled.
- Do not execute the two unrelated encounter15 scripts.

## Responsibility Audit and Destination

- Create: font defaults, flags, dimensions, page strings, sounds, mini faces and effect arrays → chapter create part.
- Alarm 0: sound cadence, reveal position, newline/escape/pause codes, halt and reached-end state → chapter reveal part.
- Alarms 1/2: slower text sounds and first sound → chapter voice parts.
- Format: wrap counters, continuation indentation, portrait width, escapes and centering → chapter formatting part.
- Draw: input gates, portrait/voice/color/button/image/mini-face/choice codes, per-character effects, RNG and final counters → chapter draw part.
- Script helpers: text setup, voice, next page and aster continuation → caller-required helpers in the writer component.
- Small faces, portraits and balloon lifecycles → existing shared object boundaries; unavailable optional objects throw named errors.
- Battle text caller fields xx, yy, battlewriter and myface → unchanged public caller-required API.
- No storage, CLI or external lifecycle settings belong to this component.

## Review Focus

- Holding or mashing Z/X/C must preserve the original input buffer and page timing.
- Escaped control characters, explicit newlines and wrapping must preserve exact instance loop state.
- Destroying or advancing a writer inside Draw must still finish the event's remaining instructions.
- Unknown versions and optional unported objects must identify the failing path.
- Different voices/effects must preserve RNG and sound cadence across battle turns.

## Tasks

### 1. Version boundary and creation/reveal lifecycle
- [x] Record baseline state survey and inspect first writer dumps.
- [x] Add failing Chapter 2 creation, reveal, escape, buffer and continuation tests.
- [x] Introduce a chapter writer table, preserving Chapter 1 behavior.
- [x] Implement Chapter 2 creation and alarms with instance state.
- [x] Run writer tests and all Chapter 1 recordings.

### 2. Formatting, drawing and helper semantics
- [x] Add focused formatting/control/effect/page-transition tests before implementing their changes.
- [x] Implement Chapter 2 formatting and Draw; keep working variables on the instance.
- [x] Add Chapter 2 typer and voice parts using resource names, not game dialogue.
- [x] Verify both NEO recordings after each meaningful change; inspect state survey differences.

### 3. Full-state acceptance
- [x] Enable full-state comparison for obj_writer by removing only it from STATE_PENDING.
- [x] Resolve all writer mismatches without adding comparison exclusions.
- [x] Run typecheck, complete unit/parity suite and a production browser smoke test.
- [x] Review the final diff for chapter/boss branches, archived source, caller-state gaps and semantic shortcuts.
- [x] Commit with a Codex co-author trailer; update handoff progress truthfully.

Battle controller and archived NEO attack migrations remain separate subsequent tasks.

## Execution Ledger

- Baseline: 341 tests and both existing NEO recordings passed before editing; the survey exposed writer state gaps.
- Watched six lifecycle/input/reveal/effect/version tests fail, then added the chapter part and made them pass.
- Added three failing edge-case tests for small-face descendants, dialoguer camera offset and ordinary audio; fixed all three.
- Enabled writer state comparison with no additional comparison exclusions. Both complete NEO traces matched 3960 and 5960 frames after frame 40; all eight Chapter 1 traces remained green.
- Fresh review found an invalid ordinary-host Queen pitch handle; a failing regression test confirmed it. The fallback now uses the named sound handle.
- Ruling: installed scr_debug returns zero; no invented global debug toggle. An additional failing test confirmed the mismatch before correction.
- Ruling: optional Japanese, button-sprite and choice dependencies remain named unported boundaries, as required by the handoff; they are not exercised by the accepted English NEO recordings. Their ports remain follow-up work, not an implicit completion claim for all writer paths.
- Final verification: typecheck, Pages build, 352 unit/parity tests and two production-browser battle tests passed. Source changes and this ledger are committed together.

