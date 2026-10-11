using System;
using System.Linq;
using Newtonsoft.Json;
EnsureDataLoaded();
foreach (var room in Data.Rooms.Where(r=>r.Name.Content=="room_battletest"||r.Name.Content=="ROOM_INITIALIZE"||r.GameObjects.Any(i=>i.ObjectDefinition.Name.Content=="obj_jokerbattleevent"))) {
 Console.WriteLine(JsonConvert.SerializeObject(new {name=room.Name.Content,creation=room.CreationCodeId?.Name.Content,instances=room.GameObjects.Select(i=>new {name=i.ObjectDefinition.Name.Content,creation=i.CreationCode?.Name.Content,x=i.X,y=i.Y})}));
}
