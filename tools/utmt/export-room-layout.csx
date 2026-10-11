using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
EnsureDataLoaded();
var output=Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
if(String.IsNullOrWhiteSpace(output))throw new Exception("Missing LL_EXPORT_DIR");
Directory.CreateDirectory(output);
File.WriteAllText(Path.Combine(output,"room-layout.json"),JsonConvert.SerializeObject(Data.Rooms.Select(r=>new {
 name=r.Name.Content,creation=r.CreationCodeId?.Name.Content,width=r.Width,height=r.Height,
 instances=r.GameObjects.Select(i=>new {name=i.ObjectDefinition.Name.Content,creation=i.CreationCode?.Name.Content,x=i.X,y=i.Y}),
}),Formatting.Indented));
Console.WriteLine("Room layout export complete; package unchanged.");
