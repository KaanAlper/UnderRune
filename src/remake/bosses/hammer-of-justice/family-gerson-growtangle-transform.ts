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
    (s.timer = nativeSceneValue(0));
    (s.shrink = nativeSceneValue(false));
    (s.grow = nativeSceneValue(false));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.shrink, true))) {
        {
            const caller32 = s;
            for (const target32 of targets(object("obj_growtangle"))) {
                const other = caller32;
                const s = target32;
                {
                    (s.maxxscale = nativeSceneValue(lerp(s.maxxscale, 1.5, 0.2)));
                    (s.maxyscale = nativeSceneValue(lerp(s.maxyscale, 1.5, 0.2)));
                    (s.imageXscale = nativeSceneValue(lerp(s.imageXscale, 1.5, 0.2)));
                    (s.imageYscale = nativeSceneValue(lerp(s.imageYscale, 1.5, 0.2)));
                    {
                        const count2 = round(6);
                        for (let repeat2 = 0; repeat2 < count2; repeat2++) {
                            if (sceneTruth(host.call(s, "place_meeting", s.x, s.y, object("obj_heart")))) {
                                (resolve(object("obj_heart")).x += nativeSceneValue(lengthdirX(...rtl(() => 1, () => pointDirection(resolve(object("obj_heart")).x, resolve(object("obj_heart")).y, resolve(object("obj_growtangle")).x, resolve(object("obj_growtangle")).y)))));
                                (resolve(object("obj_heart")).y += nativeSceneValue(lengthdirY(...rtl(() => 1, () => pointDirection(resolve(object("obj_heart")).x, resolve(object("obj_heart")).y, resolve(object("obj_growtangle")).x, resolve(object("obj_growtangle")).y)))));
                            }
                        }
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.grow, true))) {
        {
            const caller33 = s;
            for (const target33 of targets(object("obj_growtangle"))) {
                const other = caller33;
                const s = target33;
                {
                    (s.maxxscale = nativeSceneValue(lerp(s.maxxscale, 2, 0.2)));
                    (s.maxyscale = nativeSceneValue(lerp(s.maxyscale, 2, 0.2)));
                    (s.imageXscale = nativeSceneValue(lerp(s.imageXscale, 2, 0.2)));
                    (s.imageYscale = nativeSceneValue(lerp(s.imageYscale, 2, 0.2)));
                }
            }
        }
    }
    (s.timer++);
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(30)))) {
        rt.destroy(s);
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
