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
        const caller0 = s;
        for (const target0 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller0;
            const s = target0;
            {
                (s.imageAlpha = nativeSceneValue(1));
            }
        }
    }
    {
        const caller1 = s;
        for (const target1 of targets(object("obj_sound_of_justice_enemy"))) {
            const other = caller1;
            const s = target1;
            {
                (s.imageAlpha = nativeSceneValue(1));
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
    (s.timer2 = nativeSceneValue(0));
    (s.type = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageSpeed = nativeSceneValue((1 / 3)));
    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
        (s.imageBlend = nativeSceneValue(0));
    }
    {
        const caller2 = s;
        for (const target2 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller2;
            const s = target2;
            {
                (s.imageAlpha = nativeSceneValue(0));
            }
        }
    }
    {
        const caller3 = s;
        for (const target3 of targets(object("obj_sound_of_justice_enemy"))) {
            const other = caller3;
            const s = target3;
            {
                (s.imageAlpha = nativeSceneValue(0));
            }
        }
    }
    host.call(s, "scr_oflash");
    host.call(s, "snd_play", "snd_boost");
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; rt.drawSelf(s); }
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(4)))) {
        if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(1)))) {
            (s.chev = nativeSceneValue(create((s.x - 15), s.y, object("obj_gerson_green_chevron"))));
            (resolve(s.chev).imageBlend = nativeSceneValue(mergeColor(65280, 0, (0.2 * s.timer))));
        }
        (s.timer++);
    }
    if (sceneTruth((sceneTruth(le(nativeSceneValue(s.imageIndex), nativeSceneValue(3))) && sceneTruth(sceneEqual(s.imageAlpha, 1))))) {
        (s.y = nativeSceneValue(lerp(...rtl(() => s.y, () => (rt.view.y + (rt.view.height / 2)), () => 0.3))));
        if (sceneTruth((targets(s._oflash).length > 0))) {
            (resolve(s._oflash).y = nativeSceneValue(s.y));
        }
    }
    if (sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(6.5)))) {
        {
            const caller4 = s;
            for (const target4 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller4;
                const s = target4;
                {
                    (s.imageAlpha = nativeSceneValue(1));
                }
            }
        }
        {
            const caller5 = s;
            for (const target5 of targets(object("obj_sound_of_justice_enemy"))) {
                const other = caller5;
                const s = target5;
                {
                    (s.imageAlpha = nativeSceneValue(1));
                }
            }
        }
        (s.imageAlpha = nativeSceneValue(0));
        (s.imageSpeed = nativeSceneValue(0));
        (s.timer2++);
        if (sceneTruth(gt(nativeSceneValue(s.timer2), nativeSceneValue(3)))) {
            (s.y = nativeSceneValue(lerp(s.y, s.ystart, 0.4)));
        }
        if (sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0))) {
            (resolve(object("obj_hammer_of_justice_enemy")).y = nativeSceneValue(s.y));
        }
        if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
            (resolve(object("obj_sound_of_justice_enemy")).y = nativeSceneValue(s.y));
        }
        if (sceneTruth(sceneEqual(s.timer2, 10))) {
            if (sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0))) {
                (resolve(object("obj_hammer_of_justice_enemy")).y = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).ystart));
            }
            if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
                (resolve(object("obj_sound_of_justice_enemy")).y = nativeSceneValue(resolve(object("obj_sound_of_justice_enemy")).ystart));
            }
            rt.destroy(s);
        }
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(3))) && sceneTruth(sceneEqual(s.type, 1))))) {
        (s.imageIndex = nativeSceneValue(3));
    }
}
