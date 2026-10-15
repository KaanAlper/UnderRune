# NEO battle scene responsibility audit

Scope: the browser enters the documented native battle snapshot at camera (1640, 0). The world introduction, yellow-soul tutorial and postbattle actor/dialogue/room sequence remain source-backed through explicit callbacks in `scene.ts`. This module does not claim whole-world or every-ending parity.

## Original event inventory and destinations

All object event reads came from `.tools/neo-release-original-20261015/code`, with every file labelled before reading. Scene Step was read in labelled ranges 1-220, 221-506 and 507-end. The existing extracted original scripts `scr_dark_marker`, `scr_draw_sprite_tiled_area`, `scr_cutscene_loaded` and `scr_debug` were read in full with separate labels; these scripts are absent from the fresh selected-event export. Scene Draw's debug check has an empty body and the original helper simply returns zero, so it has no retained side effect.

| Object | Original events | Responsibility and destination |
| --- | --- | --- |
| `obj_ch2_sceneex2` (1004) | Create 0, Step 0, Alarm 0, Draw 0 | Unconditional fields and battle snapshot in `battle-scene.ts`; active con8-13, Alarm increment, Draw track wrapping/order, cityscape layers/fade/shop flash and source common flags hand-written. Conditional world Create and Step routes explicitly invoke wrapper callbacks. |
| `o_coaster_controller_sneo` (698) | Create 0 | Timer/input/ACT counters, key array, instance loop `i`, hero/back creation and yspot array hand-written. No Step event exists on this definition. |
| `o_coaster_hero_sneo` (699) | Create 0, Step 0, Step 2, Draw 0, Destroy 0 | All default fields, button buffering, disabled timer, dash/nitro/smoke/return state, source same-frame transitions, hero/encounter depths, Draw interpolation and party return cleanup hand-written. Destroy targets canonical `o_coaster_hero_back` exactly; bulk Draw cleanup explicitly targets `_sneo` backs. |
| `o_coaster_hero_back_sneo` (701) | Create 0, Step 0, Draw 0 | Parent/encounter depth, 2x scaling and draw-self hand-written. |
| `obj_coaster` (1126) | Create 0, Step 0, Draw 0 | Room-dependent sprites, type0-4 character markers and caller `thismarker`, offsets, animation, stop-siner alignment and physical/visual sine movement; back/character/front draw ordering hand-written. |
| `o_coastersmoke` (505) | Create 0, Step 0 | One RNG draw for vertical motion, horizontal acceleration and animation threshold destruction hand-written. |

## Retained world source responsibilities

Scene conditional Create checks chapter, flag309 and tempflag32; shortens the intro, records start_xpos, removes follower characters, creates three coaster markers and hidden world coasters, tracks BG_Loop layer state and creates the white full-screen marker. It remains the source-backed `worldCreate` callback.

Scene Step init resets trackx. World con1/2 handles enemy creation, falling/shortened variants, camera area/advanced cleanup, main-character sprite/motion and alarms. Con5/5.1 and cutscene-loaded state create caterpillar actors and empty carts, enqueue actor/camera/walk/dialogue/text-key/music/sound/emote/lerp/jump/fade commands, teach yellow-soul shooting, set the world cart snapshot and enter con7/customcon1 battle creation. This remains `worldStep`, including scr_battle encounter61, counttimer/fightcon, Ralsei positioning, doom-alarm adjustment, battle-back removal and music/global flags. The browser snapshot substitutes only the already-completed world commands and leaves engine battle creation with the host.

Scene special Create/Alarm4/Step/Draw remain archived responsibility records, not new independent objects in this factory. Tutorial responsibilities: three rows of flying heads, RNG jitter/deceleration, black screen/actor visibility and track hiding, soul introduction/rotation/yellow conversion, grow afterimages, flash/shake/sounds, move scripts/caller state, ordinary/charged shooting gates, prompt text keys/controller button rendering/localized positions, and enemy/soul/shot/marker cleanup. Scene mus Create/Alarm0/Step records cover key-item/chapter/flag gate, looping meeting music, movement-controlled gain, freeing/stopping sounds. Existing `createNeoSourceObject` does not map these `special_*`/`mus_*` prefixed entries; their corresponding resources retain the host's named unsupported/resource-only boundary. The archive records must remain until those independent world objects are implemented. This migration does not claim these tutorial/music routes are executable or hand-ported.

World con13 without forcend, con50 and con60 retain coaster visibility/character restoration, hero cleanup, custom wait completion, dialogue side, actor-to-character conversion/termination, encounter globals and room transition. Practice con13/forcend1 invokes `battleBoundary` before any world continuation. Battle con11 retains bullet/controller cleanup and four ordered audio operations via `finishBattleAudio`.

Common rudebuster/fly/release flags remain hand-written on the battle path and source-backed within world Step: bolt creation and target, upward gravity/camera clamp, release gravity/facing/part mode and landing stop. No shortcuts, CLI flags, configuration keys, context properties or lifecycle hooks were present in these original events.

## Dependencies and API

Canonical lookup covers scene/scene-special/cutscene master, encounter/controller/back, writer/balloon controller, bullet/hero parents, three heroes, NEO enemy, marker, rudebuster bolt, controller/hero/back/smoke/coaster and the non-NEO coaster back named by Destroy. Required source script helpers are caller-aware dark marker and clipped tiled area drawing, hand-written locally using the shared runtime/math/renderer. Input uses shared button helpers; RNG uses the runtime generator. `worldCreate` and `worldStep` retain the source script chain without embedding original GML or dialogue in the new module.

The factory returns ordered `GmObjectDef[]`; root registers every result canonically and aliases prior definitions. `enterNeoBattleSnapshot` restores the scene without executing conditional Create, initializes three world coaster markers via actual Step, creates the battle controller and six hero/back instances, and applies the documented globals. It rejects other camera origins. `finishBattleAudio` translates the host's existing stream handles for snd_free, volume0, resume, volume1/20 in source order. Root owns `scene.ts`, host integration, parity/full-suite/build/browser validation and archive decisions.

## Verification ledger

Focused TDD started with six snapshot/Draw/RNG/lifecycle/boundary/world-delegation checks. The first run failed because the new module was absent. Source review corrected the test's dash expectation: near home, con0 -> con1 -> con2 -> con0 happens in the same event. Source encounter c0 depth is applied to every back, adding one to the actual hero depth. Twelve checks then covered direct marker caller fields and real Create, inclusive clipped tile bounds/column order, shop fade and same-Draw decrement, original non-NEO Destroy target, physical sine/stop alignment/hurt rendering and hero/encounter depth.

Two subsequent red/green regressions proved tolerant type selection: near-integer `type` previously selected undefined array entries, and near-integer `HeroID` previously failed to follow its corresponding hero in Draw. Branch selection now uses shared `eq` and literal sprite tables. Additional checks cover rudebuster/fly/release flags, rejected camera origin and named absent-world callback. Final command `npx vitest run tests/remake-neo-battle-scene.test.ts`: 16 passed, 302 ms, exit 0. No build, full suite or native recorder was run by this agent; root owns integration acceptance.

Layer A cleanup removed invisible Unicode and confirmed there is no embedded document metadata. Windows watermarks-remover is not installed; installation remains needed for automated cleanup.
