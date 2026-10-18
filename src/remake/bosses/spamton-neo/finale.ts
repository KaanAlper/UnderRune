// NEO's final-form suction, swallowed soul and final volley. Draw events retain their timing and random work.
import {resolveEvent,moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {clamp,eq,ge,gt,le,lt,lengthdirX,lengthdirY,pointDirection,pointDistance} from '../../gm/math';
import {C,mergeColor} from '../../gm/graphics';
import {bulletInit,damageAll,damageProportional} from '../../deltarune/battle';
import {sndPitchTime} from '../../deltarune/chapter2-battle';
import {sideBPhase} from '../../deltarune/chapter2';
import {easeIn,lerpEaseIn} from '../../deltarune/ease';
import {snd} from '../../deltarune/sound';
import type {HookedDef} from '../../deltarune/rules';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const inverse=(a:number,b:number,v:number)=>eq(a,b)?0:(v-a)/(b-a);
const towards=(a:number,b:number,v:number)=>eq(a,b)?a:gt(a,b)?Math.max(a-v,b):Math.min(a+v,b);
export function createNeoFinale(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const basic=object('obj_basicbullet_sneo'),regular=object('obj_regularbullet');
 const basicCreate=resolveEvent(basic,'create')!,regularCreate=resolveEvent(regular,'create')!,regularStep=resolveEvent(regular,'step')!;
 const first=(rt:GmRuntime,n:string)=>rt.first(object(n));
 const need=(rt:GmRuntime,n:string)=>{const i=first(rt,n);if(!i)throw Error(`NEO finale requires ${n}`);return i;};
 const each=(rt:GmRuntime,n:string,fn:(i:GmInstance)=>void)=>{for(const i of rt.withInstances(object(n)))if(i.live)fn(i);};
 const create=(s:GmInstance,rt:GmRuntime,n:string,x=s.x,y=s.y,field='d')=>{const d=rt.create(object(n),x,y);s[field]=d.id;return d;};
 const proportionalStats=(s:GmInstance,rt:GmRuntime)=>{
  const n=first(rt,'obj_spamton_neo_enemy'),c=first(rt,'obj_sneo_bulletcontroller');
  if(n)s.damage=Math.floor(rt.globals.monsterat[n.myself]*5/3);if(c)s.target=c.target;s.grazepoints=4;
 };
 const enemyHit=(s:GmInstance,rt:GmRuntime)=>{
  if(eq(s.active,1)){each(rt,'obj_spamton_neo_enemy',n=>rt.userEvent(n,2));if(eq(s.destroyonhit,1))rt.destroy(s);}
 };
 const shake=(s:GmInstance,rt:GmRuntime,amount:number)=>{
  let d=first(rt,'obj_shake');if(d)s.d=object('obj_shake').index;else d=create(s,rt,'obj_shake',0,0);
  each(rt,'obj_shake',d=>{d.shakex=Math.ceil(amount);d.shakey=Math.ceil(amount);});
 };
 const finaleParent:GmObjectDef={name:'obj_basicbullet_sneo_finale',index:599,parent:basic,sprite:'spr_sneo_bullet0',depth:0,events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{element:6,f:2,destroyable:0,angle_speed:0,destroypoints:1,grazepoints:4});
   const n=first(rt,'obj_spamton_neo_enemy'),c=first(rt,'obj_sneo_bulletcontroller');if(n)s.damage=rt.globals.monsterat[n.myself]*5;if(c)s.target=c.target;},
  step:(s,rt)=>{if(ge(s.x,rt.room.width+100)||le(s.x,-100)||ge(s.y,rt.room.height+100)||le(s.y,-100))rt.destroy(s);s.direction+=s.angle_speed;s.imageAngle=s.direction;},
  user5:(s,rt)=>{if(eq(s.active,1)){if(!eq(s.target,3))damageProportional(s,rt);if(eq(s.target,3))damageAll(s,rt);if(eq(s.destroyonhit,1))rt.destroy(s);}},
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
  if(eq(s.destroyable,1)){if(eq(shot.big,0))rt.userEvent(shot,0);const a=create(s,rt,'obj_yshot_anim',s.x,s.y,'anim');
   a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.sprite='spr_yheart_shot_hit3';rt.destroy(s);
  }else if(eq(s.destroyable,-1))rt.userEvent(shot,0);
 }}]};
 const grow:GmObjectDef={name:'obj_finale_growtangle',index:652,parent:object('obj_bulletparent'),sprite:'spr_battlebg_0',mask:'spr_battlebg_0',depth:0,events:{
  create:(s,rt)=>{Object.assign(s,{imageXscale:0,imageYscale:0,imageAlpha:0.3,maxtimer:15,timeincrease:1,timer:14,growcon:1,imageSpeed:0,
   imageBlend:mergeColor(C.green,C.lime,0.5),target_angle:0,fullgrow:0,keep:0,megakeep:0});const b=need(rt,'obj_growtangle');
   s.maxxscale=b.maxxscale;s.maxyscale=b.maxyscale;s.sprite=b.spr_custom_box;b.depth-=2;s.depth=b.depth+1;},
  step:(s,rt)=>{s.growth=0;if(lt(s.timer,s.maxtimer*5)&&eq(s.growcon,1))s.growth=1;if(gt(s.timer,0)&&eq(s.growcon,3))s.growth=1;
   if(eq(s.growth,1)){if(eq(s.growcon,1))s.timer+=s.timeincrease;s.timeincrease+=0.025;if(eq(s.growcon,3))s.timer-=1;
    s.imageXscale=s.maxxscale*s.timer/s.maxtimer;s.imageYscale=s.maxyscale*s.timer/s.maxtimer;s.imageAngle=180+180*s.timer/s.maxtimer+s.target_angle;
    s.imageAlpha=Math.min(1,0.5+s.timer/s.maxtimer*0.5);const d=create(s,rt,'obj_afterimage');d.sprite=s.sprite;
    d.imageXscale=s.imageXscale/(s.maxxscale/2);d.imageYscale=s.imageYscale/(s.maxyscale/2);d.imageAngle=s.imageAngle;d.depth=s.depth-3;
    if(eq(s.growcon,1)&&eq(s.timer,s.maxtimer)){d.imageXscale=s.imageXscale;d.imageYscale=s.imageYscale;d.sprite=need(rt,'obj_growtangle').sprite;d.imageBlend=C.white;d.depth-=1;d.imageAlpha=1;}
    else{d.imageBlend=s.imageBlend;d.imageAlpha=(1-s.timer/(s.maxtimer*5))*0.5+0.1;}d.imageSpeed=0;
    if(ge(s.timer,s.maxtimer*5)&&eq(s.growcon,1)){s.growcon=2;s.imageAngle=s.target_angle;}
    if(eq(s.growcon,3)&&le(s.timer,s.maxtimer)){rt.globals.turntimer=0;rt.destroy(s);}
   }},
  draw:(s,rt)=>{rt.drawSprite('spr_battlebg_stretch',1,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   rt.drawSprite(s.sprite,0,s.x,s.y,s.imageXscale/(s.maxxscale/2),s.imageYscale/(s.maxyscale/2),s.imageAngle,s.imageBlend,s.imageAlpha);},
 }};
 const warped:GmObjectDef={name:'obj_sneo_warped_box',index:612,parent:object('obj_bulletparent'),sprite:'spr_battlebg_0',depth:0,events:{
  create:(s,rt)=>{const b=need(rt,'obj_growtangle');s.depth=b.depth;b.imageAlpha=0;
   Object.assign(s,{minx:b.x-rt.spriteWidth(b)/2,maxx:b.x+rt.spriteWidth(b)/2,miny:b.y-rt.spriteHeight(b)/2,maxy:b.y+rt.spriteHeight(b)/2,
    suckx:b.x+100,upper_sucky:b.y-40,lower_sucky:b.y+40,suckpower:0,timer:0,snapback:0,target:0,state:0,inhale:0,inhalespeed:0,intro:0,stopthesucc:0});
   each(rt,'obj_battlesolid',b=>{b.imageXscale=3;b.imageYscale=3;});},
  destroy:(_s,rt)=>{each(rt,'obj_growtangle',b=>{b.imageAlpha=1;b.keep=1;});each(rt,'obj_battlesolid',b=>{b.imageXscale=2;b.imageYscale=2;});},
  draw:(s,rt)=>{const color=rt.drawState.color;if(gt(s.inhalespeed,0)&&lt(s.inhale,1))s.inhale=clamp(s.inhale+s.inhalespeed,0,1);
   const x=lerp(s.minx,lerp(s.maxx,s.suckx,s.suckpower)-8,s.inhale),dy=lerp(s.maxy,lerp(s.maxy,s.lower_sucky,s.suckpower)+8,s.inhale),uy=lerp(s.miny,lerp(s.miny,s.upper_sucky,s.suckpower)-8,s.inhale);
   rt.drawState.color=0x00c000;rt.drawState.alpha=s.imageAlpha;
   rt.drawTriangle(x,uy,lerp(s.maxx,s.suckx,s.suckpower),lerp(uy,s.upper_sucky,s.suckpower),lerp(s.maxx,s.suckx,s.suckpower),lerp(dy,s.lower_sucky,s.suckpower));
   rt.drawTriangle(x,uy,x,dy,lerp(s.maxx,s.suckx,s.suckpower),lerp(dy,s.lower_sucky,s.suckpower));rt.drawState.color=C.black;
   rt.drawTriangle(x+4,uy+4,lerp(s.maxx-4,s.suckx-4,s.suckpower),lerp(uy+4,s.upper_sucky+3,s.suckpower),lerp(s.maxx-4,s.suckx-4,s.suckpower),lerp(dy-4,s.lower_sucky-3,s.suckpower));
   rt.drawTriangle(x+4,uy+4,x+4,dy-4,lerp(s.maxx-4,s.suckx-4,s.suckpower),lerp(dy-4,s.lower_sucky-3,s.suckpower));rt.drawState.color=color;rt.drawState.alpha=1;
   if(eq(s.state,1)){if(ge(s.timer,60))s.timer-=1;s.suckpower=ge(s.timer,59)?s.timer/60:easeIn(s.timer/60,3);}
   else if(eq(s.state,2)){if(gt(s.timer,30))s.timer=30;if(eq(s.snapback,0))s.snapback=-1;if(gt(s.timer,0))s.timer-=1;s.suckpower=easeIn(s.timer/30,-2);}
  },
  endStep:(s,rt)=>{const h=first(rt,'obj_heart');if(!h)return;
   if(eq(s.state,0)){if(lt(h.x,s.minx+3))h.x=s.minx+3;if(lt(h.y,s.miny+3))h.y=s.miny+3;if(gt(h.y,s.maxy-20))h.y=s.maxy-20;if(gt(h.x,s.maxx-20))h.x=s.maxx-20;return;}
   s.rborder=lerp(s.maxx,s.suckx,s.suckpower);s.uborder=s.miny;s.dborder=s.maxy;
   if(eq(s.snapback,0)&&eq(s.stopthesucc,0))h.x+=s.suckpower;
   if(le(s.snapback,0)&&le(rt.globals.turntimer,30)&&ge(h.x,s.rborder-22)){s.snapback=s.suckpower;if(gt(s.suckpower,0.5)&&!first(rt,'obj_shake')){const d=create(s,rt,'obj_shake',0,0);d.shakex=Math.ceil(s.suckpower*4);d.shakey=Math.ceil(s.suckpower*4);}}
   if(gt(s.snapback,0)){h.x-=20*easeIn(s.snapback,2);s.snapback-=0.1;}
   if(lt(h.x,s.minx+3))h.x=s.minx+3;if(gt(h.x,s.rborder-20))h.x=s.rborder-20;
   const xoffset=(h.x-(s.minx+3))/(s.rborder-20-(s.minx+3));
   const u=(s.upper_sucky-s.miny)*xoffset*s.suckpower,d=(s.maxy-s.lower_sucky)*xoffset*s.suckpower;
   if(lt(h.y,s.uborder+3+u))h.y=s.uborder+3+u;if(gt(h.y,s.dborder-20-d))h.y=s.dborder-20-d;
   if(lt(h.y,s.uborder+3))h.y=s.uborder+3;if(gt(h.y,s.dborder-20))h.y=s.dborder-20;
  },
 }};
 const hittable=(f:GmInstance)=>Boolean(f.destroyable)&&eq(f.state,0)||eq(f.state,1)&&lt(f.formtimer,30);
 const headShot=(s:GmInstance,shot:GmInstance,rt:GmRuntime,hitbox:boolean)=>{
  rt.userEvent(shot,0);if(!hitbox)each(rt,'obj_sneo_final_forme',f=>{f.hurtalpha=1;});const f=first(rt,'obj_sneo_final_forme');
  if(f&&!hittable(f))return;snd(rt,'snd_damage');if(!f)return;
  each(rt,'obj_sneo_final_forme',f=>{f.hurtalpha=1;});if(eq(s.destroyable,1)){
   const target=hitbox?need(rt,'obj_sneo_final_forme'):s;
   if(eq(shot.big,0)){target.x+=hitbox?7:6;target.formtimer+=hitbox?5:4;}
   else{target.pushback=hitbox?13:10;target.formtimer+=hitbox?13:10;}
  }
 };
 const mouth:GmObjectDef={name:'obj_sneo_final_forme_mouth_back',index:41,sprite:'spr_sneo_final_forme',depth:0,events:{
  create:s=>{s.imageIndex=7;},endStep:(s,rt)=>{const f=first(rt,'obj_sneo_final_forme');if(f){s.x=f.x+f.headoffset_x;s.y=f.y+f.headoffset_y;}},
 }};
 const headHitbox:GmObjectDef={name:'obj_sneo_final_forme_hitbox',index:644,parent:basic,sprite:'spr_sneo_final_forme_hitbox',visible:false,depth:0,events:{
  create:(s,rt)=>{basicCreate(s,rt);s.destroyonhit=false;s.parent=643;},
  endStep:(s,rt)=>{const f=first(rt,'obj_sneo_final_forme');if(f){s.parent=643;s.x=f.x;s.y=f.y;}if(first(rt,'obj_sneo_lastattack'))rt.destroy(s);},
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>headShot(s,shot,rt,true)}]};
 const form:HookedDef={name:'obj_sneo_final_forme',index:643,parent:finaleParent,sprite:'spr_sneo_final_forme',depth:0,hooks:{pullsShots:s=>[s.x+122,s.y+146]},events:{
  create:(s,rt)=>{finaleParent.events!.create!(s,rt);s.element=6;proportionalStats(s,rt);
   Object.assign(s,{steptimer:0,stepping:true,pushback:0,advancespeed:3,imageSpeed:0,mouthopen:false,destroyonhit:0,introtimer:0,intro:0,mouthx:90,mouthy:142});
   rt.create(headHitbox,s.x,s.y);
   Object.assign(s,{state:0,formtimer:0,stepdir:-1,made:0,fakeheart:-4,fakeheart_speed:0,effecttimer:0,lerptimer:0,inhalesfx:0,hurtalpha:0,
    bullet_suck_x1:20,bullet_suck_x2:130,bullet_suck_y1:100,bullet_suck_y2:190,movetimer:0,moveframes:12,movecon:0,timer2:0,timer3:0,
    headoffset_x:0,headoffset_y:0,dmgcon:0});
   const back=rt.create(mouth,s.x,s.y);s.back=back.id;back.depth=s.depth+1;const h=first(rt,'obj_heart');if(h)back.depth=h.depth+1;
   s.hidemouthback=0;s.playback_sprite='spr_sneo_playback';},
  destroy:(_s,rt)=>{each(rt,'obj_sneo_hitdetector',h=>{h.active=true;});each(rt,'obj_sneo_final_forme_mouth_back',h=>rt.destroy(h));},
  user5:enemyHit,
  draw:(s,rt)=>{each(rt,'obj_sneo_final_forme_mouth_back',b=>{
   if(eq(s.imageIndex,5)&&eq(s.hidemouthback,0)){b.imageIndex=7;b.x=s.x+s.headoffset_x;b.y=s.y+s.headoffset_y;b.visible=true;}else b.visible=false;});
   const phase=lt(s.state,2)?0.15:0.05;
   rt.drawSprite(s.sprite,3,s.x,s.ystart-Math.abs(Math.sin(s.steptimer+phase)*40),1,1,0,s.imageBlend,1);
   if(!eq(s.imageAngle,0))rt.drawSprite('spr_sneo_final_forme_head_rotate_origin',s.imageIndex,s.x+138+s.headoffset_x,s.y+135+s.headoffset_y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,1);
   else if(ge(s.state,2)&&lt(s.state,10)||eq(s.state,11)&&ge(s.formtimer,30)&&le(s.formtimer,70)){
    const amount=eq(s.state,3)?2:1,ry=rt.random.randomRange(-amount,amount),rx=rt.random.randomRange(-amount,amount);
    rt.drawSprite(s.sprite,s.imageIndex,s.x+rx,s.ystart-Math.abs(Math.sin(s.steptimer+phase)*40+ry));
   }else rt.drawSprite(s.sprite,s.imageIndex,s.x+s.headoffset_x,s.y+s.headoffset_y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
   if(hittable(s)){if(gt(s.hurtalpha,0))s.hurtalpha-=0.1;rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,1,1,0,C.yellow,s.hurtalpha);}
   if(!eq(s.intro,0)){s.imageIndex=4;s.introtimer+=1;s.imageBlend=mergeColor(C.black,C.white,clamp((s.introtimer/30-0.5)/1.5,0,1));
    rt.drawSprite(s.sprite,2,s.x,s.y,1,1,0,eq(s.intro,1)?mergeColor(C.black,C.white,clamp(s.introtimer/30,0,1)):C.white,1);
    if(ge(s.introtimer,68)){s.intro=0;s.imageIndex=4;s.imageAlpha=1;s.imageBlend=C.white;}
   }
  },
  step:(s,rt)=>{
   if(!first(rt,'obj_sneo_final_forme_hitbox'))rt.create(headHitbox,s.x,s.y);if(eq(s.intro,1))return;
   s.formtimer+=1;if(eq(s.grazed,1)){s.grazetimer+=1;if(ge(s.grazetimer,30)){s.grazetimer=0;s.grazed=0;}}
   const b=()=>need(rt,'obj_growtangle'),w=()=>need(rt,'obj_sneo_warped_box'),h=()=>need(rt,'obj_heart');
   const alignBox=(camera:boolean,smooth:boolean)=>{const box=w();box.suckx=Math.min(b().x+150,s.x+106);
    const goal=clamp(inverse((camera?rt.view.x:0)+520,b().x+100,s.x),0,1)*60;box.timer=smooth?towards(box.timer,goal,2):goal;box.upper_sucky=s.y+129;box.lower_sucky=s.y+159;};
   if(lt(s.state,2)){
    if(eq(s.state,0))s.stepdir=-1;if(eq(s.state,0)&&ge(s.formtimer,25))s.steptimer+=0.05;
    if(ge(s.steptimer,Math.PI)){s.steptimer-=Math.PI;shake(s,rt,2);snd(rt,'snd_screenshake');if(eq(s.state,1))s.stepdir=1;}
    if(!(eq(s.state,11)&&ge(s.formtimer,65)))s.y=s.ystart-Math.sin(s.steptimer)*40;
    if(!(eq(s.state,0)&&lt(s.formtimer,25)))s.x+=1.6*s.stepdir;
    if(Boolean(s.destroyable)&&eq(s.state,0)&&gt(s.x,b().x+140)||eq(s.state,1)&&lt(s.formtimer,30)&&gt(s.x,b().x+140)){s.x+=4*s.stepdir;s.pushback=0;}
    if(s.destroyable)alignBox(false,true);if(gt(s.pushback,0)){s.x+=s.pushback*2/3;s.pushback-=1;}
    if(hittable(s)){
     if(eq(s.inhalesfx,0)){s.inhalesfx=1;rt.soundLoop?.('snd_sneo_overpower');rt.soundPitch?.('snd_sneo_overpower',0.1);sndPitchTime(rt,'snd_sneo_overpower',1,90);rt.sourceAudio?.volume('snd_sneo_overpower',0.75,0);
      const wreck=create(s,rt,'obj_wreckpausespew',s.x,s.y,'wreck');wreck.depth=s.depth-1;}
     s.effecttimer+=1;if(eq(s.effecttimer%6,0))for(s.i=0;lt(s.i,3);s.i+=1){const d=create(s,rt,'obj_rouxls_power_up_orb',s.x+s.mouthx,s.y+s.mouthy);d.direction=rt.random.irandom(40)+s.i*40+120;d.lifetime=12;d.depth=s.depth+1;d.imageBlend=s.imageBlend;}
    }
    if(eq(s.state,0)&&lt(s.x,b().x-rt.spriteWidth(b())/2.5)||eq(s.state,0)&&gt(h().x,s.x+70)){
     s.state=10;s.formtimer=0;need(rt,'obj_sneo_bulletcontroller').special+=1;create(s,rt,'obj_sneo_fakeheart',h().x,h().y,'fakeheart');
    }else if(eq(s.state,0)&&ge(s.formtimer,320)){need(rt,'obj_sneo_bulletcontroller').special+=1;s.state+=1;s.formtimer=45;}
    else if(eq(s.state,1)&&ge(s.formtimer,45)){each(rt,'obj_wreckpausespew',i=>{i.imageIndex=1;});each(rt,'obj_sneo_dollar',i=>{i.fade=1;});s.state+=1;s.formtimer=45;
     if(gt(s.x,b().x+70))w().state=2;s.imageIndex=4;s.imageAngle=1;rt.soundStop?.('snd_sneo_overpower');w().stopthesucc=1;}
   }else if(eq(s.state,2)&&ge(s.formtimer,45)){s.state+=1;s.imageIndex=5;s.formtimer=0;s.steptimer=Math.PI-s.steptimer;each(rt,'obj_sneo_final_forme_hitbox',h=>{h.destroyable=false;});rt.globals.turntimer=360;}
   else if(eq(s.state,3)){
    if(eq(s.movecon,0)){s.movetimer+=1/s.moveframes;s.imageAngle=lerpEaseIn(s.imageAngle,25,s.movetimer,2);if(eq(s.movetimer,1)){s.movetimer=0;s.movecon=1;}}
    if(eq(s.movecon,2)){s.timer3+=1;if(gt(s.timer3,20)){s.movetimer+=1/s.moveframes;s.imageAngle=lerpEaseIn(s.imageAngle,-1,s.movetimer,2);s.headoffset_x=lerp(0,-12,s.movetimer);s.headoffset_y=lerp(0,2,s.movetimer);}}
    if(lt(s.timer2,100))s.timer2+=1;s.x=lerp(s.x,rt.view.x+439,s.timer2/100);if(gt(s.x,b().x+70))w().state=2;else alignBox(true,false);
    if(gt(s.x,rt.view.x+438)){s.x=rt.view.x+438;s.movecon=2;if(eq(s.movecon,2)&&eq(s.movetimer,1)){rt.destroy(s);
     const aa=create(s,rt,'obj_sneo_lastattack',s.x,s.ystart-Math.abs(Math.sin(s.steptimer+0.15)*40),'aa');
     aa.yspot[0]=b().y-rt.spriteHeight(b())/2-aa.y_offset+40;aa.yspot[1]=b().y+rt.spriteHeight(b())/2-aa.y_offset-40;rt.globals.turntimer=300;}}
   }else if(eq(s.state,4)&&ge(s.formtimer,25)){s.formtimer=0;s.state=5;rt.create(object('obj_sneo_final_orb'),s.x+s.mouthx,s.y+s.mouthy);s.imageIndex=5;}
   else if(eq(s.state,10)){
    s.fakeheart_speed=towards(s.fakeheart_speed,10,1);const f=rt.byId(s.fakeheart);if(f){let tx=s.x+s.mouthx+5;if(gt(f.x,tx-10))tx+=20;moveTowardsPoint(f,tx,s.y+s.mouthy,s.fakeheart_speed);}
    w().inhalespeed+=0.01;if(gt(s.x,s.x+s.mouthx+10)){s.imageIndex=4;rt.soundStop?.('snd_sneo_overpower');}
    if(gt(s.formtimer,45)){if(!f)throw Error('NEO finale requires swallowed soul');f.speed=0;f.direction=0;s.state=11;s.formtimer=0;s.imageIndex=4;s.hidemouthback=1;
     rt.soundStop?.('snd_sneo_overpower');w().imageAlpha=0;w().timer=0;f.state=1;each(rt,'obj_sneo_dollar',d=>{d.fade=1;});}
   }else if(eq(s.state,11)){
    if(lt(s.formtimer,15))return;if(lt(s.x,rt.view.x+438))s.x+=4;if(gt(s.x,rt.view.x+438)&&lt(s.formtimer,65))s.formtimer=65;
    if(eq(s.formtimer%5,0)&&ge(s.formtimer,30)&&le(s.formtimer,65)){const sound=snd(rt,'snd_hurt1'),pitch=rt.random.randomRange(1.4,2);rt.soundPitch?.(sound??'snd_hurt1',pitch);shake(s,rt,1);
     if(eq(s.dmgcon,0)){s.dmgcon=1;rt.globals.inv=-1;each(rt,'obj_spamton_neo_enemy',n=>rt.userEvent(n,2));}}
    if(eq(s.formtimer,50)){b().timer=0;b().growcon=1;b().imageAlpha=1;}
    if(eq(s.formtimer,65)){w().inhale=0;w().inhalespeed=0;w().imageAlpha=1;b().imageAlpha=0;}
    if(gt(s.x,rt.view.x+438)){if(lt(s.formtimer,50)){b().timer=0;b().growcon=1;b().imageAlpha=1;}s.formtimer=0;s.state=12;
     const f=rt.byId(s.fakeheart);if(!f)throw Error('NEO finale requires swallowed soul');f.x=s.x+s.mouthx;f.y=s.y+s.mouthy;f.state=2;s.imageIndex=5;}
   }else if(eq(s.state,12)){each(rt,'obj_wreckpausespew',w=>{w.imageIndex=1;});if(lt(s.movetimer,1)){s.movetimer+=1/s.moveframes;s.headoffset_x=lerp(0,-12,s.movetimer);s.headoffset_y=lerp(0,2,s.movetimer);}
    if(ge(s.formtimer,30)&&ge(s.movetimer,1)){s.state=2;s.formtimer=0;s.imageIndex=4;rt.destroy(s);rt.create(object('obj_sneo_lastattack'),s.x,s.ystart-Math.abs(Math.sin(s.steptimer+0.15)*40));}}
   if(ge(s.state,11)){s.steptimer+=0.05;if(ge(s.steptimer,Math.PI)){s.steptimer-=Math.PI;shake(s,rt,2);snd(rt,'snd_screenshake');}s.y=s.ystart-Math.sin(s.steptimer)*40;}
  },
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>headShot(s,shot,rt,false)}]};
 const dollar:GmObjectDef={name:'obj_sneo_dollar',index:645,parent:regular,sprite:'spr_spamton_dollar',depth:0,events:{
  create:(s,rt)=>{regularCreate(s,rt);Object.assign(s,{element:6,imageAlpha:0,startscale:1,destroyable:0,fade:0});proportionalStats(s,rt);},
  draw:(s,rt)=>{if(lt(s.imageAlpha,1)&&eq(s.fade,0))s.imageAlpha+=0.1;rt.drawSelf(s);},
  user5:(s,rt)=>{if(eq(s.fade,1))return;enemyHit(s,rt);},
  step:(s,rt)=>{if(eq(s.fade,1)){s.imageAlpha-=0.1;s.speed=0;if(le(s.imageAlpha,0))rt.destroy(s);}regularStep(s,rt);
   const f=first(rt,'obj_sneo_final_forme');if(!f)return;const mx=f.x+f.mouthx,my=f.y+f.mouthy;
   if(gt(s.x,mx-50))s.y+=clamp(my-s.y,-5,5);if(lt(s.x,mx-10)){s.direction=pointDirection(s.x,s.y,mx,my);s.friction=-0.1;}
   const scale=lerp(s.startscale,1,clamp(inverse(mx-200,mx-50,s.x),0,1));s.imageXscale=scale;s.imageYscale=scale;
   if(gt(s.x,mx+50)){rt.destroy(s);snd(rt,'snd_swallow');}
  },
 }};
 const fake:GmObjectDef={name:'obj_sneo_fakeheart',index:646,parent:object('obj_bulletparent'),sprite:'spr_yellowheart',depth:0,events:{
  create:(s,rt)=>{const h=need(rt,'obj_heart');s.depth=h.depth;h.imageAlpha=0;rt.globals.inv=300;Object.assign(s,{state:0,heartspeed:14,startangle:0});h.color=0;},
  destroy:(s,rt)=>{if(le(rt.globals.turntimer,0))rt.globals.inv=-1;each(rt,'obj_heart',h=>{h.imageAlpha=1;h.x=s.x;h.y=s.y;h.color=1;});},
  draw:(s,rt)=>{const cx=s.x+9,cy=s.y+9,theta=pointDirection(cx,cy,s.x,s.y)+s.imageAngle,r=pointDistance(cx,cy,s.x,s.y);
   s.xx=eq(s.imageAngle,0)?s.x:cx+lengthdirX(r,theta);s.yy=eq(s.imageAngle,0)?s.y:cy+lengthdirY(r,theta);
   const h=need(rt,'obj_heart');if(!eq(s.imageXscale,1)||!eq(s.imageYscale,1))rt.drawSprite(s.sprite,h.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.imageAlpha);
   else rt.drawSprite(s.sprite,h.imageIndex,s.xx,s.yy,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.imageAlpha);
  },
  endStep:(s,rt)=>{const h=()=>need(rt,'obj_heart'),b=()=>need(rt,'obj_growtangle');
   if(eq(s.state,0))s.imageAngle-=s.speed*2;
   else if(eq(s.state,1)){s.imageAlpha=0;s.imageAngle=0;s.x=b().x+400;s.speed=0;s.direction=0;}
   else if(eq(s.state,2)){s.imageAngle+=60;s.imageAlpha=1;s.x-=20;const minx=b().x-rt.spriteWidth(b())/2+4;
    if(le(s.x,minx+20)){s.x=minx;h().x=s.x;h().y=s.y;s.state=3;rt.globals.inv=-1;each(rt,'obj_spamton_neo_enemy',n=>rt.userEvent(n,2));
     each(rt,'obj_dmgwriter',w=>{w.depth=s.depth-2;w.x=need(rt,'obj_heroparent').x;w.y=need(rt,'obj_heroparent').y;});h().color=1;
     s.imageAngle%=360;if(lt(s.imageAngle,180))s.imageAngle+=360;s.startangle=s.imageAngle;s.heartspeed=8;}}
   else if(eq(s.state,3)){h().x+=s.heartspeed;s.x=h().x;s.heartspeed-=1.5;s.imageAngle=lerp(s.startangle,0,(s.heartspeed-8)/-8);
    if(le(s.heartspeed,0)){h().color=1;h().imageAlpha=1;rt.destroy(s);}}
  },
 }};
 const last:GmObjectDef={name:'obj_sneo_lastattack',index:648,sprite:'spr_sneo_lastattack_head',depth:0,events:{
  create:(s,rt)=>{const b=need(rt,'obj_growtangle');Object.assign(s,{x_offset:66,y_offset:135,skip_1st_part_hp:12,skip_2nd_part_hp:17,
   yspot:[b.y-rt.spriteHeight(b)/2-135,b.y+rt.spriteHeight(b)/2-135,s.y],lastshoty:s.y,rand:80,ycurrent:1,con:0,movetimer:0,shottimer:0,timer:0,count:0,
   mouthtopy:0,mouthbottomy:0,shotmouthopen:0,shotmouthopentimer:0,mouthangle:0,init:0,remx:s.x,hurtalpha:0});
   rt.create(object('obj_sneo_lastattack_hitbox'),s.x,s.y);s.endattack=0;each(rt,'obj_wreckpausespew',w=>{w.imageIndex=2;});},
  destroy:(_s,rt)=>{each(rt,'obj_wreckpausespew',w=>rt.destroy(w));},
  draw:(s,rt)=>{if(gt(s.hurtalpha,0))s.hurtalpha-=0.1;rt.drawSprite('spr_sneo_final_forme',3,s.x,s.y);
   const x=s.x+60+s.mouthbottomy/2+s.x_offset,y=s.y+s.mouthtopy+s.y_offset;
   rt.drawSprite('spr_sneo_lastattack_head_top',0,x,y,1,1,s.mouthangle,C.white,1);rt.drawSprite(s.sprite,1,s.x+s.mouthbottomy/2+s.x_offset,s.y+s.mouthbottomy+s.y_offset);
   rt.drawSprite('spr_sneo_lastattack_head_top',0,x,y,1,1,s.mouthangle,C.yellow,s.hurtalpha);rt.drawSprite(s.sprite,1,s.x+s.mouthbottomy/2+s.x_offset,s.y+s.mouthbottomy+s.y_offset,1,1,0,C.yellow,s.hurtalpha);},
  step:(s,rt)=>{if(eq(s.init,0)){s.remx=s.x;s.movetimer+=1;s.init=1;}
   if(eq(s.con,0)){s.movetimer+=1;if(le(s.movetimer,14))s.y=lerp(s.y,s.yspot[s.ycurrent],0.122);else{s.movetimer=0;s.count+=1;s.ycurrent+=1;if(ge(s.ycurrent,2))s.ycurrent=0;}
    s.shottimer+=1;if(ge(s.shottimer,rt.random.choose(15))){s.lastshoty=s.y;const b=create(s,rt,'obj_sneo_bigshot',s.x+100,s.y+s.y_offset,'bigshot');b.hspeed=-6;b.friction=-0.25;
     s.shottimer=s.count/4;s.shotmouthopen=1;s.shotmouthopentimer=0;s.rand=70+rt.random.irandom(5);snd(rt,'snd_chargeshot_fire',0.7,0.75);}
    if(eq(s.count,10)||eq(s.endattack,1)){s.con=1;s.timer=0;s.endattack=1;}
   }
   if(eq(s.shotmouthopen,1)){s.shotmouthopentimer+=1;s.mouthtopy=-Math.sin(s.shotmouthopentimer/3)*30;s.mouthbottomy=-s.mouthtopy;s.mouthangle=s.mouthtopy;
    if(lt(s.mouthbottomy,0)){s.mouthangle=0;s.mouthtopy=0;s.mouthbottomy=0;s.shotmouthopentimer=0;s.shotmouthopen=0;}}
   if(eq(s.con,1)){s.timer+=1;s.y=lerp(s.y,(s.yspot[0]+s.yspot[1])/2,0.1);
    if(lt(s.timer,10)){s.mouthbottomy=lerp(s.mouthbottomy,0,0.2);s.mouthtopy=lerp(s.mouthtopy,20,0.2);}
    if(ge(s.timer,10)&&lt(s.timer,25)){s.mouthbottomy=lerp(s.mouthbottomy,120,0.04);s.mouthtopy=lerp(s.mouthtopy,-100,0.04);s.mouthangle=lerp(s.mouthangle,-45,0.05);}
    if(ge(s.timer,10)){s.mouthtopy+=Math.sin(s.timer*2)*4;s.mouthbottomy-=Math.sin(s.timer*2)*4;s.mouthangle-=Math.sin(s.timer)*5;s.x+=rt.random.randomRange(-1,1);s.y+=rt.random.randomRange(-1,1);}
    if(eq(s.timer,11)){const b=create(s,rt,'obj_sneo_bigshot',s.x+131,s.y+s.y_offset,'bigshot');b.imageXscale=0;b.imageYscale=0;b.sprite='spr_sneo_bigshot_l';s.shottimer=0;
     for(const pitch of [0.4,0.6,0.8,0.9])snd(rt,'snd_chargeshot_fire',pitch,0.7);}
   }
  },
 }};
 const lastHitbox:GmObjectDef={name:'obj_sneo_lastattack_hitbox',index:649,sprite:'spr_whitepx_10',visible:false,depth:0,events:{
  create:(s,rt)=>{s.destroyonhit=false;s.parent=648;const p=need(rt,'obj_sneo_lastattack');s.x=p.x+p.x_offset+30;s.y=p.y+p.y_offset-40;s.imageXscale=4;s.imageYscale=6;},
  endStep:(s,rt)=>{const p=first(rt,'obj_sneo_lastattack');if(p){s.parent=648;s.x=p.x+p.x_offset+30;s.y=p.y+p.y_offset-40;}},
 },collisions:[{target:object('obj_yheart_shot'),run:(_s,shot,rt)=>{rt.userEvent(shot,0);const p=need(rt,'obj_sneo_lastattack');
  if(!eq(p.endattack,2)){snd(rt,'snd_damage');each(rt,'obj_sneo_lastattack',p=>{p.hurtalpha=1;});if(eq(p.endattack,0))p.skip_1st_part_hp-=shot.damage;
   if(lt(p.skip_1st_part_hp,1)&&eq(p.endattack,0))p.endattack=1;
   if(lt(p.skip_2nd_part_hp,1)&&eq(p.endattack,1)){each(rt,'obj_sneo_bigshot',b=>{b.playerhit=1;b.damage=0;rt.userEvent(b,0);});p.endattack=2;}
  }
 }}]};
 const orb:GmObjectDef={name:'obj_sneo_final_orb',index:642,parent:basic,sprite:'spr_sneo_neobuster',depth:0,events:{
  create:(s,rt)=>{basicCreate(s,rt);Object.assign(s,{destroyable:1,destroyonhit:0,imageXscale:4,imageYscale:4,hp:12,timer:0,direction:180,speed:3,playerhit:0,flashsiner:0});rt.globals.turntimer=300;},
  user0:(s,rt)=>{if(gt(s.timer,0))return;s.timer=1;s.destroyable=0;s.depth-=40;create(s,rt,'obj_fadeout').imageBlend=C.white;},
  user5:(s,rt)=>{if(eq(s.destroyable,1)){s.playerhit=1;rt.userEvent(s,0);}},
  step:(s,rt)=>{if(!eq(s.timer,0))s.timer+=1;else if(eq(s.timer,0)&&lt(s.speed,3))s.speed+=0.25;
   if(gt(s.timer,60)){const d=create(s,rt,'obj_fadein',rt.view.x,rt.view.y);each(rt,'obj_fadeout',f=>rt.destroy(f));d.imageBlend=C.white;d.fadespeed=-0.01;
    if(s.playerhit)damageAll(s,rt);rt.globals.turntimer=1;rt.destroy(s);}},
  draw:(s,rt)=>{s.flashsiner+=1;rt.drawSelf(s);s.imageAngle+=10+s.timer*2;
   if(gt(s.timer,0)){rt.drawSprite('spr_sneo_bigcircle',0,s.x,s.y,s.imageXscale+s.timer*2,s.imageYscale+s.timer,0,C.white,1);
    rt.drawSprite('spr_pixel_white',0,rt.view.x-20,rt.view.y-20,220,220,0,C.white,clamp(s.timer/15,0,1));}
   rt.drawState.alpha=0.5;rt.drawState.color=C.white;s.i=Math.max(0,s.hp);
   while(lt(s.i,12)){const width=(eq((s.i-1)%3,0)?14:4)/2,angle=(Math.sin(s.i)+1)*180;
    rt.drawTriangle(s.x,s.y,lengthdirX(999,angle-width),lengthdirY(999,angle-width),lengthdirX(999,angle+width),lengthdirY(999,angle+width));s.i+=1;}
   rt.drawState.alpha=1;
  },
 },collisions:[{target:object('obj_yheart_shot'),run:(s,shot,rt)=>{if(eq(s.destroyable,1)){if(eq(shot.big,0)){s.hp-=1;s.speed=3;}else{s.hp-=3;s.speed=0;}
  if(le(s.hp,0)){rt.userEvent(s,0);snd(rt,'snd_badexplosion');s.speed=0;}else{s.timer=-1;snd(rt,'snd_damage');}}
  rt.userEvent(shot,0);
 }}]};
 const big:GmObjectDef={name:'obj_sneo_bigshot',index:638,parent:object('obj_collidebullet'),sprite:'spr_sneo_bigshot_s',depth:0,events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{element:6,destroyonhit:0,f:2,destroyable:1,angle_speed:0,destroypoints:1,attackisdone:0,damage:50,
   imageXscale:1,imageYscale:2,timer:0,playerhit:0,flashsiner:0,explosion_alpha:1,explosion_hide:0,xx:s.x,yy:s.y,grazepoints:4,timer2:0,explodesfx:0});
   s.depth=need(rt,'obj_heart').depth-5;proportionalStats(s,rt);},
  destroy:(s,rt)=>{const d=create(s,rt,'obj_fadein',rt.view.x,rt.view.y);each(rt,'obj_fadeout',f=>rt.destroy(f));d.imageBlend=C.white;d.fadespeed=-0.034;rt.globals.turntimer=1;
   each(rt,'obj_sneo_lastattack',i=>rt.destroy(i));each(rt,'obj_sneo_lastattack_hitbox',i=>rt.destroy(i));
   if(s.sprite==='spr_sneo_bigshot_l')each(rt,'obj_spamton_neo_enemy',n=>{const g=rt.globals;
    if(eq(g.monsterhp[n.myself],g.monstermaxhp[n.myself])&&lt(sideBPhase(rt),3)){need(rt,'obj_sneo_bulletcontroller').mercyaccumulated+=5;
     each(rt,'obj_spamton_neo_enemy',enemy=>{const w=rt.create(object('obj_dmgwriter'),g.monsterx[enemy.myself],g.monstery[enemy.myself]+20-g.hittarget[enemy.myself]*20);enemy.__mercydmgwriter=w.id;w.damage=5;w.type=5;g.hittarget[enemy.myself]+=1;});
    }else{g.monsterhp[0]-=Math.ceil(g.monstermaxhp[0]*0.05);if(lt(g.monsterhp[0],0))g.monsterhp[0]=1;}
   });},
  user0:(s,rt)=>{if(s.playerhit){if(gt(s.timer,0))return;s.timer=1;s.destroyable=0;s.attackisdone=1;s.depth-=40;s.hspeed=0;
   const l=need(rt,'obj_sneo_lastattack');void l.skip_2nd_part_hp;l.endattack=3;s.xx=s.x;s.yy=s.y;}},
  user5:(s,rt)=>{if(s.sprite==='spr_sneo_bigshot_l'){s.playerhit=1;rt.userEvent(s,0);each(rt,'obj_spamton_neo_enemy',n=>rt.userEvent(n,2));}
   else if(s.sprite==='spr_sneo_bigshot_s')enemyHit(s,rt);},
  step:(s,rt)=>{if(s.sprite==='spr_sneo_bigshot_l'){s.timer2+=1;const l=first(rt,'obj_sneo_lastattack');if(l)s.depth=lt(s.timer2,11)?l.depth+1:l.depth-1;
   if(lt(s.timer2,16)){s.imageXscale=lerp(0,2,s.timer2/15);s.imageYscale=lerp(0,2,s.timer2/15);}if(eq(s.timer2,15)){s.hspeed=-1;s.friction=-0.05;}
   s.x+=rt.random.randomRange(-1,1);s.y=s.ystart+rt.random.randomRange(-4,4);
   if(lt(s.x,rt.view.x+400)){rt.userEvent(s,0);s.playerhit=1;s.damage=0;if(l)l.endattack=2;}
  }else s.imageXscale=lerp(s.imageXscale,2,0.2);
   if(!eq(s.timer,0))s.timer+=1;if(gt(s.timer,13)){rt.create(object('obj_sneo_smoke'),rt.view.x+320,rt.view.y+240);rt.destroy(s);
    rt.sourceAudio?.volume('snd_rumble',0,70);each(rt,'obj_spamton_neo_enemy',n=>{n.stoprumblesfx=70;});}
  },
  draw:(s,rt)=>{if(eq(s.explosion_hide,0))rt.drawSelf(s);if(gt(s.timer,0)){const l=need(rt,'obj_sneo_lastattack');l.endattack=3;
   if(eq(l.endattack,2)){if(ge(s.timer,7))s.explosion_alpha-=0.1;rt.drawSprite('spr_pixel_white',0,rt.view.x-20,rt.view.y-20,220,220,0,C.white,clamp(s.timer/60,0,1));}
   else{if(eq(s.explodesfx,0)){s.explodesfx=1;rt.soundLoop?.('snd_rumble');snd(rt,'snd_explosion',1,0.6);}
    rt.drawSprite('spr_sneo_bigcircle',0,s.x-50,s.y,s.imageXscale+s.timer*2,s.imageYscale+s.timer,0,C.white,1);
    rt.drawSprite('spr_pixel_white',0,rt.view.x-20,rt.view.y-20,220,220,0,C.white,clamp(s.timer/12,0,1));}
  }},
 }};
 const bullet:GmObjectDef={name:'obj_sneo_finale_bullet',index:647,parent:finaleParent,sprite:'spr_sneo_crew_bullet',depth:0,events:{
  create:(s,rt)=>{finaleParent.events!.create!(s,rt);s.flashsiner=0;const n=first(rt,'obj_spamton_neo_enemy'),c=first(rt,'obj_sneo_bulletcontroller');
   if(n)s.damage=rt.globals.monsterat[n.myself]*5;if(c)s.target=c.target;s.grazepoints=4;},
  step:(s,rt)=>{if(ge(s.x,rt.room.width+100)||le(s.x,-100)||ge(s.y,rt.room.height+100)||le(s.y,-100))rt.destroy(s);s.imageAngle+=36;
   if(eq(s.destroyable,1)){s.flashsiner+=1;s.imageBlend=mergeColor(0xe8a200,C.aqua,0.25+Math.sin(s.flashsiner/3)*0.25);}},
 }};
 const spew:GmObjectDef={name:'obj_wreckpausespew',index:565,depth:0,events:{
  create:s=>{s.playback_sprite='spr_sneo_playback';s.imageSpeed=0;},draw:(s,rt)=>{rt.drawSprite(s.playback_sprite,s.imageIndex,rt.view.x+20,rt.view.y+400);},
 }};
 return [finaleParent,grow,warped,form,headHitbox,mouth,dollar,fake,last,lastHitbox,orb,big,bullet,spew];
}
