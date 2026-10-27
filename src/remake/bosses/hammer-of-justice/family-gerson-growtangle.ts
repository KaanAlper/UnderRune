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
export function CleanUp0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (resolve(object("obj_growtangle")).imageAlpha = nativeSceneValue(1));
    (resolve(object("obj_growtangle")).sprite = nativeSceneValue("spr_battlebg_0"));
    (resolve(object("obj_growtangle")).imageXscale = nativeSceneValue(1.5));
    (resolve(object("obj_growtangle")).imageYscale = nativeSceneValue(1.5));
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.x1 = nativeSceneValue(Math.ceil((resolve(object("obj_growtangle")).x - (rt.spriteWidth(resolve(object("obj_growtangle"))) / 2)))));
    (s.x2 = nativeSceneValue(Math.ceil((resolve(object("obj_growtangle")).x + (rt.spriteWidth(resolve(object("obj_growtangle"))) / 2)))));
    (s.y1 = nativeSceneValue(Math.ceil((resolve(object("obj_growtangle")).y - (rt.spriteHeight(resolve(object("obj_growtangle"))) / 2)))));
    (s.y2 = nativeSceneValue(Math.ceil((resolve(object("obj_growtangle")).y + (rt.spriteHeight(resolve(object("obj_growtangle"))) / 2)))));
    (s.col = nativeSceneValue(mergeColor(32768, 65280, 0.5)));
    (s.depth = nativeSceneValue((resolve(object("obj_growtangle")).depth - 1)));
    (resolve(object("obj_growtangle")).x = nativeSceneValue((-99999)));
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.xxprev = nativeSceneValue(0));
    (s.maxx = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
        return;
    }
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 2))) {
            (s.anim = nativeSceneValue(create((resolve(object("obj_heart")).x + 40), (resolve(object("obj_heart")).y - 10), object("obj_animation"))));
            (resolve(s.anim).sprite = nativeSceneValue("spr_gerson_swing"));
            (resolve(s.anim).imageSpeed = nativeSceneValue(0.5));
            (resolve(s.anim).imageIndex = nativeSceneValue(0));
            (resolve(s.anim).imageXscale = nativeSceneValue(2));
            (resolve(s.anim).imageYscale = nativeSceneValue(2));
        }
        if (sceneTruth(sceneEqual(s.timer, 9))) {
            {
                const caller57 = s;
                for (const target57 of targets(object("obj_heart"))) {
                    const other = caller57;
                    const s = target57;
                    {
                        (s.color = nativeSceneValue(0));
                        (s.sprite = nativeSceneValue("spr_heart"));
                        (s.inst = nativeSceneValue(create(resolve(object("obj_heart")).x, resolve(object("obj_heart")).y, object("obj_gerson_fakeheart"))));
                        (resolve(s.inst).directionhit = nativeSceneValue(180));
                        (resolve(s.inst).speed = nativeSceneValue(15.6));
                    }
                }
            }
            create(s.x, s.y, object("obj_shake"));
            host.call(s, "snd_play", "snd_screenshake");
        }
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(11)))) {
            if (sceneTruth((targets(object("obj_gerson_fakeheart")).length > 0))) {
                (v.xx = nativeSceneValue(resolve(object("obj_gerson_fakeheart")).x));
            }
            else {
                (v.xx = nativeSceneValue(resolve(object("obj_heart")).x));
            }
            (s.x1 = nativeSceneValue((v.xx - 30)));
            if (sceneTruth(lt(nativeSceneValue(s.x1), nativeSceneValue((rt.view.x + 50))))) {
                (s.x1 = nativeSceneValue((rt.view.x + 50)));
            }
        }
        if (sceneTruth(sceneEqual(s.timer, 35))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(1));
            (s.xxprev = nativeSceneValue(resolve(object("obj_gerson_fakeheart")).x));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth((sceneTruth(sceneEqual((s.timer % 20), 0)) && sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((s.x2 - 80))))))) {
            (s.gers = nativeSceneValue(create((resolve(object("obj_heart")).x + 20), (s.y1 + 20), object("obj_gerson_swing_down_new"))));
            if (sceneTruth(gt(nativeSceneValue(resolve(s.gers).x), nativeSceneValue((rt.view.x + 260))))) {
                (resolve(s.gers).x = nativeSceneValue((rt.view.x + 260)));
            }
        }
        if (sceneTruth((targets(object("obj_gerson_fakeheart")).length > 0))) {
            (v.xx = nativeSceneValue(resolve(object("obj_gerson_fakeheart")).x));
        }
        else {
            (v.xx = nativeSceneValue(resolve(object("obj_heart")).x));
        }
        if (sceneTruth(lt(nativeSceneValue(s.xxprev), nativeSceneValue(v.xx)))) {
            (s.y1 += nativeSceneValue(2));
        }
        if (sceneTruth(lt(nativeSceneValue(s.xxprev), nativeSceneValue(v.xx)))) {
            (s.xxprev = nativeSceneValue(v.xx));
        }
        if (sceneTruth(gt(nativeSceneValue(s.y1), nativeSceneValue((rt.view.y + 250))))) {
            (s.y1 = nativeSceneValue((rt.view.y + 250)));
        }
        (s.x1 = nativeSceneValue((v.xx - 30)));
        if (sceneTruth(lt(nativeSceneValue(s.x1), nativeSceneValue((rt.view.x + 50))))) {
            (s.x1 = nativeSceneValue((rt.view.x + 50)));
        }
        if (sceneTruth((sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((s.x2 - 50)))) && sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(30)))))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (resolve(object("obj_growtangle")).x = nativeSceneValue(resolve(object("obj_growtangle")).xstart));
        (resolve(object("obj_growtangle")).imageAlpha = nativeSceneValue(0));
        (s.x1 = nativeSceneValue(lerp(s.x1, (resolve(object("obj_growtangle")).x - (rt.spriteWidth(resolve(object("obj_growtangle"))) / 2)), 0.2)));
        (s.x2 = nativeSceneValue(lerp(s.x2, (resolve(object("obj_growtangle")).x + (rt.spriteWidth(resolve(object("obj_growtangle"))) / 2)), 0.2)));
        (s.y1 = nativeSceneValue(lerp(s.y1, (resolve(object("obj_growtangle")).y - (rt.spriteHeight(resolve(object("obj_growtangle"))) / 2)), 0.2)));
        (s.y2 = nativeSceneValue(lerp(s.y2, (resolve(object("obj_growtangle")).y + (rt.spriteHeight(resolve(object("obj_growtangle"))) / 2)), 0.2)));
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 2))) {
            host.call(s, "snd_play", "snd_smallswing");
            create(s.x, s.y, object("obj_spearblocker"));
        }
        if (sceneTruth(sceneEqual(s.timer, 20))) {
            (resolve(object("obj_growtangle")).imageAlpha = nativeSceneValue(1));
            rt.destroy(s);
        }
    }
    v.colo = host.call(s, "draw_get_color");
    host.call(s, "draw_set_colour", s.col);
    host.call(s, "d_line_width", s.x1, (s.y1 - 1), s.x1, (s.y2 + 2), 4);
    host.call(s, "d_line_width", s.x1, (s.y1 + 1), s.x2, (s.y1 + 1), 4);
    host.call(s, "d_line_width", s.x2, (s.y1 - 1), s.x2, (s.y2 + 2), 4);
    host.call(s, "d_line_width", s.x1, s.y2, s.x2, s.y2, 4);
    host.call(s, "draw_set_colour", v.colo);
}
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
        return;
    }
    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
        if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((s.x1 + 3))))) {
            (resolve(object("obj_heart")).x = nativeSceneValue((s.x1 + 3)));
        }
        if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(((s.x2 - 3) - 15))))) {
            (resolve(object("obj_heart")).x = nativeSceneValue(((s.x2 - 3) - 15)));
        }
        if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).y), nativeSceneValue((s.y1 + 3))))) {
            (resolve(object("obj_heart")).y = nativeSceneValue((s.y1 + 3)));
        }
        if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).y), nativeSceneValue(((s.y2 - 3) - 15))))) {
            (resolve(object("obj_heart")).y = nativeSceneValue(((s.y2 - 3) - 15)));
        }
    }
}
