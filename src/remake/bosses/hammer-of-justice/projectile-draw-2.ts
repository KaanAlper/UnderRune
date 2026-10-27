import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Draw_0, source block 2. */
export function projectileDraw2({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth(sceneEqual(s.longspear, 1))) {
        v.a = 0;
        {
            const count0 = round(s.longnotepieces);
            for (let repeat0 = 0; repeat0 < count0; repeat0++) {
                (v.a++);
            }
        }
        drawSprite(...rtl(() => "spr_spear_arrow_long_piece", () => s.longnotebeingheld, () => (s.x + lengthdirX(1, (s.imageAngle + 180))), () => (s.y + lengthdirY(1, (s.imageAngle + 180))), () => (s.imageXscale * s.longnotepieces), () => s.imageYscale, () => s.imageAngle, () => s.imageBlend, () => s.imageAlpha));
        v.barlength = ((s.longnotepieces * 2) - 2);
        if (sceneTruth(sceneEqual(s.longnotebeingheld, true))) {
            if (sceneTruth(sceneEqual((s.longnotepieces % 1), 0))) {
                {
                    const count1 = round(3);
                    for (let repeat1 = 0; repeat1 < count1; repeat1++) {
                        (s.inst = create(...rtl(() => ((s.x + lengthdirX(...rtl(() => (v.barlength - rt.random.random(Math.abs(s.fakespeed))), () => (s.imageAngle + 180)))) + lengthdirX(3, ((s.imageAngle + 180) + 90))), () => (((s.y - 3) + lengthdirY(v.barlength, (s.imageAngle + 180))) + lengthdirY(3, ((s.imageAngle + 180) + 90))), () => object("obj_arrow_long_particle"))));
                        (resolve(s.inst).imageIndex = 3);
                        (s.inst = create(...rtl(() => ((s.x + lengthdirX(...rtl(() => (v.barlength - rt.random.random(Math.abs(s.fakespeed))), () => (s.imageAngle + 180)))) + lengthdirX(2, ((s.imageAngle + 180) + 90))), () => (((s.y - 2) + lengthdirY(v.barlength, (s.imageAngle + 180))) + lengthdirY(2, ((s.imageAngle + 180) + 90))), () => object("obj_arrow_long_particle"))));
                        (resolve(s.inst).imageIndex = 3);
                        (s.inst = create(...rtl(() => ((s.x + lengthdirX(...rtl(() => (v.barlength - rt.random.random(Math.abs(s.fakespeed))), () => (s.imageAngle + 180)))) + lengthdirX(1, ((s.imageAngle + 180) + 90))), () => (((s.y - 1) + lengthdirY(v.barlength, (s.imageAngle + 180))) + lengthdirY(1, ((s.imageAngle + 180) + 90))), () => object("obj_arrow_long_particle"))));
                        (resolve(s.inst).imageIndex = 3);
                        (s.inst = create(...rtl(() => ((s.x + lengthdirX(...rtl(() => (v.barlength - rt.random.random(Math.abs(s.fakespeed))), () => (s.imageAngle + 180)))) + lengthdirX((-1), ((s.imageAngle + 180) + 90))), () => (((s.y - 1) + lengthdirY(v.barlength, (s.imageAngle + 180))) + lengthdirY((-1), ((s.imageAngle + 180) + 90))), () => object("obj_arrow_long_particle"))));
                        (resolve(s.inst).imageIndex = 3);
                        (s.inst = create(...rtl(() => ((s.x + lengthdirX(...rtl(() => (v.barlength - rt.random.random(Math.abs(s.fakespeed))), () => (s.imageAngle + 180)))) + lengthdirX((-2), ((s.imageAngle + 180) + 90))), () => (((s.y - 2) + lengthdirY(v.barlength, (s.imageAngle + 180))) + lengthdirY((-2), ((s.imageAngle + 180) + 90))), () => object("obj_arrow_long_particle"))));
                        (resolve(s.inst).imageIndex = 3);
                    }
                }
            }
            {
                const caller0 = s;
                for (const target0 of targets(object("obj_arrow_long_particle"))) {
                    const other = caller0;
                    const s = target0;
                    {
                        (s.direction = (((resolve(other).imageAngle + 180) - 45) + rt.random.irandom(90)));
                    }
                }
            }
            (s.longnoteindex++);
            if (sceneTruth(sceneEqual(s.longnoteindex, 1))) {
                (s.damage = round((s.damage / 2)));
            }
            v.scale = 1.5;
            if (sceneTruth(sceneEqual(rt.random.choose(0, 1), 1))) {
                drawSprite(...rtl(() => "spr_sparks2", () => s.longnoteindex, () => (s.x + lengthdirX(1, (s.imageAngle + 180))), () => (s.y + lengthdirY(1, (s.imageAngle + 180))), () => v.scale, () => v.scale, () => s.imageAngle, () => s.imageBlend, () => s.imageAlpha));
            }
            else {
                drawSprite(...rtl(() => "spr_sparks2", () => (s.longnoteindex + 2), () => (s.x + lengthdirX(1, (s.imageAngle + 180))), () => (s.y + lengthdirY(1, (s.imageAngle + 180))), () => v.scale, () => ((-1) * v.scale), () => s.imageAngle, () => s.imageBlend, () => s.imageAlpha));
            }
            scripts.stop(s, "snd_organ_enemy_loop_temp");
            (s.pitchcount--);
            v._pitch = (2 - (s.pitchcount / 60));
            if (sceneTruth(lt(nativeSceneValue(v._pitch), nativeSceneValue(0.5)))) {
                (v._pitch = 0.5);
            }
            scripts.playPitch(s, "snd_organ_enemy_loop_temp", v._pitch);
            (s.longnotepieces -= Math.ceil((s.fakespeed / 2)));
            if (sceneTruth(lt(nativeSceneValue(s.longnotepieces), nativeSceneValue(0)))) {
                (s.inst = createDepth(s.x, s.y, (s.depth - 1000), object("obj_animation")));
                (resolve(s.inst).sprite = "spr_finisher_explosion_quick");
                (resolve(s.inst).imageSpeed = 1);
                (resolve(s.inst).imageAngle = s.imageAngle);
                (resolve(s.inst).imageXscale = 0.2);
                (resolve(s.inst).imageYscale = 0.2);
                scripts.playAt(s, "snd_queen_punched_lower_heavy", 0.5, 2);
                rt.destroy(s);
            }
        }
    }
    return false;
}
