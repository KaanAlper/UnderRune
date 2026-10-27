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
export function Alarm0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.count = nativeSceneValue(0));
    if (sceneTruth(sceneEqual(s.pattern, 0))) {
        (s.pattern = nativeSceneValue(rt.random.choose(1, 2)));
    }
    else if (sceneTruth(sceneEqual(s.pattern, 1))) {
        (s.pattern = nativeSceneValue(rt.random.choose(0, 2)));
    }
    else if (sceneTruth(sceneEqual(s.pattern, 2))) {
        (s.pattern = nativeSceneValue(rt.random.choose(0, 1)));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.pattern, 1)) || sceneTruth(sceneEqual(s.pattern, 2))))) {
        (s.forcepattern++);
    }
    else {
        (s.forcepattern = nativeSceneValue(0));
    }
    if (sceneTruth(sceneEqual(s.forcepattern, 3))) {
        (s.forcepattern = nativeSceneValue(0));
        (s.pattern = nativeSceneValue(0));
    }
    if (sceneTruth(gt(nativeSceneValue(s.pattern), nativeSceneValue(0)))) {
        (s.timer = nativeSceneValue((-20)));
        (s.throwsframes = nativeSceneValue(1));
        if (sceneTruth(gt(nativeSceneValue(s.forcepattern), nativeSceneValue(1)))) {
            (s.timer = nativeSceneValue(((5 + rt.random.irandom(5)) * (-1))));
            (s.throwsframes = nativeSceneValue(1));
        }
    }
    else {
        (s.timer = nativeSceneValue(0));
        (s.throwsframes = nativeSceneValue(6));
    }
}
export function CleanUp0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    {
        const caller16 = s;
        for (const target16 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller16;
            const s = target16;
            {
                (s.visible = nativeSceneValue(true));
            }
        }
    }
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.count = nativeSceneValue(0));
    (s.pausecount = nativeSceneValue(10));
    (s.throwsframes = nativeSceneValue(5));
    (s.delay = nativeSceneValue(0));
    (s.forcepattern = nativeSceneValue(0));
    (s.startx = nativeSceneValue(s.x));
    (s.starty = nativeSceneValue(s.y));
    (s.targetx = nativeSceneValue(s.x));
    (s.targety = nativeSceneValue(s.y));
    (s.con2 = nativeSceneValue(0));
    (s.fakey = nativeSceneValue((-15)));
    (s.jumpcon = nativeSceneValue(0));
    (s.jumptimer = nativeSceneValue(0));
    (s.jumptimermax = nativeSceneValue(30));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageSpeed = nativeSceneValue(0));
    (s.lerpdowntimer = nativeSceneValue(0));
    (s.attackduration = nativeSceneValue(240));
    {
        const caller17 = s;
        for (const target17 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller17;
            const s = target17;
            {
                (s.visible = nativeSceneValue(false));
            }
        }
    }
    (s.pattern = nativeSceneValue(rt.random.choose(0, 1, 2)));
    (s.timerb = nativeSceneValue(0));
    (s.endtimer = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; rt.drawSelf(s); }
export function Other10(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(sceneEqual(s.timer, s.throwsframes))) {
        host.call(s, "snd_stop", "snd_smallswing");
        host.call(...rtl(() => s, () => "snd_play_pitch", () => "snd_smallswing", () => (1 + rt.random.random(0.3))));
        v.rep = 1;
        v.a = 0;
        {
            const count0 = round(v.rep);
            for (let repeat0 = 0; repeat0 < count0; repeat0++) {
                (s.bulletshot = nativeSceneValue(create((s.x + 100), (s.y + 90), object("obj_gerson_hammer_bro_hammer"))));
                {
                    const caller18 = s;
                    for (const target18 of targets(s.bulletshot)) {
                        const other = caller18;
                        const s = target18;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).active = nativeSceneValue(1));
                (resolve(s.bulletshot).imageXscale = nativeSceneValue(2));
                (resolve(s.bulletshot).imageYscale = nativeSceneValue(2));
                (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.8) - rt.random.random(4))));
                if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((s.ystart + 50))))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(4))));
                }
                (resolve(s.bulletshot).fakevspeed = nativeSceneValue((-14)));
                (resolve(s.bulletshot).gravityDirection = nativeSceneValue(270));
                (resolve(s.bulletshot).fakegravity = nativeSceneValue(0.6));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (resolve(s.bulletshot).target = nativeSceneValue(3));
                (resolve(s.bulletshot).damage = nativeSceneValue(1));
                (resolve(s.bulletshot).grazed = nativeSceneValue(0));
                if (sceneTruth(sceneEqual(s.pattern, 1))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.8) - (s.count / 3.5))));
                }
                if (sceneTruth(sceneEqual(s.pattern, 2))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-6.8) + (s.count / 3))));
                }
                if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.pattern, 0)) && sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.count, 2)) || sceneTruth(sceneEqual(s.count, 4)))) || sceneTruth(sceneEqual(s.count, 6)))))) || sceneTruth(sceneEqual(s.count, 2)))) || sceneTruth(sceneEqual(s.count, 4))))) {
                    if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x - 37.5))))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-4.8) - rt.random.random(2))));
                    }
                    else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x + 37.5))))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(1.5))));
                    }
                    else if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-3.7) - rt.random.random(1.5))));
                    }
                    else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.7) - rt.random.random(2.2))));
                    }
                }
            }
        }
        (s.imageIndex = nativeSceneValue(1));
    }
    if (sceneTruth(sceneEqual(s.timer, (s.throwsframes * 2)))) {
        (s.imageIndex = nativeSceneValue(0));
        (s.count++);
        if (sceneTruth(ge(nativeSceneValue(s.pausecount), nativeSceneValue(s.count)))) {
            (s.timer = nativeSceneValue((-10)));
            (s.count = nativeSceneValue(0));
            (s.throwsframes = nativeSceneValue(1));
            (sourceArray(s, "alarm")[0] = nativeSceneValue(20));
        }
        else {
            (s.timer = nativeSceneValue(0));
        }
    }
    if (sceneTruth(sceneEqual(s.vspeed, 0))) {
        (s.jumptimer++);
        if (sceneTruth(sceneEqual(s.jumptimer, s.jumptimermax))) {
        }
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.vspeed), nativeSceneValue(0))) && sceneTruth(ge(nativeSceneValue(s.y), nativeSceneValue((s.ystart + 92))))))) {
        (s.vspeed = nativeSceneValue(0));
        (s.gravity = nativeSceneValue(0));
        (s.y = nativeSceneValue((s.ystart + 100)));
    }
    (s.lerpdowntimer++);
    if (sceneTruth(lt(nativeSceneValue(s.lerpdowntimer), nativeSceneValue(20)))) {
        (s.y = nativeSceneValue(lerp(s.y, (s.ystart + 100), (s.lerpdowntimer / 20))));
    }
    if (sceneTruth(ge(nativeSceneValue(s.lerpdowntimer), nativeSceneValue((s.attackduration - 20))))) {
        (s.y = nativeSceneValue(lerp(s.y, s.ystart, ((s.lerpdowntimer - (s.attackduration - 20)) / 20))));
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1))) || sceneTruth(sceneEqual(s.lerpdowntimer, s.attackduration))))) {
        rt.destroy(s);
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.timer, s.throwsframes)) && sceneTruth(gt(nativeSceneValue(g.turntimer), nativeSceneValue(30))))) && sceneTruth(lt(nativeSceneValue(s.lerpdowntimer), nativeSceneValue((s.attackduration - 20))))))) {
        host.call(s, "snd_stop", "snd_smallswing");
        host.call(...rtl(() => s, () => "snd_play_pitch", () => "snd_smallswing", () => (1 + rt.random.random(0.3))));
        v.rep = 1;
        v.a = 0;
        {
            const count1 = round(v.rep);
            for (let repeat1 = 0; repeat1 < count1; repeat1++) {
                (s.bulletshot = nativeSceneValue(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bro_hammer"))));
                {
                    const caller19 = s;
                    for (const target19 of targets(s.bulletshot)) {
                        const other = caller19;
                        const s = target19;
                        {
                            bulletInit(s);
                        }
                    }
                }
                (resolve(s.bulletshot).active = nativeSceneValue(1));
                (resolve(s.bulletshot).imageXscale = nativeSceneValue(2));
                (resolve(s.bulletshot).imageYscale = nativeSceneValue(2));
                (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(4.8))));
                (resolve(s.bulletshot).fakevspeed = nativeSceneValue((-14)));
                (resolve(s.bulletshot).gravityDirection = nativeSceneValue(270));
                (resolve(s.bulletshot).fakegravity = nativeSceneValue(0.6));
                (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
                (resolve(s.bulletshot).target = nativeSceneValue(3));
                (resolve(s.bulletshot).damage = nativeSceneValue(1));
                (resolve(s.bulletshot).grazed = nativeSceneValue(0));
                (resolve(s.bulletshot).grazepoints = nativeSceneValue(2.5));
                if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((s.ystart + 50))))) {
                    (resolve(s.bulletshot).fakevspeed = nativeSceneValue((-10)));
                }
                if (sceneTruth(sceneEqual(s.pattern, 1))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.8) - (s.count / 4))));
                }
                if (sceneTruth(sceneEqual(s.pattern, 2))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-6.8) + (s.count / 3))));
                }
                if (sceneTruth((sceneTruth(sceneEqual(s.count, 2)) || sceneTruth(sceneEqual(s.count, 4))))) {
                    if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x - 37.5))))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-4.8) - rt.random.random(2))));
                    }
                    else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x + 37.5))))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(1.5))));
                    }
                    else if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-3.7) - rt.random.random(1.5))));
                    }
                    else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                        (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.7) - rt.random.random(2.2))));
                    }
                }
            }
        }
        if (sceneTruth(!sceneEqual(s.throwsframes, 1))) {
            (s.bulletshot = nativeSceneValue(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bro_hammer"))));
            {
                const caller20 = s;
                for (const target20 of targets(s.bulletshot)) {
                    const other = caller20;
                    const s = target20;
                    {
                        bulletInit(s);
                    }
                }
            }
            (resolve(s.bulletshot).active = nativeSceneValue(1));
            (resolve(s.bulletshot).imageXscale = nativeSceneValue(2));
            (resolve(s.bulletshot).imageYscale = nativeSceneValue(2));
            (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(4.8))));
            (resolve(s.bulletshot).fakevspeed = nativeSceneValue(((-12) - rt.random.random(4))));
            (resolve(s.bulletshot).gravityDirection = nativeSceneValue(270));
            (resolve(s.bulletshot).fakegravity = nativeSceneValue(0.6));
            (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
            (resolve(s.bulletshot).target = nativeSceneValue(3));
            (resolve(s.bulletshot).damage = nativeSceneValue(1));
            (resolve(s.bulletshot).grazed = nativeSceneValue(0));
            (resolve(s.bulletshot).grazepoints = nativeSceneValue(2.5));
            if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((s.ystart + 50))))) {
                (resolve(s.bulletshot).fakevspeed = nativeSceneValue((-10)));
            }
            if (sceneTruth((sceneTruth(sceneEqual(s.count, 2)) || sceneTruth(sceneEqual(s.count, 4))))) {
                if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x - 37.5))))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-4.8) - rt.random.random(2))));
                }
                else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x + 37.5))))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(1.5))));
                }
                else if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-3.7) - rt.random.random(1.5))));
                }
                else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.7) - rt.random.random(2.2))));
                }
            }
            (s.bulletshot = nativeSceneValue(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_hammer_bro_hammer"))));
            {
                const caller21 = s;
                for (const target21 of targets(s.bulletshot)) {
                    const other = caller21;
                    const s = target21;
                    {
                        bulletInit(s);
                    }
                }
            }
            (resolve(s.bulletshot).active = nativeSceneValue(1));
            (resolve(s.bulletshot).imageXscale = nativeSceneValue(2));
            (resolve(s.bulletshot).imageYscale = nativeSceneValue(2));
            (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(4.8))));
            (resolve(s.bulletshot).fakevspeed = nativeSceneValue(((-12) - rt.random.random(4))));
            (resolve(s.bulletshot).gravityDirection = nativeSceneValue(270));
            (resolve(s.bulletshot).fakegravity = nativeSceneValue(0.6));
            (resolve(s.bulletshot).depth = nativeSceneValue((s.depth - 1)));
            (resolve(s.bulletshot).target = nativeSceneValue(3));
            (resolve(s.bulletshot).damage = nativeSceneValue(1));
            (resolve(s.bulletshot).grazed = nativeSceneValue(0));
            (resolve(s.bulletshot).grazepoints = nativeSceneValue(2.5));
            if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((s.ystart + 50))))) {
                (resolve(s.bulletshot).fakevspeed = nativeSceneValue((-10)));
            }
            if (sceneTruth((sceneTruth(sceneEqual(s.count, 2)) || sceneTruth(sceneEqual(s.count, 4))))) {
                if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x - 37.5))))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-4.8) - rt.random.random(2))));
                }
                else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue((resolve(object("obj_growtangle")).x + 37.5))))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2) - rt.random.random(1.5))));
                }
                else if (sceneTruth(lt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-3.7) - rt.random.random(1.5))));
                }
                else if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_heart")).x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                    (resolve(s.bulletshot).fakehspeed = nativeSceneValue(((-2.7) - rt.random.random(2.2))));
                }
            }
        }
        (s.imageIndex = nativeSceneValue(1));
        (s.timerb = nativeSceneValue(3));
    }
    if (sceneTruth(gt(nativeSceneValue(s.timerb), nativeSceneValue(0)))) {
        (s.timerb--);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.timerb, 1)) && sceneTruth(sceneEqual(s.imageIndex, 1))))) {
        (s.imageIndex = nativeSceneValue(2));
    }
    if (sceneTruth(sceneEqual(s.timer, (s.throwsframes * 2)))) {
        (s.imageIndex = nativeSceneValue(0));
        (s.count++);
        if (sceneTruth(le(nativeSceneValue(s.pausecount), nativeSceneValue(s.count)))) {
            (s.count = nativeSceneValue(0));
            if (sceneTruth(gt(nativeSceneValue(s.pattern), nativeSceneValue(0)))) {
                (sourceArray(s, "alarm")[0] = nativeSceneValue(5));
                (s.timer = nativeSceneValue((-23)));
            }
            else {
                (s.timer = nativeSceneValue((-11)));
                (sourceArray(s, "alarm")[0] = nativeSceneValue(30));
            }
        }
        else {
            (s.timer = nativeSceneValue(0));
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.con, 0)) && sceneTruth(sceneEqual(s.pattern, 0))))) {
        (s.jumptimer++);
        if (sceneTruth(sceneEqual(s.jumptimer, s.jumptimermax))) {
            if (sceneTruth(sceneEqual(s.con2, 0))) {
                (s.startx = nativeSceneValue(s.x));
                (s.starty = nativeSceneValue(s.y));
                (s.targetx = nativeSceneValue((s.x - 50)));
                (s.targety = nativeSceneValue(s.y));
                (s.con2 = nativeSceneValue(1));
            }
            else {
                (s.startx = nativeSceneValue(s.x));
                (s.starty = nativeSceneValue(s.y));
                (s.targetx = nativeSceneValue((s.x + 50)));
                (s.targety = nativeSceneValue(s.y));
                (s.con2 = nativeSceneValue(0));
            }
            (s.jumptimer = nativeSceneValue(0));
            (s.jumptimermax = nativeSceneValue((30 + rt.random.irandom(12))));
            (s.con = nativeSceneValue(1));
            host.call(s, "snd_play_pitch", "snd_jump", 2);
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.jumptimer++);
        (s.fakey = nativeSceneValue(((-15) + ((Math.sin((s.jumptimer / 7.4)) * 100) * (-1)))));
        (s.x = nativeSceneValue(lerp(s.startx, s.targetx, (s.jumptimer / 24))));
        (s.y = nativeSceneValue(lerp(s.starty, s.targety, (s.jumptimer / 24))));
        (s.y += nativeSceneValue(s.fakey));
        if (sceneTruth(sceneEqual(s.jumptimer, 24))) {
            (s.y = nativeSceneValue(s.starty));
            (s.con = nativeSceneValue(0));
            (s.jumptimer = nativeSceneValue(0));
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.vspeed), nativeSceneValue(0))) && sceneTruth(ge(nativeSceneValue(s.y), nativeSceneValue((s.ystart + 84)))))) && sceneTruth(sceneEqual(s.endtimer, 0))))) {
        (s.vspeed = nativeSceneValue(0));
        (s.gravity = nativeSceneValue(0));
        (s.y = nativeSceneValue((s.ystart + 92)));
    }
    if (sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.vspeed), nativeSceneValue(0))) && sceneTruth(ge(nativeSceneValue(s.y), nativeSceneValue((s.ystart - 10)))))) && sceneTruth(!sceneEqual(s.endtimer, 0))))) {
        (s.vspeed = nativeSceneValue(0));
        (s.gravity = nativeSceneValue(0));
        (s.y = nativeSceneValue(s.ystart));
        rt.destroy(s);
    }
    (s.lerpdowntimer++);
    if (sceneTruth(lt(nativeSceneValue(s.lerpdowntimer), nativeSceneValue(20)))) {
        if (sceneTruth(sceneEqual(s.lerpdowntimer, 1))) {
            host.call(s, "snd_play_pitch", "snd_jump", 2);
            (s.vspeed = nativeSceneValue((-14)));
            (s.gravity = nativeSceneValue(2));
        }
    }
    if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.lerpdowntimer), nativeSceneValue((s.attackduration - 20)))) && sceneTruth(sceneEqual(s.con, 0))))) {
        (s.imageIndex = nativeSceneValue(0));
        if (sceneTruth(gt(nativeSceneValue(g.turntimer), nativeSceneValue(20)))) {
            (g.turntimer = nativeSceneValue(20));
        }
        (s.endtimer++);
        if (sceneTruth(sceneEqual(s.endtimer, 1))) {
            host.call(s, "snd_play_pitch", "snd_jump", 2);
            (s.vspeed = nativeSceneValue((-20.6)));
            (s.gravity = nativeSceneValue(2));
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
}
