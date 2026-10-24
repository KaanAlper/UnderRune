using System;
using System.IO;
using System.Linq;
using UndertaleModLib.Compiler;
using UndertaleModLib.Models;
EnsureDataLoaded();
var root=Environment.GetEnvironmentVariable("LL_NATIVE_PROJECT");
var chapter=Int32.Parse(Environment.GetEnvironmentVariable("LL_NATIVE_CHAPTER"));
if(String.IsNullOrEmpty(root)||chapter<1||chapter>5)throw new Exception("Invalid launcher settings");
var original=File.ReadAllText(Path.Combine(root,$"extracted/chapter{chapter}_windows/code/gml_Object_obj_initializer2_Step_0.gml"));
var anchor="room_goto(roomchoice);";
if(original.Split(new[]{anchor},StringSplitOptions.None).Length!=2)throw new Exception("Startup anchor changed");
var startup=@"
global.darkzone = 1;
ini_open(""UnderRune.ini"");
global.ur_encounter = ini_read_real(""battle"", ""encounter"", 25);
global.ur_special = ini_read_real(""battle"", ""special"", 0);
global.ur_music = ini_read_string(""battle"", ""music"", ""battle.ogg"");
global.ur_room = ini_read_string(""battle"", ""room"", """");
global.char[0] = ini_read_real(""party"", ""0"", 1);
global.char[1] = ini_read_real(""party"", ""1"", 2);
global.char[2] = ini_read_real(""party"", ""2"", 3);
for (var hero = 1; hero <= HERO_MAX; hero += 1) {
global.charauto[hero] = ini_read_real(""auto"", string(hero), 0);
global.charweapon[hero] = ini_read_real(""weapon"", string(hero), global.charweapon[hero]);
global.chararmor1[hero] = ini_read_real(""armor1"", string(hero), global.chararmor1[hero]);
global.chararmor2[hero] = ini_read_real(""armor2"", string(hero), global.chararmor2[hero]);
}
for (var slot = 0; slot < 12; slot += 1) global.item[slot] = ini_read_real(""items"", string(slot), 0);
// Reference recordings only: the debug no-damage switch keeps a run going through many enemy turns.
if (ini_read_real(""oracle"", ""god"", 0) == 1) global.chemg_god_mode = 1;
ORACLE_HP
ORACLE_JEVIL_READ
ORACLE_GIGA_READ
ORACLE_BAND_READ
ORACLE_LAYER_READ
ini_close();
global.tempflag[4] = 1;
global.ur_watch = 0;
ORACLE_JEVIL_WATCH
ORACLE_GIGA_WATCH
ORACLE_LAYER_WATCH
call_later(15, 1, function() {
if (global.ur_watch == 0 && instance_exists(obj_battlecontroller)) global.ur_watch = 1;
else if (global.ur_watch == 1 && !instance_exists(obj_battlecontroller)) { global.ur_watch = 2; show_debug_message(""UNDERRUNE_OUTCOME "" + ((room == room_gameover) ? ""defeat"" : ""victory"")); }
}, true);
JEvil_BRANCH
room_goto(room_battletest);
".Replace("HERO_MAX",chapter==1?"3":"4")
// Later chapters have no debug no-damage switch: reference runs give the party enough HP instead. Damage itself is unchanged.
.Replace("ORACLE_HP",chapter==1?"":"if (ini_read_real(\"oracle\", \"god\", 0) == 1) for (var hero = 1; hero <= HERO_MAX; hero += 1) { global.maxhp[hero] = 99999; global.hp[hero] = 99999; }".Replace("HERO_MAX",chapter==1?"3":"4"))
.Replace("ORACLE_JEVIL_READ",chapter==1?"global.ur_oracle_jevil_turn = ini_read_real(\"oracle\", \"jevil_turn\", -1);":"")
.Replace("ORACLE_BAND_READ",chapter==2?"global.ur_oracle_band_policy = (global.ur_encounter == 62 && ini_read_real(\"oracle\", \"band_policy\", 0) == 1); global.ur_band_frame = 0; global.ur_band_held = -1; global.ur_band_pressed = -1; global.ur_band_released = -1; global.ur_band_log_text = \"\"; global.ur_band_log_closed = false;":"")
.Replace("ORACLE_LAYER_READ",chapter==2?"global.ur_layer_probe = ini_read_real(\"oracle\", \"layer_probe\", 0); global.ur_layer_frame = 0; global.ur_layer_log = \"\";":"")
.Replace("ORACLE_LAYER_WATCH",chapter==2?@"
// Optional read-only runtime-layer diagnostic. No battle object, input or random state is changed.
if (global.ur_layer_probe == 1) call_later(1, 1, function() {
 global.ur_layer_frame++;
 if (global.ur_layer_frame >= 2180 && global.ur_layer_frame <= 2240) {
  global.ur_layer_log += ""F,"" + string(global.ur_layer_frame) + "","" + string(global.time) + chr(10);
  with (all) global.ur_layer_log += ""I,"" + string(id) + "","" + string(object_index) + "","" + string(layer) + "","" + string(depth) + "","" + string(visible) + chr(10);
  var probe_layers = layer_get_all();
  for (var probe_i = 0; probe_i < array_length(probe_layers); probe_i++) {
   var probe_layer = probe_layers[probe_i];
   global.ur_layer_log += ""L,"" + string(probe_layer) + "","" + layer_get_name(probe_layer) + "","" + string(layer_get_depth(probe_layer)) + chr(10);
   var probe_elements = layer_get_all_elements(probe_layer);
   for (var probe_j = 0; probe_j < array_length(probe_elements); probe_j++) global.ur_layer_log += ""E,"" + string(probe_layer) + "","" + string(probe_j) + "","" + string(probe_elements[probe_j]) + "","" + string(layer_get_element_type(probe_elements[probe_j])) + "","" + string(layer_instance_get_instance(probe_elements[probe_j])) + chr(10);
  }
 }
 if (global.ur_layer_frame == 2241) { var probe_file = file_text_open_write(""layer-probe.txt""); file_text_write_string(probe_file, global.ur_layer_log); file_text_close(probe_file); }
}, true);
":"")
.Replace("ORACLE_GIGA_READ",chapter==2?"global.ur_oracle_giga_survival = (global.ur_encounter == 84 && ini_read_real(\"oracle\", \"god\", 0) == 1);":"")
.Replace("ORACLE_GIGA_WATCH",chapter==2?@"
// Recording-only survival: GIGA's enemy Create replaces the launcher's starting HP.
// Refill only current player HP; all damage, attack states and source timers still run.
if (global.ur_oracle_giga_survival) call_later(1, 1, function() {
if (instance_exists(o_boxingcontroller)) global.hp[1] = global.maxhp[1];
}, true);
":"")
.Replace("ORACLE_JEVIL_WATCH",chapter==1?@"
// Test-only initial phase preset; enemy events, damage and attack code stay unchanged.
if (global.ur_encounter == 25 && global.ur_oracle_jevil_turn >= 0 && global.ur_oracle_jevil_turn <= 19) {
call_later(1, 1, function() {
if (global.ur_oracle_jevil_turn >= 0 && instance_exists(obj_joker)) {
obj_joker.jturn = global.ur_oracle_jevil_turn;
global.ur_oracle_jevil_turn = -1;
}
}, true);
}
":"")
.Replace("JEvil_BRANCH",chapter==1?"if (global.ur_encounter == 25) { room_goto(room_cc_joker); exit; }":
 // Chapter 3 action encounters are not scr_battle fights: they run in their own original rooms.
 chapter==3?"if (global.ur_room == \"shadowmantle\") { room_goto(room_shadowmantle); exit; }\nif (global.ur_room == \"susiezilla\") { room_goto(room_dw_susiezilla); exit; }":"");
var room=Data.Rooms.First(r=>r.Name.Content=="room_battletest");
// Remove only debug-selection/automatic-trigger instances in the copied test arena.
// Preserve every original object and script definition, including those removed here.
var debugNames=new[]{"obj_battletester","obj_chaseenemy","obj_debugload"};
foreach(var instance in room.GameObjects.Where(i=>debugNames.Contains(i.ObjectDefinition.Name.Content)).ToList()){
 room.GameObjects.Remove(instance);
 room.InstanceCreationOrderIDs?.InstanceIDs?.Remove(instance.InstanceID);
 foreach(var layer in room.Layers)if(layer.Data is UndertaleRoom.Layer.LayerInstancesData instances)instances.Instances.Remove(instance);
}
room.Width=640;room.Height=480;
foreach(var view in room.Views){view.ViewX=0;view.ViewY=0;view.ViewWidth=640;view.ViewHeight=480;view.PortWidth=640;view.PortHeight=480;}
var entry=@"
if (!instance_exists(obj_mainchara)) instance_create(280, 320, obj_mainchara);
if (!instance_exists(obj_darkcontroller)) instance_create(0, 0, obj_darkcontroller);
global.encounterno = global.ur_encounter;
global.specialbattle = global.ur_special;
global.flag[9] = 1;
global.batmusic[0] = snd_init(global.ur_music);
";
entry+=chapter==1?@"
instance_create(0, 0, obj_battleback);
instance_create(0, 0, obj_encounterbasic);
":@"
global.flag[9] = 2;
scr_battle(global.ur_encounter, global.ur_special);
global.flag[9] = 1;
";
var imports=new CodeImportGroup(Data){AutoCreateAssets=false};
imports.QueueReplace("gml_Object_obj_initializer2_Step_0",original.Replace(anchor,startup));
// Optional recording policy changes only simulated keys; the original battle events run in full.
if (chapter == 2) {
 var policy=File.ReadAllText(Path.Combine(root,"tools/oracle-band-policy.gml"));
 var logger=File.ReadAllText(Path.Combine(root,"tools/oracle-band-log.gml"));
 var input=File.ReadAllText(Path.Combine(root,"extracted/chapter2_windows/code/gml_Object_obj_time_Step_1.gml"));
 var sweet=File.ReadAllText(Path.Combine(root,"extracted/chapter2_windows/code/gml_Object_obj_sweet_enemy_Step_0.gml"));
 imports.QueueReplace("gml_Object_obj_time_Step_1","if (variable_global_exists(\"ur_oracle_band_policy\")) {\n"+policy+"\n}\n"+input);
 imports.QueueReplace("gml_Object_obj_sweet_enemy_Step_0",sweet+"\n"+logger);
}

imports.QueueReplace("gml_Room_room_battletest_Create",entry);
imports.Import();
room.CreationCodeId=Data.Code.First(c=>c.Name.Content=="gml_Room_room_battletest_Create");
Console.WriteLine($"Chapter {chapter}: native combat unchanged; standalone launcher and debug room only.");
