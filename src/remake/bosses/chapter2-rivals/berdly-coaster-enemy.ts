import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyObjectInit,enemyDrawHurtGeneric,enemyHurtTiredAfterDamage,actCharSpriteEnd} from '../../deltarune/chapter2-enemy';
import {darkener,growtangle,heart,moveHeart,moveHeartIn,heroParent,sndFree} from '../../deltarune/battle';
import {button3_p,nextAct,randomTarget,winCombat} from '../../deltarune/controller';
import {blconSkip,bulletSpawner,isPhase,msgSet,turnTimer,snd} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {sourceText} from '../../host/text';
const T=(key:string)=>sourceText('obj_berdlyb_enemy_slash_Step_0_gml_'+key);
/** The enemy owns the talk/ACT/ending, while actual car physics and timing remain in the coaster objects. */
export function createBerdlyCoasterEnemy(object:(name:string)=>GmObjectDef):GmObjectDef{
 const base=object('obj_berdlyb_enemy'),get=(rt:GmRuntime,name:string)=>rt.first(object(name))!;
 const text=(s:GmInstance,rt:GmRuntime,key:string)=>{msgSet(rt,0,T(key));battleTextDefault(rt,s);};
 const balloon=(s:GmInstance,rt:GmRuntime,key?:string)=>{if(key)msgSet(rt,0,T(key));enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);};
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  hooks:{defeatedByDamage:false,onFightResolved:(s,_hero,rt,target)=>{if(target===s.myself&&rt.globals.monsterhp[target]<=0)s.endcon=1;},
   onDamagedToZero:(s,_rt,slot)=>{if(slot===s.myself)s.endcon=1;},
   // His flashes show his hurt sprite.
   flashSprite:s=>s.hurtsprite},
  create:(s,rt)=>{
   enemyObjectInit(s,rt);Object.assign(s,{sactionboxx:-60,talkmax:90,imageSpeed:1/6,visible:false,idlesprite:'spr_berdlyb_idle',hurtsprite:'spr_berdlyb_shocked_battle',sparedsprite:'spr_berdlyb_shocked_battle'});
   for(const key of ['difficulty','kriscoaster','suscoaster','ralcoaster','nitro','premonition','mrboneswildride','bumpactstarted','init','attackorder','tornadocount','spearblastcount','chirchicount','rideactgo','dialoguecon','bumpedfirsttime','bumpedpast50percent','ballooncon','balloonorder','talkedcon','bumpwait','krisgo','susiego','ralseigo','forcedefaultballoon','bumpactfast','endcon','endtime'])s[key]=0;
   for(const b of rt.all(object('obj_battleback')))rt.destroy(b);s.recruitable=0;
   for(const name of ['obj_herokris','obj_herosusie','obj_heroralsei'])for(const h of rt.all(object(name)))h.x=rt.view.x-200;
  },
  beforeStep:(s,rt)=>{if(s.init===0){s.init=1;rt.create(object('o_coaster_controller'),s.x,s.y);s.alarm[5]=1;}},
  startTalk:(s,rt)=>{
   const g=rt.globals;if(s.bumpwait!==0||s.endcon!==0)return;randomTarget(s,rt);if(!rt.exists(darkener))rt.create(darkener,0,0);
   if(s.nitro>0)s.nitro--;if(s.premonition>0)s.premonition--;s.talkedcon=0;s.talktimer=0;g.typer=69;
   if(s.attackorder===0)s.rr=0;if(s.attackorder===1)s.rr=2;if(s.attackorder===2){s.rr=1;s.attackorder=-1;}s.attackorder++;
   msgSet(rt,0,T(['29_0_b','30_0','31_0'][s.rr]));
   if(s.bumpedpast50percent===0&&(g.mercymod[s.myself]>50||g.monsterhp[s.myself]<g.monstermaxhp[s.myself]*.5)&&s.balloonorder>4){msgSet(rt,0,T('42_0'));s.bumpedpast50percent=1;s.ballooncon=2;s.attackorder--;}
   else if(s.bumpedfirsttime===0&&g.mercymod[s.myself]>0&&s.balloonorder>4){msgSet(rt,0,T('36_0'));s.bumpedfirsttime=1;s.ballooncon=1;}
   else if(s.forcedefaultballoon===0){if(s.balloonorder>=0&&s.balloonorder<=4){msgSet(rt,0,T(['48_0','49_0','50_0','51_0','52_0'][s.balloonorder]));if(s.balloonorder===4)s.ballooncon=3;}s.balloonorder++;}
   s.forcedefaultballoon=0;balloon(s,rt);s.talked=s.ballooncon===0?1:.5;s.talktimer=0;
  },
  duringTalk:(s,rt)=>{
   if(s.talked===.5){s.talktimer++;if(button3_p(rt)&&s.talktimer>15||!rt.exists(writer)){
    destroyWriters(rt);if([1,2,3].includes(s.ballooncon))msgSet(rt,0,T(['','80_0','89_0','82_0'][s.ballooncon]));rt.globals.typer=69;balloon(s,rt);
    if(s.ballooncon!==2){s.ballooncon=0;s.talked=.6;s.alarm[6]=1;}else{s.ballooncon=0;s.talked=.7;}
   }}
   if(s.talked===.7){s.talktimer++;if(button3_p(rt)&&s.talktimer>15||!rt.exists(writer)){s.talked=0;s.forcedefaultballoon=1;}}
  },
  endTalk:(s,rt)=>{
   if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;s.talktimer++;
   if(button3_p(rt)&&s.talktimer>15||!rt.exists(writer)){destroyWriters(rt);s.talkedcon=1;}
   if(s.talkedcon===1){s.rtimer=0;blconSkip(s,rt,-1);if(isPhase(rt,'bullets',s)){
    if(!rt.exists(moveHeart)&&!rt.exists(heart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);if(s.difficulty===1&&s.rr===0)rt.first(growtangle)!.target_angle+=45;
   }}
  },
  attackDelay:16,
  attack:(s,rt)=>{const g=rt.globals;g.monsterattackname[s.myself]=s.rr===0?'Tornado':s.rr===1?'SpearBlast':'Chirashi';const dc=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=dc.id;dc.type=s.rr===0?8:s.rr===1?9:10;dc.difficulty=s.rr===0?0:s.rr===1?1:2;turnTimer(rt,s.rr===0?210:s.rr===1?200:180);},
  statusLine:(s,rt)=>{const g=rt.globals;s.rr=rt.random.choose(0,1,2,3,4,5);g.battlemsg[0]=T(['158_0','159_0','160_0','161_0','162_0','163_0'][s.rr]);if(g.mercymod[s.myself]>75)g.battlemsg[0]=T('167_0_b');if(g.monsterhp[s.myself]<g.monstermaxhp[s.myself]*.25)g.battlemsg[0]=T('171_0');},
  acts:(s,rt)=>{
   const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
   if(s.acting===1&&s.actcon===0){s.actcon=1;text(s,rt,'123_0');}
   if(s.acting===2&&s.actcon===0){
    if(s.actingsus===1&&s.actingral===1)s.dialoguecon=1;else text(s,rt,s.actingsus===1?'130_0':s.actingral===1?'131_0':'132_0');
    s.kriscoaster=1;s.acting=0;s.actcon=1;s.rideactgo=1;if(s.actingsus===2)s.suscoaster=1;if(s.actingral===2)s.ralcoaster=1;
   }
   if((s.acting===3||s.acting===4)&&s.actcon===0){s.dialoguecon=1;if(s.acting===4)s.mrboneswildride=1;s.acting=0;s.actcon=1;s.rideactgo=1;s.kriscoaster=1;s.suscoaster=1;s.ralcoaster=1;}
   if(s.actingsus===1&&s.actconsus===1){
    if(s.bumpactstarted===1){s.acting=0;s.actcon=1;s.actingsus=0;s.actconsus=0;}
    else{if(s.rideactgo===0)text(s,rt,s.actingral===1?'187_0':'186_0');s.acting=0;s.actcon=1;s.rideactgo=1;s.actconsus=0;s.suscoaster=1;if(s.acting===2)s.kriscoaster=1;if(s.actingral===2)s.ralcoaster=1;}
   }
   if(s.actingral===1&&s.actconral===1){
    if(s.bumpactstarted===1){s.acting=0;s.actcon=1;s.actconral=0;s.actingral=0;}
    else{if(s.actingsus!==1&&s.rideactgo===0)text(s,rt,'221_0');s.acting=0;s.actcon=1;s.rideactgo=1;s.actconral=0;s.ralcoaster=1;if(s.acting===2)s.kriscoaster=1;if(s.actingsus===2)s.suscoaster=1;}
   }
   if(s.dialoguecon!==0){if(s.dialoguecon===1)msgSet(rt,0,T('306_0'));battleTextDefault(rt,s);s.dialoguecon=0;}
   if(s.actcon===1&&!rt.exists(writer)){
    if(g.mercymod[s.myself]>99)return;
    if(g.currentactingchar===0&&s.actingsus===0&&s.actingral===0&&s.rideactgo===1||g.currentactingchar===1&&s.actingral===0&&s.rideactgo===1||g.currentactingchar===2&&s.rideactgo===1){
     const c=get(rt,'o_coaster_controller');if(s.mrboneswildride===1)c.timermax=250;c.timer=0;c.playerinputtimer=0;c.actcon=1;
     for(const h of rt.all(object('o_coaster_hero')))if([s.kriscoaster,s.suscoaster,s.ralcoaster][h.HeroID]===1){h.sprite=['spr_krisb_idle','spr_susieb_idle','spr_ralsei_idle'][h.HeroID];h.imageIndex=0;h.imageSpeed=.25;}
     s.bumpactstarted=1;s.acting=0;s.actcon=0;s.actconsus=0;s.actconral=0;get(rt,'o_coaster_berdly').forceypos=-1;
     if(s.kriscoaster===1)s.krisgo=1;if(s.suscoaster===1)s.susiego=1;if(s.ralcoaster===1)s.ralseigo=1;if(s.kriscoaster===1&&s.suscoaster===1&&s.ralcoaster===1)s.bumpactfast=1;
     s.mrboneswildride=0;s.kriscoaster=0;s.suscoaster=0;s.ralcoaster=0;
    }else nextAct(rt,s);
   }
  },actsDone:()=>{},
  afterStep:(s,rt)=>{
   const bird=rt.first(object('o_coaster_berdly'));if(bird)s.sactionboxx=bird.x-bird.xstart-60;
   if(s.endcon===1){s.endtime++;
    if(s.endtime===1){for(const h of rt.all(object('o_coaster_hero')))h.endscene=1;get(rt,'o_coaster_berdly').endscene=1;get(rt,'obj_battlecontroller').skipvictory=1;}
    if(s.endtime===30){sndFree(rt,s,rt.globals.batmusic[0]);Object.assign(get(rt,'o_coaster_berdly'),{xshake:10,sprite:'spr_cutscene_17_berdly_shocked'});const scene=rt.first(object('obj_ch2_scene11a'));if(scene){const c=rt.byId(scene.coaster_berdly)!;Object.assign(c,{character_sprite:'spr_berdlyb_shocked',character_offset_x:-10,character_offset_y:-5});}snd(rt,'snd_bomb');}
    if(s.endtime===90){actCharSpriteEnd(s,rt);msgSet(rt,0,T('450_0'));rt.globals.typer=69;balloon(s,rt);}
    if(s.endtime>=90&&!rt.exists(writer)){s.endcon=0;winCombat(rt,s);}
   }
  },
  events:{
   alarm5:(s,rt)=>{
    const scene=rt.first(object('obj_ch2_scene11a'));if(scene){for(const [field,sprite] of [['coaster_kris','spr_krisr_dark'],['coaster_susie','spr_susie_walk_right_dw'],['coaster_ralsei','spr_ralsei_walk_right']]){const c=rt.byId(scene[field])!;c.con=0;rt.byId(c.actor)!.sprite=sprite;c.character_sprite=sprite;c.visible=false;}rt.byId(scene.coaster_berdly)!.visible=false;}
    for(const h of rt.all(heroParent))h.visible=true;for(const name of ['o_coaster_hero','o_coaster_hero_back','o_coaster_berdly','obj_berdlyb_enemy'])for(const i of rt.all(object(name)))i.visible=true;for(const i of rt.all(object('obj_coaster')))i.stop_siner=0;
   },alarm6:s=>{s.talked=1;},alarm7:s=>{s.bumpwait=0;},user10:(s,rt)=>{actCharSpriteEnd(s,rt);nextAct(rt,s);winCombat(rt,s);},
   animationEnd:()=>{},
   draw:(s,rt)=>{if(s.becomeflash===0)s.flash=0;s.becomeflash=0;s.fsiner++;if(rt.exists(object('o_coaster_berdly'))&&!rt.exists(object('obj_berdlyb_spearblaster'))&&s.state!==3)return;if(s.state===3){enemyHurtTiredAfterDamage(s,rt,.5);enemyDrawHurtGeneric(s,rt);}},
   destroy:(s,rt)=>{for(const name of ['o_coaster_berdly','o_coaster_hero','o_coaster_controller','obj_herokris'])for(const i of rt.all(object(name)))rt.destroy(i);rt.create(object('o_berdly_coaster_end_fix'),s.x,s.y);},
  },
 });
}
