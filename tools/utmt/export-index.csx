using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;
using UndertaleModLib.Util;
EnsureDataLoaded();
var output = Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
if (String.IsNullOrWhiteSpace(output)) throw new Exception("Missing LL_EXPORT_DIR");
Directory.CreateDirectory(output);
var index = new {
    objects = Data.GameObjects.Select(x => new { name=x.Name.Content, sprite=x.Sprite == null ? null : x.Sprite.Name.Content }),
    rooms = Data.Rooms.Select(x => x.Name.Content),
    sounds = Data.Sounds.Select(x => x.Name.Content),
    code = Data.Code.Where(x=>x.ParentEntry == null).Select(x => x.Name.Content),
    sprites = Data.Sprites.Select(x=>new {
       name=x.Name.Content, width=x.Width, height=x.Height, originX=x.OriginX, originY=x.OriginY,
       frames=x.Textures.Select(t=>t.Texture==null?null:new {
          page=Data.EmbeddedTextures.IndexOf(t.Texture.TexturePage),
          sx=t.Texture.SourceX, sy=t.Texture.SourceY, sw=t.Texture.SourceWidth, sh=t.Texture.SourceHeight,
          tx=t.Texture.TargetX, ty=t.Texture.TargetY, tw=t.Texture.TargetWidth, th=t.Texture.TargetHeight,
          bw=t.Texture.BoundingWidth, bh=t.Texture.BoundingHeight
       })
    })
};
File.WriteAllText(Path.Combine(output,"index.json"),JsonConvert.SerializeObject(index));
Console.WriteLine("INDEX: "+Data.GameObjects.Count+" objects, "+Data.Sprites.Count+" sprites");
if(Environment.GetEnvironmentVariable("LL_EXPORT_TEXTURES")=="1"){
 var tex=Path.Combine(output,"textures");Directory.CreateDirectory(tex);
 for(var i=0;i<Data.EmbeddedTextures.Count;i++){
   using(var fs=new FileStream(Path.Combine(tex,i+".png"),FileMode.Create))
     Data.EmbeddedTextures[i].TextureData.Image.SavePng(fs);
 }
 Console.WriteLine("TEXTURES: "+Data.EmbeddedTextures.Count);
}
