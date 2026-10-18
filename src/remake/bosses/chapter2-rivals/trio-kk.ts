import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {defineEnemy} from '../../deltarune/enemy';
import {enemyObjectInit,enemyDrawHurtGeneric} from '../../deltarune/chapter2-enemy';
import {afterimage} from '../../deltarune/battle';
import {drawBodyPart,msgSet} from '../../deltarune/chapter2-battle';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {sourceText} from '../../host/text';
import {trioDanceActs} from './trio-dance';
import {trioEndTalk,trioAttack} from './trio-turn';
const T=(key:string)=>sourceText('obj_kk_enemy_slash_Step_0_gml_'+key),D=(key:string)=>sourceText('obj_kk_enemy_slash_Draw_0_gml_'+key),O=(key:string)=>sourceText('obj_kk_enemy_slash_Other_11_gml_'+key);
/** obj_kk_enemy: the third of Sweet's band, drawn from body parts; between turns she also reports how the band is
 * dancing (user event 1) and has Ralsei hint at dancing. */
export function createKKEnemy(object:(name:string)=>GmObjectDef):GmObjectDef{
 const base=object('obj_kk_enemy');
 const sweet=(rt:GmRuntime)=>rt.first(object('obj_sweet_enemy'))!,controller=(rt:GmRuntime)=>rt.first(object('obj_musical_controller'))!;
 /** User event 1: the line under the battle box. */
 function statusLine(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;s.rr=rt.random.choose(0,0,0,0,1);
  if(s.rr===0){
   const capn=rt.first(object('obj_hatguy_enemy'))!;
   const sw=O(sweet(rt).dancing==true?'8_0':'4_0'),kk=O(s.dancing==true?'10_0':'6_0'),cp=O(capn.dancing==true?'9_0':'5_0');
   g.battlemsg[0]=sw+'&'+kk+'&'+cp;
  }
  if(s.rr===1)g.battlemsg[0]=T('130_0');
  const sw=sweet(rt),c=controller(rt);c.ralseiportrait=0;
  if(sw.actCounter===1&&!sw.letsdance){sw.letsdance=true;c.ralseiportrait=1;g.battlemsg[0]=T('126_0');}
  if(sw.actCounter===2&&!sw.letsdance2&&c.happyfeetscene===0){sw.letsdance2=true;c.ralseiportrait=1;g.battlemsg[0]=O('29_0');}
  if(sw.actCounter===3&&!sw.letsdance3&&c.happyfeetscene===0){sw.letsdance3=true;c.ralseiportrait=1;g.battlemsg[0]=O('37_0');}
 }
 return defineEnemy({name:base.name,index:base.index,depth:base.depth??0,sprite:base.sprite},{
  create:(s,rt)=>{
   enemyObjectInit(s,rt);const c=rt.first(object('obj_battlecontroller'))!;c.hidemercy=1;s.depth=c.depth-2;
   Object.assign(s,{talkmax:180,imageSpeed:1/6,hurtsprite:'spr_kk_hurt',sparedsprite:'spr_diamondm_spared',recruitable:0,timer:0,timerB:0,down:0});
   s.gml_sprite=['s_kkSpine','s_kkArmL','s_kkArmR','s_kkFeet','s_kkFootR','s_kkLegs','s_kkHandR','s_kkHandL','s_kkChest','s_kkHead'];
   Object.assign(s,{heal:0,learnedAct:false,helpusattack:0,dancing:false,danceCounter:0,postattackscene:0,groove:0,siner2:17,musicalnotetimer:0,hurtstate2:0,dancetimer:0,dance_index:4,updatetimer:0});
  },
  beforeStep:(s,rt)=>{if(rt.globals.monstercomment[s.myself]===T('3_0')){rt.globals.monstercomment[s.myself]=' ';rt.globals.monsterstatus[s.myself]=0;}},
  talk:(s,rt)=>{
   const g=rt.globals;s.postattackscene=0;s.heal=0;s.groove=0;g.typer=50;
   // Milk is offered once a bandmate is hurt.
   let hurt=0;
   for(const name of ['obj_sweet_enemy','obj_hatguy_enemy']){const e=rt.first(object(name));if(e&&g.monsterhp[e.myself]<g.monstermaxhp[e.myself])hurt=1;}
   s.rr=rt.random.choose(0,1,2,3);
   if(s.dancing==1)msgSet(rt,0,T('35_0'));
   else{if(s.rr===0)msgSet(rt,0,T('38_0'));if(s.rr===1)msgSet(rt,0,T('39_0'));if(s.rr===2)msgSet(rt,0,T('40_0'));if(s.rr===3)msgSet(rt,0,T(hurt===0?'41_0':'42_0'));}
   enemyBlcon2(s,rt,s.x-10,g.monstery[s.myself],10);
  },
  endTalk:(s,rt)=>trioEndTalk(s,rt,object),attack:(s,rt)=>trioAttack(s,rt,object),
  statusLine,
  afterAttack:(s,rt)=>{if(!rt.exists(object('obj_sweet_enemy'))&&rt.globals.mnfight===2&&rt.globals.turntimer<=1&&s.postattackscene===0){rt.first(object('obj_battlecontroller'))!.noreturn=1;rt.userEvent(controller(rt),0);s.postattackscene=1;}},
  acts:(s,rt)=>trioDanceActs(s,rt,object,'kk'),actsDone:()=>{},
  events:{
   alarm4:s=>{s.actcon++;},
   user1:statusLine,
   draw:(s,rt)=>{
    if(s.hurtstate2===1){rt.drawSprite('spr_kk_hurt',0,s.x,s.y,2,2,0,0xffffff,1);return;}
    if(s.state===3)enemyDrawHurtGeneric(s,rt);
    if(s.state===0){
     if(s.dancing==1){
      if(s.flash===1)s.fsiner++;
      s.updatetimer++;if(s.updatetimer>=2){s.siner+=2;s.updatetimer=0;}
      const sn=s.siner,part=(frame:number,x:number,y:number)=>drawBodyPart(s,rt,'spr_kk_dance',frame,x,y,2,2,0,0xffffff,1);
      part(s.dance_index,s.x+Math.sin(sn/4)*14,s.y+Math.abs(Math.cos(sn/4))*4-4);
      part(3,s.x-Math.sin(sn/4)*8,s.y+Math.cos(sn/2)*3);
      part(2,s.x+Math.sin(sn/3)*3,s.y+Math.cos(sn/2)*4);
      part(1,s.x+Math.sin(sn/2)*2,s.y+Math.cos(sn/2)*6);
      part(6,s.x+Math.sin(sn/2)*2+Math.sin(sn/4)*4,s.y+Math.cos(sn/2)*6);
      s.dancetimer++;s.dance_index=Math.sin(sn/4)>0?4:5;
      s.musicalnotetimer++;
      if(s.musicalnotetimer===14){
       s.musicalnotetimer=0;const a=rt.create(afterimage,s.x+rt.spriteWidth(s)/2-10+rt.random.random(40),s.y+20);s.anim=a.id;
       Object.assign(a,{sprite:'spr_musicalbattlenote1',depth:s.depth-5,imageXscale:2,imageYscale:2,direction:270,gravity:-.2});a.hspeed=rt.random.randomRange(.1,.8)*rt.random.choose(1,-1);
      }
     }else{
      if(s.flash===1)s.fsiner++;
      s.timer+=2;if(s.timer>8){s.timerB+=1;s.timer=0;}
      const b=s.timerB;if(Math.cos(b)>.8)s.down=1;if(Math.cos(b)<-.8)s.down=0;
      const p=s.gml_sprite as string[],part=(sprite:string,frame:number,x:number,y:number)=>drawBodyPart(s,rt,sprite,frame,x,y,2,2,0,0xffffff,1);
      part(p[0],0,s.x,s.y);part(p[1],0,s.x,s.y+Math.cos(b)*2);part(p[2],0,s.x,s.y+Math.cos(b)*2);part(p[3],s.down,s.x,s.y);part(p[5],s.down,s.x,s.y+Math.cos(b)*2);
      part(p[6],0,s.x-Math.sin(b)*4,s.y+Math.cos(b)*2);part(p[7],0,s.x-Math.sin(b)*4,s.y+Math.cos(b)*2);part(p[8],0,s.x-Math.sin(b)*2,s.y+Math.cos(b));part(p[9],0,s.x-Math.sin(b*1.2)*6,s.y+Math.cos(b*2)*2);
     }
    }
    if(s.becomeflash===0)s.flash=0;s.becomeflash=0;rt.drawState.color=0xffffff;
    const g=rt.globals;
    if([1,3,11,12,13].includes(g.bmenuno)){
     s.siner2++;let dx=0,dy=0;if(g.charturn>0&&g.bmenuno===13){dx=140;dy=6;}
     if(g.myfight===0){
      rt.drawState.font='fnt_mainbig';const x=rt.view.x+258+dx,y=rt.view.y+399+dy;
      if(s.danceCounter===1){rt.drawText(x,y,D('106_0'),.7,1,0);rt.drawSprite('spr_musical_dancing_ui',0,rt.view.x+228+dx+Math.sin(s.siner2/4)*3,rt.view.y+416+dy);}
      else if(s.danceCounter===2){rt.drawText(rt.view.x+258,y,D('111_0'),.7,1,0);rt.drawSprite('spr_musical_dancing_ui',0,rt.view.x+228+dx+Math.sin(s.siner2/.8)*3,rt.view.y+416+dy);}
      else{rt.drawText(x,y,D('116_0'));rt.drawSprite('spr_musical_notdancing_ui',0,rt.view.x+228+dx+Math.sin(s.siner2/10)*3,rt.view.y+416+dy);}
     }
    }
   },
  },
 });
}
