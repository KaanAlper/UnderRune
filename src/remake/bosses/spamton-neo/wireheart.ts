// NEO's heart attack: obj_sneo_wireheart (a heart on a wire that darts out and back, firing diamond spreads; type 1
// aims at the soul, type 3 bites and fires a laser, type 4 is a bomb), and its pieces: obj_sneo_heart_laser (the
// warning that becomes obj_queen_laser), obj_sneo_heart_bomb_explode (the bomb's burst of obj_sneo_heatattack_bullet)
// and obj_rouxls_power_up_orb (the sparks drawn into the laser; its Draw runs its logic).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,ge,gt,le,lengthdirX,lengthdirY,lt,pointDirection} from '../../gm/math';
import {bulletInit,marker} from '../../deltarune/battle';
import {gmlScript,scriptDelayedOn} from '../../deltarune/chapter2-battle';
import {sideBPhase} from '../../deltarune/chapter2';
import {easeIn,lerpEaseIn,lerpEaseOut} from '../../deltarune/ease';
import {snd} from '../../deltarune/sound';
import {scrAfterimageCut,scrDoom,scrLerpvar} from './support';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

export function createNeoWireHeart(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const neo=(rt:GmRuntime)=>rt.first(object('obj_spamton_neo_enemy'));
 const controller=(rt:GmRuntime)=>rt.first(object('obj_sneo_bulletcontroller'));
 // The delayed scripts the cut wire runs on its pieces (scr_script_delayed).
 const afterimageCutLater=gmlScript('scr_afterimage_cut',(t,rt)=>{scrAfterimageCut(t,rt,object);});
 const sndPlayLater=gmlScript('snd_play',(_t,rt,name:string)=>{snd(rt,name);});
 const sndVolumeLater=gmlScript('snd_volume',(_t,rt,name:string,volume:number,time:number)=>{rt.sourceAudio?.volume(name,volume,time);});

 /** A diamond bullet of the spreads: an obj_collidebullet made a bullet by scr_bullet_init. */
 const diamond=(s:GmInstance,rt:GmRuntime)=>{
  const r=rt.create(object('obj_collidebullet'),s.x,s.y);s.radialshot=r.id;bulletInit(r);r.sprite='spr_diamondbullet';return r;
 };
 /** The heart is cut: it bursts (or explodes as a bomb), its wire falls apart, and a normal heart's cut costs NEO. */
 const cut=(s:GmInstance,rt:GmRuntime)=>{
  const g=rt.globals;
  snd(rt,'snd_bomb');
  if(s.type===4&&gt(g.turntimer,20)){const b=rt.create(bombExplode,s.x,s.y);s.bomb=b.id;b.depth=s.depth-2;}
  else scrAfterimageCut(s,rt,object);
  for(s.i=10;s.i>=0;s.i-=1){
   const piece=rt.create(marker,lerp(s.x,s.rembossx,s.i/9),lerp(s.y,s.rembossy,s.i/9));s.thismarker=piece.id;piece.sprite='spr_sneo_wireheart';piece.imageSpeed=0;
   s.piece=piece.id;piece.imageIndex=4;piece.i=s.i;piece.depth=s.depth+1;
   scriptDelayedOn(piece,rt,afterimageCutLater,piece.i*2);
   scriptDelayedOn(piece,rt,sndPlayLater,piece.i*2,'snd_bomb');
   scriptDelayedOn(piece,rt,sndVolumeLater,piece.i*2,'snd_bomb',0.5,0);
   scrDoom(rt,object,piece.id,piece.i*2+1);
  }
  const n=neo(rt)!;
  if(s.altbiter===1||s.altbiter===2)n.makeheartalt=s.altbiter+2;
  if(s.type===0||(s.type===1&&n.difficulty>2)){
   for(const e of rt.all(object('obj_spamton_neo_enemy'))){
    if(g.monsterhp[e.myself]===g.monstermaxhp[e.myself]&&sideBPhase(rt)<3){
     controller(rt)!.mercyaccumulated+=3;
     for(const e2 of rt.all(object('obj_spamton_neo_enemy'))){
      const w=rt.create(object('obj_dmgwriter'),g.monsterx[e2.myself],g.monstery[e2.myself]+20-g.hittarget[e2.myself]*20);e2.__mercydmgwriter=w.id;
      w.damage=3;w.type=5;g.hittarget[e2.myself]+=1;
     }
    }else{
     g.monsterhp[0]-=Math.ceil(g.monstermaxhp[0]*0.03);
     if(g.monsterhp[0]<0)g.monsterhp[0]=1;
    }
   }
  }
  rt.destroy(s);
 };
 /** Shots after the turn's last 150 frames end the attack: the turn drops to 20 and every heart is cut. */
 const endTurn=(s:GmInstance,rt:GmRuntime)=>{
  s.hp=0;
  if(s.type===0||(s.type===1&&neo(rt)!.difficulty>2&&gt(rt.globals.turntimer,20))){
   rt.globals.turntimer=20;
   for(const w of rt.all(wireheart)){w.hp=0;w.destroyed=1;}
  }
 };
 /** A normal heart (or a type-1 heart on difficulty 3+) takes turn time instead of HP. */
 const takesTime=(s:GmInstance,rt:GmRuntime)=>s.type===0||(s.type===1&&neo(rt)!.difficulty>2);

 const wireheart:GmObjectDef={name:'obj_sneo_wireheart',index:640,parent:object('obj_basicbullet_sneo'),sprite:'spr_sneo_wireheart',depth:0,
  events:{
   create:(s,rt)=>{
    bulletInit(s);
    Object.assign(s,{element:6,hp:300,damagetimer:0,defeated:0,active:1,destroyonhit:0,target:0,damage:1,animtimer:0,firedtimer:0,destroyed:0,
     rembossx:0,rembossy:0,invincibility_timer:2,chargeshothitcount:0,normalshothitcount:0,imageXscale:0,imageYscale:0,bossx:s.xstart,bossy:s.ystart,
     boss:-1,imageIndex:0,imageSpeed:0,init:0,con:1,timer:0,moveframes:30,targetx:0,type:0,shottype:0,bighearttype:0,special:0,preset:-1,altbiter:1});
    s.hpos=5+rt.random.random(1.5);
   },
   step:(s,rt)=>{
    const R=rt.random,v=rt.view;
    if(s.init===0){
     Object.assign(s,{imageXscale:0.5,imageYscale:0.5,destroyed:0,shotcount:0,bouncecount:0,shottype:0,shottimer:0,init:1,con:1});
     const boss=rt.byId(s.boss);
     if(boss){s.rembossx=boss.x;s.rembossy=boss.y;}else{s.rembossx=s.bossx;s.rembossy=s.bossy;}
     let xscale=1,yscale=1;
     if(s.type===1){xscale=1;yscale=1;s.sprite='spr_sneo_wireheart_smaller';s.moveframes*=0.8;s.hp=10;}
     scrLerpvar(s,rt,object,'image_xscale',0.5,xscale,20,-1,'out');
     scrLerpvar(s,rt,object,'image_yscale',0.5,yscale,20,-1,'out');
     if(s.type===3){s.sprite='spr_sneo_wireheart_biter';s.hp=3;s.moveframes=12;}
     if(s.type===4){s.sprite='spr_sneo_wireheart_bomb';s.hp=1;}
    }
    if(s.con===1){
     if(s.bighearttype===1)s.moveframes=16;
     s.targetx=v.x+300+R.random(70);
     s.targety=v.y+145+R.randomRange(-70,70);
     if(s.type===3){
      if(s.altbiter>0&&s.altbiter<3){s.targetx=v.x+150;s.targety=s.altbiter===1?v.y+240:v.y+75;}
      else{s.targetx=v.x+170+R.random(70);s.targety=v.y+145+R.randomRange(-60,60);}
      if(s.altbiter===3){s.targetx=v.x+350;s.targety=v.y+130+R.randomRange(-45,0);}
      if(s.altbiter===4){s.targetx=v.x+350;s.targety=v.y+160+R.randomRange(45,0);}
     }
     const heart=rt.first(object('obj_heart'));
     if(heart&&controller(rt)!.hearttargettimer<1&&s.type!==3){
      if(R.choose(0,1,2)===0){s.targety=heart.y+10;controller(rt)!.hearttargettimer=6;}
     }
     s.movetimer=0;s.con=2;
     if(s.type===0||s.type===1){const boss=rt.byId(s.boss);if(boss)boss.heart_release_con=1;}
    }
    if(s.con===2){
     s.movetimer+=1/s.moveframes;
     s.x=lerpEaseOut(s.bossx,s.targetx,s.movetimer,2);s.y=lerpEaseOut(s.bossy,s.targety,s.movetimer,2);
     if(ge(s.movetimer,1)){s.movetimer=0;s.con=3;}
    }
    if(s.con===3){
     if(s.type===3&&s.altbiter>0&&s.altbiter<3){
      s.movetimer+=1;
      if(s.altbiter===1)s.y=lerp(v.y+240,v.y+75,s.movetimer/21);
      if(s.altbiter===2)s.y=lerp(v.y+75,v.y+240,s.movetimer/21);
      if(ge(s.movetimer,20)){s.movetimer=0;s.con=10;s.targety=s.y;}
     }
     if(s.type===3&&s.altbiter>2){
      s.movetimer+=1;
      if(s.movetimer===1)rt.create(heartLaser,s.x,s.y);
      if(ge(s.movetimer,16)){s.movetimer=0;s.con=10;}
     }else{s.con=10;s.movetimer=0;}
    }
    if(s.con===10){
     s.movetimer+=1/s.moveframes;
     s.x=lerpEaseIn(s.targetx,s.bossx,s.movetimer,2);s.y=lerpEaseIn(s.targety,s.bossy,s.movetimer,2);
     if((gt(s.movetimer,0.5)&&s.type===0)||(gt(s.movetimer,0.5)&&s.type===1&&neo(rt)!.difficulty>2)){const boss=rt.byId(s.boss);if(boss)boss.heart_release_con=0;}
     if(ge(s.movetimer,1)){s.movetimer=0;s.shottimer=0;s.con=1;}
    }
    if(s.con===2||s.con===3||s.con===10){
     const radial=5;
     // It fires only near the far end of its dart.
     if(lt(Math.abs((s.x-s.targetx)/(s.targetx-s.bossx)),0.2)){
      s.shottimer-=1;
      if(le(s.shottimer,0)){
       if(s.type===0){
        s.firedtimer=4;
        let dir=0;
        const box=rt.first(object('obj_growtangle'));
        if(s.bighearttype===1&&lt(s.y,box!.y))dir=25+R.random(10);
        if(s.bighearttype===1&&gt(s.y,box!.y))dir=R.random(10)*-1-25;
        for(s.i=0;s.i<radial;s.i+=1){
         const r=diamond(s,rt);
         r.direction=s.i/radial*180+110+dir;
         if(s.special===1)r.direction+=R.randomRange(-10,10);
         r.imageAngle=r.direction;r.active=1;r.speed=1;r.friction=-0.3;
         if(s.bighearttype===1){r.speed=1;r.friction=-0.23;}
         r.depth=s.depth-1;r.target=s.target;r.damage=s.damage;r.grazed=0;r.element=6;
         if(neo(rt)!.difficulty===0)r.grazepoints=3;
         if(neo(rt)!.difficulty===2)r.grazepoints=2;
        }
        s.shottimer=10;if(s.bighearttype===1)s.shottimer=6;
       }else if(s.type===1){
        s.firedtimer=4;
        const heart=rt.first(object('obj_heart'))!;
        for(s.i=0;s.i<radial;s.i+=1){
         const r=diamond(s,rt);
         r.direction=pointDirection(r.x,r.y,heart.x+10,heart.y+10);r.imageAngle=r.direction;r.imageXscale=0.5;r.imageYscale=0.5;
         r.active=1;r.speed=3;r.friction=-0.2;r.depth=s.depth-1;r.target=s.target;r.damage=s.damage;r.grazed=0;r.element=6;
        }
        s.shottimer=6;
       }
      }
     }
    }
   },
   draw:(s,rt)=>{
    const boss=rt.byId(s.boss);
    if(boss){
     let xx=50-boss.heart_release_con*100;
     if(lt(rt.globals.turntimer,20))xx=0;
     s.rembossx=lerp(s.rembossx,boss.x+xx,0.16);s.rembossy=boss.y+80;
    }
    if(s.destroyed===1)s.invincibility_timer=0;
    let hidesprite=0;
    if(s.invincibility_timer>0){
     if([10,9,6,5,3,2].includes(s.invincibility_timer))hidesprite=1;
     s.invincibility_timer-=1;
    }
    if(hidesprite===0){
     // The wire: a chain of links from the heart back to NEO (a biter's is shorter and sags).
     if(s.type===3&&s.altbiter>0&&s.altbiter<3){
      const along=s.altbiter===1?5:6;
      for(s.i=6;s.i>=0;s.i-=1)rt.drawSprite('spr_sneo_wireheart',5,lerp(s.x,s.rembossx,s.i/along),lerp(s.y,s.rembossy,s.i/s.hpos),0.75,0.75,0,s.imageBlend,s.imageAlpha);
     }else for(s.i=10;s.i>=0;s.i-=1)rt.drawSprite('spr_sneo_wireheart',4,lerp(s.x,s.rembossx,s.i/9),lerp(s.y,s.rembossy,s.i/9),s.imageXscale,s.imageYscale,0,s.imageBlend,s.imageAlpha);
     s.animtimer+=1;s.firedtimer-=1;s.imageIndex=0;
     if(s.animtimer>=5)s.imageIndex=1;
     if(s.animtimer>=10)s.animtimer=0;
     if(s.firedtimer>4)s.imageIndex=3;
     rt.drawSelf(s);
     if(s.damagetimer>0){rt.drawSprite(s.sprite,2,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.damagetimer/5);s.damagetimer-=1;}
    }
    if(s.destroyed===1)cut(s,rt);
   },
  },
  collisions:[
   {target:object('obj_yheart_shot'),run:(s,shot,rt)=>{
    const g=rt.globals;
    if(s.invincibility_timer>0&&shot.big===0){rt.destroy(shot);return;}
    s.invincibility_timer=10;
    if(lt(g.turntimer,150))endTurn(s,rt);
    else if(takesTime(s,rt)){
     if(shot.big===1){g.turntimer-=80-s.chargeshothitcount*10;if(s.chargeshothitcount<3)s.chargeshothitcount+=1;}
     else{g.turntimer-=20-s.normalshothitcount;if(s.normalshothitcount<10)s.normalshothitcount+=1;}
    }else if(shot.big===1)s.hp-=5;
    else s.hp-=1;
    rt.destroy(shot);
    s.damagetimer=5;snd(rt,'snd_damage');
    if(le(s.hp,0))s.destroyed=1;
   }},
   // Ralsei's tiny self (his ACT) rams it.
   {target:object('obj_sneo_tiny_ralsei'),run:(s,other,rt)=>{
    const g=rt.globals;
    if(other.active===0||s.invincibility_timer>0)return;
    s.invincibility_timer=10;
    if(lt(g.turntimer,150))endTurn(s,rt);
    else if(takesTime(s,rt))g.turntimer-=80;
    else{s.hp-=5;other.hp-=10;other.alarm[0]=10;if(!(rt.sourceAudio?.playing('snd_hurt1')??false))snd(rt,'snd_hurt1');}
    s.damagetimer=5;snd(rt,'snd_damage');
    if(le(s.hp,0))s.destroyed=1;
   }},
   // Susie's tiny axe (her ACT) chops it.
   {target:object('obj_sneo_tiny_susie_axe'),run:(s,axe,rt)=>{
    const g=rt.globals;
    if(lt(g.turntimer,150))endTurn(s,rt);
    else if(takesTime(s,rt))g.turntimer-=5;
    else s.hp-=0.25;
    rt.destroy(axe);
    s.damagetimer=5;snd(rt,'snd_damage');
    if(le(s.hp,0))s.destroyed=1;
   }},
  ],
 };

 const heartLaser:GmObjectDef={name:'obj_sneo_heart_laser',index:245,sprite:'spr_sneo_bullet1',depth:0,events:{
  create:(s,rt)=>{
   Object.assign(s,{timer:0,siner:0,con:0,con2:0});bulletInit(s);
   s.imageSpeed=0.25;s.imageXscale=0.1;s.imageYscale=0.1;s.destroyonhit=0;
   const heart=rt.first(object('obj_heart'))!;
   s.imageAngle=pointDirection(s.x,s.y,heart.x+10,heart.y+10)+rt.random.randomRange(-20,20);
  },
  step:(s,rt)=>{
   s.timer+=1;
   if(s.timer>0&&s.timer<8){
    const d=rt.create(powerUpOrb,s.x,s.y);s.d=d.id;d.direction=rt.random.irandom(360);d.lifetime=12;d.depth=s.depth+1;d.imageBlend=s.imageBlend;
   }
   if(s.timer>0&&s.timer<14){s.imageXscale+=0.025;s.imageYscale+=0.025;}
   if(s.timer===14){
    snd(rt,'snd_wallclaw');
    const l=rt.create(queenLaser,s.x,s.y);s.laser=l.id;l.imageAngle=s.imageAngle;l.direction=s.imageAngle;l.imageYscale=1;
    rt.destroy(s);
   }
  },
  draw:(s,rt)=>{
   rt.drawState.color=C.red;
   rt.drawSprite('spr_lasergun_laser_telegraph',0,s.x,s.y,999,0.7,s.imageAngle,C.white,0.3);
   s.siner+=1;
   rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale+Math.sin(s.siner)/20,s.imageYscale+Math.sin(s.siner)/20,0,C.white,s.imageAlpha);
  },
 }};

 const queenLaser:GmObjectDef={name:'obj_queen_laser',index:561,parent:object('obj_collidebullet'),sprite:'spr_lasergun_laser',depth:0,events:{
  create:(s,rt)=>{
   bulletInit(s);s.destroyonhit=1;s.timer=0;s.imageXscale=0;s.imageYscale=1;s.active=1;
   const q=rt.first(object('obj_queen_enemy'));if(q)s.damage=rt.globals.monsterat[q.myself]*5;
   const qc=rt.first(object('obj_queen_bulletcontroller'));if(qc)s.target=qc.target;
   s.grazepoints=4;
  },
  step:(s,rt)=>{
   if(lt(s.imageXscale,10))s.imageXscale+=0.5;
   if(ge(s.imageXscale,6)){
    s.speed+=4;
    if(ge(s.speed,20)){
     s.active=0;
     if(ge(s.imageYscale,1))s.imageYscale+=0.2;
     s.imageAlpha-=0.2;
     if(le(s.imageAlpha,0))rt.destroy(s);
    }
   }
  },
 }};

 const bombExplode:GmObjectDef={name:'obj_sneo_heart_bomb_explode',index:641,sprite:'spr_sneo_wireheart_bomb',depth:0,events:{
  create:s=>{Object.assign(s,{timer:0,con:0,siner:0,target:0,damage:0,imageSpeed:0,imageIndex:1});},
  step:(s,rt)=>{
   s.timer+=1;
   if(s.timer===3&&s.imageIndex===0){s.imageIndex=1;s.timer=0;}
   else if(s.timer===3&&s.imageIndex===1){s.imageIndex=0;s.timer=0;}
   s.siner+=4;
   s.imageXscale=2+Math.sin(s.siner/6)*0.5;s.imageYscale=2+Math.sin(s.siner/6)*0.5;
   if(eq(s.siner,96)){
    snd(rt,'snd_rocket');
    let a=rt.random.random(44);
    for(let n=0;n<8;n++){
     for(const [offset,friction] of [[0,-0.34],[10,-0.1]] as const){
      const r=rt.create(heatBullet,s.x,s.y);s.radialshot=r.id;bulletInit(r);
      r.sprite='spr_diamondbullet';r.direction=a+offset;r.imageAngle=a+offset;r.active=1;r.speed=1;r.friction=friction;
      r.depth=s.depth-1;r.target=s.target;r.damage=s.damage;r.grazed=0;r.newtype=1;r.element=6;
     }
     a+=45;
    }
    rt.destroy(s);
   }
  },
 }};

 const heatBullet:GmObjectDef={name:'obj_sneo_heatattack_bullet',index:615,parent:object('obj_basicbullet_sneo'),sprite:'spr_neo_heart_bullet',depth:0,events:{
  create:(s,rt)=>{
   bulletInit(s);Object.assign(s,{element:6,f:1,destroyable:0,angle_speed:0,destroypoints:1,dir:0});
   const n=neo(rt);if(n)s.damage=rt.globals.monsterat[n.myself]*5;
   const c=controller(rt);if(c)s.target=c.target;
   s.grazepoints=2;s.newtype=0;s.timer=0;
  },
  step:(s,rt)=>{
   s.imageAngle=s.dir;s.f+=1.4;s.x+=lengthdirX(s.f,s.dir);s.y+=lengthdirY(s.f,s.dir);
   if(lt(rt.globals.turntimer,1))rt.destroy(s);
  },
  // Its event 0 holds a copy of the wall attack's pattern table and is never called.
  user0:()=>{throw Error('obj_sneo_heatattack_bullet event 0 is not used by the game');},
 }};

 const powerUpOrb:GmObjectDef={name:'obj_rouxls_power_up_orb',index:758,sprite:'spr_bullet_laser_circle',depth:0,events:{
  create:s=>{
   Object.assign(s,{init:0,imageAlpha:0,lifetime:30,xx:s.x,yy:s.y,timer:0,radius:5,parenttarget:-1,thin:0,_type:0,track_target:-4,xoff:0,yoff:0,max_radius:6,distance_multiplier:1});
  },
  draw:(s,rt)=>{
   if(s.parenttarget!==-1&&!rt.byId(s.parenttarget)){rt.destroy(s);return;}
   const parent=s.parenttarget!==-1?rt.byId(s.parenttarget):undefined;
   if(parent){s.xstart=parent.x;s.ystart=parent.y;}
   if(s.init===0){
    s.init=1;
    if(s.thin)s.lifetime/=2;
    if(s.track_target!==-4){s.xstart=0;s.ystart=0;}
    let distance=rt.random.randomRange(70,90)*s.distance_multiplier;
    if(s._type===1)distance=rt.random.randomRange(40,45);
    s.xx=s.xstart+lengthdirX(distance,s.direction);s.x=s.xx;
    s.yy=s.ystart+lengthdirY(distance,s.direction);s.y=s.yy;
   }
   if(s.track_target!==-4){const t=rt.byId(s.track_target)!;s.xoff=t.x;s.yoff=t.y;}
   s.timer+=1;
   if(gt(s.timer,s.lifetime)){rt.destroy(s);return;}
   const progress=s.timer/s.lifetime,d=rt.drawState;
   s.imageAlpha=1;
   if(s.thin){
    s.imageBlend=C.white;s.imageYscale=0.25;s.imageAngle=s.direction;rt.drawSelf(s);
    s.x=lerp(s.xx,s.xstart,easeIn(progress,2))+s.xoff;s.y=lerp(s.yy,s.ystart,easeIn(progress,2))+s.yoff;
   }else{
    const drawalpha=d.alpha;
    d.color=s.imageBlend;rt.drawCircle(s.x,s.y,s.radius-2,false);
    d.alpha=s.imageAlpha;
    s.x=lerp(s.xx,s.xstart,easeIn(progress,2))+s.xoff;s.y=lerp(s.yy,s.ystart,easeIn(progress,2))+s.yoff;
    rt.drawCircle(s.x,s.y,s.radius,false);
    if(gt(s.radius-3,0)){d.color=C.white;rt.drawCircle(s.x,s.y,s.radius-2,false);}
    d.alpha=drawalpha;
    s.radius=lerp(s.max_radius,1,progress);
   }
  },
 }};
 return [wireheart,heartLaser,queenLaser,bombExplode,heatBullet,powerUpOrb];
}
