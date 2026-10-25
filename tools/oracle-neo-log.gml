// Log the real keys after the original enemy Step, using the same time coordinate as the trace.
if (variable_global_exists("ur_oracle_neo_ending") && global.ur_oracle_neo_ending) {
    global.ur_neo_log += string(global.time) + "," + string(global.ur_neo_pressed) + "," + string(global.ur_neo_released) + chr(10);
    if (!global.ur_neo_log_closed && global.fighting == 0) {
        var neo_log_file = file_text_open_write("neo-policy.csv");
        file_text_write_string(neo_log_file, global.ur_neo_log);
        file_text_close(neo_log_file);
        global.ur_neo_log_closed = true;
    }
}
