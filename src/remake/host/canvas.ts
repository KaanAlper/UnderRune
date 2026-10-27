// Draws the remake's GameMaker draw calls on a 2D canvas: sprite frames cut from texture pages, GameMaker's
// colour blend (multiply), rotation (counter-clockwise degrees), scale and alpha, rectangles, circles and
// bitmap or sprite fonts. Coordinates are room coordinates; the view offset is applied here.
import type {BlendMode,GmGraphics,TextStyle} from '../gm/graphics';
import type {NineSlice} from '../gm/sprites';
import {compositeAddRows} from './row-pixel-kernel';

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
const MULTIPLY_BYTES=Uint8Array.from({length:65536},(_,i)=>Math.round((i>>8)*(i&255)/255));

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
 private writeAlpha=true;
 private mode:BlendMode='normal';
 private testAlpha=false;
 private raster:CanvasRenderingContext2D|null=null;
 private scratch:HTMLCanvasElement|null=null;
 private surfacePixels=new Map<number,ImageData>();
 private dirtySurfaces=new Set<number>();
 private rasterSize:{width:number;height:number}|null=null;
 private opaqueFrames=new WeakMap<FrameRef,boolean>();
 private framePixels=new WeakMap<FrameRef,ImageData>();
 private frameSpans=new WeakMap<ImageData,Int32Array>();
 private stackedFrames=new WeakMap<FrameRef,Map<number,ImageData>>();
 private solidImages=new WeakSet<ImageData>();
 /** Only proven fully opaque Canvas targets may use native multiply/add compositing. */
 private gpuOpaque=new Set<number>();
 private byteTints=new Map<string,Uint8Array>();
 private radialPatches=new Map<string,ImageData>();
 private radialPatchBytes=0;
 private triCanvas:HTMLCanvasElement|null=null;
 private triCtx:CanvasRenderingContext2D|null=null;
 private pendingCircles=new Map<number,[number,number,number,number,number][]>();
 private distMaps=new Map<string,{dist:Uint16Array;maxD:number}>();
 private surfacePeriod=new Map<number,string>();
 private sampleClip:{r:number;b:number}|null=null;
 private clearedZero=new Set<number>();
 private pendingTiles=new Map<number,{args:unknown[];count:number}>();
 private readonly aLut=new Uint8Array(256);
 private readonly dLut=new Float64Array(256);
 private readonly sRLut=new Float64Array(256);
 private readonly sGLut=new Float64Array(256);
 private readonly sBLut=new Float64Array(256);
 private readonly wLut=new Uint8Array(256);
 constructor(ctx:CanvasRenderingContext2D,assets:DrawAssets,readonly view:{x:number;y:number}){
  this.screen=ctx;this.pages=[...assets.pages];this.assets={...assets,pages:this.pages,sprite:name=>this.generated.get(name)??assets.sprite(name)};
  // Scope complete drawing operations, including nine-slice, fonts, fog and cropped/tiled sprites. Nested
  // calls reuse the same raster target; captures, target changes and resource lifetime methods stay direct.
  for(const key of ['sprite','spritePart','spritePos','spriteFog','spriteTiled','rect','line','lineColor','circle','circleColor','triangle','triangleColor','text'] as const){
   const draw=this[key].bind(this) as (...args:unknown[])=>void;
   Object.defineProperty(this,key,{value:(...args:unknown[])=>this.paint(()=>draw(...args),()=>this.bounds(key,args),key,args)});
  }
 }
 private get targetContext(){return this.raster??(this.targetSurface===null?this.screen:this.surfaces.get(this.targetSurface)!.getContext('2d')!);}
 /** Public context reads observe all queued surface draws; internal drawing keeps raw RGBA authoritative. */
 get ctx(){if(!this.raster&&this.targetSurface!==null)this.flushSurface(this.targetSurface);return this.targetContext;}
 private flushTiles(id:number){
  const item=this.pendingTiles.get(id);if(!item)return;
  this.pendingTiles.delete(id);
  const {args,count}=item,s=this.assets.sprite(args[0] as string);if(!s)return;
  const a=args as number[],f=frameAt(s,a[7]??0),w=s.width*a[3],h=s.height*a[4];if(!f||w<=0||h<=0)return;
  const base=this.readFrame(f);let image=base;
  if(count>1){
   let map=this.stackedFrames.get(f);if(!map){map=new Map();this.stackedFrames.set(f,map);}
   let stacked=map.get(count);
   if(!stacked){
    stacked=new ImageData(f.sw,f.sh);const src=base.data,dst=stacked.data;
    for(let i=0;i<src.length;i+=4){
     const aByte=src[i+3];if(aByte===0)continue;
     const sa=aByte/255,rStep=Math.round(src[i]*sa),gStep=Math.round(src[i+1]*sa),bStep=Math.round(src[i+2]*sa),saSq=sa*sa;
     let r=rStep,g=gStep,b=bStep,al=Math.round(255*saSq);
     for(let k=1;k<count;k++){r=Math.min(255,r+rStep);g=Math.min(255,g+gStep);b=Math.min(255,b+bStep);al=Math.min(255,Math.round(255*(saSq+al/255)));}
     dst[i]=r;dst[i+1]=g;dst[i+2]=b;dst[i+3]=al;
    }
    this.frameSpans.set(stacked,this.frameSpans.get(base)!);
    map.set(count,stacked);
   }
   image=stacked;
  }
  const prevSurf=this.targetSurface,prevMode=this.mode,prevWrite=this.writeAlpha;
  this.targetSurface=id;this.mode='normal';this.writeAlpha=true;
  try{
   const vx=0,vy=0,surface=this.surfaces.get(id)!,width=surface.width,height=surface.height,startX=a[1]-Math.ceil((a[1]-vx)/w)*w,startY=a[2]-Math.ceil((a[2]-vy)/h)*h;
   const pKey=`${w}:${h}`;
   if(Number.isInteger(w)&&Number.isInteger(h)&&(w<width||h<height)){
    const pw=Math.min(width,w),ph=Math.min(height,h);
    this.sampleClip={r:pw,b:ph};
    try{for(let y=startY;y<vy+ph;y+=h)for(let x=startX;x<vx+pw;x+=w)this.sample(image,0,0,f.sw,f.sh,x+f.tx*a[3],y+f.ty*a[4],a[3]*(f.tw||f.sw)/f.sw,a[4]*(f.th||f.sh)/f.sh,0xffffff,1,false,count>1);}finally{this.sampleClip=null;}
    const u32=new Uint32Array(this.pixels(id).data.buffer);
    for(let y=0;y<ph;y++){const row=y*width;for(let x=pw;x<width;x+=pw)u32.copyWithin(row+x,row,row+Math.min(pw,width-x));}
    for(let y=ph;y<height;y++)u32.copyWithin(y*width,(y%ph)*width,(y%ph)*width+width);
    this.dirtySurfaces.add(id);this.surfacePeriod.set(id,pKey);
   }else{
    for(let y=startY;y<vy+height;y+=h)for(let x=startX;x<vx+width;x+=w)this.sample(image,0,0,f.sw,f.sh,x+f.tx*a[3],y+f.ty*a[4],a[3]*(f.tw||f.sw)/f.sw,a[4]*(f.th||f.sh)/f.sh,0xffffff,1,false,count>1);
   }
  }finally{this.targetSurface=prevSurf;this.mode=prevMode;this.writeAlpha=prevWrite;}
 }
 private flushCircles(id:number){
  this.flushTiles(id);
  const list=this.pendingCircles.get(id);if(!list||!list.length)return;
  this.pendingCircles.delete(id);this.surfacePeriod.delete(id);
  const image=this.pixels(id),w=image.width,h=image.height,cx0=list[0][0],cy0=list[0][1];
  let sameCenter=true;for(let i=1;i<list.length;i++)if(list[i][0]!==cx0||list[i][1]!==cy0){sameCenter=false;break;}
  if(sameCenter){
   const key=`${cx0}:${cy0}:${w}:${h}`;let entry=this.distMaps.get(key);
   if(!entry){
    const dist=new Uint16Array(w*h);let maxD=0;
    for(let y=0,p=0;y<h;y++){const dy=y+.5-cy0,dy2=dy*dy;for(let x=0;x<w;x++,p++){const dx=x+.5-cx0,d=Math.min(65535,Math.round(Math.sqrt(dx*dx+dy2)*8));dist[p]=d;if(d>maxD)maxD=d;}}
    if(this.distMaps.size>=8)this.distMaps.clear();
    entry={dist,maxD};this.distMaps.set(key,entry);
   }
   const {dist,maxD}=entry,lutR=new Uint8Array(maxD+1).fill(255),lutG=new Uint8Array(maxD+1).fill(255),lutB=new Uint8Array(maxD+1).fill(255),mul=MULTIPLY_BYTES;
   for(const [,,r,c1,c2] of list){
    if(r<=0)continue;
    const r1=c1&255,g1=(c1>>8)&255,b1=(c1>>16)&255,r2=c2&255,g2=(c2>>8)&255,b2=(c2>>16)&255,r8=r*8,limit=Math.min(maxD,Math.floor(r8));
    for(let d=0;d<=limit;d++){
     const t=d/r8,cr=Math.round(r1+(r2-r1)*t),cg=Math.round(g1+(g2-g1)*t),cb=Math.round(b1+(b2-b1)*t);
     lutR[d]=mul[(lutR[d]<<8)|cr];lutG[d]=mul[(lutG[d]<<8)|cg];lutB[d]=mul[(lutB[d]<<8)|cb];
    }
   }
   const data=image.data,u32=new Uint32Array(data.buffer,data.byteOffset,w*h),n=w*h;
   for(let p=0,i=0;p<n;p++,i+=4){
    if((u32[p]&0x00ffffff)===0)continue;
    const d=dist[p];data[i]=mul[(data[i]<<8)|lutR[d]];data[i+1]=mul[(data[i+1]<<8)|lutG[d]];data[i+2]=mul[(data[i+2]<<8)|lutB[d]];
   }
   this.dirtySurfaces.add(id);return;
  }
  const mul=MULTIPLY_BYTES,data=image.data;
  for(const [cx,cy,r,c1,c2] of list){
   if(r<=0)continue;
   const r1=c1&255,g1=(c1>>8)&255,b1=(c1>>16)&255,r2=c2&255,g2=(c2>>8)&255,b2=(c2>>16)&255;
   const l=Math.max(0,Math.floor(cx-r)),t=Math.max(0,Math.floor(cy-r)),right=Math.min(w,Math.ceil(cx+r)),b=Math.min(h,Math.ceil(cy+r)),rSq=r*r;
   for(let y=t;y<b;y++){
    const dy=y+.5-cy,dy2=dy*dy;
    for(let x=l;x<right;x++){
     const dx=x+.5-cx,d2=dx*dx+dy2;if(d2>rSq)continue;
     const u=Math.sqrt(d2)/r,cr=Math.round(r1+(r2-r1)*u),cg=Math.round(g1+(g2-g1)*u),cb=Math.round(b1+(b2-b1)*u),i=(y*w+x)*4;
     data[i]=mul[(data[i]<<8)|cr];data[i+1]=mul[(data[i+1]<<8)|cg];data[i+2]=mul[(data[i+2]<<8)|cb];
    }
   }
  }
  this.dirtySurfaces.add(id);
 }
 private flushSurface(id:number){
  this.flushCircles(id);
  if(!this.dirtySurfaces.has(id))return;
  const surface=this.surfaces.get(id),pixels=this.surfacePixels.get(id);
  if(!surface||!pixels)throw Error('Missing dirty surface');
  surface.getContext('2d')!.putImageData(pixels,0,0);this.dirtySurfaces.delete(id);
 }
 private get vx(){return this.targetSurface===null?this.view.x:0;}
 private get vy(){return this.targetSurface===null?this.view.y:0;}
 surfaceCreate(id:number,width:number,height:number){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d',{willReadFrequently:true})!.imageSmoothingEnabled=false;this.surfaces.set(id,canvas);this.surfacePixels.delete(id);this.dirtySurfaces.delete(id);this.gpuOpaque.delete(id);}
 surfaceTarget(id:number|null){if(id!==null&&!this.surfaces.has(id))throw Error('Missing surface');this.targetSurface=id;this.targetContext.globalCompositeOperation=this.composite;}
 blendMode(mode:BlendMode){
  this.mode=mode;this.composite=mode==='add'?'lighter':'source-over';
  this.targetContext.globalCompositeOperation=this.composite;
 }
 alphaTest(enabled:boolean){this.testAlpha=enabled;}
 alphaWrite(enabled:boolean){this.writeAlpha=enabled;}
 /** Clears the covered pixels of the current target (room coordinates on the screen, surface coordinates otherwise). */
 private erase(inside:(x:number,y:number)=>boolean,left:number,top:number,right:number,bottom:number){
  const ctx=this.targetContext,w=ctx.canvas.width,h=ctx.canvas.height,l=Math.max(0,Math.floor(left-this.vx)),t=Math.max(0,Math.floor(top-this.vy)),r=Math.min(w,Math.ceil(right-this.vx)),b=Math.min(h,Math.ceil(bottom-this.vy));
  if(r<=l||b<=t)return;
  // The screen is read back only where it is covered (a whole-screen readback costs milliseconds).
  const screen=this.targetSurface===null,image=screen?ctx.getImageData(l,t,r-l,b-t):this.pixels(this.targetSurface!),d=image.data,iw=screen?r-l:w,ox=screen?l:0,oy=screen?t:0;
  for(let y=t;y<b;y++)for(let x=l;x<r;x++)if(inside(x+.5+this.vx,y+.5+this.vy)){const i=((y-oy)*iw+x-ox)*4;d[i]=0;d[i+1]=0;d[i+2]=0;d[i+3]=0;}
  if(!screen){this.dirtySurfaces.add(this.targetSurface!);this.surfacePeriod.delete(this.targetSurface!);}
  else ctx.putImageData(image,l,t);
 }
 eraseRect(x1:number,y1:number,x2:number,y2:number){
  const l=Math.min(x1,x2),t=Math.min(y1,y2),r=Math.max(x1,x2)+1,b=Math.max(y1,y2)+1;this.erase(()=>true,l,t,r,b);
 }
 eraseTriangle(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number){
  const det=(x2-x1)*(y3-y1)-(x3-x1)*(y2-y1);if(!det)return;
  this.erase((x,y)=>{const u=((x-x1)*(y3-y1)-(y-y1)*(x3-x1))/det,v=((x2-x1)*(y-y1)-(y2-y1)*(x-x1))/det;return u>=0&&v>=0&&u+v<=1;},
   Math.min(x1,x2,x3),Math.min(y1,y2,y3),Math.max(x1,x2,x3),Math.max(y1,y2,y3));
 }
 private bounds(key:string,args:unknown[]):Bounds|null{
  const a=args as number[],box=(left:number,top:number,right:number,bottom:number):Bounds=>({left:left-this.vx,top:top-this.vy,right:right-this.vx,bottom:bottom-this.vy});
  if(key==='sprite'||key==='spriteFog'){
   const s=this.assets.sprite(args[0] as string);if(!s)return box(0,0,0,0);
   const x=a[2],y=a[3],xs=a[4],ys=a[5],angle=-a[6]*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle),points=[];
   for(const xx of [-s.originX,s.width-s.originX])for(const yy of [-s.originY,s.height-s.originY])points.push({x:x+xx*xs*co-yy*ys*si,y:y+xx*xs*si+yy*ys*co});
   return box(Math.min(...points.map(p=>p.x))-1,Math.min(...points.map(p=>p.y))-1,Math.max(...points.map(p=>p.x))+1,Math.max(...points.map(p=>p.y))+1);
  }
  if(key==='spritePos')return box(Math.min(a[2],a[4],a[6],a[8]),Math.min(a[3],a[5],a[7],a[9]),Math.max(a[2],a[4],a[6],a[8]),Math.max(a[3],a[5],a[7],a[9]));
  if(key==='spritePart'){const x=a[6],y=a[7],right=x+a[4]*a[8],bottom=y+a[5]*a[9];return box(Math.min(x,right)-1,Math.min(y,bottom)-1,Math.max(x,right)+1,Math.max(y,bottom)+1);}
  if(key==='rect'||key==='line'||key==='lineColor'){const pad=key==='line'?(a[6]??1)/2+1:1;return box(Math.min(a[0],a[2])-pad,Math.min(a[1],a[3])-pad,Math.max(a[0],a[2])+pad+1,Math.max(a[1],a[3])+pad+1);}
  if(key==='circle'||key==='circleColor')return box(a[0]-a[2]-1,a[1]-a[2]-1,a[0]+a[2]+1,a[1]+a[2]+1);
  if(key==='triangle'||key==='triangleColor')return box(Math.min(a[0],a[2],a[4])-1,Math.min(a[1],a[3],a[5])-1,Math.max(a[0],a[2],a[4])+1,Math.max(a[1],a[3],a[5])+1);
  return null; // Tiling and text can span the target; glyph overhangs are not bounded by advances.
 }
 /** RGB from alpha-zero atlas texels is irrecoverable through Canvas decoding. Reject the modes that need
  * it rather than guessing. Opaque primitives and raw surface pixels do retain everything those modes need. */
 private checkRasterSource(key:string,args:unknown[]){
  if(this.testAlpha||!['subtract','dest-alpha-add','dest-alpha-copy'].includes(this.mode))return;
  const alphaIndex:Record<string,number>={sprite:8,spriteFog:8,spritePart:11,spritePos:10,spriteTiled:6,rect:5,line:5,lineColor:6,circle:4,triangle:7,triangleColor:9};
  if(args[alphaIndex[key]]===0||key==='text')throw Error('Canvas blend mode needs raw RGB for alpha-zero fragments');
  if(!key.startsWith('sprite'))return;
  const s=this.assets.sprite(args[0] as string),f=s&&frameAt(s,key==='spriteTiled'?(args[7] as number??0):args[1] as number);if(!f)return;
  let opaque=this.opaqueFrames.get(f);
  if(opaque===undefined){
   const pixels=this.readFrame(f).data;
   opaque=true;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0){opaque=false;break;}this.opaqueFrames.set(f,opaque);
  }
  const direct=(key==='spriteTiled'||key==='sprite'&&args[6]===0&&!s?.nineSlice?.enabled)&&!this.targetContext.imageSmoothingEnabled;
  if(!opaque&&!(f.alphaZeroRgb==='black'&&(direct||this.mode==='subtract'&&key!=='spriteFog')))throw Error('Canvas blend mode needs verified raw atlas RGB for alpha-zero texels');
 }
 private readFrame(f:FrameRef){
  let image=this.framePixels.get(f);if(image)return image;
  const canvas=document.createElement('canvas');canvas.width=f.sw;canvas.height=f.sh;const c=canvas.getContext('2d',{willReadFrequently:true})!;
  c.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,0,0,f.sw,f.sh);image=c.getImageData(0,0,f.sw,f.sh);this.framePixels.set(f,image);
  const d=image.data,spans=new Int32Array(f.sh*2);let solid=true;
  for(let y=0;y<f.sh;y++){
   let minX=f.sw,maxX=-1,row=y*f.sw*4;
   for(let x=0;x<f.sw;x++){const a=d[row+x*4+3];if(a!==255)solid=false;if(a!==0){if(x<minX)minX=x;maxX=x;}}
   spans[y*2]=minX;spans[y*2+1]=maxX;
  }
  this.frameSpans.set(image,spans);
  if(solid)this.solidImages.add(image);return image;
 }
 private directSprite(key:string,args:unknown[]){
  if(this.targetContext.imageSmoothingEnabled)return false;
  if(key==='spritePart'){
   const a=args as number[],s=this.assets.sprite(args[0] as string);if(!s||a[11]<=0||a[4]<=0||a[5]<=0)return true;
   const f=frameAt(s,a[1]);if(!f)return true;
   const tw=f.tw||f.sw,th=f.th||f.sh,l=Math.max(a[2],f.tx),t=Math.max(a[3],f.ty),r=Math.min(a[2]+a[4],f.tx+tw),b=Math.min(a[3]+a[5],f.ty+th);
   if(r>l&&b>t)this.sample(this.readFrame(f),(l-f.tx)*f.sw/tw,(t-f.ty)*f.sh/th,(r-l)*f.sw/tw,(b-t)*f.sh/th,a[6]+(l-a[2])*a[8],a[7]+(t-a[3])*a[9],a[8]*tw/f.sw,a[9]*th/f.sh,a[10],a[11]);return true;
  }
  if(key==='spriteTiled'){
   const s=this.assets.sprite(args[0] as string);if(!s)return true;
   const a=args as number[],f=frameAt(s,a[7]??0),w=s.width*a[3],h=s.height*a[4];if(!f||w<=0||h<=0)return true;
   const image=this.readFrame(f),vx=this.vx,vy=this.vy,ctx=this.targetContext,width=ctx.canvas.width,height=ctx.canvas.height,startX=a[1]-Math.ceil((a[1]-vx)/w)*w,startY=a[2]-Math.ceil((a[2]-vy)/h)*h;
   const id=this.targetSurface,pKey=`${w}:${h}`,period=id!==null&&!this.raster?this.surfacePeriod.get(id):undefined;
   if(id!==null&&(period==='0:0'||period===pKey)&&Number.isInteger(w)&&Number.isInteger(h)&&(w<width||h<height)){
    const pw=Math.min(width,w),ph=Math.min(height,h);
    this.sampleClip={r:pw,b:ph};
    try{for(let y=startY;y<vy+ph;y+=h)for(let x=startX;x<vx+pw;x+=w)this.sample(image,0,0,f.sw,f.sh,x+f.tx*a[3],y+f.ty*a[4],a[3]*(f.tw||f.sw)/f.sw,a[4]*(f.th||f.sh)/f.sh,a[5],a[6]);}finally{this.sampleClip=null;}
    const u32=new Uint32Array(this.pixels(id).data.buffer);
    for(let y=0;y<ph;y++){const row=y*width;for(let x=pw;x<width;x+=pw)u32.copyWithin(row+x,row,row+Math.min(pw,width-x));}
    for(let y=ph;y<height;y++)u32.copyWithin(y*width,(y%ph)*width,(y%ph)*width+width);
    this.dirtySurfaces.add(id);this.surfacePeriod.set(id,pKey);return true;
   }
   if(id!==null)this.surfacePeriod.delete(id);
   // Keep each tile's rectangular coverage, including verified black RGB at alpha zero. Destination-alpha
   // factors must still run for those texels; merging tiles through Canvas source-over would lose them.
   for(let y=startY;y<vy+height;y+=h)for(let x=startX;x<vx+width;x+=w)this.sample(image,0,0,f.sw,f.sh,x+f.tx*a[3],y+f.ty*a[4],a[3]*(f.tw||f.sw)/f.sw,a[4]*(f.th||f.sh)/f.sh,a[5],a[6]);return true;
  }
  if((key!=='sprite'&&key!=='spriteFog')||args[6]!==0)return false;
  const s=this.assets.sprite(args[0] as string);if(!s||(key==='sprite'&&s.nineSlice?.enabled))return false;
  const a=args as number[],f=frameAt(s,a[1]);if(!f)return true;
  // Point-filtered, axis-aligned quads need no Canvas raster/readback. Atlas trimming, origins, mirrored
  // scale, tint and source alpha are applied to raw texels before the same GPU blend equations.
  this.sample(this.readFrame(f),0,0,f.sw,f.sh,a[2]+(f.tx-s.originX)*a[4],a[3]+(f.ty-s.originY)*a[5],a[4]*(f.tw||f.sw)/f.sw,a[5]*(f.th||f.sh)/f.sh,a[7],a[8],key==='spriteFog');return true;
 }
 /** A rotated, point-filtered sprite straight from its raw texels: each covered pixel centre is mapped back into the
  * frame (the inverse of translate, rotate, scale), tinted and blended. It replaces drawing it on a scratch canvas
  * and reading that back, which cost a readback per sprite (the Knight's slashes draw dozens a frame). */
 private rotatedSprite(key:string,args:unknown[],bounds:()=>Bounds|null){
  if((key!=='sprite'&&key!=='spriteFog')||this.targetContext.imageSmoothingEnabled)return false;
  const s=this.assets.sprite(args[0] as string);if(!s||(key==='sprite'&&s.nineSlice?.enabled))return false;
  const a=args as number[],f=frameAt(s,a[1]);if(!f)return true;
  const xs=a[4],ys=a[5],alpha=Math.max(0,Math.min(1,a[8]));if(!xs||!ys||alpha<=0)return true;
  const area=bounds();if(!area)return false;
  const target=this.targetContext,w=target.canvas.width,h=target.canvas.height;
  const left=Math.max(0,Math.floor(area.left)),top=Math.max(0,Math.floor(area.top)),right=Math.min(w,Math.ceil(area.right)),bottom=Math.min(h,Math.ceil(area.bottom));
  if(right<=left||bottom<=top)return true;
  const tex=this.readFrame(f),src=tex.data,tw=f.tw||f.sw,th=f.th||f.sh,ux=f.sw/tw,uy=f.sh/th;
  const rad=-a[6]*Math.PI/180,co=Math.cos(rad),si=Math.sin(rad),tx=a[2]-this.vx,ty=a[3]-this.vy;
  const fog=key==='spriteFog',fr=a[7]&255,fg=(a[7]>>8)&255,fb=(a[7]>>16)&255,tr=fr/255,tg=fg/255,tb=fb/255;
  const screen=this.targetSurface===null,image=screen?target.getImageData(left,top,right-left,bottom-top):this.pixels(this.targetSurface!),dst=image.data,iw=screen?right-left:w,ox=screen?left:0,oy=screen?top:0;
  const normalWrite=this.mode==='normal'&&this.writeAlpha,addWrite=this.mode==='add'&&this.writeAlpha,saSq255=255*alpha*alpha;
  for(let y=top;y<bottom;y++){
   const dy=y+.5-ty,dySi=dy*si,dyCo=dy*co;
   for(let x=left;x<right;x++){
    const dx=x+.5-tx,lx=(dx*co+dySi)/xs,ly=(-dx*si+dyCo)/ys;
    const u=Math.floor((lx+s.originX-f.tx)*ux),v=Math.floor((ly+s.originY-f.ty)*uy);
    if(u<0||v<0||u>=f.sw||v>=f.sh)continue;
    const j=(v*f.sw+u)*4,aByte=src[j+3];if(aByte===0)continue;
    const sa=aByte===255?alpha:aByte/255*alpha;if(sa===0)continue;
    const r=fog?fr:Math.round(src[j]*tr),g=fog?fg:Math.round(src[j+1]*tg),b=fog?fb:Math.round(src[j+2]*tb),i=((y-oy)*iw+x-ox)*4;
    if(sa===1&&normalWrite){dst[i]=r;dst[i+1]=g;dst[i+2]=b;dst[i+3]=255;continue;}
    if(aByte===255&&addWrite){dst[i]=Math.round(r*sa+dst[i]);dst[i+1]=Math.round(g*sa+dst[i+1]);dst[i+2]=Math.round(b*sa+dst[i+2]);dst[i+3]=Math.round(saSq255+dst[i+3]);continue;}
    this.pixel(dst,i,r,g,b,sa);
   }
  }
  if(!screen){this.dirtySurfaces.add(this.targetSurface!);return true;}
  target.putImageData(image,left,top);return true;
 }
 private pixel(dst:Uint8ClampedArray,i:number,r:number,g:number,b:number,sa:number){
  if(this.testAlpha&&sa===0)return;
  const da=dst[i+3]/255,keepAlpha=this.writeAlpha?-1:dst[i+3];
  this.blendPixel(dst,i,r,g,b,sa,da);
  if(keepAlpha>=0)dst[i+3]=keepAlpha;
 }
 private blendPixel(dst:Uint8ClampedArray,i:number,r:number,g:number,b:number,sa:number,da:number){
  // bm_zero, bm_src_color: the target times the source colour (alpha times the source's alpha).
  if(this.mode==='multiply'){dst[i]=Math.round(dst[i]*r/255);dst[i+1]=Math.round(dst[i+1]*g/255);dst[i+2]=Math.round(dst[i+2]*b/255);dst[i+3]=Math.round(dst[i+3]*sa);return;}
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
  if(this.targetSurface!==null){
   const id=this.targetSurface;
   if(key==='spriteTiled'&&!this.targetContext.imageSmoothingEnabled&&!this.testAlpha&&this.writeAlpha){
    const a=args as number[],s=this.assets.sprite(args[0] as string),f=s&&frameAt(s,a[7]??0);
    if(s&&f&&a[3]>0&&a[4]>0&&a[5]===0xffffff&&a[6]===1&&f.tx>=0&&f.ty>=0&&f.tx+(f.tw||f.sw)<=s.width&&f.ty+(f.th||f.sh)<=s.height){
     if(this.mode==='normal'&&this.clearedZero.has(id)){
      this.clearedZero.delete(id);this.pendingTiles.set(id,{args:[...args],count:1});return;
     }
     const pending=this.pendingTiles.get(id);
     if(this.mode==='add'&&pending&&pending.args[0]===args[0]&&pending.args[1]===a[1]&&pending.args[2]===a[2]&&pending.args[3]===a[3]&&pending.args[4]===a[4]&&(pending.args[7]??0)===(a[7]??0)){
      pending.count++;return;
     }
    }
   }
   this.clearedZero.delete(id);
   if(key==='circleColor'&&this.mode==='multiply'&&this.writeAlpha&&(args as number[])[5]===1){
    this.flushTiles(id);
    const a=args as number[];let list=this.pendingCircles.get(id);
    if(!list){list=[];this.pendingCircles.set(id,list);}
    list.push([a[0]-this.vx,a[1]-this.vy,a[2],a[3],a[4]]);return;
   }
   this.flushCircles(id);
   if(key!=='spriteTiled')this.surfacePeriod.delete(id);
  }
  if(this.opaqueSurfacePass(draw,key,args))return;
  if(!this.testAlpha&&(this.mode==='add-preserve-alpha'||this.mode==='normal-preserve-alpha'))throw Error('Custom blend drawing requires alpha testing in the Canvas backend');
  this.checkRasterSource(key,args);
  if(this.targetSurface!==null&&key==='rect'&&args.slice(0,4).every(Number.isInteger)&&!args[6]&&args[5]===1&&this.mode==='normal'&&this.writeAlpha){
   const a=args as number[],image=this.pixels(this.targetSurface),data=new Uint32Array(image.data.buffer),l=Math.max(0,Math.ceil(Math.min(a[0],a[2])-.5)),t=Math.max(0,Math.ceil(Math.min(a[1],a[3])-.5)),r=Math.min(image.width,Math.ceil(Math.max(a[0],a[2])+.5)),b=Math.min(image.height,Math.ceil(Math.max(a[1],a[3])+.5));
   const color=(0xff000000|a[4])>>>0;for(let y=t;y<b;y++)if(r>l)data.fill(color,y*image.width+l,y*image.width+r);this.dirtySurfaces.add(this.targetSurface);return;
  }
  if(this.targetSurface!==null&&(key==='triangleColor'||key==='triangle'&&!args[8])){
   const a=args as number[];this.surfaceTriangle(a[0],a[1],a[2],a[3],a[4],a[5],a[6],key==='triangle'?a[6]:a[7],key==='triangle'?a[6]:a[8],key==='triangle'?a[7]:a[9]);return;
  }
  if(this.directSprite(key,args))return;
  if(this.rotatedSprite(key,args,bounds))return;
  const target=this.targetContext,w=target.canvas.width,h=target.canvas.height;
  if(!w||!h)return;
  const area=bounds(),left=Math.max(0,Math.floor(area?.left??0)),top=Math.max(0,Math.floor(area?.top??0)),right=Math.min(w,Math.ceil(area?.right??w)),bottom=Math.min(h,Math.ceil(area?.bottom??h)),sw=right-left,sh=bottom-top;
  if(sw<=0||sh<=0)return;
  // The roar repeats the same full-screen radial mask every frame. Cache its exact Canvas raster,
  // keeping native quantization and edge coverage while avoiding repeated gradient raster/readback.
  const radialKey=key==='circleColor'?[...args,left,top,sw,sh,this.vx,this.vy].join(':'):undefined;
  let patch=radialKey?this.radialPatches.get(radialKey):undefined;
  if(!patch){
   const scratch=this.scratch??(this.scratch=document.createElement('canvas'));
   if(scratch.width!==sw||scratch.height!==sh){scratch.width=sw;scratch.height=sh;}
   const source=scratch.getContext('2d',{willReadFrequently:true})!;
   source.setTransform(1,0,0,1,0,0);source.clearRect(0,0,sw,sh);source.setTransform(1,0,0,1,-left,-top);source.globalCompositeOperation='source-over';source.imageSmoothingEnabled=target.imageSmoothingEnabled;
   this.raster=source;this.rasterSize={width:w,height:h};
   try{draw();}finally{this.raster=null;this.rasterSize=null;}
   patch=source.getImageData(0,0,sw,sh);
   if(radialKey&&patch.data.byteLength<=8*1024*1024){
    while(this.radialPatches.size>=8||this.radialPatchBytes+patch.data.byteLength>8*1024*1024){const oldest=this.radialPatches.keys().next().value!;this.radialPatchBytes-=this.radialPatches.get(oldest)!.data.byteLength;this.radialPatches.delete(oldest);}
    this.radialPatches.set(radialKey,patch);this.radialPatchBytes+=patch.data.byteLength;
   }
  }else if(radialKey){this.radialPatches.delete(radialKey);this.radialPatches.set(radialKey,patch);}
  const src=patch.data;
  // The screen is read back only under the patch (a whole-screen readback costs milliseconds).
  const screen=this.targetSurface===null,image=screen?target.getImageData(left,top,sw,sh):this.pixels(this.targetSurface!),dst=image.data,iw=screen?sw:w,ox=screen?left:0,oy=screen?top:0;
  if(this.mode==='multiply'){
   // RGBA8 multiplication is exact with a byte lookup, without a method call and mode dispatch per fragment.
   const mul=MULTIPLY_BYTES,write=this.writeAlpha;
   for(let row=0;row<sh;row++)for(let col=0;col<sw;col++){
    const j=(row*sw+col)*4;if(src[j+3]===0)continue;const i=((top+row-oy)*iw+left+col-ox)*4;
    dst[i]=mul[(dst[i]<<8)|src[j]];dst[i+1]=mul[(dst[i+1]<<8)|src[j+1]];dst[i+2]=mul[(dst[i+2]<<8)|src[j+2]];if(write)dst[i+3]=mul[(dst[i+3]<<8)|src[j+3]];
   }
   if(!screen)this.dirtySurfaces.add(this.targetSurface!);else target.putImageData(image,left,top);return;
  }
  // Native gl_common.c uses ZERO, ONE_MINUS_SRC_COLOR for bm_subtract. Both separate-alpha modes use
  // SRC_ALPHA, DST_ALPHA for alpha; Canvas source-atop has different RGB factors and cannot represent them.
  for(let row=0;row<sh;row++)for(let col=0;col<sw;col++){
   const j=(row*sw+col)*4,i=((top+row-oy)*iw+left+col-ox)*4,sa=src[j+3]/255;
   // Source validation above proves zero-alpha samples here are outside the covered geometry whenever
   // the blend mode depends on RGB even at zero alpha. Ordinary blending also leaves these pixels alone.
   if(sa===0)continue;
   this.pixel(dst,i,src[j],src[j+1],src[j+2],sa);
  }
  if(!screen){this.dirtySurfaces.add(this.targetSurface!);return;}
  target.putImageData(image,left,top);
 }
 private pixels(id:number){
  this.flushCircles(id);
  this.gpuOpaque.delete(id);
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing surface');
  let pixels=this.surfacePixels.get(id);if(!pixels){pixels=surface.getContext('2d')!.getImageData(0,0,surface.width,surface.height);this.surfacePixels.set(id,pixels);}return pixels;
 }
 /** Opaque full-target tiles and fully covering opaque gradients have the same RGBA equations in Canvas.
  * Keep consecutive passes on the GPU; the next raw operation reads them back once through pixels(). */
 private opaqueSurfacePass(draw:()=>void,key:string,args:unknown[]){
  if(this.targetSurface===null||!this.writeAlpha)return false;
  const id=this.targetSurface,c=this.targetContext,a=args as number[],w=c.canvas.width,h=c.canvas.height;
  if(this.mode!=='normal'||this.dirtySurfaces.has(id)||key!=='circleColor'||a[5]!==1)return false;
  if(!this.gpuOpaque.has(id)&&a[2]<=Math.hypot(Math.max(Math.abs(a[0]),Math.abs(w-a[0])),Math.max(Math.abs(a[1]),Math.abs(h-a[1])))+1)return false;
  c.save();c.globalCompositeOperation='source-over';draw();c.restore();
  this.surfacePixels.delete(id);this.dirtySurfaces.delete(id);this.gpuOpaque.add(id);return true;
 }
 /** Offscreen primitives already have a raw target. Rasterize there with the same pixel-center/top-left rule,
  * avoiding a temporary Canvas, readback and second blend pass for the Knight's full-screen cone. */
 private surfaceTriangle(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,c1:number,c2:number,c3:number,alpha:number){
  const det=(x2-x1)*(y3-y1)-(x3-x1)*(y2-y1);if(!det||alpha<=0)return;
  const id=this.targetSurface!,image=this.pixels(id),data=image.data;
  const left=Math.max(0,Math.floor(Math.min(x1,x2,x3))),top=Math.max(0,Math.floor(Math.min(y1,y2,y3))),right=Math.min(image.width,Math.ceil(Math.max(x1,x2,x3))),bottom=Math.min(image.height,Math.ceil(Math.max(y1,y2,y3)));
  const edge=(ax:number,ay:number,bx:number,by:number)=>det>0?(by<ay||(by===ay&&bx>ax)):(ay<by||(ay===by&&ax>bx));
  const e1=edge(x2,y2,x3,y3),e2=edge(x3,y3,x1,y1),e3=edge(x1,y1,x2,y2),flat=c1===c2&&c2===c3,solid=flat&&alpha>=1&&this.mode==='normal'&&this.writeAlpha;
  const red=c1&255,green=(c1>>8)&255,blue=(c1>>16)&255,r2=c2&255,g2=(c2>>8)&255,b2=(c2>>16)&255,r3=c3&255,g3=(c3>>8)&255,b3=(c3>>16)&255;
  // triangleColor's intermediate RGBA8 raster quantizes alpha before blending.
  const sa=Math.round(Math.min(1,alpha)*255)/255,addWrite=this.mode==='add'&&this.writeAlpha,saSq255=255*sa*sa;
  for(let y=top;y<bottom;y++){
   const py=y+.5;let minX=right,maxX=left-1;
   for(const [ax,ay,bx,by] of [[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]])if((ay<=py&&py<=by)||(by<=py&&py<=ay)){
    if(ay===by){minX=Math.min(minX,ax,bx);maxX=Math.max(maxX,ax,bx);}else{const ix=ax+(py-ay)*(bx-ax)/(by-ay);minX=Math.min(minX,ix);maxX=Math.max(maxX,ix);}
   }
   const xl=Math.max(left,Math.floor(minX)-1),xr=Math.min(right,Math.ceil(maxX)+1);
   for(let x=xl;x<xr;x++){
    const b=((x+.5-x1)*(y3-y1)-(py-y1)*(x3-x1))/det,d=((x2-x1)*(py-y1)-(y2-y1)*(x+.5-x1))/det,a=1-b-d;
    if(a<0||b<0||d<0||a===0&&!e1||b===0&&!e2||d===0&&!e3)continue;
    const i=(y*image.width+x)*4;
    if(solid){data[i]=red;data[i+1]=green;data[i+2]=blue;data[i+3]=255;}
    else if(flat){
     if(addWrite){data[i]=Math.round(red*sa+data[i]);data[i+1]=Math.round(green*sa+data[i+1]);data[i+2]=Math.round(blue*sa+data[i+2]);data[i+3]=Math.round(saSq255+data[i+3]);}
     else this.pixel(data,i,red,green,blue,sa);
    }else{
     const r=Math.round(red*a+r2*b+r3*d),g=Math.round(green*a+g2*b+g3*d),bl=Math.round(blue*a+b2*b+b3*d);
     if(addWrite){data[i]=Math.round(r*sa+data[i]);data[i+1]=Math.round(g*sa+data[i+1]);data[i+2]=Math.round(bl*sa+data[i+2]);data[i+3]=Math.round(saSq255+data[i+3]);}
     else this.pixel(data,i,r,g,bl,sa);
    }
   }
  }
  this.dirtySurfaces.add(id);
 }
 surfaceCopy(id:number,x:number,y:number,source:number|null){
  const target=this.surfaces.get(id);if(!target)throw Error('Missing surface');
  if(source!==null)this.flushCircles(source);
  this.pendingTiles.delete(id);this.pendingCircles.delete(id);this.surfacePeriod.delete(id);this.clearedZero.delete(id);
  const tx=Math.trunc(x),ty=Math.trunc(y);
  if(source===null&&this.screen.getContextAttributes().alpha===false&&tx<=0&&ty<=0&&tx+this.screen.canvas.width>=target.width&&ty+this.screen.canvas.height>=target.height){
   const c=target.getContext('2d')!;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.drawImage(this.screen.canvas,tx,ty);c.restore();
   this.surfacePixels.delete(id);this.dirtySurfaces.delete(id);this.gpuOpaque.add(id);return;
  }
  const src=source===null?this.screen.getImageData(0,0,this.screen.canvas.width,this.screen.canvas.height):this.pixels(source),dst=this.pixels(id),data=src===dst?src.data.slice():src.data;
  x=Math.trunc(x);y=Math.trunc(y);
  const left=Math.max(0,x),top=Math.max(0,y),right=Math.min(dst.width,x+src.width),bottom=Math.min(dst.height,y+src.height);
  for(let yy=top;yy<bottom&&right>left;yy++){
   const i=(yy*dst.width+left)*4,j=((yy-y)*src.width+left-x)*4;dst.data.set(data.subarray(j,j+(right-left)*4),i);
  }
  if(right>left&&bottom>top)this.dirtySurfaces.add(id);
 }
 surfaceDraw(id:number,x:number,y:number,alpha:number,blend=0xffffff){
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing surface');
  // The game's presentation target is opaque and filled black every frame. Normal/add visible RGB matches
  // Canvas compositing there; keep raw separate-alpha math on intermediate surfaces and transparent targets.
  if(this.targetSurface===null&&this.screen.getContextAttributes().alpha===false&&!this.testAlpha&&this.writeAlpha&&blend===0xffffff&&(this.mode==='normal'||this.mode==='add')){
   this.flushSurface(id);
   const c=this.screen;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.drawImage(surface,x-this.vx,y-this.vy);c.restore();return;
  }
  this.surfacePart(id,0,0,surface.width,surface.height,x,y,1,1,blend,alpha);
 }
 surfacePart(id:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number){
  // As in surfaceDraw: on the opaque screen, normal and additive drawing of a part composite the same
  // visible RGB on the GPU (nearest sampling), without reading the screen back.
  if(this.opaqueScreenBlend(0xffffff)&&width>0&&height>0&&xscale&&yscale){
   const surface=this.surfaces.get(id);if(!surface)throw Error('Missing surface');
   this.flushSurface(id);
   let src:HTMLCanvasElement=surface,sx=left,sy=top;
   if(blend!==0xffffff){
    const tw=Math.ceil(width),th=Math.ceil(height),canvas=this.triCanvas??(this.triCanvas=document.createElement('canvas'));
    if(canvas.width<tw)canvas.width=tw;if(canvas.height<th)canvas.height=th;
    const tc=this.triCtx??(this.triCtx=canvas.getContext('2d')!);
    tc.save();tc.globalCompositeOperation='copy';tc.drawImage(surface,left,top,width,height,0,0,width,height);
    tc.globalCompositeOperation='multiply';tc.fillStyle=css(blend);tc.fillRect(0,0,width,height);
    tc.globalCompositeOperation='destination-in';tc.drawImage(surface,left,top,width,height,0,0,width,height);tc.restore();
    src=canvas;sx=0;sy=0;
   }
   const c=this.screen;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.imageSmoothingEnabled=false;
   c.translate(x-this.vx,y-this.vy);c.scale(xscale,yscale);c.drawImage(src,sx,sy,width,height,0,0,width,height);c.restore();return;
  }
  if(this.targetSurface!==null){this.surfacePeriod.delete(this.targetSurface);this.clearedZero.delete(this.targetSurface);}
  this.sample(this.pixels(id),left,top,width,height,x,y,xscale,yscale,blend,alpha);
 }
 surfaceAddRows(id:number,offsets:Float64Array,blend:number,alpha:number){
  if(this.raster||this.targetSurface===null||this.targetSurface===id||this.mode!=='add'||!this.writeAlpha)return false;
  const source=this.pixels(id),destination=this.pixels(this.targetSurface);
  if(!compositeAddRows(source,destination,offsets,blend,alpha))return false;
  this.surfacePeriod.delete(this.targetSurface);this.clearedZero.delete(this.targetSurface);
  this.dirtySurfaces.add(this.targetSurface);return true;
 }
 /** Drawing on the game's opaque presentation target in normal or additive mode, untinted: Canvas compositing gives
  * the same visible RGB as the raw blend (the screen is filled black every frame). */
 private opaqueScreenBlend(blend:number){
  return this.targetSurface===null&&this.screen.getContextAttributes().alpha===false&&!this.testAlpha&&this.writeAlpha&&blend===0xffffff&&(this.mode==='normal'||this.mode==='add');
 }
 private sample(source:ImageData,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number,fog=false,preblended=false){
  if(alpha<=0&&(this.mode==='normal'||this.mode==='add'))return;
  if(width<=0||height<=0||!xscale||!yscale)return;
  const target=this.targetContext,w=target.canvas.width,h=target.canvas.height,clipR=this.sampleClip?.r??w,clipB=this.sampleClip?.b??h;x-=this.vx;y-=this.vy;
  const x2=x+width*xscale,y2=y+height*yscale,l=Math.max(0,Math.ceil(Math.min(x,x2)-.5)),t=Math.max(0,Math.ceil(Math.min(y,y2)-.5)),r=Math.min(clipR,Math.ceil(Math.max(x,x2)-.5)),b=Math.min(clipB,Math.ceil(Math.max(y,y2)-.5));if(r<=l||b<=t)return;
  // The screen is read back only under the drawn rectangle (a whole-screen readback costs milliseconds).
  const screen=this.targetSurface===null,dst=screen?target.getImageData(l,t,r-l,b-t):this.pixels(this.targetSurface!),pixels=source===dst?source.data.slice():source.data,iw=screen?r-l:w,ox=screen?l:0,oy=screen?t:0;
  const ar=Math.max(0,Math.min(1,alpha)),fr=blend&255,fg=(blend>>8)&255,fb=(blend>>16)&255,tr=fr/255,tg=fg/255,tb=fb/255;
  const data=dst.data,mode=this.mode,subtract=mode==='subtract',multiply=mode==='multiply',destSource=mode==='dest-alpha-add'||mode==='dest-alpha-copy',destZero=mode==='dest-alpha-copy',destAlpha=mode==='dest-alpha-add',add=mode==='add'||mode==='add-preserve-alpha',separate=mode==='add-preserve-alpha'||mode==='normal-preserve-alpha',test=this.testAlpha,write=this.writeAlpha;
  const skipZero=test||(!subtract&&!multiply&&!destSource&&!separate),normalWrite=mode==='normal'&&write,saSq=ar*ar,invAr=1-ar;
  if(!fog&&!preblended&&xscale===1&&yscale===1&&left===0&&top===0&&x===0&&y===0&&l===0&&t===0&&ox===0&&oy===0&&source.width===iw&&r===iw&&b===source.height&&ar===1&&blend===0xffffff&&write&&mode==='add'&&skipZero){
   const src32=new Uint32Array(pixels.buffer,pixels.byteOffset,iw*b),n=iw*b;
   for(let p=0,i=0;p<n;p++,i+=4){
    if(src32[p]===0)continue;
    const aByte=pixels[i+3];if(aByte===0)continue;
    if(aByte===255){data[i]+=pixels[i];data[i+1]+=pixels[i+1];data[i+2]+=pixels[i+2];data[i+3]=255;continue;}
    const sa=aByte/255;
    data[i]=Math.round(pixels[i]*sa+data[i]);data[i+1]=Math.round(pixels[i+1]*sa+data[i+1]);data[i+2]=Math.round(pixels[i+2]*sa+data[i+2]);
    data[i+3]=Math.round(255*(sa*sa+data[i+3]/255));
   }
   if(!screen)this.dirtySurfaces.add(this.targetSurface!);else target.putImageData(dst,l,t);return;
  }
  const columns=new Int32Array(r-l);for(let xx=l;xx<r;xx++)columns[xx-l]=Math.max(0,Math.min(source.width-1,Math.floor(left+(xx+.5-x)/xscale)))*4;
  const ta=add?ar:1,tintKey=blend+':'+ta;let tint=this.byteTints.get(tintKey);
  if(!tint){tint=new Uint8Array(768);for(let n=0;n<256;n++){tint[n]=Math.round(n*tr*ta);tint[n+256]=Math.round(n*tg*ta);tint[n+512]=Math.round(n*tb*ta);}if(this.byteTints.size>=256)this.byteTints.clear();this.byteTints.set(tintKey,tint);}
  // Opaque atlas tiles (the roar's five full-screen flow passes and the star cone's four flow passes) need no floating-point alpha math.
  if(!fog&&!preblended&&this.solidImages.has(source)&&ar===1&&blend===0xffffff&&write&&(mode==='normal'||mode==='add'||mode==='add-preserve-alpha')){
   const preserve=mode==='add-preserve-alpha';
   for(let yy=t;yy<b;yy++){
    const row=Math.max(0,Math.min(source.height-1,Math.floor(top+(yy+.5-y)/yscale)))*source.width*4;let i=((yy-oy)*iw+l-ox)*4;
    for(let col=0;col<columns.length;col++,i+=4){const j=row+columns[col];if(add){data[i]+=pixels[j];data[i+1]+=pixels[j+1];data[i+2]+=pixels[j+2];}else{data[i]=pixels[j];data[i+1]=pixels[j+1];data[i+2]=pixels[j+2];}if(!preserve)data[i+3]=255;}
   }
   if(!screen)this.dirtySurfaces.add(this.targetSurface!);else target.putImageData(dst,l,t);return;
  }
  if(!fog&&!preblended&&blend===0&&ar===1&&mode==='normal'&&!write&&skipZero){
   const dst32=new Uint32Array(data.buffer,data.byteOffset,dst.width*dst.height),spans=this.frameSpans.get(source);
   for(let yy=t;yy<b;yy++){
    const sy=Math.max(0,Math.min(source.height-1,Math.floor(top+(yy+.5-y)/yscale)));
    if(spans&&spans[sy*2]>spans[sy*2+1])continue;
    const row=sy*source.width*4;let p=(yy-oy)*iw+l-ox;
    for(let col=0;col<columns.length;col++,p++){
     if((dst32[p]&0x00ffffff)===0)continue;
     const j=row+columns[col],aByte=pixels[j+3];if(aByte===0)continue;
     if(aByte===255){dst32[p]&=0xff000000;continue;}
     const i=p*4,df=1-aByte/255;data[i]=Math.round(data[i]*df);data[i+1]=Math.round(data[i+1]*df);data[i+2]=Math.round(data[i+2]*df);
    }
   }
   if(!screen)this.dirtySurfaces.add(this.targetSurface!);else target.putImageData(dst,l,t);return;
  }
  const aLut=this.aLut,dLut=this.dLut,sR=this.sRLut,sG=this.sGLut,sB=this.sBLut,wLut=this.wLut;
  const useLut=normalWrite&&ar<1&&(r-l)*(b-t)>256;
  if(useLut){
   const wAr=255*ar;
   for(let v=0;v<256;v++){
    const dv=v*invAr;dLut[v]=dv;aLut[v]=Math.min(255,Math.round(255*(saSq+(v/255)*invAr)));
    sR[v]=(fog?fr:v*tr)*ar;sG[v]=(fog?fg:v*tg)*ar;sB[v]=(fog?fb:v*tb)*ar;wLut[v]=Math.round(wAr+dv);
   }
  }
  const spans=skipZero?this.frameSpans.get(source):undefined,whiteTint=blend===0xffffff;
  // Surface textures use nearest sampling. Keep raw RGB even when the sampled alpha is zero: subtract and
  // destination-alpha factors may read it, unlike Canvas drawImage's premultiplied intermediate.
  for(let yy=t;yy<b;yy++){
   const sy=Math.max(0,Math.min(source.height-1,Math.floor(top+(yy+.5-y)/yscale)));
   let cStart=0,cEnd=columns.length;
   if(spans){
    const minU=spans[sy*2],maxU=spans[sy*2+1];if(minU>maxU)continue;
    if(xscale>0){
     cStart=Math.max(0,Math.floor(x+(minU-left)*xscale-.5-l));
     cEnd=Math.min(cEnd,Math.ceil(x+(maxU+1-left)*xscale-.5-l)+1);
    }
   }
   const row=sy*source.width*4;let i=((yy-oy)*iw+l+cStart-ox)*4;
   for(let col=cStart;col<cEnd;col++,i+=4){
    const j=row+columns[col],aByte=pixels[j+3];if(aByte===0&&skipZero)continue;
    if(preblended){data[i]=pixels[j];data[i+1]=pixels[j+1];data[i+2]=pixels[j+2];data[i+3]=aByte;continue;}
    // A zero-alpha mask contributes no RGB in either separate-alpha blend. It still clears
    // destination alpha when enabled; do that directly instead of blending four channels.
    if(aByte===0&&separate){if(write)data[i+3]=0;continue;}
    const sa=aByte===255?ar:aByte/255*ar;if(sa===0&&skipZero)continue;
    const r0=fog?255:pixels[j],g0=fog?255:pixels[j+1],b0=fog?255:pixels[j+2];
    if((sa===1&&(mode==='normal'||mode==='normal-preserve-alpha'))||(aByte===255&&(mode==='add'||mode==='add-preserve-alpha'))){
     if(add){data[i]+=tint[r0];data[i+1]+=tint[256+g0];data[i+2]+=tint[512+b0];}
     else{data[i]=tint[r0];data[i+1]=tint[256+g0];data[i+2]=tint[512+b0];}
     if(write){
      if(mode==='normal')data[i+3]=255;
      else if(mode==='add')data[i+3]=Math.round(255*saSq+data[i+3]);
      else if(sa!==1)data[i+3]=Math.round(255*(sa*(data[i+3]/255)));
     }
     continue;
    }
    if(aByte===255&&normalWrite){
     if(useLut){
      if(whiteTint&&r0===255&&g0===255&&b0===255){
       data[i]=wLut[data[i]];data[i+1]=wLut[data[i+1]];data[i+2]=wLut[data[i+2]];data[i+3]=aLut[data[i+3]];continue;
      }
      data[i]=Math.round(sR[r0]+dLut[data[i]]);data[i+1]=Math.round(sG[g0]+dLut[data[i+1]]);data[i+2]=Math.round(sB[b0]+dLut[data[i+2]]);
      data[i+3]=aLut[data[i+3]];
      continue;
     }
     const red=fog?fr:r0*tr,green=fog?fg:g0*tg,blue=fog?fb:b0*tb,da=data[i+3]/255;
     data[i]=Math.round(red*ar+data[i]*invAr);data[i+1]=Math.round(green*ar+data[i+1]*invAr);data[i+2]=Math.round(blue*ar+data[i+2]*invAr);
     data[i+3]=Math.round(255*(saSq+da*invAr));
     continue;
    }
    const red=fog?fr:r0*tr,green=fog?fg:g0*tg,blue=fog?fb:b0*tb,da=data[i+3]/255;
    if(subtract){data[i]=Math.round(data[i]*(1-red/255));data[i+1]=Math.round(data[i+1]*(1-green/255));data[i+2]=Math.round(data[i+2]*(1-blue/255));if(write)data[i+3]=Math.round(data[i+3]*(1-sa));}
    else if(multiply){data[i]=Math.round(data[i]*red/255);data[i+1]=Math.round(data[i+1]*green/255);data[i+2]=Math.round(data[i+2]*blue/255);if(write)data[i+3]=Math.round(data[i+3]*sa);}
    else{
     const sf=destSource?da:sa,df=destZero?0:destAlpha?da:add?1:1-sa;
     data[i]=Math.round(red*sf+data[i]*df);data[i+1]=Math.round(green*sf+data[i+1]*df);data[i+2]=Math.round(blue*sf+data[i+2]*df);
     if(write)data[i+3]=Math.round(255*(separate?sa*da:sa*sf+da*df));
    }
   }
  }
  if(!screen){this.dirtySurfaces.add(this.targetSurface!);return;}
  target.putImageData(dst,l,t);
 }
 /** A GPU interpolates all three vertex colors at pixel centers, including skew triangles. */
 triangleColor(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,c1:number,c2:number,c3:number,alpha:number){
  x1-=this.vx;x2-=this.vx;x3-=this.vx;y1-=this.vy;y2-=this.vy;y3-=this.vy;
  const det=(x2-x1)*(y3-y1)-(x3-x1)*(y2-y1);if(!det||alpha<=0)return;
  if(!this.raster&&this.targetSurface===null&&c2===c3&&c1!==c2){
   const dx=x3-x2,dy=y3-y2,len2=dx*dx+dy*dy;
   if(len2>0){
    const t=((x1-x2)*dx+(y1-y2)*dy)/len2,px=x2+t*dx,py=y2+t*dy;
    if(px!==x1||py!==y1){
     const ctx=this.targetContext;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
     const g=ctx.createLinearGradient(x1,y1,px,py);g.addColorStop(0,css(c1));g.addColorStop(1,css(c2));
     ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.restore();return;
    }
   }
  }
  const ctx=this.targetContext,left=Math.max(0,Math.floor(Math.min(x1,x2,x3))),top=Math.max(0,Math.floor(Math.min(y1,y2,y3))),right=Math.min(this.rasterSize?.width??ctx.canvas.width,Math.ceil(Math.max(x1,x2,x3))),bottom=Math.min(this.rasterSize?.height??ctx.canvas.height,Math.ceil(Math.max(y1,y2,y3)));
  const tw=right-left,th=bottom-top;if(tw<=0||th<=0)return;
  const canvas=this.triCanvas??(this.triCanvas=document.createElement('canvas'));
  if(canvas.width<tw)canvas.width=tw;if(canvas.height<th)canvas.height=th;
  const c=this.triCtx??(this.triCtx=canvas.getContext('2d')!),image=new ImageData(tw,th),data=image.data;
  const edge=(ax:number,ay:number,bx:number,by:number)=>det>0?(by<ay||(by===ay&&bx>ax)):(ay<by||(ay===by&&ax>bx));
  const e1=edge(x2,y2,x3,y3),e2=edge(x3,y3,x1,y1),e3=edge(x1,y1,x2,y2);
  const r1=c1&255,g1=(c1>>8)&255,b1=(c1>>16)&255,r2=c2&255,g2=(c2>>8)&255,b2=(c2>>16)&255,r3=c3&255,g3=(c3>>8)&255,b3=(c3>>16)&255,sa=Math.round(Math.min(1,alpha)*255);
  for(let y=top;y<bottom;y++){
   const py=y+.5;let minX=right,maxX=left-1;
   for(const [ax,ay,bx,by] of [[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]])if((ay<=py&&py<=by)||(by<=py&&py<=ay)){
    if(ay===by){minX=Math.min(minX,ax,bx);maxX=Math.max(maxX,ax,bx);}else{const ix=ax+(py-ay)*(bx-ax)/(by-ay);minX=Math.min(minX,ix);maxX=Math.max(maxX,ix);}
   }
   const xl=Math.max(left,Math.floor(minX)-1),xr=Math.min(right,Math.ceil(maxX)+1);
   for(let x=xl;x<xr;x++){
    const b=((x+.5-x1)*(y3-y1)-(py-y1)*(x3-x1))/det,d=((x2-x1)*(py-y1)-(y2-y1)*(x+.5-x1))/det,a=1-b-d;
    if(a<0||b<0||d<0||a===0&&!e1||b===0&&!e2||d===0&&!e3)continue;
    const i=((y-top)*tw+x-left)*4;
    data[i]=Math.round(r1*a+r2*b+r3*d);data[i+1]=Math.round(g1*a+g2*b+g3*d);data[i+2]=Math.round(b1*a+b2*b+b3*d);data[i+3]=sa;
   }
  }
  c.putImageData(image,0,0);ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,0,0,tw,th,left,top,tw,th);ctx.restore();
 }
 surfaceClear(color:number,alpha:number){
  const ctx=this.targetContext;
  if(this.targetSurface!==null){
   this.pendingTiles.delete(this.targetSurface);this.pendingCircles.delete(this.targetSurface);
   this.gpuOpaque.delete(this.targetSurface);
   const image=this.surfacePixels.get(this.targetSurface)??ctx.createImageData(ctx.canvas.width,ctx.canvas.height),data=image.data,a=Math.round(Math.max(0,Math.min(1,alpha))*255);
   // Transparent black is the common per-frame clear for effect surfaces. Reuse its backing store.
   if(color===0&&a===0){data.fill(0);this.clearedZero.add(this.targetSurface);}
   else{new Uint32Array(data.buffer).fill(((a<<24)|(color&0xffffff))>>>0);this.clearedZero.delete(this.targetSurface);}
   this.surfacePixels.set(this.targetSurface,image);this.dirtySurfaces.add(this.targetSurface);this.surfacePeriod.set(this.targetSurface,'0:0');return;
  }
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.globalAlpha=alpha;ctx.fillStyle=css(color);ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();
 }
 surfaceSprite(id:number,name:string,left:number,top:number,width:number,height:number,originX:number,originY:number){
  this.flushSurface(id);
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing sprite surface');const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(surface,left,top,width,height,0,0,width,height);
  const page=this.pages.length;this.pages.push(canvas);this.generatedPages.set(name,page);this.generated.set(name,{originX,originY,width,height,frames:[{page,sx:0,sy:0,sw:width,sh:height,tx:0,ty:0,tw:width,th:height}]});
 }
 surfaceFree(id:number){this.surfaces.delete(id);this.surfacePixels.delete(id);this.dirtySurfaces.delete(id);this.gpuOpaque.delete(id);this.pendingTiles.delete(id);this.pendingCircles.delete(id);this.surfacePeriod.delete(id);this.clearedZero.delete(id);}
 screenSprite(name:string,width:number,height:number){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(this.screen.canvas,0,0,width,height,0,0,width,height);
  const page=this.pages.length;this.pages.push(canvas);this.generatedPages.set(name,page);this.generated.set(name,{originX:0,originY:0,width,height,frames:[{page,sx:0,sy:0,sw:width,sh:height,tx:0,ty:0,tw:width,th:height}]});
 }
 spriteOffset(name:string,x:number,y:number){const sprite=this.assets.sprite(name);if(sprite)this.generated.set(name,{...sprite,originX:Math.trunc(x),originY:Math.trunc(y)});}
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
  const c=this.targetContext;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  c.translate(x-this.vx,y-this.vy);if(angle)c.rotate(-angle*Math.PI/180);c.scale(xscale,yscale);
 }
 private blit(f:FrameRef,dx:number,dy:number,blend:number,bottom=blend){
  const tw=f.tw||f.sw,th=f.th||f.sh;
  if(blend===0xffffff&&bottom===blend)this.targetContext.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,dx+f.tx,dy+f.ty,tw,th);
  else this.targetContext.drawImage(this.tinted(f,blend,bottom),0,0,f.sw,f.sh,dx+f.tx,dy+f.ty,tw,th);
 }
 sprite(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,blend:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  if(s.nineSlice?.enabled){
   if(s.nineSlice.tileModes.some(mode=>mode!==0))throw Error(`Unsupported nine-slice tile mode: ${name}`);
   if(xscale===0||yscale===0)return;
   this.place(x,y,Math.sign(xscale),Math.sign(yscale),angle,alpha);
   this.blitNineSlice(s,f,Math.abs(xscale),Math.abs(yscale),blend);this.targetContext.restore();return;
  }
  this.place(x,y,xscale,yscale,angle,alpha);this.blit(f,-s.originX,-s.originY,blend);this.targetContext.restore();
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
   this.targetContext.drawImage(page,(l-f.tx)*f.sw/tw+(blend===0xffffff?f.sx:0),(t-f.ty)*f.sh/th+(blend===0xffffff?f.sy:0),(r-l)*f.sw/tw,(b-t)*f.sh/th,
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
  this.targetContext.drawImage(page,sx+(blend===0xffffff?f.sx:0),sy+(blend===0xffffff?f.sy:0),sw,sh,l-left,t-top,r-l,b-t);this.targetContext.restore();
 }
 /** Point-sampled source draw_sprite_pos maps the cropped atlas frame directly to the supplied corners. */
 spritePos(name:string,frame:number,x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,x4:number,y4:number,alpha:number){
  const s=this.assets.sprite(name),f=s&&frameAt(s,frame);if(!s||!f||alpha<=0)return;
  const ctx=this.targetContext,points=[[x1-this.vx,y1-this.vy,0,0],[x2-this.vx,y2-this.vy,f.sw,0],[x3-this.vx,y3-this.vy,f.sw,f.sh],[x4-this.vx,y4-this.vy,0,f.sh]];
  const left=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0])))),top=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))),right=Math.min(this.rasterSize?.width??ctx.canvas.width,Math.ceil(Math.max(...points.map(p=>p[0])))),bottom=Math.min(this.rasterSize?.height??ctx.canvas.height,Math.ceil(Math.max(...points.map(p=>p[1]))));
  if(right<=left||bottom<=top)return;
  const width=right-left,height=bottom-top,image=new ImageData(width,height),source=this.readFrame(f);
  for(const indices of [[0,1,2],[0,2,3]]){
   const [a,b,c]=indices.map(i=>points[i]),det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(!det)continue;
   const edge=(p:number[],q:number[])=>det>0?(q[1]<p[1]||(q[1]===p[1]&&q[0]>p[0])):(p[1]<q[1]||(p[1]===q[1]&&p[0]>q[0]));
   const e1=edge(b,c),e2=edge(c,a),e3=edge(a,b);
   for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
    const v=((x+.5-a[0])*(c[1]-a[1])-(y+.5-a[1])*(c[0]-a[0]))/det,w=((b[0]-a[0])*(y+.5-a[1])-(b[1]-a[1])*(x+.5-a[0]))/det,u=1-v-w;
    if(u<0||v<0||w<0||u===0&&!e1||v===0&&!e2||w===0&&!e3)continue;
    const sx=u*a[2]+v*b[2]+w*c[2],sy=u*a[3]+v*b[3]+w*c[3];
    if(sx<0||sy<0||sx>=f.sw||sy>=f.sh)continue;
    const src=(Math.floor(sy)*f.sw+Math.floor(sx))*4,dst=((y-top)*width+x-left)*4;
    image.data[dst]=source.data[src];image.data[dst+1]=source.data[src+1];image.data[dst+2]=source.data[src+2];image.data[dst+3]=Math.round(source.data[src+3]*Math.min(1,alpha));
   }
  }
  const canvas=this.triCanvas??(this.triCanvas=document.createElement('canvas'));if(canvas.width<width)canvas.width=width;if(canvas.height<height)canvas.height=height;
  const raster=this.triCtx??(this.triCtx=canvas.getContext('2d')!);raster.putImageData(image,0,0);ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,0,0,width,height,left,top,width,height);ctx.restore();
 }
 spriteFog(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,color:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  const key=`${f.page}:${f.sx},${f.sy}:${color}`;let fog=this.fogs.get(key);
  if(!fog){if(this.fogs.size>4000)this.fogs.clear();fog=document.createElement('canvas');fog.width=f.sw;fog.height=f.sh;const g=fog.getContext('2d')!;g.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,0,0,f.sw,f.sh);g.globalCompositeOperation='source-in';g.fillStyle=css(color);g.fillRect(0,0,f.sw,f.sh);this.fogs.set(key,fog);}
  this.place(x,y,xscale,yscale,angle,alpha);this.targetContext.drawImage(fog,0,0,f.sw,f.sh,-s.originX+f.tx,-s.originY+f.ty,f.tw||f.sw,f.th||f.sh);this.targetContext.restore();
 }
 spriteTiled(name:string,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number,frame=0){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  const w=s.width*xscale,h=s.height*yscale;if(w<=0||h<=0)return;
  const vx=this.vx,vy=this.vy,startX=x-Math.ceil((x-vx)/w)*w,startY=y-Math.ceil((y-vy)/h)*h;
  const width=this.rasterSize?.width??this.targetContext.canvas.width,height=this.rasterSize?.height??this.targetContext.canvas.height;
  for(let ty=startY;ty<vy+height;ty+=h)for(let tx=startX;tx<vx+width;tx+=w){this.place(tx,ty,xscale,yscale,0,alpha);this.blit(f,0,0,blend);this.targetContext.restore();}
 }
 rect(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean){
  const c=this.targetContext;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const l=Math.min(x1,x2)-this.vx,t=Math.min(y1,y2)-this.vy,w=Math.abs(x2-x1)+1,h=Math.abs(y2-y1)+1;
  if(outline){c.strokeStyle=css(color);c.lineWidth=1;c.strokeRect(l+.5,t+.5,w-1,h-1);}else{c.fillStyle=css(color);c.fillRect(l,t,w,h);}
  c.restore();
 }
 line(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,width=1){
  const c=this.targetContext;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.strokeStyle=css(color);c.lineWidth=width;c.beginPath();c.moveTo(x1-this.vx,y1-this.vy);c.lineTo(x2-this.vx,y2-this.vy);c.stroke();c.restore();
 }
 lineColor(x1:number,y1:number,x2:number,y2:number,color1:number,color2:number,alpha:number){
  const c=this.targetContext;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const gradient=c.createLinearGradient(x1-this.vx,y1-this.vy,x2-this.vx,y2-this.vy);gradient.addColorStop(0,css(color1));gradient.addColorStop(1,css(color2));
  c.strokeStyle=gradient;c.lineWidth=1;c.beginPath();c.moveTo(x1-this.vx,y1-this.vy);c.lineTo(x2-this.vx,y2-this.vy);c.stroke();c.restore();
 }
 circleColor(x:number,y:number,r:number,c1:number,c2:number,alpha:number){
  if(r<=0)return;const c=this.targetContext,cx=x-this.vx,cy=y-this.vy;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,css(c1));g.addColorStop(1,css(c2));
  c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fillStyle=g;c.fill();c.restore();
 }
 surfaceResize(id:number,width:number,height:number){
  const s=this.surfaces.get(id);if(!s)throw Error('Missing surface');
  if(s.width!==width||s.height!==height){s.width=width;s.height=height;this.surfacePixels.delete(id);this.dirtySurfaces.delete(id);this.gpuOpaque.delete(id);this.pendingTiles.delete(id);this.pendingCircles.delete(id);this.surfacePeriod.delete(id);this.clearedZero.delete(id);}
 }
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean){
  if(r<=0)return;const c=this.targetContext;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.beginPath();c.arc(x-this.vx,y-this.vy,r,0,Math.PI*2);
  if(outline){c.strokeStyle=css(color);c.stroke();}else{c.fillStyle=css(color);c.fill();}
  c.restore();
 }
 ellipse(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean){
  const rx=Math.abs(x2-x1)/2,ry=Math.abs(y2-y1)/2;if(rx<=0||ry<=0)return;
  const c=this.targetContext;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.beginPath();c.ellipse((x1+x2)/2-this.vx,(y1+y2)/2-this.vy,rx,ry,0,0,Math.PI*2);
  if(outline){c.strokeStyle=css(color);c.stroke();}else{c.fillStyle=css(color);c.fill();}
  c.restore();
 }
 triangle(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,color:number,alpha:number,outline:boolean){if(!outline){this.triangleColor(x1,y1,x2,y2,x3,y3,color,color,color,alpha);return;}const ctx=this.targetContext;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.beginPath();ctx.moveTo(x1-this.vx,y1-this.vy);ctx.lineTo(x2-this.vx,y2-this.vy);ctx.lineTo(x3-this.vx,y3-this.vy);ctx.closePath();ctx.strokeStyle=css(color);ctx.stroke();ctx.restore();}
 /** string_width: the widest line in the font, in pixels. */
 textWidth(fontName:string,text:string){
  const font=this.assets.font(fontName);if(!font)return 0;
  return Math.max(0,...text.split('\n').map(line=>[...line].reduce((n,ch)=>n+(this.glyph(font,ch.charCodeAt(0))?.advance??0),0)));
 }
 /** string_height: the lines times the font's tallest glyph (the runner's line stride). */
 textHeight(fontName:string,text:string){
  const font=this.assets.font(fontName);if(!font)return 0;
  const stride=font.kind==='bitmap'?Math.max(0,...Object.values(font.glyphs).map(g=>g.h))||font.size:(this.assets.sprite(font.sprite)?.height??0);
  return text.split('\n').length*stride;
 }
 text(x:number,y:number,text:string,style:TextStyle){
  const font=this.assets.font(style.font);if(!font||style.alpha<=0)return;
  const lines=text.split('\n');
  const glyphs=(line:string)=>[...line].map(ch=>this.glyph(font,ch.charCodeAt(0)));
  const width=(line:string)=>glyphs(line).reduce((n,g)=>n+(g?g.advance:0),0);
  const lineHeight=this.textHeight(style.font,'M');
  this.place(x,y,style.xscale,style.yscale,style.angle,style.alpha);
  let cy=style.valign===1?-lines.length*lineHeight/2:style.valign===2?-lines.length*lineHeight:0;
  for(const line of lines){
   let cx=style.halign===1?-width(line)/2:style.halign===2?-width(line):0;
   for(const g of glyphs(line)){if(g){g.draw(cx,cy,style.color,style.colorBottom??style.color);cx+=g.advance;}}
   cy+=lineHeight;
  }
  this.targetContext.restore();
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
