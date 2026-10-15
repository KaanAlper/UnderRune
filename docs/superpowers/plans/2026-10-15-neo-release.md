# Remaining NEO families and Pages release

**Spec:** docs/HANDOFF.md sections 2, 3, 5 and 7. The owner explicitly requested the next work and live publication.

**Goal:** Hand-port the remaining attack and battle-scene families, validate their actual supported paths, and publish the tested build.

**Architecture:** Independent factory modules using the canonical host and migrated parents. Shared mechanics remain in the shared engine. Boss hooks move to their owning definitions. No new decompiled sources, dialogue or bytecode in the repository.

**Execution:** dispatching-parallel-agents for three independent domains; root exclusively owns host integration, shared helpers, acceptance, source commit and Pages publication. Agents own only their module/test/brief files, never commit or change shared integration. One fresh final source review covers the integrated result.

## Tasks and responsibility audit

1. Face and laser family: face Create/Step/End Step/Draw/User 0/2/Destroy/shot and tiny-actor interactions, targets/crescent/laser-circle/square dependencies, big-laser timing/damage and cleanup, Spamton-shot lifecycle. Move ringsShots hook to face definition. Destination face.ts and lasers.ts plus focused tests. Agent records every event/caller field before implementation.
2. Finale family: boxes/warping, final form and mouth/hitbox, dollar/fake-heart/last attack, orb/bigshot/finale bullet and supporting spew/parent. Move pullsShots hook to final-form definition; reuse existing power-up orb. Destination finale.ts and focused tests. Agent records all source events and dependencies before implementation.
3. Battle scene: scene Create/Step/Alarm/Draw and snapshot entry, track/cityscape/coaster controller/hero/back/smoke objects, battle exit boundary and cleanup. Destination battle-scene.ts and focused tests. The browser starts from the documented battle snapshot; unsupported world-intro/postbattle story routes must remain explicit boundaries. Agent inventories all existing scene responsibilities and specifies where each is preserved or retained.
4. Root integration and acceptance: ordered factories, previous-definition aliases, hook removal only after new owning definitions are present, no parity exemptions. Run focused tests, both NEO recordings, full suite/typecheck/build and production-browser checks. Extend reference coverage where final attacks/endings are reachable. Audit archived dependencies before deleting anything; retain still-needed archives instead of breaking routes.
5. Publish: update handoff with exact completed/remaining coverage; commit/push feat/boss-battles to main; deploy dist-pages to gh-pages through its existing checkout; verify remote Pages build and live browser.

## Constraints and review focus

- Original installed data.win is read-only; fresh selected events are local in .tools/neo-release-original-20261015.
- Do not touch the two untracked encounter-15 scripts. Existing authorized feature checkout is reused.
- Read each event with labelled file boundaries. Preserve instance loop/caller fields, RNG order, tolerant comparisons and continuation after Destroy.
- Late finale routes need evidence beyond the two original traces; focused tests do not establish whole-game parity.
- Scene cutscene/ending boundaries, reciprocal collision handlers, named unsupported routes, inherited events and source hook ownership receive explicit review.

## Ledger

- Base: 0bab9bc. Baseline: 391 tests, both NEO recordings (9920 frames), build and two production browser checks pass.
- Source-only milestones since Pages 750843b are pending publication; the owner now authorized publication explicitly.
- No archive deletion planned before dependency audit. Chapter 1 full-state recordings, global sound traces and unrelated optional game features remain separate from this release milestone.
- Shared damage audit before adding a contact strategy: preserve invincibility/god gates, random target caller fields, HP cache, defense/element/defending, hero hurt and shake feedback, damage writers/heart noise, knockout flags/hooks, all-party running damage, gameover and target restoration. Existing normal damage keeps all responsibilities; new unmitigated contact differs only in defense/defending/knockout-hook policy, following the late attack script. No chapter/boss tests enter the shared core.
- Pitch helper audit: original snd_pitch_time creates an obj_lerppitch instance and replaces prior tweens; a Web Audio-only ramp would lose entity/full-state parity. Shared frame-loop object and pitch get hook are added instead.
- The new 18,000-frame original recording reaches the warped box, swallowed soul, final form and last volley. It exposed two translation gaps before publication: Other 5 is Room End (not Animation End), and object `with` snapshots reverse their iteration order at three or more instances. The latter changed damage-writer depth insertion and assigned bounce RNG to the wrong writers. The new `withInstances` query keeps ordinary creation-order queries intact; finale source `with` blocks use it and skip destroyed entries. Focused red/green regression plus the recording guard these behaviours.
- Extended acceptance also reaches HP-defeat bookkeeping: preserve six caller working fields and source counter priority, destroy matching stream holders through `snd_free`, and retain `scr_dark_marker`'s `thismarker` return field. The marker helper now requires its caller at every callsite, including the K.Round bow wrapper; sprite creation/scales/speed/return behaviour are unchanged. Numeric stream ownership and named/virtual browser backend cleanup have separate focused regressions. A fresh review caught the initially omitted named/virtual adapter and accepted its correction.
- Diagnostic restarts can use `PARITY_START` plus `PARITY_NEXT_ID` because original snapshots omit consumed/destroyed allocation IDs. These options are not used for release acceptance: its complete recording comparison starts at frame 40.
- Final acceptance: 480 tests / 51 files, no skips (150.23 seconds); 18 tool tests; typecheck; Pages build; two production-browser tests (36.4 seconds). NEO original comparisons match 3960 + 5960 + 17960 frames. Original package hash remains unchanged. An initial simultaneous build/test run skipped 24 tests while generated text bundles were being replaced; it was discarded and the full suite rerun after the build. Future build and data-dependent test runs must be sequential.
- Tested deployment assets: index-DCPnJU8s.js and neo-22KN4LRH.js. Source and Pages pushes are explicitly authorized. Publication uses this accepted build; the deployment commit records the source revision.
