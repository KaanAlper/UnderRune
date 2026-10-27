import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createProjectileContext, type HammerProjectileScripts } from './projectile-context';
/** obj_spearshot Other_11. */
export function projectileBreak(owner: GmInstance, runtime: GmRuntime, resources: (name: string) => GmObjectDef, integrations: HammerProjectileScripts) {
    const { s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle } = createProjectileContext(owner, runtime, resources, integrations);
    {
        const caller0 = s;
        for (const target0 of targets(object("obj_heart"))) {
            const other = caller0;
            const s = target0;
            {
                (s.color = 0);
                (s.sprite = "spr_dodgeheart");
            }
        }
    }
    {
        const caller1 = s;
        for (const target1 of targets(object("obj_spearblocker"))) {
            const other = caller1;
            const s = target1;
            {
                (s.vanish = 1);
            }
        }
    }
    {
        const caller2 = s;
        for (const target2 of targets(object("obj_spearshot"))) {
            const other = caller2;
            const s = target2;
            {
                rt.destroy(s);
            }
        }
    }
}
