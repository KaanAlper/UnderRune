using System;
using System.IO;
using System.Linq;
using UndertaleModLib.Compiler;
EnsureDataLoaded();
// Diagnostic entry point only: all original battle, hero and boss code is retained.
// CLI output must be a project-local copy; never the installed Steam package.
var root=Environment.GetEnvironmentVariable("LL_PROBE_PROJECT");
if (String.IsNullOrEmpty(root)) throw new Exception("Missing LL_PROBE_PROJECT");
var code=File.ReadAllText(Path.Combine(root,"extracted/chapter1_windows/code/gml_Object_obj_initializer2_Step_0.gml"));
var anchor="room_goto(roomchoice);";
if (code.Split(new[]{anchor},StringSplitOptions.None).Length != 2) throw new Exception("Startup anchor changed");
var imports=new CodeImportGroup(Data) { AutoCreateAssets=false };
if (Environment.GetEnvironmentVariable("LL_PROBE_ENTRY")=="api-test") {
 imports.QueueReplace("gml_Object_obj_initializer2_Step_0",code.Replace(anchor,"room_goto(room_battletest);"));
 imports.QueueReplace("gml_Room_room_battletest_Create",File.ReadAllText(Path.Combine(root,"tests/runtime/api-probe.gml")));
 imports.Import();
 Data.Rooms.First(r=>r.Name.Content=="room_battletest").CreationCodeId=Data.Code.First(c=>c.Name.Content=="gml_Room_room_battletest_Create");
 Console.WriteLine("API test fixture only; original combat scripts retained.");
 return;
}
if (Environment.GetEnvironmentVariable("LL_PROBE_ENTRY")=="source-room") {
 // Original room, background, encounter transition and cutscene controllers.
 // Only launcher state changes; the boss event is not replaced or skipped.
 imports.QueueReplace("gml_Object_obj_initializer2_Step_0",code.Replace(anchor,@"
global.darkzone = 1;
scr_setparty(true, true);
global.charauto[2] = 0;
global.tempflag[4] = 1;
room_goto(room_cc_joker);
"));
 imports.Import();
 Console.WriteLine("Original Jevil room launcher; all other existing scripts retained.");
 return;
}
imports.QueueReplace("gml_Object_obj_initializer2_Step_0",code.Replace(anchor,"room_goto(room_battletest);"));
imports.QueueReplace("gml_Room_room_battletest_Create",@"
scr_setparty(true, true);
global.charauto[2] = 0;
global.darkzone = 1;
global.encounterno = 25;
global.specialbattle = 3;
global.flag[9] = 1;
global.batmusic[0] = snd_init(""joker.ogg"");
scr_encountersetup(global.encounterno);
instance_create(0, 0, obj_battlecontroller);
");
imports.Import();
Data.Rooms.First(r=>r.Name.Content=="room_battletest").CreationCodeId=Data.Code.First(c=>c.Name.Content=="gml_Room_room_battletest_Create");
Console.WriteLine("Diagnostic launcher only; original combat code is not replaced.");
