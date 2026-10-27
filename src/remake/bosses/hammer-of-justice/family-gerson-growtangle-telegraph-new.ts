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
export function CleanUp0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; return; }
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    bulletInit(s);
    (s.con = nativeSceneValue(0));
    (s.special = nativeSceneValue(0));
    (s.destroyonhit = nativeSceneValue(false));
    (s.active = nativeSceneValue(0));
    (s.activetimer = nativeSceneValue(0));
    (s.longtelegraph = nativeSceneValue(false));
    (s.imageAlpha = nativeSceneValue(0));
    v.a = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
        (v.a = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.a)));
    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
        (s.target = nativeSceneValue(4));
        if (sceneTruth(sceneEqual(resolve(object("obj_sound_of_justice_enemy")).phase, 1))) {
            (s.damage = nativeSceneValue(38));
        }
        else {
            (s.damage = nativeSceneValue(58));
        }
    }
    if (sceneTruth((sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0)) && sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).attackpattern, 19))))) {
        (s.imageXscale = nativeSceneValue(1));
        (s.sprite = nativeSceneValue("spr_gerson_swing_down_telegraph3"));
    }
    else if (sceneTruth((sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0)) && sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).reachedendphase, 1))))) {
        (s.longtelegraph = nativeSceneValue(true));
        (s.imageXscale = nativeSceneValue(1));
        (s.sprite = nativeSceneValue("spr_gerson_swing_down_telegraph2"));
    }
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(!sceneTruth((targets(object("obj_growtangle")).length > 0)))) {
        return;
    }
    host.call(s, "gpu_set_blendenable", false);
    host.call(s, "gpu_set_colorwriteenable", false, false, false, true);
    host.call(s, "draw_set_alpha", 0);
    host.call(...rtl(() => s, () => "ossafe_fill_rectangle", () => rt.view.x, () => rt.view.y, () => (rt.view.x + 640), () => (rt.view.y + 480), () => false));
    host.call(s, "draw_set_alpha", s.imageAlpha);
    if (sceneTruth((targets(object("obj_gerson_growtangle")).length > 0))) {
        host.call(s, "ossafe_fill_rectangle", (resolve(object("obj_gerson_growtangle")).x1 + 3), (resolve(object("obj_gerson_growtangle")).y1 + 3), (resolve(object("obj_gerson_growtangle")).x2 - 3), (resolve(object("obj_gerson_growtangle")).y2 - 3), false);
    }
    else if (sceneTruth(sceneEqual(resolve(object("obj_growtangle")).imageXscale, 2))) {
        host.call(...rtl(() => s, () => "ossafe_fill_rectangle", () => (host.call(s, "gt_minx") + 5), () => (host.call(s, "gt_miny") + 5), () => (host.call(s, "gt_maxx") - 4), () => (host.call(s, "gt_maxy") - 4), () => false));
    }
    else {
        host.call(...rtl(() => s, () => "ossafe_fill_rectangle", () => (host.call(s, "gt_minx") + 3), () => (host.call(s, "gt_miny") + 3), () => (host.call(s, "gt_maxx") - 3), () => (host.call(s, "gt_maxy") - 3), () => false));
    }
    host.call(s, "gpu_set_blendenable", true);
    host.call(s, "gpu_set_colorwriteenable", true, true, true, true);
    host.call(s, "gpu_set_blendmode_ext", 7, 8);
    host.call(s, "gpu_set_alphatestenable", true);
    host.call(s, "gpu_set_alphatestref", 1);
    rt.drawSelf(s);
    host.call(s, "scr_draw_in_box_end");
    host.call(s, "draw_set_alpha", 1);
}
export function Other15(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    v.a = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
        (v.a = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.a)));
    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
        (s.target = nativeSceneValue(4));
        (s.damage = nativeSceneValue(67));
    }
    if (sceneTruth(sceneEqual(s.active, 1))) {
        if (sceneTruth(!sceneEqual(s.target, 3))) {
            host.call(s, "scr_damage");
        }
        if (sceneTruth(sceneEqual(s.target, 3))) {
            host.call(s, "scr_damage_all");
        }
        if (sceneTruth(sceneEqual(s.destroyonhit, 1))) {
            rt.destroy(s);
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        if (sceneTruth(!sceneTruth(s.longtelegraph))) {
            (s.imageAlpha += nativeSceneValue(0.2));
            if (sceneTruth(sceneEqual(s.imageAlpha, 1))) {
                (s.con = nativeSceneValue(1));
            }
        }
        else {
            (s.imageAlpha += nativeSceneValue(0.08));
            if (sceneTruth(ge(nativeSceneValue(s.imageAlpha), nativeSceneValue(1.1)))) {
                (s.con = nativeSceneValue(1));
            }
        }
    }
    else {
        if (sceneTruth(le(nativeSceneValue(s.imageAlpha), nativeSceneValue((-1.3))))) {
            (s.activetimer++);
            if (sceneTruth(sceneEqual(s.activetimer, 3))) {
                (s.active = nativeSceneValue(1));
            }
            else {
                (s.active = nativeSceneValue(0));
            }
        }
        if (sceneTruth(!sceneTruth(s.longtelegraph))) {
            (s.imageAlpha -= nativeSceneValue(0.4));
            if (sceneTruth(le(nativeSceneValue(s.imageAlpha), nativeSceneValue((-3.4))))) {
                rt.destroy(s);
            }
        }
        if (sceneTruth(s.longtelegraph)) {
            (s.imageAlpha -= nativeSceneValue((1 / 3)));
            if (sceneTruth(le(nativeSceneValue(s.imageAlpha), nativeSceneValue((-2))))) {
                rt.destroy(s);
            }
        }
    }
}
