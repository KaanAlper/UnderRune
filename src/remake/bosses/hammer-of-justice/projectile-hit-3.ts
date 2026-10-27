import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Other_10, source block 3. */
export function projectileHit3({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    v.dontblockshell = false;
    if (sceneTruth((sceneTruth(sceneEqual(s.bouncespear, 1)) && sceneTruth((sceneTruth(gt(nativeSceneValue(s.len), nativeSceneValue(36))) || sceneTruth(gt(nativeSceneValue(pointDistance(s.x, s.y, (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10))), nativeSceneValue(36)))))))) {
        (v.dontblockshell = true);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.bouncespear, 2)) && sceneTruth((sceneTruth(gt(nativeSceneValue(s.len), nativeSceneValue(46))) || sceneTruth(gt(nativeSceneValue(pointDistance(s.x, s.y, (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10))), nativeSceneValue(46)))))))) {
        (v.dontblockshell = true);
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0))) && sceneTruth((sceneTruth(gt(nativeSceneValue(s.shakeduration), nativeSceneValue(0))) || sceneTruth((sceneTruth(sceneEqual(s.bouncespearcon, 2)) && sceneTruth(lt(nativeSceneValue(s.fakespeed), nativeSceneValue(0)))))))))) {
        (v.dontblockshell = true);
    }
    if (sceneTruth((sceneTruth((sceneTruth(lt(nativeSceneValue(s.len), nativeSceneValue(v.shieldradius))) && sceneTruth(sceneEqual(v.dontblockshell, false)))) && sceneTruth((sceneTruth((sceneTruth(lt(nativeSceneValue(Math.abs((((((s.imageAngle) - (v.shielddir)) % 360 + 540) % 360) - 180))), nativeSceneValue(v.shieldlength))) && sceneTruth(!sceneEqual(s.bouncespear, 2)))) || sceneTruth((sceneTruth(lt(nativeSceneValue(Math.abs((((((s.direction) - (v.shielddir)) % 360 + 540) % 360) - 180))), nativeSceneValue(v.shieldlength))) && sceneTruth(sceneEqual(s.bouncespear, 2))))))))) {
        if (sceneTruth(sceneEqual(s.redhammer, 1))) {
            (v.breakshield = true);
        }
        else if (sceneTruth(sceneEqual(s.longspear, 1))) {
            (s.longnotebeingheld = true);
            (s.len = v.shieldradius);
            (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
            (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
            return true;
        }
        else {
            if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
                if (sceneTruth(sceneEqual(s.imageAngle, 0))) {
                    scripts.play(s, "snd_soundbattle_leftblock");
                }
                if (sceneTruth(sceneEqual(s.imageAngle, 270))) {
                    scripts.play(s, "snd_soundbattle_upblock");
                }
                if (sceneTruth(sceneEqual(s.imageAngle, 180))) {
                    scripts.play(s, "snd_soundbattle_rightblock");
                }
                if (sceneTruth(sceneEqual(s.imageAngle, 90))) {
                    scripts.play(s, "snd_soundbattle_downblock");
                }
            }
            if (sceneTruth(gt(nativeSceneValue(resolve(object("obj_spearblocker")).just), nativeSceneValue(0)))) {
                if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
                    scripts.tensionHeal(s, 2.5);
                }
                else {
                    scripts.tensionHeal(s, 2.5);
                }
                v.xx = 0;
                v.yy = 0;
                if (sceneTruth(sceneEqual(s.imageAngle, 0))) {
                    (v.xx = (-68));
                    (v.yy -= 35);
                }
                if (sceneTruth(sceneEqual(s.imageAngle, 90))) {
                    (v.yy = 32);
                }
                if (sceneTruth(sceneEqual(s.imageAngle, 180))) {
                    (v.xx = 68);
                    (v.yy -= 35);
                }
                if (sceneTruth(sceneEqual(s.imageAngle, 270))) {
                    (v.yy = (-64));
                }
                if (sceneTruth((sceneTruth(sceneEqual(s.imageAngle, 35)) || sceneTruth(sceneEqual(s.imageAngle, 45))))) {
                    (v.xx = (-63));
                    (v.yy = 17);
                }
                if (sceneTruth((sceneTruth(sceneEqual(s.imageAngle, 135)) || sceneTruth(sceneEqual(s.imageAngle, 135))))) {
                    (v.xx = 53);
                    (v.yy = 24);
                }
                if (sceneTruth((sceneTruth(sceneEqual(s.imageAngle, 215)) || sceneTruth(sceneEqual(s.imageAngle, 225))))) {
                    (v.xx = 65);
                    (v.yy = (-49));
                }
                if (sceneTruth((sceneTruth(sceneEqual(s.imageAngle, 305)) || sceneTruth(sceneEqual(s.imageAngle, 315))))) {
                    (v.xx = (-56));
                    (v.yy = (-56));
                }
                if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0))) && sceneTruth(gt(nativeSceneValue(s.hp), nativeSceneValue(1)))))) {
                    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
                        scripts.playAt(s, "snd_parry_fast_nodelay", 0.4, 1);
                    }
                    else {
                        scripts.play(s, "snd_parry_fast_nodelay");
                    }
                    (resolve(object("obj_spearblocker")).parryflashtimer = 6);
                    (s.spinindex = 0);
                }
                else {
                    scripts.play(s, "snd_bell_bounce_short");
                }
                (resolve(object("obj_spearblocker")).justflash = 1.8);
                {
                    const caller0 = s;
                    for (const target0 of targets(object("obj_spearblocker"))) {
                        const other = caller0;
                        const s = target0;
                        {
                            rt.userEvent(s, 1);
                        }
                    }
                }
            }
            else {
                scripts.tensionHeal(s, 1.25);
                if (sceneTruth(sceneEqual(s.giant, 0))) {
                    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
                        scripts.playAt(s, "snd_bell", 0.4, 1);
                    }
                    else {
                        scripts.play(s, "snd_bell");
                    }
                }
            }
            {
                const caller1 = s;
                for (const target1 of targets(object("obj_spearblocker"))) {
                    const other = caller1;
                    const s = target1;
                    {
                        (s.imageAngle = s.idealdir);
                        (s.bullethitid = nativeSceneValue(other));
                        rt.userEvent(s, 0);
                    }
                }
            }
            if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0))) && sceneTruth(gt(nativeSceneValue(s.hp), nativeSceneValue(1)))))) {
                (s.x3 = 0);
                if (sceneTruth(!sceneEqual(s.shakeduration, 5))) {
                    (s.hp--);
                }
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
                    (s.len = (v.parryradius - 12));
                }
                if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
                    (s.len = (v.parryradius - 12));
                }
                (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
                (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
                (s.bouncespeartimer = 0);
                (s.shakeduration = 5);
                (s.hitstopbounce = 1);
            }
            else {
                if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
                    (s.len = (v.parryradius - 10));
                    (s.len = (v.parryradius - 10));
                    (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
                    (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
                    v.scale = 0.75;
                    if (sceneTruth(sceneEqual(s.gigashell, true))) {
                        (v.scale = 1);
                    }
                    (s.anim = create(s.x, s.y, object("obj_gerson_animation")));
                    (resolve(s.anim).sprite = "spr_bounce_shell_idle");
                    (resolve(s.anim).spinindex = (s.spinindex - 0.5));
                    (resolve(s.anim).imageXscale = v.scale);
                    (resolve(s.anim).imageYscale = v.scale);
                    (resolve(s.anim).imageAngle = pointDirection(s.x, s.y, (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10)));
                    (resolve(s.anim).imageSpeed = 60);
                }
                if (sceneTruth(sceneEqual(v.breakshield, 1))) {
                    rt.userEvent(s, 1);
                }
                rt.destroy(s);
            }
            return true;
        }
    }
    v.heartcollisionlen = 16;
    if (sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0)))) {
        (v.heartcollisionlen = 2);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.bouncespearcon, 2)) && sceneTruth(!sceneEqual(s.sprite, "spr_bounce_shell_hit_center"))))) {
        (v.heartcollisionlen -= 10);
    }
    return false;
}
