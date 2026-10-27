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
    (s.imageSpeed = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue((-2)));
    (s.imageYscale = nativeSceneValue(2));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.imageIndex += nativeSceneValue(0.5));
    if (sceneTruth(sceneEqual(s.imageIndex, 4))) {
        host.call(...rtl(() => s, () => "snd_play_x", () => "snd_stardrop", () => 1, () => (1 + (rt.random.irandom(4) / 10))));
        v.a = 1;
        v.b = 1;
        v.yoffset = 20;
        {
            const count3 = round(2);
            for (let repeat3 = 0; repeat3 < count3; repeat3++) {
                if (sceneTruth(sceneEqual(s.imageXscale, (-2)))) {
                    (s.anim = nativeSceneValue(create((resolve(object("obj_growtangle")).x + 75), (resolve(object("obj_growtangle")).y + v.yoffset), object("obj_gerson_growtangle_hit_fx"))));
                    (resolve(s.anim).dir = nativeSceneValue(1));
                    (resolve(s.anim).imageXscale = nativeSceneValue((v.a * (-1))));
                    (resolve(s.anim).imageYscale = nativeSceneValue(v.b));
                }
                else {
                    (s.anim = nativeSceneValue(create((resolve(object("obj_growtangle")).x - 75), (resolve(object("obj_growtangle")).y + v.yoffset), object("obj_gerson_growtangle_hit_fx"))));
                    (resolve(s.anim).dir = nativeSceneValue((-1)));
                    (resolve(s.anim).imageXscale = nativeSceneValue(v.a));
                    (resolve(s.anim).imageYscale = nativeSceneValue(v.b));
                }
                (resolve(s.anim).sprite = nativeSceneValue("spr_gerson_box_hit_fx1"));
                (resolve(s.anim).imageSpeed = nativeSceneValue(1.5));
                (v.yoffset = nativeSceneValue((-20)));
                (v.b = nativeSceneValue((-1)));
            }
        }
        if (sceneTruth(sceneEqual(s.imageXscale, (-2)))) {
            (resolve(object("obj_hammer_of_justice_enemy")).hitbox_con = nativeSceneValue(1));
            v.slowbullet1 = rt.random.irandom(8);
            v.slowbullet2 = (v.slowbullet1 + 1);
            v.slowbullet3 = (v.slowbullet1 + 5);
            if (sceneTruth(gt(nativeSceneValue(v.slowbullet3), nativeSceneValue(8)))) {
                (v.slowbullet3 -= nativeSceneValue(10));
            }
            v.slowbullet4 = (v.slowbullet3 + 1);
            v.side_x = (-80);
            v.dir = 0;
            if (sceneTruth((sceneTruth(gt(nativeSceneValue(g.turntimer), nativeSceneValue(1))) && sceneTruth((targets(object("obj_growtangle")).length > 0))))) {
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(7)); (s.i++)) {
                    (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (23 * s.i)), object("obj_box_hit_bullet"))));
                    {
                        const caller184 = s;
                        for (const target184 of targets(s.bulletshot)) {
                            const other = caller184;
                            const s = target184;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                    (resolve(s.bulletshot).speed = nativeSceneValue(11.5));
                    (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                    (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                    (resolve(s.bulletshot).timermax = nativeSceneValue(43));
                    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.i, v.slowbullet1)) || sceneTruth(sceneEqual(s.i, v.slowbullet2)))) || sceneTruth(sceneEqual(s.i, v.slowbullet3)))) || sceneTruth(sceneEqual(s.i, v.slowbullet4))))) {
                        (resolve(s.bulletshot).speed = nativeSceneValue((7.3 + rt.random.choose(1, 2))));
                        (resolve(s.bulletshot).friction = nativeSceneValue(0.08));
                    }
                }
            }
        }
        else {
            (resolve(object("obj_hammer_of_justice_enemy")).hitbox_con = nativeSceneValue(2));
            v.slowbullet1 = rt.random.irandom(8);
            v.slowbullet2 = (v.slowbullet1 + 1);
            v.slowbullet3 = (v.slowbullet1 + 5);
            if (sceneTruth(gt(nativeSceneValue(v.slowbullet3), nativeSceneValue(8)))) {
                (v.slowbullet3 -= nativeSceneValue(10));
            }
            v.slowbullet4 = (v.slowbullet3 + 1);
            v.side_x = 80;
            v.dir = 180;
            if (sceneTruth((sceneTruth(gt(nativeSceneValue(g.turntimer), nativeSceneValue(1))) && sceneTruth((targets(object("obj_growtangle")).length > 0))))) {
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(7)); (s.i++)) {
                    (s.bulletshot = nativeSceneValue(create((resolve(object("obj_growtangle")).x + v.side_x), ((resolve(object("obj_growtangle")).y - 70) + (23 * s.i)), object("obj_box_hit_bullet"))));
                    {
                        const caller185 = s;
                        for (const target185 of targets(s.bulletshot)) {
                            const other = caller185;
                            const s = target185;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.bulletshot).direction = nativeSceneValue(v.dir));
                    (resolve(s.bulletshot).speed = nativeSceneValue(11.5));
                    (resolve(s.bulletshot).friction = nativeSceneValue(0.14));
                    (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                    (resolve(s.bulletshot).timermax = nativeSceneValue(43));
                    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.i, v.slowbullet1)) || sceneTruth(sceneEqual(s.i, v.slowbullet2)))) || sceneTruth(sceneEqual(s.i, v.slowbullet3)))) || sceneTruth(sceneEqual(s.i, v.slowbullet4))))) {
                        (resolve(s.bulletshot).speed = nativeSceneValue((7.3 + rt.random.choose(1, 2))));
                        (resolve(s.bulletshot).friction = nativeSceneValue(0.08));
                    }
                }
            }
        }
        host.call(s, "snd_play", "snd_impact");
    }
    if (sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(6.5)))) {
        rt.destroy(s);
        if (sceneTruth(sceneEqual(s.imageXscale, (-2)))) {
            create((s.x - 60), (s.y + 40), object("obj_gerson_teleport"));
        }
        else {
            create((s.x + 60), (s.y + 40), object("obj_gerson_teleport"));
        }
    }
}
