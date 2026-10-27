import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import type { Resources, HammerAttackHost } from './attack-families';
import { createObjectContext, sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, clamp, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
import { createDrawContext } from './draw-context';
function sourceArray(s: any, key: string): any[] { if (!(key in s)) {
    s[key] = [];
}
else if (!Array.isArray(s[key]))
    s[key] = [s[key]]; return s[key]; }
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    bulletInit(s);
    (s.damage = nativeSceneValue(40));
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.type = nativeSceneValue(2));
    (s.dir = nativeSceneValue(0));
    (s.imageXscale = nativeSceneValue(1));
    (s.imageYscale = nativeSceneValue(1));
    (s.imageAngle = nativeSceneValue(180));
    (s.imageAlpha = nativeSceneValue(0));
    (s.depth = nativeSceneValue((-99999)));
    (s.fakex = nativeSceneValue(0));
    (s.fakehspeed = nativeSceneValue((-10)));
    (s.fakealpha = nativeSceneValue(0));
    (s.fadecon = nativeSceneValue(0));
    (s.breakcon = nativeSceneValue(0));
    (s.fadealpha = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
    fog(true, 0xffffff, 0, 1);
    drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, 0xffffff, s.fadealpha);
    fog(false, 0, 0, 0);
    if (sceneTruth(gt(nativeSceneValue(s.fadealpha), nativeSceneValue(0)))) {
        (s.fadealpha -= nativeSceneValue(0.1));
    }
}
export function Draw64(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; rt.drawState.color = 0xffffff; }
export function Other24(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.con, 0)) && sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(8))))) || sceneTruth(!sceneEqual(s.con, 0))))) {
        (s.fakex += nativeSceneValue(s.fakehspeed));
        if (sceneTruth(lt(nativeSceneValue(s.fakehspeed), nativeSceneValue(0)))) {
            (s.fakehspeed += nativeSceneValue(0.6));
        }
        else {
            (s.fakehspeed = nativeSceneValue(0));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 3))) {
            host.call(s, "snd_play", "motor_upper_quick");
        }
        v.a = lerp(900, 490, (s.timer / 20));
        v.b = lerp(120, 50, (s.timer / 20));
        v.c = lerp(240, 100, (s.timer / 20));
        (s.imageAngle = nativeSceneValue(lerp(200, v.a, (s.timer / 20))));
        if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(21)))) {
            (s.imageAlpha += nativeSceneValue(0.04));
            (s.x = nativeSceneValue(lerp(s.xstart, (s.xstart - v.b), (s.timer / 20))));
            (s.y = nativeSceneValue(lerp(s.ystart, (s.ystart - v.c), (s.timer / 20))));
        }
        if (sceneTruth(sceneEqual(s.timer, 20))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(1));
            (s.fadecon = nativeSceneValue(1));
            host.call(s, "snd_play", "snd_punchheavythunder");
            host.call(s, "snd_play", "snd_break2");
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 3))) {
            (s.breakcon = nativeSceneValue(1));
        }
        v.a = lerp(0, 260, (s.timer / 9));
        (s.imageAngle = nativeSceneValue(lerp(500, v.a, (s.timer / 9))));
        if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
            (s.x = nativeSceneValue(lerp((s.xstart - 50), s.xstart, (s.timer / 6))));
            (s.y = nativeSceneValue(lerp((s.ystart - 100), (s.ystart + 100), (s.timer / 6))));
        }
        if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(9)))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (s.timer++);
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(5)))) {
            (s.imageAlpha -= nativeSceneValue(0.2));
        }
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            rt.destroy(s);
        }
    }
    if (sceneTruth(sceneEqual(s.fadecon, 1))) {
        (s.fakealpha += nativeSceneValue(0.2));
        if (sceneTruth(gt(nativeSceneValue(s.fakealpha), nativeSceneValue(1.2)))) {
            (s.fadecon = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.fadecon, 2))) {
        (s.fakealpha -= nativeSceneValue(0.2));
        if (sceneTruth(lt(nativeSceneValue(s.fakealpha), nativeSceneValue(0)))) {
            (s.fadecon = nativeSceneValue(0));
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.type, 2)) && sceneTruth(sceneEqual(s.con, 2))))) {
    }
    else {
        v.a = host.call(s, "scr_afterimage");
        (resolve(v.a).fadeSpeed = nativeSceneValue(0.08));
        (resolve(v.a).imageAlpha = nativeSceneValue(s.imageAlpha));
    }
    if (sceneTruth(sceneEqual(s.breakcon, 1))) {
        (s.breakcon = nativeSceneValue(2));
        {
            const caller22 = s;
            for (const target22 of targets(object("obj_spearblocker"))) {
                const other = caller22;
                const s = target22;
                {
                    (s.piece1 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(32, (s.imageAngle - 35))), () => (s.y + lengthdirY(32, (s.imageAngle - 35))), () => object("obj_spearblocker_piece")))));
                    (resolve(s.piece1).imageAngle = nativeSceneValue(s.imageAngle));
                    (resolve(s.piece1).imageIndex = nativeSceneValue(1));
                    (s.piece2 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(32, (s.imageAngle + 35))), () => (s.y + lengthdirY(32, (s.imageAngle + 35))), () => object("obj_spearblocker_piece")))));
                    (resolve(s.piece2).imageAngle = nativeSceneValue(s.imageAngle));
                    (resolve(s.piece2).imageIndex = nativeSceneValue(0));
                    (s.piece3 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 45)), () => (s.y + lengthdirY(30, 45)), () => object("obj_spearblocker_piece")))));
                    (resolve(s.piece3).sprite = nativeSceneValue("spr_green_circle_piece"));
                    (resolve(s.piece3).imageAngle = nativeSceneValue(0));
                    (s.piece4 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 135)), () => (s.y + lengthdirY(30, 135)), () => object("obj_spearblocker_piece")))));
                    (resolve(s.piece4).sprite = nativeSceneValue("spr_green_circle_piece"));
                    (resolve(s.piece4).imageAngle = nativeSceneValue(90));
                    (s.piece5 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 225)), () => (s.y + lengthdirY(30, 225)), () => object("obj_spearblocker_piece")))));
                    (resolve(s.piece5).sprite = nativeSceneValue("spr_green_circle_piece"));
                    (resolve(s.piece5).imageAngle = nativeSceneValue(180));
                    (s.piece6 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 315)), () => (s.y + lengthdirY(30, 315)), () => object("obj_spearblocker_piece")))));
                    (resolve(s.piece6).sprite = nativeSceneValue("spr_green_circle_piece"));
                    (resolve(s.piece6).imageAngle = nativeSceneValue(270));
                    if (sceneTruth(sceneEqual(s.idealdir, 180))) {
                        (resolve(s.piece1).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                        (resolve(s.piece1).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                        (resolve(s.piece2).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                        (resolve(s.piece2).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                        (resolve(s.piece3).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                        (resolve(s.piece3).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                        (resolve(s.piece4).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                        (resolve(s.piece4).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                        (resolve(s.piece5).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                        (resolve(s.piece5).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                        (resolve(s.piece6).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                        (resolve(s.piece6).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                    }
                    if (sceneTruth(sceneEqual(s.idealdir, 0))) {
                        (resolve(s.piece1).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                        (resolve(s.piece1).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                        (resolve(s.piece2).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                        (resolve(s.piece2).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                        (resolve(s.piece3).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                        (resolve(s.piece3).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                        (resolve(s.piece4).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                        (resolve(s.piece4).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                        (resolve(s.piece5).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                        (resolve(s.piece5).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                        (resolve(s.piece6).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                        (resolve(s.piece6).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                    }
                    if (sceneTruth(sceneEqual(s.idealdir, 90))) {
                        (resolve(s.piece1).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece1).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                        (resolve(s.piece2).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece2).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                        (resolve(s.piece3).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece3).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                        (resolve(s.piece4).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece4).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                        (resolve(s.piece5).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece5).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                        (resolve(s.piece6).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece6).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                    }
                    if (sceneTruth(sceneEqual(s.idealdir, 270))) {
                        (resolve(s.piece1).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece1).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                        (resolve(s.piece2).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece2).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                        (resolve(s.piece3).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece3).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                        (resolve(s.piece4).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece4).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                        (resolve(s.piece5).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece5).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                        (resolve(s.piece6).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                        (resolve(s.piece6).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                    }
                    rt.destroy(s);
                }
            }
        }
        {
            const caller23 = s;
            for (const target23 of targets(object("obj_spearshot"))) {
                const other = caller23;
                const s = target23;
                {
                    rt.destroy(s);
                }
            }
        }
        host.call(s, "scr_heartcolor", "red");
    }
}
export function Other25(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.type, 0))) {
        if (sceneTruth(sceneEqual(s.con, 2))) {
            (s.fakex += nativeSceneValue(s.fakehspeed));
            if (sceneTruth(lt(nativeSceneValue(s.fakehspeed), nativeSceneValue(0)))) {
                (s.fakehspeed += nativeSceneValue(0.6));
            }
            else {
                (s.fakehspeed = nativeSceneValue(0));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 0))) {
            (s.timer++);
            if (sceneTruth(sceneEqual(s.timer, 3))) {
                host.call(s, "snd_play", "motor_upper_quick");
            }
            v.a = lerp(600, 360, (s.timer / 20));
            v.b = lerp(120, 50, (s.timer / 20));
            v.c = lerp(240, 100, (s.timer / 20));
            (s.imageAngle = nativeSceneValue(lerp(200, v.a, (s.timer / 20))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(21)))) {
                (s.imageAlpha += nativeSceneValue(0.04));
                (s.x = nativeSceneValue(lerp(s.xstart, ((s.xstart - v.b) + s.fakex), (s.timer / 20))));
                (s.y = nativeSceneValue(lerp(s.ystart, (s.ystart - v.c), (s.timer / 20))));
            }
            if (sceneTruth(sceneEqual(s.timer, 20))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(1));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 1))) {
            (s.timer++);
            if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(2));
                host.call(s, "snd_play", "motor_upper_quick_high");
            }
        }
        if (sceneTruth(sceneEqual(s.con, 2))) {
            (s.timer++);
            (s.x = nativeSceneValue(lerp(s.xstart, ((s.xstart - 50) + s.fakex), 1)));
            if (sceneTruth(sceneEqual(s.timer, 20))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(3));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 3))) {
            (s.gravityDirection = nativeSceneValue(0));
            (s.gravity = nativeSceneValue(5));
            (s.timer++);
            if (sceneTruth(sceneEqual(s.timer, 7))) {
                host.call(s, "snd_play", "snd_punchheavythunder");
                host.call(s, "snd_play", "snd_break2");
                (s.fadecon = nativeSceneValue(1));
                (s.breakcon = nativeSceneValue(1));
            }
            if (sceneTruth(sceneEqual(s.timer, 90))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(4));
            }
        }
    }
    if (sceneTruth(sceneEqual(s.type, 1))) {
        if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.con, 0)) && sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(8))))) || sceneTruth(!sceneEqual(s.con, 0))))) {
            (s.fakex += nativeSceneValue(s.fakehspeed));
            if (sceneTruth(lt(nativeSceneValue(s.fakehspeed), nativeSceneValue(0)))) {
                (s.fakehspeed += nativeSceneValue(0.6));
            }
            else {
                (s.fakehspeed = nativeSceneValue(0));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 0))) {
            (s.timer++);
            if (sceneTruth(sceneEqual(s.timer, 3))) {
                host.call(s, "snd_play", "motor_upper_quick");
            }
            v.a = lerp(600, 360, (s.timer / 20));
            v.b = lerp(120, 50, (s.timer / 20));
            v.c = lerp(240, 100, (s.timer / 20));
            (s.imageAngle = nativeSceneValue(lerp(200, v.a, (s.timer / 20))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(21)))) {
                (s.imageAlpha += nativeSceneValue(0.04));
                (s.x = nativeSceneValue(lerp(s.xstart, ((s.xstart - v.b) + s.fakex), (s.timer / 20))));
                (s.y = nativeSceneValue(lerp(s.ystart, (s.ystart - v.c), (s.timer / 20))));
            }
            if (sceneTruth(sceneEqual(s.timer, 20))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(1));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 1))) {
            (s.timer++);
            (s.x = nativeSceneValue(lerp(s.xstart, ((s.xstart - 50) + s.fakex), 1)));
            if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(2));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 2))) {
            (s.timer++);
            (s.x = nativeSceneValue(lerp(s.xstart, ((s.xstart - 50) + s.fakex), 1)));
            if (sceneTruth(sceneEqual(s.timer, 7))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(3));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 3))) {
            (s.gravityDirection = nativeSceneValue(0));
            (s.gravity = nativeSceneValue(5));
            (s.timer++);
            if (sceneTruth(sceneEqual(s.timer, 7))) {
                host.call(s, "snd_play", "snd_punchheavythunder");
                host.call(s, "snd_play", "snd_break2");
                (s.fadecon = nativeSceneValue(1));
                (s.breakcon = nativeSceneValue(1));
            }
            if (sceneTruth(sceneEqual(s.timer, 50))) {
                rt.destroy(s);
            }
        }
    }
    if (sceneTruth(sceneEqual(s.type, 2))) {
        if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.con, 0)) && sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(8))))) || sceneTruth(!sceneEqual(s.con, 0))))) {
            (s.fakex += nativeSceneValue(s.fakehspeed));
            if (sceneTruth(lt(nativeSceneValue(s.fakehspeed), nativeSceneValue(0)))) {
                (s.fakehspeed += nativeSceneValue(0.6));
            }
            else {
                (s.fakehspeed = nativeSceneValue(0));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 0))) {
            (s.timer++);
            if (sceneTruth(sceneEqual(s.timer, 3))) {
                host.call(s, "snd_play", "motor_upper_quick");
            }
            v.a = lerp(900, 490, (s.timer / 20));
            v.b = lerp(120, 50, (s.timer / 20));
            v.c = lerp(240, 100, (s.timer / 20));
            (s.imageAngle = nativeSceneValue(lerp(200, v.a, (s.timer / 20))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(21)))) {
                (s.imageAlpha += nativeSceneValue(0.04));
                (s.x = nativeSceneValue(lerp(s.xstart, (s.xstart - v.b), (s.timer / 20))));
                (s.y = nativeSceneValue(lerp(s.ystart, (s.ystart - v.c), (s.timer / 20))));
            }
            if (sceneTruth(sceneEqual(s.timer, 20))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(1));
                (s.fadecon = nativeSceneValue(1));
                host.call(s, "snd_play", "snd_punchheavythunder");
                host.call(s, "snd_play", "snd_break2");
            }
        }
        if (sceneTruth(sceneEqual(s.con, 1))) {
            (s.timer++);
            if (sceneTruth(sceneEqual(s.timer, 3))) {
                (s.breakcon = nativeSceneValue(1));
            }
            v.a = lerp(0, 260, (s.timer / 9));
            (s.imageAngle = nativeSceneValue(lerp(500, v.a, (s.timer / 9))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.x = nativeSceneValue(lerp((s.xstart - 50), s.xstart, (s.timer / 6))));
                (s.y = nativeSceneValue(lerp((s.ystart - 100), (s.ystart + 100), (s.timer / 6))));
            }
            if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(9)))) {
                (s.timer = nativeSceneValue(0));
                (s.con = nativeSceneValue(2));
            }
        }
        if (sceneTruth(sceneEqual(s.con, 2))) {
            (s.timer++);
            if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(5)))) {
                (s.imageAlpha -= nativeSceneValue(0.2));
            }
            if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
                rt.destroy(s);
            }
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.con, 0)) && sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(8))))) || sceneTruth(!sceneEqual(s.con, 0))))) {
        (s.fakex += nativeSceneValue(s.fakehspeed));
        if (sceneTruth(lt(nativeSceneValue(s.fakehspeed), nativeSceneValue(0)))) {
            (s.fakehspeed += nativeSceneValue(0.6));
        }
        else {
            (s.fakehspeed = nativeSceneValue(0));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 0))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 3))) {
            host.call(s, "snd_play", "motor_upper_quick");
        }
        if (sceneTruth(sceneEqual(s.dir, 270))) {
            v.a = lerp(900, 490, (s.timer / 14));
            v.b = lerp(100, 50, (s.timer / 14));
            v.c = lerp(200, 100, (s.timer / 14));
            (s.imageAngle = nativeSceneValue(lerp(250, v.a, (s.timer / 14))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(16)))) {
                (s.imageAlpha += nativeSceneValue(0.06));
                (s.x = nativeSceneValue(lerp((s.xstart - v.b), (s.xstart - v.b), (s.timer / 14))));
                (s.y = nativeSceneValue(lerp((s.ystart - 20), ((s.ystart - 20) - v.c), (s.timer / 14))));
            }
        }
        if (sceneTruth(sceneEqual(s.dir, 0))) {
            v.a = lerp(990, 580, (s.timer / 14));
            (s.imageAngle = nativeSceneValue(lerp(340, v.a, (s.timer / 14))));
            v.c = lerp(200, 100, (s.timer / 14));
            v.b = lerp(100, 120, (s.timer / 14));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(16)))) {
                (s.imageAlpha += nativeSceneValue(0.06));
                (s.x = nativeSceneValue(lerp((s.xstart - 20), ((s.xstart - 20) - v.c), (s.timer / 14))));
                (s.y = nativeSceneValue(lerp((s.ystart + v.b), (s.ystart + v.b), (s.timer / 14))));
            }
        }
        if (sceneTruth(sceneEqual(s.dir, 90))) {
            v.a = lerp(1080, 670, (s.timer / 14));
            (s.imageAngle = nativeSceneValue(lerp(430, v.a, (s.timer / 14))));
            v.b = lerp(100, 50, (s.timer / 14));
            v.c = lerp(200, 100, (s.timer / 14));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(16)))) {
                (s.imageAlpha += nativeSceneValue(0.06));
                (s.x = nativeSceneValue(lerp((s.xstart + v.b), (s.xstart + v.b), (s.timer / 14))));
                (s.y = nativeSceneValue(lerp((s.ystart + 20), ((s.ystart + 20) + v.c), (s.timer / 14))));
            }
        }
        if (sceneTruth(sceneEqual(s.dir, 180))) {
            v.a = lerp(1170, 760, (s.timer / 14));
            (s.imageAngle = nativeSceneValue(lerp(520, v.a, (s.timer / 14))));
            v.c = lerp(200, 100, (s.timer / 14));
            v.b = lerp(100, 120, (s.timer / 14));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(16)))) {
                (s.imageAlpha += nativeSceneValue(0.06));
                (s.x = nativeSceneValue(lerp((s.xstart + 20), ((s.xstart + 20) + v.c), (s.timer / 14))));
                (s.y = nativeSceneValue(lerp((s.ystart - v.b), (s.ystart - v.b), (s.timer / 14))));
            }
        }
        if (sceneTruth(sceneEqual(s.timer, 15))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(1));
            (s.fadecon = nativeSceneValue(1));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 1))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 3))) {
            (s.breakcon = nativeSceneValue(1));
        }
        if (sceneTruth(sceneEqual(s.dir, 270))) {
            v.a = lerp(0, 260, (s.timer / 9));
            (s.imageAngle = nativeSceneValue(lerp(500, v.a, (s.timer / 9))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.x = nativeSceneValue(lerp((s.xstart - 50), s.xstart, (s.timer / 6))));
                (s.y = nativeSceneValue(lerp((s.ystart - 120), (s.ystart + 100), (s.timer / 6))));
            }
        }
        if (sceneTruth(sceneEqual(s.dir, 0))) {
            v.a = lerp(90, 350, (s.timer / 9));
            (s.imageAngle = nativeSceneValue(lerp(590, v.a, (s.timer / 9))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.x = nativeSceneValue(lerp((s.xstart - 100), (s.xstart + 100), (s.timer / 6))));
                (s.y = nativeSceneValue(lerp((s.ystart + 50), s.ystart, (s.timer / 6))));
            }
        }
        if (sceneTruth(sceneEqual(s.dir, 90))) {
            v.a = lerp(180, 440, (s.timer / 9));
            (s.imageAngle = nativeSceneValue(lerp(680, v.a, (s.timer / 9))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.x = nativeSceneValue(lerp((s.xstart + 50), s.xstart, (s.timer / 6))));
                (s.y = nativeSceneValue(lerp((s.ystart + 120), (s.ystart - 100), (s.timer / 6))));
            }
        }
        if (sceneTruth(sceneEqual(s.dir, 180))) {
            v.a = lerp(270, 530, (s.timer / 9));
            (s.imageAngle = nativeSceneValue(lerp(770, v.a, (s.timer / 9))));
            if (sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(6)))) {
                (s.x = nativeSceneValue(lerp((s.xstart + 100), (s.xstart - 100), (s.timer / 6))));
                (s.y = nativeSceneValue(lerp((s.ystart - 50), s.ystart, (s.timer / 6))));
            }
        }
        if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(9)))) {
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.con, 2))) {
        (s.timer++);
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(5)))) {
            (s.imageAlpha -= nativeSceneValue(0.2));
        }
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            rt.destroy(s);
        }
    }
    if (sceneTruth(sceneEqual(s.fadecon, 1))) {
        (s.fakealpha += nativeSceneValue(0.2));
        if (sceneTruth(gt(nativeSceneValue(s.fakealpha), nativeSceneValue(1.2)))) {
            (s.fadecon = nativeSceneValue(2));
        }
    }
    if (sceneTruth(sceneEqual(s.fadecon, 2))) {
        (s.fakealpha -= nativeSceneValue(0.2));
        if (sceneTruth(lt(nativeSceneValue(s.fakealpha), nativeSceneValue(0)))) {
            (s.fadecon = nativeSceneValue(0));
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.type, 2)) && sceneTruth(sceneEqual(s.con, 2)))) || sceneTruth(sceneEqual(s.breakcon, 2))))) {
    }
    else {
        v.a = host.call(s, "scr_afterimage");
        (resolve(v.a).fadeSpeed = nativeSceneValue(0.08));
        (resolve(v.a).imageAlpha = nativeSceneValue(s.imageAlpha));
    }
    if (sceneTruth(sceneEqual(s.breakcon, 1))) {
        (s.breakcon = nativeSceneValue(3));
        v.shielddir = (resolve(object("obj_spearblocker")).imageAngle + 180);
        if (sceneTruth(ge(nativeSceneValue(v.shielddir), nativeSceneValue(360)))) {
            (v.shielddir -= nativeSceneValue(360));
        }
        if (sceneTruth(lt(nativeSceneValue(Math.abs((((((s.dir) - (v.shielddir)) % 360 + 540) % 360) - 180))), nativeSceneValue(61)))) {
            (s.breakcon = nativeSceneValue(2));
            (s.timer = nativeSceneValue(0));
            (s.con = nativeSceneValue(3));
        }
    }
    if (sceneTruth(sceneEqual(s.breakcon, 2))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 1))) {
            if (sceneTruth(sceneEqual(s.dir, 270))) {
                (s.imageAngle = nativeSceneValue(0));
                (s.y -= nativeSceneValue(39));
            }
            if (sceneTruth(sceneEqual(s.dir, 0))) {
                (s.imageAngle = nativeSceneValue(90));
                (s.x -= nativeSceneValue(39));
            }
            if (sceneTruth(sceneEqual(s.dir, 90))) {
                (s.imageAngle = nativeSceneValue(180));
                (s.y += nativeSceneValue(39));
            }
            if (sceneTruth(sceneEqual(s.dir, 180))) {
                (s.imageAngle = nativeSceneValue(270));
                (s.x += nativeSceneValue(39));
            }
            (s.fadealpha = nativeSceneValue(1));
            host.call(s, "snd_play", "snd_impact");
            host.call(s, "scr_shakeobj");
            create(s.x, s.y, object("obj_shake"));
            {
                const caller24 = s;
                for (const target24 of targets(object("obj_afterimage"))) {
                    const other = caller24;
                    const s = target24;
                    {
                        rt.destroy(s);
                    }
                }
            }
            {
                const caller25 = s;
                for (const target25 of targets(object("obj_spearblocker"))) {
                    const other = caller25;
                    const s = target25;
                    {
                        (s.shake = nativeSceneValue(10));
                        (s.fadealpha = nativeSceneValue(1));
                    }
                }
            }
        }
        if (sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(8)))) {
            (s.imageAlpha -= nativeSceneValue(0.1));
            if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
                rt.destroy(s);
            }
        }
        if (sceneTruth(sceneEqual(s.timer, 7))) {
            {
                const caller26 = s;
                for (const target26 of targets(object("obj_heart"))) {
                    const other = caller26;
                    const s = target26;
                    {
                        (s.anim = nativeSceneValue(create((s.x + 10), (s.y + 10), object("obj_animation"))));
                        (resolve(s.anim).sprite = nativeSceneValue("spr_finisher_explosion"));
                        (resolve(s.anim).imageSpeed = nativeSceneValue(0.5));
                        (resolve(s.anim).imageIndex = nativeSceneValue(0));
                        (resolve(s.anim).imageXscale = nativeSceneValue(1));
                        (resolve(s.anim).imageYscale = nativeSceneValue(1));
                    }
                }
            }
        }
        if (sceneTruth(sceneEqual(s.timer, 8))) {
            {
                const caller27 = s;
                for (const target27 of targets(object("obj_spearblocker"))) {
                    const other = caller27;
                    const s = target27;
                    {
                        host.call(s, "snd_play", "snd_break2");
                        (s.piece1 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(32, (s.imageAngle - 35))), () => (s.y + lengthdirY(32, (s.imageAngle - 35))), () => object("obj_spearblocker_piece")))));
                        (resolve(s.piece1).imageAngle = nativeSceneValue(s.imageAngle));
                        (resolve(s.piece1).imageIndex = nativeSceneValue(1));
                        (s.piece2 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(32, (s.imageAngle + 35))), () => (s.y + lengthdirY(32, (s.imageAngle + 35))), () => object("obj_spearblocker_piece")))));
                        (resolve(s.piece2).imageAngle = nativeSceneValue(s.imageAngle));
                        (resolve(s.piece2).imageIndex = nativeSceneValue(0));
                        (s.piece3 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 45)), () => (s.y + lengthdirY(30, 45)), () => object("obj_spearblocker_piece")))));
                        (resolve(s.piece3).sprite = nativeSceneValue("spr_green_circle_piece"));
                        (resolve(s.piece3).imageAngle = nativeSceneValue(0));
                        (s.piece4 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 135)), () => (s.y + lengthdirY(30, 135)), () => object("obj_spearblocker_piece")))));
                        (resolve(s.piece4).sprite = nativeSceneValue("spr_green_circle_piece"));
                        (resolve(s.piece4).imageAngle = nativeSceneValue(90));
                        (s.piece5 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 225)), () => (s.y + lengthdirY(30, 225)), () => object("obj_spearblocker_piece")))));
                        (resolve(s.piece5).sprite = nativeSceneValue("spr_green_circle_piece"));
                        (resolve(s.piece5).imageAngle = nativeSceneValue(180));
                        (s.piece6 = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(30, 315)), () => (s.y + lengthdirY(30, 315)), () => object("obj_spearblocker_piece")))));
                        (resolve(s.piece6).sprite = nativeSceneValue("spr_green_circle_piece"));
                        (resolve(s.piece6).imageAngle = nativeSceneValue(270));
                        if (sceneTruth(sceneEqual(s.idealdir, 180))) {
                            (resolve(s.piece1).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                            (resolve(s.piece1).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                            (resolve(s.piece2).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                            (resolve(s.piece2).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                            (resolve(s.piece3).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                            (resolve(s.piece3).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                            (resolve(s.piece4).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                            (resolve(s.piece4).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                            (resolve(s.piece5).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                            (resolve(s.piece5).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                            (resolve(s.piece6).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                            (resolve(s.piece6).hspeed = nativeSceneValue((1 + rt.random.random(2))));
                        }
                        if (sceneTruth(sceneEqual(s.idealdir, 0))) {
                            (resolve(s.piece1).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                            (resolve(s.piece1).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                            (resolve(s.piece2).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                            (resolve(s.piece2).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                            (resolve(s.piece3).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                            (resolve(s.piece3).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                            (resolve(s.piece4).vspeed = nativeSceneValue(((-9) - rt.random.random(6))));
                            (resolve(s.piece4).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                            (resolve(s.piece5).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                            (resolve(s.piece5).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                            (resolve(s.piece6).vspeed = nativeSceneValue((5 + rt.random.random(6))));
                            (resolve(s.piece6).hspeed = nativeSceneValue(((-1) - rt.random.random(2))));
                        }
                        if (sceneTruth(sceneEqual(s.idealdir, 90))) {
                            (resolve(s.piece1).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece1).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                            (resolve(s.piece2).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece2).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                            (resolve(s.piece3).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece3).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                            (resolve(s.piece4).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece4).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                            (resolve(s.piece5).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece5).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                            (resolve(s.piece6).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece6).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                        }
                        if (sceneTruth(sceneEqual(s.idealdir, 270))) {
                            (resolve(s.piece1).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece1).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                            (resolve(s.piece2).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece2).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                            (resolve(s.piece3).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece3).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                            (resolve(s.piece4).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece4).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                            (resolve(s.piece5).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece5).hspeed = nativeSceneValue(((-9) + rt.random.random(5))));
                            (resolve(s.piece6).vspeed = nativeSceneValue((1 - rt.random.random(6))));
                            (resolve(s.piece6).hspeed = nativeSceneValue((9 + rt.random.random(5))));
                        }
                        {
                            const caller28 = s;
                            for (const target28 of targets(object("obj_heart"))) {
                                const other = caller28;
                                const s = target28;
                                {
                                    (s.color = nativeSceneValue(0));
                                    (s.sprite = nativeSceneValue("spr_heart"));
                                }
                            }
                        }
                        rt.destroy(s);
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.breakcon, 3))) {
        (s.breakcon = nativeSceneValue(4));
        (s.timer = nativeSceneValue(0));
        {
            const caller29 = s;
            for (const target29 of targets(object("obj_spearblocker"))) {
                const other = caller29;
                const s = target29;
                {
                    (s.vanish = nativeSceneValue(1));
                }
            }
        }
        {
            const caller30 = s;
            for (const target30 of targets(object("obj_spearshot"))) {
                const other = caller30;
                const s = target30;
                {
                    rt.destroy(s);
                }
            }
        }
        {
            const caller31 = s;
            for (const target31 of targets(object("obj_heart"))) {
                const other = caller31;
                const s = target31;
                {
                    (s.color = nativeSceneValue(0));
                    (s.sprite = nativeSceneValue("spr_heart"));
                    (s.anim = nativeSceneValue(create((s.x + 10), (s.y + 10), object("obj_animation"))));
                    (resolve(s.anim).sprite = nativeSceneValue("spr_finisher_explosion"));
                    (resolve(s.anim).imageSpeed = nativeSceneValue(0.5));
                    (resolve(s.anim).imageIndex = nativeSceneValue(0));
                    (resolve(s.anim).imageXscale = nativeSceneValue(1));
                    (resolve(s.anim).imageYscale = nativeSceneValue(1));
                    (s.inst = nativeSceneValue(create(resolve(object("obj_heart")).x, resolve(object("obj_heart")).y, object("obj_gerson_fakeheart"))));
                    if (sceneTruth(sceneEqual(resolve(object("obj_spearblocker")).idealdir, 180))) {
                    }
                    (resolve(s.inst).directionhit = nativeSceneValue(280));
                }
            }
        }
        create(s.x, s.y, object("obj_shake"));
        host.call(s, "snd_play", "snd_screenshake");
    }
    if (sceneTruth(sceneEqual(s.breakcon, 4))) {
        (s.timer++);
        if (sceneTruth(sceneEqual(s.timer, 2))) {
            (g.inv = nativeSceneValue((-1)));
            host.call(s, "scr_damage");
        }
    }
}
