// Clover (obj_clubsenemy, encounter 8) and her attacks: clubs from the sides that split on the box, and dark clubs
// that stop near the soul and fire volleys.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY,ge,le} from '../../gm/math';
import {battleSolid,bulletGenParent,bulletParent,growtangle,heart,monsterParent,regularBullet} from '../../deltarune/battle';
import {attackPhase} from '../../deltarune/controller';
import {defineEnemy} from '../../deltarune/enemy';
import {defeatRun} from '../../deltarune/party';
import {battleText,battleTextDefault,enemyBalloon,writer} from '../../deltarune/writer';
import {optionalSourceText as lang} from '../../host/text';
import {clubsBulletDark} from '../jevil/bullets';
export {clubsBulletDark} from '../jevil/bullets';
/** Native obj_clubsbullet has no Create/Step event: it only splits when it hits the arena. */
export const clubsBullet:GmObjectDef={name:'obj_clubsbullet',index:235,depth:-20,parent:bulletParent,sprite:'spr_clubsbullet',collisions:[{target:battleSolid,run:(s,_other,rt)=>{
 for(const [sprite,offset,slow] of [['spr_clubsball_b',0,6],['spr_clubsball_c',-25,8],['spr_clubsball_a',25,8]] as const){
  const b=rt.create(regularBullet,s.x,s.y);s.bul=b.id;
  if(!b.live)continue;
  b.sprite=sprite;b.direction=s.direction+offset;b.speed=s.speed-slow;b.imageAngle=s.imageAngle;
  b.damage=s.damage;b.target=s.target;b.grazepoints=3;b.timepoints=2;
 }
 rt.destroy(s);
}}]};

/** Native controller Create, and its Clover-only type 2/3/4 Step branches. */
export const cloverBulletController:GmObjectDef={name:'obj_dbulletcontroller',index:241,parent:bulletGenParent,sprite:'spr_grazemask',visible:false,events:{
 create:(s,rt)=>{
  Object.assign(s,{btimer:99,timermax:12,difficulty:1,type:1,joker:0,side:1,damage:100,grazepoints:1,timepoints:1,inv:60,grazed:0,grazetimer:0,target:0,made:0,special:0,miny:150,maxy:280,ratio:1});
  const box=rt.first(growtangle);if(box){s.miny=box.y-rt.spriteHeight(box)/2;s.maxy=box.y+rt.spriteHeight(box)/2;}
  const m=rt.globals.monster,pop=m[0]+m[1]+m[2];if(pop===2)s.ratio=1.6;if(pop===3)s.ratio=2.3;
 },
 step:(s,rt)=>{
  s.btimer++;
  if(s.type===2){
   if(!ge(s.btimer,20*s.ratio))return;
   s.xx=rt.view.x+(s.side===1?660:-20);s.yy=s.miny+rt.random.random(s.maxy-s.miny);
   const b=rt.create(clubsBullet,s.xx,s.yy);s.bul=b.id;b.speed=12;b.damage=s.damage;b.target=s.target;
   if(s.side===1){b.direction=180;b.imageAngle=180;}s.btimer=0;
  }else if(s.type===3||s.type===4){
   if(!ge(s.btimer,(s.type===3?20:30)*s.ratio))return;s.btimer=0;
   if(s.type===3)s.dir=s.side===1?rt.random.choose(225,315):rt.random.choose(45,135);
   else s.dir=s.side===-1?225:315;
   s.radius=400;s.xx=lengthdirX(s.radius,s.dir);s.yy=lengthdirY(s.radius,s.dir);
   const h=rt.first(heart);if(!h)throw Error('Clover dark attack requires obj_heart');
   const d=rt.create(clubsBulletDark,h.x+8+s.xx,h.y+8+s.yy);s.d=d.id;
   d.damage=s.damage;d.target=s.target;d.direction=s.dir+180;d.speed=20;d.friction=1;d.imageAngle=d.direction;
   s.side=s.side===1?-1:1;
  }else throw Error(`Unsupported Clover controller type ${s.type}`);
 },
}};

const text=(line:number)=>lang(`obj_clubsenemy_slash_Step_0_gml_${line}_0`);
const message=(rt:GmRuntime,line:number)=>{rt.globals.msg[0]=text(line);};
/** Her three heads speak at once: three balloons, one per head. */
function speech(s:GmInstance,rt:GmRuntime,first:number){
 s.text1=text(first);s.text2=text(first+1);s.text3=text(first+2);
 for(const [key,dx,dy,face] of [['text1',-110,-10,4],['text2',-125,70,5],['text3',125,-10,6]] as const){rt.globals.msg[0]=s[key];enemyBalloon(rt,s.x+dx,s.y+dy,face);}
}
function create(s:GmInstance){
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:150,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,tired:0,manual:0,attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,mytarget:3,imageSpeed:0,betray:0,argue:0,imageXscale:2,imageYscale:2,idlesprite:'spr_clubs_idle',hurtsprite:'spr_clubs_hurt',sparedsprite:'spr_clubs_spared',acted:[0,0,0,0,0,0]});
}
/** Their line (a random one, or about the last ACT, or the manual), and everyone's balloons stay longer. */
function talk(s:GmInstance,rt:GmRuntime){
 rt.globals.typer=50;s.rr=rt.random.choose(0,1,2);
 let line=[17,24,31][s.rr];if(s.acting>=2&&s.acting<=6)line=[39,46,53,60,68][s.acting-2];if(s.manual===1)line=76;
 speech(s,rt,line);for(const m of rt.all(monsterParent))m.talkmax=210;s.manual=0;
}
/** Clubs from the sides, or the dark clubs from the corners. */
function attack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 s.rr=rt.random.choose(0,1);const c=rt.create(cloverBulletController,s.x,s.y);s.dc=c.id;c.type=s.rr===0?2:4;c.target=s.mytarget;c.damage=g.monsterat[s.myself]*5;
 g.turntimer=150;
}
function statusLine(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 s.rr=rt.random.choose(0,1,2,3,4,5);g.battlemsg[0]=text(134+s.rr);
 if(g.monsterstatus[me]===1)g.battlemsg[0]=text(140);
 if(le(g.monsterhp[me],g.monstermaxhp[me]/3))g.battlemsg[0]=text(141);
 if(ge(g.mercymod[me],g.mercymax[me]))g.msg[0]=text(142);
 if(s.betray===1)g.battlemsg[0]=text(143);s.betray=0;
}
function acts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;message(rt,163);battleTextDefault(rt);}
 // Each stage is a separate source if: a synchronously completed writer can advance again this frame.
 for(const [act,start,line,reply,end,topic] of [[2,20,187,196,210,-1],[3,22,223,233,247,2],[4,24,258,268,282,3]] as const){
  if(s.acting===act&&s.actcon===0){g.typer=45;g.fc=2;g.fe=0;message(rt,line);s.argue++;battleText(rt);s.actcon=start;}
  if(s.actcon===start&&!rt.exists(writer)){g.typer=50;if(topic>=0&&s.acted[topic]===0){g.mercymod[s.myself]+=40;s.acted[topic]=1;}speech(s,rt,reply);s.actcon=start+1;}
  if(s.actcon===start+1&&!rt.exists(writer)){message(rt,end);battleTextDefault(rt);s.actcon=1;}
 }
 if(s.acting===5&&s.actcon===0){message(rt,290);g.msg[1]=text(291);s.argue++;battleTextDefault(rt);s.actcon=1;}
 if(s.acting===6&&s.actcon===0){if(s.acted[5]===0){g.mercymod[s.myself]+=40;s.acted[5]=1;}message(rt,301);s.argue++;battleTextDefault(rt);s.actcon=1;}
}
/** After three disagreements Clover is tired (can be pacified). */
function actsDone(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.actcon===1&&!rt.exists(writer)){if(s.argue>=3){g.monstercomment[s.myself]=text(314);g.monsterstatus[s.myself]=1;}s.actcon=0;attackPhase(rt);}
}
function draw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.state===3){
  if(le(g.monsterhp[s.myself],g.monstermaxhp[s.myself]/2)){g.monsterstatus[s.myself]=1;if(g.monstercomment[s.myself]===' ')g.monstercomment[s.myself]=lang('obj_clubsenemy_slash_Draw_0_gml_6_0');}
  s.hurttimer--;
  if(s.hurttimer<0)s.state=0;
  else{if(g.monster[s.myself]===0){g.flag[522]++;defeatRun(s,rt);}s.hurtshake++;if(s.hurtshake>1){if(s.shakex>0)s.shakex--;if(s.shakex<0)s.shakex++;s.shakex=-s.shakex;s.hurtshake=0;}rt.drawSprite('spr_clubs_hurt',0,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);}
 }
 if(s.state===0){s.siner++;s.thissprite=ge(g.mercymod[s.myself],g.mercymax[s.myself])?'spr_clubs_spared':'spr_clubs_idle';rt.drawSprite(s.thissprite,s.siner/6,s.x,s.y,2,2,0,s.imageBlend,1);if(s.flash===1){s.fsiner++;rt.drawSpriteFog(s.thissprite,s.siner/6,s.x,s.y,2,2,0,0xffffff,-Math.cos(s.fsiner/5)*.4+.6);}}
 if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
}
/** Clover (obj_clubsenemy): the standard enemy (deltarune/enemy.ts) with these steps of her own. */
export const cloverEnemy:GmObjectDef=defineEnemy({name:'obj_clubsenemy',index:293,depth:90,sprite:'spr_clubs_idle'},{
 create,talk,attack,
 attackWait:(_s,rt)=>{rt.globals.turntimer=150;},
 statusLine,acts,actsDone,
 monsterPosition:(s,rt)=>[s.x+rt.spriteWidth(s)/2+50,s.y+rt.spriteHeight(s)/2+40],
 events:{draw},
});

export const cloverAttackObjects=[cloverBulletController,clubsBullet,clubsBulletDark];
