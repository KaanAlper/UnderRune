# NEO finale responsibility audit and ledger

Audit completed before replacing the empty test scaffold. All 54 freshly extracted event bodies match their targeted archive records. Original event files were read separately with labelled boundaries from .tools/neo-release-original-20261015/code; metadata comes from targeted archive records only. No source event text is reproduced here.

All frame/collision responsibilities below move into finale.ts. Warped-box Room End currently remains in the existing endNeoAttackRoom lifecycle dispatcher. Existing shared bullet/contact/cleanup ancestry remains canonical, and the power-up orb remains in wireheart.ts. Cross-family definitions are looked up lazily.

## obj_basicbullet_sneo_finale

- Parent: obj_basicbullet_sneo; index: 599; sprite: spr_sneo_bullet0; mask: null; visible: true.
- Explicit events: Collision_obj_yheart_shot, Create_0, Other_15, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): angle_speed, anim, damage, destroyable, destroypoints, direction, element, f, grazepoints, image_angle, image_xscale, image_yscale, sprite_index, target.

## obj_finale_growtangle

- Parent: obj_bulletparent; index: 652; sprite: spr_battlebg_0; mask: spr_battlebg_0; visible: true.
- Explicit events: Create_0, Draw_0, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): d, depth, fullgrow, growcon, growth, image_alpha, image_angle, image_blend, image_speed, image_xscale, image_yscale, keep, maxtimer, maxxscale, maxyscale, megakeep, sprite_index, target_angle, timeincrease, timer, turntimer.

## obj_sneo_warped_box

- Parent: obj_bulletparent; index: 612; sprite: spr_battlebg_0; mask: null; visible: true.
- Explicit events: Create_0, Destroy_0, Draw_0, Other_5, Step_2.
- Assignment inventory (instance/callee/global fields and built-ins): d, dborder, depth, image_alpha, image_xscale, image_yscale, inhale, inhalespeed, intro, keep, lower_sucky, maxx, maxy, minx, miny, rborder, shakex, shakey, snapback, state, stopthesucc, suckpower, suckx, target, timer, uborder, upper_sucky, x, y.
- Event-local names: colo, _minx, _maxy, _miny, xoffset, uppersuckoffset, lowersuckoffset.


## obj_sneo_final_forme

- Parent: obj_basicbullet_sneo_finale; index: 643; sprite: spr_sneo_final_forme; mask: null; visible: true.
- Explicit events: Collision_obj_yheart_shot, Create_0, Destroy_0, Draw_0, Other_15, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): aa, active, advancespeed, back, bullet_suck_x1, bullet_suck_x2, bullet_suck_y1, bullet_suck_y2, d, damage, depth, destroyable, destroyonhit, direction, dmgcon, effecttimer, element, fade, fakeheart, fakeheart_speed, formtimer, grazed, grazepoints, grazetimer, growcon, headoffset_x, headoffset_y, hidemouthback, hurtalpha, i, image_alpha, image_angle, image_blend, image_index, image_speed, inhale, inhalesfx, inhalespeed, intro, introtimer, inv, lerptimer, lifetime, lower_sucky, made, mouthopen, mouthx, mouthy, movecon, moveframes, movetimer, playback_sprite, pushback, shakex, shakey, special, speed, state, stepdir, stepping, steptimer, stopthesucc, suckx, target, timer, timer2, timer3, turntimer, upper_sucky, visible, wreck, x, y, yspot.
- Event-local names: _box, _hearthurt, _shake, _targetx.


## obj_sneo_final_forme_hitbox

- Parent: obj_basicbullet_sneo; index: 644; sprite: spr_sneo_final_forme_hitbox; mask: null; visible: false.
- Explicit events: Collision_obj_yheart_shot, Create_0, Step_2.
- Assignment inventory (instance/callee/global fields and built-ins): destroyonhit, formtimer, hurtalpha, parent, pushback, x, y.

## obj_sneo_final_forme_mouth_back

- Parent: none; index: 41; sprite: spr_sneo_final_forme; mask: null; visible: true.
- Explicit events: Create_0, Step_2.
- Assignment inventory (instance/callee/global fields and built-ins): image_index, x, y.

## obj_sneo_dollar

- Parent: obj_regularbullet; index: 645; sprite: spr_spamton_dollar; mask: null; visible: true.
- Explicit events: Create_0, Draw_0, Other_15, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): damage, destroyable, direction, element, fade, friction, grazepoints, image_alpha, image_xscale, image_yscale, speed, startscale, target, y.
- Event-local names: _mouthrelative, _scalesize.


## obj_sneo_fakeheart

- Parent: obj_bulletparent; index: 646; sprite: spr_yellowheart; mask: null; visible: true.
- Explicit events: Create_0, Destroy_0, Draw_0, Step_2.
- Assignment inventory (instance/callee/global fields and built-ins): color, depth, direction, heartspeed, image_alpha, image_angle, inv, speed, startangle, state, x, xx, y, yy.
- Event-local names: _minx.


## obj_sneo_lastattack

- Parent: none; index: 648; sprite: spr_sneo_lastattack_head; mask: null; visible: true.
- Explicit events: Create_0, Destroy_0, Draw_0, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): bigshot, con, count, endattack, friction, hspeed, hurtalpha, image_index, image_xscale, image_yscale, init, lastshoty, mouthangle, mouthbottomy, mouthtopy, movetimer, rand, remx, shotmouthopen, shotmouthopentimer, shottimer, skip_1st_part_hp, skip_2nd_part_hp, sprite_index, timer, x, x_offset, y, y_offset, ycurrent, yspot.

## obj_sneo_lastattack_hitbox

- Parent: none; index: 649; sprite: spr_whitepx_10; mask: null; visible: false.
- Explicit events: Collision_obj_yheart_shot, Create_0, Step_2.
- Assignment inventory (instance/callee/global fields and built-ins): damage, destroyonhit, endattack, hurtalpha, image_xscale, image_yscale, parent, playerhit, skip_1st_part_hp, x, y.

## obj_sneo_final_orb

- Parent: obj_basicbullet_sneo; index: 642; sprite: spr_sneo_neobuster; mask: null; visible: true.
- Explicit events: Collision_obj_yheart_shot, Create_0, Draw_0, Other_10, Other_15, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): d, depth, destroyable, destroyonhit, direction, fadespeed, flashsiner, hp, i, image_angle, image_blend, image_xscale, image_yscale, playerhit, speed, timer, turntimer.
- Event-local names: blend_color, _conewidth, _x2, _y2, _x3, _y3.


## obj_sneo_bigshot

- Parent: obj_collidebullet; index: 638; sprite: spr_sneo_bigshot_s; mask: null; visible: true.
- Explicit events: Create_0, Destroy_0, Draw_0, Other_10, Other_15, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): __mercydmgwriter, angle_speed, attackisdone, d, damage, depth, destroyable, destroyonhit, destroypoints, element, endattack, explodesfx, explosion_alpha, explosion_hide, f, fadespeed, flashsiner, friction, grazepoints, hittarget, hspeed, image_blend, image_xscale, image_yscale, mercyaccumulated, monsterhp, playerhit, stoprumblesfx, target, timer, timer2, turntimer, type, x, xx, y, yy.

## obj_sneo_finale_bullet

- Parent: obj_basicbullet_sneo_finale; index: 647; sprite: spr_sneo_crew_bullet; mask: null; visible: true.
- Explicit events: Create_0, Step_0.
- Assignment inventory (instance/callee/global fields and built-ins): damage, flashsiner, grazepoints, image_angle, image_blend, target.

## obj_wreckpausespew

- Parent: none; index: 565; sprite: null; mask: null; visible: true.
- Explicit events: Create_0, Draw_0.
- Assignment inventory (instance/callee/global fields and built-ins): image_speed, playback_sprite.

## Inherited handlers and dependencies

- Finale parent inherits basic bullet ancestry/contact integration, but replaces Create, Step, shot collision and user5; user5 calls shared proportional damage or all-party damage. It intentionally omits the ordinary basic Create fluffyguard flag.
- Final form inherits finale-parent user/contact behavior and owns pullsShots. Final head hitbox inherits ordinary basic bullet Create and generic damage contact; parent stores the object resource identity.
- Dollar inherits regular bullet Create/Step; final orb inherits ordinary basic bullet ancestry. Finale bullet inherits finale parent collision/user5. Explicit overrides do not implicitly run their parents.
- Bulletparent cleanup ancestry remains on growtangle, warped box and fakeheart. Mouthback, last attack/hitbox and spew have no parent. Last hitbox inherited Create is therefore a no-op.
- External dependencies: canonical growtangle, heart, battlesolid, enemy, controller, detector, shake, afterimage, power-up orb, yheart shot/hit animation, fadein/out, damage writer, hero parent and scene smoke.
- Final form Draw mutates mouthback visibility, intro/color/pose, hurt alpha and RNG. Warped Draw mutates inhale, suction timer and snapback. Orb Draw mutates angle/flash/loop i. Dollar Draw changes fade-in. Last Draw reduces hurt alpha. Bigshot Draw starts explosion audio and sets endattack to 3.
- Sounds: damage, screenshake, overpower loop/pitch/ramp/volume, hurt1 pitch, swallow, badexplosion, charged-shot fire, rumble loop/volume and explosion. No instance sound handle is stored by these definitions (the hurt1 handle is event-local).
- No shortcuts, signal/slot callbacks, CLI/env/config keys or lifecycle registrations exist in this family beyond the listed events. No game dialogue is required.
- Destroy must not stop final-form successor creation, dollar inherited Step or finale projectile rotation. Last-attack hitbox skip_2nd_part_hp is checked but never decremented in the original collision; retain that behavior.

## Coverage ledger

- Test-first scaffold: 10 focused tests failed because the explicit factory had no definitions. After root integrated shared dependencies, the expanded suite has 21 passing focused tests. A separate regression exposed audio-optional RNG short-circuiting and passed after fixing it.
- Existing 4000/6000-frame oracle scripts never reach finale. The new 18000-frame zlong original reaches the final family at frames 12631–13250, including final form, head, last attack and bigshot; integrated parity is being rerun by root. These tests are synthetic, deterministic event scenarios and do not establish late-route frame parity. Root owns integration, full-suite and recordings.
- Suggested recording: seeded longer menu loop with repeated ACT progression (mercy route), then charged-shot bursts during the final form; record frame dumps every 20 frames. For attack-family parity without waiting for a full route, add an explicit oracle script trigger that changes the controller to the source-supported finale attack type 9, with identical original/remake state at a checkpoint. Do not modify installed game data.

- Source review confirms both last-attack transitions, the delayed bigshot threshold explosion, continued execution after Destroy, GML-tolerant comparisons, loop i persistence and right-to-left Draw RNG.
- Shared dependency gaps identified proactively: scr_damage_proportional (root port now tested), snd_pitch_time/obj_lerppitch (root port), obj_fadeout and enemy user2/scr_damage_sneo_final_attack (root ports now exercised by the finale tests). Scene smoke comes from the concurrent scene family.
- Audit Markdown was stripped of the specified invisible Unicode ranges; it has no document metadata. The Windows watermarks-remover service is not installed.

- Long recording exposed a mistaken event mapping: warped-box Other_5 is Room End, not Animation End (Other_7). Mapping it to animationEnd restored growtangle alpha every sprite loop. A failing regression reproduced alpha 1 vs 0; removing the wrong mapping fixes it. The existing room-end dispatcher retains the true Other_5 effect; native roomEnd integration is a root-owned follow-up unless added before acceptance.
- Fresh verification after that correction: npx vitest run tests/remake-neo-finale.test.ts: 21/21 pass; npx tsc --noEmit: pass. Full suite, long parity, build and publication remain root-owned acceptance.
