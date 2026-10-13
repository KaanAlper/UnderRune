# All source boss encounters implementation plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port the original attacks, enemy states, ACT rules and special mechanics of the 48 selected catalog encounter variants into the public browser remake. Encounter 15 was excluded at the user's request on 2026-10-14.

**Architecture:** Continue the approved deterministic TypeScript remake and original-frame comparison pipeline. Shared commands, preparation and GM event scheduling stay in place; each encounter receives its own source-derived objects and behavior. An unverified encounter stays unavailable instead of falling back to a generic attack.

**Tech stack:** TypeScript, Canvas, Vite, Vitest, Playwright, local extracted GML and native oracle recordings.

**Spec:** docs/superpowers/specs/2026-10-11-faithful-remake-design.md (approved in the existing conversation).

## Global constraints

- Original events run at 30 game frames per second, independently of browser refresh rate.
- Reference and remake use the same random state and inputs. Object position tolerance is 0.01 pixels.
- No game data.win, bytecode or extracted GML is published. Reference captures remain ignored and local.
- Character party, ACT availability, items, equipment and special soul modes follow each encounter's own source.
- Record partial verification accurately; attack parity does not certify complete encounter choreography.
- Chapter 5 source-only/debug records need a reachability audit before being described as released game bosses.

## Existing responsibilities and destination audit

SourceBattle currently owns intro/command/target/submenus/messages, action reservation and cancellation, actor selection, downed characters, bag consumption/healing/revival, TP costs, perfect/missed bolts, delayed hero alarms, automatic Susie, enemy speech/transition, attacks/return, Jevil phases/ACTs, Lancer phases/ACTs, victory/defeat and pause. These stay covered by existing tests. New encounter factories own only new enemy objects, attack selection and source-specific ACT effects; no wholesale replacement of SourceBattle is planned.

main.ts retains theater/intro/device menu, chapter and encounter paging, keyboard/touch shortcuts, practice selection, preparation lifecycle, asynchronous launch cancellation/retry, visibility/blur pause, audio unlocking/mute/pause, results/rematch and preferences. A single encounter availability registry will replace duplicated availability checks once newly ported encounters pass their gates.

BattleView retains original HUD/menu/TP/HP/timing lanes, afterimages, camera handling, original fonts, sprites and Jevil background. New scenes add their own background/target placement without deleting legacy behavior.

GmRuntime retains object inheritance, Create/alarms/Step/motion/collision/Draw order, random sequencing, instance IDs, masks, sound and room hooks. Add only source-required primitives with focused tests. Asset/audio builders retain allowlists, selected banks, bounds checks and failure handling. Loadout storage keys and validation remain unchanged.

## Review focus

- A multi-enemy target dies before another attack: retarget or cancel according to source, preserve damage effects.
- Automatic or absent party members: no selectable phantom actors; correct source attacks and target masks.
- Delayed load/restart/menu return: stale failures and sounds cannot replace the newer scene.
- A new attack creates unported objects or requires unsupported mechanics: fail its verification gate, never silently substitute.
- Reference files unavailable: report unverified; a skipped local parity test cannot unlock the public encounter.

## Task 1: Chapter 1 independent enemy object ports

**Files:** src/remake/bosses/clover/, src/remake/bosses/kround/, src/remake/bosses/king/; tests/remake-*.test.ts; local .tools/oracle captures.

**Interface:** Export GmObjectDef objects using existing GmRuntime and deltarune/battle primitives. Document all source-dependent globals and unsupported dependencies. Do not edit shared host files from a family task.

- [ ] Read complete native Create/Step/Alarm/Draw/collision events and enumerate all dependencies.
- [ ] Add failing focused tests for attack timing, spawning, motion and special state transitions.
- [ ] Implement that family's own original behaviors and required unique bullet objects.
- [ ] Run focused tests; obtain fixed-seed native reference captures and compare attack frames.
- [ ] Review source coverage, RNG consumption, collision/damage and visible effects before integration.

## Task 2: Shared encounter integration and public gate

**Files:** src/remake/host/encounters.ts, battle.ts, view.ts, src/main.ts, tools/build-remake-assets.mjs, tools/build-pages.mjs; tests/remake-battle.test.ts and tests/e2e/public.spec.ts.

- [ ] Add a registry for verified availability, party, enemy factories and source-specific callbacks.
- [ ] Preserve all responsibilities listed above; add target-specific HP/DF/AT and multi-enemy retargeting for encounters that require them.
- [ ] Integrate only families with complete source dependency coverage and recorded parity evidence.
- [ ] Verify preparation, FIGHT/ACT/magic/items/spare, defeat/victory, pause/restart and continuous turns.
- [ ] Build, test the production bundle, review, then publish under the user's existing GitHub authorization.

## Task 3: Remaining Chapter 1 variants

- [ ] Port Lancer encounter 20 and Susie/Lancer encounter 31 with their own choreography and ACTs.
- [x] K.Round encounter 27 is available. Clover/Hathy encounter 15 is excluded; do not port or re-add it to the selection.
- [ ] Record and verify each variant, including its own party and all source attack branches.

## Task 4: Chapter 2 families

- [ ] Port Tasque/Manager and Werewerewire combinations; Berdly variants, Queen, Spamton, Sweet/K_K/Cap'n, Rouxls and Mauswheel.
- [ ] Add source yellow soul and Spamton NEO attack dependencies and phases.
- [ ] Add GIGA Queen boxing as its own source mechanic, with source input/damage/round flow.
- [ ] Verify and integrate each family separately; no recolored Chapter 1 attacks.

## Task 5: Chapter 3 families

- [ ] Port Lanino/Elnina and rematches, Rouxls, Roaring Knight, Tenna and board variants.
- [ ] Port Shadow Mantle and Susiezilla as distinct source systems, including their HUD and controls.
- [ ] Verify source cinematics/phase changes, audio and special equipment effects.

## Task 6: Chapter 4 and source-only records

- [ ] Port Hammer of Justice, Jackenstein, Titan/Spawn, HolywaterCooler and rematches with their distinct mechanics.
- [ ] Audit Chapter 5 source-only records, reachability and native launch behavior before selecting support scope.
- [ ] Verify completed families across ordinary inputs, slow movement, damage, ACT/item branches and all phases.

## Task 7: Completion verification

- [ ] All intended released encounters and variants have individually recorded source parity and full battle-flow tests.
- [ ] Original controls/gear/items/special equipment effects and mobile input pass; source-only entries are labeled accurately.
- [ ] Public bundle includes only the asset allowlist and no raw game/code/reference files.
- [ ] Source and deployment commits are pushed, GitHub Pages build succeeds, and live battles are checked.

Ruling: Continue the already approved source-port design without a new approval stop; this is execution of the user's repeatedly authorized original-boss scope. Preserve verified public fights while unverified work remains local.
