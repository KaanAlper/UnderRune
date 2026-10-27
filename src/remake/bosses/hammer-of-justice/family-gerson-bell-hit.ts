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
    (s.imageSpeed = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
}
export function Other24(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 14))) {
            host.call(s, "snd_play", "motor_upper_quick_mid");
        }
        if (sceneTruth(sceneEqual(s.timer, 16))) {
            (s.con = nativeSceneValue(1));
            (s.timer = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_queen_punched_lower");
            host.call(s, "snd_play", "snd_bell");
            (s.imageIndex = nativeSceneValue(1));
            host.call(s, "scr_shakeobj");
            (s.bell = nativeSceneValue(host.call(s, "instance_nearest", s.x, s.y, object("obj_gerson_bell"))));
            v.angle_offset = (rt.random.random(60) - 30);
            if (sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                {
                    const caller170 = s;
                    for (const target170 of targets(s.bell)) {
                        const other = caller170;
                        const s = target170;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(180));
                        }
                    }
                }
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(7)); (s.i++)) {
                    (s.radialshot = nativeSceneValue(create((resolve(s.bell).x + 42), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet_radial"))));
                    {
                        const caller171 = s;
                        for (const target171 of targets(s.radialshot)) {
                            const other = caller171;
                            const s = target171;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.radialshot).active = nativeSceneValue(1));
                    (resolve(s.radialshot).place = nativeSceneValue(((270 - (30 * s.i)) + v.angle_offset)));
                    (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                    (resolve(s.radialshot).target = nativeSceneValue(3));
                    (resolve(s.radialshot).damage = nativeSceneValue(1));
                    (resolve(s.radialshot).grazed = nativeSceneValue(0));
                }
            }
            else {
                {
                    const caller172 = s;
                    for (const target172 of targets(s.bell)) {
                        const other = caller172;
                        const s = target172;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(0));
                        }
                    }
                }
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(7)); (s.i++)) {
                    (s.radialshot = nativeSceneValue(create((resolve(s.bell).x + 42), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet_radial"))));
                    {
                        const caller173 = s;
                        for (const target173 of targets(s.radialshot)) {
                            const other = caller173;
                            const s = target173;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.radialshot).active = nativeSceneValue(1));
                    (resolve(s.radialshot).place = nativeSceneValue(((250 + (30 * s.i)) + v.angle_offset)));
                    (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                    (resolve(s.radialshot).target = nativeSceneValue(3));
                    (resolve(s.radialshot).damage = nativeSceneValue(1));
                    (resolve(s.radialshot).grazed = nativeSceneValue(0));
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 6))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
            (s.imageIndex = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 6))) {
            (s.timer = nativeSceneValue((-47)));
            (s.con = nativeSceneValue(0));
            (s.imageIndex = nativeSceneValue(0));
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
export function Other25(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 14))) {
            host.call(s, "snd_play", "motor_upper_quick_mid");
        }
        if (sceneTruth(sceneEqual(s.timer, 16))) {
            (s.con = nativeSceneValue(1));
            (s.timer = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_queen_punched_lower");
            host.call(s, "snd_play", "snd_bell");
            (s.imageIndex = nativeSceneValue(1));
            host.call(s, "scr_shakeobj");
            v.slowbullet1 = rt.random.irandom(4);
            (s.bell = nativeSceneValue(host.call(s, "instance_nearest", s.x, s.y, object("obj_gerson_bell"))));
            if (sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                {
                    const caller174 = s;
                    for (const target174 of targets(s.bell)) {
                        const other = caller174;
                        const s = target174;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(180));
                        }
                    }
                }
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(5)); (s.i++)) {
                    if (sceneTruth(sceneEqual(s.i, v.slowbullet1))) {
                        continue;
                    }
                    (s.bulletshot = nativeSceneValue(create((resolve(s.bell).x + 42), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet"))));
                    {
                        const caller175 = s;
                        for (const target175 of targets(s.bulletshot)) {
                            const other = caller175;
                            const s = target175;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.bulletshot).imageXscale = nativeSceneValue(1.4));
                    (resolve(s.bulletshot).imageYscale = nativeSceneValue(1.4));
                    (resolve(s.bulletshot).active = nativeSceneValue(1));
                    (resolve(s.bulletshot).direction = nativeSceneValue(180));
                    (resolve(s.bulletshot).pos = nativeSceneValue(s.i));
                    (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                    (resolve(s.bulletshot).target = nativeSceneValue(3));
                    (resolve(s.bulletshot).damage = nativeSceneValue(1));
                    (resolve(s.bulletshot).grazed = nativeSceneValue(0));
                }
                v.radial = 5;
                v.dir = 0;
                if (sceneTruth((sceneTruth(sceneEqual(s.bighearttype, 1)) && sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue(resolve(object("obj_growtangle")).y)))))) {
                    (v.dir = nativeSceneValue((25 + rt.random.random(10))));
                }
                if (sceneTruth((sceneTruth(sceneEqual(s.bighearttype, 1)) && sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue(resolve(object("obj_growtangle")).y)))))) {
                    (v.dir = nativeSceneValue(((rt.random.random(10) * (-1)) - 25)));
                }
                for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(v.radial)); (s.i++)) {
                    (s.radialshot = nativeSceneValue(create(s.x, s.y, object("obj_collidebullet"))));
                    {
                        const caller176 = s;
                        for (const target176 of targets(s.radialshot)) {
                            const other = caller176;
                            const s = target176;
                            {
                                bulletInit(s);
                            }
                        }
                    }
                    (resolve(s.radialshot).sprite = nativeSceneValue("spr_diamondbullet"));
                    (resolve(s.radialshot).direction = nativeSceneValue(((((s.i / v.radial) * 180) + 110) + v.dir)));
                    (resolve(s.radialshot).imageAngle = nativeSceneValue(resolve(s.radialshot).direction));
                    (resolve(s.radialshot).active = nativeSceneValue(1));
                    (resolve(s.radialshot).speed = nativeSceneValue(1));
                    (resolve(s.radialshot).friction = nativeSceneValue((-0.3)));
                    if (sceneTruth(sceneEqual(s.bighearttype, 1))) {
                        (resolve(s.radialshot).speed = nativeSceneValue(1));
                        (resolve(s.radialshot).friction = nativeSceneValue((-0.23)));
                    }
                    (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                    (resolve(s.radialshot).target = nativeSceneValue(s.target));
                    (resolve(s.radialshot).damage = nativeSceneValue(s.damage));
                    (resolve(s.radialshot).grazed = nativeSceneValue(0));
                    (resolve(s.radialshot).element = nativeSceneValue(6));
                    if (sceneTruth(sceneEqual(resolve(object("obj_spamton_neo_enemy")).difficulty, 0))) {
                        (resolve(s.radialshot).grazepoints = nativeSceneValue(3));
                    }
                    if (sceneTruth(sceneEqual(resolve(object("obj_spamton_neo_enemy")).difficulty, 2))) {
                        (resolve(s.radialshot).grazepoints = nativeSceneValue(2));
                    }
                }
            }
            else {
                {
                    const caller177 = s;
                    for (const target177 of targets(s.bell)) {
                        const other = caller177;
                        const s = target177;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(0));
                        }
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 6))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
            (s.imageIndex = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 6))) {
            (s.timer = nativeSceneValue((-47)));
            (s.con = nativeSceneValue(0));
            (s.imageIndex = nativeSceneValue(0));
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 14))) {
            host.call(s, "snd_play", "motor_upper_quick_mid");
        }
        if (sceneTruth(sceneEqual(s.timer, 16))) {
            (s.con = nativeSceneValue(1));
            (s.timer = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_queen_punched_lower");
            (s.imageIndex = nativeSceneValue(1));
            host.call(s, "scr_shakeobj");
            (s.bell = nativeSceneValue(host.call(s, "instance_nearest", s.x, s.y, object("obj_gerson_bell"))));
            v.angle_offset = (rt.random.random(40) - 20);
            if (sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                {
                    const caller178 = s;
                    for (const target178 of targets(s.bell)) {
                        const other = caller178;
                        const s = target178;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(180));
                        }
                    }
                }
                if (sceneTruth(sceneEqual(rt.random.choose(0, 1), 0))) {
                    host.call(s, "snd_play_pitch", "snd_bell", 0.8);
                    for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(7)); (s.i++)) {
                        (s.radialshot = nativeSceneValue(create((resolve(s.bell).x + 42), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet_radial"))));
                        {
                            const caller179 = s;
                            for (const target179 of targets(s.radialshot)) {
                                const other = caller179;
                                const s = target179;
                                {
                                    bulletInit(s);
                                }
                            }
                        }
                        (resolve(s.radialshot).active = nativeSceneValue(1));
                        (resolve(s.radialshot).place = nativeSceneValue(((220 - (24 * s.i)) + v.angle_offset)));
                        (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                        (resolve(s.radialshot).target = nativeSceneValue(3));
                        (resolve(s.radialshot).damage = nativeSceneValue(1));
                        (resolve(s.radialshot).grazed = nativeSceneValue(0));
                    }
                }
                else {
                    host.call(s, "snd_play_pitch", "snd_bell", 1.1);
                    for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(10)); (s.i++)) {
                        (s.radialshot = nativeSceneValue(create((resolve(s.bell).x + 22), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet_radial"))));
                        {
                            const caller180 = s;
                            for (const target180 of targets(s.radialshot)) {
                                const other = caller180;
                                const s = target180;
                                {
                                    bulletInit(s);
                                }
                            }
                        }
                        (resolve(s.radialshot).active = nativeSceneValue(1));
                        (resolve(s.radialshot).place = nativeSceneValue(((220 - (16 * s.i)) + v.angle_offset)));
                        (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                        (resolve(s.radialshot).target = nativeSceneValue(3));
                        (resolve(s.radialshot).type = nativeSceneValue(1));
                        (resolve(s.radialshot).damage = nativeSceneValue(1));
                        (resolve(s.radialshot).grazed = nativeSceneValue(0));
                    }
                }
            }
            else {
                {
                    const caller181 = s;
                    for (const target181 of targets(s.bell)) {
                        const other = caller181;
                        const s = target181;
                        {
                            (s.shakeobj = nativeSceneValue(create(s.x, s.y, object("obj_shakedirectional"))));
                            (resolve(s.shakeobj).target = nativeSceneValue(s.id));
                            (resolve(s.shakeobj).dir = nativeSceneValue(0));
                        }
                    }
                }
                if (sceneTruth(sceneEqual(rt.random.choose(0, 1), 0))) {
                    host.call(s, "snd_play_pitch", "snd_bell", 0.8);
                    for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(7)); (s.i++)) {
                        (s.radialshot = nativeSceneValue(create((resolve(s.bell).x + 22), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet_radial"))));
                        {
                            const caller182 = s;
                            for (const target182 of targets(s.radialshot)) {
                                const other = caller182;
                                const s = target182;
                                {
                                    bulletInit(s);
                                }
                            }
                        }
                        (resolve(s.radialshot).active = nativeSceneValue(1));
                        (resolve(s.radialshot).place = nativeSceneValue(((220 + (24 * s.i)) + v.angle_offset)));
                        (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                        (resolve(s.radialshot).target = nativeSceneValue(3));
                        (resolve(s.radialshot).damage = nativeSceneValue(1));
                        (resolve(s.radialshot).grazed = nativeSceneValue(0));
                    }
                }
                else {
                    host.call(s, "snd_play_pitch", "snd_bell", 1.1);
                    for ((s.i = nativeSceneValue(0)); lt(nativeSceneValue(s.i), nativeSceneValue(11)); (s.i++)) {
                        (s.radialshot = nativeSceneValue(create((resolve(s.bell).x + 22), (resolve(s.bell).y + 60), object("obj_gerson_bell_bullet_radial"))));
                        {
                            const caller183 = s;
                            for (const target183 of targets(s.radialshot)) {
                                const other = caller183;
                                const s = target183;
                                {
                                    bulletInit(s);
                                }
                            }
                        }
                        (resolve(s.radialshot).active = nativeSceneValue(1));
                        (resolve(s.radialshot).place = nativeSceneValue(((220 + (16 * s.i)) + v.angle_offset)));
                        (resolve(s.radialshot).depth = nativeSceneValue((s.depth - 1)));
                        (resolve(s.radialshot).target = nativeSceneValue(3));
                        (resolve(s.radialshot).type = nativeSceneValue(1));
                        (resolve(s.radialshot).damage = nativeSceneValue(1));
                        (resolve(s.radialshot).grazed = nativeSceneValue(0));
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 4))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
            (s.imageIndex = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 4))) {
            (s.timer = nativeSceneValue((-22)));
            (s.con = nativeSceneValue(0));
            (s.imageIndex = nativeSceneValue(0));
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
