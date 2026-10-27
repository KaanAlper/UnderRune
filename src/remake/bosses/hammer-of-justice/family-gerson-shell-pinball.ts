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
    {
        const caller190 = s;
        for (const target190 of targets(object("obj_battle_marker"))) {
            const other = caller190;
            const s = target190;
            {
                if (sceneTruth(host.call(s, "variable_instance_exists", s.id, "shell_controlled"))) {
                    rt.destroy(s);
                }
            }
        }
    }
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    host.inherited(s, rt, "create");
    v.aa = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.aa), nativeSceneValue(0)))) {
        (v.aa = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.aa)));
    (s.left_timer = nativeSceneValue((-1)));
    (s.right_timer = nativeSceneValue((-1)));
    (s.top_timer = nativeSceneValue((-1)));
    (s.imageSpeed = nativeSceneValue(8));
    (s.timer = nativeSceneValue(0));
    (s.im_done = nativeSceneValue(false));
    (s.xpprevious = nativeSceneValue(s.x));
    (s.ypprevious = nativeSceneValue(s.y));
    (s.gerson_x = nativeSceneValue(s.x));
    (s.gerson_y = nativeSceneValue(s.y));
    (s.counter = nativeSceneValue(rt.random.choose(0, (-1))));
    (s.grazetimer = nativeSceneValue(0));
    (s.grazepoints = nativeSceneValue(4));
    s.check_bounds = (arg0: any) => {
        const v: any = Object.create(null);
        {
            for (v.a = 0; lt(nativeSceneValue(v.a), nativeSceneValue(100)); (v.a++)) {
                v.checkx = (s.x + lengthdirX((v.a * 2), arg0));
                v.checky = (s.y + lengthdirY((v.a * 2), arg0));
                if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(v.checkx), nativeSceneValue((resolve(object("obj_growtangle")).x - 72)))) && sceneTruth(lt(nativeSceneValue(v.checkx), nativeSceneValue((resolve(object("obj_growtangle")).x + 72)))))) && sceneTruth(gt(nativeSceneValue(v.checky), nativeSceneValue((resolve(object("obj_growtangle")).y - 75)))))) && sceneTruth(lt(nativeSceneValue(v.checky), nativeSceneValue((resolve(object("obj_growtangle")).y + 75))))))) {
                    return true;
                }
            }
            return false;
        }
    };
    {
    }
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(s.im_done)) {
        return;
    }
    fog(true, 65280, 0, 1);
    drawSprite(s.sprite, s.imageIndex, s.xpprevious, s.ypprevious, (s.imageXscale * 0.85), (s.imageYscale * 0.85), s.imageAngle, s.imageBlend, 0.5);
    fog(false, 0, 0, 0);
    fog(true, 65280, 0, 1);
    drawSprite(s.sprite, s.imageIndex, s.xprevious, s.yprevious, (s.imageXscale * 0.85), (s.imageYscale * 0.85), s.imageAngle, s.imageBlend, s.imageAlpha);
    fog(false, 0, 0, 0);
    rt.drawSelf(s);
    (s.xpprevious = nativeSceneValue(s.xprevious));
    (s.ypprevious = nativeSceneValue(s.yprevious));
}
export function Other15(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(s.im_done)) {
        return;
    }
    v.a = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
        (v.a = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.a)));
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
    if (sceneTruth(s.im_done)) {
        return;
    }
    (s.grazetimer++);
    if (sceneTruth(gt(nativeSceneValue(s.grazetimer), nativeSceneValue(7)))) {
        (s.grazetimer = nativeSceneValue(0));
        (s.grazed = nativeSceneValue(0));
    }
    (s.timer++);
    (s.imageSpeed = nativeSceneValue(host.call(s, "scr_approach", s.imageSpeed, 0.5, 0.4)));
    if (sceneTruth((sceneTruth(sceneEqual((s.timer % 4), 0)) && sceneTruth(!sceneTruth(s.top_timer))))) {
        {
            const caller191 = s;
            for (const target191 of targets(host.call(s, "scr_fire_bullet", s.x, s.y, object("obj_regularbullet"), 0, 0, "spr_thrash_star"))) {
                const other = caller191;
                const s = target191;
                {
                    host.call(s, "scr_darksize");
                    (s.imageXscale = nativeSceneValue(1.5));
                    (s.imageYscale = nativeSceneValue(1.5));
                    host.call(s, "scr_script_delayed", "scr_lerpvar", 22, "image_xscale", s.imageXscale, 0, 4);
                    host.call(s, "scr_script_delayed", "scr_lerpvar", 22, "image_yscale", s.imageYscale, 0, 4);
                    host.call(s, "scr_script_delayed", "instance_destroy", 26);
                    (s.grazepoints = nativeSceneValue(2));
                    (s.spinspeed = nativeSceneValue(15));
                    (s.spin = nativeSceneValue(1));
                    v.aa = ((g.hp[2] - 30) / 250);
                    if (sceneTruth(lt(nativeSceneValue(v.aa), nativeSceneValue(0)))) {
                        (v.aa = nativeSceneValue(0));
                    }
                    (s.damage = nativeSceneValue(lerp(12, 90, v.aa)));
                    if (sceneTruth((sceneTruth(sceneEqual(g.chararmor1[2], 23)) || sceneTruth(sceneEqual(g.chararmor2[2], 23))))) {
                        (s.damage = nativeSceneValue(round((s.damage * 0.15))));
                    }
                }
            }
        }
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x - 72)))) && sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x + 72))))))) {
        if (sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((host.call(s, "scr_get_box", 3) - 16)))) && sceneTruth(lt(nativeSceneValue(s.counter), nativeSceneValue(7))))) && sceneTruth(gt(nativeSceneValue(s.vspeed), nativeSceneValue(0)))))) {
            (s.y = nativeSceneValue((host.call(s, "scr_get_box", 3) - 16)));
            host.call(s, "scr_lerpvar", "image_xscale", s.imageXscale, (s.imageXscale * 1.5), 3, 2, "out");
            host.call(s, "scr_script_delayed", "scr_lerpvar", 3, "image_xscale", (s.imageXscale * 1.5), s.imageXscale, 3, 2, "in");
            host.call(s, "scr_lerpvar", "image_yscale", s.imageYscale, (s.imageYscale * 0.5), 3, 2, "out");
            host.call(s, "scr_script_delayed", "scr_lerpvar", 3, "image_yscale", (s.imageYscale * 0.5), s.imageYscale, 3, 2, "in");
            host.call(s, "scr_script_delayed", "scr_var", 6, "vspeed", (-s.vspeed));
            host.call(s, "scr_script_delayed", "scr_var", 6, "hspeed", s.hspeed);
            (s.vspeed = nativeSceneValue(0));
            (s.hspeed = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_parry_fast_nodelay");
            {
                const caller192 = s;
                for (const target192 of targets(object("obj_growtangle"))) {
                    const other = caller192;
                    const s = target192;
                    {
                        if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue(250)))) {
                            host.call(s, "scr_lerpvar", "y", s.y, (s.y + 10), 6, 2, "out");
                        }
                    }
                }
            }
        }
        if (sceneTruth((sceneTruth((sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((host.call(s, "scr_get_box", 1) + 16)))) && sceneTruth(lt(nativeSceneValue(s.counter), nativeSceneValue(7))))) && sceneTruth(lt(nativeSceneValue(s.vspeed), nativeSceneValue(0)))))) {
            (s.y = nativeSceneValue((host.call(s, "scr_get_box", 1) + 16)));
            host.call(s, "scr_lerpvar", "image_xscale", s.imageXscale, (s.imageXscale * 1.5), 3, 2, "out");
            host.call(s, "scr_script_delayed", "scr_lerpvar", 3, "image_xscale", (s.imageXscale * 1.5), s.imageXscale, 3, 2, "in");
            host.call(s, "scr_lerpvar", "image_yscale", s.imageYscale, (s.imageYscale * 0.5), 3, 2, "out");
            host.call(s, "scr_script_delayed", "scr_lerpvar", 3, "image_yscale", (s.imageYscale * 0.5), s.imageYscale, 3, 2, "in");
            host.call(s, "scr_script_delayed", "scr_var", 6, "vspeed", (-s.vspeed));
            host.call(s, "scr_script_delayed", "scr_var", 6, "hspeed", s.hspeed);
            (s.vspeed = nativeSceneValue(0));
            (s.hspeed = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_parry_fast_nodelay");
            {
                const caller193 = s;
                for (const target193 of targets(object("obj_growtangle"))) {
                    const other = caller193;
                    const s = target193;
                    {
                        if (sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue(220)))) {
                            host.call(s, "scr_lerpvar", "y", s.y, (s.y - 10), 6, 2, "out");
                        }
                    }
                }
            }
        }
        if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((host.call(s, "scr_get_box", 3) - 16)))) && sceneTruth(ge(nativeSceneValue(s.top_timer), nativeSceneValue(20)))))) {
            (s.y = nativeSceneValue((host.call(s, "scr_get_box", 3) - 16)));
            host.call(s, "snd_play", "snd_explosion_firework");
            host.call(s, "snd_play", "snd_stardrop", 0.5, 0.75);
            host.call(s, "scr_shakescreen");
            {
                const caller194 = s;
                for (const target194 of targets(object("obj_gerson_shell_kick_controller"))) {
                    const other = caller194;
                    const s = target194;
                    {
                        (s.full_timer = nativeSceneValue(80));
                    }
                }
            }
            {
                const caller195 = s;
                for (const target195 of targets(create(s.x, s.y, object("obj_battle_marker")))) {
                    const other = caller195;
                    const s = target195;
                    {
                        (s.shell_controlled = nativeSceneValue(true));
                        (s.destroyoncomplete = nativeSceneValue(true));
                        (s.sprite = nativeSceneValue("spr_finisher_explosion"));
                        (s.imageSpeed = nativeSceneValue(0));
                        host.call(s, "scr_lerpvar", "image_index", s.imageIndex, 6, 6);
                        host.call(s, "scr_script_delayed", "instance_destroy", 6);
                    }
                }
            }
            for (v.a = (-6); lt(nativeSceneValue(v.a), nativeSceneValue(6)); (v.a++)) {
                if (sceneTruth(!sceneEqual(v.a, 0))) {
                    {
                        const caller196 = s;
                        for (const target196 of targets(create(s.x, (s.y + 8), object("obj_battle_marker")))) {
                            const other = caller196;
                            const s = target196;
                            {
                                (s.shell_controlled = nativeSceneValue(true));
                                (s.destroyoncomplete = nativeSceneValue(false));
                                (s.kill = nativeSceneValue(false));
                                (s.sprite = nativeSceneValue("spr_launchsmoke"));
                                (s.imageAngle = nativeSceneValue(rt.random.irandom(360)));
                                (s.imageXscale = nativeSceneValue((1 + (Math.abs(v.a) * 0.5))));
                                (s.imageYscale = nativeSceneValue((1 + (Math.abs(v.a) * 0.5))));
                                (s.gravityDirection = nativeSceneValue(90));
                                (s.gravity = nativeSceneValue(((Math.abs(v.a) * 0.05) + rt.random.random(0.1))));
                                (s.hspeed = nativeSceneValue((v.a * 3)));
                                host.call(...rtl(() => s, () => "scr_lerpvar", () => "hspeed", () => s.hspeed, () => (s.hspeed * 0.25), () => (2 + (Math.abs(v.a) * 6))));
                                host.call(...rtl(() => s, () => "scr_lerpvar", () => "image_xscale", () => s.imageXscale, () => (s.imageXscale * 0.75), () => (2 + (Math.abs(v.a) * 6))));
                                host.call(...rtl(() => s, () => "scr_lerpvar", () => "image_yscale", () => s.imageYscale, () => (s.imageXscale * 0.75), () => (2 + (Math.abs(v.a) * 6))));
                                host.call(...rtl(() => s, () => "scr_lerpvar", () => "image_alpha", () => 1, () => 0, () => (2 + (Math.abs(v.a) * 6))));
                                host.call(...rtl(() => s, () => "scr_lerpvar", () => "image_angle", () => s.imageAngle, () => (s.imageAngle + (180 * Math.sign(v.a))), () => (2 + (Math.abs(v.a) * 6))));
                                host.call(...rtl(() => s, () => "scr_script_delayed", () => "instance_destroy", () => (2 + (Math.abs(v.a) * 6))));
                            }
                        }
                    }
                }
            }
            for (v.a = (-2); lt(nativeSceneValue(v.a), nativeSceneValue(2)); (v.a++)) {
                {
                    const caller197 = s;
                    for (const target197 of targets(host.call(s, "scr_fire_bullet", s.x, s.y, object("obj_regularbullet"), 0, 0, "spr_gerson_star7"))) {
                        const other = caller197;
                        const s = target197;
                        {
                            (s.active = nativeSceneValue(false));
                            (s.imageBlend = nativeSceneValue(8421504));
                            (s.spinspeed = nativeSceneValue(15));
                            (s.spin = nativeSceneValue(1));
                            (s.grazepoints = nativeSceneValue(2));
                            v.aa = ((g.hp[2] - 30) / 250);
                            if (sceneTruth(lt(nativeSceneValue(v.aa), nativeSceneValue(0)))) {
                                (v.aa = nativeSceneValue(0));
                            }
                            (s.damage = nativeSceneValue(lerp(12, 90, v.aa)));
                            if (sceneTruth((sceneTruth(sceneEqual(g.chararmor1[2], 23)) || sceneTruth(sceneEqual(g.chararmor2[2], 23))))) {
                                (s.damage = nativeSceneValue(round((s.damage * 0.15))));
                            }
                            host.call(s, "scr_script_delayed", "scr_var", 8, "image_blend", 10855845);
                            host.call(s, "scr_script_delayed", "scr_var", 9, "image_blend", 13421772);
                            host.call(s, "scr_script_delayed", "scr_var", 10, "image_blend", 15921906);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "image_blend", 16777215);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "active", true);
                            host.call(s, "scr_darksize");
                            (s.imageXscale = nativeSceneValue(1.5));
                            (s.imageYscale = nativeSceneValue(1.5));
                            if (sceneTruth(rt.random.irandom(1))) {
                                (s.imageXscale -= nativeSceneValue(0.5));
                                (s.imageYscale -= nativeSceneValue(0.5));
                            }
                            (s.direction = nativeSceneValue((90 + (4 * v.a))));
                            (s.speed = nativeSceneValue(12));
                            (s.direction += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.speed += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.hspeed *= nativeSceneValue(0.5));
                            (s.gravityDirection = nativeSceneValue(270));
                            (s.gravity = nativeSceneValue(0.535));
                        }
                    }
                }
            }
            for (v.a = (-5); lt(nativeSceneValue(v.a), nativeSceneValue(5)); (v.a++)) {
                {
                    const caller198 = s;
                    for (const target198 of targets(host.call(s, "scr_fire_bullet", (s.x + 24), s.y, object("obj_regularbullet"), 0, 0, "spr_gerson_star7"))) {
                        const other = caller198;
                        const s = target198;
                        {
                            (s.active = nativeSceneValue(false));
                            (s.imageBlend = nativeSceneValue(8421504));
                            (s.spinspeed = nativeSceneValue(15));
                            (s.spin = nativeSceneValue(1));
                            (s.grazepoints = nativeSceneValue(2));
                            v.aa = ((g.hp[2] - 30) / 250);
                            if (sceneTruth(lt(nativeSceneValue(v.aa), nativeSceneValue(0)))) {
                                (v.aa = nativeSceneValue(0));
                            }
                            (s.damage = nativeSceneValue(lerp(12, 90, v.aa)));
                            if (sceneTruth((sceneTruth(sceneEqual(g.chararmor1[2], 23)) || sceneTruth(sceneEqual(g.chararmor2[2], 23))))) {
                                (s.damage = nativeSceneValue(round((s.damage * 0.15))));
                            }
                            host.call(s, "scr_script_delayed", "scr_var", 8, "image_blend", 10855845);
                            host.call(s, "scr_script_delayed", "scr_var", 9, "image_blend", 13421772);
                            host.call(s, "scr_script_delayed", "scr_var", 10, "image_blend", 15921906);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "image_blend", 16777215);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "active", true);
                            host.call(s, "scr_darksize");
                            (s.imageXscale = nativeSceneValue(1.5));
                            (s.imageYscale = nativeSceneValue(1.5));
                            if (sceneTruth(rt.random.irandom(1))) {
                                (s.imageXscale -= nativeSceneValue(0.5));
                                (s.imageYscale -= nativeSceneValue(0.5));
                            }
                            (s.direction = nativeSceneValue((90 + (7 * v.a))));
                            (s.speed = nativeSceneValue(13.25));
                            (s.direction += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.speed += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.hspeed *= nativeSceneValue(0.5));
                            (s.gravityDirection = nativeSceneValue(270));
                            (s.gravity = nativeSceneValue(0.5));
                        }
                    }
                }
            }
            for (v.a = (-4); lt(nativeSceneValue(v.a), nativeSceneValue(4)); (v.a++)) {
                {
                    const caller199 = s;
                    for (const target199 of targets(host.call(s, "scr_fire_bullet", s.x, s.y, object("obj_regularbullet"), 0, 0, "spr_gerson_star7"))) {
                        const other = caller199;
                        const s = target199;
                        {
                            (s.active = nativeSceneValue(false));
                            (s.imageBlend = nativeSceneValue(8421504));
                            (s.spinspeed = nativeSceneValue(15));
                            (s.spin = nativeSceneValue(1));
                            (s.grazepoints = nativeSceneValue(2));
                            v.aa = ((g.hp[2] - 30) / 250);
                            if (sceneTruth(lt(nativeSceneValue(v.aa), nativeSceneValue(0)))) {
                                (v.aa = nativeSceneValue(0));
                            }
                            (s.damage = nativeSceneValue(lerp(12, 90, v.aa)));
                            if (sceneTruth((sceneTruth(sceneEqual(g.chararmor1[2], 23)) || sceneTruth(sceneEqual(g.chararmor2[2], 23))))) {
                                (s.damage = nativeSceneValue(round((s.damage * 0.15))));
                            }
                            host.call(s, "scr_script_delayed", "scr_var", 8, "image_blend", 10855845);
                            host.call(s, "scr_script_delayed", "scr_var", 9, "image_blend", 13421772);
                            host.call(s, "scr_script_delayed", "scr_var", 10, "image_blend", 15921906);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "image_blend", 16777215);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "active", true);
                            host.call(s, "scr_darksize");
                            (s.imageXscale = nativeSceneValue(1.5));
                            (s.imageYscale = nativeSceneValue(1.5));
                            if (sceneTruth(rt.random.irandom(1))) {
                                (s.imageXscale -= nativeSceneValue(0.5));
                                (s.imageYscale -= nativeSceneValue(0.5));
                            }
                            (s.direction = nativeSceneValue((90 + (6 * v.a))));
                            (s.speed = nativeSceneValue(14.5));
                            (s.direction += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.speed += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.hspeed *= nativeSceneValue(0.5));
                            (s.gravityDirection = nativeSceneValue(270));
                            (s.gravity = nativeSceneValue(0.465));
                        }
                    }
                }
            }
            for (v.a = (-3); lt(nativeSceneValue(v.a), nativeSceneValue(3)); (v.a++)) {
                {
                    const caller200 = s;
                    for (const target200 of targets(host.call(s, "scr_fire_bullet", (s.x - 24), s.y, object("obj_regularbullet"), 0, 0, "spr_gerson_star7"))) {
                        const other = caller200;
                        const s = target200;
                        {
                            (s.active = nativeSceneValue(false));
                            (s.imageBlend = nativeSceneValue(8421504));
                            (s.spinspeed = nativeSceneValue(15));
                            (s.spin = nativeSceneValue(1));
                            (s.grazepoints = nativeSceneValue(2));
                            v.aa = ((g.hp[2] - 30) / 250);
                            if (sceneTruth(lt(nativeSceneValue(v.aa), nativeSceneValue(0)))) {
                                (v.aa = nativeSceneValue(0));
                            }
                            (s.damage = nativeSceneValue(lerp(12, 90, v.aa)));
                            if (sceneTruth((sceneTruth(sceneEqual(g.chararmor1[2], 23)) || sceneTruth(sceneEqual(g.chararmor2[2], 23))))) {
                                (s.damage = nativeSceneValue(round((s.damage * 0.15))));
                            }
                            host.call(s, "scr_script_delayed", "scr_var", 8, "image_blend", 10855845);
                            host.call(s, "scr_script_delayed", "scr_var", 9, "image_blend", 13421772);
                            host.call(s, "scr_script_delayed", "scr_var", 10, "image_blend", 15921906);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "image_blend", 16777215);
                            host.call(s, "scr_script_delayed", "scr_var", 11, "active", true);
                            host.call(s, "scr_darksize");
                            (s.imageXscale = nativeSceneValue(1.5));
                            (s.imageYscale = nativeSceneValue(1.5));
                            if (sceneTruth(rt.random.irandom(1))) {
                                (s.imageXscale -= nativeSceneValue(0.5));
                                (s.imageYscale -= nativeSceneValue(0.5));
                            }
                            (s.direction = nativeSceneValue((90 + (5 * v.a))));
                            (s.speed = nativeSceneValue(15.75));
                            (s.direction += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.speed += nativeSceneValue(rt.random.randomRange((-1), 1)));
                            (s.hspeed *= nativeSceneValue(0.5));
                            (s.gravityDirection = nativeSceneValue(270));
                            (s.gravity = nativeSceneValue(0.43));
                        }
                    }
                }
            }
            (s.im_done = nativeSceneValue(true));
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x - 73)))) && sceneTruth(lt(nativeSceneValue(s.hspeed), nativeSceneValue(0))))) && sceneTruth(sceneEqual(s.left_timer, (-1)))))) {
        (s.left_timer = nativeSceneValue(0));
    }
    if (sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((resolve(object("obj_growtangle")).x + 92)))) && sceneTruth(gt(nativeSceneValue(s.hspeed), nativeSceneValue(0))))) && sceneTruth(sceneEqual(s.right_timer, (-1)))))) {
        (s.right_timer = nativeSceneValue(0));
    }
    if (sceneTruth(gt(nativeSceneValue(s.left_timer), nativeSceneValue((-1))))) {
        (s.left_timer++);
    }
    if (sceneTruth(gt(nativeSceneValue(s.right_timer), nativeSceneValue((-1))))) {
        (s.right_timer++);
    }
    if (sceneTruth(gt(nativeSceneValue(s.top_timer), nativeSceneValue((-1))))) {
        (s.top_timer++);
    }
    switch (nativeSceneValue(s.left_timer)) {
        case 1:
            (s.gerson_x = nativeSceneValue((s.x + (s.hspeed * 6))));
            (s.gerson_y = nativeSceneValue((s.y + (s.vspeed * 6))));
            {
                const caller201 = s;
                for (const target201 of targets(create((s.gerson_x - 108), (s.gerson_y + 24), object("obj_gerson_teleport_generic")))) {
                    const other = caller201;
                    const s = target201;
                    {
                        host.call(s, "scr_script_delayed", "instance_destroy", 4);
                    }
                }
            }
            break;
        case 5:
            {
                const caller202 = s;
                for (const target202 of targets(create((s.gerson_x - 40), s.gerson_y, object("obj_battle_marker")))) {
                    const other = caller202;
                    const s = target202;
                    {
                        (s.shell_controlled = nativeSceneValue(true));
                        (s.destroyoncomplete = nativeSceneValue(true));
                        (s.sprite = nativeSceneValue("spr_gerson_swing"));
                        (s.imageIndex = nativeSceneValue(3));
                        host.call(s, "scr_darksize");
                        (s.imageXscale *= nativeSceneValue((-1)));
                        host.call(s, "scr_lerpvar", "image_index", 3, 6, 6);
                        host.call(s, "scr_script_delayed", "instance_destroy", 10);
                    }
                }
            }
            break;
        case 7:
            host.call(s, "snd_play", "snd_queen_punched_lower");
            (s.counter++);
            if (sceneTruth(lt(nativeSceneValue(s.counter), nativeSceneValue(7)))) {
                v.dir = host.call(s, "scr_at_player", s.x, s.y);
                if (sceneTruth(rt.random.irandom(1))) {
                    if (sceneTruth(s.check_bounds(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => ((host.call(s, "scr_get_box", 3) - (resolve(object("obj_heart")).y + 10)) + host.call(s, "scr_get_box", 3))))))) {
                        (v.dir = nativeSceneValue(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => ((host.call(s, "scr_get_box", 3) - (resolve(object("obj_heart")).y + 10)) + host.call(s, "scr_get_box", 3))))));
                    }
                    if (sceneTruth(s.check_bounds(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => (host.call(s, "scr_get_box", 1) - ((resolve(object("obj_heart")).y + 10) - host.call(s, "scr_get_box", 1)))))))) {
                        (v.dir = nativeSceneValue(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => (host.call(s, "scr_get_box", 1) - ((resolve(object("obj_heart")).y + 10) - host.call(s, "scr_get_box", 1)))))));
                    }
                }
                (s.direction = nativeSceneValue(v.dir));
                (s.speed = nativeSceneValue(host.call(s, "scr_approach", s.speed, 15, 1.5)));
            }
            else {
                (s.direction = nativeSceneValue(pointDirection(...rtl(() => s.x, () => s.y, () => host.call(s, "scr_get_box", 4), () => (host.call(s, "scr_get_box", 1) - 80)))));
                (s.speed = nativeSceneValue((Math.abs(pointDistance(...rtl(() => host.call(s, "scr_get_box", 4), () => (host.call(s, "scr_get_box", 1) - 80), () => s.x, () => s.y))) / 30)));
                (s.top_timer = nativeSceneValue(0));
            }
            (s.imageSpeed = nativeSceneValue(8));
            break;
        case 15:
            {
                const caller203 = s;
                for (const target203 of targets(create((s.gerson_x - 108), (s.gerson_y + 24), object("obj_gerson_teleport_generic")))) {
                    const other = caller203;
                    const s = target203;
                    {
                        host.call(s, "scr_script_delayed", "instance_destroy", 4);
                    }
                }
            }
            (s.left_timer = nativeSceneValue((-1)));
            break;
    }
    switch (nativeSceneValue(s.right_timer)) {
        case 1:
            (s.gerson_x = nativeSceneValue((s.x + (s.hspeed * 6))));
            (s.gerson_y = nativeSceneValue((s.y + (s.vspeed * 6))));
            {
                const caller204 = s;
                for (const target204 of targets(create((s.gerson_x + 40), (s.gerson_y + 16), object("obj_gerson_teleport_generic")))) {
                    const other = caller204;
                    const s = target204;
                    {
                        host.call(s, "scr_script_delayed", "instance_destroy", 4);
                    }
                }
            }
            break;
        case 5:
            {
                const caller205 = s;
                for (const target205 of targets(create((s.gerson_x - 8), s.gerson_y, object("obj_battle_marker")))) {
                    const other = caller205;
                    const s = target205;
                    {
                        (s.shell_controlled = nativeSceneValue(true));
                        (s.destroyoncomplete = nativeSceneValue(true));
                        (s.sprite = nativeSceneValue("spr_gerson_swing"));
                        (s.imageIndex = nativeSceneValue(3));
                        host.call(s, "scr_darksize");
                        host.call(s, "scr_lerpvar", "image_index", 3, 6, 6);
                        host.call(s, "scr_script_delayed", "instance_destroy", 10);
                    }
                }
            }
            break;
        case 7:
            host.call(s, "snd_play", "snd_queen_punched_lower");
            (s.counter++);
            if (sceneTruth(lt(nativeSceneValue(s.counter), nativeSceneValue(7)))) {
                v.dir = host.call(s, "scr_at_player", s.x, s.y);
                if (sceneTruth(rt.random.irandom(1))) {
                    if (sceneTruth(s.check_bounds(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => ((host.call(s, "scr_get_box", 3) - (resolve(object("obj_heart")).y + 10)) + host.call(s, "scr_get_box", 3))))))) {
                        (v.dir = nativeSceneValue(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => ((host.call(s, "scr_get_box", 3) - (resolve(object("obj_heart")).y + 10)) + host.call(s, "scr_get_box", 3))))));
                    }
                    if (sceneTruth(s.check_bounds(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => (host.call(s, "scr_get_box", 1) - ((resolve(object("obj_heart")).y + 10) - host.call(s, "scr_get_box", 1)))))))) {
                        (v.dir = nativeSceneValue(pointDirection(...rtl(() => s.x, () => s.y, () => (resolve(object("obj_heart")).x + 10), () => (host.call(s, "scr_get_box", 1) - ((resolve(object("obj_heart")).y + 10) - host.call(s, "scr_get_box", 1)))))));
                    }
                }
                (s.direction = nativeSceneValue(v.dir));
                (s.speed = nativeSceneValue(host.call(s, "scr_approach", s.speed, 15, 1.5)));
            }
            else {
                (s.direction = nativeSceneValue(pointDirection(...rtl(() => s.x, () => s.y, () => host.call(s, "scr_get_box", 4), () => (host.call(s, "scr_get_box", 1) - 80)))));
                (s.speed = nativeSceneValue((Math.abs(pointDistance(...rtl(() => host.call(s, "scr_get_box", 4), () => (host.call(s, "scr_get_box", 1) - 80), () => s.x, () => s.y))) / 30)));
                (s.top_timer = nativeSceneValue(0));
            }
            (s.imageSpeed = nativeSceneValue(8));
            break;
        case 15:
            {
                const caller206 = s;
                for (const target206 of targets(create((s.gerson_x + 40), (s.gerson_y + 16), object("obj_gerson_teleport_generic")))) {
                    const other = caller206;
                    const s = target206;
                    {
                        host.call(s, "scr_script_delayed", "instance_destroy", 4);
                    }
                }
            }
            (s.right_timer = nativeSceneValue((-1)));
            break;
    }
    switch (nativeSceneValue(s.top_timer)) {
        case 0:
            host.call(s, "scr_lerpvar", "image_angle", s.imageAngle, (s.imageAngle + 270), 30, 2, "out");
            {
                const caller207 = s;
                for (const target207 of targets(create(...rtl(() => host.call(s, "scr_get_box", 4), () => (host.call(s, "scr_get_box", 1) + 80), () => object("obj_battle_marker"))))) {
                    const other = caller207;
                    const s = target207;
                    {
                        (s.shell_controlled = nativeSceneValue(true));
                        (s.destroyoncomplete = nativeSceneValue(true));
                        (s.sprite = nativeSceneValue("spr_gerson_swing_down_new"));
                        (s.depth = nativeSceneValue((resolve(object("obj_growtangle")).depth + 1)));
                        (s.imageIndex = nativeSceneValue(0));
                        (s.imageSpeed = nativeSceneValue(0));
                        (s.imageAlpha = nativeSceneValue(0));
                        host.call(s, "scr_darksize");
                        host.call(s, "scr_lerpvar", "image_alpha", 0, 1, 4);
                        host.call(s, "scr_lerpvar", "image_index", 0, 1, 6);
                        host.call(s, "scr_lerpvar", "y", s.y, (s.y - 240), 29, 2, "out");
                        host.call(s, "snd_play", "snd_jump");
                    }
                }
            }
            break;
        case 29:
            {
                const caller208 = s;
                for (const target208 of targets(object("obj_battle_marker"))) {
                    const other = caller208;
                    const s = target208;
                    {
                        if (sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down_new"))) {
                            (s.depth = nativeSceneValue((resolve(object("obj_growtangle")).depth - 1)));
                            host.call(s, "scr_lerpvar", "image_index", 2, 4, 2);
                            host.call(s, "scr_lerpvar", "y", s.y, (s.y + 80), 8, 2, "out");
                        }
                    }
                }
            }
            break;
        case 30:
            host.call(s, "scr_shakescreen");
            host.call(s, "snd_play", "snd_queen_punched_lower_heavy");
            host.call(s, "snd_play", "snd_rudebuster_swing");
            {
                const caller209 = s;
                for (const target209 of targets(host.call(s, "scr_sonic_boom", 270, 2))) {
                    const other = caller209;
                    const s = target209;
                    {
                        (s.y += nativeSceneValue(20));
                    }
                }
            }
            {
                const caller210 = s;
                for (const target210 of targets(host.call(s, "scr_sonic_boom", 270, 3))) {
                    const other = caller210;
                    const s = target210;
                    {
                        (s.y += nativeSceneValue(40));
                    }
                }
            }
            (s.direction = nativeSceneValue(270));
            (s.imageAngle = nativeSceneValue(90));
            (s.speed = nativeSceneValue(30));
            (s.imageSpeed = nativeSceneValue(8));
            break;
        case 36:
            {
                const caller211 = s;
                for (const target211 of targets(object("obj_battle_marker"))) {
                    const other = caller211;
                    const s = target211;
                    {
                        if (sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down_new"))) {
                            host.call(s, "scr_script_delayed", "instance_destroy", 4);
                        }
                    }
                }
            }
            break;
    }
}
