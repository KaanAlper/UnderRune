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
    (s.inst = nativeSceneValue(create(s.x, s.y, object("obj_gerson_slowdown"))));
    if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcountmax, 1))) {
        if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).susiehitbyrudebustercount, 0))) {
            (resolve(s.inst).type = nativeSceneValue(0));
        }
        if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).susiehitbyrudebustercount, 1))) {
            (resolve(s.inst).type = nativeSceneValue(1));
        }
        if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).susiehitbyrudebustercount, 2))) {
            (resolve(s.inst).type = nativeSceneValue(2));
        }
    }
    (s.target = nativeSceneValue(43843743));
    (s.damage = nativeSceneValue(1));
    (s.star = nativeSceneValue(0));
    (s.caster = nativeSceneValue(0));
    (s.imageAlpha = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageSpeed = nativeSceneValue(1));
    (s.imageAngle = nativeSceneValue(180));
    for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(10)); (s.i += nativeSceneValue(1))) {
        (sourceArray(s, "prevx")[s.i] = nativeSceneValue(s.x));
        (sourceArray(s, "prevy")[s.i] = nativeSceneValue(s.y));
    }
    (s.a = nativeSceneValue(0));
    (s.targetx = nativeSceneValue(0));
    (s.targety = nativeSceneValue(0));
    (s.t = nativeSceneValue(0));
    (s.tmax = nativeSceneValue(4));
    (s.siner = nativeSceneValue(0));
    (s.explode = nativeSceneValue(0));
    (s.maxaft = nativeSceneValue(0));
    (s.bolt_timer = nativeSceneValue(0));
    (s.chosen_bolt = nativeSceneValue(0));
    (s.final_bolt = nativeSceneValue(0));
    (s.red = nativeSceneValue(0));
    (s.battlemode = nativeSceneValue(0));
    (s.textcolortimer = nativeSceneValue(0));
    (s.textcolor = nativeSceneValue(mergeColor(0xffffff, 255, s.textcolortimer)));
    (s.susieattackcon = nativeSceneValue(0));
    (s.susieattacktimer = nativeSceneValue(0));
    (s.buffer_z = nativeSceneValue(0));
    (s.hurtflashalpha = nativeSceneValue(0));
    bulletInit(s);
    (s.target = nativeSceneValue(3));
    (s.damage = nativeSceneValue(60));
    (s.hitsusietimer = nativeSceneValue(0));
    (s.hitback = nativeSceneValue(false));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.susieattackcon, 2))) {
        v.scale = 1;
        if (sceneTruth(sceneEqual(s.susieattacktimer, 7))) {
            (v.scale = nativeSceneValue(1.2));
        }
        if (sceneTruth(sceneEqual(s.susieattacktimer, 8))) {
            (v.scale = nativeSceneValue(0.8));
        }
        if (sceneTruth(sceneEqual(s.susieattacktimer, 9))) {
            (v.scale = nativeSceneValue(0.6));
        }
        if (sceneTruth(sceneEqual(s.susieattacktimer, 10))) {
            (v.scale = nativeSceneValue(0.5));
        }
        if (sceneTruth(gt(nativeSceneValue(s.susieattacktimer), nativeSceneValue(3)))) {
            drawSprite("spr_gerson_rude_orb2", 0, ((resolve(object("obj_heroparent")).x + 200) - 38), ((resolve(object("obj_heroparent")).y + 37) - 10), (0.6 * v.scale), (0.9 * v.scale), (s.imageAngle - (s.susieattacktimer * 80)), s.imageBlend, s.imageAlpha);
        }
        if (sceneTruth(lt(nativeSceneValue(s.susieattacktimer), nativeSceneValue(7)))) {
            v.px = ((resolve(object("obj_heroparent")).x + 200) - 36);
            v.py = ((resolve(object("obj_heroparent")).y + 37) - 10);
            {
                const count4 = round(4);
                for (let repeat4 = 0; repeat4 < count4; repeat4++) {
                    v.randdir = rt.random.irandom(360);
                    v.dist = (40 + rt.random.irandom(180));
                    v.randsizex = (0.35 + rt.random.random(0.85));
                    v.randsizey = (0.45 + rt.random.random(0.55));
                    {
                        const caller220 = s;
                        for (const target220 of targets(create(...rtl(() => (v.px + lengthdirX(v.dist, v.randdir)), () => (v.py + lengthdirY(v.dist, v.randdir)), () => object("obj_particle_generic"))))) {
                            const other = caller220;
                            const s = target220;
                            {
                                (s.imageXscale = nativeSceneValue(v.randsizex));
                                (s.imageYscale = nativeSceneValue(v.randsizey));
                                (s.direction = nativeSceneValue(pointDirection(s.x, s.y, v.px, v.py)));
                                (s.imageAngle = nativeSceneValue(s.direction));
                                host.call(...rtl(() => s, () => "scr_lerpvar", () => "speed", () => 30, () => (60 + rt.random.irandom(8)), () => 6, () => 1, () => "in"));
                                host.call(s, "scr_lerpvar", "image_xscale", (s.imageXscale * 16), 0, 6, 1, "in");
                                host.call(s, "scr_lerpvar", "image_yscale", s.imageYscale, (s.imageXscale * 0.5), 6, 1, "in");
                            }
                        }
                    }
                }
            }
            {
                const caller221 = s;
                for (const target221 of targets(object("obj_particle_generic"))) {
                    const other = caller221;
                    const s = target221;
                    {
                        if (sceneTruth(le(nativeSceneValue(pointDistance(s.x, s.y, v.px, v.py)), nativeSceneValue(60)))) {
                            rt.destroy(s);
                        }
                    }
                }
            }
        }
        return;
    }
    rt.drawSelf(s);
    if (sceneTruth((sceneTruth(sceneEqual(s.susieattackcon, 0)) && sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((rt.view.x + 330))))))) {
        (s.textcolortimer += nativeSceneValue(0.1));
        (s.textcolor = nativeSceneValue(mergeColor(...rtl(() => 0xffffff, () => 255, () => (0.5 + (Math.sin(s.textcolortimer) / 2))))));
        host.call(s, "draw_set_alpha", 0.5);
        if (sceneTruth((sceneTruth(g.is_console) || sceneTruth(resolve(object("obj_gamecontroller")).gamepad_active)))) {
            host.call(s, "ossafe_fill_rectangle", (resolve(object("obj_herosusie")).x + 86), (resolve(object("obj_herosusie")).y + 33), ((resolve(object("obj_herosusie")).x + 90) + 70), ((resolve(object("obj_herosusie")).y + 30) + 30), false);
        }
        else if (sceneTruth(!sceneEqual(g.lang, "ja"))) {
            host.call(s, "ossafe_fill_rectangle", (resolve(object("obj_herosusie")).x + 86), (resolve(object("obj_herosusie")).y + 33), (((resolve(object("obj_herosusie")).x + 90) + 70) + 36), ((resolve(object("obj_herosusie")).y + 30) + 30), false);
        }
        else {
            host.call(s, "ossafe_fill_rectangle", (resolve(object("obj_herosusie")).x + 86), (resolve(object("obj_herosusie")).y + 33), (((resolve(object("obj_herosusie")).x + 90) + 70) + 41), ((resolve(object("obj_herosusie")).y + 30) + 30), false);
        }
        host.call(s, "draw_set_alpha", 1);
        host.call(...rtl(() => s, () => "draw_text_color", () => (resolve(object("obj_herosusie")).x + 90), () => (resolve(object("obj_herosusie")).y + 30), () => text("obj_gerson_rudebuster_slash_Draw_0_gml_57_0"), () => s.textcolor, () => s.textcolor, () => s.textcolor, () => s.textcolor, () => 1));
        if (sceneTruth((sceneTruth(g.is_console) || sceneTruth(resolve(object("obj_gamecontroller")).gamepad_active)))) {
            drawSprite(...rtl(() => host.call(s, "scr_getbuttonsprite", g.input_g[4], false), () => 0, () => (resolve(object("obj_herosusie")).x + 168), () => (resolve(object("obj_herosusie")).y + 33), () => 2, () => 2, () => 0, () => 0xffffff, () => 1));
        }
        else {
            host.call(...rtl(() => s, () => "draw_text_color", () => (resolve(object("obj_herosusie")).x + 160), () => (resolve(object("obj_herosusie")).y + 30), () => host.call(...rtl(() => s, () => "stringsetsub", () => "~1", () => host.call(s, "scr_get_input_name", 4))), () => s.textcolor, () => s.textcolor, () => s.textcolor, () => s.textcolor, () => 1));
        }
    }
    if (sceneTruth(gt(nativeSceneValue(s.hurtflashalpha), nativeSceneValue(0)))) {
        fog(true, 0xffffff, 0, 1);
        drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, 0xffffff, s.hurtflashalpha);
        fog(false, 0, 0, 0);
        (s.hurtflashalpha -= nativeSceneValue(0.1));
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(1)))) {
        (s.imageAlpha += nativeSceneValue(0.25));
    }
    else {
        (s.imageAlpha = nativeSceneValue(1));
    }
    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth(host.call(s, "button1_p")) || sceneTruth(host.call(s, "button2_p")))) || sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))))) && sceneTruth(sceneEqual(s.hurtflashalpha, 0)))) && sceneTruth(sceneEqual(s.explode, 0)))) && sceneTruth(sceneEqual(resolve(object("obj_herosusie")).hurt, 0))))) {
        (s.buffer_z = nativeSceneValue(2));
    }
    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.buffer_z), nativeSceneValue(0))) && sceneTruth(sceneEqual(s.hurtflashalpha, 0)))) && sceneTruth(sceneEqual(s.explode, 0)))) && sceneTruth(sceneEqual(resolve(object("obj_herosusie")).hurt, 0))))) {
        if (sceneTruth(sceneEqual(s.susieattackcon, 0))) {
            host.call(s, "snd_play", "snd_ultraswing");
            host.call(s, "snd_play", "snd_ultraswing");
            (s.susieattackcon = nativeSceneValue(1));
            {
                const caller222 = s;
                for (const target222 of targets(object("obj_herosusie"))) {
                    const other = caller222;
                    const s = target222;
                    {
                        (s.x = nativeSceneValue(s.xstart));
                        rt.setSpriteOffset("spr_susie_hitback_miss", 18, 9);
                        host.call(s, "scr_battle_sprite_set", "susie", "spr_susie_hitback_miss", 0.5, 0);
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.susieattackcon, 1))) {
        (s.susieattacktimer++);
        if (sceneTruth(sceneEqual(s.susieattacktimer, 4))) {
            {
                const caller223 = s;
                for (const target223 of targets(object("obj_gerson_slowdown"))) {
                    const other = caller223;
                    const s = target223;
                    {
                        (s.con = nativeSceneValue(1));
                        (s.timer = nativeSceneValue(0));
                    }
                }
            }
            if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((rt.view.x + 330))))) {
                (s.hitback = nativeSceneValue(true));
                host.call(s, "scr_battle_sprite_set", "susie", "spr_susie_hitback", 0.5, 0);
                {
                    const caller224 = s;
                    for (const target224 of targets(object("obj_herosusie"))) {
                        const other = caller224;
                        const s = target224;
                        {
                            (s.imageIndex = nativeSceneValue(2));
                        }
                    }
                }
                host.call(s, "scr_shakeobj");
                create(s.x, s.y, object("obj_shake"));
                host.call(s, "snd_play", "snd_criticalswing");
                {
                    const caller225 = s;
                    for (const target225 of targets(object("obj_afterimage"))) {
                        const other = caller225;
                        const s = target225;
                        {
                            rt.destroy(s);
                        }
                    }
                }
                (s.susieattackcon = nativeSceneValue(2));
                (s.susieattacktimer = nativeSceneValue(0));
                (s.hurtflashalpha = nativeSceneValue(1));
                (s.direction = nativeSceneValue(0));
                (s.x += nativeSceneValue(10));
                (s.inst = nativeSceneValue(createDepth((((resolve(object("obj_heroparent")).x + 54) + 20) - 36), ((resolve(object("obj_heroparent")).y - 64) - 18), (resolve(object("obj_herosusie")).depth - 9), object("obj_animation"))));
                (resolve(s.inst).sprite = nativeSceneValue("spr_gerson_hit_fx4"));
                (resolve(s.inst).imageSpeed = nativeSceneValue(0.5));
                (resolve(s.inst).imageAngle = nativeSceneValue(0));
                (resolve(s.inst).imageXscale = nativeSceneValue(2));
                (resolve(s.inst).imageYscale = nativeSceneValue(2));
                {
                    const caller226 = s;
                    for (const target226 of targets(create(...rtl(() => rt.view.x, () => rt.view.y, () => object("obj_afterimage_screen"))))) {
                        const other = caller226;
                        const s = target226;
                        {
                            (s.faderate = nativeSceneValue(0.05));
                        }
                    }
                }
            }
        }
        if (sceneTruth(sceneEqual(s.susieattacktimer, 9))) {
            (s.susieattackcon = nativeSceneValue(0));
            (s.susieattacktimer = nativeSceneValue(0));
        }
    }
    if (sceneTruth(sceneEqual(s.susieattackcon, 2))) {
        (s.susieattacktimer++);
        (resolve(object("obj_heroparent")).x += nativeSceneValue(1));
        if (sceneTruth(sceneEqual(s.susieattacktimer, 2))) {
            (s.inst = nativeSceneValue(createDepth(((resolve(object("obj_heroparent")).x + 190) - 36), ((resolve(object("obj_heroparent")).y + 40) - 10), (resolve(object("obj_herosusie")).depth - 10), object("obj_animation"))));
            (resolve(s.inst).sprite = nativeSceneValue("spr_susie_gerson_hitbback_fx_1"));
            (resolve(s.inst).imageSpeed = nativeSceneValue(1));
            (resolve(s.inst).imageAngle = nativeSceneValue(0));
            (resolve(s.inst).imageXscale = nativeSceneValue(3));
            (resolve(s.inst).imageYscale = nativeSceneValue(3));
        }
        if (sceneTruth(sceneEqual(s.susieattacktimer, 10))) {
            (s.susieattackcon = nativeSceneValue(0));
            (s.susieattacktimer = nativeSceneValue(0));
            {
                const caller227 = s;
                for (const target227 of targets(object("obj_herosusie"))) {
                    const other = caller227;
                    const s = target227;
                    {
                        (s.imageIndex = nativeSceneValue(12));
                    }
                }
            }
            (s.inst = nativeSceneValue(createDepth(((resolve(object("obj_heroparent")).x + 200) - 36), ((resolve(object("obj_heroparent")).y + 40) - 10), (resolve(object("obj_herosusie")).depth - 10), object("obj_animation"))));
            (resolve(s.inst).sprite = nativeSceneValue("spr_susie_gerson_hitbback_fx_2"));
            (resolve(s.inst).imageSpeed = nativeSceneValue(1));
            (resolve(s.inst).imageAngle = nativeSceneValue(0));
            (resolve(s.inst).imageXscale = nativeSceneValue(3));
            (resolve(s.inst).imageYscale = nativeSceneValue(3));
            host.call(s, "scr_shakeobj");
            create(s.x, s.y, object("obj_shake"));
            host.call(s, "snd_play", "snd_rudebuster_hit");
            host.call(s, "snd_play", "snd_rudebuster_swing");
            (s.blast = nativeSceneValue(create(((resolve(object("obj_heroparent")).x + 180) - 36), ((resolve(object("obj_heroparent")).y + 60) - 18), object("obj_rudebuster_bolt"))));
            (resolve(s.blast).caster = nativeSceneValue(0));
            (resolve(s.blast).target = nativeSceneValue(1436));
            (resolve(s.blast).damage = nativeSceneValue(Math.ceil((((g.battlemag[1] * 5) + (g.battleat[1] * 11)) - (g.monsterdf[0] * 3)))));
            (resolve(s.blast).star = nativeSceneValue(0));
            (resolve(s.blast).speedmax = nativeSceneValue(10));
            (resolve(s.blast).imageAlpha = nativeSceneValue(1));
            (resolve(s.blast).direction = nativeSceneValue(0));
            (resolve(s.blast).gersonswingtimer = nativeSceneValue(4));
            (resolve(s.blast).gersonoffset = nativeSceneValue((-20)));
            {
                const caller228 = s;
                for (const target228 of targets(object("obj_particle_generic"))) {
                    const other = caller228;
                    const s = target228;
                    {
                        rt.destroy(s);
                    }
                }
            }
            rt.destroy(s);
        }
        return;
    }
    (s.buffer_z--);
    if (sceneTruth(sceneEqual(s.t, 0))) {
        if (sceneTruth((targets(s.target).length > 0))) {
            (s.targetx = nativeSceneValue((resolve(s.target).x + (rt.spriteWidth(resolve(s.target)) / 2))));
            (s.targety = nativeSceneValue((resolve(s.target).y + (rt.spriteHeight(resolve(s.target)) / 2))));
        }
        (s.cx = nativeSceneValue(s.targetx));
        (s.cy = nativeSceneValue(s.targety));
        (s.direction = nativeSceneValue((pointDirection(s.x, s.y, s.cx, s.cy) - 20)));
        (s.speed = nativeSceneValue(9));
        (s.friction = nativeSceneValue((-1.5)));
        (s.imageAngle = nativeSceneValue(s.direction));
    }
    if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.t), nativeSceneValue(1))) && sceneTruth(sceneEqual(s.explode, 0))))) {
        (s.dir = nativeSceneValue(pointDirection(s.x, s.y, s.cx, s.cy)));
        (s.direction += nativeSceneValue(((((((s.dir) - (s.direction)) % 360 + 540) % 360) - 180) / 4)));
        (s.imageAngle = nativeSceneValue(s.direction));
        if (sceneTruth(le(nativeSceneValue(pointDistance(s.x, s.y, s.cx, s.cy)), nativeSceneValue(40)))) {
            (s.speed = nativeSceneValue(sceneEqual(s.speed, 0.96)));
            (s.hitsusietimer++);
            if (sceneTruth((sceneTruth(sceneEqual(s.hitsusietimer, 2)) && sceneTruth(sceneEqual(s.hitback, false))))) {
                (s.visible = nativeSceneValue(0));
                (s.explode = nativeSceneValue(1));
                (s.t = nativeSceneValue(1));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.explode, 1))) {
        {
            const caller229 = s;
            for (const target229 of targets(object("obj_herosusie"))) {
                const other = caller229;
                const s = target229;
                {
                    host.call(s, "scr_battle_sprite_reset", "susie");
                    (s.hurt = nativeSceneValue(1));
                    (s.hurttimer = nativeSceneValue(0));
                }
            }
        }
        {
            const caller230 = s;
            for (const target230 of targets(object("obj_gerson_slowdown"))) {
                const other = caller230;
                const s = target230;
                {
                    (s.con = nativeSceneValue(1));
                    (s.timer = nativeSceneValue(0));
                }
            }
        }
        (s.susieattackcon = nativeSceneValue(0));
        (s.susieattacktimer = nativeSceneValue(0));
        (s.buffer_z = nativeSceneValue(0));
        if (sceneTruth(sceneEqual(s.t, 1))) {
            v.b = ((g.hp[2] - 30) / 250);
            if (sceneTruth(lt(nativeSceneValue(v.b), nativeSceneValue(0)))) {
                (v.b = nativeSceneValue(0));
            }
            (s.damage = nativeSceneValue(lerp(12, 90, v.b)));
            (g.inv = nativeSceneValue((-1)));
            (resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount = nativeSceneValue(0));
            (resolve(object("obj_hammer_of_justice_enemy")).progress += nativeSceneValue(6));
            (resolve(object("obj_hammer_of_justice_enemy")).mercylaughcon = nativeSceneValue(1));
            (resolve(object("obj_hammer_of_justice_enemy")).mercylaughcount = nativeSceneValue(6));
            host.call(s, "scr_damage_all");
            (s.bonus_anim = nativeSceneValue(0));
            {
                const caller231 = s;
                for (const target231 of targets(object("obj_hammer_of_justice_enemy"))) {
                    const other = caller231;
                    const s = target231;
                    {
                        if (sceneTruth((sceneTruth(sceneEqual(s.susiehitbyrudebustercount, 0)) && sceneTruth(sceneEqual(s.rudebusterhitcountmax, 1))))) {
                            (s.susiehitbyrudebustercon = nativeSceneValue(1));
                        }
                        (s.susiehitbyrudebustercount++);
                        (s.rudebusterdelay = nativeSceneValue(20));
                    }
                }
            }
            {
                const caller232 = s;
                for (const target232 of targets(s.target)) {
                    const other = caller232;
                    const s = target232;
                    {
                        (s._oflash = nativeSceneValue(create(s.x, s.y, object("obj_oflash_gerson_buster"))));
                        (resolve(s._oflash).imageXscale = nativeSceneValue(s.imageXscale));
                        (resolve(s._oflash).imageSpeed = nativeSceneValue(0));
                        (resolve(s._oflash).imageIndex = nativeSceneValue(s.imageIndex));
                        (resolve(s._oflash).imageYscale = nativeSceneValue(s.imageYscale));
                        (resolve(s._oflash).sprite = nativeSceneValue("spr_susieb_hurt"));
                        (resolve(s._oflash).depth = nativeSceneValue((s.depth - 1)));
                        (resolve(s._oflash).target = nativeSceneValue(s.id));
                    }
                }
            }
            host.call(s, "snd_play", "snd_rudebuster_hit");
            for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(4)); (s.i += nativeSceneValue(1))) {
                (sourceArray(s, "burst")[s.i] = nativeSceneValue(host.call(s, "scr_afterimage")));
                (resolve(s.burst[s.i]).imageSpeed = nativeSceneValue(0.5));
                (resolve(s.burst[s.i]).x = nativeSceneValue(s.cx));
                (resolve(s.burst[s.i]).y = nativeSceneValue(s.cy));
                (resolve(s.burst[s.i]).imageAngle = nativeSceneValue((45 + (s.i * 90))));
                (resolve(s.burst[s.i]).direction = nativeSceneValue(resolve(s.burst[s.i]).imageAngle));
                (resolve(s.burst[s.i]).speed = nativeSceneValue(25));
                (resolve(s.burst[s.i]).depth = nativeSceneValue((s.depth - 10)));
            }
            for ((s.i = nativeSceneValue(4)); lt(nativeSceneValue(s.i), nativeSceneValue(8)); (s.i += nativeSceneValue(1))) {
                (sourceArray(s, "burst")[s.i] = nativeSceneValue(host.call(s, "scr_afterimage")));
                (resolve(s.burst[s.i]).imageSpeed = nativeSceneValue(0.5));
                (resolve(s.burst[s.i]).x = nativeSceneValue(s.cx));
                (resolve(s.burst[s.i]).y = nativeSceneValue(s.cy));
                (resolve(s.burst[s.i]).imageAngle = nativeSceneValue((45 + (s.i * 90))));
                (resolve(s.burst[s.i]).direction = nativeSceneValue(resolve(s.burst[s.i]).imageAngle));
                (resolve(s.burst[s.i]).speed = nativeSceneValue(25));
                (resolve(s.burst[s.i]).depth = nativeSceneValue((s.depth - 10)));
            }
        }
        if (sceneTruth(ge(nativeSceneValue(s.t), nativeSceneValue(2)))) {
            for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(4)); (s.i += nativeSceneValue(1))) {
                {
                    const caller233 = s;
                    for (const target233 of targets(s.burst[s.i])) {
                        const other = caller233;
                        const s = target233;
                        {
                            (s.speed *= nativeSceneValue(0.75));
                            (s.imageXscale *= nativeSceneValue(0.8));
                        }
                    }
                }
            }
            for ((s.i = nativeSceneValue(4)); lt(nativeSceneValue(s.i), nativeSceneValue(8)); (s.i += nativeSceneValue(1))) {
                {
                    const caller234 = s;
                    for (const target234 of targets(s.burst[s.i])) {
                        const other = caller234;
                        const s = target234;
                        {
                            (s.speed *= nativeSceneValue(0.8));
                            (s.imageXscale *= nativeSceneValue(0.8));
                        }
                    }
                }
            }
        }
        if (sceneTruth(ge(nativeSceneValue(s.t), nativeSceneValue(18)))) {
            rt.destroy(s);
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.explode, 0)) && sceneTruth(!sceneEqual(s.speed, 0))))) {
        (sourceArray(s, "aft")[s.maxaft] = nativeSceneValue(host.call(s, "scr_afterimage")));
        (resolve(s.aft[s.maxaft]).imageYscale = nativeSceneValue(1.8));
        (resolve(s.aft[s.maxaft]).imageAngle = nativeSceneValue(s.imageAngle));
        (resolve(s.aft[s.maxaft]).imageIndex = nativeSceneValue(4));
        (resolve(s.aft[s.maxaft]).imageSpeed = nativeSceneValue(0.5));
        (resolve(s.aft[s.maxaft]).imageAlpha = nativeSceneValue((s.imageAlpha - 0.2)));
        (s.maxaft += nativeSceneValue(1));
    }
    for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(s.maxaft)); (s.i += nativeSceneValue(1))) {
        {
            const caller235 = s;
            for (const target235 of targets(s.aft[s.i])) {
                const other = caller235;
                const s = target235;
                {
                    (s.imageYscale -= nativeSceneValue(0.1));
                    if (sceneTruth(le(nativeSceneValue(s.imageYscale), nativeSceneValue(0.1)))) {
                        rt.destroy(s);
                    }
                }
            }
        }
        if (sceneTruth(sceneEqual(s.explode, 1))) {
            {
                const caller236 = s;
                for (const target236 of targets(s.aft[s.i])) {
                    const other = caller236;
                    const s = target236;
                    {
                        (s.imageAlpha -= nativeSceneValue(0.07));
                        (s.imageYscale *= nativeSceneValue(0.9));
                        if (sceneTruth(le(nativeSceneValue(s.imageYscale), nativeSceneValue(0.1)))) {
                            rt.destroy(s);
                        }
                    }
                }
            }
        }
    }
    (s.a += nativeSceneValue(1));
    (s.t += nativeSceneValue(1));
}
