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
    (s.con = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageSpeed = nativeSceneValue(0));
    {
        const caller12 = s;
        for (const target12 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller12;
            const s = target12;
            {
                (s.visible = nativeSceneValue(false));
            }
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 1))) {
            (s.vspeed = nativeSceneValue((-48)));
            host.call(s, "snd_play", "snd_jump");
            host.call(s, "snd_play", "snd_rocket");
            host.call(s, "snd_play", "snd_screenshake");
            (s.d = nativeSceneValue(create(0, 0, object("obj_shake"))));
            (resolve(s.d).shakex = nativeSceneValue(Math.ceil(2)));
            (resolve(s.d).shakey = nativeSceneValue(Math.ceil(2)));
        }
        (s.flash = nativeSceneValue(create(s.x, s.y, object("obj_afterimage"))));
        (resolve(s.flash).sprite = nativeSceneValue(s.sprite));
        (resolve(s.flash).imageIndex = nativeSceneValue(s.imageIndex));
        (resolve(s.flash).imageXscale = nativeSceneValue(s.imageXscale));
        (resolve(s.flash).imageYscale = nativeSceneValue(s.imageYscale));
        (resolve(s.flash).imageBlend = nativeSceneValue(s.imageBlend));
        (resolve(s.flash).imageSpeed = nativeSceneValue(0));
        (resolve(s.flash).imageAlpha = nativeSceneValue(1.5));
        (resolve(s.flash).fadeSpeed = nativeSceneValue(0.2));
        if (sceneTruth(lt(nativeSceneValue(s.vspeed), nativeSceneValue(0)))) {
            (s.vspeed += nativeSceneValue(0.8));
        }
        if (sceneTruth(sceneEqual(s.timer, 14))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(1));
            (s.vspeed = nativeSceneValue(0));
            (s.x = nativeSceneValue(resolve(object("obj_growtangle")).x));
            (s.y = nativeSceneValue(rt.view.y));
            (s.sprite = nativeSceneValue("spr_gerson_dodge_origin_top_bottom"));
            (s.imageIndex = nativeSceneValue(0));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(5)))) {
            (s.timer++);
        }
        (s.y = nativeSceneValue(lerp(...rtl(() => rt.view.y, () => (resolve(object("obj_growtangle")).y - 70), () => (s.timer / 5)))));
        if (sceneTruth(sceneEqual(s.timer, 5))) {
            (s.y = nativeSceneValue((resolve(object("obj_growtangle")).y - 70)));
            (s.con = nativeSceneValue(2));
            (s.timer = nativeSceneValue(0));
            host.call(s, "snd_play", "snd_screenshake");
            (s.d = nativeSceneValue(create(0, 0, object("obj_shake"))));
            (resolve(s.d).shakex = nativeSceneValue(Math.ceil(2)));
            (resolve(s.d).shakey = nativeSceneValue(Math.ceil(2)));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        {
            const caller13 = s;
            for (const target13 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller13;
                const s = target13;
                {
                    (s.squishbox = nativeSceneValue(true));
                }
            }
        }
        (s.timer++);
        v.timermax = 10;
        if (sceneTruth(le(nativeSceneValue(s.timer), nativeSceneValue(v.timermax)))) {
            v.maxscalex = lerp(9, 6, (s.timer / v.timermax));
            v.maxscaley = lerp(0.2, 1, (s.timer / v.timermax));
            (resolve(object("obj_growtangle")).imageXscale = nativeSceneValue(lerp(resolve(object("obj_growtangle")).imageXscale, v.maxscalex, (s.timer / v.timermax))));
            (resolve(object("obj_growtangle")).imageYscale = nativeSceneValue(lerp(resolve(object("obj_growtangle")).imageYscale, v.maxscaley, (s.timer / v.timermax))));
        }
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(v.timermax)))) {
            v.maxscalex = lerp(5, 6, (s.timer / 15));
            v.maxscaley = lerp(1.2, 1, (s.timer / 15));
            (resolve(object("obj_growtangle")).imageXscale = nativeSceneValue(lerp(resolve(object("obj_growtangle")).imageXscale, v.maxscalex, (s.timer / 15))));
            (resolve(object("obj_growtangle")).imageYscale = nativeSceneValue(lerp(resolve(object("obj_growtangle")).imageYscale, v.maxscaley, (s.timer / 15))));
        }
        (s.y = nativeSceneValue((resolve(object("obj_growtangle")).y - (35 * resolve(object("obj_growtangle")).imageYscale))));
        if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(15)))) {
            create(s.x, (s.y - 67), object("obj_gerson_teleport"));
            rt.destroy(s);
        }
    }
}
