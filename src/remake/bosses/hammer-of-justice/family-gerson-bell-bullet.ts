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
    (s.dir = nativeSceneValue(1));
    (s.speed = nativeSceneValue(20));
    (s.imageXscale = nativeSceneValue(1));
    (s.imageYscale = nativeSceneValue(1));
    (s.pos = nativeSceneValue(0));
    (s.siner = nativeSceneValue(rt.random.irandom(200)));
    (sourceArray(s, "ypos")[0] = nativeSceneValue((resolve(object("obj_growtangle")).y - 60)));
    (sourceArray(s, "ypos")[1] = nativeSceneValue((resolve(object("obj_growtangle")).y - 30)));
    (sourceArray(s, "ypos")[2] = nativeSceneValue(resolve(object("obj_growtangle")).y));
    (sourceArray(s, "ypos")[3] = nativeSceneValue((resolve(object("obj_growtangle")).y + 30)));
    (sourceArray(s, "ypos")[4] = nativeSceneValue((resolve(object("obj_growtangle")).y + 60)));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(16)))) {
        (s.timer++);
        (s.speed = nativeSceneValue(lerp(s.speed, 4, (s.timer / 15))));
    }
    if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(11)))) {
        (s.y = nativeSceneValue(lerp(s.ystart, s.ypos[s.pos], (s.timer / 10))));
    }
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(15)))) {
        (s.timer++);
        (s.speed = nativeSceneValue(lerp(4, 20, ((s.timer - 15) / 40))));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.direction, 180)) && sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x - 75))))))) {
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.direction, 0)) && sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x + 75))))))) {
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
        rt.destroy(s);
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
