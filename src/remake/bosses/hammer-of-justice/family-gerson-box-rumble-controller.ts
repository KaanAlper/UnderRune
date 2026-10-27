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
    (s.full_timer = nativeSceneValue(999));
    (s.phase = nativeSceneValue(0));
    (s.ending_counter = nativeSceneValue(0));
    (s.bonk_side = nativeSceneValue((-1)));
    (s.anchor_x = nativeSceneValue(resolve(object("obj_growtangle")).x));
    (s.anchor_y = nativeSceneValue((resolve(object("obj_growtangle")).y - 40)));
    host.call(s, "scr_darksize");
    (s.sprite = nativeSceneValue("spr_gerson_swing"));
    (s.imageIndex = nativeSceneValue(0));
    (s.imageSpeed = nativeSceneValue(0));
    {
        const caller34 = s;
        for (const target34 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller34;
            const s = target34;
            {
                (s.visible = nativeSceneValue(false));
            }
        }
    }
    (s.visible = nativeSceneValue(false));
    (s.my_flash = nativeSceneValue(host.call(s, "scr_oflash")));
    (resolve(s.my_flash).flashcolor = nativeSceneValue(0));
    (resolve(s.my_flash).flashspeed *= nativeSceneValue(0.5));
    host.call(s, "scr_lerpvar", "y", s.y, (s.y + 80), 16, 2, "out");
    host.call(s, "scr_lerpvar", "image_index", s.imageIndex, 6, 12);
    host.call(s, "snd_play", "snd_boost");
    (g.turntimer = nativeSceneValue(9999));
    s.box_bonk = (arg0: any, arg1: any = 24) => {
        const v: any = Object.create(null);
        {
            {
                const caller35 = s;
                for (const target35 of targets(object("obj_lerpvar"))) {
                    const other = caller35;
                    const s = target35;
                    {
                        if (sceneTruth(sceneEqual(s.target, resolve(other).id))) {
                            rt.destroy(s);
                        }
                    }
                }
            }
            (s.x = nativeSceneValue((resolve(object("obj_growtangle")).x - (120 * arg0))));
            (s.y = nativeSceneValue((s.anchor_y - 30)));
            host.call(s, "scr_lerpvar", "image_index", 0, 6, 4);
            host.call(...rtl(() => s, () => "scr_lerpvar", () => "y", () => s.y, () => (s.y + rt.random.choose(40, (-40))), () => 8, () => 2, () => "out"));
            if (sceneTruth(sceneEqual(arg0, (-1)))) {
                (s.imageXscale = nativeSceneValue(Math.abs(s.imageXscale)));
                (s.x -= nativeSceneValue(60));
            }
            else {
                (s.imageXscale = nativeSceneValue((-Math.abs(s.imageXscale))));
                (s.x += nativeSceneValue(60));
            }
            (s.my_flash = nativeSceneValue(host.call(s, "scr_oflash")));
            (resolve(s.my_flash).flashcolor = nativeSceneValue(65280));
            (resolve(s.my_flash).flashspeed *= nativeSceneValue(1));
            v.new_x = (s.anchor_x + ((100 + rt.random.irandom(20)) * arg0));
            v.new_y = (s.anchor_y + rt.random.irandomRange((-40), 40));
            host.call(s, "snd_play", "snd_queen_punched_lower");
            {
                const caller36 = s;
                for (const target36 of targets(object("obj_growtangle"))) {
                    const other = caller36;
                    const s = target36;
                    {
                        host.call(s, "scr_lerpvar", "x", s.x, v.new_x, (arg1 + 8), 2, "out");
                        host.call(s, "scr_lerpvar", "y", s.y, v.new_y, (arg1 + 8), 2, "out");
                    }
                }
            }
        }
    };
    {
    }
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; rt.drawSelf(s); }
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(sceneEqual(s.phase, 0))) {
        if (sceneTruth((sceneTruth((targets(s.my_flash).length > 0)) && sceneTruth(sceneEqual((s.timer % 3), 0))))) {
            {
                const caller37 = s;
                for (const target37 of targets(host.call(s, "scr_oflash"))) {
                    const other = caller37;
                    const s = target37;
                    {
                        (s.depth = nativeSceneValue((resolve(other).depth + 1)));
                        (s.flashcolor = nativeSceneValue(65280));
                        (s.target = nativeSceneValue((-4)));
                    }
                }
            }
        }
        if (sceneTruth(sceneEqual(s.timer, 24))) {
            (s.phase = nativeSceneValue(1));
            (s.timer = nativeSceneValue(30));
        }
    }
    if (sceneTruth(sceneEqual(s.phase, 1))) {
        if (sceneTruth(sceneEqual(s.timer, 32))) {
            s.box_bonk(s.bonk_side, 40);
            (s.bonk_side *= nativeSceneValue((-1)));
            (s.timer = nativeSceneValue(0));
        }
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        {
            const caller38 = s;
            for (const target38 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller38;
                const s = target38;
                {
                    (s.visible = nativeSceneValue(true));
                }
            }
        }
        rt.destroy(s);
    }
}
export function Step1(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; return; }
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((targets(s.my_flash).length > 0))) {
        {
            const caller39 = s;
            for (const target39 of targets(s.my_flash)) {
                const other = caller39;
                const s = target39;
                {
                    (s.x = nativeSceneValue(resolve(other).x));
                    (s.y = nativeSceneValue(resolve(other).y));
                }
            }
        }
    }
    {
        const caller40 = s;
        for (const target40 of targets(object("obj_growtangle"))) {
            const other = caller40;
            const s = target40;
            {
                (resolve(object("obj_heart")).x = nativeSceneValue(clamp(resolve(object("obj_heart")).x, (s.x - 71), (s.x + 53))));
                (resolve(object("obj_heart")).y = nativeSceneValue(clamp(resolve(object("obj_heart")).y, (s.y - 71), (s.y + 53))));
            }
        }
    }
}
