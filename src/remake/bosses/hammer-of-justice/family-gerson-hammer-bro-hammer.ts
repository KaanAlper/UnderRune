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
    (s.gravityDirection = nativeSceneValue(270));
    (s.gravity = nativeSceneValue(2));
    host.call(s, "snd_play_pitch", "snd_fall", 2);
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    host.inherited(s, rt, "create");
    (s.con = nativeSceneValue(0));
    (s.timer = nativeSceneValue(0));
    (s.anim_index = nativeSceneValue(0));
    (s.fakehspeed = nativeSceneValue(0));
    (s.fakevspeed = nativeSceneValue(0));
    (s.fakegravity = nativeSceneValue(0));
    (s.gigahammer = nativeSceneValue(false));
    (s.drop = nativeSceneValue(false));
    (s.true_drop = nativeSceneValue(false));
}
export function Other15(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    v.a = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
        (v.a = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.a)));
    if (sceneTruth(sceneEqual(s.active, 1))) {
        if (sceneTruth(!sceneEqual(s.target, 3))) {
            host.call(s, "scr_damage");
        }
        if (sceneTruth(sceneEqual(s.target, 3))) {
            host.call(s, "scr_damage_all");
        }
        if (sceneTruth(sceneEqual(s.destroyonhit, 1))) {
            rt.destroy(s);
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(!sceneTruth(s.gigahammer))) {
        if (sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((resolve(object("obj_growtangle")).y + 120))))) {
            (s.imageAlpha -= nativeSceneValue(0.3));
        }
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.8)))) {
            (s.active = nativeSceneValue(0));
        }
    }
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
        rt.destroy(s);
    }
    (s.anim_index++);
    if (sceneTruth(s.gigahammer)) {
        if (sceneTruth(lt(nativeSceneValue(s.fakevspeed), nativeSceneValue(0)))) {
            (s.imageAngle += nativeSceneValue(60));
        }
        else {
            (s.imageAngle = nativeSceneValue(202.5));
        }
    }
    else if (sceneTruth(sceneEqual(s.anim_index, 3))) {
        (s.imageAngle += nativeSceneValue(40));
        (s.anim_index = nativeSceneValue(0));
    }
    if (sceneTruth(!sceneTruth((sceneTruth(s.gigahammer) && sceneTruth(ge(nativeSceneValue(s.fakevspeed), nativeSceneValue(0))))))) {
        (s.x += nativeSceneValue(s.fakehspeed));
        (s.y += nativeSceneValue(s.fakevspeed));
        (s.fakevspeed += nativeSceneValue(s.fakegravity));
    }
    if (sceneTruth((sceneTruth((sceneTruth(s.gigahammer) && sceneTruth(ge(nativeSceneValue(s.fakevspeed), nativeSceneValue(0))))) && sceneTruth(!sceneTruth(s.drop))))) {
        (s.hspeed = nativeSceneValue(0));
        (s.vspeed = nativeSceneValue(0));
        (s.drop = nativeSceneValue(true));
        (s.fakevspeed = nativeSceneValue(0));
        (s.fakehspeed = nativeSceneValue(0));
        (s.fakegravity = nativeSceneValue(0));
        (s.gravity = nativeSceneValue(0));
        (sourceArray(s, "alarm")[0] = nativeSceneValue(12));
    }
    if (sceneTruth(gt(nativeSceneValue(s.fakevspeed), nativeSceneValue(11)))) {
        (s.fakevspeed = nativeSceneValue(11));
    }
    if (sceneTruth(!sceneTruth(s.drop))) {
        if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((rt.view.y + 20))))) {
            (s.x += nativeSceneValue(1));
            (s.y += nativeSceneValue(2));
        }
    }
}
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(s.gigahammer)) {
        if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((resolve(object("obj_growtangle")).y + 20)))) && sceneTruth(!sceneTruth(s.true_drop))))) {
            {
                const caller188 = s;
                for (const target188 of targets(object("obj_growtangle"))) {
                    const other = caller188;
                    const s = target188;
                    {
                        (s.y += nativeSceneValue((resolve(other).y - resolve(other).yprevious)));
                        (s.y = nativeSceneValue(Math.min(...rtl(() => s.y, () => (([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!) + 220)))));
                        {
                            const caller189 = s;
                            for (const target189 of targets(object("obj_heart"))) {
                                const other = caller189;
                                const s = target189;
                                {
                                    (s.y += nativeSceneValue((resolve(object("obj_growtangle")).y - resolve(object("obj_growtangle")).yprevious)));
                                }
                            }
                        }
                    }
                }
            }
        }
        if (sceneTruth((sceneTruth(!sceneTruth(s.true_drop)) && sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!) + 220))))))) {
            (s.true_drop = nativeSceneValue(true));
            (s.vspeed = nativeSceneValue((-16)));
            host.call(s, "snd_play", "snd_impact");
            host.call(s, "snd_play_pitch", "snd_metal_hit_reverb", 1);
            host.call(s, "scr_shakescreen");
        }
        if (sceneTruth((sceneTruth(s.true_drop) && sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!) + 720))))))) {
            host.call(s, "scr_shakescreen");
            host.call(s, "snd_play_pitch", "snd_glassbreak", 0.5);
            host.call(s, "snd_play_pitch", "snd_explosion_firework", 0.75);
            rt.destroy(s);
        }
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.8)))) {
            (s.active = nativeSceneValue(0));
        }
    }
}
