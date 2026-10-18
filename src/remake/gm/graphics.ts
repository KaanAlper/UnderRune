// What the remake draws, in room coordinates; the host turns it into canvas calls (subtracting the view).
export type HAlign=0|1|2;
/** colorBottom: draw_text_color's vertical gradient (top colour, bottom colour). */
export interface TextStyle{font:string;color:number;alpha:number;halign:HAlign;valign:HAlign;xscale:number;yscale:number;angle:number;colorBottom?:number}
export interface GmGraphics{
 surfaceCreate?(id:number,width:number,height:number):void;
 surfaceTarget?(id:number|null):void;
 surfaceClear?(color:number,alpha:number):void;
 surfaceSprite?(id:number,name:string,left:number,top:number,width:number,height:number,originX:number,originY:number):void;
 surfaceFree?(id:number):void;
 spriteDelete?(name:string):void;
 /** sprite_create_from_surface(application_surface, ...): the screen as last drawn, as a new sprite. */
 screenSprite?(name:string,width:number,height:number):void;
 /** string_width in a font (absent: 0). */
 textWidth?(font:string,text:string):number;
 sprite(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,blend:number,alpha:number):void;
 /** draw_sprite_part_ext: origin-independent crop in untrimmed sprite coordinates. */
 spritePart?(name:string,frame:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number):void;
 spriteFog?(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,color:number,alpha:number):void;
 /** draw_background_tiled_ext: frame 0 repeated over the whole view from (x, y). */
 spriteTiled?(name:string,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number,frame?:number):void;
 rect(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean):void;
 line?(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,width?:number):void;
 lineColor?(x1:number,y1:number,x2:number,y2:number,color1:number,color2:number,alpha:number):void;
 triangle?(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,color:number,alpha:number,outline:boolean):void;
 /** draw_triangle_color (filled): a colour per corner. */
 triangleColor?(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,c1:number,c2:number,c3:number,alpha:number):void;
 /** GPU blend factors retained across render targets. The preserve-alpha modes output As*Ad and use
  * src_alpha with one or inv_src_alpha for RGB. Destination-alpha modes use dest_alpha for the source,
  * and either dest_alpha (add) or zero (copy) for the destination. Canvas raster fallbacks require alpha
  * testing or a verified raw source when a blend factor observes RGB at zero source alpha. */
 blendMode?(mode:BlendMode):void;
 /** gpu_set_colorwriteenable's alpha channel: false keeps the target's alpha as it is. */
 alphaWrite?(enabled:boolean):void;
 /** With blending disabled and alpha 0, a shape clears what it covers (to transparent black). */
 eraseRect?(x1:number,y1:number,x2:number,y2:number):void;
 eraseTriangle?(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number):void;
 /** Discard source fragments with zero alpha before blending (default reference value zero). */
 alphaTest?(enabled:boolean):void;
 /** draw_surface_ext: a surface at room coordinates (view-relative on the screen). */
 surfaceDraw?(id:number,x:number,y:number,alpha:number,blend?:number):void;
 /** Copy raw pixels without blending. A null source denotes the application screen. */
 surfaceCopy?(id:number,x:number,y:number,source:number|null):void;
 /** Surface crop, independent of sprite origins, with scale, tint and alpha. */
 surfacePart?(id:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number):void;
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean):void;
 /** draw_circle_color (filled): colour c1 at the centre fading to c2 at the edge. */
 circleColor?(x:number,y:number,r:number,c1:number,c2:number,alpha:number):void;
 /** surface_resize: the surface keeps its number at a new size (cleared). */
 surfaceResize?(id:number,width:number,height:number):void;
 text(x:number,y:number,text:string,style:TextStyle):void;
}
/** GameMaker blend modes the remake draws with. */
export type BlendMode='normal'|'add'|'subtract'|'add-preserve-alpha'|'normal-preserve-alpha'|'dest-alpha-add'|'dest-alpha-copy'|'multiply';
/** GML draw state (draw_set_color, draw_set_alpha, draw_set_font, draw_set_halign/valign). */
export interface DrawState{color:number;alpha:number;font:string;halign:HAlign;valign:HAlign}
export const C={white:0xffffff,black:0,red:0x0000ff,lime:0x00ff00,green:0x008000,aqua:0xffff00,purple:0x800080,gray:0x808080,ltgray:0xc0c0c0,yellow:0x00ffff,orange:0x40a0ff};
/** make_color_hsv (GameMaker 2): hue, saturation and value from 0 to 255, clamped, to a BGR colour. */
export function makeColorHsv(h:number,s:number,v:number){
 const clamp=(x:number)=>x<0?0:x>255?255:x;h=clamp(h);const sat=clamp(s)/255,val=clamp(v)/255;
 let r=val,g=val,b=val;
 if(sat!==0){
  const deg=h*360/255;let sector=deg/60;if(deg===360)sector=0;
  const i=Math.trunc(sector),f=sector-i,p=val*(1-sat),q=val*(1-sat*f),t=val*(1-sat*(1-f));
  [r,g,b]=i===0?[val,t,p]:i===1?[q,val,p]:i===2?[p,val,t]:i===3?[p,q,val]:i===4?[t,p,val]:[val,p,q];
 }
 const out=(x:number)=>Math.min(255,Math.max(0,Math.trunc(x*255+0.5)));
 return out(r)|(out(g)<<8)|(out(b)<<16);
}
/** merge_color: each channel mixed and rounded (GameMaker rounds: merge_color(c_black,c_white,0.5) is 0x808080), in
 * 32-bit floats as the reference runtime computes it. */
export function mergeColor(a:number,b:number,amount:number){
 const f=Math.fround,t=f(amount),inv=f(1-t);let out=0;
 for(const sh of [0,8,16]){const x=(a>>sh)&255,y=(b>>sh)&255;out|=(Math.trunc(f(f(f(y*t)+f(x*inv))+0.5))&255)<<sh;}
 return out;
}
