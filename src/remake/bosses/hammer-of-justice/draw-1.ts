import type { HammerDrawContext } from './draw-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
/** Source Draw block 1; Draw advances these source animation timers. */
export function drawBlock1({ s, rt, g, v, scripts, object, resolve, targets, create, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerDrawContext) {
    if (sceneTruth((sceneTruth(sceneEqual(s.state, 0)) && sceneTruth(lt(nativeSceneValue(s.endcon), nativeSceneValue(5)))))) {
        (s.movesiner += (1 / 3));
    }
    if (sceneTruth(!sceneEqual(s.state, 13))) {
        (s.x = (s.xstart + (Math.sin((s.movesiner / 5)) * 10)));
    }
    if (sceneTruth(sceneEqual(s.rudebusterflashcon, 1))) {
        (s.rudebusterflashtimer++);
        if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.rudebusterflashtimer), nativeSceneValue(4))) && sceneTruth(lt(nativeSceneValue(Math.sin((s.rudebusterflashtimer / 3))), nativeSceneValue(0)))))) {
            (s.rudebusterflashtimer = 0);
            (s.rudebusterflashcon = 0);
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.state, 0)) || sceneTruth(sceneEqual(s.state, 3))))) {
        v.hair_x = 0;
        v.hair_y = 0;
        v._index = (s.siner % 14);
        if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(1)))) {
            (v.hair_x = 18);
            (v.hair_y = 5);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(2)))) {
            (v.hair_x = 18);
            (v.hair_y = 4);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(3)))) {
            (v.hair_x = 18);
            (v.hair_y = 3);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(4)))) {
            (v.hair_x = 18);
            (v.hair_y = 4);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(5)))) {
            (v.hair_x = 18);
            (v.hair_y = 5);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(6)))) {
            (v.hair_x = 18);
            (v.hair_y = 6);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(7)))) {
            (v.hair_x = 18);
            (v.hair_y = 7);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(8)))) {
            (v.hair_x = 18);
            (v.hair_y = 5);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(9)))) {
            (v.hair_x = 18);
            (v.hair_y = 4);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(10)))) {
            (v.hair_x = 18);
            (v.hair_y = 3);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(11)))) {
            (v.hair_x = 18);
            (v.hair_y = 3);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(12)))) {
            (v.hair_x = 18);
            (v.hair_y = 4);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(13)))) {
            (v.hair_x = 18);
            (v.hair_y = 6);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(14)))) {
            (v.hair_x = 18);
            (v.hair_y = 7);
        }
        else if (sceneTruth(lt(nativeSceneValue(v._index), nativeSceneValue(15)))) {
            (v.hair_x = 18);
            (v.hair_y = 5);
        }
        drawSprite("spr_gerson_hair", s.hairindex, (s.x + ((0 + v.hair_x) * 2)), (s.y + ((0 + v.hair_y) * 2)), 2, 2, s.imageAngle, s.imageBlend, s.imageAlpha);
        if (sceneTruth(sceneEqual(s.flash, 1))) {
            flashSprite(...rtl(() => "spr_gerson_hair", () => s.hairindex, () => (s.x + ((0 + v.hair_x) * 2)), () => (s.y + ((0 + v.hair_y) * 2)), () => 2, () => 2, () => s.imageAngle, () => s.imageBlend, () => (((-Math.cos((s.fsiner / 5))) * 0.4) + 0.6)));
        }
        if (sceneTruth(sceneEqual(s.state, 0))) {
            (s.hairindex += 0.2);
        }
        else {
            (s.hairindex += 0.1);
        }
        fog(true, 0xffffff, 0, 1);
        drawSprite(...rtl(() => "spr_gerson_hair", () => s.hairindex, () => (s.x + ((0 + v.hair_x) * 2)), () => (s.y + ((0 + v.hair_y) * 2)), () => 2, () => 2, () => s.imageAngle, () => s.imageBlend, () => Math.sin((s.rudebusterflashtimer / 3))));
        fog(false, 0, 0, 0);
    }
    drawHurt(s);
}
