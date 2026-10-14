// Generated from the installed Chapter2 source by tools/build-neo-player-source.mjs.
import type {NeoSourceMetadata} from './body-source';
export const neoPlayerSources:readonly {metadata:NeoSourceMetadata;sources:Record<string,string>;sha256:Record<string,string>}[]=[
  {
    "metadata": {
      "index": 636,
      "name": "obj_heart",
      "parent": null,
      "sprite": "spr_dodgeheart",
      "mask": "spr_dodgeheartmask",
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "CleanUp_0": "if (snd_is_playing(snd_chargeshot_charge))\n{\n    snd_stop(snd_chargeshot_charge);\n}\n",
      "Collision_obj_collidebullet": "with (other)\n{\n    event_user(5);\n}\n",
      "Create_0": "global.sp = 4;\nwspeed = global.sp;\nimage_speed = 0;\nfly = 0;\ndarken = 1;\ndarkamt = 0;\ndmgnoise = 0;\nchargeshot_sound = -1;\ncanmove = 1;\ninstance_create(x + 10, y + 10, obj_grazebox);\nboundaryup = 0;\ncolor = 0;\nz_hold = 0;\nsiner = 0;\nz_charge = 0;\nf = 2;\nz_hold_f = 0;\nchargeshot_delay = 0;\nsuperchargetimer = 0;\nchargeshotcount = 0;\ndisableslow = 0;\nif (button2_h())\n{\n    disableslow = 1;\n}\nremove_slow_z_buffer = 40;\n",
      "Draw_0": "if (color == 1)\n{\n    z_charge_nolimit = z_hold - 35;\n    if (z_charge_nolimit >= 0)\n    {\n        var scale = abs(sin(z_charge_nolimit / 10));\n        draw_sprite_ext(sprite_index, 0, x - (scale * 10), y - (scale * 10), 1 + scale, 1 + scale, image_angle, image_blend, 0.3);\n        scale = abs(sin(z_charge_nolimit / 14));\n        draw_sprite_ext(sprite_index, 0, x - 2 - (scale * 10), y - 2 - (scale * 10), 1.2 + scale, 1.2 + scale, image_angle, image_blend, 0.3);\n    }\n    if (z_hold >= 15)\n    {\n        z_charge = z_hold - 15;\n        if (z_charge >= 35)\n        {\n            z_charge = 35;\n        }\n        for (i = 0; i < 4; i += 1)\n        {\n            rotx = (i * 90) + (z_charge * 5);\n            xx = sin(degtorad(rotx)) * (35 - z_charge);\n            yy = cos(degtorad(rotx)) * (35 - z_charge);\n            draw_sprite_ext(spr_yheart_charge, 0, (x + 9) - xx, (y + 10) - yy, 4 - ((z_charge * 2) / 35), 4 - ((z_charge * 2) / 35), 0, c_white, z_charge / 5);\n        }\n    }\n    if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy) && obj_spamton_neo_enemy.bigshotcount > 0)\n    {\n        superchargetimer++;\n        var scale = abs(sin(superchargetimer / 10));\n        draw_sprite_ext(sprite_index, 0, x - (scale * 10), y - (scale * 10), 1 + scale, 1 + scale, image_angle, c_orange, 0.5);\n        scale = abs(sin(z_charge_nolimit / 14));\n        draw_sprite_ext(sprite_index, 0, x - 2 - (scale * 10), y - 2 - (scale * 10), 1.2 + scale, 1.2 + scale, image_angle, c_orange, 0.5);\n    }\n}\ndraw_self();\n",
      "Step_0": "wallcheck = 0;\npress_l = 0;\npress_r = 0;\npress_d = 0;\npress_u = 0;\nbkx = 0;\nbky = 0;\nbkxy = 0;\njelly = 2;\nif (left_h())\n{\n    press_l = 1;\n}\nif (right_h())\n{\n    press_r = 1;\n}\nif (up_h())\n{\n    press_u = 1;\n}\nif (down_h())\n{\n    press_d = 1;\n}\npx = 0;\npy = 0;\nif (canmove)\n{\n    if (press_r == 1)\n    {\n        px = wspeed;\n    }\n    if (press_l == 1)\n    {\n        px = -wspeed;\n    }\n    if (press_d == 1)\n    {\n        py = wspeed;\n    }\n    if (press_u == 1)\n    {\n        py = -wspeed;\n    }\n    if (button2_h() && global.flag[22] == 0)\n    {\n        if (disableslow == 0)\n        {\n            px = ceil(px * 0.5);\n            py = ceil(py * 0.5);\n        }\n    }\n    else\n    {\n        disableslow = 0;\n    }\n}\nif (color == 0)\n{\n    remove_slow_z_buffer += 0.5;\n}\nxmeet = 0;\nymeet = 0;\nxymeet = 0;\nif (place_meeting(x + px, y + py, obj_battlesolid))\n{\n    xymeet = 1;\n}\nif (place_meeting(x + px, y, obj_battlesolid))\n{\n    if (place_meeting(x + px, y, obj_battlesolid))\n    {\n        for (g = wspeed; g > 0; g -= 1)\n        {\n            mvd = 0;\n            if (press_d == 0 && !place_meeting(x + px, y - g, obj_battlesolid))\n            {\n                y -= g;\n                py = 0;\n                break;\n                mvd = 1;\n            }\n            if (press_u == 0 && mvd == 0 && !place_meeting(x + px, y + g, obj_battlesolid))\n            {\n                y += g;\n                py = 0;\n                break;\n            }\n        }\n    }\n    xmeet = 1;\n    bkx = 0;\n    if (px > 0)\n    {\n        for (i = px; i >= 0; i -= 1)\n        {\n            if (!place_meeting(x + i, y, obj_battlesolid))\n            {\n                px = i;\n                bkx = 1;\n                break;\n            }\n        }\n    }\n    if (px < 0)\n    {\n        for (i = px; i <= 0; i += 1)\n        {\n            if (!place_meeting(x + i, y, obj_battlesolid))\n            {\n                px = i;\n                bkx = 1;\n                break;\n            }\n        }\n    }\n    if (bkx == 0)\n    {\n        px = 0;\n    }\n}\nif (place_meeting(x, y + py, obj_battlesolid))\n{\n    ymeet = 1;\n    bky = 0;\n    if (place_meeting(x, y + py, obj_battlesolid))\n    {\n        for (g = wspeed; g > 0; g -= 1)\n        {\n            mvd = 0;\n            if (press_r == 0 && !place_meeting(x - g, y + py, obj_battlesolid))\n            {\n                x -= g;\n                px = 0;\n                break;\n                mvd = 1;\n            }\n            if (mvd == 0 && press_l == 0 && !place_meeting(x + g, y + py, obj_battlesolid))\n            {\n                x += g;\n                px = 0;\n                break;\n            }\n        }\n    }\n    if (py > 0)\n    {\n        for (i = py; i >= 0; i -= 1)\n        {\n            if (!place_meeting(x, y + i, obj_battlesolid))\n            {\n                py = i;\n                bky = 1;\n                break;\n            }\n        }\n    }\n    if (py < 0)\n    {\n        for (i = py; i <= 0; i += 1)\n        {\n            if (!place_meeting(x, y + i, obj_battlesolid))\n            {\n                py = i;\n                bky = 1;\n                break;\n            }\n        }\n    }\n    if (bky == 0)\n    {\n        py = 0;\n    }\n}\nif (place_meeting(x + px, y + py, obj_battlesolid))\n{\n    xymeet = 1;\n    bkxy = 0;\n    i = px;\n    j = py;\n    while (j != 0 || i != 0)\n    {\n        if (!place_meeting(x + i, y + j, obj_battlesolid))\n        {\n            px = i;\n            py = j;\n            bkxy = 1;\n            break;\n        }\n        if (abs(j) >= 1)\n        {\n            if (j > 0)\n            {\n                j -= 1;\n            }\n            if (j < 0)\n            {\n                j += 1;\n            }\n        }\n        else\n        {\n            j = 0;\n        }\n        if (abs(i) >= 1)\n        {\n            if (i > 0)\n            {\n                i -= 1;\n            }\n            if (i < 0)\n            {\n                i += 1;\n            }\n        }\n        else\n        {\n            i = 0;\n        }\n    }\n    if (bkxy == 0)\n    {\n        px = 0;\n        py = 0;\n    }\n}\nif ((x + px) >= ((__view_get(e__VW.XView, 0) + 640) - sprite_width))\n{\n    px = (__view_get(e__VW.XView, 0) + 640) - sprite_width - x;\n}\nif ((x + px) <= 0)\n{\n    px = -x;\n}\nif ((y + py) <= 0)\n{\n    py = -y;\n}\nif ((y + py) >= (((__view_get(e__VW.YView, 0) + 320) - sprite_height) + boundaryup))\n{\n    py = ((__view_get(e__VW.YView, 0) + 320) - sprite_height - y) + boundaryup;\n}\nx += px;\ny += py;\nif (dmgnoise == 1)\n{\n    dmgnoise = 0;\n    snd_stop(snd_hurt1);\n    snd_play(snd_hurt1);\n}\nglobal.inv -= 1;\nif (global.inv > 0)\n{\n    image_speed = 0.25;\n}\nelse\n{\n    image_speed = 0;\n    image_index = 0;\n}\nglobal.heartx = (x + 2) - __view_get(e__VW.XView, 0);\nglobal.hearty = (y + 2) - __view_get(e__VW.YView, 0);\nif (color == 1)\n{\n    wspeed = 5;\n    if (chargeshot_delay > 0)\n    {\n        chargeshot_delay--;\n    }\n    if (button1_p() || (z_hold >= 10 && z_hold <= 39 && button1_r()))\n    {\n        if (instance_number(obj_yheart_shot) < 3 && chargeshot_delay == 0)\n        {\n            instance_create(x + 10, y + 10, obj_yheart_shot);\n            snd_play(snd_heartshot_dr_b);\n        }\n    }\n    if (z_hold == 20)\n    {\n        chargeshot_sound = snd_loop(snd_chargeshot_charge);\n        snd_pitch(chargeshot_sound, 0.1);\n        snd_volume(chargeshot_sound, 0, 0);\n        snd_volume(chargeshot_sound, 0.3, 20);\n    }\n    if (z_hold >= 20 && z_hold < 40)\n    {\n        snd_pitch(chargeshot_sound, 0.1 + ((z_hold - 20) / 20));\n    }\n    if (z_hold >= 40)\n    {\n        image_index = 2;\n    }\n    if (z_charge < 15)\n    {\n        chargeshotcount = 0;\n    }\n    if (z_hold >= 40 && button1_r())\n    {\n        snd_stop(chargeshot_sound);\n        snd_play(snd_chargeshot_fire);\n        bigshot = instance_create(x + 10, y + 10, obj_yheart_shot);\n        bigshot.big = 1;\n        bigshot.sprite_index = spr_yheart_bigshot;\n        bigshot.hspeed = 4 * f;\n        bigshot.friction = -0.2 * f;\n        bigshot.image_alpha = 0.5;\n        bigshot.image_xscale = 0.1;\n        bigshot.image_yscale = 2;\n        z_hold = 0;\n        chargeshot_delay = 5;\n        image_index = 0;\n        chargeshotcount++;\n        if (chargeshotcount > 1)\n        {\n            with (obj_spamton_neo_enemy)\n            {\n                event_user(4);\n            }\n        }\n        if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy))\n        {\n            obj_spamton_neo_enemy.bigshotused = 1;\n        }\n        if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy) && obj_spamton_neo_enemy.bigshotcount > 0)\n        {\n            bigshot.hspeed = 10 * f;\n            bigshot.trail = 1;\n            obj_spamton_neo_enemy.bigshotcount--;\n            if (obj_spamton_neo_enemy.bigshotcount == 0)\n            {\n                instance_create(x, y, obj_supercharge_end);\n                snd_play(snd_stardrop);\n                var a = random(45);\n                repeat (8)\n                {\n                    part = instance_create(other.x + 10, other.y + 10, obj_yheart_sneo_particle);\n                    part.direction = a + random(15);\n                    part.image_xscale = 2 + random(2);\n                    part.image_yscale = 2 + random(2);\n                    part.speed = 16;\n                    part.friction = 0.8;\n                    a += 45;\n                }\n            }\n            else\n            {\n                var a = random(45);\n                repeat (8)\n                {\n                    part = instance_create(other.x + 10, other.y + 10, obj_yheart_sneo_particle);\n                    part.direction = a + random(15);\n                    part.speed = 8;\n                    part.friction = 0.8;\n                    a += 45;\n                }\n            }\n        }\n    }\n    if (button1_h())\n    {\n        if (global.chapter == 2 && instance_exists(obj_spamton_neo_enemy) && obj_spamton_neo_enemy.bigshotcount > 0)\n        {\n            z_hold_f += 1;\n        }\n        z_hold_f += 1;\n    }\n    else\n    {\n        z_hold_f = 0;\n        snd_stop(chargeshot_sound);\n    }\n    z_hold = z_hold_f * 2;\n}\n\nenum e__VW\n{\n    XView,\n    YView,\n    WView,\n    HView,\n    Angle,\n    HBorder,\n    VBorder,\n    HSpeed,\n    VSpeed,\n    Object,\n    Visible,\n    XPort,\n    YPort,\n    WPort,\n    HPort,\n    Camera,\n    SurfaceID\n}\n"
    },
    "sha256": {
      "CleanUp_0": "7e914d57f6f3572dc61d9bb8920aae6a7d54f1ddf98e1507e38a7ac4a1095854",
      "Collision_obj_collidebullet": "80e2460fd5c7502f6067991b01e3a1a2b30fe913f41d562b5c3b01c1e80782fc",
      "Create_0": "07421aa8a436a02f4cc1f8bb135beb9a40395d1c4325b15d0a652d7fd001cf39",
      "Draw_0": "42e192009f355c8222f901c856049d8b71a5b19436dc61bcdaf904f47223db93",
      "Step_0": "1b48d2c7d053db4e326c786d9eb5c81fd3b61a0d10a7157983a318fe8c74dbb8"
    }
  },
  {
    "metadata": {
      "index": 367,
      "name": "obj_grazebox",
      "parent": null,
      "sprite": "spr_grazeappear",
      "mask": "spr_grazemask",
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_collidebullet": "if (!other.active)\n{\n    exit;\n}\nvar _grazetpfactor = grazetpfactor;\nvar _grazetimefactor = grazetimefactor;\nwith (other)\n{\n    if (global.inv < 0)\n    {\n        if (grazed == 1)\n        {\n            scr_tensionheal((grazepoints / 30) * _grazetpfactor);\n            if (global.turntimer >= 10)\n            {\n                global.turntimer -= ((timepoints / 30) * _grazetimefactor);\n            }\n            with (obj_grazebox)\n            {\n                if (grazetimer >= 0 && grazetimer < 4)\n                {\n                    grazetimer = 3;\n                }\n                if (grazetimer < 2)\n                {\n                    grazetimer = 2;\n                }\n            }\n        }\n        if (grazed == 0)\n        {\n            grazed = 1;\n            scr_tensionheal(grazepoints * _grazetpfactor);\n            if (global.turntimer >= 10)\n            {\n                global.turntimer -= (timepoints * _grazetimefactor);\n            }\n            with (obj_battlecontroller)\n            {\n                grazenoise = 1;\n            }\n            with (obj_grazebox)\n            {\n                grazetimer = 10;\n            }\n        }\n    }\n}\n",
      "Create_0": "grazetimer = 0;\ngrazetpfactor = 1;\ngrazetimefactor = 1;\ngrazesizefactor = 1;\ngrazetpfactor += (scr_armorcheck_equipped_party(15) * 0.1);\ngrazetimefactor += (scr_armorcheck_equipped_party(14) * 0.1);\ngrazesizefactor += (scr_armorcheck_equipped_party(3) * 0.2);\ngrazesizefactor += (scr_armorcheck_equipped_party(9) * 0.25);\nif (grazetimefactor > 3)\n{\n    grazetimefactor = 3;\n}\nif (grazetpfactor > 3)\n{\n    grazetpfactor = 3;\n}\nif (grazesizefactor > 3)\n{\n    grazesizefactor = 3;\n}\nimage_xscale = grazesizefactor;\nimage_yscale = grazesizefactor;\nif (instance_exists(obj_heart))\n{\n    sizexoff = 0;\n    sizeyoff = 0;\n    x = obj_heart.x + 10 + sizexoff;\n    y = obj_heart.y + 10 + sizeyoff;\n}\n",
      "Draw_0": "if (grazetimer > 0)\n{\n    draw_sprite_ext(sprite_index, 0, x, y, 1, 1, 0, c_white, grazetimer / 6);\n    draw_sprite_ext(sprite_index, 3, x, y, 1, 1, 0, c_white, (grazetimer / 6) - 0.2);\n    if (image_xscale > 1)\n    {\n        draw_sprite_ext(sprite_index, 0, x, y, image_xscale, image_yscale, 0, c_white, grazetimer / 6);\n        draw_sprite_ext(sprite_index, 3, x, y, image_xscale, image_yscale, 0, c_white, (grazetimer / 6) - 0.2);\n    }\n}\ngrazetimer -= 1;\n",
      "Step_2": "if (instance_exists(obj_heart))\n{\n    sizexoff = 0;\n    sizeyoff = 0;\n    x = obj_heart.x + 10 + sizexoff;\n    y = obj_heart.y + 10 + sizeyoff;\n}\nelse\n{\n    instance_destroy();\n}\n"
    },
    "sha256": {
      "Collision_obj_collidebullet": "50b7b3fa14bde1294a152dfe0fea65d33ebb09576803ecfcdb864f5327d40b4b",
      "Create_0": "9334fea02ed54bb8398e52fbfdc1cf576bc1fcf47fe59c4239ca40a14c5671f6",
      "Draw_0": "6bd5d0b7f4092d0f8b22f149f0c33c5454f5bccef3de527b31dffce5e1bb52ad",
      "Step_2": "495ddadf0cf56ceaa408b9a989e1f7f9a30b2d1ca70353b279106cecc0f10d7c"
    }
  },
  {
    "metadata": {
      "index": 610,
      "name": "obj_yheart_sneo_particle",
      "parent": null,
      "sprite": "spr_yheart_charge",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_xscale = 1 + random(2);\nimage_yscale = 1 + random(2);\ntimer = 0;\n",
      "Step_0": "timer++;\nimage_xscale = lerp(image_xscale, 0, timer / 20);\nimage_yscale = lerp(image_yscale, 0, timer / 20);\nif (timer == 20)\n{\n    instance_destroy();\n}\n"
    },
    "sha256": {
      "Create_0": "f85e3931b6ab63ccec68ee57cf79ee54de87b5034b5e2b9a85d2a586aaa96340",
      "Step_0": "69662d813c81af3d5f54c6b13f337aa0ccbdab7c8ba9f32dd3f78c175c58f9b4"
    }
  },
  {
    "metadata": {
      "index": 611,
      "name": "obj_supercharge_end",
      "parent": null,
      "sprite": "spr_supercharge_end",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_speed = 0.5;\ntimer = 0;\nimage_xscale = 1.5;\nimage_yscale = 1.5;\n",
      "Draw_0": "timer++;\nif (timer == 16)\n{\n    instance_destroy();\n}\nif (timer >= 96)\n{\n    instance_destroy();\n}\n",
      "Other_7": "exit;\n"
    },
    "sha256": {
      "Create_0": "d98eea2003ff623f48788f657d08f84db0187d0eeda3111700916e0b91f5a46d",
      "Draw_0": "81c1793d30bc991827e0361053277f99341f38c32c0d43e542879a6e90de3e15",
      "Other_7": "729164ba3b62266d609e614e2e990d3529d0497cf9780904ba46244c441336bf"
    }
  }
];
