import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createProjectileContext, type HammerProjectileScripts } from './projectile-context';
/** obj_spearshot CleanUp_0. */
export function projectileCleanup(owner: GmInstance, runtime: GmRuntime, resources: (name: string) => GmObjectDef, integrations: HammerProjectileScripts) { const { s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle } = createProjectileContext(owner, runtime, resources, integrations); scripts.stop(s, "snd_organ_enemy_loop_temp"); }
