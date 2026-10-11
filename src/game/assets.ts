type Frame={url:string;width:number;height:number;x:number;y:number;targetWidth:number;targetHeight:number};
export type Sprite={name:string;width:number;height:number;originX:number;originY:number;frames:Frame[]};
type Glyph={charCode:number;x:number;y:number;w:number;h:number;shift:number;offset:number};
type FontData={url:string;glyphs:Glyph[]};
// font: DELTARUNE fnt_main; utFont: UNDERTALE fnt_main from the user's install (theater only, optional).
export type Manifest={version:number;sprites:Record<string,Sprite>;font:FontData|null;utFont?:FontData|null;music:string[];sourcePackages:unknown[]};
export type FontName='deltarune'|'undertale';
export class AssetStore{
 images=new Map<string,HTMLImageElement>();private pending=new Map<string,Promise<HTMLImageElement>>();private fontColors=new Map<string,HTMLCanvasElement>();
 private glyphs:Record<FontName,Map<number,Glyph>>={deltarune:new Map(),undertale:new Map()};
 constructor(public manifest:Manifest){manifest.font?.glyphs.forEach(g=>this.glyphs.deltarune.set(g.charCode,g));manifest.utFont?.glyphs.forEach(g=>this.glyphs.undertale.set(g.charCode,g));}
 private fontData(font:FontName){return font==='undertale'?this.manifest.utFont??null:this.manifest.font;}
 hasFont(font:FontName){return !!this.fontData(font);}
 async loadImage(url:string){
  if(this.images.has(url))return this.images.get(url)!;
  if(this.pending.has(url))return this.pending.get(url)!;
  const promise=new Promise<HTMLImageElement>((resolve,reject)=>{
   const image=new Image();let settled=false;
   const finish=(cause?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;this.pending.delete(url);if(cause){image.src='';reject(cause);}else{this.images.set(url,image);resolve(image);}};
   const timer=setTimeout(()=>finish(Error('Image load timed out: '+url)),15000);
   image.onload=()=>finish();image.onerror=()=>finish(Error('Image failed to load: '+url));image.src=url;
  });
  this.pending.set(url,promise);return promise;
 }
 async preload(chapter:number){
  const urls=new Set<string>();
  for(const [key,s]of Object.entries(this.manifest.sprites))if(key.startsWith(chapter+':')||key.startsWith('1:'))for(const f of s.frames)urls.add(f.url);
  if(this.manifest.font)urls.add(this.manifest.font.url);
  const list=[...urls];let i=0;await Promise.all(Array.from({length:6},async()=>{while(i<list.length)await this.loadImage(list[i++]);}));
 }
 draw(ctx:CanvasRenderingContext2D,name:string,chapter:number,x:number,y:number,scale=1,frame=0,alpha=1){
  const s=this.manifest.sprites[chapter+':'+name]??this.manifest.sprites['1:'+name];if(!s)return false;
  const f=s.frames[Math.floor(frame)%s.frames.length],image=this.images.get(f.url);if(!image)return false;
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,Math.round(x-s.width*scale/2+f.x*scale),Math.round(y+f.y*scale),Math.round(f.targetWidth*scale),Math.round(f.targetHeight*scale));ctx.restore();return true;
 }
 getSprite(name:string,chapter:number){return this.manifest.sprites[chapter+':'+name]??this.manifest.sprites['1:'+name];}
 text(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,scale=2,color='#fff',align:'left'|'center'|'right'='left',font:FontName='deltarune'){
  const data=this.fontData(font),image=data?this.images.get(data.url):undefined,glyphs=this.glyphs[font];
  if(!image){ctx.fillStyle=color;ctx.font=`bold ${12*scale}px monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(text,x,y);return;}
  let tinted=this.fontColors.get(font+color);
  if(!tinted){tinted=document.createElement('canvas');tinted.width=image.width;tinted.height=image.height;const tc=tinted.getContext('2d')!;tc.drawImage(image,0,0);tc.globalCompositeOperation='source-in';tc.fillStyle=color;tc.fillRect(0,0,tinted.width,tinted.height);this.fontColors.set(font+color,tinted);}
  const lines=text.split('\n');for(let j=0;j<lines.length;j++){
   const line=lines[j];let pos=x;const width=this.textWidth(line,scale,font);if(align==='center')pos-=width/2;if(align==='right')pos-=width;
   for(const char of line){const g=glyphs.get(char.charCodeAt(0))??glyphs.get(63);if(!g)continue;if(g.w&&g.h)ctx.drawImage(tinted,g.x,g.y,g.w,g.h,Math.round(pos+g.offset*scale),Math.round(y+j*18*scale),g.w*scale,g.h*scale);pos+=g.shift*scale;}
  }
 }
 textWidth(text:string,scale=2,font:FontName='deltarune'){return [...text].reduce((w,c)=>w+(this.glyphs[font].get(c.charCodeAt(0))?.shift??8)*scale,0);}
}
export async function loadAssets(url='/generated/manifest.json'){
 const response=await fetch(url);if(!response.ok)throw Error('Local game assets not found. Run npm run prepare:game.');
 const json=await response.json() as Manifest;if(json.version!==1||!json.sprites||!json.font)throw Error('The game asset manifest is invalid.');return new AssetStore(json);
}
