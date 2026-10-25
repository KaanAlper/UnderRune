// Diagnostic only: one documented low-HP fixture, followed exclusively by legal menu keys.
if (global.ur_oracle_neo_ending && instance_exists(obj_spamton_neo_enemy)) {
    if (!global.ur_neo_preset) {
        global.monsterhp[0] = 400;
        global.ur_neo_preset = true;
    }
    global.ur_neo_frame += 1;
    var neo_key = -1;
    if (global.ur_neo_frame mod 8 == 0) {
        neo_key = 90;
        if (global.myfight == 0 && global.mnfight == 0) {
            if (global.bmenuno == 0 && global.bmenucoord[0][global.charturn] != 1) neo_key = 39;
            if (global.bmenuno == 9 && global.bmenucoord[9][global.charturn] != 0) neo_key = 37;
        }
    }
    global.ur_neo_released = -1;
    if (global.ur_neo_held != -1 && global.ur_neo_held != neo_key) {
        keyboard_key_release(global.ur_neo_held);
        global.ur_neo_released = global.ur_neo_held;
    }
    if (neo_key != -1) keyboard_key_press(neo_key);
    global.ur_neo_held = neo_key;
    global.ur_neo_pressed = neo_key;
}
