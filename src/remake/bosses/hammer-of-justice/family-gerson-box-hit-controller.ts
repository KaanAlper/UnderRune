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
    (s.timer = nativeSceneValue(15));
    (s.con = nativeSceneValue(rt.random.choose(0, 1)));
    (s.count = nativeSceneValue(7));
    (s.countmax = nativeSceneValue(s.count));
    (s.first = nativeSceneValue(0));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth((sceneTruth(sceneEqual(s.timer, 16)) && sceneTruth(sceneEqual(s.countmax, s.count))))) {
        {
            const caller14 = s;
            for (const target14 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller14;
                const s = target14;
                {
                    (s.visible = nativeSceneValue(false));
                }
            }
        }
        create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport"));
    }
    if (sceneTruth(sceneEqual(s.timer, 25))) {
        (s.count--);
        if (sceneTruth(sceneEqual(s.count, (-1)))) {
            (g.turntimer = nativeSceneValue(12));
            return;
        }
        if (sceneTruth(sceneEqual(s.con, 0))) {
            (s.leftgerson = nativeSceneValue(create((resolve(object("obj_growtangle")).x - 180), (resolve(object("obj_growtangle")).y + 20), object("obj_gerson_teleport"))));
            (resolve(s.leftgerson).type = nativeSceneValue(1));
        }
        else {
            (s.rightgerson = nativeSceneValue(create((resolve(object("obj_growtangle")).x + 180), (resolve(object("obj_growtangle")).y + 20), object("obj_gerson_teleport"))));
            (resolve(s.rightgerson).type = nativeSceneValue(1));
            (resolve(s.rightgerson).imageXscale = nativeSceneValue((-2)));
        }
        if (sceneTruth(sceneEqual(s.con, 0))) {
            (s.con = nativeSceneValue(1));
        }
        else {
            (s.con = nativeSceneValue(0));
        }
        if (sceneTruth(lt(nativeSceneValue(rt.random.irandom(100)), nativeSceneValue(50)))) {
            (s.con = nativeSceneValue(rt.random.choose(0, 1)));
        }
        (s.timer = nativeSceneValue(0));
    }
    if (sceneTruth(sceneEqual(s.timer, 36))) {
        (s.gers = nativeSceneValue(create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport"))));
        (resolve(s.gers).type = nativeSceneValue(10));
        rt.destroy(s);
    }
}
