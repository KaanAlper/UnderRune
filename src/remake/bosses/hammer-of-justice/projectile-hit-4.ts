import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Other_10, source block 4. */
export function projectileHit4({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
        (v.heartcollisionlen += 14);
    }
    v.hitheart = false;
    if (sceneTruth(lt(nativeSceneValue(s.len), nativeSceneValue(v.heartcollisionlen)))) {
        v.a = ((g.hp[2] - 30) / 250);
        if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
            (v.a = 0);
        }
        (s.damage = lerp(12, 90, v.a));
        if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
            (s.target = 4);
            (s.damage = 67);
        }
        if (sceneTruth(s.redhammer)) {
            (v.breakshield = true);
            (v.hitheart = true);
            (g.inv = (-1));
            scripts.damage(s);
        }
        else {
            scripts.damage(s);
            if (sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0)))) {
                (s.x3 = 0);
                (s.hp = 0);
                (s.bouncespearcon = 1);
                (s.savedir = s.direction);
                (s.sprite = "spr_bounce_shell_squish");
                if (sceneTruth(sceneEqual(s.bouncespear, 1))) {
                    (s.sprite = "spr_bounce_shell_squish2");
                }
                (s.imageAngle = s.direction);
                (s.imageIndex = 1);
                (s.len = (v.parryradius - 5));
                if (sceneTruth(sceneEqual(s.bouncespear, 1))) {
                    (s.len = (v.parryradius - 40));
                }
                if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
                    (s.len = (v.parryradius - 40));
                }
                if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
                    (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
                }
                if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
                    (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
                }
                (s.bouncespeartimer = 0);
                (s.shakeduration = 5);
                (s.hitstopbounce = 1);
                (s.hurtsquish = true);
            }
            if (sceneTruth((sceneTruth((sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0))) && sceneTruth(lt(nativeSceneValue(s.hp), nativeSceneValue(1))))) || sceneTruth(sceneEqual(s.bouncespear, 0))))) {
                if (sceneTruth(sceneEqual(v.breakshield, 1))) {
                    rt.userEvent(s, 1);
                }
                rt.destroy(s);
            }
        }
    }
    if (sceneTruth(sceneEqual(v.breakshield, true))) {
        {
            const caller2 = s;
            for (const target2 of targets(object("obj_heart"))) {
                const other = caller2;
                const s = target2;
                {
                    (s.anim = create((s.x + 10), (s.y + 10), object("obj_animation")));
                    (resolve(s.anim).sprite = "spr_finisher_explosion");
                    (resolve(s.anim).imageSpeed = 0.5);
                    (resolve(s.anim).imageIndex = 0);
                    (resolve(s.anim).imageXscale = 1);
                    (resolve(s.anim).imageYscale = 1);
                    (s.color = 0);
                    (s.sprite = "spr_heart");
                    (s.inst = create(resolve(object("obj_heart")).x, resolve(object("obj_heart")).y, object("obj_gerson_fakeheart")));
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 0))) {
                        (resolve(s.inst).directionhit = 0);
                    }
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 90))) {
                        (resolve(s.inst).directionhit = 90);
                    }
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 180))) {
                        (resolve(s.inst).directionhit = 180);
                    }
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 270))) {
                        (resolve(s.inst).directionhit = 270);
                    }
                    (resolve(s.inst).speed = 12);
                    (resolve(s.inst).friction = 0.6);
                    if (sceneTruth(sceneEqual(v.hitheart, true))) {
                        {
                            const caller3 = s;
                            for (const target3 of targets(object("obj_event_manager"))) {
                                const other = caller3;
                                const s = target3;
                                {
                                    scripts.triggerEvent(s, 1);
                                }
                            }
                        }
                    }
                }
            }
        }
        {
            const caller4 = s;
            for (const target4 of targets(object("obj_spearblocker"))) {
                const other = caller4;
                const s = target4;
                {
                    scripts.play(s, "snd_queen_punched_lower_heavy");
                    (s.piece1 = create(...rtl(() => (s.x + lengthdirX(32, (s.imageAngle - 35))), () => (s.y + lengthdirY(32, (s.imageAngle - 35))), () => object("obj_spearblocker_piece"))));
                    (resolve(s.piece1).imageAngle = s.imageAngle);
                    (resolve(s.piece1).imageIndex = 1);
                    (s.piece2 = create(...rtl(() => (s.x + lengthdirX(32, (s.imageAngle + 35))), () => (s.y + lengthdirY(32, (s.imageAngle + 35))), () => object("obj_spearblocker_piece"))));
                    (resolve(s.piece2).imageAngle = s.imageAngle);
                    (resolve(s.piece2).imageIndex = 0);
                    (s.piece3 = create(...rtl(() => (s.x + lengthdirX(30, 45)), () => (s.y + lengthdirY(30, 45)), () => object("obj_spearblocker_piece"))));
                    (resolve(s.piece3).sprite = "spr_green_circle_piece");
                    (resolve(s.piece3).imageAngle = 0);
                    (s.piece4 = create(...rtl(() => (s.x + lengthdirX(30, 135)), () => (s.y + lengthdirY(30, 135)), () => object("obj_spearblocker_piece"))));
                    (resolve(s.piece4).sprite = "spr_green_circle_piece");
                    (resolve(s.piece4).imageAngle = 90);
                    (s.piece5 = create(...rtl(() => (s.x + lengthdirX(30, 225)), () => (s.y + lengthdirY(30, 225)), () => object("obj_spearblocker_piece"))));
                    (resolve(s.piece5).sprite = "spr_green_circle_piece");
                    (resolve(s.piece5).imageAngle = 180);
                    (s.piece6 = create(...rtl(() => (s.x + lengthdirX(30, 315)), () => (s.y + lengthdirY(30, 315)), () => object("obj_spearblocker_piece"))));
                    (resolve(s.piece6).sprite = "spr_green_circle_piece");
                    (resolve(s.piece6).imageAngle = 270);
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 0))) {
                        (resolve(s.piece1).vspeed = ((-9) - rt.random.random(6)));
                        (resolve(s.piece1).hspeed = (4 + rt.random.random(2)));
                        (resolve(s.piece2).vspeed = (5 + rt.random.random(6)));
                        (resolve(s.piece2).hspeed = (4 + rt.random.random(2)));
                        (resolve(s.piece3).vspeed = ((-9) - rt.random.random(6)));
                        (resolve(s.piece3).hspeed = (4 + rt.random.random(2)));
                        (resolve(s.piece4).vspeed = ((-9) - rt.random.random(6)));
                        (resolve(s.piece4).hspeed = (4 + rt.random.random(2)));
                        (resolve(s.piece5).vspeed = (5 + rt.random.random(6)));
                        (resolve(s.piece5).hspeed = (4 + rt.random.random(2)));
                        (resolve(s.piece6).vspeed = (5 + rt.random.random(6)));
                        (resolve(s.piece6).hspeed = (4 + rt.random.random(2)));
                    }
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 180))) {
                        (resolve(s.piece1).vspeed = ((-9) - rt.random.random(6)));
                        (resolve(s.piece1).hspeed = ((-4) - rt.random.random(2)));
                        (resolve(s.piece2).vspeed = (5 + rt.random.random(6)));
                        (resolve(s.piece2).hspeed = ((-4) - rt.random.random(2)));
                        (resolve(s.piece3).vspeed = ((-9) - rt.random.random(6)));
                        (resolve(s.piece3).hspeed = ((-4) - rt.random.random(2)));
                        (resolve(s.piece4).vspeed = ((-9) - rt.random.random(6)));
                        (resolve(s.piece4).hspeed = ((-4) - rt.random.random(2)));
                        (resolve(s.piece5).vspeed = (5 + rt.random.random(6)));
                        (resolve(s.piece5).hspeed = ((-4) - rt.random.random(2)));
                        (resolve(s.piece6).vspeed = (5 + rt.random.random(6)));
                        (resolve(s.piece6).hspeed = ((-4) - rt.random.random(2)));
                    }
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 270))) {
                        (resolve(s.piece1).vspeed = (1 - rt.random.random(6)));
                        (resolve(s.piece1).hspeed = (7 + rt.random.random(4)));
                        (resolve(s.piece2).vspeed = (1 - rt.random.random(6)));
                        (resolve(s.piece2).hspeed = ((-7) - rt.random.random(4)));
                        (resolve(s.piece3).vspeed = (1 + rt.random.random(6)));
                        (resolve(s.piece3).hspeed = (7 + rt.random.random(4)));
                        (resolve(s.piece4).vspeed = (1 + rt.random.random(6)));
                        (resolve(s.piece4).hspeed = ((-7) - rt.random.random(4)));
                        (resolve(s.piece5).vspeed = (1 - rt.random.random(6)));
                        (resolve(s.piece5).hspeed = ((-7) - rt.random.random(4)));
                        (resolve(s.piece6).vspeed = (1 - rt.random.random(6)));
                        (resolve(s.piece6).hspeed = (7 + rt.random.random(4)));
                    }
                    if (sceneTruth(sceneEqual(resolve(other).imageAngle, 90))) {
                        (resolve(s.piece1).vspeed = ((-9) - rt.random.random(3)));
                        (resolve(s.piece1).hspeed = (7 + rt.random.random(2)));
                        (resolve(s.piece2).vspeed = ((-9) - rt.random.random(3)));
                        (resolve(s.piece2).hspeed = ((-7) + rt.random.random(2)));
                        (resolve(s.piece3).vspeed = ((-9) - rt.random.random(3)));
                        (resolve(s.piece3).hspeed = (7 + rt.random.random(2)));
                        (resolve(s.piece4).vspeed = ((-9) - rt.random.random(3)));
                        (resolve(s.piece4).hspeed = ((-7) + rt.random.random(2)));
                        (resolve(s.piece5).vspeed = ((-9) - rt.random.random(3)));
                        (resolve(s.piece5).hspeed = ((-7) + rt.random.random(2)));
                        (resolve(s.piece6).vspeed = ((-9) - rt.random.random(3)));
                        (resolve(s.piece6).hspeed = (7 + rt.random.random(2)));
                    }
                    {
                        const caller5 = s;
                        for (const target5 of targets(object("obj_heart"))) {
                            const other = caller5;
                            const s = target5;
                            {
                                (s.color = 0);
                                (s.sprite = "spr_heart");
                            }
                        }
                    }
                    create(s.x, s.y, object("obj_shake"));
                    rt.destroy(s);
                }
            }
        }
    }
    return false;
}
