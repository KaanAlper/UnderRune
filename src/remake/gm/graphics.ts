// What the remake draws, in room coordinates; the host turns it into canvas calls (subtracting the view).
export type HAlign=0|1|2;
export interface TextStyle{font:string;color:number;alpha:number;halign:HAlign;valign:HAlign;xscale:number;yscale:number;angle:number}
export interface GmGraphics{
 sprite(name:string,frame:number,x:number,y:number,xscale:number,yscale:number,angle:number,blend:number,alpha:number):void;
 rect(x1:number,y1:number,x2:number,y2:number,color:number,alpha:number,outline:boolean):void;
 circle(x:number,y:number,r:number,color:number,alpha:number,outline:boolean):void;
 text(x:number,y:number,text:string,style:TextStyle):void;
}
/** GML draw state (draw_set_color, draw_set_alpha, draw_set_font, draw_set_halign/valign). */
export interface DrawState{color:number;alpha:number;font:string;halign:HAlign;valign:HAlign}
export const C={white:0xffffff,black:0,red:0x0000ff,lime:0x00ff00,green:0x008000,aqua:0xffff00,purple:0x800080,gray:0x808080,ltgray:0xc0c0c0,yellow:0x00ffff,orange:0x40a0ff};
