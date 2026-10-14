// Generated from installed Chapter 2. Never edit source bodies by hand.
import type {NeoSourceMetadata} from './body-source';
export const neoHostScripts:Readonly<Record<string,string>>={
 "scr_damage": "function scr_damage()\n{\n    if (global.inv < 0)\n    {\n        scr_damage_cache();\n        var __element = 0;\n        if (variable_instance_exists(id, \"element\"))\n        {\n            if (is_real(element))\n            {\n                __element = element;\n            }\n        }\n        if (target < 3)\n        {\n            if (global.hp[global.char[target]] <= 0)\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n                with (global.charinstance[target])\n                {\n                    image_blend = c_white;\n                    darkify = 0;\n                }\n            }\n        }\n        var __remtarget = -1;\n        if (target == 4)\n        {\n            __remtarget = 4;\n            scr_randomtarget_old();\n            target = mytarget;\n            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n            }\n            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n            }\n            if (target == 0 && (global.hp[global.char[target]] / global.maxhp[global.char[target]]) < 0.35)\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n            }\n            with (global.charinstance[target])\n            {\n                image_blend = c_white;\n                darkify = 0;\n            }\n        }\n        chartarget = 3;\n        tdamage = damage;\n        var oldcalculation = 0;\n        if (target < 3)\n        {\n            if (oldcalculation)\n            {\n                tdamage = ceil(tdamage - (global.battledf[target] * 3));\n            }\n            else\n            {\n                tdamage = scr_damage_calculation(tdamage, target);\n            }\n            chartarget = global.char[target];\n            if (global.charaction[target] == 10)\n            {\n                tdamage = ceil((2 * tdamage) / 3);\n            }\n            tdamage = ceil(tdamage * scr_element_damage_reduction(__element, global.char[target]));\n            if (tdamage < 1)\n            {\n                tdamage = 1;\n            }\n        }\n        if (!instance_exists(obj_shake))\n        {\n            instance_create(0, 0, obj_shake);\n        }\n        with (global.charinstance[target])\n        {\n            hurt = 1;\n            hurttimer = 0;\n        }\n        hpdiff = tdamage;\n        with (obj_dmgwriter)\n        {\n            if (delaytimer >= 1)\n            {\n                killactive = 1;\n            }\n        }\n        doomtype = -1;\n        with (obj_heart)\n        {\n            dmgnoise = 1;\n        }\n        if (target < 3)\n        {\n            if (global.hp[chartarget] <= 0)\n            {\n                doomtype = 4;\n                global.hp[chartarget] -= round(tdamage / 4);\n                hpdiff = round(tdamage / 4);\n            }\n            else\n            {\n                global.hp[chartarget] -= tdamage;\n                if (global.chapter == 2 && instance_exists(obj_gigaqueen_enemy) && global.hp[chartarget] <= 0)\n                {\n                    global.hp[chartarget] = 1;\n                    with (o_boxingcontroller)\n                    {\n                        event_user(3);\n                    }\n                }\n                if (global.hp[chartarget] <= 0)\n                {\n                    hpdiff = abs(global.hp[chartarget] - (global.maxhp[chartarget] / 2));\n                    doomtype = 4;\n                    global.hp[chartarget] = round(-global.maxhp[chartarget] / 2);\n                    scr_dead(target);\n                }\n            }\n            dmgwriter = instance_create(global.charinstance[target].x, (global.charinstance[target].y + global.charinstance[target].myheight) - 24, obj_dmgwriter);\n            dmgwriter.damage = hpdiff;\n            dmgwriter.type = doomtype;\n        }\n        if (target == 3)\n        {\n            for (hpi = 0; hpi < 3; hpi += 1)\n            {\n                chartarget = global.char[hpi];\n                if (global.hp[chartarget] >= 0)\n                {\n                    if (oldcalculation)\n                    {\n                        tdamage = ceil(tdamage - (global.battledf[hpi] * 3));\n                    }\n                    else\n                    {\n                        tdamage = scr_damage_calculation(tdamage, hpi);\n                    }\n                    tdamage = ceil(tdamage * scr_element_damage_reduction(__element, chartarget));\n                    if (global.charaction[hpi] == 10)\n                    {\n                        global.hp[chartarget] -= ceil((3 * tdamage) / 4);\n                    }\n                    else\n                    {\n                        global.hp[chartarget] -= tdamage;\n                    }\n                    if (global.hp[chartarget] <= 0)\n                    {\n                        global.hp[chartarget] = round(-global.maxhp[0] / 2);\n                    }\n                }\n            }\n        }\n        global.inv = global.invc * 40;\n        scr_damage_check();\n        gameover = 1;\n        if (global.char[0] != 0 && global.hp[global.char[0]] > 0)\n        {\n            gameover = 0;\n        }\n        if (global.char[1] != 0 && global.hp[global.char[1]] > 0)\n        {\n            gameover = 0;\n        }\n        if (global.char[2] != 0 && global.hp[global.char[2]] > 0)\n        {\n            gameover = 0;\n        }\n        if (gameover == 1)\n        {\n            scr_gameover();\n        }\n        if (__remtarget != -1)\n        {\n            target = __remtarget;\n        }\n    }\n}\n",
 "scr_damage_all": "function scr_damage_all()\n{\n    if (global.inv < 0)\n    {\n        scr_damage_cache();\n        remdamage = damage;\n        _temptarget = target;\n        for (ti = 0; ti < 3; ti += 1)\n        {\n            global.inv = -1;\n            damage = remdamage;\n            target = ti;\n            if (global.hp[global.char[ti]] > 0 && global.char[ti] != 0)\n            {\n                scr_damage();\n            }\n        }\n        global.inv = global.invc * 40;\n        target = _temptarget;\n        scr_damage_check();\n    }\n}\n",
 "scr_damage_cache": "function scr_damage_cache()\n{\n    global.damage_cache = [];\n    for (var i = 0; i < 3; i++)\n    {\n        global.damage_cache[array_length(global.damage_cache)] = global.hp[global.char[i]];\n    }\n}\n\nfunction scr_damage_check()\n{\n    if (!variable_global_exists(\"damage_cache\"))\n    {\n        global.damage_cache = [];\n    }\n    var took_damage = false;\n    for (var i = 0; i < array_length(global.damage_cache); i++)\n    {\n        var hp_cache = global.damage_cache[i];\n        if (global.hp[global.char[i]] < hp_cache)\n        {\n            took_damage = true;\n            break;\n        }\n    }\n    if (took_damage)\n    {\n        with (obj_event_manager)\n        {\n            trigger_event(UnknownEnum.Value_1);\n        }\n    }\n}\n\nenum UnknownEnum\n{\n    Value_1 = 1\n}\n",
 "scr_damage_check": "function scr_damage_cache()\n{\n    global.damage_cache = [];\n    for (var i = 0; i < 3; i++)\n    {\n        global.damage_cache[array_length(global.damage_cache)] = global.hp[global.char[i]];\n    }\n}\n\nfunction scr_damage_check()\n{\n    if (!variable_global_exists(\"damage_cache\"))\n    {\n        global.damage_cache = [];\n    }\n    var took_damage = false;\n    for (var i = 0; i < array_length(global.damage_cache); i++)\n    {\n        var hp_cache = global.damage_cache[i];\n        if (global.hp[global.char[i]] < hp_cache)\n        {\n            took_damage = true;\n            break;\n        }\n    }\n    if (took_damage)\n    {\n        with (obj_event_manager)\n        {\n            trigger_event(UnknownEnum.Value_1);\n        }\n    }\n}\n\nenum UnknownEnum\n{\n    Value_1 = 1\n}\n",
 "scr_damage_calculation": "function scr_damage_calculation(arg0, arg1)\n{\n    var _tdamage = arg0;\n    var _tdef = global.battledf[arg1];\n    var _tmaxhp = global.maxhp[global.char[arg1]];\n    var _finaldamage = 1;\n    var _hpthresholda = _tmaxhp / 5;\n    var _hpthresholdb = _tmaxhp / 8;\n    for (var _di = 0; _di < _tdef; _di++)\n    {\n        if (_tdamage > _hpthresholda)\n        {\n            _tdamage -= 3;\n        }\n        else if (_tdamage > _hpthresholdb)\n        {\n            _tdamage -= 2;\n        }\n        else\n        {\n            _tdamage -= 1;\n        }\n    }\n    return max(_tdamage, _finaldamage);\n}\n",
 "scr_damage_sneo_final_attack": "function scr_damage_sneo_final_attack()\n{\n    if (global.inv < 0)\n    {\n        scr_damage_cache();\n        var __element = 0;\n        if (variable_instance_exists(id, \"element\"))\n        {\n            if (is_real(element))\n            {\n                __element = element;\n            }\n        }\n        if (target < 3)\n        {\n            if (global.hp[global.char[target]] <= 0)\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n                with (global.charinstance[target])\n                {\n                    image_blend = c_white;\n                    darkify = 0;\n                }\n            }\n        }\n        var __remtarget = -1;\n        if (target == 4)\n        {\n            __remtarget = 4;\n            scr_randomtarget_old();\n            target = mytarget;\n            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n            }\n            if ((global.hp[global.char[target]] / global.maxhp[global.char[target]]) < (scr_party_hpaverage() / 2))\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n            }\n            if (target == 0 && (global.hp[global.char[target]] / global.maxhp[global.char[target]]) < 0.35)\n            {\n                scr_randomtarget_old();\n                target = mytarget;\n            }\n            with (global.charinstance[target])\n            {\n                image_blend = c_white;\n                darkify = 0;\n            }\n        }\n        chartarget = 3;\n        tdamage = damage;\n        var oldcalculation = 0;\n        if (target < 3)\n        {\n            chartarget = global.char[target];\n            if (global.charaction[target] == 10)\n            {\n                tdamage = ceil((2 * tdamage) / 2);\n            }\n            tdamage = ceil(tdamage * scr_element_damage_reduction(__element, global.char[target]));\n            if (tdamage < 1)\n            {\n                tdamage = 1;\n            }\n        }\n        if (!instance_exists(obj_shake))\n        {\n            instance_create(0, 0, obj_shake);\n        }\n        with (global.charinstance[target])\n        {\n            hurt = 1;\n            hurttimer = 0;\n        }\n        hpdiff = tdamage;\n        with (obj_dmgwriter)\n        {\n            if (delaytimer >= 1)\n            {\n                killactive = 1;\n            }\n        }\n        doomtype = -1;\n        with (obj_heart)\n        {\n            dmgnoise = 1;\n        }\n        if (target < 3)\n        {\n            if (global.hp[chartarget] <= 0)\n            {\n                doomtype = 4;\n                global.hp[chartarget] -= round(tdamage / 4);\n                hpdiff = round(tdamage / 4);\n            }\n            else\n            {\n                global.hp[chartarget] -= tdamage;\n                if (global.hp[chartarget] <= 0)\n                {\n                    hpdiff = abs(global.hp[chartarget] - (global.maxhp[chartarget] / 2));\n                    doomtype = 4;\n                    global.hp[chartarget] = round(-global.maxhp[chartarget] / 2);\n                    scr_dead(target);\n                }\n            }\n            dmgwriter = instance_create(global.charinstance[target].x, (global.charinstance[target].y + global.charinstance[target].myheight) - 24, obj_dmgwriter);\n            dmgwriter.damage = hpdiff;\n            dmgwriter.type = doomtype;\n        }\n        if (target == 3)\n        {\n            for (hpi = 0; hpi < 3; hpi += 1)\n            {\n                chartarget = global.char[hpi];\n                if (global.hp[chartarget] >= 0)\n                {\n                    if (oldcalculation)\n                    {\n                        tdamage = ceil(tdamage - (global.battledf[hpi] * 3));\n                    }\n                    else\n                    {\n                        tdamage = scr_damage_calculation(tdamage, hpi);\n                    }\n                    tdamage = ceil(tdamage * scr_element_damage_reduction(__element, chartarget));\n                    if (global.charaction[hpi] == 10)\n                    {\n                        global.hp[chartarget] -= ceil((3 * tdamage) / 4);\n                    }\n                    else\n                    {\n                        global.hp[chartarget] -= tdamage;\n                    }\n                    if (global.hp[chartarget] <= 0)\n                    {\n                        global.hp[chartarget] = round(-global.maxhp[0] / 2);\n                    }\n                }\n            }\n        }\n        global.inv = global.invc * 40;\n        scr_damage_check();\n        gameover = 1;\n        if (global.char[0] != 0 && global.hp[global.char[0]] > 0)\n        {\n            gameover = 0;\n        }\n        if (global.char[1] != 0 && global.hp[global.char[1]] > 0)\n        {\n            gameover = 0;\n        }\n        if (global.char[2] != 0 && global.hp[global.char[2]] > 0)\n        {\n            gameover = 0;\n        }\n        if (gameover == 1)\n        {\n            scr_gameover();\n        }\n        if (__remtarget != -1)\n        {\n            target = __remtarget;\n        }\n    }\n}\n",
 "scr_randomtarget_old": "function scr_randomtarget_old()\n{\n    abletotarget = 1;\n    if (global.charcantarget[0] == 0 && global.charcantarget[1] == 0 && global.charcantarget[2] == 0)\n    {\n        abletotarget = 0;\n    }\n    mytarget = choose(0, 1, 2);\n    if (abletotarget == 1)\n    {\n        while (global.charcantarget[mytarget] == 0)\n        {\n            mytarget = choose(0, 1, 2);\n        }\n    }\n    else\n    {\n        mytarget = 3;\n    }\n    global.targeted[mytarget] = 1;\n}\n",
 "scr_party_hpaverage": "function scr_party_hpaverage()\n{\n    var _totalhp = 0;\n    var _totalmaxhp = 0;\n    var _members = 0;\n    for (var _hpi = 0; _hpi < 3; _hpi++)\n    {\n        if (global.char[_hpi] > 0)\n        {\n            _members++;\n            _totalhp += global.hp[global.char[_hpi]];\n            _totalmaxhp += global.maxhp[global.char[_hpi]];\n        }\n    }\n    if (_totalhp > 0)\n    {\n        return floor(_totalhp / _totalmaxhp);\n    }\n    else\n    {\n        return 0;\n    }\n}\n",
 "scr_element_damage_reduction": "function scr_element_damage_reduction(arg0, arg1)\n{\n    var ___element = arg0;\n    var ___char = arg1;\n    var ___reduction = 1;\n    if (___element != 0)\n    {\n        for (var ___itemi = 0; ___itemi < 2; ___itemi++)\n        {\n            if (global.itemelement[___char][___itemi + 1] != 0)\n            {\n                if (global.itemelement[___char][___itemi + 1] == ___element)\n                {\n                    ___reduction -= global.itemelementamount[___char][___itemi + 1];\n                }\n                if (global.itemelement[___char][___itemi + 1] == 9)\n                {\n                    if (___element == 2 || ___element == 8)\n                    {\n                        ___reduction -= global.itemelementamount[___char][___itemi + 1];\n                    }\n                }\n                if (global.itemelement[___char][___itemi + 1] == 10)\n                {\n                    ___reduction -= global.itemelementamount[___char][___itemi + 1];\n                }\n            }\n        }\n    }\n    if (___reduction < 0.25)\n    {\n        ___reduction = 0.25;\n    }\n    return ___reduction;\n}\n",
 "scr_dead": "function scr_dead(arg0)\n{\n    global.charmove[arg0] = 0;\n    global.charcantarget[arg0] = 0;\n    global.chardead[arg0] = 1;\n    global.charaction[arg0] = 0;\n    global.charspecial[arg0] = 0;\n}\n",
 "scr_tensionheal": "function scr_tensionheal(arg0)\n{\n    global.tension += arg0;\n    if (global.tension > global.maxtension)\n    {\n        global.tension = global.maxtension;\n    }\n}\n",
 "scr_heartcolor": "function scr_heartcolor(arg0)\n{\n    __heartcolor = arg0;\n    if (__heartcolor == \"red\" || __heartcolor == 0)\n    {\n        with (obj_heart)\n        {\n            color = 0;\n            sprite_index = spr_heart;\n        }\n    }\n    if (__heartcolor == \"yellow\" || __heartcolor == 1)\n    {\n        with (obj_heart)\n        {\n            color = 1;\n            sprite_index = spr_yellowheart;\n        }\n        obj_grazebox.sprite_index = spr_grazeappear_yellow;\n    }\n}\n",
 "scr_moveheart": "function scr_moveheart()\n{\n    global.inv = 0;\n    if (global.chapter == 2 && instance_exists(obj_gigaqueen_enemy))\n    {\n        return instance_create(o_boxingcontroller.x + 4, o_boxingcontroller.y - 120, obj_moveheart);\n    }\n    else\n    {\n        return instance_create(obj_herokris.x + 10, obj_herokris.y + 40, obj_moveheart);\n    }\n}\n",
 "scr_act_charsprite": "function scr_act_charsprite(arg0, arg1, arg2, arg3)\n{\n    _charactor = arg0;\n    _charinstance = obj_herokris;\n    if (_charactor == \"noelle\")\n    {\n        _charinstance = obj_heronoelle;\n        _charnum = 4;\n    }\n    if (_charactor == \"ralsei\")\n    {\n        _charinstance = obj_heroralsei;\n        _charnum = 3;\n    }\n    if (_charactor == \"susie\")\n    {\n        _charinstance = obj_herosusie;\n        _charnum = 2;\n    }\n    if (_charactor == \"kris\")\n    {\n        _charinstance = obj_herokris;\n        _charnum = 1;\n    }\n    __returnvalue = _charactsprite[_charnum];\n    if (i_ex(_charinstance))\n    {\n        with (_charinstance)\n        {\n            image_alpha = 0;\n            state = 0;\n            global.faceaction[myself] = 0;\n        }\n        _charactsprite[_charnum] = scr_dark_marker(_charinstance.x, _charinstance.y, arg1);\n        with (_charactsprite[_charnum])\n        {\n            depth = 20 - (__view_get(e__VW.YView, 0) / 40);\n            scr_oflash();\n            if (arg2 > 0 && arg3 == 0)\n            {\n                scr_animate(0, 0, arg2);\n            }\n            if (arg2 > 0 && arg3 == 1)\n            {\n                image_speed = arg2;\n            }\n            a = scr_afterimage();\n            a.hspeed = 2.5;\n            a.depth = depth + 1;\n            b = scr_afterimage();\n            b.image_alpha = 0.6;\n            b.hspeed = 5;\n            b.depth = depth + 2;\n        }\n        __returnvalue = _charactsprite[_charnum];\n    }\n    return __returnvalue;\n}\n\nenum e__VW\n{\n    XView,\n    YView,\n    WView,\n    HView,\n    Angle,\n    HBorder,\n    VBorder,\n    HSpeed,\n    VSpeed,\n    Object,\n    Visible,\n    XPort,\n    YPort,\n    WPort,\n    HPort,\n    Camera,\n    SurfaceID\n}\n",
 "scr_act_charsprite_end": "function scr_act_charsprite_end()\n{\n    for (i = 0; i < 10; i++)\n    {\n        with (_charactsprite[i])\n        {\n            instance_destroy();\n        }\n    }\n    with (obj_heroparent)\n    {\n        if (image_alpha == 0)\n        {\n            image_alpha = 1;\n            acttimer = 0;\n            state = 0;\n            global.faceaction[myself] = 0;\n        }\n    }\n}\n",
 "scr_smallface": "function scr_smallface(arg0, arg1, arg2, arg3, arg4, arg5)\n{\n    scr_smallface_reset(arg0);\n    global.smsprite[arg0] = spr_face_susie_alt;\n    if (is_string(arg1))\n    {\n        if (arg1 == \"susie\")\n        {\n            global.smsprite[arg0] = spr_face_susie_alt;\n        }\n        if (arg1 == \"ralsei\")\n        {\n            global.smsprite[arg0] = spr_face_r_nohat;\n        }\n        if (arg1 == \"lancer\")\n        {\n            global.smsprite[arg0] = spr_face_l0;\n        }\n        if (arg1 == \"noelle\")\n        {\n            global.smsprite[arg0] = spr_face_n_matome;\n        }\n        if (arg1 == \"noelle_cropped\")\n        {\n            global.smsprite[arg0] = spr_face_n_matome_cropped;\n        }\n        if (arg1 == \"queen\")\n        {\n            global.smsprite[arg0] = scr_84_get_sprite(\"spr_face_queen\");\n        }\n        if (arg1 == \"rouxls\")\n        {\n            global.smsprite[arg0] = spr_face_rurus;\n        }\n        if (arg1 == \"berdly\")\n        {\n            global.smsprite[arg0] = spr_face_berdly_dark;\n        }\n        if (arg1 == \"rudy\")\n        {\n            global.smsprite[arg0] = spr_face_rudy;\n        }\n        if (arg1 == \"none\" || arg1 == \"empty\")\n        {\n            global.smsprite[arg0] = spr_empty;\n        }\n    }\n    else\n    {\n        global.smsprite[arg0] = arg1;\n        if (arg1 == 0)\n        {\n            global.smsprite[arg0] = spr_empty;\n        }\n    }\n    global.smimage[arg0] = arg2;\n    if (is_string(arg3))\n    {\n        if (global.fighting == 1)\n        {\n            if (arg3 == \"left\")\n            {\n                global.smxx[arg0] = 60;\n            }\n            if (arg3 == \"leftmid\")\n            {\n                global.smxx[arg0] = 160;\n            }\n            if (arg3 == \"mid\" || arg3 == \"middle\")\n            {\n                global.smxx[arg0] = 260;\n            }\n            if (arg3 == \"rightmid\")\n            {\n                global.smxx[arg0] = 360;\n            }\n            if (arg3 == \"right\")\n            {\n                global.smxx[arg0] = 460;\n            }\n        }\n        else\n        {\n            if (arg3 == \"left\")\n            {\n                global.smxx[arg0] = 70;\n            }\n            if (arg3 == \"leftmid\")\n            {\n                global.smxx[arg0] = 160;\n            }\n            if (arg3 == \"mid\" || arg3 == \"middle\")\n            {\n                global.smxx[arg0] = 260;\n            }\n            if (arg3 == \"rightmid\")\n            {\n                global.smxx[arg0] = 360;\n            }\n            if (arg3 == \"right\")\n            {\n                global.smxx[arg0] = 400;\n            }\n        }\n    }\n    else\n    {\n        global.smxx[arg0] = arg3;\n    }\n    if (is_string(arg4))\n    {\n        if (global.fighting == 1)\n        {\n            if (arg4 == \"top\")\n            {\n                global.smyy[arg0] = -10;\n            }\n            if (arg4 == \"mid\" || arg4 == \"middle\")\n            {\n                global.smyy[arg0] = 30;\n            }\n            if (arg4 == \"bottommid\")\n            {\n                global.smyy[arg0] = 45;\n            }\n            if (arg4 == \"bottom\")\n            {\n                global.smyy[arg0] = 56;\n            }\n            if (arg4 == \"bottom\" || arg4 == \"bottommid\")\n            {\n                global.smdir[arg0] = 90;\n                global.smspeed[arg0] = 4;\n                global.smalarm[arg0] = 10;\n                global.smyy[arg0] += 40;\n                global.smxx[arg0] -= 40;\n            }\n        }\n        else\n        {\n            if (arg4 == \"top\")\n            {\n                global.smyy[arg0] = -10;\n            }\n            if (arg4 == \"mid\" || arg4 == \"middle\")\n            {\n                global.smyy[arg0] = 30;\n            }\n            if (arg4 == \"bottommid\")\n            {\n                global.smyy[arg0] = 50;\n            }\n            if (arg4 == \"bottom\")\n            {\n                global.smyy[arg0] = 68;\n            }\n            if (global.darkzone == 0)\n            {\n                if (arg4 == \"top\")\n                {\n                    global.smyy[arg0] = 160;\n                }\n                if (arg4 == \"mid\" || arg4 == \"middle\")\n                {\n                    global.smyy[arg0] = 200;\n                }\n                if (arg4 == \"bottommid\")\n                {\n                    global.smyy[arg0] = 240;\n                }\n                if (arg4 == \"bottom\")\n                {\n                    global.smyy[arg0] = 240;\n                }\n            }\n        }\n    }\n    else\n    {\n        global.smyy[arg0] = arg4;\n    }\n    global.smstring[arg0] = arg5;\n}\n",
 "scr_smallface_reset": "function scr_smallface_reset(arg0)\n{\n    global.smalarm[arg0] = 5;\n    global.smyy[arg0] = 70;\n    global.smxx[arg0] = 170;\n    global.smdir[arg0] = 180;\n    global.smspeed[arg0] = 10;\n    global.smtype[arg0] = 3;\n    global.smimage[arg0] = global.fe;\n    global.smimagespeed[arg0] = 0;\n    global.smsprite[arg0] = spr_face_s6;\n    global.smcolor[arg0] = c_white;\n    global.smstring[arg0] = stringsetloc(\"* ... what?\", \"scr_smallface_reset_slash_scr_smallface_reset_gml_12_0\");\n}\n",
 "scr_cutscene_loaded": "function scr_cutscene_loaded()\n{\n    var __loadedState = 0;\n    if (instance_exists(obj_cutscene_master))\n    {\n        if (obj_cutscene_master.loadedState == 1)\n        {\n            __loadedState = 1;\n        }\n    }\n    return __loadedState;\n}\n",
 "scr_afterimage": "function scr_afterimage()\n{\n    afterimage = instance_create(x, y, obj_afterimage);\n    afterimage.sprite_index = sprite_index;\n    afterimage.image_index = image_index;\n    afterimage.image_blend = image_blend;\n    afterimage.image_speed = 0;\n    afterimage.depth = depth;\n    afterimage.image_xscale = image_xscale;\n    afterimage.image_yscale = image_yscale;\n    afterimage.image_angle = image_angle;\n    return afterimage;\n}\n",
 "scr_afterimage_cut": "function scr_afterimage_cut()\n{\n    afterimage = instance_create(x, y, obj_afterimage_cut);\n    afterimage.sprite_index = sprite_index;\n    afterimage.image_index = image_index;\n    afterimage.image_blend = image_blend;\n    afterimage.image_speed = 0;\n    afterimage.depth = depth;\n    afterimage.image_xscale = image_xscale;\n    afterimage.image_yscale = image_yscale;\n    afterimage.image_angle = image_angle;\n    with (afterimage)\n    {\n        event_user(0);\n    }\n    return afterimage;\n}\n",
 "scr_afterimage_grow": "function scr_afterimage_grow()\n{\n    afterimage = instance_create(x, y, obj_afterimage_grow);\n    afterimage.sprite_index = sprite_index;\n    afterimage.image_index = image_index;\n    afterimage.image_blend = image_blend;\n    afterimage.image_speed = 0;\n    afterimage.depth = depth;\n    afterimage.image_xscale = image_xscale;\n    afterimage.image_yscale = image_yscale;\n    afterimage.image_angle = image_angle;\n    return afterimage;\n}\n",
 "scr_animate": "function scr_animate(arg0, arg1, arg2)\n{\n    __animator = instance_create(x, y, obj_animator);\n    __animator.target = id;\n    __animator.initframe = arg0;\n    __animator.endframe = arg1;\n    __animator.fake_image_speed = arg2;\n    return __animator;\n}\n",
 "scr_dark_marker": "function scr_dark_marker(arg0, arg1, arg2)\n{\n    thismarker = instance_create(arg0, arg1, obj_marker);\n    with (thismarker)\n    {\n        sprite_index = arg2;\n        image_speed = 0;\n        image_xscale = 2;\n        image_yscale = 2;\n    }\n    return thismarker;\n}\n",
 "scr_oflash": "function scr_oflash()\n{\n    _oflash = instance_create(x, y, obj_oflash);\n    _oflash.image_xscale = image_xscale;\n    _oflash.image_speed = 0;\n    _oflash.image_index = image_index;\n    _oflash.image_yscale = image_yscale;\n    if (global.chapter == 2 && object_index == obj_mauswheel_enemy)\n    {\n        _oflash.sprite_index = spr_mauswheel_idle;\n    }\n    else\n    {\n        _oflash.sprite_index = sprite_index;\n    }\n    _oflash.depth = depth - 1;\n    _oflash.target = id;\n    return _oflash;\n}\n",
 "scr_armorcheck_equipped_party": "function scr_armorcheck_equipped_party(arg0)\n{\n    var __totalwearing = 0;\n    for (var __weari = 0; __weari < 3; __weari++)\n    {\n        if (global.char[__weari] != 0)\n        {\n            __totalwearing += scr_armorcheck_equipped(global.char[__weari], arg0);\n        }\n    }\n    return __totalwearing;\n}\n",
 "scr_armorcheck_equipped": "function scr_armorcheck_equipped(arg0, arg1)\n{\n    var __wearing = 0;\n    if (global.chararmor1[arg0] == arg1)\n    {\n        __wearing++;\n    }\n    if (global.chararmor2[arg0] == arg1)\n    {\n        __wearing++;\n    }\n    return __wearing;\n}\n",
 "scr_script_delayed": "function scr_script_delayed()\n{\n    var __scriptdelay = instance_create(0, 0, obj_script_delayed);\n    __scriptdelay.script = argument[0];\n    __scriptdelay.alarm[0] = argument[1];\n    __scriptdelay.target = id;\n    for (var __i = 0; __i < (argument_count - 2); __i++)\n    {\n        __scriptdelay.script_arg[__i] = argument[__i + 2];\n    }\n    __scriptdelay.arg_count = argument_count - 2;\n    return __scriptdelay;\n}\n",
 "ease_out_elastic": "function ease_out_elastic(arg0, arg1, arg2, arg3)\n{\n    var _s = 1.70158;\n    var _p = 0;\n    var time = arg0;\n    var start = arg1;\n    var change = arg2;\n    var duration = arg3;\n    if (time == 0 || change == 0)\n    {\n        return start;\n    }\n    time /= duration;\n    if (time == 1)\n    {\n        return start + arg2;\n    }\n    if (!_p)\n    {\n        _p = duration * 0.3;\n    }\n    if (change < abs(arg2))\n    {\n        change = arg2;\n        _s = _p * 0.25;\n    }\n    else\n    {\n        _s = (_p / (2 * pi)) * arcsin(arg2 / change);\n    }\n    return (change * power(2, -10 * time) * sin((((time * duration) - _s) * (2 * pi)) / _p)) + arg2 + start;\n}\n",
 "snd_pitch_time": "function snd_pitch_time(arg0, arg1, arg2)\n{\n    with (obj_lerppitch)\n    {\n        if (sndtarget == arg0)\n        {\n            instance_destroy();\n        }\n    }\n    var pitchthing = instance_create(0, 0, obj_lerppitch);\n    pitchthing.sndtarget = arg0;\n    pitchthing.targetpitch = arg1;\n    pitchthing.maxframes = arg2;\n    with (pitchthing)\n    {\n        event_user(0);\n    }\n}\n"
};
export const neoHostObjectSources:Readonly<Record<string,{metadata:NeoSourceMetadata;sources:Readonly<Record<string,string>>}>>={
 "obj_animator": {
  "metadata": {
   "index": 926,
   "name": "obj_animator",
   "parent": null,
   "sprite": null,
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Create_0": "con = 0;\ninitframe = -1;\nendframe = -1;\ntarget = -1;\nsprite = -1;\nfake_image_speed = 0.25;\nfake_image_index = 0;\nfake_image_index_max = 0;\ntimer = 0;\n",
   "Step_0": "if (i_ex(target))\n{\n    if (con == 0)\n    {\n        target.image_index = 0;\n        target.image_speed = 0;\n        if (sprite >= 0)\n        {\n            target.sprite_index = sprite;\n        }\n        if (initframe >= 0)\n        {\n            target.image_index = initframe;\n        }\n        fake_image_index_max = endframe;\n        if (endframe == 0)\n        {\n            fake_image_index_max = target.image_number - 1 - target.image_index;\n        }\n        if (endframe == -1)\n        {\n            fake_image_index_max = target.image_number - target.image_index;\n        }\n        con = 1;\n    }\n    if (con == 1)\n    {\n        fake_image_index += fake_image_speed;\n        target.image_index = fake_image_index;\n        if (fake_image_index >= fake_image_index_max)\n        {\n            instance_destroy();\n        }\n    }\n}\nelse\n{\n    instance_destroy();\n}\n"
  }
 },
 "obj_smallface": {
  "metadata": {
   "index": 64,
   "name": "obj_smallface",
   "parent": null,
   "sprite": "spr_smallface_s0",
   "mask": null,
   "solid": false,
   "depth": -5,
   "visible": true
  },
  "sources": {
   "Alarm_0": "nowdir = direction;\nspeed = 0;\nactive = 1;\nif (type != 2 && type != 4)\n{\n    finished = 1;\n}\n",
   "Create_0": "stringpos = 0;\nmystring = \" \";\npart = 1;\npartstring = \" \";\ntype = 0;\nrate = 1;\nactive = 0;\nfinished = 0;\nmycolor = c_purple;\nalarm[0] = 1;\ngetrid = 0;\nwritergod = obj_writer;\nnowdir = 90;\nfacealpha = 0;\n",
   "Draw_0": "if (global.darkzone == 1)\n{\n    if (facealpha < 1)\n    {\n        facealpha += 0.2;\n    }\n    draw_sprite_ext(sprite_index, image_index, x, y, image_xscale, image_yscale, image_angle, image_blend, facealpha);\n    draw_set_alpha(facealpha);\n    if (type == 0 || type == 3)\n    {\n        scr_84_set_draw_font(\"main\");\n        draw_set_color(mycolor);\n        draw_text(x + 70, y + 10, string_hash_to_newline(mystring));\n    }\n    if (type == 1 && active == 1 && getrid == 0)\n    {\n        scr_84_set_draw_font(\"main\");\n        draw_set_color(mycolor);\n        draw_text(x + 70, y + 15, string_hash_to_newline(mystring));\n        finished = 1;\n    }\n    if (type == 2 || type == 4)\n    {\n        if (active == 1)\n        {\n            scr_84_set_draw_font(\"main\");\n            draw_set_color(mycolor);\n            if (finished == 0)\n            {\n                partstring += string_char_at(mystring, part);\n                part += 1;\n                if (part >= (string_length(mystring) + 1))\n                {\n                    finished = 1;\n                }\n            }\n            draw_text(x + 70 + random(1), y + 15 + random(1), string_hash_to_newline(partstring));\n        }\n    }\n    if (i_ex(writergod))\n    {\n        if (finished == 1 && getrid == 0)\n        {\n            finished = 2;\n        }\n    }\n    else\n    {\n        instance_destroy();\n    }\n    if (getrid == 1)\n    {\n        direction = -nowdir;\n        speed += 2;\n        if (type == 3 || type == 4)\n        {\n            instance_destroy();\n        }\n    }\n    draw_set_alpha(1);\n}\n"
  }
 },
 "obj_script_delayed": {
  "metadata": {
   "index": 932,
   "name": "obj_script_delayed",
   "parent": null,
   "sprite": null,
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Alarm_0": "event_user(0);\ninstance_destroy();\n",
   "Create_0": "script = -1;\ntarget = -1;\nrate = 1;\nalarm[0] = 1;\nfor (i = 0; i < 13; i++)\n{\n    script_arg[i] = 0;\n}\narg_count = 0;\nconstant = 0;\nmax_time = 0;\ntimer = 999;\ntotaltimer = 0;\n",
   "Other_10": "if (i_ex(target))\n{\n    target.__scipt = script;\n    for (i = 0; i < 10; i++)\n    {\n        target.__scipt_arg[i] = script_arg[i];\n    }\n    if (arg_count == 0)\n    {\n        with (target)\n        {\n            script_execute(__scipt);\n        }\n    }\n    if (arg_count == 1)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0]);\n        }\n    }\n    if (arg_count == 2)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1]);\n        }\n    }\n    if (arg_count == 3)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2]);\n        }\n    }\n    if (arg_count == 4)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3]);\n        }\n    }\n    if (arg_count == 5)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4]);\n        }\n    }\n    if (arg_count == 6)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5]);\n        }\n    }\n    if (arg_count == 7)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6]);\n        }\n    }\n    if (arg_count == 8)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7]);\n        }\n    }\n    if (arg_count == 9)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7], __scipt_arg[8]);\n        }\n    }\n    if (arg_count == 10)\n    {\n        with (target)\n        {\n            script_execute(__scipt, __scipt_arg[0], __scipt_arg[1], __scipt_arg[2], __scipt_arg[3], __scipt_arg[4], __scipt_arg[5], __scipt_arg[6], __scipt_arg[7], __scipt_arg[8], __scipt_arg[9]);\n        }\n    }\n}\n",
   "Step_0": "if (constant == 1)\n{\n    if (max_time == -1)\n    {\n        totaltimer = -10;\n    }\n    timer++;\n    if (timer >= rate)\n    {\n        if (i_ex(target) && totaltimer < max_time)\n        {\n            event_user(0);\n            timer = 0;\n        }\n        else\n        {\n            instance_destroy();\n        }\n    }\n    totaltimer++;\n}\n"
  }
 },
 "obj_collidebullet": {
  "metadata": {
   "index": 364,
   "name": "obj_collidebullet",
   "parent": "obj_bulletparent",
   "sprite": null,
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Other_15": "if (active == 1)\n{\n    if (target != 3)\n    {\n        scr_damage();\n    }\n    if (target == 3)\n    {\n        scr_damage_all();\n    }\n    if (destroyonhit == 1)\n    {\n        instance_destroy();\n    }\n}\n"
  }
 },
 "obj_regularbullet": {
  "metadata": {
   "index": 372,
   "name": "obj_regularbullet",
   "parent": "obj_collidebullet",
   "sprite": null,
   "mask": null,
   "solid": false,
   "depth": -10,
   "visible": true
  },
  "sources": {
   "Create_0": "scr_bullet_init();\nspin = 0;\nspinspeed = 0;\nimage_alpha = 1;\nif (!instance_exists(obj_heart))\n{\n    instance_destroy();\n}\nwall_destroy = 1;\nbottomfade = 0;\n",
   "Step_0": "if (wall_destroy == 1)\n{\n    if (x < (__view_get(e__VW.XView, 0) - 80))\n    {\n        instance_destroy();\n    }\n    if (x > (__view_get(e__VW.XView, 0) + 760))\n    {\n        instance_destroy();\n    }\n    if (y < (__view_get(e__VW.YView, 0) - 80))\n    {\n        instance_destroy();\n    }\n    if (y > (__view_get(e__VW.YView, 0) + 580))\n    {\n        instance_destroy();\n    }\n}\nif (updateimageangle == 1)\n{\n    image_angle = direction;\n}\nif (spin == 1)\n{\n    image_angle += spinspeed;\n}\nif (bottomfade != 0)\n{\n    if (y > (cameray() + bottomfade))\n    {\n        image_alpha *= 0.8;\n    }\n}\n\nenum e__VW\n{\n    XView,\n    YView,\n    WView,\n    HView,\n    Angle,\n    HBorder,\n    VBorder,\n    HSpeed,\n    VSpeed,\n    Object,\n    Visible,\n    XPort,\n    YPort,\n    WPort,\n    HPort,\n    Camera,\n    SurfaceID\n}\n"
  }
 },
 "obj_growtangle": {
  "metadata": {
   "index": 877,
   "name": "obj_growtangle",
   "parent": "obj_battlesolid",
   "sprite": "spr_battlebg_0",
   "mask": "spr_battlebg_0",
   "solid": false,
   "depth": 5,
   "visible": true
  },
  "sources": {
   "CleanUp_0": "if (customBox)\n{\n    d = instance_create(x, y, obj_battle_cleanup);\n    d.custom_box_sprite = spr_custom_box;\n}\n",
   "correction_Create_0": "xhome = obj_growtangle.x;\nyhome = obj_growtangle.y;\ninit = 0;\nspawntimer = 0;\n",
   "correction_Step_1": "if (instance_exists(obj_growtangle))\n{\n    if (global.turntimer < 0 || spawntimer < 15)\n    {\n        spawntimer++;\n        if (spawntimer == 15)\n        {\n            obj_heart.x += (x - xhome);\n            obj_heart.y += (y - yhome);\n            x = xhome;\n            y = yhome;\n        }\n        obj_growtangle.x = scr_movetowards(obj_growtangle.x, x, 5);\n        obj_growtangle.y = scr_movetowards(obj_growtangle.y, y, 5);\n    }\n}\nelse\n{\n    instance_destroy();\n}\n",
   "Create_0": "image_xscale = 0;\nimage_yscale = 0;\nimage_alpha = 0.3;\ntimer = 0;\nmaxtimer = 15;\ngrowcon = 1;\nimage_speed = 0;\nimage_blend = merge_color(c_green, c_lime, 0.5);\ntarget_angle = 0;\nfullgrow = 0;\nkeep = 0;\nmegakeep = 0;\nmaxxscale = 2;\nmaxyscale = 2;\ncustomBox = false;\ninit = 0;\nspr_custom_box = sprite_index;\n",
   "Draw_0": "draw_sprite_ext(sprite_index, 1, x, y, image_xscale, image_yscale, image_angle, image_blend, image_alpha);\nif (customBox && growth && growcon != 2)\n{\n    draw_sprite_ext(spr_custom_box, 0, x, y, image_xscale / (maxxscale / 2), image_yscale / (maxyscale / 2), image_angle, image_blend, image_alpha);\n}\nelse\n{\n    draw_self();\n}\n",
   "electric_Create_0": "scr_bullet_init();\ndestroyonhit = 0;\nimage_speed = 0.2;\nimage_alpha = 0;\nactive = 0;\nif (instance_exists(obj_growtangle))\n{\n    image_xscale = obj_growtangle.image_xscale;\n    image_yscale = obj_growtangle.image_yscale;\n    image_angle = obj_growtangle.image_angle;\n}\nelse\n{\n    instance_destroy();\n}\ninstance_create(x, y, obj_growtangle_electric_pushin);\ntimer = 0;\ntype = 0;\ncon = 0;\namplitude = 0;\nmaxamplitude = 60;\nspinamplitude = 0;\nplugx = 120;\nplugalpha = 0;\nshottimer = 0;\nspeedmode = 1;\nxx = 0;\nyy = 0;\nif (instance_exists(obj_queen_enemy))\n{\n    damage = global.monsterat[obj_queen_enemy.myself] * 5;\n}\nif (instance_exists(obj_queen_bulletcontroller))\n{\n    target = obj_queen_bulletcontroller.target;\n}\ngrazepoints = 4;\n",
   "electric_Destroy_0": "with (obj_growtangle_electric_pushin)\n{\n    instance_destroy();\n}\n",
   "electric_Draw_0": "if (instance_exists(obj_growtangle))\n{\n    plugangle = 0;\n    wy = 0;\n    wx = 75;\n    if (con >= 1)\n    {\n        plugangle = image_angle;\n        wx = lengthdir_x(obj_growtangle.sprite_width / 2, image_angle);\n        wy = lengthdir_y(obj_growtangle.sprite_width / 2, image_angle);\n    }\n    if (type != 1)\n    {\n        draw_sprite_ext(spr_growtangle_electric_plug, 0, (x + xx) - wx - plugx, (y + xx) - wy, 2, 2, plugangle, c_white, plugalpha);\n    }\n    draw_sprite_ext(spr_growtangle_electric_plug, 0, x + xx + wx + plugx, y + xx + wy, 2, 2, plugangle + 180, c_white, plugalpha);\n}\ndraw_self();\n",
   "electric_pushin_Create_0": "image_index = 1;\nimage_speed = 0;\nimage_xscale = obj_growtangle.image_xscale - 0.4;\nimage_yscale = obj_growtangle.image_yscale - 0.4;\nimage_angle = obj_growtangle.image_angle;\nx = obj_growtangle.x;\ny = obj_growtangle.y;\nvisible = false;\n",
   "electric_pushin_Step_0": "image_xscale = obj_growtangle.image_xscale - 0.4;\nimage_yscale = obj_growtangle.image_yscale - 0.4;\nimage_angle = obj_growtangle.image_angle;\nx = obj_growtangle.x;\ny = obj_growtangle.y;\nvisible = false;\nrepeat (6)\n{\n    if (!place_meeting(x, y, obj_heart))\n    {\n        obj_heart.x += lengthdir_x(1, point_direction(obj_heart.x, obj_heart.y, obj_growtangle.x, obj_growtangle.y));\n        obj_heart.y += lengthdir_y(1, point_direction(obj_heart.x, obj_heart.y, obj_growtangle.x, obj_growtangle.y));\n    }\n}\n",
   "electric_Step_0": "if (grazed == 1)\n{\n    grazetimer += 1;\n    if (grazetimer >= 30)\n    {\n        grazetimer = 0;\n        grazed = 0;\n    }\n}\nif (instance_exists(obj_growtangle))\n{\n    if (con == 0)\n    {\n        timer++;\n        if (type == 1)\n        {\n            plugxend = -23;\n            plugx = lerp(plugx, plugxend, 0.2);\n        }\n        else\n        {\n            plugxend = 0;\n            plugx = lerp(plugx, plugxend, 0.15);\n        }\n        plugalpha = lerp(plugalpha, 1, 0.1);\n        if (timer >= 15 && timer <= 25)\n        {\n            obj_growtangle.x = obj_growtangle.xstart + random_range((-35 + timer) / 2, (35 - timer) / 2);\n            obj_growtangle.y = obj_growtangle.ystart + random_range((-35 + timer) / 2, (35 - timer) / 2);\n        }\n        if (timer >= 15)\n        {\n            plugalpha = 1;\n            plugx = plugxend;\n            image_alpha += 0.1;\n            if (image_alpha >= 1)\n            {\n                active = 1;\n            }\n            else\n            {\n                active = 0;\n            }\n        }\n        if (timer >= 25)\n        {\n            con = 1;\n            timer = 0;\n            plugx = 0;\n        }\n    }\n    if (con == 1)\n    {\n        timer++;\n        shottimer++;\n        if (type == 0)\n        {\n            moveamount = sin(timer / 20) * amplitude;\n        }\n        if (type == 1)\n        {\n            moveamount = 1;\n        }\n        shotthreshold = 8;\n        if (type == 1)\n        {\n            shotthreshold = 15;\n        }\n        if (shottimer >= shotthreshold)\n        {\n            shottimer = 0;\n            lightning = instance_create(-100, y, obj_growtangle_spark);\n            with (lightning)\n            {\n                scr_bullet_init();\n                destroyonhit = 1;\n            }\n            if (speedmode == 1)\n            {\n                wx = lengthdir_x(obj_growtangle.sprite_width / 2, image_angle);\n                wy = lengthdir_y(obj_growtangle.sprite_width / 2, image_angle);\n                if (moveamount > 0)\n                {\n                    lightning.x = x + xx + wx;\n                    lightning.y = y + yy + wy;\n                    lightning.gravity_direction = 180 + image_angle;\n                }\n                if (moveamount < 0)\n                {\n                    lightning.x = (x + xx) - wx;\n                    lightning.y = y + yy + wy;\n                    lightning.gravity_direction = image_angle;\n                }\n                lightning.direction = lightning.gravity_direction + 180;\n                lightning.speed = 5 + random(1);\n                lightning.depth = depth - 5;\n                if (type == 1)\n                {\n                    lightning.speed = 6 + random(1);\n                }\n                with (lightning)\n                {\n                    motion_add(direction + choose(90, 270), random(1.5));\n                }\n            }\n            lightning.gravity = 0.3;\n            lightning.image_xscale = 1.5;\n            lightning.image_yscale = 1.5;\n            with (lightning)\n            {\n                if (instance_exists(obj_queen_enemy))\n                {\n                    damage = global.monsterat[obj_queen_enemy.myself] * 5;\n                }\n            }\n            scr_bullet_inherit(lightning);\n            lightning.active = 1;\n            lightning.sprite_index = spr_growtangle_elecbullet;\n        }\n        if (timer >= 150)\n        {\n            if (amplitude > 0)\n            {\n                amplitude -= 2;\n            }\n        }\n        else\n        {\n            amplitude = lerp(amplitude, maxamplitude, 0.1);\n        }\n        if (type == 0)\n        {\n            obj_growtangle.x = obj_growtangle.xstart + moveamount;\n        }\n        if (type == 1)\n        {\n            moveamount = sin(timer / 20) * amplitude;\n            obj_growtangle.x = obj_growtangle.xstart + moveamount;\n            obj_growtangle.image_angle += 1.9565217391304348;\n        }\n        if (amplitude <= 0 && timer >= 230 && global.turntimer > 2)\n        {\n            global.turntimer = 2;\n        }\n    }\n    x = obj_growtangle.x - xx;\n    y = obj_growtangle.y - yy;\n    image_xscale = obj_growtangle.image_xscale;\n    image_yscale = obj_growtangle.image_yscale;\n    image_angle = obj_growtangle.image_angle;\n}\nelse\n{\n    instance_destroy();\n}\n",
   "spark_Create_0": "event_inherited();\ntimer = 0;\n",
   "spark_Step_0": "event_inherited();\ntimer++;\nif (timer == 4)\n{\n    image_xscale = 1.5;\n    image_yscale = 1.5;\n    image_angle = random(360);\n}\nif (timer == 8)\n{\n    timer = 1;\n    image_xscale = 2;\n    image_yscale = 2;\n    image_angle = random(360);\n}\n",
   "Step_0": "if (!init)\n{\n    if (visible && (maxxscale != 2 || maxyscale != 2) && sprite_index == spr_battlebg_0)\n    {\n        customBox = true;\n        if ((maxxscale % 1) != 0)\n        {\n            maxxscale = round(maxxscale * 37.5) / 37.5;\n        }\n        if ((maxyscale % 1) != 0)\n        {\n            maxyscale = round(maxyscale * 37.5) / 37.5;\n        }\n        var _tempxscale = maxxscale / 2;\n        var _tempyscale = maxyscale / 2;\n        var surf = surface_create(75 * _tempxscale, 75 * _tempyscale);\n        surface_set_target(surf);\n        draw_clear_alpha(c_black, 0);\n        draw_sprite_ext(spr_battlebg_stretch, 0, 37 * _tempxscale, 37 * _tempyscale, _tempxscale, _tempyscale, 0, c_white, 1);\n        spr_custom_box = sprite_create_from_surface(surf, 0, 0, 75 * _tempxscale, 75 * _tempyscale, false, false, round(37.5 * _tempxscale), round(37.5 * _tempyscale));\n        sprite_index = spr_battlebg_stretch_hitbox;\n        surface_reset_target();\n        surface_free(surf);\n    }\n    init = 1;\n}\ngrowth = 0;\nif (timer < maxtimer && growcon == 1)\n{\n    growth = 1;\n}\nif (timer > 0 && growcon == 3)\n{\n    growth = 1;\n}\nif (growth == 1)\n{\n    if (growcon == 1)\n    {\n        timer += 1;\n    }\n    if (growcon == 3)\n    {\n        timer -= 1;\n    }\n    image_xscale = maxxscale * (timer / maxtimer);\n    image_yscale = maxyscale * (timer / maxtimer);\n    image_angle = 180 + (180 * (timer / maxtimer)) + target_angle;\n    image_alpha = 0.5 + ((timer / maxtimer) * 0.5);\n    if (visible)\n    {\n        d = instance_create(x, y, obj_afterimage);\n        d.sprite_index = spr_custom_box;\n        d.image_xscale = image_xscale / (maxxscale / 2);\n        d.image_yscale = image_yscale / (maxyscale / 2);\n        d.image_angle = image_angle;\n        d.depth = depth - 1;\n        d.image_blend = image_blend;\n        d.image_alpha = (1 - image_alpha) + 0.1;\n        d.image_speed = 0;\n    }\n    if (timer >= maxtimer && growcon == 1)\n    {\n        growcon = 2;\n        image_angle = target_angle;\n    }\n    if (timer <= 0 && growcon == 3)\n    {\n        instance_destroy();\n    }\n}\n",
   "Step_2": "if (keep == 1)\n{\n    if (instance_exists(obj_heart))\n    {\n        if (path_speed != 0 || speed != 0 || megakeep == 1)\n        {\n            lborder = x - (sprite_width / 2);\n            rborder = x + (sprite_width / 2);\n            uborder = y - (sprite_height / 2);\n            dborder = y + (sprite_height / 2);\n            if (obj_heart.x < (lborder + 5))\n            {\n                obj_heart.x = lborder + 5;\n            }\n            if (obj_heart.x > (rborder - 22))\n            {\n                obj_heart.x = rborder - 22;\n            }\n            if (obj_heart.y < (uborder + 5))\n            {\n                obj_heart.y = uborder + 5;\n            }\n            if (obj_heart.y > (dborder - 22))\n            {\n                obj_heart.y = dborder - 22;\n            }\n        }\n    }\n}\n"
  }
 },
 "obj_growtangle_spark": {
  "metadata": {
   "index": 8,
   "name": "obj_growtangle_spark",
   "parent": "obj_regularbullet",
   "sprite": "spr_growtangle_elecbullet",
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Create_0": "event_inherited();\ntimer = 0;\n",
   "Step_0": "event_inherited();\ntimer++;\nif (timer == 4)\n{\n    image_xscale = 1.5;\n    image_yscale = 1.5;\n    image_angle = random(360);\n}\nif (timer == 8)\n{\n    timer = 1;\n    image_xscale = 2;\n    image_yscale = 2;\n    image_angle = random(360);\n}\n"
  }
 },
 "obj_moveheart": {
  "metadata": {
   "index": 382,
   "name": "obj_moveheart",
   "parent": null,
   "sprite": "spr_dodgeheart",
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Alarm_0": "x = distx;\ny = disty;\nif (!i_ex(obj_heart))\n{\n    instance_create(x, y, obj_heart);\n}\ninstance_destroy();\n",
   "Create_0": "burst = 0;\nshift = 1;\nimage_alpha = 0;\nflytime = 8;\nif (instance_exists(obj_heartmarker))\n{\n    distx = obj_heartmarker.x;\n    disty = obj_heartmarker.y;\n}\nelse if (!instance_exists(obj_growtangle))\n{\n    distx = __view_get(e__VW.XView, 0) + 310;\n    disty = __view_get(e__VW.YView, 0) + 160;\n}\nelse\n{\n    distx = obj_growtangle.x - 10;\n    disty = obj_growtangle.y - 10;\n}\ndist = point_distance(x, y, distx, disty);\nmove_towards_point(distx, disty, dist / flytime);\nalarm[0] = flytime;\nimage_speed = 0;\ninstance_create(x, y, obj_heartburst);\n\nenum e__VW\n{\n    XView,\n    YView,\n    WView,\n    HView,\n    Angle,\n    HBorder,\n    VBorder,\n    HSpeed,\n    VSpeed,\n    Object,\n    Visible,\n    XPort,\n    YPort,\n    WPort,\n    HPort,\n    Camera,\n    SurfaceID\n}\n",
   "Draw_0": "draw_self();\n",
   "Step_0": "image_alpha += 0.334;\n"
  }
 },
 "obj_battle_cleanup": {
  "metadata": {
   "index": 58,
   "name": "obj_battle_cleanup",
   "parent": null,
   "sprite": null,
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": false
  },
  "sources": {
   "Alarm_0": "if (sprite_exists(custom_box_sprite))\n{\n    sprite_delete(custom_box_sprite);\n}\nif (instance_exists(self))\n{\n    instance_destroy();\n}\n",
   "Create_0": "custom_box_sprite = 0;\nalarm[0] = 30;\n",
   "Step_0": "if (!instance_exists(obj_afterimage))\n{\n    if (sprite_exists(custom_box_sprite))\n    {\n        sprite_delete(custom_box_sprite);\n    }\n    if (instance_exists(self))\n    {\n        instance_destroy();\n    }\n}\n"
  }
 },
 "obj_spamtonshot": {
  "metadata": {
   "index": 598,
   "name": "obj_spamtonshot",
   "parent": "obj_basicbullet_sneo",
   "sprite": "spr_sneo_bullet1",
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Create_0": "if (instance_exists(obj_sneo_heartattack) && obj_sneo_heartattack.heart_health < 1)\n{\n    instance_destroy();\n    exit;\n}\nscr_bullet_init();\nelement = 6;\nf = 2;\ncon = 0;\nmode = 1;\ndontexplode = 0;\ndestroyable = 0;\nimage_xscale = 1;\nimage_yscale = 1;\nsiner = 0;\nfluffyguarddestroysthis = 0;\ntargetx = camerax() + (camerawidth() / 2);\ntargety = cameray() + (cameraheight() / 4);\nif (instance_exists(obj_heart))\n{\n    targetx = obj_heart.x;\n    targety = obj_heart.y;\n}\nmove_towards_point(targetx, targety, 5);\nangle_speed = 0;\ngrazepoints = 4;\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\n",
   "Step_0": "if (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\nif (global.turntimer < 1)\n{\n    instance_destroy();\n}\ndontexplode = 1;\nif (instance_exists(obj_heart))\n{\n    if (y > (cameray() + 280))\n    {\n        depth = obj_heart.depth + 100;\n    }\n    else\n    {\n        depth = obj_heart.depth + 2;\n    }\n}\nelse if (instance_exists(obj_sneo_lilguy))\n{\n    depth = obj_sneo_lilguy.depth - 1;\n}\nelse\n{\n    depth = obj_heart.depth + 2;\n}\nif (con == 0)\n{\n    siner += (1 * f);\n    image_xscale = 0.5 + (sin(siner / 4) * 0.1 * f);\n    image_yscale = 0.5 + (sin(siner / 4) * 0.1 * f);\n    if (siner >= 30 && dontexplode == 0)\n    {\n        con = 1;\n    }\n}\nif (con == 1)\n{\n    image_xscale -= (0.05 * f);\n    image_yscale -= (0.05 * f);\n    if (image_xscale <= 0 && image_yscale <= 0)\n    {\n        uniformangleoff = random(360);\n        uniformanglespeed = -1 + random(2);\n        shotamount = 20;\n        off = 0;\n        for (i = 0; i < shotamount; i += 1)\n        {\n            shot[i] = instance_create(x, y, obj_basicbullet_sneo);\n            if (off == 0)\n            {\n                shot[i].destroyable = 1;\n                shot[i].image_blend = c_yellow;\n                off = 1;\n            }\n            else\n            {\n                off = 0;\n            }\n            shot[i].speed = 1 * f;\n            shot[i].friction = -0.05 * f;\n            if (mode == 1)\n            {\n                shot[i].angle_speed = uniformanglespeed;\n            }\n            if (mode == 5)\n            {\n                shot[i].angle_speed = -2 + random(4);\n            }\n            shot[i].image_xscale = 1.5;\n            shot[i].image_yscale = 1.5;\n            shot[i].sprite_index = spr_sneo_bullet_arrow;\n        }\n        instance_destroy();\n    }\n}\n"
  }
 },
 "obj_lerppitch": {
  "metadata": {
   "index": 933,
   "name": "obj_lerppitch",
   "parent": null,
   "sprite": null,
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Create_0": "sndtarget = -1;\ntargetpitch = 1;\nframes = 0;\nmaxframes = 10;\n",
   "Other_10": "initpitch = audio_sound_get_pitch(sndtarget);\n",
   "Step_0": "frames++;\nvar newpitch = lerp(initpitch, targetpitch, frames / maxframes);\nsnd_pitch(sndtarget, newpitch);\nif (frames >= maxframes)\n{\n    instance_destroy();\n}\n"
  }
 },
 "obj_fadein": {
  "metadata": {
   "index": 194,
   "name": "obj_fadein",
   "parent": null,
   "sprite": "spr_pixel_white",
   "mask": null,
   "solid": false,
   "depth": -99999,
   "visible": true
  },
  "sources": {
   "Create_0": "image_blend = c_black;\nfadespeed = -0.08;\nimage_alpha = 1;\nlength = 10 + (room_width / 4);\nheight = 10 + (room_height / 4);\nx = -20;\ny = -20;\n",
   "Draw_0": "image_alpha += fadespeed;\ndraw_sprite_ext(sprite_index, image_index, x, y, length, height, 0, image_blend, image_alpha);\nif (image_alpha <= 0)\n{\n    instance_destroy();\n}\n",
   "Other_5": "instance_destroy();\n"
  }
 },
 "obj_battleblcon": {
  "metadata": {
   "index": 875,
   "name": "obj_battleblcon",
   "parent": null,
   "sprite": "spr_battleblcon",
   "mask": null,
   "solid": false,
   "depth": 0,
   "visible": true
  },
  "sources": {
   "Create_0": "mywriter = instance_create(x + 5, y + 5, obj_writer);\nmywriter.depth = 9999999;\nauto_length = 0;\nside = 1;\nxoffset = 0;\ninit = 0;\nreformatted = 0;\nremx = x;\nremy = y;\nremmsgno = -1;\ninitwritingx = -1;\ninitwritingy = -1;\n",
   "Draw_0": "if (i_ex(mywriter))\n{\n    mywriter.depth = depth - 5;\n    if (remmsgno != obj_writer.msgno)\n    {\n        reformatted = 0;\n    }\n    if (auto_length == 0)\n    {\n        init = 1;\n        reformatted = 1;\n    }\n    if (reformatted == 0)\n    {\n        if (mywriter.formatted == 1)\n        {\n            if (init == 0)\n            {\n                initwritingx = mywriter.writingx;\n                initwritingy = mywriter.writingy;\n                init = 1;\n            }\n            writingx = mywriter.writingx;\n            writingy = mywriter.writingy;\n            stringmax = mywriter.stringmax;\n            hspace = mywriter.hspace;\n            vspace = mywriter.vspace;\n            linecount = mywriter.linecount;\n            balloonwidth = (stringmax * hspace) + 10;\n            balloonheight = ((linecount + 1) * vspace) + 5;\n            if (global.lang == \"ja\")\n            {\n                var checkstring = mywriter.mystring;\n                var spacing = mywriter.hspace;\n                var stringlength = string_length(checkstring);\n                var newmaxlength = 0;\n                var currentlength = 0;\n                for (var ii = 1; ii < (stringlength + 1); ii += 1)\n                {\n                    var mychar = string_char_at(checkstring, ii);\n                    if (mychar == \"&\" || mychar == \"\\n\")\n                    {\n                        currentlength = 0;\n                    }\n                    else if (mychar == \"^\" || mychar == \"*\")\n                    {\n                        ii++;\n                    }\n                    else if (mychar == \"\\\\\")\n                    {\n                        ii += 2;\n                    }\n                    else if (mychar == \"/\" || mychar == \"%\")\n                    {\n                    }\n                    else if (ord(mychar) < 256 || (ord(mychar) >= 65377 && ord(mychar) <= 65439))\n                    {\n                        currentlength += (spacing * 0.5);\n                    }\n                    else\n                    {\n                        currentlength += spacing;\n                    }\n                    if (currentlength >= newmaxlength)\n                    {\n                        newmaxlength = currentlength;\n                    }\n                }\n                balloonwidth = newmaxlength + 10;\n            }\n            if (side == 1)\n            {\n                mywriter.writingx = initwritingx - (balloonwidth + 20);\n                mywriter.writingy = initwritingy - (balloonheight / 2);\n                writingx = initwritingx - (balloonwidth + 20);\n                writingy = initwritingy - (balloonheight / 2);\n            }\n            if (side == -1)\n            {\n                xoffset = 20;\n                mywriter.writingx = initwritingx;\n                mywriter.writingy = initwritingy - (balloonheight / 2);\n                writingx = initwritingx;\n                writingy = initwritingy - (balloonheight / 2);\n            }\n        }\n    }\n    if (auto_length == 0)\n    {\n        draw_self();\n    }\n    if (auto_length == 1 && init == 1)\n    {\n        blconscale = 1;\n        if (balloonheight < 40)\n        {\n            blconscale = 0.5;\n        }\n        if (side == 1)\n        {\n            draw_sprite_ext(spr_battleblcon_parts, 4, x, y, 1, blconscale, 0, c_white, 1);\n        }\n        if (side == -1)\n        {\n            draw_sprite_ext(spr_battleblcon_parts, 4, x - xoffset, y, -1, blconscale, 0, c_white, 1);\n        }\n        draw_set_color(c_white);\n        draw_rectangle(writingx - 10, writingy - 5, writingx + balloonwidth, (writingy + balloonheight) - 5, false);\n        draw_rectangle(writingx - 5, writingy - 10, (writingx + balloonwidth) - 5, writingy + balloonheight, false);\n    }\n    remmsgno = mywriter.msgno;\n}\n",
   "Other_10": "exit;\n",
   "Step_0": "if (i_ex(mywriter) == false)\n{\n    instance_destroy();\n}\n"
  }
 }
};
export const neoWriterSmallFaceSource="if (nextchar == \"f\" && faced == 0)\n        {\n            fam = 0;\n            fam = real(nextchar2);\n            if (!i_ex(global.sminstance[fam]))\n            {\n                global.sminstance[fam] = instance_create(global.smxx[fam], global.smyy[fam], obj_smallface);\n                smallface = global.sminstance[fam];\n                if (i_ex(smallface))\n                {\n                    smallface.x += x;\n                    smallface.y += y;\n                    smallface.speed = global.smspeed[fam];\n                    smallface.direction = global.smdir[fam];\n                    smallface.type = global.smtype[fam];\n                    smallface.sprite_index = global.smsprite[fam];\n                    smallface.image_speed = global.smimagespeed[fam];\n                    smallface.image_index = global.smimage[fam];\n                    smallface.alarm[0] = global.smalarm[fam];\n                    smallface.mystring = global.smstring[fam];\n                    smallface.mycolor = global.smcolor[fam];\n                    smallface.writergod = id;\n                }\n            }\n        }";
export const neoResourceMetadata:readonly NeoSourceMetadata[]=[
 {
  "name": "obj_sneo_friedpipis",
  "index": 0,
  "parent": null,
  "sprite": "spr_pipis_egg",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_bullet_cone",
  "index": 1,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_crew",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_smoke",
  "index": 4,
  "parent": null,
  "sprite": "spr_sneo_smoke",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_growtangle_spark",
  "index": 8,
  "parent": "obj_regularbullet",
  "sprite": "spr_growtangle_elecbullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_mettaton_bomb_hitbox",
  "index": 9,
  "parent": "obj_regularbullet",
  "sprite": "spr_hitbox_10px_center",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_fountainkris_ch2_sideb",
  "index": 21,
  "parent": null,
  "sprite": "spr_krisu_bright",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_rotatingwall_pipis",
  "index": 23,
  "parent": "obj_collidebullet",
  "sprite": "spr_pipis_egg",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_event_manager",
  "index": 24,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_sneo_staticwall_new",
  "index": 37,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_mail",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_rotatingwall_bomb",
  "index": 38,
  "parent": "obj_collidebullet",
  "sprite": "spr_mettaton_bomb1",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_wallbullet_new",
  "index": 40,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_crew",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_final_forme_mouth_back",
  "index": 41,
  "parent": null,
  "sprite": "spr_sneo_final_forme",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_pipis_bomb",
  "index": 46,
  "parent": "obj_collidebullet",
  "sprite": "spr_mettaton_bomb1",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_wall_controller_new",
  "index": 54,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_battle_cleanup",
  "index": 58,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_choicer_neo",
  "index": 61,
  "parent": null,
  "sprite": "spr_alphysdesk",
  "mask": null,
  "depth": -600,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_face_parent",
  "index": 62,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 10,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_face",
  "index": 63,
  "parent": "obj_face_parent",
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_smallface",
  "index": 64,
  "parent": null,
  "sprite": "spr_smallface_s0",
  "mask": null,
  "depth": -5,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_dialoguer",
  "index": 65,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 2,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_writer",
  "index": 66,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_mainchara",
  "index": 84,
  "parent": null,
  "sprite": "spr_krisd",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_marker",
  "index": 131,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_interactable",
  "index": 133,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_readable_room1",
  "index": 136,
  "parent": "obj_interactable",
  "sprite": "spr_interactable",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_astream",
  "index": 186,
  "parent": null,
  "sprite": "spr_heart",
  "mask": null,
  "depth": -200,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_fadeout",
  "index": 193,
  "parent": null,
  "sprite": "spr_pixel_white",
  "mask": null,
  "depth": -99999,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_fadein",
  "index": 194,
  "parent": null,
  "sprite": "spr_pixel_white",
  "mask": null,
  "depth": -99999,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_shake",
  "index": 196,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_afterimage_cut",
  "index": 211,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_heart_laser",
  "index": 245,
  "parent": null,
  "sprite": "spr_sneo_bullet1",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_encounterbasic",
  "index": 278,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_caterpillarchara",
  "index": 279,
  "parent": null,
  "sprite": "spr_susied_party",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_afterimage",
  "index": 355,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_afterimage_grow",
  "index": 356,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_attackpress",
  "index": 358,
  "parent": null,
  "sprite": "spr_pressfront",
  "mask": null,
  "depth": 1,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_basicattack",
  "index": 359,
  "parent": null,
  "sprite": "spr_attack_cut1",
  "mask": null,
  "depth": -100,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_battlecontroller",
  "index": 360,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 5,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_battlesolid",
  "index": 361,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_burstbolt",
  "index": 362,
  "parent": null,
  "sprite": "spr_attackspot",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_bulletparent",
  "index": 363,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_collidebullet",
  "index": 364,
  "parent": "obj_bulletparent",
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_darkener",
  "index": 366,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 200,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_grazebox",
  "index": 367,
  "parent": null,
  "sprite": "spr_grazeappear",
  "mask": "spr_grazemask",
  "depth": 2,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_heartburst",
  "index": 370,
  "parent": null,
  "sprite": "spr_heartoutline",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_heartmarker",
  "index": 371,
  "parent": null,
  "sprite": "spr_diamondbullet_form",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_regularbullet",
  "index": 372,
  "parent": "obj_collidebullet",
  "sprite": null,
  "mask": null,
  "depth": -10,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_lancerbike",
  "index": 373,
  "parent": "obj_regularbullet",
  "sprite": "spr_lancerbike",
  "mask": null,
  "depth": -20,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_heroparent",
  "index": 374,
  "parent": null,
  "sprite": "spr_krisb_idle",
  "mask": null,
  "depth": 100,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_herokris",
  "index": 375,
  "parent": "obj_heroparent",
  "sprite": "spr_krisplace",
  "mask": null,
  "depth": 100,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_herosusie",
  "index": 376,
  "parent": "obj_heroparent",
  "sprite": "spr_krisplace",
  "mask": null,
  "depth": 100,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_heroralsei",
  "index": 377,
  "parent": "obj_heroparent",
  "sprite": "spr_krisplace",
  "mask": null,
  "depth": 100,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_heronoelle",
  "index": 378,
  "parent": "obj_heroparent",
  "sprite": "spr_krisplace",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_initializer",
  "index": 379,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_moveheart",
  "index": 382,
  "parent": null,
  "sprite": "spr_dodgeheart",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_returnheart",
  "index": 383,
  "parent": null,
  "sprite": "spr_dodgeheart",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_tensionbar",
  "index": 384,
  "parent": null,
  "sprite": "spr_tensionbar",
  "mask": null,
  "depth": 1,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pacifyspell",
  "index": 386,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_bulletgenparent",
  "index": 393,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_dbulletcontroller",
  "index": 394,
  "parent": "obj_bulletgenparent",
  "sprite": "spr_grazemask",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_monsterparent",
  "index": 396,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 90,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_checkers_enemy",
  "index": 403,
  "parent": "obj_monsterparent",
  "sprite": null,
  "mask": null,
  "depth": 90,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_checker_animtest",
  "index": 404,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_throwtarget",
  "index": 405,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 4,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_ralseithrown",
  "index": 406,
  "parent": null,
  "sprite": "spr_ralsei_thrown",
  "mask": null,
  "depth": 1,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_throwralsei",
  "index": 407,
  "parent": null,
  "sprite": "spr_susieb_throwralseiready",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_checkers_leap",
  "index": 408,
  "parent": "obj_collidebullet",
  "sprite": null,
  "mask": null,
  "depth": 1,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_clubsenemy",
  "index": 410,
  "parent": "obj_monsterparent",
  "sprite": "spr_clubs_idle",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_clubsbullet_dark",
  "index": 411,
  "parent": "obj_bulletparent",
  "sprite": "spr_clubsbullet_dark",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_clubsbullet",
  "index": 412,
  "parent": "obj_bulletparent",
  "sprite": "spr_clubsbullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_werewire_bullet_lasersquare",
  "index": 478,
  "parent": "obj_regularbullet",
  "sprite": "spr_bullet_laser_square",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_werewire_bullet_lasercircle",
  "index": 479,
  "parent": "obj_regularbullet",
  "sprite": "spr_bullet_laser_circle",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "o_coaster_hero_back",
  "index": 504,
  "parent": null,
  "sprite": "spr_coaster_back",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "o_coastersmoke",
  "index": 505,
  "parent": null,
  "sprite": "spr_coaster_explosion",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_growtangle_electric_pushin",
  "index": 534,
  "parent": null,
  "sprite": "spr_battlebg_0",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_queen_laser",
  "index": 561,
  "parent": "obj_collidebullet",
  "sprite": "spr_lasergun_laser",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_wreckpausespew",
  "index": 565,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_queen_enemy",
  "index": 578,
  "parent": "obj_monsterparent",
  "sprite": "spr_queen_chair_1_old",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_queen_bulletcontroller",
  "index": 579,
  "parent": "obj_bulletgenparent",
  "sprite": "spr_cutscene_13_queen_hand",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_spamton_cherub",
  "index": 595,
  "parent": null,
  "sprite": "spr_spamton_cherub",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_yheart_shot",
  "index": 596,
  "parent": null,
  "sprite": "spr_yheart_shot",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_basicbullet_sneo",
  "index": 597,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_bullet0",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_spamtonshot",
  "index": 598,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_bullet1",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_basicbullet_sneo_finale",
  "index": 599,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_bullet0",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonebullet",
  "index": 600,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_phonebullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_hitdetector",
  "index": 601,
  "parent": null,
  "sprite": "spr_sneo_head_sad",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_yshot_anim",
  "index": 602,
  "parent": null,
  "sprite": "spr_yheart_shot_hit",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_guymaker",
  "index": 603,
  "parent": "obj_bulletparent",
  "sprite": "spr_sneo_bullet_crew",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_sneo_lilguy",
  "index": 607,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_crew",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_crew_dissolve",
  "index": 608,
  "parent": "obj_bulletparent",
  "sprite": "spr_sneo_crew_dissolve",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_yheart_shot_afterimage",
  "index": 609,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_yheart_sneo_particle",
  "index": 610,
  "parent": null,
  "sprite": "spr_yheart_charge",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_supercharge_end",
  "index": 611,
  "parent": null,
  "sprite": "spr_supercharge_end",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_warped_box",
  "index": 612,
  "parent": "obj_bulletparent",
  "sprite": "spr_battlebg_0",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_heartattack",
  "index": 613,
  "parent": null,
  "sprite": "spr_sneo_heart",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_heatattack_bullet",
  "index": 615,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_neo_heart_bullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_lilguy_bullet",
  "index": 623,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_crew_bullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_crusher",
  "index": 624,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_pillar_head_top",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_wallbullet",
  "index": 625,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_mail",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_staticwall",
  "index": 626,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_mail",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_orb_shot",
  "index": 627,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_neobuster",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_elevator_electric_ball",
  "index": 628,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_electric_orb_idle",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonecall",
  "index": 629,
  "parent": "obj_bulletparent",
  "sprite": "spr_sneo_phone",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_wall",
  "index": 630,
  "parent": null,
  "sprite": "spr_pipis_wall",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_egg_bullet",
  "index": 631,
  "parent": "obj_collidebullet",
  "sprite": "spr_pipis_egg",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_bullet",
  "index": 632,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_crew",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_laser_bullet",
  "index": 633,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_neo_heart_bullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_faceattack",
  "index": 634,
  "parent": "obj_basicbullet_sneo",
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_tiny_susie_axe",
  "index": 635,
  "parent": null,
  "sprite": "spr_rudebuster_sneo_act",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_heart",
  "index": 636,
  "parent": null,
  "sprite": "spr_dodgeheart",
  "mask": "spr_dodgeheartmask",
  "depth": 1,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_biglaser",
  "index": 637,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_laser",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_bigshot",
  "index": 638,
  "parent": "obj_collidebullet",
  "sprite": "spr_sneo_bigshot_s",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_tiny_ralsei",
  "index": 639,
  "parent": null,
  "sprite": "spr_fluffy_guard_new",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_sneo_wireheart",
  "index": 640,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_wireheart",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_heart_bomb_explode",
  "index": 641,
  "parent": null,
  "sprite": "spr_sneo_wireheart_bomb",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_final_orb",
  "index": 642,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_neobuster",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_final_forme",
  "index": 643,
  "parent": "obj_basicbullet_sneo_finale",
  "sprite": "spr_sneo_final_forme",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_final_forme_hitbox",
  "index": 644,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_final_forme_hitbox",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_sneo_dollar",
  "index": 645,
  "parent": "obj_regularbullet",
  "sprite": "spr_spamton_dollar",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_fakeheart",
  "index": 646,
  "parent": "obj_bulletparent",
  "sprite": "spr_yellowheart",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_finale_bullet",
  "index": 647,
  "parent": "obj_basicbullet_sneo_finale",
  "sprite": "spr_sneo_crew_bullet",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_lastattack",
  "index": 648,
  "parent": null,
  "sprite": "spr_sneo_lastattack_head",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_lastattack_hitbox",
  "index": 649,
  "parent": null,
  "sprite": "spr_whitepx_10",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_finale_growtangle",
  "index": 652,
  "parent": "obj_bulletparent",
  "sprite": "spr_battlebg_0",
  "mask": "spr_battlebg_0",
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonehand_master",
  "index": 653,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_head_sad",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonehand_master_hurtbox",
  "index": 654,
  "parent": "obj_regularbullet",
  "sprite": "spr_hitbox_10px",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonehand",
  "index": 655,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_phonehand",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_mmx_spreadshot",
  "index": 656,
  "parent": "obj_basicbullet_sneo",
  "sprite": "spr_sneo_bullet0",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_controller",
  "index": 660,
  "parent": null,
  "sprite": "spr_sneo_arml",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_egg_bullet_piece",
  "index": 661,
  "parent": null,
  "sprite": "spr_pipis_egg_piece",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_center",
  "index": 662,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_pipis_destroy_fx",
  "index": 663,
  "parent": null,
  "sprite": "spr_boxing_crescent",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_armcannon_smoke",
  "index": 664,
  "parent": null,
  "sprite": "spr_boxing_smoke",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonecall_sneohead",
  "index": 665,
  "parent": null,
  "sprite": "spr_sneo_crew",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_phonecall_pipis_stream",
  "index": 667,
  "parent": "obj_collidebullet",
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_wall_controller",
  "index": 668,
  "parent": "obj_bulletparent",
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_arm_laser_telegraph",
  "index": 671,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_faceattack_target",
  "index": 675,
  "parent": null,
  "sprite": "spr_boxing_crescent",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_sneo_biglaser_friendlyhitbox",
  "index": 684,
  "parent": "obj_bulletparent",
  "sprite": "spr_sneo_laser_friendly",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_tiny_susie",
  "index": 689,
  "parent": null,
  "sprite": "spr_tiny_susie_sneo",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_sneo_throwkris",
  "index": 690,
  "parent": null,
  "sprite": "spr_susieb_throwkrisready",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_throwtarget",
  "index": 691,
  "parent": null,
  "sprite": "spr_sneo_c_weakpoint_growth",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_kristhrown",
  "index": 692,
  "parent": null,
  "sprite": "spr_krisb_throw",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_vine_cut",
  "index": 693,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_vine_transition",
  "index": 694,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_vine_weak",
  "index": 695,
  "parent": null,
  "sprite": "spr_attack_cut1",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_throwkris_vine_controller",
  "index": 696,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_susie_act",
  "index": 697,
  "parent": null,
  "sprite": "spr_dodgeheart_centered_white",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "o_coaster_controller_sneo",
  "index": 698,
  "parent": null,
  "sprite": "spr_coaster_explosion",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "o_coaster_hero_sneo",
  "index": 699,
  "parent": null,
  "sprite": "spr_sneo_car_front",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "o_coaster_hero_back_sneo",
  "index": 701,
  "parent": null,
  "sprite": "spr_sneo_car_back",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_spamton_neo_enemy",
  "index": 702,
  "parent": "obj_monsterparent",
  "sprite": "spr_sneo_example",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_sneo_bulletcontroller",
  "index": 703,
  "parent": "obj_bulletgenparent",
  "sprite": "spr_sneo_c_weakpoint_hit",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_rouxls_power_up_orb",
  "index": 758,
  "parent": null,
  "sprite": "spr_bullet_laser_circle",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_mauswheel_enemy",
  "index": 766,
  "parent": "obj_monsterparent",
  "sprite": "spr_nothing",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "o_boxingcontroller",
  "index": 782,
  "parent": null,
  "sprite": "spr_bhero",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_boxing_crescent",
  "index": 837,
  "parent": null,
  "sprite": "spr_boxing_crescent",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_gigaqueen_enemy",
  "index": 845,
  "parent": "obj_monsterparent",
  "sprite": "spr_cutscene_27_queen_giga_surprise",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_dbullet_vert",
  "index": 858,
  "parent": "obj_collidebullet",
  "sprite": "spr_diamondbullet_vert",
  "mask": null,
  "depth": -1,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_defeatanim",
  "index": 860,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_healanim",
  "index": 863,
  "parent": null,
  "sprite": "spr_sparestar_anim",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_oflash",
  "index": 864,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_rudebuster_anim",
  "index": 865,
  "parent": null,
  "sprite": "spr_susie_rudebuster",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_rudebuster_bolt",
  "index": 866,
  "parent": null,
  "sprite": "spr_rudebuster_beam",
  "mask": null,
  "depth": -10,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_hypnofx",
  "index": 867,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_spareanim",
  "index": 868,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_battleback",
  "index": 873,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 10000,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_spellphase",
  "index": 874,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_battleblcon",
  "index": 875,
  "parent": null,
  "sprite": "spr_battleblcon",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_growtangle",
  "index": 877,
  "parent": "obj_battlesolid",
  "sprite": "spr_battlebg_0",
  "mask": "spr_battlebg_0",
  "depth": 5,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_dmgwriter",
  "index": 878,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_actor",
  "index": 898,
  "parent": null,
  "sprite": "spr_susied_party",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_cutscene_master",
  "index": 903,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_animator",
  "index": 926,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_move_to_point",
  "index": 928,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_lerpvar",
  "index": 929,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_script_delayed",
  "index": 932,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_lerppitch",
  "index": 933,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_ch2_sceneex2",
  "index": 1004,
  "parent": null,
  "sprite": "spr_event",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_ch2_sceneex2_special",
  "index": 1005,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_doom",
  "index": 1101,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_gamecontroller",
  "index": 1117,
  "parent": null,
  "sprite": null,
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_coaster",
  "index": 1126,
  "parent": null,
  "sprite": "spr_kris_coaster_hurt_front",
  "mask": null,
  "depth": 0,
  "visible": true,
  "solid": false
 },
 {
  "name": "obj_camera_advanced",
  "index": 1163,
  "parent": null,
  "sprite": "spr_thrashweapon_duck1",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 },
 {
  "name": "obj_camera_area",
  "index": 1165,
  "parent": null,
  "sprite": "spr_swordarea",
  "mask": null,
  "depth": 0,
  "visible": false,
  "solid": false
 }
];
