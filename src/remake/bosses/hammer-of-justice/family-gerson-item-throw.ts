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
    (s.speed = nativeSceneValue(4));
    (s.direction = nativeSceneValue(30));
    (s.imageSpeed = nativeSceneValue(0.25));
    (s.imageIndex = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(2.5));
    (s.imageYscale = nativeSceneValue(2.5));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.inst = nativeSceneValue(createDepth((s.x + 1), (s.y + 1), (s.depth + 1), object("obj_gerson_item_throw_particle"))));
    if (sceneTruth(sceneEqual(s.imageIndex, 5))) {
        if (sceneTruth(sceneEqual(s.imageAngle, 0))) {
            (s.imageAngle = nativeSceneValue(45));
        }
        else {
            (s.imageAngle = nativeSceneValue(0));
        }
        (s.imageIndex = nativeSceneValue(0));
    }
    if (sceneTruth(gt(nativeSceneValue(s.speed), nativeSceneValue(0.8)))) {
        (s.speed -= nativeSceneValue(0.2));
        (s.direction -= nativeSceneValue(2));
    }
    (s.timer++);
    if (sceneTruth(sceneEqual(s.timer, 8))) {
        createDepth(s.x, s.y, (s.depth - 1), object("obj_gerson_item_steal_anim"));
    }
}
