/** Source attack queue block 3; called in original event order, with shared event-local variables. */
import type { HammerPatternContext } from './pattern-context';
import { eq, lt, gt, le, ge, round, clamp } from '../../gm/math';
import { rtl } from './pattern-context';
export function patternBlock3({ s, rt, v, pattern, choose, irandom, debug }: HammerPatternContext) {
    if (eq(s.attackpattern, 7)) {
        pattern(0, 0, 0, 36, 0);
        v.beat = 10;
        v.spearspeed = 12;
        v.heartframes = 40;
        pattern("l", (v.spearspeed * 1.2), v.heartframes, 0, v.beat);
        pattern("l", (v.spearspeed * 1.1), v.heartframes, 0, (v.beat * 0.5));
        pattern("l", (v.spearspeed * 1), v.heartframes, 0, (v.beat * 0.5));
        pattern("r", (v.spearspeed * 1.2), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed * 1.1), v.heartframes, 0, (v.beat * 0.5));
        pattern("r", (v.spearspeed * 1), v.heartframes, 0, (v.beat * 0.5));
        pattern("u", (v.spearspeed * 0.6), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 1.2));
        pattern("d", (v.spearspeed * 0.6), v.heartframes, 0, v.beat);
        pattern("dr", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed * 1.2), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed * 1.1), v.heartframes, 0, (v.beat * 0.5));
        pattern("r", (v.spearspeed * 1), v.heartframes, 0, (v.beat * 0.5));
        pattern("l", (v.spearspeed * 1.2), v.heartframes, 0, (v.beat * 0.5));
        pattern("l", (v.spearspeed * 1.1), v.heartframes, 0, (v.beat * 0.5));
        pattern("l", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("d", (v.spearspeed * 0.6), v.heartframes, 0, v.beat);
        pattern("dr", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.6), v.heartframes, 0, (v.beat + 20));
        pattern("u", v.spearspeed, v.heartframes, 19, 70);
        pattern("l", v.spearspeed, v.heartframes, 19, 15);
        pattern("r", v.spearspeed, v.heartframes, 19, 15);
    }
    if (eq(s.attackpattern, 8)) {
        pattern(s.x, s.y, 60, 51, 9999);
    }
    if (eq(s.attackpattern, 9)) {
        pattern(0, 0, 0, 36, 0);
        pattern(0, 0, 0, 3, 0);
        v.beat = 16;
        v.speardistance = 80;
        v.special = 14;
        v.heartframestotal = 100;
        v.prev = 1;
        pattern("u", 12, 40, 19, 14);
        pattern("l", 12, 40, 19, 14);
        pattern("d", 12, 40, 19, 50);
        pattern("r", 12, 50, 35, 44);
        (v.beat = 16);
        pattern(0, (-70), 0, 32, v.beat);
        {
            const repeat2 = round(6);
            for (let index2 = 0; index2 < repeat2; index2++) {
                if (eq(v.prev, 0)) {
                    (v.a = choose(1, 2));
                }
                if (eq(v.prev, 1)) {
                    (v.a = choose(0, 2));
                }
                if (eq(v.prev, 2)) {
                    (v.a = choose(0, 1));
                }
                (v.prev = v.a);
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
    if (eq(s.attackpattern, 10)) {
        pattern(0, (-70), 0, 32, s.swingdownbeatspeed);
        v.prev = 1;
        {
            const repeat3 = round(7);
            for (let index3 = 0; index3 < repeat3; index3++) {
                if (eq(v.prev, 0)) {
                    (v.a = choose(1, 2));
                }
                if (eq(v.prev, 1)) {
                    (v.a = choose(0, 2));
                }
                if (eq(v.prev, 2)) {
                    (v.a = choose(0, 1));
                }
                (v.prev = v.a);
                if (lt(irandom(100), 25)) {
                    pattern(...rtl(() => 0, () => 0, () => choose((-1), (-2)), () => 32, () => s.swingdownbeatspeed));
                }
                else {
                    if (eq(v.a, 0)) {
                        pattern("up1", 0, 0, 32, s.swingdownbeatspeed);
                    }
                    if (eq(v.a, 1)) {
                        pattern(0, (-70), 0, 32, s.swingdownbeatspeed);
                    }
                    if (eq(v.a, 2)) {
                        pattern("up2", 0, 0, 32, s.swingdownbeatspeed);
                    }
                }
            }
        }
        pattern(...rtl(() => 0, () => 0, () => choose((-1), (-2)), () => 32, () => (s.swingdownbeatspeed + 10)));
        (s.swingdownbeatspeed--);
        if (lt(s.swingdownbeatspeed, 19)) {
            (s.swingdownbeatspeed = 19);
        }
        v.beat = 44;
        pattern(0, 0, 0, 11, v.beat);
        pattern(0, 0, 0, 12, v.beat);
        pattern(0, 0, 0, 11, v.beat);
        pattern(0, 0, 0, 12, v.beat);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 11)) {
        pattern(s.x, s.y, 60, 50, 9999);
    }
    if (eq(s.attackpattern, 12)) {
        v.beat = 9;
        v.special = 19;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern(0, 0, 0, 36, 0);
        pattern(0, 0, 0, 3, 0);
        pattern("u", v.spearspeed, 40, v.special, v.beat);
        pattern("l", v.spearspeed, 40, v.special, v.beat);
        pattern("r", v.spearspeed, 40, v.special, v.beat);
        pattern("d", v.spearspeed, 40, v.special, 42);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("u", v.spearspeed, v.heartframes, 40.4, 23);
        pattern("l", v.spearspeed, v.heartframes, 0, 7);
        pattern("dl", v.spearspeed, v.heartframes, 0, 7);
        pattern("d", v.spearspeed, v.heartframes, 0, 7);
        pattern("dr", v.spearspeed, v.heartframes, 0, 7);
        pattern("r", v.spearspeed, v.heartframes, 0, 28);
        pattern("d", v.spearspeed, v.heartframes, 40.4, 23);
        pattern("l", v.spearspeed, v.heartframes, 0, 7);
        pattern("ul", v.spearspeed, v.heartframes, 0, 7);
        pattern("u", v.spearspeed, v.heartframes, 0, 7);
        pattern("ur", v.spearspeed, v.heartframes, 0, 7);
        pattern("r", v.spearspeed, v.heartframes, 0, 35);
        (v.spearspeed = 4);
        (v.heartframes = 90);
        pattern("u", 3, 129, 0, 0);
        pattern("dr", 4, 106, 0, 0);
        pattern("dr", 4, 114, 0, 8);
        pattern("l", 12, 30, 0, 8);
        pattern("r", 12, 38, 0, 8);
        pattern("d", 12, 38, 0, 8);
        pattern("ul", (v.spearspeed + 8), (v.heartframes - 40), 0, 0);
        pattern("dl", (v.spearspeed + 9), (v.heartframes - 30), 0, 0);
    }
    if (eq(s.attackpattern, 13)) {
        pattern(0, 0, 0, 36, 0);
        pattern(0, 0, 0, 3, 0);
        v.beat = 8;
        v.spearspeed = 12;
        v.heartframes = 40;
        pattern("u", v.spearspeed, v.heartframes, 20, 94);
        pattern("ur", v.spearspeed, v.heartframes, 20, 82);
        (v.heartframes = 155);
        (v.spearspeed = 5);
        pattern("r", v.spearspeed, v.heartframes, 0, 0);
        pattern("dr", v.spearspeed, (v.heartframes + 8), 0, 0);
        pattern("r", v.spearspeed, (v.heartframes + 16), 0, 0);
        pattern("ul", v.spearspeed, (v.heartframes + 24), 0, 0);
        pattern("l", v.spearspeed, (v.heartframes + 32), 0, 0);
        pattern("ur", (v.spearspeed * 2), (v.heartframes + 40), 0, 0);
        pattern("dl", (v.spearspeed * 3), (v.heartframes + 48), 0, 0);
        pattern("u", (v.spearspeed * 4), (v.heartframes + 56), 0, 0);
        (v.heartframes = 40);
        (v.spearspeed = 12);
        pattern("l", v.spearspeed, v.heartframes, 20, 10);
        pattern("ur", v.spearspeed, v.heartframes, 20, 10);
        pattern("u", v.spearspeed, v.heartframes, 0, 36);
        pattern("d", v.spearspeed, v.heartframes, 0, 33);
        pattern("l", v.spearspeed, v.heartframes, 0, 33);
    }
    if (eq(s.attackpattern, 14)) {
        pattern(0, 0, 0, 36, 0);
        pattern(0, 0, 0, 3, 0);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("l", v.spearspeed, v.heartframes, 19, 16);
        pattern("d", v.spearspeed, v.heartframes, 0, 6);
        pattern("dr", v.spearspeed, v.heartframes, 0, 6);
        pattern("r", v.spearspeed, v.heartframes, 19, 20);
        pattern("u", v.spearspeed, v.heartframes, 0, 6);
        pattern("d", v.spearspeed, v.heartframes, 0, 18);
        pattern("d", v.spearspeed, v.heartframes, 0, 6);
        pattern("u", v.spearspeed, v.heartframes, 0, 20);
        (v.heartframes = 40);
        pattern("ul", 6, 146, 0, 0);
        pattern("r", 12, v.heartframes, 20, 12);
        pattern("ur", 12, v.heartframes, 20, 12);
        pattern("u", 12, v.heartframes, 20, 102);
        pattern("dr", 12, v.heartframes, 20, 12);
        pattern("r", 12, v.heartframes, 20, 12);
        pattern("ur", 12, v.heartframes, 20, 77);
        pattern("u", 15, 40, 0, 5);
        pattern("u", 15, 40, 0, 5);
        pattern("u", 15, 40, 0, 5);
        pattern("u", 15, 40, 0, 18);
        pattern("u", 25, 30, 35, 36);
    }
    if (eq(s.attackpattern, 15)) {
        pattern(0, 0, 0, 36, 0);
        pattern(0, 0, 0, 3, 0);
        v.beat = 9;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, 20, 17);
        pattern("d", v.spearspeed, v.heartframes, 0, 30);
        pattern("r", v.spearspeed, v.heartframes, 0, 28);
        pattern("l", v.spearspeed, v.heartframes, 20, 20);
        pattern("r", v.spearspeed, v.heartframes, 0, 30);
        pattern("u", v.spearspeed, v.heartframes, 0, 28);
        pattern("d", v.spearspeed, v.heartframes, 20, 12);
        pattern("r", v.spearspeed, v.heartframes, 20, 14);
        pattern("u", v.spearspeed, v.heartframes, 0, 30);
        pattern("l", v.spearspeed, v.heartframes, 0, 35);
        (v.beat = 9);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("u", v.spearspeed, v.heartframes, 20, 9);
        pattern("u", v.spearspeed, v.heartframes, 20, 14);
        pattern("d", v.spearspeed, v.heartframes, 0, 5);
        pattern("d", v.spearspeed, v.heartframes, 0, 28);
        pattern("r", v.spearspeed, v.heartframes, 0, 5);
        pattern("r", v.spearspeed, v.heartframes, 0, 20);
    }
    if (eq(s.attackpattern, 16)) {
        pattern(s.x, s.y, 60, 52, 9999);
    }
    if (eq(s.attackpattern, 17)) {
        pattern(0, 0, 0, 36, 0);
        pattern(0, 0, 0, 3, 0);
        v.beat = 9;
        v.special = 20;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("l", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("d", v.spearspeed, v.heartframes, v.special, 91);
        (v.beat = 9);
        (v.special = 21);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("u", v.spearspeed, v.heartframes, v.special, 16);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("r", v.spearspeed, v.heartframes, 0, 4);
        pattern("r", v.spearspeed, v.heartframes, 0, 4);
        pattern("r", v.spearspeed, v.heartframes, 0, 24);
        pattern("u", v.spearspeed, v.heartframes, 0, 4);
        pattern("u", v.spearspeed, v.heartframes, 0, 4);
        pattern("u", v.spearspeed, v.heartframes, 0, 20);
        pattern("ul", v.spearspeed, v.heartframes, 0, 4);
        pattern("ul", v.spearspeed, v.heartframes, 0, 4);
        pattern("ul", v.spearspeed, v.heartframes, 0, 30);
        pattern("d", v.spearspeed, v.heartframes, 0, 10);
        pattern("r", 10, 50, 0, 20);
        pattern("l", v.spearspeed, v.heartframes, 0, 8);
        pattern("u", v.spearspeed, v.heartframes, 0, 8);
        pattern("r", v.spearspeed, v.heartframes, 0, 20);
        pattern("ul", v.spearspeed, v.heartframes, 0, 8);
        pattern("ur", v.spearspeed, v.heartframes, 0, 20);
        pattern("dl", v.spearspeed, v.heartframes, 0, 8);
        pattern("dr", v.spearspeed, v.heartframes, 0, 8);
        pattern("dr", v.spearspeed, v.heartframes, 0, 20);
        pattern("ul", v.spearspeed, v.heartframes, 0, 5);
        pattern("ul", v.spearspeed, v.heartframes, 0, 8);
        pattern("u", v.spearspeed, v.heartframes, 0, 5);
        pattern("u", v.spearspeed, v.heartframes, 0, 5);
    }
    if (eq(s.attackpattern, 18)) {
        pattern(0, 0, 0, 36, 40);
        pattern(0, 0, 0, 3, 0);
        pattern("l", 12, 50, 35, 40);
        pattern(0, 0, 0, 29, 20);
        pattern(0, 0, 0, 27, 20);
        v.beat = 18;
        v.special = 32;
        pattern(70, 0, 270, v.special, v.beat);
        pattern("diag1", 0, 0, v.special, v.beat);
        pattern(0, (-70), 0, v.special, v.beat);
        pattern("diag2", 0, 0, v.special, v.beat);
        pattern((-70), 0, 90, v.special, v.beat);
        pattern("diag3", 0, 0, v.special, v.beat);
        pattern(0, 70, 180, v.special, v.beat);
        pattern("diag4", 0, 0, v.special, 60);
        pattern(0, 0, 0, 31, 5);
        v.c = 0;
        v.beat2 = 8;
        (v.beat = 30);
        {
            const repeat4 = round(2);
            for (let index4 = 0; index4 < repeat4; index4++) {
                if (eq(v.c, 1)) {
                    pattern(0, 0, 0, 1, 1);
                }
                (v.c = 1);
                pattern("l", 16, 20, 30, v.beat2);
                pattern("up1", 0, 0, 32, v.beat);
                pattern(0, 0, 0, 1, 1);
                pattern("r", 16, 20, 30, v.beat2);
                pattern("up2", 0, 0, 32, v.beat);
                (v.beat2--);
            }
        }
        pattern(0, 0, 0, 1, 8);
        pattern("u", 16, 20, 30, v.beat2);
        pattern(...rtl(() => choose("right1", "left1"), () => 0, () => 0, () => 32, () => v.beat));
        (v.beat2--);
        v.b = 0;
        {
            const repeat5 = round(8);
            for (let index5 = 0; index5 < repeat5; index5++) {
                (v.b = choose(0, 1, 2, 3));
                if (eq(v.b, 0)) {
                    pattern(0, 0, 0, 1, 1);
                    pattern("l", 16, 20, 30, v.beat2);
                    pattern(...rtl(() => choose("up1", "down1"), () => 0, () => 0, () => 32, () => v.beat));
                }
                if (eq(v.b, 1)) {
                    pattern(0, 0, 0, 1, 1);
                    pattern("r", 16, 20, 30, v.beat2);
                    pattern(...rtl(() => choose("up2", "down2"), () => 0, () => 0, () => 32, () => v.beat));
                }
                if (eq(v.b, 3)) {
                    pattern(0, 0, 0, 1, 1);
                    pattern("u", 16, 20, 30, v.beat2);
                    pattern(...rtl(() => choose("right1", "left1"), () => 0, () => 0, () => 32, () => v.beat));
                }
                if (eq(v.b, 4)) {
                    pattern(0, 0, 0, 1, 1);
                    pattern("d", 16, 20, 30, v.beat2);
                    pattern(...rtl(() => choose("right2", "left2"), () => 0, () => 0, () => 32, () => v.beat));
                }
                (v.beat2--);
                if (lt(v.beat2, 0)) {
                    (v.beat2 = 0);
                }
            }
        }
        pattern(3, 0, 0, 28, 0);
        pattern(0, 0, 0, 33, 0);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 27);
        pattern(0, 0, 0, 9, 60);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 19)) {
        pattern(0, 0, 0, 36, 1);
        pattern(0, 0, 0, 3, 0);
        pattern("u", 8, 47, 41.1, 10);
        pattern("l", 6, 55, 42.1, 20);
        pattern("ur", 10, 47, 40.6, 8);
        pattern("r", 12, 47, 21.66, 116);
        pattern("u", 10, 47, 20.1, 55);
        pattern("l", 18, 50, 35, 55);
        pattern("diag1", 0, 0, 32, 16);
        pattern(0, (-70), 0, 32, 15);
        pattern("diag2", 0, 0, 32, 14);
        pattern((-70), 0, 90, 32, 13);
        pattern("diag3", 0, 0, 32, 12);
        pattern(0, 70, 180, 32, 11);
        pattern("diag4", 0, 0, 32, 10);
        pattern(70, 0, 270, 32, 9);
        pattern("diag1", 0, 0, 32, 8);
        pattern(0, (-70), 0, 32, 8);
        pattern("diag2", 0, 0, 32, 7);
        pattern((-70), 0, 90, 32, 7);
        pattern("diag3", 0, 0, 32, 7);
        pattern(0, 70, 180, 32, 7);
        pattern("diag4", 0, 0, 32, 7);
        pattern(70, 0, 270, 32, 6);
        pattern("diag1", 0, 0, 32, 6);
        pattern(0, (-70), 0, 32, 21);
        pattern(0, 0, 0, 27, 10);
        pattern(3, 0, 0, 28, 0);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 2);
        pattern(0, 0, (-3), 4, 38);
        pattern(0, 0, 0, 10.5, 8);
        pattern(0, 0, 0, 9, 60);
    }
    if (eq(s.attackpattern, 20)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.beat = 16;
        v.speardistance = 80;
        v.special = 14;
        v.heartframestotal = 100;
        (v.beat = 16);
        (v.heartframestotal = 100);
        pattern("u", 40, v.heartframestotal, v.special, 40, 80);
        (v.heartframestotal += v.beat);
        pattern("u", 20, v.heartframestotal, v.special, 10, 120);
        (v.heartframestotal += v.beat);
        pattern("u", 20, v.heartframestotal, v.special, 10, 120);
        (v.heartframestotal += v.beat);
        pattern("l", 40, v.heartframestotal, v.special, 0, 80);
        (v.heartframestotal += v.beat);
        pattern("r", 20, v.heartframestotal, v.special, 0, 150);
        (v.heartframestotal += v.beat);
        pattern("r", 30, v.heartframestotal, v.special, 40, 400);
        (v.heartframestotal += v.beat);
        (v.heartframestotal = 130);
        pattern("u", 65, v.heartframestotal, v.special, 0, 40);
        (v.heartframestotal += v.beat);
        pattern("d", 30, v.heartframestotal, v.special, 0, 80);
        (v.heartframestotal += v.beat);
        pattern("l", 40, v.heartframestotal, v.special, 0, 160);
        (v.heartframestotal += v.beat);
        pattern("r", 55, v.heartframestotal, v.special, 50, 300);
        (v.heartframestotal += v.beat);
        (v.heartframestotal = 130);
        pattern("l", 30, v.heartframestotal, v.special, 0, 160);
        (v.heartframestotal += v.beat);
        pattern("u", 37, v.heartframestotal, v.special, 0, 300);
        (v.heartframestotal += (v.beat * 2));
        pattern("u", 45, v.heartframestotal, v.special, 0, 300);
        (v.heartframestotal += v.beat);
        pattern("r", 55, v.heartframestotal, v.special, 0, 80);
        (v.heartframestotal += v.beat);
        pattern("r", 65, v.heartframestotal, v.special, 50, 300);
        (v.heartframestotal += v.beat);
        (v.heartframestotal = 130);
        pattern("l", 65, v.heartframestotal, v.special, 0, 40);
        (v.heartframestotal += v.beat);
        pattern("r", 30, v.heartframestotal, v.special, 0, 80);
        (v.heartframestotal += v.beat);
        pattern("u", 40, v.heartframestotal, v.special, 0, 160);
        (v.heartframestotal += v.beat);
        pattern("d", 55, v.heartframestotal, v.special, 50, 300);
        (v.heartframestotal += v.beat);
    }
    if (eq(s.attackpattern, 21)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.beat = 10;
        v.speardistance = 80;
        v.special = 14;
        v.heartframestotal = 100;
        pattern("d", 200, (v.heartframestotal + 70), v.special, 20, 260);
        pattern("u", 165, (v.heartframestotal + 50), v.special, 0, 140);
        (v.heartframestotal += v.beat);
        pattern("l", 60, v.heartframestotal, v.special, 0, 80);
        (v.heartframestotal += v.beat);
        pattern("r", 70, v.heartframestotal, v.special, 0, 340);
        (v.heartframestotal += v.beat);
        pattern("u", 80, v.heartframestotal, v.special, 0, 200);
        (v.heartframestotal += (v.beat + 16));
        pattern("d", 100, v.heartframestotal, v.special, 0, 340);
        (v.heartframestotal += v.beat);
        (v.heartframestotal += v.beat);
        pattern("l", 120, v.heartframestotal, v.special, 0, 250);
        (v.heartframestotal += v.beat);
        pattern("r", 130, v.heartframestotal, v.special, 180, 340);
        (v.heartframestotal += v.beat);
    }
    if (eq(s.attackpattern, 22)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.beat = 9;
        v.special = 19;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern("u", v.spearspeed, v.heartframes, v.special, 90);
        pattern("u", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("l", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("r", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("d", v.spearspeed, v.heartframes, v.special, 50);
        pattern("ul", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
        pattern("u", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("ur", v.spearspeed, v.heartframes, v.special, 50);
        pattern("dl", (v.spearspeed * 1.2), v.heartframes, v.special, v.beat);
        pattern("d", v.spearspeed, v.heartframes, v.special, v.beat);
        pattern("dr", v.spearspeed, v.heartframes, v.special, v.beat);
    }
}
