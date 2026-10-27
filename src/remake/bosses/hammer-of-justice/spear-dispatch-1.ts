import type { HammerSpearContext } from './spear-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, lengthdirX, lengthdirY } from '../../gm/math';
/** Source spear dispatch block 1. The first matching special wins. */
export function spearDispatch1({ s, rt, g, v, args, audio, object, resolve, targets, create, createDepth, bulletSpawner, heartColor }: HammerSpearContext): boolean {
    if (sceneTruth(sceneEqual(args[3], 1))) {
        {
            create((s.x - 5), (s.y + 4), object("obj_gerson_green_switch"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 2))) {
        {
            (s.ham = create((resolve(object("obj_heart")).x - 20), (resolve(object("obj_heart")).y - 20), object("obj_giant_hammer")));
            (resolve(s.ham).type = 2);
            (resolve(s.ham).dir = args[0]);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 3))) {
        {
            {
                const caller0 = s;
                for (const target0 of targets(object("obj_spearblocker"))) {
                    const other = caller0;
                    const s = target0;
                    {
                        (s.diagonal_transform = 1);
                    }
                }
            }
            {
                const caller1 = s;
                for (const target1 of targets(object("obj_hammer_of_justice_enemy"))) {
                    const other = caller1;
                    const s = target1;
                    {
                        (s.diagonal_enabled = 1);
                    }
                }
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 400))) {
        {
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).visible, true))) {
                (resolve(object("obj_hammer_of_justice_enemy")).visible = false);
                (s.gers = create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport")));
                (resolve(s.gers).depth = resolve(object("obj_hammer_of_justice_enemy")).depth);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 4))) {
        {
            if (sceneTruth((sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0)) && sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).visible, true))))) {
                (resolve(object("obj_hammer_of_justice_enemy")).visible = false);
                (s.gers = create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport")));
                (resolve(s.gers).depth = resolve(object("obj_hammer_of_justice_enemy")).depth);
            }
            if (sceneTruth(sceneEqual(args[2], (-5)))) {
                (s.gers = create(...rtl(() => (rt.view.x + args[0]), () => (rt.view.y + args[1]), () => object("obj_gerson_teleport"))));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = (-3));
                (resolve(s.gers).imageAlpha = 0);
                (resolve(s.gers).imageAngle = 90);
            }
            else if (sceneTruth(sceneEqual(args[2], (-4)))) {
                (s.gers = create(...rtl(() => ((resolve(object("obj_growtangle")).x + args[0]) + lengthdirX(130, (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex * 45))), () => (((resolve(object("obj_growtangle")).y + args[1]) + 20) + lengthdirY(130, (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex * 45))), () => object("obj_gerson_teleport"))));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = (-4));
                (resolve(s.gers).imageAngle = (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex * 45));
                (resolve(s.gers).imageAlpha = 0);
                (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex++);
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 1))) {
                    (resolve(s.gers).special = 4);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 2))) {
                    (resolve(s.gers).special = 1);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 3))) {
                    (resolve(s.gers).special = 3);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 4))) {
                    (resolve(s.gers).special = 2);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 5))) {
                    (resolve(s.gers).special = 4);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 6))) {
                    (resolve(s.gers).special = 1);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 7))) {
                    (resolve(s.gers).special = 3);
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex, 8))) {
                    (resolve(s.gers).special = 2);
                }
            }
            else if (sceneTruth(sceneEqual(args[2], (-3)))) {
                (s.gers = create(...rtl(() => ((resolve(object("obj_growtangle")).x + args[0]) + lengthdirX(130, (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex * 45))), () => (((resolve(object("obj_growtangle")).y + args[1]) + 20) + lengthdirY(130, (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex * 45))), () => object("obj_gerson_teleport"))));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex * 45));
                (resolve(s.gers).imageAlpha = 0);
                (resolve(object("obj_hammer_of_justice_enemy")).swingdown_ex++);
            }
            else if (sceneTruth(sceneEqual(args[2], 10))) {
                (s.gers = create((resolve(object("obj_growtangle")).x + 116), (resolve(object("obj_heart")).y + 26), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 11))) {
                (s.gers = create((resolve(object("obj_growtangle")).x + 116), (resolve(object("obj_growtangle")).y + 55), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 12))) {
                (s.gers = create((resolve(object("obj_growtangle")).x - 116), (resolve(object("obj_growtangle")).y - 65), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = 180);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 13))) {
                (s.gers = create((resolve(object("obj_growtangle")).x + 116), (resolve(object("obj_growtangle")).y + 41), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 14))) {
                (s.gers = create((resolve(object("obj_growtangle")).x - 116), (resolve(object("obj_growtangle")).y - 49), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = 180);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 15))) {
                (s.gers = create((resolve(object("obj_growtangle")).x - 116), ((resolve(object("obj_growtangle")).y + 41) - 40), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = 180);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 16))) {
                (s.gers = create((resolve(object("obj_growtangle")).x + 116), ((resolve(object("obj_growtangle")).y - 49) + 46), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = 0);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 17))) {
                (s.gers = create((resolve(object("obj_growtangle")).x - 41), (resolve(object("obj_growtangle")).y + 115), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = 270);
                (resolve(s.gers).imageAlpha = 0);
            }
            else if (sceneTruth(sceneEqual(args[2], 18))) {
                (s.gers = create((resolve(object("obj_growtangle")).x + 7), (resolve(object("obj_growtangle")).y + 115), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAngle = 270);
                (resolve(s.gers).imageAlpha = 0);
            }
            else {
                (s.gers = create(...rtl(() => (rt.view.x + args[0]), () => (rt.view.y + args[1]), () => object("obj_gerson_teleport"))));
                (resolve(s.gers).type = 2);
                (resolve(s.gers).swingdowntype = args[2]);
                (resolve(s.gers).imageAlpha = 0);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 5))) {
        {
            create(args[0], args[1], object("obj_gerson_box_hit_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 6))) {
        {
            create(args[0], args[1], object("obj_gerson_bell_attack_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 7))) {
        {
            create(args[0], args[1], object("obj_gerson_hammer_bro_attack_controller"));
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 8))) {
        {
            (resolve(object("obj_hammer_of_justice_enemy")).goldcon = 1);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 9))) {
        {
            (resolve(object("obj_hammer_of_justice_enemy")).sprite = "spr_gerson_laugh");
            (resolve(object("obj_hammer_of_justice_enemy")).state = 12);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 10))) {
        {
            (resolve(object("obj_hammer_of_justice_enemy")).visible = false);
            (resolve(object("obj_hammer_of_justice_enemy")).sprite = "spr_gerson_idle");
            (resolve(object("obj_hammer_of_justice_enemy")).state = 0);
            (s.gers = create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport")));
            (resolve(s.gers).type = 10);
            (g.turntimer = 2);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 10.5))) {
        {
            (resolve(object("obj_hammer_of_justice_enemy")).visible = false);
            (resolve(object("obj_hammer_of_justice_enemy")).sprite = "spr_gerson_idle");
            (resolve(object("obj_hammer_of_justice_enemy")).state = 0);
            (s.gers = create((resolve(object("obj_hammer_of_justice_enemy")).x + 60), (resolve(object("obj_hammer_of_justice_enemy")).y + 35), object("obj_gerson_teleport")));
            (resolve(s.gers).type = 10);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 11))) {
        {
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).visible, true))) {
                (s.gers = create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport")));
            }
            (s.gers = create((resolve(object("obj_growtangle")).x - 150), (resolve(object("obj_growtangle")).y + 15), object("obj_gerson_teleport")));
            (resolve(s.gers).type = 4);
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 12))) {
        {
            if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).visible, true))) {
                (resolve(object("obj_hammer_of_justice_enemy")).visible = false);
                (s.gers = create((resolve(object("obj_hammer_of_justice_enemy")).x + 45), (resolve(object("obj_hammer_of_justice_enemy")).y + 45), object("obj_gerson_teleport")));
            }
            if (sceneTruth((targets(object("obj_growtangle")).length > 0))) {
                (s.gers = create((resolve(object("obj_growtangle")).x + 150), (resolve(object("obj_growtangle")).y + 15), object("obj_gerson_teleport")));
                (resolve(s.gers).type = 5);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 13))) {
        {
            if (sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0))) {
                (resolve(object("obj_hammer_of_justice_enemy")).visible = false);
                (s.gers = createDepth(s.x, s.y, s.depth, object("obj_gerson_squishes_box")));
                (resolve(s.gers).type = 5);
            }
        }
        return true;
    }
    if (sceneTruth(sceneEqual(args[3], 14))) {
        {
            if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
                (s._inst = create(...rtl(() => (resolve(object("obj_spearblocker")).x + lengthdirX(args[2], (args[0] + 180))), () => (resolve(object("obj_spearblocker")).y + lengthdirY(args[2], (args[0] + 180))), () => object("obj_spearshot"))));
                (resolve(s._inst).direction = args[0]);
                (resolve(s._inst).fakespeed = 0);
                (resolve(s._inst).len = args[2]);
                (resolve(s._inst).imageAngle = resolve(s._inst).direction);
                (resolve(s._inst).imageAlpha = 0);
                (resolve(s._inst).fadespear = 1);
                (resolve(s._inst).fadespeed = 25);
                (resolve(s._inst).fadespeartimermax = args[1]);
                if (sceneTruth(sceneEqual(args.length, 5))) {
                    (resolve(s._inst).fadespeardist = args[4]);
                }
            }
        }
        return true;
    }
    return false;
}
