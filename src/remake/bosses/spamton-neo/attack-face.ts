// Literal Chapter 2 NORMAL attack source events; source metadata and masks are retained.
import type {NeoAttackSourceRecord} from './controller';
export const attackSources:readonly NeoAttackSourceRecord[]=[
  {
    "metadata": {
      "index": 634,
      "name": "obj_sneo_faceattack",
      "parent": "obj_basicbullet_sneo",
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "if (type == 0 || image_alpha < 0.9)\n{\n    exit;\n}\nif (broken == 1)\n{\n    snd_play(snd_bell);\n    with (other)\n    {\n        event_user(0);\n    }\n    exit;\n}\nif (invincibilitytimer > 0 && other.big == 0)\n{\n    with (other)\n    {\n        instance_destroy();\n    }\n    exit;\n}\nshake = 6;\nif (other.big == 0)\n{\n    if (type == 1)\n    {\n        obj_spamton_neo_enemy.eyeshp -= 1;\n    }\n    if (type == 2)\n    {\n        obj_spamton_neo_enemy.nosehp -= 1;\n    }\n    if (type == 3)\n    {\n        obj_spamton_neo_enemy.mouthhp -= 1;\n    }\n}\nelse\n{\n    var takedamageamount = 4;\n    if (obj_spamton_neo_enemy.hellmode == 1)\n    {\n        takedamageamount = 2;\n    }\n    if (type == 1)\n    {\n        obj_spamton_neo_enemy.eyeshp -= takedamageamount;\n    }\n    if (type == 2)\n    {\n        obj_spamton_neo_enemy.nosehp -= takedamageamount;\n    }\n    if (type == 3)\n    {\n        obj_spamton_neo_enemy.mouthhp -= takedamageamount;\n    }\n}\nsnd_play(snd_damage);\ninvincibilitytimer = 10;\nhurtflashtimer = 3;\nif ((type == 1 && obj_spamton_neo_enemy.eyeshp <= 0) || (type == 2 && obj_spamton_neo_enemy.nosehp <= 0) || (type == 3 && obj_spamton_neo_enemy.mouthhp <= 0))\n{\n    broken = 1;\n    image_index = 2;\n    snd_play(snd_rocket);\n    explodetimer = 16;\n}\nwith (other)\n{\n    event_user(0);\n}\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\ntype = 0;\ntimer = 0;\nhp = 16;\ninit = 0;\nimage_speed = 0;\nimage_index = 0;\nimage_alpha = 0;\nbroken = 0;\nscr_darksize(id);\nblend = merge_color(c_green, c_lime, 0.5);\ninvincibilitytimer = 0;\nhurtflashtimer = 0;\nshootflashtimer = 0;\nexplodetimer = 0;\nlaserinit = 0;\nnoseinit = 0;\neyesinit = 0;\nboss = 1;\ndestroytarget = 0;\nblue_col = merge_color(#00A2E8, c_aqua, 0.25);\nintro_timer = 0;\nfirst_time = false;\nsmashspeed = 25;\ngrowtangle_x = 0;\nheart_recoil = 0;\nspecial = 0;\n",
      "Destroy_0": "if (boss == 1)\n{\n    if (obj_spamton_neo_enemy.eyeshp <= 0 && obj_spamton_neo_enemy.nosehp <= 0 && obj_spamton_neo_enemy.mouthhp <= 0 && i_ex(obj_spamton_neo_enemy))\n    {\n        with (obj_spamton_neo_enemy)\n        {\n            eyeshp = 16;\n            nosehp = 16;\n            mouthhp = 16;\n            facebroken = 2;\n        }\n    }\n}\nwith (obj_sneo_faceattack_target)\n{\n    instance_destroy();\n}\n",
      "Draw_0": "if (init == 1)\n{\n    if (type == 1 && obj_spamton_neo_enemy.eyeshp > 0)\n    {\n        image_blend = merge_color(c_purple, blue_col, obj_spamton_neo_enemy.eyeshp / 16);\n    }\n    if (type == 2 && obj_spamton_neo_enemy.nosehp > 0)\n    {\n        image_blend = merge_color(c_purple, blue_col, obj_spamton_neo_enemy.nosehp / 16);\n    }\n    if (type == 3 && obj_spamton_neo_enemy.mouthhp > 0)\n    {\n        image_blend = merge_color(c_purple, blue_col, obj_spamton_neo_enemy.mouthhp / 16);\n    }\n    if ((type == 1 && obj_spamton_neo_enemy.eyeshp < 1) || (type == 1 && image_index == 2))\n    {\n        image_blend = c_white;\n    }\n    if ((type == 2 && obj_spamton_neo_enemy.nosehp < 1) || (type == 2 && image_index == 2))\n    {\n        image_blend = c_white;\n    }\n    if ((type == 3 && obj_spamton_neo_enemy.mouthhp < 1) || (type == 3 && image_index == 4))\n    {\n        image_blend = c_white;\n    }\n    if (shootflashtimer > 0)\n    {\n        image_blend = c_yellow;\n        shootflashtimer--;\n    }\n    if (hurtflashtimer > 0)\n    {\n        image_blend = c_red;\n        hurtflashtimer--;\n    }\n    var hidesprite = 0;\n    if (invincibilitytimer > 0)\n    {\n        if (invincibilitytimer == 10 || invincibilitytimer == 9 || invincibilitytimer == 6 || invincibilitytimer == 5 || invincibilitytimer == 3 || invincibilitytimer == 2)\n        {\n            hidesprite = 1;\n        }\n        invincibilitytimer--;\n        image_blend = c_red;\n    }\n    if (hidesprite == 0)\n    {\n        draw_self();\n    }\n    draw_sprite_ext(spr_battlebg_0, 0, x - 3, y + 70, 2.4, 2, 0, blend, 1);\n}\n",
      "Other_10": "if (id == instance_find(obj_sneo_faceattack, 0))\n{\n    boss = 1;\n    if (i_ex(obj_spamton_neo_enemy))\n    {\n        eyeshp = obj_spamton_neo_enemy.eyeshp;\n        nosehp = obj_spamton_neo_enemy.nosehp;\n        mouthhp = obj_spamton_neo_enemy.mouthhp;\n        if (obj_spamton_neo_enemy.facebroken == 1)\n        {\n            eyeshp = -1;\n            nosehp = -1;\n            mouthhp = -1;\n        }\n    }\n    else\n    {\n        eyeshp = 16;\n        nosehp = 16;\n        mouthhp = 16;\n    }\n    eyes = instance_create(x, y, obj_sneo_faceattack);\n    eyes.hp = eyeshp;\n    eyes.type = 1;\n    eyes.target = target;\n    eyes.damage = damage;\n    eyes.first_time = first_time;\n    nose = instance_create(x, y, obj_sneo_faceattack);\n    nose.hp = nosehp;\n    nose.type = 2;\n    nose.target = target;\n    nose.damage = damage;\n    nose.first_time = first_time;\n    mouth = instance_create(x, y, obj_sneo_faceattack);\n    mouth.hp = mouthhp;\n    mouth.type = 3;\n    mouth.target = target;\n    mouth.damage = damage;\n    mouth.first_time = first_time;\n}\nelse\n{\n    boss = 0;\n}\n",
      "Other_12": "var xx = 0;\nvar yy = 0;\nif (type == 1)\n{\n    xx = 62;\n    yy = 32;\n}\nif (type == 2)\n{\n    xx = 34;\n    yy = 64;\n}\nif (type == 3)\n{\n    xx = 52;\n    yy = 102;\n}\nif (type != 0)\n{\n    targ = instance_create(x + xx, y + yy, obj_sneo_faceattack_target);\n    targ.depth = depth - 999;\n}\n",
      "Step_0": "if (init == 0)\n{\n    if (type == 0)\n    {\n        sprite_index = spr_spamtonneo_faceAttack_face;\n    }\n    if (type == 1)\n    {\n        sprite_index = spr_spamtonneo_faceAttack_eyes;\n    }\n    if (type == 2)\n    {\n        sprite_index = spr_spamtonneo_faceAttack_nose;\n    }\n    if (type == 3)\n    {\n        sprite_index = spr_spamtonneo_faceAttack_mouth;\n    }\n    if (!first_time)\n    {\n        event_user(2);\n    }\n    if (type >= 1)\n    {\n        image_index = 1;\n        if (hp <= 0)\n        {\n            broken = 1;\n            image_index = 2;\n        }\n    }\n    if (type == 0)\n    {\n        depth += 10;\n    }\n    init = 1;\n    if (first_time)\n    {\n        image_alpha = 1;\n        xstart = x;\n        growtangle_x = obj_growtangle.x;\n        x = camerax() + 730;\n    }\n}\nif (first_time)\n{\n    if (intro_timer == 0)\n    {\n        x -= smashspeed;\n        smashspeed += 0.5;\n        if (x < xstart)\n        {\n            intro_timer = 15;\n            if (type == 0)\n            {\n                scr_shakescreen();\n                snd_play(snd_closet_impact);\n            }\n        }\n    }\n    if (intro_timer > 0)\n    {\n        intro_timer--;\n        if (intro_timer == 0)\n        {\n            first_time = false;\n            x = xstart;\n            if (type == 0)\n            {\n                intro_timer = -1;\n                with (obj_growtangle)\n                {\n                    x = other.growtangle_x;\n                }\n            }\n            event_user(2);\n        }\n        else\n        {\n            x = xstart - (sin(pi * (intro_timer / 15)) * 20);\n            if (type == 0)\n            {\n                with (obj_growtangle)\n                {\n                    x = other.growtangle_x - (sin(pi * (other.intro_timer / 15)) * 20);\n                }\n            }\n        }\n    }\n    if (first_time)\n    {\n        exit;\n    }\n}\nif (broken == 1 && type != 0 && destroytarget == 0)\n{\n    with (targ)\n    {\n        instance_destroy();\n    }\n    destroytarget = 1;\n}\ntimer++;\nif (image_alpha < 1 && global.turntimer > 21)\n{\n    image_alpha += 0.1;\n}\nif (explodetimer > 0)\n{\n    var xx = 0;\n    var yy = 0;\n    if (type == 1)\n    {\n        xx = 58;\n        yy = 32;\n    }\n    if (type == 2)\n    {\n        xx = 30;\n        yy = 64;\n    }\n    if (type == 3)\n    {\n        xx = 48;\n        yy = 102;\n    }\n    if ((explodetimer % 2) == 0)\n    {\n        cres = instance_create(((x + xx) - 25) + random(50), ((y + yy) - 25) + random(50), obj_boxing_crescent);\n        cres.depth = depth - 100;\n    }\n    explodetimer--;\n}\nvar brokencounter = 0;\nwith (obj_sneo_faceattack)\n{\n    if (broken == 1)\n    {\n        brokencounter++;\n    }\n}\nif (type == 1 && broken == 0)\n{\n    if (timer == 30 || laserinit == 0)\n    {\n        brokenmod = brokencounter;\n        lasex = -10 + x + 56;\n        lasey = y + 32;\n        laserdir = point_direction(lasex, lasey, obj_heart.x + 10, obj_heart.y + 10);\n        laserinit = 1;\n    }\n    if (timer >= 30 && (timer % 3) == 0)\n    {\n        if (global.turntimer > 21)\n        {\n            laser = instance_create(lasex, lasey, obj_werewire_bullet_lasercircle);\n            scr_bullet_inherit(laser);\n            laser.my_angle = laserdir;\n            if (brokenmod == 2)\n            {\n                laser.my_angle = laserdir + (brokenmod * random_range(-8, 8));\n            }\n            laser.my_speed = 7;\n            laser.my_accel = 0 + (brokenmod * 0.25);\n            laser.image_yscale = 2;\n            laser.my_angle_change = 0;\n            laser.target = target;\n            laser.damage = damage;\n            laser.element = 6;\n            shootflashtimer = 3;\n        }\n    }\n    if (timer == 50)\n    {\n        timer = 0 + (brokenmod * 5);\n    }\n}\nif (type == 2 && broken == 0)\n{\n    if (timer >= 70 && noseinit == 0)\n    {\n        brokenmod = brokencounter;\n        noseinit = 1;\n    }\n    if (timer >= 80 && (timer % 5) == 0)\n    {\n        var randomvspeed = random_range(-2, 2);\n        for (var i = 0; i < 3; i++)\n        {\n            bullet = instance_create(x, y, obj_regularbullet);\n            scr_bullet_inherit(bullet);\n            bullet.sprite_index = spr_spamtonneo_faceAttack_nose_bullet;\n            bullet.mask_index = spr_spamtonneo_faceAttack_nose_bullet_mask;\n            scr_darksize(bullet);\n            bullet.gravity = 0.6;\n            bullet.gravity_direction = 180;\n            bullet.friction = 0.4;\n            bullet.vspeed = -4 + (i * 4.5);\n            if (brokenmod == 2)\n            {\n                bullet.vspeed += randomvspeed;\n            }\n            bullet.hspeed = -3;\n            bullet.target = target;\n            bullet.damage = damage;\n            bullet.element = 6;\n            shootflashtimer = 3;\n        }\n    }\n    if (timer == 90)\n    {\n        timer = 26 + (brokenmod * 10);\n    }\n}\nif (type == 3 && broken == 0)\n{\n    if (timer >= 10 && eyesinit == 0)\n    {\n        eyesinit = 1;\n        brokenmod = brokencounter;\n    }\n    if (timer >= 10)\n    {\n        image_index = 3;\n    }\n    if (timer >= 10 && (timer % 6) == 0)\n    {\n        bullet = instance_create(x + 30, y + 98, obj_regularbullet);\n        bullet.sprite_index = spr_spamtonneo_faceAttack_wisp;\n        scr_bullet_inherit(bullet);\n        bullet.hspeed = random_range(-4, -7);\n        bullet.vspeed = random_range(6, -2);\n        if (obj_heart.y >= obj_growtangle.y)\n        {\n            bullet.vspeed += 1;\n        }\n        bullet.gravity = -0.2;\n        bullet.target = target;\n        bullet.damage = damage;\n        bullet.element = 6;\n        shootflashtimer = 3;\n    }\n    if (timer == 42)\n    {\n        image_index = 1;\n        timer = -40 + (brokenmod * 20);\n    }\n}\nif (scr_debug())\n{\n    if (keyboard_check_pressed(ord(\"U\")))\n    {\n        if (type == 1)\n        {\n            broken = true;\n        }\n    }\n    if (keyboard_check_pressed(ord(\"I\")))\n    {\n        if (type == 2)\n        {\n            broken = true;\n        }\n    }\n    if (keyboard_check_pressed(ord(\"O\")))\n    {\n        if (type == 3)\n        {\n            broken = true;\n        }\n    }\n}\nif ((type == 1 || type == 2) && broken == 1)\n{\n    image_index = 2;\n}\nif (type == 3 && broken == 1)\n{\n    image_index = 4;\n}\n",
      "Step_2": "if (type != 0 || (intro_timer == 0 && heart_recoil == 0))\n{\n    exit;\n}\nif (intro_timer == -1)\n{\n    if (obj_heart.x <= ((obj_growtangle.x - (obj_growtangle.sprite_width / 2)) + 4))\n    {\n        heart_recoil = 10;\n    }\n    intro_timer = 0;\n}\nelse if (intro_timer > 0)\n{\n    if (heart_recoil == 0 && intro_timer > 7 && obj_heart.x >= ((obj_growtangle.x + (obj_growtangle.sprite_width / 2)) - 24))\n    {\n        heart_recoil = scr_remapvalue(8, 15, intro_timer, 0, -10);\n    }\n}\nif (heart_recoil != 0)\n{\n    obj_heart.x += heart_recoil;\n    heart_recoil = scr_movetowards(heart_recoil, 0, 1);\n}\nobj_heart.x = clamp(obj_heart.x, (obj_growtangle.x - (obj_growtangle.sprite_width / 2)) + 2, (obj_growtangle.x + (obj_growtangle.sprite_width / 2)) - 24);\n"
    }
  },
  {
    "metadata": {
      "index": 675,
      "name": "obj_sneo_faceattack_target",
      "parent": null,
      "sprite": "spr_boxing_crescent",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false
    },
    "sources": {
      "Create_0": "image_speed = 0;\nimage_xscale = 0.4;\nimage_yscale = 0.4;\nimage_blend = c_red;\n"
    }
  },
  {
    "metadata": {
      "index": 837,
      "name": "obj_boxing_crescent",
      "parent": null,
      "sprite": "spr_boxing_crescent",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_speed = 0.5;\nimage_xscale = 2;\nimage_yscale = 2;\ntimer = 0;\n",
      "Step_0": "if (image_index >= 3)\n{\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 479,
      "name": "obj_werewire_bullet_lasercircle",
      "parent": "obj_regularbullet",
      "sprite": "spr_bullet_laser_circle",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "scr_bullet_init();\ngrazepoints = 3;\ndestroyonhit = 0;\nimage_xscale = 0;\nimage_yscale = 0;\ntimer = 0;\ntri = 1;\ntri_angle = 20;\nmy_angle = 180;\nmy_speed = 4;\nmy_accel = 0;\nmy_length = 1;\nmy_angle_change = 0;\npart_count = 0;\nsiner = 0;\nm = 2;\nparent = -1;\n",
      "Step_0": "if (parent != -1 && i_ex(parent))\n{\n    x = parent.x - 32;\n    y = parent.y;\n}\nsiner += 0.5;\ntimer += 1;\nif (timer <= (6 / m))\n{\n    image_xscale += (0.4 * m);\n    image_yscale += (0.4 * m);\n}\nif (timer > (6 / m) && timer <= (my_length + 3))\n{\n    laser = instance_create(x, y, obj_werewire_bullet_lasersquare);\n    scr_bullet_inherit(laser);\n    image_xscale -= (sin(siner * 1.3 * m) * 0.2);\n    image_yscale -= (sin(siner * 1.3 * m) * 0.2);\n    laser.image_angle = my_angle;\n    laser.speed = my_speed;\n    laser.direction = my_angle;\n    laser.friction = -my_accel;\n    laser.image_yscale = 1;\n    laser.my_angle_change = my_angle_change;\n    if (i_ex(obj_spamton_neo_enemy))\n    {\n        laser.sprite_index = spr_bullet_laser_square_sneo;\n    }\n    else\n    {\n        laser.sprite_index = spr_bullet_laser_square;\n    }\n    if (timer == 3)\n    {\n        if (i_ex(obj_spamton_neo_enemy))\n        {\n            laser.sprite_index = spr_bullet_laser_front_sneo;\n        }\n        else\n        {\n            laser.sprite_index = spr_bullet_laser_front;\n        }\n    }\n    if (timer == (my_length + 3))\n    {\n        if (i_ex(obj_spamton_neo_enemy))\n        {\n            laser.sprite_index = spr_bullet_laser_front_sneo;\n        }\n        else\n        {\n            laser.sprite_index = spr_bullet_laser_front;\n        }\n        laser.image_index = 1;\n    }\n}\nelse\n{\n    image_xscale -= (0.1 * m);\n    image_yscale -= (0.1 * m);\n    if (image_xscale <= 0 && image_yscale <= 0)\n    {\n        instance_destroy();\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 478,
      "name": "obj_werewire_bullet_lasersquare",
      "parent": "obj_regularbullet",
      "sprite": "spr_bullet_laser_square",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "scr_bullet_init();\ndestroyonhit = 0;\ngrazepoints = 2;\ninit_con = 0;\ninit_timer = 0;\ncircle_size = 1;\nimage_xscale = 2;\nimage_yscale = 3;\nimage_speed = 0;\nmy_angle_change = 0;\nm = 2;\nstretch = 1;\n",
      "Step_0": "if (stretch == 1)\n{\n    image_xscale = 2 + (speed / (10 * m));\n}\nif (x <= -100)\n{\n    instance_destroy();\n}\ndirection += my_angle_change;\nimage_angle = direction;\n"
    }
  }
];
