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
 sprite(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,blend:number,alpha:number):void;
 /** draw_sprite_part_ext: origin-independent crop in untrimmed sprite coordinates. */
 spritePart?(name:string,frame:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number):void;
 spriteFog?(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,color:number,alpha:number):void;
 /** draw_background_tiled_ext: frame 0 repeated over the whole view from (x, y). */
 spriteTiled?(name:string,x:number,y:number,xscale:number,yscale:number,blend:number,alpha:number):void;
 rect(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean):void;
 line?(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,width?:number):void;
 triangle?(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,color:number,alpha:number,outline:boolean):void;
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean):void;
 text(x:number,y:number,text:string,style:TextStyle):void;
}
/** GML draw state (draw_set_color, draw_set_alpha, draw_set_font, draw_set_halign/valign). */
export interface DrawState{color:number;alpha:number;font:string;halign:HAlign;valign:HAlign}
export const C={white:0xffffff,black:0,red:0x0000ff,lime:0x00ff00,green:0x008000,aqua:0xffff00,purple:0x800080,gray:0x808080,ltgray:0xc0c0c0,yellow:0x00ffff,orange:0x40a0ff};
/** merge_color: each channel mixed and rounded (GameMaker rounds: merge_color(c_black,c_white,0.5) is 0x808080), in
 * 32-bit floats as the reference runtime computes it. */
export function mergeColor(a:number,b:number,amount:number){
 const f=Math.fround,t=f(amount),inv=f(1-t);let out=0;
 for(const sh of [0,8,16]){const x=(a>>sh)&255,y=(b>>sh)&255;out|=(Math.trunc(f(f(f(y*t)+f(x*inv))+0.5))&255)<<sh;}
 return out;
}
