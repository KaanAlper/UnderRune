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
    host.inherited(s, rt, "create");
    host.call(s, "scr_darksize");
    (s.bounce = nativeSceneValue(false));
    (s.timer = nativeSceneValue(0));
    (s.me_flash = nativeSceneValue((-4)));
    (s.grazepoints = nativeSceneValue(4));
}
export function Destroy0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((targets(s.me_flash).length > 0))) {
        rt.destroy(s);
    }
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
    if (sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((resolve(object("obj_growtangle")).y + 120))))) {
        (s.imageAlpha -= nativeSceneValue(0.3));
    }
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.8)))) {
        (s.active = nativeSceneValue(0));
    }
    if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.y), nativeSceneValue((host.call(s, "scr_get_box", 3) - 20)))) && sceneTruth(!sceneTruth(s.bounce))))) {
        (s.bounce = nativeSceneValue(true));
        (s.me_flash = nativeSceneValue(host.call(s, "scr_oflash")));
        {
            const caller215 = s;
            for (const target215 of targets(s.me_flash)) {
                const other = caller215;
                const s = target215;
                {
                    (s.target = nativeSceneValue(resolve(other).id));
                }
            }
        }
        host.call(s, "snd_play_pitch", "snd_metal_hit_reverb", 2);
        (s.y = nativeSceneValue((host.call(s, "scr_get_box", 3) - 20)));
        (s.vspeed = nativeSceneValue((-20)));
        (s.hspeed = nativeSceneValue(0));
        (s.gravityDirection = nativeSceneValue(270));
        (s.gravity = nativeSceneValue(1.2));
    }
    if (sceneTruth(s.bounce)) {
        if (sceneTruth(sceneEqual((s.timer % 2), 0))) {
            (s.imageAngle -= nativeSceneValue(40));
        }
    }
    else {
        (s.imageAngle += nativeSceneValue(40));
    }
    if (sceneTruth(!sceneTruth(s.bounce))) {
        {
            const caller216 = s;
            for (const target216 of targets(host.call(s, "scr_afterimagefast"))) {
                const other = caller216;
                const s = target216;
                {
                    (s.fadeSpeed *= nativeSceneValue(3));
                }
            }
        }
    }
}
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((targets(s.me_flash).length > 0))) {
        {
            const caller217 = s;
            for (const target217 of targets(s.me_flash)) {
                const other = caller217;
                const s = target217;
                {
                    (s.x = nativeSceneValue(resolve(other).x));
                    (s.y = nativeSceneValue(resolve(other).y));
                    (s.angle = nativeSceneValue(resolve(other).imageAngle));
                }
            }
        }
    }
}
