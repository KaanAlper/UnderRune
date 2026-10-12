// Draws the remake's GameMaker draw calls on a 2D canvas: sprite frames cut from texture pages, GameMaker's
// colour blend (multiply), rotation (counter-clockwise degrees), scale and alpha, rectangles, circles and
// bitmap or sprite fonts. Coordinates are room coordinates; the view offset is applied here.
import type {GmGraphics,TextStyle} from '../gm/graphics';

export interface FrameRef{page:number;sx:number;sy:number;sw:number;sh:number;tx:number;ty:number;tw:number;th:number}
export interface SpriteFrames{originX:number;originY:number;width:number;height:number;frames:(FrameRef|null)[]}
export interface Glyph{x:number;y:number;w:number;h:number;shift:number;offset:number}
export type FontData={kind:'bitmap';page:number;sx:number;sy:number;size:number;glyphs:Record<number,Glyph>}
 |{kind:'sprite';sprite:string;map:string;proportional:boolean;sep:number};
export interface DrawAssets{pages:CanvasImageSource[];sprite(name:string):SpriteFrames|undefined;font(name:string):FontData|undefined}

/** GameMaker colours are 0xBBGGRR. */
export const css=(c:number)=>`rgb(${c&255},${(c>>8)&255},${(c>>16)&255})`;
const frameAt=(s:SpriteFrames,frame:number)=>{const n=s.frames.length;return n?s.frames[((Math.floor(frame)%n)+n)%n]:null;};

export class CanvasGraphics implements GmGraphics{
 private tints=new Map<string,HTMLCanvasElement>();
 private fogs=new Map<string,HTMLCanvasElement>();
 constructor(readonly ctx:CanvasRenderingContext2D,readonly assets:DrawAssets,readonly view:{x:number;y:number}){}
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
  c.translate(x-this.view.x,y-this.view.y);if(angle)c.rotate(-angle*Math.PI/180);c.scale(xscale,yscale);
 }
 private blit(f:FrameRef,dx:number,dy:number,blend:number,bottom=blend){
  const tw=f.tw||f.sw,th=f.th||f.sh;
  if(blend===0xffffff&&bottom===blend)this.ctx.drawImage(this.assets.pages[f.page],f.sx,f.sy,f.sw,f.sh,dx+f.tx,dy+f.ty,tw,th);
  else this.ctx.drawImage(this.tinted(f,blend,bottom),0,0,f.sw,f.sh,dx+f.tx,dy+f.ty,tw,th);
 }
 sprite(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,blend:number,alpha:number){
  const s=this.assets.sprite(name);if(!s||alpha<=0)return;const f=frameAt(s,frame);if(!f)return;
  this.place(x,y,xscale,yscale,angle,alpha);this.blit(f,-s.originX,-s.originY,blend);this.ctx.restore();
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
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean){
  if(r<=0)return;const c=this.ctx;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));c.beginPath();c.arc(x-this.view.x,y-this.view.y,r,0,Math.PI*2);
  if(outline){c.strokeStyle=css(color);c.stroke();}else{c.fillStyle=css(color);c.fill();}
  c.restore();
 }
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
