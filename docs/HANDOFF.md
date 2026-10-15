# UnderRune handoff (2026-10-15)

This file explains how to continue the work: the rules that must hold, how the work is verified, what is done and
what is left, in order. Read it fully before changing code.

Current checkpoint: writer/controller chapter parts and the NEO attack controller, flying heads, support,
walls, wire heart, phone/Pipis, phone hands, face, lasers, finale and battle-scene families are hand-ported.
The release ledgers in sections 5.10–11 record verification and publication. Source-backed world-intro and Room End
bridges are retained; this is not an archive-free or whole-game implementation. Difficulty-specific variants,
mercy-ending acceptance and comprehensive sound traces still need additional recordings.

## 1. Project in one paragraph

UnderRune rewrites DELTARUNE boss battles in TypeScript. They must match the original game frame by frame and run
in the browser (https://kaanalper.github.io/UnderRune/play/). This is the owner's graduation project.

- Repository: https://github.com/KaanAlper/UnderRune (AGPL-3.0).
- Work on `feat/boss-battles`, then push with `git push origin feat/boss-battles:main`.
- The site is served from the `gh-pages` branch (deploy steps are in section 7).
- Done so far:
  - all 8 Chapter 1 bosses: Lancer, Lancer 2, Susie & Lancer, Lancer 3, King, Clover, K. Round, Jevil;
  - Chapter 2 Spamton NEO (encounter 61), partly hand-ported (section 5).

## 2. Hard rules (do not break)

### Data and licensing

- **Never commit** these, or anything derived from them:
  - `data.win`;
  - bytecode;
  - decompiled GML.
- `extracted/` and `.tools/` stay local and are git-ignored.
- Game text is never in the repo. Code refers to text **keys** only:
  - Chapter 1 keys: `src/remake/host/text-keys.json`;
  - Chapter 2 keys: `src/remake/deltarune/text-keys-ch2.json`.
- Text is built locally from the player's own game with `node tools/build-remake-assets.mjs 1|2`.
- The Spamton NEO folder still holds the old archived decompiled sources. They are being replaced (section 5) and
  must then be deleted.
- **Do not touch or run** `tools/patch-encounter15.ps1` or `tools/utmt/enable_encounter15.csx`. They are untracked and
  modify the user's game files.

### Language and commits

- Code, comments, README, commits and docs: **English**.
- Chat with the owner: **Turkish**.
- End commit messages with your own co-author trailer, like the existing commits do.

### Architecture (the owner's explicit request)

The goal: no special cases, one shared engine, a strategy only where something really differs, and bugs either
impossible or easy to locate.

**One shared engine.**
- Every enemy is `src/remake/deltarune/enemy.ts` (`defineEnemy`, Chapter 2's obj_baseenemy) plus a strategy of its
  own steps.
- The soul, bullets, battle controller, writer and FIGHT bar are shared engine objects
  (`src/remake/deltarune/*.ts`).

**Shared code never tests the chapter number and never names a boss.** When chapters differ:
- Use a **chapter part**: a `Record<number, …>` table placed next to the component and picked with
  `forChapter(rt, TABLE, 'what')` from `rules.ts`.
  - Examples: `GRAZE`, `DAMAGE`, `FIGHT_BAR`, `SPELLS`, `MERCY_ADD`, `NEXT_ACT`, `DMG_WRITER`, `SHAKE`.
- Or use a `ChapterRules` flag (`rules(rt).soulHasModes`, `phaseScript`, …).
- A missing chapter must throw a named error, never fall back silently.

**Boss-specific behaviour is a hook, not a branch.** The original often writes things like
`with (obj_spamton_neo_enemy) …` or `if (instance_exists(obj_queen_enemy))` inside shared code.
- That case becomes a hook in `BattleHooks` (`rules.ts`), declared on the boss's object definition.
- Shared code runs `withHook(rt, 'name')` at the same point.
- Existing hooks: `onHeroHit`, `defeatedByDamage`, `onTurnEnd`, `upgradedShot`, `superCharged`, `onBigShot`,
  `ringsShots`, `pullsShots`, `onFlash`, `flashSprite`, `hidesTensionBar`, `catchesKnockout`, `soulReturnsTo`,
  `takesFightBar`, `showsHeals`, `onUltimatHeal`.

**A small difference is a strategy or rule point; a big difference replaces that part of the component.**

**Scripts that write their caller's variables take the caller as a required parameter.** The required parameter
makes it impossible to forget. Examples:
- `scr_battletext` sets the caller's `xx`, `yy`, `battlewriter` and `myface`;
- `scr_heal` sets `abovemaxhp`, `belowzero`, `hltarget` and `_curhp`;
- `scr_damage_enemy` sets `dm`;
- `scr_afterimage` sets `afterimage`;
- `scr_mercyadd` (Chapter 2) sets `__mercydmgwriter`;
- `scr_bulletspawner` sets `__dc`;
- `scr_heartcolor` sets `__heartcolor`;
- `scr_nextact` sets `__minstance`;
- `scr_move_to_point_over_time` sets `_mmm`;
- `scr_isphase` (Chapter 2) sets `__isphase`.

**GML instance variables stay instance variables.** This includes loop counters like `i`, `j`, `n`, `xyz` when the
GML does not use `var`. Event 1 of `obj_attackpress` depends on sharing `i` with the Draw loop that calls it.

**Errors must be easy to locate.**
- The runtime wraps every event in `GmEventError`, which names the object, instance, event, frame and caller chain.
- `GmInstance.strict` is on in tests and in the dev build. Reading an unset instance variable throws
  `GmUnsetVariableError`.
- Use `gmArray(inst, name)` where GML creates an array by writing to it.
- A path that is not ported must throw a named "not ported" error.

**Before rewriting a large component, list everything it does (global CLAUDE.md audit rule).** That means its
variables, events, sounds and the hooks it reaches. Port line by line from the GML.

## 3. How the work is verified

### Reference recordings ("oracle")

- The recordings come from a patched Butterscotch build: the original game running in a headless browser. Sources
  are in `.tools/butterscotch-browser-source`; active builds are `.tools/butterscotch-browser-current-build`
  and `.tools/butterscotch-portable-build`. The reviewed patch and hash are in
  `runtime/patches/browser-compat.patch` and `tools-lock.json`.
- The recordings are local in `.tools/oracle/`.
- Record with:
  ```
  node tools/oracle-record.mjs ch2-61 --seed=11 --frames=4000 --god --dumps=40,60,...,3980 --script=z|menu
  ```
- The recorder needs the dev server running (`npm run dev` on 127.0.0.1:5173).
- Key scripts are in `tools/oracle-scripts.mjs`:
  - `z` taps Z;
  - `menu` cycles menus, ACTs, spells and a charged shot.
- Chapter 2 has no god switch. The native launcher's `ORACLE_HP` raises the party's HP instead. Rebuild it with
  `powershell -File tools/build-native-launchers.ps1 -Chapters 2`.
- Every line of the trace (`*.ndjson`) holds, after that frame's step:
  - the RNG state;
  - selected globals;
  - every instance's id, object, x, y, image_index, sprite and visible flag.
- `*-fN.json` files are full dumps of every instance's variables. The NEO runs have one every 20 frames.

### Tests

- `tests/remake-engine-parity.test.ts` checks the 8 Chapter 1 runs frame by frame.
- `tests/remake-neo-parity.test.ts` checks the two NEO runs: `ch2-61-s11-god` (4000 frames) and
  `ch2-61-s11-god-menu` (6000 frames).
- At every dump frame, `compareState` (`tests/parity/reference.ts`) also compares **every variable** of every
  non-archived object:
  - built-ins and alarms;
  - missing and extra instance variables.
- Debug environment variables:
  - `PARITY_SURVEY=1`: do not stop; list every differing object variable once, with the first frame it differs.
    This is the main tool for finding the next work.
  - `PARITY_STATE=all`: also compare archived objects.
  - `PARITY_DEBUG=obj_a,obj_b` with `PARITY_VARS=x,y,...` and `PARITY_END=N`: print per-frame values.
  - `PARITY_LIFE=obj_x`: log every creation and destruction with the calling code.
  - `PARITY_RNG=from,to`: log who calls the RNG.
- Known representation rules, already handled:
  - Older captures contain an automatic `creator` write from the reference VM. The current patch removes that
    write from all four creation builtins, preserving the game's Create-event fields. Both NEO recordings were
    regenerated with this fix; their previous 502 files are backed up locally in
    `.tools/oracle-legacy-creator-20261014`. Existing comparison handling for an absent `creator` is retained for
    legacy captures; no new exemption or reference normalization was added.
  - Script references are numbers in the FUNC chunk's order. Get them with
    `node tools/extract-script-index.mjs 1|2`, which writes `extracted/chapterN_windows/functions.json`.
  - Sound handles are 100000 plus 2 per sound played. They are listed in `SOUND_HANDLES` and not compared.
  - Sprites made from surfaces are named `__newsprite<N>`.
- `STATE_PENDING` in the NEO test is empty. The writer and controller are fully compared at every available dump
  in both NEO recordings (4000 and 6000 frames). Do not add exemptions to mask a mismatch. The test uses the original
  main font glyph advances, so controller name-width fields are compared as well.
- Run everything with `npx tsc --noEmit` and `npx vitest run`. The parity runs take about 1–2 minutes.

### GML semantics already learned (keep following them)

- Number comparisons use a 1e-5 tolerance: use `lt`, `le`, `gt`, `ge`, `eq` from `gm/math`.
- `round()` is banker's rounding.
- Call arguments are evaluated right to left. For example, `draw_text(wx + random(s), wy + random(s))` draws y's
  random number first.
- `merge_color` rounds each channel in 32-bit floats: `mergeColor` in `gm/graphics.ts`.
- Draw events also run logic and use the RNG (the writer draws 2–4 random numbers per character).
- `instance_destroy()` does **not** stop the event. The rest of the event still runs.
- `var` declarations apply to the whole event.
- Setting `sprite_index` resets `image_index` when it is past the new sprite's last frame.
- Among instances at the same depth, the most recent arrival draws first.
- `instance_create` gives the new instance the object's depth from `__global_object_depths`.
- The runtime's built-in fields are stored under `$` names (`$x`, `$sprite`, …) so GML variables like `_sprite`
  cannot clash with them.

## 4. Writer checkpoint and optional dependencies

- `writer.ts` dispatches Create, Alarm 0–2, Draw and text setup through `WRITER[1|2]` and `forChapter`.
- `writer-chapter2.ts` preserves instance working variables, input buffering, formatting, text codes, voices,
  page transitions and Draw effects. It contains no archived GML or game dialogue.
- Both NEO recordings match with writer state included: 3960 and 5960 frames after the frame-40 snapshot.
- Eleven new focused tests cover lifecycle, buffering, forced input, escape handling, RNG, missing chapter rules,
  portrait cleanup including descendants, camera offsets, ordinary audio hosts and the installed debug behavior.
- A fresh review found an ordinary-audio Queen pitch handle issue; a failing test confirmed it and the fix passed.
- Optional Japanese fonts/effects, controller-button sprite resolution and choice objects still throw explicit
  named errors. They are outside the accepted NEO recording paths and must be ported before enabling encounters
  that need them. The existing small-face host boundary is retained until its own object is ported.
- The controller acceptance checkpoint is in section 5.2. Keep the writer acceptance checks enabled.

The original audit below remains useful when extending the writer to its optional dependencies:

- The Chapter 1 part remains in `src/remake/deltarune/writer.ts`; the Chapter 2 part is in
  `src/remake/deltarune/writer-chapter2.ts`.
- The GML is about 1100 lines (Create, Alarm 0–2, Draw).
- The GML keeps its working values on the instance: `accept`, `charpos`, `remspace`, `remchar`, `linecount`, `i`,
  `j`, `n`, `mychar`, `thischar`, `nextchar`, `nextchar2`, `getchar`, `wx`, `wy`, `button1/2/3`, `skip`, `play`,
  `playcheck`, `playtextsound`, `sound_timer`, `sound_count`, …
- Use `extracted/chapter2_windows/code/gml_Object_obj_writer_*.gml`, `scr_texttype`, `scr_textsound` and `scr_nextmsg`
  as the local read-only reference when extending the remaining dependencies.
- Preserve the `WRITER[1|2]` chapter table and caller-required helpers.

Chapter 2 adds or changes:

**Input**
- `prevent_mash_buffer` (counts down every frame and blocks button1/button2 while > 0).
- `forcebutton1`.
- `miniface_drawn = -1` at the start of Draw.
- Automash: with `flag[10]` or debug, button3 alternates between button1 and button2 (`automash_timer`).

**Formatting pass**
- `` ` `` escapes the next character.
- `\n` counts like `&`.
- `\m` sets `drawaster = 0`.
- `\s0` is already applied while formatting.
- `autocenter` is used instead of Chapter 1's `\a`/`textalignment`.
- The continuation indent is the literal `"||"`. Chapter 1 takes it from a language string.

**Codes while drawing**
- `\E` maps digits, `A–Z` (code − 55) and `a–z` (code − 61). Chapter 1 has a fixed table from 0–9 and A–E.
- `\F` adds `s` → 6, `U` → 9, `b` → 19 and `Q` → 21.
- `\f`: small faces go through `global.sminstance[fam]` (Chapter 1 uses `faced`/`getrid`).
- `\*`: button sprite offsets.
- `\T` table differences:
  - Chapter 1: `0` → 4 while fighting.
  - Chapter 2: `N` → 56/59, `B` → 57/77; `K` checks the chapter; new codes `q`, `Q`, `s`, `U`, `p`.
- Colours `P`, `M`, `S` (#FF80FF) and `V` (#80FF80).
- `\C1`–`\C4` open choicers (`obj_choicer_old`, `obj_choicer_neo` with `choicetotal`) and set `halt = 5`.
- `\S` plays `global.writersnd[i]`; `\I` draws `global.writerimg[i]`; `\m` draws a mini face.
- `drawaster == 0` turns `*` into a space.
- `#` handling; the `jpspecial` branches (Japanese only).
- `special == 3`: this effect exists in both chapters; check it.
- The Comic Sans width tweak checks `myfont == 4` in Chapter 2 and `11` in Chapter 1.
  - Font ids → use names: `index.json` has `fonts`.

**Halting**
- Halting destroys every `obj_smallface`.
- Alarm 0 adds `sound_timer`, `reachedend` and the `` ` `` handling.
- Remember: after `scr_nextmsg` or `instance_destroy` inside the loop, the GML keeps going (`siner += 1` still
  happens). The Chapter 2 port now preserves this; do not reintroduce early returns there.

Check after each step with `PARITY_SURVEY=1`; the writer differences in the existing recordings have been resolved.
Keep the 8 Chapter 1 runs green.
They exercise the Chapter 1 writer heavily, including RNG per character.

## 5. Remaining work, in order

### 1. Writer milestone and optional dependencies (section 4)

The available English battle paths are accepted against both current NEO recordings. Japanese font/effect support,
button sprites and choice objects remain explicit unported dependency boundaries. Address these when an encounter
or new recording exercises them; do not silently ignore their control codes.

### 2. Chapter 2 controller acceptance checkpoint

- `controller.ts` retains one shared command row, turn progression, phase creation, enemy timer, input buffers,
  sounds, cleanup and victory lifecycle. It contains no direct chapter checks or encounter-number branches.
- `CONTROLLER_MENUS`, `CONTROLLER_DRAW`, `CONTROLLER_TAIL` and `CONTROLLER_SCRIPTS` dispatch with `forChapter`.
  Chapter 2 parts are `controller-menu2.ts`, `controller-chapter2.ts` and `controller-script-parts.ts`.
- HUD spacing, panel/shake offsets, selection fields, ACT actor portraits, MERCY/HP displays, merged spell tables,
  next/previous hero fields and the bag propagated to slot 3 follow the local source.
- `spellMenuSetupChapter2(rt, caller)` and `actSimulChapter2(rt, caller)` require the calling instance and preserve
  its working fields. The transitional host and NEO pass that instance explicitly.
- The controller's former pending-state exemption is removed. Both current NEO recordings match all 9920 frames
  after the frame-40 starting snapshots, including all recorded controller fields. This is not whole-game parity.
- Focused tests cover missing chapters, reordered parties, camera offsets, ACT cancellation, caller state, bag
  propagation, reward ordering and simultaneous left/down item input. A fresh review found the latter input-order
  regression; a failing test reproduced it, and the correction passed. The final delta review found no further
  blocking/high/medium issues in enabled paths.
- Japanese HUD, A-held ACT preview, hero 4/Noelle creation and victory level progression currently have named
  unported-dependency errors. Port them before enabling encounters needing them. Boxing/Queen-specific visuals
  and state gates have hook interfaces but require those future boss definitions. Additional recordings must
  exercise the first 40 creation frames, ambush/story portrait flags, conditional victory rewards and endings.
- Continue with the archived NEO attack objects in section 5.3. Do not remove the interpreter while they still
  depend on it, and do not assert 100% similarity from these two recordings.

### 3. NEO's archived objects

The battle families below now use TypeScript. Retained world and Room End bridges still use the interpreter
(`src/source-runtime/gml.ts`); audit their dependencies before deleting any archived source:
- the transitional host is `src/remake/host/neo.ts` (`NEO_PORTED`, `ENGINE_PORTED`, pending stubs in
  `bosses/spamton-neo/pending.ts`);
- archived objects are marked `archived` by `createNeoSourceObject`.

Port them in the order they first appear in the recordings:
1. **Done:** `obj_sneo_bulletcontroller` (`bullet-controller.ts`), normal types 0/1/1.5/6/8.5/9/12.
2. **Done:** the flying heads: `obj_sneo_guymaker`, `obj_sneo_lilguy`, `obj_sneo_lilguy_bullet`
   (`flying-heads.ts`). Create, Step, alarms, Draw, animation/path end and shot handling are ported. The head
   projectile now inherits the hand-ported `obj_basicbullet_sneo` events from `support.ts`. Cut effects and doom
   have also been ported since the original flying-head checkpoint.
   The canonical host aliases both old registry definitions and factory references so archived children find
   the migrated controller and preserve party targeting. Fourteen focused tests cover rare paths and aliasing;
   a fresh source review found no material issues. Developer difficulty 7 retains its named unported boundary.
3. **Done:** `obj_afterimage_cut`, `obj_lerpvar`, `obj_basicbullet_sneo`, `obj_doom` (`support.ts`).
4. **Done:** the walls (`walls.ts`): `obj_sneo_wall_controller_new`, `obj_sneo_wallbullet_new`, `obj_sneo_rotatingwall_bomb`,
   `obj_mettaton_bomb_hitbox`
5. **Done:** `obj_sneo_wireheart` and its pieces (`wireheart.ts`).
6. **Done:** the phone call and Pipis objects (`phonecall.ts`, 13 definitions). Difficulty 4 egg bursts retain a
   named unported boundary; the hard phone stream is ported but still needs a dedicated acceptance recording.
7. **Done:** the phone hands and `obj_sneo_mmx_spreadshot` (`phonehands.ts`, four definitions). Explicit source
   Create/Step/Draw/Alarm/Destroy/hit handlers and the canonical basic/regular-bullet parents are preserved.
   The shared Chapter 2 `bulletInherit2` keeps -1 defaults and copies element, with GML-tolerant comparisons.
   Twelve focused tests cover mirrored joints, firing, caller loop fields, head push/HP and charged-shot
   consumption, hurtbox damage, Draw fades/flashes, and continuation after Destroy. Both NEO recordings match
   with the new objects' full state. The hurtbox is tested synthetically; it does not appear in these recordings.
8. **Done:** face, target, crescent and circle/square laser actors (`face.ts`, five definitions). The face owns `ringsShots`.
9. **Done:** large laser, friendly hitbox, arm telegraph and Spamton shot (`lasers.ts`, four definitions).
10. **Done:** finale and final form (`finale.ts`, fourteen definitions). The final form owns `pullsShots`.
11. **Done for battle:** six scene/coaster/smoke definitions and the documented battle snapshot (`battle-scene.ts`).
    World Create/Step and true Room End remain explicit source-backed bridges.

For each port:
- verify with both NEO runs (trace plus full state);
- remove any pending stub and register the definition through the canonical host's ordered factory list;
- `bosses/spamton-neo/shot.ts` (Codex's collision handlers) can go once the targets are ported.

### 4. More NEO recordings

Record runs that reach:
- additional finale paths (the long FIGHT recording now reaches the final form, last volley and HP-defeat sequence);
- the spared ending;
- Susie's Super Charge, Ralsei's fluff, the Kris throw;
- items.

New scripts go in `tools/oracle-scripts.mjs`.

### 5. Chapter 1 full-state checks

- Re-record the 8 Chapter 1 runs with dumps every 20 frames (`--dumps=`).
- Use `compareState` in `tests/remake-engine-parity.test.ts` too, with `loadResources(1)`.
- This will show Chapter 1 instance-variable gaps the same way.

### 6. Sound parity

- Sounds are not in the trace.
- Patch the oracle VM to log the sounds played each frame. Then compare names per frame. This also makes
  `SOUND_HANDLES` unnecessary.

### 7. Finish NEO

- After the retained world and Room End dependencies have been migrated and verified, delete the archived sources:
  - `bosses/spamton-neo/*source*`, `attack-*.ts`, `host-source.ts`, `player-source.ts`,
    `source-scene-data.ts`, `enemy-source-data.ts`, `coverage*.ts`, `body-source.ts`;
  - `tools/build-neo-host-source.mjs`, `tools/build-neo-player-source.mjs`.
- Check other users of `src/source-runtime/gml.ts` before removing it: `tools/build-equipment.mjs`,
  `tests/gml.test.ts` and the source-turn audit use it.
- Restore the README line saying decompiled code is excluded.
- Check that text keys and sounds are still referenced literally.
- Redeploy.
- Ask the owner whether to purge the old sources from git history. This needs their decision.

### 8. Review of Claude's continuation (2026-10-14)

- Claude accepted the writer, controller, bullet controller, flying heads and creator-VM correction. Commit
  `750843b` preserves Codex attribution. The main edits to existing ports replaced flying-head helper duplication
  with shared support scripts and registered factories sequentially so children receive migrated parents.
- `obj_script_delayed` now preserves Create's `script = -1` and `i`, plus the target's source fields `__scipt` and
  `__scipt_arg` before invocation. `gmlScript` supplies resource identity for full-state comparison; `gmField`
  resolves variable names such as `image_xscale`. These corrections match the local original script.
- The Queen tea special case moved from a boss-name check into `BattleHooks.teaHeals`, following the architecture.
- The new noone equivalence is grounded in Butterscotch's `clearDestroyedInstanceReferences`: only tagged direct
  instance references are cleared by that VM. Our numeric representation loses that tag. The original comparison
  accepted ANY missing number >= 100000, including never-allocated/fractional values. A failing regression test
  reproduced this; the rule now requires a safe integer within the runtime's allocated id range and absent from
  live instances. This narrows the artifact allowance; it does not establish typed-reference identity from
  untyped dumps. Future reference metadata should preserve the distinction rather than add broad exemptions.
- The 377-test count remained unchanged across Claude's four new families: the recordings provide strong coverage
  of exercised routes, but there are no new focused tests for their unrecorded variants. Add those before claiming
  full route coverage. Finale/spare endings and sound parity remain outstanding.
- The public-browser change waits for commands before sending keys, avoiding input during loading; it changes
  the test timing, not the game.
- Final review checks: all 379 tests pass (43 files, 76.13 seconds); typecheck and source whitespace checks pass.
  Only test comparison and handoff files changed in this review, so no new production build or Pages deployment
  was performed.

### 9. Phone-hand checkpoint (2026-10-15)

- This continues Claude's source-reading boundary recorded above. The four definitions now use TypeScript and
  retain migrated parents; no interpreter, source archive or engine component was removed.
- All 16 event files were re-extracted read-only from the installed Chapter 2 package into
  `.tools/phonehands-original-20261015`. Their bodies match the cache and archive. The installed package hash
  remained `047c5ab003e3e017a709c02757e119c81e0327760169512110fd276b19241e68`.
- An implementation error exposed by parity at frames 2815/2975 was corrected before acceptance: concatenated
  source reads made the preceding Destroy/End Step exit look like Collision/user5's first line. Head shots
  actually decrement HP, push the head and all hands, and consume charged shots too. Hurtbox contact actually
  invokes shared damage. Two failing regressions pinned these behaviours. Label file boundaries when reading
  event batches; the source cache was not stale.
- Acceptance: 391 tests / 44 files (73.01 seconds), typecheck, Pages build and both production-browser checks
  passed. A fresh review of all 16 source events found no material defect. Difficulty-99 burst coverage remains
  a nonblocking test gap; source translation matches. Details are in
  `docs/superpowers/plans/2026-10-15-neo-phonehands.md`.
- The face attack, large laser/shot, finale, scene objects and extra route/sound recordings remain outstanding.

### 10. Remaining battle families and release (2026-10-15)

- Fresh original events were exported read-only to `.tools/neo-release-original-20261015/code`; the installed
  Chapter 2 package was not modified. Audits and the release plan are under `docs/superpowers/plans/2026-10-15-neo-*`.
- Factory order preserves migrated parents. Face and final-form hooks moved to their owning definitions. Six
  presentation objects and battle snapshot initialization moved to `battle-scene.ts`; world callbacks remain in
  `scene.ts`. True warped-box Room End still uses the existing dispatcher; Other 5 is not Animation End.
- Shared additions: proportional/unmitigated damage, pitch tween and logical pitch reads, source fade-out,
  source-owned stream cleanup and caller-required dark-marker bookkeeping. Existing damage strategies retain
  their previous defense and knockout rules. Named/virtual browser stream handles resolve at the audio host.
- The long FIGHT recording exposed reversed object `with` ordering for three or more instances. `withInstances`
  preserves this snapshot rule without changing ordinary creation-order queries. It fixes finale damage-writer
  depth/RNG ordering. Defeat-event working fields and marker return fields now persist on their source callers.
- Acceptance: all 480 tests / 51 files pass (150.23 seconds, no skips), 18 tool tests pass, typecheck and Pages build
  pass, and both production-browser checks pass (36.4 seconds). Three NEO recordings match 3960 + 5960 + 17960
  frames, including migrated-object state at available dumps; the last covers frames 40–18000. Snapshots are
  sparse early in that long run, then every 40 frames; trace positions/entities/RNG/globals are checked each frame.
- Published source: `c8aeab6`; Pages deployment: `8c2d121` (successful build/deploy). The live site references
  `index-DCPnJU8s.js` and `neo-22KN4LRH.js`. The live NEO bundle SHA256 matches the accepted local artifact:
  `745bd6fd918f5cf257c5d71d530da73379c62dccdd481a11aa04d9209dff50ca`.
  Live-browser acceptance passed (23.4 seconds): preparation, NEO commands, complete yellow-soul turn, return to
  commands and Chapter 1/Lancer switching, with no page errors or native-runtime requests.
- Every-ending acceptance, Chapter 1 full-state re-recordings, global sound traces, other Chapter 2 bosses and
  Undertale remain separate work. Original package SHA256 is unchanged:
  `047c5ab003e3e017a709c02757e119c81e0327760169512110fd276b19241e68`.

### 11. Browser release edges and nine-slice boxes (2026-10-16)

- The owner reported stretched box borders, missing BIG SHOT and a suspected circling defensive effect problem.
  Two browser defects were reproduced: Input discarded confirm-key release events, and sprite extraction dropped
  V3NineSlice metadata. Direct-runtime shot tests had manually injected release events and could not detect the
  public input bridge defect.
- Input now reports one-shot logical confirm release across Z/Enter/Space aliases. The existing 60 Hz browser
  sampler buffers it until the 30 Hz battle step, clearing it on pause, scene exit and new battles. Press/hold and
  release responsibilities remain distinct. Real browser keydown/keyup now draws the BIG SHOT atlas frames.
- Original Chapter 2 has two enabled nine-slice sprites, `spr_battlebg_stretch` (2-pixel corners) and its hitbox
  (4-pixel corners). Extraction retains their metadata; the generic Canvas renderer handles stretch mode with
  fixed-size corners, atlas trimming, tint/alpha, transforms and source undersize clipping. Captured sprites remain
  ordinary sprites. Other tile modes throw a named unsupported error; current Chapter 2 has none enabled.
- Both possible circling effects were investigated. Susie's Supercharge Draw output matches the original at six
  charge levels; fast-shot release, sparks and final-shot cleanup work. Ralsei's guard follows the soul and
  intercepts full-size regular, wall and flying-head projectiles before exposed-soul damage. An unprotected control
  takes damage. Original generic `obj_basicbullet_sneo`, laser and Spamton-shot guard handlers do not destroy their
  projectile; these can continue through. The generic basic projectile was reproduced hitting guard HP30→20 and
  then soul HP120→110, matching the original handler. Guard mechanics were not changed speculatively. A reported
  failure on another projectile needs the exact attack/trajectory, not an assumption that all shots are blocked.
- Acceptance: 506 tests / 53 files, no skips (147.88 seconds), 18 tool tests, typecheck and Pages build pass. Four
  graphics-browser tests pass; both production-browser battle tests pass (37.2 seconds). The final production NEO
  test additionally checks the shipped nine-slice metadata and observes a real BIG SHOT after browser keyup
  (18.6 seconds). All three NEO reference comparisons remain green (27880 frames total).
- Tested artifact: `index-DwOLy-rD.js`, `neo-CI9oUwF6.js`, and the updated Chapter 2 sprite bundle. Original installed
  package hash is unchanged. Publish these accepted files together; changing only the JavaScript would leave the
  required nine-slice metadata absent. The guard uncertainty remains separate from the two reproduced browser bugs.

## 6. Where things are

| What | Where |
| --- | --- |
| Runtime (instances, events, draw order, strict reads) | `src/remake/gm/runtime.ts` |
| Maths, colours, sprites, collision | `src/remake/gm/math.ts`, `graphics.ts`, `sprites.ts`, `collision.ts` |
| Shared battle objects (soul, bullets, darkener, shake, damage writer, scr_damage) | `src/remake/deltarune/battle.ts` |
| Shared controller and tension bar | `src/remake/deltarune/controller.ts` |
| Chapter 2 controller menu, HUD and scripts | `controller-menu2.ts`, `controller-chapter2.ts`, `controller-script-parts.ts` |
| Heroes, FIGHT bar, spells, items | `src/remake/deltarune/party.ts` |
| Writer, faces, balloons, scr_battletext | `src/remake/deltarune/writer.ts` |
| Enemy template | `src/remake/deltarune/enemy.ts` |
| Chapter rules, hooks | `src/remake/deltarune/rules.ts` |
| Chapter 2 helpers and objects | `deltarune/chapter2*.ts`, `yellow-soul.ts` |
| NEO | `src/remake/bosses/spamton-neo/neo.ts` (enemy), `body.ts` (Draw), `chooser.ts`, `vines.ts` |
| NEO attack controller and flying heads | `src/remake/bosses/spamton-neo/bullet-controller.ts`, `flying-heads.ts` |
| NEO support and later attacks | `src/remake/bosses/spamton-neo/support.ts`, `walls.ts`, `wireheart.ts`, `phonecall.ts` |
| NEO phone hands and spread shot | `src/remake/bosses/spamton-neo/phonehands.ts` |
| NEO face, lasers, finale and battle presentation | `src/remake/bosses/spamton-neo/face.ts`, `lasers.ts`, `finale.ts`, `battle-scene.ts` |
| Hosts | `src/remake/host/engine.ts` (Chapter 1), `src/remake/host/neo.ts` (Chapter 2) |
| Parity helpers | `tests/parity/reference.ts` |

## 7. Deploy (only when asked)

1. Run `npm run build:pages`.
2. In `.tools/gh-pages-deploy`, run `git fetch`, then `git reset --hard origin/gh-pages`.
3. Copy `dist-pages/index.html` and `dist-pages/play`, and touch `.nojekyll`.
4. Commit, then `git push origin HEAD:gh-pages`.
5. Check `gh api repos/KaanAlper/UnderRune/pages/builds/latest`.

## 8. Working with the owner

- When a lot of code changes, say what each change found or fixed. The owner asked once whether everything was
  being rewritten. It was not: the fixes were targeted, and the new full-state test is what found them.
- Do not steal window focus. The recorder runs headless.
- Restart the dev server after new files appear in `public/generated`. Otherwise Vite serves `index.html` for them.
