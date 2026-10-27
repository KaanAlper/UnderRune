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
    bulletInit(s);
    (s.fakespeed = nativeSceneValue(2));
    (s.len = nativeSceneValue(100));
    (s.destroyonhit = nativeSceneValue(0));
    (s.grazepoints = nativeSceneValue(1));
    (s.rotspeed = nativeSceneValue(38));
    (s.imageAlpha = nativeSceneValue(0));
    (s.offsetdir = nativeSceneValue(pointDirection(s.x, s.y, (resolve(object("obj_heart")).x + 8), (resolve(object("obj_heart")).y + 8))));
    (s.imageAngle = nativeSceneValue((s.offsetdir + 20)));
    (s.direction = nativeSceneValue(s.offsetdir));
    (s.speed = nativeSceneValue(4));
    (s.friction = nativeSceneValue(0.2));
    (s.dmg = nativeSceneValue(11));
    (s.deactivate = nativeSceneValue(0));
    (s.timer = nativeSceneValue(0));
    (s.fade = nativeSceneValue(0));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.imageAlpha += nativeSceneValue(0.05));
    (s.imageAngle -= nativeSceneValue(s.rotspeed));
    if (sceneTruth(gt(nativeSceneValue(s.rotspeed), nativeSceneValue(0)))) {
        (s.rotspeed -= nativeSceneValue(2));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.rotspeed, 0)) && sceneTruth(lt(nativeSceneValue(s.speed), nativeSceneValue(1)))))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 5))) {
            (s.speed = nativeSceneValue(8));
            (s.friction = nativeSceneValue((-0.3)));
            (s.direction = nativeSceneValue(s.imageAngle));
            (s.imageAngle = nativeSceneValue(s.direction));
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.fade, 1)) && sceneTruth(ge(nativeSceneValue(s.speed), nativeSceneValue(7)))))) {
        (s.timer++);
        if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(22)))) {
            (s.deactivate = nativeSceneValue(1));
        }
    }
    if (sceneTruth(sceneEqual(s.deactivate, 1))) {
        (s.imageAlpha -= nativeSceneValue(0.25));
        if (sceneTruth(le(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            rt.destroy(s);
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
