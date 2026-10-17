import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {growtangle,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {nextAct} from '../../deltarune/controller';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {bulletSpawner,blconSkip,isPhase,mercyAdd2,msgSet,drawBodyPart,turnTimer} from '../../deltarune/chapter2-battle';
import {enemyObjectInit,enemyDrawHurtGeneric,monsterPop,simulText,actCharSprite,actCharSpriteEnd,terminateWriter,spareEnemy} from '../../deltarune/chapter2-enemy';
import {sourceText} from '../../host/text';
const T=(key:string)=>sourceText('obj_tasque_manager_enemy_slash_Step_0_gml_'+key);
export function createTasqueManager(object:(n:string)=>GmObjectDef):GmObjectDef[]{
 const enemy=defineEnemy({...object('obj_tasque_manager_enemy'),depth:0},{
  create:(s,rt)=>{enemyObjectInit(s,rt);Object.assign(s,{talkmax:90,imageSpeed:1/6,hurtsprite:'spr_tm_hurt',timer:0,gml_sprite:['spr_tm_head','spr_tm_body','spr_tm_tail','spr_tm_hand_l','spr_tm_hand_r','spr_tm_legs'],sparesprite:['spr_tm_head_spare','spr_tm_body_spare','spr_tm_tail_spare','spr_tm_hand_l_spare','spr_tm_hand_r_spare','spr_tm_legs_spare'],sparedsprite:'spr_npc_tasquemanager',xOffset:[],yOffset:[],timesOrdered:0,timesCharged:0,balloon:-4,timesTrained:0,treatText:false,badgeText:false,quizDifficulty:0,overrideAttack:0,tailcheck:false,knifecheck:false,lastQuizLetter:0,init:0,violenceused:0,violenceusedcon:0,hitbysimonsaysattackcount:0,simonsayscon:0});
   for(s.i=0;s.i<6;s.i++){const spr=rt.bank.get(s.gml_sprite[s.i]);if(!spr)throw Error(`Missing manager sprite ${s.gml_sprite[s.i]}`);s.xOffset[s.i]=spr.originX*2-22;s.yOffset[s.i]=spr.originY*2-6;}},
  beforeStep:(s,rt)=>{if(s.init===0){if(rt.globals.flag[419]===1)rt.globals.mercymod[s.myself]=100;if(rt.globals.flag[419]===2)rt.globals.mercymod[s.myself]=50;s.init=1;}
   if(rt.exists(object('obj_tm_quizzler')))s.simonsayscon=1;
   if(s.simonsayscon===1&&!rt.exists(object('obj_tm_quizzler'))){s.simonsayscon=0;if(s.hitbysimonsaysattackcount<2&&s.quizDifficulty<3)s.quizDifficulty++;s.hitbysimonsaysattackcount=0;}},
  talk:(s,rt)=>managerTalk(s,rt),
  endTalk:(s,rt)=>{if(s.talked===1&&isPhase(rt,'enemytalk',s)){s.rtimer=0;blconSkip(s,rt,15);if(isPhase(rt,'bullets',s)){if(!rt.exists(moveHeart))moveHeartIn(rt);if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+170);}}
   if(isPhase(rt,'bullets',s)&&s.attacked===0){if(s.rtimer===0){s.rr=s.overrideAttack?1:0;if(s.rr===1){const b=rt.first(growtangle);if(b)b.target_angle=45;}}
    if(s.rtimer===2&&monsterPop(rt)>1&&s.rr===1)for(const t of rt.all(object('obj_tasque_enemy')))t.rr=s.quizDifficulty>1&&s.quizDifficulty!==4?2:-1;
    if(rt.globals.encounterno===89)s.rr=1;
   }},
  attackDelay:15,
  attack:(s,rt)=>{const g=rt.globals;if(s.rr===0||s.rr===1){g.monsterattackname[s.myself]=s.rr===0?'WhipAttack':'QuizAttack';if(s.rr===1)s.lastQuizLetter=-1;const d=bulletSpawner(s,rt,s.x,s.y,object('obj_dbulletcontroller'));s.dc=d.id;d.type=s.rr===0?20:32;d.element=6;if(s.rr===1){if(g.encounterno===89){d.special=1;d.difficulty=4;}else d.difficulty=s.quizDifficulty;}}
   turnTimer(rt,140);s.overrideAttack=0;},
  statusLine:(s,rt)=>{const g=rt.globals;s.rr=rt.random.choose(0,1,2,3,4);let txt=T(`${164+s.rr*3}_0`);if(g.monsterstatus[s.myself]===1)txt=T('181_0');if(g.mercymod[s.myself]>=g.mercymax[s.myself])txt=T('186_0');g.battlemsg[0]=txt;},
  afterAttack:(_s,rt)=>{if(rt.globals.encounterno===89)turnTimer(rt,99999);},
  acts:(s,rt)=>managerActs(s,rt),actsDone:()=>{},
  afterStep:(s,rt)=>{if(rt.globals.myfight!==3){for(const n of ['obj_herokris','obj_herosusie','obj_heroralsei']){const h=rt.first(object(n));if(h&&h.imageAlpha===0){actCharSpriteEnd(s,rt);break;}}}},
  events:{alarm4:s=>{s.actcon++;},user13:()=>{},user10:(s,rt)=>{for(const t of rt.all(object('obj_tasque_enemy')))rt.userEvent(t,10);spareEnemy(s,rt);},
   draw:(s,rt)=>{const a=rt.first(object('obj_tm_whip_animation'));if(a&&a.visible)return;if(s.state===3)enemyDrawHurtGeneric(s,rt);if(s.state===0){if(s.flash===1)s.fsiner++;const spare=rt.globals.mercymod[s.myself]>=rt.globals.mercymax[s.myself];s.timer+=1.5;const sin=Math.sin(s.timer/6),cos=Math.cos(s.timer/6),draw=(n:number,x:number,y:number,angle=0)=>drawBodyPart(s,rt,(spare?s.sparesprite:s.gml_sprite)[n],0,x,y,2,2,angle,0xffffff,s.imageAlpha);
     draw(2,s.x+s.xOffset[2],s.y+s.yOffset[2],-sin*10);draw(4,s.x+s.xOffset[4]+sin*2,s.y+s.yOffset[4]+sin*2);draw(3,s.x+s.xOffset[3]+cos*2,s.y+s.yOffset[3]+sin*2,sin*15);draw(5,s.x+s.xOffset[5],s.y+s.yOffset[5]);draw(1,s.x+s.xOffset[1],s.y+s.yOffset[1]+sin*2);draw(0,s.x+s.xOffset[0],s.y+s.yOffset[0]+sin*3,sin*10);}
    if(s.becomeflash===0)s.flash=0;s.becomeflash=0;},
  },
 });return [enemy];
}
function managerTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;g.typer=50;let txt=T('15_0');s.rr=monsterPop(rt)>1?rt.random.choose(0,1,2,3):rt.random.choose(0,1,2);
 if(s.rr===0)txt=T('19_0');if(s.rr===1){const n=rt.random.choose(0,1,2,3);txt=T('39_0').replace('~1',T(`${27+n*3}_0`));}
 if(s.rr===2){s.timesOrdered++;txt=T(s.timesOrdered===2?'46_0':'46_1');}if(s.rr===3){s.timesCharged++;txt=T(s.timesCharged>1?'53_0':'53_1');}
 let tail=false;for(let i=0;i<4;i++)if(g.chararmor1[i]===7||g.chararmor2[i]===7)tail=true;
 if(tail&&!s.tailcheck){s.tailcheck=true;txt=T('68_0');}if(g.charweapon[2]===7&&!s.knifecheck){s.knifecheck=true;txt=T('74_0');}
 if(s.violenceused===1&&s.violenceusedcon===0){txt=T('106_0');s.violenceusedcon=1;}else if(s.violenceused===1&&s.violenceusedcon===1)txt=T(rt.random.choose(0,1)===0?'112_0':'113_0');
 msgSet(rt,0,txt);enemyBlcon2(s,rt,s.x-10,g.monstery[s.myself],10);
}
function managerActs(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;msgSet(rt,0,T('205_0'));battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){actCharSprite(s,rt,'kris','spr_krisb_wan_tail',0,0);let txt;
  if(s.violenceused===1){txt=T('254_0');s.actcon=1;}else{mercyAdd2(s,rt,s.myself,g.hp[1]<=0&&g.hp[2]<=0?15:10);s.overrideAttack=1;txt=T(s.simultotal===1?'263_0':'264_0');}
  msgSet(rt,0,txt);simulText(s,rt,'kris');s.actcon=s.simulorderkri===0?20:-1;
 }
 if(s.acting===3&&s.actcon===0){actCharSprite(s,rt,'kris','spr_krisb_wan_tail',0,0);if(s.violenceused===1){msgSet(rt,0,T('277_0'));s.actcon=1;}else{s.overrideAttack=1;mercyAdd2(s,rt,s.myself,25);msgSet(rt,0,T('282_0'));s.actcon=1;}battleTextDefault(rt,s);}
 for(const [actor,acting,con,order,sprite,failed,a,b,other1,other2] of [['susie','actingsus','actconsus','simulordersus','spr_susie_wan_sign',293,301,302,0,2],['ralsei','actingral','actconral','simulorderral','spr_ralseib_wan',314,322,323,0,1]] as const){
  if(s[acting]===1&&s[con]===1){actCharSprite(s,rt,actor,sprite,0,0);let txt;if(s.violenceused===1)txt=T(`${failed}_0`);else{mercyAdd2(s,rt,s.myself,g.hp[other1]<=0&&g.hp[other2]<=0?10:6);txt=T(`${rt.random.choose(0,1)===0?a:b}_0`);}msgSet(rt,0,txt);simulText(s,rt,actor);s[con]=s[order]===0?20:0;}
 }
 if(s.actcon===1&&!rt.exists(writer)){actCharSpriteEnd(s,rt);nextAct(rt,s);}
 if(s.actcon===20||s.actconsus===20||s.actconral===20){actCharSpriteEnd(s,rt);if(terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actcon=1;}}
}
