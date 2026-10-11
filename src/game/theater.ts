// Opening theater: a big CRT between an UNDERTALE stage half (red curtain, warm light, Frisk) and a
// DELTARUNE half (blue curtain, green-tinted light, Kris). Pressing a side's remote turns the TV on and
// sweeps that side's theme across the stage. UNDERTALE shows "coming soon"; DELTARUNE connects to the device.
import type {AssetStore} from './assets';
import type {InputFrame} from './input';
import {pixelHeart} from './renderer';

export type TheaterSide='undertale'|'deltarune';
export const STAGE_WIDTH=320,STAGE_HEIGHT=240,STAGE_CENTER=160;
// Strong curves for this project's motion: ease-out for entering, ease-in-out for on-screen movement.
const EASE_OUT=[0.23,1,0.32,1] as const,EASE_IN_OUT=[0.77,0,0.175,1] as const;
// Durations in 60 Hz frames.
const POWER_ON=21,POWER_OFF=12,SWEEP_HALF=42,SWEEP_FULL=54,LOGO_IN=15,CHANNEL_STATIC=9,REMOTE_BLINK=12,ZOOM_IN=24;

export function cubicBezier([x1,y1,x2,y2]:readonly number[],t:number):number{
 if(t<=0)return 0;if(t>=1)return 1;
 const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
 const x=(s:number)=>((ax*s+bx)*s+cx)*s,y=(s:number)=>((ay*s+by)*s+cy)*s,dx=(s:number)=>(3*ax*s+2*bx)*s+cx;
 let s=t;
 for(let i=0;i<8;i++){const error=x(s)-t;if(Math.abs(error)<1e-7)return y(s);const slope=dx(s);if(Math.abs(slope)<1e-7)break;s-=error/slope;}
 let lo=0,hi=1;s=t;while(hi-lo>1e-7){if(x(s)<t)lo=s;else hi=s;s=(lo+hi)/2;}
 return y(s);
}

type Tween={from:number;to:number;start:number;frames:number;curve:readonly number[]};
const still=(value:number):Tween=>({from:value,to:value,start:0,frames:0,curve:EASE_OUT});

export class TheaterState{
 selected:TheaterSide='deltarune';active:TheaterSide|null=null;frame=0;
 remoteFrame=-REMOTE_BLINK;staticFrame=-CHANNEL_STATIC;
 private enteringFrame=-1;private entered=false;private connectQueued=false;
 private boundaryTween=still(STAGE_CENTER);private powerTween=still(0);private logoTween=still(0);
 constructor(readonly reducedMotion=false){}
 private value(t:Tween){return t.frames<=0||this.frame>=t.start+t.frames?(this.frame<t.start?t.from:t.to):t.from+(t.to-t.from)*cubicBezier(t.curve,Math.max(0,(this.frame-t.start)/t.frames));}
 private tween(from:number,to:number,frames:number,curve:readonly number[],delay=0):Tween{return {from,to,start:this.frame+delay,frames:this.reducedMotion?0:frames,curve};}
 /** Theme boundary on the stage: UNDERTALE left of it, DELTARUNE right of it. */
 get boundary(){return this.value(this.boundaryTween);}
 get power(){return this.value(this.powerTween);}
 get logo(){return this.active?this.value(this.logoTween):0;}
 get zoom(){return this.entered?1:this.enteringFrame<0?0:cubicBezier(EASE_IN_OUT,Math.min(1,(this.frame-this.enteringFrame)/(this.reducedMotion?10:ZOOM_IN)));}
 get channelStatic(){return this.frame-this.staticFrame<CHANNEL_STATIC&&!this.reducedMotion;}
 get remoteBlink(){return this.frame-this.remoteFrame<REMOTE_BLINK;}
 themeAt(x:number):TheaterSide{return x<this.boundary?'undertale':'deltarune';}
 select(side:TheaterSide){if(this.enteringFrame<0)this.selected=side;}
 press(side:TheaterSide){
  if(this.enteringFrame>=0)return;
  this.selected=side;this.remoteFrame=this.frame;
  if(this.active===side){
   // Same channel again: DELTARUNE connects as soon as its logo is up (an early press waits); UNDERTALE is not playable yet.
   if(side==='deltarune')this.connectQueued=true;
   return;
  }
  this.connectQueued=false;
  const switching=this.active!==null,target=side==='undertale'?STAGE_WIDTH:0;
  this.active=side;
  this.boundaryTween=this.tween(this.boundary,target,Math.abs(target-this.boundary)>STAGE_CENTER?SWEEP_FULL:SWEEP_HALF,EASE_IN_OUT);
  if(this.powerTween.to!==1)this.powerTween=this.tween(this.power,1,POWER_ON,EASE_OUT);
  if(switching)this.staticFrame=this.frame;
  const logoDelay=this.reducedMotion?0:switching?CHANNEL_STATIC:POWER_ON;
  this.logoTween={...this.tween(0,1,LOGO_IN,EASE_OUT,logoDelay),frames:this.reducedMotion?8:LOGO_IN};
 }
 turnOff(){
  if(this.enteringFrame>=0||!this.active)return;
  this.active=null;this.connectQueued=false;
  this.boundaryTween=this.tween(this.boundary,STAGE_CENTER,SWEEP_HALF,EASE_IN_OUT);
  this.powerTween=this.tween(this.power,0,POWER_OFF,EASE_OUT);
  this.logoTween=still(0);
 }
 step(input:InputFrame):'enter-deltarune'|null{
  this.frame++;
  if(input.x)this.select(input.x<0?'undertale':'deltarune');
  if(input.confirm)this.press(this.selected);
  if(input.cancel)this.turnOff();
  if(this.connectQueued&&this.enteringFrame<0&&this.active==='deltarune'&&this.power>=1&&this.logo>=1)this.enteringFrame=this.frame;
  if(this.enteringFrame>=0&&!this.entered&&this.zoom>=1){this.entered=true;return 'enter-deltarune';}
  return null;
 }
}

const THEME={
 undertale:{light:'#ffab4a',screen:['#2a0d06','#090201'],label:'#ffb35c',dim:'#6e4a2c'},
 deltarune:{light:'#6dffc3',screen:['#06173a','#01030b'],label:'#7dffd0',dim:'#2f5c55'},
} as const;
// Stage layout in 320x240 pixels (drawn 2x, like the games themselves).
const TV={x:78,y:50,w:164,h:126},SCREEN={x:86,y:58,w:148,h:94},FLOOR_Y=192;
const FRISK={x:24,feet:200},KRIS={x:277,feet:200};
// Hit areas in 640x480 canvas pixels, for pointer/touch controls.
export const THEATER_HITS={undertale:{x:0,y:250,w:150,h:180},deltarune:{x:490,y:250,w:150,h:180},tv:{x:156,y:100,w:328,h:252}};

export class TheaterView{
 private stage=document.createElement('canvas');private mask=document.createElement('canvas');
 private blueCurtain:HTMLCanvasElement|null=null;private tints=new Map<string,HTMLCanvasElement>();
 constructor(private assets:AssetStore){
  for(const c of [this.stage,this.mask]){c.width=STAGE_WIDTH;c.height=STAGE_HEIGHT;}
 }
 /** Image URLs the scene draws, for preloading. */
 urls(){
  const keys=['0:spr_maincharad','0:ut_wordmark','1:IMAGE_LOGO','1:spr_krisd_dark','2:spr_cutscene_16_remote_control','3:spr_dw_tv_curtain','3:spr_tenna_spotlight'];
  return [...keys.flatMap(k=>this.assets.manifest.sprites[k]?.frames.map(f=>f.url)??[]),...(this.assets.manifest.utFont?[this.assets.manifest.utFont.url]:[])];
 }
 private image(key:string,frame=0){const s=this.assets.manifest.sprites[key];const f=s?.frames[frame%s.frames.length];return f?{img:this.assets.images.get(f.url),f}:null;}
 private sprite(c:CanvasRenderingContext2D,key:string,x:number,y:number,frame=0){const s=this.image(key,frame);if(s?.img)c.drawImage(s.img,x+s.f.x,y+s.f.y);return !!s?.img;}
 // The same Chapter 3 curtain, recolored for the DELTARUNE half: its brightness mapped onto cobalt blue.
 private curtains(){
  const red=this.image('3:spr_dw_tv_curtain')?.img;if(!red)return null;
  if(!this.blueCurtain){
   const c=document.createElement('canvas');c.width=STAGE_WIDTH;c.height=STAGE_HEIGHT;const x=c.getContext('2d')!;x.drawImage(red,0,0);
   const data=x.getImageData(0,0,c.width,c.height),p=data.data;
   for(let i=0;i<p.length;i+=4){const v=Math.max(p[i],p[i+1],p[i+2]);p[i]=v*.2;p[i+1]=v*.36;p[i+2]=Math.min(255,v*1.05);}
   x.putImageData(data,0,0);this.blueCurtain=c;
  }
  return {red,blue:this.blueCurtain};
 }
 private tinted(key:string,color:string){
  const id=key+color;let c=this.tints.get(id);if(c)return c;
  const s=this.image(key);if(!s?.img)return null;
  c=document.createElement('canvas');c.width=s.f.width;c.height=s.f.height;const x=c.getContext('2d')!;
  x.drawImage(s.img,0,0);x.globalCompositeOperation='source-in';x.fillStyle=color;x.fillRect(0,0,c.width,c.height);this.tints.set(id,c);return c;
 }
 private drawBackdrop(c:CanvasRenderingContext2D,state:TheaterState){
  const b=state.boundary,curtains=this.curtains();
  if(curtains)c.drawImage(curtains.red,0,0);else{c.fillStyle='#5c0a16';c.fillRect(0,0,STAGE_WIDTH,STAGE_HEIGHT);}
  // Feathered seam: the DELTARUNE half fades in over 16 px around the boundary.
  const m=this.mask.getContext('2d')!;m.globalCompositeOperation='source-over';m.clearRect(0,0,STAGE_WIDTH,STAGE_HEIGHT);
  if(curtains)m.drawImage(curtains.blue,0,0);else{m.fillStyle='#0c1a5c';m.fillRect(0,0,STAGE_WIDTH,STAGE_HEIGHT);}
  const g=m.createLinearGradient(b-8,0,b+8,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');
  m.globalCompositeOperation='destination-in';m.fillStyle=g;m.fillRect(0,0,STAGE_WIDTH,STAGE_HEIGHT);
  c.drawImage(this.mask,0,0);
 }
 private drawLight(c:CanvasRenderingContext2D,x:number,state:TheaterState){
  const color=THEME[state.themeAt(x)].light;
  c.save();c.globalCompositeOperation='screen';
  const cone=c.createLinearGradient(0,0,0,FLOOR_Y+8);cone.addColorStop(0,color+'00');cone.addColorStop(1,color+'55');
  c.fillStyle=cone;c.beginPath();c.moveTo(x-6,0);c.lineTo(x+6,0);c.lineTo(x+30,FLOOR_Y+8);c.lineTo(x-30,FLOOR_Y+8);c.closePath();c.fill();
  c.restore();
  const pool=this.tinted('3:spr_tenna_spotlight',color);
  if(pool){c.save();c.globalAlpha=.55;c.globalCompositeOperation='screen';c.drawImage(pool,x-pool.width/2,FLOOR_Y+2);c.restore();}
 }
 private drawFloor(c:CanvasRenderingContext2D,state:TheaterState){
  c.fillStyle='#24160f';c.fillRect(0,FLOOR_Y,STAGE_WIDTH,STAGE_HEIGHT-FLOOR_Y);
  c.fillStyle='#180e09';for(let y=FLOOR_Y+6;y<STAGE_HEIGHT;y+=7)c.fillRect(0,y,STAGE_WIDTH,1);
  for(let row=0;row<7;row++)for(let x=(row%2)*23;x<STAGE_WIDTH;x+=46)c.fillRect(x,FLOOR_Y+row*7,1,6);
  c.fillStyle='#3d2718';c.fillRect(0,FLOOR_Y,STAGE_WIDTH,1);
  // Footlights along the stage lip take the theme of the half they sit in.
  for(let x=10;x<STAGE_WIDTH;x+=20){c.fillStyle=THEME[state.themeAt(x)].light;c.fillRect(x,STAGE_HEIGHT-5,3,2);c.globalAlpha=.25;c.fillRect(x-2,STAGE_HEIGHT-7,7,6);c.globalAlpha=1;}
 }
 private drawTv(c:CanvasRenderingContext2D){
  const {x,y,w,h}=TV;
  // Rabbit-ear antenna.
  c.fillStyle='#8d8899';
  for(const [ex,ey] of [[132,12],[194,8]]){const steps=40;for(let i=0;i<=steps;i++){const t=i/steps;c.fillRect(Math.round(160+(ex-160)*t),Math.round(y+(ey-y)*t),1,1);}c.fillRect(ex-1,ey-1,3,3);}
  c.fillStyle='#2b2733';c.fillRect(150,y-6,20,7);
  // Cabinet the TV stands on.
  c.fillStyle='#3a2416';c.fillRect(104,y+h,112,FLOOR_Y-(y+h)+4);c.fillStyle='#2a190f';c.fillRect(104,y+h+8,112,1);c.fillRect(158,y+h+9,1,FLOOR_Y-(y+h)-5);
  c.fillStyle='#4e331f';c.fillRect(104,y+h,112,2);
  // Body with stepped pixel corners, top highlight and right/bottom shade.
  c.fillStyle='#2e2a36';c.fillRect(x+2,y,w-4,h);c.fillRect(x,y+2,w,h-4);c.fillRect(x+1,y+1,w-2,h-2);
  c.fillStyle='#4a4555';c.fillRect(x+2,y,w-4,1);c.fillRect(x,y+2,1,h-4);
  c.fillStyle='#1c1922';c.fillRect(x+w-1,y+2,1,h-4);c.fillRect(x+2,y+h-1,w-4,1);
  // Screen bezel.
  c.fillStyle='#15131a';c.fillRect(SCREEN.x-3,SCREEN.y-3,SCREEN.w+6,SCREEN.h+6);
  // Control strip: speaker slots and two knobs.
  const py=SCREEN.y+SCREEN.h+6;c.fillStyle='#1c1922';
  for(let i=0;i<6;i++)c.fillRect(x+12,py+i*2,92,1);
  for(const kx of [x+122,x+144]){c.fillStyle='#15131a';c.fillRect(kx-4,py,9,9);c.fillStyle='#55505f';c.fillRect(kx-3,py+1,7,7);c.fillStyle='#8d8899';c.fillRect(kx,py+1,1,3);}
 }
 private drawGlass(c:CanvasRenderingContext2D){
  const {x,y,w,h}=SCREEN;c.fillStyle='#07080b';c.fillRect(x,y,w,h);
  c.fillStyle='#ffffff';c.globalAlpha=.05;for(let i=0;i<26;i++)c.fillRect(x+10+i,y+4+i,22,1);c.globalAlpha=1;
 }
 private drawCast(c:CanvasRenderingContext2D,state:TheaterState){
  const frisk=this.image('0:spr_maincharad'),kris=this.image('1:spr_krisd_dark');
  const fy=FRISK.feet-(frisk?.f.height??30),ky=KRIS.feet-(kris?.f.height??38);
  if(!this.sprite(c,'0:spr_maincharad',FRISK.x,fy)){c.fillStyle='#f1c27a';c.fillRect(FRISK.x+4,fy+4,12,10);c.fillStyle='#4f7bd6';c.fillRect(FRISK.x+3,fy+14,14,12);}
  this.sprite(c,'1:spr_krisd_dark',KRIS.x,ky);
  // Each holds the TV remote; the chosen one is lifted and blinks while it fires.
  const remotes:[TheaterSide,number,number][]=[['undertale',FRISK.x+17,fy+15],['deltarune',KRIS.x-6,ky+20]];
  for(const [side,rx,ry] of remotes){
   const lift=state.selected===side?2:0;
   if(!this.sprite(c,'2:spr_cutscene_16_remote_control',rx,ry-lift)){c.fillStyle='#c9b29a';c.fillRect(rx,ry-lift,6,11);}
   if(state.selected===side&&state.remoteBlink&&Math.floor(state.frame/3)%2===0){
    c.fillStyle='#ff3d3d';const tx=side==='undertale'?SCREEN.x:SCREEN.x+SCREEN.w,ty=SCREEN.y+SCREEN.h/2,sx=rx+3,sy=ry-lift;
    for(let i=2;i<14;i+=2){const t=i/14;c.fillRect(Math.round(sx+(tx-sx)*t),Math.round(sy+(ty-sy)*t),1,1);}
   }
  }
  const chosen=state.selected==='undertale'?{x:FRISK.x+10,y:fy-8}:{x:KRIS.x+9,y:ky-8};
  pixelHeart(c,chosen.x,chosen.y,'#ff243c',1);
 }
 private drawScreen(ctx:CanvasRenderingContext2D,state:TheaterState){
  const S={x:SCREEN.x*2,y:SCREEN.y*2,w:SCREEN.w*2,h:SCREEN.h*2},p=state.power;if(p<=0)return;
  const side=state.active??state.selected,theme=THEME[side];
  ctx.save();ctx.beginPath();ctx.rect(S.x,S.y,S.w,S.h);ctx.clip();
  if(p<1){
   // CRT power-on: a dot opens into a line, then the line opens into the picture.
   const width=S.w*Math.min(1,p/0.4),height=p<0.4?2:2+(S.h-2)*((p-0.4)/0.6);
   ctx.fillStyle=theme.screen[1];ctx.fillRect(S.x,S.y,S.w,S.h);
   ctx.fillStyle='#ffffff';ctx.globalAlpha=1-Math.max(0,(p-0.4)/0.6)*0.85;
   ctx.fillRect(S.x+(S.w-width)/2,S.y+(S.h-height)/2,width,height);ctx.globalAlpha=1;
  }else{
   const g=ctx.createRadialGradient(S.x+S.w/2,S.y+S.h/2,10,S.x+S.w/2,S.y+S.h/2,S.w*0.7);g.addColorStop(0,theme.screen[0]);g.addColorStop(1,theme.screen[1]);
   ctx.fillStyle=g;ctx.fillRect(S.x,S.y,S.w,S.h);
   if(state.channelStatic){for(let i=0;i<900;i++){const v=(Math.sin(i*12.9898+state.frame*78.233)*43758.5453)%1;const n=Math.abs(v);ctx.fillStyle=`rgba(255,255,255,${n*.7})`;ctx.fillRect(S.x+Math.floor(n*997%S.w),S.y+Math.floor(n*7919%S.h),2,2);}}
   else if(state.active){
    ctx.globalAlpha=state.logo;const cx=S.x+S.w/2;
    if(state.active==='undertale'){
     const mark=this.image('0:ut_wordmark');
     if(mark?.img)ctx.drawImage(mark.img,Math.round(cx-mark.f.width/2),S.y+58);
     else this.assets.text(ctx,'UNDERTALE',cx,S.y+58,2,'#fff','center');
     this.assets.text(ctx,'COMING SOON',cx,S.y+112,1,'#ffffff','center',this.assets.hasFont('undertale')?'undertale':'deltarune');
    }else{
     const logo=this.image('1:IMAGE_LOGO');
     if(logo?.img)ctx.drawImage(logo.img,Math.round(cx-logo.f.width/2),S.y+56);
     else this.assets.text(ctx,'DELTARUNE',cx,S.y+58,2,'#fff','center');
     if(Math.floor(state.frame/40)%3!==2||state.reducedMotion)this.assets.text(ctx,'[ Z ] CONNECT',cx,S.y+118,1,'#ffff00','center');
    }
    ctx.globalAlpha=1;
   }
  }
  // Scanlines and a soft vignette sell the tube.
  ctx.fillStyle='rgba(0,0,0,.24)';for(let y=S.y;y<S.y+S.h;y+=3)ctx.fillRect(S.x,y,S.w,1);
  const v=ctx.createRadialGradient(S.x+S.w/2,S.y+S.h/2,S.w*0.3,S.x+S.w/2,S.y+S.h/2,S.w*0.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');
  ctx.fillStyle=v;ctx.fillRect(S.x,S.y,S.w,S.h);
  ctx.restore();
  // The lit tube spills its color onto the stage.
  ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.16*Math.min(1,p);
  const glow=ctx.createRadialGradient(320,210,60,320,210,300);glow.addColorStop(0,THEME[side].light);glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,640,480);ctx.restore();
 }
 private drawLabels(ctx:CanvasRenderingContext2D,state:TheaterState){
  const ut=this.assets.hasFont('undertale')?'undertale':'deltarune',sel=state.selected;
  // Each name in its own game's font, under its character.
  this.assets.text(ctx,'UNDERTALE',84,442,1,sel==='undertale'?THEME.undertale.label:THEME.undertale.dim,'center',ut);
  this.assets.text(ctx,'DELTARUNE',556,442,2,sel==='deltarune'?THEME.deltarune.label:THEME.deltarune.dim,'center');
  const hint=!state.active?'<  >  CHOOSE A REMOTE     Z  PRESS IT':state.active==='deltarune'?'Z  CONNECT     X  TURN OFF':'X  TURN OFF';
  this.assets.text(ctx,hint,320,450,1,'#c8c3d0','center');
 }
 draw(ctx:CanvasRenderingContext2D,state:TheaterState){
  const c=this.stage.getContext('2d')!;c.imageSmoothingEnabled=false;
  this.drawBackdrop(c,state);
  this.drawLight(c,FRISK.x+10,state);this.drawLight(c,KRIS.x+9,state);
  this.drawFloor(c,state);this.drawTv(c);this.drawGlass(c);this.drawCast(c,state);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);
  // Connecting: the camera pushes into the tube while the room fades out.
  const z=state.zoom;
  if(z>0&&!state.reducedMotion){const s=1+1.6*z;ctx.translate(320,210);ctx.scale(s,s);ctx.translate(-320,-210);}
  ctx.drawImage(this.stage,0,0,640,480);
  this.drawScreen(ctx,state);
  ctx.restore();
  if(z<=0)this.drawLabels(ctx,state);
  if(z>0){ctx.fillStyle=`rgba(0,0,0,${z})`;ctx.fillRect(0,0,640,480);}
 }
}
