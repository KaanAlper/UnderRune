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
    (s.imageAlpha = nativeSceneValue(1));
    (s.imageAngle = nativeSceneValue(s.direction));
    (s.timer = nativeSceneValue(0));
    (s.lifetime = nativeSceneValue(20));
    (s.fadetime = nativeSceneValue(10));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageBlend = nativeSceneValue(16776960));
    (s.shader = nativeSceneValue(6));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.imageYscale = nativeSceneValue(2));
    v._brighttime = (s.lifetime - s.fadetime);
    if (sceneTruth(gt(nativeSceneValue(s.speed), nativeSceneValue(10)))) {
        (s.imageAlpha = nativeSceneValue(1));
    }
    else {
        v._lerp = host.call(s, "clamp01", host.call(s, "inverselerp", 10, 0, s.speed));
        (s.imageAlpha = nativeSceneValue(lerp(...rtl(() => 1, () => 0, () => host.call(s, "scr_ease_out", v._lerp, 2)))));
        (s.imageYscale = nativeSceneValue((s.imageAlpha + 1)));
    }
    host.call(s, "gpu_set_blendmode", 1);
    host.call(s, "shader_set", s.shader);
    drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
    drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
    if (sceneTruth(gt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.5)))) {
        drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, 0xffffff, (s.imageAlpha - 0.5));
        drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, 0xffffff, (s.imageAlpha - 0.5));
    }
    host.call(s, "shader_reset");
    host.call(s, "gpu_set_blendmode", 0);
    if (sceneTruth(le(nativeSceneValue(s.speed), nativeSceneValue(0)))) {
        rt.destroy(s);
    }
}
