import type { HammerSpearContext } from './spear-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, lengthdirX, lengthdirY } from '../../gm/math';
/** Source spear dispatch block 3. The first matching special wins. */
export function spearDispatch3({ s, rt, g, v, args, audio, object, resolve, targets, create, createDepth, bulletSpawner, heartColor }: HammerSpearContext): boolean {
    if (sceneTruth(sceneEqual(args[3], 27))) {
        {
            (s.inst = create(s.x, s.y, object("obj_gerson_growtangle_transform")));
            (resolve(s.inst).shrink = true);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 28))) {
        {
            (s.swingdown_multitelegraph = args[0]);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 29))) {
        {
            create(s.x, s.y, object("obj_gerson_darken"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 30))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).breakshield = 1);
            (resolve(s._inst).sprite = "spr_spear_arrow");
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 31))) {
        {
            create(s.x, s.y, object("obj_gerson_growtangle"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 32))) {
        {
            if (sceneTruth((targets(object("obj_growtangle")).length > 0))) {
                if (sceneTruth(ge(nativeSceneValue(args[2]), nativeSceneValue(0)))) {
                    (s._inst = create((resolve(object("obj_growtangle")).x + args[0]), (resolve(object("obj_growtangle")).y + args[1]), object("obj_gerson_swing_down_new")));
                    (resolve(s._inst).imageAngle = args[2]);
                    (resolve(s._inst).direction = (args[2] + 270));
                    (resolve(s._inst).gravityDirection = (args[2] + 270));
                }
                if (sceneTruth(sceneEqual(args[2], (-1)))) {
                    (s._inst = create((resolve(object("obj_growtangle")).x + 70), resolve(object("obj_heart")).y, object("obj_gerson_swing_down_new")));
                    (resolve(s._inst).imageAngle = 270);
                    (resolve(s._inst).direction = 540);
                    (resolve(s._inst).gravityDirection = 540);
                }
                if (sceneTruth(sceneEqual(args[2], (-2)))) {
                    (s._inst = create((resolve(object("obj_growtangle")).x - 70), resolve(object("obj_heart")).y, object("obj_gerson_swing_down_new")));
                    (resolve(s._inst).imageAngle = 90);
                    (resolve(s._inst).direction = 360);
                    (resolve(s._inst).gravityDirection = 360);
                }
                if (sceneTruth(sceneEqual(args[2], (-3)))) {
                    (s._inst = create((resolve(object("obj_growtangle")).x + args[0]), (resolve(object("obj_growtangle")).y + args[1]), object("obj_gerson_swing_down_new")));
                    (resolve(s._inst).imageAngle = args[2]);
                    (resolve(s._inst).direction = (args[2] + 270));
                    (resolve(s._inst).gravityDirection = (args[2] + 270));
                    (resolve(s._inst).version = 1);
                }
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 33))) {
        {
            {
                const caller3 = s;
                for (const target3 of targets(object("obj_gerson_darken"))) {
                    const other = caller3;
                    const s = target3;
                    {
                        (s.con = 1);
                    }
                }
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 34))) {
        {
            if (sceneTruth(sceneEqual(s.introtalkcon, 0))) {
                (s.introtalkcon = 1);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 35))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).redhammer = 1);
            (resolve(s._inst).grav = 0.3);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 355))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).redhammer = 1);
            (resolve(s._inst).redhammerfakeout = 1);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 36))) {
        {
            if (sceneTruth(!sceneTruth((targets(object("obj_spearblocker")).length > 0)))) {
                create(s.x, s.y, object("obj_spearblocker"));
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 37))) {
        {
            if (sceneTruth((targets(object("obj_gerson_darkness_overlay")).length > 0))) {
                (resolve(object("obj_gerson_darkness_overlay")).scalecon = args[0]);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 37))) {
        {
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 38))) {
        {
            audio.playAt(s, "snd_soundbattle_leadin", 1, args[0]);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 39))) {
        {
            audio.playAt(s, "snd_soundbattle_leadin_short", 1, args[0]);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 40))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 1);
            (resolve(s._inst).slowbounce = 1);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
        }
        return true;
    }
    return false;
}
