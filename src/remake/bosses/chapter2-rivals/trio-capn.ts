import type {GmObjectDef} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyObjectInit,enemyDrawHurtGeneric,enemyDrawIdleGeneric} from '../../deltarune/chapter2-enemy';
import {afterimage} from '../../deltarune/battle';
import {drawBodyPart,msgSet} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {sourceText} from '../../host/text';
import {trioDanceActs} from './trio-dance';
import {trioEndTalk,trioAttack} from './trio-turn';
const T=(key:string)=>sourceText('obj_hatguy_enemy_slash_Step_0_gml_'+key),D=(key:string)=>sourceText('obj_hatguy_enemy_slash_Draw_0_gml_'+key);
export function createCapnEnemy(object:(name:string)=>GmObjectDef):GmObjectDef{
 const base=object('obj_hatguy_enemy');
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  create:(s,rt)=>{enemyObjectInit(s,rt);const c=rt.first(object('obj_battlecontroller'))!;c.hidemercy=1;s.depth=c.depth-3;Object.assign(s,{talkmax:180,imageSpeed:1/6,idlesprite:'spr_hatguy_idle',hurtsprite:'spr_hatguy_idle',sparedsprite:'spr_hatguy_idle',recruitable:0,dancing:false,danceCounter:0,dancedwithsusie:0,heal:0,learnedAct:false,helpusattack:0,ishealing:0,postattackscene:0,groove:0,siner2:10,musicalnotetimer:0,hurtstate2:0});},
  beforeStep:(s,rt)=>{if(rt.globals.monstercomment[s.myself]===T('4_0')){rt.globals.monstercomment[s.myself]=' ';rt.globals.monsterstatus[s.myself]=0;}},
  talk:(s,rt)=>{s.postattackscene=0;s.heal=0;s.groove=0;rt.globals.typer=50;s.rr=rt.random.choose(0,1,2,3);msgSet(rt,0,T(s.dancing===1||s.dancing===true?s.dancedwithsusie===0?'29_0':'30_0':['33_0','34_0','35_0','36_0'][s.rr]));enemyBlcon2(s,rt,s.x-10,rt.globals.monstery[s.myself],10);s.dancedwithsusie=0;},
  endTalk:(s,rt)=>trioEndTalk(s,rt,object),attack:(s,rt)=>trioAttack(s,rt,object),
  statusLine:(s,rt)=>{s.rr=rt.random.choose(0,1,2,3);rt.globals.battlemsg[0]='';},
  afterAttack:(s,rt)=>{if(!rt.exists(object('obj_kk_enemy'))&&!rt.exists(object('obj_sweet_enemy'))&&rt.globals.mnfight===2&&rt.globals.turntimer<=1&&s.postattackscene===0){rt.first(object('obj_battlecontroller'))!.noreturn=1;const c=rt.first(object('obj_musical_controller'))!;rt.userEvent(c,0);s.postattackscene=1;}},
  acts:(s,rt)=>trioDanceActs(s,rt,object,'capn'),actsDone:()=>{},
  events:{
   alarm4:s=>{s.actcon++;},
   draw:(s,rt)=>{
    if(s.hurtstate2===1){rt.drawSprite('spr_hatguy_dance',0,s.x,s.y,2,2,0,0xffffff,1);return;}
    if(s.state===3)enemyDrawHurtGeneric(s,rt);
    if(s.state===0){if(s.dancing){s.siner+=1/6;drawBodyPart(s,rt,'spr_hatguy_dance',s.siner,s.x,s.y,2,2,0,0xffffff,1);s.musicalnotetimer++;if(s.musicalnotetimer===14){s.musicalnotetimer=0;const a=rt.create(afterimage,s.x+rt.spriteWidth(s)/2-20+rt.random.random(40),s.y);s.anim=a.id;Object.assign(a,{sprite:'spr_musicalbattlenote1',depth:s.depth-5,imageXscale:2,imageYscale:2,direction:270,gravity:-.2});a.hspeed=rt.random.randomRange(.1,.8)*rt.random.choose(1,-1);}}else enemyDrawIdleGeneric(s,rt,1/6);}
    if(s.becomeflash===0)s.flash=0;s.becomeflash=0;rt.drawState.color=0xffffff;
    const g=rt.globals;if([1,3,11,12,13].includes(g.bmenuno)){s.siner2++;let dx=0,dy=0;if(g.charturn>0&&g.bmenuno===13){dx=140;dy=6;}if(g.myfight===0){rt.drawState.font='fnt_mainbig';const x=rt.view.x+258+dx,y=rt.view.y+429+dy;if(s.danceCounter===1){rt.drawText(x,y,D('60_0'),.7,1,0);rt.drawSprite('spr_musical_dancing_ui',0,rt.view.x+228+dx+Math.sin(s.siner2/4)*3,rt.view.y+446+dy);}else if(s.danceCounter===2){rt.drawText(x,y,D('65_0'),.7,1,0);rt.drawSprite('spr_musical_dancing_ui',0,rt.view.x+228+dx+Math.sin(s.siner2/.8)*3,rt.view.y+446+dy);}else{rt.drawText(x,y,D('70_0'));rt.drawSprite('spr_musical_notdancing_ui',0,rt.view.x+228+dx+Math.sin(s.siner2/10)*3,rt.view.y+446+dy);}}}
   },
  },
 });
}

