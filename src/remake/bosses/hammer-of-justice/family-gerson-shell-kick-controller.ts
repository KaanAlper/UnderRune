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
    (s.timer = nativeSceneValue(0));
    (s.full_timer = nativeSceneValue(999));
    (s.shell_counter = nativeSceneValue(1));
    (s.my_flash = nativeSceneValue((-1)));
    (s.ending_counter = nativeSceneValue(0));
    host.call(s, "scr_darksize");
    (s.imageSpeed = nativeSceneValue(0));
    (s.visible = nativeSceneValue(false));
    (g.turntimer = nativeSceneValue(9999));
}
export function Step0(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1))) || sceneTruth(sceneEqual(g.fighting, 0))))) {
        (s.imageAlpha -= nativeSceneValue(0.2));
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.1)))) {
            rt.destroy(s);
            return;
        }
    }
    (s.timer++);
    if (sceneTruth(lt(nativeSceneValue(s.full_timer), nativeSceneValue(999)))) {
        (s.full_timer--);
    }
    if (sceneTruth(sceneEqual(s.timer, 12))) {
        (s.x = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).x));
        (s.y = nativeSceneValue(resolve(object("obj_hammer_of_justice_enemy")).y));
        (s.visible = nativeSceneValue(true));
        (s.sprite = nativeSceneValue("spr_gerson_swing"));
        (s.imageIndex = nativeSceneValue(0));
        (resolve(object("obj_hammer_of_justice_enemy")).visible = nativeSceneValue(false));
        host.call(s, "snd_play", "snd_boost");
        (s.my_flash = nativeSceneValue(host.call(s, "scr_oflash")));
        host.call(s, "scr_lerpvar", "x", s.x, (s.x + 48), 12, 2, "out");
    }
    if (sceneTruth((sceneTruth((sceneTruth(ge(nativeSceneValue(s.timer), nativeSceneValue(12))) && sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(24))))) && sceneTruth(sceneEqual((s.timer % 3), 0))))) {
        {
            const caller78 = s;
            for (const target78 of targets(host.call(s, "scr_oflash"))) {
                const other = caller78;
                const s = target78;
                {
                    (s.depth += nativeSceneValue(1));
                    (s.flashcolor = nativeSceneValue(65280));
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.timer, 24))) {
        host.call(s, "scr_lerpvar", "image_index", 0, 6, 12);
        host.call(s, "snd_play", "motor_upper_quick_mid");
    }
    if (sceneTruth(sceneEqual(s.timer, 32))) {
        host.call(s, "snd_play", "snd_rudebuster_swing");
        host.call(s, "scr_shakeobj");
        {
            const caller79 = s;
            for (const target79 of targets(create(((s.x + 100) - 42), ((s.y + 90) - 86), object("obj_gerson_shell_pinball")))) {
                const other = caller79;
                const s = target79;
                {
                    bulletInit(s);
                    (s.direction = nativeSceneValue(host.call(s, "scr_at_player", s.x, s.y)));
                    (s.speed = nativeSceneValue(12));
                    (s.depth -= nativeSceneValue(1));
                    (s.imageXscale += nativeSceneValue(0.25));
                    (s.imageYscale += nativeSceneValue(0.25));
                    (s.active = nativeSceneValue(1));
                    (s.target = nativeSceneValue(3));
                    (s.damage = nativeSceneValue(1));
                    (s.grazed = nativeSceneValue(0));
                    (s.grazepoints = nativeSceneValue(2.5));
                    (s.destroyonhit = nativeSceneValue(false));
                }
            }
        }
    }
    if (sceneTruth(sceneEqual(s.timer, 40))) {
        if (sceneTruth(sceneEqual(s.shell_counter, 1))) {
            (s.visible = nativeSceneValue(false));
            {
                const caller80 = s;
                for (const target80 of targets(create((s.x + 58), (s.y + 36), object("obj_gerson_teleport_generic")))) {
                    const other = caller80;
                    const s = target80;
                    {
                        host.call(s, "scr_script_delayed", "instance_destroy", 7);
                    }
                }
            }
        }
        else {
            (s.timer = nativeSceneValue(23));
            (s.shell_counter++);
        }
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(s.full_timer), nativeSceneValue(4))) && sceneTruth(sceneEqual(s.ending_counter, 0))))) {
        (s.ending_counter = nativeSceneValue(1));
        create((resolve(object("obj_hammer_of_justice_enemy")).x + 68), (resolve(object("obj_hammer_of_justice_enemy")).y + 36), object("obj_gerson_teleport_generic"));
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(s.full_timer), nativeSceneValue(2))) && sceneTruth(sceneEqual(s.ending_counter, 1))))) {
        (s.ending_counter = nativeSceneValue(2));
        (g.turntimer = nativeSceneValue(1));
    }
    if (sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1)))) {
        {
            const caller81 = s;
            for (const target81 of targets(object("obj_gerson_teleport_generic"))) {
                const other = caller81;
                const s = target81;
                {
                    rt.destroy(s);
                }
            }
        }
        {
            const caller82 = s;
            for (const target82 of targets(object("obj_hammer_of_justice_enemy"))) {
                const other = caller82;
                const s = target82;
                {
                    (s.visible = nativeSceneValue(true));
                }
            }
        }
        rt.destroy(s);
    }
}
export function Step1(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) { const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) }); const scripts: any = host; const other = s; const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; }; return; }
export function Step2(s: GmInstance, rt: GmRuntime, object: Resources, host: HammerAttackHost) {
    const { g, v, resolve, targets, create, msg, text, drawSprite, flashSprite, fog } = createDrawContext(s, rt, object, { play: (s, ...a) => host.call(s, "snd_play", ...a), stop: (s, ...a) => host.call(s, "snd_stop", ...a), shakeObject: (s, ...a) => host.call(s, "scr_shakeobj", ...a), tensionHeal: (s, ...a) => host.call(s, "scr_tensionheal", ...a) });
    const scripts: any = host;
    const other = s;
    const createDepth = (x: number, y: number, depth: number, o: GmObjectDef) => { const id = create(x, y, o); resolve(id).depth = depth; return id; };
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(g.turntimer), nativeSceneValue(1))) || sceneTruth(sceneEqual(g.fighting, 0))))) {
        (s.imageAlpha -= nativeSceneValue(0.2));
        if (sceneTruth(lt(nativeSceneValue(s.imageAlpha), nativeSceneValue(0.1)))) {
            rt.destroy(s);
            return;
        }
    }
    {
        const caller83 = s;
        for (const target83 of targets(object("obj_growtangle"))) {
            const other = caller83;
            const s = target83;
            {
                v.ydiff = (s.y - s.yprevious);
                {
                    const caller84 = s;
                    for (const target84 of targets(object("obj_heart"))) {
                        const other = caller84;
                        const s = target84;
                        {
                            (s.y = nativeSceneValue(clamp(...rtl(() => (s.y + v.ydiff), () => (host.call(s, "scr_get_box", 1) + 3), () => (resolve(object("obj_growtangle")).y + 53)))));
                        }
                    }
                }
                {
                    const caller85 = s;
                    for (const target85 of targets(object("obj_gerson_shell_pinball"))) {
                        const other = caller85;
                        const s = target85;
                        {
                            (s.y += nativeSceneValue(v.ydiff));
                        }
                    }
                }
            }
        }
    }
    if (sceneTruth((targets(s.my_flash).length > 0))) {
        (resolve(s.my_flash).x = nativeSceneValue(s.x));
    }
}
