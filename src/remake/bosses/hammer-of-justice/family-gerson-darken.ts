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
    (s.depth = nativeSceneValue(800));
    (s.imageAlpha = nativeSceneValue((-0.1)));
    (s.con = nativeSceneValue(0));
    (s.savesusiedepth = nativeSceneValue(resolve(object("obj_heroparent")).depth));
    (s.savetensiondepth = nativeSceneValue(resolve(object("obj_tensionbar")).depth));
    (s.savegersondepth = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).depth));
    (resolve(object("obj_tensionbar")).depth = nativeSceneValue(1000));
    (resolve(object("obj_heroparent")).depth = nativeSceneValue(1001));
    (resolve(object("obj_hammer_of_justice_enemy")).depth = nativeSceneValue(1001));
    (resolve(object("obj_darkener")).depth = nativeSceneValue(1002));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.depth = nativeSceneValue(800));
    if (sceneTruth((sceneTruth((targets(object("obj_growtangle")).length > 0)) && sceneTruth(sceneEqual(s.con, 0))))) {
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(1)))) {
            (s.imageAlpha += nativeSceneValue(0.05));
        }
    }
    else {
        if (sceneTruth(gt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            (s.imageAlpha -= nativeSceneValue(0.05));
        }
        if (sceneTruth(le(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            rt.destroy(s);
            (resolve(object("obj_tensionbar")).depth = nativeSceneValue(s.savetensiondepth));
            (resolve(object("obj_heroparent")).depth = nativeSceneValue(s.savesusiedepth));
            (resolve(object("obj_hammer_of_justice_enemy")).depth = nativeSceneValue(s.savegersondepth));
        }
    }
    drawSprite(...rtl(() => "spr_whitepixel", () => 0, () => rt.view.x, () => rt.view.y, () => 999, () => 999, () => 0, () => 0, () => s.imageAlpha));
}
