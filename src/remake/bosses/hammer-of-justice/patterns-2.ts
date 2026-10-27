/** Source attack queue block 2; called in original event order, with shared event-local variables. */
import type { HammerPatternContext } from './pattern-context';
import { eq, lt, gt, le, ge, round, clamp } from '../../gm/math';
import { rtl } from './pattern-context';
export function patternBlock2({ s, rt, v, pattern, choose, irandom, debug }: HammerPatternContext) {
    if (eq(s.attackpattern, 200)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 1);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 20, 45);
        pattern("d", v.spearspeed, v.heartframes, 0, 30);
        pattern("r", v.spearspeed, v.heartframes, 0, 28);
        pattern("l", v.spearspeed, v.heartframes, 20, 20);
        pattern("r", v.spearspeed, v.heartframes, 0, 30);
        pattern("u", v.spearspeed, v.heartframes, 0, 28);
        pattern("d", v.spearspeed, v.heartframes, 20, 20);
        pattern("u", v.spearspeed, v.heartframes, 0, 30);
        pattern("l", v.spearspeed, v.heartframes, 0, 28);
    }
    if (eq(s.attackpattern, 210)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 10);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 20, 24);
        pattern("l", v.spearspeed, v.heartframes, 20, 10);
        pattern("d", v.spearspeed, v.heartframes, 0, 6);
        pattern("r", v.spearspeed, v.heartframes, 0, 25);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("l", v.spearspeed, v.heartframes, 0, 25);
    }
    if (eq(s.attackpattern, 211)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 10);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 20, 25);
        pattern("l", v.spearspeed, v.heartframes, 20, 14);
        pattern("d", v.spearspeed, v.heartframes, 0, 30);
        pattern("l", v.spearspeed, v.heartframes, 0, 40);
        pattern("d", v.spearspeed, v.heartframes, 20, 12);
        pattern("r", v.spearspeed, v.heartframes, 20, 14);
        pattern("u", v.spearspeed, v.heartframes, 0, 30);
        pattern("l", v.spearspeed, v.heartframes, 0, 25);
    }
    if (eq(s.attackpattern, 212)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 10);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 20, 20);
        pattern("u", v.spearspeed, v.heartframes, 20, 14);
        pattern("d", v.spearspeed, v.heartframes, 0, 5);
        pattern("d", v.spearspeed, v.heartframes, 0, 28);
        pattern("r", v.spearspeed, v.heartframes, 0, 5);
        pattern("r", v.spearspeed, v.heartframes, 0, 20);
        pattern("r", v.spearspeed, v.heartframes, 20, 9);
        pattern("r", v.spearspeed, v.heartframes, 20, 14);
        pattern("l", v.spearspeed, v.heartframes, 0, 5);
        pattern("l", v.spearspeed, v.heartframes, 0, 28);
        pattern("d", v.spearspeed, v.heartframes, 0, 5);
        pattern("d", v.spearspeed, v.heartframes, 0, 40);
    }
    if (eq(s.attackpattern, 213)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 20);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 20, 9);
        pattern("u", v.spearspeed, v.heartframes, 20, 9);
        pattern("u", v.spearspeed, v.heartframes, 20, 9);
        pattern("d", v.spearspeed, v.heartframes, 0, 31);
        pattern("r", v.spearspeed, v.heartframes, 0, 33);
        pattern("l", v.spearspeed, v.heartframes, 20, 9);
        pattern("l", v.spearspeed, v.heartframes, 20, 9);
        pattern("l", v.spearspeed, v.heartframes, 20, 9);
        pattern("r", v.spearspeed, v.heartframes, 0, 31);
        pattern("u", v.spearspeed, v.heartframes, 0, 28);
    }
    if (eq(s.attackpattern, 220)) {
        pattern(0, 0, 0, 1, 10);
        pattern(0, 0, 0, 3, 10);
        v.beat = 9;
        v.special = 20;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("r", 18, 30, 0, 0);
        pattern("dr", 18, 37, 0, 0);
        pattern("d", 18, 44, 0, 0);
        pattern("u", 18, 20, 20, 9);
        pattern("ur", 18, 50, 0, 9);
        pattern("r", 18, 50, 0, 6);
        pattern("ur", 18, 50, 0, 21);
        pattern("ul", 18, 50, 0, 0);
        pattern("ur", 18, 63, 0, 0);
        pattern("l", 20, 50, 20, 9);
        pattern("r", 18, 50, 0, 9);
        pattern("u", 18, 50, 0, 7);
        pattern("ur", 18, 50, 0, 16);
        pattern("u", 18, 50, 0, 9);
        pattern("l", 18, 50, 0, 12);
        (v.beat = 9);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("dl", 18, 45, 0, 12);
        pattern("u", 16, v.heartframes, 20, 7);
        pattern("l", 16, v.heartframes, 20, 7);
        pattern("r", 16, v.heartframes, 20, 7);
        pattern("ul", 18, 57, 0, 0);
        pattern("d", 16, v.heartframes, 20, 72);
        pattern("ur", 16, v.heartframes, 20, 11);
        pattern("ul", 16, v.heartframes, 20, 11);
        pattern("dr", 12, v.heartframes, 20, 7);
        pattern("u", 16, 50, 0, 31);
        pattern("r", 16, 50, 0, 0);
    }
    if (eq(s.attackpattern, 230)) {
        pattern(0, 0, 0, 1, 1);
        v.beat = 52;
        v.special = 35;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern(0, 0, 0, 1, v.beat);
        pattern("l", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern(0, 0, 0, 1, v.beat);
        pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern(0, 0, 0, 1, v.beat);
        pattern("d", v.spearspeed, v.heartframes, v.special, v.beat);
    }
    if (eq(s.attackpattern, 240)) {
        pattern(0, 0, 0, 1, 60);
        pattern(...rtl(() => choose("u", "r", "d", "l"), () => 8, () => 30, () => 16, () => 50));
        v.beat = 10;
        v.special = 16;
        v.spearspeed = 8;
        v.heartframes = 29;
        v.totalheartframes = v.heartframes;
        {
            const repeat0 = round(1);
            for (let index0 = 0; index0 < repeat0; index0++) {
                v.rand = choose(1, 2, 3);
                if (eq(v.rand, 1)) {
                    pattern("ur", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
                    pattern("ul", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
                    pattern("dl", (v.spearspeed * 1.2), v.heartframes, v.special, (v.beat - 4));
                }
                if (eq(v.rand, 2)) {
                    pattern("dr", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
                    pattern("ul", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
                    pattern("ur", (v.spearspeed * 1.2), v.heartframes, v.special, (v.beat - 4));
                }
                if (eq(v.rand, 3)) {
                    pattern("ul", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
                    pattern("ur", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
                    pattern("dr", (v.spearspeed * 1.2), v.heartframes, v.special, (v.beat - 4));
                }
                (v.rand = choose(1, 2, 3));
                if (eq(v.rand, 1)) {
                    pattern("l", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("r", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("l", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("l", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("r", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("l", (v.spearspeed * 1), v.heartframes, v.special, (v.beat + 8));
                }
                if (eq(v.rand, 2)) {
                    pattern("u", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("d", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("u", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("d", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("u", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("d", (v.spearspeed * 1), v.heartframes, v.special, (v.beat + 8));
                }
                if (eq(v.rand, 3)) {
                    pattern("ul", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("dr", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("ul", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("dr", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("ul", (v.spearspeed * 1), v.heartframes, v.special, v.beat);
                    pattern("dr", (v.spearspeed * 1), v.heartframes, v.special, (v.beat + 8));
                }
                (v.rand = choose(1, 2, 3));
                if (eq(v.rand, 1)) {
                    pattern("u", (v.spearspeed * 0.8), v.heartframes, v.special, (v.beat * 0.5));
                    pattern("u", (v.spearspeed * 0.8), v.heartframes, v.special, v.beat);
                    pattern("ul", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("ul", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("ur", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("ur", v.spearspeed, v.heartframes, v.special, v.beat);
                }
                if (eq(v.rand, 2)) {
                    pattern("ur", (v.spearspeed * 0.8), v.heartframes, v.special, (v.beat * 0.5));
                    pattern("ur", (v.spearspeed * 0.8), v.heartframes, v.special, v.beat);
                    pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("dr", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("dr", v.spearspeed, v.heartframes, v.special, v.beat);
                }
                if (eq(v.rand, 3)) {
                    pattern("dl", (v.spearspeed * 0.8), v.heartframes, v.special, (v.beat * 0.5));
                    pattern("dl", (v.spearspeed * 0.8), v.heartframes, v.special, v.beat);
                    pattern("d", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("d", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("dr", v.spearspeed, v.heartframes, v.special, v.beat);
                    pattern("dr", v.spearspeed, v.heartframes, v.special, v.beat);
                }
            }
        }
        pattern(...rtl(() => choose("u", "r", "d", "l"), () => (v.spearspeed * 0.8), () => v.heartframes, () => v.special, () => v.beat));
    }
    if (eq(s.attackpattern, 0)) {
        pattern(0, 0, 0, 1, 30);
        pattern(0, 0, 0, 34, 20);
        v.beat = 14;
        v.spearspeed = 8;
        v.heartframes = 50;
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 2));
        pattern("l", v.spearspeed, v.heartframes, 0, (v.beat * 2));
        pattern("d", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 2));
        pattern("r", v.spearspeed, v.heartframes, 0, (v.beat * 2));
    }
    if (eq(s.attackpattern, 1)) {
        pattern(0, 0, 0, 36, 15);
        v.beat = 16;
        v.spearspeed = 6;
        v.heartframes = 50;
        v.heartframestotal = v.heartframes;
        pattern("u", (v.spearspeed * 0.8), v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("l", (v.spearspeed * 0.8), v.heartframestotal, 0, 0);
        (v.heartframestotal += (v.beat * 2));
        pattern("d", (v.spearspeed * 0.6), v.heartframestotal, 0, 0);
        (v.heartframestotal += (v.beat * 0.5));
        (v.spearspeed = 18);
        (v.beat = 8);
        pattern("r", v.spearspeed, v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("r", v.spearspeed, v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("l", v.spearspeed, v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("l", v.spearspeed, v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("r", v.spearspeed, v.heartframestotal, 0, 0);
        (v.heartframestotal += v.beat);
        pattern("l", v.spearspeed, v.heartframestotal, 0, 0);
        (v.heartframestotal += (v.beat * 1.2));
        pattern("u", (v.spearspeed * 0.7), v.heartframestotal, 0, 0);
        (v.heartframestotal += (v.beat * 0.35));
        pattern("u", (v.spearspeed * 0.7), v.heartframestotal, 0, 0);
        (v.heartframestotal += (v.beat * 0.35));
        pattern("u", (v.spearspeed * 0.7), v.heartframestotal, 0, 0);
    }
    if (eq(s.attackpattern, 2)) {
        pattern(0, 0, 0, 36, 0);
        v.beat = 9;
        v.spearspeed = 14;
        v.heartframes = 50;
        v.heartframestotal = v.heartframes;
        pattern("l", 6, 110, 0, 0);
        pattern("r", 14, 40, 0, 0);
        pattern("u", 10, 50, 0, 0);
        pattern("d", 10, 60, 0, 0);
        pattern("r", 14, 70, 0, 0);
        pattern("d", 10, 80, 0, 0);
        pattern("u", 10, 90, 0, 0);
        pattern("r", 18, 115, 0, 0);
        pattern("u", 10, 130, 0, 0);
        pattern("d", 10, 140, 0, 0);
        pattern("l", 14, 150, 0, 0);
        pattern("d", 10, 160, 0, 0);
        pattern("u", 10, 170, 0, 0);
        pattern("l", 14, 180, 0, 0);
        pattern("l", 18, 190, 0, 0);
        pattern("r", 6, 205, 0, 0);
    }
    if (eq(s.attackpattern, 3)) {
        pattern(0, 0, 0, 36, 0);
        v.beat = 10;
        v.spearspeed = 14;
        v.heartframes = 40;
        pattern("u", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("r", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed - 6), v.heartframes, 0, v.beat);
        pattern("l", v.spearspeed, v.heartframes, 0, (v.beat * 2));
        pattern("u", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("r", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed * 0.3), (v.heartframes * 3), 0, 0);
        pattern("l", (v.spearspeed + 6), v.heartframes, 0, (v.beat * 2));
        pattern("u", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed + 6), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("l", v.spearspeed, v.heartframes, 0, v.beat);
        pattern(0, 0, 0, 3, (v.beat * 2));
        pattern("ul", (v.spearspeed * 1.2), v.heartframes, 0, (v.beat * 0.5));
        pattern("ul", (v.spearspeed * 1.2), v.heartframes, 0, (v.beat * 0.5));
        pattern("ul", (v.spearspeed * 1.2), v.heartframes, 0, (v.beat * 2));
        pattern("ur", (v.spearspeed + 4), v.heartframes, 0, v.beat);
    }
    if (eq(s.attackpattern, 4)) {
        v.beat = 10;
        v.spearspeed = 14;
        v.heartframes = 40;
        pattern(0, 0, 0, 36, 8);
        pattern("u", 1, 280, 355, 16);
        pattern(0, 0, 0, 9, 65);
        pattern("d", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("ul", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("d", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("ur", v.spearspeed, v.heartframes, 0, (v.beat * 2));
        pattern(0, 0, 0, 400, 1);
        pattern("d", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("r", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("d", (v.spearspeed - 4), v.heartframes, 0, v.beat);
        pattern("l", v.spearspeed, v.heartframes, 0, 65);
        pattern(0, (-70), 0, 32, 45);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 5)) {
        pattern(s.x, s.y, 60, 50, 9999);
    }
    if (eq(s.attackpattern, 5.5)) {
        v.beat = 25;
        pattern(0, (-70), 0, 32, 8);
        {
            const repeat1 = round(6);
            for (let index1 = 0; index1 < repeat1; index1++) {
                if (eq(v.prev, 0)) {
                    (v.a = choose(1, 2));
                }
                if (eq(v.prev, 1)) {
                    (v.a = choose(0, 2));
                }
                if (eq(v.prev, 2)) {
                    (v.a = choose(0, 1));
                }
                v.prev = v.a;
                if (eq(v.a, 0)) {
                    pattern("up1", 0, 0, 32, v.beat);
                }
                if (eq(v.a, 1)) {
                    pattern(0, (-70), 0, 32, v.beat);
                }
                if (eq(v.a, 2)) {
                    pattern("up2", 0, 0, 32, v.beat);
                }
            }
        }
        pattern(300, 125, (-5), 4, 0);
        pattern(378, 125, (-5), 4, 25);
        pattern(0, 0, (-1), 32, 41);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 6)) {
        pattern(0, 0, 0, 36, 0);
        v.beat = 10;
        v.spearspeed = 12;
        v.heartframes = 40;
        pattern("ul", (v.spearspeed - 2), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed - 2), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed - 2), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed - 2), v.heartframes, 0, v.beat);
        pattern("ur", v.spearspeed, v.heartframes, 0, (v.beat * 1.5));
        pattern("ur", v.spearspeed, v.heartframes, 0, (v.beat * 3));
        pattern("ul", (v.spearspeed + 2), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed + 2), v.heartframes, 0, v.beat);
        pattern("ur", (v.spearspeed + 2), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed + 2), v.heartframes, 0, (v.beat * 0.5));
        pattern("u", (v.spearspeed + 2), v.heartframes, 0, (v.beat * 0.5));
        pattern("ul", (v.spearspeed + 2), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed + 4), v.heartframes, 0, v.beat);
        pattern("ur", (v.spearspeed + 8), v.heartframes, 0, (v.beat * 3));
        (v.beat = 8);
        pattern("d", (v.spearspeed + 4), v.heartframes, 0, (v.beat * 1.5));
        pattern("dl", (v.spearspeed + 8), v.heartframes, 0, (v.beat * 1.5));
        pattern("d", (v.spearspeed + 4), v.heartframes, 0, v.beat);
        pattern("dr", (v.spearspeed + 8), v.heartframes, 0, v.beat);
    }
}
