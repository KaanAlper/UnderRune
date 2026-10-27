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
    (s.master = nativeSceneValue((-1)));
    (s.origx = nativeSceneValue(0));
    (s.origy = nativeSceneValue(0));
    (s.goalx = nativeSceneValue(0));
    (s.goaly = nativeSceneValue(0));
    (s.zheight = nativeSceneValue(0));
    (s.time = nativeSceneValue(1));
    (s.timer = nativeSceneValue(1));
    s.jump_start = () => {
        const v: any = Object.create(null);
        {
            (s._hspeed = nativeSceneValue(((s.goalx - s.origx) / s.time)));
            (s._vspeed = nativeSceneValue(((s.goaly - s.origy) / s.time)));
        }
    };
    {
    }
    s.tick = () => {
        const v: any = Object.create(null);
        {
            if (sceneTruth(!sceneTruth((targets(s.master).length > 0)))) {
                rt.destroy(s);
            }
            {
                const caller245 = s;
                for (const target245 of targets(s.master)) {
                    const other = caller245;
                    const s = target245;
                    {
                        (s.x += nativeSceneValue(resolve(other)._hspeed));
                        (s.y += nativeSceneValue(resolve(other)._vspeed));
                        (s.z = nativeSceneValue((Math.sin(((3.141592653589793 / resolve(other).time) * resolve(other).timer)) * resolve(other).zheight)));
                    }
                }
            }
            (s.timer++);
            if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(s.time)))) {
                rt.destroy(s);
            }
        }
    };
    {
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; host.call(s, "tick"); }
