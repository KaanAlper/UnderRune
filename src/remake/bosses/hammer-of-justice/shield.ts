import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,lt,lerp,lengthdirX,lengthdirY} from '../../gm/math';
import {C} from '../../gm/graphics';
import {shieldFrame} from './shield-frame';
import type {HookedDef} from '../../deltarune/rules';
/** scr_wrap has inclusive integer bounds and continuous fractional bounds. */
function parryAlpha(value:number){
 let out=value;
 if(eq(value%1,0)){while(gt(out,1)||lt(out,0))out=gt(out,1)?out-2:out+2;}
 else{let previous=value+1;while(!eq(out,previous)){previous=out;if(lt(out,0))out=1+out;else if(gt(out,1))out-=1;}}
 return out;
}

/** The shield is a Draw-driven source actor: input, rotation, telegraphs and parry windows advance there. */
export function createHammerShield(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const shield:HookedDef={...object('obj_spearblocker'),hooks:{soulDirections:(actor,s,rt)=>{
  if(rt.first(object('obj_spearblocker'))!==actor||actor.vanish!==0||s.color===0)return;
  s.sprite='spr_greenheart';s.press_l=0;s.press_r=0;s.press_d=0;s.press_u=0;
  if(actor.forceheartpos){const box=rt.first(object('obj_growtangle'))!;if(!eq(s.x,box.x-10))s.x=lerp(s.x,box.x-10,.2);if(!eq(s.y,box.y-10))s.y=lerp(s.y,box.y-10,.2);}
 }},events:{
  create:(s,rt)=>{
   for(const h of rt.all(object('obj_heart')))h.color=2;
   Object.assign(s,{idealdir:90,dir:90,neg:0,idealdirprevious:0,diagonal_enabled:0,diagonal_transform:0,origin_offset:0,just:0,justlength:4,justflash:0,bullethitid:-1,funni:777,flash:0,radius:30,vanish:0,bumpaxecon:0,dark_brown:0x0f0064,light_green:0x394f3e,shadowpower:0,shadowpowerstart:0,shadowpowertarget:0,shadowpowercon:0,shadowpowertimer:0,shadowpowertimermax:0,wascymbalplayingprev:false,imageSpeed:0,imageAlpha:0,shake:0,fadealpha:0,image_angle_prev:0,frozentimer:0,parryflashtimer:0,transformflashtimer:0,transformtimer:0,forceheartpos:true});
   if(rt.first(object('obj_hammer_of_justice_enemy'))?.diagonal_enabled===1)s.diagonal_transform=1;
   if(rt.exists(object('obj_sound_of_justice_enemy'))){s.idealdir=180;s.imageAngle=s.idealdir;}
  },
  draw:(s,rt)=>{
   if(gt(s.frozentimer,0)){s.frozentimer--;return;}
   s.image_angle_prev=s.imageAngle;if(gt(s.just,0))s.just--;
   if(s.shadowpowercon===1){s.shadowpowertimer++;s.shadowpower=lerp(s.shadowpowerstart,s.shadowpowertarget,s.shadowpowertimer/s.shadowpowertimermax);if(ge(s.shadowpowertimer,s.shadowpowertimermax)){if(eq(s.shadowpower,.85))s.shadowpower=1;s.shadowpowerstart=s.shadowpowertarget;s.shadowpowertimer=0;s.shadowpowercon=0;}}
   const held=(key:number)=>rt.input.held.has(key),pressed=(key:number)=>rt.input.pressed.has(key),alternate=rt.exists(object('obj_sound_of_justice_enemy'));
   for(const [key,dir,old,side] of [[40,270,[270,225,315],[37,39]],[38,90,[90,45,135],[37,39]],[37,180,[180,135,225],[38,40]],[39,0,[0,45,315],[38,40]]] as const){
    if(pressed(key)){if(old.some(x=>eq(s.idealdir,x)))s.bumpaxecon=1;s.idealdir=dir;s.just=s.justlength;if(side.some(pressed))s.just=s.justlength+2;}
   }
   const offset=(x:number)=>rt.setSpriteOffset('spr_spearblocker',x,32),play=(name:string)=>rt.sourceAudio?.effect(name)??(rt.sound?.(name),name);
   if(s.diagonal_transform===1&&!alternate){
    const enemy=rt.first(object('obj_hammer_of_justice_enemy'))!;s.diagonal_enabled=1;
    if(eq(s.imageYscale,1)&&!(rt.sourceAudio?.playing('snd_jump')??false)&&enemy.transformsfx===0)play('snd_jump');
    s.imageYscale=lerp(s.imageYscale,.6,.2);if(lt(s.imageYscale,.62)){s.imageYscale=.6;s.diagonal_transform=0;}
    if(eq(s.radius,30)&&enemy.transformsfx===0){enemy.transformsfx=1;play('snd_jump');s.transformflashtimer=70;}
    s.radius=lerp(s.radius,35,.2);s.origin_offset=lerp(s.origin_offset,5,.2);offset(32-s.origin_offset);
    if(gt(s.radius,34)){s.radius=35;offset(27);s.diagonal_transform=0;}
   }
   for(const [key,dir] of [[38,90],[39,0],[37,180],[40,270]])if(held(key))s.idealdir=dir;
   if(!alternate&&s.diagonal_enabled===1)for(const [a,b,dir] of [[38,39,45],[37,38,135],[40,37,225],[39,40,315]])if(held(a)&&held(b))s.idealdir=dir;
   if(!eq(s.idealdir,s.idealdirprevious)){s.just=s.justlength;s.bumpaxecon=1;}s.idealdirprevious=s.idealdir;
   if(s.bumpaxecon===1){offset(s.diagonal_enabled===0?30:25);s.bumpaxecon=2;const wing=play('snd_wing');rt.sourceAudio?.volume(wing,.8,0);}
   else if(s.bumpaxecon===2){offset(s.diagonal_enabled===0?31:26);s.bumpaxecon=3;}
   else if(s.bumpaxecon===3){offset(s.diagonal_enabled===0?32:27);s.bumpaxecon=0;}
   const heart=rt.first(object('obj_heart'));if(heart){s.x=heart.x+10;s.y=heart.y+10;}if(!heart||lt(rt.globals.turntimer,1))rt.destroy(s);
   const difference=(((s.idealdir-s.imageAngle)%360+540)%360)-180,rep=Math.ceil(Math.abs(difference*.666));let dontmove=false;
   const spears=rt.all(object('obj_spearshot'));
   for(const [i,spear] of spears.entries()){gmArray(s,'spear')[i]=spear.id;if(spear.bouncespearcon===1&&lt(spear.bouncespeartimer,3))dontmove=true;}
   if(!dontmove)for(let i=0;i<rep;i++){
    const dir=s.imageAngle-s.idealdir;let delta=dir;if(gt(Math.abs(dir),180))delta=gt(s.imageAngle,s.idealdir)?-((360-s.imageAngle)+s.idealdir):(360-s.idealdir)+s.imageAngle;
    if(eq(s.imageAngle,s.idealdir)){}else if(gt(delta,2))s.imageAngle--;else if(lt(delta,2))s.imageAngle++;else s.imageAngle=s.idealdir;
    if(gt(s.imageAngle,360))s.imageAngle-=360;if(lt(s.imageAngle,0))s.imageAngle+=360;
   }
   if(spears.length){let closest=-1,dist=9999;for(const spear of spears){s.sper=spear.id;if(spear.bouncespear===0)spear.sprite='spr_spear_arrow';if(spear.longspear===1)spear.sprite='spr_spear_arrow_long';if(lt(spear.len/spear.fakespeed,dist)){closest=spear.id;dist=spear.len/spear.fakespeed;}}
    const near=rt.byId(closest);if(near&&near.fadespear!==3&&near.bouncespear===0&&near.longspear===0)near.sprite='spr_spear_arrow_highlight';
   }
   if(s.vanish===1){s.imageAlpha-=.1;if(lt(s.imageAlpha,0))rt.destroy(s);}else if(lt(s.imageAlpha,1))s.imageAlpha+=.2;
   rt.drawState.alpha=s.imageAlpha;let x=0,y=0;if(gt(s.shake,0)){s.shake--;x=-10+rt.random.random(20);y=-10+rt.random.random(20);}x++;y++;
   if(lt(s.flash,2))s.imageIndex=0;else{s.imageIndex=1;s.flash--;}
   rt.drawState.color=C.green;shieldFrame(s,rt);rt.drawSprite('spr_spearblocker',s.imageIndex,s.x+x,s.y+y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);rt.drawState.color=C.white;
   if(alternate){let alpha=lerp(1,0,s.shadowpower);if(s.vanish===1)alpha=s.imageAlpha;rt.drawSpriteFog('spr_spearblocker',s.imageIndex,s.x+x,s.y+y,s.imageXscale,s.imageYscale,s.imageAngle,s.dark_brown,alpha);rt.drawState.alpha=0;}
   if(gt(s.parryflashtimer,0)){s.parryflashtimer--;rt.drawState.alpha=parryAlpha(s.parryflashtimer/2);shieldFrame(s,rt,C.white);rt.drawState.alpha=0;}
   if(gt(s.justflash,0)){rt.drawSpriteFog('spr_spearblocker',2,s.x+x,s.y+y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.justflash);s.justflash-=.5;}
   rt.drawState.alpha=1;if(gt(s.fadealpha,0)){rt.drawCircle(s.x+x,s.y+y,s.radius,true);rt.drawSpriteFog('spr_spearblocker',2,s.x+x,s.y+y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.fadealpha);s.fadealpha-=.05;}
  },
  user0:s=>{s.imageAngle=s.idealdir;s.flash=5;},
  user1:(s,rt)=>{for(let i=0;i<3;i++){const y=s.y+lengthdirY(36,s.imageAngle-30+rt.random.irandom(60)),x=s.x+lengthdirX(36,s.imageAngle-30+rt.random.irandom(60)),part=rt.create(object('obj_shield_just_particle'),x,y);s.part=part.id;part.depth=s.depth-1;part.direction=s.idealdir;}},
  user2:shieldFrame,
  cleanup:(_s,rt)=>rt.setSpriteOffset('spr_spearblocker',32,32),
 }};
 const piece:GmObjectDef={...object('obj_spearblocker_piece'),events:{create:(s,rt)=>{s.gravity=.3;s.gravityDirection=270;s.timer=0;s.dir=rt.random.choose(-1,1);s.rotatespeed=4+rt.random.random(8);s.imageSpeed=0;},step:(s,rt)=>{s.imageAngle+=s.rotatespeed*s.dir;s.timer++;if(gt(s.timer,18))s.imageAlpha-=.1;if(lt(s.imageAlpha,0))rt.destroy(s);}}};
 const particle:GmObjectDef={...object('obj_shield_just_particle'),events:{create:(s,rt)=>{s.spd=4+rt.random.irandom(5);s.imageXscale=rt.random.random(.3)+.4;s.imageYscale=s.imageXscale;s.imageBlend=0x00d0e5;s.sprite='spr_organ_enemy_particle3';s.imageAlpha=.2;},step:(s,rt)=>{s.x+=lengthdirX(s.spd,s.direction);s.y+=lengthdirY(s.spd,s.direction);s.spd*=.85;s.imageXscale*=.85;s.imageYscale*=.85;if(lt(s.imageXscale+s.imageYscale,.16))rt.destroy(s);s.imageAngle+=45;s.imageAlpha+=.2;}}};
 return [shield,piece,particle];
}
