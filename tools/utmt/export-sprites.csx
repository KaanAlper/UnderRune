// Read-only: writes sprites.json with collision and animation data for the remake runtime:
// size, origin, bounding-box mode and margins, mask type and per-frame precise masks, frame count and
// GameMaker 2 playback speed, plus the version facts that select the collision rules.
using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
EnsureDataLoaded();
var output=Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
if(String.IsNullOrWhiteSpace(output))throw new Exception("Missing LL_EXPORT_DIR");
var info=new{
 atLeast2022_1=Data.IsVersionAtLeast(2022,1),
 atLeast2024_6=Data.IsVersionAtLeast(2024,6),
 optionsInfo=(ulong)Data.Options.Info,
 sprites=Data.Sprites.Where(s=>s!=null).Select(s=>new{
  name=s.Name.Content,width=s.Width,height=s.Height,originX=s.OriginX,originY=s.OriginY,
  bboxMode=s.BBoxMode,left=s.MarginLeft,right=s.MarginRight,top=s.MarginTop,bottom=s.MarginBottom,
  sepMasks=(int)s.SepMasks,frames=s.Textures.Count,
  special=s.IsSpecialType,playbackSpeed=s.GMS2PlaybackSpeed,playbackType=(int)s.GMS2PlaybackSpeedType,
  masks=(int)s.SepMasks==1?s.CollisionMasks.Select(m=>Convert.ToBase64String(m.Data)).ToArray():null
 })
};
File.WriteAllText(Path.Combine(output,"sprites.json"),JsonConvert.SerializeObject(info));
Console.WriteLine("Sprites exported; package unchanged.");
