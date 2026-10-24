// Only records observations after the original Sweet Step, including its actual audio-clock sample.
// The reference VM supports open_write/close but not open_append: periodically flush a private cumulative buffer.
if (global.ur_oracle_band_policy && !global.ur_band_log_closed) {
    global.ur_band_log_text += string(global.time) + "," + string(global.ur_band_pressed) + "," + string(global.ur_band_released) + "," + string(solotimer) + "\n";
    if (global.ur_band_frame mod 20 == 0 || endcon == 5) {
        var band_log = file_text_open_write("band-policy.csv");
        file_text_write_string(band_log, global.ur_band_log_text);
        file_text_close(band_log);
    }
    if (endcon == 5) global.ur_band_log_closed = true;
}
