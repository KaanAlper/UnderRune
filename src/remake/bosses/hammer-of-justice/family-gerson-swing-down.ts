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
    (s.destroyonhit = nativeSceneValue(false));
    (s.active = nativeSceneValue(0));
    (s.fakeout = nativeSceneValue(0));
    (s.swingdowntype = nativeSceneValue(0));
    (s.timetoswing = nativeSceneValue(8));
    (s.special = nativeSceneValue(0));
    (s.eye_index = nativeSceneValue(0));
    (s.eye_con = nativeSceneValue(0));
    (s.alpha = nativeSceneValue(0));
    (s.alphacon = nativeSceneValue(0));
    (s.imageSpeed = nativeSceneValue(0));
    (s.speed = nativeSceneValue((-6)));
    (s.direction = nativeSceneValue(270));
    (s.friction = nativeSceneValue(0.4));
    (s.imageXscale = nativeSceneValue(2));
    (s.imageYscale = nativeSceneValue(2));
    (s.imageAlpha = nativeSceneValue(1.4));
    (s.depth = nativeSceneValue((resolve(object("obj_growtangle")).depth + 1)));
    (s.grazepoints = nativeSceneValue(4));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    rt.drawSelf(s);
    if (sceneTruth(sceneEqual(s.eye_con, 1))) {
        if (sceneTruth(sceneEqual(s.eye_index, 0))) {
            (s.afterimage = nativeSceneValue(create(s.x, s.y, object("obj_afterimage_gerson"))));
            (resolve(s.afterimage).sprite = nativeSceneValue(s.sprite));
            (resolve(s.afterimage).imageIndex = nativeSceneValue(s.imageIndex));
            (resolve(s.afterimage).imageBlend = nativeSceneValue(s.imageBlend));
            (resolve(s.afterimage).imageSpeed = nativeSceneValue(0));
            (resolve(s.afterimage).depth = nativeSceneValue(s.depth));
            (resolve(s.afterimage).imageXscale = nativeSceneValue(s.imageXscale));
            (resolve(s.afterimage).imageYscale = nativeSceneValue(s.imageYscale));
            (resolve(s.afterimage).imageAngle = nativeSceneValue(s.imageAngle));
            (resolve(s.afterimage).parentid = nativeSceneValue(s.id));
            (resolve(s.afterimage).vspeed = nativeSceneValue(2.5));
            (resolve(s.afterimage).imageAlpha = nativeSceneValue(0.6));
            (s.afterimage = nativeSceneValue(create(s.x, s.y, object("obj_afterimage_gerson"))));
            (resolve(s.afterimage).sprite = nativeSceneValue(s.sprite));
            (resolve(s.afterimage).imageIndex = nativeSceneValue(s.imageIndex));
            (resolve(s.afterimage).imageBlend = nativeSceneValue(s.imageBlend));
            (resolve(s.afterimage).imageSpeed = nativeSceneValue(0));
            (resolve(s.afterimage).depth = nativeSceneValue(s.depth));
            (resolve(s.afterimage).imageXscale = nativeSceneValue(s.imageXscale));
            (resolve(s.afterimage).imageYscale = nativeSceneValue(s.imageYscale));
            (resolve(s.afterimage).imageAngle = nativeSceneValue(s.imageAngle));
            (resolve(s.afterimage).parentid = nativeSceneValue(s.id));
            (resolve(s.afterimage).vspeed = nativeSceneValue((-2.5)));
            (resolve(s.afterimage).imageAlpha = nativeSceneValue(0.6));
            (s.afterimage = nativeSceneValue(create(s.x, s.y, object("obj_afterimage_gerson"))));
            (resolve(s.afterimage).sprite = nativeSceneValue(s.sprite));
            (resolve(s.afterimage).imageIndex = nativeSceneValue(s.imageIndex));
            (resolve(s.afterimage).imageBlend = nativeSceneValue(s.imageBlend));
            (resolve(s.afterimage).imageSpeed = nativeSceneValue(0));
            (resolve(s.afterimage).depth = nativeSceneValue(s.depth));
            (resolve(s.afterimage).imageXscale = nativeSceneValue(s.imageXscale));
            (resolve(s.afterimage).imageYscale = nativeSceneValue(s.imageYscale));
            (resolve(s.afterimage).imageAngle = nativeSceneValue(s.imageAngle));
            (resolve(s.afterimage).parentid = nativeSceneValue(s.id));
            (resolve(s.afterimage).hspeed = nativeSceneValue(2.5));
            (resolve(s.afterimage).imageAlpha = nativeSceneValue(0.6));
            (s.afterimage = nativeSceneValue(create(s.x, s.y, object("obj_afterimage_gerson"))));
            (resolve(s.afterimage).sprite = nativeSceneValue(s.sprite));
            (resolve(s.afterimage).imageIndex = nativeSceneValue(s.imageIndex));
            (resolve(s.afterimage).imageBlend = nativeSceneValue(s.imageBlend));
            (resolve(s.afterimage).imageSpeed = nativeSceneValue(0));
            (resolve(s.afterimage).depth = nativeSceneValue(s.depth));
            (resolve(s.afterimage).imageXscale = nativeSceneValue(s.imageXscale));
            (resolve(s.afterimage).imageYscale = nativeSceneValue(s.imageYscale));
            (resolve(s.afterimage).imageAngle = nativeSceneValue(s.imageAngle));
            (resolve(s.afterimage).parentid = nativeSceneValue(s.id));
            (resolve(s.afterimage).hspeed = nativeSceneValue((-2.5)));
            (resolve(s.afterimage).imageAlpha = nativeSceneValue(0.6));
            host.call(s, "snd_stop", "snd_eye_telegraph");
            host.call(s, "snd_play_pitch", "snd_eye_telegraph", 1);
            if (sceneTruth(!sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_multitelegraph, 0))) {
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_multitelegraph, 1))) {
                    (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), (resolve(object("obj_growtangle")).y - 13), object("obj_gerson_growtangle_telegraph"))));
                    (resolve(s.inst).imageXscale = nativeSceneValue(51));
                    (resolve(s.inst).imageYscale = nativeSceneValue(72));
                    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                        (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                    }
                    (s.inst = nativeSceneValue(create((resolve(object("obj_growtangle")).x - 18), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                    (resolve(s.inst).imageXscale = nativeSceneValue(72));
                    (resolve(s.inst).imageYscale = nativeSceneValue(142));
                    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                        (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                    }
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_multitelegraph, 2))) {
                    (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                    (resolve(s.inst).imageXscale = nativeSceneValue(142));
                    (resolve(s.inst).imageYscale = nativeSceneValue(72));
                    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                        (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                    }
                    (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), (resolve(object("obj_growtangle")).y + 3), object("obj_gerson_growtangle_telegraph"))));
                    (resolve(s.inst).imageXscale = nativeSceneValue(90));
                    (resolve(s.inst).imageYscale = nativeSceneValue(69));
                    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                        (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                    }
                }
                if (sceneTruth(sceneEqual(resolve(object("obj_hammer_of_justice_enemy")).swingdown_multitelegraph, 3))) {
                    (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                    (resolve(s.inst).imageXscale = nativeSceneValue(142));
                    (resolve(s.inst).imageYscale = nativeSceneValue(142));
                    if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                        (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                    }
                }
                (resolve(object("obj_hammer_of_justice_enemy")).swingdown_multitelegraph = nativeSceneValue((-1)));
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 10))) {
                v.ylocation = (s.y + 16);
                if (sceneTruth(lt(nativeSceneValue(v.ylocation), nativeSceneValue((resolve(object("obj_growtangle")).y - 70))))) {
                    (v.ylocation = nativeSceneValue((resolve(object("obj_growtangle")).y - 70)));
                }
                if (sceneTruth(gt(nativeSceneValue(v.ylocation), nativeSceneValue(resolve(object("obj_growtangle")).y)))) {
                    (v.ylocation = nativeSceneValue(resolve(object("obj_growtangle")).y));
                }
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 11))) {
                v.ylocation = resolve(object("obj_growtangle")).y;
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 12))) {
                v.ylocation = (resolve(object("obj_growtangle")).y - 70);
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 13))) {
                v.ylocation = (resolve(object("obj_growtangle")).y - 13);
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 14))) {
                v.ylocation = ((resolve(object("obj_growtangle")).y - 70) + 13);
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 15))) {
                v.ylocation = (resolve(object("obj_growtangle")).y - 13);
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 16))) {
                v.ylocation = ((resolve(object("obj_growtangle")).y - 70) + 13);
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), v.ylocation, object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(142));
                (resolve(s.inst).imageYscale = nativeSceneValue(72));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 17))) {
                (s.inst = nativeSceneValue(create((resolve(object("obj_growtangle")).x - 53), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(70));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 18))) {
                (s.inst = nativeSceneValue(create((resolve(object("obj_growtangle")).x - 18), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(72));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, 19))) {
                if (sceneTruth(lt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                    (v.xlocation = nativeSceneValue(((s.x + 52) + 60)));
                }
                else {
                    (v.xlocation = nativeSceneValue((s.x + 18)));
                }
                if (sceneTruth(lt(nativeSceneValue(v.xlocation), nativeSceneValue((resolve(object("obj_growtangle")).x - 70))))) {
                    (v.xlocation = nativeSceneValue((resolve(object("obj_growtangle")).x - 70)));
                }
                if (sceneTruth(gt(nativeSceneValue(v.xlocation), nativeSceneValue(resolve(object("obj_growtangle")).x)))) {
                    (v.xlocation = nativeSceneValue(resolve(object("obj_growtangle")).x));
                }
                (s.inst = nativeSceneValue(create(v.xlocation, ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(72));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.swingdowntype, (-3)))) {
            }
            else if (sceneTruth(sceneEqual(s.x, (rt.view.x + 344)))) {
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(88));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.x, ((rt.view.x + 268) + 62)))) {
                (s.inst = nativeSceneValue(create(((resolve(object("obj_growtangle")).x - 75) + 5), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(70));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.x, (rt.view.x + 302)))) {
                (s.inst = nativeSceneValue(create((resolve(object("obj_growtangle")).x - 18), ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(90));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else if (sceneTruth(sceneEqual(s.x, ((rt.view.x + 378) - 62)))) {
                (s.inst = nativeSceneValue(create(resolve(object("obj_growtangle")).x, ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(72));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            else {
                if (sceneTruth(sceneEqual(resolve(object("obj_growtangle")).maxxscale, 2))) {
                    if (sceneTruth(lt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                        (v.xlocation = nativeSceneValue(((s.x - 90) + 20)));
                    }
                    else {
                        (v.xlocation = nativeSceneValue(((s.x + 18) - 16)));
                    }
                }
                else if (sceneTruth(lt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                    (v.xlocation = nativeSceneValue((s.x + 52)));
                }
                else {
                    (v.xlocation = nativeSceneValue((s.x + 18)));
                }
                (s.inst = nativeSceneValue(create(v.xlocation, ((resolve(object("obj_growtangle")).y - 75) + 5), object("obj_gerson_growtangle_telegraph"))));
                (resolve(s.inst).imageXscale = nativeSceneValue(72));
                (resolve(s.inst).imageYscale = nativeSceneValue(142));
                if (sceneTruth((targets(object("obj_heart")).length > 0))) {
                    (resolve(s.inst).depth = nativeSceneValue((resolve(object("obj_heart")).depth + 1)));
                }
            }
            if (sceneTruth(!sceneEqual(s.special, 0))) {
                (resolve(s.inst).special = nativeSceneValue(s.special));
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
        drawSprite(s.sprite, s.imageIndex, s.x, s.y, s.imageXscale, s.imageYscale, s.imageAngle, s.imageBlend, s.alpha);
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
export function Other10(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(sceneEqual(s.swingdowntype, 0))) {
        (s.speed = nativeSceneValue((-6)));
        (s.friction = nativeSceneValue(0.4));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-1)))) {
        (s.timetoswing = nativeSceneValue(22));
        (s.speed = nativeSceneValue((-7)));
        (s.friction = nativeSceneValue(0.4));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-2)))) {
        (s.timetoswing = nativeSceneValue(32));
        (s.speed = nativeSceneValue((-4.7)));
        (s.friction = nativeSceneValue(0.17));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-3)))) {
        (s.timetoswing = nativeSceneValue(999));
        (s.speed = nativeSceneValue((-4.7)));
        (s.friction = nativeSceneValue(0.17));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-4)))) {
        (s.timetoswing = nativeSceneValue(999));
        (s.speed = nativeSceneValue((-4.7)));
        (s.friction = nativeSceneValue(0.2));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-5)))) {
        (s.timetoswing = nativeSceneValue(999));
        (s.speed = nativeSceneValue((-4.7)));
        (s.friction = nativeSceneValue(0.2));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, 10))) {
        (s.timetoswing = nativeSceneValue(16));
        (s.speed = nativeSceneValue((-6)));
        (s.friction = nativeSceneValue(0.4));
    }
    if (sceneTruth(ge(nativeSceneValue(s.swingdowntype), nativeSceneValue(11)))) {
        (s.timetoswing = nativeSceneValue(22));
        (s.speed = nativeSceneValue((-7)));
        (s.friction = nativeSceneValue(0.4));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, 1))) {
        (s.timetoswing = nativeSceneValue(3));
        (s.speed = nativeSceneValue((-6)));
        (s.friction = nativeSceneValue(0.4));
    }
}
export function Other15(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    v.a = ((g.hp[2] - 30) / 250);
    if (sceneTruth(lt(nativeSceneValue(v.a), nativeSceneValue(0)))) {
        (v.a = nativeSceneValue(0));
    }
    (s.damage = nativeSceneValue(lerp(12, 90, v.a)));
    if (sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0))) {
        (s.target = nativeSceneValue(4));
        (s.damage = nativeSceneValue(67));
    }
    if (sceneTruth(sceneEqual(s.active, 1))) {
        if (sceneTruth(!sceneEqual(s.target, 3))) {
            host.call(s, "scr_damage");
        }
        if (sceneTruth(sceneEqual(s.target, 3))) {
            host.call(s, "scr_damage_all");
        }
        if (sceneTruth(sceneEqual(s.destroyonhit, 1))) {
            rt.destroy(s);
        }
    }
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.timer++);
    if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(10)))) {
        (s.depth = nativeSceneValue((-999999)));
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.timer, (s.timetoswing - 12))) || sceneTruth((sceneTruth(sceneEqual(s.swingdowntype, 0)) && sceneTruth(sceneEqual(s.timer, (s.timetoswing - 2))))))) || sceneTruth((sceneTruth(sceneEqual(s.swingdowntype, 1)) && sceneTruth(sceneEqual(s.timer, (s.timetoswing - 2)))))))) {
        (s.eye_con = nativeSceneValue(1));
    }
    if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(s.timetoswing))) && sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down"))))) {
        (s.imageIndex += nativeSceneValue(0.5));
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-3)))) {
        (s.mask = nativeSceneValue("spr_nothing"));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.swingdowntype, (-3))) && sceneTruth(sceneEqual(s.eye_con, 0))))) {
        if (sceneTruth(sceneEqual(s.timer, 34))) {
            {
                const caller168 = s;
                for (const target168 of targets(object("obj_gerson_swing_down"))) {
                    const other = caller168;
                    const s = target168;
                    {
                        (s.eye_con = nativeSceneValue(1));
                        (s.timer = nativeSceneValue((s.timetoswing - 2)));
                    }
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.swingdowntype, (-4)))) {
        if (sceneTruth(sceneEqual(s.timer, 12))) {
            {
                const caller169 = s;
                for (const target169 of targets(object("obj_gerson_swing_down"))) {
                    const other = caller169;
                    const s = target169;
                    {
                    }
                }
            }
        }
        if (sceneTruth(sceneEqual(s.timer, 50))) {
            if (sceneTruth(gt(nativeSceneValue(s.imageXscale), nativeSceneValue(0)))) {
                create((s.x + 52), (s.y + 120), object("obj_gerson_teleport"));
            }
            else {
                create((s.x - 52), (s.y + 120), object("obj_gerson_teleport"));
            }
            rt.destroy(s);
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
    if (sceneTruth((sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down")) && sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(3.5)))))) {
        (s.sprite = nativeSceneValue("spr_gerson_swing_down_loop"));
        (s.imageIndex = nativeSceneValue(0));
        (s.imageSpeed = nativeSceneValue(0));
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down")) && sceneTruth(sceneEqual(s.con, 0)))) && sceneTruth(gt(nativeSceneValue(s.imageIndex), nativeSceneValue(1)))))) {
        (s.active = nativeSceneValue(1));
        (s.con = nativeSceneValue(1));
        (s.x += nativeSceneValue(lengthdirX(30, s.direction)));
        (s.y += nativeSceneValue(lengthdirY(30, s.direction)));
        (s.speed = nativeSceneValue(45));
        if (sceneTruth(!sceneEqual(s.imageAngle, 0))) {
            (s.speed = nativeSceneValue(30));
        }
        (s.friction = nativeSceneValue(10));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.con, 1)) && sceneTruth(lt(nativeSceneValue(s.vspeed), nativeSceneValue(12)))))) {
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
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.swingdowntype, (-3))) && sceneTruth(sceneEqual(s.sprite, "spr_gerson_swing_down")))) && sceneTruth(ge(nativeSceneValue(s.imageIndex), nativeSceneValue(2)))))) {
        (s.gers = nativeSceneValue(create(...rtl(() => (s.x + lengthdirX(110, (s.imageAngle + 290))), () => (s.y + lengthdirY(110, (s.imageAngle + 290))), () => object("obj_gerson_teleport")))));
        (resolve(s.gers).imageAngle = nativeSceneValue(s.imageAngle));
        rt.destroy(s);
    }
}
