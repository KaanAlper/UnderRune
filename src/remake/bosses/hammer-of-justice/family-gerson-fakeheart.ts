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
    if (sceneTruth(le(nativeSceneValue(g.turntimer), nativeSceneValue(0)))) {
        (g.inv = nativeSceneValue((-1)));
    }
    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
        (resolve(object("obj_heart")).imageAlpha = nativeSceneValue(1));
        (resolve(object("obj_heart")).x = nativeSceneValue(s.x));
        (resolve(object("obj_heart")).y = nativeSceneValue(s.y));
    }
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (g.inv = nativeSceneValue(300));
    (s.con = nativeSceneValue(0));
    (s.directionhit = nativeSceneValue(260));
    (s.flashtimer = nativeSceneValue(0));
    (s.boxhittimer = nativeSceneValue(0));
    (s.dusttimer = nativeSceneValue(0));
    (s.depth = nativeSceneValue(resolve(object("obj_heart")).depth));
    (resolve(object("obj_heart")).imageAlpha = nativeSceneValue(0));
    (s.speed = nativeSceneValue(20));
    (s.friction = nativeSceneValue(0.5));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(0))) || sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0)))))) {
        rt.destroy(s);
        return;
    }
    (s.xx = nativeSceneValue(host.call(s, "scr_orbitx", (s.x + 9), (s.y + 9), s.x, s.y, s.imageAngle)));
    (s.yy = nativeSceneValue(host.call(s, "scr_orbity", (s.x + 9), (s.y + 9), s.x, s.y, s.imageAngle)));
    if (sceneTruth((sceneTruth(!sceneEqual(s.imageXscale, 1)) || sceneTruth(!sceneEqual(s.imageYscale, 1))))) {
        host.call(s, "draw_sprite_ext_centerscale", s.sprite, resolve(object("obj_heart")).imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, 16777215, s.imageAlpha);
    }
    else {
        drawSprite(s.sprite, resolve(object("obj_heart")).imageIndex, s.xx, s.yy, s.imageXscale, s.imageYscale, s.imageAngle, 0xffffff, s.imageAlpha);
    }
    if (sceneTruth(gt(nativeSceneValue(s.flashtimer), nativeSceneValue(0)))) {
        (s.flashtimer--);
        v._alpha = host.call(s, "scr_wrap", (s.flashtimer / 10), 0, 1);
        fog(true, 0xffffff, 0, 1);
        if (sceneTruth((sceneTruth(!sceneEqual(s.imageXscale, 1)) || sceneTruth(!sceneEqual(s.imageYscale, 1))))) {
            host.call(s, "draw_sprite_ext_centerscale", s.sprite, resolve(object("obj_heart")).imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, 16777215, v._alpha);
        }
        else {
            drawSprite(s.sprite, resolve(object("obj_heart")).imageIndex, s.xx, s.yy, s.imageXscale, s.imageYscale, s.imageAngle, 0xffffff, v._alpha);
        }
        fog(false, 0, 0, 0);
    }
}
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(0))) || sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0)))))) {
        rt.destroy(s);
        return;
    }
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.direction = nativeSceneValue(s.directionhit));
        (s.flashtimer = nativeSceneValue(61));
        (s.con = nativeSceneValue(1));
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        if (sceneTruth(lt(nativeSceneValue(s.speed), nativeSceneValue(4)))) {
            (s.imageAngle = nativeSceneValue(lerp(s.imageAngle, 0, 0.3)));
        }
        else {
            (s.imageAngle += nativeSceneValue((s.speed * 2)));
            if (sceneTruth(gt(nativeSceneValue(s.imageAngle), nativeSceneValue(360)))) {
                (s.imageAngle -= nativeSceneValue(360));
            }
            (s.dusttimer++);
            if (sceneTruth(sceneEqual((s.dusttimer % 6), 0))) {
                (s.inst = nativeSceneValue(createDepth(s.x, s.y, (s.depth + 1), object("obj_animation"))));
                (resolve(s.inst).sprite = nativeSceneValue("spr_dust2"));
                (resolve(s.inst).imageIndex = nativeSceneValue(2));
                (resolve(s.inst).imageSpeed = nativeSceneValue(0.25));
                (resolve(s.inst).imageXscale = nativeSceneValue((1.1 + rt.random.random(0.4))));
                (resolve(s.inst).imageYscale = nativeSceneValue((1.1 + rt.random.random(0.4))));
            }
        }
        v._box_left = host.call(s, "scr_get_box", 2);
        v._box_right = host.call(s, "scr_get_box", 0);
        v._box_top = host.call(s, "scr_get_box", 1);
        v._box_bottom = host.call(s, "scr_get_box", 3);
        if (sceneTruth((targets(object("obj_gerson_growtangle")).length > 0))) {
            (v._box_left = nativeSceneValue(resolve(object("obj_gerson_growtangle")).x1));
            (v._box_right = nativeSceneValue(resolve(object("obj_gerson_growtangle")).x2));
            (v._box_top = nativeSceneValue(resolve(object("obj_gerson_growtangle")).y1));
            (v._box_bottom = nativeSceneValue(resolve(object("obj_gerson_growtangle")).y2));
        }
        (s.boxhittimer--);
        if (sceneTruth((sceneTruth((sceneTruth(le(nativeSceneValue(s.boxhittimer), nativeSceneValue(0))) && sceneTruth(!sceneTruth((targets(object("obj_gerson_growtangle")).length > 0))))) && sceneTruth((sceneTruth((sceneTruth((sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue(v._box_left))) || sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((v._box_right - 20)))))) || sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue(v._box_top))))) || sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((v._box_bottom - 20))))))))) {
            (s.boxhittimer = nativeSceneValue(3));
            host.call(s, "snd_play", "snd_impact");
            host.call(s, "snd_play", "snd_damage");
            if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue(v._box_left)))) {
                if (sceneTruth(gt(nativeSceneValue(s.direction), nativeSceneValue(180)))) {
                    (s.direction = nativeSceneValue(315));
                }
                else {
                    (s.direction = nativeSceneValue(45));
                }
                (s.x = nativeSceneValue((v._box_left + 20)));
                {
                    const caller41 = s;
                    for (const target41 of targets(object("obj_growtangle"))) {
                        const other = caller41;
                        const s = target41;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller42 = s;
                                for (const target42 of targets(v._shakeobj)) {
                                    const other = caller42;
                                    const s = target42;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
                {
                    const caller43 = s;
                    for (const target43 of targets(object("obj_gerson_growtangle"))) {
                        const other = caller43;
                        const s = target43;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller44 = s;
                                for (const target44 of targets(v._shakeobj)) {
                                    const other = caller44;
                                    const s = target44;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((v._box_right - 20))))) {
                if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.direction), nativeSceneValue(0))) && sceneTruth(lt(nativeSceneValue(s.direction), nativeSceneValue(90)))))) {
                    (s.direction = nativeSceneValue(135));
                }
                else {
                    (s.direction = nativeSceneValue(225));
                }
                (s.x = nativeSceneValue((v._box_right - 60)));
                {
                    const caller45 = s;
                    for (const target45 of targets(object("obj_growtangle"))) {
                        const other = caller45;
                        const s = target45;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller46 = s;
                                for (const target46 of targets(v._shakeobj)) {
                                    const other = caller46;
                                    const s = target46;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
                {
                    const caller47 = s;
                    for (const target47 of targets(object("obj_gerson_growtangle"))) {
                        const other = caller47;
                        const s = target47;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller48 = s;
                                for (const target48 of targets(v._shakeobj)) {
                                    const other = caller48;
                                    const s = target48;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue(v._box_top)))) {
                if (sceneTruth(gt(nativeSceneValue(s.direction), nativeSceneValue(90)))) {
                    (s.direction = nativeSceneValue(225));
                }
                else {
                    (s.direction = nativeSceneValue(315));
                }
                (s.y = nativeSceneValue((v._box_top + 20)));
                {
                    const caller49 = s;
                    for (const target49 of targets(object("obj_growtangle"))) {
                        const other = caller49;
                        const s = target49;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj_y"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller50 = s;
                                for (const target50 of targets(v._shakeobj)) {
                                    const other = caller50;
                                    const s = target50;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
                {
                    const caller51 = s;
                    for (const target51 of targets(object("obj_gerson_growtangle"))) {
                        const other = caller51;
                        const s = target51;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj_y"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller52 = s;
                                for (const target52 of targets(v._shakeobj)) {
                                    const other = caller52;
                                    const s = target52;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((v._box_bottom - 20))))) {
                if (sceneTruth(gt(nativeSceneValue(s.direction), nativeSceneValue(270)))) {
                    (s.direction = nativeSceneValue(45));
                }
                else {
                    (s.direction = nativeSceneValue(135));
                }
                (s.y = nativeSceneValue((v._box_bottom - 40)));
                {
                    const caller53 = s;
                    for (const target53 of targets(object("obj_growtangle"))) {
                        const other = caller53;
                        const s = target53;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj_y"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller54 = s;
                                for (const target54 of targets(v._shakeobj)) {
                                    const other = caller54;
                                    const s = target54;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
                {
                    const caller55 = s;
                    for (const target55 of targets(object("obj_gerson_growtangle"))) {
                        const other = caller55;
                        const s = target55;
                        {
                            v._shakeobj = create(s.x, s.y, object("obj_shakeobj_y"));
                            (resolve(v._shakeobj).target = nativeSceneValue(s.id));
                            {
                                const caller56 = s;
                                for (const target56 of targets(v._shakeobj)) {
                                    const other = caller56;
                                    const s = target56;
                                    {
                                        rt.userEvent(s, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (sceneTruth(le(nativeSceneValue(s.speed), nativeSceneValue(0)))) {
            rt.destroy(s);
        }
    }
}
