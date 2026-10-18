// Draws the remake's GameMaker draw calls on a 2D canvas: sprite frames cut from texture pages, GameMaker's
// colour blend (multiply), rotation (counter-clockwise degrees), scale and alpha, rectangles, circles and
// bitmap or sprite fonts. Coordinates are room coordinates; the view offset is applied here.
import type {BlendMode,GmGraphics,TextStyle} from '../gm/graphics';
import type {NineSlice} from '../gm/sprites';

export interface FrameRef{page:number;sx:number;sy:number;sw:number;sh:number;tx:number;ty:number;tw:number;th:number;alphaZeroRgb?:'black'}
export interface SpriteFrames{originX:number;originY:number;width:number;height:number;frames:(FrameRef|null)[];nineSlice?:NineSlice|null}
export interface Glyph{x:number;y:number;w:number;h:number;shift:number;offset:number}
export type FontData={kind:'bitmap';page:number;sx:number;sy:number;size:number;glyphs:Record<number,Glyph>}
 |{kind:'sprite';sprite:string;map:string;proportional:boolean;sep:number};
export interface DrawAssets{pages:CanvasImageSource[];sprite(name:string):SpriteFrames|undefined;font(name:string):FontData|undefined}
interface Bounds{left:number;top:number;right:number;bottom:number}

/** GameMaker colours are 0xBBGGRR. */
export const css=(c:number)=>`rgb(${c&255},${(c>>8)&255},${(c>>16)&255})`;
const frameAt=(s:SpriteFrames,frame:number)=>{const n=s.frames.length;return n?s.frames[((Math.floor(frame)%n)+n)%n]:null;};

export class CanvasGraphics implements GmGraphics{
 private surfaces=new Map<number,HTMLCanvasElement>();
 private targetSurface:number|null=null;
 private generated=new Map<string,SpriteFrames>();
 private generatedPages=new Map<string,number>();
 private pages:CanvasImageSource[];
 private screen:CanvasRenderingContext2D;
 readonly assets:DrawAssets;
 private tints=new Map<string,HTMLCanvasElement>();
 private fogs=new Map<string,HTMLCanvasElement>();
 /** Ordinary screen drawing keeps its existing fast Canvas path. Offscreen targets retain GPU RGBA bytes. */
 private composite:GlobalCompositeOperation='source-over';
 private mode:BlendMode='normal';
 private testAlpha=false;
 private raster:CanvasRenderingContext2D|null=null;
 private scratch:HTMLCanvasElement|null=null;
 private surfacePixels=new Map<number,ImageData>();
 private rasterSize:{width:number;height:number}|null=null;
 private opaqueFrames=new WeakMap<FrameRef,boolean>();
 private framePixels=new WeakMap<FrameRef,ImageData>();
 constructor(ctx:CanvasRenderingContext2D,assets:DrawAssets,readonly view:{x:number;y:number}){
  this.screen=ctx;this.pages=[...assets.pages];this.assets={...assets,pages:this.pages,sprite:name=>this.generated.get(name)??assets.sprite(name)};
  // Scope complete drawing operations, including nine-slice, fonts, fog and cropped/tiled sprites. Nested
  // calls reuse the same raster target; captures, target changes and resource lifetime methods stay direct.
  for(const key of ['sprite','spritePart','spriteFog','spriteTiled','rect','line','lineColor','circle','triangle','triangleColor','text'] as const){
   const draw=this[key].bind(this) as (...args:unknown[])=>void;
   Object.defineProperty(this,key,{value:(...args:unknown[])=>this.paint(()=>draw(...args),()=>this.bounds(key,args),key,args)});
  }
 }
 get ctx(){return this.raster??(this.targetSurface===null?this.screen:this.surfaces.get(this.targetSurface)!.getContext('2d')!);}
 private get vx(){return this.targetSurface===null?this.view.x:0;}
 private get vy(){return this.targetSurface===null?this.view.y:0;}
 surfaceCreate(id:number,width:number,height:number){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.imageSmoothingEnabled=false;this.surfaces.set(id,canvas);this.surfacePixels.delete(id);}
 surfaceTarget(id:number|null){if(id!==null&&!this.surfaces.has(id))throw Error('Missing surface');this.targetSurface=id;this.ctx.globalCompositeOperation=this.composite;}
 blendMode(mode:BlendMode){
  this.mode=mode;this.composite=mode==='add'?'lighter':'source-over';
  this.ctx.globalCompositeOperation=this.composite;
 }
 alphaTest(enabled:boolean){this.testAlpha=enabled;}
 private bounds(key:string,args:unknown[]):Bounds|null{
  const a=args as number[],box=(left:number,top:number,right:number,bottom:number):Bounds=>({left:left-this.vx,top:top-this.vy,right:right-this.vx,bottom:bottom-this.vy});
  if(key==='sprite'||key==='spriteFog'){
   const s=this.assets.sprite(args[0] as string);if(!s)return box(0,0,0,0);
   const x=a[2],y=a[3],xs=a[4],ys=a[5],angle=-a[6]*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle),points=[];
   for(const xx of [-s.originX,s.width-s.originX])for(const yy of [-s.originY,s.height-s.originY])points.push({x:x+xx*xs*co-yy*ys*si,y:y+xx*xs*si+yy*ys*co});
   return box(Math.min(...points.map(p=>p.x))-1,Math.min(...points.map(p=>p.y))-1,Math.max(...points.map(p=>p.x))+1,Math.max(...points.map(p=>p.y))+1);
  }
  if(key==='spritePart'){const x=a[6],y=a[7],right=x+a[4]*a[8],bottom=y+a[5]*a[9];return box(Math.min(x,right)-1,Math.min(y,bottom)-1,Math.max(x,right)+1,Math.max(y,bottom)+1);}
  if(key==='rect'||key==='line'||key==='lineColor'){const pad=key==='line'?(a[6]??1)/2+1:1;return box(Math.min(a[0],a[2])-pad,Math.min(a[1],a[3])-pad,Math.max(a[0],a[2])+pad+1,Math.max(a[1],a[3])+pad+1);}
  if(key==='circle')return box(a[0]-a[2]-1,a[1]-a[2]-1,a[0]+a[2]+1,a[1]+a[2]+1);
  if(key==='triangle'||key==='triangleColor')return box(Math.min(a[0],a[2],a[4])-1,Math.min(a[1],a[3],a[5])-1,Math.max(a[0],a[2],a[4])+1,Math.max(a[1],a[3],a[5])+1);
  return null; // Tiling and text can span the target; glyph overhangs are not bounded by advances.
 }
 /** RGB from alpha-zero atlas texels is irrecoverable through Canvas decoding. Reject the modes that need
  * it rather than guessing. Opaque primitives and raw surface pixels do retain everything those modes need. */
 private checkRasterSource(key:string,args:unknown[]){
  if(this.testAlpha||!['subtract','dest-alpha-add','dest-alpha-copy'].includes(this.mode))return;
  const alphaIndex:Record<string,number>={sprite:8,spriteFog:8,spritePart:11,spriteTiled:6,rect:5,line:5,lineColor:6,circle:4,triangle:7,triangleColor:9};
  if(args[alphaIndex[key]]===0||key==='text')throw Error('Canvas blend mode needs raw RGB for alpha-zero fragments');
  if(!key.startsWith('sprite'))return;
  const s=this.assets.sprite(args[0] as string),f=s&&frameAt(s,key==='spriteTiled'?(args[7] as number??0):args[1] as number);if(!f)return;
  let opaque=this.opaqueFrames.get(f);
  if(opaque===undefined){
   const pixels=this.readFrame(f).data;
   opaque=true;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0){opaque=false;break;}this.opaqueFrames.set(f,opaque);
  }
  const direct=(key==='spriteTiled'||key==='sprite'&&args[6]===0&&!s?.nineSlice?.enabled)&&!this.ctx.imageSmoothingEnabled;
  if(!opaque&&!(f.alphaZeroRgb==='black'&&(direct||this.mode==='subtract'&&key!=='spriteFog')))throw Error('Canvas blend mode needs verified raw atlas RGB for alpha-zero texels');
 }
 private readFrame(f:FrameRef){
  let image=this.framePixels.get(f);if(image)return image;
  const canvas=document.createElement('canvas');canvas.width=f.sw;canvas.height=f.sh;const c=canvas.getContext('2d',{willReadFrequently:true})!;
  c.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,0,0,f.sw,f.sh);image=c.getImageData(0,0,f.sw,f.sh);this.framePixels.set(f,image);return image;
 }
 private directSprite(key:string,args:unknown[]){
  if(this.ctx.imageSmoothingEnabled)return false;
  if(key==='spriteTiled'){
   const s=this.assets.sprite(args[0] as string);if(!s)return true;
   const a=args as number[],f=frameAt(s,a[7]??0),w=s.width*a[3],h=s.height*a[4];if(!f||w<=0||h<=0)return true;
   const image=this.readFrame(f),vx=this.vx,vy=this.vy,ctx=this.ctx,width=ctx.canvas.width,height=ctx.canvas.height,startX=a[1]-Math.ceil((a[1]-vx)/w)*w,startY=a[2]-Math.ceil((a[2]-vy)/h)*h;
   // Keep each tile's rectangular coverage, including verified black RGB at alpha zero. Destination-alpha
   // factors must still run for those texels; merging tiles through Canvas source-over would lose them.
   for(let y=startY;y<vy+height;y+=h)for(let x=startX;x<vx+width;x+=w)this.sample(image,0,0,f.sw,f.sh,x+f.tx*a[3],y+f.ty*a[4],a[3]*(f.tw||f.sw)/f.sw,a[4]*(f.th||f.sh)/f.sh,a[5],a[6]);return true;
  }
  if(key!=='sprite'||args[6]!==0)return false;
  const s=this.assets.sprite(args[0] as string);if(!s||s.nineSlice?.enabled)return false;
  const a=args as number[],f=frameAt(s,a[1]);if(!f)return true;
  // Point-filtered, axis-aligned quads need no Canvas raster/readback. Atlas trimming, origins, mirrored
  // scale, tint and source alpha are applied to raw texels before the same GPU blend equations.
  this.sample(this.readFrame(f),0,0,f.sw,f.sh,a[2]+(f.tx-s.originX)*a[4],a[3]+(f.ty-s.originY)*a[5],a[4]*(f.tw||f.sw)/f.sw,a[5]*(f.th||f.sh)/f.sh,a[7],a[8]);return true;
 }
 private pixel(dst:Uint8ClampedArray,i:number,r:number,g:number,b:number,sa:number){
  if(this.testAlpha&&sa===0)return;
  const da=dst[i+3]/255;
  if(this.mode==='subtract'){
   dst[i]=Math.round(dst[i]*(1-r/255));dst[i+1]=Math.round(dst[i+1]*(1-g/255));dst[i+2]=Math.round(dst[i+2]*(1-b/255));dst[i+3]=Math.round(dst[i+3]*(1-sa));return;
  }
  const sf=this.mode==='dest-alpha-add'||this.mode==='dest-alpha-copy'?da:sa;
  const df=this.mode==='dest-alpha-copy'?0:this.mode==='dest-alpha-add'?da:this.mode==='add'||this.mode==='add-preserve-alpha'?1:1-sa;
  dst[i]=Math.round(r*sf+dst[i]*df);dst[i+1]=Math.round(g*sf+dst[i+1]*df);dst[i+2]=Math.round(b*sf+dst[i+2]*df);
  dst[i+3]=Math.round(255*(this.mode==='add-preserve-alpha'||this.mode==='normal-preserve-alpha'?sa*da:sa*sf+da*df));
 }
 private paint(draw:()=>void,bounds:()=>Bounds|null,key:string,args:unknown[]){
  if(this.raster||(this.targetSurface===null&&(this.mode==='normal'||this.mode==='add'))){draw();return;}
  if(!this.testAlpha&&(this.mode==='add-preserve-alpha'||this.mode==='normal-preserve-alpha'))throw Error('Custom blend drawing requires alpha testing in the Canvas backend');
  this.checkRasterSource(key,args);
  if(this.directSprite(key,args))return;
  const target=this.ctx,w=target.canvas.width,h=target.canvas.height;
  if(!w||!h)return;
  const area=bounds(),left=Math.max(0,Math.floor(area?.left??0)),top=Math.max(0,Math.floor(area?.top??0)),right=Math.min(w,Math.ceil(area?.right??w)),bottom=Math.min(h,Math.ceil(area?.bottom??h)),sw=right-left,sh=bottom-top;
  if(sw<=0||sh<=0)return;
  const scratch=this.scratch??(this.scratch=document.createElement('canvas'));
  if(scratch.width!==sw||scratch.height!==sh){scratch.width=sw;scratch.height=sh;}
  const source=scratch.getContext('2d',{willReadFrequently:true})!;
  source.setTransform(1,0,0,1,0,0);source.clearRect(0,0,sw,sh);source.setTransform(1,0,0,1,-left,-top);source.globalCompositeOperation='source-over';source.imageSmoothingEnabled=target.imageSmoothingEnabled;
  this.raster=source;this.rasterSize={width:w,height:h};
  try{draw();}finally{this.raster=null;this.rasterSize=null;}
  const patch=source.getImageData(0,0,sw,sh),src=patch.data;
  const image=(this.targetSurface===null?undefined:this.surfacePixels.get(this.targetSurface))??target.getImageData(0,0,w,h),dst=image.data;
  // Native gl_common.c uses ZERO, ONE_MINUS_SRC_COLOR for bm_subtract. Both separate-alpha modes use
  // SRC_ALPHA, DST_ALPHA for alpha; Canvas source-atop has different RGB factors and cannot represent them.
  for(let row=0;row<sh;row++)for(let col=0;col<sw;col++){
   const j=(row*sw+col)*4,i=((top+row)*w+left+col)*4,sa=src[j+3]/255;
   // Source validation above proves zero-alpha samples here are outside the covered geometry whenever
   // the blend mode depends on RGB even at zero alpha. Ordinary blending also leaves these pixels alone.
   if(sa===0)continue;
   this.pixel(dst,i,src[j],src[j+1],src[j+2],sa);
  }
  if(this.targetSurface!==null)this.surfacePixels.set(this.targetSurface,image);
  // Passing the whole ImageData with a dirty rectangle still copies the whole backing array in Chromium.
  // Upload a compact patch so a small sprite does not transfer a full room-sized surface.
  for(let row=0;row<sh;row++){const start=((top+row)*w+left)*4;src.set(dst.subarray(start,start+sw*4),row*sw*4);}
  target.putImageData(patch,left,top);
 }
 private pixels(id:number){
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing surface');
  let pixels=this.surfacePixels.get(id);if(!pixels){pixels=surface.getContext('2d')!.getImageData(0,0,surface.width,surface.height);this.surfacePixels.set(id,pixels);}return pixels;
 }
 surfaceCopy(id:number,x:number,y:number,source:number|null){
  const target=this.surfaces.get(id);if(!target)throw Error('Missing surface');
  const src=source===null?this.screen.getImageData(0,0,this.screen.canvas.width,this.screen.canvas.height):this.pixels(source),dst=this.pixels(id),data=src.data.slice();
  x=Math.trunc(x);y=Math.trunc(y);
  const left=Math.max(0,x),top=Math.max(0,y),right=Math.min(dst.width,x+src.width),bottom=Math.min(dst.height,y+src.height);
  for(let yy=top;yy<bottom;yy++)for(let xx=left;xx<right;xx++){
   const i=(yy*dst.width+xx)*4,j=((yy-y)*src.width+xx-x)*4;dst.data.set(data.subarray(j,j+4),i);
  }
  if(right>left&&bottom>top)target.getContext('2d')!.putImageData(dst,0,0,left,top,right-left,bottom-top);
 }
 surfaceDraw(id:number,x:number,y:number,alpha:number,blend=0xffffff){
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing surface');
  this.surfacePart(id,0,0,surface.width,surface.height,x,y,1,1,blend,alpha);
 }
 surfacePart(id:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number){
  this.sample(this.pixels(id),left,top,width,height,x,y,xscale,yscale,blend,alpha);
 }
 private sample(source:ImageData,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number){
  if(width<=0||height<=0||!xscale||!yscale)return;
  const target=this.ctx,w=target.canvas.width,h=target.canvas.height;x-=this.vx;y-=this.vy;
  const x2=x+width*xscale,y2=y+height*yscale,l=Math.max(0,Math.ceil(Math.min(x,x2)-.5)),t=Math.max(0,Math.ceil(Math.min(y,y2)-.5)),r=Math.min(w,Math.ceil(Math.max(x,x2)-.5)),b=Math.min(h,Math.ceil(Math.max(y,y2)-.5));if(r<=l||b<=t)return;
  const dst=this.targetSurface===null?target.getImageData(0,0,w,h):this.pixels(this.targetSurface),pixels=source===dst?source.data.slice():source.data;
  const ar=Math.max(0,Math.min(1,alpha)),tr=(blend&255)/255,tg=((blend>>8)&255)/255,tb=((blend>>16)&255)/255;
  // Surface textures use nearest sampling. Keep raw RGB even when the sampled alpha is zero: subtract and
  // destination-alpha factors may read it, unlike Canvas drawImage's premultiplied intermediate.
  for(let yy=t;yy<b;yy++)for(let xx=l;xx<r;xx++){
   const sx=Math.max(0,Math.min(source.width-1,Math.floor(left+(xx+.5-x)/xscale))),sy=Math.max(0,Math.min(source.height-1,Math.floor(top+(yy+.5-y)/yscale))),j=(sy*source.width+sx)*4;
   this.pixel(dst.data,(yy*w+xx)*4,pixels[j]*tr,pixels[j+1]*tg,pixels[j+2]*tb,pixels[j+3]/255*ar);
  }
  const patch=target.createImageData(r-l,b-t);
  for(let row=0;row<b-t;row++){const start=((t+row)*w+l)*4;patch.data.set(dst.data.subarray(start,start+(r-l)*4),row*(r-l)*4);}
  target.putImageData(patch,l,t);
 }
 /** A GPU interpolates all three vertex colors at pixel centers, including skew triangles. */
 triangleColor(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,c1:number,c2:number,c3:number,alpha:number){
  x1-=this.vx;x2-=this.vx;x3-=this.vx;y1-=this.vy;y2-=this.vy;y3-=this.vy;
  const det=(x2-x1)*(y3-y1)-(x3-x1)*(y2-y1);if(!det||alpha<=0)return;
  const ctx=this.ctx,left=Math.max(0,Math.floor(Math.min(x1,x2,x3))),top=Math.max(0,Math.floor(Math.min(y1,y2,y3))),right=Math.min(this.rasterSize?.width??ctx.canvas.width,Math.ceil(Math.max(x1,x2,x3))),bottom=Math.min(this.rasterSize?.height??ctx.canvas.height,Math.ceil(Math.max(y1,y2,y3)));
  if(right<=left||bottom<=top)return;
  const canvas=document.createElement('canvas');canvas.width=right-left;canvas.height=bottom-top;const c=canvas.getContext('2d')!,image=c.createImageData(canvas.width,canvas.height),data=image.data;
  const edge=(ax:number,ay:number,bx:number,by:number)=>det>0?(by<ay||(by===ay&&bx>ax)):(ay<by||(ay===by&&ax>bx));
  const e1=edge(x2,y2,x3,y3),e2=edge(x3,y3,x1,y1),e3=edge(x1,y1,x2,y2);
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
   const b=((x+.5-x1)*(y3-y1)-(y+.5-y1)*(x3-x1))/det,d=((x2-x1)*(y+.5-y1)-(y2-y1)*(x+.5-x1))/det,a=1-b-d;
   if(a<0||b<0||d<0||a===0&&!e1||b===0&&!e2||d===0&&!e3)continue;
   const i=((y-top)*canvas.width+x-left)*4;
   for(let ch=0;ch<3;ch++)data[i+ch]=Math.round(((c1>>(ch*8))&255)*a+((c2>>(ch*8))&255)*b+((c3>>(ch*8))&255)*d);
   data[i+3]=Math.round(Math.min(1,alpha)*255);
  }
  c.putImageData(image,0,0);ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,left,top);ctx.restore();
 }
 surfaceClear(color:number,alpha:number){
  const ctx=this.ctx;
  if(this.targetSurface!==null){
   const image=ctx.createImageData(ctx.canvas.width,ctx.canvas.height),data=image.data,a=Math.round(Math.max(0,Math.min(1,alpha))*255);
   for(let i=0;i<data.length;i+=4){data[i]=color&255;data[i+1]=(color>>8)&255;data[i+2]=(color>>16)&255;data[i+3]=a;}
   this.surfacePixels.set(this.targetSurface,image);ctx.putImageData(image,0,0);return;
  }
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.globalAlpha=alpha;ctx.fillStyle=css(color);ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();
 }
 surfaceSprite(id:number,name:string,left:number,top:number,width:number,height:number,originX:number,originY:number){
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing sprite surface');const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(surface,left,top,width,height,0,0,width,height);
  const page=this.pages.length;this.pages.push(canvas);this.generatedPages.set(name,page);this.generated.set(name,{originX,originY,width,height,frames:[{page,sx:0,sy:0,sw:width,sh:height,tx:0,ty:0,tw:width,th:height}]});
 }
 surfaceFree(id:number){this.surfaces.delete(id);this.surfacePixels.delete(id);}
 screenSprite(name:string,width:number,height:number){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(this.screen.canvas,0,0,width,height,0,0,width,height);
  const page=this.pages.length;this.pages.push(canvas);this.generatedPages.set(name,page);this.generated.set(name,{originX:0,originY:0,width,height,frames:[{page,sx:0,sy:0,sw:width,sh:height,tx:0,ty:0,tw:width,th:height}]});
 }
 spriteDelete(name:string){const page=this.generatedPages.get(name);if(page!==undefined){const canvas=this.pages[page] as HTMLCanvasElement;canvas.width=canvas.height=0;}this.generatedPages.delete(name);this.generated.delete(name);this.tints.clear();this.fogs.clear();}
 private tinted(f:FrameRef,blend:number,bottom=blend){
  const key=`${f.page}:${f.sx},${f.sy}:${blend}:${bottom}`;let c=this.tints.get(key);if(c)return c;
  if(this.tints.size>4000)this.tints.clear();
  c=document.createElement('canvas');c.width=f.sw;c.height=f.sh;const g=c.getContext('2d')!;
  g.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,0,0,f.sw,f.sh);
  let fill:string|CanvasGradient=css(blend);
  if(bottom!==blend){const gr=g.createLinearGradient(0,0,0,f.sh);gr.addColorStop(0,css(blend));gr.addColorStop(1,css(bottom));fill=gr;}
  g.globalCompositeOperation='multiply';g.fillStyle=fill;g.fillRect(0,0,f.sw,f.sh);
  g.globalCompositeOperation='destination-in';g.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,0,0,f.sw,f.sh);
  this.tints.set(key,c);return c;
 }
 private place(x:number,y:number,xscale:number,yscale:number,angle:number,alpha:number){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  c.translate(x-this.vx,y-this.vy);if(angle)c.rotate(-angle*Math.PI/180);c.scale(xscale,yscale);
 }
 private blit(f:FrameRef,dx:number,dy:number,blend:number,bottom=blend){
  const tw=f.tw||f.sw,th=f.th||f.sh;
  if(blend===0xffffff&&bottom===blend)this.ctx.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,dx+f.tx,dy+f.ty,tw,th);
  else this.ctx.drawImage(this.tinted(f,blend,bottom),0,0,f.sw,f.sh,dx+f.tx,dy+f.ty,tw,th);
 }
 sprite(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,blend:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  if(s.nineSlice?.enabled){
   if(s.nineSlice.tileModes.some(mode=>mode!==0))throw Error(`Unsupported nine-slice tile mode: ${name}`);
   if(xscale===0||yscale===0)return;
   this.place(x,y,Math.sign(xscale),Math.sign(yscale),angle,alpha);
   this.blitNineSlice(s,f,Math.abs(xscale),Math.abs(yscale),blend);this.ctx.restore();return;
  }
  this.place(x,y,xscale,yscale,angle,alpha);this.blit(f,-s.originX,-s.originY,blend);this.ctx.restore();
 }
 /** Nine-slice corners retain their source size; only the centre spans scale. Atlas trimming still applies. */
 private blitNineSlice(s:SpriteFrames,f:FrameRef,xscale:number,yscale:number,blend:number){
  const n=s.nineSlice!,w=s.width*xscale,h=s.height*yscale;
  const axis=(size:number,target:number,start:number,end:number)=>{
   const middle=size-start-end,left=Math.min(start,target),right=Math.min(end,Math.max(0,target-left));
   return {source:[0,left,left+middle,left+middle+right],dest:[0,left,target-right,target]};
  };
  const xs=axis(s.width,w,n.left,n.right),ys=axis(s.height,h,n.top,n.bottom);
  const tw=f.tw||f.sw,th=f.th||f.sh,page=blend===0xffffff?this.assets.pages[f.page]:this.tinted(f,blend);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const sl=xs.source[col],st=ys.source[row],sw=xs.source[col+1]-sl,sh=ys.source[row+1]-st;
   const dw=xs.dest[col+1]-xs.dest[col],dh=ys.dest[row+1]-ys.dest[row];
   if(sw<=0||sh<=0||dw<=0||dh<=0)continue;
   const l=Math.max(sl,f.tx),t=Math.max(st,f.ty),r=Math.min(sl+sw,f.tx+tw),b=Math.min(st+sh,f.ty+th);
   if(r<=l||b<=t)continue;
   this.ctx.drawImage(page,(l-f.tx)*f.sw/tw+(blend===0xffffff?f.sx:0),(t-f.ty)*f.sh/th+(blend===0xffffff?f.sy:0),(r-l)*f.sw/tw,(b-t)*f.sh/th,
    xs.dest[col]+(l-sl)*dw/sw-s.originX*xscale,ys.dest[row]+(t-st)*dh/sh-s.originY*yscale,(r-l)*dw/sw,(b-t)*dh/sh);
  }
 }
 spritePart(name:string,frame:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0||width<=0||height<=0)return;const f=frameAt(s,frame);if(!f)return;
  const tw=f.tw||f.sw,th=f.th||f.sh,l=Math.max(left,f.tx),t=Math.max(top,f.ty),r=Math.min(left+width,f.tx+tw),b=Math.min(top+height,f.ty+th);
  if(r<=l||b<=t)return;
  const sx=(l-f.tx)*f.sw/tw,sy=(t-f.ty)*f.sh/th,sw=(r-l)*f.sw/tw,sh=(b-t)*f.sh/th;
  const page=blend===0xffffff?this.assets.pages[f.page]:this.tinted(f,blend);
  this.place(x,y,xscale,yscale,0,alpha);
  this.ctx.drawImage(page,sx+(blend===0xffffff?f.sx:0),sy+(blend===0xffffff?f.sy:0),sw,sh,l-left,t-top,r-l,b-t);this.ctx.restore();
 }
 spriteFog(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,color:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  const key=`${f.page}:${f.sx},${f.sy}:${color}`;let fog=this.fogs.get(key);
  if(!fog){if(this.fogs.size>4000)this.fogs.clear();fog=document.createElement('canvas');fog.width=f.sw;fog.height=f.sh;const g=fog.getContext('2d')!;g.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,0,0,f.sw,f.sh);g.globalCompositeOperation='source-in';g.fillStyle=css(color);g.fillRect(0,0,f.sw,f.sh);this.fogs.set(key,fog);}
  this.place(x,y,xscale,yscale,angle,alpha);this.ctx.drawImage(fog,0,0,f.sw,f.sh,-s.originX+f.tx,-s.originY+f.ty,f.tw||f.sw,f.th||f.sh);this.ctx.restore();
 }
 spriteTiled(name:string,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number,frame=0){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  const w=s.width*xscale,h=s.height*yscale;if(w<=0||h<=0)return;
  const vx=this.vx,vy=this.vy,startX=x-Math.ceil((x-vx)/w)*w,startY=y-Math.ceil((y-vy)/h)*h;
  const width=this.rasterSize?.width??this.ctx.canvas.width,height=this.rasterSize?.height??this.ctx.canvas.height;
  for(let ty=startY;ty<vy+height;ty+=h)for(let tx=startX;tx<vx+width;tx+=w){this.place(tx,ty,xscale,yscale,0,alpha);this.blit(f,0,0,blend);this.ctx.restore();}
 }
 rect(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const l=Math.min(x1,x2)-this.vx,t=Math.min(y1,y2)-this.vy,w=Math.abs(x2-x1)+1,h=Math.abs(y2-y1)+1;
  if(outline){c.strokeStyle=css(color);c.lineWidth=1;c.strokeRect(l+.5,t+.5,w-1,h-1);}else{c.fillStyle=css(color);c.fillRect(l,t,w,h);}
  c.restore();
 }
 line(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,width=1){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.strokeStyle=css(color);c.lineWidth=width;c.beginPath();c.moveTo(x1-this.vx,y1-this.vy);c.lineTo(x2-this.vx,y2-this.vy);c.stroke();c.restore();
 }
 lineColor(x1:number,y1:number,x2:number,y2:number,color1:number,color2:number,alpha:number){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const gradient=c.createLinearGradient(x1-this.vx,y1-this.vy,x2-this.vx,y2-this.vy);gradient.addColorStop(0,css(color1));gradient.addColorStop(1,css(color2));
  c.strokeStyle=gradient;c.lineWidth=1;c.beginPath();c.moveTo(x1-this.vx,y1-this.vy);c.lineTo(x2-this.vx,y2-this.vy);c.stroke();c.restore();
 }
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean){
  if(r<=0)return;const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.beginPath();c.arc(x-this.vx,y-this.vy,r,0,Math.PI*2);
  if(outline){c.strokeStyle=css(color);c.stroke();}else{c.fillStyle=css(color);c.fill();}
  c.restore();
 }
 triangle(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,color:number,alpha:number,outline:boolean){if(!outline){this.triangleColor(x1,y1,x2,y2,x3,y3,color,color,color,alpha);return;}const ctx=this.ctx;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.beginPath();ctx.moveTo(x1-this.vx,y1-this.vy);ctx.lineTo(x2-this.vx,y2-this.vy);ctx.lineTo(x3-this.vx,y3-this.vy);ctx.closePath();ctx.strokeStyle=css(color);ctx.stroke();ctx.restore();}
 /** string_width: the widest line in the font, in pixels. */
 textWidth(fontName:string,text:string){
  const font=this.assets.font(fontName);if(!font)return 0;
  return Math.max(0,...text.split('\n').map(line=>[...line].reduce((n,ch)=>n+(this.glyph(font,ch.charCodeAt(0))?.advance??0),0)));
 }
 text(x:number,y:number,text:string,style:TextStyle){
  const font=this.assets.font(style.font);if(!font||style.alpha<=0)return;
  const lines=text.split('\n');
  const glyphs=(line:string)=>[...line].map(ch=>this.glyph(font,ch.charCodeAt(0)));
  const width=(line:string)=>glyphs(line).reduce((n,g)=>n+(g?g.advance:0),0);
  const lineHeight=font.kind==='bitmap'?font.size:(this.assets.sprite(font.sprite)?.height??0);
  this.place(x,y,style.xscale,style.yscale,style.angle,style.alpha);
  let cy=style.valign===1?-lines.length*lineHeight/2:style.valign===2?-lines.length*lineHeight:0;
  for(const line of lines){
   let cx=style.halign===1?-width(line)/2:style.halign===2?-width(line):0;
   for(const g of glyphs(line)){if(g){g.draw(cx,cy,style.color,style.colorBottom??style.color);cx+=g.advance;}}
   cy+=lineHeight;
  }
  this.ctx.restore();
 }
 private glyph(font:FontData,code:number):{advance:number;draw:(x:number,y:number,color:number,bottom:number)=>void}|null{
  if(font.kind==='bitmap'){
   const g=font.glyphs[code];if(!g)return null;
   const f:FrameRef={page:font.page,sx:font.sx+g.x,sy:font.sy+g.y,sw:g.w,sh:g.h,tx:0,ty:0,tw:g.w,th:g.h};
   return {advance:g.shift,draw:(x,y,color,bottom)=>this.blit(f,x+g.offset,y,color,bottom)};
  }
  const k=font.map.indexOf(String.fromCharCode(code));const s=this.assets.sprite(font.sprite);if(k<0||!s)return null;
  const f=s.frames[k];if(!f)return null;
  const advance=(font.proportional?(f.tw||f.sw)+f.tx:s.width)+font.sep;
  return {advance,draw:(x,y,color,bottom)=>this.blit(f,font.proportional?x-f.tx:x,y,color,bottom)};
 }
}
