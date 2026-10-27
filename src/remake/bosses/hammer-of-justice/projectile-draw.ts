import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createProjectileContext, type HammerProjectileScripts } from './projectile-context';
import { projectileDraw1 } from './projectile-draw-1';
import { projectileDraw2 } from './projectile-draw-2';
export function projectileDraw(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef, scripts: HammerProjectileScripts) { const c = createProjectileContext(s, rt, object, scripts); if (projectileDraw1(c))
    return; if (projectileDraw2(c))
    return; }
