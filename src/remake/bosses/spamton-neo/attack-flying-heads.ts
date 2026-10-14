// Literal Chapter 2 NORMAL attack source events; source metadata and masks are retained.
import type {NeoAttackSourceRecord} from './controller';
export const attackSources:readonly NeoAttackSourceRecord[]=[
  {
    "metadata": {
      "index": 603,
      "name": "obj_sneo_guymaker",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_bullet_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false
    },
    "sources": {
      "Alarm_0": "instance_destroy();\n",
      "Create_0": "type = 4;\nif (obj_spamton_neo_enemy.difficulty == 0)\n{\n    type = 1;\n}\nif (obj_spamton_neo_enemy.difficulty == 1)\n{\n    type = 2;\n}\nif (obj_spamton_neo_enemy.difficulty == 2)\n{\n    type = 3;\n}\nif (obj_spamton_neo_enemy.difficulty == 3)\n{\n    type = 4;\n}\nif (instance_exists(obj_sneo_heartattack))\n{\n    type = 5;\n}\nif (obj_spamton_neo_enemy.difficulty == 6)\n{\n    type = 6;\n}\nif (obj_spamton_neo_enemy.difficulty == 7)\n{\n    type = 7;\n}\ntimer = 0;\nprevrow = 0;\nrow = 0;\nprevrowy = 0;\nspawncount = 0;\nfirstspawn = 0;\n",
      "Step_0": "xx = __view_get(e__VW.XView, 0);\nyy = __view_get(e__VW.YView, 0);\ntimer++;\nif (type == 1 || type == 2 || type == 3 || type == 4 || type == 5 || type == 6 || type == 7)\n{\n    if (timer == 1)\n    {\n        if (type == 1)\n        {\n            row = choose(0, 1);\n            if (prevrow == 2)\n            {\n                row = choose(0, 1);\n            }\n        }\n        if (type == 2)\n        {\n            var aa = choose(0, 1, 2);\n            if (prevrowy == 0)\n            {\n                aa = choose(1, 2);\n            }\n            if (prevrowy == 1)\n            {\n                aa = choose(0, 2);\n            }\n            if (prevrowy == 2)\n            {\n                aa = choose(0, 1);\n            }\n            rowy = (yy + 210) - (46 * aa);\n            prevrowy = aa;\n            row = 2;\n        }\n        if (type == 3 || type == 4)\n        {\n            rowy = (yy + 210) - (40 * choose(0, 1));\n            row = choose(0, 1, 3, 6);\n            if (prevrow == 2)\n            {\n                row = choose(0, 1, 3, 6);\n            }\n            if (prevrow == 3)\n            {\n                row = choose(0, 1);\n            }\n            if (row == 3 && firstspawn == 0)\n            {\n                row = choose(0, 1);\n            }\n            firstspawn = 1;\n        }\n        if (type == 5)\n        {\n            rowy = (yy + 210) - (40 * choose(0, 1, 2));\n            row = choose(0, 1, 2, 2, 3, 6);\n            if (prevrow == 2)\n            {\n                row = choose(0, 1, 3, 6);\n            }\n            if (prevrow == 3)\n            {\n                row = choose(0, 1, 2);\n            }\n        }\n        if (type == 6)\n        {\n            row = 6;\n        }\n        if (type == 7)\n        {\n            row = 7;\n        }\n    }\n    if (timer == 5 || timer == 10 || timer == 15 || timer == 20)\n    {\n        if (row == 0 || row == 1 || row == 2)\n        {\n            guy = instance_create(xx + 700, yy + 280, obj_sneo_lilguy);\n            guy.hspeed = -18;\n            guy.friction = -0.1;\n            guy.vspeed = -2;\n            guy.alarm[0] = 44;\n            guy.alarm[1] = 40;\n            guy.alarm[2] = 32;\n            guy.gravity = 0.5;\n            guy.gravity_direction = 0;\n            guy.destroyable = 1;\n            guy.image_blend = #00A2E8;\n            guy.changedirection = 0;\n            guy.altdirection = 0;\n            guy.altspeed = 4;\n            guy.altfriction = -0.2;\n            guy.altgravity = 0;\n            if (type == 2)\n            {\n                guy.alarm[0] = 44;\n            }\n            if (row == 1)\n            {\n                guy.y -= 240;\n                guy.vspeed = -guy.vspeed;\n            }\n            if (row == 2)\n            {\n                guy.y -= 120;\n                guy.vspeed = 0;\n                guy.hspeed = -21;\n            }\n            if (row == 2 && type == 2)\n            {\n                guy.hspeed = -21;\n                guy.gravity = 0;\n                guy.friction = 0.5;\n                guy.alarm[0] = 36;\n                guy.changedirection = 1;\n                guy.altdirection = guy.direction;\n            }\n            if ((type == 2 || type == 3 || type == 4 || type == 5) && row == 2)\n            {\n                guy.y = rowy;\n            }\n        }\n        if (row == 3 && timer != 20)\n        {\n            for (guyi = 0; guyi < 2; guyi++)\n            {\n                guy[guyi] = instance_create(xx + 300, (yy - 40) + (400 * guyi), obj_sneo_lilguy);\n                guy[guyi].vspeed = 18 - (36 * guyi);\n                guy[guyi].alarm[0] = 44;\n                guy[guyi].alarm[1] = 40;\n                guy[guyi].alarm[2] = 32;\n                guy[guyi].gravity = 0.8 - (1.6 * guyi);\n                guy[guyi].gravity_direction = 90;\n                guy[guyi].destroyable = 1;\n            }\n        }\n        if (row == 6 && timer == 5)\n        {\n            spawncount = 2;\n            var a = 0;\n            repeat (spawncount)\n            {\n                guy = instance_create(xx + 410 + (a * 70), (yy - 20) + 0, obj_sneo_lilguy);\n                guy.vspeed = 15;\n                guy.alarm[0] = 44;\n                guy.alarm[1] = 30;\n                guy.alarm[2] = 32;\n                guy.gravity = 0.53;\n                guy.gravity_direction = 90;\n                guy.destroyable = 1;\n                guy = instance_create(xx + 445 + (a * 70), (yy - 20) + 400, obj_sneo_lilguy);\n                guy.vspeed = -15;\n                guy.alarm[0] = 44;\n                guy.alarm[1] = 40;\n                guy.alarm[2] = 32;\n                guy.gravity = -0.53;\n                guy.gravity_direction = 90;\n                guy.destroyable = 1;\n                a++;\n            }\n        }\n        if (row == 7 && timer != 20)\n        {\n            guy = instance_create(xx + 630, yy + 100, obj_sneo_lilguy);\n            guy.alarm[0] = 44;\n            guy.alarm[1] = 40;\n            guy.alarm[2] = 32;\n            guy.destroyable = 1;\n            with (guy)\n            {\n                path_start(path_sneo_head_path1, 11, path_action_stop, 0);\n            }\n        }\n    }\n    if (type == 2 && timer >= 41)\n    {\n        timer = 0;\n    }\n    if (type == 3 && timer >= 69)\n    {\n        timer = 0;\n    }\n    if (type == 6 && timer >= 69)\n    {\n        timer = 0;\n    }\n    if (type == 4 && timer >= 50)\n    {\n        timer = 0;\n    }\n    if (type == 5 && timer >= 69)\n    {\n        timer = 0;\n    }\n    if (timer >= 50)\n    {\n        timer = 0;\n    }\n    if (timer == 0)\n    {\n        prevrow = row;\n    }\n}\n\nenum e__VW\n{\n    XView,\n    YView,\n    WView,\n    HView,\n    Angle,\n    HBorder,\n    VBorder,\n    HSpeed,\n    VSpeed,\n    Object,\n    Visible,\n    XPort,\n    YPort,\n    WPort,\n    HPort,\n    Camera,\n    SurfaceID\n}\n"
    }
  },
  {
    "metadata": {
      "index": 607,
      "name": "obj_sneo_lilguy",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Alarm_0": "if (changedirection)\n{\n    direction = altdirection;\n    gravity = altgravity;\n    friction = altfriction;\n    speed = altspeed;\n}\n",
      "Alarm_1": "if (instance_exists(obj_heart))\n{\n    bullet = instance_create(x, y + 12, obj_sneo_lilguy_bullet);\n    bullet.bulletspeed = bulletspeed;\n    bullet.depth = depth - 1;\n    with (bullet)\n    {\n        move_towards_point(obj_heart.x + 8, obj_heart.y + 8, bulletspeed);\n    }\n}\nimage_index = 2;\nimage_speed = 1;\n",
      "Alarm_2": "image_index = 1;\n",
      "Collision_obj_yheart_shot": "hitshot = other;\nevent_user(0);\nif (obj_spamton_neo_enemy.difficulty == 3)\n{\n    scr_tensionheal(1);\n}\nelse\n{\n    scr_tensionheal(1.3);\n}\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\nf = 2;\ndestroyable = 0;\nangle_speed = 0;\nyellowsiner = 0;\nloop = 0;\nloopy1 = 90;\nloopy2 = 240;\nfalsevspeed = 0;\nbighitbox = 0;\nbighead = 0;\nangleadjust = 0;\nactive = 1;\naltdir = 0;\naltspeed = 0;\naltfriction = 0;\naltgravity = 0;\nchangedirection = 0;\nbulletspeed = 8;\nimage_speed = 0;\ncutscene = 0;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 2;\n",
      "Draw_0": "draw_self();\n",
      "Other_10": "if (destroyable == 1)\n{\n    if (bighead && hitshot.big == 0)\n    {\n        snd_play_x(snd_bell, 0.8, 0.7 + random(0.1));\n        with (hitshot)\n        {\n            x -= abs(hspeed);\n            hspeed = -8;\n            vspeed = choose(-8, 8, 10, -10);\n            scr_doom(id, 90);\n        }\n    }\n    else\n    {\n        if (hitshot.big == 0)\n        {\n            with (hitshot)\n            {\n                event_user(0);\n            }\n        }\n        snd_volume(snd_bomb, 0.7, 0);\n        snd_play_x(snd_bomb, 0.7, 1.1 + random(0.2));\n        var _cut = scr_afterimage_cut();\n        _cut.flash = true;\n        instance_destroy();\n    }\n}\n",
      "Other_7": "if (cutscene == 0)\n{\n    image_speed = 0;\n}\n",
      "Other_8": "instance_destroy();\n",
      "Step_0": "if (cutscene == 0)\n{\n    if (x >= (camerax() + 1000) || x <= (camerax() - 200) || y >= (cameray() + 600) || y <= (cameray() - 200))\n    {\n        instance_destroy();\n    }\n}\ndirection += angle_speed;\nif (angleadjust == 1)\n{\n    image_angle = direction;\n}\nif (destroyable == 1)\n{\n    yellowsiner++;\n    image_blend = merge_color(#00A2E8, c_aqua, 0.25 + (sin(yellowsiner / 3) * 0.25));\n}\nif (loop == 1)\n{\n    if (y < loopy1)\n    {\n        y = loopy2 - (loopy1 - y);\n    }\n    if (y > loopy2)\n    {\n        y = loopy1 + (y - loopy2);\n    }\n}\ny += falsevspeed;\nif (bighitbox == 1)\n{\n    hitshot = collision_rectangle(x, y, x + sprite_width, y + sprite_height, obj_yheart_shot, true, false);\n    if (hitshot != -4)\n    {\n        event_user(0);\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 623,
      "name": "obj_sneo_lilguy_bullet",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_crew_bullet",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Step_0": "if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)\n{\n    instance_destroy();\n}\nimage_angle += 36;\n"
    }
  },
  {
    "metadata": {
      "index": 637,
      "name": "obj_sneo_biglaser",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_laser",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_heart": "exit;\n",
      "Collision_obj_sneo_lilguy": "exit;\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\ndestroyonhit = 0;\nactive = 0;\nimage_yscale = 0.05;\nimage_xscale = 0;\nmask_index = spr_nothing;\nfirecon = 0;\neffecttimer = 0;\nsiner = 0;\norbsize = 0;\ninstance_create(x, y, obj_sneo_biglaser_friendlyhitbox);\ninstance_create(x, y, obj_sneo_arm_laser_telegraph);\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 10;\ngrazed = 1;\n_type = 0;\n",
      "Destroy_0": "with (obj_sneo_arm_laser_telegraph)\n{\n    instance_destroy();\n}\n",
      "Draw_0": "if (firecon == 0)\n{\n    image_yscale = 0.001;\n    image_xscale = 2;\n    if (effecttimer <= 42 && (effecttimer % 6) == 0)\n    {\n        if (_type == 1)\n        {\n            for (i = 0; i < 3; i++)\n            {\n                d = instance_create(x, y, obj_rouxls_power_up_orb);\n                d.direction = irandom(120) + (i * 120);\n                d.lifetime = 16;\n                d.depth = depth + 1;\n                d.image_blend = image_blend;\n                d.parenttarget = id;\n                d._type = _type;\n            }\n        }\n        else\n        {\n            for (i = 0; i < 6; i++)\n            {\n                d = instance_create(x, y, obj_rouxls_power_up_orb);\n                d.direction = irandom(60) + (i * 60);\n                d.lifetime = 16;\n                d.depth = depth + 1;\n                d.image_blend = image_blend;\n                d.parenttarget = id;\n                d._type = _type;\n            }\n        }\n    }\n    if (effecttimer > 50)\n    {\n        orbsize -= 4;\n    }\n    else\n    {\n        orbsize++;\n    }\n    draw_set_color(c_white);\n    draw_circle(x, y, max(2, (orbsize / 2) + (sin(siner / 2) * 2)), 0);\n    effecttimer++;\n    siner++;\n}\nelse if (firecon == 1)\n{\n    active = true;\n    mask_index = spr_sneo_laser;\n    if (image_yscale < 0.5)\n    {\n        image_yscale = scr_movetowards(image_yscale, 0.5, 0.1);\n    }\n    else\n    {\n        image_yscale -= 0.05;\n    }\n    draw_set_color(c_white);\n    draw_circle(x, y, image_yscale * 100, 0);\n    draw_self();\n}\nelse if (firecon == 2)\n{\n    draw_set_color(c_white);\n    active = 0;\n    mask_index = spr_nothing;\n    if (image_yscale <= 0.01)\n    {\n        image_yscale -= 0.0025;\n    }\n    else\n    {\n        image_yscale = scr_movetowards(image_yscale, 0.01, 0.1);\n    }\n    if (image_yscale <= 0)\n    {\n        instance_destroy();\n    }\n    draw_circle(x, y, image_yscale * 100, 0);\n    draw_self();\n}\n",
      "Step_0": "if (obj_spamton_neo_enemy.difficulty == 2)\n{\n    with (obj_sneo_lilguy)\n    {\n        if (collision_line(obj_sneo_biglaser.x, obj_sneo_biglaser.y, obj_sneo_biglaser.x + lengthdir_x(10, obj_sneo_biglaser.direction), obj_sneo_biglaser.y + lengthdir_y(10, obj_sneo_biglaser.direction), obj_sneo_lilguy, true, false))\n        {\n        }\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 684,
      "name": "obj_sneo_biglaser_friendlyhitbox",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_laser_friendly",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_sneo_lilguy": "exit;\nif (image_yscale <= 0)\n{\n    exit;\n}\nif (collision_line(x, y, x + lengthdir_x(600, image_angle), obj_sneo_biglaser.y + lengthdir_y(600, image_angle), obj_sneo_lilguy, true, false))\n{\n    d = instance_create(other.x, other.y, obj_sneo_crew_dissolve);\n    d.direction = direction;\n    d.depth = depth - 2;\n    instance_destroy(other);\n}\n",
      "Create_0": "source = obj_sneo_biglaser;\nimage_blend = c_red;\ndepth = -99999999;\nvisible = false;\n",
      "Step_2": "if (!i_ex(source))\n{\n    instance_destroy();\n}\nelse\n{\n    x = source.x;\n    y = source.y;\n    image_xscale = source.image_xscale;\n    image_yscale = max(source.image_yscale - 0.25, 0);\n    image_angle = source.image_angle;\n    direction = source.direction;\n}\n"
    }
  },
  {
    "metadata": {
      "index": 671,
      "name": "obj_sneo_arm_laser_telegraph",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "laserflash = 0;\n",
      "Draw_0": "exit;\n",
      "Step_0": "if (obj_spamton_neo_enemy.partmode != 3)\n{\n    instance_destroy();\n}\nif (instance_exists(obj_sneo_biglaser))\n{\n    depth = obj_sneo_biglaser.depth + 1;\n}\nif (instance_exists(obj_heart))\n{\n    depth = obj_heart.depth + 1;\n}\n"
    }
  },
  {
    "metadata": {
      "index": 608,
      "name": "obj_sneo_crew_dissolve",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_crew_dissolve",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_blend = c_black;\nspeed = 2;\n",
      "Step_0": "if (image_index >= 7)\n{\n    instance_destroy();\n}\nd = scr_afterimage();\nd.image_index = image_index + 8;\nd.direction = direction;\nd.speed = 4;\n"
    }
  }
];
