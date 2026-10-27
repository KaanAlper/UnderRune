import type { HammerProjectileContext } from './projectile-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, round, lerp, lengthdirX, lengthdirY, pointDirection, pointDistance } from '../../gm/math';
import { mergeColor } from '../../gm/graphics';
import { bulletInit } from '../../deltarune/battle';
/** obj_spearshot Other_10, source block 2. */
export function projectileHit2({ s, rt, g, v, scripts, object, resolve, targets, create, createDepth, drawSprite, flashSprite, fog, drawBody, drawHurt, drawIdle }: HammerProjectileContext): boolean {
    if (sceneTruth(sceneEqual(resolve(object("obj_spearblocker")).diagonal_enabled, false))) {
        (v.shieldlength = 50);
        (v.shieldradius = 36);
    }
    if (sceneTruth(sceneEqual(resolve(object("obj_spearblocker")).diagonal_enabled, true))) {
        (v.shieldlength = 30);
        (v.shieldradius = 46);
    }
    (s.longnotebeingheld = false);
    v.parryradius = v.shieldradius;
    if (sceneTruth((sceneTruth(sceneEqual(s.bouncespear, 1)) && sceneTruth(sceneEqual(s.hp, 1))))) {
        (v.shieldradius -= 30);
    }
    if (sceneTruth((sceneTruth((sceneTruth(sceneEqual(s.bouncespear, 2)) && sceneTruth(sceneEqual(s.bouncespearcon, 2)))) && sceneTruth(sceneEqual(s.sprite, "spr_bounce_shell_hit_center"))))) {
        (v.shieldradius += 10);
    }
    if (sceneTruth((sceneTruth(sceneEqual(s.longspear, 1)) && sceneTruth(sceneEqual(resolve(object("obj_spearblocker")).diagonal_enabled, false))))) {
        (v.shieldradius += 5);
    }
    if (sceneTruth(s.redhammer)) {
        (v.shieldradius += 15);
    }
    return false;
}
