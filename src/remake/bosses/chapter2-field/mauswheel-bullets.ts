import {resolveEvent,type GmObjectDef} from '../../gm/runtime';
import {lengthdirX,lengthdirY,pointDirection,pointDistance} from '../../gm/math';
import {bulletInit} from '../../deltarune/battle';
import {bulletInherit2,snd} from '../../deltarune/chapter2-battle';
const ease=(x:number)=>x<0.5?2*x*x:(-2*x*x+4*x-1);
export function createMauswheelBullets(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const trail:GmObjectDef={...object('obj_maus_cursor_trail'),events:{create:s=>{bulletInit(s);Object.assign(s,{lifetime:6,damage:5,destroyonhit:0,grazepoints:0,timepoints:0});},step:(s,rt)=>{s.lifetime--;s.depth++;if(s.lifetime<0)rt.destroy(s);}}};
 const follow:GmObjectDef={...object('obj_maus_cursor_follow'),events:{
  create:(s,rt)=>{bulletInit(s);s.followindex=0;s.followindexmax=rt.exists(object('obj_mauswheel_enemy'))?25:33;s.heartposx=[];s.heartposy=[];const h=rt.first(object('obj_heart')),box=rt.first(object('obj_growtangle'));if(!h||!box)throw Error('Mauswheel cursor requires soul and arena');
   for(s.i=0;s.i<s.followindexmax+1;s.i++){s.heartposx[s.i]=h.x;s.heartposy[s.i]=h.y;}s.damage=6;s.timer=0;s.destroyonhit=0;s.trail=[];s.maxx=box.x+rt.spriteWidth(box)/1.3;s.maxy=box.y+rt.spriteHeight(box)/1.3;s.depth-=3;s.textflash=0;const w=rt.first(object('obj_mauswheel_enemy'));if(w){s.damage=rt.globals.monsterat[w.myself]*5;s.grazepoints=3;}},
  endStep:(s,rt)=>{s.followindex++;if(s.followindex>s.followindexmax)s.followindex=0;const limit=rt.exists(object('obj_mauswheel_enemy'))?35:s.followindexmax;s.timer++;if(s.timer<=limit){const t=ease(s.timer/limit);s.x=s.maxx+(s.heartposx[s.followindex]-s.maxx)*t;s.y=s.maxy+(s.heartposy[s.followindex]-s.maxy)*t;}else if(s.timer>s.followindexmax){s.x=s.heartposx[s.followindex];s.y=s.heartposy[s.followindex];}
   const h=rt.first(object('obj_heart'));if(!h)throw Error('Mauswheel cursor requires soul');s.heartposx[s.followindex]=h.x;s.heartposy[s.followindex]=h.y;const b=rt.create(trail,s.x,s.y);s.bul_trail=b.id;bulletInherit2(s,b);if(s.grazed!==-1)b.grazed=s.grazed;if(s.grazetimer!==-1)b.grazetimer=s.grazetimer;b.imageBlend=s.imageBlend;b.damage=s.damage;b.target=s.target;},
  draw:(s,rt)=>{const all=rt.all(trail);for(s.i=0;s.i<all.length;s.i++){const t=all[s.i];rt.drawSprite('spr_maus_cursor',0,t.x,t.y,1,1,s.imageAngle,t.imageBlend,1);}rt.drawSelf(s);rt.drawState.color=0xffffff;if(s.timer>=10&&s.timer<=70&&!rt.exists(object('obj_mauswheel_cursor'))){s.textflash++;if(s.textflash>2)s.textflash=0;}},
 }};
 const playerTrail:GmObjectDef={...object('obj_player_trail'),events:{
  create:s=>{s.type=1;s.depth+=4;s.cycleoffset=0;s.init=0;},
  draw:(s,rt)=>{const c=rt.first(follow);if(!c)throw Error('Player trail requires mouse cursor');if(s.type===0){for(s.i=0;s.i<25;s.i+=5){const alpha=s.i<c.followindex?(s.i+60-c.followindex)/60:(s.i-c.followindex)/60;rt.drawSprite('spr_maus_player_trail',0,c.heartposx[s.i],c.heartposy[s.i],1,1,0,0xffffff,alpha);}}
   if(s.type===1){rt.drawState.color=0x808080;for(s.i=0;s.i<26;s.i++)rt.drawLine(c.heartposx[s.i]+10,c.heartposy[s.i]+10,c.heartposx[s.i]+11,c.heartposy[s.i]+11,4);}},
 }};
 const ball:GmObjectDef={...object('obj_mauswheel_lightning_orb_ball'),events:{
  create:(s,rt)=>{resolveEvent(s.object.parent!,'create')?.(s,rt);s.siner=0;s.source=-1;s.imageXscale=0.6;s.imageYscale=0.6;},
  draw:(s,rt)=>{s.siner++;if(s.sprite)rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale+Math.sin(s.siner)*0.075,s.imageYscale+Math.sin(s.siner)*0.075,0,0xffffff,s.imageAlpha);},
 }};
 const orb:GmObjectDef={...object('obj_maushwheel_lightning_orb'),events:{
  create:(s,rt)=>{bulletInit(s);Object.assign(s,{imageSpeed:0.25,imageXscale:0.1,imageYscale:0.1,siner:0,timer:0,con:0,_pitch:1});const h=rt.first(object('obj_heart'));if(!h)throw Error('Mauswheel orb requires soul');s.depth=h.depth-100;
   snd(rt,'snd_sneo_overpower');rt.soundLoop?.('snd_sneo_overpower');rt.soundPitch?.('snd_sneo_overpower',s._pitch);rt.sourceAudio?.volume('snd_sneo_overpower',0,0);rt.sourceAudio?.volume('snd_sneo_overpower',2,6);
   s.destroyonhit=0;const w=rt.first(object('obj_mauswheel_enemy'));if(!w)throw Error('Mauswheel orb requires enemy');w.mytarget=s.target;s.grazepoints=16;s.damage=rt.globals.monsterat[w.myself]*5;s.goal=rt.random.choose(20,100);},
  destroy:(s,rt)=>{if(s.timer<24&&rt.sourceAudio?.playing('snd_sneo_overpower'))rt.soundStop?.('snd_sneo_overpower');},
  step:(s,rt)=>{const w=rt.first(object('obj_mauswheel_enemy')),h=rt.first(object('obj_heart')),b=rt.first(object('obj_growtangle'));if(!w||!h||!b)throw Error('Mauswheel orb requires battle owners');s.timer++;
   if(s.timer<24){w.imageSpeed+=0.08;s._pitch+=0.02;rt.soundPitch?.('snd_sneo_overpower',s._pitch);}
   if(s.timer>0&&s.timer<16){const d=rt.create(object('obj_rouxls_power_up_orb'),s.x,s.y);s.d=d.id;d.direction=rt.random.irandom(360);d.lifetime=12;d.depth=s.depth+1;d.imageBlend=s.imageBlend;}
   if(s.timer>0&&s.timer<24){s.imageXscale+=0.025;s.imageYscale+=0.025;}
   if(s.timer===24){s.setMotion(pointDirection(s.x,s.y,s.goal===100?(h.x+b.x)/2:h.x,s.goal===100?(h.y+b.y)/2:h.y),s.goal===100?4.5:5);const offset=rt.random.irandom(360);
    for(const angle of [offset,offset+120,offset-120]){const d=rt.create(ball,s.x+lengthdirX(8,angle),s.y+lengthdirY(8,angle));bulletInherit2(s,d);d.source=s.id;}
    s.active=false;s.visible=false;s.mask='spr_nothing';const l=rt.create(object('obj_lerpvar'),0,0);s.__lerpvar=l.id;Object.assign(l,{target:w.id,varname:'image_speed',pointa:w.imageSpeed,pointb:0.5,maxtime:8});rt.soundStop?.('snd_sneo_overpower');snd(rt,'snd_chargeshot_fire');for(const d of rt.all(object('obj_rouxls_power_up_orb')))rt.destroy(d);
   }
   if(s.timer>24){let goal=s.goal;if(s.x<b.x-160)goal=8;for(const d of rt.all(ball)){if(d.source!==s.id)continue;d.x+=s.hspeed;d.y+=s.vspeed;const angle=pointDirection(s.x,s.y,d.x,d.y),distance=d.siner>4?pointDistance(d.x,d.y,s.x,s.y):8,delta=Math.abs(goal-distance)*0.03,next=distance<goal?Math.min(distance+delta,goal):Math.max(distance-delta,goal);d.x=s.x+lengthdirX(next,angle+(1-distance/150)*6);d.y=s.y+lengthdirY(next,angle+(1-distance/150)*6);}}
   if(s.x<rt.view.x-60){for(const d of rt.all(ball))if(d.source===s.id)rt.destroy(d);rt.destroy(s);}
  },
  draw:(s,rt)=>{s.siner++;if(s.sprite)rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale+Math.sin(s.siner)/10,s.imageYscale+Math.sin(s.siner)/10,0,0xffffff,s.imageAlpha);},
 }};
 const memory:GmObjectDef={...object('obj_mauswheel_cursor_memory'),events:{create:s=>{s.index=0;s.addIndex=0;s.xtrail=[0];s.ytrail=[0];s.recording=false;},step:(s,rt)=>{if(!s.recording)return;if(rt.globals.turntimer<=0){s.recording=false;s.addIndex=0;return;}const h=rt.first(object('obj_heart'));if(!h)throw Error('Mauswheel recording requires soul');if(!('xpos' in s))s.xpos=[];if(!('ypos' in s))s.ypos=[];s.xpos[s.addIndex]=h.x;s.ypos[s.addIndex]=h.y;s.addIndex++;},beginStep:(s,rt)=>{if(!rt.exists(object('obj_mauswheel_enemy')))rt.destroy(s);}}};
 return [trail,follow,playerTrail,ball,orb,memory];
}
