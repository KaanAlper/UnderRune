import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyObjectInit,enemyDrawIdleGeneric,priorityTarget,heroBlcon,monsterPop} from '../../deltarune/chapter2-enemy';
import {darkener,growtangle,heart,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {mnEndTurn,monsterDefeat,randomTarget,winCombat} from '../../deltarune/controller';
import {blconSkip,bulletSpawner,isPhase,msgSet,moveToPointOverTime,turnTimer} from '../../deltarune/chapter2-battle';
import {battleBalloon2,enemyBlcon2} from '../../deltarune/chapter2-objects';
import {writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
import {berdlyRematchActs,type RivalDialogue} from './berdly-acts';

export interface BerdlyRematchServices{
 dialogue:RivalDialogue;
 monsterAdd(s:GmInstance,rt:GmRuntime,type:number,object:GmObjectDef):number;
 /** Source spell-phase aftermath owns the overworld party transition and scene actors. */
 snowgraveScene(s:GmInstance,rt:GmRuntime):void;
}
export function rivalRoutePhase(rt:GmRuntime){const f=rt.globals.flag;if(f[916]!==0)return 0;const n=f[915];return n>=20?4:n>=7?3:n>=4?2:n>0?1:0;}
const T=(key:string)=>sourceText('obj_berdlyb2_enemy_slash_Step_0_gml_'+key);
function balloon(s:GmInstance,rt:GmRuntime,key?:string){if(key)msgSet(rt,0,T(key));enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);}
function done(s:GmInstance){s.talked=1;s.talktimer=0;}
/** obj_berdlyb2_enemy. Setup must supply the real Kris/Noelle party and spare slots for his two Werewires. */
export function createBerdlyRematch(object:(name:string)=>GmObjectDef,services:BerdlyRematchServices):GmObjectDef{
 const base=object('obj_berdlyb2_enemy');
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  create:(s,rt)=>{
   enemyObjectInit(s,rt);Object.assign(s,{berdlytalk:69,noelletalk:76,default_talkmax:90,talkmax:90,imageSpeed:1/6,sideb_route:rivalRoutePhase(rt)>0});
   Object.assign(s,{idlesprite:s.sideb_route?'spr_berdlyb_idle_serious':'spr_berdlyb_idle',hurtsprite:'spr_berdly_shocked_left_battle',sparedsprite:'spr_berdly_hurt_kneel_battle',difficulty:1,kact_count:0,spill:false,nact_count:0,naction_count:0,hurt_noelle:false,hurt_noelle_talk:false,noelle_hp_start:rt.globals.hp[4],bulletoverride:-1,kris_defeat_talk:false,kris_defeat_con:0,balloon_con:0,wirewait:false,summoning:false,freezable:0,mercy_add_amount:0,berdly_last_line:'',sidebcon:0,snowgrave_con:0,snowgrave_counter:0,attack_phase:0,chosenattack:0,talkcon:0,summontimer:0,rr:0,endbattle:0});
  },
  startTalk:(s,rt)=>{
   const g=rt.globals,route=rivalRoutePhase(rt);s.talkcon=0;
   if(route===0){if(s.turns===0)s.mytarget=0;priorityTarget(s,rt,3,1,0);}else if(g.charcantarget[0]===1)g.targeted[0]=1;else randomTarget(s,rt);
   if(!rt.exists(darkener))rt.create(darkener,0,0);
   if(!s.hurt_noelle){if(g.hp[4]<s.noelle_hp_start)s.hurt_noelle=true;else if(g.hp[4]>s.noelle_hp_start)s.noelle_hp_start=g.hp[4];}
   g.typer=69;if(s.sideb_route)s.rr=2-s.rr;else if(s.turns===2||monsterPop(rt)>1)s.rr=rt.random.irandom(2);else s.rr=s.attack_phase;
   if(s.rr===0){s.chosenattack=0;msgSet(rt,0,T('41_0'));}if(s.rr===1){s.chosenattack=2;msgSet(rt,0,T('42_0'));}if(s.rr===2){s.chosenattack=1;msgSet(rt,0,T('40_0'));}
   if(route===0){
    const noBalloon=!rt.exists(battleBalloon2);
    if(s.turns===0){s.talkmax+=30;balloon(s,rt,'47_0');done(s);}
    if(s.turns===1){if(s.balloon_con===0){s.balloon_con=1;s.alarm[7]=30;g.typer=69;balloon(s,rt,'79_0');}if(s.balloon_con===2&&noBalloon){s.balloon_con=0;g.typer=69;balloon(s,rt,'88_0');done(s);}}
    if(s.turns===2){if(s.balloon_con===0){s.balloon_con=1;s.alarm[7]=30;g.typer=69;balloon(s,rt,'98_0');}else if(s.balloon_con===2&&noBalloon){s.balloon_con=0;g.typer=69;msgSet(rt,0,T('128_0'));s.summoning=true;s.wirewait=true;balloon(s,rt);done(s);}}
    if(s.turns===3){
     if(s.balloon_con===0){s.balloon_con=1;s.alarm[7]=30;g.typer=69;balloon(s,rt,'146_0');}
     else if(s.balloon_con===2&&noBalloon){s.balloon_con=monsterPop(rt)===1?3:0;g.typer=69;balloon(s,rt,'161_0');if(monsterPop(rt)>1)done(s);}
     else if(s.balloon_con===3&&noBalloon){s.balloon_con=4;s.alarm[7]=45;}
     else if(s.balloon_con===5&&noBalloon){s.balloon_con=0;g.typer=69;balloon(s,rt,'182_0');done(s);}
    }
    if(s.turns===4){
     if(s.balloon_con===0){s.balloon_con=1;s.alarm[7]=30;g.typer=69;if(monsterPop(rt)>1)msgSet(rt,0,T('199_0'));else{msgSet(rt,0,T('202_0'));s.talkmax+=30;}balloon(s,rt);}
     if(s.balloon_con===2&&noBalloon){s.balloon_con=0;g.typer=69;if(monsterPop(rt)>1)msgSet(rt,0,T('215_0_b'));else{msgSet(rt,0,T('218_0_b'));s.talkmax+=60;}balloon(s,rt);done(s);}
    }
    if(s.turns===5){
     if(s.balloon_con===0){s.balloon_con=1;if(monsterPop(rt)===1){s.alarm[7]=30;g.typer=69;msgSet(rt,0,T('241_0'));}else{if(g.hp[4]>=0)s.alarm[7]=30;else done(s);g.typer=69;msgSet(rt,0,T('171_0'));}balloon(s,rt);}
     if(s.balloon_con===2&&noBalloon){s.balloon_con=0;if(monsterPop(rt)===1)balloon(s,rt,'266_0_b');else{g.typer=76;msgSet(rt,0,T('180_0'));const b=heroBlcon(s,rt,'noelle');s.balloon=b?b.id:false;}done(s);}
    }
    if(s.turns>5){if(s.hurt_noelle&&!s.hurt_noelle_talk){s.hurt_noelle_talk=true;g.typer=69;balloon(s,rt,'54_0');if(g.hp[4]>0){g.typer=76;msgSet(rt,0,T('57_0'));heroBlcon(s,rt,'noelle');}}else balloon(s,rt);done(s);}
   }else{
    if(g.hp[1]<=0&&s.kris_defeat_con<99)s.kris_defeat_talk=true;else done(s);
    if(s.kris_defeat_talk){
     for(const [con,next,key] of [[0,1,'226_0'],[2,3,'236_0'],[4,5,'247_0'],[6,7,'258_0']] as const){if(s.kris_defeat_con===con&&(con===0||!rt.exists(battleBalloon2))){s.kris_defeat_con=next;s.alarm[6]=30;g.typer=69;balloon(s,rt,key);}}
     if(s.kris_defeat_con===8&&!rt.exists(battleBalloon2)){g.typer=76;msgSet(rt,0,T('266_0'));heroBlcon(s,rt,'noelle');s.kris_defeat_con=99;done(s);}
    }
   }
  },
  duringTalk:(s,rt)=>{
   if(!s.summoning)return;
   if(s.summontimer===0){const count=3-monsterPop(rt);for(let i=0;i<count;i++){
    const slot=services.monsterAdd(s,rt,33,object('obj_werewire_enemy')),w=rt.byId(rt.globals.monsterinstance[slot])!;
    Object.assign(w,{skiptext:true,x:rt.view.x+740,y:rt.globals.monstermakey[w.myself],rtimer:0,talkwait:1});moveToPointOverTime(w,rt,rt.globals.monstermakex[w.myself],rt.globals.monstermakey[w.myself],20);
   }}s.summontimer++;if(s.summontimer>=20){s.talkcon=1;s.summoning=false;}
  },
  endTalk:(s,rt)=>{
   if(s.talked===1&&isPhase(rt,'enemytalk',s)&&!s.summoning){
    s.talkcon=1;s.rtimer=0;
    if(s.wirewait){for(const w of rt.all(object('obj_werewire_enemy')))w.talkwait=2;s.wirewait=false;}
    else if(s.summontimer!==0){if(rt.exists(object('obj_werewire_zzt_balloon')))s.summontimer=-1;else if(s.summontimer===-1&&!rt.exists(object('obj_werewire_zzt_balloon')))s.summontimer=0;}
    else if(!rt.exists(writer))blconSkip(s,rt,-1);else{blconSkip(s,rt,15);if(rt.globals.mnfight===2)s.talkmax=s.default_talkmax;}
   }
   if(isPhase(rt,'bullets',s)&&s.talkcon===1){s.summontimer=0;s.talkcon=0;
    if(rivalRoutePhase(rt)!==0&&rt.globals.hp[1]<=0){for(const d of rt.all(darkener))d.darken=0;mnEndTurn(s,rt);}
    else{s.difficulty=monsterPop(rt)===1?1:0;if(!rt.exists(moveHeart)&&!rt.exists(heart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);if(s.difficulty===1&&s.chosenattack===0)rt.first(growtangle)!.target_angle+=45;}
   }
  },
  attackDelay:16,
  attack:(s,rt)=>{s.rtimer=0;const g=rt.globals;g.monsterattackname[s.myself]=['Tornado','SpearBlast','Chirashi'][s.chosenattack];const dc=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=dc.id;dc.type=[8,9,10][s.chosenattack];dc.difficulty=s.chosenattack===1&&s.sideb_route?2:s.difficulty;turnTimer(rt,260);},
  statusLine:(s,rt)=>{const g=rt.globals;if(!s.sideb_route&&monsterPop(rt)===1)s.attack_phase=(s.attack_phase+1)%3;s.rr=rt.random.choose(0,1,2,3,4,5);g.battlemsg[0]=T(['124_0','125_0','126_0','127_0','338_0','339_0'][s.rr]);if(rivalRoutePhase(rt)>0)g.battlemsg[0]=' ';},
  acts:(s,rt)=>berdlyRematchActs(s,rt,services.dialogue,rivalRoutePhase(rt)),actsDone:()=>{},
  afterStep:services.snowgraveScene,
  events:{alarm5:s=>{s.sidebcon++;},alarm6:s=>{s.kris_defeat_con++;},alarm7:s=>{s.balloon_con++;},alarm8:(s,rt)=>{rt.globals.mnfight=2;s.rtimer=0;},user10:(s,rt)=>monsterDefeat(s,rt),
   draw:(s,rt)=>{
    const g=rt.globals;if(s.state===3){s.hurttimer--;if(s.hurttimer<0&&g.monster[s.myself]===1)s.state=0;
     else{if(g.monster[s.myself]===0&&!rt.exists(writer)){s.hurtsprite='spr_berdly_hurt_kneel_battle';if(s.endbattle===0){s.endbattle=1;if(g.flag[915]===5&&g.flag[916]===0){const noe=rt.first(object('obj_heronoelle'))!;rt.create(object('obj_berdlyb2_postBattle_noelle'),noe.x,noe.y);g.flag[916]=1;}winCombat(rt);}}
      s.hurtshake++;if(s.hurtshake>1){if(s.shakex>0)s.shakex--;if(s.shakex<0)s.shakex++;s.shakex=-s.shakex;s.hurtshake=0;}rt.drawSprite(s.hurtsprite,0,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,s.imageBlend,1);
     }
    }enemyDrawIdleGeneric(s,rt,1/6);if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
   },
  },
 });
}
