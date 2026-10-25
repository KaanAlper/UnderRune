/** Solo-Kris NEO strategy: the route changes ACTs and its ending, not the shared combat loop. */
import {type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {round} from '../../gm/math';
import {defineEnemy} from '../../deltarune/enemy';
import {neoStrategy,startNeoTalk} from './neo';
import {darkMarker,dmgWriter,heroKris,returnHeart,sndFree} from '../../deltarune/battle';
import {findController,nextAct,winCombat,button3_p} from '../../deltarune/controller';
import {isPhase,msgSet,msgNext,snd} from '../../deltarune/chapter2-battle';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {actCharSprite,actCharSpriteEnd,smallFace} from '../../deltarune/chapter2-enemy';
import {damageEnemy,healItem} from '../../deltarune/party';
import {basicAttack} from '../../deltarune/player-effects';
import {sourceText} from '../../host/text';
import type {NeoSourceHost} from './body-source';

const T=(key:string)=>sourceText(`obj_spamton_neo_enemy_slash_Step_0_gml_${key}`);
const L=(n:number)=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${n}_0`);
const OPEN:readonly (readonly [string,number])[]=[['64_0_c',16],['65_0_b',17],['66_0_b',0],['67_0_b',0],['68_0_b',18],['69_0_c',19],['70_0_c',20],['71_0_b',21],['72_0_b',22],['73_0_b',23]];
const FOLLOW:Record<number,[string,number]>={
 16:['174_0',0],17:['175_0',0],18:['176_0',0],19:['177_0',0],20:['178_0',0],21:['179_0',0],22:['180_0',0],23:['181_0',24],24:['182_0',0],
 28:['211_0',29],29:['212_0',30],30:['213_0',31],31:['214_0',32],32:['217_0',33],33:['225_0',0],
 35:['227_0',36],36:['228_0',37],37:['229_0',0],38:['231_0',39],39:['232_0',40],40:['233_0',0],41:['235_0',42],42:['236_0',0],43:['238_0',44],44:['239_0',45],45:['240_0',0],
};

function opening(s:GmInstance):[string,number]|undefined{
 if(s.weirdpathendcon>0){
  if(s.weirdpathendcon===1){s.weirdpathendcon=2;return ['86_0_b',28];}
  if(s.usedact===0){s.weirdpathendcon=2;return ['87_0_b',0];}
  const calls:Record<number,[string,number,number]>={2:['88_0',35,3],3:['89_0',38,4],4:['90_0',41,5],5:['91_0',43,6]};
  const line=calls[s.savemeactcon];
  if(line){s.weirdpathendcon=line[2];if(line[2]===6)Object.assign(s,{shockthreshold:10,hurttimer2:10,partmode:40});return [line[0],line[1]];}
  return undefined;
 }
 if(s.balloonorder<10&&!s.haveusedfinalattack){const line=OPEN[s.balloonorder++];return [...line];}
 if(s.rr===9&&s.finalattackconversationcon===0)return ['93_0',25];
 return undefined;
}
function beforeTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 if(g.monsterhp[me]<=1)g.monsterhp[me]=1;
 if((isPhase(rt,'enemytalk',s)&&g.monsterhp[me]<=g.monstermaxhp[me]*.1&&s.weirdpathendcon===0)||(s.talked===-1&&s.weirdpathendcon===0)){
  s.weirdpathendtimer++;
  if(s.weirdpathendtimer===1){s.talked=-1;s.partmode=99;rt.sourceAudio?.volume(g.batmusic[1],0,30);}
  if(s.weirdpathendtimer===91){s.talked=0;s.weirdpathendcon=1;}
 }
}
function duringTalk(s:GmInstance,rt:GmRuntime,host:NeoSourceHost){
 if(s.talked!==.6||!FOLLOW[s.ballooncon]){neoStrategy.duringTalk!(s,rt);return;}
 s.talktimer++;
 // The native C shortcut is handled by button3_p in the normal strategy as well.
 if(!(button3_p(rt)&&s.talktimer>15)&&rt.exists(writer))return;
 destroyWriters(rt);const previous=s.ballooncon,[key,next]=FOLLOW[previous];
 msgSet(rt,0,T(key));s.ballooncon=next;s.balloonend=next===0?1:0;
 if(previous===31){s.specialcon=1;snd(rt,'snd_cardrive');}
 if(previous===32){
  s.partmode=1;host.call('snd_free',s,rt,[rt.globals.currentsong[1]]);const g=rt.globals;
  g.currentsong[0]=host.call('snd_init',s,rt,['spamton_neo_meeting.ogg']);g.currentsong[1]=host.call('mus_play',s,rt,[g.currentsong[0]]);
  host.call('mus_loop',s,rt,[g.currentsong[0]]);host.call('snd_pitch',s,rt,[g.currentsong[0],1.8]);
 }
 if(previous===33){s.savemeactcon=1;rt.userEvent(s,1);}
 if(previous===43)s.partmode=40;
 if(previous===45)s.weirdpathendcon=7;
 s.talked=.7;s.talktimer=0;
 if(s.correct_answer!==1){if(next===32)battleTextDefault(rt,s);else{rt.globals.typer=72;enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);}}
 s.correct_answer=-1;s.alarm[6]=1;
}

function slash(s:GmInstance,rt:GmRuntime,second=false){
 if(second)actCharSpriteEnd(s,rt);
 s.krs=actCharSprite(s,rt,'kris','spr_krisb_attack',.25,1);const krs=rt.byId(s.krs)!;krs.depth=rt.first(heroKris)!.depth+1;
 s.alarm[4]=14;snd(rt,'snd_scytheburst',second?.8:1.2);
 const attack=rt.create(basicAttack,s.x+57,s.y+76);s.att=attack.id;attack.imageXscale=second?-2:2;attack.imageYscale=2;
 s.caster=0;const targets=rt.globals.hittarget as number[];
 if(second)while(targets.length<12)targets.push(0);
 targets[second?11:0]=0;
 Object.assign(s,{partmode:40,shockthreshold:15,shocktimer:9999,hurttimer2:10});
 const dam=round((rt.globals.battleat[rt.first(heroKris)!.myself]*150/20-rt.globals.monsterdf[s.myself]*3)*1.25);
 damageEnemy(s,rt,0,dam);
}
function callsAndEnding(s:GmInstance,rt:GmRuntime){
 if(s.acting===1&&s.actcon===0&&s.savemeactcon>0){
  s.actcon=1;
  if(s.savemeactcon<5){msgSet(rt,0,T('617_0'));msgNext(rt,T('618_0'));battleTextDefault(rt,s);}
  else{msgSet(rt,0,T('623_0'));battleTextDefault(rt,s);s.talktimer=0;s.actcon=95;s.alarm[4]=1;}
  s.savemeactcon++;
 }
 const dialogue:Record<number,[string,number,number]>={96:['637_0',97,1],98:['651_0',99,1],100:['667_0',101,1],102:['685_0',103,15],104:['701_0',105,15],108:['739_0',109,40]};
 if(dialogue[s.actcon]&&!rt.exists(writer)){
  const stage=s.actcon,[key,next,delay]=dialogue[stage];s.talktimer++;
  msgSet(rt,0,T(key));rt.globals.typer=72;enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);
  if(stage===100){snd(rt,'snd_sneo_laugh_long');s.laughtimer=0;}
  if(stage===102){rt.soundStop?.('snd_sneo_laugh_long');s.partmode=1;}
  if(stage===108){s.partmode=99;s.headforceframe=2;}
  if(stage!==98)s.talktimer=0;s.actcon=next;s.alarm[4]=delay;
 }
 if(s.actcon===106&&!rt.exists(writer)){s.talktimer++;s.partmode=41;s.actcon=107;s.laughtimer=0;s.alarm[4]=120;sndFree(rt,s,rt.globals.currentsong[0]);}
 if(s.actcon===107&&s.alarm[4]<62){s.headforceframe=2;s.partrot[5]=30;s.partmode=99;rt.soundStop?.('snd_sneo_laugh_long');}
 if(s.actcon===110){
  s.talktimer++;
  if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){
   s.actcon=111;snd(rt,'snd_noise');destroyWriters(rt);
   for(const scene of rt.withInstances(fountainBoundary)){
    const black=darkMarker(rt,scene,-10,-10,'spr_pixel_white');Object.assign(black,{imageXscale:999,imageYscale:999,depth:-99999,imageAlpha:1,imageBlend:0});scene.blackall=black.id;
   }
   s.alarm[4]=60;
  }
 }
 if(s.actcon===112){s.actcon=113;snd(rt,'snd_icespell');s.alarm[4]=12;}
 for(const [stage,next,x,y,delay] of [[114,115,64,62,3],[116,117,84,90,3],[118,119,66,119,1]])if(s.actcon===stage){
  s.actcon=next;if(stage!==114)rt.soundStop?.('snd_damage');snd(rt,'snd_damage');
  const number=rt.create(dmgWriter,s.x+x,s.y+y);s.dmgwriter=number.id;number.damage=684+rt.random.irandom(20);number.type=6;number.depth=-999999;s.alarm[4]=delay;
 }
 if(s.actcon===120){rt.userEvent(s,3);findController(rt)!.skipvictory=1;rt.globals.fighting=0;for(const scene of rt.withInstances(fountainBoundary)){scene.forcend=1;scene.con=21;}winCombat(rt,s);}
}

export function createWeirdNeo(object:(name:string)=>GmObjectDef,host:NeoSourceHost){
 return defineEnemy({name:'obj_spamton_neo_enemy',index:702,depth:0,sprite:'spr_sneo_example'},{...neoStrategy,
  beforeStep:(s,rt)=>{neoStrategy.beforeStep!(s,rt);const c=findController(rt);if(s.cantspareinit===0&&c){c.cantspare[0]=1;s.cantspareinit=1;}rt.globals.mercymod[s.myself]=0;},
  beforeTalk,startTalk:(s,rt)=>startNeoTalk(s,rt,opening),duringTalk:(s,rt)=>duringTalk(s,rt,host),
  afterAttack:(s,rt)=>{
   if(s.weirdpathendcon===0){neoStrategy.afterAttack!(s,rt);return;}
   if(rt.exists(returnHeart)&&s.statustextupdate===0){s.statustextupdate=1;const g=rt.globals,min=g.monstermaxhp[s.myself]*.06,low=g.monsterhp[s.myself]<min;g.battlemsg[0]=T(low?'526_0':'527_0');if(low)g.monsterhp[s.myself]=min;}
  },
  acts:(s,rt)=>{
   s.xx=rt.view.x;s.yy=rt.view.y;
   if(s.savemeactcon===0&&s.acting===1)neoStrategy.acts!(s,rt);
   callsAndEnding(s,rt);
   if(s.acting===2&&s.actcon===0){msgSet(rt,0,T('531_0'));battleTextDefault(rt,s);s.acting=0;s.actcon=21;slash(s,rt);}
   if(s.actcon===22){s.actcon=23;slash(s,rt,true);}
   if(s.actcon===24){actCharSpriteEnd(s,rt);s.actcon=1;}
   if(s.acting===3&&s.actcon===0){
    const n=rt.random.irandomRange(42,5555);smallFace(s,rt,0,'none',6,'rightmid','bottom',String(n)+T('928_0'));
    msgSet(rt,0,T('581_0'));battleTextDefault(rt,s);s.acting=0;s.actcon=31;const k=rt.first(heroKris)!;rt.create(object('obj_sneo_friedpipis'),k.x+105,k.y+50);
   }
   if(s.actcon===31&&!rt.exists(writer)&&!rt.exists(object('obj_sneo_friedpipis')))s.actcon=1;
  },
  actsDone:(s,rt)=>{if(s.actcon===1&&!rt.exists(writer)){s.usedact=1;nextAct(rt,s);}},
  afterStep:(s,rt)=>{if(s.weirdpathendcon===6){s.partmode=40;s.dontchangepose=0;}if(s.stoprumblesfx>0)s.stoprumblesfx--;if(s.stoprumblesfx===1)rt.soundStop?.('snd_rumble');},
  hooks:{...neoStrategy.hooks,onTurnEnd:()=>false,canSkipEndingText:s=>s.actcon>=95,
   scalesFightDamage:(s,hero,rt,damage)=>s.weirdpathendcon>0?Math.max(5,Math.min(10,round(rt.globals.battleat[hero.myself]*hero.points/150))):damage,
  },
 });
}

/** scr_monstersetup's route ACT table; called after the common reset. */
export function setupWeirdNeo(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,i=s.myself;
 if(g.monstertype[i]!==50)return false;
 g.monstername[i]=L(1591);g.monstermaxhp[i]=4809;g.monsterhp[i]=4809;g.monsterat[i]=13;g.monsterdf[i]=-27;
 g.monsterexp[i]=0;g.monstergold[i]=0;g.sparepoint[i]=0;g.mercymod[i]=0;g.mercymax[i]=100;
 for(const [slot,name,desc,cost] of [[0,1614,0,0],[1,1643,1644,62],[2,1649,1650,80]]){
  g.canact[i][slot]=1;g.actname[i][slot]=L(name);g.actdesc[i][slot]=desc?L(desc):'';g.actcost[i][slot]=cost;
 }return true;
}
/** The source world scene hands control away at con21. The browser ends the battle at that boundary. */
export const fountainBoundary:GmObjectDef={name:'obj_fountainkris_ch2_sideb',index:21,depth:0,visible:false,sprite:'spr_krisu_bright',events:{
 create:s=>{s.con=19;s.forcend=0;},
 step:(s,rt)=>{if(s.con===21&&findController(rt)?.victoried===1)rt.pendingRoom='battle_end';},
 draw:()=>{},
}};
export const friedPipis:GmObjectDef={name:'obj_sneo_friedpipis',index:0,sprite:'spr_pipis_egg',events:{
 create:s=>{s.timer=0;s.con=0;s.imageXscale=0;s.imageYscale=0;s.imageSpeed=0;},
 step:(s,rt)=>{
  const t=++s.timer;s.imageSpeed=0;if(t===1)snd(rt,'snd_spell_cure_slight_smaller');
  if(t>0&&t<21){s.imageXscale=t/10;s.imageYscale=t/10;const v=t/20,ease=v<.5?2*v*v:1-(-2*v+2)**2/2;s.imageAngle=720*ease;}
  if(t>25&&t<36)s.x+=(rt.first(heroKris)!.x+35-s.x)*(t-25)/10;
  if(t>35){s.imageXscale+=.4;s.imageYscale+=.4;s.imageAlpha-=.1;}
  if(t===45){s.star=0;healItem(s,rt,120);rt.destroy(s);}
 },
}};
