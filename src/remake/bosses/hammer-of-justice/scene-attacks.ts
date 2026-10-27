/** Source Step block, preserving event order and event-local variables. */
import type { HammerSceneContext } from './scene-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge } from '../../gm/math';
export function sceneAttacks({ s, rt, g, v, scripts, object, resolve, targets, create, msg, text }: HammerSceneContext): boolean {
    if (sceneTruth(sceneEqual(g.myfight, 3))) {
        (s.xx = ([rt.view.x, rt.view.y, rt.view.width, rt.view.height][0]!));
        (s.yy = ([rt.view.x, rt.view.y, rt.view.width, rt.view.height][1]!));
        if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.actcon, 20)) || sceneTruth(sceneEqual(s.actconsus, 20)))) || sceneTruth(sceneEqual(s.actconral, 20))))) {
            if (sceneTruth(scripts.terminateWriter(s))) {
                (s.actconsus = (-1));
                (s.actconral = (-1));
                (s.actcon = 1);
            }
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.actcon, 1)) && sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            scripts.nextAct(s);
        }
    }
    if (sceneTruth(sceneEqual(s.state, 3))) {
        scripts.hurt(s);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.attackcon, 1)) && sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
        if (sceneTruth(lt(nativeSceneValue(s.attackcount), nativeSceneValue(s.attackcountmax)))) {
            scripts.spearShot(s, s.list_attackdirection[s.attackcount], s.list_attackspeed[s.attackcount], s.list_attackframes[s.attackcount], s.list_attackspecial[s.attackcount], s.list_attackspecial2[s.attackcount]);
            (s.attackcon = 2);
        }
        else {
            (s.attackcon = 3);
            (s.rudebusterhitcount = 0);
            (s.swingdown_ex = 0);
        }
        (s.attackcount++);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.attackcon, 2)) && sceneTruth(!sceneTruth((targets(object("obj_gerson_growtangle")).length > 0)))))) {
        (s.attacktimer++);
        if (sceneTruth((sceneTruth(ge(nativeSceneValue(s.attacktimer), nativeSceneValue(s.list_attackwait[(s.attackcount - 1)]))) && sceneTruth(!sceneTruth((targets(object("obj_writer")).length > 0)))))) {
            (s.attacktimer = 0);
            (s.attackcon = 1);
            if (sceneTruth(sceneEqual(s.reachedendphase, 1))) {
                (s.have_used_final_attack = true);
            }
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.attackcon, 3)) && sceneTruth(gt(nativeSceneValue(g.turntimer), nativeSceneValue(10))))) && sceneTruth(!sceneTruth((targets(object("obj_spearshot")).length > 0)))))) {
        (g.turntimer = 10);
        (s.attackcon = 0);
    }
    if (sceneTruth((sceneTruth((sceneTruth(false) && sceneTruth(false))) && sceneTruth(scripts.phase(s, "bullets"))))) {
        rt.userEvent(s, 14);
    }
    if (sceneTruth(sceneEqual(s.attackcon, 0))) {
        (resolve(object("obj_battlecontroller")).depth = s.savebattlecontrollerdepth);
    }
    if (sceneTruth(sceneEqual(s.hitbox_con, 1))) {
        (s.hitbox_con = 0);
        {
            const caller17 = s;
            for (const target17 of targets(object("obj_growtangle"))) {
                const other = caller17;
                const s = target17;
                {
                    (resolve(object("obj_growtangle")).hspeed = 16);
                    (resolve(object("obj_growtangle")).friction = 0.8);
                    {
                        const caller18 = s;
                        for (const target18 of targets(object("obj_heart"))) {
                            const other = caller18;
                            const s = target18;
                            {
                                (s.hspeed = 16);
                                (s.friction = 0.8);
                            }
                        }
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.hitbox_con, 2))) {
        (s.hitbox_con = 0);
        {
            const caller19 = s;
            for (const target19 of targets(object("obj_growtangle"))) {
                const other = caller19;
                const s = target19;
                {
                    (resolve(object("obj_growtangle")).hspeed = (-16));
                    (resolve(object("obj_growtangle")).friction = 0.8);
                    {
                        const caller20 = s;
                        for (const target20 of targets(object("obj_heart"))) {
                            const other = caller20;
                            const s = target20;
                            {
                                (s.hspeed = (-16));
                                (s.friction = 0.8);
                            }
                        }
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.mercylaughcon, 1))) {
        (s.mercylaughtimer++);
        (s.state = 12);
        rt.setSpriteOffset("spr_gerson_laugh", 14, 22);
        (s.sprite = "spr_gerson_laugh");
        if (sceneTruth(sceneEqual(s.mercylaughtimer, 1))) {
            scripts.play(s, "snd_mercyadd");
        }
        if (sceneTruth(sceneEqual((s.mercylaughtimer % 2), 0))) {
            (s.star = create(...rtl(() => ((s.x + 10) + rt.random.irandom(80)), () => ((s.y - 60) + rt.random.irandom(40)), () => object("obj_gerson_progress_star"))));
        }
        if (sceneTruth(sceneEqual(s.mercylaughtimer, (((s.mercylaughcount + 1) * 2) - 1)))) {
            (s.state = 0);
            (s.sprite = "spr_gerson_idle");
            (s.mercylaughcon = 0);
            (s.mercylaughtimer = 0);
        }
    }
    {
        const caller21 = s;
        for (const target21 of targets(object("obj_growtangle"))) {
            const other = caller21;
            const s = target21;
            {
                if (sceneTruth(!sceneEqual(s.hspeed, 0))) {
                    scripts.afterimage(s);
                    if (sceneTruth((targets(s.afterimage).length > 0))) {
                        (resolve(s.afterimage).fadeSpeed = 0.2);
                    }
                }
            }
        }
    }
    return false;
}
