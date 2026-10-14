// Literal Chapter 2 NORMAL attack source events; source metadata and masks are retained.
import type {NeoAttackSourceRecord} from './controller';
export const attackSources:readonly NeoAttackSourceRecord[]=[
  {
    "metadata": {
      "index": 629,
      "name": "obj_sneo_phonecall",
      "parent": "obj_bulletparent",
      "sprite": "spr_sneo_phone",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "exit;\n",
      "Create_0": "timer = 0;\nseen = 0;\nwriteline = false;\nstate = 0;\ntalktimer = -15;\ntalking = false;\ntalkmax = 45;\nsongtime = 0;\nsecondtime = 0;\nskipintro = 0;\nresumeinterval = 1.715;\nsneo = obj_spamton_neo_enemy;\nisattack = 0;\ntarget = 0;\npeeking = 0;\nsiner = 0;\ninit = 0;\nvisible = false;\nydrop = 0;\nringtimer = 0;\ndamage = -1;\ntarget = -1;\nfadealpha = 1;\ntextboxdistance = 20;\ntextboxoffsetx = 0;\ntextboxoffsety = 0;\n",
      "Destroy_0": "sneo.partmode = 1;\nwith (obj_spamton_neo_enemy)\n{\n    scr_move_to_rememberxy(8);\n}\n",
      "Draw_0": "draw_set_alpha(fadealpha);\ndraw_set_color(c_white);\nif (state == 0 || (state == 1 && sneo.partframe[1] == 0))\n{\n    siner++;\n    draw_self();\n    draw_line_width(x, y, obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[5], -20, 2);\n    image_angle = sin(siner / 20) * 10;\n    if (ringtimer > 0)\n    {\n        image_angle += (((ringtimer % 2) == 0) ? 1 : -1);\n        ringtimer--;\n        if (ringtimer <= 6)\n        {\n            sneo.partmode = 5;\n        }\n    }\n    x = xstart + (sin((siner + 0) / 20) * 10);\n    if (ydrop < 1)\n    {\n        ydrop += 0.02;\n    }\n    y = lerp(-30, ystart, scr_ease_out(ydrop, -2));\n}\nelse\n{\n    xx = scr_orbitx(0, 0, 20, 50, sneo.partrot[1]) + sneo.x + sneo.partx[1] + sneo.partxoff[1];\n    yy = scr_orbity(0, 0, 20, 50, sneo.partrot[1]) + sneo.y + sneo.party[1] + sneo.partyoff[1];\n    draw_line_width(xx, yy, obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[5], -20, 2);\n}\ndraw_set_alpha(1);\n",
      "Step_0": "if (init == 0)\n{\n    y = -30;\n    visible = true;\n    init = 1;\n}\nif (state < 7)\n{\n    global.turntimer = 430;\n    if (obj_spamton_neo_enemy.difficulty == 3)\n    {\n        global.turntimer = 100;\n    }\n}\nif (talking)\n{\n    talktimer++;\n    var aa = 0;\n    if (obj_spamton_neo_enemy.difficulty == 3 && state >= 5)\n    {\n        aa = 1;\n    }\n    if (button1_p() && talktimer > 5 && aa == 0)\n    {\n        talktimer = talkmax;\n    }\n    if (button3_h() && talktimer > 1 && aa == 0)\n    {\n        talktimer = talkmax;\n    }\n    if (talktimer >= talkmax)\n    {\n        sneo.talktimer = sneo.talkmax;\n        with (obj_writer)\n        {\n            instance_destroy();\n        }\n        talking = false;\n        talktimer = -10;\n        state++;\n    }\n    exit;\n}\nif (state == 6)\n{\n    if (scr_isphase(\"bullets\") || isattack)\n    {\n        if (!secondtime)\n        {\n            songtime = (songtime + resumeinterval) - (songtime % resumeinterval);\n            if (songtime > 140)\n            {\n                songtime = 0;\n            }\n        }\n        if (isattack)\n        {\n            if (obj_spamton_neo_enemy.difficulty == 3)\n            {\n                instance_create(obj_spamton_neo_enemy.x + obj_spamton_neo_enemy.partx[5], obj_spamton_neo_enemy.y + obj_spamton_neo_enemy.party[5] + 60, obj_sneo_phonecall_pipis_stream);\n            }\n            else\n            {\n                with (obj_sneo_bulletcontroller)\n                {\n                    instance_destroy();\n                }\n                var xx = scr_orbitx(0, 0, -26, secondtime ? 30 : 70, sneo.partrot[1]) + sneo.x + sneo.partx[1] + sneo.partxoff[1];\n                var yy = scr_orbity(0, 0, -26, secondtime ? 30 : 70, sneo.partrot[1]) + sneo.y + sneo.party[1] + sneo.partyoff[1];\n                global.monsterattackname[obj_spamton_neo_enemy.myself] = \"FootballPipis\";\n                d = instance_create(xx, yy, obj_sneo_bulletcontroller);\n                d.type = 1;\n                d.damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n                d.target = target;\n            }\n        }\n        state = 7;\n    }\n    exit;\n}\nif (talktimer < 0)\n{\n    talktimer++;\n}\nelse if (state == 0)\n{\n    if (!secondtime)\n    {\n    }\n    ringtimer = 12;\n    sndphone = snd_play(snd_phone);\n    snd_volume(sndphone, 0.7, 0);\n    talktimer = -10;\n    state++;\n}\nelse if (state == 1)\n{\n    talktimer = -10;\n    state++;\n    sneo.partmode = 6;\n    if (skipintro == 1)\n    {\n        state = 5;\n    }\n}\nelse if (state == 2)\n{\n    if (obj_spamton_neo_enemy.difficulty == 3)\n    {\n        msgsetloc(0, \"WHAT!?\", \"obj_sneo_phonecall_slash_Step_0_gml_89_0\");\n    }\n    else\n    {\n        msgsetloc(0, \"WHAT!?\", \"obj_sneo_phonecall_slash_Step_0_gml_96_0\");\n        sneo.partmode = 7;\n    }\n    writeline = true;\n}\nelse if (state == 3)\n{\n    if (obj_spamton_neo_enemy.difficulty == 3)\n    {\n        state = 5;\n    }\n    else\n    {\n        msgsetloc(0, \"WHAT? ARE&YOU SERIOUS!?\", \"obj_sneo_phonecall_slash_Step_0_gml_136_0\");\n        sneo.partmode = 7;\n        writeline = true;\n    }\n}\nelse if (state == 4)\n{\n    state = 5;\n}\nelse if (state == 5)\n{\n    if (scr_isphase(\"bullets\") && skipintro == 0)\n    {\n        textboxoffsetx = 10;\n        textboxoffsety = 20;\n        if (obj_spamton_neo_enemy.difficulty == 3)\n        {\n            msgsetloc(0, \"IT'S FOR&ME!?\", \"obj_sneo_phonecall_slash_Step_0_gml_176_0\");\n        }\n        else\n        {\n            msgsetloc(0, \"... IT'S&FOR YOU.\", \"obj_sneo_phonecall_slash_Step_0_gml_138_0\");\n            sneo.partframe[1] = 3;\n        }\n        textboxdistance = 40;\n        writeline = true;\n    }\n    else\n    {\n        state = 6;\n    }\n    with (sneo)\n    {\n        if (obj_spamton_neo_enemy.difficulty != 3)\n        {\n            partmode = 9;\n            partrot[1] = -180;\n            partframe[1] = 3;\n        }\n        else\n        {\n            partmode = 9;\n            partframe[1] = 4;\n        }\n    }\n}\nif (writeline)\n{\n    writeline = false;\n    with (obj_spamton_neo_enemy)\n    {\n        global.typer = 72;\n        scr_enemyblcon(((x - obj_sneo_phonecall.textboxdistance) + 22) - obj_sneo_phonecall.textboxoffsetx, y + 60 + obj_sneo_phonecall.textboxoffsety, 10);\n    }\n    talktimer = 0;\n    talking = true;\n}\n"
    }
  },
  {
    "metadata": {
      "index": 667,
      "name": "obj_sneo_phonecall_pipis_stream",
      "parent": "obj_collidebullet",
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "timer = 0;\n",
      "Step_0": "part = instance_create((x - 4) + random(8), (y - 4) + random(8), obj_sneo_phonecall_sneohead);\npart.direction = -5 + random(38);\npart.speed = 7 + random(13);\npart.image_angle = direction - 180;\n"
    }
  },
  {
    "metadata": {
      "index": 665,
      "name": "obj_sneo_phonecall_sneohead",
      "parent": null,
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_xscale = 0.5;\nimage_yscale = -0.5;\ntimer = 0;\ncon = 0;\nhomingfactor = 0;\nmaxhomingfactor = 2;\n",
      "Step_0": "if (global.turntimer < 3)\n{\n    instance_destroy();\n}\nimage_angle = direction - 180;\ntimer++;\nif (timer >= (4 + irandom(1)))\n{\n    instance_destroy();\n    fx = instance_create(x, y, obj_pipis_destroy_fx);\n    fx.image_xscale = 2;\n    fx.image_yscale = 2;\n    fx.image_speed = 1;\n    snd_play(snd_rocket_sneo);\n    snd_volume(snd_rocket_sneo, 0.1, 0);\n    obj_spamton_neo_enemy.partx[5] = random(8);\n    obj_spamton_neo_enemy.party[5] = random(8);\n}\n"
    }
  },
  {
    "metadata": {
      "index": 660,
      "name": "obj_pipis_controller",
      "parent": null,
      "sprite": "spr_sneo_arml",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "con = 0;\ntimer = 0;\ncon2 = 0;\ntimer2 = 0;\ntimer3 = 0;\nvariant = 2;\neggcount = 20;\nsavex = 0;\nfirstshot = 1;\nsiner = irandom(100);\ntimervariance = 30;\npipiscount = 0;\nspeedvar = 2;\nmovecon = 0;\nmovetimer = 0;\nimage_angle = -170;\nimage_xscale = 2;\nangle_final = -170;\ndamage = 0;\ntarget = 0;\nsprite_index = spr_sneo_arml_egg;\nmaxpipis = 10;\n",
      "Draw_0": "siner += 0.25;\nvar xx = (camerax() + camerawidth()) - 10;\nvar yy = ((cameray() + cameraheight()) - 230) + (sin(siner / 6) * 21);\nvar shake = 0;\nif (sprite_index == spr_sneo_arml_egg)\n{\n    shake = -4 + random(8);\n}\nif (movecon == 0)\n{\n    movetimer++;\n    xx = lerp(camerax() + camerawidth() + 70, (camerax() + camerawidth()) - 10, movetimer / 10);\n    if (movetimer == 10)\n    {\n        movetimer = 0;\n        movecon = 1;\n    }\n}\nif (global.turntimer < 16)\n{\n    movecon = 2;\n}\nif (movecon == 2)\n{\n    movetimer++;\n    xx = lerp((camerax() + camerawidth()) - 10, camerax() + camerawidth() + 70, movetimer / 10);\n    if (movetimer == 10)\n    {\n        instance_destroy();\n    }\n}\nif (variant == 3 && movecon == 1)\n{\n    if (con == 0)\n    {\n        timer++;\n        if (timer >= 1)\n        {\n            if (!instance_exists(obj_pipis_wall))\n            {\n                wall = instance_create(obj_growtangle.x + 200, obj_growtangle.y + (obj_growtangle.sprite_height / 2) + 60, obj_pipis_wall);\n                wall.image_xscale = 2.5;\n            }\n            con = 1;\n            timer = 0;\n        }\n    }\n    if (con == 1)\n    {\n        repeat (3)\n        {\n            if (irandom(10) < 6)\n            {\n                bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_sneo_pipis_bomb);\n                bul.gravity = 0.2 + (random(3) / 100);\n                bul.vspeed = -6 - random(2);\n                bul.hspeed = -1.8 - random(1.5);\n                bul.target = target;\n                bul.damage = damage;\n                bul.depth = depth - 1;\n                bul.directhit = 1;\n            }\n            else\n            {\n                bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);\n                bul.type = 3;\n                bul.gravity = 0.2 + (random(3) / 100);\n                bul.vspeed = -6 - random(2);\n                bul.hspeed = -1.6 - random(3);\n                bul.target = target;\n                bul.damage = damage;\n                bul.depth = depth - 1;\n                bul.directhit = 1;\n            }\n        }\n        sprite_index = spr_sneo_arml;\n        angle_final = -180 + random(50);\n        repeat (3)\n        {\n            bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_sneo_armcannon_smoke);\n            bul.depth = depth - 2;\n        }\n        con = 2;\n    }\n    if (con == 2)\n    {\n        timer++;\n        if (timer < 11)\n        {\n            image_angle = lerp(image_angle, angle_final, timer / 10);\n        }\n        if (timer < (timervariance - 15) && eggcount > 0.4)\n        {\n            image_xscale = lerp(1.8, 2.5, timer / (timervariance - 15));\n        }\n        if (timer == (timervariance - 15) && eggcount > 0.4)\n        {\n            sprite_index = spr_sneo_arml_egg;\n            image_xscale = 2;\n        }\n        if (timer >= timervariance)\n        {\n            eggcount -= 0.4;\n            timervariance = 60 + irandom(15);\n            con = 1;\n            timer = 0;\n        }\n    }\n}\nif (variant == 2 && movecon == 1)\n{\n    if (con == 0)\n    {\n        timer++;\n        if (timer >= 1)\n        {\n            if (!instance_exists(obj_pipis_wall))\n            {\n                wall = instance_create(obj_growtangle.x + 200, obj_growtangle.y + (obj_growtangle.sprite_height / 2), obj_pipis_wall);\n                wall.image_xscale = 2.9;\n            }\n            con = 1;\n            timer = 0;\n        }\n    }\n    if (con == 1)\n    {\n        var aa = 1;\n        pipiscount++;\n        if (pipiscount == 3 || pipiscount == 5 || pipiscount == 9)\n        {\n            aa = 0;\n        }\n        if (pipiscount == 0 || pipiscount == 4 || pipiscount == 8 || pipiscount == 11)\n        {\n            aa = 1;\n        }\n        if (obj_spamton_neo_enemy.difficulty == 0)\n        {\n            var rand = 0.8;\n            if (global.turntimer > 380)\n            {\n                rand = 0.5;\n            }\n            var rr = 0;\n            if (instance_number(obj_pipis_egg_bullet) < 2 && global.turntimer < 250)\n            {\n                rr = 1;\n            }\n            if (instance_number(obj_pipis_egg_bullet) < 3 && pipiscount < maxpipis)\n            {\n                if (aa == 1)\n                {\n                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);\n                    bul.type = 2;\n                    bul.gravity = 0.5 + (random(10) / 100);\n                    bul.vspeed = -14;\n                    bul.hspeed = -1.55 - rr - random(rand);\n                    bul.target = target;\n                    bul.damage = damage;\n                    bul.depth = depth - 1;\n                }\n                else\n                {\n                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);\n                    bul.type = 2;\n                    bul.gravity = 0.063 + (random(4) / 100);\n                    bul.vspeed = -4.25;\n                    bul.hspeed = -4;\n                    bul.target = target;\n                    bul.damage = damage;\n                    bul.depth = depth - 1;\n                    bul.directhit = 1;\n                }\n            }\n        }\n        else\n        {\n            var rr = 0;\n            if (instance_number(obj_pipis_egg_bullet) < 2 && global.turntimer < 250)\n            {\n                rr = 1;\n            }\n            if (instance_number(obj_pipis_egg_bullet) < 3)\n            {\n                var a = -1.6 - random(0.6);\n                if (aa == 1)\n                {\n                    repeat (2)\n                    {\n                        bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);\n                        bul.type = 2;\n                        bul.gravity = 0.5 + (random(10) / 100);\n                        bul.vspeed = -14;\n                        bul.hspeed = -1.55 - rr - random(0.8);\n                        bul.target = target;\n                        bul.damage = damage;\n                        bul.depth = depth - 1;\n                        a = -2.2 - random(0.6);\n                    }\n                }\n                else\n                {\n                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);\n                    bul.type = 2;\n                    bul.gravity = 0.063 + (random(4) / 100);\n                    bul.vspeed = -4.25;\n                    bul.hspeed = -4;\n                    bul.target = target;\n                    bul.damage = damage;\n                    bul.depth = depth - 1;\n                    bul.directhit = 1;\n                    bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_pipis_egg_bullet);\n                    bul.type = 2;\n                    bul.gravity = 0.5 + (random(10) / 100);\n                    bul.vspeed = -14;\n                    bul.hspeed = -1.4 - random(0.4);\n                    bul.target = target;\n                    bul.damage = damage;\n                    bul.depth = depth - 1;\n                    a = -2.2 - random(0.6);\n                }\n            }\n        }\n        sprite_index = spr_sneo_arml;\n        angle_final = -180 + random(50);\n        repeat (3)\n        {\n            bul = instance_create(xx + 5 + lengthdir_x(50, image_angle + 270), yy + lengthdir_y(50, image_angle + 270), obj_sneo_armcannon_smoke);\n            bul.depth = depth - 2;\n        }\n        con = 2;\n    }\n    var r = 1;\n    if (instance_number(obj_pipis_egg_bullet) < 1)\n    {\n        r = 3;\n    }\n    repeat (r)\n    {\n        if (con == 2)\n        {\n            timer++;\n            if (timer < 11)\n            {\n                image_angle = lerp(image_angle, angle_final, timer / 10);\n            }\n            if (timer < (timervariance - 15) && eggcount > 0.4)\n            {\n                image_xscale = lerp(1.8, 2.5, timer / (timervariance - 15));\n            }\n            if (timer == (timervariance - 15) && eggcount > 0.4 && pipiscount < maxpipis)\n            {\n                sprite_index = spr_sneo_arml_egg;\n                image_xscale = 2;\n            }\n            if (timer >= timervariance)\n            {\n                eggcount -= 0.4;\n                timervariance = 30 + irandom(15);\n                if (eggcount > 0)\n                {\n                    con = 0;\n                    timer = 0;\n                }\n                else\n                {\n                    instance_destroy();\n                }\n            }\n        }\n    }\n}\ndraw_sprite_ext(spr_sneo_wingl, 0, xx, yy + 20, 2, 2, 20, c_white, 1);\ndraw_sprite_ext(sprite_index, 1, xx, yy + 11 + (shake / 2), image_xscale, 2, image_angle + shake, c_white, 1);\ndraw_sprite_ext(spr_sneo_body, 0, xx, yy + 20, 2, 2, 0, c_white, 1);\ndraw_sprite_ext(spr_sneo_head, 1, xx + 26, yy, 2, 2, 0, c_white, 1);\nif (pipiscount >= maxpipis && global.turntimer > 10 && !instance_exists(obj_pipis_egg_bullet))\n{\n    global.turntimer = 10;\n}\nif (global.turntimer < 1)\n{\n    instance_destroy();\n}\nif (variant == 0)\n{\n    if (con == 0)\n    {\n        timer++;\n        if (timer == 1)\n        {\n            savex = ((obj_growtangle.x + 220) - 80) + random(160);\n            instance_create(savex, (obj_growtangle.y - random(30)) + (obj_growtangle.sprite_height / 2), obj_pipis_wall);\n        }\n        if (timer >= 10)\n        {\n            con = 1;\n            timer = 0;\n        }\n    }\n    if (con == 1)\n    {\n        bul = instance_create(savex, cameray() - 20, obj_pipis_egg_bullet);\n        bul.gravity = 0.2 + (random(10) / 100);\n        bul.target = target;\n        bul.damage = damage;\n        con = 2;\n    }\n    if (con == 2)\n    {\n        timer++;\n        if (timer >= 50)\n        {\n            eggcount--;\n            if (eggcount > 0)\n            {\n                con = 0;\n                timer = 0;\n                with (obj_pipis_wall)\n                {\n                    con = 1;\n                }\n            }\n            else\n            {\n                instance_destroy();\n            }\n        }\n    }\n}\nif (variant == 1)\n{\n    if (con == 0)\n    {\n        timer++;\n        if (timer == 1)\n        {\n            wall = instance_create(((obj_growtangle.x + 190) - 50) + random(100), obj_growtangle.y + (obj_growtangle.sprite_height / 2), obj_pipis_wall);\n            wall.type = 1;\n        }\n        if (timer >= 10)\n        {\n            con = 1;\n            timer = 0;\n        }\n    }\n    if (con == 1)\n    {\n        bul = instance_create(wall.x, cameray() - 20, obj_pipis_egg_bullet);\n        bul.gravity = 0.2 + (random(10) / 100);\n        bul.type = 1;\n        bul.parent = wall.id;\n        bul.target = target;\n        bul.damage = damage;\n        con = 2;\n    }\n    if (con == 2)\n    {\n        timer++;\n        if (timer >= 50)\n        {\n            eggcount--;\n            if (eggcount > 0)\n            {\n                con = 0;\n                timer = -40;\n                with (wall)\n                {\n                    con = 1;\n                }\n            }\n            else\n            {\n                instance_destroy();\n            }\n        }\n    }\n    if (con2 == 0)\n    {\n        timer2++;\n        if (timer2 == 40)\n        {\n            wall2 = instance_create(((obj_growtangle.x + 280) - 50) + random(100), obj_growtangle.y - (obj_growtangle.sprite_height / 2), obj_pipis_wall);\n            wall2.type = 1;\n        }\n        if (timer2 >= 50)\n        {\n            con2 = 1;\n            timer2 = 0;\n        }\n    }\n    if (con2 == 1)\n    {\n        bul = instance_create(wall2.x, cameray() + cameraheight() + 20, obj_pipis_egg_bullet);\n        bul.gravity = 0.2 + (random(10) / 100);\n        bul.gravity_direction = 90;\n        bul.type = 1;\n        bul.parent = wall2.id;\n        bul.target = target;\n        bul.damage = damage;\n        con2 = 2;\n    }\n    if (con2 == 2)\n    {\n        timer2++;\n        if (timer2 >= 50)\n        {\n            eggcount--;\n            if (eggcount > 0)\n            {\n                con2 = 0;\n                timer2 = 0;\n                with (wall2)\n                {\n                    con = 1;\n                }\n            }\n            else\n            {\n                instance_destroy();\n            }\n        }\n    }\n    timer3++;\n    if (timer3 == 150)\n    {\n        bul = instance_create(camerax() + camerawidth(), obj_growtangle.y, obj_pipis_egg_bullet);\n        bul.gravity = 0.6 + (random(10) / 100);\n        bul.gravity_direction = 180;\n        bul.target = target;\n        bul.damage = damage;\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 631,
      "name": "obj_pipis_egg_bullet",
      "parent": "obj_collidebullet",
      "sprite": "spr_pipis_egg",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Alarm_0": "exit;\n",
      "Collision_obj_mettaton_bomb_hitbox": "shake = 8;\nhp -= 3;\nif (image_index < 3)\n{\n    image_index += 1;\n}\nsnd_play(snd_damage);\nfx = instance_create(x, y, obj_pipis_destroy_fx);\nfx.image_xscale = 1.5;\nfx.image_yscale = 1.5;\nrepeat (3)\n{\n    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);\n    fx.image_xscale = 2;\n    fx.image_yscale = 2;\n}\ninstance_destroy();\nif (obj_spamton_neo_enemy.difficulty == 1)\n{\n    scr_tensionheal(3);\n}\nelse\n{\n    scr_tensionheal(1.5);\n}\n",
      "Collision_obj_pipis_wall": "if (type != 2 && type != 3)\n{\n    event_user(0);\n}\n",
      "Collision_obj_yheart_shot": "shake = 8;\nhp -= other.damage;\nif (image_index < 3)\n{\n    image_index += 1;\n}\nsnd_play(snd_damage);\nif (other.big == 0)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\nif (hp < 1)\n{\n    fx = instance_create(x, y, obj_pipis_destroy_fx);\n    fx.image_xscale = 1.5;\n    fx.image_yscale = 1.5;\n    repeat (3)\n    {\n        fx = instance_create(x, y, obj_pipis_egg_bullet_piece);\n        fx.image_xscale = 2;\n        fx.image_yscale = 2;\n    }\n    instance_destroy();\n    if (obj_spamton_neo_enemy.difficulty == 1)\n    {\n        scr_tensionheal(2);\n    }\n    else\n    {\n        scr_tensionheal(3);\n    }\n}\nelse\n{\n    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);\n    fx.image_index = image_index;\n    if (x < (camerax() + 500))\n    {\n        hspeed /= 1.05;\n    }\n}\n",
      "Create_0": "scr_bullet_init();\nhp = 3;\ncon = 0;\ntimer = 0;\ntype = 0;\nshake = 0;\nparent = -1;\nimage_speed = 0;\nimage_xscale = 2;\nimage_yscale = 2;\nimage_angle = random(360);\ntarget = 0;\ndamage = 1;\ndirecthit = 0;\nelement = 6;\nbluesiner = 0;\nimage_blend2 = merge_color(#00A2E8, c_aqua, 0.25 + (sin(bluesiner / 3) * 0.25));\nhitstun = 0;\nhitstunenabled = 0;\nbouncespeed = -5 - random(3);\ndrawlabel = 0;\ngrazepoints = 2;\n",
      "Draw_0": "if (drawlabel == 1)\n{\n    var lang = 0;\n    if (global.lang == \"ja\")\n    {\n        lang = 1;\n    }\n    draw_sprite_ext(spr_pipissign, lang, (x - 4) + random_range(0, 1), y + (sprite_height / 2) + 12 + random_range(0, 1), 1, 1, 0, c_white, 1);\n}\nif (type == 3)\n{\n    if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10) && y > ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 10))\n    {\n        event_user(0);\n        snd_play(snd_bomb);\n    }\n    if (y > ((obj_growtangle.y - 20) + obj_growtangle.sprite_height))\n    {\n        event_user(0);\n        snd_play(snd_bomb);\n    }\n    image_angle += 10;\n}\nelse if (type == 2)\n{\n    image_angle += 45;\n    if (con == 0)\n    {\n        if (y > ((obj_growtangle.y - 20) + (obj_growtangle.sprite_height / 2)) && vspeed > 0)\n        {\n            con = 1;\n        }\n    }\n    if (con == 1)\n    {\n        snd_play(snd_bump);\n        image_angle = -30 - random(30);\n        gravity = 0.24;\n        vspeed = bouncespeed;\n        con = 2;\n        alarm[0] = 10;\n    }\n    if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10) && y > ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 10))\n    {\n        event_user(0);\n        snd_play(snd_bomb);\n    }\n    if (y > ((obj_growtangle.y - 20) + (obj_growtangle.sprite_height / 2)) && vspeed > 0 && con == 2 && alarm[0] < 1)\n    {\n        con = 1;\n    }\n}\nelse\n{\n    if (type == 1)\n    {\n        x = parent.x;\n    }\n    image_angle += 4;\n    if (gravity_direction == 180)\n    {\n        if (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10))\n        {\n            event_user(0);\n            snd_play(snd_bomb);\n        }\n    }\n}\nvar x_shake = 0;\nvar y_shake = 0;\nif (shake > 0)\n{\n    shake--;\n    x_shake = 4 - random(8);\n    y_shake = 4 - random(8);\n}\ndraw_sprite_ext(sprite_index, image_index, x + x_shake, y + y_shake, image_xscale, image_yscale, image_angle, c_white, image_alpha);\nif (type == 2)\n{\n    if ((con == 2 && y < ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 0) && x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 80)) || (directhit == 1 && y < ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 0)))\n    {\n        gravity += 0.01;\n    }\n}\n",
      "Other_10": "fx = instance_create(x, y, obj_pipis_destroy_fx);\nfx.image_xscale = 1.5;\nfx.image_yscale = 1.5;\nif (obj_spamton_neo_enemy.difficulty != 4)\n{\n    if (type == 2)\n    {\n        for (i = 0; i < 10; i++)\n        {\n            hed = instance_create(x, y, obj_pipis_bullet_cone);\n            hed.direction = (point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10) - 25) + random(50);\n            hed.speed = 15 + random(5);\n            hed.depth = depth - 100;\n            hed.sprite_index = spr_sneo_crew;\n            hed.image_xscale = 0.5;\n            hed.image_yscale = 0.5;\n            hed.target = target;\n            hed.damage = damage;\n            hed.grazed = 0;\n            hed.element = 6;\n        }\n    }\n    else if (type == 3)\n    {\n        for (i = 0; i < 10; i++)\n        {\n            hed = instance_create(x, y, obj_pipis_bullet_cone);\n            hed.direction = (point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10) - 20) + random(40);\n            hed.speed = 15 + random(5);\n            hed.depth = depth - 100;\n            hed.target = target;\n            hed.damage = damage;\n            hed.grazed = 0;\n            hed.element = 6;\n        }\n    }\n    else\n    {\n        center = instance_create(x, y, obj_pipis_center);\n        center.target = target;\n        center.damage = damage;\n    }\n}\nif (obj_spamton_neo_enemy.difficulty == 4)\n{\n    for (i = 0; i < 15; i++)\n    {\n        radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);\n        with (radialshot)\n        {\n            scr_bullet_init();\n        }\n        radialshot.sprite_index = spr_diamondbullet;\n        radialshot.dir = ((i * 24) + random(14)) - 7;\n        radialshot.active = 1;\n        radialshot.depth = depth - 100;\n        radialshot.target = target;\n        radialshot.damage = damage;\n        radialshot.grazed = 0;\n        radialshot.element = 6;\n    }\n    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);\n    with (radialshot)\n    {\n        scr_bullet_init();\n    }\n    radialshot.sprite_index = spr_diamondbullet;\n    radialshot.dir = point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10);\n    radialshot.active = 1;\n    radialshot.depth = depth - 100;\n    radialshot.target = target;\n    radialshot.damage = damage;\n    radialshot.grazed = 0;\n    radialshot.element = 6;\n    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);\n    with (radialshot)\n    {\n        scr_bullet_init();\n    }\n    radialshot.sprite_index = spr_diamondbullet;\n    radialshot.dir = point_direction(x, y, obj_heart.x + 10, (obj_heart.y + 10) - 40);\n    radialshot.active = 1;\n    radialshot.depth = depth - 100;\n    radialshot.target = target;\n    radialshot.damage = damage;\n    radialshot.grazed = 0;\n    radialshot.element = 6;\n    radialshot = instance_create(x, y, obj_sneo_heatattack_bullet);\n    with (radialshot)\n    {\n        scr_bullet_init();\n    }\n    radialshot.sprite_index = spr_diamondbullet;\n    radialshot.dir = point_direction(x, y, obj_heart.x + 10, obj_heart.y + 10 + 40);\n    radialshot.active = 1;\n    radialshot.depth = depth - 100;\n    radialshot.target = target;\n    radialshot.damage = damage;\n    radialshot.grazed = 0;\n    radialshot.element = 6;\n}\nrepeat (3)\n{\n    fx = instance_create(x, y, obj_pipis_egg_bullet_piece);\n    fx.image_index = random(3);\n    fx.image_xscale = 2;\n    fx.image_yscale = 2;\n    fx.direction = 45 + random(90);\n}\ninstance_destroy();\n"
    }
  },
  {
    "metadata": {
      "index": 632,
      "name": "obj_pipis_bullet",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "if (obj_spamton_neo_enemy.difficulty == 2)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\nelse if (other.big == 0)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\nevent_user(1);\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\ntimer = 0;\ncon = 0;\ntype = 0;\ntarget = 0;\ndamage = 1;\nhp = 0.5;\nimage_xscale = 0.5;\nimage_yscale = 0.5;\nlength = 0;\nplace = 0;\nparent = -1;\n",
      "Destroy_0": "exit;\n",
      "Other_11": "snd_play_pitch(snd_bomb, 1.1 + random(0.2));\nscr_afterimage_cut();\ninstance_destroy();\n",
      "Step_0": "if (!i_ex(parent))\n{\n    instance_destroy();\n    exit;\n}\nif (length < 36)\n{\n    length += 2;\n}\nx = parent.x + lengthdir_x(length, place);\ny = parent.y + lengthdir_y(length, place);\nif (hp == 0)\n{\n    event_user(1);\n}\n"
    }
  },
  {
    "metadata": {
      "index": 1,
      "name": "obj_pipis_bullet_cone",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_crew",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "exit;\nif (obj_spamton_neo_enemy.difficulty == 2)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\nelse if (other.big == 0)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\nevent_user(1);\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\ntimer = 0;\ncon = 0;\ntype = 0;\ntarget = 0;\ndamage = 1;\nhp = 0.5;\nimage_xscale = 0.4;\nimage_yscale = 0.4;\nlength = 0;\nplace = 0;\nparent = -1;\ngrazepoints = 1;\n",
      "Destroy_0": "exit;\n",
      "Other_11": "snd_play_pitch(snd_bomb, 1.1 + random(0.2));\nscr_afterimage_cut();\ninstance_destroy();\n",
      "Step_0": "if (hp == 0)\n{\n    event_user(1);\n}\n"
    }
  },
  {
    "metadata": {
      "index": 662,
      "name": "obj_pipis_center",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "timer = 0;\ncon = 0;\nmaxlength = 36;\nif (instance_exists(obj_pipis_controller))\n{\n}\ninit = 0;\nhomingfactor = 0;\nmaxhomingfactor = 5;\n",
      "Step_0": "if (!instance_exists(obj_heart))\n{\n    instance_destroy();\n    exit;\n}\nif (init == 0)\n{\n    init = 1;\n    b1 = instance_create(x, y, obj_pipis_bullet);\n    b1.place = 60 + random(15);\n    b1.parent = id;\n    b1.damage = damage;\n    b1.target = target;\n    b2 = instance_create(x, y, obj_pipis_bullet);\n    b2.place = 120 + random(15);\n    b2.parent = id;\n    b2.damage = damage;\n    b2.target = target;\n    b3 = instance_create(x, y, obj_pipis_bullet);\n    b3.place = 180 + random(15);\n    b3.parent = id;\n    b3.damage = damage;\n    b3.target = target;\n    b4 = instance_create(x, y, obj_pipis_bullet);\n    b4.place = 240 + random(15);\n    b4.parent = id;\n    b4.damage = damage;\n    b4.target = target;\n    b5 = instance_create(x, y, obj_pipis_bullet);\n    b5.place = 300 + random(15);\n    b5.parent = id;\n    b5.damage = damage;\n    b5.target = target;\n    b6 = instance_create(x, y, obj_pipis_bullet);\n    b6.place = 360 + random(15);\n    b6.parent = id;\n    b6.damage = damage;\n    b6.target = target;\n}\nif (con == 0)\n{\n    timer++;\n    if (timer == 15)\n    {\n        con = 1;\n        timer = 0;\n    }\n}\nif (con == 1 || (con > 1 && con < 6))\n{\n    move_towards_point(obj_heart.x, obj_heart.y, 13);\n    con++;\n    if (distance_to_object(obj_heart) < 30)\n    {\n        con = 6;\n    }\n}\nif (x < (camerax() - 50))\n{\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 663,
      "name": "obj_pipis_destroy_fx",
      "parent": null,
      "sprite": "spr_boxing_crescent",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_speed = 0.25;\n",
      "Other_7": "instance_destroy();\n",
      "Step_0": "if (global.turntimer < 1)\n{\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 630,
      "name": "obj_pipis_wall",
      "parent": null,
      "sprite": "spr_pipis_wall",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_alpha = 0;\nimage_blend = c_lime;\nimage_xscale = 1;\ncon = 0;\ntimer = 0;\ntype = 0;\nsiner = random(100);\n",
      "Step_0": "if (con == 0)\n{\n    if (image_alpha < 1)\n    {\n        image_alpha += 0.1;\n    }\n}\nif (con == 1)\n{\n    if (image_alpha > 0)\n    {\n        image_alpha -= 0.1;\n    }\n    else\n    {\n        instance_destroy();\n    }\n}\nif (type == 1)\n{\n    siner += 0.5;\n    x = xstart + (sin(siner / 6) * 48);\n}\nif (global.turntimer < 1)\n{\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 661,
      "name": "obj_pipis_egg_bullet_piece",
      "parent": null,
      "sprite": "spr_pipis_egg_piece",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "timer = 0;\ncon = 0;\ngrav = 0;\nimage_angle = random(360);\ndirection = random(360);\nspeed = 3 + random(7);\nimage_alpha = 2.9;\nif (instance_exists(obj_heart))\n{\n    depth = obj_heart.depth - 100;\n}\nelse\n{\n    instance_destroy();\n}\n",
      "Step_0": "image_alpha -= 0.1;\ngrav += 0.3;\ny += grav;\nif (y > (cameray() + cameraheight() + 10))\n{\n    instance_destroy();\n}\nif (global.turntimer < 1)\n{\n    instance_destroy();\n}\n"
    }
  },
  {
    "metadata": {
      "index": 46,
      "name": "obj_sneo_pipis_bomb",
      "parent": "obj_collidebullet",
      "sprite": "spr_mettaton_bomb1",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Alarm_0": "exit;\n",
      "Alarm_1": "exit;\n",
      "CleanUp_0": "if (timer > 0)\n{\n    snd_stop(bomsfallsfx);\n}\n",
      "Collision_obj_yheart_shot": "if (timer == 0 && spawninvincibilitytimer > 11)\n{\n    snd_play(snd_damage);\n    if (other.big == 0)\n    {\n        with (other)\n        {\n            event_user(0);\n        }\n    }\n    timer = 1;\n    image_speed = 1;\n    bomsfallsfx = snd_loop(snd_bombfall);\n}\n",
      "Create_0": "scr_bullet_init();\nimage_xscale = 1;\nimage_yscale = 1;\ntimer = 0;\ncon = 0;\nelement = 6;\ndestroyable = 0;\nbighitbox = 1;\nimage_speed = 0;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 2;\nwallspeed = -7;\nwallnumber = 0;\nspawninvincibilitytimer = 0;\n",
      "Draw_0": "draw_self();\nif (sprite_index == spr_mettaton_bomb2)\n{\n    for (var i = 1; i < 24; i++)\n    {\n        draw_sprite_ext(spr_mettaton_bomb3, image_index, x + (24 * i), y, image_xscale, image_yscale, 90, c_white, image_alpha);\n        draw_sprite_ext(spr_mettaton_bomb3, image_index, x - (24 * i), y, image_xscale, image_yscale, 90, c_white, image_alpha);\n        draw_sprite_ext(spr_mettaton_bomb3, image_index, x, y - (24 * i), image_xscale, image_yscale, 0, c_white, image_alpha);\n        draw_sprite_ext(spr_mettaton_bomb3, image_index, x, y + (24 * i), image_xscale, image_yscale, 0, c_white, image_alpha);\n    }\n}\n",
      "Step_0": "if (global.turntimer < 1)\n{\n    instance_destroy();\n}\nif (timer > 0)\n{\n    timer++;\n}\nspawninvincibilitytimer++;\nif (timer == 6)\n{\n    snd_play(snd_bomb);\n    snd_stop(bomsfallsfx);\n    sprite_index = spr_mettaton_bomb2;\n    image_index = 0;\n    instance_create(x, y, obj_shake);\n    hitbox1 = instance_create(x, y, obj_mettaton_bomb_hitbox);\n    hitbox1.image_xscale = 5000;\n    hitbox1.image_yscale = 0.5;\n    hitbox1.creator = id;\n    hitbox2 = instance_create(x, y, obj_mettaton_bomb_hitbox);\n    hitbox2.image_xscale = 0.2;\n    hitbox2.image_yscale = 5000;\n    hitbox2.creator = id;\n}\nif (timer == 12)\n{\n    instance_destroy();\n}\nif (y > ((obj_growtangle.y - 81) + obj_growtangle.sprite_height))\n{\n    if (alarm[0] < 1)\n    {\n        snd_play(snd_bump);\n        gravity = 0.24;\n        vspeed = -5.5 - random(3);\n        con = 2;\n        alarm[0] = 10;\n    }\n}\nif (x < (obj_growtangle.x + (obj_growtangle.sprite_width / 2) + 10) && y > ((obj_growtangle.y - (obj_growtangle.sprite_height / 2)) + 10))\n{\n    if (timer == 0)\n    {\n        snd_play(snd_damage);\n        gravity = 0;\n        speed = 0;\n        timer = 1;\n        image_speed = 1;\n        bomsfallsfx = snd_loop(snd_bombfall);\n    }\n}\n"
    }
  },
  {
    "metadata": {
      "index": 664,
      "name": "obj_sneo_armcannon_smoke",
      "parent": null,
      "sprite": "spr_boxing_smoke",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "image_xscale = 1;\nimage_yscale = 1;\nspeed = 4;\nfriction = 0.2;\ndirection = 70 + random(80);\nimage_speed = 0;\nimage_angle = 70 + random(80);\ntimer = 0;\n",
      "Step_0": "image_alpha -= 0.05;\nif (image_alpha < 0)\n{\n    instance_destroy();\n}\nif (global.turntimer < 1)\n{\n    instance_destroy();\n}\n"
    }
  }
];
