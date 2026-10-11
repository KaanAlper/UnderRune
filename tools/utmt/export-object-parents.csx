// Read-only: writes object-parents.json (index, name, parent name, sprite, depth, visible) for the remake.
using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
EnsureDataLoaded();
var output=Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
if(String.IsNullOrWhiteSpace(output))throw new Exception("Missing LL_EXPORT_DIR");
File.WriteAllText(Path.Combine(output,"object-parents.json"),JsonConvert.SerializeObject(Data.GameObjects.Select((o,i)=>new{
 index=i,name=o.Name.Content,parent=o.ParentId?.Name.Content,sprite=o.Sprite?.Name.Content,depth=o.Depth,visible=o.Visible
}),Formatting.None));
Console.WriteLine("Object parents exported; package unchanged.");
