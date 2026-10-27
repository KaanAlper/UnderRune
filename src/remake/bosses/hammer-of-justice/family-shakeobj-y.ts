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
    (s.active = nativeSceneValue(0));
    (s.target = nativeSceneValue(0));
    (s.shakeamt = nativeSceneValue(5));
    (s.shakereduct = nativeSceneValue(2));
    if (sceneTruth(sceneEqual(g.darkzone, 0))) {
        (s.shakeamt = nativeSceneValue(5));
        (s.shakereduct = nativeSceneValue(1));
    }
    (s.shakespeed = nativeSceneValue(1));
    (s.nowx = nativeSceneValue(0));
    (s.nowy = nativeSceneValue(0));
    (s.on = nativeSceneValue(1));
    (s.timer = nativeSceneValue(0));
}
export function Other10(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((targets(s.target).length > 0))) {
        (s.active = nativeSceneValue(1));
        (s.nowx = nativeSceneValue(resolve(s.target).x));
        (s.nowy = nativeSceneValue(resolve(s.target).y));
    }
    else {
        rt.destroy(s);
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.active, 0))) {
        rt.destroy(s);
    }
    if (sceneTruth(sceneEqual(s.active, 1))) {
        if (sceneTruth((targets(s.target).length > 0))) {
            (s.shakeamt -= nativeSceneValue(s.shakereduct));
            (s.on *= nativeSceneValue((-1)));
            (resolve(s.target).y = nativeSceneValue((s.nowy + (s.shakeamt * s.on))));
            if (sceneTruth(le(nativeSceneValue(s.shakeamt), nativeSceneValue(0)))) {
                rt.destroy(s);
            }
        }
        else {
            rt.destroy(s);
        }
    }
}
