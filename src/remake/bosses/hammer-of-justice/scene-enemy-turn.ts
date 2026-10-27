/** Source Step block, preserving event order and event-local variables. */
import type { HammerSceneContext } from './scene-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
export function sceneEnemyTurn({ s, rt, g, v, scripts, object, resolve, targets, create, msg, text }: HammerSceneContext): boolean {
    if (sceneTruth((sceneTruth(sceneEqual(s.talked, 1)) && sceneTruth(scripts.phase(s, "enemytalk"))))) {
        (s.talktimer++);
        if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.talktimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            {
                const caller6 = s;
                for (const target6 of targets(object("obj_writer"))) {
                    const other = caller6;
                    const s = target6;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (g.mnfight = 1.5);
        }
    }
    if (sceneTruth(sceneEqual(g.mnfight, 1.5))) {
        if (sceneTruth(!sceneTruth((targets(object("obj_growtangle")).length > 0)))) {
            create(...rtl(() => (rt.view.x + (rt.view.width / 2)), () => (rt.view.y + (rt.view.height / 2)), () => object("obj_growtangle")));
        }
        {
            const caller7 = s;
            for (const target7 of targets(object("obj_growtangle"))) {
                const other = caller7;
                const s = target7;
                {
                    if (sceneTruth(resolve(other).boxoffset)) {
                        (s.y -= 50);
                    }
                }
            }
        }
        {
            const caller8 = s;
            for (const target8 of targets(object("obj_battlecontroller"))) {
                const other = caller8;
                const s = target8;
                {
                    (s.depth = (resolve(object("obj_growtangle")).depth + 2));
                }
            }
        }
        {
            const caller9 = s;
            for (const target9 of targets(object("obj_growtangle"))) {
                const other = caller9;
                const s = target9;
                {
                    (s.depth = (resolve(object("obj_growtangle")).depth - 2));
                }
            }
        }
        {
            const caller10 = s;
            for (const target10 of targets(object("obj_darkener"))) {
                const other = caller10;
                const s = target10;
                {
                    (s.depth = (resolve(object("obj_heroparent")).depth + 3));
                }
            }
        }
        if (sceneTruth((sceneTruth(!sceneTruth((targets(object("obj_moveheart")).length > 0))) && sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0)))))) {
            scripts.moveHeart(s);
        }
        (g.mnfight = 2);
        scripts.turnTimer(s, 90);
    }
    if (sceneTruth((sceneTruth(scripts.phase(s, "bullets")) && sceneTruth(sceneEqual(s.attacked, 0))))) {
        (s.rtimer += 1);
        if (sceneTruth(sceneEqual(s.rtimer, 12))) {
            (s.attackcon = 1);
            (s.rudebusterhitcount = 0);
            scripts.turnTimer(s, 999);
            (g.typer = 6);
            (g.fc = 0);
            (s.rr = rt.random.choose(0, 1));
            v.rand = rt.random.irandom(100);
            if (sceneTruth((sceneTruth(lt(nativeSceneValue(v.rand), nativeSceneValue(33))) && sceneTruth(gt(nativeSceneValue(g.hp[0]), nativeSceneValue((g.maxhp[0] * 0.8))))))) {
                (s.rr = 7);
            }
            if (sceneTruth((sceneTruth(lt(nativeSceneValue(v.rand), nativeSceneValue(33))) && sceneTruth(lt(nativeSceneValue(g.hp[0]), nativeSceneValue((g.maxhp[0] * 0.4))))))) {
                (s.rr = 8);
            }
            if (sceneTruth((sceneTruth(lt(nativeSceneValue(v.rand), nativeSceneValue(23))) && sceneTruth(gt(nativeSceneValue(s.turn), nativeSceneValue(8)))))) {
                (s.rr = 6);
            }
            if (sceneTruth(lt(nativeSceneValue(v.rand), nativeSceneValue(13)))) {
                (s.rr = 2);
            }
            if (sceneTruth((sceneTruth(sceneEqual(v.rand, 4)) || sceneTruth(sceneEqual(v.rand, 5))))) {
                (s.rr = 3);
            }
            if (sceneTruth((sceneTruth(sceneEqual(v.rand, 2)) || sceneTruth(sceneEqual(v.rand, 3))))) {
                (s.rr = 4);
            }
            if (sceneTruth((sceneTruth(sceneEqual(v.rand, 0)) || sceneTruth(sceneEqual(v.rand, 1))))) {
                (s.rr = 5);
            }
            if (sceneTruth((sceneTruth(sceneEqual(s.haveattacked, false)) && sceneTruth(sceneEqual(s.turn, 2))))) {
                (g.battlemsg[0] = s.dialogue_string79);
                (s.ballooncon = 0);
                scripts.speaker(s, "susie");
            }
            else if (sceneTruth(sceneEqual(g.justice_attacked_twice, 2))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_313_0"));
                (g.justice_attacked_twice++);
            }
            else if (sceneTruth(sceneEqual(s.justice_healed, 1))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_314_0"));
                (s.justice_healed++);
            }
            else if (sceneTruth(sceneEqual(s.justice_rudebuster, 1))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_315_0"));
                (s.justice_rudebuster++);
            }
            else if (sceneTruth(sceneEqual(s.justice_item, 1))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_316_0"));
                (s.justice_item++);
            }
            else if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.progress), nativeSceneValue(25))) && sceneTruth(sceneEqual(g.justice_reached_25_first_time, 0))))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_317_0"));
                (g.justice_reached_25_first_time++);
            }
            else if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.progress), nativeSceneValue(50))) && sceneTruth(sceneEqual(g.justice_reached_50_first_time, 0))))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_318_0"));
                (g.justice_reached_50_first_time++);
            }
            else if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.progress), nativeSceneValue(75))) && sceneTruth(sceneEqual(g.justice_reached_75_first_time, 0))))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_319_0"));
                (g.justice_reached_75_first_time++);
            }
            else if (sceneTruth(sceneEqual(s.rr, 0))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_320_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 1))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_321_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 2))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_322_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 3))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_323_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 4))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_324_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 5))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_325_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 6))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_326_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 7))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_327_0"));
            }
            else if (sceneTruth(sceneEqual(s.rr, 8))) {
                (g.battlemsg[0] = text("obj_hammer_of_justice_enemy_slash_Step_0_gml_328_0"));
            }
            (s.attacked = 1);
        }
    }
    if (sceneTruth(sceneEqual(s.introtalkcon, 1))) {
        if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(0)))) {
            {
                const caller11 = s;
                for (const target11 of targets(object("obj_writer"))) {
                    const other = caller11;
                    const s = target11;
                    {
                        rt.destroy(s);
                    }
                }
            }
            return true;
        }
        (s.talktimer++);
        (g.turntimer++);
        if (sceneTruth((sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.talktimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0))))) || sceneTruth(sceneEqual(s.ballooncon, 0))))) {
            {
                const caller12 = s;
                for (const target12 of targets(object("obj_writer"))) {
                    const other = caller12;
                    const s = target12;
                    {
                        rt.destroy(s);
                    }
                }
            }
            if (sceneTruth((sceneTruth(sceneEqual(s.ballooncon, 0)) && sceneTruth((sceneTruth(gt(nativeSceneValue(g.justice_attempts), nativeSceneValue(0))) || sceneTruth(sceneEqual(s.firstconversationhappened, true))))))) {
                msg(0, s.dialogue_string8);
                (s.ballooncon = 4);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 0))) {
                msg(0, s.dialogue_string4);
                (s.ballooncon = 1);
                (s.susietalks = 1);
                v.drawabove = true;
                {
                    const caller13 = s;
                    for (const target13 of targets(object("obj_herosusie"))) {
                        const other = caller13;
                        const s = target13;
                        {
                            scripts.shakeObject(s);
                        }
                    }
                }
                {
                    const caller14 = s;
                    for (const target14 of targets(object("obj_herosusie"))) {
                        const other = caller14;
                        const s = target14;
                        {
                            (s.state = 8);
                            (s.hurt = 0);
                            (s.attacktimer = 0);
                            (s.sprite = "spr_susie_hurt_lookright");
                            (s.imageSpeed = 0);
                            (s.imageIndex = 0);
                        }
                    }
                }
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 1))) {
                msg(0, s.dialogue_string5);
                (s.ballooncon = 2);
                (s.susietalks = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 2))) {
                msg(0, s.dialogue_string6);
                (s.ballooncon = 3);
                (s.susietalks = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 3))) {
                msg(0, s.dialogue_string7);
                (s.ballooncon = 4);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 4))) {
                {
                    const caller15 = s;
                    for (const target15 of targets(object("obj_herosusie"))) {
                        const other = caller15;
                        const s = target15;
                        {
                            (s.state = 0);
                            (s.hurt = 0);
                            (s.attacktimer = 0);
                            (s.attacked = 0);
                        }
                    }
                }
                (s.ballooncon = (-1));
                (s.introtalkcon = (-1));
                return true;
            }
            (g.typer = 50);
            if (sceneTruth((sceneTruth(sceneEqual(s.susietalks, 1)) && sceneTruth((targets(object("obj_herosusie")).length > 0))))) {
                (g.typer = 75);
                if (sceneTruth(sceneEqual(s.ballooncon, 1))) {
                    (s.balloon = scripts.enemyBalloon(s, (resolve(object("obj_herosusie")).x - 40), (resolve(object("obj_herosusie")).y - 78), 10));
                    (resolve(s.balloon).side = 2);
                }
                if (sceneTruth(sceneEqual(s.ballooncon, 4))) {
                    (s.balloon = scripts.enemyBalloon(s, (resolve(object("obj_herosusie")).x - 25), (resolve(object("obj_herosusie")).y - 55), 10));
                    (resolve(s.balloon).side = 2);
                }
            }
            else {
                (g.typer = 86);
                if (sceneTruth(sceneEqual(s.ballooncon, 2))) {
                    (s.balloon = scripts.enemyBalloon(...rtl(() => s, () => (rt.view.x + 430), () => (resolve(object("obj_herosusie")).y - 96), () => 10)));
                    (resolve(s.balloon).side = 2);
                }
                if (sceneTruth(sceneEqual(s.ballooncon, 3))) {
                    (s.balloon = scripts.enemyBalloon(...rtl(() => s, () => (rt.view.x + 418), () => (resolve(object("obj_herosusie")).y - 116), () => 10)));
                    (resolve(s.balloon).side = 2);
                }
                if (sceneTruth(sceneEqual(s.ballooncon, 4))) {
                    (s.balloon = scripts.enemyBalloon(...rtl(() => s, () => (rt.view.x + 430), () => (resolve(object("obj_herosusie")).y - 106), () => 10)));
                    (resolve(s.balloon).side = 2);
                }
            }
            {
                const caller16 = s;
                for (const target16 of targets(object("obj_battleblcon"))) {
                    const other = caller16;
                    const s = target16;
                    {
                        if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
                            (s.depth = (resolve(object("obj_spearblocker")).depth - 10));
                        }
                    }
                }
            }
            (s.susietalks = 0);
            (s.firstconversationhappened = true);
            (s.talktimer = 0);
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(g.mnfight, 2)) && sceneTruth(le(nativeSceneValue(g.turntimer), nativeSceneValue(1))))) && sceneTruth(sceneEqual(s.postenemyturnevent, 0)))) && sceneTruth(sceneEqual(s.end_cutscene_version, 0)))) && sceneTruth(sceneEqual(s.reachedendphase, 0))))) {
        if (sceneTruth(s.have_used_final_attack)) {
            (s.talked = (-1));
            (s.endcon = 1);
            (s.end_cutscene_version = 1);
            (g.charturn = 2);
            scripts.musicVolume(s, g.batmusic[1], 0, 90);
            return true;
        }
        (s.postturntimer = 0);
        (s.postenemyturnevent = 1);
        if (sceneTruth((sceneTruth(sceneEqual(s.trueturn, 16)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
            (s.postenemyturnevent = 2);
            (s.progress += 30);
            scripts.play(s, "snd_mercyadd");
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.trueturn, 17)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
            (s.postenemyturnevent = 3);
            (s.progress += 24);
            scripts.play(s, "snd_mercyadd");
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.trueturn, 18)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
            (s.postenemyturnevent = 4);
            (s.progress += 24);
            scripts.play(s, "snd_mercyadd");
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.trueturn, 19)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
            (s.postenemyturnevent = 5);
            (s.progress += 20);
            scripts.play(s, "snd_mercyadd");
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(g.mnfight, 2)) && sceneTruth(le(nativeSceneValue(g.turntimer), nativeSceneValue(0))))) && sceneTruth(sceneEqual(s.postenemyturnevent, 0)))) && sceneTruth(sceneEqual(s.reachedendphase, 1))))) {
        if (sceneTruth(s.have_used_final_attack)) {
            (s.talked = (-1));
            (s.endcon = 1);
            (s.end_cutscene_version = 1);
            (g.charturn = 3);
            (g.myfight = (-1));
            (g.mnfight = (-1));
            (g.turntimer = (-1));
            scripts.musicVolume(s, g.batmusic[1], 0, 90);
            return true;
        }
        (s.postenemyturnevent = 1);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.postenemyturnevent, 2)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
        (s.postturntimer++);
        create(...rtl(() => ((s.x + 10) + rt.random.irandom(80)), () => ((s.y - 60) + rt.random.irandom(40)), () => object("obj_gerson_progress_star")));
        if (sceneTruth(ge(nativeSceneValue(s.postturntimer), nativeSceneValue(30)))) {
            (s.postturntimer = 0);
            (s.postenemyturnevent = 6);
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.postenemyturnevent, 3)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
        (s.postturntimer++);
        create(...rtl(() => ((s.x + 10) + rt.random.irandom(80)), () => ((s.y - 60) + rt.random.irandom(40)), () => object("obj_gerson_progress_star")));
        if (sceneTruth(ge(nativeSceneValue(s.postturntimer), nativeSceneValue(24)))) {
            (s.postturntimer = 0);
            (s.postenemyturnevent = 6);
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.postenemyturnevent, 4)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
        (s.postturntimer++);
        create(...rtl(() => ((s.x + 10) + rt.random.irandom(80)), () => ((s.y - 60) + rt.random.irandom(40)), () => object("obj_gerson_progress_star")));
        if (sceneTruth(ge(nativeSceneValue(s.postturntimer), nativeSceneValue(24)))) {
            (s.postturntimer = 0);
            (s.postenemyturnevent = 6);
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.postenemyturnevent, 5)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
        (s.postturntimer++);
        create(...rtl(() => ((s.x + 10) + rt.random.irandom(80)), () => ((s.y - 60) + rt.random.irandom(40)), () => object("obj_gerson_progress_star")));
        if (sceneTruth(ge(nativeSceneValue(s.postturntimer), nativeSceneValue(20)))) {
            (s.postturntimer = 0);
            (s.postenemyturnevent = 6);
        }
    }
    return false;
}
