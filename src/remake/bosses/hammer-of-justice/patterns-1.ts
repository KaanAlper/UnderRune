/** Source attack queue block 1; called in original event order, with shared event-local variables. */
import type { HammerPatternContext } from './pattern-context';
import { eq, lt, gt, le, ge, round, clamp } from '../../gm/math';
import { rtl } from './pattern-context';
export function patternBlock1({ s, rt, v, pattern, choose, irandom, debug }: HammerPatternContext) {
    (s.attackcount = 0);
    (s.attackcountmax = 0);
    (s.attacktimer = 0);
    (s.swingdown_ex = 0);
    if (ge(s.trueturn, 20)) {
        (s.attackpattern = 19);
    }
    if (eq(s.attackpattern, 100)) {
        pattern(0, 0, 0, 1, 1);
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
    if (eq(s.attackpattern, 101)) {
        pattern(0, 0, 0, 1, 1);
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
    if (eq(s.attackpattern, 110)) {
        pattern(0, 0, 0, 1, 1);
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
    if (eq(s.attackpattern, 111)) {
        pattern(0, 0, 0, 1, 1);
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
    if (eq(s.attackpattern, 112)) {
        pattern(0, 0, 0, 1, 1);
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
    if (eq(s.attackpattern, 120)) {
        pattern(0, 0, 0, 1, 1);
        pattern("u", 10, 50, 25, 60, 100);
        pattern("r", 10, 50, 25, 22, 30);
        pattern("l", 10, 50, 25, 10, 15);
        pattern("d", 10, 50, 25, 40, 30);
    }
    if (eq(s.attackpattern, 140)) {
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
    if (eq(s.attackpattern, 150)) {
        pattern(0, 10, 60, 26, 9999);
        pattern(0, 10, 60, 0, 9999);
    }
    if (eq(s.attackpattern, 160)) {
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
    if (eq(s.attackpattern, 170)) {
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
    if (eq(s.attackpattern, 180)) {
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
}
