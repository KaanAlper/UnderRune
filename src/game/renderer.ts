import {AssetStore} from './assets';
import {DeviceRoom} from './device-room';
import {CHAPTER_NAMES} from './boss-deck';
import {availabilityLabel} from '../remake/host/encounters';

export function pixelHeart(ctx:CanvasRenderingContext2D,x:number,y:number,color='#ff243c',size=1){
 const pattern=['01100110','11111111','11111111','01111110','00111100','00011000'];ctx.fillStyle=color;
 for(let j=0;j<pattern.length;j++)for(let i=0;i<8;i++)if(pattern[j][i]==='1')ctx.fillRect(Math.round(x+(i-4)*size),Math.round(y+(j-3)*size),size,size);
}
export class Renderer{
 private deviceRoom:DeviceRoom;
 constructor(public ctx:CanvasRenderingContext2D,public assets:AssetStore,private publicDemo=false){this.deviceRoom=new DeviceRoom(assets);}
 private text(t:string,x:number,y:number,s=2,c='#fff',a:'left'|'center'|'right'='left'){this.assets.text(this.ctx,t,x,y,s,c,a);}
 clear(){this.ctx.imageSmoothingEnabled=false;this.ctx.fillStyle='#000';this.ctx.fillRect(0,0,640,480);}
 intro(frame:number){
  this.clear();const c=this.ctx;c.strokeStyle='#343039';c.lineWidth=2;c.strokeRect(72,62,496,354);this.text('THE DEVICE',320,153,4,'#fff','center');
  this.text('* ARE YOU THERE?',320,224,2,'#bfbac8','center');this.text('[ Z / ENTER ] CONNECT',320,286,2,frame%90<65?'#ffff00':'#b2a941','center');
  this.text(this.publicDemo?'DELTARUNE  /  PUBLIC DEMO':'DELTARUNE  /  LOCAL BOSS BATTLES',320,361,1,'#706b79','center');
 }
 room(chapter:number,count:number){
  // Locally downloaded reference art (public/device-room, not in the repository) when present; otherwise the drawn room.
  this.clear();const c=this.ctx,bg=this.assets.images.get('/device-room/bg.png');
  if(bg)c.drawImage(bg,-10,-10,660,500);else this.deviceRoom.draw(c);
  c.fillStyle='#09070e';c.fillRect(157,42,306,281);this.text('THE DARK WORLDS',310,50,2,'#fff','center');
  this.text('CHOOSE YOUR CHAPTER',310,89,1,'#b6a5c6','center');
  for(let i=1;i<=5;i++){const y=116+(i-1)*32;if(chapter===i){pixelHeart(c,175,y+10,'#e1c8ff',1);c.fillStyle='#241b35';c.fillRect(192,y-1,255,27);}this.text(String(i).padStart(2,'0'),194,y,1,'#806c99');this.text(CHAPTER_NAMES[i],222,y,1,chapter===i?'#ead6ff':'#cac4cc');}
  const ready=this.publicDemo?availabilityLabel(chapter).replace(' AVAILABLE',''):count+' ENCOUNTERS';this.text(ready,310,289,.7,'#a295b0','center');
  if(bg){
   const glow=this.assets.images.get('/device-room/tvglow.png');if(glow){c.globalAlpha=.23;c.drawImage(glow,0,317,640,160);c.globalAlpha=1;}
   const console=this.assets.images.get('/device-room/console.png');if(console)c.drawImage(console,221,342,198,90);
   const vessel=this.assets.images.get('/device-room/vessel_d_0.png');if(vessel)c.drawImage(vessel,301,394,38,76);
  }
 }
}
