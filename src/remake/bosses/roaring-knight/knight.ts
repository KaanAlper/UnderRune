// The Roaring Knight (obj_knight_enemy, Chapter 3 encounter 115): the standard enemy template with the Knight's
// steps. His turns follow fixed phases (User 0); Susie talks to him from her fifth turn on; party wipes and his
// defeat at 80% HP each end the battle their own way (no victory screen).
import {gmArray,moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,ge,le,lt,pointDistance,round} from '../../gm/math';
import {defineEnemy} from '../../deltarune/enemy';
import {afterimage,damage,darkener,dead,growtangle,heart,moveHeart,moveHeartIn,shake,gameOver} from '../../deltarune/battle';
import {attackPhase,button3_p,findController,randomTarget,tensionBar} from '../../deltarune/controller';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {bulletSpawner,isPhase,msgNext,msgSet,turnTimer} from '../../deltarune/chapter2-battle';
import {anyFaceNext,enemyDrawIdleGeneric,enemyHurt,enemyObjectInit,recordDefeat,speaker,terminateWriter} from '../../deltarune/chapter2-enemy';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';
import {guardPeek} from '../../deltarune/guard-peek';
import {scrFadeout} from '../../deltarune/fades';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';

const T=(n:number)=>sourceText(`obj_knight_enemy_slash_Step_0_gml_${n}_0`);
type Step=(s:GmInstance,rt:GmRuntime)=>void;

/** Susie's words to the Knight by her balloon turn: [turn, text, follow-up (ballooncon), whether that ends the talk].
 * Later rows win; a turn with Kris and Ralsei both down has its own line. */
const SUSIE_TURNS:readonly (readonly [turn:number,text:number,con:number,end:number,bothDown?:boolean])[]=[
 [6,146,1,0],[7,147,2,0],[8,148,3,0],[9,149,4,0],[9,150,5,0,true],[10,151,6,0],[10,152,6,0,true],[11,153,0,1],[12,154,0,1],[13,155,7,0],[14,156,8,0]];
/** Her second balloon by ballooncon: [text, next ballooncon, whether that ends the talk]. */
const SUSIE_FOLLOW_UP:Readonly<Record<number,readonly [number,number,number]>>={1:[203,0,1],2:[204,0,1],3:[205,0,1],4:[206,0,1],5:[207,0,1],6:[208,0,1],7:[209,0,1],8:[210,9,0],9:[211,0,1]};
/** The attacks by myattackchoice: [attack name, bullet type, difficulty (the Knight's own when 'own'), damage, invc].
 * Some turns start two bullet makers. */
type Maker=readonly [name:string,type:number,difficulty:number|'own'|null,damage:number|null];
const ATTACKS:Readonly<Record<number,{makers:readonly Maker[];invc:number|null}>>={
 0:{makers:[['Swordslash',109,'own',null]],invc:0.4},1:{makers:[['Stars',98,'own',null]],invc:1},2:{makers:[['Flurry',99,'own',null]],invc:0.4},
 3:{makers:[['swordtunnel',102,null,null]],invc:0.4},4:{makers:[['xattacks',103,null,null]],invc:0.4},5:{makers:[['rotatingslash',104,'own',null]],invc:1},
 6:{makers:[['underboxattack',106,null,null]],invc:0.4},7:{makers:[['combinationattack',105,null,null]],invc:0.4},9:{makers:[['roaring',107,null,null]],invc:1},
 10:{makers:[['swords falling',108,'own',null]],invc:0.4},11:{makers:[['tracking swords',151,0,206]],invc:0.4},12:{makers:[['diagonal bullets',152,'own',null]],invc:0.4},
 13:{makers:[['sword tunnel new',153,'own',62]],invc:0.14},14:{makers:[['tracking swords',151,3,206]],invc:0.4},
 15:{makers:[['sword vortex',154,3,206],['tracking swords',151,0,206]],invc:0.4},16:{makers:[['rotatingslash',104,0,null],['tracking swords',151,0,206]],invc:0.4},
 17:{makers:[['tracking swords',151,2,206]],invc:0.4},20:{makers:[['knightlines',101,null,null]],invc:null}};
/** The attack each turn of a phase (User 0): phase -> phaseturn -> [myattackchoice, difficulty]. Turn 5 of phases 1
 * and 2 also moves to the next phase; phase 3's fifth marks the third rotating slash. */
const PHASES:Readonly<Record<number,Readonly<Record<number,readonly [number,number]>>>>={
 1:{1:[1,0],2:[11,0],3:[2,0],4:[13,0],5:[5,0],6:[12,0],7:[16,0],8:[17,0],9:[7,0]},
 2:{1:[1,1],2:[2,1],3:[13,3],4:[15,0],5:[5,1]},
 3:{1:[1,2],2:[2,3],3:[14,0],4:[13,4],5:[5,2]}};
/** The status line after his attack starts, by phase and phaseturn. */
const STATUS:Readonly<Record<number,readonly number[]>>={1:[496,521,498,499,500],2:[504,505,506,531,508],3:[514,515,516,541,518]};

export function createKnight(object:(name:string)=>GmObjectDef,fountain:GmObjectDef,blockVfx:GmObjectDef,fadeToWhite:GmObjectDef):GmObjectDef{
 const named=(rt:GmRuntime,name:string)=>rt.all(object(name));
 const susieOf=(rt:GmRuntime)=>{const h=rt.first(object('obj_herosusie'));if(!h)throw Error('The Roaring Knight needs Susie');return h;};
 /** Susie's balloon to the Knight (scr_enemyblcon kind 14, in front of the Knight), and her guard peek. */
 const susieBalloon=(s:GmInstance,rt:GmRuntime)=>{
  const susie=susieOf(rt);rt.globals.typer=75;enemyBlcon2(s,rt,susie.x+92,susie.y+38,14);
  guardPeek(s,rt,susie,object('obj_battle_marker'),object('obj_heroralsei'),object('obj_herosusie'));
  rt.byId(s.myblcon)!.depth=s.depth-100;
 };
 const talk:Step=(s,rt)=>{
  if(s.end_cutscene_version!==0)return;
  const g=rt.globals;randomTarget(s,rt);
  if(!rt.exists(darkener))rt.create(darkener,0,0);
  g.fc=22;g.typer=81;let balloon=false;s.susietalks=1;
  if(g.hp[2]>0){
   s.balloonturn++;
   for(const [turn,text,con,end,bothDown] of SUSIE_TURNS)if(s.balloonturn===turn&&(!bothDown||(lt(g.hp[1],1)&&lt(g.hp[3],1)))){msgSet(rt,0,T(text));s.ballooncon=con;s.balloonend=end;balloon=true;}
  }
  if(balloon)susieBalloon(s,rt);
  s.ralseitalks=0;s.susietalks=0;
  if(!balloon)g.mnfight=1.5;
  else if(s.ballooncon===0){s.talked=0.5;s.talktimer=0;}
  else{s.talked=0.6;s.talktimer=0;}
  s.rtimer=0;
 };
 const duringTalk:Step=(s,rt)=>{
  const over=()=>(button3_p(rt)&&s.talktimer>15)||!rt.exists(writer);
  if(s.talked===0.5){s.talktimer++;if(over()){destroyWriters(rt);s.alarm[6]=1;}}
  if(s.talked===0.6){
   s.talktimer++;
   if(over()){
    destroyWriters(rt);
    const next=SUSIE_FOLLOW_UP[s.ballooncon];if(next){msgSet(rt,0,T(next[0]));s.ballooncon=next[1];s.balloonend=next[2];}
    s.talked=0.7;s.susietalks=1;susieBalloon(s,rt);s.ralseitalks=0;s.susietalks=0;s.alarm[6]=1;
   }
  }
 };
 const endTalk:Step=(s,rt)=>{
  const g=rt.globals;
  if(s.talked===1&&isPhase(rt,'enemytalk',s)&&!rt.exists(writer)){g.mnfight=1.5;s.attackchosen=0;}
  if(g.mnfight!==1.5||s.end_cutscene_version!==0)return;
  const vx=rt.view.x,vy=rt.view.y;
  if(!rt.exists(growtangle)){
   rt.userEvent(s,0);s.setdownmessage=0;
   if(ge(s.damagereduction,0.2)&&lt(s.damagereduction,0.35))s.damagereduction+=0.01;
   const c=s.myattackchoice;
   if(c!==-1)rt.create(growtangle,c===0?vx+320-152:c===13?vx+300:vx+320,c===11||c===13?vy+190:vy+170);
   const box=()=>rt.first(growtangle)!;
   if(c===0)box().maxxscale=0.5;
   if(c===1){box().maxxscale=2.25;box().maxyscale=1.75;}
   if(c===4){box().maxxscale=3.5;box().maxyscale=3.5;}
   if(c===13)box().maxxscale=3;
  }
  if(!rt.exists(moveHeart)&&!rt.exists(heart)&&s.myattackchoice!==-1){
   moveHeartIn(rt);
   if(s.myattackchoice===13){const box=rt.first(growtangle)!;for(const m of rt.all(moveHeart)){
    m.distx=box.x-40;m.disty=box.y-8;m.dist=pointDistance(m.x,m.y,m.distx,m.disty);moveTowardsPoint(m,m.distx,m.disty,m.dist/m.flytime);}}
  }
  g.mnfight=2;turnTimer(rt,90);
 };
 const attack:Step=(s,rt)=>{
  const g=rt.globals,me=s.myself,c=s.myattackchoice;s.aoedamage=0;
  const a=ATTACKS[c];
  if(a){
   for(const [name,type,difficulty,damage] of a.makers){
    g.monsterattackname[me]=name;const d=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=d.id;d.type=type;
    if(difficulty!==null)d.difficulty=difficulty==='own'?s.difficulty:difficulty;if(damage!==null)d.damage=damage;
   }
   if(a.invc!==null)g.invc=a.invc;
  }
  if(c===-1)s.chargeupcon=1;
  const d=s.difficulty;
  turnTimer(rt,c===7?270:c===2?350:c===0&&(d===0||d===1)?300:c===11&&d===0?292:c===11||c===12?300:c===13&&d===3?360:c===13?330:c===14||c===15?300:240);
  if(s.damagereductiontimer>=750)g.monstername[me]=T(281);
 };
 const statusLine:Step=(s,rt)=>{
  const g=rt.globals,line=STATUS[s.phase]?.[s.phaseturn];
  if(line!==undefined)g.battlemsg[0]=T(line);
  if(s.phase===4||s.haveusedroaring===1){
   if(s.phase4turn===2)g.battlemsg[0]=T(319);
   if(s.phase4turn>2)g.battlemsg[0]=T(321);
   if(s.phase4turn===3&&s.progamer===1)g.battlemsg[0]=T(322);
  }
 };
 /** The battle ends without a victory (a first party wipe, or his defeat): the panel slides away, the music fades. */
 const endBattle=(s:GmInstance,rt:GmRuntime)=>{
  const g=rt.globals,c=findController(rt)!;c.noreturn=1;c.intro=2;
  for(const b of rt.all(tensionBar)){b.alarm[5]=15;b.hspeed=-10;b.friction=-0.4;}
  return {music:()=>rt.sourceAudio?.volume(g.batmusic[1],0,90),results:()=>{rt.userEvent(s,3);g.fighting=0;}};
 };
 const afterAttack:Step=(s,rt)=>{
  const g=rt.globals,me=s.myself,down=()=>lt(g.hp[1],1)&&lt(g.hp[2],1)&&lt(g.hp[3],1);
  if(g.mnfight===2&&le(g.turntimer,1)&&s.setdownmessage===0){
   s.setdownmessage=1;
   if(le(g.monsterhp[me],g.monstermaxhp[me]*0.8)&&s.haveusedroaring===0&&s.phase!==4)s.phase=4;
   if(s.phase===4&&s.phase4turn<3){
    if(s.phase4turn===0)g.battlemsg[0]=T(547);
    if(s.phase4turn===1&&g.hp[2]>0)g.battlemsg[0]=T(548);
    if(s.phase4turn===1&&lt(g.hp[2],1))g.battlemsg[0]=T(317);
   }else{
    let kris='',susie='',ralsei='',count=0;
    if(s.krisdownmessage===0&&lt(g.hp[1],1)){kris=T(343);count++;s.krisdownmessage=1;g.battlemsg[0]=kris;}
    if(s.susiedownmessage===0&&lt(g.hp[2],1)){susie=T(344);count++;s.susiedownmessage=1;g.battlemsg[0]=susie;}
    if(s.ralseidownmessage===0&&lt(g.hp[3],1)){ralsei=T(345);count++;s.ralseidownmessage=1;g.battlemsg[0]=ralsei;}
    if(count===2)g.battlemsg[0]=kris+susie+ralsei;
   }
  }
  if(down()&&g.turntimer>0){
   g.turntimer=0;
   for(const name of ['obj_lerpvar','obj_script_delayed','obj_afterimage_grow'])for(const i of named(rt,name))rt.destroy(i);
  }
  if(g.mnfight===2&&lt(g.turntimer,1)&&down()&&s.endcon===0){
   s.endcon=1;for(const p of named(rt,'obj_particle_generic'))rt.destroy(p);
   if(knightAttempts(rt)>0)gameOver(rt);
   else{const end=endBattle(s,rt);end.music();end.results();}
  }
 };
 const acts:Step=(s,rt)=>{
  const g=rt.globals,me=s.myself;s.xx=rt.view.x;s.yy=rt.view.y;
  if(s.acting===1&&s.actcon===0){
   s.actcon=1;s.checkcount++;
   if(s.checkcount===1){msgSet(rt,0,T(393));msgNext(rt,T(394));}else{msgSet(rt,0,T(398));msgNext(rt,T(399));}
   battleTextDefault(rt,s);
  }
  if(s.acting===2&&s.actcon===0){
   s.actcon=1;s.holdbreathcount++;
   if(s.holdbreathcount<=1)msgSet(rt,0,T(497));
   if(s.holdbreathcount>1)msgSet(rt,0,T(415));
   battleTextDefault(rt,s);s.holdbreathcount=1;
  }
  if(s.actingsus===1&&s.actconsus===1){
   speaker(s,rt,'noone');msgSet(rt,0,T(424));anyFaceNext(s,rt,'susie','J');
   for(const n of [426,427,428,429,430])msgNext(rt,T(n));
   anyFaceNext(s,rt,'none',0);msgNext(rt,T(432));battleTextDefault(rt,s);
   s.sactcount=1;s.actcon=1;s.actconsus=0;
   g.canactsus[me][0]=0;g.actnamesus[me][0]='';g.actsimulsus[me][0]=0;g.actactorsus[me][0]=0;g.actcostsus[me][0]=0;
   g.battlespell[1][0]=0;g.battlespell[1][0]=-1;g.battleactcount[1]=0;g.battlespellname[1][0]='';g.battlespelldesc[1][0]='';
   spellMenuSetupChapter2(rt,s);
  }
  if(s.actingral===1&&s.actconral===1){
   s.ractcount++;
   if(s.ractcount===1){
    speaker(s,rt,'noone');msgSet(rt,0,T(461));anyFaceNext(s,rt,'ralsei','Q');
    for(const n of [463,464,465])msgNext(rt,T(n));
    anyFaceNext(s,rt,'none',0);msgNext(rt,T(467));speaker(s,rt,'noone');
   }else{
    speaker(s,rt,'noone');msgSet(rt,0,T(473));anyFaceNext(s,rt,'ralsei','8');msgNext(rt,T(475));anyFaceNext(s,rt,'none',0);msgNext(rt,T(477));
   }
   battleTextDefault(rt,s);s.actcon=1;s.actconral=0;
  }
  if((s.actcon===20||s.actconsus===20||s.actconral===20)&&terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actcon=1;}
 };
 const beforeStep:Step=(s,rt)=>{
  const g=rt.globals,me=s.myself;
  if(!rt.exists(object('obj_herosusie'))||!rt.exists(object('obj_heroralsei')))throw Error("The Roaring Knight's battle without Susie and Ralsei is not ported");
  if(le(g.monsterhp[me],g.monstermaxhp[me]*0.8))g.tempflag[96]=1;
  const soul=rt.first(heart);
  if(s.holdbreathcount>0&&soul)soul.wspeed=5;
  if(s.holdbreathcount>0&&rt.exists(object('obj_knight_roaring2'))&&soul)soul.wspeed=6;
  s.damagereductiontimer++;
  if(s.damagereductiontimer===1){
   if(s.phaseturn===1&&s.phase===1){s.phaseturn=1;s.myattackchoice=2;s.difficulty=0;}
   s.damagereduction=0.2;g.monstername[me]=T(23);s.blocking=0;s.hurtsprite='spr_roaringknight_hurt';
  }
  if(s.blockanim===1){
   rt.soundStop?.('snd_bell');snd(rt,'snd_bell');
   s.idlesprite='spr_roaringknight_block_ol';s.whiteflash=2;s.blockanim=2;s.blocktimer=0;s.shakex=5;s.state=3;s.hurttimer=30;
  }
  if(s.blockanim===2){
   s.blocktimer++;
   const vfx=(vspeed:number,gravity:number)=>{
    const a=rt.create(blockVfx,s.x+14,s.y+40);s.anim=a.id;a.sprite='spr_roaringknight_block_vfx';a.imageXscale=1.3;a.imageYscale=1.3;
    a.vspeed=vspeed;a.gravityDirection=0;a.gravity=gravity;a.imageSpeed=0.5;
   };
   if(s.blocktimer===1){vfx(-8,1);vfx(8,2);}
   if(s.blocktimer===3||s.blocktimer===6)vfx(rt.random.choose(-8,8),2);
   if(s.blocktimer===15){s.blocktimer=0;s.blockanim=0;s.idlesprite='spr_roaringknight_idle';}
  }
 };
 const afterStep:Step=(s,rt)=>{
  const g=rt.globals;
  if(s.state===3)enemyHurt(s,rt);
  if(s.end_cutscene_version===1){
   s.endtimer++;
   if(s.endtimer===32){
    scrFadeout(s,rt,15);
    for(const o of named(rt,'obj_fadeout')){o.imageBlend=C.white;o.x-=40;o.length*=2;}
   }
   if(s.endcon===1&&s.endtimer>45){
    g.flag[50]=0;g.flag[51]=1;
    for(const name of ['obj_attackpress','obj_dmgwriter'])for(const i of named(rt,name))rt.destroy(i);
    for(const i of named(rt,'obj_ch3_PTB02'))i.teamdefeated=0;
    s.endcon=2;const end=endBattle(s,rt);end.results();end.music();
   }
  }
  if(s.chargeupcon===1){
   s.chargeuptimer++;
   if(s.chargeuptimer===1)snd(rt,'snd_knight_powerup_white');
   if(s.chargeuptimer%4===0&&s.chargeuptimer>10){
    const f=rt.create(fadeToWhite,s.x,s.y);f.depth=s.depth+1;s.fade=f.id;
    f.sprite=s.sprite;f.imageIndex=s.imageIndex;f.imageSpeed=0;f.imageXscale=s.imageXscale;f.imageYscale=s.imageYscale;f.imageAlpha=0.6;f.speed=4;f.direction=rt.random.random(360);
   }
   if(s.chargeuptimer===60)g.turntimer=1;
  }
 };
 /** User 0: the next attack of his phase. Phase 4 (from 80% HP) is the rotating slash, the charge, then the roar. */
 const chooseAttack:Step=s=>{
  if(s.phase!==4){s.turn++;s.phaseturn++;}
  const pick=(p:number)=>{const t=PHASES[p][s.phaseturn];if(t)[s.myattackchoice,s.difficulty]=t;};
  if(s.phase===1){pick(1);if(s.phaseturn===5){s.phase=2;s.phaseturn=0;}}
  if(s.phase===2){pick(2);if(s.phaseturn===5){s.phase=3;s.phaseturn=0;}}
  if(s.phase===3){pick(3);if(s.phaseturn===5){s.rotatingslash3used=1;s.phaseturn=0;}}
  if(s.phase===4){
   s.phase4turn++;
   if(s.phase4turn===1&&s.rotatingslash3used===1)s.phase4turn=2;
   if(s.phase4turn===1){s.myattackchoice=5;s.difficulty=2;}
   if(s.phase4turn===2){s.myattackchoice=-1;s.difficulty=1;}
   if(s.phase4turn===3){s.myattackchoice=9;s.difficulty=0;s.damagereduction=0.4;s.haveusedroaring=1;s.phase=3;}
  }
 };
 const draw:Step=(s,rt)=>{
  const g=rt.globals,me=s.myself,roaring=()=>rt.exists(object('obj_knight_roaring2'));
  if(!roaring())s.siner2++;
  if(rt.exists(object('obj_knight_swordtunnelanim')))return;
  if(s.chargeupcon===2){
   s.chargeuptimer++;rt.drawSpriteFog(s.idlesprite,s.siner,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,(10-s.chargeuptimer)/10);
   if(s.chargeuptimer===10){s.chargeupcon=3;s.imageAlpha=0;}
   return;
  }
  if(s.state===0||s.state===3){
   s.imageIndex=0;s.y=s.ystart+Math.cos(s.siner2/8)*8;s.aetimer++;
   if(s.aetimer%4===0&&!eq(s.imageAlpha,0)&&s.chargeupcon===0){
    if(s.state===0&&!roaring()){const a=rt.create(afterimage,s.x,s.y);a.depth=s.depth+1;s.afterimage=a.id;a.sprite='spr_roaringknight_idle';a.imageIndex=s.imageIndex;}
    if(s.state===3){
     const a=rt.create(afterimage,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy);a.depth=s.depth+1;s.afterimage=a.id;a.imageIndex=s.imageIndex;
     if(s.hurttimer%2===0||s.stronghurtanim===0)a.sprite=s.idlesprite;else{a.sprite='spr_roaringknight_ball_transition';a.imageIndex=7;}
    }
    const a=rt.byId(s.afterimage);if(!a)throw Error("The Knight's afterimage is gone");
    a.imageAlpha=0.6;a.fadeSpeed=0.02;a.hspeed=2;a.imageSpeed=0;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;
   }
  }
  if(s.end_cutscene_version===1){s.stronghurtanim=1;s.state=3;s.shakex=0;}
  if(s.state===3&&s.hurttimer>=0){
   if(s.haveusedroaring===1&&s.end_cutscene_version===0&&le(g.monsterhp[me],g.monstermaxhp[me]*0.8)&&s.endcon!==1)defeated(s,rt);
   const ball=s.end_cutscene_version===1?!(s.hurttimer%3===0||s.stronghurtanim===0):!(s.hurttimer%2===0||s.stronghurtanim===0);
   if(ball)rt.drawSprite('spr_roaringknight_ball_transition',7,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,s.imageBlend,1);
   else rt.drawSprite(s.idlesprite,s.siner,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,s.imageBlend,1);
   if(s.hurttimer===29&&s.stronghurtanim===1&&s.end_cutscene_version===0)snd(rt,'snd_knight_hurtb');
   if(s.hurttimer===15)s.stronghurtanim=0;
  }
  enemyDrawIdleGeneric(s,rt,1/6);
  if(s.whiteflash>0){
   s.whiteflash--;
   if(s.state===3&&s.hurttimer>=0)rt.drawSpriteFog(s.hurtsprite,0,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,C.white,0.62);
   if(s.state===0)rt.drawSpriteFog(s.idlesprite,s.siner,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,0.62);
  }
  if(s.chargeupcon===1)rt.drawSpriteFog(s.idlesprite,s.siner,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,C.white,s.chargeuptimer/10);
  if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
 };
 /** Hit to 80% after his roar: the party's attacks stop and his ending starts (end_cutscene_version 1). */
 const defeated=(s:GmInstance,rt:GmRuntime)=>{
  const g=rt.globals;
  for(const p of named(rt,'obj_spellphase')){attackPhase(rt);const w=rt.byId(p.spellwriter);if(w)rt.destroy(w);for(const f of named(rt,'obj_face'))rt.destroy(f);rt.destroy(p);}
  s.end_cutscene_version=1;s.endcon=1;rt.sourceAudio?.volume(g.batmusic[1],0,1);
  const inst=rt.create(shake,s.x,s.y);s.inst=inst.id;if(inst.live){inst.shakex=30;inst.shakey=8;inst.shakespeed=2;}
  s.stronghurtanim=1;s.hurttimer=999;
  snd(rt,'snd_knight_hurt',1,0.8);snd(rt,'snd_knight_hurt',0.7,0.8);snd(rt,'snd_knight_hurt',1.3,0.8);
 };
 const ending=(s:GmInstance)=>s.end_cutscene_version>0;
 return defineEnemy({...object('obj_knight_enemy'),depth:0},{
  create:(s,rt)=>{
   const g=rt.globals;enemyObjectInit(s,rt);
   Object.assign(s,{recruitcount:5,talkmax:90,imageSpeed:1/6,idlesprite:'spr_roaringknight_idle',hurtsprite:'spr_roaringknight_idle',sparedsprite:'spr_roaringknight_hurt',
    custom_draw_example:1,siner:0,siner2:0});
   const intro=rt.first(object('obj_ch3_PTB02_roaringknight'));if(intro){s.siner2=intro.siner2;s.ystart=intro.ystart;s.y=intro.y;}
   Object.assign(s,{aetimer:0,combo_power:1,first_attack:4,second_attack:2,third_attack:3,rotatingslash3used:0,holdbreathcount:0,sactcount:0,ractcount:0,
    chargeupcon:0,chargeuptimer:0,turn:0,phaseturn:0,phase:1,myattackchoice:0,endcon:0,endtimer:0,end_cutscene_version:0,balloonturn:0});
   const c=findController(rt);if(c){gmArray(c,'cantspare');c.cantspare[0]=1;}
   Object.assign(s,{talkedcon:0,ralseitalks:0,susietalks:0,balloonorder:0,ballooncon:0,balloonend:1,blocking:1,blockanim:0,blockcon:0,blocktimer:0,introtimer:0,
    damagereduction:0.04,damagereductiontimer:0,krisdamagereduction:0.5,whiteflash:0,haveusedroaring:0,suddenlyattackrose:0,checkcount:0,aoedamage:0,
    stronghurtanim:0,debugvar:0,progamer:1,krisdownmessage:0,susiedownmessage:0,ralseidownmessage:0,setdownmessage:0,damagecounter:0,phase4turn:0});
   g.firstknightbattle='firstknightbattle' in g?g.firstknightbattle+1:1;
   s.overrideAttack=0;
   for(const h of rt.all(object('obj_herosusie'))){
    Object.assign(h,{normalsprite:'spr_susier_dark_unhappy',idlesprite:'spr_susieb_idle_serious',defendsprite:'spr_susieb_defend_unhappy',actreadysprite:'spr_susieb_actready',
     attacksprite:'spr_susieb_attack_serious'});
    if(g.charweapon[2]===0)h.idlesprite='spr_susieb_idle_unarmed_unhappy';
    Object.assign(h,{itemsprite:'spr_susieb_item_unhappy',itemreadysprite:'spr_susieb_itemready_unhappy',spellreadysprite:'spr_susieb_spellready_unhappy',
     spellsprite:'spr_susieb_spell_unhappy',defeatsprite:'spr_susie_dw_fell'});
   }
   for(const b of named(rt,'obj_battleback'))rt.destroy(b);
   rt.create(fountain,s.x,s.y);
   g.tempflag[96]=0;
  },
  beforeStep,
  startTalk:talk,duringTalk,endTalk,
  attack,attackWait:()=>{},holdsAttack:s=>s.end_cutscene_version!==0,statusLine,afterAttack,
  acts,afterStep,
  hooks:{
   blocksControllerStep:ending,hidesBattleHud:ending,hidesTensionBar:ending,hidesHpPercent:()=>true,
   onPartyHit:e=>{e.progamer=0;},
   redirectsHit:(e,b,rt)=>redirect(e,b,rt),
   redirectsMaxHpHit:(e,b,rt)=>{if(!rt.exists(object('obj_knight_roaring2')))redirect(e,b,rt,true);},
   scalesMaxHpRatio:(e,b,rt,ratio)=>!rt.exists(object('obj_knight_roaring2'))&&eq(e.aoedamage,0)&&mantle(rt,b.target)?ratio/2:ratio,
   catchesMaxHpKnockout:(_e,b,rt)=>{
    const g=rt.globals;
    if(lt(g.hp[1],0)){
     g.hp[1]=1;b.hpdiff=round(g.hp[b.chartarget]-1);b.doomtype=4;
     b._charactor='kris';b._charinstance=object('obj_herokris').index;b._charnum=1;
     for(const h of rt.withInstances(object('obj_herokris'))){h.state=8;h.hurt=0;h.attacktimer=0;h.sprite='spr_kris_fallen_dark';h.imageSpeed=.25;h.imageIndex=0;g.faceaction[h.myself]=0;}
    }else{b.doomtype=12;b.hpdiff=round(g.hp[b.chartarget]+999);g.hp[b.chartarget]=-999;dead(rt,b.target);}
    return true;
   },
   reducesHit:(_e,rt,slot,d)=>mantle(rt,slot)?round(d*0.33):undefined,
   softensHit:(e,_rt,d)=>e.myattackchoice===2&&(e.difficulty===1||e.difficulty===3)?round(d*0.66):undefined,
   knocksOutHard:(_e,_rt,slot)=>slot!==0,
   preventsGameOver:()=>true,preventsTurnRevive:()=>true,
   // His battle ends without the victory screen: won once his ending's results are in (endcon 2), lost on a first
   // party wipe; either way once the panel has slid away.
   battleOutcome:(e,rt)=>{
    const c=findController(rt);if(!c||c.intro!==2||c.bp>0)return undefined;
    if(e.endcon===2)return 'victory';
    if(e.endcon===1&&e.end_cutscene_version===0&&rt.globals.fighting===0)return 'defeat';
    return undefined;
   },
   blocksFight:e=>e.blocking===1&&lt(e.damagereduction,0.1),
   onFightBlocked:e=>{e.blockanim=1;},
   scalesFightDamage:(e,hero,rt,d)=>fightDamage(e,hero,rt,d),
   scalesRudeBuster:(e,_rt,d)=>Math.ceil(d*(e.damagereduction+0.65)),
   onEnemyDamaged:(e,_rt,amount)=>{if(amount>=100)e.stronghurtanim=1;},
   defeatSprite:(_e,hero)=>hero.object.name==='obj_herosusie'?'spr_susie_dw_fell':undefined,
  },
  events:{
   draw,
   endStep:(s,rt)=>{
    if(isPhase(rt,'bullets',s)&&s.myattackchoice===0){const h=rt.first(heart);if(s.myattackchoice===0&&h&&h.x>rt.view.x+165)h.x=rt.view.x+165;}
    if(s.end_cutscene_version===1)for(const w of named(rt,'obj_dmgwriter'))rt.destroy(w);
   },
   user0:chooseAttack,
   user2:wholePartyHit,
   user3:recordDefeat,user4:()=>{},
   alarm6:s=>{if(s.balloonend===1)s.talked=1;else{s.talked=0.6;s.talktimer=0;}},
   cleanup:(_s,rt)=>{rt.globals.invc=1;},
  },
 });
}
/** User 2: a hit on each standing hero for 40, or down to 1 HP for one with 2 to 40 (his heavy attacks). */
function wholePartyHit(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;if(!lt(g.inv,0))return;
 s.remdamage=s.damage;s._temptarget=s.target;
 for(s.ti=0;s.ti<3;s.ti+=1){
  g.inv=-1;s.damage=40;const hp=g.hp[s.ti+1];
  if(hp>1&&hp<41)s.damage=hp-1;
  s.target=s.ti;if(g.hp[g.char[s.ti]]>0&&g.char[s.ti]!==0)damage(s,rt);
 }
 g.inv=g.invc*30;s.target=s._temptarget;
}
/** FIGHT damage against him: his damage reduction, and Kris hits at half strength while both friends stand, double
 * when both are down. */
function fightDamage(k:GmInstance,hero:GmInstance,rt:GmRuntime,damage:number){
 const g=rt.globals;let d=Math.ceil(damage*k.damagereduction);
 if(hero.object.name==='obj_herokris'){
  if(lt(g.hp[2],0)&&lt(g.hp[3],0))d*=2;
  else if(lt(g.hp[2],0)||lt(g.hp[3],0))d*=1;
  else d=round(d*0.5);
 }
 return d;
}
/** Whether the hero in this party slot wears the Shadow Mantle (armor 23), which cuts the Knight's hits to a third. */
function mantle(rt:GmRuntime,slot:number){const g=rt.globals,c=slot+1;return g.chararmor1[c]===23||g.chararmor2[c]===23;}
/** scr_damage's Knight targeting: his ordinary hits spare Kris while Susie or Ralsei stands, and a Shadow Mantle draws
 * his first two hits (each counted in damagecounter); after that he picks anyone standing. */
function redirect(k:GmInstance,b:GmInstance,rt:GmRuntime,maxHp=false){
 const g=rt.globals;if(k.aoedamage!==0)return;
 if(b.target===0){
  if(g.hp[2]>0&&g.hp[3]>0)b.target=rt.random.choose(1,2);
  else if(g.hp[2]>0)b.target=1;
  else if(g.hp[3]>0)b.target=2;
 }
 if(k.myattackchoice===13||![0,1,2].some(slot=>mantle(rt,slot)))return;
 k.damagecounter++;
 if(k.damagecounter<3){
  if(g.hp[1]>0&&mantle(rt,0))b.target=0;
  if(g.hp[2]>0&&mantle(rt,1))b.target=1;
  if(g.hp[3]>0&&mantle(rt,2))b.target=2;
  return;
 }
 b.target=rt.random.choose(0,1,2);
 for(let r=0;r<2;r++){
  if(lt(g.hp[1],1)&&b.target===0)b.target++;
  if(lt(g.hp[2],1)&&b.target===1)b.target++;
  if(lt(g.hp[3],1)&&b.target===2)b.target++;
  if(b.target>2)b.target=0;
 }
 // The original's conditions group as (target == n && armor1) || armor2, so a mantle in any armor2 slot keeps the count.
 const a1=g.chararmor1,a2=g.chararmor2;
 if(maxHp){if(!mantle(rt,b.target))k.damagecounter=0;}
 else if(!((b.target===0&&a1[1]===23)||a2[1]===23||(b.target===1&&a1[2]===23)||a2[2]===23||(b.target===2&&a1[3]===23)||a2[3]===23))k.damagecounter=0;
}
/** scr_get_knight_total_attempts: how many save slots have fought him before (dr.ini's URA values); the host knows. */
function knightAttempts(rt:GmRuntime):number{
 const attempts=rt.globals.secretbossattempts;
 if(typeof attempts!=='number')throw Error("The Knight's previous attempts (scr_get_knight_total_attempts) are not set by the host");
 return attempts;
}
