import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createProjectileContext, type HammerProjectileScripts } from './projectile-context';
import { projectileHit1 } from './projectile-hit-1';
import { projectileHit2 } from './projectile-hit-2';
import { projectileHit3 } from './projectile-hit-3';
import { projectileHit4 } from './projectile-hit-4';
export function projectileHit(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef, scripts: HammerProjectileScripts) { const c = createProjectileContext(s, rt, object, scripts); if (projectileHit1(c))
    return; if (projectileHit2(c))
    return; if (projectileHit3(c))
    return; if (projectileHit4(c))
    return; }
