import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Other_10, source block 1. */
export function projectileHit1({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0)))) {
        rt.destroy(s);
        return true;
    }
    if (sceneTruth(s.redhammer)) {
        if (sceneTruth(lt(nativeSceneValue(s.x), nativeSceneValue((rt.view.x - 30))))) {
            rt.destroy(s);
        }
        if (sceneTruth(gt(nativeSceneValue(s.x), nativeSceneValue(((rt.view.x + rt.view.width) + 30))))) {
            rt.destroy(s);
        }
        if (sceneTruth(lt(nativeSceneValue(s.y), nativeSceneValue((rt.view.y - 30))))) {
            rt.destroy(s);
        }
        if (sceneTruth(gt(nativeSceneValue(s.y), nativeSceneValue(((rt.view.y + rt.view.height) + 30))))) {
            rt.destroy(s);
        }
    }
    if (sceneTruth(!sceneTruth((targets(object("obj_spearblocker")).length > 0)))) {
        return true;
    }
    scripts.debug?.(s, (String(nativeSceneValue(s.id)) + "is calling event user zero"));
    v.shielddir = (resolve(object("obj_spearblocker")).imageAngle + 180);
    if (sceneTruth(ge(nativeSceneValue(v.shielddir), nativeSceneValue(360)))) {
        (v.shielddir -= 360);
    }
    v.breakshield = false;
    return false;
}
