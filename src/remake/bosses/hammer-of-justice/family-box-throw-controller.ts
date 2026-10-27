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
    (s.full_timer = nativeSceneValue(0));
    (s.hammer_timer = nativeSceneValue(0));
    (s.hammer_timer_goal = nativeSceneValue(10));
    (s.hammer_counter = nativeSceneValue(0));
    (s.hammer_phase = nativeSceneValue(0));
    (s.ending_counter = nativeSceneValue(0));
    (s.z = nativeSceneValue(0));
    (s.my_flash = nativeSceneValue((-1)));
    (s.anchor_x = nativeSceneValue(s.x));
    (s.anchor_y = nativeSceneValue(s.y));
    host.call(s, "scr_darksize");
    (s.imageSpeed = nativeSceneValue(0.5));
    host.call(s, "snd_play", "snd_gerlaugh_clear", 1, 1.1);
    {
        const caller58 = s;
        for (const target58 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller58;
            const s = target58;
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
                const caller59 = s;
                for (const target59 of targets(object("obj_gerson_teleport_generic"))) {
                    const other = caller59;
                    const s = target59;
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
                const caller60 = s;
                for (const target60 of targets(object("obj_gerson_teleport_generic"))) {
                    const other = caller60;
                    const s = target60;
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
                const caller61 = s;
                for (const target61 of targets(object("obj_growtangle"))) {
                    const other = caller61;
                    const s = target61;
                    {
                        host.call(s, "scr_lerpvar", "x", s.x, (s.x - 80), 10, 2, "out");
                        host.call(s, "scr_lerpvar", "image_angle", s.imageAngle, (s.imageAngle + 135), 12, 2, "out");
                    }
                }
            }
            break;
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(30))) && sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(41)))))) {
        {
            const caller62 = s;
            for (const target62 of targets(object("obj_growtangle"))) {
                const other = caller62;
                const s = target62;
                {
                    {
                        const caller63 = s;
                        for (const target63 of targets(host.call(s, "scr_afterimagefast"))) {
                            const other = caller63;
                            const s = target63;
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
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(84)))) {
            (s.timer -= nativeSceneValue((30 + rt.random.irandom(12))));
            host.call(s, "snd_play_pitch", "snd_jump", 2);
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
            host.call(...rtl(() => s, () => "scr_jump_arc", () => s.id, () => s.x, () => s.y, () => (s.anchor_x + v.new_x), () => (s.anchor_y + rt.random.irandomRange((-20), 20)), () => (70 + rt.random.irandom(30)), () => 24));
        }
    }
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(36)))) {
        (s.hammer_timer++);
    }
    if (sceneTruth(sceneEqual(s.hammer_phase, 0))) {
        if (sceneTruth(sceneEqual(s.hammer_timer, s.hammer_timer_goal))) {
            host.call(s, "snd_stop", "snd_smallswing");
            host.call(...rtl(() => s, () => "snd_play_pitch", () => "snd_smallswing", () => (1 + rt.random.random(0.3))));
            v.hammer_amount = (3 + rt.random.irandom(1));
            if (sceneTruth(!sceneTruth(rt.random.irandom(3)))) {
                (s.hammer_cmount = nativeSceneValue(2));
            }
            v.hammer_type = 1;
            v.small_offset = rt.random.irandomRange((-30), 30);
            for (v.a = 0; lt(nativeSceneValue(v.a), nativeSceneValue(v.hammer_amount)); (v.a++)) {
                {
                    const caller64 = s;
                    for (const target64 of targets(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bro_hammer")))) {
                        const other = caller64;
                        const s = target64;
                        {
                            bulletInit(s);
                            (s.active = nativeSceneValue(1));
                            host.call(s, "scr_darksize");
                            if (sceneTruth(v.hammer_type)) {
                                (s.fakehspeed = nativeSceneValue(((((-Math.abs((s.x - (resolve(object("obj_growtangle")).x + v.small_offset)))) / 45) + ((-2) + ((4 / (v.hammer_amount - 1)) * v.a))) + rt.random.randomRange((-0.5), 0.5))));
                            }
                            else {
                                (s.fakehspeed = nativeSceneValue(((-Math.abs((s.x - (resolve(object("obj_growtangle")).x + v.small_offset)))) / 45)));
                            }
                            if (sceneTruth(v.hammer_type)) {
                                (s.fakevspeed = nativeSceneValue((((-14) + ((-1) + ((2 / (v.hammer_amount - 1)) * v.a))) + rt.random.randomRange((-1), 1))));
                            }
                            else {
                                (s.fakevspeed = nativeSceneValue((-14)));
                            }
                            (s.gravityDirection = nativeSceneValue(270));
                            (s.fakegravity = nativeSceneValue(0.6));
                            (s.depth -= nativeSceneValue(1));
                            (s.target = nativeSceneValue(3));
                            (s.damage = nativeSceneValue(1));
                            (s.grazed = nativeSceneValue(0));
                            (s.grazepoints = nativeSceneValue(2.5));
                        }
                    }
                }
            }
            (s.sprite = nativeSceneValue("spr_gerson_hammer_throw"));
            (s.imageIndex = nativeSceneValue(0.1));
            (s.hammer_timer = nativeSceneValue(0));
            (s.hammer_counter++);
            if (sceneTruth(sceneEqual(s.hammer_counter, 16))) {
                (s.hammer_counter = nativeSceneValue(0));
                (s.hammer_phase = nativeSceneValue(1));
                (s.hammer_timer = nativeSceneValue((-12)));
                (s.hammer_timer_goal = nativeSceneValue(3));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.hammer_phase, 1))) {
        if (sceneTruth(sceneEqual(s.hammer_timer, s.hammer_timer_goal))) {
            host.call(s, "snd_stop", "snd_smallswing");
            host.call(...rtl(() => s, () => "snd_play_pitch", () => "snd_smallswing", () => (0.75 + rt.random.random(0.3))));
            v.hammer_amount = 1;
            for (v.a = 0; lt(nativeSceneValue(v.a), nativeSceneValue(v.hammer_amount)); (v.a++)) {
                {
                    const caller65 = s;
                    for (const target65 of targets(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bro_hammer")))) {
                        const other = caller65;
                        const s = target65;
                        {
                            bulletInit(s);
                            (s.active = nativeSceneValue(1));
                            host.call(s, "scr_darksize");
                            (s.imageXscale++);
                            (s.imageYscale++);
                            if (sceneTruth(sceneEqual(v.hammer_amount, 1))) {
                                (s.fakehspeed = nativeSceneValue(((-Math.abs(((s.x - (resolve(object("obj_growtangle")).x + (Math.sin((resolve(other).full_timer * 0.325)) * 80))) / 45))) + rt.random.randomRange((-0.25), 0.25))));
                                (s.fakevspeed = nativeSceneValue(((-14) + rt.random.randomRange((-0.5), 0.5))));
                            }
                            else {
                                (s.fakehspeed = nativeSceneValue(((((-Math.abs((s.x - (resolve(object("obj_growtangle")).x + (Math.sin((resolve(other).full_timer * 0.325)) * 80))))) / 45) + (((-v.hammer_amount) * 0.75) + ((((v.hammer_amount * 2) * 0.75) / (v.hammer_amount - 1)) * v.a))) + rt.random.randomRange((-0.25), 0.25))));
                                (s.fakevspeed = nativeSceneValue((((-14) + ((-1) + ((2 / (v.hammer_amount - 1)) * v.a))) + rt.random.randomRange((-0.5), 0.5))));
                            }
                            (s.gravityDirection = nativeSceneValue(270));
                            (s.fakegravity = nativeSceneValue(0.6));
                            (s.depth -= nativeSceneValue(1));
                            (s.target = nativeSceneValue(3));
                            (s.damage = nativeSceneValue(1));
                            (s.grazed = nativeSceneValue(0));
                            (s.grazepoints = nativeSceneValue(2.5));
                        }
                    }
                }
            }
            (s.sprite = nativeSceneValue("spr_gerson_hammer_throw"));
            (s.imageIndex = nativeSceneValue(0.1));
            (s.hammer_timer = nativeSceneValue(0));
            (s.hammer_counter++);
            if (sceneTruth(sceneEqual((s.hammer_counter % 5), 0))) {
                (s.hammer_timer = nativeSceneValue((-4)));
            }
            if (sceneTruth(sceneEqual(s.hammer_counter, 25))) {
                (s.hammer_counter = nativeSceneValue(0));
                (s.hammer_phase = nativeSceneValue(2));
                (s.hammer_timer = nativeSceneValue(0));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.hammer_phase, 2))) {
        if (sceneTruth(sceneEqual(s.hammer_timer, 1))) {
            host.call(s, "snd_play_pitch", "snd_jump", 2);
            host.call(s, "scr_jump_arc", s.id, s.x, s.y, (s.xstart - 30), s.ystart, 80, 32);
            (s.imageIndex = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_boost");
            (s.my_flash = nativeSceneValue(host.call(s, "scr_custom_afterimage_ext", object("obj_oflash"), s.sprite, s.imageIndex, s.x, (s.y - s.z), s.imageXscale, s.imageYscale)));
            {
                const caller66 = s;
                for (const target66 of targets(s.my_flash)) {
                    const other = caller66;
                    const s = target66;
                    {
                        (s.target = nativeSceneValue(resolve(other).id));
                        (s.imageIndex = nativeSceneValue(resolve(other).imageIndex));
                        (s.imageSpeed = nativeSceneValue(0));
                        (s.depth = nativeSceneValue((resolve(other).depth - 1)));
                    }
                }
            }
        }
        if (sceneTruth((sceneTruth((sceneTruth(ge(nativeSceneValue(s.hammer_timer), nativeSceneValue(2))) && sceneTruth(lt(nativeSceneValue(s.hammer_timer), nativeSceneValue(24))))) && sceneTruth(sceneEqual((s.hammer_timer % 3), 0))))) {
            {
                const caller67 = s;
                for (const target67 of targets(host.call(s, "scr_oflash"))) {
                    const other = caller67;
                    const s = target67;
                    {
                        (s.depth += nativeSceneValue(1));
                        (s.y -= nativeSceneValue(resolve(other).z));
                        (s.flashcolor = nativeSceneValue(65280));
                    }
                }
            }
        }
        if (sceneTruth(sceneEqual(s.hammer_timer, 9))) {
            host.call(s, "snd_stop", "snd_smallswing");
            host.call(s, "snd_play_pitch", "snd_smallswing", 0.5);
            {
                const caller68 = s;
                for (const target68 of targets(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bro_hammer")))) {
                    const other = caller68;
                    const s = target68;
                    {
                        bulletInit(s);
                        host.call(s, "scr_darksize");
                        (s.imageXscale += nativeSceneValue(6));
                        (s.imageYscale += nativeSceneValue(6));
                        (s.mask = nativeSceneValue("spr_gerson_gigahammer_mask"));
                        (s.fakehspeed = nativeSceneValue((-Math.abs(((s.x - resolve(object("obj_growtangle")).x) / 25.5)))));
                        (s.fakevspeed = nativeSceneValue((-16)));
                        (s.destroyonhit = nativeSceneValue(false));
                        (s.gigahammer = nativeSceneValue(true));
                        (s.gravityDirection = nativeSceneValue(270));
                        (s.fakegravity = nativeSceneValue(0.6));
                        (s.depth = nativeSceneValue((resolve(other).depth + 1)));
                        (s.target = nativeSceneValue(3));
                        (s.damage = nativeSceneValue(1));
                        (s.grazed = nativeSceneValue(0));
                        (s.grazepoints = nativeSceneValue(2.5));
                    }
                }
            }
            (s.sprite = nativeSceneValue("spr_gerson_hammer_throw"));
            (s.imageIndex = nativeSceneValue(0.1));
        }
        if (sceneTruth(sceneEqual(s.hammer_timer, 36))) {
            (s.sprite = nativeSceneValue("spr_gerson_spin"));
            (s.imageSpeed = nativeSceneValue(0.125));
            (s.x += nativeSceneValue(60));
            (s.y += nativeSceneValue(60));
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
            const caller69 = s;
            for (const target69 of targets(object("obj_gerson_teleport_generic"))) {
                const other = caller69;
                const s = target69;
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
            const caller70 = s;
            for (const target70 of targets(object("obj_gerson_teleport_generic"))) {
                const other = caller70;
                const s = target70;
                {
                    rt.destroy(s);
                }
            }
        }
        {
            const caller71 = s;
            for (const target71 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller71;
                const s = target71;
                {
                    (s.visible = nativeSceneValue(true));
                }
            }
        }
        rt.destroy(s);
    }
    if (sceneTruth(sceneEqual(s.sprite, "spr_gerson_spin"))) {
        (s.imageIndex %= nativeSceneValue(4));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.sprite, "spr_gerson_hammer_throw")) && sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(0)))))) {
        (s.imageIndex = nativeSceneValue(host.call(s, "scr_approach", s.imageIndex, 3, 0.5)));
        if (sceneTruth(sceneEqual(s.imageIndex, 3))) {
            if (sceneTruth(sceneEqual(s.hammer_phase, 2))) {
                (s.imageIndex = nativeSceneValue(2));
            }
            else {
                (s.imageIndex = nativeSceneValue(0));
            }
        }
    }
    {
        const caller72 = s;
        for (const target72 of targets(object("obj_heart"))) {
            const other = caller72;
            const s = target72;
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
            const caller73 = s;
            for (const target73 of targets(object("obj_growtangle"))) {
                const other = caller73;
                const s = target73;
                {
                    {
                        const caller74 = s;
                        for (const target74 of targets(object("obj_heart"))) {
                            const other = caller74;
                            const s = target74;
                            {
                                (s.x += nativeSceneValue((resolve(object("obj_growtangle")).x - resolve(object("obj_growtangle")).xprevious)));
                            }
                        }
                    }
                    {
                        const caller75 = s;
                        for (const target75 of targets(create(s.x, s.y, object("obj_marker")))) {
                            const other = caller75;
                            const s = target75;
                            {
                                (s.mask = nativeSceneValue("spr_battlebg_collision_checker"));
                                (s.imageAngle = nativeSceneValue(resolve(other).imageAngle));
                                (s.imageXscale = nativeSceneValue(resolve(other).imageXscale));
                                (s.imageYscale = nativeSceneValue(resolve(other).imageYscale));
                                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                                    v.pointdir = pointDirection((resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10), s.x, s.y);
                                    while (sceneTruth(!sceneTruth(host.call(s, "position_meeting", (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10), s.id)))) {
                                        {
                                            const caller76 = s;
                                            for (const target76 of targets(object("obj_heart"))) {
                                                const other = caller76;
                                                const s = target76;
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
    if (sceneTruth((targets(s.my_flash).length > 0))) {
        {
            const caller77 = s;
            for (const target77 of targets(s.my_flash)) {
                const other = caller77;
                const s = target77;
                {
                    (s.target = nativeSceneValue(resolve(other).id));
                    (s.x = nativeSceneValue(resolve(other).x));
                    (s.y = nativeSceneValue((resolve(other).y - resolve(other).z)));
                }
            }
        }
    }
}
