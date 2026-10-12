// DELTARUNE battle framework, re-implemented for the remake: the soul and its graze box, the battle box,
// bullets, the damage formula, screen shake and damage numbers. Object indices are Chapter 1's; event
// dispatch order depends on them.
import {moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {eq,ge,gt,le,lt,pointDistance,round} from '../gm/math';
import {C} from '../gm/graphics';

export const KEY={left:37,up:38,right:39,down:40,z:90,x:88,c:67,enter:13,shift:16,ctrl:17};
const held=(rt:GmRuntime,...keys:number[])=>keys.some(k=>rt.input.held.has(k));
export const input={
 left:(rt:GmRuntime)=>held(rt,KEY.left),right:(rt:GmRuntime)=>held(rt,KEY.right),
 up:(rt:GmRuntime)=>held(rt,KEY.up),down:(rt:GmRuntime)=>held(rt,KEY.down),
 cancel:(rt:GmRuntime)=>held(rt,KEY.x,KEY.shift),
};

// Scene objects other code checks for or reads (their own behaviour lives elsewhere or is visual only).
export const mainchara:GmObjectDef={name:'obj_mainchara',index:30,depth:-20,sprite:'spr_krisd'};
export const eventManager:GmObjectDef={name:'obj_event_manager',index:0};
export const heroParent:GmObjectDef={name:'obj_heroparent',index:212,depth:100,sprite:'spr_krisb_idle'};
export const heroKris:GmObjectDef={name:'obj_herokris',index:213,depth:100,parent:heroParent,sprite:'spr_krisplace'};
export const heroSusie:GmObjectDef={name:'obj_herosusie',index:214,depth:100,parent:heroParent,sprite:'spr_krisplace'};
export const heroRalsei:GmObjectDef={name:'obj_heroralsei',index:215,depth:100,parent:heroParent,sprite:'spr_krisplace'};
/** The enemy turn's darkness: it fades the screen and the heroes in; with darken = 0 it closes the box and fades out. */
export const darkener:GmObjectDef={name:'obj_darkener',index:205,depth:200,events:{
 create:(s,rt)=>{if(rt.count(darkener)>1){rt.destroy(s);return;}s.darken=1;s.darkamt=0;},
 draw:(s,rt)=>{
  if(s.darken===1){for(const h of rt.all(heroParent))h.darkify=1;if(s.darkamt<15)s.darkamt+=1;}
  if(s.darken===0){
   for(const b of rt.all(growtangle))b.growcon=3;
   for(const h of rt.all(heroParent))h.darkify=0;
   if(s.darkamt>0)s.darkamt-=1;
   if(s.darkamt<=0)rt.destroy(s);
  }
  const d=rt.drawState;d.alpha=s.darkamt/20;d.color=C.black;rt.drawRect(rt.view.x-40,rt.view.y-40,rt.view.x+680,rt.view.y+520);d.alpha=1;
 },
}};
export const monsterParent:GmObjectDef={name:'obj_monsterparent',index:242,depth:90};
export const bulletGenParent:GmObjectDef={name:'obj_bulletgenparent',index:198};
/** At the end of the enemy turn the soul flies back into Kris and bursts. */
export const heartBurst:GmObjectDef={name:'obj_heartburst',index:209,sprite:'spr_heartoutline',events:{
 create:s=>{s.burst=0;},
 draw:(s,rt)=>{
  s.burst+=1;const b=s.burst,x=s.xstart+9,y=s.ystart+9;
  rt.drawSprite('spr_heartoutline2',0,x,y,0.25+b,0.25+b/2,0,C.white,0.8-b/6);
  rt.drawSprite('spr_heartoutline',0,x,y,0.25+b/1.5,0.25+b/3,0,C.white,1-b/6);
  rt.drawSprite('spr_heartoutline',0,x,y,0.2+b/2.5,0.2+b/5,0,C.white,1.2-b/6);
  if(s.burst>10)rt.destroy(s);
 },
}};
export const returnHeart:GmObjectDef={name:'obj_returnheart',index:220,sprite:'spr_dodgeheart',events:{
 create:(s,rt)=>{
  s.burst=0;s.shift=1;s.imageAlpha=1;s.flytime=8;
  const kris=rt.first(heroKris)!;s.distx=kris.x+10;s.disty=kris.y+40;
  s.dist=pointDistance(s.x,s.y,s.distx,s.disty);moveTowardsPoint(s,s.distx,s.disty,s.dist/s.flytime);
  s.alarm[0]=s.flytime;s.imageSpeed=0;
 },
 alarm0:(s,rt)=>{s.x=s.distx;s.y=s.disty;rt.create(heartBurst,s.x,s.y);rt.destroy(s);},
}};
/** The soul leaves Kris and flies to the arena in eight original game frames. */
export const moveHeart:GmObjectDef={name:'obj_moveheart',index:219,sprite:'spr_dodgeheart',events:{
 create:(s,rt)=>{s.burst=0;s.shift=1;s.imageAlpha=0;s.flytime=8;s.distx=rt.view.x+310;s.disty=rt.view.y+160;s.dist=pointDistance(s.x,s.y,s.distx,s.disty);moveTowardsPoint(s,s.distx,s.disty,s.dist/s.flytime);s.alarm[0]=s.flytime;s.imageSpeed=0;rt.create(heartBurst,s.x,s.y);},
 step:s=>{s.imageAlpha+=.334;},
 alarm0:(s,rt)=>{s.x=s.distx;s.y=s.disty;rt.create(heart,s.x,s.y).depth=1;rt.destroy(s);},
}};

/** The music stream holder. Its Draw event moves it near the player with two random calls every frame. */
export const astream:GmObjectDef={name:'obj_astream',index:134,depth:-200,sprite:'spr_heart',events:{
 draw:(s,rt)=>{const m=rt.first(mainchara);if(m){s.x=m.x+rt.random.random(20);s.y=m.y+rt.random.random(20);}},
}};

export const afterimage:GmObjectDef={name:'obj_afterimage',index:192,events:{
 step:(s,rt)=>{s.imageAlpha=s.imageAlpha-0.04;if(lt(s.imageAlpha,0))rt.destroy(s);},
}};
export const afterimageGrow:GmObjectDef={name:'obj_afterimage_grow',index:193,events:{
 create:s=>{s.xrate=.2;s.yrate=.2;s.fade=.1;},
 step:(s,rt)=>{s.imageAlpha-=s.fade;s.imageXscale+=s.xrate;s.imageYscale+=s.yrate;if(lt(s.imageAlpha,0))rt.destroy(s);},
}};

/** Camera shake: offsets the view, alternating sides, shrinking by a pixel per swing. */
export const shake:GmObjectDef={name:'obj_shake',index:147,events:{
 create:s=>{s.camera=0;s.shakespeed=1;s.shakesign=1;s.shakex=4;s.shakey=4;s.siner=0;s.active=0;s.permashake=0;},
 step:(s,rt)=>{
  if(s.active!==0)return;
  s.camerax=rt.view.x;s.cameray=rt.view.y;
  if(rt.globals.flag[12]===0){rt.view.x=s.camerax+s.shakex;rt.view.y=s.cameray+s.shakey;}
  s.shakesign=-s.shakesign;s.active=1;s.alarm[0]=s.shakespeed;
 },
 alarm0:(s,rt)=>{
  if(rt.globals.flag[12]===0){rt.view.x=s.camerax+s.shakex*s.shakesign;rt.view.y=s.cameray+s.shakey*s.shakesign;}
  if(s.permashake===0){if(s.shakex>0)s.shakex-=1;if(s.shakey>0)s.shakey-=1;}
  s.shakesign=-s.shakesign;s.alarm[0]=s.shakespeed;
  if(s.shakex===0&&s.shakey===0)rt.destroy(s);
 },
 destroy:(s,rt)=>{rt.view.x=s.camerax;rt.view.y=s.cameray;},
}};

const mergeColor=(a:number,b:number,t:number)=>{
 const ch=(c:number,sh:number)=>(c>>sh)&255,mix=(sh:number)=>Math.trunc(ch(a,sh)+(ch(b,sh)-ch(a,sh))*t);
 return mix(0)|(mix(8)<<8)|(mix(16)<<16);
};
export {mergeColor};

/** Damage numbers: they pop, bounce twice, then fade upward. The motion runs in the Draw event. */
export const dmgWriter:GmObjectDef={name:'obj_dmgwriter',index:312,events:{
 create:(s,rt)=>{
  s.spec=0;s.delaytimer=0;s.delay=2;s.active=0;s.damage=round(rt.random.random(600));s.bounces=0;s.type=-1;
  s.stretch=0.2;s.stretchgo=1;s.lightf=mergeColor(C.purple,C.white,0.6);s.lightb=mergeColor(C.aqua,C.white,0.5);s.lightg=mergeColor(C.lime,C.white,0.5);
  s.kill=0;s.killtimer=0;s.killactive=0;
  for(const o of rt.all(dmgWriter))if(o.type!==3)o.killtimer=0;
  s.specialmessage=0;
 },
 draw:(s,rt)=>{
  if(s.delaytimer<s.delay)for(const o of rt.all(dmgWriter))o.killtimer=0;
  s.delaytimer+=1;
  if(s.delaytimer===s.delay){s.vspeed=-5-rt.random.random(2);s.hspeed=10;s.vstart=s.vspeed;s.flip=90;}
  if(s.delaytimer<s.delay)return;
  s.message=s.specialmessage;if(eq(s.damage,0))s.message=1;if(s.type===4)s.message=2;
  if(gt(s.hspeed,0))s.hspeed=s.hspeed-1;
  if(lt(s.hspeed,0))s.hspeed=s.hspeed+1;
  if(lt(Math.abs(s.hspeed),1))s.hspeed=0;
  const d=rt.drawState;
  d.color=s.type===0?s.lightb:s.type===1?s.lightf:s.type===2?s.lightg:s.type===3?C.lime:s.type===4?C.red:C.white;
  d.font='damagefont';
  if(s.message===0){
   d.alpha=1-s.kill;d.halign=2;rt.drawText(s.x+30,s.y,String(s.damage),2-s.stretch,s.stretch+s.kill,s.spec===1?90:0);d.halign=0;d.alpha=1;
  }else{
   const [frame,blend]=s.message===1?[0,d.color]:s.message===2?[1,C.red]:s.message===3?[2,C.lime]:[3,C.lime];
   rt.drawSprite('spr_battlemsg',frame,s.x+30,s.y,2-s.stretch,s.stretch+s.kill,0,blend,1-s.kill);
  }
  if(s.bounces<2)s.vspeed=s.vspeed+1;
  if(gt(s.y,s.ystart)&&s.bounces<2&&s.killactive===0){s.y=s.ystart;s.vspeed=s.vstart/2;s.bounces+=1;}
  if(s.bounces>=2&&s.killactive===0){s.vspeed=0;s.y=s.ystart;}
  if(s.stretchgo===1)s.stretch+=0.4;
  if(ge(s.stretch,1.2)){s.stretch=1;s.stretchgo=0;}
  s.killtimer+=1;if(s.killtimer>35)s.killactive=1;
  if(s.killactive===1){s.kill+=0.08;s.y=s.y-4;}
  if(gt(s.kill,1))rt.destroy(s);
 },
}};

export const battleSolid:GmObjectDef={name:'obj_battlesolid',index:197};
/** The battle box: grows in while spinning (leaving afterimages), shrinks away when told to. */
export const growtangle:GmObjectDef={name:'obj_growtangle',index:311,depth:5,parent:battleSolid,sprite:'spr_battlebg_0',events:{
 create:s=>{s.imageXscale=0;s.imageYscale=0;s.imageAlpha=0.3;s.timer=0;s.maxtimer=15;s.growcon=1;s.imageSpeed=0;s.imageBlend=mergeColor(C.green,C.lime,0.5);s.fullgrow=0;s.keep=0;s.megakeep=0;},
 step:(s,rt)=>{
  s.growth=0;
  if(s.timer<s.maxtimer&&s.growcon===1)s.growth=1;
  if(s.timer>0&&s.growcon===3)s.growth=1;
  if(s.growth!==1)return;
  if(s.growcon===1)s.timer+=1;
  if(s.growcon===3)s.timer-=1;
  const k=s.timer/s.maxtimer;
  s.imageXscale=2*k;s.imageYscale=2*k;s.imageAngle=180+180*k;s.imageAlpha=0.5+k*0.5;
  const d=rt.create(afterimage,s.x,s.y);s.d=d.id;
  d.sprite=s.sprite;d.imageXscale=s.imageXscale;d.imageYscale=s.imageYscale;d.imageAngle=s.imageAngle;d.depth=s.depth-1;
  d.imageBlend=s.imageBlend;d.imageAlpha=1-s.imageAlpha+0.1;d.imageSpeed=0;
  if(s.timer>=s.maxtimer&&s.growcon===1){s.growcon=2;s.imageAngle=0;}
  if(s.timer<=0&&s.growcon===3)rt.destroy(s);
 },
 // The box's second frame is its fill, drawn under the outline.
 draw:(s,rt)=>{rt.drawSprite(s.sprite,1,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);rt.drawSelf(s);},
 endStep:(s,rt)=>{
  if(s.keep!==1)return;
  const h=rt.first(heart);if(!h)return;
  if(eq(s.speed,0)&&s.megakeep!==1)return;
  const w=rt.spriteWidth(s),ht=rt.spriteHeight(s);
  const l=s.x-w/2,r=s.x+w/2,u=s.y-ht/2,d=s.y+ht/2;
  if(lt(h.x,l+5))h.x=l+5;
  if(gt(h.x,r-22))h.x=r-22;
  if(lt(h.y,u+5))h.y=u+5;
  if(gt(h.y,d-22))h.y=d-22;
 },
}};

export const bulletParent:GmObjectDef={name:'obj_bulletparent',index:199};
/** A bullet that hurts the soul on contact (User Event 5 runs the damage, then the bullet is gone). */
export const collideBullet:GmObjectDef={name:'obj_collidebullet',index:201,parent:bulletParent,events:{
 user5:(s,rt)=>{if(s.active!==1)return;if(s.target!==3)damage(s,rt);else damageAll(s,rt);rt.destroy(s);},
}};
/** The usual bullet: default damage values, removed once well outside the view. */
export const regularBullet:GmObjectDef={name:'obj_regularbullet',index:203,depth:-10,parent:collideBullet,events:{
 create:(s,rt)=>{
  s.grazed=0;s.grazepoints=5;s.timepoints=5;s.target=0;s.dont=1;s.inv=60;s.damage=124;s.active=1;s.spec=0;s.imageAlpha=1;
  if(!rt.exists(heart))rt.destroy(s);
  s.wall_destroy=1;
 },
 step:(s,rt)=>{
  if(s.wall_destroy!==1)return;
  if(lt(s.x,rt.view.x-40))rt.destroy(s);
  if(gt(s.x,rt.view.x+680))rt.destroy(s);
  if(lt(s.y,rt.view.y-40))rt.destroy(s);
  if(gt(s.y,rt.view.y+520))rt.destroy(s);
 },
}};
/** A bullet that hurts on contact but stays (scythes, carousel horses). */
export const regularBulletPermanent:GmObjectDef={name:'obj_regularbullet_permanent',index:204,parent:regularBullet,events:{
 user5:(s,rt)=>{if(s.active!==1)return;if(s.target!==3)damage(s,rt);else damageAll(s,rt);},
}};
/** The usual battle backdrop: a black fade with two layers of the purple grid drifting in opposite directions. */
export const battleBack:GmObjectDef={name:'obj_battleback',index:307,depth:10000,events:{
 create:s=>{s.siner=0;s.siner2=0;s.imageAlpha=0;s.destroy=0;},
 draw:(s,rt)=>{
  s.xx=rt.view.x;s.yy=rt.view.y;s.siner+=0.5;s.siner2+=1;
  const d=rt.drawState;d.alpha=s.imageAlpha;d.color=C.black;rt.drawRect(-10,-10,rt.room.width+10,rt.room.height+10);d.alpha=1;
  if(s.destroy===0&&le(s.imageAlpha,1))s.imageAlpha=s.imageAlpha+0.1;
  rt.drawSpriteTiled('bg_battleback1',round(-100+s.siner),round(-100+s.siner),1,1,s.imageBlend,s.imageAlpha/2);
  rt.drawSpriteTiled('bg_battleback1',round(-200-s.siner2),round(-210-s.siner2),1,1,s.imageBlend,s.imageAlpha);
  if(ge(s.siner,100))s.siner-=100;
  if(ge(s.siner2,100))s.siner2-=100;
  if(s.destroy===1){s.imageAlpha=s.imageAlpha-0.1;if(le(s.imageAlpha,0))rt.destroy(s);}
 },
}};
/** A plain sprite holder (scr_marker). */
export const marker:GmObjectDef={name:'obj_marker',index:86};
export function darkMarker(rt:GmRuntime,x:number,y:number,sprite:string){
 const m=rt.create(marker,x,y);m.sprite=sprite;m.imageSpeed=0;m.imageXscale=2;m.imageYscale=2;return m;
}
/** A spared enemy: it flashes white, slides away as fading afterimages and sheds spare stars. All of it runs in Draw. */
export const spareAnim:GmObjectDef={name:'obj_spareanim',index:306,events:{
 create:(s,rt)=>{s.t=0;s.imageSpeed=0;s.starcount=0;s.afterimage=0;s.tone=0;s.neotone=0;s.star=[];rt.sound?.('snd_spare',1,true);},
 draw:(s,rt)=>{
  const spr:string=s.sprite??'',frame=s.imageIndex,xs=s.imageXscale,ys=s.imageYscale;
  if(s.t>=6&&s.t<=26){
   s.afterimage+=1;
   rt.drawSpriteFog(spr,frame,s.x+s.afterimage*4,s.y,xs,ys,0,C.white,0.7-s.afterimage/25);
   rt.drawSpriteFog(spr,frame,s.x+s.afterimage*8,s.y,xs,ys,0,C.white,0.4-s.afterimage/30);
  }
  if(s.t<6){
   if(s.t<5)rt.drawSprite(s.sprite,frame,s.x,s.y,xs,ys,0,s.imageBlend,1-s.neotone/4);
   s.maxwhite=Math.min(1,s.t/5);
   rt.drawSpriteFog(spr,frame,s.x,s.y,xs,ys,0,C.white,s.maxwhite-s.tone/5);
  }
  if(s.t>=1&&s.t<=5)for(let i=0;i<2;i++){
   // instance_create(x + random(sprite_width), y + random(sprite_height), ...): arguments run right to left, Y first.
   const y=s.y+rt.random.random(rt.spriteHeight(s)),x=s.x+rt.random.random(rt.spriteWidth(s));
   const st=rt.create(marker,x,y);s.star[s.starcount]=st.id;
   st.imageXscale=2;st.imageYscale=2;st.sprite='spr_sparestar_anim';st.imageAlpha=2;st.imageSpeed=0.25;st.hspeed=-3;st.gravity=0.5;st.gravityDirection=0;
   s.starcount+=1;
  }
  if(s.t>=5&&s.t<=30)for(let i=0;i<s.starcount;i++){
   const st=rt.byId(s.star[i]);if(!st)continue;
   st.imageAngle+=10;st.imageAlpha=st.imageAlpha-0.1;if(le(st.imageAlpha,0))rt.destroy(st);
  }
  if(s.t>=5&&s.t<10)s.tone+=1;
  if(s.t>=9){
   s.neotone+=1;
   if(s.neotone>=30){for(let i=0;i<s.starcount;i++){const st=rt.byId(s.star[i]);if(st)rt.destroy(st);}rt.destroy(s);}
  }
  s.t+=1;
 },
}};
/** scr_bullet_inherit: a spawned bullet takes its spawner's bullet values. */
export function inheritBullet(from:GmInstance,to:GmInstance){
 to.damage=from.damage;to.grazepoints=from.grazepoints;to.timepoints=from.timepoints;to.inv=from.inv;to.target=from.target;to.grazed=0;to.grazetimer=0;
}

export function tensionHeal(rt:GmRuntime,amount:number){const g=rt.globals;g.tension+=amount;if(gt(g.tension,g.maxtension))g.tension=g.maxtension;}

/** The soul: moves 4 px per frame (2 while holding cancel), slides along the box walls, stays on screen. */
export const heart:GmObjectDef={name:'obj_heart',index:313,depth:1,sprite:'spr_dodgeheart',mask:'spr_dodgeheartmask',
 events:{
  create:(s,rt)=>{
   rt.globals.sp=4;s.wspeed=rt.globals.sp;s.imageSpeed=0;s.fly=0;s.darken=1;s.darkamt=0;s.dmgnoise=0;
   rt.create(grazebox,s.x+10,s.y+10);
   s.boundaryup=0;s.disableslow=0;if(input.cancel(rt))s.disableslow=1;
  },
  step:(s,rt)=>heartStep(s,rt),
 },
 collisions:[{target:collideBullet,run:(_s,other,rt)=>rt.userEvent(other,5)}],
};
function heartStep(s:GmInstance,rt:GmRuntime){
 const meet=(x:number,y:number)=>rt.placeMeeting(s,x,y,battleSolid);
 s.wallcheck=0;s.bkx=0;s.bky=0;s.bkxy=0;s.jelly=2;
 s.press_l=input.left(rt)?1:0;s.press_r=input.right(rt)?1:0;s.press_u=input.up(rt)?1:0;s.press_d=input.down(rt)?1:0;
 let px=0,py=0;const w=s.wspeed;
 if(s.press_r===1)px=w;
 if(s.press_l===1)px=-w;
 if(s.press_d===1)py=w;
 if(s.press_u===1)py=-w;
 if(input.cancel(rt)){if(s.disableslow===0){px=Math.ceil(px*0.5);py=Math.ceil(py*0.5);}}
 else s.disableslow=0;
 s.xmeet=0;s.ymeet=0;s.xymeet=0;
 if(meet(s.x+px,s.y+py))s.xymeet=1;
 if(meet(s.x+px,s.y)){
  // Blocked sideways: slip around a corner by up to wspeed pixels, then move as far as possible.
  for(let g=w;g>0;g-=1){
   if(s.press_d===0&&!meet(s.x+px,s.y-g)){s.y=s.y-g;py=0;break;}
   if(s.press_u===0&&!meet(s.x+px,s.y+g)){s.y=s.y+g;py=0;break;}
  }
  s.xmeet=1;s.bkx=0;
  if(px>0)for(let i=px;i>=0;i-=1)if(!meet(s.x+i,s.y)){px=i;s.bkx=1;break;}
  if(px<0)for(let i=px;i<=0;i+=1)if(!meet(s.x+i,s.y)){px=i;s.bkx=1;break;}
  if(s.bkx===0)px=0;
 }
 if(meet(s.x,s.y+py)){
  s.ymeet=1;s.bky=0;
  for(let g=w;g>0;g-=1){
   if(s.press_r===0&&!meet(s.x-g,s.y+py)){s.x=s.x-g;px=0;break;}
   if(s.press_l===0&&!meet(s.x+g,s.y+py)){s.x=s.x+g;px=0;break;}
  }
  if(py>0)for(let i=py;i>=0;i-=1)if(!meet(s.x,s.y+i)){py=i;s.bky=1;break;}
  if(py<0)for(let i=py;i<=0;i+=1)if(!meet(s.x,s.y+i)){py=i;s.bky=1;break;}
  if(s.bky===0)py=0;
 }
 if(meet(s.x+px,s.y+py)){
  s.xymeet=1;s.bkxy=0;let i=px,j=py;
  while(j!==0||i!==0){
   if(!meet(s.x+i,s.y+j)){px=i;py=j;s.bkxy=1;break;}
   if(Math.abs(j)>=1){if(j>0)j-=1;if(j<0)j+=1;}else j=0;
   if(Math.abs(i)>=1){if(i>0)i-=1;if(i<0)i+=1;}else i=0;
  }
  if(s.bkxy===0){px=0;py=0;}
 }
 const sw=rt.spriteWidth(s),sh=rt.spriteHeight(s);
 if(ge(s.x+px,rt.view.x+640-sw))px=rt.view.x+640-sw-s.x;
 if(le(s.x+px,0))px=-s.x;
 if(le(s.y+py,0))py=-s.y;
 if(ge(s.y+py,rt.view.y+320-sh+s.boundaryup))py=rt.view.y+320-sh-s.y+s.boundaryup;
 s.px=px;s.py=py;
 s.x=s.x+px;s.y=s.y+py;
 if(s.dmgnoise===1){s.dmgnoise=0;rt.sound?.('snd_hurt1');}
 rt.globals.inv-=1;
 if(rt.globals.inv>0)s.imageSpeed=0.25;else{s.imageSpeed=0;s.imageIndex=0;}
 rt.globals.heartx=s.x+2-rt.view.x;rt.globals.hearty=s.y+2-rt.view.y;
}

/** The graze box around the soul: bullets passing through it give TP and shorten the turn. */
export const grazebox:GmObjectDef={name:'obj_grazebox',index:206,depth:2,sprite:'spr_grazeappear',mask:'spr_grazemask',
 events:{
  create:(s,rt)=>{const h=rt.first(heart);if(h){s.x=h.x+10;s.y=h.y+10;}s.grazetimer=0;},
  endStep:(s,rt)=>{const h=rt.first(heart);if(h){s.x=h.x+10;s.y=h.y+10;}else rt.destroy(s);},
  draw:(s,rt)=>{
   if(s.grazetimer>0){rt.drawSprite(s.sprite,0,s.x,s.y,1,1,0,C.white,s.grazetimer/6);rt.drawSprite(s.sprite,3,s.x,s.y,1,1,0,C.white,s.grazetimer/6-0.2);}
   s.grazetimer-=1;
  },
 },
 collisions:[{target:collideBullet,run:(_s,b,rt)=>{
  const g=rt.globals;if(g.inv>=0)return;
  if(b.grazed===1){
   tensionHeal(rt,b.grazepoints/20);
   if(ge(g.turntimer,10))g.turntimer-=b.timepoints/20;
   for(const gb of rt.all(grazebox)){if(gb.grazetimer>=0&&gb.grazetimer<4)gb.grazetimer=3;if(gb.grazetimer<2)gb.grazetimer=2;}
  }
  if(b.grazed===0){
   b.grazed=1;tensionHeal(rt,b.grazepoints);
   if(ge(g.turntimer,10))g.turntimer-=b.timepoints;
   for(const c of rt.all(battleController))c.grazenoise=1;
   for(const gb of rt.all(grazebox))gb.grazetimer=10;
  }
 }}],
};

/** The battle controller. Only the enemy-turn timer is here so far; menus and turn flow come next. */
export const battleController:GmObjectDef={name:'obj_battlecontroller',index:196,depth:5,events:{
 draw:s=>{if(typeof s.hudDraw==='function')s.hudDraw();},
 step:(s,rt)=>{
  const g=rt.globals;
  if(s.grazenoise===1){rt.sound?.('snd_graze');s.grazenoise=0;}
  if(s.damagenoise===1){rt.sound?.('snd_damage');s.damagenoise=0;}
  s.onebuffer-=1;s.twobuffer-=1;s.lbuffer-=1;s.rbuffer-=1;
  if(g.mnfight===2&&s.timeron===1){
   g.turntimer-=1;
   if(le(g.turntimer,0)&&s.reset===0){
    for(const b of rt.all(bulletParent))rt.destroy(b);
    for(const b of rt.all(bulletGenParent))rt.destroy(b);
    for(const d of rt.all(darkener))d.darken=0;
    for(const h of rt.all(heart)){rt.create(returnHeart,h.x,h.y);rt.destroy(h);}
    s.reset=1;if(s.noreturn===0)s.alarm[2]=15;
   }
  }
 },
}};

function dead(rt:GmRuntime,t:number){const g=rt.globals;g.charmove[t]=0;g.charcantarget[t]=0;g.chardead[t]=1;g.charaction[t]=0;g.charspecial[t]=0;}
function randomTarget(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.abletotarget=1;
 if(g.charcantarget[0]===0&&g.charcantarget[1]===0&&g.charcantarget[2]===0)s.abletotarget=0;
 s.mytarget=rt.random.choose(0,1,2);
 if(s.abletotarget===1)while(g.charcantarget[s.mytarget]===0)s.mytarget=rt.random.choose(0,1,2);
 else s.mytarget=3;
 g.targeted[s.mytarget]=1;
}
const hpOf=(rt:GmRuntime)=>[0,1,2].map(i=>rt.globals.hp[rt.globals.char[i]]);
function damageCheck(rt:GmRuntime,before:number[]){
 if(hpOf(rt).some((hp,i)=>lt(hp,before[i])))for(const m of rt.all(eventManager))m.tookDamage=1;
}
/** scr_damage: the bullet's damage minus 3 per defense point (two thirds when defending, at least 1). */
export function damage(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(g.inv>=0||g.chemg_god_mode)return;
 const before=hpOf(rt);
 if(s.target<3&&le(g.hp[g.char[s.target]],0)){
  randomTarget(s,rt);s.target=s.mytarget;
  const c=rt.byId(g.charinstance[s.target]);if(c){c.imageBlend=C.white;c.darkify=0;}
 }
 s.chartarget=3;let td=s.damage;
 if(s.target<3){
  td=Math.ceil(td-g.battledf[s.target]*3);s.chartarget=g.char[s.target];
  if(g.charaction[s.target]===10)td=Math.ceil(2*td/3);
  if(lt(td,1))td=1;
 }
 s.tdamage=td;
 if(!rt.exists(shake))rt.create(shake,0,0);
 const hero=rt.byId(g.charinstance[s.target]);if(hero){hero.hurt=1;hero.hurttimer=0;}
 s.hpdiff=td;
 for(const w of rt.all(dmgWriter))if(w.delaytimer>=1)w.killactive=1;
 s.doomtype=-1;
 for(const h of rt.all(heart))h.dmgnoise=1;
 if(s.target<3){
  const ct=s.chartarget;
  if(le(g.hp[ct],0)){s.doomtype=4;g.hp[ct]-=round(td/4);s.hpdiff=round(td/4);}
  else{
   g.hp[ct]-=td;
   if(le(g.hp[ct],0)){s.hpdiff=Math.abs(g.hp[ct]-g.maxhp[ct]/2);s.doomtype=4;g.hp[ct]=round(-g.maxhp[ct]/2);dead(rt,s.target);}
  }
  const ci=rt.byId(g.charinstance[s.target])!;
  const w=rt.create(dmgWriter,ci.x,ci.y+ci.myheight-24);s.dmgwriter=w.id;w.damage=s.hpdiff;w.type=s.doomtype;
 }
 if(s.target===3){
  for(let i=0;i<3;i++){
   const ct=g.char[i];
   if(ge(g.hp[ct],0)){
    g.hp[ct]-=g.charaction[i]===10?Math.ceil(td/2):td;
    if(le(g.hp[ct],0))g.hp[ct]=round(-g.maxhp[0]/2);
   }
  }
 }
 g.inv=g.invc*40;
 damageCheck(rt,before);
 let over=1;
 for(let i=0;i<3;i++)if(g.char[i]!==0&&gt(g.hp[g.char[i]],0))over=0;
 if(over===1)gameOver(rt);
}
/** scr_damage_all: the bullet hits every standing party member. */
export function damageAll(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;if(g.inv>=0)return;
 const before=hpOf(rt);const rem=s.damage,keep=s.target;
 for(let t=0;t<3;t++){g.inv=-1;s.damage=rem;s.target=t;if(gt(g.hp[g.char[t]],0)&&g.char[t]!==0)damage(s,rt);}
 g.inv=g.invc*40;s.target=keep;damageCheck(rt,before);
}
export function gameOver(rt:GmRuntime){rt.stopAllSounds?.();rt.sound?.('snd_hurt1');rt.pendingRoom='room_gameover';}
