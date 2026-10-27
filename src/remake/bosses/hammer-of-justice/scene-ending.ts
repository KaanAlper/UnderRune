/** Source Step block, preserving event order and event-local variables. */
import type { HammerSceneContext } from './scene-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
export function sceneEnding({ s, rt, g, v, scripts, object, resolve, targets, create, msg, text }: HammerSceneContext): boolean {
    if (sceneTruth(sceneEqual(s.end_cutscene_version, 0))) {
        if (sceneTruth(sceneEqual(s.endcon, 1))) {
            (s.endtimer++);
            if (sceneTruth(sceneEqual(s.endtimer, 1))) {
                scripts.fade(s, 30);
                {
                    const caller22 = s;
                    for (const target22 of targets(object("obj_fadeout"))) {
                        const other = caller22;
                        const s = target22;
                        {
                            (s.imageBlend = 0xffffff);
                            (s.depth = 2);
                        }
                    }
                }
            }
            if (sceneTruth(sceneEqual(s.endtimer, 3))) {
                {
                    const caller23 = s;
                    for (const target23 of targets(object("obj_writer"))) {
                        const other = caller23;
                        const s = target23;
                        {
                            rt.destroy(s);
                        }
                    }
                }
                {
                    const caller24 = s;
                    for (const target24 of targets(object("obj_face"))) {
                        const other = caller24;
                        const s = target24;
                        {
                            rt.destroy(s);
                        }
                    }
                }
            }
            if (sceneTruth(sceneEqual(s.endtimer, 60))) {
                (g.myfight = (-1));
                (g.mnfight = (-1));
                (g.fighting = 0);
                {
                    const caller25 = s;
                    for (const target25 of targets(object("obj_battlecontroller"))) {
                        const other = caller25;
                        const s = target25;
                        {
                            (s.victory = 1);
                            (s.skipvictory = 1);
                        }
                    }
                }
                (g.flag[36] = 1);
                (g.flag[39] = 1);
                (s.endcon = 2);
            }
        }
    }
    else {
        if (sceneTruth(sceneEqual(s.endcon, 1))) {
            (s.endtimer++);
            (g.charturn = 2);
            if (sceneTruth(sceneEqual(s.endtimer, 1))) {
                scripts.musicFade(s, g.batmusic[1], 90);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 1))) {
                {
                    const caller26 = s;
                    for (const target26 of targets(object("obj_battlecontroller"))) {
                        const other = caller26;
                        const s = target26;
                        {
                            scripts.endTurn(s);
                        }
                    }
                }
            }
            if (sceneTruth(sceneEqual(s.endtimer, 90))) {
                msg(0, text("obj_hammer_of_justice_enemy_slash_Step_0_gml_630_0"));
                (g.typer = 75);
                scripts.heroBalloon(s, "susie");
            }
            if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(105))))) || sceneTruth((sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(90)))))))) {
                {
                    const caller27 = s;
                    for (const target27 of targets(object("obj_writer"))) {
                        const other = caller27;
                        const s = target27;
                        {
                            rt.destroy(s);
                        }
                    }
                }
                (s.endcon = 2);
                (s.endtimer = 0);
            }
        }
        if (sceneTruth(sceneEqual(s.endcon, 2))) {
            (s.endtimer++);
            if (sceneTruth(sceneEqual(s.endtimer, 1))) {
                (resolve(object("obj_herosusie")).x -= 35);
                (resolve(object("obj_herosusie")).y -= 28);
                scripts.battleSpriteSet(s, "susie", "spr_susie_heal_charge2", 0.5, false);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 6))) {
                scripts.battleSpriteSet(s, "susie", "spr_susie_heal_charge2_loop", 0.5, true);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 30))) {
                msg(0, text("obj_hammer_of_justice_enemy_slash_Step_0_gml_662_0"));
                (g.typer = 75);
                v.heroballoon = scripts.enemyBalloon(s, ((resolve(object("obj_herosusie")).x + 100) + 35), ((resolve(object("obj_herosusie")).y + 40) + 28), 10);
                (resolve(v.heroballoon).side = (-1));
            }
            if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(45))))) || sceneTruth((sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(30)))))))) {
                {
                    const caller28 = s;
                    for (const target28 of targets(object("obj_writer"))) {
                        const other = caller28;
                        const s = target28;
                        {
                            rt.destroy(s);
                        }
                    }
                }
                (s.endcon = 3);
                (s.endtimer = 0);
                scripts.battleSpriteSet(s, "susie", "spr_susie_heal_charge_loop", 0.5, true);
                v.snd = scripts.loop(s, "snd_chargeshot_charge");
                scripts.soundVolume(s, v.snd, 0, 0);
                scripts.soundVolume(s, v.snd, 0.2, 30);
            }
        }
        if (sceneTruth(sceneEqual(s.endcon, 3))) {
            (s.endtimer++);
            if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
                {
                    const caller29 = s;
                    for (const target29 of targets(object("obj_writer"))) {
                        const other = caller29;
                        const s = target29;
                        {
                            rt.destroy(s);
                        }
                    }
                }
                (s.endcon = 4);
                (s.endtimer = 0);
            }
        }
        if (sceneTruth(sceneEqual(s.endcon, 4))) {
            (s.endtimer++);
            if (sceneTruth(sceneEqual(s.endtimer, 30))) {
                msg(0, text("obj_hammer_of_justice_enemy_slash_Step_0_gml_704_0"));
                (g.typer = 75);
                v.heroballoon = scripts.enemyBalloon(s, ((resolve(object("obj_herosusie")).x + 100) + 35), ((resolve(object("obj_herosusie")).y + 40) + 28), 10);
                (resolve(v.heroballoon).side = (-1));
            }
            if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(45))))) || sceneTruth((sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0))) && sceneTruth(gt(nativeSceneValue(s.endtimer), nativeSceneValue(30)))))))) {
                {
                    const caller30 = s;
                    for (const target30 of targets(object("obj_writer"))) {
                        const other = caller30;
                        const s = target30;
                        {
                            rt.destroy(s);
                        }
                    }
                }
                (s.endcon = 5);
                (s.endtimer = 0);
                (s.siner -= 14);
            }
        }
        if (sceneTruth(sceneEqual(s.endcon, 5))) {
            (s.endtimer++);
            if (sceneTruth(sceneEqual(s.endtimer, 1))) {
                scripts.battleSpriteSet(s, "susie", "spr_susie_heal_end", 0.5, false);
                v.snd = scripts.loop(s, "snd_chargeshot_charge");
                scripts.soundVolume(s, v.snd, 0, 0);
                scripts.soundVolume(s, v.snd, 0.2, 30);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 6))) {
                (s.inst = create((resolve(object("obj_herosusie")).x + 86), (resolve(object("obj_herosusie")).y + 60), object("obj_susie_heal_projectile")));
                (resolve(s.inst).gravity = 1);
                (resolve(s.inst).gravityDirection = 8);
                (resolve(s.inst).imageXscale = 3);
                (resolve(s.inst).imageYscale = 3);
                (resolve(s.inst).imageSpeed = 1);
                (resolve(s.inst).imageAngle = 8);
                scripts.stop(s, "snd_chargeshot_charge");
                scripts.playAt(s, "snd_heartshot_dr_b", 0.4, 0.4);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 28))) {
                (resolve(object("obj_herosusie")).x = resolve(object("obj_herosusie")).xstart);
                (resolve(object("obj_herosusie")).y = resolve(object("obj_herosusie")).ystart);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 25))) {
                msg(0, text("obj_hammer_of_justice_enemy_slash_Step_0_gml_757_0"));
                (g.typer = 86);
                scripts.enemyBalloon(s, (s.x - 10), g.monstery[s.myself], 10);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 46))) {
                {
                    const caller31 = s;
                    for (const target31 of targets(object("obj_writer"))) {
                        const other = caller31;
                        const s = target31;
                        {
                            rt.destroy(s);
                        }
                    }
                }
            }
            if (sceneTruth(sceneEqual(s.endtimer, 45))) {
                scripts.battleSpriteSet(s, "susie", "spr_susieb_attack", 0.5, false);
                (s.attack = create((g.monsterx[s.myself] - 40), (g.monstery[s.myself] - 4), object("obj_basicattack")));
                (resolve(s.attack).sprite = "spr_attack_cut1_purple");
                (resolve(s.attack).imageSpeed = 0.25);
                (resolve(s.attack).imageXscale = 0.75);
                (resolve(s.attack).imageYscale = 0.75);
                (resolve(s.attack).imageAngle = 45);
                (resolve(s.attack).maxindex = 4);
                (s.ls = scripts.play(s, "snd_laz_c"));
                scripts.pitch(s, s.ls, 0.7);
                (s.nohairsprite = true);
                scripts.play(s, "snd_old_man_grunt");
            }
            if (sceneTruth(sceneEqual(s.endtimer, 45))) {
                scripts.fade(s, 60);
                {
                    const caller32 = s;
                    for (const target32 of targets(object("obj_fadeout"))) {
                        const other = caller32;
                        const s = target32;
                        {
                            (s.imageBlend = 0xffffff);
                            if (sceneTruth((targets(object("obj_tensionbar")).length > 0))) {
                                (s.depth = (resolve(object("obj_tensionbar")).depth - 1));
                            }
                        }
                    }
                }
                (s.hair = create((s.x + 25), (s.y + 32), object("obj_gerson_hair2")));
                (resolve(s.hair).imageSpeed = 0);
                (resolve(s.hair).imageIndex = 0);
                (resolve(s.hair).imageAngle = 20);
                (resolve(s.hair).hspeed -= 0.5);
                if (sceneTruth((targets(object("obj_fadeout")).length > 0))) {
                    (resolve(s.hair).depth = (resolve(object("obj_fadeout")).depth - 1));
                }
                (s.hair = create((s.x + 25), (s.y + 32), object("obj_gerson_hair2")));
                (resolve(s.hair).imageSpeed = 0);
                (resolve(s.hair).imageIndex = 0);
                (resolve(s.hair).imageAngle = (-20));
                (resolve(s.hair).hspeed = 0.5);
                if (sceneTruth((targets(object("obj_fadeout")).length > 0))) {
                    (resolve(s.hair).depth = (resolve(object("obj_fadeout")).depth - 1));
                }
            }
            if (sceneTruth(sceneEqual(s.endtimer, 55))) {
                scripts.battleSpriteSet(s, "susie", "spr_susie_attack_end", 0.5, true);
            }
            if (sceneTruth(sceneEqual(s.endtimer, 105))) {
                {
                    const caller33 = s;
                    for (const target33 of targets(object("obj_battlecontroller"))) {
                        const other = caller33;
                        const s = target33;
                        {
                            (s.skipvictory = 1);
                        }
                    }
                }
                (g.mag[2] += 4);
                (g.flag[1569] = 1);
                scripts.win(s);
            }
        }
        {
            const caller34 = s;
            for (const target34 of targets(object("obj_battlecontroller"))) {
                const other = caller34;
                const s = target34;
                {
                    (s.damagenoise = 0);
                }
            }
        }
    }
    return false;
}
