# Hammer of Justice Implementation Plan

> Execute inline with superpowers:executing-plans. Do not restart historical agents.

**Goal:** Port Chapter 4 encounter 160, with Susie's original solo battle and source attack progression.

**Architecture:** Add a Chapter 4 strategy and host, then focused Hammer modules. Shared combat code receives
named hooks only at source branch boundaries. No public source interpreter, archived events or approximate attacks.

**Tech stack:** Existing TypeScript runtime, Canvas renderer, Vitest source comparisons and headless Playwright.

**Spec:** Owner's request in this chat; `docs/HANDOFF.md` section 19j and the locally extracted Chapter 4 events.

## Constraints and responsibility inventory

The enemy alone has 16 events / 4448 lines, references 142 object names and calls 32 battle scripts. The local
dependency inventory is `.tools/hammer-audit.json`; it contains names and counts only and is not published.
No large existing module is being replaced. Before adding Chapter 4 cases, compare each shared object's original
Chapter 3 and Chapter 4 events; reuse a strategy only where that comparison demonstrates identical behavior.

- Entry/setup: encounter 160, type 105, HP 1350, AT 14, DF 0, enemy at view + (460,161), Susie alone.
  Hero positions are absolute (108,149); the original church room changes slot 0's x to 629.
  Preserve the source ACT setup's disabled Susie Check entry and its description array target.
  These belong in `bosses/hammer-of-justice/setup.ts`, installed by the future Chapter 4 host.
- Create: battle backdrop removal, invincibility ratio 0.5, visual/attack/phase timers, spell 11 unlock,
  flag 853's retry entry and persistent `justice_*` globals. These belong in the enemy/entry modules.
- Step: capped invincibility, soul speed 5, automatic FIGHT misses, progress rather than ordinary HP victory,
  dialogue/turn sequencing, Rude Buster reflection and Susie's reaction, phase/finale transitions.
  Split these into controller, dialogue, progression and attack scheduling modules.
- Draw/End Step: body/hair layers, transformations, effect targets, source blend modes and timing.
  Keep these in presentation modules; their allocations need matching source cleanup.
- Attacks: spear queue reset/append, directional and offset aliases, delayed spawning, blocking/diagonals,
  box rumble/movement, hammer/sword effects, final attack. Queue helpers belong in `spear-pattern.ts`;
  each projectile family retains its own Create/Step/Draw/collision lifecycle.
- Alarms/User events: preserve event order and deferred timers, not host timers or promises.
- Debug shortcuts: Ctrl progress completion and mouse wheel attack stepping are source-debug-only. Preserve
  that boundary; never expose them as normal public controls or publish their runs.
- Cleanup: restore spear-blocker origin (32,32), invincibility ratio 1, soul speed 4, and Kris/Susie/Ralsei
  party through the source lose/get-character sequence; restore charturn 3. No leaked surfaces or actors on retry/exit.
- UI/runtime: Chapter 4 menus, damage, spells, items, targeting, writer, game over, retry, audio and score timing
  need chapter parts. Existing Z/X/arrows, equipment, focus restoration and source-owned endings must remain intact.
- Publication: keep encounter 160 unavailable until a fresh battle reaches attacks, defeat/retry and victory
  in source comparisons and the actual Canvas renderer. A helper module is not a playable boss.

## Task 1 - Source setup and spear queue

- [x] Add failing comparisons against encounter/monster setup and both original spear scripts.
- [x] Port setup constants and queue helpers. Preserve array tails, caller `i`, argument count and alias quirks.
- [x] Scope the new boss folder to Chapter 4 in the asset builder; do not enable a public launch.
- [x] Run targeted tests and typecheck, review, then commit this independently testable starting point (70 tests passed).

## Task 2 - Chapter 4 host and shared parts

- [ ] Generate resource identity metadata with `tools/build-chapter-resources.mjs 4`.
- [ ] Compare source shared events and add explicit Chapter 4 strategies, text/gear and asset loading.
- [ ] Install Hammer entry/setup in a development-only host. Missing events must fail by name.
- [ ] Verify fresh solo Susie menus, every equipment path, game over and retry before attack work is accepted.

## Task 3 - Source battle controller and attacks

- [ ] Port Create, alarms/user events and controller progression with source-event tests first.
- [ ] Port attack families in dependency order from the local inventory, with full-state/RNG comparisons.
- [ ] Add the source Rude Buster/reflection, alternate healing and progress rules via named hooks.
- [ ] Port introduction, dialogue, finale, ending and Cleanup. Keep retry persistence source-faithful.

## Task 4 - Acceptance and release

- [ ] Record an isolated native reference without changing installed packages or stealing desktop focus.
- [ ] Replay all attack phases, collisions, reflection, defeat/retry and ending; inspect rendered frames.
- [ ] Test keyboard-only equipment/launch/retry/exit, scoring, old public bosses and sound timing.
- [ ] Enable public readiness only after acceptance. Build, audit publication files, deploy, verify live.
