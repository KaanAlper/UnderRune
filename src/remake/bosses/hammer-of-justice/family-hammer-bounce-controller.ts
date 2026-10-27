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
    (s.timer = nativeSceneValue(0));
    (s.full_timer = nativeSceneValue(1.5));
    (s.hammer_timer = nativeSceneValue(17));
    (s.hammer_timer_goal = nativeSceneValue(30));
    (s.hammer_counter = nativeSceneValue(0));
    (s.hammer_phase = nativeSceneValue((-1)));
    (s.ending_counter = nativeSceneValue(0));
    (s.z = nativeSceneValue(0));
    (s.anchor_x = nativeSceneValue(s.x));
    (s.anchor_y = nativeSceneValue(s.y));
    host.call(s, "scr_darksize");
    (s.imageSpeed = nativeSceneValue(0.5));
    {
        const caller86 = s;
        for (const target86 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller86;
            const s = target86;
            {
                (s.visible = nativeSceneValue(false));
            }
        }
    }
    (g.turntimer = nativeSceneValue(9999));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; drawSprite(s.sprite, s.imageIndex, s.x, (s.y - s.z), s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha); }
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    (s.full_timer++);
    switch (nativeSceneValue(s.timer)) {
        case 15:
            (s.visible = nativeSceneValue(false));
            create((s.x + 64), (s.y + 36), object("obj_gerson_teleport_generic"));
            (s.x = nativeSceneValue((resolve(object("obj_growtangle")).x + 80)));
            (s.y = nativeSceneValue((resolve(object("obj_growtangle")).y - 20)));
            (s.anchor_x = nativeSceneValue(s.x));
            (s.anchor_y = nativeSceneValue(s.y));
            break;
        case 19:
            {
                const caller87 = s;
                for (const target87 of targets(object("obj_gerson_teleport_generic"))) {
                    const other = caller87;
                    const s = target87;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (s.sprite = nativeSceneValue("spr_gerson_swing"));
            create((s.x + 58), (s.y + 36), object("obj_gerson_teleport_generic"));
            break;
        case 23:
            {
                const caller88 = s;
                for (const target88 of targets(object("obj_gerson_teleport_generic"))) {
                    const other = caller88;
                    const s = target88;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (s.visible = nativeSceneValue(true));
            (s.imageIndex = nativeSceneValue(0));
            (s.imageSpeed = nativeSceneValue(0));
            host.call(s, "scr_lerpvar", "image_index", 0, 6, 12);
            host.call(s, "snd_play", "motor_upper_quick_mid");
            break;
        case 31:
            host.call(s, "snd_play", "snd_queen_punched_lower");
            host.call(s, "scr_shakeobj");
            {
                const caller89 = s;
                for (const target89 of targets(object("obj_growtangle"))) {
                    const other = caller89;
                    const s = target89;
                    {
                        host.call(s, "scr_lerpvar", "x", s.x, (s.x - 80), 10, 2, "out");
                        host.call(s, "scr_lerpvar", "image_angle", s.imageAngle, (s.imageAngle + 180), 12, 2, "out");
                    }
                }
            }
            break;
        case 42:
            (s.hammer_phase = nativeSceneValue(0));
            host.call(s, "scr_script_delayed", "scr_lerpvar", 4, "x", s.x, (s.anchor_x + 60), 8, 2, "out");
            host.call(s, "scr_script_delayed", "scr_lerpvar", 4, "y", s.y, s.anchor_y, 8, 2, "out");
            (s.sprite = nativeSceneValue("spr_gerson_hammer_throw"));
            (s.imageIndex = nativeSceneValue(0));
            break;
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(30))) && sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(41)))))) {
        {
            const caller90 = s;
            for (const target90 of targets(object("obj_growtangle"))) {
                const other = caller90;
                const s = target90;
                {
                    {
                        const caller91 = s;
                        for (const target91 of targets(host.call(s, "scr_afterimagefast"))) {
                            const other = caller91;
                            const s = target91;
                            {
                                (s.fadeSpeed *= nativeSceneValue(3));
                            }
                        }
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.hammer_phase, 0))) {
        (s.hammer_timer++);
        if (sceneTruth(sceneEqual(s.hammer_timer, s.hammer_timer_goal))) {
            (s.hammer_timer = nativeSceneValue(0));
            (s.hammer_timer_goal = nativeSceneValue(host.call(s, "scr_approach", s.hammer_timer_goal, 14, 3)));
            host.call(s, "snd_stop", "snd_smallswing");
            host.call(...rtl(() => s, () => "snd_play_pitch", () => "snd_smallswing", () => (1 + rt.random.random(0.3))));
            {
                const caller92 = s;
                for (const target92 of targets(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bounce_left")))) {
                    const other = caller92;
                    const s = target92;
                    {
                        bulletInit(s);
                        host.call(s, "scr_darksize");
                        (s.imageXscale += nativeSceneValue(0.5));
                        (s.imageYscale += nativeSceneValue(0.5));
                        (s.hspeed = nativeSceneValue((-15)));
                        (s.depth -= nativeSceneValue(1));
                        (s.active = nativeSceneValue(1));
                        (s.target = nativeSceneValue(3));
                        (s.damage = nativeSceneValue(1));
                        (s.grazed = nativeSceneValue(0));
                        (s.grazepoints = nativeSceneValue(2.5));
                    }
                }
            }
            v.new_x = 0;
            if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue(s.anchor_x)))) {
                (v.new_x = nativeSceneValue((30 + rt.random.irandom(30))));
            }
            else if (sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue(s.anchor_x)))) {
                (v.new_x = nativeSceneValue(((-30) - rt.random.irandom(30))));
            }
            else {
                (v.new_x = nativeSceneValue(rt.random.choose((-60), 60)));
            }
            v.ypos = clamp(...rtl(() => ((resolve(object("obj_heart")).y + 10) + rt.random.irandomRange((-20), 20)), () => (host.call(s, "scr_get_box", 1) + 10), () => (host.call(s, "scr_get_box", 3) - 20)));
            host.call(s, "scr_script_delayed", "scr_jump_arc", 4, s.id, s.x, s.y, (s.anchor_x + v.new_x), v.ypos, 40, 8);
            (s.sprite = nativeSceneValue("spr_gerson_hammer_throw"));
            (s.imageIndex = nativeSceneValue(0.1));
            if (sceneTruth(sceneEqual(s.hammer_timer_goal, 14))) {
                (s.hammer_counter++);
            }
            if (sceneTruth(sceneEqual(s.hammer_counter, 5))) {
                (s.hammer_counter = nativeSceneValue(0));
                (s.hammer_timer = nativeSceneValue((-8)));
                (s.hammer_phase = nativeSceneValue(1));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.hammer_phase, 1))) {
        (s.hammer_timer++);
        if (sceneTruth(sceneEqual(s.hammer_timer, 1))) {
            host.call(s, "snd_play_pitch", "snd_jump", 2);
            host.call(...rtl(() => s, () => "scr_jump_arc", () => s.id, () => s.x, () => s.y, () => s.anchor_x, () => s.anchor_y, () => (s.y - (([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!) + 60)), () => 32));
            (s.imageIndex = nativeSceneValue(0));
        }
        if (sceneTruth(sceneEqual(s.hammer_timer, 21))) {
            {
                const caller93 = s;
                for (const target93 of targets(object("obj_jump_arc"))) {
                    const other = caller93;
                    const s = target93;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (s.y -= nativeSceneValue(s.z));
            (s.z = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_boost");
            {
                const caller94 = s;
                for (const target94 of targets(host.call(s, "scr_custom_afterimage_ext", object("obj_oflash"), s.sprite, s.imageIndex, s.x, (s.y - s.z), s.imageXscale, s.imageYscale))) {
                    const other = caller94;
                    const s = target94;
                    {
                        (s.target = nativeSceneValue(resolve(other).id));
                        (s.imageIndex = nativeSceneValue(resolve(other).imageIndex));
                        (s.imageSpeed = nativeSceneValue(0));
                        (s.depth = nativeSceneValue((resolve(other).depth - 1)));
                    }
                }
            }
            (s.hammer_timer = nativeSceneValue(15));
            (s.hammer_phase = nativeSceneValue(2));
            (s.hammer_timer_goal = nativeSceneValue(25));
        }
    }
    if (sceneTruth(sceneEqual(s.hammer_phase, 2))) {
        (s.hammer_timer++);
        if (sceneTruth(sceneEqual(s.hammer_timer, s.hammer_timer_goal))) {
            v.xoff = clamp(...rtl(() => ((resolve(object("obj_heart")).x + 10) + rt.random.irandomRange((-15), 15)), () => (resolve(object("obj_growtangle")).x - 60), () => (resolve(object("obj_growtangle")).x + 60)));
            host.call(s, "snd_stop", "snd_smallswing");
            host.call(...rtl(() => s, () => "snd_play_pitch", () => "snd_smallswing", () => (1 + rt.random.random(0.3))));
            (s.sprite = nativeSceneValue("spr_gerson_hammer_throw"));
            (s.imageIndex = nativeSceneValue(0.1));
            {
                const caller95 = s;
                for (const target95 of targets(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bounce_down")))) {
                    const other = caller95;
                    const s = target95;
                    {
                        bulletInit(s);
                        host.call(s, "scr_darksize");
                        (s.imageXscale += nativeSceneValue(2));
                        (s.imageYscale += nativeSceneValue(2));
                        (s.direction = nativeSceneValue(pointDirection(s.x, s.y, resolve(object("obj_heart")).x, resolve(object("obj_heart")).y)));
                        (s.speed = nativeSceneValue(14));
                        (s.depth -= nativeSceneValue(1));
                        (s.active = nativeSceneValue(1));
                        (s.target = nativeSceneValue(3));
                        (s.damage = nativeSceneValue(1));
                        (s.grazed = nativeSceneValue(0));
                        (s.grazepoints = nativeSceneValue(2.5));
                        (s.destroyonhit = nativeSceneValue(false));
                    }
                }
            }
            (s.hammer_timer = nativeSceneValue(0));
        }
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue((403 - s.full_timer)), nativeSceneValue(8))) && sceneTruth(sceneEqual(s.ending_counter, 0))))) {
        (s.ending_counter = nativeSceneValue(1));
        (s.visible = nativeSceneValue(false));
        create(s.x, (s.y - 40), object("obj_gerson_teleport_generic"));
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue((403 - s.full_timer)), nativeSceneValue(4))) && sceneTruth(sceneEqual(s.ending_counter, 1))))) {
        (s.ending_counter = nativeSceneValue(2));
        {
            const caller96 = s;
            for (const target96 of targets(object("obj_gerson_teleport_generic"))) {
                const other = caller96;
                const s = target96;
                {
                    rt.destroy(s);
                }
            }
        }
        create((resolve(object("obj_hammer_of_justice_enemy")).x + 68), (resolve(object("obj_hammer_of_justice_enemy")).y + 36), object("obj_gerson_teleport_generic"));
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue((403 - s.full_timer)), nativeSceneValue(2))) && sceneTruth(sceneEqual(s.ending_counter, 2))))) {
        (s.ending_counter = nativeSceneValue(3));
        (g.turntimer = nativeSceneValue(1));
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        {
            const caller97 = s;
            for (const target97 of targets(object("obj_gerson_teleport_generic"))) {
                const other = caller97;
                const s = target97;
                {
                    rt.destroy(s);
                }
            }
        }
        {
            const caller98 = s;
            for (const target98 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller98;
                const s = target98;
                {
                    (s.visible = nativeSceneValue(true));
                }
            }
        }
        rt.destroy(s);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.sprite, "spr_gerson_hammer_throw")) && sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(0)))))) {
        (s.imageIndex = nativeSceneValue(host.call(s, "scr_approach", s.imageIndex, 3, 0.5)));
        if (sceneTruth(sceneEqual(s.imageIndex, 3))) {
            (s.imageIndex = nativeSceneValue(0));
        }
    }
    {
        const caller99 = s;
        for (const target99 of targets(object("obj_heart"))) {
            const other = caller99;
            const s = target99;
            {
                if (sceneTruth(host.call(s, "place_meeting", s.x, s.y, object("obj_battlesolid")))) {
                    (s.x += nativeSceneValue(lengthdirX(...rtl(() => 1, () => pointDirection((s.x + 10), (s.y + 10), resolve(object("obj_growtangle")).x, resolve(object("obj_growtangle")).y)))));
                    (s.y += nativeSceneValue(lengthdirY(...rtl(() => 1, () => pointDirection((s.x + 10), (s.y + 10), resolve(object("obj_growtangle")).x, resolve(object("obj_growtangle")).y)))));
                }
            }
        }
    }
}
export function Step1(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; return; }
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(30))) && sceneTruth(le(nativeSceneValue(s.timer), nativeSceneValue(42)))))) {
        {
            const caller100 = s;
            for (const target100 of targets(object("obj_growtangle"))) {
                const other = caller100;
                const s = target100;
                {
                    {
                        const caller101 = s;
                        for (const target101 of targets(object("obj_heart"))) {
                            const other = caller101;
                            const s = target101;
                            {
                                (s.x += nativeSceneValue((resolve(object("obj_growtangle")).x - resolve(object("obj_growtangle")).xprevious)));
                            }
                        }
                    }
                    {
                        const caller102 = s;
                        for (const target102 of targets(create(s.x, s.y, object("obj_marker")))) {
                            const other = caller102;
                            const s = target102;
                            {
                                (s.mask = nativeSceneValue("spr_battlebg_collision_checker"));
                                (s.imageAngle = nativeSceneValue(resolve(other).imageAngle));
                                (s.imageXscale = nativeSceneValue(resolve(other).imageXscale));
                                (s.imageYscale = nativeSceneValue(resolve(other).imageYscale));
                                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                                    v.pointdir = pointDirection((resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10), s.x, s.y);
                                    while (sceneTruth(!sceneTruth(host.call(s, "position_meeting", (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10), s.id)))) {
                                        {
                                            const caller103 = s;
                                            for (const target103 of targets(object("obj_heart"))) {
                                                const other = caller103;
                                                const s = target103;
                                                {
                                                    (s.x += nativeSceneValue(lengthdirX(1, v.pointdir)));
                                                    (s.y += nativeSceneValue(lengthdirY(1, v.pointdir)));
                                                }
                                            }
                                        }
                                    }
                                }
                                rt.destroy(s);
                            }
                        }
                    }
                }
            }
        }
    }
    {
        const caller104 = s;
        for (const target104 of targets(object("obj_oflash"))) {
            const other = caller104;
            const s = target104;
            {
                if (sceneTruth(sceneEqual(s.target, resolve(other).id))) {
                    (s.x = nativeSceneValue(resolve(other).x));
                    (s.y = nativeSceneValue((resolve(other).y - resolve(other).z)));
                }
            }
        }
    }
}
