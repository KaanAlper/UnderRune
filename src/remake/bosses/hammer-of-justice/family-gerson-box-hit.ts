import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import type { Resources, HammerAttackHost } from './attack-families';
import { createObjectContext, sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, clamp, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
import { createDrawContext } from './draw-context';
function sourceArray(s: any, key: string): any[] { if (!(key in s)) {
    s[key] = [];
}
else if (!Array.isArray(s[key]))
    s[key] = [s[key]]; return s[key]; }
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.sprite = nativeSceneValue("spr_gerson_swing"));
    (s.imageSpeed = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.type = nativeSceneValue(0));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(16))) && sceneTruth(lt(nativeSceneValue(s.imageIndex), nativeSceneValue(5)))))) {
            (s.imageIndex += nativeSceneValue(0.5));
        }
        if (sceneTruth(sceneEqual(s.timer, 18))) {
            host.call(s, "snd_play", "motor_upper_quick_mid");
        }
        if (sceneTruth(sceneEqual(s.timer, 20))) {
            (s.con = nativeSceneValue(1));
            (s.timer = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_queen_punched_lower");
            host.call(s, "scr_shakeobj");
            v.slowbullet1 = rt.random.irandom(8);
            v.slowbullet2 = (v.slowbullet1 + 1);
            v.slowbullet3 = (v.slowbullet1 + 5);
            if (sceneTruth(gt(nativeSceneValue(v.slowbullet3), nativeSceneValue(8)))) {
                (v.slowbullet3 -= nativeSceneValue(10));
            }
            v.slowbullet4 = (v.slowbullet3 + 1);
            v.side_x = 80;
            v.dir = 0;
            if (sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                (v.dir = nativeSceneValue(180));
                {
                    const caller105 = s;
                    for (const target105 of targets(object("obj_growtangle"))) {
                        const other = caller105;
                        const s = target105;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(180));
                        }
                    }
                }
            }
            else {
                (v.side_x = nativeSceneValue((-80)));
                {
                    const caller106 = s;
                    for (const target106 of targets(object("obj_growtangle"))) {
                        const other = caller106;
                        const s = target106;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(0));
                        }
                    }
                }
            }
            v.rand = rt.random.choose(1, 2, 3, 4, 5, 6);
            if (sceneTruth(sceneEqual(v.rand, 0))) {
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(10)); (s.i++)) {
                    (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * s.i)), object("obj_box_hit_bullet"))));
                    {
                        const caller107 = s;
                        for (const target107 of targets(s.bulletshot)) {
                            const other = caller107;
                            const s = target107;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                    (resolve(s.bulletshot).speed = nativeSceneValue((5.6 + rt.random.random(2))));
                    (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                    (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.i, v.slowbullet1)) || sceneTruth(sceneEqual(s.i, v.slowbullet2)))) || sceneTruth(sceneEqual(s.i, v.slowbullet3)))) || sceneTruth(sceneEqual(s.i, v.slowbullet4))))) {
                        (resolve(s.bulletshot).speed = nativeSceneValue((2 + rt.random.random(1.5))));
                        (resolve(s.bulletshot).friction = nativeSceneValue(0.08));
                    }
                }
            }
            if (sceneTruth(sceneEqual(v.rand, 1))) {
                v.aa = 0;
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller108 = s;
                    for (const target108 of targets(s.bulletshot)) {
                        const other = caller108;
                        const s = target108;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7.2));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller109 = s;
                    for (const target109 of targets(s.bulletshot)) {
                        const other = caller109;
                        const s = target109;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller110 = s;
                    for (const target110 of targets(s.bulletshot)) {
                        const other = caller110;
                        const s = target110;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller111 = s;
                    for (const target111 of targets(s.bulletshot)) {
                        const other = caller111;
                        const s = target111;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller112 = s;
                    for (const target112 of targets(s.bulletshot)) {
                        const other = caller112;
                        const s = target112;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller113 = s;
                    for (const target113 of targets(s.bulletshot)) {
                        const other = caller113;
                        const s = target113;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller114 = s;
                    for (const target114 of targets(s.bulletshot)) {
                        const other = caller114;
                        const s = target114;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller115 = s;
                    for (const target115 of targets(s.bulletshot)) {
                        const other = caller115;
                        const s = target115;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller116 = s;
                    for (const target116 of targets(s.bulletshot)) {
                        const other = caller116;
                        const s = target116;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller117 = s;
                    for (const target117 of targets(s.bulletshot)) {
                        const other = caller117;
                        const s = target117;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7.2));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
            }
            if (sceneTruth(sceneEqual(v.rand, 2))) {
                v.aa = 0;
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller118 = s;
                    for (const target118 of targets(s.bulletshot)) {
                        const other = caller118;
                        const s = target118;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller119 = s;
                    for (const target119 of targets(s.bulletshot)) {
                        const other = caller119;
                        const s = target119;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller120 = s;
                    for (const target120 of targets(s.bulletshot)) {
                        const other = caller120;
                        const s = target120;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller121 = s;
                    for (const target121 of targets(s.bulletshot)) {
                        const other = caller121;
                        const s = target121;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller122 = s;
                    for (const target122 of targets(s.bulletshot)) {
                        const other = caller122;
                        const s = target122;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller123 = s;
                    for (const target123 of targets(s.bulletshot)) {
                        const other = caller123;
                        const s = target123;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller124 = s;
                    for (const target124 of targets(s.bulletshot)) {
                        const other = caller124;
                        const s = target124;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller125 = s;
                    for (const target125 of targets(s.bulletshot)) {
                        const other = caller125;
                        const s = target125;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller126 = s;
                    for (const target126 of targets(s.bulletshot)) {
                        const other = caller126;
                        const s = target126;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller127 = s;
                    for (const target127 of targets(s.bulletshot)) {
                        const other = caller127;
                        const s = target127;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
            }
            if (sceneTruth(sceneEqual(v.rand, 3))) {
                v.aa = 0;
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller128 = s;
                    for (const target128 of targets(s.bulletshot)) {
                        const other = caller128;
                        const s = target128;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller129 = s;
                    for (const target129 of targets(s.bulletshot)) {
                        const other = caller129;
                        const s = target129;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller130 = s;
                    for (const target130 of targets(s.bulletshot)) {
                        const other = caller130;
                        const s = target130;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller131 = s;
                    for (const target131 of targets(s.bulletshot)) {
                        const other = caller131;
                        const s = target131;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller132 = s;
                    for (const target132 of targets(s.bulletshot)) {
                        const other = caller132;
                        const s = target132;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller133 = s;
                    for (const target133 of targets(s.bulletshot)) {
                        const other = caller133;
                        const s = target133;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller134 = s;
                    for (const target134 of targets(s.bulletshot)) {
                        const other = caller134;
                        const s = target134;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller135 = s;
                    for (const target135 of targets(s.bulletshot)) {
                        const other = caller135;
                        const s = target135;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller136 = s;
                    for (const target136 of targets(s.bulletshot)) {
                        const other = caller136;
                        const s = target136;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7.6));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller137 = s;
                    for (const target137 of targets(s.bulletshot)) {
                        const other = caller137;
                        const s = target137;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
            }
            if (sceneTruth(sceneEqual(v.rand, 4))) {
                v.aa = 0;
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller138 = s;
                    for (const target138 of targets(s.bulletshot)) {
                        const other = caller138;
                        const s = target138;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller139 = s;
                    for (const target139 of targets(s.bulletshot)) {
                        const other = caller139;
                        const s = target139;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller140 = s;
                    for (const target140 of targets(s.bulletshot)) {
                        const other = caller140;
                        const s = target140;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller141 = s;
                    for (const target141 of targets(s.bulletshot)) {
                        const other = caller141;
                        const s = target141;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller142 = s;
                    for (const target142 of targets(s.bulletshot)) {
                        const other = caller142;
                        const s = target142;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller143 = s;
                    for (const target143 of targets(s.bulletshot)) {
                        const other = caller143;
                        const s = target143;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller144 = s;
                    for (const target144 of targets(s.bulletshot)) {
                        const other = caller144;
                        const s = target144;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller145 = s;
                    for (const target145 of targets(s.bulletshot)) {
                        const other = caller145;
                        const s = target145;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller146 = s;
                    for (const target146 of targets(s.bulletshot)) {
                        const other = caller146;
                        const s = target146;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller147 = s;
                    for (const target147 of targets(s.bulletshot)) {
                        const other = caller147;
                        const s = target147;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
            }
            if (sceneTruth(sceneEqual(v.rand, 5))) {
                v.aa = 0;
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller148 = s;
                    for (const target148 of targets(s.bulletshot)) {
                        const other = caller148;
                        const s = target148;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller149 = s;
                    for (const target149 of targets(s.bulletshot)) {
                        const other = caller149;
                        const s = target149;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller150 = s;
                    for (const target150 of targets(s.bulletshot)) {
                        const other = caller150;
                        const s = target150;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller151 = s;
                    for (const target151 of targets(s.bulletshot)) {
                        const other = caller151;
                        const s = target151;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller152 = s;
                    for (const target152 of targets(s.bulletshot)) {
                        const other = caller152;
                        const s = target152;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller153 = s;
                    for (const target153 of targets(s.bulletshot)) {
                        const other = caller153;
                        const s = target153;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller154 = s;
                    for (const target154 of targets(s.bulletshot)) {
                        const other = caller154;
                        const s = target154;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller155 = s;
                    for (const target155 of targets(s.bulletshot)) {
                        const other = caller155;
                        const s = target155;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.2));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller156 = s;
                    for (const target156 of targets(s.bulletshot)) {
                        const other = caller156;
                        const s = target156;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.2));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller157 = s;
                    for (const target157 of targets(s.bulletshot)) {
                        const other = caller157;
                        const s = target157;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
            }
            if (sceneTruth(sceneEqual(v.rand, 6))) {
                v.aa = 0;
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller158 = s;
                    for (const target158 of targets(s.bulletshot)) {
                        const other = caller158;
                        const s = target158;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4.6));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller159 = s;
                    for (const target159 of targets(s.bulletshot)) {
                        const other = caller159;
                        const s = target159;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller160 = s;
                    for (const target160 of targets(s.bulletshot)) {
                        const other = caller160;
                        const s = target160;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(3.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller161 = s;
                    for (const target161 of targets(s.bulletshot)) {
                        const other = caller161;
                        const s = target161;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(5.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller162 = s;
                    for (const target162 of targets(s.bulletshot)) {
                        const other = caller162;
                        const s = target162;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(5.5));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller163 = s;
                    for (const target163 of targets(s.bulletshot)) {
                        const other = caller163;
                        const s = target163;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(5.6));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller164 = s;
                    for (const target164 of targets(s.bulletshot)) {
                        const other = caller164;
                        const s = target164;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller165 = s;
                    for (const target165 of targets(s.bulletshot)) {
                        const other = caller165;
                        const s = target165;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.4));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller166 = s;
                    for (const target166 of targets(s.bulletshot)) {
                        const other = caller166;
                        const s = target166;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(6.8));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
                (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (15 * v.aa)), object("obj_box_hit_bullet"))));
                {
                    const caller167 = s;
                    for (const target167 of targets(s.bulletshot)) {
                        const other = caller167;
                        const s = target167;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                (resolve(s.bulletshot).speed = nativeSceneValue(7.2));
                (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (v.aa++);
            }
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 6))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 1))) {
            if (sceneTruth(sceneEqual(s.imageXscale, (-2)))) {
                create((s.x - 60), (s.y + 20), object("obj_gerson_teleport"));
            }
            else {
                create((s.x + 60), (s.y + 20), object("obj_gerson_teleport"));
            }
            rt.destroy(s);
        }
    }
}
