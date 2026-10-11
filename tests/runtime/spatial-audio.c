#define MA_NO_DEVICE_IO
#define MA_NO_RESOURCE_MANAGER
#define MA_NO_DECODING
#define MA_NO_ENCODING
#define MINIAUDIO_IMPLEMENTATION
#include "miniaudio.h"
#include "browser_audio_spatial.h"
#include <assert.h>
#include <stdio.h>

static double energyAt(float x, int channel, int model) {
    ma_engine engine;
    ma_engine_config config = ma_engine_config_init();
    config.noDevice = MA_TRUE;
    config.channels = 2;
    config.sampleRate = 48000;
    assert(ma_engine_init(&config, &engine) == MA_SUCCESS);
    browserListenerOrientation(&engine, 0, 0, 1000, 0, -1, 0);
    float wave[4800];
    for (int i=0; i<4800; ++i) wave[i] = (float)sin(i*2.0*3.141592653589793*440.0/48000.0)*0.2f;
    ma_audio_buffer buffer;
    ma_audio_buffer_config bufferConfig = ma_audio_buffer_config_init(ma_format_f32, 1, 4800, wave, NULL);
    assert(ma_audio_buffer_init(&bufferConfig, &buffer) == MA_SUCCESS);
    ma_sound sound;
    assert(ma_sound_init_from_data_source(&engine, &buffer, 0, NULL, &sound) == MA_SUCCESS);
    ma_sound_set_looping(&sound, MA_TRUE);
    ma_sound_set_spatialization_enabled(&sound, MA_TRUE);
    ma_sound_set_position(&sound, x, 0, 0);
    ma_sound_set_min_distance(&sound, 100);
    ma_sound_set_max_distance(&sound, 300);
    ma_sound_set_rolloff(&sound, 1);
    ma_sound_set_attenuation_model(&sound, browserFalloffModel(model));
    assert(ma_sound_start(&sound) == MA_SUCCESS);
    float samples[4096*2];
    assert(ma_engine_read_pcm_frames(&engine, samples, 4096, NULL) == MA_SUCCESS);
    double sum = 0;
    for (int i=512; i<4096; ++i) sum += samples[i*2+channel]*samples[i*2+channel];
    ma_sound_uninit(&sound);
    ma_audio_buffer_uninit(&buffer);
    ma_engine_uninit(&engine);
    return sum;
}
int main(void) {
    double left=energyAt(-150,0,3), leftOther=energyAt(-150,1,3);
    double right=energyAt(150,1,3), rightOther=energyAt(150,0,3);
    printf("left=%f other=%f right=%f other=%f\n",left,leftOther,right,rightOther);
    assert(left>leftOther*5 && right>rightOther*5);
    double near=energyAt(100,1,3), far=energyAt(250,1,3);
    assert(far>0 && far<near*0.2);
    puts("SPATIAL_AUDIO_PASS: source attack orientation pans correctly; linear falloff attenuates with distance");
    return 0;
}
