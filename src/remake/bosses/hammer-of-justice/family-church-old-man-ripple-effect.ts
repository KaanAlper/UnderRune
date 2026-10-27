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
export function CleanUp0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(host.call(s, "v_ex", "surf")) && sceneTruth(host.call(s, "surface_exists", s.surf))))) {
        host.call(s, "surface_free", s.surf);
    }
}
export function Create0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.alpha = nativeSceneValue(1.5));
    (s.lifetime = nativeSceneValue(30));
    (s.max_radius = nativeSceneValue(400));
    (s.cursize = nativeSceneValue(0));
    (s.init = nativeSceneValue(0));
    (s.depth = nativeSceneValue(40000));
    (s.color = nativeSceneValue(32768));
    (s.ripplecount = nativeSceneValue(3));
    (s.ripplethicc = nativeSceneValue(4));
    (s.interval = nativeSceneValue(7));
    (s.subrings = nativeSceneValue(4));
    (s.timer = nativeSceneValue(0));
    (s.active = nativeSceneValue(false));
    (s.sprite_xoff = nativeSceneValue(50));
    (s.sprite = nativeSceneValue("spr_gerson_battle_overworld"));
    (sourceArray(s, "source_sprite")[0] = nativeSceneValue("spr_gerson_battle_overworld"));
    (sourceArray(s, "underlight")[0] = nativeSceneValue(2974));
    (sourceArray(s, "source_sprite")[1] = nativeSceneValue("spr_gerson_battle_overworld"));
    (sourceArray(s, "source_sprite")[2] = nativeSceneValue("spr_gerson_teleport"));
    (sourceArray(s, "source_sprite")[3] = nativeSceneValue("spr_gerson_swing"));
    (s.susie_con = nativeSceneValue(0));
    (s.susie_timer = nativeSceneValue(0));
    (s.surf = nativeSceneValue((-4)));
    (s.shiner = nativeSceneValue(0));
    (s.solo = nativeSceneValue(false));
    (s.ring_count = nativeSceneValue(0));
    (s.type = nativeSceneValue(0));
    (s.con = nativeSceneValue(0));
    (s.con_timer = nativeSceneValue(0));
    (s.deltatime = nativeSceneValue(1));
    (s.wind_sfx = nativeSceneValue((-4)));
    (sourceArray(s, "inner_radius")[0] = nativeSceneValue(0));
    (sourceArray(s, "outer_radius")[0] = nativeSceneValue(0));
    (s.dust_timer = nativeSceneValue(0));
    (s.end_timer = nativeSceneValue(0));
    (s.looping = nativeSceneValue(true));
    (s.fixed_timer = nativeSceneValue(0));
    (s.version = nativeSceneValue(0));
    (s.colorstart = nativeSceneValue(16777215));
    (s.colortimer = nativeSceneValue(0));
    (s.punch = nativeSceneValue(0));
}
export function Draw0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth(!sceneTruth(host.call(s, "surface_exists", s.surf)))) {
        (s.surf = nativeSceneValue(host.call(s, "surface_create", s.room_width, s.room_height)));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.type, 3)) || sceneTruth(sceneEqual(s.type, 4))))) {
        {
            const caller186 = s;
            for (const target186 of targets(object("obj_church_old_man_ripple"))) {
                const other = caller186;
                const s = target186;
                {
                    rt.userEvent(s, 0);
                }
            }
        }
    }
    v._ripplecount = s.ripplecount;
    if (sceneTruth(sceneEqual(s.type, 1))) {
        (v._ripplecount = nativeSceneValue(1));
        (s.subrings = nativeSceneValue(4));
    }
    else if (sceneTruth(sceneEqual(s.type, 0))) {
        (v._ripplecount += nativeSceneValue(2));
    }
    else if (sceneTruth(sceneEqual(s.type, 2))) {
        (v._ripplecount = nativeSceneValue(1));
    }
    if (sceneTruth(sceneEqual(s.type, 2))) {
        (s.subrings = nativeSceneValue(3));
    }
    if (sceneTruth(sceneEqual(s.type, 3))) {
        (s.subrings = nativeSceneValue(3));
        (v._ripplecount = nativeSceneValue(1));
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.type, 5)) || sceneTruth(sceneEqual(s.type, 6))))) {
        (v._ripplecount = nativeSceneValue(1));
        (s.color = nativeSceneValue(65280));
    }
    if (sceneTruth(sceneEqual(s.type, 7))) {
        (v._ripplecount = nativeSceneValue(3));
    }
    if (sceneTruth(s.active)) {
        rt.drawState.color = s.color;
        v._itv = 0;
        v._max_radius = s.max_radius;
        if (sceneTruth(sceneEqual(s.type, 1))) {
            (v._max_radius = nativeSceneValue(520));
        }
        if (sceneTruth(sceneEqual(s.type, 2))) {
            (v._max_radius = nativeSceneValue(100));
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.type, 2)) && sceneTruth(sceneEqual(s.version, 1))))) {
            (v._max_radius = nativeSceneValue(120));
        }
        v._life = 40;
        if (sceneTruth(sceneEqual(s.type, 2))) {
            (v._life = nativeSceneValue(60));
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.type, 2)) && sceneTruth(sceneEqual(s.version, 1))))) {
            (v._life = nativeSceneValue(15));
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.type, 2)) && sceneTruth(sceneEqual(s.version, 2))))) {
            (v._life = nativeSceneValue(120));
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.type, 2)) && sceneTruth(sceneEqual(s.version, 3))))) {
            (v._life = nativeSceneValue(160));
        }
        if (sceneTruth(sceneEqual(s.type, 7))) {
            (v._life = nativeSceneValue(80));
        }
        v._pow = 2;
        v._thickness = (sceneTruth(sceneEqual(s.type, 1)) ? 1 : 1);
        v._ringcount = 0;
        if (sceneTruth(sceneEqual(s.type, 3))) {
            (v._ripplecount = nativeSceneValue(1));
            (v._max_radius = nativeSceneValue(140));
        }
        else if (sceneTruth(sceneEqual(s.type, 4))) {
            (v._max_radius = nativeSceneValue(300));
        }
        if (sceneTruth(sceneEqual(s.type, 5))) {
            (v._max_radius = nativeSceneValue(180));
            if (sceneTruth(sceneEqual((s.punch % 2), 1))) {
                (v._max_radius += nativeSceneValue(20));
            }
        }
        if (sceneTruth(sceneEqual(s.type, 7))) {
            (v._max_radius = nativeSceneValue(240));
        }
        if (sceneTruth((sceneTruth(sceneEqual(s.version, 1)) || sceneTruth(sceneEqual(s.version, 2))))) {
            if (sceneTruth(lt(nativeSceneValue(s.colortimer), nativeSceneValue(1)))) {
                (s.colortimer += nativeSceneValue(0.015));
            }
            if (sceneTruth(gt(nativeSceneValue(s.colortimer), nativeSceneValue(1)))) {
                (s.colortimer = nativeSceneValue(1));
            }
            (s.color = nativeSceneValue(mergeColor(s.colorstart, 0, s.colortimer)));
        }
        if (sceneTruth(sceneEqual(s.version, 3))) {
            if (sceneTruth(lt(nativeSceneValue(s.colortimer), nativeSceneValue(1)))) {
                (s.colortimer += nativeSceneValue(0.01));
            }
            if (sceneTruth(gt(nativeSceneValue(s.colortimer), nativeSceneValue(1)))) {
                (s.colortimer = nativeSceneValue(1));
            }
            (s.color = nativeSceneValue(mergeColor(s.colorstart, 0, s.colortimer)));
        }
        if (sceneTruth(sceneEqual(s.type, 1))) {
            v._faux_timer = s.timer;
            v._interval = 2;
            v._subsize = 1;
            if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(v._life)))) {
                (s.timer = nativeSceneValue((v._life + (s.timer % v._interval))));
            }
            v._radius = (host.call(s, "scr_ease_out", (v._faux_timer / v._life), (s.subrings + 1)) * v._max_radius);
            v._submax = (Math.min(...rtl(() => 1, () => host.call(s, "scr_ease_out", (s.timer / v._life), (s.subrings + 1)))) * v._max_radius);
            v._col_index = 0;
            rt.drawState.color = s.color;
            host.call(s, "draw_set_alpha", (1 - (v._col_index / s.subrings)));
            host.call(s, "surface_set_target", s.surf);
            host.call(s, "draw_clear_alpha", 0, 0);
            host.call(s, "gpu_set_blendmode_ext", 2, 1);
            host.call(s, "d_circle", s.x, s.y, v._radius, false);
            (v._faux_timer -= nativeSceneValue(v._subsize));
            v._first = true;
            while (sceneTruth(gt(nativeSceneValue(v._faux_timer), nativeSceneValue(0)))) {
                (v._radius = nativeSceneValue((host.call(...rtl(() => s, () => "scr_ease_out", () => host.call(s, "clamp01", (v._faux_timer / v._life)), () => (s.subrings + 1))) * v._max_radius)));
                if (sceneTruth(lt(nativeSceneValue(v._radius), nativeSceneValue((v._submax + 100))))) {
                }
                (v._col_index++);
                if (sceneTruth(gt(nativeSceneValue(v._col_index), nativeSceneValue(s.subrings)))) {
                    (v._col_index = nativeSceneValue(0));
                }
                v._alpha = (1 - (v._col_index / s.subrings));
                host.call(s, "draw_set_alpha", (v._alpha * host.call(s, "clamp01", (1 - (((v._radius / v._max_radius) * 8) - 7)))));
                host.call(s, "d_circle", s.x, s.y, v._radius, false);
                if (sceneTruth(sceneEqual(v._col_index, s.subrings))) {
                    (v._faux_timer -= nativeSceneValue(v._interval));
                    if (sceneTruth((sceneTruth((sceneTruth(le(nativeSceneValue(v._faux_timer), nativeSceneValue(0))) && sceneTruth(s.looping))) && sceneTruth(gt(nativeSceneValue(s.deltatime), nativeSceneValue(1)))))) {
                        (s.looping = nativeSceneValue(false));
                        (s.end_timer = nativeSceneValue(v._faux_timer));
                        host.call(s, "debug_print", "end timer declared");
                    }
                    if (sceneTruth((sceneTruth(!sceneTruth(s.looping)) && sceneTruth(le(nativeSceneValue(v._faux_timer), nativeSceneValue(s.end_timer)))))) {
                        break;
                    }
                }
                else {
                    (v._faux_timer -= nativeSceneValue(v._subsize));
                }
            }
            host.call(s, "draw_set_alpha", 1);
            host.call(s, "surface_reset_target");
            host.call(s, "gpu_set_blendmode", 0);
            host.call(s, "draw_surface", s.surf, 0, 0);
        }
        else {
            for (v.i = 0; lt(nativeSceneValue(v.i), nativeSceneValue(v._ripplecount)); (v.i++)) {
                v._timer = (sceneTruth(sceneEqual(s.type, 1)) ? s.fixed_timer : s.timer);
                host.call(s, "surface_set_target", s.surf);
                if (sceneTruth((sceneTruth(sceneEqual(s.type, 1)) && sceneTruth(lt(nativeSceneValue(v._timer), nativeSceneValue((v._life * 0.75))))))) {
                    host.call(s, "draw_clear_alpha", 0, 1);
                }
                else {
                    host.call(s, "draw_clear_alpha", 0, 0);
                }
                (v._ringcount++);
                v._ease = (sceneTruth(ge(nativeSceneValue(s.type), nativeSceneValue(3))) ? 6 : 4);
                v._radius = (host.call(...rtl(() => s, () => "scr_ease_out", () => host.call(s, "clamp01", host.call(s, "inverselerp", 0, (v._life + (v.i * 30)), v._timer)), () => v._ease)) * v._max_radius);
                if (sceneTruth(sceneEqual(s.type, 7))) {
                    (v._radius = nativeSceneValue((host.call(...rtl(() => s, () => "scr_ease_out", () => host.call(s, "clamp01", host.call(s, "inverselerp", 0, (v._life + (v.i * 40)), v._timer)), () => v._ease)) * v._max_radius)));
                }
                v._col = s.color;
                v._alpha = (1 - (((v._radius / v._max_radius) * 8) - 7));
                rt.drawState.color = v._col;
                if (sceneTruth(sceneEqual(s.type, 7))) {
                    rt.drawState.color = mergeColor(s.color, 0, (v.i / v._ripplecount));
                }
                host.call(s, "draw_set_alpha", v._alpha);
                v._oradius = v._radius;
                host.call(s, "gpu_set_blendmode_ext", 2, 1);
                host.call(s, "d_circle", s.x, s.y, v._radius, false);
                v._subradius = v._radius;
                if (sceneTruth(lt(nativeSceneValue((v._timer - 2)), nativeSceneValue(0)))) {
                    host.call(s, "draw_set_alpha", 1);
                    host.call(s, "gpu_set_blendmode", 0);
                    host.call(s, "surface_reset_target");
                    host.call(s, "draw_surface", s.surf, 0, 0);
                    break;
                }
                v._prog = 1;
                for (v.ii = 1; lt(nativeSceneValue(v.ii), nativeSceneValue(s.subrings)); (v.ii++)) {
                    (v._alpha = nativeSceneValue((1 - (v.ii / s.subrings))));
                    (v._prog = nativeSceneValue((1 - host.call(...rtl(() => s, () => "scr_ease_in", () => host.call(s, "clamp01", (v._radius / v._max_radius)), () => 2)))));
                    (v._alpha = nativeSceneValue(host.call(s, "clamp01", (v._alpha - host.call(s, "clamp01", (((v._radius / v._max_radius) * 8) - 7))))));
                    host.call(s, "draw_set_alpha", v._alpha);
                    if (sceneTruth(sceneEqual(s.type, 1))) {
                        (v._subradius -= nativeSceneValue((80 + (80 * v._prog))));
                    }
                    if (sceneTruth(sceneEqual(s.type, 2))) {
                        (v._subradius -= nativeSceneValue((3 + (3 * v._prog))));
                    }
                    else if (sceneTruth(sceneEqual(s.type, 7))) {
                        (v._subradius -= nativeSceneValue((5 + (5 * v._prog))));
                    }
                    else {
                        (v._subradius -= nativeSceneValue((4 + (4 * v._prog))));
                    }
                    if (sceneTruth(gt(nativeSceneValue(v._subradius), nativeSceneValue(0)))) {
                        host.call(s, "d_circle", s.x, s.y, v._subradius, false);
                    }
                }
                rt.drawState.color = 0;
                if (sceneTruth(sceneEqual(s.type, 0))) {
                    (v._subradius -= nativeSceneValue((4 + (4 * v._prog))));
                }
                else if (sceneTruth((sceneTruth(sceneEqual(s.type, 2)) || sceneTruth(sceneEqual(s.type, 3))))) {
                    (v._subradius -= nativeSceneValue((3 + (3 * v._prog))));
                }
                else if (sceneTruth((sceneTruth(sceneEqual(s.type, 4)) || sceneTruth(sceneEqual(s.type, 5))))) {
                    (v._subradius -= nativeSceneValue((5 + (5 * v._prog))));
                }
                else if (sceneTruth(sceneEqual(s.type, 7))) {
                    (v._subradius -= nativeSceneValue((6 + (6 * v._prog))));
                }
                else {
                    (v._subradius -= nativeSceneValue((80 + (80 * v._prog))));
                }
                host.call(s, "draw_set_alpha", 0);
                host.call(s, "d_circle", s.x, s.y, v._subradius, false);
                host.call(s, "draw_set_alpha", 1);
                host.call(s, "surface_reset_target");
                host.call(s, "gpu_set_blendmode", 0);
                host.call(s, "draw_surface", s.surf, 0, 0);
            }
        }
        (s.timer += nativeSceneValue(s.deltatime));
        (s.fixed_timer++);
        if (sceneTruth((sceneTruth(sceneEqual(s.type, 1)) && sceneTruth(!sceneTruth(s.looping))))) {
            (s.end_timer += nativeSceneValue(s.deltatime));
            if (sceneTruth(ge(nativeSceneValue(s.end_timer), nativeSceneValue(v._life)))) {
                (s.active = nativeSceneValue(false));
                rt.destroy(s);
            }
        }
        if (sceneTruth((sceneTruth(!sceneEqual(s.type, 1)) && sceneTruth(ge(nativeSceneValue((s.timer - v._thickness)), nativeSceneValue(((v._itv * v._ripplecount) + (v._life * v._ripplecount)))))))) {
            (s.timer = nativeSceneValue(0));
            (s.active = nativeSceneValue(false));
            rt.destroy(s);
        }
    }
    host.call(s, "draw_set_blend_mode", 0);
    if (sceneTruth((sceneTruth((sceneTruth(s.active) && sceneTruth(ge(nativeSceneValue(s.type), nativeSceneValue(3))))) && sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(3)))))) {
        v._scale = lerp(2, 0, (s.timer / 3));
        if (sceneTruth(sceneEqual(s.type, 4))) {
            drawSprite("spr_parry_impact", 0, s.x, s.y, v._scale, v._scale, 0, 16776960, 1);
        }
        (v._scale = nativeSceneValue(lerp(100, 0, (s.timer / 3))));
        host.call(s, "draw_set_alpha", 0.33);
        host.call(s, "d_circle", s.x, s.y, (v._scale + 10), false);
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(0)))) {
            host.call(s, "d_circle", s.x, s.y, (v._scale + 20), false);
        }
        host.call(s, "draw_set_alpha", 1);
        if (sceneTruth(gt(nativeSceneValue(s.timer), nativeSceneValue(1)))) {
            host.call(s, "d_circle", s.x, s.y, v._scale, false);
        }
    }
    if (sceneTruth((sceneTruth((sceneTruth(s.active) && sceneTruth(sceneEqual(s.type, 4)))) && sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(3)))))) {
        v._scale = lerp(8, 0, (s.timer / 3));
        drawSprite("spr_parry_impact", 0, s.x, s.y, v._scale, v._scale, 0, 16776960, 1);
    }
    host.call(s, "draw_set_alpha", 1);
    rt.drawState.color = 0xffffff;
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    (s.active = nativeSceneValue(true));
    if (sceneTruth((sceneTruth((sceneTruth((sceneTruth(s.active) && sceneTruth(sceneEqual(s.timer, 1)))) && sceneTruth(ge(nativeSceneValue(s.type), nativeSceneValue(3))))) && sceneTruth(lt(nativeSceneValue(s.type), nativeSceneValue(7)))))) {
        v._count = (sceneTruth(sceneEqual(s.type, 3)) ? 8 : 16);
        v._angle = (360 / v._count);
        v._start_angle = 0;
        if (sceneTruth(ge(nativeSceneValue(s.type), nativeSceneValue(5)))) {
            if (sceneTruth(sceneEqual(s.type, 6))) {
                (v._count = nativeSceneValue(32));
            }
            (v._angle = nativeSceneValue((120 / v._count)));
            (v._start_angle = nativeSceneValue(((180 + rt.random.randomRange((-30), 30)) - 30)));
        }
        v._half = false;
        for (v.i = 0; lt(nativeSceneValue(v.i), nativeSceneValue(v._count)); (v.i++)) {
            v._spark = create(s.x, s.y, object("obj_church_parry_sparks"));
            {
                const caller187 = s;
                for (const target187 of targets(v._spark)) {
                    const other = caller187;
                    const s = target187;
                    {
                        (s.direction = nativeSceneValue(((v._start_angle + (v.i * v._angle)) + rt.random.randomRange(((-v._angle) / 2), (v._angle / 2)))));
                        (s.imageAngle = nativeSceneValue(s.direction));
                        (s.imageBlend = nativeSceneValue(resolve(other).color));
                        if (sceneTruth((sceneTruth((sceneTruth(!sceneTruth(v._half)) && sceneTruth(ge(nativeSceneValue(resolve(other).type), nativeSceneValue(5))))) && sceneTruth(gt(nativeSceneValue(v.i), nativeSceneValue((v._count / 2))))))) {
                            (v._start_angle -= nativeSceneValue((180 + (v.i * v._angle))));
                            (v._half = nativeSceneValue(true));
                        }
                        (s.depth = nativeSceneValue((resolve(other).depth + 1)));
                        if (sceneTruth(sceneEqual(resolve(other).type, 3))) {
                            (s.friction = nativeSceneValue(0.5));
                            (s.speed = nativeSceneValue(rt.random.randomRange(5, 12)));
                            (s.imageXscale = nativeSceneValue(2));
                        }
                        else if (sceneTruth(ge(nativeSceneValue(resolve(other).type), nativeSceneValue(5)))) {
                            (s.friction = nativeSceneValue(0.5));
                            (s.speed = nativeSceneValue(rt.random.randomRange(5, 12)));
                            (s.imageXscale = nativeSceneValue(2));
                        }
                        else {
                            (s.imageXscale = nativeSceneValue(3));
                            (s.friction = nativeSceneValue(1));
                            (s.speed = nativeSceneValue(rt.random.randomRange(10, 30)));
                            (s.imageXscale = nativeSceneValue((s.speed / 10)));
                        }
                        if (sceneTruth(v._half)) {
                            (s.speed /= nativeSceneValue(2));
                        }
                        else if (sceneTruth(ge(nativeSceneValue(resolve(other).type), nativeSceneValue(5)))) {
                        }
                    }
                }
            }
        }
    }
}
