// Rouxls Kaard (Chapter 2, encounter 63): he rides the Thrash Machine out of the acid and plays his mini-game
// ("Conquer Houses!"), placing houses before each attack while Kris claims tiles with the Take House ACTs. Once
// either side has nowhere left to build, he cuts the battle. Object: obj_rouxls_enemy.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyHurtTiredAfterDamage,enemyObjectInit,speaker,terminateWriter} from '../../deltarune/chapter2-enemy';
import {drawBodyPart} from '../../deltarune/chapter2-battle';
import {darkener,growtangle,moveHeart,moveHeartIn,tensionHeal} from '../../deltarune/battle';
import {nextAct,randomTarget,winCombat} from '../../deltarune/controller';
import {blconSkip,bulletSpawner,isPhase,msgNext,msgSet,turnTimer} from '../../deltarune/chapter2-battle';
import {battleBalloon2,enemyBlcon2} from '../../deltarune/chapter2-objects';
import {guardPeek} from '../../deltarune/guard-peek';
import {battleText,battleTextDefault,writer} from '../../deltarune/writer';
import {pressed,KEY} from '../../deltarune/keys';
import {sourceText} from '../../host/text';

const STEP='obj_rouxls_enemy_slash_Step_0_gml_',CREATE='obj_rouxls_enemy_slash_Create_0_gml_';
const T=(key:string)=>sourceText(STEP+key);
const button3_p=(rt:GmRuntime)=>pressed(rt,KEY.c,KEY.ctrl);
/** Each part (flag 220 + i) raises two of six stats; the top one names the ship in the status line. */
const STAT1=[[5,1,2,6],[0,4,3,6],[1,3,0,6]],STAT2=[[4,0,3,6],[2,1,5,6],[2,4,5,6]];
/** The ship's look by its top stat (types 0-3 and 5; the rest are "cool"). */
const SHIP:Readonly<Record<number,string>>={0:'235_0',1:'239_0',2:'243_0',3:'247_0',5:'251_0'};

export function createRouxlsEnemy(object:(name:string)=>GmObjectDef,parts:{thrash:GmObjectDef;simtown:GmObjectDef;land:GmObjectDef;acid:GmObjectDef;splash:GmObjectDef;ripple:GmObjectDef}):GmObjectDef{
 const base=object('obj_rouxls_enemy');
 const thrashOf=(s:GmInstance,rt:GmRuntime)=>{const t=rt.byId(s.thrash);if(!t)throw Error('Rouxls lost the Thrash Machine');return t;};
 const simtownOf=(rt:GmRuntime)=>{const t=rt.first(parts.simtown);if(!t)throw Error('Rouxls needs his mini-game');return t;};
 const killBalloons=(rt:GmRuntime)=>{for(const w of rt.withInstances(writer))rt.destroy(w);for(const b of rt.withInstances(battleBalloon2))rt.destroy(b);};
 const balloon=(s:GmInstance,rt:GmRuntime)=>enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);
 /** The talk and the houses before his attack. */
 function startTalk(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  randomTarget(s,rt);g.typer=50;
  if(s.attackorder===3)s.attackorder=0;
  if(s.attackorder===0)s.rr=1;if(s.attackorder===1)s.rr=2;if(s.attackorder===2)s.rr=0;
  s.attackorder++;
  if(s.rr===0){msgSet(rt,0,T(s.duckmode?'19_0':'22_0'));s.chosenattack=1;}
  else if(s.rr===1){msgSet(rt,0,T('28_0'));s.chosenattack=2;}
  else if(s.rr===2){msgSet(rt,0,T('33_0'));s.chosenattack=0;}
  s.talkedcon=0;s.talktimer=0;s.ralseitalks=0;
  const hurt=g.monsterhp[s.myself]!==g.monstermaxhp[s.myself];
  if(s.ballooncount===0){msgSet(rt,0,T('42_0'));s.ballooncon=1;}
  if(s.ballooncount===1)msgSet(rt,0,T(s.hasplayerplacedhouses===0&&hurt?'45_0':'46_0'));
  if(s.ballooncount===2){
   if(s.hasplayerplacedhouses===0&&hurt)msgSet(rt,0,T('50_0'));
   else{msgSet(rt,0,T('51_0'));s.ralseitalks=1;s.ballooncon=2;}
  }
  if(s.ballooncount===3&&s.hasplayerplacedhouses===1)msgSet(rt,0,T('57_0'));
  s.ballooncount++;
  const ralsei=rt.first(object('obj_heroralsei'));
  if(s.ralseitalks===1&&ralsei){
   g.typer=74;guardPeek(s,rt,ralsei,object('obj_battle_marker'),object('obj_heroralsei'),object('obj_herosusie'));
   enemyBlcon2(s,rt,ralsei.x+75,ralsei.y+15,7);
  }else balloon(s,rt);
  if(s.ballooncon===0){s.talked=1;s.talktimer=0;}else{s.talked=.5;s.talktimer=0;}
 }
 /** The rest of the talk: a second balloon (his rules, Ralsei's question), the end of the words, then his houses. */
 function duringTalk(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  if(s.talked===.5){
   s.talktimer++;
   if(button3_p(rt)&&s.talktimer>15||!rt.exists(writer)){
    killBalloons(rt);
    if(s.ballooncon===1){msgSet(rt,0,T('85_0'));s.alarm[6]=1;}
    if(s.ballooncon===2){msgSet(rt,0,T('86_0'));s.alarm[7]=1;}
    s.ballooncon=0;s.talked=.6;g.typer=50;balloon(s,rt);
   }
  }
  if(s.talked===.7){
   s.talktimer++;
   if(button3_p(rt)&&s.talktimer>15||!rt.exists(writer)){killBalloons(rt);msgSet(rt,0,T('102_0'));s.talked=.8;s.alarm[6]=1;g.typer=50;balloon(s,rt);}
  }
 }
 function endTalk(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  if(s.talked===1&&isPhase(rt,'enemytalk',s)){
   s.talktimer++;
   if(button3_p(rt)&&s.talktimer>15||!rt.exists(writer)){killBalloons(rt);s.talkedcon=1;}
   if(s.talkedcon===1){s.rtimer=0;blconSkip(s,rt,-1);if(g.mnfight===2)g.mnfight=7;}
  }
  // His houses, while the enemy turn waits (mnfight 7), then the box.
  if(g.mnfight===7&&s.buildedblocks===0){
   s.buildedblockstimer++;
   if(s.buildedblockstimer===1)for(const t of rt.withInstances(parts.simtown))t.TurnCon=2;
   if(s.buildedblockstimer>60){g.mnfight=2;s.buildedblocks=1;s.buildedblockstimer=0;}
  }
  if(isPhase(rt,'bullets',s)&&s.buildedblocks===1){
   s.buildedblocks=2;s.rr=s.chosenattack;
   if(!rt.exists(moveHeart)&&!rt.exists(object('obj_heart')))moveHeartIn(rt);
   if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);
  }
 }
 function attack(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  if(!rt.exists(darkener))rt.create(darkener,0,0);
  const kinds:readonly [string,number,number,string][]=[['ThrashHead',5,26,'head_difficulty'],['ThrashFoot',7,27,'wheel_difficulty'],['PuzzleBlocks',6,28,'']];
  const [name,mult,type,difficulty]=kinds[s.rr===0||s.rr===1?s.rr:2];
  g.monsterattackname[s.myself]=name;
  const dc=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=dc.id;dc.damage=g.monsterat[s.myself]*mult;dc.type=type;
  if(difficulty)dc.difficulty=s[difficulty];
  turnTimer(rt,200);
 }
 function statusLine(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;s.rr=rt.random.choose(0,1,2,3);const zone=rt.random.irandom(2);
  if(s.rr===0)g.battlemsg[0]=T('136_0').replace('~1',s.zone[zone]);
  if(s.rr===1)g.battlemsg[0]=T('142_0').replace('~1',s.city[zone]);
  if(s.rr===2){
   const ship=T(SHIP[s.type]??'230_0');
   g.battlemsg[0]=s.duckmode?T('147_0'):T('147_1').replace('~1',ship);
  }
  if(s.rr===3)g.battlemsg[0]=T('150_0');
  s.buildedblocks=0;
 }
 /** Check; Take House 1-4 (place that many houses on the board); Ralsei's Distract (one house fewer next turn); the
  * end once the game is over. */
 function acts(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
  if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,T('171_0'));battleTextDefault(rt,s);}
  for(const [acting,key,houses] of [[2,'178_0',1],[3,'187_0',2],[4,'196_0',3],[5,'205_0',4]] as const)
   if(s.acting===acting&&s.actcon===0){msgSet(rt,0,T(key));battleTextDefault(rt,s);s.acting=9;s.HouseCount=houses;}
  if(s.actingral===1&&s.actconral===1){
   for(const t of rt.withInstances(parts.simtown))if(t.RalseiDistractTwice!==1)t.RalseiDistract=1;
   msgSet(rt,0,T(simtownOf(rt).RalseiDistract===1?'214_0':'215_0'));battleTextDefault(rt,s);s.actcon=1;s.actconral=0;
  }
  if(s.acting===9&&s.actcon===0&&!rt.exists(writer)){
   for(const t of rt.withInstances(parts.simtown)){t.MyTurn=1;t.TurnCon=0;t.HouseCountMax=s.HouseCount;}
   s.acting=10;
  }
  if((s.actcon===20||s.actconsus===20||s.actconral===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actcon=1;}
  if(s.actcon===1&&!rt.exists(writer)){if(s.endbattle===1)s.actcon=50;else nextAct(rt,s);}
  if(s.actcon===50){rt.sourceAudio?.volume(g.batmusic?.[1],0,45);s.actcon=51;s.alarm[5]=45;}
  if(s.actcon===52){
   speaker(s,rt,'rouxls');msgSet(rt,0,T('263_0'));
   const result=simtownOf(rt).actresult;
   if(result==='lost')msgNext(rt,T('266_0'));else if(result==='won')msgNext(rt,T('270_0'));else{msgNext(rt,T('274_0'));g.flag[435]=3;}
   msgNext(rt,T('364_0'));battleText(rt,s);s.actcon=53;
  }
  if(s.actcon===53&&!rt.exists(writer)){
   for(const t of rt.withInstances(parts.acid))rt.destroy(t);for(const t of rt.withInstances(parts.land))rt.destroy(t);
   winCombat(rt,s);s.actcon=55;
  }
 }
 /** The machine's ride: up out of the acid, a charge across (or the head's aim), back, and down again. */
 function ride(s:GmInstance,rt:GmRuntime){
  const t=thrashOf(s,rt),puddle=rt.byId(s.puddle);if(!puddle)throw Error('Rouxls lost his puddle');
  const turret=t.part[0]===2,wheels=t.part[2]===1,g=rt.globals;
  const splashAt=(x:number,y:number,depth:number,speed?:number)=>{const d=rt.create(parts.splash,x,y);s.d=d.id;d.depth=depth;if(speed!==undefined)d.speed=speed;return d;};
  if(s.thrashmode!==1)return;
  if(s.thrashcon===0){
   s.thrashtimer=0;s.thrashcon=1;let xoff=0;
   if(turret){xoff=10;splashAt(puddle.x-60+xoff,puddle.y+4,s.depth-1);}
   splashAt(puddle.x-30+xoff,puddle.y+4,s.depth-1);splashAt(puddle.x+30+xoff,puddle.y+4,s.depth-1);splashAt(puddle.x+xoff,puddle.y+6,s.depth-2);
  }
  if(s.thrashcon===1){
   t.wsinerrate=0;
   if(s.y<s.remy-10)t.drawfeet=1;
   if(s.y>=rt.view.y+(!s.headattack?45:10)){t.wsiner+=1.6;s.y-=4;}
   else{
    if(s.headattack)s.thrashtimer=Math.asin(.75)*10;
    s.aimtime=rt.random.irandom(15)+15;
    if(!s.headattack){
     s.aimtime=10;
     if(t.part[2]===1)s.thrashtimer=s.aimtime-10;
     s.height_multiplier=t.part[2]===3?5:s.aimtime/4.71238898038469;
    }else s.height_multiplier=5;
    s.thrashcon=2;t.wsinerrate=0;
   }
  }
  if(s.thrashcon===2){
   s.thrashtimer++;
   if(s.thrashtimer%8===0){
    const r=rt.create(parts.ripple,puddle.x,puddle.y);
    r.maxsize=Math.min(Math.max(1-(s.y-90)/45,.1),2);r.imageSpeed=0;r.imageIndex=turret?1:0;r.depth=puddle.depth-1;s.submerged=0;
   }
   if(s.headattack)s.y=rt.view.y+(s.headattack?40:10)-Math.sin(s.thrashtimer/(s.headattack?10:s.height_multiplier))*40;
   else if(s.thrashtimer<=s.aimtime)s.y=rt.view.y+45-Math.sin(s.thrashtimer/s.aimtime*Math.PI)*10;
   if(s.headattack&&s.y<=rt.view.y+10&&g.turntimer<=40){s.headattack=0;s.thrashtimer=0;s.thrashcon=5;}
   else if(!s.headattack&&s.thrashtimer>=s.aimtime+10){
    s.thrashtimer=0;s.thrashcon=3;t.moving=1;s.floatheight=t.s*t.walkc+s.fixy;
    const d=splashAt(puddle.x,puddle.y+10,s.depth-1,s.advancespeed);d.yscale=4;d.xscale=3;
   }else if(!s.headattack){
    t.wsiner+=1.6*(s.advancespeed/4);
    if((s.thrashtimer-s.aimtime)%3===0){const d=splashAt(puddle.x,puddle.y+10,s.depth-1,s.advancespeed);d.yscale=3;d.xscale=2;}
   }
  }
  if(s.thrashcon===3){
   if(s.x>=rt.view.x+200){t.wsiner+=1.6*(s.advancespeed/8);s.x-=s.advancespeed;}else s.thrashcon=4;
  }
  if(s.thrashcon===4){
   s.thrashtimer++;
   if(wheels){if(s.thrashtimer<=90)t.wsiner+=1.6*(s.advancespeed/8);else t.wsiner-=.5;}
   if(s.thrashtimer>=(wheels?105:15)){s.thrashcon=5;s.thrashtimer=0;}
  }
  if(s.thrashcon===5){
   if(s.x<s.remx-6){s.x+=s.returnspeed;t.wsiner-=1.6*(s.returnspeed/6);}else{s.x=s.remx;s.thrashcon=6;t.moving=0;}
  }
  if(s.thrashcon===6){
   if(!s.submerged&&s.y>s.remy-18){
    let xoff=0;
    if(turret){xoff=10;splashAt(puddle.x-60+xoff,puddle.y+4,s.depth-1,-2);}
    splashAt(puddle.x-30+xoff,puddle.y+4,s.depth-1,turret?-1.33:-1);
    splashAt(puddle.x+xoff,puddle.y+6,s.depth-2,turret?1.33:0);
    splashAt(puddle.x+30+xoff,puddle.y+4,s.depth-1,2);
    s.submerged=1;
   }
   if(s.y>s.remy-10)t.drawfeet=0;
   if(s.y<=s.remy-4){s.y+=4;t.wsiner-=.8;}
   else{s.y=s.remy;s.x=s.remx;s.thrashcon=0;s.thrashmode=0;t.wsinerrate=.8;s.advancespeed=8;s.returnspeed=6;}
  }
  if(s.thrashcon===7){
   if(s.thrashtimer===50){rt.sound?.('snd_pombark');t.a=1;}
   if(s.thrashtimer<75){s.thrashtimer++;t.wsiner-=.8;}
   else{s.x=s.remx;s.thrashcon=6;t.moving=0;s.returnease=0;s.thrashtimer=0;}
  }
 }
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  create:(s,rt)=>{
   const g=rt.globals;enemyObjectInit(s,rt);
   const bonus=g.flag[458]/7*g.maxtension*.3;tensionHeal(rt,bonus);(g.temptension??=[])[0]=bonus;
   Object.assign(s,{talkmax:90,imageSpeed:1/6,idlesprite:'spr_rurus_pirate',hurtsprite:'spr_rurus_pirate',sabersprite:'spr_rurus_pirate_saber',sparedsprite:'spr_rurus_pirate',custom_draw_example:1});
   s.depth=-10;
   const t=rt.create(parts.thrash,s.x,s.y);s.thrash=t.id;t.xx=s.x+34;t.yy=s.y+108;t.depth=s.depth+5;t.drawfeet=0;
   Object.assign(s,{drawsiner:0,thrashmode:0,thrashcon:0,thrashbody:0,thrashtimer:0,remx:s.x,remy:s.y,movey:0,bulletoverride:-1,chosenattack:0,advancespeed:8,returnspeed:6});
   s.aimtime=rt.random.irandom(15)+10;Object.assign(s,{floatheight:0,returnease:0,headattack:0});
   const puddle=rt.create(object('obj_marker'),s.x,s.y);s.puddle=puddle.id;
   Object.assign(puddle,{sprite:'spr_rouxls_puddle',imageXscale:2,imageYscale:2,imageSpeed:0});puddle.imageIndex=t.part[0]===2?2:0;
   const turret=t.part[0]===2;
   puddle.x=s.remx+(turret?18:34);puddle.y=s.remy+173+t.s*Math.cos((t.wsiner+t.wsinerrate)/3)/4;puddle.imageIndex=turret?2:0;
   Object.assign(s,{submerged:1,keytestmode:0,saberanim:0,head_difficulty:0,wheel_difficulty:0,buildedblocks:0,buildedblockstimer:0,did_kris_win_simcity:0,HouseCount:1});
   // The board's tiles (unseen: they only mark where the land is).
   const tile=(def:GmObjectDef,x:number,y:number,xs:number,ys=1)=>{const i=rt.create(def,rt.view.x+x,rt.view.y+y);i.imageXscale=xs;i.imageYscale=ys;return i;};
   s.tile6=tile(parts.acid,0,80,16,6).id;
   s.tile1=tile(parts.land,160,80,8).id;s.tile2=tile(parts.land,160,120,8).id;s.tile3=tile(parts.land,240,160,3).id;
   s.tile4=tile(parts.land,280,200,3).id;s.tile5=tile(parts.land,160,240,8).id;s.tile6=tile(parts.land,160,280,8).id;
   for(const i of rt.withInstances(parts.land))i.visible=false;for(const i of rt.withInstances(parts.acid))i.visible=false;
   const sim=rt.first(parts.simtown)??rt.create(parts.simtown,s.x,s.y);s.simcity=sim.id;
   puddle.depth=sim.depth+1;s.depthChange=0;sim.maker=s.id;
   Object.assign(s,{endbattle:0,actresult:'tie',target_multiplier:0});
   for(const b of rt.withInstances(object('obj_battleback')))rt.destroy(b);
   Object.assign(s,{ballooncount:0,ballooncon:0,talkedcon:0,talktimer:0,hasplayerplacedhouses:0,ralseitalks:0,attackorder:0});
   s.zone=['116_0','117_0','118_0'].map(k=>sourceText(CREATE+k));s.city=['120_0','121_0','122_0'].map(k=>sourceText(CREATE+k));
   s.duckmode=g.flag[220]===3&&g.flag[221]===3&&g.flag[222]===3;
   s.stat1=STAT1.map(r=>[...r]);s.stat2=STAT2.map(r=>[...r]);
   s.stat=[0,0,0,0,0,0];
   for(s.i=0;s.i<3;s.i+=1)if(g.flag[220+s.i]>=0){
    const a=s.stat1[s.i][g.flag[220+s.i]],b=s.stat2[s.i][g.flag[220+s.i]];if(a<6)s.stat[a]+=1;if(b<6)s.stat[b]+=1;
   }
   s.type=-1;s.topstat=-1;s.topstatlevel=0;
   for(s.i=0;s.i<6;s.i+=1){if(s.stat[s.i]===s.topstatlevel&&s.topstatlevel>=2)s.type=7;if(s.stat[s.i]>s.topstatlevel){s.topstat=s.i;s.topstatlevel=s.stat[s.i];}}
   s.type=s.topstat;if(s.type===7)s.type=-1;if(s.topstatlevel===0)s.type=6;
  },
  startTalk,duringTalk,endTalk,
  holdsAttack:s=>s.buildedblocks!==2,
  attack,statusLine,
  attackWait:(_s,rt)=>turnTimer(rt,120),
  acts,actsDone:()=>{},
  hooks:{fightNumbersOnTop:true},
  events:{
   alarm4:s=>{s.con+=1;},
   alarm5:s=>{s.actcon++;},
   alarm6:s=>{s.talked=1;s.talktimer=0;},
   alarm7:s=>{s.talked=.7;s.talktimer=0;},
   destroy:(_s,rt)=>{for(const t of rt.withInstances(parts.simtown))rt.userEvent(t,0);},
   draw:(s,rt)=>{
    const g=rt.globals,t=thrashOf(s,rt);
    if(s.state===3){
     enemyHurtTiredAfterDamage(s,rt,0);s.hurttimer-=1;
     if(s.hurttimer<0)s.state=0;
     else{
      s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
      rt.drawSprite(s.hurtsprite,0,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,s.imageBlend,1);
     }
    }
    s.fixy=0;if(g.flag[221]===2)s.fixy=10;if(g.flag[221]===3)s.fixy=26;
    t.xx=s.x+34;t.yy=s.y+108;
    if(s.state===0){
     s.fsiner+=1;
     if(s.saberanim){if(s.thissprite!==s.sabersprite){s.siner=0;s.thissprite=s.sabersprite;}else if(s.siner<3)s.siner++;}
     else{s.siner+=1/6;s.thissprite=s.idlesprite;if(g.mercymod[s.myself]>=g.mercymax[s.myself])s.thissprite=s.sparedsprite;}
     const xpos=s.thrashcon===0?s.x:s.remx;
     const y=s.thrashcon>2&&s.thrashcon!==6?s.y+s.floatheight:s.y+t.s*t.walkc+s.fixy;
     drawBodyPart(s,rt,s.thissprite,s.siner,xpos,y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);
    }
    if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
    // The puddle he rises from.
    const turret=t.part[0]===2,puddle=rt.byId(s.puddle);if(!puddle)throw Error('Rouxls lost his puddle');
    t.s=3;
    const px=s.remx+(turret?18:34),py=s.remy+173+t.s*t.walkc/4;
    if(!s.depthChange&&rt.exists(growtangle)){s.depthChange=1;puddle.depth=t.depth+1;}
    else if(s.depthChange&&!rt.exists(growtangle)){s.depthChange=0;puddle.depth=rt.byId(s.simcity)!.depth+1;}
    puddle.x=px;puddle.y=s.remy+173+t.s*Math.cos((t.wsiner+t.wsinerrate)/3)/4;
    if(s.thrashcon<2||s.thrashcon>5)rt.drawSprite('spr_rouxls_puddle',turret?3:1,px,py,2,2,0,C.white,1);
    puddle.imageIndex=turret?2:0;
    ride(s,rt);
   },
  },
 });
}
