// obj_sweet_enemy: the band's leader. She plays the solo track the musical bullets follow, starts each turn's song
// controller, runs the scene in which Susie learns to ACT, and ends the battle once all three are dancing.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {actCharSprite,actCharSpriteEnd,anyFaceNext,enemyDrawHurtGeneric,enemyDrawIdleGeneric,enemyObjectInit,speaker} from '../../deltarune/chapter2-enemy';
import {afterimage,darkener,growtangle,heroParent,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {blconSkip,drawBodyPart,isPhase,msgNext,msgSet} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {monsterPop,winCombat} from '../../deltarune/controller';
import {oflash} from '../../deltarune/party';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';
import {battleText,battleTextDefault,writer} from '../../deltarune/writer';
import {moveTowardsPoint} from '../../gm/runtime';
import {sourceText} from '../../host/text';
import {trioDanceActs} from './trio-dance';
import {trioAttack} from './trio-turn';

const T=(key:string)=>sourceText('obj_sweet_enemy_slash_Step_0_gml_'+key),D=(key:string)=>sourceText('obj_sweet_enemy_slash_Draw_0_gml_'+key);
/** GML string() of a number: whole numbers as they are, others with two decimals. */
const gmlString=(v:number)=>Number.isInteger(v)?String(v):v.toFixed(2);
/** The solo track's length in frames (the recordings see it wrap there; the score's last beat is 3219). */
const SOLO_FRAMES=3225;

export function createSweetEnemy(object:(name:string)=>GmObjectDef):GmObjectDef{
 const base=object('obj_sweet_enemy');
 const controller=(rt:GmRuntime)=>{const c=rt.first(object('obj_musical_controller'));if(!c)throw Error('Sweet needs obj_musical_controller');return c;};
 const kk=(rt:GmRuntime)=>rt.first(object('obj_kk_enemy')),capn=(rt:GmRuntime)=>rt.first(object('obj_hatguy_enemy'));
 const ralsei=(rt:GmRuntime)=>{const r=rt.first(object('obj_heroralsei'));if(!r)throw Error("Sweet's dance scene needs Ralsei");return r;};
 const clearTrails=(rt:GmRuntime)=>{for(const a of rt.withInstances(afterimage))rt.destroy(a);for(const f of rt.withInstances(oflash))rt.destroy(f);};
 const marker=(rt:GmRuntime,id:number)=>{const m=rt.byId(id);if(!m)throw Error("Sweet's dance scene lost a dancer");return m;};
 /** The scene in which Susie learns S-Action (dancecon 1 to 4), whether or not Sweet is still in the fight. */
 function danceScene(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  if(s.dancecon===1){
   s.learnedAct=true;for(const e of rt.withInstances(object('obj_hatguy_enemy')))e.learnedAct=true;for(const e of rt.withInstances(object('obj_kk_enemy')))e.learnedAct=true;
   speaker(s,rt,'susie');
   if(g.hp[1]<=0){
    msgSet(rt,0,T('184_0'));msgNext(rt,T('185_0'));msgNext(rt,T('186_0'));anyFaceNext(s,rt,'ralsei','2');msgNext(rt,T('188_0'));anyFaceNext(s,rt,'susie','L');msgNext(rt,T('190_0'));
   }else{
    msgSet(rt,0,T('280_0'));anyFaceNext(s,rt,'ralsei','L');msgNext(rt,T('198_0'));msgNext(rt,T('199_0'));anyFaceNext(s,rt,'susie','H');msgNext(rt,T('201_0'));
   }
   anyFaceNext(s,rt,'ralsei','Q');msgNext(rt,T('204_0'));anyFaceNext(s,rt,'susie','5');msgNext(rt,T('206_0'));
   battleText(rt,s);s.dancecon=1.1;
  }
  if(s.dancecon===1.1&&!rt.exists(writer)){
   const susie=marker(rt,actCharSprite(s,rt,'susie','spr_susie_dance',.16,1));s.susi=susie.id;susie.depth=ralsei(rt).depth+1;clearTrails(rt);
   g.flag[34]=0;s.learnedhowtoact=1;
   // The band's third ACT (Kris's dance with Susie and Ralsei) goes: Susie and Ralsei now ACT for themselves.
   for(const e of [s,kk(rt),capn(rt)]){if(!e)throw Error("Sweet's dance scene needs the whole band");const m=e.myself;g.canact[m][2]=0;g.actname[m][2]='';g.actcost[m][2]=0;g.actactor[m][2]=0;}
   spellMenuSetupChapter2(rt,s);
   speaker(s,rt,'none');msgSet(rt,0,T('266_0'));anyFaceNext(s,rt,'ralsei','L');msgNext(rt,T('268_0'));battleText(rt,s);s.dancecon=1.15;
  }
  if(s.dancecon===1.15&&!rt.exists(writer)){
   const susie=marker(rt,s.susi),r=ralsei(rt);moveTowardsPoint(susie,r.x+100,r.y+5,10);
   if(susie.y>=r.y-3){susie.x=r.x+100;susie.y=r.y+5;susie.speed=0;s.dancecon=1.2;}
  }
  // "Happy feet": Susie stomps Ralsei's feet until he dances too.
  if(s.dancecon===1.2||s.dancescenetimer>0&&s.dancescenetimer<=146){
   s.dancescenetimer++;const r=ralsei(rt);
   if(s.dancescenetimer===1){
    actCharSpriteEnd(s,rt);const susie=marker(rt,actCharSprite(s,rt,'susie','spr_susie_dance',.5,1));s.susi=susie.id;susie.depth=r.depth+1;clearTrails(rt);
    susie.hspeed=-5;susie.x=r.x+100;susie.y=r.y+5;
   }
   if(s.dancescenetimer===10){marker(rt,s.susi).hspeed=10;s.dancescenetimer2=1;s.rals=actCharSprite(s,rt,'ralsei','spr_ralsei_hurt_fixed',.16,1);clearTrails(rt);}
   if(s.dancescenetimer===15)marker(rt,s.susi).hspeed=-5;
   if(s.dancescenetimer===25){marker(rt,s.susi).hspeed=10;s.dancescenetimer2=1;speaker(s,rt,'susie');msgSet(rt,0,T('307_0'));battleText(rt,s);}
   if(s.dancescenetimer===30)marker(rt,s.susi).hspeed=-5;
   if(s.dancescenetimer===40){marker(rt,s.susi).hspeed=10;s.dancescenetimer2=1;s.dancescenetimer=25;}
   if(s.dancescenetimer2>0){
    s.dancescenetimer2++;const rals=marker(rt,s.rals);
    if(s.dancescenetimer2>1&&s.dancescenetimer2<=6){const k=6-s.dancescenetimer2;rals.x=r.x+rt.random.randomRange(-k,k);rals.y=r.y+rt.random.randomRange(-k,k);}
    if(s.dancescenetimer2===7){rals.x=r.x;rals.y=r.y;}
    if(s.dancescenetimer2===12)s.dancescenetimer2=0;
   }
   if(s.dancescenetimer>=36&&!rt.exists(writer)){
    s.dancescenetimer=0;marker(rt,s.susi).hspeed=0;const rals=marker(rt,s.rals);rals.imageXscale=2;rals.imageYscale=2;s.dancecon=2.3;
   }
  }
  if(s.dancecon===2.3&&!rt.exists(writer)){
   actCharSpriteEnd(s,rt);const r=ralsei(rt),susie=marker(rt,actCharSprite(s,rt,'susie','spr_susie_dance',.5,1));s.susi=susie.id;susie.x=r.x+80;susie.y=r.y+5;
   actCharSprite(s,rt,'ralsei','spr_ralsei_hurt_fixed',.16,1);clearTrails(rt);s.dancecon=2.4;
  }
  if(s.dancecon===2.4&&!rt.exists(writer)){
   actCharSpriteEnd(s,rt);speaker(s,rt,'none');const r=ralsei(rt);
   const susie=marker(rt,actCharSprite(s,rt,'susie','spr_susie_dance',.16,1));s.susi=susie.id;susie.x=r.x+100;susie.y=r.y+5;
   actCharSprite(s,rt,'ralsei','spr_ralsei_dance',.16,1);
   msgSet(rt,0,T('354_0'));anyFaceNext(s,rt,'ralsei','U');msgNext(rt,T('356_0'));battleText(rt,s);
   controller(rt).happyfeetscene=1;
   if(s.danceCounter>1)s.danceCounter=1;
   for(const e of [capn(rt),kk(rt)])if(e&&e.danceCounter>1)e.danceCounter=1;
   s.happyfeetscenejusthappened=1;clearTrails(rt);g.flag[34]=0;s.dancecon=2.5;
  }
  if(s.dancecon===2.5&&!rt.exists(writer)){
   const susie=marker(rt,s.susi),hero=rt.first(object('obj_herosusie'));if(!hero)throw Error("Sweet's dance scene needs Susie");
   moveTowardsPoint(susie,hero.x,hero.y,10);susie.depth=ralsei(rt).depth+1;
   if(susie.y<=hero.y+8){susie.x=hero.x;susie.y=hero.y;susie.speed=0;s.dancecon=4;}
  }
  if(s.dancecon===4&&!rt.exists(writer)){actCharSpriteEnd(s,rt);s.dancecon=0;rt.userEvent(controller(rt),0);speaker(s,rt,'none');}
 }
 /** Everyone dancing: the line, the music fading, then the band's ending (obj_musical_battle_end). */
 function ending(s:GmInstance,rt:GmRuntime){
  if(s.endcon===1){
   s.endcon=1.5;msgSet(rt,0,T('699_0')+'                            ');battleTextDefault(rt,s);
   for(const w of rt.withInstances(writer)){w.rate=3;w.skippable=0;}
   rt.sourceAudio?.volume('cyber_battle_backing',0,15);rt.sourceAudio?.volume('cyber_battle_backing_solo',0,15);
  }
  if(s.endcon===1.5){s.endtimer++;if(s.endtimer>150)s.endcon=2;}
  if(s.endcon===2){for(const w of rt.withInstances(writer))rt.destroy(w);rt.create(object('obj_musical_battle_end'),s.x,s.y);s.endcon=3;}
  if(s.endcon===4){
   s.endcon=5;for(const e of [kk(rt),capn(rt)])if(e)actCharSpriteEnd(e,rt);actCharSpriteEnd(s,rt);
   const c=rt.first(object('obj_battlecontroller'));if(c)c.skipvictory=1;winCombat(rt,s);
  }
 }
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  create:(s,rt)=>{
   enemyObjectInit(s,rt);
   s.solo_music=rt.soundLoop?.('cyber_battle_backing_solo')??-1;s.solo_start=rt.frame;rt.sourceAudio?.volume('cyber_battle_backing_solo',1,0);
   rt.create(object('obj_musical_controller'),s.x,s.y);
   const c=rt.first(object('obj_battlecontroller'));if(!c)throw Error('Sweet needs obj_battlecontroller');c.hidemercy=1;s.depth=c.depth-1;
   Object.assign(s,{talkmax:180,imageSpeed:1/6,idlesprite:'spr_sweet_idle',hurtsprite:'spr_sweet_hurt',sparedsprite:'spr_sweet_hurt',recruitable:0,musical_bullet_difficulty:0,
    dancing:false,danceCounter:0,actCounter:0,learnedAct:false,letsdance:false,letsdance2:false,letsdance3:false,stoppeddance:false,dancecon:0,dancescenetimer:0,dancescenetimer2:0,
    scon:0,milktimer:0,heal:0,helpusattack:0,postattackscene:0,happyfeetscenejusthappened:0,groove:0,siner2:0,musicalnotetimer:0,stoppeddancingcounter:0,hurtstate2:0,dancetimer:0,
    dance_index:0,updatetimer:0,sweetdanceprev:0,capndanceprev:0,kkdanceprev:0,learnedhowtoact:0,solotimer:0,backingtimer:0,endcon:0,endtimer:0,simultotal_funny:0});
  },
  // The solo's position in frames: the musical bullets keep to it.
  beforeTalk:(s,rt)=>{
   const g=rt.globals;
   if(g.monstercomment[s.myself]==='(Tired)'){g.monstercomment[s.myself]=' ';g.monsterstatus[s.myself]=0;}
   // Without the host's audio clock, the solo's frames since it started, looping with the track.
   s.solotimer=Math.round((rt.soundTrackPosition?.(s.solo_music)??((rt.frame-s.solo_start)%SOLO_FRAMES)/30)*30);
   s.sweetdanceprev=s.dancing;s.capndanceprev=capn(rt)?.dancing;s.kkdanceprev=kk(rt)?.dancing;
  },
  talk:(s,rt)=>{
   const g=rt.globals;s.postattackscene=0;s.heal=0;s.groove=0;controller(rt).scon=0;s.simultotal_funny=0;g.typer=50;s.rr=rt.random.choose(0,1,2,3);
   msgSet(rt,0,T(s.dancing==true?'27_0':['30_0','31_0','32_0','33_0'][s.rr]));enemyBlcon2(s,rt,s.x-10,g.monstery[s.myself],10);
  },
  // A bandmate near 0 HP: the milk scene instead of a turn. Once Susie can ACT: no box, the controller takes over.
  endTalk:(s,rt)=>{
   if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;s.rtimer=0;blconSkip(s,rt,15);
   if(!isPhase(rt,'bullets',s))return;const g=rt.globals;
   if([s,kk(rt),capn(rt)].some(e=>e&&g.monsterhp[e.myself]<2)){
    const c=controller(rt);if(c.scon===0)c.scon=1;for(const name of ['obj_sweet_enemy','obj_kk_enemy','obj_hatguy_enemy'])for(const e of rt.withInstances(object(name)))e.heal=1;
   }else if(s.learnedhowtoact===1){
    s.postattackscene=1;for(const c of rt.withInstances(object('obj_battlecontroller')))c.noreturn=1;rt.userEvent(controller(rt),0);
    for(const h of rt.withInstances(heroParent))h.darkify=0;for(const d of rt.withInstances(darkener))rt.destroy(d);
   }else{
    if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+206);if(!rt.exists(moveHeart))moveHeartIn(rt);
    for(const b of rt.withInstances(growtangle)){b.maxxscale=2;b.maxyscale=2.5;}
   }
  },
  attack:(s,rt)=>trioAttack(s,rt,object,true),
  statusLine:(s,rt)=>{s.rr=rt.random.choose(0,1,2,3);rt.globals.battlemsg[0]=T(['110_0','111_0','112_0','113_0'][s.rr]);},
  // At the end of the enemy turn the controller reports the dancing (or, once, that they stopped).
  afterAttack:(s,rt)=>{
   const g=rt.globals;if(g.mnfight!==2||s.dancecon>=5||g.turntimer>1||s.postattackscene!==0)return;
   const bc=rt.first(object('obj_battlecontroller'));if(!bc)throw Error('Sweet needs obj_battlecontroller');
   if(!s.learnedAct&&monsterPop(rt)===3&&s.letsdance&&!s.stoppeddance&&s.turns===3&&s.actCounter<3){
    s.stoppeddance=true;s.postattackscene=1;for(const c of rt.withInstances(object('obj_battlecontroller')))c.noreturn=1;
    for(const c of rt.withInstances(object('obj_musical_controller'))){rt.userEvent(c,0);c.theystoppeddancing=1;}
   }
   if(bc.noreturn===0){s.postattackscene=1;for(const c of rt.withInstances(object('obj_battlecontroller')))c.noreturn=1;for(const c of rt.withInstances(object('obj_musical_controller')))rt.userEvent(c,0);}
  },
  afterEnemyTurn:danceScene,
  acts:(s,rt)=>trioDanceActs(s,rt,object,'sweet'),actsDone:()=>{},
  // Only Kris ACTs this turn: in Japanese, his dance then reads as a lone one (the single-ACT lines).
  hooks:{soleFirstActor:s=>{s.simultotal_funny=1;},keepsEnemiesAtOneHp:true},
  afterStep:ending,
  events:{
   alarm4:s=>{s.actcon++;},
   alarm5:s=>{s.dancecon++;},
   cleanup:(_s,rt)=>{rt.sourceAudio?.volume('cyber_battle_backing_solo',1,0);rt.soundStop?.('cyber_battle_backing_solo');},
   draw:(s,rt)=>{
    rt.drawText(80,10,gmlString(rt.globals.turntimer));
    if(s.hurtstate2===1){rt.drawSprite('spr_sweet_hurt',0,s.x,s.y,2,2,0,0xffffff,1);return;}
    if(s.state===3)enemyDrawHurtGeneric(s,rt);
    if(s.state===0){
     if(s.dancing){
      s.updatetimer++;if(s.updatetimer>=2){s.siner+=2;s.updatetimer=0;}
      if(s.flash===1)s.fsiner++;
      const parts:[number,number,number][]=[[8-s.dance_index,Math.sin(s.siner/4)*3+2,0],[3-s.dance_index,Math.sin(s.siner/3)*3,Math.cos(s.siner/2)*4],[4,Math.sin(s.siner/2)*2,Math.cos(s.siner/2)*3],
       [1,Math.sin(s.siner/2)*6-4,Math.cos(s.siner/2)*6],[5+s.dance_index,Math.sin(s.siner/3)*3,Math.cos(s.siner/2)*4]];
      for(const [frame,dx,dy] of parts)drawBodyPart(s,rt,'spr_sweet_dance_pieces',frame,s.x+dx,s.y+dy,2,2,0,0xffffff,s.imageAlpha);
      s.dancetimer++;s.dance_index=Math.sin(s.siner/4)>0?1:0;
      s.musicalnotetimer++;
      if(s.musicalnotetimer===14){
       s.musicalnotetimer=0;const a=rt.create(afterimage,s.x+rt.spriteWidth(s)/2-10+rt.random.random(40),s.y);s.anim=a.id;
       a.sprite='spr_musicalbattlenote1';a.depth=s.depth-5;a.imageXscale=2;a.imageYscale=2;a.direction=270;a.gravity=-.2;a.hspeed=rt.random.randomRange(.1,.8)*rt.random.choose(1,-1);
      }
     }else enemyDrawIdleGeneric(s,rt,1/6);
    }
    if(s.becomeflash===0)s.flash=0;s.becomeflash=0;rt.drawState.color=0xffffff;
    // Under the ACT menu: whether Sweet is dancing.
    const g=rt.globals;
    if([1,3,11,12,13].includes(g.bmenuno)){
     s.siner2++;let dx=0,dy=0;if(g.charturn>0&&g.bmenuno===13){dx=140;dy=6;}
     if(g.myfight===0){
      rt.drawState.font='fnt_mainbig';const x=rt.view.x+258+dx,y=rt.view.y+369+dy;
      if(s.danceCounter===1){rt.drawText(x,y,D('81_0'),.7,1,0);rt.drawSprite('spr_musical_dancing_ui',0,rt.view.x+228+Math.sin(s.siner2/4)*3+dx,rt.view.y+dy+386,1,1,0,0xffffff,1);}
      else if(s.danceCounter===2){rt.drawText(x,y,D('86_0'),.7,1,0);rt.drawSprite('spr_musical_dancing_ui',0,rt.view.x+228+Math.sin(s.siner2/.8)*3+dx,rt.view.y+dy+386,1,1,0,0xffffff,1);}
      else{rt.drawText(x,y,D('91_0'));rt.drawSprite('spr_musical_notdancing_ui',0,rt.view.x+228+Math.sin(s.siner2/10)*3+dx,rt.view.y+dy+386,1,1,0,0xffffff,1);}
     }
    }
   },
  },
 });
}
