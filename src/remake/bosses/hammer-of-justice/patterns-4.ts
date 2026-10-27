/** Source attack queue block 4; called in original event order, with shared event-local variables. */
import type { HammerPatternContext } from './pattern-context';
import { eq, lt, gt, le, ge, round, clamp } from '../../gm/math';
import { rtl } from './pattern-context';
export function patternBlock4({ s, rt, v, pattern, choose, irandom, debug }: HammerPatternContext) {
    if (eq(s.attackpattern, 23)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.beat = 9;
        v.special = 20;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, v.special, 90);
        pattern("u", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("l", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("d", v.spearspeed, v.heartframes, v.special, 120);
    }
    if (eq(s.attackpattern, 24)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.beat = 9;
        v.special = 21;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, v.special, 50);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("u", v.spearspeed, v.heartframes, 0, 35);
        pattern("u", v.spearspeed, v.heartframes, 0, 8);
        pattern("u", v.spearspeed, v.heartframes, 0, 25);
        pattern("l", v.spearspeed, v.heartframes, 0, 38);
        pattern("d", v.spearspeed, v.heartframes, 0, 25);
        pattern("r", v.spearspeed, v.heartframes, 0, 4);
        pattern("r", v.spearspeed, v.heartframes, 0, 4);
        pattern("r", v.spearspeed, v.heartframes, 0, 4);
        pattern("r", v.spearspeed, v.heartframes, 0, 4);
        pattern("r", v.spearspeed, v.heartframes, 0, 20);
        pattern("l", v.spearspeed, v.heartframes, 0, 6);
        pattern("l", v.spearspeed, v.heartframes, 0, 6);
        pattern("l", v.spearspeed, v.heartframes, 0, 18);
        pattern("l", v.spearspeed, v.heartframes, 0, 6);
        pattern("l", v.spearspeed, v.heartframes, 0, 6);
    }
    if (eq(s.attackpattern, 25)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        pattern("u", 10, 50, 25, 60, 100);
        pattern("r", 10, 50, 25, 22, 30);
        pattern("l", 10, 50, 25, 10, 15);
        pattern("d", 10, 50, 25, 40, 30);
    }
    if (eq(s.attackpattern, 26)) {
        v.beat = 40;
        v.special = 32;
        pattern("up1", 0, 0, v.special, v.beat);
        pattern("up2", 0, 0, v.special, v.beat);
        pattern("left1", 0, 0, v.special, v.beat);
        pattern("left2", 0, 0, v.special, v.beat);
        pattern("down1", 0, 0, v.special, v.beat);
        pattern("down2", 0, 0, v.special, v.beat);
        pattern("right1", 0, 0, v.special, v.beat);
        pattern("right2", 0, 0, v.special, v.beat);
        pattern("diag1", 0, 0, v.special, v.beat);
        pattern("diag2", 0, 0, v.special, v.beat);
        pattern("diag3", 0, 0, v.special, v.beat);
        pattern("diag4", 0, 0, v.special, v.beat);
        pattern(0, (-70), 0, v.special, v.beat);
        pattern(70, 0, 270, v.special, v.beat);
        pattern(90, (-90), 315, v.special, v.beat);
        pattern((-90), (-90), 45, v.special, v.beat);
        pattern((-90), 90, 135, v.special, v.beat);
        pattern(90, 90, 225, v.special, v.beat);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 27)) {
        pattern(0, 10, 60, 26, 9999);
        pattern(0, 10, 60, 0, 9999);
    }
    if (eq(s.attackpattern, 28)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 10);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("l", v.spearspeed, v.heartframes, 19, 20);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("r", v.spearspeed, v.heartframes, 19, 26);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 18);
        pattern("r", v.spearspeed, v.heartframes, 19, 11);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 20);
        pattern("l", v.spearspeed, v.heartframes, 19, 26);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 20);
    }
    if (eq(s.attackpattern, 29)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 1);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 40, 40);
        pattern("l", v.spearspeed, v.heartframes, 0, 8);
        pattern("dl", v.spearspeed, v.heartframes, 0, 8);
        pattern("d", v.spearspeed, v.heartframes, 0, 8);
        pattern("dr", v.spearspeed, v.heartframes, 0, 8);
        pattern("r", v.spearspeed, v.heartframes, 0, 35);
        pattern("d", v.spearspeed, v.heartframes, 40, 26);
        pattern("l", v.spearspeed, v.heartframes, 0, 8);
        pattern("ul", v.spearspeed, v.heartframes, 0, 8);
        pattern("u", v.spearspeed, v.heartframes, 0, 8);
        pattern("ur", v.spearspeed, v.heartframes, 0, 8);
        pattern("r", v.spearspeed, v.heartframes, 0, 8);
    }
    if (eq(s.attackpattern, 30)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 20);
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("l", v.spearspeed, v.heartframes, 40, 15);
        pattern("u", v.spearspeed, v.heartframes, 41, 10);
        pattern("d", v.spearspeed, v.heartframes, 42, 12);
        pattern("r", v.spearspeed, v.heartframes, 41, 8);
        pattern("ul", v.spearspeed, v.heartframes, 40, 35);
        pattern("dl", v.spearspeed, v.heartframes, 41, 10);
        pattern("dr", v.spearspeed, v.heartframes, 42, 51);
        pattern("ur", v.spearspeed, v.heartframes, 19, 12);
    }
    if (eq(s.attackpattern, 31)) {
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
    if (eq(s.attackpattern, 32)) {
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
    if (eq(s.attackpattern, 33)) {
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
    if (eq(s.attackpattern, 34)) {
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
    if (eq(s.attackpattern, 35)) {
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
    if (eq(s.attackpattern, 36)) {
        pattern(0, 0, 0, 1, 10);
        pattern(0, 0, 0, 3, 20);
        v.beat = 9;
        v.special = 20;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("l", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("d", v.spearspeed, v.heartframes, v.special, 100);
        pattern("ur", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("ul", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("dl", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("dr", v.spearspeed, v.heartframes, v.special, 120);
    }
    if (eq(s.attackpattern, 37)) {
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
    if (eq(s.attackpattern, 38)) {
        pattern(0, 0, 0, 1, 0);
        pattern(0, 0, 0, 3, 60);
        pattern(...rtl(() => choose("u", "r", "d", "l"), () => 8, () => 30, () => 16, () => 50));
        v.beat = 10;
        v.special = 16;
        v.spearspeed = 8;
        v.heartframes = 29;
        v.totalheartframes = v.heartframes;
        {
            const repeat6 = round(1);
            for (let index6 = 0; index6 < repeat6; index6++) {
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
}
