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
    (s.side = nativeSceneValue("left"));
    (s.depth = nativeSceneValue((-9999999999)));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.side, "left"))) {
        drawSprite(...rtl(() => "spr_whitegradientdown_40", () => 9, () => (rt.view.x + 40), () => rt.view.y, () => 20, () => 1, () => (-90), () => s.imageBlend, () => s.imageAlpha));
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(sceneEqual(s.side, "right"))) {
        drawSprite(...rtl(() => "spr_whitegradientdown_40", () => 9, () => ((rt.view.x + rt.view.width) - 40), () => ((rt.view.y + rt.view.height) + 40), () => 20, () => 1, () => 90, () => s.imageBlend, () => s.imageAlpha));
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(sceneEqual(s.side, "up"))) {
        drawSprite(...rtl(() => "spr_whitegradientdown_40", () => 9, () => (rt.view.x + rt.view.width), () => (rt.view.y + 40), () => 20, () => 1, () => 180, () => s.imageBlend, () => s.imageAlpha));
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(sceneEqual(s.side, "down"))) {
        (s.depth = nativeSceneValue((resolve(object("obj_battlecontroller")).depth - 2)));
        drawSprite(...rtl(() => "spr_whitegradientdown_40", () => 9, () => rt.view.x, () => ((rt.view.y + rt.view.height) - 40), () => 20, () => 1, () => 0, () => s.imageBlend, () => s.imageAlpha));
        (s.imageAlpha -= nativeSceneValue(0.1));
    }
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
        rt.destroy(s);
    }
}
