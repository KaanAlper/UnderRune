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
    (s.con = nativeSceneValue(0));
    (s.special = nativeSceneValue(0));
    (s.imageAlpha = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(!sceneTruth((targets(object("obj_growtangle")).length > 0)))) {
        return;
    }
    (s.x1 = nativeSceneValue(s.x));
    (s.y1 = nativeSceneValue(s.y));
    (s.x2 = nativeSceneValue((s.x + s.imageXscale)));
    (s.y2 = nativeSceneValue((s.y + s.imageYscale)));
    (s.x3 = nativeSceneValue(s.x));
    (s.y3 = nativeSceneValue(s.y));
    (s.x4 = nativeSceneValue(s.x));
    (s.y4 = nativeSceneValue(s.y));
    (s.x5 = nativeSceneValue(s.x));
    (s.y5 = nativeSceneValue(s.y));
    (s.x6 = nativeSceneValue(s.x));
    (s.y6 = nativeSceneValue(s.y));
    if (sceneTruth(sceneEqual(s.special, 0))) {
        if (sceneTruth(sceneEqual(resolve(object("obj_growtangle")).maxxscale, 2))) {
            if (sceneTruth(lt(nativeSceneValue(s.x1), nativeSceneValue((resolve(object("obj_growtangle")).x - 210))))) {
                (s.x1 = nativeSceneValue((resolve(object("obj_growtangle")).x - 210)));
            }
            if (sceneTruth(gt(nativeSceneValue(s.x2), nativeSceneValue((resolve(object("obj_growtangle")).x + 215))))) {
                (s.x2 = nativeSceneValue((resolve(object("obj_growtangle")).x + 215)));
            }
            if (sceneTruth(lt(nativeSceneValue(s.y1), nativeSceneValue((resolve(object("obj_growtangle")).y - 35))))) {
                (s.y1 = nativeSceneValue((resolve(object("obj_growtangle")).y - 35)));
            }
            if (sceneTruth(gt(nativeSceneValue(s.y2), nativeSceneValue((resolve(object("obj_growtangle")).y + 35))))) {
                (s.y2 = nativeSceneValue((resolve(object("obj_growtangle")).y + 35)));
            }
        }
        else {
            if (sceneTruth(lt(nativeSceneValue(s.x1), nativeSceneValue((resolve(object("obj_growtangle")).x - 53))))) {
                (s.x1 = nativeSceneValue((resolve(object("obj_growtangle")).x - 53)));
            }
            if (sceneTruth(lt(nativeSceneValue(s.y1), nativeSceneValue((resolve(object("obj_growtangle")).y - 53))))) {
                (s.y1 = nativeSceneValue((resolve(object("obj_growtangle")).y - 53)));
            }
            if (sceneTruth(gt(nativeSceneValue(s.x2), nativeSceneValue((resolve(object("obj_growtangle")).x + 53))))) {
                (s.x2 = nativeSceneValue((resolve(object("obj_growtangle")).x + 53)));
            }
            if (sceneTruth(gt(nativeSceneValue(s.y2), nativeSceneValue((resolve(object("obj_growtangle")).y + 53))))) {
                (s.y2 = nativeSceneValue((resolve(object("obj_growtangle")).y + 53)));
            }
        }
        host.call(s, "draw_set_alpha", s.imageAlpha);
        host.call(s, "ossafe_fill_rectangle_color", s.x1, s.y1, s.x2, s.y2, 0xffffff, 0xffffff, 0xffffff, 0xffffff, false);
        host.call(s, "draw_set_alpha", 1);
    }
    if (sceneTruth(gt(nativeSceneValue(s.special), nativeSceneValue(0)))) {
        if (sceneTruth(sceneEqual(s.special, 1))) {
            (s.x1 = nativeSceneValue((resolve(object("obj_growtangle")).x + 53)));
            (s.y1 = nativeSceneValue(resolve(object("obj_growtangle")).y));
            (s.x2 = nativeSceneValue((resolve(object("obj_growtangle")).x + 53)));
            (s.y2 = nativeSceneValue((resolve(object("obj_growtangle")).y - 53)));
            (s.x3 = nativeSceneValue(resolve(object("obj_growtangle")).x));
            (s.y3 = nativeSceneValue((resolve(object("obj_growtangle")).y - 53)));
            (s.x4 = nativeSceneValue((resolve(object("obj_growtangle")).x - 53)));
            (s.y4 = nativeSceneValue(resolve(object("obj_growtangle")).y));
            (s.x5 = nativeSceneValue((resolve(object("obj_growtangle")).x - 53)));
            (s.y5 = nativeSceneValue((resolve(object("obj_growtangle")).y + 53)));
            (s.x6 = nativeSceneValue(resolve(object("obj_growtangle")).x));
            (s.y6 = nativeSceneValue((resolve(object("obj_growtangle")).y + 53)));
            host.call(s, "draw_set_alpha", s.imageAlpha);
            rt.drawState.color = 0xffffff;
            host.call(s, "d_triangle", s.x1, s.y1, s.x2, s.y2, s.x3, s.y3, false);
            host.call(s, "d_triangle", s.x4, s.y4, s.x5, s.y5, s.x6, s.y6, false);
            host.call(s, "d_triangle", s.x3, s.y3, s.x4, s.y4, s.x6, s.y6, false);
            host.call(s, "d_triangle", s.x1, s.y1, s.x3, s.y3, s.x6, s.y6, false);
            host.call(s, "draw_set_alpha", 1);
        }
        if (sceneTruth(sceneEqual(s.special, 2))) {
            (s.x1 = nativeSceneValue((resolve(object("obj_growtangle")).x - 53)));
            (s.y1 = nativeSceneValue(resolve(object("obj_growtangle")).y));
            (s.x2 = nativeSceneValue((resolve(object("obj_growtangle")).x - 53)));
            (s.y2 = nativeSceneValue((resolve(object("obj_growtangle")).y - 53)));
            (s.x3 = nativeSceneValue(resolve(object("obj_growtangle")).x));
            (s.y3 = nativeSceneValue((resolve(object("obj_growtangle")).y - 53)));
            (s.x4 = nativeSceneValue((resolve(object("obj_growtangle")).x + 53)));
            (s.y4 = nativeSceneValue(resolve(object("obj_growtangle")).y));
            (s.x5 = nativeSceneValue((resolve(object("obj_growtangle")).x + 53)));
            (s.y5 = nativeSceneValue((resolve(object("obj_growtangle")).y + 53)));
            (s.x6 = nativeSceneValue(resolve(object("obj_growtangle")).x));
            (s.y6 = nativeSceneValue((resolve(object("obj_growtangle")).y + 53)));
            host.call(s, "draw_set_alpha", s.imageAlpha);
            rt.drawState.color = 0xffffff;
            host.call(s, "d_triangle", s.x1, s.y1, s.x2, s.y2, s.x3, s.y3, false);
            host.call(s, "d_triangle", s.x4, s.y4, s.x5, s.y5, s.x6, s.y6, false);
            host.call(s, "d_triangle", s.x3, s.y3, s.x4, s.y4, s.x6, s.y6, false);
            host.call(s, "d_triangle", s.x1, s.y1, s.x3, s.y3, s.x6, s.y6, false);
            host.call(s, "draw_set_alpha", 1);
        }
        if (sceneTruth(sceneEqual(s.special, 3))) {
            host.call(s, "draw_set_alpha", s.imageAlpha);
            host.call(s, "ossafe_fill_rectangle_color", (resolve(object("obj_growtangle")).x - 30), (resolve(object("obj_growtangle")).y - 53), (resolve(object("obj_growtangle")).x + 32), (resolve(object("obj_growtangle")).y + 53), 0xffffff, 0xffffff, 0xffffff, 0xffffff, false);
            host.call(s, "draw_set_alpha", 1);
        }
        if (sceneTruth(sceneEqual(s.special, 4))) {
            host.call(s, "draw_set_alpha", s.imageAlpha);
            host.call(s, "ossafe_fill_rectangle_color", (resolve(object("obj_growtangle")).x - 53), (resolve(object("obj_growtangle")).y + 30), (resolve(object("obj_growtangle")).x + 53), (resolve(object("obj_growtangle")).y - 32), 0xffffff, 0xffffff, 0xffffff, 0xffffff, false);
            host.call(s, "draw_set_alpha", 1);
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.imageAlpha += nativeSceneValue(0.2));
        if (sceneTruth(sceneEqual(s.imageAlpha, 1))) {
            (s.con = nativeSceneValue(1));
        }
    }
    else {
        (s.imageAlpha -= nativeSceneValue(0.2));
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            rt.destroy(s);
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
