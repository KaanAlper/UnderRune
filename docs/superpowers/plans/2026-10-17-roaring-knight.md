# Roaring Knight (Chapter 3, encounter 115)

The owner moved the work here from the remaining Chapter 2 bosses (2026-10-17). The goal is the Knight playable in
the browser, matching the original frame by frame like the other battles.

## Evidence

- **Reference recordings**: `node tools/oracle-record.mjs ch3-115 --seed=11 --frames=4000 --god --dumps=40,60,...,3980
  --script=z|menu|act`.
  - The Chapter 3 launcher package had to be rebuilt for `--god` to hold the party at 99999 HP
    (`tools/build-native-launchers.ps1 -Chapters 3`; it reads `data.win` and checks its hash).
- **Battle start**: the battle begins about frame 40. On the Knight's first turn `obj_dbulletcontroller` makes
  `obj_heart_follower`, `obj_knight_pointing_cone`, `obj_fake_gt` and `obj_knight_pointing_star`. The background is
  `obj_bgfountaintest`.
- **Shared engine against Chapter 3's code**: an audit comparing every object and script the engine ports, Chapter 2
  against Chapter 3 (changed lines, approximate):

  | Object or script | Changed lines |
  | --- | --- |
  | `obj_battlecontroller` | ~1250 of 2374, new Alarm 11 |
  | `scr_charbox` (party boxes) | ~530 |
  | `obj_heroparent` | ~320, new Step and User 0 |
  | `obj_writer` | ~270 |
  | `scr_damage` | ~230 |
  | `obj_face` | ~110 |

  Smaller changes: `scr_spell`, `obj_tensionbar`, `obj_heart`, `obj_attackpress`, `obj_growtangle`, `scr_texttype`,
  `obj_dmgwriter` and the game over objects.
  - The table, `scr_encountersetup` and `scr_monstersetup` matter only for encounter 115.
- **Knight's code**: `obj_knight_enemy` (about 1500 lines) and the `obj_knight_*`, `obj_roaringknight_*` and
  `obj_bullet_knight_*` attack objects (about 12,000 lines including cutscene-only `obj_ch3_PTB02_*`, which are not
  needed).

## Approach

Same as Chapter 2: one engine, chapter differences in `forChapter` tables (46 call sites in 6 files) and
`ChapterRules`, boss code in `src/remake/bosses/roaring-knight/`, and named errors for anything not ported yet.
Nothing is public until the three recordings match to the end.

## Phases

1. **Host.**
   - Generalize `tools/build-chapter2-resources.mjs` to any chapter (`chapter3-resources.json`).
   - Generalize `createChapter2Registry` to a chapter registry.
   - Add `installChapter3Host`.
   - Add `ch3-115` to `ENGINE` and the development list.
   - Build the Chapter 3 remake bundle (`build-remake-assets.mjs 3`, `bossChapters` entry).
2. **Chapter 3 rules.**
   - Give each `forChapter` table a Chapter 3 entry. Where the audit shows Chapter 3's code is identical, reuse
     Chapter 2's part; elsewhere port the difference or leave a named error.
   - Port the controller, `scr_charbox`, hero, writer and `scr_damage` differences first, until the first
     recordings reach the Knight's first attack.
3. **The Knight.**
   - Port `obj_knight_enemy`: talk, ACTs, attacks chosen per turn, mercy.
   - Port the attack objects in the order the recordings use them.
   - Port the fountain background.
4. **Acceptance.**
   - All three recordings match to the end.
   - A browser test opens the card and plays a turn.
   - Then the encounter becomes public.

## Result (2026-10-18)

- **Recordings.** Three short runs (`z`, `menu`, `act`, 4000 frames: his first nine turns) and three long ones
  (`zlong`, `menulong`, `actlong`, 24,000 frames: phases 2 to 4, the charge, the roar and the ending, reached at
  frames 14,320, 17,580 and 16,040) match every frame and every full dump. The long runs are slow (minutes each),
  so they run only with `LONG_PARITY=1`.
- **What the long runs found.**
  - `with` over an object with three or more instances visits them newest first (two: in order). The roar's star
    list is built that way (`rt.withInstances`).
  - GML `clamp` applies the low bound, then the high one, so a high bound below the low one wins
    (`gm/math.ts clamp`); `scr_heartclamp` depends on it when the box shrinks to nothing.
  - `variable_instance_set` and `_get` ignore a name that is not a string; the roar eases a number by mistake
    (`obj_lerpvar`).
  - `scr_onscreen_tolerance` leaves its arguments in the caller's `obj` and `spacer`.
  - Dumps leave out stopped (negative) alarms.
- **Ending.** After the roar his first hit starts `end_cutscene_version` 1: a white fade, then `endcon` 2. The host
  ends the battle there as a win (`battleOutcome` hook). Losing the first time (`endcon` 1, no attempts yet) ends it
  as a loss without a game over, as the fountain scene takes over in the game.
- **Failure screen.** Chapter 3's `obj_gameover_init` keeps the soul whole in his battle (`tempflag[93]`) and floats it
  up; its 4-Z skip fades to white. When he has been fought before (`secretbossattempts`, from the player's saved
  `fought` list), `DEVICE_FAILURE` runs his own screen: advice by `knight_battle_losses` (kept across retries with
  flags 1263 and 1264), then GO BACK or GO FORWARD.
- **Items and spells.** Chapter 3's `scr_spell`, `scr_iteminfo`, `scr_spelltext` and `scr_spellinfo`: heals grow
  with armour 26 on the caster, UltraHeal grows and gets cheaper with each cast (flag 1045), the teas are rotten,
  and the TV dinner items are new. Rude Buster takes his damage reduction (`scalesRudeBuster`).
- **Not reachable in normal play.** Phase 1 turns 6 to 9 (attacks 152, 16, 17, 105) are never chosen; they stop
  with a named error.
- **Public.** `ch3-115` is in the playable list; `build:pages` builds and publishes the Chapter 3 bundle and his
  music.
