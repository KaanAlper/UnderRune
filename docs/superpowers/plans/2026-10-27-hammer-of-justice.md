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
- Cleanup: restore spear-blocker origin (32,32), invincibility ratio 1, soul speed 4, and the source
  lose/get-character sequence; restore charturn 3. That sequence retains slot zero and does not deduplicate.
  Do not force a different party in this event. No leaked surfaces or actors on retry/exit.
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

- [x] Generate resource identity metadata with `tools/build-chapter-resources.mjs 4`.
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

## Verified progress, 2026-10-27

- Resource identity metadata, path resource count 14, base stats, asset loading and a gated Chapter 4 registry
  are in place. A partial audit found significant controller/hero/writer/damage/spell differences from Chapter 3.
  Shared soul entry, green directional interception, buffering and grazing have explicit Chapter 4 versions.
- Hammer Create, alarms, User events, End Step bounds and CleanUp have source comparisons. User 0 builds the
  full source queue in six static blocks; all source-selected turns and 84 pattern IDs are tested.
- The full Step and Draw are static TypeScript ports split at source event boundaries. Their script integrations
  are explicit required interfaces. Tests cover child-script call timing and state, not a completed battle host.
  Dialogue text uses extracted keys. Public debug gates are disabled.
- The 64 source spear-dispatch branches, four/five/six argument semantics and six obj_spearshot events are
  ported. Projectile tests cover cardinal/diagonal blocks, parries, bouncing shells, fades, long notes, red
  hammers and the HP-dependent damage call. Actual Chapter 4 scr_damage is still an unimplemented integration.
- The shield, its pieces and just particles have full-state/RNG comparisons. Sprite origins are battle-local
  in the runtime and Canvas atlas adapter, including diagonal transformation and cleanup.
- Browser component tests render the actual Chapter 4 body, shield and live spears. A correct direction blocks;
  the opposite direction calls the damage boundary. No missing sprites occurred in these component tests.
  These fixtures have explicit child-script doubles and are not public battles or native replay acceptance.
- Two orphan dialogue states (31/32) read absent Create fields, and debug pattern 5.5 reads an unset local.
  Preserve those source errors in private comparisons; normal turn selection does not use those states.
- Still required: remaining child actor families, full Chapter 4 controller/hero/writer/menu, damage, spell 11
  OKHeal, Chapter 4 items and game over. Then integrate fresh/retry/defeat/victory and native/full-browser acceptance.
  Do not set public readiness or publish Chapter 4 assets before that acceptance.
- Verification at this checkpoint: 860 focused comparisons, 2765 broader non-parity tests (57 skipped),
  nine headless browser tests, typecheck and production build passed. No Chapter 4 full native replay yet.
