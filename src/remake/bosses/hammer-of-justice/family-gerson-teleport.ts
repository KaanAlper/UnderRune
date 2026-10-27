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
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
    rt.destroy(s);
    if (sceneTruth(sceneEqual(s.type, 1))) {
        if (sceneTruth(lt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
            (s.gers = nativeSceneValue(create((s.x - 70), (s.y - 23), object("obj_gerson_box_hit"))));
            if (sceneTruth(sceneEqual(s.first, 1))) {
                (resolve(s.gers).timer = nativeSceneValue(10));
            }
        }
        else {
            (s.gers = nativeSceneValue(create((s.x + 70), (s.y - 23), object("obj_gerson_box_hit"))));
            (resolve(s.gers).imageXscale = nativeSceneValue((-2)));
            if (sceneTruth(sceneEqual(s.first, 1))) {
                (resolve(s.gers).timer = nativeSceneValue(10));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.type, 2))) {
        if (sceneTruth(sceneEqual(s.swingdowntype, (-4)))) {
            (s.gers = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(110, (s.imageAngle + 40))), () => (s.y + lengthdirY(110, (s.imageAngle + 40))), () => object("obj_gerson_swing_down")))));
            (resolve(s.gers).swingdowntype = nativeSceneValue((-1)));
            (resolve(s.gers).imageAngle = nativeSceneValue((s.imageAngle - 90)));
            (resolve(s.gers).direction = nativeSceneValue((s.imageAngle + 180)));
            if (sceneTruth(!sceneEqual(s.special, 0))) {
                (resolve(s.gers).special = nativeSceneValue(s.special));
            }
            {
                const caller6 = s;
                for (const target6 of targets(s.gers)) {
                    const other = caller6;
                    const s = target6;
                    {
                        rt.userEvent(s, 0);
                    }
                }
            }
        }
        else if (sceneTruth((sceneTruth(sceneEqual(s.swingdowntype, (-3))) || sceneTruth(sceneEqual(s.swingdowntype, (-5)))))) {
            (s.gers = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(110, (s.imageAngle + 40))), () => (s.y + lengthdirY(110, (s.imageAngle + 40))), () => object("obj_gerson_swing_down")))));
            (resolve(s.gers).swingdowntype = nativeSceneValue(s.swingdowntype));
            (resolve(s.gers).imageAngle = nativeSceneValue((s.imageAngle - 90)));
            (resolve(s.gers).direction = nativeSceneValue((s.imageAngle + 180)));
            {
                const caller7 = s;
                for (const target7 of targets(s.gers)) {
                    const other = caller7;
                    const s = target7;
                    {
                        rt.userEvent(s, 0);
                    }
                }
            }
        }
        else if (sceneTruth(ge(nativeSceneValue(s.swingdowntype), nativeSceneValue(10)))) {
            (s.gers = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(110, (s.imageAngle + 40))), () => (s.y + lengthdirY(110, (s.imageAngle + 40))), () => object("obj_gerson_swing_down")))));
            (resolve(s.gers).swingdowntype = nativeSceneValue(s.swingdowntype));
            (resolve(s.gers).imageAngle = nativeSceneValue((s.imageAngle - 90)));
            (resolve(s.gers).direction = nativeSceneValue((s.imageAngle + 180)));
            {
                const caller8 = s;
                for (const target8 of targets(s.gers)) {
                    const other = caller8;
                    const s = target8;
                    {
                        rt.userEvent(s, 0);
                    }
                }
            }
        }
        else {
            (s.gers = nativeSceneValue(create((s.x - 62), (s.y - 112), object("obj_gerson_swing_down"))));
            if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                (resolve(s.gers).imageXscale = nativeSceneValue((-2)));
                (resolve(s.gers).x += nativeSceneValue(124));
            }
            (resolve(s.gers).swingdowntype = nativeSceneValue(s.swingdowntype));
            {
                const caller9 = s;
                for (const target9 of targets(s.gers)) {
                    const other = caller9;
                    const s = target9;
                    {
                        rt.userEvent(s, 0);
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.type, 3))) {
        if (sceneTruth(lt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
            (s.gers = nativeSceneValue(create((s.x - 130), (s.y - 60), object("obj_gerson_bell_hit"))));
            (resolve(s.gers).timer = nativeSceneValue((-15)));
        }
        else {
            (s.gers = nativeSceneValue(create(((s.x + 130) + 42), (s.y - 60), object("obj_gerson_bell_hit"))));
            (resolve(s.gers).imageXscale = nativeSceneValue((-2)));
            (resolve(s.gers).timer = nativeSceneValue(6));
        }
    }
    if (sceneTruth(sceneEqual(s.type, 4))) {
        (s.gers = nativeSceneValue(create((s.x + 60), (s.y - 40), object("obj_gerson_hits_box"))));
    }
    if (sceneTruth(sceneEqual(s.type, 5))) {
        (s.gers = nativeSceneValue(create((s.x - 60), (s.y - 40), object("obj_gerson_hits_box"))));
        (resolve(s.gers).imageXscale = nativeSceneValue(2));
    }
    if (sceneTruth(sceneEqual(s.type, 6))) {
        create(s.x, (s.y - 34), object("obj_gerson_speen"));
    }
    if (sceneTruth(sceneEqual(s.type, 10))) {
        {
            const caller10 = s;
            for (const target10 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller10;
                const s = target10;
                {
                    (s.visible = nativeSceneValue(true));
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
    (s.sprite = nativeSceneValue("spr_gerson_teleport"));
    (sourceArray(s, "alarm")[0] = nativeSceneValue(4));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.depth = nativeSceneValue((-999999)));
    host.call(s, "snd_stop", "motor_swing_down");
    host.call(s, "snd_play_pitch", "motor_swing_down", 1.4);
    (s.type = nativeSceneValue(0));
    (s.first = nativeSceneValue(0));
    (s.dir = nativeSceneValue(1));
    (s.swingdowntype = nativeSceneValue(0));
    (s.special = nativeSceneValue(0));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; return; }
