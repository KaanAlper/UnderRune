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
export function CleanUp0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.gers = nativeSceneValue(create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport"))));
    (resolve(s.gers).type = nativeSceneValue(10));
    rt.destroy(s);
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.bell = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 175) - 60), (resolve(object("obj_growtangle")).y - 60), object("obj_gerson_bell"))));
    (s.bell = nativeSceneValue(create(((resolve(object("obj_growtangle")).x + 130) + 30), (resolve(object("obj_growtangle")).y - 60), object("obj_gerson_bell"))));
    (s.leftgerson = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 280) - 60), resolve(object("obj_growtangle")).y, object("obj_gerson_teleport"))));
    (resolve(s.leftgerson).type = nativeSceneValue(3));
    (resolve(s.leftgerson).depth = nativeSceneValue((resolve(object("obj_gerson_bell")).depth - 2)));
    (s.rightgerson = nativeSceneValue(create(((resolve(object("obj_growtangle")).x + 280) + 30), resolve(object("obj_growtangle")).y, object("obj_gerson_teleport"))));
    (resolve(s.rightgerson).type = nativeSceneValue(3));
    (resolve(s.rightgerson).imageXscale = nativeSceneValue((-2)));
    (resolve(s.rightgerson).depth = nativeSceneValue((resolve(object("obj_gerson_bell")).depth - 2)));
    {
        const caller15 = s;
        for (const target15 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller15;
            const s = target15;
            {
                (s.visible = nativeSceneValue(false));
            }
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
