/** Source Step block, preserving event order and event-local variables. */
import type { HammerSceneContext } from './scene-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
export function scenePrelude({ s, rt, g, v, scripts, object, resolve, targets, create, msg, text }: HammerSceneContext): boolean {
    if (sceneTruth(gt(nativeSceneValue(g.inv), nativeSceneValue(19)))) {
        (g.inv = 19);
    }
    if (sceneTruth(gt(nativeSceneValue(s.rudebusterdelay), nativeSceneValue(0)))) {
        (s.rudebusterdelay--);
    }
    (g.mercymod[s.myself] = 0);
    {
        const caller0 = s;
        for (const target0 of targets(object("obj_battlecontroller"))) {
            const other = caller0;
            const s = target0;
            {
                (s.hidestar = 1);
            }
        }
    }
    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
        (g.sp = 5);
        (resolve(object("obj_heart")).wspeed = 5);
    }
    for ((s.i = 0); lt(nativeSceneValue(s.i), nativeSceneValue(3)); (s.i += 1)) {
        (g.automiss[s.i] = 1);
    }
    if (sceneTruth(sceneEqual(s.init, 0))) {
        (s.init = 1);
        (g.canactsus[s.myself][0] = 0);
        (g.actnamesus[s.myself][0] = "");
        (g.actsimulsus[s.myself][0] = 0);
        (g.actactorsus[s.myself][0] = 0);
        (g.actcostsus[s.myself][0] = 0);
        (g.battlespell[1][0] = 0);
        (g.battlespell[1][0] = (-1));
        (g.battleactcount[1] = 0);
        (g.battlespellname[1][0] = "");
        (g.battlespelldesc[1][0] = "");
        scripts.spellMenu(s);
    }
    return false;
}
