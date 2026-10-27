import type { HammerSpearContext } from './spear-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, lengthdirX, lengthdirY } from '../../gm/math';
/** Source spear dispatch block 4. The first matching special wins. */
export function spearDispatch4({ s, rt, g, v, args, audio, object, resolve, targets, create, createDepth, bulletSpawner, heartColor }: HammerSpearContext): boolean {
    if (sceneTruth(sceneEqual(args[3], 40.4))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 1);
            (resolve(s._inst).slowbounce = 1);
            (resolve(s._inst).hp = 2);
            (resolve(s._inst).maxhp = 2);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 40.5))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 1);
            (resolve(s._inst).hp = 4);
            (resolve(s._inst).maxhp = 4);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 40.6))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 1);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
            (resolve(s._inst).gigashell = true);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 40.75))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 1);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 41))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 2);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 41.1))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 2);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
            (resolve(s._inst).gigashell = true);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 42))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 3);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 42.1))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 3);
            (resolve(s._inst).hp = 2);
            (resolve(s._inst).maxhp = 2);
            (resolve(s._inst).gigashell = true);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 42.2))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).slowbounce = 4);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
            (resolve(s._inst).gigashell = true);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 43))) {
        {
            if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
                (resolve(object("obj_spearblocker")).shadowpowertarget = args[0]);
                (resolve(object("obj_spearblocker")).shadowpowertimermax = args[1]);
                (resolve(object("obj_spearblocker")).shadowpowercon = 1);
                (resolve(object("obj_spearblocker")).shadowpowertimer = 0);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 50))) {
        {
            create(args[0], args[1], object("obj_box_throw_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 51))) {
        {
            create(args[0], args[1], object("obj_hammer_bounce_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 52))) {
        {
            create(args[0], args[1], object("obj_gerson_shell_kick_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 53))) {
        {
            create(args[0], args[1], object("obj_gerson_box_rumble_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 54))) {
        {
            {
                const caller4 = s;
                for (const target4 of targets(object("obj_sound_of_justice_enemy"))) {
                    const other = caller4;
                    const s = target4;
                    {
                        (s.redflashcon = 1);
                    }
                }
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 55))) {
        {
            {
                const caller5 = s;
                for (const target5 of targets(object("obj_spearblocker"))) {
                    const other = caller5;
                    const s = target5;
                    {
                        (s.vanish = 1);
                    }
                }
            }
            {
                const caller6 = s;
                for (const target6 of targets(object("obj_spearshot"))) {
                    const other = caller6;
                    const s = target6;
                    {
                        rt.destroy(s);
                    }
                }
            }
            heartColor(s, "red");
        }
        return true;
    }
    return false;
}
