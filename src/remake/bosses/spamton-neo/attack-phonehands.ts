// Literal Chapter 2 NORMAL attack source events; source metadata and masks are retained.
import type {NeoAttackSourceRecord} from './controller';
export const attackSources:readonly NeoAttackSourceRecord[]=[
  {
    "metadata": {
      "index": 653,
      "name": "obj_sneo_phonehand_master",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_head_sad",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Alarm_0": "sprite_index = spr_sneo_head;\n",
      "Collision_obj_yheart_shot": "hp--;\nif (x <= (camerax() + 480))\n{\n    friction = 0.5;\n    if (other.big == 1)\n    {\n        hspeed += 8;\n    }\n    else\n    {\n        hspeed += 4;\n    }\n    var rembig = other.big;\n    with (obj_sneo_phonehand)\n    {\n        friction = 0.5;\n        hspeed += 2;\n        if (rembig)\n        {\n            hspeed += 4;\n        }\n    }\n}\nsnd_play(snd_damage);\nif (x >= (camerax() + 480))\n{\n    x = camerax() + 480;\n}\nwith (other)\n{\n    event_user(0);\n}\n",
      "Create_0": "event_inherited();\ndestroyonhit = 0;\nimage_speed = 0;\nimage_xscale = 2;\nimage_yscale = 2;\nsiner = 0;\nelement = 6;\nxdist = 70;\nphonehand_top = instance_create(x - xdist, y - 70, obj_sneo_phonehand);\nphonehand_top.orientation = \"top\";\nphonehand_top.boss = id;\nphonehand_top.target = obj_sneo_bulletcontroller.target;\nphonehand_bottom = instance_create(x - xdist, y + 60, obj_sneo_phonehand);\nphonehand_bottom.orientation = \"bottom\";\nphonehand_bottom.boss = id;\nphonehand_bottom.target = obj_sneo_bulletcontroller.target;\nmovedx = 0;\nhp = 200;\ndifficulty = 0;\ndifficulty = obj_spamton_neo_enemy.difficulty;\nbtimer = 0;\ninit = 0;\nvisibiliytimer = 0;\nimage_alpha = 0;\nbluesiner = 0;\nimage_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(bluesiner / 3) * 0.25));\n",
      "Destroy_0": "exit;\n",
      "Draw_0": "visibiliytimer++;\nif (visibiliytimer < 2)\n{\n    exit;\n}\nif (image_alpha < 1)\n{\n    image_alpha += 0.1;\n}\ndraw_set_alpha(image_alpha);\ndraw_self();\ndraw_set_alpha(1);\n",
      "Step_0": "siner++;\nbluesiner++;\nimage_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(bluesiner / 3) * 0.25));\nif (x >= (camerax() + 480))\n{\n    x = camerax() + 480;\n}\nif (grazed == 1)\n{\n    grazetimer += 1;\n    if (grazetimer >= 3)\n    {\n        grazetimer = 0;\n        grazed = 0;\n    }\n}\nif (instance_exists(obj_heart))\n{\n    if (obj_heart.x > (obj_sneo_phonehand_master.x - 36))\n    {\n        obj_heart.x = obj_sneo_phonehand_master.x - 36;\n    }\n}\nif (init == 0)\n{\n    if (difficulty == 2)\n    {\n        with (obj_sneo_phonehand)\n        {\n            alt = 1;\n        }\n    }\n    phonehand_top.target = target;\n    phonehand_bottom.target = target;\n    init = 1;\n}\nif (difficulty == 0)\n{\n    y = ystart + (sin(siner / 8) * 40);\n}\nif (difficulty == 1 || difficulty == 2)\n{\n    y = ystart + (sin(siner / 10) * 60);\n}\nif (i_ex(phonehand_top))\n{\n    if (difficulty < 2)\n    {\n        x = lerp(x, phonehand_top.x + xdist, 0.2);\n    }\n    else\n    {\n        x -= 1;\n    }\n}\nif (difficulty == 0 || difficulty == 1 || difficulty == 2)\n{\n    btimer++;\n    threshold = 20;\n    if (difficulty == 1)\n    {\n        threshold = 15;\n    }\n    if (difficulty == 2)\n    {\n        threshold = 30;\n    }\n    if (btimer >= threshold && image_alpha >= 1)\n    {\n        btimer = 0;\n        if (difficulty < 2)\n        {\n            shot = instance_create(x, y, obj_sneo_mmx_spreadshot);\n        }\n        else\n        {\n            shot = instance_create(x, y, obj_basicbullet_sneo);\n        }\n        shot.speed = 12;\n        shot.image_xscale = 3;\n        shot.image_yscale = 3;\n        if (difficulty < 2)\n        {\n            shot.friction = 1;\n        }\n        else\n        {\n            shot.speed = 10;\n        }\n        shot.alarm[0] = 25;\n        shot.direction = 180 + random_range(-5, 5);\n        shot.depth = depth - 1;\n        shot.target = target;\n        sprite_index = spr_sneo_head_open;\n        alarm[0] = 10;\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 655,
      "name": "obj_sneo_phonehand",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_phonehand",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "event_inherited();\ndestroyonhit = 0;\nsiner = 0;\ncrawlsiner = 0;\njointx = 999;\njointy = 999;\nremjointy = jointy;\nboss = -1;\nelement = 6;\namplitude = 4;\nperiod = 5;\norientation = \"top\";\ninit = 0;\ndifficulty = 0;\nbtimer = 0;\nmoving = 0;\nwasmoving = 0;\nalt = 0;\nvisibiliytimer = 0;\nimage_alpha = 0;\n",
      "Draw_0": "visibiliytimer++;\nif (visibiliytimer < 2)\n{\n    exit;\n}\nif (image_alpha < 1)\n{\n    image_alpha += 0.1;\n}\ndraw_set_alpha(image_alpha);\ndraw_set_color(c_green);\ndraw_line_width(x, y, jointx, jointy, 4);\nif (i_ex(boss))\n{\n    draw_line_width(jointx, jointy, boss.x, boss.y, 4);\n    for (i = 0; i < 4; i++)\n    {\n        draw_sprite_ext(spr_sneo_bullet0, 0, lerp(x, jointx, i / 4), lerp(y, jointy, i / 4), 2, 2, 0, c_green, 1);\n        draw_sprite_ext(spr_sneo_bullet0, 0, lerp(jointx, boss.x, i / 4), lerp(jointy, boss.y, i / 4), 2, 2, 0, c_green, 1);\n    }\n}\ndraw_self();\ndraw_set_alpha(1);\n",
      "Step_0": "if (init == 0)\n{\n    if (i_ex(boss))\n    {\n        if (orientation == \"top\")\n        {\n            jointx = boss.x - 10;\n            jointy = y - 30;\n        }\n        if (orientation == \"bottom\")\n        {\n            image_yscale = -1;\n            jointx = boss.x - 10;\n            jointy = y + 30;\n        }\n        remjointy = jointy;\n        init = 1;\n    }\n}\nif (btimer == 13)\n{\n    if (image_yscale > 0)\n    {\n        image_yscale = 2;\n    }\n    if (image_yscale < 0)\n    {\n        image_yscale = -2;\n    }\n}\nif (image_yscale > 1)\n{\n    image_yscale -= 0.2;\n}\nif (image_yscale < -1)\n{\n    image_yscale += 0.2;\n}\nmovingcheck = 0;\nif (alt == 0)\n{\n    crawlsiner++;\n    if (orientation == \"top\")\n    {\n        if (sin(crawlsiner / period) < 0)\n        {\n            wasmoving = 1;\n            movingcheck = 1;\n            y += (cos(crawlsiner / period) * amplitude * 2);\n            x += (sin(crawlsiner / period) * amplitude);\n        }\n    }\n    if (orientation == \"bottom\")\n    {\n        if (cos((crawlsiner / period) + 1.5707963267948966) < 0)\n        {\n            wasmoving = 1;\n            movingcheck = 1;\n            y += (sin((crawlsiner / period) + 1.5707963267948966) * amplitude * 2);\n            x += (cos((crawlsiner / period) + 1.5707963267948966) * amplitude);\n        }\n    }\n    if (i_ex(boss))\n    {\n        jointx = (x + boss.x) / 2;\n        jointy = (remjointy + y) / 2;\n    }\n}\nif (alt == 1 && i_ex(boss))\n{\n    if (orientation == \"top\")\n    {\n        crawlsiner++;\n    }\n    else\n    {\n        crawlsiner--;\n    }\n    xx = camerax() + 200;\n    endx = boss.x - 20;\n    x = xx + ((endx - xx) / 2) + (sin(crawlsiner / 12) * ((endx - xx) / 2));\n    btimer++;\n    threshold = 18;\n    if (orientation == \"top\")\n    {\n        threshold = 28;\n    }\n    if (btimer >= threshold)\n    {\n        shot = instance_create(x, y, obj_basicbullet_sneo);\n        if (orientation == \"top\")\n        {\n            shot.direction = 270 + random_range(-2, 2);\n        }\n        if (orientation == \"bottom\")\n        {\n            shot.direction = 90 + random_range(-2, 2);\n        }\n        shot.speed = 3;\n        shot.sprite_index = spr_sneo_soundbullet;\n        shot.image_angle = shot.direction;\n        shot.grazepoints = 3;\n        shot.target = target;\n        btimer = 0;\n        if (orientation == \"top\")\n        {\n            btimer = 10;\n        }\n        else\n        {\n            btimer = 0;\n        }\n    }\n    if (i_ex(boss))\n    {\n        jointx = (x + boss.x) / 2;\n        jointy = (remjointy + y) / 2;\n    }\n}\nif (difficulty == 99)\n{\n    if (movingcheck == 0 && wasmoving == 1)\n    {\n        wasmoving = 0;\n        repeat (3)\n        {\n            shot = instance_create(x, y, obj_basicbullet_sneo);\n            if (orientation == \"top\")\n            {\n                shot.direction = 270 + random_range(-10, 10);\n            }\n            if (orientation == \"bottom\")\n            {\n                shot.direction = 90 + random_range(-10, 10);\n            }\n            shot.speed = 8;\n            shot.sprite_index = spr_sneo_soundbullet;\n            shot.image_angle = shot.direction;\n            shot.target = target;\n            shot.grazepoints = 3;\n        }\n    }\n}\nif (difficulty == 99)\n{\n    if (btimer >= 6)\n    {\n        shot = instance_create(x, y, obj_basicbullet_sneo);\n        if (orientation == \"top\")\n        {\n            shot.direction = 270 + random_range(-4, 4);\n        }\n        if (orientation == \"bottom\")\n        {\n            shot.direction = 90 + random_range(-4, 4);\n        }\n        shot.speed = 4;\n        shot.sprite_index = spr_sneo_soundbullet;\n        shot.image_angle = shot.direction;\n        shot.target = target;\n        shot.grazepoints = 3;\n        btimer = 0;\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 654,
      "name": "obj_sneo_phonehand_master_hurtbox",
      "parent": "obj_regularbullet",
      "sprite": "spr_hitbox_10px",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "scr_bullet_init();\nwall_destroy = 1;\nimage_alpha = 1;\nsprite_index = spr_hitbox_10px;\nimage_xscale = 4;\nimage_yscale = 20;\nvisible = true;\ndestroyonhit = 0;\ngrazed = 1;\nelement = 6;\n",
      "Other_15": "if (active == 1)\n{\n    if (target != 3)\n    {\n        scr_damage();\n    }\n    if (target == 3)\n    {\n        scr_damage_all();\n    }\n    if (destroyonhit == 1)\n    {\n        instance_destroy();\n    }\n}\n",
      "Step_2": "exit;\n"
    }
  },
  {
    "metadata": {
      "index": 656,
      "name": "obj_sneo_mmx_spreadshot",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_bullet0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Alarm_0": "for (i = 0; i < 3; i++)\n{\n    shot = instance_create(x, y, obj_regularbullet);\n    if (i_ex(shot))\n    {\n        shot.direction = 120 + (i * 60);\n        shot.speed = 2;\n        shot.friction = -0.6;\n        shot.sprite_index = spr_sneo_soundbullet;\n        shot.image_angle = shot.direction;\n        shot.depth = obj_sneo_phonehand_master.depth - 1;\n        shot.grazepoints = 7;\n        shot.element = 6;\n    }\n    scr_bullet_inherit(shot);\n}\ninstance_destroy();\n",
      "Create_0": "event_inherited();\nelement = 6;\nflashtimer = 0;\ngrazed = 0;\ngrazepoints = 2;\ntimepoints = 1;\ntarget = -1;\ngrazetimer = 0;\nelement = 6;\ndont = 1;\ninv = 120;\nif (instance_exists(obj_clubsenemy))\n{\n    damage = global.monsterat[obj_clubsenemy.myself] * 5;\n}\n",
      "Draw_0": "draw_self();\nif (flashtimer > 0)\n{\n    flashtimer--;\n}\nd3d_set_fog(true, c_yellow, 0, 1);\ndraw_sprite_ext(sprite_index, image_index, x - 2, y - 2, image_xscale, image_yscale, 0, c_yellow, flashtimer / 5);\nd3d_set_fog(false, c_black, 0, 0);\n",
      "Step_0": "if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)\n{\n    instance_destroy();\n}\ndirection += angle_speed;\nimage_angle = direction;\nif (alarm[0] == 8 || alarm[0] == 16)\n{\n    flashtimer = 5;\n}\n"
    }
  }
];
