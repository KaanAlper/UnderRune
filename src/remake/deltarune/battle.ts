// DELTARUNE battle framework, re-implemented for the remake: the soul and its graze box, the battle box,
// bullets, the damage formula, screen shake and damage numbers. Object indices are Chapter 1's; event
// dispatch order depends on them.
import {gmArray,moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {eq,ge,gt,le,lt,pointDistance,round} from '../gm/math';
import {C,mergeColor} from '../gm/graphics';
import {forChapter,rules,withHook,type BattleHooks,type HookedDef} from './rules';
import {yellowSoul} from './yellow-soul';

import {KEY,held} from './keys';
export {KEY};
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
export const heroNoelle:GmObjectDef={name:'obj_heronoelle',index:378,depth:0,parent:heroParent,sprite:'spr_krisplace'};
/** The enemy turn's darkness: it fades the screen and the heroes in; with darken = 0 it closes the box and fades out. */
/** Per chapter: from Chapter 2 the darkener sets its own depth when made. */
const DARKENER:Record<number,{depth?:number}>={1:{},2:{depth:205},3:{depth:205},4:{depth:205}};
export const darkener:GmObjectDef={name:'obj_darkener',index:205,depth:200,events:{
 create:(s,rt)=>{
  const depth=forChapter(rt,DARKENER,'obj_darkener').depth;if(depth!==undefined)s.depth=depth;
  if(rt.count(darkener)>1){rt.destroy(s);return;}
  s.darken=1;s.darkamt=0;
 },
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
  const destinations=withHook(rt,'soulReturnsTo');
  if(destinations.length){for(const [e,to] of destinations)[s.distx,s.disty]=to(e,rt);}
  else{const kris=rt.first(heroKris)!;s.distx=kris.x+10;s.disty=kris.y+40;}
  s.dist=pointDistance(s.x,s.y,s.distx,s.disty);moveTowardsPoint(s,s.distx,s.disty,s.dist/s.flytime);
  s.alarm[0]=s.flytime;s.imageSpeed=0;
 },
 alarm0:(s,rt)=>{s.x=s.distx;s.y=s.disty;rt.create(heartBurst,s.x,s.y);rt.destroy(s);},
}};
/** The soul leaves Kris and flies to the arena in eight original game frames. */
/** Per chapter: from Chapter 2 the soul flies to the box's own place (custom boxes are moved) and is not made twice. */
/** Chapter 3's soul takes the flying soul's sprite and mask (an attack can change them before it lands). */
const MOVE_HEART:Record<number,{toBox:boolean;once:boolean;passSprite?:boolean;darkAlpha?:boolean;remember?:boolean}>={1:{toBox:false,once:false},2:{toBox:true,once:true},3:{toBox:true,once:true,passSprite:true},4:{toBox:true,once:true,darkAlpha:true,remember:true}};
const named=(rt:GmRuntime,name:string)=>rt.instances.find(i=>i.live&&i.object.name===name);
export const moveHeart:GmObjectDef={name:'obj_moveheart',index:219,sprite:'spr_dodgeheart',events:{
 create:(s,rt)=>{
  s.burst=0;s.shift=1;s.imageAlpha=0;s.flytime=8;
  if(forChapter(rt,MOVE_HEART,'obj_moveheart').darkAlpha)s.darkalpha=0;
  const marker=named(rt,'obj_heartmarker'),box=rt.first(growtangle);
  if(marker){s.distx=marker.x;s.disty=marker.y;}
  else if(!forChapter(rt,MOVE_HEART,'obj_moveheart').toBox||!box){s.distx=rt.view.x+310;s.disty=rt.view.y+160;}
  else{s.distx=box.x-10;s.disty=box.y-10;}
  s.dist=pointDistance(s.x,s.y,s.distx,s.disty);moveTowardsPoint(s,s.distx,s.disty,s.dist/s.flytime);s.alarm[0]=s.flytime;s.imageSpeed=0;rt.create(heartBurst,s.x,s.y);
 },
 step:s=>{s.imageAlpha+=.334;},
 alarm0:(s,rt)=>{
  s.x=s.distx;s.y=s.disty;
  const rules=forChapter(rt,MOVE_HEART,'obj_moveheart');
  if(!rules.once||!rt.exists(heart)){const h=rt.create(heart,s.x,s.y);h.depth=1;if(rules.passSprite||rules.remember)s.heart=h.id;if(rules.passSprite){h.sprite=s.sprite;h.mask=s.mask;}}
  rt.destroy(s);
 },
}};

/** The music stream holder. Its Draw event moves it near the player with two random calls every frame. */
/** scr_moveheart: the soul leaves Kris for the box. */
export function moveHeartIn(rt:GmRuntime){
 if(rules(rt).moveHeartEndsInvincibility)rt.globals.inv=0;
 for(const [actor,entry] of withHook(rt,'soulEntry')){const at=entry(actor,rt);if(at)return rt.create(moveHeart,at[0],at[1]);}
 const k=rt.first(heroKris)!;return rt.create(moveHeart,k.x+10,k.y+40);
}
export const astream:GmObjectDef={name:'obj_astream',index:134,depth:-200,sprite:'spr_heart',events:{
 create:s=>{s.mystream=999;s.bstream=0;s.songname='nosong.ogg';},
 destroy:(s,rt)=>{freeStream(rt,s.mystream);},
 draw:(s,rt)=>{const m=rt.first(mainchara);if(m){s.x=m.x+rt.random.random(20);s.y=m.y+rt.random.random(20);}},
}};
/** snd_free keeps stream ownership in obj_astream; its Destroy event releases the backend stream. */
export function sndFree(rt:GmRuntime,caller:GmInstance,handle:number|string){
 const holders=rt.all(astream);let freed=0;
 if(holders.length){
 caller._xstream=handle;
 for(const a of holders)a.bstream=handle;
 for(const a of rt.withInstances(astream))if(a.live&&(a.bstream===a.mystream||eq(a.bstream,a.mystream))){rt.destroy(a);freed+=1;}
 }
 // Browser music starts with named backend handles rather than source numeric stream holders.
 if(!freed&&typeof handle==='string'){freeStream(rt,handle);freed+=1;}
 return freed;
}
function freeStream(rt:GmRuntime,handle:number|string){if(rt.soundFree)rt.soundFree(handle);else rt.sourceAudio?.free(handle);}

/** Per chapter: from Chapter 2 an afterimage's fading speed is its own variable (fadeSpeed), so makers can change it. */
const AFTERIMAGE:Record<number,{ownSpeed:boolean}>={1:{ownSpeed:false},2:{ownSpeed:true},3:{ownSpeed:true},4:{ownSpeed:true}};
/** Fades out and goes. */
export const afterimage:GmObjectDef={name:'obj_afterimage',index:192,events:{
 create:(s,rt)=>{if(forChapter(rt,AFTERIMAGE,'obj_afterimage').ownSpeed)s.fadeSpeed=0.04;},
 step:(s,rt)=>{s.imageAlpha=s.imageAlpha-(forChapter(rt,AFTERIMAGE,'obj_afterimage').ownSpeed?s.fadeSpeed:0.04);if(lt(s.imageAlpha,0))rt.destroy(s);},
}};
/** scr_afterimage, run by `s`: a still copy of it that fades out, kept in its afterimage variable. */
export function afterImage(s:GmInstance,rt:GmRuntime){
 const a=rt.create(afterimage,s.x,s.y);s.afterimage=a.id;
 a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;a.depth=s.depth;
 a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;
 return a;
}
const AFTERIMAGE_GROW:Record<number,{follow:boolean}>={1:{follow:false},2:{follow:false},3:{follow:true},4:{follow:true}};
export const afterimageGrow:GmObjectDef={name:'obj_afterimage_grow',index:193,events:{
 create:(s,rt)=>{s.xrate=.2;s.yrate=.2;s.fade=.1;if(forChapter(rt,AFTERIMAGE_GROW,'obj_afterimage_grow').follow){s.target=-4;s.destroytime=-1;}},
 step:(s,rt)=>{
  const follow=forChapter(rt,AFTERIMAGE_GROW,'obj_afterimage_grow').follow;
  if(follow&&!eq(s.target,-4)){const target=rt.byId(s.target);if(target){s.x=target.x;s.y=target.y;}}
  s.imageAlpha-=s.fade;s.imageXscale+=s.xrate;s.imageYscale+=s.yrate;if(lt(s.imageAlpha,0))rt.destroy(s);
  if(follow){if(gt(s.destroytime,-1))s.destroytime--;if(eq(s.destroytime,0))rt.destroy(s);}
 },
}};

/** Camera shake: offsets the view, alternating sides, shrinking by a pixel per swing. */
/** Per chapter: Chapter 2 keeps one shake at a time and restores the view only once it has moved it. Its
 * remembered view position has another name there (mycamerax). */
const SHAKE:Record<number,{single:boolean;x:string;y:string}>={1:{single:false,x:'camerax',y:'cameray'},2:{single:true,x:'mycamerax',y:'mycameray'},3:{single:true,x:'mycamerax',y:'mycameray'},4:{single:true,x:'mycamerax',y:'mycameray'}};
export const shake:GmObjectDef={name:'obj_shake',index:147,events:{
 create:(s,rt)=>{
  s.camera=0;s.shakespeed=1;s.shakesign=1;s.shakex=4;s.shakey=4;s.siner=0;s.active=0;s.permashake=0;
  if(forChapter(rt,SHAKE,'obj_shake').single){s.beenset=0;if(rt.count(shake)>=2){s.active=-1;rt.destroy(s);}}
 },
 step:(s,rt)=>{
  if(s.active!==0)return;
  const v=forChapter(rt,SHAKE,'obj_shake');
  if(v.single)s.beenset=1;
  s[v.x]=rt.view.x;s[v.y]=rt.view.y;
  if(rt.globals.flag[12]===0){rt.view.x=s[v.x]+s.shakex;rt.view.y=s[v.y]+s.shakey;}
  s.shakesign=-s.shakesign;s.active=1;s.alarm[0]=s.shakespeed;
 },
 alarm0:(s,rt)=>{
  const v=forChapter(rt,SHAKE,'obj_shake');
  if(rt.globals.flag[12]===0){rt.view.x=s[v.x]+s.shakex*s.shakesign;rt.view.y=s[v.y]+s.shakey*s.shakesign;}
  if(s.permashake===0){if(s.shakex>0)s.shakex-=1;if(s.shakey>0)s.shakey-=1;}
  s.shakesign=-s.shakesign;s.alarm[0]=s.shakespeed;
  if(s.shakex===0&&s.shakey===0)rt.destroy(s);
 },
 destroy:(s,rt)=>{
  const v=forChapter(rt,SHAKE,'obj_shake');
  if(!v.single||s.beenset){rt.view.x=s[v.x];rt.view.y=s[v.y];}
 },
}};

export {mergeColor};

/** Damage numbers: they pop, bounce twice, then fade upward. The motion runs in the Draw event. */
/** Per chapter: Chapter 2's damage writer also shows mercy (type 5: "+N%" in the gold digits, the MAX message at 100),
 * a yellow type 6 and more messages, and is kept inside the view while fighting. Chapter 3 counts its frames
 * (mercytimer, which scr_mercyadd reads) and has two more messages: type 12 (frame 13 in red, a hero knocked out hard)
 * and type 13 (frame 14 in a blue aqua). */
const DMG_WRITER:Record<number,{mercy:boolean;timer:boolean;rounded?:boolean}>={1:{mercy:false,timer:false},2:{mercy:true,timer:false},3:{mercy:true,timer:true},4:{mercy:true,timer:true,rounded:true}};
/** The battle message sprite frame and blend for each message (blend undefined: the current colour). */
const BATTLE_MESSAGES:Record<number,[number,number|undefined]>={1:[0,undefined],2:[1,C.red],3:[2,C.lime],4:[3,C.lime],
 5:[5,C.lime],6:[8,C.white],7:[9,C.white],8:[10,C.white],9:[11,C.white]};
/** obj_dmgwriter: a number (or message) that bounces up from whoever was hit. */
export const dmgWriter:GmObjectDef={name:'obj_dmgwriter',index:312,events:{
 create:(s,rt)=>{
  const mercy=forChapter(rt,DMG_WRITER,'obj_dmgwriter').mercy;
  s.spec=0;s.delaytimer=0;s.delay=2;s.active=0;s.damage=round(rt.random.random(600));s.bounces=0;s.type=-1;
  s.stretch=0.2;s.stretchgo=1;s.lightf=mergeColor(C.purple,C.white,0.6);s.lightb=mergeColor(C.aqua,C.white,0.5);s.lightg=mergeColor(C.lime,C.white,0.5);
  if(mercy){s.lighty=mergeColor(C.yellow,C.white,0.3);s.init=0;}
  if(forChapter(rt,DMG_WRITER,'obj_dmgwriter').timer){s.mercytimer=0;s.aqcolor=mergeColor(C.aqua,0xff0000,0.3);}
  if(forChapter(rt,DMG_WRITER,'obj_dmgwriter').rounded){s.dkgreen=mergeColor(C.green,C.black,.05);s.nohbounce=false;}
  s.kill=0;s.killtimer=0;s.killactive=0;
  for(const o of rt.all(dmgWriter))if(o.type!==3)o.killtimer=0;
  s.specialmessage=0;
  if(mercy){s.stayincamera=1;s.xx=rt.view.x;s.message_sprite='spr_battlemsg';}
 },
 draw:(s,rt)=>{
  const mercy=forChapter(rt,DMG_WRITER,'obj_dmgwriter').mercy;
  if(s.delaytimer<s.delay)for(const o of rt.all(dmgWriter))o.killtimer=0;
  s.delaytimer+=1;
  if(forChapter(rt,DMG_WRITER,'obj_dmgwriter').timer)s.mercytimer++;
  if(s.delaytimer===s.delay){s.vspeed=-5-rt.random.random(2);s.hspeed=10;s.vstart=s.vspeed;s.flip=90;}
  if(s.delaytimer>=s.delay)writeDamage(s,rt,mercy,forChapter(rt,DMG_WRITER,'obj_dmgwriter').timer,!!forChapter(rt,DMG_WRITER,'obj_dmgwriter').rounded);
  if(mercy&&rt.globals.fighting===1&&s.stayincamera===1&&s.x>=s.xx+600)s.x=s.xx+600;
 },
}};
function writeDamage(s:GmInstance,rt:GmRuntime,mercy:boolean,later:boolean,rounded=false){
 const d=rt.drawState;
 d.color=s.type===0?s.lightb:s.type===1?s.lightf:s.type===2?s.lightg:s.type===3?C.lime:s.type===4?C.red:C.white;
 if(mercy&&s.type===5&&s.damage<0)d.color=C.ltgray;
 if(mercy&&s.type===6)d.color=s.lighty;
 s.message=s.specialmessage;if(eq(s.damage,0))s.message=1;if(s.type===4)s.message=2;
 if(mercy&&s.type===5&&s.damage===100)s.message=5;
 if(later&&s.type===12)s.message=10;
 if(later&&s.type===13){s.message=13;d.color=s.aqcolor;}
 if(rounded&&s.type===1.5)d.color=s.dkgreen;
 if(rounded&&s.type===14){s.message=14;d.color=s.aqcolor;}
 d.font=mercy&&s.type===5?'damagefontgold':'damagefont';
 if(gt(s.hspeed,0))s.hspeed=s.hspeed-1;
 if(lt(s.hspeed,0))s.hspeed=s.hspeed+1;
 if(lt(Math.abs(s.hspeed),1))s.hspeed=0;
 if(rounded&&s.nohbounce)s.hspeed=0;
 if(mercy&&s.init===0){
  const amount=rounded?round(s.damage):s.damage;s.damagemessage=String(amount);
  if(s.type===5)s.damagemessage='+'+String(amount)+'%';
  if(s.type===5&&s.damage<0)s.damagemessage=String(amount)+'%';
  s.init=1;
 }
 if(s.message===0){
  d.alpha=1-s.kill;d.halign=2;rt.drawText(s.x+30,s.y,mercy?s.damagemessage:String(s.damage),2-s.stretch,s.stretch+s.kill,s.spec===1?90:0);d.halign=0;d.alpha=1;
 }else{
  // Chapter 1 has the first four messages only.
  const m=rounded&&s.message===14?[16,s.aqcolor] as const:later&&s.message===10?[13,C.red] as const:later&&s.message===13?[14,s.aqcolor] as const:BATTLE_MESSAGES[s.message];
  if(m&&(mercy||s.message<=4))rt.drawSprite(mercy?s.message_sprite:'spr_battlemsg',m[0],s.x+30,s.y,2-s.stretch,s.stretch+s.kill,0,m[1]??d.color,1-s.kill);
 }
 if(s.bounces<2)s.vspeed=s.vspeed+1;
 if(gt(s.y,s.ystart)&&s.bounces<2&&s.killactive===0){s.y=s.ystart;s.vspeed=s.vstart/2;s.bounces+=1;}
 if(s.bounces>=2&&s.killactive===0){s.vspeed=0;s.y=s.ystart;}
 if(s.stretchgo===1)s.stretch+=0.4;
 if(ge(s.stretch,1.2)){s.stretch=1;s.stretchgo=0;}
 s.killtimer+=1;if(s.killtimer>35)s.killactive=1;
 if(s.killactive===1){s.kill+=0.08;s.y=s.y-4;}
 if(gt(s.kill,1))rt.destroy(s);
}

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
/** Per chapter: Chapter 2 bullets start from scr_bullet_init, may survive a hit (destroyonhit), reach further out of
 * view before they go, and can turn with their direction, spin or fade near the bottom. */
const BULLETS:Record<number,{v2:boolean;bounds:[number,number,number,number]}>={1:{v2:false,bounds:[40,680,40,520]},2:{v2:true,bounds:[80,760,80,580]},3:{v2:true,bounds:[80,760,80,580]},4:{v2:true,bounds:[80,760,80,580]}};
/** scr_bullet_init (Chapter 2): a bullet's starting fields. */
export function bulletInit(s:GmInstance){
 Object.assign(s,{grazed:0,grazetimer:0,destroyonhit:1,target:0,inv:60,damage:10,element:0,grazepoints:1,timepoints:1,active:1,updateimageangle:0});
}
export const collideBullet:GmObjectDef={name:'obj_collidebullet',index:201,parent:bulletParent,events:{
 // Event 15 (user 5): it hits the soul.
 user5:(s,rt)=>{
  if(!eq(s.active,1))return;
  if(!eq(s.target,3))damage(s,rt);else damageAll(s,rt);
  if(!forChapter(rt,BULLETS,'obj_collidebullet').v2||eq(s.destroyonhit,1))rt.destroy(s);
 },
}};
/** The usual bullet: default damage values, removed once well outside the view. */
export const regularBullet:GmObjectDef={name:'obj_regularbullet',index:203,depth:-10,parent:collideBullet,events:{
 create:(s,rt)=>{
  if(forChapter(rt,BULLETS,'obj_regularbullet').v2){bulletInit(s);s.spin=0;s.spinspeed=0;}
  else{s.grazed=0;s.grazepoints=5;s.timepoints=5;s.target=0;s.dont=1;s.inv=60;s.damage=124;s.active=1;s.spec=0;}
  s.imageAlpha=1;
  if(!rt.exists(heart))rt.destroy(s);
  s.wall_destroy=1;
  if(forChapter(rt,BULLETS,'obj_regularbullet').v2)s.bottomfade=0;
 },
 step:(s,rt)=>{
  const b=forChapter(rt,BULLETS,'obj_regularbullet'),[l,r,u,d]=b.bounds;
  if(s.wall_destroy===1){
   if(lt(s.x,rt.view.x-l))rt.destroy(s);
   if(gt(s.x,rt.view.x+r))rt.destroy(s);
   if(lt(s.y,rt.view.y-u))rt.destroy(s);
   if(gt(s.y,rt.view.y+d))rt.destroy(s);
  }
  if(!b.v2)return;
  if(s.updateimageangle===1)s.imageAngle=s.direction;
  if(s.spin===1)s.imageAngle+=s.spinspeed;
  if(s.bottomfade!==0&&s.y>rt.view.y+s.bottomfade)s.imageAlpha*=0.8;
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
export function darkMarker(rt:GmRuntime,caller:GmInstance,x:number,y:number,sprite:string){
 const m=rt.create(marker,x,y);caller.thismarker=m.id;m.sprite=sprite;m.imageSpeed=0;m.imageXscale=2;m.imageYscale=2;return m;
}
/** A spared enemy: it flashes white, slides away as fading afterimages and sheds spare stars. All of it runs in Draw. */
export const spareAnim:GmObjectDef={name:'obj_spareanim',index:306,events:{
 create:(s,rt)=>{s.t=0;s.imageSpeed=0;s.starcount=0;s.afterimage=0;s.tone=0;s.neotone=0;rt.sound?.('snd_spare',1,true);},
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
  if(s.t>=1&&s.t<=5)for(s.i=0;s.i<2;s.i++){
   // instance_create(x + random(sprite_width), y + random(sprite_height), ...): arguments run right to left, Y first.
   const y=s.y+rt.random.random(rt.spriteHeight(s)),x=s.x+rt.random.random(rt.spriteWidth(s));
   const st=rt.create(marker,x,y);gmArray<number>(s,'star')[s.starcount]=st.id;
   st.imageXscale=2;st.imageYscale=2;st.sprite='spr_sparestar_anim';st.imageAlpha=2;st.imageSpeed=0.25;st.hspeed=-3;st.gravity=0.5;st.gravityDirection=0;
   s.starcount+=1;
  }
  if(s.t>=5&&s.t<=30)for(s.i=0;s.i<s.starcount;s.i++){
   const st=rt.byId(s.star[s.i]);if(!st)continue;
   st.imageAngle+=10;st.imageAlpha=st.imageAlpha-0.1;if(le(st.imageAlpha,0))rt.destroy(st);
  }
  if(s.t>=5&&s.t<10)s.tone+=1;
  if(s.t>=9){
   s.neotone+=1;
   if(s.neotone>=30){for(s.i=0;s.i<s.starcount;s.i++){const st=rt.byId(s.star[s.i]);if(st)rt.destroy(st);}rt.destroy(s);}
  }
  s.t+=1;
 },
}};
/** scr_bullet_inherit: a spawned bullet takes its spawner's bullet values. */
export function inheritBullet(from:GmInstance,to:GmInstance){
 to.damage=from.damage;to.grazepoints=from.grazepoints;to.timepoints=from.timepoints;to.inv=from.inv;to.target=from.target;to.grazed=0;to.grazetimer=0;
}

export function tensionHeal(rt:GmRuntime,amount:number){
 const g=rt.globals;g.tension+=amount;if(gt(g.tension,g.maxtension))g.tension=g.maxtension;
 if(rules(rt).tensionCountsMercy){
  const c=rt.instances.find(i=>i.live&&i.object.name==='obj_battlecontroller');if(!c)throw Error('scr_tensionheal needs obj_battlecontroller');
  c.mercytotal+=amount;if(lt(c.mercytotal,0))c.mercytotal=0;if(ge(c.mercytotal,250))c.mercytotal=250;
 }
}

/** The soul: moves 4 px per frame (2 while holding cancel), slides along the box walls, stays on screen. */
/** The soul's colour modes (scr_heartcolor): red only moves; yellow also shoots (yellow-soul.ts). */
const SOUL_MODES:Record<number,{step?:(s:GmInstance,rt:GmRuntime)=>void;draw?:(s:GmInstance,rt:GmRuntime)=>void}>={0:{},1:yellowSoul,2:{}};
const SOUL_BUFFER:Readonly<Record<number,boolean>>={2:true,3:true,4:false};
const soulMode=(s:GmInstance)=>{const m=SOUL_MODES[s.color];if(!m)throw Error(`The soul has no mode ${s.color}`);return m;};
export const heart:GmObjectDef={name:'obj_heart',index:313,depth:1,sprite:'spr_dodgeheart',mask:'spr_dodgeheartmask',
 events:{
  create:(s,rt)=>{
   const modes=rules(rt).soulHasModes;
   rt.globals.sp=4;s.wspeed=rt.globals.sp;s.imageSpeed=0;s.fly=0;s.darken=1;s.darkamt=0;s.dmgnoise=0;
   if(modes){s.chargeshot_sound=-1;s.canmove=1;}
   rt.create(grazebox,s.x+10,s.y+10);
   s.boundaryup=0;
   if(modes)Object.assign(s,{color:0,z_hold:0,siner:0,z_charge:0,f:2,z_hold_f:0,chargeshot_delay:0,superchargetimer:0,chargeshotcount:0});
   s.disableslow=0;if(input.cancel(rt))s.disableslow=1;
   if(modes)s.remove_slow_z_buffer=40;
  },
  step:(s,rt)=>heartStep(s,rt),
  draw:(s,rt)=>{if(rules(rt).soulHasModes)soulMode(s).draw?.(s,rt);rt.drawSelf(s);},
  // CleanUp: the BIG SHOT's charging sound stops with the soul.
  destroy:(s,rt)=>{if(rules(rt).soulHasModes)rt.soundStop?.('snd_chargeshot_charge');},
 },
 collisions:[{target:collideBullet,run:(_s,other,rt)=>rt.userEvent(other,5)}],
};
function heartStep(s:GmInstance,rt:GmRuntime){
 const meet=(x:number,y:number)=>rt.placeMeeting(s,x,y,battleSolid);
 s.wallcheck=0;s.bkx=0;s.bky=0;s.bkxy=0;s.jelly=2;
 s.press_l=input.left(rt)?1:0;s.press_r=input.right(rt)?1:0;s.press_u=input.up(rt)?1:0;s.press_d=input.down(rt)?1:0;
 for(const [actor,hook] of withHook(rt,'soulDirections'))hook(actor,s,rt);
 let px=0,py=0;const w=s.wspeed,r=rules(rt);
 // A frozen soul (Chapter 2's canmove) ignores the arrows; X slows it unless that is turned off (flag 22).
 if(!r.soulHasModes||s.canmove){
  if(s.press_r===1)px=w;
  if(s.press_l===1)px=-w;
  if(s.press_d===1)py=w;
  if(s.press_u===1)py=-w;
  if(input.cancel(rt)&&(!r.slowSoulSetting||rt.globals.flag[22]===0)){if(s.disableslow===0){px=Math.ceil(px*0.5);py=Math.ceil(py*0.5);}}
  else s.disableslow=0;
 }
 if(r.soulHasModes&&s.color===0&&forChapter(rt,SOUL_BUFFER,'soul input buffer'))s.remove_slow_z_buffer+=0.5;
 s.xmeet=0;s.ymeet=0;s.xymeet=0;
 if(meet(s.x+px,s.y+py))s.xymeet=1;
 // The loop counters (g, i, j) and mvd are the soul's own variables, as in the original.
 if(meet(s.x+px,s.y)){
  // Blocked sideways: slip around a corner by up to wspeed pixels, then move as far as possible.
  for(s.g=w;s.g>0;s.g-=1){
   s.mvd=0;
   if(s.press_d===0&&!meet(s.x+px,s.y-s.g)){s.y=s.y-s.g;py=0;break;}
   if(s.press_u===0&&s.mvd===0&&!meet(s.x+px,s.y+s.g)){s.y=s.y+s.g;py=0;break;}
  }
  s.xmeet=1;s.bkx=0;
  if(px>0)for(s.i=px;s.i>=0;s.i-=1)if(!meet(s.x+s.i,s.y)){px=s.i;s.bkx=1;break;}
  if(px<0)for(s.i=px;s.i<=0;s.i+=1)if(!meet(s.x+s.i,s.y)){px=s.i;s.bkx=1;break;}
  if(s.bkx===0)px=0;
 }
 if(meet(s.x,s.y+py)){
  s.ymeet=1;s.bky=0;
  for(s.g=w;s.g>0;s.g-=1){
   s.mvd=0;
   if(s.press_r===0&&!meet(s.x-s.g,s.y+py)){s.x=s.x-s.g;px=0;break;}
   if(s.mvd===0&&s.press_l===0&&!meet(s.x+s.g,s.y+py)){s.x=s.x+s.g;px=0;break;}
  }
  if(py>0)for(s.i=py;s.i>=0;s.i-=1)if(!meet(s.x,s.y+s.i)){py=s.i;s.bky=1;break;}
  if(py<0)for(s.i=py;s.i<=0;s.i+=1)if(!meet(s.x,s.y+s.i)){py=s.i;s.bky=1;break;}
  if(s.bky===0)py=0;
 }
 if(meet(s.x+px,s.y+py)){
  s.xymeet=1;s.bkxy=0;s.i=px;s.j=py;
  while(s.j!==0||s.i!==0){
   if(!meet(s.x+s.i,s.y+s.j)){px=s.i;py=s.j;s.bkxy=1;break;}
   if(Math.abs(s.j)>=1){if(s.j>0)s.j-=1;if(s.j<0)s.j+=1;}else s.j=0;
   if(Math.abs(s.i)>=1){if(s.i>0)s.i-=1;if(s.i<0)s.i+=1;}else s.i=0;
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
 if(r.soulHasModes)soulMode(s).step?.(s,rt);
}

/** How grazing works per chapter: what a repeated graze gives (a fraction of the bullet's points), whether inactive
 * bullets count, and (from Chapter 2) what each armor the party wears adds to the TP, the time and the box size
 * (scr_armorcheck_equipped_party, [armor, amount] in the original's order). Chapter 3 counts the grazes (grazecount). */
type ArmorEffects=readonly (readonly [armor:number,amount:number])[];
const GRAZE:Record<number,{repeat:number;inactiveCount:boolean;counts?:boolean;armor?:{tp:ArmorEffects;time:ArmorEffects;size:ArmorEffects}}>={
 1:{repeat:20,inactiveCount:true},
 2:{repeat:30,inactiveCount:false,armor:{tp:[[15,0.1]],time:[[14,0.1]],size:[[3,0.2],[9,0.25]]}},
 3:{repeat:30,inactiveCount:false,counts:true,armor:{tp:[[15,0.1],[24,0.05],[3,-0.2],[9,-0.25]],time:[[14,0.1],[3,-0.2],[9,-0.25]],size:[[3,0.2],[9,0.25]]}},
 4:{repeat:30,inactiveCount:false,armor:{tp:[[15,0.1],[24,0.05],[3,-0.2],[9,-0.25]],time:[[14,0.1],[3,-0.2],[9,-0.25]],size:[[3,0.2],[9,0.25]]}},
};
/** scr_armorcheck_equipped_party: how many of this armor the party wears. */
export function partyWears(rt:GmRuntime,armor:number){
 const g=rt.globals;let n=0;
 for(let i=0;i<3;i++)if(g.char[i]!==0){const c=g.char[i];if(g.chararmor1[c]===armor)n+=1;if(g.chararmor2[c]===armor)n+=1;}
 return n;
}
/** The graze box around the soul: bullets passing through it give TP and shorten the turn. */
export const grazebox:GmObjectDef={name:'obj_grazebox',index:206,depth:2,sprite:'spr_grazeappear',mask:'spr_grazemask',
 events:{
  create:(s,rt)=>{
   const graze=forChapter(rt,GRAZE,'obj_grazebox'),armor=graze.armor;
   if(armor){
    s.grazetimer=0;s.grazetpfactor=1;s.grazetimefactor=1;s.grazesizefactor=1;if(graze.counts)s.grazecount=0;
    for(const [id,add] of armor.tp)s.grazetpfactor+=partyWears(rt,id)*add;
    for(const [id,add] of armor.time)s.grazetimefactor+=partyWears(rt,id)*add;
    for(const [id,add] of armor.size)s.grazesizefactor+=partyWears(rt,id)*add;
    s.grazetimefactor=Math.min(s.grazetimefactor,3);s.grazetpfactor=Math.min(s.grazetpfactor,3);s.grazesizefactor=Math.min(s.grazesizefactor,3);
    s.imageXscale=s.grazesizefactor;s.imageYscale=s.grazesizefactor;
    const h=rt.first(heart);if(h){s.sizexoff=0;s.sizeyoff=0;s.x=h.x+10+s.sizexoff;s.y=h.y+10+s.sizeyoff;}
   }else{const h=rt.first(heart);if(h){s.x=h.x+10;s.y=h.y+10;}s.grazetimer=0;}
  },
  endStep:(s,rt)=>{
   const h=rt.first(heart);
   if(!h){rt.destroy(s);return;}
   if(forChapter(rt,GRAZE,'obj_grazebox').armor){s.sizexoff=0;s.sizeyoff=0;s.x=h.x+10+s.sizexoff;s.y=h.y+10+s.sizeyoff;}
   else{s.x=h.x+10;s.y=h.y+10;}
  },
  draw:(s,rt)=>{
   if(s.grazetimer>0){
    rt.drawSprite(s.sprite,0,s.x,s.y,1,1,0,C.white,s.grazetimer/6);rt.drawSprite(s.sprite,3,s.x,s.y,1,1,0,C.white,s.grazetimer/6-0.2);
    if(s.imageXscale>1){rt.drawSprite(s.sprite,0,s.x,s.y,s.imageXscale,s.imageYscale,0,C.white,s.grazetimer/6);rt.drawSprite(s.sprite,3,s.x,s.y,s.imageXscale,s.imageYscale,0,C.white,s.grazetimer/6-0.2);}
   }
   s.grazetimer-=1;
  },
 },
 collisions:[{target:collideBullet,run:(s,b,rt)=>{
  const g=rt.globals,graze=forChapter(rt,GRAZE,'obj_grazebox');
  if(!graze.inactiveCount&&!b.active&&!(b.object as HookedDef).hooks?.grazedWhileInactive)return;
  const tp=graze.armor?s.grazetpfactor:1,time=graze.armor?s.grazetimefactor:1;
  if(g.inv>=0)return;
  if(b.grazed===1){
   tensionHeal(rt,b.grazepoints/graze.repeat*tp);
   if(ge(g.turntimer,10))g.turntimer-=b.timepoints/graze.repeat*time;
   for(const gb of rt.all(grazebox)){if(gb.grazetimer>=0&&gb.grazetimer<4)gb.grazetimer=3;if(gb.grazetimer<2)gb.grazetimer=2;}
  }
  if(b.grazed===0){
   if(graze.counts)for(const gb of rt.all(grazebox))gb.grazecount++;
   b.grazed=1;tensionHeal(rt,b.grazepoints*tp);
   if(ge(g.turntimer,10))g.turntimer-=b.timepoints*time;
   for(const c of rt.all(battleController))c.grazenoise=1;
   for(const gb of rt.all(grazebox))gb.grazetimer=10;
  }
 }}],
};

/** The battle controller. Only the enemy-turn timer is here so far; menus and turn flow come next. */
export const battleController:GmObjectDef={name:'obj_battlecontroller',index:196,depth:5,events:{
 // Its Draw (the menus and HUD) is battleControllerFull's (controller.ts); this base only stands in for the object.
 draw:()=>{},
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

export function dead(rt:GmRuntime,t:number){const g=rt.globals;g.charmove[t]=0;g.charcantarget[t]=0;g.chardead[t]=1;g.charaction[t]=0;g.charspecial[t]=0;}
export function randomTarget(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.abletotarget=1;
 if(g.charcantarget[0]===0&&g.charcantarget[1]===0&&g.charcantarget[2]===0)s.abletotarget=0;
 s.mytarget=rt.random.choose(0,1,2);
 if(s.abletotarget===1)while(g.charcantarget[s.mytarget]===0)s.mytarget=rt.random.choose(0,1,2);
 else s.mytarget=3;
 g.targeted[s.mytarget]=1;
}
const hpOf=(rt:GmRuntime)=>[0,1,2].map(i=>rt.globals.hp[rt.globals.char[i]]);
export function damageCheck(rt:GmRuntime,before:number[]){
 if(hpOf(rt).some((hp,i)=>lt(hp,before[i])))for(const m of rt.all(eventManager))m.tookDamage=1;
}
/** What differs in scr_damage between chapters. */
interface DamageRules{
 readonly cacheContact?:boolean;
 readonly proportionalAll?:boolean;
 /** Chapter 1 honours its debug god switch (global.chemg_god_mode). */
 readonly godSwitch:boolean;
 /** The damage a hit does through the defense of the hero in this party slot. */
 defense(rt:GmRuntime,damage:number,slot:number):number;
 /** Chapter 2: the bullet's element can be resisted by armor, and target 4 means "a party member, avoiding the weakest". */
 readonly elements:boolean;
 /** A whole-party hit on the hero in this slot: the damage carried on to the next one, and the HP this one loses.
  * reduce is the enemy's cut for the slot (reducesHit); mantle.cut stays set once one was made. */
 partyHit(rt:GmRuntime,damage:number,slot:number,element:number,reduce:(slot:number,damage:number)=>number|undefined,mantle:{cut:boolean}):[number,number];
 /** Invincibility after a hit, in frames per point of the bullet's invc. */
 readonly invFrames:number;
 /** scr_damage_all checks for damage itself (Chapter 3 leaves it to each scr_damage). */
 readonly allChecks:boolean;
 /** A hit on Ralsei in his yarn sprite shakes him (Chapter 3). */
 readonly yarnShake:boolean;
}
const DAMAGE:Record<number,DamageRules>={
 1:{godSwitch:true,elements:false,invFrames:40,allChecks:true,yarnShake:false,
  defense:(rt,d,slot)=>Math.ceil(d-rt.globals.battledf[slot]*3),
  partyHit:(rt,d,slot)=>[d,rt.globals.charaction[slot]===10?Math.ceil(d/2):d]},
 2:{godSwitch:false,elements:true,invFrames:40,allChecks:true,yarnShake:false,defense:damageCalculation,partyHit:partyHit2},
 3:{godSwitch:false,elements:true,invFrames:30,allChecks:false,yarnShake:true,defense:damageCalculation,partyHit:partyHit2},
 4:{godSwitch:false,elements:true,invFrames:40,allChecks:false,yarnShake:true,defense:damageCalculation,partyHit:partyHit2,cacheContact:true,proportionalAll:true},
};
/** Chapter 2 on: defense, then the enemy's cut, then element resistance (unless a cut was made), then defending. */
function partyHit2(rt:GmRuntime,d:number,slot:number,element:number,reduce:(slot:number,damage:number)=>number|undefined,mantle:{cut:boolean}):[number,number]{
 const g=rt.globals;let next=damageCalculation(rt,d,slot);
 const cut=reduce(slot,next);if(cut!==undefined){next=cut;mantle.cut=true;}
 if(!mantle.cut)next=Math.ceil(next*elementReduction(rt,element,g.char[slot]));
 return [next,g.charaction[slot]===10?Math.ceil(3*next/4):next];
}
/** scr_damage_calculation (Chapter 2): each defense point takes 3 off a big hit (over a fifth of max HP), 2 off a
 * medium one (over an eighth) and 1 otherwise; at least 1 is left. */
export function damageCalculation(rt:GmRuntime,damage:number,slot:number){
 const g=rt.globals,def=g.battledf[slot],maxhp=g.maxhp[g.char[slot]],a=maxhp/5,b=maxhp/8;
 for(let i=0;i<def;i++){if(damage>a)damage-=3;else if(damage>b)damage-=2;else damage-=1;}
 return Math.max(damage,1);
}
/** scr_element_damage_reduction (Chapter 2): the share of an element's damage this hero's armors let through. */
export function elementReduction(rt:GmRuntime,element:number,char:number){
 const g=rt.globals;let r=1;
 if(element!==0)for(let i=0;i<2;i++){
  const e=g.itemelement[char][i+1],amount=g.itemelementamount[char][i+1];
  if(e===0)continue;
  if(e===element)r-=amount;
  if(e===9&&(element===2||element===8))r-=amount;
  if(e===10)r-=amount;
 }
 return Math.max(r,0.25);
}
/** scr_party_hpaverage: the party's HP over its max HP, rounded down (so 1 only when everyone is at full HP). */
export function partyHpAverage(rt:GmRuntime){
 const g=rt.globals;let hp=0,max=0;
 for(let i=0;i<3;i++)if(g.char[i]>0){hp+=g.hp[g.char[i]];max+=g.maxhp[g.char[i]];}
 return hp>0?Math.floor(hp/max):0;
}
/** scr_damage: a bullet hits its target (a party slot, 3 for everyone, from Chapter 2 also 4 for "someone"). */
export function damage(s:GmInstance,rt:GmRuntime){
 damageContact(s,rt,{defense:true,defendDenominator:3,hooks:true});
}
/** Contact which keeps elemental resistance but skips defense and defending reduction. */
export function damageUnmitigated(s:GmInstance,rt:GmRuntime){
 if(!lt(rt.globals.inv,0))return;
 rt.globals.damage_cache=hpOf(rt);
 damageContact(s,rt,{defense:false,defendDenominator:2,hooks:false});
}
/** hooks: scr_damage's enemy hooks run (NEO's unmitigated copy has none). */
function damageContact(s:GmInstance,rt:GmRuntime,contact:{defense:boolean;defendDenominator:number;hooks:boolean}){
 const g=rt.globals,r=forChapter(rt,DAMAGE,'scr_damage');
 if(g.inv>=0||(r.godSwitch&&g.chemg_god_mode))return;
 const before=hpOf(rt),hook=<K extends keyof BattleHooks>(name:K):[GmInstance,NonNullable<BattleHooks[K]>][]=>contact.hooks?withHook(rt,name):[];
 if(r.cacheContact)g.damage_cache=[...before];
 for(const [e,h] of hook('onPartyHit'))h(e,rt);
 const element=r.elements&&'element' in s&&typeof s.element==='number'?s.element:0;
 if(s.target<3&&le(g.hp[g.char[s.target]],0)){
  randomTarget(s,rt);s.target=s.mytarget;
  const c=rt.byId(g.charinstance[s.target]);if(c){c.imageBlend=C.white;c.darkify=0;}
 }
 let remtarget=-1;
 if(r.elements&&s.target===4){
  remtarget=4;
  randomTarget(s,rt);s.target=s.mytarget;
  const share=()=>g.hp[g.char[s.target]]/g.maxhp[g.char[s.target]];
  if(share()<partyHpAverage(rt)/2){randomTarget(s,rt);s.target=s.mytarget;}
  if(share()<partyHpAverage(rt)/2){randomTarget(s,rt);s.target=s.mytarget;}
  if(s.target===0&&share()<0.35){randomTarget(s,rt);s.target=s.mytarget;}
  const c=rt.byId(g.charinstance[s.target]);if(c){c.imageBlend=C.white;c.darkify=0;}
 }
 const trueDamage=hook('dealsTrueDamage').some(([e,h])=>h(e,rt));
 if(!trueDamage)for(const [e,h] of hook('redirectsHit'))h(e,s,rt);
 const reduce=(slot:number,d:number)=>{let out:number|undefined;for(const [e,h] of hook('reducesHit')){const v=h(e,rt,slot,out??d);if(v!==undefined)out=v;}return out;};
 s.chartarget=3;let td=s.damage;
 if(s.target<3){
  if(contact.defense&&!trueDamage)td=r.defense(rt,td,s.target);s.chartarget=g.char[s.target];
  const reduced=trueDamage?undefined:reduce(s.target,td);if(reduced!==undefined)td=reduced;
  if(!trueDamage){
   if(g.charaction[s.target]===10)td=Math.ceil(2*td/contact.defendDenominator);
   if(r.elements&&reduced===undefined)td=Math.ceil(td*elementReduction(rt,element,g.char[s.target]));
  }
  if(lt(td,1))td=1;
 }
 s.tdamage=td;
 if(!rt.exists(shake))rt.create(shake,0,0);
 const hero=rt.byId(g.charinstance[s.target]);
 if(hero){hero.hurt=1;hero.hurttimer=0;if(r.yarnShake&&hero.sprite==='spr_ralseib_yarn_2')throw Error("scr_damage: Ralsei's yarn shake (scr_shakeobj) is not ported");}
 s.hpdiff=td;
 for(const w of rt.all(dmgWriter))if(w.delaytimer>=1)w.killactive=1;
 s.doomtype=-1;
 for(const h of rt.all(heart))h.dmgnoise=1;
 if(s.target<3){
  const ct=s.chartarget;
  if(le(g.hp[ct],0)){s.doomtype=4;g.hp[ct]-=round(td/4);s.hpdiff=round(td/4);}
  else{
   for(const [e,h] of hook('softensHit')){const v=h(e,rt,td);if(v!==undefined){td=v;s.tdamage=td;s.hpdiff=td;}}
   g.hp[ct]-=td;
   if(le(g.hp[ct],0)&&hook('catchesKnockout').some(([e,h])=>h(e,rt)))g.hp[ct]=1;
   if(le(g.hp[ct],0)){
    if(hook('knocksOutHard').some(([e,h])=>h(e,rt,s.target))){s.doomtype=12;s.hpdiff=round(g.hp[ct]+999);g.hp[ct]=-999;dead(rt,s.target);}
    else{s.hpdiff=Math.abs(g.hp[ct]-g.maxhp[ct]/2);s.doomtype=4;g.hp[ct]=round(-g.maxhp[ct]/2);dead(rt,s.target);}
   }
  }
  for(const [e,h] of hook('prepareContactDamageText'))h(e,s,rt);
  const ci=rt.byId(g.charinstance[s.target])!;
  const w=rt.create(dmgWriter,ci.x,ci.y+ci.myheight-24);s.dmgwriter=w.id;w.damage=s.hpdiff;w.type=s.doomtype;
 }
 if(s.target===3){
  // The Shadow Mantle's cut, once made, also spares the later heroes the element reduction (one flag in the original).
  const mantle={cut:false};
  for(s.hpi=0;s.hpi<3;s.hpi+=1){
   s.chartarget=g.char[s.hpi];const ct=s.chartarget;
   if(ge(g.hp[ct],0)){
    const [next,lost]=r.partyHit(rt,td,s.hpi,element,reduce,mantle);td=next;s.tdamage=td;
    g.hp[ct]-=lost;
    if(le(g.hp[ct],0))g.hp[ct]=round(-g.maxhp[0]/2);
   }
  }
 }
 g.inv=g.invc*r.invFrames;
 damageCheck(rt,before);
 s.gameover=1;
 for(let i=0;i<3;i++)if(g.char[i]!==0&&gt(g.hp[g.char[i]],0))s.gameover=0;
 if(hook('preventsGameOver').some(([e,h])=>h(e,rt)))s.gameover=0;
 if(s.gameover===1)gameOver(rt);
 if(remtarget!==-1)s.target=remtarget;
}
/** scr_damage_all: the bullet hits every standing party member. */
export function damageAll(s:GmInstance,rt:GmRuntime,proportion=1){
 const g=rt.globals;if(g.inv>=0)return;
 const before=hpOf(rt);s.remdamage=s.damage;s._temptarget=s.target;
 const profile=forChapter(rt,DAMAGE,'scr_damage_all');
 for(s.ti=0;s.ti<3;s.ti+=1){g.inv=-1;s.damage=s.remdamage;if(profile.proportionalAll)s.damage*=g.hp[g.char[s.ti]]/g.maxhp[g.char[s.ti]]*(1-proportion)+proportion;s.target=s.ti;if(gt(g.hp[g.char[s.ti]],0)&&g.char[s.ti]!==0)damage(s,rt);}
 const r=forChapter(rt,DAMAGE,'scr_damage_all');g.inv=g.invc*r.invFrames;s.target=s._temptarget;if(r.allChecks)damageCheck(rt,before);
}
/** scr_damage_proportional: late attack contact uses current HP bands, then the old defense calculation.
 * It leaves the old selector's chosen target and source working fields on its caller. */
export function damageProportional(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;if(!lt(g.inv,0))return;
 const before=hpOf(rt);g.damage_cache=[...before];
 if(eq(s.target,4)){randomTarget(s,rt);s.target=s.mytarget;}
 if(lt(s.target,3)&&le(g.hp[g.char[s.target]],0)){
  randomTarget(s,rt);s.target=s.mytarget;
  const h=rt.byId(g.charinstance[s.target]);if(h){h.imageBlend=C.white;h.darkify=0;}
 }
 s.chartarget=3;
 const targetChar=g.char[s.target],hp=g.hp[targetChar],max=g.maxhp[targetChar];
 if(gt(hp,max/2))s.tdamage=Math.ceil(max/5);
 else if(gt(hp,max/5))s.tdamage=Math.ceil(max/10);
 else if(gt(hp,max/20))s.tdamage=Math.ceil(max/25);
 else if(gt(hp,1))s.tdamage=hp-1;
 else s.tdamage=25;
 if(lt(s.target,3)){
  s.tdamage=Math.ceil(s.tdamage-g.battledf[s.target]*3);s.chartarget=g.char[s.target];
  if(g.charaction[s.target]===10)s.tdamage=Math.ceil(2*s.tdamage/3);
  if(lt(s.tdamage,1))s.tdamage=1;
 }
 if(!rt.exists(shake))rt.create(shake,0,0);
 const hero=rt.byId(g.charinstance[s.target]);if(hero){hero.hurt=1;hero.hurttimer=0;}
 s.hpdiff=s.tdamage;
 for(const w of rt.all(dmgWriter))if(ge(w.delaytimer,1))w.killactive=1;
 s.doomtype=-1;for(const h of rt.all(heart))h.dmgnoise=1;
 if(lt(s.target,3)){
  if(le(g.hp[s.chartarget],0)){
   s.doomtype=4;g.hp[s.chartarget]-=round(s.tdamage/4);s.hpdiff=round(s.tdamage/4);
  }else{
   g.hp[s.chartarget]-=s.tdamage;
   if(le(g.hp[s.chartarget],0)){
    s.hpdiff=Math.abs(g.hp[s.chartarget]-g.maxhp[s.chartarget]/2);s.doomtype=4;
    g.hp[s.chartarget]=round(-g.maxhp[s.chartarget]/2);dead(rt,s.target);
   }
  }
  const h=rt.byId(g.charinstance[s.target])!;
  const w=rt.create(dmgWriter,h.x,h.y+h.myheight-24);s.dmgwriter=w.id;w.damage=s.hpdiff;w.type=s.doomtype;
 }
 if(eq(s.target,3))for(s.hpi=0;s.hpi<3;s.hpi+=1){
  s.chartarget=g.char[s.hpi];
  if(ge(g.hp[s.chartarget],0)){
   g.hp[s.chartarget]-=g.charaction[s.hpi]===10?Math.ceil(s.tdamage/2):s.tdamage;
   if(le(g.hp[s.chartarget],0))g.hp[s.chartarget]=round(-g.maxhp[0]/2);
  }
 }
 g.inv=g.invc*40;damageCheck(rt,before);s.gameover=1;
 for(let n=0;n<3;n++)if(g.char[n]!==0&&gt(g.hp[g.char[n]],0))s.gameover=0;
 if(s.gameover===1)gameOver(rt);
}
/** snd_free_all: every sound stops, and the music stream object (obj_astream) goes with it. */
export function sndFreeAll(rt:GmRuntime){rt.stopAllSounds?.();for(const a of rt.all(astream))rt.destroy(a);}
export function gameOver(rt:GmRuntime){sndFreeAll(rt);rt.sound?.('snd_hurt1');rt.pendingRoom='room_gameover';}
