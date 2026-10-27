/** Source attack queue block 5; called in original event order, with shared event-local variables. */
import type { HammerPatternContext } from './pattern-context';
import { eq, lt, gt, le, ge, round, clamp } from '../../gm/math';
import { rtl } from './pattern-context';
export function patternBlock5({ s, rt, v, pattern, choose, irandom, debug }: HammerPatternContext) {
    if (eq(s.attackpattern, 39)) {
        v.beat = 44;
        pattern(0, 0, 0, 11, v.beat);
        pattern(0, 0, 0, 12, v.beat);
        pattern(0, 0, 0, 12, v.beat);
        pattern(0, 0, 0, 11, v.beat);
        pattern(0, 0, 0, 27, 1);
        v.prev = 1;
        (v.beat = 26);
        {
            const repeat7 = round(14);
            for (let index7 = 0; index7 < repeat7; index7++) {
                pattern(...rtl(() => choose("up1", "up2", "right1", "right2", "left1", "left2", "down1", "down2"), () => 0, () => 0, () => 32, () => v.beat));
                if (gt(v.beat, 16)) {
                    (v.beat--);
                }
            }
        }
        pattern(1, 0, 0, 28, 20);
        pattern(364, 145, (-1), 4, 0);
        pattern(0, 0, 13, 4, 0);
        pattern(0, 0, 15, 4, 0);
        pattern(0, 0, 18, 4, 20);
        pattern(2, 0, 0, 28, 0);
        pattern(282, 145, (-1), 4, 0);
        pattern(0, 0, 17, 4, 0);
        pattern(0, 0, 14, 4, 0);
        pattern(0, 0, 16, 4, 35);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 40)) {
        v.beat = 9;
        v.special = 19;
        v.spearspeed = 12;
        v.heartframes = 50;
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
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
        pattern("dr", v.spearspeed, v.heartframes, v.special, 60);
        (v.beat = 9);
        (v.special = 20);
        (v.spearspeed = 12);
        (v.heartframes = 50);
        pattern("u", v.spearspeed, v.heartframes, v.special, 80);
        pattern("l", v.spearspeed, v.heartframes, v.special, 80);
        pattern("r", v.spearspeed, v.heartframes, v.special, 120);
    }
    if (eq(s.attackpattern, 41)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 11, 30, 2, 31);
        pattern(0, 0, 0, 11, 38);
        pattern(0, 0, 0, 12, 33);
        pattern(0, 0, 0, 11, 33);
        pattern(0, 0, 0, 12, 4);
        pattern(268, 145, (-1), 4, 20);
        pattern(378, 145, (-1), 4, 40);
        pattern(378, 125, 0, 4, 1);
        pattern(268, 135, (-1), 4, 30);
        pattern(378, 135, (-1), 4, 1);
        pattern(268, 135, 0, 4, 30);
        pattern(0, 0, 0, 11, 33);
        pattern(0, 0, 0, 12, 36);
        pattern(0, 0, 0, 12, 5);
        pattern(115, 135, (-1), 4, 32);
        pattern(0, 0, 0, 10, 1);
    }
    if (eq(s.attackpattern, 42)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.special = 22;
        v.spearspeed = 6;
        v.heartframes = 50;
        pattern("u", 18, v.heartframes, v.special, 90);
        pattern("l", 18, v.heartframes, v.special, 12);
        pattern("u", v.spearspeed, v.heartframes, 0, 36);
        pattern("l", v.spearspeed, v.heartframes, 0, 8);
        pattern("d", v.spearspeed, v.heartframes, 0, 24);
        pattern("r", 18, v.heartframes, v.special, 9);
        pattern("u", v.spearspeed, v.heartframes, 0, 31);
        pattern("d", v.spearspeed, v.heartframes, 0, 20);
    }
    if (eq(s.attackpattern, 43)) {
        pattern(100, 145, (-1), 13, 35);
        pattern(100, 145, (-1), 4, 5);
        pattern(150, 145, (-1), 4, 5);
        pattern(200, 145, (-1), 4, 5);
        pattern(250, 145, (-1), 4, 5);
        pattern(300, 145, (-1), 4, 5);
        pattern(350, 145, (-1), 4, 5);
        pattern(400, 145, (-1), 4, 5);
        pattern(450, 145, (-1), 4, 40);
        pattern(550, 145, (-1), 4, 5);
        pattern(500, 145, (-1), 4, 5);
        pattern(450, 145, (-1), 4, 5);
        pattern(400, 145, (-1), 4, 5);
        pattern(350, 145, (-1), 4, 5);
        pattern(300, 145, (-1), 4, 5);
        pattern(250, 145, (-1), 4, 5);
        pattern(200, 145, (-1), 4, 35);
        pattern(100, 145, (-1), 4, 1);
        pattern(150, 145, (-1), 4, 1);
        pattern(300, 145, (-1), 4, 1);
        pattern(350, 145, (-1), 4, 1);
        pattern(500, 145, (-1), 4, 1);
        pattern(550, 145, (-1), 4, 17);
        pattern(200, 145, (-1), 4, 1);
        pattern(250, 145, (-1), 4, 1);
        pattern(400, 145, (-1), 4, 1);
        pattern(450, 145, (-1), 4, 20);
        pattern(100, 145, (-2), 4, 1);
        pattern(150, 145, (-2), 4, 1);
        pattern(200, 145, (-2), 4, 1);
        pattern(250, 145, (-2), 4, 1);
        pattern(300, 145, (-2), 4, 1);
        pattern(350, 145, (-2), 4, 1);
        pattern(470, 145, (-2), 4, 1);
        pattern(520, 145, (-2), 4, 35);
        pattern(80, 145, (-2), 4, 1);
        pattern(130, 145, (-2), 4, 1);
        pattern(300, 145, (-2), 4, 1);
        pattern(350, 145, (-2), 4, 1);
        pattern(400, 145, (-2), 4, 1);
        pattern(450, 145, (-2), 4, 1);
        pattern(500, 145, (-2), 4, 35);
        pattern(200, 145, (-1), 4, 1);
        pattern(250, 145, (-1), 4, 1);
        pattern(400, 145, (-1), 4, 1);
        pattern(450, 145, (-1), 4, 17);
        pattern(100, 145, (-1), 4, 1);
        pattern(150, 145, (-1), 4, 1);
        pattern(300, 145, (-1), 4, 1);
        pattern(350, 145, (-1), 4, 1);
        pattern(500, 145, (-1), 4, 1);
        pattern(550, 145, (-1), 4, 29);
        pattern(0, 0, 0, 10, 5);
    }
    if (eq(s.attackpattern, 44)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        v.beat = 16;
        v.spearspeed = 25;
        v.heartframes = 100;
        v.heartframestotal = v.heartframes;
        pattern("u", (v.spearspeed * 0.8), v.heartframestotal, 14, 10);
        (v.heartframestotal += v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframestotal, 14, 10);
        (v.heartframestotal += v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframestotal, 14, 10);
        (v.heartframestotal += v.beat);
        pattern(270, 8, 30, 16, 10);
        pattern(270, 8, 30, 16, 10);
        pattern(270, 8, 30, 16, 21);
        pattern("l", (v.spearspeed * 0.8), v.heartframestotal, 14, 10);
        (v.heartframestotal += v.beat);
        pattern("d", (v.spearspeed * 0.6), v.heartframestotal, 14, 10);
        (v.heartframestotal += (v.beat * 0.5));
        pattern("r", v.spearspeed, v.heartframestotal, 14, 10);
        pattern("r", v.spearspeed, v.heartframestotal, 14, 10);
        pattern("l", v.spearspeed, v.heartframestotal, 14, 10);
        pattern("l", v.spearspeed, v.heartframestotal, 14, 10);
        pattern("r", v.spearspeed, v.heartframestotal, 14, 10);
        pattern("l", v.spearspeed, v.heartframestotal, 14, 10);
        pattern("u", (v.spearspeed * 0.7), v.heartframestotal, 14, 10);
        pattern("d", (v.spearspeed * 0.7), v.heartframestotal, 14, 10);
        pattern("u", (v.spearspeed * 0.7), v.heartframestotal, 14, 10);
        pattern(0, 8, 30, 16, 3);
        pattern(0, 8, 30, 16, 3);
        pattern(0, 8, 30, 16, 3);
        pattern(0, 8, 30, 16, 3);
        pattern(0, 8, 30, 16, 7);
        pattern(180, 8, 30, 16, 3);
        pattern(180, 8, 30, 16, 3);
        pattern(180, 8, 30, 16, 3);
        pattern(180, 8, 30, 16, 3);
        pattern(180, 8, 30, 16, 14);
        pattern(180, 8, 30, 360, 3);
        pattern(180, 8, 30, 360, 3);
        pattern(180, 8, 30, 360, 3);
        pattern(180, 8, 30, 360, 3);
        pattern(180, 8, 30, 360, 12);
        pattern(90, 8, 30, 270, 3);
        pattern(90, 8, 30, 270, 3);
        pattern(90, 8, 30, 270, 3);
        pattern(90, 8, 30, 270, 3);
        pattern(90, 8, 30, 270, 20);
        v.aa = 38;
        (v.beat = 18);
        v.len = 150;
        pattern(0, (v.aa + (v.beat * 7)), v.len, 17, 0);
        pattern(45, (v.aa + (v.beat * 10)), v.len, 17, 0);
        pattern(90, (v.aa + (v.beat * 14)), v.len, 17, 0);
        pattern(135, (v.aa + (v.beat * 4)), v.len, 17, 0);
        pattern(180, (v.aa + (v.beat * 11)), v.len, 17, 0);
        pattern(225, (v.aa + (v.beat * 3)), v.len, 17, 0);
        pattern(270, (v.aa + (v.beat * 1)), v.len, 17, 0);
        pattern(315, (v.aa + (v.beat * 15)), v.len, 17, 0);
        (v.len = 200);
        pattern(0, (v.aa + (v.beat * 0)), v.len, 17, 0);
        pattern(45, (v.aa + (v.beat * 5)), v.len, 17, 0);
        pattern(90, (v.aa + (v.beat * 6)), v.len, 17, 0);
        pattern(135, (v.aa + (v.beat * 13)), v.len, 17, 0);
        pattern(180, (v.aa + (v.beat * 9)), v.len, 17, 0);
        pattern(225, (v.aa + (v.beat * 8)), v.len, 17, 0);
        pattern(270, (v.aa + (v.beat * 12)), v.len, 17, 0);
        pattern(315, (v.aa + (v.beat * 2)), v.len, 17, 320);
        (v.len = 150);
        pattern(0, (v.aa + (v.beat * 7)), v.len, 18, 0);
        pattern(45, (v.aa + (v.beat * 10)), v.len, 18, 0);
        pattern(90, (v.aa + (v.beat * 14)), v.len, 18, 0);
        pattern(135, (v.aa + (v.beat * 4)), v.len, 18, 0);
        pattern(180, (v.aa + (v.beat * 11)), v.len, 18, 0);
        pattern(225, (v.aa + (v.beat * 3)), v.len, 18, 0);
        pattern(270, (v.aa + (v.beat * 1)), v.len, 18, 0);
        pattern(315, (v.aa + (v.beat * 15)), v.len, 18, 0);
        (v.len = 200);
        pattern(0, (v.aa + (v.beat * 0)), v.len, 18, 0);
        pattern(45, (v.aa + (v.beat * 5)), v.len, 18, 0);
        pattern(90, (v.aa + (v.beat * 6)), v.len, 18, 0);
        pattern(135, (v.aa + (v.beat * 13)), v.len, 18, 0);
        pattern(180, (v.aa + (v.beat * 9)), v.len, 18, 0);
        pattern(225, (v.aa + (v.beat * 8)), v.len, 18, 0);
        pattern(270, (v.aa + (v.beat * 12)), v.len, 18, 0);
        pattern(315, (v.aa + (v.beat * 2)), v.len, 18, 150);
    }
    if (eq(s.attackpattern, 45)) {
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 3);
        pattern(0, 0, (-3), 4, 27);
        pattern(0, 0, 0, 9, 60);
        pattern(0, 0, 0, 10, 5);
    }
    if (eq(s.attackpattern, 46)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        pattern(0, 0, 0, 8, 11);
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
        pattern(90, 8, 30, 0, 31);
        pattern(270, 0, 0, 2, 41);
        pattern(358, 115, 0, 4, 30);
        pattern(0, 0, 0, 1, 11);
        pattern(90, 0, 0, 2, 41);
        pattern(278, 115, (-1), 4, 30);
        pattern(0, 0, 0, 1, 11);
        pattern(0, 0, 0, 2, 41);
        pattern(358, 115, 0, 4, 30);
        pattern(0, 0, 0, 1, 11);
        pattern(180, 0, 0, 2, 41);
        pattern(278, 115, (-1), 4, 20);
        pattern(0, 0, 0, 1, 1);
        pattern(0, 11, 30, 0, 10);
        pattern(180, 11, 30, 0, 10);
        pattern(0, 11, 30, 0, 21);
        pattern(180, 11, 30, 0, 10);
        pattern(0, 11, 30, 0, 10);
        pattern(180, 11, 30, 0, 21);
        pattern(270, 0, 0, 2, 51);
        pattern(268, 115, 60, 4, 1);
        pattern(316, 115, 60, 4, 1);
        pattern(358, 115, 0, 4, 20);
        pattern(0, 0, 0, 9, 61);
    }
    if (eq(s.attackpattern, 47)) {
        pattern(100, 145, (-1), 13, 35);
        pattern(100, 145, (-1), 4, 5);
        pattern(150, 145, (-1), 4, 5);
        pattern(200, 145, (-1), 4, 5);
        pattern(250, 145, (-1), 4, 5);
        pattern(300, 145, (-1), 4, 5);
        pattern(350, 145, (-1), 4, 5);
        pattern(400, 145, (-1), 4, 5);
        pattern(450, 145, (-1), 4, 40);
        pattern(550, 145, (-1), 4, 8);
        pattern(500, 145, (-1), 4, 8);
        pattern(450, 145, (-1), 4, 8);
        pattern(400, 145, (-1), 4, 8);
        pattern(350, 145, (-1), 4, 8);
        pattern(300, 145, (-1), 4, 8);
        pattern(250, 145, (-1), 4, 8);
        pattern(200, 145, (-1), 4, 35);
        pattern(100, 145, (-1), 4, 1);
        pattern(150, 145, (-1), 4, 1);
        pattern(300, 145, (-1), 4, 1);
        pattern(350, 145, (-1), 4, 1);
        pattern(500, 145, (-1), 4, 1);
        pattern(550, 145, (-1), 4, 12);
        pattern(100, 145, (-1), 4, 1);
        pattern(150, 145, (-1), 4, 1);
        pattern(200, 145, (-1), 4, 1);
        pattern(250, 145, (-1), 4, 1);
        pattern(400, 145, (-1), 4, 1);
        pattern(450, 145, (-1), 4, 20);
        pattern(100, 145, (-2), 4, 1);
        pattern(150, 145, (-2), 4, 1);
        pattern(200, 145, (-2), 4, 1);
        pattern(250, 145, (-2), 4, 1);
        pattern(300, 145, (-2), 4, 1);
        pattern(350, 145, (-2), 4, 1);
        pattern(470, 145, (-2), 4, 1);
        pattern(520, 145, (-2), 4, 35);
        pattern(80, 145, (-2), 4, 1);
        pattern(130, 145, (-2), 4, 1);
        pattern(300, 145, (-2), 4, 1);
        pattern(350, 145, (-2), 4, 1);
        pattern(400, 145, (-2), 4, 1);
        pattern(450, 145, (-2), 4, 1);
        pattern(500, 145, (-2), 4, 35);
        pattern(200, 145, (-1), 4, 1);
        pattern(250, 145, (-1), 4, 1);
        pattern(400, 145, (-1), 4, 1);
        pattern(450, 145, (-1), 4, 12);
        pattern(100, 145, (-1), 4, 1);
        pattern(150, 145, (-1), 4, 1);
        pattern(300, 145, (-1), 4, 1);
        pattern(350, 145, (-1), 4, 1);
        pattern(500, 145, (-1), 4, 1);
        pattern(550, 145, (-1), 4, 40);
        pattern(0, 0, 0, 10, 50);
    }
    if (eq(s.attackpattern, 48)) {
        pattern(0, 0, 0, 1, 1);
        pattern(268, 115, 60, 4, 1);
        pattern(316, 115, 60, 4, 1);
        pattern(364, 115, 60, 4, 9999);
        pattern(0, 5, 60, 0, 9999);
    }
    if (eq(s.attackpattern, 49)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        pattern(0, 11, 30, 2, 1);
        pattern(0, 5, 60, 5, 240);
    }
    if (eq(s.attackpattern, 50)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 0);
        pattern(270, 8, 30, 0, 10);
        pattern(225, 13, 30, 0, 10);
        pattern(270, 8, 30, 0, 21);
        pattern(270, 8, 30, 0, 10);
        pattern(315, 13, 30, 0, 10);
        pattern(270, 8, 30, 0, 21);
        pattern(270, 8, 30, 0, 10);
        pattern(225, 13, 30, 0, 10);
        pattern(270, 8, 30, 0, 10);
        pattern(315, 13, 30, 0, 10);
        pattern(135, 13, 30, 0, 10);
        pattern(45, 13, 30, 0, 10);
        pattern(180, 11, 30, 0, 10);
    }
    if (eq(s.attackpattern, 51)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 1);
        v._spd = 12;
        v._time_to_heart = 50;
        {
            const repeat8 = round(2);
            for (let index8 = 0; index8 < repeat8; index8++) {
                pattern(270, v._spd, v._time_to_heart, 0, 15);
                pattern(315, v._spd, v._time_to_heart, 0, 15);
                pattern(0, v._spd, v._time_to_heart, 0, 15);
                pattern(45, v._spd, v._time_to_heart, 0, 15);
                pattern(90, v._spd, v._time_to_heart, 0, 15);
                pattern(135, v._spd, v._time_to_heart, 0, 15);
                pattern(180, v._spd, v._time_to_heart, 0, 15);
                pattern(225, v._spd, v._time_to_heart, 0, 15);
                (v._spd += 3);
            }
        }
    }
    if (eq(s.attackpattern, 52)) {
        pattern(0, 0, 0, 1, 60);
        pattern(90, 8, 40, 315, 45);
        pattern(180, 8, 40, 225, 40);
        pattern(270, 5, 60, 135, 45);
    }
    if (eq(s.attackpattern, 53)) {
        pattern(0, 0, 0, 1, 0);
        pattern(0, 0, 0, 3, 0);
        v.beat = 4;
        v.spearspeed = 9;
        v.heartframes = 40;
        for (v.i = 0; lt(v.i, 5); (v.i++)) {
            v._dir = (90 + (v.i * 45));
            pattern(v._dir, v.spearspeed, v.heartframes, 0, v.beat);
        }
        pattern(0, 0, 0, 3, 8);
        for (v.i = 0; lt(v.i, 5); (v.i++)) {
            v._dir = (180 - (v.i * 45));
            pattern(v._dir, v.spearspeed, v.heartframes, 0, v.beat);
        }
        pattern(0, 0, 0, 3, 8);
        for (v.i = 0; lt(v.i, 5); (v.i++)) {
            v._dir = (90 + (v.i * 45));
            pattern(v._dir, v.spearspeed, v.heartframes, 0, v.beat);
        }
        pattern(0, 0, 0, 3, 8);
        for (v.i = 0; lt(v.i, 11); (v.i++)) {
            v._dir = (180 - (v.i * 45));
            pattern(v._dir, v.spearspeed, v.heartframes, 0, v.beat);
        }
        for (v.i = 0; lt(v.i, 30); (v.i++)) {
            v._dir = (90 + (v.i * 45));
            pattern(v._dir, v.spearspeed, v.heartframes, 0, v.beat);
            (v.spearspeed += 0.5);
        }
        pattern(0, 0, 0, 3, 8);
    }
    if (eq(s.attackpattern, 54)) {
        pattern(0, 0, 0, 1, 1);
        pattern(0, 0, 0, 3, 1);
        v.beat = 8;
        v.spearspeed = 12;
        v.heartframes = 40;
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 0.5));
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("ul", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("ul", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("ur", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("ur", v.spearspeed, v.heartframes, 0, v.beat);
        pattern("l", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("l", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 0.5));
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("ur", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("ur", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 0.5));
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("ul", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("ur", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("ur", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, (v.beat * 0.5));
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("d", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
        pattern("l", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("r", (v.spearspeed * 1), v.heartframes, 0, v.beat);
        pattern("u", (v.spearspeed * 0.8), v.heartframes, 0, v.beat);
    }
}
