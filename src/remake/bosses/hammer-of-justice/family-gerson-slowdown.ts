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
    (s.con = nativeSceneValue(0));
    (s.darkalpha = nativeSceneValue(0));
    (s.type = nativeSceneValue(0));
    (s.depth = nativeSceneValue((resolve(object("obj_herosusie")).depth + 1)));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; drawSprite(...rtl(() => "spr_blank_tile_black", () => 0, () => (rt.view.x - 10), () => (rt.view.y - 10), () => 9999, () => 9999, () => s.imageAngle, () => s.imageBlend, () => s.darkalpha)); }
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcountmax, 1))) {
            if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(5)))) {
                (s.speed = nativeSceneValue(20));
            }
            if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(8))) && sceneTruth(le(nativeSceneValue(s.timer), nativeSceneValue(10)))))) {
                (resolve(object("obj_gerson_rudebuster")).speed = nativeSceneValue(lerp(20, 0.5, ((s.timer - 8) / 2))));
                (resolve(object("obj_gerson_rudebuster")).gravity = nativeSceneValue(0));
                (resolve(object("obj_gerson_rudebuster")).friction = nativeSceneValue(0));
            }
        }
        if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcountmax, 2))) {
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount, 1))) {
                (resolve(object("obj_gerson_rudebuster")).speed = nativeSceneValue(20));
            }
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount, 2))) {
                (resolve(object("obj_gerson_rudebuster")).speed = nativeSceneValue(35));
            }
        }
        if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcountmax, 3))) {
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount, 1))) {
                (resolve(object("obj_gerson_rudebuster")).speed = nativeSceneValue(20));
            }
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount, 2))) {
                (resolve(object("obj_gerson_rudebuster")).speed = nativeSceneValue(35));
            }
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount, 3))) {
                (resolve(object("obj_gerson_rudebuster")).speed = nativeSceneValue(50));
            }
        }
        (s.darkalpha = nativeSceneValue(lerp(s.darkalpha, 1, (s.timer / 60))));
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        (s.darkalpha = nativeSceneValue(lerp(s.darkalpha, 0.5, 0.2)));
        if (sceneTruth(sceneEqual(s.timer, 10))) {
            rt.destroy(s);
        }
    }
}
