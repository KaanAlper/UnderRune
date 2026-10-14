// obj_spamton_neo_enemy (Chapter 2, encounter 61), normal route: his lines before each attack, the attack it starts,
// Check, the wire-snapping ACTs (Kris, Susie, Ralsei, everyone), Susie's Super Charge, Ralsei's fluff guards and the
// Kris throw, the cut wires as mercy rises, and both endings (HP to zero, or every wire cut). The side-B route's
// branches (scr_sideb_get_phase() > 2, which encounter 61 never reaches here) are left out. The body is in body.ts.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {pointDistance} from '../../gm/math';
import {afterimage,afterimageGrow,darkener,darkMarker,dmgWriter,growtangle,heart,heroKris,heroSusie,monsterParent,moveHeart,moveHeartIn,returnHeart} from '../../deltarune/battle';
import {button3_p,findController,inputName,nextAct,randomTarget,winCombat} from '../../deltarune/controller';
import {monsterSetup} from '../../deltarune/encounter';
import {spellMenuSetupChapter2} from '../../deltarune/chapter2';
import {blconSkip,bulletSpawner,heartColor,isPhase,mercyAdd2,mergeColor,moveToPointOverTime,moveToRememberXY,msgNext,msgSet,rememberXY,scriptDelayedOn,setVar,snd,turnTimer} from '../../deltarune/chapter2-battle';
import {battleTextDefault,destroyWriters,writer} from '../../deltarune/writer';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {sourceText} from '../../host/text';
import {chooseNeoAttack} from './chooser';
import type {HookedDef} from '../../deltarune/rules';
import {defineEnemy} from '../../deltarune/enemy';
import {soulSpark,superchargeEnd} from '../../deltarune/yellow-soul';
import {neoBodyDraw} from './body';
import {vineCut as sneoVineCut,vineTransition as sneoVineTransition,vineWeak as sneoVineWeak} from './vines';
import {bigLaser,choicerNeo,dbulletController,phoneBullet,sceneEx2,sneoBulletController,sneoPhonecall,sneoSusieAct,spamtonCherub,throwKris,throwKrisVineController,tinyRalsei} from './pending';

const T=(k:string)=>sourceText('obj_spamton_neo_enemy_slash_Step_0_gml_'+k);
const first=(rt:GmRuntime,def:GmObjectDef)=>rt.first(def);

// ---- Create ----
function create(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 enemyObjectInit(s,rt);
 if(g.fighting===0){s.myself=0;g.mercymod[s.myself]=0;}
 Object.assign(s,{heart_attack_count:10,heart_health:25,heart_speed_scaling:2,heart_1st_wave_timer:6,heart_2nd_wave_timer:11,heart_3rd_wave_timer:16,
  heart_variant_arm_shoot_timer:90,heart_turntimer:1200,heart_hurt_timer_reduction:27,heart_hurt_timer_reduction_bigshot:108,heart_bullet_image_scale:1.1,
  heart_bullet_speed_1st_wave:0.1,heart_bullet_friction_1st_wave:0.1,heart_bullet_speed_2nd_wave:0.1,heart_bullet_friction_2nd_wave:0.09,
  heart_bullet_speed_3rd_wave:0.1,heart_bullet_friction_3rd_wave:0.08,heart_bullet_gravity_acceleration:1.075,
  crusher_start_hspeed:-3,crusher_start_hacceleration:0.4,crusher_turret_speed:15,crusher_turret_distance:44,crusher_x_origin:220,crusher_turret_bullet_speed:-0.5,crusher_turret_bullet_gravity:0.5,
  upgrade:0,bigshot:1,bigshotused:0,bigshotcount:0,tinyralsei:0,weakentimer:0,weakenshakeamount:0,maxvinecount:6,vinecuttimer:0,vinebgcount:18,vineid:-1,snapallcount:0,
  endcon:0,weirdpathendcon:0,weirdpathendtimer:0,endtimer:0,dancealtcon:0,cantspareinit:0,savemeactcon:0,usedact:0,difficulty:0,turn:0,phaseturn:0,phase:1,
  firstheartattack:0,fireslasers:0,haveusedfinalattack:0,phonejokeplayerdied:0,newcrushermovement:1,sneomacaronihandscon:0,flyingheadsbseen:0,singleshotmercy:0,
  prevmercy:0,prevhearttack:0,facebroken:0,correct_answer:-1,hurttimer2:0,faceattackcount:0,nothitduringphonehands:1,sneo_defeat_cutscene_version:0,targetbgspeed:0,
  smoketimer:0,smokethreshold:1,didwejustdie:0,dontchangepose:0,lastwirecon:0,lastwiretimer:0,headendcon:0,finalattackconversationcon:0,funnycheat:0,funnycheattimer:0,
  funnycheattimer2:0,funnycheattimer3:0,headexpand:0,hellmode:0});
 s.laserflash=rt.random.irandom(3);
 Object.assign(s,{talkmax:90,imageSpeed:0.16666666666666666,idlesprite:'spr_sneo_example',hurtsprite:'spr_sneo_example',sparedsprite:'spr_sneo_example',custom_draw:1,f:2,
  imageXscale:2,imageYscale:2,sinerb:0,lerper:0,shocker:0,dead:0,checkcount:0,shake_head:0,heart_release_con:0,shocker_threshold:10,shotanimtimer:0,shocktimer:0,
  shockthreshold:10,laughtimer:0,fakegrav:0,falltimer:0,fallshake:10,aim:1,hitcon:0});
 s.hitdetector=rt.create(hitDetector,s.x,s.y).id;
 Object.assign(s,{stoprumblesfx:0,chargepitch:0.1,chargesfxtimer:0,dance_con:0,dance_timer:0,partfocus:0,blend:mergeColor(0xffffff,0,0.15),shootydanceinit:0,shootydancex:s.x,shootydancey:s.y});
 s.partsprite=['spr_sneo_wingl','spr_sneo_arml','spr_sneo_legl','spr_sneo_legr','spr_sneo_body','spr_sneo_head','spr_sneo_armr','spr_sneo_wingr'];
 const xo=(n:string)=>rt.bank.get(n)!.originX,yo=(n:string)=>rt.bank.get(n)!.originY;
 for(const k of ['partframe','partsiner','partrot','partx','party','partweakened'])s[k]=new Array(8).fill(0);
 s.partblend=new Array(8).fill(0xffffff);s.partvisible=new Array(8).fill(1);
 s.partxoff=s.partsprite.map((n:string)=>xo(n)*2);s.partyoff=s.partsprite.map((n:string)=>yo(n)*2);
 s.partsiner_back=new Array(18).fill(0);s.partx_back=new Array(18).fill(0);s.party_back=new Array(18).fill(0);s.partvisible_back=new Array(18).fill(1);
 s.partxoff_back=Array.from({length:18},(_,ii)=>xo(s.partsprite[0])*(1.8+ii/9));s.partyoff_back=new Array(18).fill(yo(s.partsprite[0])*2);
 s.heartattackoffsetx=0;s.extra_vines=26;
 s.armlength=pointDistance(s.partxoff[1],s.partyoff[1],36,146);
 Object.assign(s,{partmode:1,songtime:0,songplaying:1,resumeinterval:1.715,drawaimer:0,phoneevent:0,headmode:0,vinex:0,attackdebug:-1,difficultydebug:-1,musicdebug:0,
  party_heal:false,makeheart:0,makeheartinit:0,makehearttype:0,makehearttimer:0,makeheartalt:0,violentendflash:0,head_recoil_amount:0,shadow_amount:0,facing:1,headhit:0,
  headsize:1,headforceframe:-1,aimmode:0,armaim:-80,hitcontimer:0,balloonorder:0,ballooncon:0,balloonend:1,talkedcon:0,init:0,statustextorder:0,statustextalt:0,
  statustextalt2:0,statustextupdate:0,joke:0,eyeshp:16,nosehp:16,mouthhp:16,specialcontimer:0,specialcon:0,flameframe:0,flamealpha:0});
}
/** scr_enemy_object_init: the fields every Chapter 2 enemy starts with. */
export function enemyObjectInit(s:GmInstance,rt:GmRuntime){
 Object.assign(s,{becomeflash:0,flash:0,turnt:0,turns:0,talktimer:0,state:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,shakex:0,acting:0,actcon:0,
  mywriter:343249823,acttimer:0,con:0,dodgetimer:0,fatal:0,candodge:0,mytarget:0,ambushed:0,firststrike:0,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,target:-1,grazed:-1,
  grazetimer:-1,element:'none',actingsus:0,actingnoe:0,actingral:0,actconsus:0,actconral:0,actconnoe:0,simulorderkri:-1,simulordersus:-1,simulorderral:-1,simulordernoe:-1,
  simultotal:0,simulboss:-1,talkmax:90,mercymod:0,maxmercy:100,recruitable:1,freezable:1,recruitcount:1,sactionboxx:0,sactionboxy:0,hurtspriteoffx:0,hurtspriteoffy:0,
  imageXscale:2,imageYscale:2,imageSpeed:0.2,idlesprite:'spr_diamond_knight_overworld',hurtsprite:'spr_diamond_knight_hurt',sparedsprite:'spr_diamond_knight_spared',custombody:0});
 s._charactsprite=new Array(10).fill(382938298329);
 s.depth=90-(s.y-rt.view.y)/50;
}

// ---- Step: his lines before the attack ----
/** Which line opens the enemy turn: [message key, follow-up balloon (0: none)]. */
function openingLine(s:GmInstance):[string,number]|undefined{
 const {rr,difficulty:d,haveusedfinalattack:fin,faceattackcount:fa}=s;
 if(fin)return rr===9&&s.finalattackconversationcon===0?['93_0',25]:undefined;
 if(rr===0&&d===1)return ['56_0',1];
 if(rr===6&&d===0)return ['57_0',2];
 if(rr===8&&d===0)return ['58_0_b',3];
 if(rr===2&&d===0)return ['59_0_b',4];
 if(rr===8.5&&d===0)return ['60_0',0];
 if(rr===7&&fa===0)return ['61_0',5];
 if(rr===0&&d===3)return ['62_0',6];
 if(rr===2&&d===2)return ['63_0_b',0];
 if(rr===8&&d===1)return ['64_0_b',7];
 if(rr===8.5&&d===2)return ['65_0',8];
 if(rr===7&&fa===1)return ['66_0',10];
 if(rr===6&&d===1)return ['67_0',11];
 if(rr===2&&d===1)return ['69_0_b',12];
 if(rr===8&&d===3)return ['121_0',13];
 if(rr===9&&s.finalattackconversationcon===0)return ['93_0',25];
 return undefined;
}
/** The balloon after balloon n: [message key, next balloon (0: the last one)]. */
const FOLLOW_UP:Record<number,[string,number]>={1:['136_0',0],2:['137_0',0],3:['138_0',0],4:['139_0',0],5:['140_0',0],6:['141_0',0],7:['142_0',0],8:['143_0',9],
 9:['144_0',0],10:['145_0',0],11:['146_0',0],12:['147_0',0],13:['163_0',0],15:['173_0',0],25:['207_0',26],26:['208_0',27],27:['209_0',0]};
function startTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 randomTarget(s,rt);
 if(!rt.exists(darkener))rt.create(darkener,0,0);
 if(s.turn>14&&s.weirdpathendcon===0&&g.monsterdf[me]>-10)g.monsterdf[me]-=3;
 Object.assign(s,{ballooncon:0,balloonsubcon:0,balloonend:1,talkedcon:0,statustextupdate:0});
 for(const a of rt.all(sneoSusieAct))a.turnsleft-=1;
 g.typer=72;s.rr=-1;chooseNeoAttack(s,rt);
 const open=openingLine(s);
 if(open){
  msgSet(rt,0,T(open[0]));s.ballooncon=open[1];s.balloonend=open[1]===0?1:0;
  if(open[0]==='93_0')s.finalattackconversationcon=1;
 }else{
  const rrr=rt.random.choose(0,1,2,3);
  if(rrr===0){
   if(s.statustextalt2===0){msgSet(rt,0,T('86_0'));s.ballooncon=15;s.balloonend=0;}
   if(s.statustextalt2===1){msgSet(rt,0,T('87_0'));s.balloonend=1;}
   s.statustextalt2+=1;if(s.statustextalt2>1)s.statustextalt2=0;
  }
  if(rrr===1){
   if(s.statustextalt===0)msgSet(rt,0,T('58_0'));
   if(s.statustextalt===1)msgSet(rt,0,T('59_0'));
   s.statustextalt+=1;if(s.statustextalt>1)s.statustextalt=0;
  }
  if(rrr===2)msgSet(rt,0,T('63_0'));
  if(rrr===3)msgSet(rt,0,T('64_0'));
 }
 s.usedact=0;
 if(s.correct_answer!==1){g.typer=72;enemyBlcon2(s,rt,s.x-10,g.monstery[me],10);}
 s.correct_answer=-1;
 s.talked=s.ballooncon===0?1:0.6;s.talktimer=0;
}
/** The growtangle's place and size for each attack, and where NEO moves while it plays. */
function placeBox(s:GmInstance,rt:GmRuntime){
 const box=rt.create(growtangle,rt.view.x+245,rt.view.y+170),rr=s.rr;
 const hideVines=()=>{for(const v of rt.all(sneoVineCut))v.hide=1;for(const v of rt.all(sneoVineTransition))v.hide=1;};
 if(rr===0){
  box.x+=54;box.maxxscale=3.2;box.maxyscale=1.5;s.chargesfxtimer=0;s.dance_timer=0;s.armaim=-80;
  if(s.difficulty===3){rememberXY(s);moveToPointOverTime(s,rt,s.x+50,s.y,8);hideVines();}
 }
 if(rr===3){box.x+=44;box.y+=54;box.maxxscale=2;box.maxyscale=2;}
 if(rr===5){rememberXY(s);moveToPointOverTime(s,rt,s.x+200,s.y,8);hideVines();}
 if(rr===7){box.x+=15;box.maxxscale=2;box.maxyscale=2;rememberXY(s);}
 else if(rr===8){rememberXY(s);moveToPointOverTime(s,rt,s.x,rt.view.y+20,8);hideVines();}
 else if(rr===8.5||rr===4){box.x+=64;box.y+=8;box.maxxscale=3.2;box.maxyscale=1.5;}
 else if(rr===6){box.x+=58;box.maxxscale=3.3333333333333335;box.maxyscale=2.3;rememberXY(s);moveToPointOverTime(s,rt,s.x+200,s.y,16);hideVines();}
 else if(rr===9){box.y+=10;box.maxyscale=1.9;box.maxxscale=2.5;}
}
const ATTACK_NAMES:Record<number,string>={0:'FlyingHeads',1:'FootballPipis',2:'HeartAttackNeo',3:'FootballPipis',4:'Phonehands',5:'PipisExplosion',6:'RECREWColumns',
 7:'SneoFaceAttack',8:'Phonecall',8.5:'Phonehands',9:'NeoFinale',10:'diamonds'};
function startAttack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself,rr=s.rr;
 g.monsterattackname[me]=ATTACK_NAMES[rr]??'UnspecifiedSneoAttack';
 let dc:GmInstance;
 if(rr===5){dc=bulletSpawner(s,rt,s.x,s.y,dbulletController);dc.type=51;dc.damage=3;dc.btimer=35-rt.random.random(30);}
 else if(rr===8){
  dc=rt.create(sneoPhonecall,s.x-10,s.y+20);dc.isattack=1;dc.target=s.mytarget;
  if(s.difficulty===3)s.phoneevent=2;else{if(s.phoneevent>=1)dc.skipintro=1;s.phoneevent+=1;}
 }else if(rr===10){dc=bulletSpawner(s,rt,s.x,s.y,dbulletController);dc.type=1;dc.target=3;s.partframe[5]=3;}
 else{
  dc=bulletSpawner(s,rt,s.x,s.y,sneoBulletController);
  // The controller's type per attack: heart attack 1.5, the face 12, phone hands 8.5.
  dc.type=({0:0,1:1,2:1.5,3:1,4:8.5,6:6,7:12,8.5:8.5,9:9} as Record<number,number>)[rr]??rr;
  if(rr===2||rr===7)dc.special=s.hellmode;
  if(rr===7)s.faceattackcount+=1;
  if(rr===9)dc.target=3;
 }
 s.dc=dc.id;
 heartColor(s,rt,'yellow');
 for(const h of rt.all(heart))h.wspeed=g.sp;
 turnTimer(rt,260);
 if(rr===1)turnTimer(rt,300);
 if(rr===2)turnTimer(rt,750+s.hellmode*450);
 if(rr===2&&s.difficulty===1)turnTimer(rt,850+s.hellmode*450);
 if(rr===2&&s.difficulty===6)turnTimer(rt,150);
 if(rr===6)turnTimer(rt,330);
 if(rr===7)turnTimer(rt,300);
 if(rr===5)turnTimer(rt,90);
}
/** The line in the battle box while he attacks. */
function attackLine(s:GmInstance,rt:GmRuntime){
 s.rr=rt.random.choose(0,1,2,3);rt.globals.battlemsg[0]=T(['294_0','295_0','296_0','297_0'][s.rr]);
}
/** The status line after the attack, while the soul flies home. */
function statusText(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 if(g.monsterhp[me]<g.monstermaxhp[me]*0.1&&s.haveusedfinalattack===0)g.battlemsg[0]=T('312_0');
 else if(s.bigshot===1&&s.bigshotused===0&&g.monsterhp[me]>g.monstermaxhp[me]*0.7)g.battlemsg[0]=T('313_0').split('~1').join(inputName(4));
 else if(s.bigshot===1&&s.bigshotused===1){
  const lines:Record<number,string>={0:'316_0',1:'317_0',2:'318_0',3:'319_0',6:'320_0',9:'321_0'};
  if(lines[s.statustextorder])g.battlemsg[0]=T(lines[s.statustextorder]);
  s.statustextorder+=1;
 }
}

// ---- Step: ACTs ----
/** Snapping a wire: mercy, its number, and the failure line once mercy is full. */
function snapMercy(s:GmInstance,rt:GmRuntime,amount:number,failKey:string,okKey?:string){
 const g=rt.globals,me=s.myself;
 let set=amount;if(g.mercymod[me]+set>100)set=100-g.mercymod[me];
 mercyAdd2(s,rt,me,set);
 if(set===0){for(const w of rt.all(dmgWriter))if(w.type===5)rt.destroy(w);msgSet(rt,0,T(failKey));return false;}
 if(okKey)msgSet(rt,0,T(okKey));
 return true;
}
/** Counts the visible and weakened wires the way the snap ACTs do; only used to cap the wire count. */
function scanWires(s:GmInstance,rt:GmRuntime){
 let i=rt.random.irandom(5),maxv=0;
 for(let n=0;n<6;n++){
  if(s.partvisible[i]===1&&s.partweakened[i]>0)break;
  i+=1;if(i>5)i=0;
  if(s.partvisible[i]===1)maxv+=1;
 }
 if(s.vinebgcount<1)s.maxvinecount=maxv;
}
function acts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0&&s.savemeactcon===0){
  s.actcon=1;
  if(s.checkcount===0){msgSet(rt,0,T('375_0'));msgNext(rt,T('376_0'));msgNext(rt,T('377_0'));}
  else msgSet(rt,0,T('381_0'));
  battleTextDefault(rt,s);s.checkcount+=1;
 }
 if((s.acting===2&&s.actcon===0)||(s.acting===3&&s.actcon===0)){
  let maxv=0;for(let i=0;i<6;i++)if(s.partvisible[i]===1)maxv+=1;
  if(s.vinebgcount<1)s.maxvinecount=maxv;
  if(g.hp[2]<=0&&g.hp[3]<=0&&s.acting===2){
   if(snapMercy(s,rt,4,'946_0')){msgSet(rt,0,T('949_0'));msgNext(rt,T('950_0'));}
  }else if(s.acting===3){
   s.snapallcount+=1;if(s.snapallcount===2)s.snapallcount=0;
   snapMercy(s,rt,7,'961_0','964_0');
  }else{
   const text=T(s.simultotal===1?'275_0':'275_1');
   if(snapMercy(s,rt,2,'973_0'))msgSet(rt,0,text);
  }
  battleTextDefault(rt,s);
  if(s.acting===2)s.alarm[4]=30;else s.actcon=1;
  s.acting=0;
 }
 if(s.acting===5&&s.actcon===0){
  s.actcon=12;s.acting=0;s.alarm[4]=15;
  rt.create(throwKrisVineController,s.x,s.y);
  rememberXY(s);moveToPointOverTime(s,rt,s.x-40,rt.view.y+195,8);
 }
 if(s.actcon===13){
  msgSet(rt,0,T('534_0').split('~1').join(inputName(6)));
  for(const h of rt.all(heroKris))h.visible=false;
  for(const h of rt.all(heroSusie))h.visible=false;
  const sus=rt.first(heroSusie)!;s.throwsus=rt.create(throwKris,sus.x,sus.y).id;
  battleTextDefault(rt,s);s.actcon=14;
 }
 if(s.actcon===15){
  for(const v of rt.all(throwKrisVineController))v.con=2;
  moveToRememberXY(s,rt,8);s.actcon=16;s.alarm[4]=15;
 }
 if(s.actcon===17)s.actcon=1;
 // Susie's and Ralsei's own wire snaps break two wires when the other two are down.
 const helperSnap=(who:'sus'|'ral',other:number,fail2:string,ok2a:string,ok2b:string,fail:string,ok:string)=>{
  scanWires(s,rt);
  if(g.hp[1]<=0&&g.hp[other]<=0){if(snapMercy(s,rt,4,fail2)){msgSet(rt,0,T(ok2a));msgNext(rt,T(ok2b));}}
  else snapMercy(s,rt,2,fail,ok);
  battleTextDefault(rt,s);s['actcon'+who]=0;s['acting'+who]=0;
 };
 if(s.actingsus===1&&s.actconsus===1){helperSnap('sus',3,'1127_0','1130_0','1131_0','1140_0','1141_0');s.alarm[4]=30;}
 if(s.actingsus===2&&s.actconsus===1){s.actingsus=0;s.actcon=1;s.bigshotcount=20;msgSet(rt,0,T('898_0'));battleTextDefault(rt,s);}
 if(s.actingral===1&&s.actconral===1){helperSnap('ral',2,'1273_0','1276_0','1277_0','1285_0','1288_0');s.actcon=1;}
 if(s.actingral===2&&s.actconral===1){
  s.actconral=0;s.actingral=0;s.actcon=1;
  if(rt.count(tinyRalsei)<4){
   msgSet(rt,0,T(s.simultotal===1?'643_0':'643_1'));battleTextDefault(rt,s);
   rt.all(tinyRalsei).forEach((f,i)=>{f.place=i*90;});
   for(let n=0;n<2;n++){
    rt.create(tinyRalsei,s.x,s.y);
    const all=rt.all(tinyRalsei),gap={4:90,3:180,2:270}[all.length];
    if(gap!==undefined)all.forEach((f,i)=>{f.place=i*gap;});
   }
  }else{
   msgSet(rt,0,T('679_0'));battleTextDefault(rt,s);
   let a=2;
   if(g.hp[2]<g.hp[3])a=2;if(g.hp[2]<g.hp[4])a=2;if(g.hp[3]<g.hp[2])a=3;if(g.hp[3]<g.hp[4])a=3;if(g.hp[4]<g.hp[2])a=4;if(g.hp[4]<g.hp[3])a=4;
   g.hp[a]+=10;snd(rt,'snd_boost');
  }
 }
}
/** ACTs are over (his own and Susie's or Ralsei's): full mercy starts the ending instead of the next turn. */
function actsDone(s:GmInstance,rt:GmRuntime){
 if((s.actcon===1&&!rt.exists(writer))||s.actconsus===20||s.actconral===20){
  s.usedact=1;
  if(rt.globals.mercymod[s.myself]>99&&s.endcon===0)s.endcon=1;
  else if(s.endcon===0)nextAct(rt,s);
 }
}

// ---- Step: the endings ----
const sceneOf=(rt:GmRuntime)=>rt.first(sceneEx2);
/** An ending balloon: his next line, shaking from the eighth one on. */
function endingBalloon(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.endcon=3;g.typer=72;enemyBlcon2(s,rt,s.x-10,g.monstery[s.myself],10);
 if(s.ballooncon>=8)for(const w of rt.all(writer))w.shake=2;
 return s;
}
/** HP down to zero: he powers up to EX, the screen flashes white and the scene takes over. */
function lostEnding(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.endcon===2){
  s.talktimer+=1;
  if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){
   destroyWriters(rt);
   const b=s.ballooncon;
   const shock=()=>{s.shocktimer=9999;s.hurttimer2=10;};
   if(b===1){msgSet(rt,0,T('1034_0'));s.ballooncon=2;s.balloonend=0;shock();s.partmode=40;}
   else if(b===2){msgSet(rt,0,T('1038_0'));s.ballooncon=3;s.balloonend=0;shock();}
   else if(b===3){msgSet(rt,0,T('1042_0'));s.ballooncon=4;s.balloonend=0;shock();}
   else if(b===4){msgSet(rt,0,T('1046_0'));s.ballooncon=5;s.balloonend=0;shock();}
   else if(b===5){
    msgSet(rt,0,T('1052_0'));s.ballooncon=6;s.balloonend=0;s.shockthreshold=10;s.hurttimer2=20;snd(rt,'snd_damage');s.dontchangepose=0;s.smokethreshold=10;s.partmode=40;
    for(let n=0;n<6;n++){
     const sm=rt.create(afterimageGrow,s.x+50,s.y+80);sm.visible=false;scriptDelayedOn(sm,rt,setVar,1,'visible',true);
     sm.depth=s.depth+10;sm.imageAlpha=2.5;sm.sprite='spr_cakesmoke';sm.hspeed=rt.random.randomRange(2,10);sm.gravity=-0.5;sm.friction=0.2;sm.vspeed=rt.random.randomRange(-1,-8);
    }
   }
   else if(b===6){msgSet(rt,0,T('1058_0'));s.ballooncon=7;s.balloonend=0;}
   else if(b===7){msgSet(rt,0,T('1062_0'));s.ballooncon=8;s.balloonend=0;}
   else if(b===8){
    const sc=sceneOf(rt);if(sc)sc.trackspeed=20;
    msgSet(rt,0,T('1068_0'));s.ballooncon=9;s.balloonend=0;s.shockthreshold=10;s.hurttimer2=10;
    snd(rt,'snd_sneo_overpower');rt.soundLoop?.('snd_sneo_overpower');rt.soundPitch?.('snd_sneo_overpower',0.3);s.targetbgspeed=-5;
   }
   else if(b===9){msgSet(rt,0,T('1076_0'));s.ballooncon=10;s.balloonend=0;s.shockthreshold=5;rt.soundPitch?.('snd_sneo_overpower',0.5);s.targetbgspeed=-9;s.smokethreshold=1;}
   else if(b===10){msgSet(rt,0,T('1083_0'));s.ballooncon=11;s.balloonend=0;s.shockthreshold=3;rt.soundPitch?.('snd_sneo_overpower',0.7);s.targetbgspeed=-13;}
   else if(b===11){msgSet(rt,0,T('1089_0'));s.ballooncon=12;s.balloonend=0;s.shockthreshold=2;rt.soundPitch?.('snd_sneo_overpower',0.9);s.targetbgspeed=-17;}
   else if(b===12){msgSet(rt,0,T('1095_0'));s.ballooncon=13;s.balloonend=0;s.shockthreshold=1;rt.soundPitch?.('snd_sneo_overpower',1.1);s.targetbgspeed=-21;}
   else if(b===13){msgSet(rt,0,T('1101_0'));s.ballooncon=0;s.balloonend=1;s.shocktimer=1;rt.soundPitch?.('snd_sneo_overpower',1.3);s.targetbgspeed=-25;}
   endingBalloon(s,rt);
   if(s.ballooncon===0)for(const w of rt.all(writer)){w.shake=3;w.rate=3;}
   s.alarm[6]=1;
  }
  const sc=sceneOf(rt);
  if(sc){sc.trackspeed+=(s.targetbgspeed*6-sc.trackspeed)*0.1;sc.cityscape_speed_max+=(s.targetbgspeed-sc.cityscape_speed_max)*0.1;}
 }
 if(s.endcon===4){
  s.talktimer+=1;
  if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){
   s.endtimer+=1;const t=s.endtimer;
   if(t<=90)rt.soundPitch?.('snd_sneo_overpower',1.3+(2-1.3)*(t/90));
   if(t===120){s.violentendflash=1;s.endtimer=140;}
   if(t===151){
    rt.soundStop?.('snd_sneo_overpower');for(const a of rt.all(afterimageGrow))rt.destroy(a);snd(rt,'snd_explosion');
    const w=darkMarker(rt,-10,-10,'spr_pixel_white');w.imageXscale=999;w.imageYscale=999;w.depth=0;w.imageAlpha=0;s.whiteall=w.id;
   }
   if(t>150&&t<162){const w=rt.byId(s.whiteall);if(w)w.imageAlpha=(t-150)/11;}
   if(t===300){const b=darkMarker(rt,-10,-10,'spr_pixel_white');b.imageXscale=999;b.imageYscale=999;b.depth=-1;b.imageAlpha=0;b.imageBlend=0;s.blackall=b.id;}
   if(t>300&&t<331){const b=rt.byId(s.blackall);if(b)b.imageAlpha=(t-300)/30;}
   if(t===331&&rt.byId(s.whiteall))partyHomeAndScene(rt);
  }
 }
}
/** Both endings leave every hero with at least 1 HP and hand over to the scene's battle end. */
function partyHomeAndScene(rt:GmRuntime){
 const g=rt.globals;for(const i of [1,2,3])if(g.hp[i]<1)g.hp[i]=1;
 const sc=sceneOf(rt);if(sc){sc.forcend=1;sc.con=13;}
}
/** Every wire cut but one: he understands, sings "Friendship", and Kris cuts the last wire. */
function sparedEnding(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.endcon===2){
  const sc=sceneOf(rt);
  let aa=sc&&sc.shop_spamton_bg_con>0&&sc.shop_spamton_bg_con<3?1:0;
  s.talktimer+=1;
  if((button3_p(rt)&&s.talktimer>15&&aa===0)||(!rt.exists(writer)&&aa===0)){
   if(s.ballooncon===7&&sc&&sc.shop_spamton_bg_con<3){sc.shop_spamton_bg_con=1;aa=1;}
  }
  if((button3_p(rt)&&s.talktimer>15&&aa===0)||(!rt.exists(writer)&&aa===0)){
   destroyWriters(rt);
   const b=s.ballooncon;
   if(b===1){s.headendcon=1;msgSet(rt,0,T('1172_0'));s.ballooncon=2;s.balloonend=0;s.partmode=1;}
   else if(b===2){msgSet(rt,0,T('1176_0'));s.ballooncon=3;s.balloonend=0;}
   else if(b===3){s.headendcon=2;msgSet(rt,0,T('1181_0'));s.ballooncon=4;s.balloonend=0;s.partmode=1;}
   else if(b===4){s.headendcon=3;msgSet(rt,0,T('1186_0'));s.ballooncon=5;s.balloonend=0;s.partmode=1;}
   else if(b===5){msgSet(rt,0,T('1190_0'));s.ballooncon=6;s.balloonend=0;}
   else if(b===6){s.headendcon=2;msgSet(rt,0,T('1195_0'));s.ballooncon=7;s.balloonend=0;s.partmode=99;}
   else if(b===7){
    s.headendcon=3;
    g.currentsong[0]='spamton_happy';g.currentsong[1]=rt.sourceAudio?.music('spamton_happy')??'spamton_happy';rt.sourceAudio?.loop(g.currentsong[0]);
    msgSet(rt,0,T('1202_0'));s.ballooncon=8;s.balloonend=0;s.partmode=36;
   }
   else if(b===8){msgSet(rt,0,T('1208_0'));s.ballooncon=9;s.balloonend=0;}
   else if(b===9){msgSet(rt,0,T('1212_0'));s.ballooncon=10;s.balloonend=0;}
   else if(b===10){msgSet(rt,0,T('1216_0'));s.ballooncon=11;s.balloonend=0;}
   else if(b===11){msgSet(rt,0,T('1220_0'));s.ballooncon=12;s.balloonend=0;}
   else if(b===12){msgSet(rt,0,T('1225_0'));s.ballooncon=13;s.balloonend=0;s.partmode=36;}
   else if(b===13){msgSet(rt,0,T('1229_0'));s.ballooncon=0;s.balloonend=1;s.partmode=36;s.dancealtcon=2;}
   endingBalloon(s,rt);
   if(s.ballooncon===13||s.ballooncon===0)for(const w of rt.all(writer)){w.shake=3;w.rate=3;}
   s.alarm[6]=1;
  }
  if(sc){sc.trackspeed+=(s.targetbgspeed*6-sc.trackspeed)*0.1;sc.cityscape_speed_max+=(s.targetbgspeed-sc.cityscape_speed_max)*0.1;}
  if(s.ballooncon===13){s.siner+=2;for(let i=0;i<8;i++)s.partsiner[i]+=0.6;}
 }
 if(s.endcon===4){
  s.talktimer+=1;
  if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){
   s.endtimer+=1;const t=s.endtimer;
   if(t===1){
    rt.sourceAudio?.free(g.currentsong[0]);snd(rt,'snd_noise');snd(rt,'snd_damage');
    const b4=darkMarker(rt,-10,-10,'spr_pixel_white');b4.imageXscale=999;b4.imageYscale=999;b4.depth=(sceneOf(rt)?.depth??0)-1;b4.imageAlpha=0.5;b4.imageBlend=0;
    const vine=rt.create(sneoVineCut,s.x,s.y);s.vine=vine.id;
    vine.x1=s.x+s.partx[4]+s.partxoff[4]/1.2+20+Math.sin(s.partsiner[4]/25)*1.8;vine.x2=s.x+s.partx[4]+s.partxoff[4]/1.5+32;
    vine.y1=s.y+s.party[4]-10+s.partyoff[4];vine.y2=-400;vine.depth=s.depth+1;vine.vineid=4;
    const fx=rt.create(sneoVineWeak,s.x+s.partx[4]+s.partxoff[4]/1.2+16,s.y-35);s.vfx=fx.id;fx.depth=s.depth-5;
    s.lastwirecon=3;s.partmode=99;
    const sc=sceneOf(rt);if(sc){sc.cityscape_speed_max=0;sc.cityscape_speed=0;sc.trackspeed=0;}
   }
   if(t===91){
    s.depth=-99999;
    const b=darkMarker(rt,-10,-10,'spr_pixel_white');b.imageXscale=999;b.imageYscale=999;b.depth=0;b.imageAlpha=1;b.imageBlend=0;s.blackall=b.id;s.partmode=43;
   }
   if(t===330){const b=darkMarker(rt,-10,-10,'spr_pixel_white');b.imageXscale=999;b.imageYscale=999;b.imageAlpha=1;b.imageBlend=0;b.depth=-999999;s.blackall2=b.id;}
   if(t===450&&rt.byId(s.blackall2))partyHomeAndScene(rt);
  }
  if(s.ballooncon===0&&s.endtimer===0){s.siner+=3;for(let i=0;i<8;i++)s.partsiner[i]+=0.9;}
 }
}

/** At zero HP during his talk (or once mercy is full) the ending starts instead of a turn. */
function beforeTalk(s:GmInstance,rt:GmRuntime){
 if((isPhase(rt,'enemytalk',s)&&s.talked===0&&rt.globals.monsterhp[s.myself]<=0)||s.endcon===1){s.talked=-1;s.endcon=1;}
}
/** His follow-up balloons (talked 0.6), each after the previous one is read or skipped with C. */
function duringTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.talked!==0.6)return;
 s.talktimer+=1;
 if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){
  destroyWriters(rt);
  const next=FOLLOW_UP[s.ballooncon];
  if(next){msgSet(rt,0,T(next[0]));s.ballooncon=next[1];s.balloonend=next[1]===0?1:0;}
  s.talked=0.7;s.talktimer=0;
  if(s.correct_answer!==1){g.typer=72;enemyBlcon2(s,rt,s.x-10,g.monstery[s.myself],10);}
  s.correct_answer=-1;s.alarm[6]=1;
 }
}
/** His last balloon is read (or skipped with C): the box takes the attack's shape, then the soul comes in. */
function endTalk(s:GmInstance,rt:GmRuntime){
 if(s.talked!==1||!isPhase(rt,'enemytalk',s)||rt.exists(choicerNeo))return;
 s.talktimer+=1;
 if((button3_p(rt)&&s.talktimer>15)||!rt.exists(writer)){destroyWriters(rt);s.talkedcon=1;}
 if(s.talkedcon!==1)return;
 if(s.partmode===40){s.partmode=1;s.shockthreshold=0;s.hurttimer2=0;}
 s.rtimer=0;
 if(!rt.exists(spamtonCherub))blconSkip(s,rt,-1);else s.talktimer+=1;
 if(isPhase(rt,'bullets',s)){
  if(!rt.exists(growtangle))placeBox(s,rt);
  if(!rt.exists(moveHeart)&&!rt.exists(heart))moveHeartIn(rt);
 }
}
/** The status line once the soul is home. */
function afterAttack(s:GmInstance,rt:GmRuntime){
 if(rt.exists(returnHeart)&&s.statustextupdate===0){s.statustextupdate=1;statusText(s,rt);}
}
/** The endings, after his turn: HP at zero (or mercy full) leads to EX or to the wire cut. */
function endings(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 if(s.endcon===1){
  s.endtimer+=1;
  if(s.endtimer===1){rt.sourceAudio?.free(g.batmusic[0]);rt.userEvent(s,3);}
  if(s.endtimer>0&&s.endtimer<91){const sc=sceneOf(rt);if(sc){sc.trackspeed=-15+15*(s.endtimer/90);sc.cityscape_speed_max=5-5*(s.endtimer/90);}}
  if(s.endtimer===91){
   s.didwejustdie=1;
   if(g.mercymod[me]>99)s.sneo_defeat_cutscene_version=1;
   msgSet(rt,0,T('1009_0'));s.partmode=99;s.endcon=2;g.typer=72;enemyBlcon2(s,rt,s.x-10,g.monstery[me],10);
   s.endtimer=0;s.endcon=2;s.talktimer=0;s.ballooncon=1;s.balloonend=0;
  }
 }
 if(s.sneo_defeat_cutscene_version===0)lostEnding(s,rt);
 if(s.sneo_defeat_cutscene_version===1)sparedEnding(s,rt);
 if(s.endcon===10){s.endcon=11;const c=findController(rt);if(c)c.skipvictory=1;winCombat(rt);}
 if(s.stoprumblesfx>0)s.stoprumblesfx-=1;
 if(s.stoprumblesfx===1)rt.soundStop?.('snd_rumble');
}

// ---- End Step: mercy cuts wires ----
/** Mercy gained this frame, one point at a time: every second point cuts a wire (or weakens one). */
function endStep(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 if(s.singleshotmercy>9){
  const dc=rt.first(sneoBulletController);
  if(dc&&dc.type===1.5){
   dc.mercyaccumulated+=1;const w=rt.create(dmgWriter,g.monsterx[me],g.monstery[me]+20-g.hittarget[me]*20);w.damage=1;w.type=5;g.hittarget[me]+=1;
  }else mercyAdd2(s,rt,me,1);
  s.singleshotmercy=0;
 }
 if(!rt.exists(sneoBulletController)){
  gmArray(s,'idealx',()=>new Array(6).fill(0));gmArray(s,'idealrot',()=>new Array(6).fill(0));
  s.idealx[5]=0;s.idealrot[5]=0;s.partsiner[5]=0;s.partrot[5]=0;s.partx[5]=0;s.party[5]=0;
  s.partxoff[5]=rt.bank.get(s.partsprite[5])!.originX*2;s.partyoff[5]=rt.bank.get(s.partsprite[5])!.originY*2;
 }
 if(g.fighting===1&&s.prevmercy!==g.mercymod[me]){
  const gained=g.mercymod[me]-s.prevmercy;
  for(let n=0;n<gained;n++){
   s.prevmercy+=1;
   if(s.prevmercy%2!==0)continue;
   scanWires(s,rt);
   const multicut=1;let c=rt.random.irandom(5),done=false,cut=0;
   while(!done){
    if(s.partvisible[c]===1){
     s.partvisible[c]=0;
     const vine=rt.create(sneoVineCut,s.x,s.y);s.vine=vine.id;
     vine.x1=s.x+s.partx[c]+s.partxoff[c]/1.2+c*5+Math.sin(s.partsiner[c]/30)*2;vine.x2=s.x+s.partx[c]+s.partxoff[c]/1.5+c*8;
     vine.y1=s.y+s.party[c]-10+s.partyoff[c];vine.y2=-400;vine.depth=s.depth+1;vine.vineid=c;
     const fx=rt.create(sneoVineWeak,s.x+s.partx[c]+s.partxoff[c]/1.2+c*5,s.y-20);s.vfx=fx.id;fx.depth=s.depth-5;
     if(!(rt.sourceAudio?.playing('snd_damage')??false))snd(rt,'snd_damage');
     c=rt.random.irandom(5);cut+=1;if(cut>=multicut)done=true;
     s.vinebgcount-=1;
    }else{c+=1;if(c>5)c=0;}
    if(!s.partvisible.slice(0,6).some((v:number)=>v===1))done=true;
   }
  }
  if(s.vinebgcount>-2&&!rt.exists(throwKrisVineController))
   for(let i=0;i<6;i++)if(s.partvisible[i]===0){s.vineid=i;s.vine=rt.create(sneoVineTransition,s.x,s.y).id;}
  s.weakentimer=1;s.weakenshakeamount=10;
 }
 if(g.fighting===1)s.prevmercy=g.mercymod[me];
}

// ---- User events ----
/** Event 1: his ACT menu is empty; Kris's ACTs come from the Chapter 2 spell menu. */
function actSetup(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;
 g.canact[me][0]=1;g.actactor[me][0]=1;g.actname[me][0]=sourceText('obj_spamton_neo_enemy_slash_Other_11_gml_7_0');g.actdesc[me][0]='';g.actcost[me][0]=0;
 for(const j of [1,2]){g.canact[me][j]=0;g.actactor[me][j]=0;g.actname[me][j]='';g.actdesc[me][j]='';g.actcost[me][j]=0;}
 spellMenuSetupChapter2(rt);
}
/** Event 3: the battle's results flags (scr_monsterdefeat bookkeeping, NEO's own copy). */
function defeatFlags(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself,f=g.flag;
 g.monstergold[3]+=g.monstergold[me];g.monsterexp[3]+=g.monsterexp[me];
 if(f[51+me]===0){f[51+me]=2;if(g.monsterhp[me]<=0)f[51+me]=1;}
 if(f[51+me]===1){f[40]+=1;if(s.fatal===1)f[44]+=1;}
 if(f[51+me]===2)f[41]+=1;
 if(f[51+me]===3)f[42]+=1;
 if(f[51+me]===5)f[43]+=1;
 if(f[51+me]===6){f[45]+=1;g.monstergold[3]+=24;}
 let frozen=0,violent=0,spared=0,pacified=0;
 for(let d=0;d<3;d++){const v=f[51+d];if(v===1)violent+=1;if(v===2)spared+=1;if(v===3)pacified+=1;if(v===6)frozen+=1;}
 if(frozen>0)f[50]=6;if(pacified>0)f[50]=3;if(spared>0)f[50]=2;if(violent>0)f[50]=1;
 if(f[50]===6)f[926]+=1;
 if(f[54]!==0){f[f[54]]=f[50];f[54]=0;}
}
/** Event 4: shooting him too fast ("funnycheat") raises his attack. */
function funnyCheat(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;s.funnycheat+=1;
 if(s.funnycheat<=5)return;
 const t=g.tempflag[37];
 const cap=(max:number,add:number)=>{if(g.monsterat[me]<max)g.monsterat[me]+=add;else g.monsterat[me]=max;};
 if(t<2){cap(26,0.5);s.hellmode=1;}
 else if(t<4){cap(22,0.25);s.hellmode=1;}
 else if(t<6)cap(18,0.1);
 else if(t<10)cap(15,0.04);
}
function cleanUp(_s:GmInstance,rt:GmRuntime){
 rt.soundStop?.('snd_sneo_overpower');rt.globals.sp=4;rt.soundStop?.('snd_rumble');rt.sourceAudio?.volume('snd_rumble',1,0);
}
function alarm6(s:GmInstance){
 if(s.endcon>0){if(s.balloonend===1)s.endcon=4;else{s.endcon=2;s.talktimer=0;}}
 else if(s.balloonend===1)s.talked=1;
 else{s.talked=0.6;s.talktimer=0;}
}

/** obj_sneo_hitdetector: the head's hitbox, moved by NEO's Draw; phone bullets hitting it flash him. */
export const hitDetector:GmObjectDef={name:'obj_sneo_hitdetector',index:601,sprite:'spr_sneo_head_sad',events:{
 create:s=>{s.imageSpeed=0;s.imageXscale=2;s.imageYscale=2;s.imageAlpha=0.2;s.imageBlend=0;s.visible=false;s.active=true;},
},collisions:[{target:phoneBullet,run:(_s,o,rt)=>{for(const n of rt.all(spamtonNeo))n.hitcon=1;rt.userEvent(o,0);}}]};

/** A BIG SHOT is fired (obj_heart): firing them back to back makes him angry (event 4); he notes that a BIG SHOT was
 * used; a Super Charge makes it fast with a trail, and the last one ends with a flash. */
function neoBigShot(n:GmInstance,shot:GmInstance,soul:GmInstance,rt:GmRuntime){
 if(soul.chargeshotcount>1)rt.userEvent(n,4);
 n.bigshotused=1;
 if(n.bigshotcount<=0)return;
 shot.hspeed=10*soul.f;shot.trail=1;n.bigshotcount-=1;
 let a=rt.random.random(45);
 if(n.bigshotcount===0){
  rt.create(superchargeEnd,soul.x,soul.y);snd(rt,'snd_stardrop');
  for(let k=0;k<8;k++){
   const part=rt.create(soulSpark,soul.x+10,soul.y+10);part.direction=a+rt.random.random(15);
   part.imageXscale=2+rt.random.random(2);part.imageYscale=2+rt.random.random(2);part.speed=16;part.friction=0.8;a+=45;
  }
 }else for(let k=0;k<8;k++){
  const part=rt.create(soulSpark,soul.x+10,soul.y+10);part.direction=a+rt.random.random(15);part.speed=8;part.friction=0.8;a+=45;
 }
}
/** NEO is the standard enemy (deltarune/enemy.ts) with these steps of his own. */
export const spamtonNeo:HookedDef=defineEnemy({name:'obj_spamton_neo_enemy',index:702,depth:0,sprite:'spr_sneo_example'},{
 create,
 beforeStep:(s,rt)=>{if(s.bigshot===1)rt.globals.sp=5;},
 onlyWhileFighting:true,
 beforeTalk,startTalk,duringTalk,endTalk,
 attackDelay:15,attack:startAttack,statusLine:attackLine,afterAttack,
 acts,actsDone,afterStep:endings,
 monsterPosition:(s,rt)=>[s.x+rt.spriteWidth(s)/3,s.y+rt.spriteHeight(s)/2],
 hooks:{
  // A FIGHT hit electrifies him (obj_heroparent Alarm 1).
  onHeroHit:n=>{Object.assign(n,{partmode:40,shockthreshold:15,shocktimer:9999,hurttimer2:10});},
  // At zero HP his own Step starts the ending during his next talk.
  defeatedByDamage:false,
  // His upgrade makes every shot a BIG SHOT (obj_yheart_shot Create).
  upgradedShot:n=>{if(n.upgrade<=0)return false;n.bigshotused=1;return true;},
  // Susie's Super Charge: faster charging and a glowing soul while it lasts (obj_heart).
  superCharged:n=>n.bigshotcount>0,
  onBigShot:neoBigShot,
  // A flash on him (a spell's hit) flashes his parts and electrifies him instead of drawing (obj_oflash Draw).
  onFlash:(n,flash,rt)=>{
   flash.siner+=flash.flashspeed;
   if(flash.siner>4&&Math.sin(flash.siner/3)<0){rt.destroy(flash);n.state=0;return true;}
   if(flash.siner===flash.flashspeed)Object.assign(n,{partmode:40,shockthreshold:15,shocktimer:9999,hurttimer2:10});
   for(let i=0;i<8;i++){n.flash=1;n.fsiner=n.partsiner[i]/8;}
   return true;
  },
  // At full mercy the end of his turn starts his ending (obj_battlecontroller Alarm 2).
  onTurnEnd:(n,rt)=>{if(rt.globals.mercymod[n.myself]<=99)return false;n.endcon=1;return true;},
 },
 events:{
  endStep,draw:neoBodyDraw,destroy:cleanUp,
  alarm4:s=>{s.actcon+=1;},alarm6,
  user0:chooseNeoAttack,user1:actSetup,user3:defeatFlags,user4:funnyCheat,
  // Event 10 does nothing: NEO never runs the usual spare-and-leave defeat.
  user10:()=>{},
 },
});
void afterimage;void bigLaser;void first;
