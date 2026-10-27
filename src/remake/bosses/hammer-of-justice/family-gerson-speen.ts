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
    host.inherited(s, rt, "create");
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.destroyonhit = nativeSceneValue(false));
    (s.active = nativeSceneValue(0));
    (s.imageSpeed = nativeSceneValue(0.4));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageAlpha = nativeSceneValue(1));
    (s.depth = nativeSceneValue((-999999)));
    if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
        (s.imageXscale = nativeSceneValue((-2)));
        (s.direction = nativeSceneValue(0));
        (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), resolve(object("obj_growtangle")).y, object("obj_gerson_growtangle_telegraph"))));
        (resolve(s.inst).imageXscale = nativeSceneValue(142));
        (resolve(s.inst).imageYscale = nativeSceneValue(72));
        if (sceneTruth((targets(object("obj_heart")).length > 0))) {
            (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
        }
        host.call(s, "snd_play_pitch", "snd_eye_telegraph", 0.95);
    }
    else {
        (s.imageXscale = nativeSceneValue(2));
        (s.direction = nativeSceneValue(180));
        (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
        (resolve(s.inst).imageXscale = nativeSceneValue(142));
        (resolve(s.inst).imageYscale = nativeSceneValue(70));
        if (sceneTruth((targets(object("obj_heart")).length > 0))) {
            (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
        }
        host.call(s, "snd_play_pitch", "snd_eye_telegraph", 1);
    }
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; rt.drawSelf(s); }
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.imageSpeed = nativeSceneValue(lerp(s.imageSpeed, 1, 0.04)));
    (s.speed = nativeSceneValue(lerp(s.speed, 30, 0.2)));
    if (sceneTruth((sceneTruth((sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((host.call(s, "scr_get_box", 2) - 600)))) && sceneTruth(sceneEqual(s.direction, 180)))) || sceneTruth((sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((host.call(s, "scr_get_box", 0) + 600)))) && sceneTruth(sceneEqual(s.direction, 0))))))) {
        rt.destroy(s);
    }
    (s.timer++);
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual((s.timer % 4), 0)) && sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x - 200)))))) && sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x + 200))))))) {
        host.call(s, "snd_stop", "motor_swing_down");
        host.call(s, "snd_play_pitch", "motor_swing_down", 1.5);
    }
}
