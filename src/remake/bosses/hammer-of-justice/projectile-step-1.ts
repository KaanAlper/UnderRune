import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Step_0, source block 1. */
export function projectileStep1({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth((sceneTruth((sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0))) || sceneTruth(!sceneTruth((targets(object("obj_spearblocker")).length > 0))))) || sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))))) {
        rt.destroy(s);
        return true;
    }
    if (sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0)))) {
        rt.destroy(s);
        return true;
    }
    if (sceneTruth(gt(nativeSceneValue(s.frozentimer), nativeSceneValue(0)))) {
        (s.frozentimer--);
        return true;
    }
    if (sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0)))) {
        if (sceneTruth(sceneEqual(s.bouncespearcon, 0))) {
            (s.sprite = "spr_bounce_shell_idle");
            if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
                if (sceneTruth(sceneEqual(s.bouncespeardir, 0))) {
                    (s.sprite = "spr_bounce_shell_idle");
                }
                else {
                    (s.sprite = "spr_bounce_shell_idle");
                }
            }
            (s.imageXscale = 1.5);
            (s.imageYscale = 1.5);
            (s.savedir = s.direction);
            (s.bouncespearcon = (-1));
            (s.testcon = 0);
        }
        if (sceneTruth(sceneEqual(s.bouncespearcon, 1))) {
            (s.imageIndex++);
            (s.bouncespeartimer++);
            if (sceneTruth(sceneEqual(s.bouncespeartimer, 5))) {
                (s.bouncespearcon = 2);
                (s.fakespeed = (-20));
                (s.grav = 1.2);
                if (sceneTruth(sceneEqual(s.bouncespear, 1))) {
                    (s.sprite = "spr_bounce_shell_idle");
                }
                if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
                    if (sceneTruth(!sceneEqual(s.sprite, "spr_bounce_shell_hit_center"))) {
                        (s.imageIndex = 1);
                        (s.sprite = "spr_bounce_shell_hit_center");
                        if (sceneTruth(sceneEqual(s.direction, 270))) {
                            (s.y -= 16);
                        }
                        if (sceneTruth(sceneEqual(s.direction, 180))) {
                            (s.x -= 16);
                        }
                        if (sceneTruth(sceneEqual(s.direction, 90))) {
                            (s.y += 16);
                        }
                        if (sceneTruth(sceneEqual(s.direction, 0))) {
                            (s.x += 16);
                        }
                    }
                    (s.fakespeed = (-17));
                    (s.grav = 1);
                    if (sceneTruth(sceneEqual(s.hitstopbounce, 1))) {
                        (s.fakespeed = (-19));
                        (s.grav = 1.25);
                    }
                    if (sceneTruth(sceneEqual(s.fastbounce, 1))) {
                        (s.fakespeed = (-38));
                        (s.grav = 6);
                    }
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 1))) {
                    (s.fakespeed = (-10));
                    (s.grav = 0.35);
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 2))) {
                    (s.fakespeed = (-10));
                    (s.grav = 0.25);
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 3))) {
                    (s.fakespeed = (-10));
                    (s.grav = 0.2);
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 4))) {
                    (s.fakespeed = (-11));
                    (s.grav = 0.24);
                }
                (s.bouncespeartimer = 0);
            }
            else {
                return true;
            }
        }
        else {
            (s.hurtsquish = false);
        }
        if (sceneTruth(sceneEqual(s.bouncespearcon, 2))) {
            (s.x3++);
            if (sceneTruth(sceneEqual(s.bouncespear, 1))) {
                (s.x = round((resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180)))));
                (s.y = round((resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180)))));
            }
            if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
                (s.bouncespeartimer++);
                (s.fakespeed += s.grav);
                (s.len -= s.fakespeed);
                v.duration = 34;
                if (sceneTruth(sceneEqual(s.hitstopbounce, 1))) {
                    (v.duration = 30);
                }
                if (sceneTruth(sceneEqual(s.fastbounce, 1))) {
                    (v.duration = 12);
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 1))) {
                    (v.duration = 60);
                    if (sceneTruth(sceneEqual(s.hitstopbounce, 1))) {
                        (v.duration = 54);
                    }
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 2))) {
                    (v.duration = 80);
                    if (sceneTruth(sceneEqual(s.hitstopbounce, 1))) {
                        (v.duration = 74);
                    }
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 3))) {
                    (v.duration = 100);
                    if (sceneTruth(sceneEqual(s.hitstopbounce, 1))) {
                        (v.duration = 94);
                    }
                }
                if (sceneTruth(sceneEqual(s.slowbounce, 4))) {
                    (v.duration = 110);
                    if (sceneTruth(sceneEqual(s.hitstopbounce, 1))) {
                        (v.duration = 104);
                    }
                }
                (v.duration += s.testcon);
                (s.spinindex = ((s.bouncespeartimer / v.duration) * 14.5));
                if (sceneTruth(sceneEqual(s.bouncespeardir, 0))) {
                    (v._savedir = (s.savedir + 270));
                    if (sceneTruth(le(nativeSceneValue(s.bouncespeartimer), nativeSceneValue(v.duration)))) {
                        (v._savedir = lerp((s.savedir + 180), (s.savedir + 270), (s.bouncespeartimer / v.duration)));
                    }
                    (s.direction = (s.savedir + 90));
                }
                if (sceneTruth(sceneEqual(s.bouncespeardir, 180))) {
                    (v._savedir = (s.savedir + 90));
                    if (sceneTruth(le(nativeSceneValue(s.bouncespeartimer), nativeSceneValue(v.duration)))) {
                        (v._savedir = lerp((s.savedir + 180), (s.savedir + 90), (s.bouncespeartimer / v.duration)));
                    }
                    (s.direction = (s.savedir - 90));
                }
                (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, v._savedir)));
                (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, v._savedir)));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.fadespear, 1))) {
        (s.imageAlpha += 0.1);
        (s.fadespeartimer++);
        if (sceneTruth(sceneEqual(s.fadespeartimer, 1))) {
            (s.savedir = s.direction);
            (s.savex = s.x);
            (s.savey = s.y);
            (s.type = rt.random.choose(0, 1));
        }
        if (sceneTruth(sceneEqual(s.imageAngle, 0))) {
            if (sceneTruth(sceneEqual(s.type, 1))) {
                (s.y = lerp((s.savey + s.fadespeardist), s.savey, (s.fadespeartimer / s.fadespeartimermax)));
            }
            else {
                (s.y = lerp((s.savey - s.fadespeardist), s.savey, (s.fadespeartimer / s.fadespeartimermax)));
            }
        }
        if (sceneTruth(sceneEqual(s.imageAngle, 90))) {
            if (sceneTruth(sceneEqual(s.type, 1))) {
                (s.x = lerp((s.savex + s.fadespeardist), s.savex, (s.fadespeartimer / s.fadespeartimermax)));
            }
            else {
                (s.x = lerp((s.savex - s.fadespeardist), s.savex, (s.fadespeartimer / s.fadespeartimermax)));
            }
        }
        if (sceneTruth(sceneEqual(s.imageAngle, 180))) {
            if (sceneTruth(sceneEqual(s.type, 1))) {
                (s.y = lerp((s.savey + s.fadespeardist), s.savey, (s.fadespeartimer / s.fadespeartimermax)));
            }
            else {
                (s.y = lerp((s.savey - s.fadespeardist), s.savey, (s.fadespeartimer / s.fadespeartimermax)));
            }
        }
        if (sceneTruth(sceneEqual(s.imageAngle, 270))) {
            if (sceneTruth(sceneEqual(s.type, 1))) {
                (s.x = lerp((s.savex + s.fadespeardist), s.savex, (s.fadespeartimer / s.fadespeartimermax)));
            }
            else {
                (s.x = lerp((s.savex - s.fadespeardist), s.savex, (s.fadespeartimer / s.fadespeartimermax)));
            }
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, s.fadespeartimermax))) {
            (s.speed = 0);
            (s.direction = s.savedir);
            (s.fakespeed = s.fadespeed);
            (s.fadespeartimer = 0);
            (s.fadespear = 0);
            (s.init = 1);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(s.fadespear, 3))) {
        if (sceneTruth(sceneEqual(s.imageAlpha, 0))) {
            (s.savedir = s.direction);
        }
        (s.imageAlpha = lerp(s.imageAlpha, 1.8, 0.16));
        (s.fadespeartimer++);
        if (sceneTruth(sceneEqual(s.fadespeartimer, 1))) {
            (s.fakespeed = (-0.5));
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, 20))) {
            (s.fakespeed = 0);
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, (s.fadewaitmax - 12)))) {
            scripts.playPitch(s, "snd_bell_bounce_short", 1.3);
            (s.sprite = "spr_spear_arrow_highlight");
            (s.flashalpha = 1);
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, s.fadewaitmax))) {
            (s.fakespeed = 15);
            (s.init = 1);
        }
        if (sceneTruth(lt(nativeSceneValue(s.fadespeartimer), nativeSceneValue(s.fadewaitmax)))) {
            (s.len -= s.fakespeed);
            (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
            (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
            return true;
        }
    }
    if (sceneTruth(sceneEqual(s.fadespear, 4))) {
        (s.imageAlpha += 0.1);
        (s.fadespeartimer++);
        if (sceneTruth(sceneEqual(s.fadespeartimer, 1))) {
            (s.fakespeed = (-0.5));
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, 20))) {
            (s.fakespeed = 0);
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, (s.fadewaitmax - 12)))) {
            scripts.playPitch(s, "snd_bell_bounce_short", 1.3);
            (s.sprite = "spr_spear_arrow_highlight");
            (s.flashalpha = 1);
        }
        if (sceneTruth(sceneEqual(s.fadespeartimer, s.fadewaitmax))) {
            (s.fakespeed = 15);
            (s.init = 1);
        }
        if (sceneTruth(lt(nativeSceneValue(s.fadespeartimer), nativeSceneValue(s.fadewaitmax)))) {
            if (sceneTruth(lt(nativeSceneValue(s.len), nativeSceneValue(190)))) {
                (s.direction++);
            }
            else {
                (s.direction--);
            }
            (s.len -= s.fakespeed);
            (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
            (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
            return true;
        }
    }
    v.rotateradius = 90;
    return false;
}
