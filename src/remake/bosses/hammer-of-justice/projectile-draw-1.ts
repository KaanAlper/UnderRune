import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Draw_0, source block 1. */
export function projectileDraw1({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth(!sceneTruth((targets(object("obj_heart")).length > 0)))) {
        rt.destroy(s);
        return true;
    }
    v.shakelen = 0;
    v.shakedir = 0;
    if (sceneTruth(gt(nativeSceneValue(s.shakeduration), nativeSceneValue(0)))) {
        (s.shakeduration--);
        if (sceneTruth(sceneEqual(s.shakeduration, 2))) {
            (v.shakelen = (-4));
        }
        if (sceneTruth(sceneEqual(s.shakeduration, 4))) {
            (v.shakelen = 4);
        }
        if (sceneTruth(sceneEqual(s.shakeduration, 0))) {
            (v.shakelen = 0);
        }
        (v.shakedir = (s.direction + 90));
    }
    if (sceneTruth(sceneEqual(s.longspear, 1))) {
        (s.imageIndex = s.longnotebeingheld);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.fadespear, 3)) || sceneTruth(sceneEqual(s.fadespear, 4))))) {
        (s.imageAngle = pointDirection(s.x, s.y, resolve(object("obj_spearblocker")).x, resolve(object("obj_spearblocker")).y));
    }
    if (sceneTruth(sceneEqual(s.redhammer, 1))) {
        (s.redhammersiner++);
        v._color = mergeColor(...rtl(() => 0xffffff, () => 255, () => (0.4 + (Math.sin((s.redhammersiner / 8)) / 3))));
        v.shakex = 0;
        if (sceneTruth(sceneEqual(s.redhammerfakeout, 1))) {
            (s.redhammersiner++);
            if (sceneTruth(sceneEqual(s.redhammersiner, 350))) {
                (s.fakespeed = 0);
            }
            if (sceneTruth(sceneEqual(s.redhammersiner, 410))) {
                (s.fakespeed = (-15));
                (s.grav = 3);
            }
            if (sceneTruth(gt(nativeSceneValue(s.redhammersiner), nativeSceneValue(420)))) {
                (s.afterimage = scripts.afterimage(s));
                (resolve(s.afterimage).sprite = "spr_gerson_red_hammer");
                (resolve(s.afterimage).imageBlend = v._color);
                (resolve(s.afterimage).imageXscale = 2);
                (resolve(s.afterimage).imageYscale = 2);
                (resolve(s.afterimage).fadeSpeed = 0.15);
            }
            if (sceneTruth((sceneTruth(gt(nativeSceneValue(s.redhammersiner), nativeSceneValue(200))) && sceneTruth(lt(nativeSceneValue(s.redhammersiner), nativeSceneValue(410)))))) {
                (v.shakex = rt.random.random(4));
            }
            if (sceneTruth(sceneEqual((s.redhammersiner % 2), 0))) {
                (s.redhammersign = (-1));
            }
            else {
                (s.redhammersign = 1);
            }
        }
        drawSprite(...rtl(() => "spr_gerson_red_hammer", () => 3, () => ((s.x + (v.shakex * s.redhammersign)) + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => 2, () => 2, () => s.imageAngle, () => v._color, () => s.imageAlpha));
    }
    else if (sceneTruth(gt(nativeSceneValue(s.bouncespear), nativeSceneValue(0)))) {
        v.shellcolor = 16777215;
        if (sceneTruth(sceneEqual(s.hp, 8))) {
            (v.shellcolor = s.pink3);
        }
        if (sceneTruth(sceneEqual(s.hp, 7))) {
            (v.shellcolor = s.pink2);
        }
        if (sceneTruth(sceneEqual(s.hp, 6))) {
            (v.shellcolor = s.pink1);
        }
        if (sceneTruth(sceneEqual(s.hp, 5))) {
            (v.shellcolor = 255);
        }
        if (sceneTruth(sceneEqual(s.hp, 4))) {
            (v.shellcolor = 8388736);
        }
        if (sceneTruth(sceneEqual(s.hp, 3))) {
            (v.shellcolor = 16776960);
        }
        if (sceneTruth(sceneEqual(s.hp, 2))) {
            (v.shellcolor = 65280);
        }
        if (sceneTruth(sceneEqual(s.hp, 1))) {
            (v.shellcolor = 65535);
        }
        v.scale = 0.75;
        if (sceneTruth(sceneEqual(s.gigashell, true))) {
            (v.scale = 1);
        }
        v.angle = pointDirection(s.x, s.y, (resolve(object("obj_heart")).x + 10), (resolve(object("obj_heart")).y + 10));
        if (sceneTruth(sceneEqual(s.bouncespearcon, (-1)))) {
            (s.spinindex += 0.5);
        }
        if (sceneTruth(sceneEqual(s.bouncespear, 1))) {
            (s.spinindex = 0);
        }
        if (sceneTruth(lt(nativeSceneValue(s.len), nativeSceneValue((-20))))) {
        }
        else {
            if (sceneTruth(sceneEqual(s.sprite, "spr_bounce_shell_idle"))) {
                drawSprite(...rtl(() => "spr_bounce_shell_idle_color", () => s.spinindex, () => (s.x + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => v.scale, () => v.scale, () => v.angle, () => v.shellcolor, () => s.imageAlpha));
            }
            if (sceneTruth(sceneEqual(s.sprite, "spr_bounce_shell_hit_center"))) {
                drawSprite(...rtl(() => "spr_bounce_shell_hit_center_color", () => s.spinindex, () => (s.x + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => v.scale, () => v.scale, () => v.angle, () => v.shellcolor, () => s.imageAlpha));
            }
            if (sceneTruth(sceneEqual(s.sprite, "spr_bounce_shell_squish"))) {
                drawSprite(...rtl(() => "spr_bounce_shell_squish_color", () => s.spinindex, () => (s.x + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => v.scale, () => v.scale, () => v.angle, () => v.shellcolor, () => s.imageAlpha));
            }
            if (sceneTruth(sceneEqual(s.sprite, "spr_bounce_shell_squish2"))) {
                drawSprite(...rtl(() => "spr_bounce_shell_squish2_color", () => s.spinindex, () => (s.x + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => v.scale, () => v.scale, () => v.angle, () => v.shellcolor, () => s.imageAlpha));
            }
            drawSprite(...rtl(() => s.sprite, () => s.spinindex, () => (s.x + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => v.scale, () => v.scale, () => v.angle, () => s.imageBlend, () => s.imageAlpha));
        }
        if (sceneTruth(sceneEqual(s.bouncespear, 2))) {
        }
    }
    else {
        drawSprite(...rtl(() => s.sprite, () => s.imageIndex, () => (s.x + lengthdirX(v.shakelen, v.shakedir)), () => (s.y + lengthdirY(v.shakelen, v.shakedir)), () => s.imageXscale, () => s.imageYscale, () => s.imageAngle, () => s.imageBlend, () => s.imageAlpha));
    }
    if (sceneTruth(gt(nativeSceneValue(s.flashalpha), nativeSceneValue(0)))) {
        (s.flashalpha -= 0.1);
        v.scale = lerp(2, 0, s.flashalpha);
        fog(true, 0xffffff, 0, 1);
        drawSprite(s.sprite, s.imageIndex, s.x, s.y, (s.imageXscale + v.scale), (s.imageYscale + v.scale), s.imageAngle, 0xffffff, s.flashalpha);
        fog(false, 0xffffff, 0, 0);
    }
    return false;
}
