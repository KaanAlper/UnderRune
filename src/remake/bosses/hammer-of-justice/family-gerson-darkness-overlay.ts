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
    (s._surface = nativeSceneValue((-1)));
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.scale = nativeSceneValue(12));
    (s.scalecon = nativeSceneValue(0));
    (s.depth = nativeSceneValue(50));
    (s.imageAlpha = nativeSceneValue(1));
    (s.redflash = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(sceneEqual(s.scalecon, 1)) && sceneTruth(gt(nativeSceneValue(s.scale), nativeSceneValue(2.2)))))) {
        (s.scale -= nativeSceneValue(0.03));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.scalecon, 2)) && sceneTruth(lt(nativeSceneValue(s.scale), nativeSceneValue(8)))))) {
        (s.scale += nativeSceneValue(0.2));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.scalecon, 3)) && sceneTruth(gt(nativeSceneValue(s.scale), nativeSceneValue(2.2)))))) {
        (s.scale -= nativeSceneValue(0.2));
    }
    v._shadowpower_scale = 0;
    if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
        (v._shadowpower_scale = nativeSceneValue(lerp(0, (-1), (resolve(object("obj_spearblocker")).shadowpower / 1))));
    }
    if (sceneTruth(!sceneTruth(host.call(s, "surface_exists", s._surface)))) {
        (s._surface = nativeSceneValue(host.call(s, "surface_create", s.room_width, s.room_height)));
    }
    host.call(s, "surface_set_target", s._surface);
    host.call(s, "draw_clear_alpha", 0xffffff, 0);
    v.aa = 0;
    rt.drawState.color = 0;
    host.call(...rtl(() => s, () => "ossafe_fill_rectangle", () => (rt.view.x - 10), () => (rt.view.y - 10), () => ((rt.view.x + rt.view.width) + 10), () => ((rt.view.y + rt.view.height) + 10), () => false));
    rt.drawState.color = 0xffffff;
    host.call(s, "draw_set_blend_mode", 3);
    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
        drawSprite("spr_light_vfx", s.imageIndex, (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10), (s.scale + v._shadowpower_scale), (s.scale + v._shadowpower_scale), 0, s.imageBlend, 1);
    }
    else {
        drawSprite(...rtl(() => "spr_light_vfx", () => s.imageIndex, () => (rt.view.x + 310), () => (rt.view.y + 230), () => (s.scale + v._shadowpower_scale), () => (s.scale + v._shadowpower_scale), () => 0, () => s.imageBlend, () => 1));
    }
    for (v.i = 0; lt(nativeSceneValue(v.i), nativeSceneValue(host.call(s, "instance_number", object("obj_gerson_darkness_overlay_light")))); (v.i++)) {
        (sourceArray(s, "light")[v.i] = nativeSceneValue(host.call(s, "instance_find", object("obj_gerson_darkness_overlay_light"), v.i)));
        drawSprite("spr_light_vfx", 0, resolve(s.light[v.i]).x, resolve(s.light[v.i]).y, resolve(s.light[v.i]).imageXscale, resolve(s.light[v.i]).imageYscale, 0, 0xffffff, resolve(s.light[v.i]).imageAlpha);
    }
    host.call(s, "draw_set_blend_mode", 0);
    host.call(s, "surface_reset_target");
    host.call(s, "draw_surface_ext", s._surface, 0, 0, 1, 1, 0, 0xffffff, s.imageAlpha);
}
