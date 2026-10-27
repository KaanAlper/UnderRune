import type { GmInstance, GmObjectDef, GmRuntime } from '../../gm/runtime';
import { createSceneContext, sceneEqual, type HammerSceneScripts } from './scene-context';
import { scenePrelude } from './scene-prelude';
import { sceneDialogue } from './scene-dialogue';
import { sceneEnemyTurn } from './scene-enemy-turn';
import { sceneAttacks } from './scene-attacks';
import { sceneEnding } from './scene-ending';
/** Original Step, statically compiled. Child actors and scripts must be supplied by the Chapter 4 host. */
export function stepHammer(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef, scripts: HammerSceneScripts) { const c = createSceneContext(s, rt, object, scripts); if (scenePrelude(c))
    return; if (sceneEqual(rt.globals.monster[s.myself], 1)) {
    if (sceneDialogue(c))
        return;
    if (sceneEnemyTurn(c))
        return;
} if (sceneAttacks(c))
    return; sceneEnding(c); }
