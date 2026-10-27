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
    (s.active = nativeSceneValue(1));
    (s.damage = nativeSceneValue(1));
    (s.timermax = nativeSceneValue(37));
    (s.anglespeed = nativeSceneValue(0));
    (s.imageSpeed = nativeSceneValue(1));
    (s.sprite = nativeSceneValue("spr_gerson_star7"));
    (s.imageAngle = nativeSceneValue(rt.random.irandom(360)));
    (s.imageXscale = nativeSceneValue(0));
    (s.imageYscale = nativeSceneValue(0));
    v.aa = rt.random.choose(5, 6, 7, 8, 9, 10);
    host.call(s, "scr_script_delayed", "scr_lerpvar", 1, "image_xscale", 0, 1.5, v.aa);
    host.call(s, "scr_script_delayed", "scr_lerpvar", 1, "image_yscale", 0, 1.5, v.aa);
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.sprite, "spr_gerson_chevron"))) {
        (s.imageAngle = nativeSceneValue((s.direction + 180)));
    }
    rt.drawSelf(s);
    if (sceneTruth(sceneEqual(s.sprite, "spr_gerson_chevron"))) {
        if (sceneTruth(sceneEqual(s.direction, 0))) {
            drawSprite(s.sprite, s.imageIndex, ((s.x - 5) - (s.timer / 4)), s.y, s.imageXscale, s.imageYscale, (s.direction + 180), s.imageBlend, s.imageAlpha);
            drawSprite(s.sprite, s.imageIndex, ((s.x - 10) - (s.timer / 2)), s.y, s.imageXscale, s.imageYscale, (s.direction + 180), s.imageBlend, s.imageAlpha);
        }
        if (sceneTruth(sceneEqual(s.direction, 180))) {
            drawSprite(s.sprite, s.imageIndex, ((s.x + 5) + (s.timer / 4)), s.y, s.imageXscale, s.imageYscale, (s.direction + 180), s.imageBlend, s.imageAlpha);
            drawSprite(s.sprite, s.imageIndex, ((s.x + 10) + (s.timer / 2)), s.y, s.imageXscale, s.imageYscale, (s.direction + 180), s.imageBlend, s.imageAlpha);
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(s.timermax)))) {
        (s.imageAlpha *= nativeSceneValue(0.7));
    }
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.2)))) {
        (s.active = nativeSceneValue(0));
    }
    (s.imageAngle += nativeSceneValue(10));
    if (sceneTruth(lt(nativeSceneValue(s.speed), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
