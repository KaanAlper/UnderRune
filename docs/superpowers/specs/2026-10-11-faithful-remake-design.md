# Faithful public remake of the boss battles

Date: 2026-10-11. Status: approved by the user in chat ("2 ama 100 benzerlik yap", then "okey devam").

## Goal

A version of UnderRune that anyone can play on GitHub Pages without owning or selecting game files. Battles run on our own TypeScript code and must match the original battle frame by frame. The repository and the site never contain the game's `data.win`, its bytecode or decompiled code. Sprites and music used by the remake are published with the site, as fan remakes such as shadowcrystal.dev do; that is tolerated for free fan projects but not risk-free, and the user was told so.

## Definition of 100%

For a boss, the remake and the original are run from the same random-generator state with the same key presses. A frame matches when:

- the same objects exist (by object type, in creation order),
- every object's position is within 0.01 px and its sprite frame is the same,
- party HP and TP are equal.

A boss is at 100% when every frame of every recorded attack matches. Only bosses at 100% are published. The 0.01 px tolerance absorbs the reference runtime's 32-bit float rounding; anything visible is a mismatch.

## Reference ("oracle")

The original bytecode on the patched Butterscotch runtime, locally (`tools/oracle-record.mjs`). The runtime patch adds `--trace-file`/`--trace-globals`: one JSON line per frame with every active object (id, object, x, y, image index, sprite, visible), the WELL512 state and selected globals. Runs are deterministic through `--seed` and `--playback-inputs`.

## Remake runtime

`src/remake/`:

- `gm/`: the GameMaker subset the battles use, ported from Butterscotch (AGPL-3.0, same license as this project): WELL512 random and `random`/`irandom`/`choose`, instances with built-in variables and motion (`speed`, `direction`, `friction`, `gravity`, `hspeed`/`vspeed`), alarms, image animation, the per-frame event order (xprevious, animation, Begin Step, alarms, Step, motion, collisions, End Step), sprite bounding boxes and precise masks, 30 frames per second.
- `deltarune/`: the battle framework re-implemented: soul movement, battle box, bullet base (damage, invincibility, graze and TP), turn timer, damage formula.
- `bosses/<boss>/`: each boss's attacks and AI.

Sprite masks, sprite frames and music come from the maintainer's install at build time and are published only to the `gh-pages` site.

## Parity harness

`tools/parity.mjs` loads a reference trace, starts the remake from the trace's random state and object positions at each attack's first frame, steps both, and reports the first mismatching frame per attack plus a per-boss score.

## Order

1. Reference recorder (done: Jevil traces record).
2. Runtime core with parity on simple motion (a bullet with speed/friction/direction).
3. Battle framework: soul, box, bullet base, damage.
4. Jevil: his 16 attack types to 100%, then his attack selection and turn flow.
5. Publish Jevil on the site; then the remaining 48 encounters on the same pipeline.

## Risks

- Every random call in the scene must be reproduced in the same order, including background effects, or random patterns diverge. The harness reports the first diverging frame to find these.
- Some bosses use special systems (yellow soul, shield, boxing, Shadow Mantle, Susiezilla) that each need their own framework piece.
- Scale: 49 encounters with many attacks each is a multi-session effort.
