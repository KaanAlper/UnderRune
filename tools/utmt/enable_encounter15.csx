using System;
using System.IO;
using System.Linq;
using UndertaleModLib.Compiler;
using UndertaleModLib.Models;

EnsureDataLoaded();

Console.WriteLine("==================================================");
Console.WriteLine("Applying Encounter 15 (Clover & Hathy) patch...");
Console.WriteLine("==================================================");

// 1. Update Clover Puzzle Event (Encounter 8 -> Encounter 15)
// In the Field, solving the puzzle triggers Encounter 15 (Clover & Hathy) instead of solo Clover.
string cloverGml = @"
if (pcon == 0 && global.interact == 0)
{
    if (puzzle.suit[0] == 4 && puzzle.suit[1] == 1 && puzzle.suit[2] == 2 && global.flag[234] == 0)
    {
        with (blockn)
        {
            instance_destroy();
        }
        global.flag[234] = 1;
        global.interact = 1;
        pcon = 1;
        with (spiken[0])
        {
            image_index = 1;
        }
        with (spiken[1])
        {
            image_index = 1;
        }
    }
}
if (pcon == 1)
{
    ptimer = 0;
    snd_play(snd_screenshake);
    instance_create(0, 0, obj_shake);
    pcon = 2;
}
if (pcon == 2)
{
    ptimer += 1;
    if (ptimer >= 20)
    {
        ptimer = 0;
        pcon = 0;
        global.interact = 0;
    }
}
if (con == 0 && global.interact == 0)
{
    if (obj_mainchara.y <= 80)
    {
        global.facing = 0;
        with (global.cinstance[0])
        {
            fun = 1;
            sprite_index = dsprite;
        }
        global.interact = 1;
        con = 1;
        alarm[4] = 22;
        cmarker = scr_dark_marker(x, y, spr_clubs_idle);
        with (cmarker)
        {
            depth = 960000;
        }
        with (cmarker)
        {
            vspeed = -8;
        }
    }
}
if (con == 1)
{
    if (cmarker.y <= 280)
    {
        with (cmarker)
        {
            scr_depth();
        }
    }
}
if (con == 2)
{
    with (cmarker)
    {
        scr_halt();
    }
    global.typer = 6;
    global.fc = 0;
    global.msg[0] = scr_84_get_lang_string(""obj_cloverpuzzle_event_slash_Step_0_gml_78_0"");
    global.msg[1] = scr_84_get_lang_string(""obj_cloverpuzzle_event_slash_Step_0_gml_79_0"");
    global.msg[2] = scr_84_get_lang_string(""obj_cloverpuzzle_event_slash_Step_0_gml_80_0"");
    if (global.flag[236] == 1)
    {
        global.msg[0] = scr_84_get_lang_string(""obj_cloverpuzzle_event_slash_Step_0_gml_85_0"");
        global.msg[1] = scr_84_get_lang_string(""obj_cloverpuzzle_event_slash_Step_0_gml_86_0"");
    }
    con = 3;
    instance_create(0, 0, obj_dialoguer);
}
if (con == 3 && !d_ex())
{
    with (global.cinstance[0])
    {
        fun = 0;
    }
    if (global.plot < 75)
    {
        global.plot = 75;
    }
    with (obj_cloverhole)
    {
        sprite_index = spr_cloverhole;
        holecon = 999;
        image_index = 0;
    }
    cencounter = instance_create(cmarker.x, cmarker.y, obj_chaseenemy);
    with (cmarker)
    {
        instance_destroy();
    }
    with (cencounter)
    {
        global.interact = 0;
        myencounter = 15;
        sprite_index = spr_clubs_idle;
        touchsprite = spr_clubs_idle;
        event_user(0);
    }
    con = 4;
}
";

// 2. Add F6 battle shortcut into persistent obj_time
string timeGml = @"
if (!paused)
{
    global.time += 1;
    if (global.is_console && os_is_paused())
    {
        paused = true;
        if (!sprite_exists(screenshot))
        {
            var sw = surface_get_width(application_surface);
            var sh = surface_get_height(application_surface);
            screenshot = sprite_create_from_surface(application_surface, 0, 0, sw, sh, 0, 0, 0, 0);
        }
        exit;
    }
}
else
{
    exit;
}
if (keyboard_check(vk_escape))
{
    if (quit_timer < 0)
    {
        quit_timer = 0;
    }
    quit_timer += 1;
    if (quit_timer >= 30)
    {
        ossafe_game_end();
    }
}
else
{
    quit_timer -= 2;
}
if (keyboard_check_pressed(vk_f4))
{
    fullscreen_toggle = 1;
}
if (fullscreen_toggle == 1)
{
    fullscreen_toggle = 0;
    if (window_get_fullscreen())
    {
        window_set_fullscreen(false);
        ossafe_ini_open(""true_config.ini"");
        ini_write_real(""SCREEN"", ""FULLSCREEN"", 0);
        ossafe_ini_close();
        ossafe_savedata_save();
    }
    else
    {
        window_set_fullscreen(true);
        ossafe_ini_open(""true_config.ini"");
        ini_write_real(""SCREEN"", ""FULLSCREEN"", 1);
        ossafe_ini_close();
        ossafe_savedata_save();
    }
}
if (window_center_toggle == 2)
{
    window_center();
    window_center_toggle = 0;
}
if (window_center_toggle == 1)
{
    window_center_toggle = 2;
}
for (i = 0; i < 10; i += 1)
{
    global.input_released[i] = 0;
    global.input_pressed[i] = 0;
}
if (obj_gamecontroller.gamepad_active == 1)
{
    for (var j = 0; j < 4; j++)
    {
        if (keyboard_check(global.input_k[j]) || gamepad_button_check(obj_gamecontroller.gamepad_id, global.input_g[j]) || scr_gamepad_axis_check(obj_gamecontroller.gamepad_id, j))
        {
            if (global.input_held[j] == 0)
            {
                global.input_pressed[j] = 1;
            }
            global.input_held[j] = 1;
        }
        else
        {
            if (global.input_held[j] == 1)
            {
                global.input_released[j] = 1;
            }
            global.input_held[j] = 0;
        }
    }
    for (var k = 4; k < 10; k++)
    {
        if (keyboard_check(global.input_k[k]) || gamepad_button_check(obj_gamecontroller.gamepad_id, global.input_g[k]))
        {
            if (global.input_held[k] == 0)
            {
                global.input_pressed[k] = 1;
            }
            global.input_held[k] = 1;
        }
        else
        {
            if (global.input_held[k] == 1)
            {
                global.input_released[k] = 1;
            }
            global.input_held[k] = 0;
        }
    }
}
else
{
    for (var l = 0; l < 10; l++)
    {
        if (keyboard_check(global.input_k[l]))
        {
            if (global.input_held[l] == 0)
            {
                global.input_pressed[l] = 1;
            }
            global.input_held[l] = 1;
        }
        else
        {
            if (global.input_held[l] == 1)
            {
                global.input_released[l] = 1;
            }
            global.input_held[l] = 0;
        }
    }
}
if (border_fade_out)
{
    if (border_alpha > 0)
    {
        border_alpha -= border_fade_value;
        if (border_alpha <= 0)
        {
            border_alpha = 0;
        }
    }
}
else if (border_fade_in)
{
    if (border_alpha <= 1)
    {
        border_alpha += border_fade_value;
        if (border_alpha >= 1)
        {
            border_alpha = 1;
        }
    }
}
if (scr_debug())
{
    if (keyboard_check_pressed(192))
    {
        if (room_speed == 30)
        {
            room_speed = 200;
        }
        else
        {
            room_speed = 30;
        }
    }
    if (keyboard_check_pressed(vk_numpad3))
    {
        if (room_speed == 30)
        {
            room_speed = 5;
        }
        else
        {
            room_speed = 30;
        }
    }
}

// === ENCOUNTER 15 (CLOVER & HATHY) F6 HOTKEY ===
if (keyboard_check_pressed(vk_f6))
{
    if (!instance_exists(obj_battlecontroller))
    {
        global.darkzone = 1;
        global.encounterno = 15;
        global.specialbattle = 0;
        global.flag[9] = 1;
        global.batmusic[0] = snd_init(""battle.ogg"");
        if (global.char[0] == 0) global.char[0] = 1;
        if (global.char[1] == 0) global.char[1] = 2;
        if (global.char[2] == 0) global.char[2] = 3;
        instance_create(0, 0, obj_battleback);
        instance_create(0, 0, obj_encounterbasic);
    }
}
";

var imports = new CodeImportGroup(Data) { AutoCreateAssets = false };
imports.QueueReplace("gml_Object_obj_cloverpuzzle_event_Step_0", cloverGml);
imports.QueueReplace("gml_Object_obj_time_Step_1", timeGml);
imports.Import();

Console.WriteLine("[SUCCESS] 1. Clover Field puzzle -> Encounter 15 (Clover & Hathy).");
Console.WriteLine("[SUCCESS] 2. F6 hotkey added (Press F6 anywhere in the Dark World to trigger the battle).");
Console.WriteLine("==================================================");
