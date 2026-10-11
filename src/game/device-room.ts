// The device room behind the chapter menu, drawn in code as 320x240 pixel art (scaled 2x):
// a wood-panelled room, a big framed screen (the menu sits in it), a console and Kris facing the screen.
import type {AssetStore} from './assets';

const W=320,H=240,FLOOR_Y=172;
// Screen opening that the 640x480 menu panel (157,42 306x281) fills.
const SCREEN={x:78,y:21,w:154,h:141};

function paint(c:CanvasRenderingContext2D){
 // Back wall: vertical boards with seams and a warm bloom behind the screen.
 c.fillStyle='#2a160e';c.fillRect(0,0,W,FLOOR_Y);
 for(let x=0;x<W;x+=22){c.fillStyle='#1d0f09';c.fillRect(x,0,1,FLOOR_Y);c.fillStyle='#38200f';c.fillRect(x+1,0,1,FLOOR_Y);}
 const bloom=c.createRadialGradient(155,90,20,155,90,150);bloom.addColorStop(0,'rgba(170,82,38,.45)');bloom.addColorStop(1,'rgba(170,82,38,0)');
 c.fillStyle=bloom;c.fillRect(0,0,W,FLOOR_Y);
 // Floor: planks receding toward the wall.
 c.fillStyle='#1a0d07';c.fillRect(0,FLOOR_Y,W,H-FLOOR_Y);
 let y=FLOOR_Y,gap=3;while(y<H){c.fillStyle='#2b170c';c.fillRect(0,y,W,1);y+=gap;gap+=2;}
 for(let i=-6;i<=6;i++){c.fillStyle='#120804';const top=155+i*14,bottom=155+i*48;for(let r=0;r<H-FLOOR_Y;r++){const t=r/(H-FLOOR_Y);c.fillRect(Math.round(top+(bottom-top)*t),FLOOR_Y+r,1,1);}}
 c.fillStyle='#3d2414';c.fillRect(0,FLOOR_Y,W,1);
 // Big framed screen: outer wood frame, bevel, inner shadow.
 const f={x:SCREEN.x-8,y:SCREEN.y-7,w:SCREEN.w+16,h:SCREEN.h+14};
 c.fillStyle='#160a05';c.fillRect(f.x+2,f.y+3,f.w,f.h);
 c.fillStyle='#4a2614';c.fillRect(f.x,f.y,f.w,f.h);
 c.fillStyle='#6a3a1e';c.fillRect(f.x,f.y,f.w,1);c.fillRect(f.x,f.y,1,f.h);
 c.fillStyle='#2c160b';c.fillRect(f.x+f.w-1,f.y,1,f.h);c.fillRect(f.x,f.y+f.h-1,f.w,1);
 c.fillStyle='#24120a';c.fillRect(SCREEN.x-2,SCREEN.y-2,SCREEN.w+4,SCREEN.h+4);
 // Console on the floor under the screen.
 const k={x:110,y:174,w:99,h:22};
 c.fillStyle='#0f0804';c.fillRect(k.x+3,k.y+k.h,k.w-2,3);
 c.fillStyle='#3e2a1d';c.fillRect(k.x,k.y,k.w,k.h);c.fillStyle='#5e4231';c.fillRect(k.x,k.y,k.w,3);c.fillRect(k.x+38,k.y-3,23,3);
 c.fillStyle='#24170f';for(let i=0;i<6;i++)c.fillRect(k.x+8+i*14,k.y+9,9,7);
 c.fillStyle='#9b7c66';c.fillRect(k.x+44,k.y-2,11,1);c.fillStyle='#ff4a3d';c.fillRect(k.x+k.w-8,k.y+5,2,2);
}

export class DeviceRoom{
 private room=document.createElement('canvas');private painted=false;
 constructor(private assets:AssetStore){this.room.width=W;this.room.height=H;}
 draw(ctx:CanvasRenderingContext2D){
  if(!this.painted){paint(this.room.getContext('2d')!);this.painted=true;}
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(this.room,0,0,640,480);
  // Light from the screen spilling across the floor.
  ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(0,330,0,480);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(150,330);ctx.lineTo(470,330);ctx.lineTo(640,480);ctx.lineTo(0,480);ctx.closePath();ctx.fill();
  ctx.restore();
  // Kris, seen from behind, facing the screen (the user's own DELTARUNE art; absent without it).
  const kris=this.assets.manifest.sprites['1:spr_krisu_dark'],frame=kris?.frames[0],image=frame&&this.assets.images.get(frame.url);
  if(frame&&image){ctx.imageSmoothingEnabled=false;ctx.drawImage(image,302+frame.x*2,396+frame.y*2,frame.width*2,frame.height*2);}
 }
}
