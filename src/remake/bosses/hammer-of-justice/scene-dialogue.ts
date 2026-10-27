/** Source Step block, preserving event order and event-local variables. */
import type { HammerSceneContext } from './scene-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
export function sceneDialogue({ s, rt, g, v, scripts, object, resolve, targets, create, msg, text }: HammerSceneContext): boolean {
    if (sceneTruth((sceneTruth(sceneEqual(s.susiehitbyrudebustercon, 1)) && sceneTruth(sceneEqual(s.endcon, 0))))) {
        (s.susiehitbyrudebustercon = 1.1);
        {
            const caller1 = s;
            for (const target1 of targets(object("obj_writer"))) {
                const other = caller1;
                const s = target1;
                {
                    rt.destroy(s);
                }
            }
        }
        (g.typer = 75);
        msg(0, s.dialogue_string64);
        scripts.heroBalloon(s, "susie");
        (s.talktimer = 0);
    }
    else if (sceneTruth(sceneEqual(s.susiehitbyrudebustercon, 1.1))) {
        (s.talktimer++);
        if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.talktimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            (s.susiehitbyrudebustercon = 1.2);
            {
                const caller2 = s;
                for (const target2 of targets(object("obj_writer"))) {
                    const other = caller2;
                    const s = target2;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (g.typer = 86);
            msg(0, s.dialogue_string65);
            scripts.enemyBalloon(s, (s.x - 10), g.monstery[s.myself], 10);
            (s.talktimer = 0);
        }
    }
    else if (sceneTruth(sceneEqual(s.susiehitbyrudebustercon, 1.2))) {
        (s.talktimer++);
        if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.talktimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            (s.susiehitbyrudebustercon = 2);
            {
                const caller3 = s;
                for (const target3 of targets(object("obj_writer"))) {
                    const other = caller3;
                    const s = target3;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (g.typer = 75);
            msg(0, s.dialogue_string66);
            scripts.heroBalloon(s, "susie");
            (s.talktimer = 0);
        }
    }
    if (sceneTruth(sceneEqual(s.susiehitbyrudebustercon, 2))) {
        (s.talktimer++);
        if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.talktimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            {
                const caller4 = s;
                for (const target4 of targets(object("obj_writer"))) {
                    const other = caller4;
                    const s = target4;
                    {
                        rt.destroy(s);
                    }
                }
            }
            (s.susiehitbyrudebustercon = 0);
            (s.talktimer = 0);
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth((sceneTruth(scripts.phase(s, "enemytalk")) && sceneTruth(sceneEqual(s.endcon, 0)))) && sceneTruth(sceneEqual(s.talked, 0)))) && sceneTruth(sceneEqual(s.susiehitbyrudebustercon, 0)))) && sceneTruth(sceneEqual(s.rudebusterdelay, 0)))) && sceneTruth(!sceneTruth((targets(object("obj_gerson_item_steal_anim")).length > 0))))) && sceneTruth(!sceneTruth((targets(object("obj_rudebuster_bolt")).length > 0))))) && sceneTruth(!sceneTruth((targets(object("obj_gerson_rudebuster")).length > 0)))))) {
        scripts.randomTarget(s);
        if (sceneTruth(!sceneTruth((targets(object("obj_darkener")).length > 0)))) {
            create(0, 0, object("obj_darkener"));
        }
        rt.setSpriteOffset("spr_spearblocker", 32, 32);
        (g.sp = 4);
        (s.ballooncon = 0);
        (s.balloonsubcon = 0);
        (s.balloonend = 1);
        (s.talkedcon = 0);
        (s.rtimer = 0);
        (s.postenemyturnevent = 0);
        (s.swingdown_multitelegraph = 0);
        if (sceneTruth(gt(nativeSceneValue(s.gothitlastturn), nativeSceneValue(0)))) {
            (s.beenhit = true);
        }
        (s.squishbox = false);
        (g.typer = 86);
        (s.rr = rt.random.choose(0, 1, 2));
        (s.attackcon = 0);
        if (sceneTruth(ge(nativeSceneValue(s.progress), nativeSceneValue(84)))) {
            (s.phase = 4);
            (s.trueturn = 20);
        }
        v.noballoon = false;
        v.drawabove = false;
        if (sceneTruth(ge(nativeSceneValue(s.trueturn), nativeSceneValue(20)))) {
            msg(0, s.dialogue_string53);
            (s.ballooncon = 45);
            (s.balloonend = 0);
        }
        else if (sceneTruth((sceneTruth(sceneEqual(s.turn, 0)) && sceneTruth(sceneEqual(g.justice_attempts, 0))))) {
            msg(0, s.dialogue_string1);
            (s.ballooncon = 1);
            (s.balloonend = 0);
            (s.susietalks = 1);
        }
        else if (sceneTruth((sceneTruth(sceneEqual(s.turn, 0)) && sceneTruth((sceneTruth(gt(nativeSceneValue(g.justice_attempts), nativeSceneValue(0))) || sceneTruth(sceneEqual(s.firstconversationhappened, true))))))) {
            (s.ballooncon = 1);
            (s.balloonend = 1);
            (v.noballoon = true);
        }
        else if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.turn, 1)) && sceneTruth(gt(nativeSceneValue(s.gothitlastturn), nativeSceneValue(0))))) && sceneTruth(sceneEqual(s.repeatonce, 0))))) {
            msg(0, s.dialogue_string9);
            (s.ballooncon = 2.8);
            (s.balloonend = 0);
            (s.turn = 0);
            (s.trueturn = 0);
            (s.attackpattern = 0);
            (s.repeatonce = 1);
        }
        else if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.turn, 1)) && sceneTruth(sceneEqual(s.gothitlastturn, 0)))) || sceneTruth((sceneTruth(sceneEqual(s.turn, 1)) && sceneTruth(sceneEqual(s.repeatonce, 1))))))) {
            msg(0, s.dialogue_string12);
            (s.ballooncon = 2.9);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 2))) {
            msg(0, s.dialogue_string13);
            (s.ballooncon = 10);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 3))) {
            msg(0, s.dialogue_string15);
            (s.ballooncon = 11);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 4))) {
            msg(0, s.dialogue_string18);
            (s.ballooncon = 11.5);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 5))) {
            msg(0, s.dialogue_string19);
            (s.ballooncon = 23);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 6))) {
            msg(0, s.dialogue_string21);
            (s.ballooncon = 24);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 7))) {
            msg(0, s.dialogue_string23);
            (s.ballooncon = 25);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 8))) {
            msg(0, s.dialogue_string25);
            (s.ballooncon = 26);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 9))) {
            msg(0, s.dialogue_string29);
            (s.ballooncon = 29);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 10))) {
            msg(0, s.dialogue_string35);
            (s.ballooncon = 33);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 11))) {
            msg(0, s.dialogue_string38);
            (s.ballooncon = 35);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 12))) {
            msg(0, s.dialogue_string40);
            (s.ballooncon = 36);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 13))) {
            msg(0, s.dialogue_string43);
            (s.ballooncon = 38);
            (s.balloonend = 0);
            (s.susietalks = 1);
        }
        else if (sceneTruth(sceneEqual(s.turn, 14))) {
            msg(0, s.dialogue_string47);
            (s.ballooncon = 41);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 15))) {
            msg(0, s.dialogue_string50);
            (s.ballooncon = 43);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 16))) {
            msg(0, s.dialogue_string70);
            (s.ballooncon = 0);
            (s.balloonend = 1);
        }
        else if (sceneTruth(sceneEqual(s.turn, 17))) {
            msg(0, s.dialogue_string71);
            (s.ballooncon = 52);
            (s.balloonend = 0);
        }
        else if (sceneTruth(sceneEqual(s.turn, 18))) {
            msg(0, s.dialogue_string73);
            (s.ballooncon = 53);
            (s.balloonend = 0);
        }
        else {
            if (sceneTruth(sceneEqual(s.rr, 0))) {
                msg(0, s.dialogue_string76);
            }
            if (sceneTruth(sceneEqual(s.rr, 1))) {
                msg(0, s.dialogue_string77);
            }
            if (sceneTruth(sceneEqual(s.rr, 2))) {
                msg(0, s.dialogue_string78);
            }
            (s.ballooncon = 0);
            (s.balloonend = 1);
        }
        if (sceneTruth(sceneEqual(v.noballoon, true))) {
            (s.talked = 1);
            (s.talktimer = 0);
        }
        else {
            if (sceneTruth((sceneTruth(sceneEqual(s.susietalks, 1)) && sceneTruth((targets(object("obj_herosusie")).length > 0))))) {
                (g.typer = 75);
                scripts.heroBalloon(s, "susie");
            }
            else {
                scripts.enemyBalloon(s, (s.x - 10), g.monstery[s.myself], 10);
            }
            (s.susietalks = 0);
            (s.gothitlastturn = 0);
            rt.userEvent(s, 0);
            if (sceneTruth(sceneEqual(s.ballooncon, 0))) {
                (s.talked = 1);
                (s.talktimer = 0);
            }
            else {
                (s.talked = 0.6);
                (s.talktimer = 0);
            }
        }
    }
    if (sceneTruth(sceneEqual(s.talked, 0.6))) {
        (s.talktimer++);
        if (sceneTruth((sceneTruth((sceneTruth((rt.input.pressed.has(67) || rt.input.pressed.has(17))) && sceneTruth(gt(nativeSceneValue(s.talktimer), nativeSceneValue(15))))) || sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            {
                const caller5 = s;
                for (const target5 of targets(object("obj_writer"))) {
                    const other = caller5;
                    const s = target5;
                    {
                        rt.destroy(s);
                    }
                }
            }
            if (sceneTruth(sceneEqual(s.ballooncon, 1))) {
                msg(0, s.dialogue_string2);
                (s.ballooncon = 2);
                (s.balloonend = 0);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 2))) {
                msg(0, s.dialogue_string3);
                (s.ballooncon = 2.5);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 2.5))) {
                msg(0, s.dialogue_string3b);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 2.8))) {
                msg(0, s.dialogue_string9b);
                (s.ballooncon = 0);
                (s.balloonend = 1);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 2.9))) {
                msg(0, s.dialogue_string12b);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 10))) {
                msg(0, s.dialogue_string14);
                (s.ballooncon = 10.1);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 10.1))) {
                msg(0, s.dialogue_string14b);
                (s.ballooncon = 10.2);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 10.2))) {
                msg(0, s.dialogue_string14c);
                (s.ballooncon = 0);
                (s.balloonend = 1);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 11))) {
                msg(0, s.dialogue_string16);
                (s.ballooncon = 12);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 11.5))) {
                msg(0, s.dialogue_string18b);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 23))) {
                msg(0, s.dialogue_string20);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 24))) {
                msg(0, s.dialogue_string22);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 25))) {
                msg(0, s.dialogue_string24);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 26))) {
                msg(0, s.dialogue_string26);
                (s.ballooncon = 27);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 27))) {
                msg(0, s.dialogue_string27);
                (s.ballooncon = 28);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 28))) {
                msg(0, s.dialogue_string28);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 29))) {
                msg(0, s.dialogue_string30);
                (s.ballooncon = 30);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 30))) {
                msg(0, s.dialogue_string31);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 31))) {
                msg(0, s.dialogue_string33);
                (s.ballooncon = 32);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 32))) {
                msg(0, s.dialogue_string34);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 33))) {
                msg(0, s.dialogue_string36);
                (s.ballooncon = 34);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 34))) {
                msg(0, s.dialogue_string37);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 35))) {
                msg(0, s.dialogue_string39);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 36))) {
                msg(0, s.dialogue_string41);
                (s.ballooncon = 37);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 37))) {
                msg(0, s.dialogue_string42);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 38))) {
                msg(0, s.dialogue_string44);
                (s.ballooncon = 39);
                (s.balloonend = 0);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 39))) {
                msg(0, s.dialogue_string45);
                (s.ballooncon = 40);
                (s.balloonend = 0);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 40))) {
                msg(0, s.dialogue_string46);
                (s.ballooncon = 0);
                (s.balloonend = 1);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 41))) {
                msg(0, s.dialogue_string48);
                (s.ballooncon = 42);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 42))) {
                msg(0, s.dialogue_string49);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 43))) {
                msg(0, s.dialogue_string51);
                (s.ballooncon = 44);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 44))) {
                msg(0, s.dialogue_string52);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 45))) {
                msg(0, s.dialogue_string54);
                (s.ballooncon = 46);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 46))) {
                msg(0, s.dialogue_string55);
                (s.ballooncon = 47);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 47))) {
                msg(0, s.dialogue_string56);
                (s.ballooncon = 48);
                (s.balloonend = 0);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 48))) {
                msg(0, s.dialogue_string57);
                (s.ballooncon = 49);
                (s.balloonend = 0);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 49))) {
                msg(0, s.dialogue_string58);
                (s.ballooncon = 50);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 50))) {
                msg(0, s.dialogue_string59);
                (s.ballooncon = 0);
                (s.balloonend = 1);
                (s.susietalks = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 51))) {
                msg(0, s.dialogue_string68);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 52))) {
                msg(0, s.dialogue_string72);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 53))) {
                msg(0, s.dialogue_string74);
                (s.ballooncon = 54);
                (s.balloonend = 0);
            }
            else if (sceneTruth(sceneEqual(s.ballooncon, 54))) {
                msg(0, s.dialogue_string75);
                (s.ballooncon = 0);
                (s.balloonend = 1);
            }
            (s.talked = 0.7);
            (g.typer = 86);
            if (sceneTruth((sceneTruth(sceneEqual(s.susietalks, 1)) && sceneTruth((targets(object("obj_herosusie")).length > 0))))) {
                (g.typer = 75);
                scripts.heroBalloon(s, "susie");
            }
            else {
                scripts.enemyBalloon(s, (s.x - 10), g.monstery[s.myself], 10);
            }
            (s.susietalks = 0);
            (s.alarm[6] = 1);
        }
    }
    return false;
}
