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
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageSpeed = nativeSceneValue(0));
    (s.timer = nativeSceneValue(0));
    (s.delay = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(gt(nativeSceneValue(s.delay), nativeSceneValue(0)))) {
        (s.delay--);
        return;
    }
    (s.timer++);
    if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(20)))) {
        drawSprite("spr_gerson_progress_star2", 2, s.x, (s.y + 3), 0.17, (s.imageYscale - 0.4), s.imageAngle, 0xffffff, s.imageAlpha);
        (s.imageYscale += nativeSceneValue(0.5));
    }
    else {
        rt.drawSelf(s);
    }
    if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(3)))) {
        fog(true, 0xffffff, 0, 1);
        rt.drawSelf(s);
        fog(false, 0, 0, 0);
        (s.vspeed = nativeSceneValue(1));
        (s.gravityDirection = nativeSceneValue(270));
        (s.gravity = nativeSceneValue((-0.4)));
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(10))) && sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0.5)))))) {
        (s.imageXscale -= nativeSceneValue(0.2));
    }
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(19)))) {
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(sceneEqual(s.timer, 29))) {
        rt.destroy(s);
    }
    if (sceneTruth(sceneEqual(s.timer, 1))) {
        (s.x = nativeSceneValue((s.xstart + 2)));
    }
    if (sceneTruth(sceneEqual(s.timer, 2))) {
        (s.x = nativeSceneValue((s.xstart - 1)));
    }
    if (sceneTruth(sceneEqual(s.timer, 3))) {
        (s.x = nativeSceneValue(s.xstart));
    }
}
export function Other10(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(gt(nativeSceneValue(s.delay), nativeSceneValue(0)))) {
        (s.delay--);
        return;
    }
    (s.timer++);
    if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(25)))) {
        drawSprite("spr_gerson_progress_star", 2, s.x, s.y, 0.17, (s.imageYscale - 0.4), s.imageAngle, 0xffffff, s.imageAlpha);
        (s.imageYscale += nativeSceneValue(0.2));
    }
    else {
        rt.drawSelf(s);
    }
    if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(3)))) {
        fog(true, 0xffffff, 0, 1);
        rt.drawSelf(s);
        fog(false, 0, 0, 0);
        (s.vspeed = nativeSceneValue(1));
        (s.gravityDirection = nativeSceneValue(270));
        (s.gravity = nativeSceneValue((-0.2)));
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(10))) && sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0.5)))))) {
        (s.imageXscale -= nativeSceneValue(0.1));
    }
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(29)))) {
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(sceneEqual(s.timer, 39))) {
        rt.destroy(s);
    }
    if (sceneTruth(sceneEqual(s.timer, 1))) {
        (s.x = nativeSceneValue((s.xstart + 2)));
    }
    if (sceneTruth(sceneEqual(s.timer, 2))) {
        (s.x = nativeSceneValue((s.xstart - 1)));
    }
    if (sceneTruth(sceneEqual(s.timer, 3))) {
        (s.x = nativeSceneValue(s.xstart));
    }
}
