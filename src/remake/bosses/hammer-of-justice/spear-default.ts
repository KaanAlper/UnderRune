import type { HammerSpearContext } from './spear-context';
import { sceneEqual, sceneTruth, nativeSceneValue, sceneArgs as rtl } from './scene-context';
import { lt, gt, le, ge, lengthdirX, lengthdirY } from '../../gm/math';
export function spearDefault({ s, rt, g, v, args, audio, object, resolve, targets, create, createDepth, bulletSpawner, heartColor }: HammerSpearContext) {
    {
        (s._inst = create((-9999), (-9999), object("obj_spearshot")));
        (resolve(s._inst).special = args[3]);
        (resolve(s._inst).direction = args[0]);
        (resolve(s._inst).fakespeed = args[1]);
        (resolve(s._inst).len = (args[1] * args[2]));
        (resolve(s._inst).imageAngle = resolve(s._inst).direction);
        if (sceneTruth((sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0)) && sceneTruth(sceneEqual(resolve(object("obj_sound_of_justice_enemy")).susiedown, false))))) {
            if (sceneTruth(sceneEqual(args[0], 0))) {
                audio.play(s, "snd_statue_left");
            }
            if (sceneTruth(sceneEqual(args[0], 270))) {
                audio.play(s, "snd_statue_up");
            }
            if (sceneTruth(sceneEqual(args[0], 180))) {
                audio.play(s, "snd_statue_right");
            }
            if (sceneTruth(sceneEqual(args[0], 90))) {
                audio.play(s, "snd_statue_down");
            }
            if (sceneTruth((sceneTruth(sceneEqual(args.length, 5)) && sceneTruth(gt(nativeSceneValue(args[4]), nativeSceneValue(0)))))) {
                (s.inst = create(s.x, s.y, object("obj_gerson_gradient_telegraph")));
                (resolve(s.inst).imageAlpha = args[4]);
                if (sceneTruth(sceneEqual(args[0], 0))) {
                    (resolve(s.inst).side = "left");
                }
                if (sceneTruth(sceneEqual(args[0], 90))) {
                    (resolve(s.inst).side = "down");
                }
                if (sceneTruth(sceneEqual(args[0], 180))) {
                    (resolve(s.inst).side = "right");
                }
                if (sceneTruth(sceneEqual(args[0], 270))) {
                    (resolve(s.inst).side = "up");
                }
            }
        }
        if (sceneTruth((sceneTruth(sceneEqual(args.length, 5)) && sceneTruth(!sceneTruth((targets(object("obj_sound_of_justice_enemy")).length > 0)))))) {
            (resolve(s._inst).swingaround = args[4]);
        }
        if (sceneTruth(gt(nativeSceneValue(args[3]), nativeSceneValue(20)))) {
            (resolve(s._inst).imageAngle = args[3]);
            if (sceneTruth(sceneEqual(resolve(s._inst).imageAngle, 360))) {
                (resolve(s._inst).imageAngle = 0);
            }
        }
    }
}
