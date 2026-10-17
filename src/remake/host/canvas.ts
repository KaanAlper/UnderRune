// Draws the remake's GameMaker draw calls on a 2D canvas: sprite frames cut from texture pages, GameMaker's
// colour blend (multiply), rotation (counter-clockwise degrees), scale and alpha, rectangles, circles and
// bitmap or sprite fonts. Coordinates are room coordinates; the view offset is applied here.
import type {GmGraphics,TextStyle} from '../gm/graphics';
import type {NineSlice} from '../gm/sprites';

export interface FrameRef{page:number;sx:number;sy:number;sw:number;sh:number;tx:number;ty:number;tw:number;th:number}
export interface SpriteFrames{originX:number;originY:number;width:number;height:number;frames:(FrameRef|null)[];nineSlice?:NineSlice|null}
export interface Glyph{x:number;y:number;w:number;h:number;shift:number;offset:number}
export type FontData={kind:'bitmap';page:number;sx:number;sy:number;size:number;glyphs:Record<number,Glyph>}
 |{kind:'sprite';sprite:string;map:string;proportional:boolean;sep:number};
export interface DrawAssets{pages:CanvasImageSource[];sprite(name:string):SpriteFrames|undefined;font(name:string):FontData|undefined}

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
 constructor(ctx:CanvasRenderingContext2D,assets:DrawAssets,readonly view:{x:number;y:number}){this.screen=ctx;this.pages=[...assets.pages];this.assets={...assets,pages:this.pages,sprite:name=>this.generated.get(name)??assets.sprite(name)};}
 get ctx(){return this.targetSurface===null?this.screen:this.surfaces.get(this.targetSurface)!.getContext('2d')!;}
 private get vx(){return this.targetSurface===null?this.view.x:0;}
 private get vy(){return this.targetSurface===null?this.view.y:0;}
 surfaceCreate(id:number,width:number,height:number){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.imageSmoothingEnabled=false;this.surfaces.set(id,canvas);}
 surfaceTarget(id:number|null){if(id!==null&&!this.surfaces.has(id))throw Error('Missing surface');this.targetSurface=id;}
 surfaceClear(color:number,alpha:number){const ctx=this.ctx;ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=css(color);ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.restore();}
 surfaceSprite(id:number,name:string,left:number,top:number,width:number,height:number,originX:number,originY:number){
  const surface=this.surfaces.get(id);if(!surface)throw Error('Missing sprite surface');const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(surface,left,top,width,height,0,0,width,height);
  const page=this.pages.length;this.pages.push(canvas);this.generatedPages.set(name,page);this.generated.set(name,{originX,originY,width,height,frames:[{page,sx:0,sy:0,sw:width,sh:height,tx:0,ty:0,tw:width,th:height}]});
 }
 surfaceFree(id:number){this.surfaces.delete(id);}
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
 spriteTiled(name:string,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,0);if(!f)return;
  const w=s.width*xscale,h=s.height*yscale;if(w<=0||h<=0)return;
  const vx=this.view.x,vy=this.view.y,startX=x-Math.ceil((x-vx)/w)*w,startY=y-Math.ceil((y-vy)/h)*h;
  for(let ty=startY;ty<vy+480;ty+=h)for(let tx=startX;tx<vx+640;tx+=w){this.place(tx,ty,xscale,yscale,0,alpha);this.blit(f,0,0,blend);this.ctx.restore();}
 }
 rect(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const l=Math.min(x1,x2)-this.view.x,t=Math.min(y1,y2)-this.view.y,w=Math.abs(x2-x1)+1,h=Math.abs(y2-y1)+1;
  if(outline){c.strokeStyle=css(color);c.lineWidth=1;c.strokeRect(l+.5,t+.5,w-1,h-1);}else{c.fillStyle=css(color);c.fillRect(l,t,w,h);}
  c.restore();
 }
 line(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,width=1){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.strokeStyle=css(color);c.lineWidth=width;c.beginPath();c.moveTo(x1-this.view.x,y1-this.view.y);c.lineTo(x2-this.view.x,y2-this.view.y);c.stroke();c.restore();
 }
 lineColor(x1:number,y1:number,x2:number,y2:number,color1:number,color2:number,alpha:number){
  const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));
  const gradient=c.createLinearGradient(x1-this.view.x,y1-this.view.y,x2-this.view.x,y2-this.view.y);gradient.addColorStop(0,css(color1));gradient.addColorStop(1,css(color2));
  c.strokeStyle=gradient;c.lineWidth=1;c.beginPath();c.moveTo(x1-this.view.x,y1-this.view.y);c.lineTo(x2-this.view.x,y2-this.view.y);c.stroke();c.restore();
 }
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean){
  if(r<=0)return;const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.beginPath();c.arc(x-this.view.x,y-this.view.y,r,0,Math.PI*2);
  if(outline){c.strokeStyle=css(color);c.stroke();}else{c.fillStyle=css(color);c.fill();}
  c.restore();
 }
 triangle(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,color:number,alpha:number,outline:boolean){const ctx=this.ctx;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.beginPath();ctx.moveTo(x1-this.vx,y1-this.vy);ctx.lineTo(x2-this.vx,y2-this.vy);ctx.lineTo(x3-this.vx,y3-this.vy);ctx.closePath();if(outline){ctx.strokeStyle=css(color);ctx.stroke();}else {ctx.fillStyle=css(color);ctx.fill();}ctx.restore();}
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
