import type { HammerSpearContext } from './spear-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, lengthdirX, lengthdirY } from '../../gm/math';
/** Source spear dispatch block 2. The first matching special wins. */
export function spearDispatch2({ s, rt, g, v, args, audio, object, resolve, targets, create, createDepth, bulletSpawner, heartColor }: HammerSpearContext): boolean {
    if (sceneTruth(sceneEqual(args[3], 16))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).swingaround = 1);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 17))) {
        {
            (s._inst = create(...rtl(() => (resolve(object("obj_spearblocker")).x + lengthdirX(args[2], (args[0] + 180))), () => (resolve(object("obj_spearblocker")).y + lengthdirY(args[2], (args[0] + 180))), () => object("obj_spearshot"))));
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = 0.2);
            (resolve(s._inst).len = args[2]);
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).imageAlpha = 0);
            (resolve(s._inst).fadespear = 3);
            (resolve(s._inst).fadewaitmax = args[1]);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 18))) {
        {
            (s._inst = create(...rtl(() => (resolve(object("obj_spearblocker")).x + lengthdirX(args[2], (args[0] + 180))), () => (resolve(object("obj_spearblocker")).y + lengthdirY(args[2], (args[0] + 180))), () => object("obj_spearshot"))));
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = 0.2);
            (resolve(s._inst).len = args[2]);
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).imageAlpha = 0);
            (resolve(s._inst).fadespear = 4);
            (resolve(s._inst).fadewaitmax = args[1]);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 19))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 1);
            (resolve(s._inst).hp = 2);
            (resolve(s._inst).maxhp = 2);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 20))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 20.1))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).hp = 2);
            (resolve(s._inst).maxhp = 2);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 21))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).hp = 9);
            (resolve(s._inst).maxhp = 9);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 21.6))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 1);
            (resolve(s._inst).hp = 6);
            (resolve(s._inst).maxhp = 6);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 21.65))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).hp = 6);
            (resolve(s._inst).maxhp = 6);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 21.66))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).hp = 5);
            (resolve(s._inst).maxhp = 5);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 21.9))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 1);
            (resolve(s._inst).hp = 9);
            (resolve(s._inst).maxhp = 9);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 22))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).special = 0);
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).bouncespear = 2);
            (resolve(s._inst).fastbounce = 1);
            (resolve(s._inst).hp = 3);
            (resolve(s._inst).maxhp = 3);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 23))) {
        {
            (s.fasterheart = true);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 24))) {
        {
            (s.gers = create(args[0], args[1], object("obj_gerson_speen")));
            (resolve(s.gers).type = 6);
            {
                const caller2 = s;
                for (const target2 of targets(s.gers)) {
                    const other = caller2;
                    const s = target2;
                    {
                        rt.userEvent(s, 0);
                    }
                }
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 25))) {
        {
            (s._inst = create((-9999), (-9999), object("obj_spearshot")));
            (resolve(s._inst).direction = args[0]);
            (resolve(s._inst).fakespeed = args[1]);
            (resolve(s._inst).len = (args[1] * args[2]));
            (resolve(s._inst).imageAngle = resolve(s._inst).direction);
            (resolve(s._inst).longspear = 1);
            if (sceneTruth(sceneEqual(args.length, 5))) {
                (resolve(s._inst).longnotepieces = args[4]);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 26))) {
        {
            (g.monsterattackname[s.myself] = "gerson rudebuster");
            (s.dc = bulletSpawner(s, s.x, s.y, object("obj_dbulletcontroller")));
            (resolve(s.dc).type = 250);
        }
        return true;
    }
    return false;
}
