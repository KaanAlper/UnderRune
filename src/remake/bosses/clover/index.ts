import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY,ge,le} from '../../gm/math';
import {afterimage,battleSolid,bulletGenParent,bulletParent,darkener,growtangle,heart,heroKris,KEY,monsterParent,moveHeart,regularBullet} from '../../deltarune/battle';
import {clubsBulletDark} from '../jevil/bullets';
export {clubsBulletDark} from '../jevil/bullets';
export interface CloverHooks {
 text:(key:string)=>string;
 writerExists:(rt:GmRuntime)=>boolean;
 /** scr_blconskip destroys the original writer instances on speech completion. */
 dismissWriters?:(rt:GmRuntime)=>void;
 enemySpeech:(rt:GmRuntime,x:number,y:number,face:number)=>void;
 battleText:(rt:GmRuntime,useDefault:boolean)=>void;
 attackPhase:(rt:GmRuntime)=>void;
 defeat:(s:GmInstance,rt:GmRuntime)=>void;
 monsterSetup:(s:GmInstance,rt:GmRuntime)=>void;
}
/** Native obj_clubsbullet has no Create/Step event: it only splits when it hits the arena. */
export const clubsBullet:GmObjectDef={name:'obj_clubsbullet',index:235,parent:bulletParent,sprite:'spr_clubsbullet',collisions:[{target:battleSolid,run:(s,_other,rt)=>{
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

/** Host supplies the existing text/action lifecycle; no placeholder writers or substitute attacks. */
export function createCloverEnemy(hooks:CloverHooks):GmObjectDef{
 const text=(line:number)=>hooks.text(`obj_clubsenemy_slash_Step_0_gml_${line}_0`);
 const message=(rt:GmRuntime,line:number)=>{rt.globals.msg[0]=text(line);};
 const speech=(s:GmInstance,rt:GmRuntime,first:number)=>{
  s.text1=text(first);s.text2=text(first+1);s.text3=text(first+2);
  for(const [key,dx,dy,face] of [['text1',-110,-10,4],['text2',-125,70,5],['text3',125,-10,6]] as const){rt.globals.msg[0]=s[key];hooks.enemySpeech(rt,s.x+dx,s.y+dy,face);}
 };
 return {name:'obj_clubsenemy',index:293,parent:monsterParent,sprite:'spr_clubs_idle',events:{
  create:s=>{Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:150,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,tired:0,manual:0,attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,mytarget:3,imageSpeed:0,betray:0,argue:0,imageXscale:2,imageYscale:2,idlesprite:'spr_clubs_idle',hurtsprite:'spr_clubs_hurt',sparedsprite:'spr_clubs_spared',acted:[0,0,0,0,0,0]});},
  alarm4:s=>{s.con++;},
  user12:(s,rt)=>{rt.globals.monsterx[s.myself]=s.x+rt.spriteWidth(s)/2+50;rt.globals.monstery[s.myself]=s.y+rt.spriteHeight(s)/2+40;hooks.monsterSetup(s,rt);},
  step:(s,rt)=>{
   const g=rt.globals;
   if(g.monster[s.myself]===1){
    if(g.mnfight===1&&s.talked===0){
     s.abletotarget=g.charcantarget.some((n:number)=>n!==0)?1:0;s.mytarget=rt.random.choose(0,1,2);
     if(s.abletotarget===1){while(g.charcantarget[s.mytarget]===0)s.mytarget=rt.random.choose(0,1,2);}else s.mytarget=3;
     g.targeted[s.mytarget]=1;
     if(!rt.exists(darkener))rt.create(darkener,0,0);
     g.typer=50;s.rr=rt.random.choose(0,1,2);
     let line=[17,24,31][s.rr];if(s.acting>=2&&s.acting<=6)line=[39,46,53,60,68][s.acting-2];if(s.manual===1)line=76;
     speech(s,rt,line);for(const m of rt.all(monsterParent))m.talkmax=210;s.talked=1;s.talktimer=0;s.manual=0;
    }
    if(s.talked===1&&g.mnfight===1){
     s.rtimer=0;
     if([KEY.z,KEY.enter].some(k=>rt.input.pressed.has(k))&&s.talktimer>15)s.talktimer=s.talkmax;
     s.talktimer++;
     if(s.talktimer>=s.talkmax){if(!hooks.dismissWriters)throw Error('Clover speech requires dismissWriters adapter');hooks.dismissWriters(rt);g.mnfight=2;}
     if(g.mnfight===2){
      if(!rt.exists(moveHeart)){const k=rt.first(heroKris);if(!k)throw Error('Clover soul transition requires obj_herokris');rt.create(moveHeart,k.x+10,k.y+40);}
      if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
     }
    }
    if(g.mnfight===2&&s.attacked===0){
     s.rtimer++;
     if(s.rtimer===12){
      s.rr=rt.random.choose(0,1);const c=rt.create(cloverBulletController,s.x,s.y);s.dc=c.id;c.type=s.rr===0?2:4;c.target=s.mytarget;c.damage=g.monsterat[s.myself]*5;
      s.turns++;g.turntimer=150;s.attacked=1;g.typer=6;g.fc=0;s.rr=rt.random.choose(0,1,2,3,4,5);g.battlemsg[0]=text(134+s.rr);
      if(g.monsterstatus[s.myself]===1)g.battlemsg[0]=text(140);
      if(le(g.monsterhp[s.myself],g.monstermaxhp[s.myself]/3))g.battlemsg[0]=text(141);
      if(ge(g.mercymod[s.myself],g.mercymax[s.myself]))g.msg[0]=text(142);
      if(s.betray===1)g.battlemsg[0]=text(143);s.betray=0;
     }else g.turntimer=150;
    }
   }
   if(g.myfight!==3)return;s.xx=rt.view.x;s.yy=rt.view.y;
   if(s.acting===1&&s.actcon===0){s.actcon=1;message(rt,163);hooks.battleText(rt,true);}
   // Each stage is a separate source if: a synchronously completed writer can advance again this frame.
   for(const [act,start,line,reply,end,topic] of [[2,20,187,196,210,-1],[3,22,223,233,247,2],[4,24,258,268,282,3]] as const){
    if(s.acting===act&&s.actcon===0){g.typer=45;g.fc=2;g.fe=0;message(rt,line);s.argue++;hooks.battleText(rt,false);s.actcon=start;}
    if(s.actcon===start&&!hooks.writerExists(rt)){g.typer=50;if(topic>=0&&s.acted[topic]===0){g.mercymod[s.myself]+=40;s.acted[topic]=1;}speech(s,rt,reply);s.actcon=start+1;}
    if(s.actcon===start+1&&!hooks.writerExists(rt)){message(rt,end);hooks.battleText(rt,true);s.actcon=1;}
   }
   if(s.acting===5&&s.actcon===0){message(rt,290);g.msg[1]=text(291);s.argue++;hooks.battleText(rt,true);s.actcon=1;}
   if(s.acting===6&&s.actcon===0){if(s.acted[5]===0){g.mercymod[s.myself]+=40;s.acted[5]=1;}message(rt,301);s.argue++;hooks.battleText(rt,true);s.actcon=1;}
   if(s.actcon===1&&!hooks.writerExists(rt)){if(s.argue>=3){g.monstercomment[s.myself]=text(314);g.monsterstatus[s.myself]=1;}s.actcon=0;hooks.attackPhase(rt);}
  },
  draw:(s,rt)=>{
   const g=rt.globals;
   if(s.state===3){
    if(le(g.monsterhp[s.myself],g.monstermaxhp[s.myself]/2)){g.monsterstatus[s.myself]=1;if(g.monstercomment[s.myself]===' ')g.monstercomment[s.myself]=hooks.text('obj_clubsenemy_slash_Draw_0_gml_6_0');}
    s.hurttimer--;
    if(s.hurttimer<0)s.state=0;
    else{if(g.monster[s.myself]===0){g.flag[522]++;hooks.defeat(s,rt);}s.hurtshake++;if(s.hurtshake>1){if(s.shakex>0)s.shakex--;if(s.shakex<0)s.shakex++;s.shakex=-s.shakex;s.hurtshake=0;}rt.drawSprite('spr_clubs_hurt',0,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);}
   }
   if(s.state===0){s.siner++;s.thissprite=ge(g.mercymod[s.myself],g.mercymax[s.myself])?'spr_clubs_spared':'spr_clubs_idle';rt.drawSprite(s.thissprite,s.siner/6,s.x,s.y,2,2,0,s.imageBlend,1);if(s.flash===1){s.fsiner++;rt.drawSpriteFog(s.thissprite,s.siner/6,s.x,s.y,2,2,0,0xffffff,-Math.cos(s.fsiner/5)*.4+.6);}}
   if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
  },
 }};
}

export const cloverAttackObjects=[cloverBulletController,clubsBullet,clubsBulletDark];
/** Additional source dependencies are supplied by the battle host; their choreography is not certified here. */
export const cloverDependencies={
 globals:['monster','monsterat','monsterhp','monstermaxhp','monsterstatus','monstercomment','monsterx','monstery','mercymod','mercymax','charcantarget','targeted','mnfight','myfight','turntimer','typer','fc','fe','msg','battlemsg','flag'],
 host:['localized text','obj_writer / enemy speech lifecycle','scr_attackphase','scr_defeatrun','scr_monstersetup','turn cleanup / reset talked and attacked'],
 unsupported:['obj_clubsenemy_old (not the released Clover object)','non-Clover obj_dbulletcontroller branches','Clover/Hathy pair choreography and Hathy attack objects'],
} as const;
