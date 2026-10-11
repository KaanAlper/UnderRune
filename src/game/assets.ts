type Frame={url:string;width:number;height:number;x:number;y:number;targetWidth:number;targetHeight:number};
export type Sprite={name:string;width:number;height:number;originX:number;originY:number;frames:Frame[]};
type Glyph={charCode:number;x:number;y:number;w:number;h:number;shift:number;offset:number};
export type Manifest={version:number;sprites:Record<string,Sprite>;font:{url:string;glyphs:Glyph[]}|null;music:string[];sourcePackages:unknown[]};
export class AssetStore{
 images=new Map<string,HTMLImageElement>();private pending=new Map<string,Promise<HTMLImageElement>>();private fontColors=new Map<string,HTMLCanvasElement>();private glyphs=new Map<number,Glyph>();
 constructor(public manifest:Manifest){manifest.font?.glyphs.forEach(g=>this.glyphs.set(g.charCode,g));}
 async loadImage(url:string){
  if(this.images.has(url))return this.images.get(url)!;
  if(this.pending.has(url))return this.pending.get(url)!;
  const promise=new Promise<HTMLImageElement>((resolve,reject)=>{
   const image=new Image();let settled=false;
   const finish=(cause?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;this.pending.delete(url);if(cause){image.src='';reject(cause);}else{this.images.set(url,image);resolve(image);}};
   const timer=setTimeout(()=>finish(Error('Gorsel yukleme zaman asimi: '+url)),15000);
   image.onload=()=>finish();image.onerror=()=>finish(Error('Gorsel yuklenemedi: '+url));image.src=url;
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
 text(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,scale=2,color='#fff',align:'left'|'center'|'right'='left'){
  const image=this.manifest.font?this.images.get(this.manifest.font.url):undefined;
  if(!image){ctx.fillStyle=color;ctx.font=`bold ${12*scale}px monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(text,x,y);return;}
  let tinted=this.fontColors.get(color);
  if(!tinted){tinted=document.createElement('canvas');tinted.width=image.width;tinted.height=image.height;const tc=tinted.getContext('2d')!;tc.drawImage(image,0,0);tc.globalCompositeOperation='source-in';tc.fillStyle=color;tc.fillRect(0,0,tinted.width,tinted.height);this.fontColors.set(color,tinted);}
  const lines=text.split('\n');for(let j=0;j<lines.length;j++){
   const line=lines[j];let pos=x;const width=this.textWidth(line,scale);if(align==='center')pos-=width/2;if(align==='right')pos-=width;
   for(const char of line){const g=this.glyphs.get(char.charCodeAt(0))??this.glyphs.get(63);if(!g)continue;if(g.w&&g.h)ctx.drawImage(tinted,g.x,g.y,g.w,g.h,Math.round(pos+g.offset*scale),Math.round(y+j*18*scale),g.w*scale,g.h*scale);pos+=g.shift*scale;}
  }
 }
 textWidth(text:string,scale=2){return [...text].reduce((w,c)=>w+(this.glyphs.get(c.charCodeAt(0))?.shift??8)*scale,0);}
}
export async function loadAssets(url='/generated/manifest.json'){
 const response=await fetch(url);if(!response.ok)throw Error('Yerel oyun varliklari bulunamadi. npm run extract ve npm run assets komutlarini calistir.');
 const json=await response.json() as Manifest;if(json.version!==1||!json.sprites||!json.font)throw Error('Oyun varlik manifesti gecersiz.');return new AssetStore(json);
}
