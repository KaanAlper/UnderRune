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
        const caller237 = s;
        for (const target237 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller237;
            const s = target237;
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
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.x = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).x));
    (s.y = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).y));
    {
        const caller238 = s;
        for (const target238 of targets(object("obj_hammer_of_justice_enemy"))) {
            const other = caller238;
            const s = target238;
            {
                (s.visible = nativeSceneValue(false));
            }
        }
    }
    {
        const caller239 = s;
        for (const target239 of targets(object("obj_battlecontroller"))) {
            const other = caller239;
            const s = target239;
            {
                (s.disableitembutton = nativeSceneValue(1));
            }
        }
    }
    host.call(s, "snd_stop", "motor_swing_down");
    host.call(s, "snd_play_pitch", "motor_swing_down", 1.4);
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(sceneEqual(s.timer, 3))) {
        (s.sprite = nativeSceneValue("spr_nothing"));
    }
    if (sceneTruth(sceneEqual(s.timer, 13))) {
        (s.sprite = nativeSceneValue("spr_gerson_item_steal2"));
        (s.imageIndex = nativeSceneValue(0));
        (s.direction = nativeSceneValue(270));
        (s.speed = nativeSceneValue(4));
        (s.friction = nativeSceneValue(0.4));
        (s.x = nativeSceneValue(((resolve(object("obj_gerson_item_throw")).x - 96) + 6)));
        (s.y = nativeSceneValue((resolve(object("obj_gerson_item_throw")).y - 89)));
        host.call(s, "snd_stop", "motor_swing_down");
        host.call(s, "snd_play_pitch", "motor_swing_down", 1.4);
    }
    if (sceneTruth(sceneEqual(s.timer, 15))) {
        (s.imageSpeed = nativeSceneValue(0));
    }
    if (sceneTruth(sceneEqual(s.timer, 22))) {
        {
            const caller240 = s;
            for (const target240 of targets(object("obj_gerson_item_throw"))) {
                const other = caller240;
                const s = target240;
                {
                    rt.destroy(s);
                }
            }
        }
        {
            const caller241 = s;
            for (const target241 of targets(object("obj_gerson_item_throw_particle"))) {
                const other = caller241;
                const s = target241;
                {
                    rt.destroy(s);
                }
            }
        }
        host.call(s, "snd_play", "snd_item");
    }
    if (sceneTruth(sceneEqual(s.timer, 24))) {
        (s.sprite = nativeSceneValue("spr_gerson_item_steal2"));
        (s.imageIndex = nativeSceneValue(1));
        (s.imageSpeed = nativeSceneValue(1));
        host.call(s, "snd_stop", "motor_swing_down");
        host.call(s, "snd_play_pitch", "motor_swing_down", 1.4);
    }
    if (sceneTruth(sceneEqual(s.timer, 25))) {
        (s.sprite = nativeSceneValue("spr_nothing"));
    }
    if (sceneTruth(sceneEqual(s.timer, 31))) {
        (s.x = nativeSceneValue(((resolve(object("obj_hammer_of_justice_enemy")).x + 20) + 24)));
        (s.y = nativeSceneValue((resolve(object("obj_hammer_of_justice_enemy")).y - 30)));
        (s.sprite = nativeSceneValue("spr_gerson_smear"));
        (s.imageIndex = nativeSceneValue(1));
        (s.imageSpeed = nativeSceneValue(0));
    }
    if (sceneTruth(sceneEqual(s.timer, 32))) {
        (s.x = nativeSceneValue(((resolve(object("obj_hammer_of_justice_enemy")).x - 10) + 24)));
        (s.y = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).y));
        host.call(s, "snd_stop", "motor_swing_down");
        host.call(s, "snd_play_pitch", "motor_swing_down", 1.4);
        (s.sprite = nativeSceneValue("spr_gerson_laugh"));
        (s.imageIndex = nativeSceneValue(0));
        (s.imageSpeed = nativeSceneValue(0.25));
        (s.direction = nativeSceneValue(180));
        (s.speed = nativeSceneValue(2));
        (s.friction = nativeSceneValue(0.2));
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(50))) && sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
        if (sceneTruth(sceneEqual(s.con, 0))) {
            {
                const caller242 = s;
                for (const target242 of targets(object("obj_hammer_of_justice_enemy"))) {
                    const other = caller242;
                    const s = target242;
                    {
                        (g.typer = nativeSceneValue(50));
                        msg(0, text("obj_gerson_item_steal_anim_slash_Step_0_gml_71_0"));
                        host.call(s, "scr_enemyblcon", (s.x - 10), g.monstery[s.myself], 10);
                    }
                }
            }
            (s.con = nativeSceneValue(1));
        }
        else if (sceneTruth(sceneEqual(s.con, 1))) {
            rt.destroy(s);
        }
    }
    {
        const caller243 = s;
        for (const target243 of targets(object("obj_spellphase"))) {
            const other = caller243;
            const s = target243;
            {
                (s.spelltimer = nativeSceneValue(290));
            }
        }
    }
}
