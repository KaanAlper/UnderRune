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
    (s.timer = nativeSceneValue(0));
    (s.place = nativeSceneValue(1));
    (s.speed = nativeSceneValue(20));
    (s.imageXscale = nativeSceneValue(1));
    (s.imageYscale = nativeSceneValue(1));
    (s.pos = nativeSceneValue(0));
    (s.type = nativeSceneValue(0));
    (s.length = nativeSceneValue(0));
    (s.fakespeed = nativeSceneValue(8));
    (s.dirspeed = nativeSceneValue(1));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(sceneEqual(s.type, 0))) {
        v.statetimer = 12;
        if (sceneTruth(le(nativeSceneValue(s.timer), nativeSceneValue(v.statetimer)))) {
            (s.fakespeed = nativeSceneValue(lerp(16, 4, (s.timer / v.statetimer))));
            (s.dirspeed = nativeSceneValue(lerp(2.25, 1.5, (s.timer / v.statetimer))));
        }
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(v.statetimer)))) {
            (s.fakespeed = nativeSceneValue(lerp(4, 16, ((s.timer - v.statetimer) / v.statetimer))));
            (s.dirspeed = nativeSceneValue(lerp(1.5, 2.25, ((s.timer - v.statetimer) / v.statetimer))));
        }
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(24)))) {
            (s.imageAlpha -= nativeSceneValue(0.1));
        }
    }
    if (sceneTruth(sceneEqual(s.type, 1))) {
        v.statetimer = 12;
        if (sceneTruth(le(nativeSceneValue(s.timer), nativeSceneValue(v.statetimer)))) {
            (s.fakespeed = nativeSceneValue(lerp(14, 3, (s.timer / v.statetimer))));
            (s.dirspeed = nativeSceneValue(lerp(3, 1.25, (s.timer / v.statetimer))));
        }
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(v.statetimer)))) {
            (s.fakespeed = nativeSceneValue(lerp(3, 9, ((s.timer - v.statetimer) / v.statetimer))));
            (s.dirspeed = nativeSceneValue(lerp(1.25, 1.75, ((s.timer - v.statetimer) / v.statetimer))));
        }
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(40)))) {
            (s.imageAlpha -= nativeSceneValue(0.1));
        }
    }
    (s.x = nativeSceneValue((s.xstart + lengthdirX(s.length, s.place))));
    (s.y = nativeSceneValue((s.ystart + lengthdirY(s.length, s.place))));
    (s.length += nativeSceneValue(s.fakespeed));
    (s.place += nativeSceneValue(s.dirspeed));
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        rt.destroy(s);
    }
    if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
        rt.destroy(s);
    }
    if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((([rt.view.x, rt.view.y, rt.view.width, rt.view.height][0]!) - 80))))) {
        rt.destroy(s);
    }
    if (sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue((([rt.view.x, rt.view.y, rt.view.width, rt.view.height][0]!) + 760))))) {
        rt.destroy(s);
    }
    if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!) - 80))))) {
        rt.destroy(s);
    }
    if (sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue((([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!) + 580))))) {
        rt.destroy(s);
    }
}
