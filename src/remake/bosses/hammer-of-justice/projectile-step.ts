import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createProjectileContext, type HammerProjectileScripts } from './projectile-context';
import { projectileStep1 } from './projectile-step-1';
import { projectileStep2 } from './projectile-step-2';
import { projectileStep3 } from './projectile-step-3';
export function projectileStep(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef, scripts: HammerProjectileScripts) { const c = createProjectileContext(s, rt, object, scripts); if (projectileStep1(c))
    return; if (projectileStep2(c))
    return; if (projectileStep3(c))
    return; }
