import type { HammerDrawContext } from './draw-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
/** Source Draw block 4; Draw advances these source animation timers. */
export function drawBlock4({ s, rt, g, v, scripts, object, resolve, targets, create, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerDrawContext) {
    (s.becomeflash = 0);
    rt.drawState.color = 0xffffff;
    rt.drawState.halign = 2;
    rt.drawState.halign = 0;
}
