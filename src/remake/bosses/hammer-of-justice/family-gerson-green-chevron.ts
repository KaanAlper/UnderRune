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
    (s.imageSpeed = nativeSceneValue(0));
    (s.imageIndex = nativeSceneValue(5));
    (s.direction = nativeSceneValue(180));
    (s.speed = nativeSceneValue(12));
    (s.friction = nativeSceneValue((-2)));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    host.call(s, "scr_afterimage");
    (resolve(s.afterimage).fadeSpeed = nativeSceneValue(0.2));
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.con, 0)) && sceneTruth((targets(object("obj_heart")).length > 0)))) && sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue(resolve(object("obj_heart")).x)))))) {
        if (sceneTruth((sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(990))) && sceneTruth(!sceneTruth((targets(object("obj_spearblocker")).length > 0)))))) {
            host.call(s, "snd_play", "snd_smallswing");
        }
        create(s.x, s.y, object("obj_spearblocker"));
        (s.con = nativeSceneValue(1));
    }
    (s.timer++);
    if (sceneTruth(sceneEqual(s.timer, 100))) {
        rt.destroy(s);
    }
    rt.drawSelf(s);
}
