// Oracle-only observer: choose legal dance commands; never writes battle, enemy or timer state.
// Keys are injected before the original controller consumes input, and logged after Sweet's original Step.
if (global.ur_oracle_band_policy && instance_exists(obj_sweet_enemy)) {
    global.ur_band_frame += 1;
    var band_key = -1;
    if (global.ur_band_frame mod 8 == 0) {
        band_key = 90;
        if (global.myfight == 0 && global.mnfight == 0) {
            var band_turn = global.charturn;
            var band_menu = global.bmenuno;
            var band_learned = obj_sweet_enemy.learnedAct;
            if (band_menu == 0) {
                var band_command = (band_turn == 0 || band_learned) ? 1 : 4;
                if (global.bmenucoord[0][band_turn] != band_command) band_key = 39;
            }
            if (band_menu == 11 || band_menu == 13) {
                var band_target = band_learned ? band_turn : 0;
                if (global.bmenucoord[band_menu][band_turn] != band_target) band_key = 40;
            }
            if (band_menu == 9 && global.bmenucoord[9][band_turn] != 1) band_key = 39;
            if (band_menu == 2 && global.bmenucoord[2][band_turn] != 0) band_key = 38;
        }
    }
    global.ur_band_released = -1;
    if (global.ur_band_held != -1 && global.ur_band_held != band_key) {
        keyboard_key_release(global.ur_band_held);
        global.ur_band_released = global.ur_band_held;
    }
    if (band_key != -1) keyboard_key_press(band_key);
    global.ur_band_held = band_key;
    global.ur_band_pressed = band_key;
}
