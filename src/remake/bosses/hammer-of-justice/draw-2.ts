import type { HammerDrawContext } from './draw-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
/** Source Draw block 2; Draw advances these source animation timers. */
export function drawBlock2({ s, rt, g, v, scripts, object, resolve, targets, create, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerDrawContext) {
    if (sceneTruth(gt(nativeSceneValue(s.endcon), nativeSceneValue(4)))) {
        (s.siner += (1 / 3));
        if (sceneTruth(gt(nativeSceneValue(s.siner), nativeSceneValue(3)))) {
            (s.siner = 3);
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.endcon, 5)) && sceneTruth(ge(nativeSceneValue(s.endtimer), nativeSceneValue(25)))))) {
            if (sceneTruth(sceneEqual(s.nohairsprite, true))) {
                (s.endshaketimer++);
                if (sceneTruth(sceneEqual(s.endshaketimer, 1))) {
                    (s.x += 7);
                }
                if (sceneTruth(sceneEqual(s.endshaketimer, 2))) {
                    (s.x -= 6);
                }
                if (sceneTruth(sceneEqual(s.endshaketimer, 3))) {
                    (s.x += 5);
                }
                if (sceneTruth(sceneEqual(s.endshaketimer, 4))) {
                    (s.x -= 4);
                }
                if (sceneTruth(sceneEqual(s.endshaketimer, 5))) {
                    (s.x += 3);
                }
                if (sceneTruth(sceneEqual(s.endshaketimer, 6))) {
                    (s.x -= 2);
                }
                if (sceneTruth(sceneEqual(s.endshaketimer, 7))) {
                    (s.x += 1);
                }
                drawBody(s, "spr_gerson_headtilt_nohair", s.siner, s.x, s.y);
            }
            else {
                drawBody(s, "spr_gerson_headtilt", s.siner, s.x, s.y);
            }
        }
        else {
            drawBody(s, s.thissprite, s.siner, s.x, s.y);
        }
    }
    else if (sceneTruth(sceneEqual(s.state, 0))) {
        (s.fsiner += 1);
        (s.siner += (1 / 3));
        if (sceneTruth(gt(nativeSceneValue(s.siner), nativeSceneValue(14)))) {
            (s.siner -= 14);
        }
        (s.thissprite = s.idlesprite);
        if (sceneTruth(ge(nativeSceneValue(g.mercymod[s.myself]), nativeSceneValue(g.mercymax[s.myself])))) {
            (s.thissprite = s.sparedsprite);
        }
        drawBody(s, s.thissprite, s.siner, s.x, s.y);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.state, 0)) || sceneTruth(sceneEqual(s.state, 3))))) {
        fog(true, 0xffffff, 0, 1);
        drawSprite(...rtl(() => s.hurtsprite, () => 0, () => ((s.x + s.shakex) + s.hurtspriteoffx), () => (s.y + s.hurtspriteoffy), () => s.imageXscale, () => s.imageYscale, () => s.imageAngle, () => s.imageBlend, () => Math.sin((s.rudebusterflashtimer / 3))));
        fog(false, 0, 0, 0);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.goldcon, 1)) && sceneTruth(ge(nativeSceneValue(g.turntimer), nativeSceneValue(1)))))) {
        fog(true, 0xffff, 0, 1);
        if (sceneTruth(lt(nativeSceneValue(s.goldalpha), nativeSceneValue(0.3)))) {
            (s.goldalpha += 0.01);
        }
        (s.imageAlpha = s.goldalpha);
        drawIdle(s, 0.16666666666666666);
        (s.imageAlpha = 1);
        fog(false, 0, 0, 0);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.goldcon, 1)) && sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))))) {
        fog(true, 0xffff, 0, 1);
        if (sceneTruth(gt(nativeSceneValue(s.goldalpha), nativeSceneValue(0)))) {
            (s.goldalpha -= 0.01);
        }
        (s.imageAlpha = s.goldalpha);
        drawIdle(s, 0.16666666666666666);
        (s.imageAlpha = 1);
        fog(false, 0, 0, 0);
    }
    if (sceneTruth(sceneEqual(s.state, 10))) {
        (s.imageSpeed = 0);
        (s.imageIndex += 0.5);
        rt.drawSelf(s);
        if (sceneTruth(ge(nativeSceneValue(s.imageIndex), nativeSceneValue(3)))) {
            (s.state = 11);
            (s.swingtimer = 0);
            scripts.shakeObject(s);
            create(s.x, s.y, object("obj_shake"));
            {
                const caller0 = s;
                for (const target0 of targets(object("obj_rudebuster_bolt"))) {
                    const other = caller0;
                    const s = target0;
                    {
                        rt.destroy(s);
                    }
                }
            }
            scripts.play(s, "snd_criticalswing");
            {
                const caller1 = s;
                for (const target1 of targets(object("obj_afterimage"))) {
                    const other = caller1;
                    const s = target1;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (s.inst = create(((s.x - 70) + 10), ((s.y - 15) + 20), object("obj_animation")));
            (resolve(s.inst).sprite = "spr_susie_gerson_hitbback_fx_2");
            (resolve(s.inst).imageSpeed = 1);
            (resolve(s.inst).imageAngle = 40);
            (resolve(s.inst).imageXscale = 3);
            (resolve(s.inst).imageYscale = 3);
            (s.inst = create(((s.x - 46) + 10), ((s.y - 12) + 20), object("obj_animation")));
            (resolve(s.inst).sprite = "spr_gerson_hit_fx3");
            (resolve(s.inst).imageIndex = 1);
            (resolve(s.inst).imageSpeed = 0.5);
            (resolve(s.inst).imageAngle = 14);
            (resolve(s.inst).imageXscale = 2);
            (resolve(s.inst).imageYscale = 2);
        }
    }
}
