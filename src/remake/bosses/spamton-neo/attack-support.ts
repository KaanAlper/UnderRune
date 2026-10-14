// Literal Chapter 2 NORMAL attack source events; source metadata and masks are retained.
import type {NeoAttackSourceRecord} from './controller';
export const attackSources:readonly NeoAttackSourceRecord[]=[
  {
    "metadata": {
      "index": 597,
      "name": "obj_basicbullet_sneo",
      "parent": "obj_collidebullet",
      "sprite": "spr_sneo_bullet0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "if (destroyable == 1)\n{\n    if (other.big == 0)\n    {\n        with (other)\n        {\n            event_user(0);\n        }\n    }\n    anim = instance_create(x, y, obj_yshot_anim);\n    anim.image_xscale = image_xscale;\n    anim.image_yscale = image_yscale;\n    with (anim)\n    {\n        sprite_index = spr_yheart_shot_hit3;\n    }\n    instance_destroy();\n}\nelse if (destroyable == -1)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\nfluffyguarddestroysthis = 1;\nf = 2;\ndestroyable = 0;\nangle_speed = 0;\ndestroypoints = 1;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\ngrazepoints = 3;\n",
      "Step_0": "if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)\n{\n    instance_destroy();\n}\ndirection += angle_speed;\nimage_angle = direction;\n"
    }
  },
  {
    "metadata": {
      "index": 599,
      "name": "obj_basicbullet_sneo_finale",
      "parent": "obj_basicbullet_sneo",
      "sprite": "spr_sneo_bullet0",
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Collision_obj_yheart_shot": "if (destroyable == 1)\n{\n    if (other.big == 0)\n    {\n        with (other)\n        {\n            event_user(0);\n        }\n    }\n    anim = instance_create(x, y, obj_yshot_anim);\n    anim.image_xscale = image_xscale;\n    anim.image_yscale = image_yscale;\n    with (anim)\n    {\n        sprite_index = spr_yheart_shot_hit3;\n    }\n    instance_destroy();\n}\nelse if (destroyable == -1)\n{\n    with (other)\n    {\n        event_user(0);\n    }\n}\n",
      "Create_0": "scr_bullet_init();\nelement = 6;\nf = 2;\ndestroyable = 0;\nangle_speed = 0;\ndestroypoints = 1;\nif (instance_exists(obj_spamton_neo_enemy))\n{\n    damage = global.monsterat[obj_spamton_neo_enemy.myself] * 5;\n}\nif (instance_exists(obj_sneo_bulletcontroller))\n{\n    target = obj_sneo_bulletcontroller.target;\n}\ngrazepoints = 4;\n",
      "Other_15": "if (active == 1)\n{\n    if (target != 3)\n    {\n        scr_damage_proportional();\n    }\n    if (target == 3)\n    {\n        scr_damage_all();\n    }\n    if (destroyonhit == 1)\n    {\n        instance_destroy();\n    }\n}\n",
      "Step_0": "if (x >= (room_width + 100) || x <= -100 || y >= (room_height + 100) || y <= -100)\n{\n    instance_destroy();\n}\ndirection += angle_speed;\nimage_angle = direction;\n"
    }
  },
  {
    "metadata": {
      "index": 929,
      "name": "obj_lerpvar",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "variable = 0;\nvarname = \"variable\";\npointa = 0;\npointb = 0;\ntime = 0;\nmaxtime = 30;\ntarget = -1;\ninit = 0;\neasetype = 0;\neaseinout = \"out\";\n",
      "Step_0": "if (i_ex(target))\n{\n    if (init == 0)\n    {\n        if (is_string(pointa))\n        {\n            pointa = variable_instance_get(target, varname);\n        }\n        init = 1;\n    }\n    time++;\n    if (easetype == 0)\n    {\n        variable_instance_set(target, varname, lerp(pointa, pointb, time / maxtime));\n    }\n    else\n    {\n        if (easeinout == \"out\")\n        {\n            variable_instance_set(target, varname, lerp_ease_out(pointa, pointb, time / maxtime, easetype));\n        }\n        if (easeinout == \"in\")\n        {\n            variable_instance_set(target, varname, lerp_ease_in(pointa, pointb, time / maxtime, easetype));\n        }\n        if (easeinout == \"inout\")\n        {\n            variable_instance_set(target, varname, lerp_ease_inout(pointa, pointb, time / maxtime, easetype));\n        }\n    }\n    if (time >= maxtime)\n    {\n        instance_destroy();\n    }\n}\nelse\n{\n    instance_destroy();\n}\n"
    }
  },
  {
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
  {
    "metadata": {
      "index": 1101,
      "name": "obj_doom",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": false
    },
    "sources": {
      "Alarm_0": "with (target)\n{\n    instance_destroy();\n}\ninstance_destroy();\n"
    }
  },
  {
    "metadata": {
      "index": 211,
      "name": "obj_afterimage_cut",
      "parent": null,
      "sprite": null,
      "mask": null,
      "solid": false,
      "depth": 0,
      "visible": true
    },
    "sources": {
      "Create_0": "faderate = 0.1;\nsiner = 0;\nsprite_index = spr_whitepx;\nimage_speed = 0;\nevent_user(0);\nflash = false;\n",
      "Draw_0": "if (flash)\n{\n    d3d_set_fog(true, c_white, 0, 1);\n    draw_self();\n    d3d_set_fog(false, c_black, 0, 0);\n    flash = false;\n    exit;\n}\nsiner++;\nvar hw = width / 2;\nvar hh = height / 2;\nvar m = lerp_ease_out(0, sprite_height / 2, (siner + 2) / 10, 1);\nimage_alpha -= faderate;\ndraw_sprite_part_ext(sprite_index, image_index, 0, 0, hw, hh, x - m - ((xo * image_xscale) / 2), y - m - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);\ndraw_sprite_part_ext(sprite_index, image_index, hw, 0, hw, hh, (x + m) - ((xo * image_xscale) / 2), y - m - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);\ndraw_sprite_part_ext(sprite_index, image_index, 0, hh, hw, hh, x - m - ((xo * image_xscale) / 2), (y + m) - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);\ndraw_sprite_part_ext(sprite_index, image_index, hw, hh, hw, hh, (x + m) - ((xo * image_xscale) / 2), (y + m) - ((yo * image_yscale) / 2), image_xscale, image_yscale, image_blend, image_alpha);\nif (image_alpha < 0)\n{\n    instance_destroy();\n}\n",
      "Other_10": "width = sprite_get_width(sprite_index);\nheight = sprite_get_width(sprite_index);\nxo = sprite_get_xoffset(sprite_index);\nyo = sprite_get_yoffset(sprite_index);\n"
    }
  }
];
