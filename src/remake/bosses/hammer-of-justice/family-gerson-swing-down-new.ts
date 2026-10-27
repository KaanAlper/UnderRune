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
    host.inherited(s, rt, "create");
    (s.timer = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.active = nativeSceneValue(0));
    (s.fakeout = nativeSceneValue(0));
    (s.swingdowntype = nativeSceneValue(0));
    (s.timetoswing = nativeSceneValue(22));
    (s.telegraphtime = nativeSceneValue(12));
    (s.special = nativeSceneValue(0));
    (s.eye_index = nativeSceneValue(0));
    (s.eye_con = nativeSceneValue(0));
    (s.alpha = nativeSceneValue(0));
    (s.alphacon = nativeSceneValue(0));
    (s.imageSpeed = nativeSceneValue(0));
    (s.speed = nativeSceneValue((-7)));
    (s.direction = nativeSceneValue(270));
    (s.friction = nativeSceneValue(0.4));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageAlpha = nativeSceneValue(1.4));
    if (sceneTruth((targets(object("obj_growtangle")).length > 0))) {
        (s.depth = nativeSceneValue((resolve(object("obj_growtangle")).depth + 1)));
    }
    (s.grazepoints = nativeSceneValue(4));
    (s.version = nativeSceneValue(0));
    if (sceneTruth((sceneTruth((sceneTruth((targets(object("obj_hammer_of_justice_enemy")).length > 0)) && sceneTruth((sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).trueturn, 10)) || sceneTruth(true))))) || sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))))) {
        (s.timetoswing = nativeSceneValue(10));
        (s.telegraphtime = nativeSceneValue(8));
    }
    v.a = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
        (v.a = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.a)));
    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
        (s.target = nativeSceneValue(4));
        if (sceneTruth(sceneEqual(resolve(object("obj_sound_of_justice_enemy")).phase, 1))) {
            (s.damage = nativeSceneValue(38));
        }
        else {
            (s.damage = nativeSceneValue(58));
        }
    }
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(lt(nativeSceneValue(s.imageAngle), nativeSceneValue(1)))) {
        if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
            fog(true, 0, 0, 1);
            drawSprite(s.sprite, s.imageIndex, (s.x + 14), s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
            fog(false, 0, 0, 0);
        }
        else {
            drawSprite(s.sprite, s.imageIndex, (s.x + 14), s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.imageAlpha);
        }
        if (sceneTruth(sceneEqual(s.eye_con, 1))) {
            if (sceneTruth(sceneEqual(s.eye_index, 0))) {
                host.call(s, "snd_play_pitch", "snd_eye_telegraph", 1);
                v._x = 0;
                if (sceneTruth(sceneEqual(s.version, 1))) {
                    (v._x = nativeSceneValue((-6)));
                }
                v._image_angle = s.imageAngle;
                if (sceneTruth(lt(nativeSceneValue(s.imageAngle), nativeSceneValue(0)))) {
                    (v._image_angle = nativeSceneValue(0));
                }
                (s.inst = nativeSceneValue(create(...rtl(() => ((s.x + v._x) + lengthdirX(15, (270 + v._image_angle))), () => (s.y + lengthdirY(15, (270 + v._image_angle))), () => object("obj_gerson_growtangle_telegraph_new")))));
                (resolve(s.inst).imageAngle = nativeSceneValue(v._image_angle));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            if (sceneTruth(sceneEqual(s.alphacon, 0))) {
                (s.alpha += nativeSceneValue(0.2));
                if (sceneTruth(sceneEqual(s.alpha, 1.2))) {
                    (s.alphacon = nativeSceneValue(1));
                }
            }
            else {
                (s.alpha -= nativeSceneValue(0.2));
            }
            fog(true, 0xffffff, 0, 1);
            drawSprite(s.sprite, s.imageIndex, (s.x + 14), s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.alpha);
            fog(false, 0, 0, 0);
            (s.eye_index += nativeSceneValue(0.4));
            if (sceneTruth(sceneEqual(s.swingdowntype, 1))) {
                (s.eye_index += nativeSceneValue(0.6));
            }
            if (sceneTruth(ge(nativeSceneValue(s.eye_index), nativeSceneValue(5)))) {
                (s.eye_con = nativeSceneValue(0));
            }
        }
    }
    else {
        if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
            fog(true, 0, 0, 1);
            drawSprite(...rtl(() => s.sprite, () => s.imageIndex, () => (s.x + lengthdirX(14, (s.imageAngle + 90))), () => (s.y + lengthdirY(14, (s.imageAngle + 90))), () => s.imageXscale, () => s.imageYscale, () => s.imageAngle, () => s.imageBlend, () => s.imageAlpha));
            fog(false, 0, 0, 0);
        }
        else {
            drawSprite(...rtl(() => s.sprite, () => s.imageIndex, () => (s.x + lengthdirX(14, (s.imageAngle + 90))), () => (s.y + lengthdirY(14, (s.imageAngle + 90))), () => s.imageXscale, () => s.imageYscale, () => s.imageAngle, () => s.imageBlend, () => s.imageAlpha));
        }
        if (sceneTruth(sceneEqual(s.eye_con, 1))) {
            if (sceneTruth(sceneEqual(s.eye_index, 0))) {
                host.call(s, "snd_play_pitch", "snd_eye_telegraph", 1);
                v._x = 0;
                if (sceneTruth(sceneEqual(s.version, 1))) {
                    (v._x = nativeSceneValue((-6)));
                }
                v._image_angle = s.imageAngle;
                if (sceneTruth(lt(nativeSceneValue(s.imageAngle), nativeSceneValue(0)))) {
                    (v._image_angle = nativeSceneValue(0));
                }
                (s.inst = nativeSceneValue(create(...rtl(() => ((s.x + v._x) + lengthdirX(15, (270 + v._image_angle))), () => (s.y + lengthdirY(15, (270 + v._image_angle))), () => object("obj_gerson_growtangle_telegraph_new")))));
                (resolve(s.inst).imageAngle = nativeSceneValue(v._image_angle));
                if (sceneTruth(sceneEqual(s.imageAngle, 270))) {
                    {
                        const caller11 = s;
                        for (const target11 of targets(s.inst)) {
                            const other = caller11;
                            const s = target11;
                            {
                                (s.imageXscale = nativeSceneValue(1));
                                (s.sprite = nativeSceneValue("spr_gerson_swing_down_telegraph4"));
                            }
                        }
                    }
                }
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            if (sceneTruth(sceneEqual(s.alphacon, 0))) {
                (s.alpha += nativeSceneValue(0.2));
                if (sceneTruth(sceneEqual(s.alpha, 1.2))) {
                    (s.alphacon = nativeSceneValue(1));
                }
            }
            else {
                (s.alpha -= nativeSceneValue(0.2));
            }
            fog(true, 0xffffff, 0, 1);
            drawSprite(...rtl(() => s.sprite, () => s.imageIndex, () => (s.x + lengthdirX(14, (s.imageAngle + 90))), () => (s.y + lengthdirY(14, (s.imageAngle + 90))), () => s.imageXscale, () => s.imageYscale, () => s.imageAngle, () => s.imageBlend, () => s.alpha));
            fog(false, 0, 0, 0);
            (s.eye_index += nativeSceneValue(0.4));
            if (sceneTruth(sceneEqual(s.swingdowntype, 1))) {
                (s.eye_index += nativeSceneValue(0.6));
            }
            if (sceneTruth(ge(nativeSceneValue(s.eye_index), nativeSceneValue(5)))) {
                (s.eye_con = nativeSceneValue(0));
            }
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(sceneEqual(s.timer, 2))) {
        (s.imageIndex = nativeSceneValue(1));
    }
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(10)))) {
        (s.depth = nativeSceneValue((-999999)));
    }
    if (sceneTruth(sceneEqual(s.timer, (s.timetoswing - s.telegraphtime)))) {
        (s.eye_con = nativeSceneValue(1));
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(s.timetoswing))) && sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down_new"))))) {
        (s.imageIndex += nativeSceneValue(0.5));
    }
    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
        if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.timer, 5)) || sceneTruth(sceneEqual(s.timer, 7)))) || sceneTruth(sceneEqual(s.timer, 9))))) {
            (s._ripple = nativeSceneValue(create((s.x + 0), (s.y + 40), object("obj_church_old_man_ripple_effect"))));
            (resolve(s._ripple).type = nativeSceneValue(2));
            (resolve(s._ripple).color = nativeSceneValue(mergeColor(255, 0, 0)));
            (resolve(s._ripple).colorstart = nativeSceneValue(255));
            (resolve(s._ripple).version = nativeSceneValue(1));
            (resolve(s._ripple).depth = nativeSceneValue((s.depth + 1)));
        }
    }
    if (sceneTruth(sceneEqual(s.timer, (s.timetoswing + 2)))) {
        host.call(s, "snd_stop", "motor_upper_quick_mid");
        host.call(s, "snd_play", "motor_upper_quick_mid");
    }
    if (sceneTruth(sceneEqual(s.timer, (s.timetoswing + 5)))) {
        host.call(s, "snd_stop", "motor_swing_down");
        host.call(s, "snd_play", "motor_swing_down");
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down_new")) && sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(4.5)))))) {
        (s.sprite = nativeSceneValue("spr_gerson_swing_down_loop_new"));
        (s.imageIndex = nativeSceneValue(0));
        (s.imageSpeed = nativeSceneValue(0));
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down_new")) && sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(2.5))))) && sceneTruth(sceneEqual(s.con, 0))))) {
        (s.active = nativeSceneValue(1));
        (s.con = nativeSceneValue(1));
        (s.speed = nativeSceneValue(50));
        (s.friction = nativeSceneValue(10));
        if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.imageAngle, 45)) || sceneTruth(sceneEqual(s.imageAngle, 135)))) || sceneTruth(sceneEqual(s.imageAngle, 225)))) || sceneTruth(sceneEqual(s.imageAngle, 315))))) {
            (s.friction = nativeSceneValue(6.5));
        }
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.con, 1)) && sceneTruth(lt(nativeSceneValue(s.speed), nativeSceneValue(12)))))) {
        (s.friction = nativeSceneValue(4));
        if (sceneTruth(lt(nativeSceneValue(s.speed), nativeSceneValue(5)))) {
            (s.speed = nativeSceneValue(5));
        }
        (s.imageAlpha -= nativeSceneValue(0.2));
        if (sceneTruth(sceneEqual(s.imageAlpha, 1.2))) {
            host.call(s, "snd_stop", "snd_impact");
            host.call(s, "snd_play", "snd_impact");
        }
        if (sceneTruth(le(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.8)))) {
            (s.mask = nativeSceneValue("spr_nothing"));
            (s.active = nativeSceneValue(0));
        }
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0)))) {
            rt.destroy(s);
        }
    }
}
