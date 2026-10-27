import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Step_0, source block 2. */
export function projectileStep2({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth((sceneTruth(s.giant) || sceneTruth(s.redhammer)))) {
        (v.rotateradius = 70);
    }
    v._a = 0;
    if (sceneTruth((sceneTruth(sceneEqual(s.bouncespearcon, 2)) && sceneTruth(sceneEqual(s.bouncespear, 2))))) {
        (v._a = 1);
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.special, 0)) || sceneTruth((sceneTruth(!sceneEqual(s.special, 0)) && sceneTruth(gt(nativeSceneValue(s.len), nativeSceneValue(v.rotateradius))))))) && sceneTruth(sceneEqual(v._a, 0))))) {
        (s.fakespeed += s.grav);
        (s.len -= s.fakespeed);
    }
    if (sceneTruth((sceneTruth(!sceneEqual(s.special, 0)) && sceneTruth(le(nativeSceneValue(s.len), nativeSceneValue(v.rotateradius)))))) {
        (s.len = v.rotateradius);
        v._special = s.special;
        if (sceneTruth(sceneEqual(v._special, 360))) {
            (v._special = 0);
        }
        {
            const count0 = round(20);
            for (let repeat0 = 0; repeat0 < count0; repeat0++) {
                v._dir = (s.direction - v._special);
                v._angledifference = v._dir;
                if (sceneTruth(gt(nativeSceneValue(Math.abs(v._dir)), nativeSceneValue(180)))) {
                    if (sceneTruth(gt(nativeSceneValue(s.direction), nativeSceneValue(v._special)))) {
                        (v._angledifference = ((-1) * ((360 - s.direction) + v._special)));
                    }
                    else {
                        (v._angledifference = ((360 - v._special) + s.direction));
                    }
                }
                if (sceneTruth(sceneEqual(s.direction, v._special))) {
                }
                else if (sceneTruth(gt(nativeSceneValue(v._angledifference), nativeSceneValue(2)))) {
                    (s.direction -= 1);
                }
                else if (sceneTruth(lt(nativeSceneValue(v._angledifference), nativeSceneValue(2)))) {
                    (s.direction += 1);
                }
                else {
                    (s.direction = v._special);
                }
                if (sceneTruth(gt(nativeSceneValue(s.direction), nativeSceneValue(360)))) {
                    (s.direction -= 360);
                }
                if (sceneTruth(lt(nativeSceneValue(s.direction), nativeSceneValue(0)))) {
                    (s.direction += 360);
                }
                if (sceneTruth(sceneEqual(v._special, s.direction))) {
                    (s.special = 0);
                }
            }
        }
    }
    if (sceneTruth(!sceneEqual(s.redhammer, 0))) {
        if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
            (s.spearblockerx = resolve(object("obj_spearblocker")).x);
            (s.spearblockery = resolve(object("obj_spearblocker")).y);
        }
        (s.x1 = (s.spearblockerx + lengthdirX(s.len, (s.direction + 180))));
        (s.y1 = (s.spearblockery + lengthdirY(s.len, (s.direction + 180))));
    }
    else if (sceneTruth((targets(object("obj_spearblocker")).length > 0))) {
        (s.x1 = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len, (s.direction + 180))));
        (s.y1 = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len, (s.direction + 180))));
    }
    if (sceneTruth(sceneEqual(s.init, 0))) {
        (s.init = 1);
        (s.dir2 = (s.direction + 90));
        (s.len2 = (s.len + 50));
    }
    if (sceneTruth((sceneTruth(lt(nativeSceneValue(s.timer), nativeSceneValue(25))) && sceneTruth(sceneEqual(s.swingaround, true))))) {
        (s.timer++);
        (s.dir2 = lerp(s.dir2, (s.direction + 180), (s.timer / 25)));
        (s.len2 = lerp(s.len2, s.len, (s.timer / 25)));
        (s.x = (resolve(object("obj_spearblocker")).x + lengthdirX(s.len2, s.dir2)));
        (s.y = (resolve(object("obj_spearblocker")).y + lengthdirY(s.len2, s.dir2)));
    }
    else if (sceneTruth(!sceneEqual(s.bouncespearcon, 2))) {
        (s.x = s.x1);
        (s.y = s.y1);
    }
    return false;
}
