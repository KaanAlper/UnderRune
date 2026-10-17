# Chapter 2 boss completion

> Execution: superpowers:subagent-driven-development. The owner explicitly requests all Chapter 2 bosses;
> continue through implementation and verification without another authorization checkpoint.

**Goal:** Finish authentic Chapter 2 boss encounters in the browser, using the installed game's events,
> equipment, party/story rules, attacks, ACTs and endings. An unavailable or unused/debug encounter must not
> masquerade as an authentic completed battle. NEO's existing normal route and Chapter 1 must keep working.

**Architecture:** One shared battle engine, chapter strategies, boss-owned hooks/factories. Extract the existing
Chapter 2 host's reusable registration and engine bridges before registering other boss families. GIGA Queen's
boxing belongs to its own combat adapter, not conditionals in the normal battle controller. No new raw decompiled
GML/dialogue/bytecode enters source control. Local source files remain read-only.

## Responsibility audit and destinations

- `host/neo.ts` currently owns: chapter resource identity/indices/ancestry and named unavailable resources;
  collection and merging of common battle/controller/hero/writer/effect definitions; source script dispatch;
  audio stream identity, pitch, volume, cleanup and surface installation; shared menu/ACT/damage/game-over/win
  bridges; ordered boss factories and original-definition aliases; metadata depths; small-face writer callback;
  NEO-specific enemy/player/attack/world-scene source bridges; public rage policy and coaster scene entry.
  Move only reusable registry/engine/audio/surface duties to `host/chapter2.ts`; preserve NEO wrapper imports,
  event maps, factory order, aliases, small-face behavior, rage policy and enter callback in its adapter.
- `host/engine.ts` owns: encounter/room registry, availability gate, equipment validation/defaults, party stats,
  inventory/auto commands, equipment elements, controller initialization, stage/background/scene entry,
  pause/step/turn/outcome detection and passive leaderboard scoring. Extend its encounter adapter data, preserving
  all duties. Chapter 2 defaults must be selected by chapter strategy, not presence of a NEO host.
- `deltarune/encounter.ts` owns initial positions, type/ACT/stats/rewards and source caller fields. Add verified
  Chapter 2 setup tables/helpers. Boss-specific mechanics stay in boss modules, not shared core branches.
- `game/preparation-party.ts`, `host/encounters.ts`, main launch and asset extraction own party/locked gear,
  readiness, lazy adapter selection, literal sprite/sound/text-key collection. Enable a boss only after actual
  launch, turn and ending acceptance; no fake party swap or sprite-only placeholder.
- Keyboard, preparation, route choice, score tracking, source text lookup, responsive layouts, native local
  launcher fallback and load-error retry behavior remain intact.

## Work packages

1. Root: common Chapter 2 host extraction and tests, full responsibility preservation; independent source audit
   of every Chapter 2 catalog encounter and story party. Preserve all NEO reference recordings.
2. Field/mansion family: Werewerewire, Tasque Manager/Tasque, Mauswheel. Explicit source events and dependency
   factories under `bosses/chapter2-field`, isolated tests; report genuine encounter IDs versus unused copies.
3. Rival/music/pirate family: Berdly (both story fights), Sweet/Cap'n/K_K, Rouxls. Boss-local factories and tests
   under `bosses/chapter2-rivals`; preserve multi-enemy targeting, ACT actors, spell/item and route constraints.
4. Queen family: Queen and GIGA Queen. Inventory and explicitly port normal Queen's dependencies and the boxing
   adapter under `bosses/queen`; separate original combat-mode lifecycle/input/outcome and verified controls.
5. Root: normal Spamton factory/ACT/attacks under `bosses/spamton`; integrate all families through chapter host and
   encounter adapters. Complete required shared Chapter 2 helpers without boss names in shared mechanics.
6. Review and acceptance: red/green focused tests; source-event comparisons with exact RNG and caller fields;
   all existing tests and NEO recordings; per-boss browser command, attack, item/ACT, party and victory/defeat
   checks. GIGA Queen gets separate boxing checks. Run data-producing builds sequentially with tests.
7. Publish only accepted availability: explicit source staging, source push to main, Pages artifact deployment,
   successful GitHub deployment and live browser checks. Update HANDOFF with exact complete/remaining boundaries.

## Execution rules

- Reuse authorized `feat/boss-battles` checkout; no edits on main. Agents own disjoint boss files/tests and never
  commit/push or edit root-owned integration. Root integrates and reviews each package and the whole branch.
- Never read/run/stage `tools/patch-encounter15.ps1` or `tools/utmt/enable_encounter15.csx`.
- Shared engine additions preserve all existing chapter strategies and named missing-chapter errors.
- No unproven public availability, guessed attacks, blanket damage multipliers or silent unsupported fallback.
- Do not delete archived source bridges until every caller/resource/lifecycle responsibility is accounted for.

## Ledger

- Baseline: `d9b2676`; 578 tests /58files, no skips; normal NEO and keyboard flows accepted on Pages `e77ded9`.
- Ruling: audit unused/developer catalog entries before enabling them. The owner's request is authentic boss
  battles, consistent with the earlier request to remove a fabricated encounter; menu count is not completion.
- Ruling: existing authorization covers code changes, testing, source push and tested Pages releases. No separate
  approval pause is introduced for the same requested work.
