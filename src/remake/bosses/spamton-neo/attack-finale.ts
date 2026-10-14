// Literal Chapter 2 NORMAL attack source events; source metadata and masks are retained.
import type {NeoAttackSourceRecord} from './controller';
export const attackSources:readonly NeoAttackSourceRecord[]=[
  {
    "metadata": {
      "index": 652,
      "name": "obj_finale_growtangle",
      "parent": "obj_bulletparent",
      "sprite": "spr_battlebg_0",
      "mask": "spr_battlebg_0",
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_xscale = 0;\nimage_yscale = 0;\nimage_alpha = 0.3;\nmaxtimer = 15;\ntimeincrease = 1;\ntimer = maxtimer - timeincrease;\ngrowcon = 1;\nimage_speed = 0;\nimage_blend = merge_color(c_green, c_lime, 0.5);\ntarget_angle = 0;\nfullgrow = 0;\nkeep = 0;\nmegakeep = 0;\nmaxxscale = obj_growtangle.maxxscale;\nmaxyscale = obj_growtangle.maxyscale;\nsprite_index = obj_growtangle.spr_custom_box;\nobj_growtangle.depth -= 2;\ndepth = obj_growtangle.depth + 1;\n",
      "Draw_0": "draw_sprite_ext(spr_battlebg_stretch, 1, x, y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);\ndraw_sprite_ext(sprite_index, 0, x, y, image_xscale / (maxxscale / 2), image_yscale / (maxyscale / 2), image_angle, image_blend, image_alpha);\n",
      "Step_0": "growth = 0;\nif (timer < (maxtimer * 5) && growcon == 1)\n{\n    growth = 1;\n}\nif (timer > 0 && growcon == 3)\n{\n    growth = 1;\n}\nif (growth == 1)\n{\n    if (growcon == 1)\n    {\n        timer += timeincrease;\n    }\n    timeincrease += 0.025;\n    if (growcon == 3)\n    {\n        timer -= 1;\n    }\n    image_xscale = maxxscale * (timer / maxtimer);\n    image_yscale = maxyscale * (timer / maxtimer);\n    image_angle = 180 + (180 * (timer / maxtimer)) + target_angle;\n    image_alpha = min(1, 0.5 + ((timer / maxtimer) * 0.5));\n    d = instance_create(x, y, obj_afterimage);\n    d.sprite_index = sprite_index;\n    d.image_xscale = image_xscale / (maxxscale / 2);\n    d.image_yscale = image_yscale / (maxyscale / 2);\n    d.image_angle = image_angle;\n    d.depth = depth - 3;\n    if (growcon == 1 && timer == maxtimer)\n    {\n        d.image_xscale = image_xscale;\n        d.image_yscale = image_yscale;\n        d.sprite_index = obj_growtangle.sprite_index;\n        d.image_blend = c_white;\n        d.depth--;\n        d.image_alpha = 1;\n    }\n    else\n    {\n        d.image_blend = image_blend;\n        d.image_alpha = ((1 - (timer / (maxtimer * 5))) * 0.5) + 0.1;\n    }\n    d.image_speed = 0;\n    if (timer >= (maxtimer * 5) && growcon == 1)\n    {\n        growcon = 2;\n        image_angle = target_angle;\n    }\n    if (growcon == 3 && timer <= maxtimer)\n    {\n        global.turntimer = 0;\n        instance_destroy();\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 612,
      "name": "obj_sneo_warped_box",
      "parent": "obj_bulletparent",
      "sprite": "spr_battlebg_0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "depth = obj_growtangle.depth;\nobj_growtangle.image_alpha = 0;\nminx = obj_growtangle.x - (obj_growtangle.sprite_width / 2);\nmaxx = obj_growtangle.x + (obj_growtangle.sprite_width / 2);\nminy = obj_growtangle.y - (obj_growtangle.sprite_height / 2);\nmaxy = obj_growtangle.y + (obj_growtangle.sprite_height / 2);\nsuckx = obj_growtangle.x + 100;\nupper_sucky = obj_growtangle.y - 40;\nlower_sucky = obj_growtangle.y + 40;\nsuckpower = 0;\ntimer = 0;\nsnapback = 0;\ntarget = 0;\nstate = 0;\ninhale = 0;\ninhalespeed = 0;\nobj_battlesolid.image_xscale = 3;\nobj_battlesolid.image_yscale = 3;\nintro = 0;\nstopthesucc = 0;\n",
      "Destroy_0": "obj_growtangle.image_alpha = 1;\nobj_growtangle.keep = 1;\nobj_battlesolid.image_xscale = 2;\nobj_battlesolid.image_yscale = 2;\n",
      "Draw_0": "var colo = draw_get_color();\nif (inhalespeed > 0 && inhale < 1)\n{\n    inhale = clamp(inhale + inhalespeed, 0, 1);\n}\nvar _minx = lerp(minx, lerp(maxx, suckx, suckpower) - 8, inhale);\nvar _maxy = lerp(maxy, lerp(maxy, lower_sucky, suckpower) + 8, inhale);\nvar _miny = lerp(miny, lerp(miny, upper_sucky, suckpower) - 8, inhale);\ndraw_set_colour(#00C000);\ndraw_set_alpha(image_alpha);\ndraw_triangle(_minx, _miny, lerp(maxx, suckx, suckpower), lerp(_miny, upper_sucky, suckpower), lerp(maxx, suckx, suckpower), lerp(_maxy, lower_sucky, suckpower), 0);\ndraw_triangle(_minx, _miny, _minx, _maxy, lerp(maxx, suckx, suckpower), lerp(_maxy, lower_sucky, suckpower), 0);\ndraw_set_colour(c_black);\ndraw_triangle(_minx + 4, _miny + 4, lerp(maxx - 4, suckx - 4, suckpower), lerp(_miny + 4, upper_sucky + 3, suckpower), lerp(maxx - 4, suckx - 4, suckpower), lerp(_maxy - 4, lower_sucky - 3, suckpower), 0);\ndraw_triangle(_minx + 4, _miny + 4, _minx + 4, _maxy - 4, lerp(maxx - 4, suckx - 4, suckpower), lerp(_maxy - 4, lower_sucky - 3, suckpower), 0);\ndraw_set_colour(colo);\ndraw_set_alpha(1);\nif (state == 1)\n{\n    if (timer >= 60)\n    {\n        timer--;\n    }\n    if (timer >= 59)\n    {\n        suckpower = timer / 60;\n    }\n    else\n    {\n        suckpower = scr_ease_in(timer / 60, 3);\n    }\n}\nelse if (state == 2)\n{\n    if (timer > 30)\n    {\n        timer = 30;\n    }\n    if (snapback == 0)\n    {\n        snapback = -1;\n    }\n    if (timer > 0)\n    {\n        timer--;\n    }\n    suckpower = scr_ease_in(timer / 30, -2);\n}\n",
      "Other_5": "obj_growtangle.image_alpha = 1;\n",
      "Step_2": "if (instance_exists(obj_heart))\n{\n    if (state == 0)\n    {\n        if (obj_heart.x < (minx + 3))\n        {\n            obj_heart.x = minx + 3;\n        }\n        if (obj_heart.y < (miny + 3))\n        {\n            obj_heart.y = miny + 3;\n        }\n        if (obj_heart.y > (maxy - 20))\n        {\n            obj_heart.y = maxy - 20;\n        }\n        if (obj_heart.x > (maxx - 20))\n        {\n            obj_heart.x = maxx - 20;\n        }\n        exit;\n    }\n    rborder = lerp(maxx, suckx, suckpower);\n    uborder = miny;\n    dborder = maxy;\n    if (snapback == 0)\n    {\n        if (stopthesucc == 0)\n        {\n            obj_heart.x += suckpower;\n        }\n    }\n    if (snapback <= 0 && global.turntimer <= 30 && obj_heart.x >= (rborder - 22))\n    {\n        snapback = suckpower;\n        if (suckpower > 0.5)\n        {\n            if (!instance_exists(obj_shake))\n            {\n                d = instance_create(0, 0, obj_shake);\n                d.shakex = ceil(suckpower * 4);\n                d.shakey = ceil(suckpower * 4);\n            }\n        }\n    }\n    if (snapback > 0)\n    {\n        obj_heart.x -= (20 * scr_ease_in(snapback, 2));\n        snapback -= 0.1;\n    }\n    if (obj_heart.x < (minx + 3))\n    {\n        obj_heart.x = minx + 3;\n    }\n    if (obj_heart.x > (rborder - 20))\n    {\n        obj_heart.x = rborder - 20;\n    }\n    var xoffset = (obj_heart.x - (minx + 3)) / (rborder - 20 - (minx + 3));\n    var uppersuckoffset = (upper_sucky - miny) * xoffset * suckpower;\n    var lowersuckoffset = (maxy - lower_sucky) * xoffset * suckpower;\n    if (obj_heart.y < (uborder + 3 + uppersuckoffset))\n    {\n        obj_heart.y = uborder + 3 + uppersuckoffset;\n    }\n    if (obj_heart.y > (dborder - 20 - lowersuckoffset))\n    {\n        obj_heart.y = dborder - 20 - lowersuckoffset;\n    }\n    if (obj_heart.y < (uborder + 3))\n    {\n        obj_heart.y = uborder + 3;\n    }\n    if (obj_heart.y > (dborder - 20))\n    {\n        obj_heart.y = dborder - 20;\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 643,
      "name": "obj_sneo_final_forme",
      "parent": "obj_basicbullet_sneo_finale",
      "sprite": "spr_sneo_final_forme",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "with (other)\n{\n    event_user(0);\n}\nwith (obj_sneo_final_forme)\n{\n    hurtalpha = 1;\n}\nif (instance_exists(obj_sneo_final_forme))\n{\n    if ((obj_sneo_final_forme.destroyable && obj_sneo_final_forme.state == 0) || (obj_sneo_final_forme.state == 1 && obj_sneo_final_forme.formtimer < 30))\n    {\n    }\n    else\n    {\n        exit;\n    }\n}\nsnd_play(snd_damage);\nif (instance_exists(obj_sneo_final_forme))\n{\n    with (obj_sneo_final_forme)\n    {\n        hurtalpha = 1;\n    }\n    if (destroyable == 1)\n    {\n        if (other.big == 0)\n        {\n            x += 6;\n            formtimer += 4;\n        }\n        else\n        {\n            pushback = 10;\n            formtimer += 10;\n        }\n    }\n}\n",
      "Create_0": "event_inherited();\nelement = 6;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = floor((global.monsterat[obj_spamton_neo_enemy.myself] * 5) / 3);\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 4;\nsteptimer = 0;\nstepping = true;\npushback = 0;\nadvancespeed = 3;\nimage_speed = 0;\nmouthopen = false;\ndestroyonhit = 0;\nintrotimer = 0;\nintro = 0;\nmouthx = 90;\nmouthy = 142;\ninstance_create(x, y, obj_sneo_final_forme_hitbox);\nstate = 0;\nformtimer = 0;\nstepdir = -1;\nmade = 0;\nfakeheart = -4;\nfakeheart_speed = 0;\neffecttimer = 0;\nlerptimer = 0;\ninhalesfx = 0;\nhurtalpha = 0;\nbullet_suck_x1 = 20;\nbullet_suck_x2 = 130;\nbullet_suck_y1 = 100;\nbullet_suck_y2 = 190;\nmovetimer = 0;\nmoveframes = 12;\nmovecon = 0;\ntimer2 = 0;\ntimer3 = 0;\nheadoffset_x = 0;\nheadoffset_y = 0;\ndmgcon = 0;\nback = instance_create(x, y, obj_sneo_final_forme_mouth_back);\nback.depth = depth + 1;\nif (i_ex(obj_heart))\n{\n    back.depth = obj_heart.depth + 1;\n}\nhidemouthback = 0;\nplayback_sprite = scr_84_get_sprite(\"spr_sneo_playback\");\n",
      "Destroy_0": "obj_sneo_hitdetector.active = true;\nwith (obj_sneo_final_forme_mouth_back)\n{\n    instance_destroy();\n}\n",
      "Draw_0": "if (image_index == 5 && hidemouthback == 0)\n{\n    with (obj_sneo_final_forme_mouth_back)\n    {\n        image_index = 7;\n        x = obj_sneo_final_forme.x + obj_sneo_final_forme.headoffset_x;\n        y = obj_sneo_final_forme.y + obj_sneo_final_forme.headoffset_y;\n        visible = true;\n    }\n}\nelse\n{\n    with (obj_sneo_final_forme_mouth_back)\n    {\n        visible = false;\n    }\n}\ndraw_sprite_ext(sprite_index, 3, x, ystart - abs(sin(steptimer + ((state < 2) ? 0.15 : 0.05)) * 40), 1, 1, 0, image_blend, 1);\nif (image_angle != 0)\n{\n    draw_sprite_ext(spr_sneo_final_forme_head_rotate_origin, image_index, x + 138 + headoffset_x, y + 135 + headoffset_y, image_xscale, image_yscale, image_angle, c_white, 1);\n}\nelse if ((state >= 2 && state < 10) || (state == 11 && formtimer >= 30 && formtimer <= 70))\n{\n    var _shake = (state == 3) ? 2 : 1;\n    draw_sprite(sprite_index, image_index, x + random_range(-_shake, _shake), ystart - abs((sin(steptimer + ((state < 2) ? 0.15 : 0.05)) * 40) + random_range(-_shake, _shake)));\n}\nelse\n{\n    draw_sprite_ext(sprite_index, image_index, x + headoffset_x, y + headoffset_y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);\n}\nif ((destroyable && state == 0) || (state == 1 && formtimer < 30))\n{\n    if (hurtalpha > 0)\n    {\n        hurtalpha -= 0.1;\n    }\n    draw_sprite_ext(sprite_index, image_index, x, y, 1, 1, 0, c_yellow, hurtalpha);\n}\nif (intro != 0)\n{\n    image_index = 4;\n    introtimer++;\n    image_blend = merge_color(c_black, c_white, clamp(((introtimer / 30) - 0.5) / 1.5, 0, 1));\n    draw_sprite_ext(sprite_index, 2, x, y, 1, 1, 0, (intro == 1) ? merge_color(c_black, c_white, clamp(introtimer / 30, 0, 1)) : c_white, 1);\n    if (introtimer >= 68)\n    {\n        intro = 0;\n        image_index = 4;\n        image_alpha = 1;\n        image_blend = c_white;\n    }\n}\n",
      "Other_15": "if (active == 1)\n{\n    with (obj_spamton_neo_enemy)\n    {\n        event_user(2);\n    }\n    if (destroyonhit == 1)\n    {\n        instance_destroy();\n    }\n}\n",
      "Step_0": "if (!instance_exists(obj_sneo_final_forme_hitbox))\n{\n    instance_create(x, y, obj_sneo_final_forme_hitbox);\n}\nif (intro == 1)\n{\n    exit;\n}\nformtimer++;\nif (grazed == 1)\n{\n    grazetimer += 1;\n    if (grazetimer >= 30)\n    {\n        grazetimer = 0;\n        grazed = 0;\n    }\n}\nif (state < 2)\n{\n    if (state == 0)\n    {\n        stepdir = -1;\n    }\n    if (state == 0 && formtimer >= 25)\n    {\n        steptimer += 0.05;\n    }\n    if (steptimer >= pi)\n    {\n        if (state == 0 && formtimer < 25)\n        {\n        }\n        steptimer -= pi;\n        d = instance_exists(obj_shake) ? 196 : instance_create(0, 0, obj_shake);\n        d.shakex = ceil(2);\n        d.shakey = ceil(2);\n        snd_play(snd_screenshake);\n        if (state == 1)\n        {\n            stepdir = 1;\n        }\n    }\n    if (state == 11 && formtimer >= 65)\n    {\n    }\n    else\n    {\n        y = ystart - (sin(steptimer) * 40);\n    }\n    if (state == 0 && formtimer < 25)\n    {\n    }\n    else\n    {\n        x += (1.6 * stepdir);\n    }\n    if ((destroyable && state == 0 && x > (obj_growtangle.x + 140)) || (state == 1 && formtimer < 30 && x > (obj_growtangle.x + 140)))\n    {\n        x += (4 * stepdir);\n        pushback = 0;\n    }\n    if (destroyable)\n    {\n        var _box = obj_sneo_warped_box;\n        _box.suckx = min(obj_growtangle.x + 150, x + 106);\n        _box.timer = scr_movetowards(_box.timer, clamp(scr_inverselerp(520, obj_growtangle.x + 100, x), 0, 1) * 60, 2);\n        _box.upper_sucky = y + 129;\n        _box.lower_sucky = y + 159;\n    }\n    if (pushback > 0)\n    {\n        x += (pushback * (2/3));\n        if (x > (camerax() + 520))\n        {\n            pushback--;\n        }\n        else\n        {\n            pushback--;\n        }\n    }\n    if ((destroyable && state == 0) || (state == 1 && formtimer < 30))\n    {\n        if (inhalesfx == 0)\n        {\n            inhalesfx = 1;\n            snd_loop(snd_sneo_overpower);\n            snd_pitch(snd_sneo_overpower, 0.1);\n            snd_pitch_time(snd_sneo_overpower, 1, 90);\n            snd_volume(snd_sneo_overpower, 0.75, 0);\n            wreck = instance_create(x, y, obj_wreckpausespew);\n            wreck.depth = depth - 1;\n        }\n        effecttimer++;\n        if ((effecttimer % 6) == 0)\n        {\n            for (i = 0; i < 3; i++)\n            {\n                d = instance_create(x + mouthx, y + mouthy, obj_rouxls_power_up_orb);\n                d.direction = irandom(40) + (i * 40) + 120;\n                d.lifetime = 12;\n                d.depth = depth + 1;\n                d.image_blend = image_blend;\n            }\n        }\n    }\n    if ((state == 0 && x < (obj_growtangle.x - (obj_growtangle.sprite_width / 2.5))) || (state == 0 && obj_heart.x > (x + 70)))\n    {\n        state = 10;\n        formtimer = 0;\n        obj_sneo_bulletcontroller.special++;\n        fakeheart = instance_create(obj_heart.x, obj_heart.y, obj_sneo_fakeheart);\n    }\n    else if (state == 0 && formtimer >= 320)\n    {\n        obj_sneo_bulletcontroller.special++;\n        state++;\n        formtimer = 45;\n    }\n    else if (state == 1 && formtimer >= 45)\n    {\n        with (obj_wreckpausespew)\n        {\n            image_index = 1;\n        }\n        with (obj_sneo_dollar)\n        {\n            fade = 1;\n        }\n        state++;\n        formtimer = 45;\n        if (x > (obj_growtangle.x + 70))\n        {\n            obj_sneo_warped_box.state = 2;\n        }\n        image_index = 4;\n        image_angle = 1;\n        snd_stop(snd_sneo_overpower);\n        obj_sneo_warped_box.stopthesucc = 1;\n    }\n}\nelse if (state == 2 && formtimer >= 45)\n{\n    state++;\n    image_index = 5;\n    formtimer = 0;\n    steptimer = pi - steptimer;\n    obj_sneo_final_forme_hitbox.destroyable = false;\n    global.turntimer = 360;\n}\nelse if (state == 3)\n{\n    if (movecon == 0)\n    {\n        movetimer += (1 / moveframes);\n        image_angle = lerp_ease_in(image_angle, 25, movetimer, 2);\n        if (movetimer == 1)\n        {\n            movetimer = 0;\n            movecon = 1;\n        }\n    }\n    if (movecon == 2)\n    {\n        timer3++;\n        if (timer3 > 20)\n        {\n            movetimer += (1 / moveframes);\n            image_angle = lerp_ease_in(image_angle, -1, movetimer, 2);\n            headoffset_x = lerp(0, -12, movetimer);\n            headoffset_y = lerp(0, 2, movetimer);\n        }\n    }\n    if (timer2 < 100)\n    {\n        timer2++;\n    }\n    x = lerp(x, camerax() + 439, timer2 / 100);\n    if (x > (obj_growtangle.x + 70))\n    {\n        obj_sneo_warped_box.state = 2;\n    }\n    else\n    {\n        var _box = obj_sneo_warped_box;\n        _box.suckx = min(obj_growtangle.x + 150, x + 106);\n        _box.timer = clamp(scr_inverselerp(camerax() + 520, obj_growtangle.x + 100, x), 0, 1) * 60;\n        _box.upper_sucky = y + 129;\n        _box.lower_sucky = y + 159;\n    }\n    if (x > (camerax() + 438))\n    {\n        x = camerax() + 438;\n        movecon = 2;\n        if (movecon == 2 && movetimer == 1)\n        {\n            instance_destroy();\n            aa = instance_create(x, ystart - abs(sin(steptimer + 0.15) * 40), obj_sneo_lastattack);\n            with (aa)\n            {\n                yspot[0] = (obj_growtangle.y - (obj_growtangle.sprite_height / 2) - y_offset) + 40;\n                yspot[1] = (obj_growtangle.y + (obj_growtangle.sprite_height / 2)) - y_offset - 40;\n            }\n            global.turntimer = 300;\n        }\n    }\n}\nelse if (state == 4 && formtimer >= 25)\n{\n    formtimer = 0;\n    state = 5;\n    instance_create(x + mouthx, y + mouthy, obj_sneo_final_orb);\n    image_index = 5;\n}\nelse if (state == 10)\n{\n    fakeheart_speed = scr_movetowards(fakeheart_speed, 10, 1);\n    with (fakeheart)\n    {\n        var _targetx = obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx + 5;\n        if (x > (_targetx - 10))\n        {\n            _targetx += 20;\n        }\n        move_towards_point(_targetx, obj_sneo_final_forme.y + obj_sneo_final_forme.mouthy, obj_sneo_final_forme.fakeheart_speed);\n    }\n    obj_sneo_warped_box.inhalespeed += 0.01;\n    if (x > (x + mouthx + 10))\n    {\n        image_index = 4;\n        snd_stop(snd_sneo_overpower);\n    }\n    if (formtimer > 45)\n    {\n        fakeheart.speed = 0;\n        fakeheart.direction = 0;\n        state = 11;\n        formtimer = 0;\n        image_index = 4;\n        hidemouthback = 1;\n        snd_stop(snd_sneo_overpower);\n        obj_sneo_warped_box.image_alpha = 0;\n        obj_sneo_warped_box.timer = 0;\n        fakeheart.state = 1;\n        with (obj_sneo_dollar)\n        {\n            fade = 1;\n        }\n    }\n}\nelse if (state == 11)\n{\n    if (formtimer < 15)\n    {\n        exit;\n    }\n    if (x < (camerax() + 438))\n    {\n        x += 4;\n    }\n    if (x > (camerax() + 438) && formtimer < 65)\n    {\n        formtimer = 65;\n    }\n    if ((formtimer % 5) == 0 && formtimer >= 30 && formtimer <= 65)\n    {\n        var _hearthurt = snd_play(snd_hurt1);\n        snd_pitch(_hearthurt, random_range(1.4, 2));\n        d = instance_exists(obj_shake) ? 196 : instance_create(0, 0, obj_shake);\n        d.shakex = ceil(1);\n        d.shakey = ceil(1);\n        if (dmgcon == 0)\n        {\n            dmgcon = 1;\n            global.inv = -1;\n            with (obj_spamton_neo_enemy)\n            {\n                event_user(2);\n            }\n        }\n    }\n    if (formtimer == 50)\n    {\n        obj_growtangle.timer = 0;\n        obj_growtangle.growcon = 1;\n        obj_growtangle.image_alpha = 1;\n    }\n    if (formtimer == 65)\n    {\n        obj_sneo_warped_box.inhale = 0;\n        obj_sneo_warped_box.inhalespeed = 0;\n        obj_sneo_warped_box.image_alpha = 1;\n        obj_growtangle.image_alpha = 0;\n    }\n    if (x > (camerax() + 438))\n    {\n        if (formtimer < 50)\n        {\n            obj_growtangle.timer = 0;\n            obj_growtangle.growcon = 1;\n            obj_growtangle.image_alpha = 1;\n        }\n        formtimer = 0;\n        state = 12;\n        fakeheart.x = x + mouthx;\n        fakeheart.y = y + mouthy;\n        fakeheart.state = 2;\n        image_index = 5;\n    }\n}\nelse if (state == 12)\n{\n    with (obj_wreckpausespew)\n    {\n        image_index = 1;\n    }\n    if (movetimer < 1)\n    {\n        movetimer += (1 / moveframes);\n        headoffset_x = lerp(0, -12, movetimer);\n        headoffset_y = lerp(0, 2, movetimer);\n    }\n    if (formtimer >= 30 && movetimer >= 1)\n    {\n        state = 2;\n        formtimer = 0;\n        image_index = 4;\n        instance_destroy();\n        instance_create(x, ystart - abs(sin(steptimer + 0.15) * 40), obj_sneo_lastattack);\n    }\n}\nif (state >= 11)\n{\n    steptimer += 0.05;\n    if (steptimer >= pi)\n    {\n        steptimer -= pi;\n        d = instance_exists(obj_shake) ? 196 : instance_create(0, 0, obj_shake);\n        d.shakex = ceil(2);\n        d.shakey = ceil(2);\n        snd_play(snd_screenshake);\n    }\n    y = ystart - (sin(steptimer) * 40);\n}\n"
    }
  },
  {
    "metadata": {
      "index": 644,
      "name": "obj_sneo_final_forme_hitbox",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_final_forme_hitbox",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false
    },
    "sources": {
      "Collision_obj_yheart_shot": "with (other)\n{\n    event_user(0);\n}\nif (instance_exists(obj_sneo_final_forme))\n{\n    if ((obj_sneo_final_forme.destroyable && obj_sneo_final_forme.state == 0) || (obj_sneo_final_forme.state == 1 && obj_sneo_final_forme.formtimer < 30))\n    {\n    }\n    else\n    {\n        exit;\n    }\n}\nsnd_play(snd_damage);\nif (instance_exists(obj_sneo_final_forme))\n{\n    with (obj_sneo_final_forme)\n    {\n        hurtalpha = 1;\n    }\n    if (destroyable == 1)\n    {\n        if (other.big == 0)\n        {\n            parent.x += 7;\n            parent.formtimer += 5;\n        }\n        else\n        {\n            parent.pushback = 13;\n            parent.formtimer += 13;\n        }\n    }\n}\n",
      "Create_0": "event_inherited();\ndestroyonhit = false;\nparent = obj_sneo_final_forme;\n",
      "Step_2": "if (instance_exists(obj_sneo_final_forme))\n{\n    parent = obj_sneo_final_forme;\n    x = parent.x;\n    y = parent.y;\n}\nif (instance_exists(obj_sneo_lastattack))\n{\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 41,
      "name": "obj_sneo_final_forme_mouth_back",
      "parent": null,
      "sprite": "spr_sneo_final_forme",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_index = 7;\n",
      "Step_2": "if (i_ex(obj_sneo_final_forme))\n{\n    x = obj_sneo_final_forme.x + obj_sneo_final_forme.headoffset_x;\n    y = obj_sneo_final_forme.y + obj_sneo_final_forme.headoffset_y;\n}\n"
    }
  },
  {
    "metadata": {
      "index": 645,
      "name": "obj_sneo_dollar",
      "parent": "obj_regularbullet",
      "sprite": "spr_spamton_dollar",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "event_inherited();\nelement = 6;\nimage_alpha = 0;\nstartscale = 1;\ndestroyable = 0;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = floor((global.monsterat[obj_spamton_neo_enemy.myself] * 5) / 3);\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 4;\nfade = 0;\n",
      "Draw_0": "if (image_alpha < 1 && fade == 0)\n{\n    image_alpha += 0.1;\n}\ndraw_self();\n",
      "Other_15": "if (fade == 1)\n{\n    exit;\n}\nif (active == 1)\n{\n    with (obj_spamton_neo_enemy)\n    {\n        event_user(2);\n    }\n    if (destroyonhit == 1)\n    {\n        instance_destroy();\n    }\n}\n",
      "Step_0": "if (fade == 1)\n{\n    image_alpha -= 0.1;\n    speed = 0;\n    if (image_alpha <= 0)\n    {\n        instance_destroy();\n    }\n}\nevent_inherited();\nif (!instance_exists(obj_sneo_final_forme))\n{\n    exit;\n}\nif (x > ((obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx) - 50))\n{\n    y += clamp((obj_sneo_final_forme.y + obj_sneo_final_forme.mouthy) - y, -5, 5);\n}\nif (x < ((obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx) - 10))\n{\n    direction = point_direction(x, y, obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx, obj_sneo_final_forme.y + obj_sneo_final_forme.mouthy);\n    friction = -0.1;\n}\nvar _mouthrelative = obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx;\nvar _scalesize = lerp(startscale, 1, clamp(scr_inverselerp(_mouthrelative - 200, _mouthrelative - 50, x), 0, 1));\nimage_xscale = _scalesize;\nimage_yscale = _scalesize;\nif (x > (obj_sneo_final_forme.x + obj_sneo_final_forme.mouthx + 50))\n{\n    instance_destroy();\n    snd_play(snd_swallow);\n}\n"
    }
  },
  {
    "metadata": {
      "index": 646,
      "name": "obj_sneo_fakeheart",
      "parent": "obj_bulletparent",
      "sprite": "spr_yellowheart",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "depth = obj_heart.depth;\nobj_heart.image_alpha = 0;\nglobal.inv = 300;\nstate = 0;\nheartspeed = 14;\nobj_heart.color = 0;\nstartangle = 0;\n",
      "Destroy_0": "if (global.turntimer <= 0)\n{\n    global.inv = -1;\n}\nif (instance_exists(obj_heart))\n{\n    obj_heart.image_alpha = 1;\n    obj_heart.x = x;\n    obj_heart.y = y;\n    obj_heart.color = 1;\n}\n",
      "Draw_0": "xx = scr_orbitx(x + 9, y + 9, x, y, image_angle);\nyy = scr_orbity(x + 9, y + 9, x, y, image_angle);\nif (image_xscale != 1 || image_yscale != 1)\n{\n    draw_sprite_ext_centerscale(sprite_index, obj_heart.image_index, x, y, image_xscale, image_yscale, image_angle, 16777215, image_alpha);\n}\nelse\n{\n    draw_sprite_ext(sprite_index, obj_heart.image_index, xx, yy, image_xscale, image_yscale, image_angle, c_white, image_alpha);\n}\n",
      "Step_2": "if (state == 0)\n{\n    image_angle -= (speed * 2);\n}\nelse if (state == 1)\n{\n    image_alpha = 0;\n    image_angle = 0;\n    x = obj_growtangle.x + 400;\n    speed = 0;\n    direction = 0;\n}\nelse if (state == 2)\n{\n    image_angle += 60;\n    image_alpha = 1;\n    x -= 20;\n    var _minx = (obj_growtangle.x - (obj_growtangle.sprite_width / 2)) + 4;\n    if (x <= (_minx + 20))\n    {\n        x = _minx;\n        obj_heart.x = x;\n        obj_heart.y = y;\n        state = 3;\n        global.inv = -1;\n        with (obj_spamton_neo_enemy)\n        {\n            event_user(2);\n        }\n        with (obj_dmgwriter)\n        {\n            depth = obj_sneo_fakeheart.depth - 2;\n            x = obj_heroparent.x;\n            y = obj_heroparent.y;\n        }\n        obj_heart.color = 1;\n        image_angle %= 360;\n        if (image_angle < 180)\n        {\n            image_angle += 360;\n        }\n        startangle = image_angle;\n        heartspeed = 8;\n    }\n}\nelse if (state == 3)\n{\n    obj_heart.x += heartspeed;\n    x = obj_heart.x;\n    heartspeed -= 1.5;\n    image_angle = scr_remapvalue(8, 0, heartspeed, startangle, 0);\n    if (heartspeed <= 0)\n    {\n        obj_heart.color = 1;\n        obj_heart.image_alpha = 1;\n        instance_destroy();\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 648,
      "name": "obj_sneo_lastattack",
      "parent": null,
      "sprite": "spr_sneo_lastattack_head",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "x_offset = 66;\ny_offset = 135;\nskip_1st_part_hp = 12;\nskip_2nd_part_hp = 17;\nyspot[0] = obj_growtangle.y - (obj_growtangle.sprite_height / 2) - y_offset;\nyspot[1] = (obj_growtangle.y + (obj_growtangle.sprite_height / 2)) - y_offset;\nyspot[2] = y;\nlastshoty = y;\nrand = 80;\nycurrent = 1;\ncon = 0;\nmovetimer = 0;\nshottimer = 0;\ntimer = 0;\ncount = 0;\nmouthtopy = 0;\nmouthbottomy = 0;\nshotmouthopen = 0;\nshotmouthopentimer = 0;\nmouthangle = 0;\ninit = 0;\nremx = x;\nhurtalpha = 0;\ninstance_create(x, y, obj_sneo_lastattack_hitbox);\nendattack = 0;\nwith (obj_wreckpausespew)\n{\n    image_index = 2;\n}\n",
      "Destroy_0": "with (obj_wreckpausespew)\n{\n    instance_destroy();\n}\n",
      "Draw_0": "if (hurtalpha > 0)\n{\n    hurtalpha -= 0.1;\n}\ndraw_sprite(spr_sneo_final_forme, 3, x, y);\ndraw_sprite_ext(spr_sneo_lastattack_head_top, 0, x + 60 + (mouthbottomy / 2) + x_offset, y + mouthtopy + y_offset, 1, 1, mouthangle, c_white, 1);\ndraw_sprite(sprite_index, 1, x + (mouthbottomy / 2) + x_offset, y + mouthbottomy + y_offset);\ndraw_sprite_ext(spr_sneo_lastattack_head_top, 0, x + 60 + (mouthbottomy / 2) + x_offset, y + mouthtopy + y_offset, 1, 1, mouthangle, c_yellow, hurtalpha);\ndraw_sprite_ext(sprite_index, 1, x + (mouthbottomy / 2) + x_offset, y + mouthbottomy + y_offset, 1, 1, 0, c_yellow, hurtalpha);\n",
      "Step_0": "if (init == 0)\n{\n    remx = x;\n    movetimer++;\n    init = 1;\n}\nif (con == 0)\n{\n    movetimer++;\n    if (movetimer <= 14)\n    {\n        y = lerp(y, yspot[ycurrent], 0.122);\n    }\n    else\n    {\n        movetimer = 0;\n        count++;\n        ycurrent++;\n        if (ycurrent >= 2)\n        {\n            ycurrent = 0;\n        }\n    }\n    shottimer++;\n    if (shottimer >= choose(15))\n    {\n        lastshoty = y;\n        bigshot = instance_create(x + 100, y + y_offset, obj_sneo_bigshot);\n        bigshot.hspeed = -6;\n        bigshot.friction = -0.25;\n        shottimer = 0 + (count / 4);\n        shotmouthopen = 1;\n        shotmouthopentimer = 0;\n        rand = 70 + irandom(5);\n        snd_play_x(snd_chargeshot_fire, 0.75, 0.7);\n    }\n    if (count == 10 || endattack == 1)\n    {\n        con = 1;\n        timer = 0;\n        endattack = 1;\n    }\n}\nif (shotmouthopen == 1)\n{\n    shotmouthopentimer++;\n    mouthtopy = -sin(shotmouthopentimer / 3) * 30;\n    mouthbottomy = -mouthtopy;\n    mouthangle = mouthtopy;\n    if (mouthbottomy < 0)\n    {\n        mouthangle = 0;\n        mouthtopy = 0;\n        mouthbottomy = 0;\n        shotmouthopentimer = 0;\n        shotmouthopen = 0;\n    }\n}\nif (con == 1)\n{\n    timer++;\n    y = lerp(y, (yspot[0] + yspot[1]) / 2, 0.1);\n    if (timer < 10)\n    {\n        mouthbottomy = lerp(mouthbottomy, 0, 0.2);\n        mouthtopy = lerp(mouthtopy, 20, 0.2);\n    }\n    if (timer >= 10 && timer < 25)\n    {\n        mouthbottomy = lerp(mouthbottomy, 120, 0.04);\n        mouthtopy = lerp(mouthtopy, -100, 0.04);\n        mouthangle = lerp(mouthangle, -45, 0.05);\n    }\n    if (timer >= 10)\n    {\n        mouthtopy += (sin(timer * 2) * 4);\n        mouthbottomy -= (sin(timer * 2) * 4);\n        mouthangle -= (sin(timer) * 5);\n        x += random_range(-1, 1);\n        y += random_range(-1, 1);\n    }\n    if (timer == 11)\n    {\n        bigshot = instance_create(x + 131, y + y_offset, obj_sneo_bigshot);\n        bigshot.image_xscale = 0;\n        bigshot.image_yscale = 0;\n        bigshot.sprite_index = spr_sneo_bigshot_l;\n        shottimer = 0;\n        snd_play_x(snd_chargeshot_fire, 0.7, 0.4);\n        snd_play_x(snd_chargeshot_fire, 0.7, 0.6);\n        snd_play_x(snd_chargeshot_fire, 0.7, 0.8);\n        snd_play_x(snd_chargeshot_fire, 0.7, 0.9);\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 649,
      "name": "obj_sneo_lastattack_hitbox",
      "parent": null,
      "sprite": "spr_whitepx_10",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false
    },
    "sources": {
      "Collision_obj_yheart_shot": "with (other)\n{\n    event_user(0);\n}\nif (obj_sneo_lastattack.endattack != 2)\n{\n    snd_play(snd_damage);\n    if (instance_exists(obj_sneo_lastattack))\n    {\n        with (obj_sneo_lastattack)\n        {\n            hurtalpha = 1;\n        }\n    }\n    if (obj_sneo_lastattack.endattack == 0)\n    {\n        obj_sneo_lastattack.skip_1st_part_hp -= other.damage;\n    }\n    if (obj_sneo_lastattack.skip_1st_part_hp < 1 && obj_sneo_lastattack.endattack == 0)\n    {\n        obj_sneo_lastattack.endattack = 1;\n    }\n    if (obj_sneo_lastattack.skip_2nd_part_hp < 1 && obj_sneo_lastattack.endattack == 1)\n    {\n        with (obj_sneo_bigshot)\n        {\n            playerhit = 1;\n            damage = 0;\n            event_user(0);\n        }\n        obj_sneo_lastattack.endattack = 2;\n    }\n}\n",
      "Create_0": "event_inherited();\ndestroyonhit = false;\nparent = obj_sneo_lastattack;\nx = parent.x + parent.x_offset + 30;\ny = (parent.y + parent.y_offset) - 40;\nimage_xscale = 4;\nimage_yscale = 6;\n",
      "Step_2": "if (instance_exists(obj_sneo_lastattack))\n{\n    parent = obj_sneo_lastattack;\n    x = parent.x + parent.x_offset + 30;\n    y = (parent.y + parent.y_offset) - 40;\n}\n"
    }
  },
  {
    "metadata": {
      "index": 642,
      "name": "obj_sneo_final_orb",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_neobuster",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "if (destroyable == 1)\n{\n    if (other.big == 0)\n    {\n        hp--;\n        speed = 3;\n    }\n    else\n    {\n        hp -= 3;\n        speed = 0;\n    }\n    if (hp <= 0)\n    {\n        event_user(0);\n        snd_play(snd_badexplosion);\n        speed = 0;\n    }\n    else\n    {\n        timer = -1;\n        snd_play(snd_damage);\n    }\n}\nwith (other)\n{\n    event_user(0);\n}\n",
      "Create_0": "event_inherited();\ndestroyable = 1;\ndestroyonhit = 0;\nimage_xscale = 4;\nimage_yscale = 4;\nhp = 12;\ntimer = 0;\ndirection = 180;\nspeed = 3;\nplayerhit = 0;\nglobal.turntimer = 300;\nflashsiner = 0;\n",
      "Draw_0": "flashsiner++;\nvar blend_color = merge_color(#00A2E8, c_aqua, 0.25 + (sin(flashsiner / 3) * 0.25));\ndraw_self();\nimage_angle += (10 + (timer * 2));\nif (timer > 0)\n{\n    draw_sprite_ext(spr_sneo_bigcircle, 0, x, y, image_xscale + (timer * 2), image_yscale + timer, 0, c_white, 1);\n    draw_sprite_ext(spr_pixel_white, 0, camerax() - 20, cameray() - 20, 220, 220, 0, c_white, clamp(timer / 15, 0, 1));\n}\ndraw_set_alpha(0.5);\ndraw_set_color(c_white);\ni = max(0, hp);\nwhile (i < 12)\n{\n    var _conewidth = ((((i - 1) % 3) == 0) ? 14 : 4) / 2;\n    var _x2 = lengthdir_x(999, ((sin(i) + 1) * 180) - _conewidth);\n    var _y2 = lengthdir_y(999, ((sin(i) + 1) * 180) - _conewidth);\n    var _x3 = lengthdir_x(999, ((sin(i) + 1) * 180) + _conewidth);\n    var _y3 = lengthdir_y(999, ((sin(i) + 1) * 180) + _conewidth);\n    draw_triangle(x, y, _x2, _y2, _x3, _y3, 0);\n    i++;\n}\ndraw_set_alpha(1);\n",
      "Other_10": "if (timer > 0)\n{\n    exit;\n}\ntimer = 1;\ndestroyable = 0;\ndepth -= 40;\nd = instance_create(x, y, obj_fadeout);\nd.image_blend = c_white;\n",
      "Other_15": "if (destroyable == 1)\n{\n    playerhit = 1;\n    event_user(0);\n}\n",
      "Step_0": "if (timer != 0)\n{\n    timer++;\n}\nelse if (timer == 0)\n{\n    if (speed < 3)\n    {\n        speed += 0.25;\n    }\n}\nif (timer > 60)\n{\n    d = instance_create(camerax(), cameray(), obj_fadein);\n    with (obj_fadeout)\n    {\n        instance_destroy();\n    }\n    d.image_blend = c_white;\n    d.fadespeed = -0.01;\n    if (playerhit)\n    {\n        scr_damage_all();\n    }\n    global.turntimer = 1;\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 638,
      "name": "obj_sneo_bigshot",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_bigshot_s",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "scr_bullet_init();\nelement = 6;\ndestroyonhit = 0;\nf = 2;\ndestroyable = 1;\nangle_speed = 0;\ndestroypoints = 1;\nattackisdone = 0;\ndamage = 50;\nimage_xscale = 1;\nimage_yscale = 2;\ntimer = 0;\nplayerhit = 0;\nflashsiner = 0;\ndepth = obj_heart.depth - 5;\nexplosion_alpha = 1;\nexplosion_hide = 0;\nxx = x;\nyy = y;\ngrazepoints = 4;\ntimer2 = 0;\nexplodesfx = 0;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = floor((global.monsterat[obj_spamton_neo_enemy.myself] * 5) / 3);\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\n",
      "Destroy_0": "d = instance_create(camerax(), cameray(), obj_fadein);\nwith (obj_fadeout)\n{\n    instance_destroy();\n}\nd.image_blend = c_white;\nd.fadespeed = -0.034;\nglobal.turntimer = 1;\nwith (obj_sneo_lastattack)\n{\n    instance_destroy();\n}\nwith (obj_sneo_lastattack_hitbox)\n{\n    instance_destroy();\n}\nif (sprite_index == spr_sneo_bigshot_l)\n{\n    with (obj_spamton_neo_enemy)\n    {\n        if (global.monsterhp[myself] == global.monstermaxhp[myself] && scr_sideb_get_phase() < 3)\n        {\n            obj_sneo_bulletcontroller.mercyaccumulated += 5;\n            with (obj_spamton_neo_enemy)\n            {\n                __mercydmgwriter = instance_create(global.monsterx[myself], (global.monstery[myself] + 20) - (global.hittarget[myself] * 20), obj_dmgwriter);\n                __mercydmgwriter.damage = 5;\n                __mercydmgwriter.type = 5;\n                global.hittarget[myself]++;\n            }\n        }\n        else\n        {\n            global.monsterhp[0] -= ceil(global.monstermaxhp[0] * 0.05);\n            if (global.monsterhp[0] < 0)\n            {\n                global.monsterhp[0] = 1;\n            }\n        }\n    }\n}\n",
      "Draw_0": "if (explosion_hide == 0)\n{\n    draw_self();\n}\nif (timer > 0)\n{\n    obj_sneo_lastattack.endattack = 3;\n    if (obj_sneo_lastattack.endattack == 2)\n    {\n        if (timer >= 7)\n        {\n            explosion_alpha -= 0.1;\n        }\n        draw_sprite_ext(spr_pixel_white, 0, camerax() - 20, cameray() - 20, 220, 220, 0, c_white, clamp(timer / 60, 0, 1));\n    }\n    else\n    {\n        if (explodesfx == 0)\n        {\n            explodesfx = 1;\n            snd_loop(snd_rumble);\n            snd_play_x(snd_explosion, 0.6, 1);\n        }\n        draw_sprite_ext(spr_sneo_bigcircle, 0, x - 50, y, image_xscale + (timer * 2), image_yscale + timer, 0, c_white, 1);\n        draw_sprite_ext(spr_pixel_white, 0, camerax() - 20, cameray() - 20, 220, 220, 0, c_white, clamp(timer / 12, 0, 1));\n    }\n}\n",
      "Other_10": "if (playerhit)\n{\n    if (timer > 0)\n    {\n        exit;\n    }\n    timer = 1;\n    destroyable = 0;\n    attackisdone = 1;\n    depth -= 40;\n    hspeed = 0;\n    if (obj_sneo_lastattack.skip_2nd_part_hp > 0)\n    {\n    }\n    obj_sneo_lastattack.endattack = 3;\n    xx = x;\n    yy = y;\n}\nelse\n{\n}\n",
      "Other_15": "if (sprite_index == spr_sneo_bigshot_l)\n{\n    playerhit = 1;\n    event_user(0);\n    with (obj_spamton_neo_enemy)\n    {\n        event_user(2);\n    }\n}\nelse if (sprite_index == spr_sneo_bigshot_s)\n{\n    if (active == 1)\n    {\n        with (obj_spamton_neo_enemy)\n        {\n            event_user(2);\n        }\n        if (destroyonhit == 1)\n        {\n            instance_destroy();\n        }\n    }\n}\n",
      "Step_0": "if (sprite_index == spr_sneo_bigshot_l)\n{\n    timer2++;\n    if (timer2 < 11)\n    {\n        if (instance_exists(obj_sneo_lastattack))\n        {\n            depth = obj_sneo_lastattack.depth + 1;\n        }\n    }\n    else if (instance_exists(obj_sneo_lastattack))\n    {\n        depth = obj_sneo_lastattack.depth - 1;\n    }\n    if (timer2 < 16)\n    {\n        image_xscale = lerp(0, 2, timer2 / 15);\n        image_yscale = lerp(0, 2, timer2 / 15);\n    }\n    if (timer2 == 15)\n    {\n        hspeed = -1;\n        friction = -0.05;\n    }\n    x += random_range(-1, 1);\n    y = ystart + random_range(-4, 4);\n    if (x < (camerax() + 400))\n    {\n        event_user(0);\n        playerhit = 1;\n        damage = 0;\n        if (instance_exists(obj_sneo_lastattack))\n        {\n            obj_sneo_lastattack.endattack = 2;\n        }\n    }\n}\nelse\n{\n    image_xscale = lerp(image_xscale, 2, 0.2);\n}\nif (timer != 0)\n{\n    timer++;\n}\nif (timer > 13)\n{\n    instance_create(camerax() + 320, cameray() + 240, obj_sneo_smoke);\n    instance_destroy();\n    snd_volume(snd_rumble, 0, 70);\n    obj_spamton_neo_enemy.stoprumblesfx = 70;\n}\n"
    }
  },
  {
    "metadata": {
      "index": 647,
      "name": "obj_sneo_finale_bullet",
      "parent": "obj_basicbullet_sneo_finale",
      "sprite": "spr_sneo_crew_bullet",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "event_inherited();\nflashsiner = 0;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 4;\n",
      "Step_0": "if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)\n{\n    instance_destroy();\n}\nimage_angle += 36;\nif (destroyable == 1)\n{\n    flashsiner++;\n    image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(flashsiner / 3) * 0.25));\n}\n"
    }
  },
  {
    "metadata": {
      "index": 565,
      "name": "obj_wreckpausespew",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "playback_sprite = scr_84_get_sprite(\"spr_sneo_playback\");\nimage_speed = 0;\n",
      "Draw_0": "draw_sprite(playback_sprite, image_index, camerax() + 20, cameray() + 400);\n"
    }
  },
  {
    "metadata": {
      "index": 758,
      "name": "obj_rouxls_power_up_orb",
      "parent": null,
      "sprite": "spr_bullet_laser_circle",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "init = 0;\nimage_alpha = 0;\nlifetime = 30;\nxx = x;\nyy = y;\ntimer = 0;\nradius = 5;\nparenttarget = -1;\nthin = 0;\n_type = 0;\ntrack_target = -4;\nxoff = 0;\nyoff = 0;\nmax_radius = 6;\ndistance_multiplier = 1;\n",
      "Draw_0": "if (parenttarget != -1 && !i_ex(parenttarget))\n{\n    instance_destroy();\n    exit;\n}\nif (parenttarget != -1 && i_ex(parenttarget))\n{\n    xstart = parenttarget.x;\n    ystart = parenttarget.y;\n}\nif (init == 0)\n{\n    init = 1;\n    if (thin)\n    {\n        lifetime /= 2;\n    }\n    if (track_target != -4)\n    {\n        xstart = 0;\n        ystart = 0;\n    }\n    var _distance = random_range(70, 90) * distance_multiplier;\n    if (_type == 1)\n    {\n        _distance = random_range(40, 45);\n    }\n    xx = xstart + lengthdir_x(_distance, direction);\n    x = xx;\n    yy = ystart + lengthdir_y(_distance, direction);\n    y = yy;\n}\nif (track_target != -4)\n{\n    xoff = track_target.x;\n    yoff = track_target.y;\n}\ntimer++;\nif (timer > lifetime)\n{\n    instance_destroy();\n    exit;\n}\nvar _progress = timer / lifetime;\nimage_alpha = 1;\nif (thin)\n{\n    image_blend = c_white;\n    image_yscale = 0.25;\n    image_angle = direction;\n    draw_self();\n    x = lerp(xx, xstart, scr_ease_in(_progress, 2)) + xoff;\n    y = lerp(yy, ystart, scr_ease_in(_progress, 2)) + yoff;\n}\nelse\n{\n    var _drawalpha = draw_get_alpha();\n    draw_set_color(image_blend);\n    draw_circle(x, y, radius - 2, 0);\n    draw_set_alpha(image_alpha);\n    x = lerp(xx, xstart, scr_ease_in(_progress, 2)) + xoff;\n    y = lerp(yy, ystart, scr_ease_in(_progress, 2)) + yoff;\n    draw_circle(x, y, radius, 0);\n    if ((radius - 3) > 0)\n    {\n        draw_set_color(c_white);\n        draw_circle(x, y, radius - 2, 0);\n    }\n    draw_set_alpha(_drawalpha);\n    radius = lerp(max_radius, 1, _progress);\n}\n"
    }
  }
];
