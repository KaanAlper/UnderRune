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
    timing = Data.GeneralInfo.GetType().GetProperties().Where(p=>p.Name.Contains("FPS")||p.Name.Contains("Speed")).ToDictionary(p=>p.Name,p=>p.GetValue(Data.GeneralInfo)),
    roomTiming = Data.Rooms.Select(r=>new {name=r.Name.Content,values=r.GetType().GetProperties().Where(p=>p.Name.Contains("Speed")).ToDictionary(p=>p.Name,p=>p.GetValue(r))}),
    objects = Data.GameObjects.Select(x => new { name=x.Name.Content, sprite=x.Sprite == null ? null : x.Sprite.Name.Content }),
    rooms = Data.Rooms.Select(x => x.Name.Content),
    sounds = Data.Sounds.Select(x => x.Name.Content),
    code = Data.Code.Where(x=>x.ParentEntry == null).Select(x => x.Name.Content),
    fonts = Data.Fonts.Where(x=>x.Texture!=null).Select(x=>new {
      name=x.Name.Content, size=x.EmSize,
      page=Data.EmbeddedTextures.IndexOf(x.Texture.TexturePage),
      sx=x.Texture.SourceX, sy=x.Texture.SourceY,
      glyphs=x.Glyphs.Select(g=>new {charCode=g.Character,x=g.SourceX,y=g.SourceY,w=g.SourceWidth,h=g.SourceHeight,shift=g.Shift,offset=g.Offset})
    }),
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
