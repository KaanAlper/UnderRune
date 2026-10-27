import type { HammerDrawContext } from './draw-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
/** Source Draw block 3; Draw advances these source animation timers. */
export function drawBlock3({ s, rt, g, v, scripts, object, resolve, targets, create, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerDrawContext) {
    if (sceneTruth(sceneEqual(s.state, 11))) {
        (s.swingtimer++);
        if (sceneTruth(lt(nativeSceneValue(s.swingtimer), nativeSceneValue(12)))) {
            v.scale = (Math.sin(((s.swingtimer + 1) / 0.68)) * 0.2);
            drawSprite("spr_gerson_rude_orb1", 0, ((s.x - 48) + 10), ((s.y - 15) + 20), (0.6 + v.scale), (1 - (v.scale * 0.5)), 22, 0xffffff, s.imageAlpha);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 3))) {
            (s.x -= 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 4))) {
            (s.x += 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 5))) {
            (s.x -= 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 6))) {
            (s.x += 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 7))) {
            (s.x -= 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 8))) {
            (s.x += 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 9))) {
            (s.x -= 2);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 10))) {
            (s.x += 2);
        }
        rt.drawSelf(s);
        if (sceneTruth(sceneEqual(s.swingtimer, 11))) {
            (s.imageIndex = 10);
        }
        if (sceneTruth(sceneEqual(s.swingtimer, 12))) {
            (s.blast = create((s.x - 40), (s.y + 20), object("obj_gerson_rudebuster")));
            (resolve(s.blast).battlemode = 0);
            (resolve(s.blast).target = 1281);
            (resolve(s.blast).imageAlpha = 1);
            scripts.play(s, "snd_rudebuster_swing");
            (resolve(object("obj_hammer_of_justice_enemy")).rudebusterhitcount++);
            create(s.x, s.y, object("obj_shake"));
            (s.inst = create((s.x - 40), (s.y + 20), object("obj_animation")));
            (resolve(s.inst).sprite = "spr_susie_gerson_hitbback_fx_2");
            (resolve(s.inst).imageSpeed = 1);
            (resolve(s.inst).imageAngle = 0);
            (resolve(s.inst).imageXscale = 3);
            (resolve(s.inst).imageYscale = 3);
            (s.inst = create((s.x - 40), (s.y + 20), object("obj_animation")));
            (resolve(s.inst).sprite = "spr_susie_gerson_hitbback_fx_2");
            (resolve(s.inst).imageSpeed = 1);
            (resolve(s.inst).imageAngle = 30);
            (resolve(s.inst).imageXscale = 3);
            (resolve(s.inst).imageYscale = 3);
        }
        if (sceneTruth(ge(nativeSceneValue(s.swingtimer), nativeSceneValue(0)))) {
            if (sceneTruth(lt(nativeSceneValue(s.imageIndex), nativeSceneValue(13)))) {
                (s.imageIndex += 0.5);
                if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.imageIndex), nativeSceneValue(11))) && sceneTruth(lt(nativeSceneValue(s.swingtimer), nativeSceneValue(11)))))) {
                    (s.imageIndex = 4);
                }
            }
            if (sceneTruth(sceneEqual(s.swingtimer, 25))) {
                (s.state = 0);
                (s.swingtimer = 0);
                (s.imageSpeed = 0.16666666666666666);
                (s.sprite = "spr_gerson_idle");
            }
        }
    }
    if (sceneTruth(sceneEqual(s.state, 12))) {
        if (sceneTruth((targets(object("obj_growtangle")).length > 0))) {
            (s.depth = resolve(object("obj_growtangle")).depth);
        }
        (s.imageIndex += 0.23333333333333334);
        rt.drawSelf(s);
        (s.laughtimer++);
        if (sceneTruth(sceneEqual(s.laughtimer, 1))) {
            scripts.play(s, "snd_gerlaugh");
        }
        if (sceneTruth(sceneEqual(s.laughtimer, 62))) {
            (s.laughtimer = 0);
            (s.state = 0);
            if (sceneTruth(sceneEqual(s.attackpattern, 19))) {
                (g.turntimer = 2);
            }
        }
    }
    if (sceneTruth(sceneEqual(s.state, 13))) {
        rt.drawSelf(s);
        (s.dodgetimer++);
        if (sceneTruth(sceneEqual(s.dodgetimer, 2))) {
            (s.attack = create(...rtl(() => ((g.monsterx[g.chartarget[s.myself]] + rt.random.random(6)) - 20), () => (g.monstery[g.chartarget[s.myself]] + rt.random.random(6)), () => object("obj_basicattack"))));
            (resolve(s.attack).sprite = "spr_attack_mash2");
            (resolve(s.attack).imageSpeed = 0.5);
            (resolve(s.attack).maxindex = 4);
            (s.progress += 4);
            scripts.tensionHeal(s, 60);
            scripts.stop(s, s.motor_swing_down);
            (s.imageAlpha = 0);
            if (sceneTruth(lt(nativeSceneValue(g.justice_attacked_twice), nativeSceneValue(2)))) {
                (g.justice_attacked_twice++);
            }
            scripts.play(s, "snd_mercyadd");
            v.xx = (s.x + 88);
            v.yy = (s.y - 88);
            (s.star = create((v.xx - 20), (v.yy - 10), object("obj_gerson_progress_star")));
            (s.star = create(v.xx, v.yy, object("obj_gerson_progress_star")));
            (resolve(s.star).delay = 2);
            (s.star = create((v.xx + 18), (v.yy + 18), object("obj_gerson_progress_star")));
            (resolve(s.star).delay = 4);
            (s.star = create((v.xx + 36), (v.yy + 36), object("obj_gerson_progress_star")));
            (resolve(s.star).delay = 6);
        }
        if (sceneTruth(sceneEqual(s.dodgetimer, 3))) {
            (s.imageSpeed = 0.16666666666666666);
            (s.imageAlpha = 1);
            (s.sprite = "spr_gerson_dodge");
            (s.imageXscale = 2);
            (s.imageYscale = 2);
            (s.x -= 40);
            (s.y -= 30);
            (s.speed = 16);
            (s.friction = 4);
        }
        if (sceneTruth(sceneEqual(s.dodgetimer, 38))) {
            (s.dodgetimer = 0);
            (s.state = 0);
            (s.sprite = "spr_gerson_idle");
            (s.x -= 80);
        }
    }
    if (sceneTruth(sceneEqual(s.state, 14))) {
        (s.spintimer++);
        if (sceneTruth(lt(nativeSceneValue(s.spintimer), nativeSceneValue(10)))) {
            (s.spinindex += (2 / 3));
            drawSprite("spr_gerson_spin_smear", s.spinindex, (s.x + 55), (s.y + 68), 2, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
        }
        if (sceneTruth(sceneEqual(s.spintimer, 10))) {
            (s.spinindex = 0);
            scripts.play(s, "snd_mercyadd");
        }
        if (sceneTruth(ge(nativeSceneValue(s.spintimer), nativeSceneValue(10)))) {
            if (sceneTruth(lt(nativeSceneValue(s.spinindex), nativeSceneValue(11)))) {
                (s.spinindex += 0.5);
            }
            if (sceneTruth(ge(nativeSceneValue(s.spinindex), nativeSceneValue(11)))) {
                (s.spinindex += 0.25);
            }
            if (sceneTruth(gt(nativeSceneValue(s.spinindex), nativeSceneValue(13)))) {
                (s.spinindex = 13);
            }
            drawSprite("spr_gerson_spin", s.spinindex, (s.x + 48), (s.y + 72), 2, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
            if (sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.saverudebusterstarcount), nativeSceneValue(0))) && sceneTruth(gt(nativeSceneValue(s.spintimer), nativeSceneValue(20))))) && sceneTruth(sceneEqual((s.spintimer % 2), 0))))) {
                (s.saverudebusterstarcount--);
                (s.progress++);
                create(...rtl(() => ((s.x + 10) + rt.random.irandom(80)), () => ((s.y - 60) + rt.random.irandom(40)), () => object("obj_gerson_progress_star")));
            }
        }
        if (sceneTruth(sceneEqual(s.spintimer, 50))) {
            (s.spintimer = 0);
            (s.state = 0);
        }
    }
    if (sceneTruth(sceneEqual(s.becomeflash, 0))) {
        (s.flash = 0);
    }
}
