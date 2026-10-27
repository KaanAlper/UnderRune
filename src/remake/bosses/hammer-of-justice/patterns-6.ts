/** Source attack queue block 6; called in original event order, with shared event-local variables. */
import type { HammerPatternContext } from './pattern-context';
import { eq, lt, gt, le, ge, round, clamp } from '../../gm/math';
import { rtl } from './pattern-context';
export function patternBlock6({ s, rt, v, pattern, choose, irandom, debug }: HammerPatternContext) {
    if (eq(s.attackpattern, 55)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 40);
        v.beat = 15;
        v.spearspeed = 10;
        v.heartframes = 40;
        v.b = 0;
        for (v.i = 0; lt(v.i, 16); (v.i++)) {
            v._direction = (90 * choose(0, 1, 2, 3));
            pattern(v._direction, v.spearspeed, v.heartframes, 0, v.beat);
            pattern(...rtl(() => (v._direction + choose((-45), 45, 90, 180, 270)), () => v.spearspeed, () => v.heartframes, () => 0, () => v.beat));
            if (lt(v.spearspeed, 20)) {
                (v.spearspeed += 2);
            }
            if (((((((eq(v.i, 1) || eq(v.i, 2)) || eq(v.i, 3)) || eq(v.i, 4)) || eq(v.i, 5)) || eq(v.i, 6)) || eq(v.i, 7))) {
                (v.beat--);
            }
        }
    }
    if (eq(s.attackpattern, 56)) {
        pattern(0, 0, 0, 1, 60);
        pattern(0, 0, 0, 3, 1);
        v.beat = 7;
        v.spearspeed = 3;
        v.heartframes = 120;
        for (v.i = 0; lt(v.i, 24); (v.i++)) {
            v._direction = choose(0, 90, 180, 270);
            pattern(v._direction, v.spearspeed, v.heartframes, 0, v.beat);
            pattern(...rtl(() => (v._direction + choose((-45), 45, 90, 180, 270)), () => v.spearspeed, () => v.heartframes, () => 0, () => v.beat));
        }
    }
    if ((eq(s.attackpattern, 57) || eq(s.attackpattern, 58))) {
        pattern(0, 0, 0, 1, 20);
        pattern(0, 0, 0, 3, 20);
        v.beat = 10;
        v.spearspeed = 12;
        v.heartframes = 20;
        v.totalheartframes = v.heartframes;
        if (eq(s.attackpattern, 56)) {
            (v.spearspeed = 6);
            (v.beat = 8);
        }
        if (eq(s.attackpattern, 57)) {
            (v.spearspeed = 7);
            (v.beat = 7);
        }
        if (eq(s.attackpattern, 58)) {
            (v.spearspeed = 8);
            (v.beat = 6);
        }
        for (v.i = 0; lt(v.i, 20); (v.i++)) {
            v._direction = (90 * choose(0, 1, 2, 3));
            pattern(v._direction, v.spearspeed, v.totalheartframes, 0, 0);
            (v.totalheartframes += v.beat);
            pattern(...rtl(() => (v._direction + choose((-45), 45, 90, 180, 270)), () => v.spearspeed, () => v.totalheartframes, () => 0, () => 0));
            (v.totalheartframes += v.beat);
        }
    }
    if (eq(s.attackpattern, 56.5)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 1);
        v.beat = 20;
        v.spearspeed = 20;
        v.heartframes = 40;
        v.currentdistance = 40;
        for (v.i = 0; lt(v.i, 51); (v.i++)) {
            pattern(...rtl(() => (180 + (v.i * 45)), () => clamp((v.spearspeed - (v.i * 0.5)), 5, 20), () => v.currentdistance, () => 0, () => 1));
            (v.currentdistance += clamp((v.beat - v.i), 3, 20));
        }
    }
    if (eq(s.attackpattern, 57)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        pattern(270, 8, 30, 0, 3);
        pattern(270, 8, 30, 0, 3);
        pattern(270, 8, 30, 0, 3);
        pattern(270, 8, 30, 0, 3);
        pattern(180, 11, 30, 0, 3);
        pattern(180, 11, 30, 0, 3);
        pattern(180, 11, 30, 0, 3);
        pattern(180, 11, 30, 0, 3);
        pattern(0, 11, 30, 0, 3);
        pattern(0, 11, 30, 0, 3);
        pattern(0, 11, 30, 0, 3);
        pattern(0, 11, 30, 0, 3);
        pattern(90, 8, 30, 0, 3);
        pattern(90, 8, 30, 0, 3);
        pattern(90, 8, 30, 0, 3);
        pattern(90, 8, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(180, 11, 30, 0, 5);
        pattern(180, 11, 30, 0, 5);
        pattern(0, 11, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(90, 8, 30, 0, 5);
        pattern(180, 11, 30, 0, 5);
        pattern(90, 8, 30, 0, 3);
        pattern(90, 8, 30, 0, 3);
        pattern(90, 8, 30, 0, 5);
        pattern(90, 8, 30, 0, 5);
        pattern(0, 11, 30, 0, 5);
        pattern(0, 11, 30, 0, 5);
        pattern(180, 11, 30, 0, 5);
        pattern(180, 11, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(0, 11, 30, 0, 3);
        pattern(0, 11, 30, 0, 5);
        pattern(180, 11, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(180, 11, 30, 0, 3);
        pattern(180, 11, 30, 0, 5);
        pattern(0, 11, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
        pattern(270, 8, 30, 0, 5);
    }
    if (eq(s.attackpattern, 70)) {
        pattern(s.x, s.y, 60, 50, 9999);
    }
    if (eq(s.attackpattern, 71)) {
        pattern(s.x, s.y, 60, 51, 9999);
    }
    if (eq(s.attackpattern, 72)) {
        pattern(s.x, s.y, 60, 52, 9999);
    }
    if (eq(s.attackpattern, 73)) {
        pattern(s.x, s.y, 60, 53, 9999);
    }
    if ((gt(s.attackpattern, 69) && lt(s.attackpattern, 72))) {
        (s.boxoffset = true);
    }
    else {
        (s.boxoffset = false);
    }
    debug(("turn=" + String(s.trueturn)));
    debug(("balloonturn=" + String(s.turn)));
    debug(("attackpattern=" + String(s.attackpattern)));
    if (eq(s.trueturn, 0)) {
        (s.attackpattern = 1);
    }
    else if (eq(s.trueturn, 1)) {
        (s.attackpattern = 2);
    }
    else if (eq(s.trueturn, 2)) {
        (s.attackpattern = 3);
    }
    else if (eq(s.trueturn, 3)) {
        (s.attackpattern = 4);
    }
    else if (eq(s.trueturn, 4)) {
        (s.attackpattern = 72);
    }
    else if (eq(s.trueturn, 5)) {
        (s.attackpattern = 70);
    }
    else if (eq(s.trueturn, 6)) {
        (s.attackpattern = 6);
    }
    else if (eq(s.trueturn, 7)) {
        (s.attackpattern = 7);
    }
    else if (eq(s.trueturn, 8)) {
        (s.attackpattern = 12);
    }
    else if (eq(s.trueturn, 9)) {
        (s.attackpattern = 9);
    }
    else if (eq(s.trueturn, 10)) {
        (s.attackpattern = 47);
    }
    else if (eq(s.trueturn, 11)) {
        (s.attackpattern = 70);
    }
    else if (eq(s.trueturn, 12)) {
        (s.attackpattern = 13);
    }
    else if (eq(s.trueturn, 13)) {
        (s.attackpattern = 14);
    }
    else if (eq(s.trueturn, 14)) {
        (s.attackpattern = 53);
    }
    else if (eq(s.trueturn, 15)) {
        (s.attackpattern = 55);
    }
    else if (eq(s.trueturn, 16)) {
        (s.attackpattern = 56);
    }
    else if (eq(s.trueturn, 17)) {
        (s.attackpattern = 220);
    }
    else if (eq(s.trueturn, 20)) {
        (s.attackpattern = 19);
        (s.trueturn = 14);
        (s.reachedendphase = 1);
    }
    (s.trueturn++);
    (s.turn++);
}
