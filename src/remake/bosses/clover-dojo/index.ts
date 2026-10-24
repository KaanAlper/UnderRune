import {moveTowardsPoint,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {ge,le,lengthdirX,lengthdirY,round} from '../../gm/math';
import {defineEnemy} from '../../deltarune/enemy';
import {monsterParent} from '../../deltarune/battle';
import {mercyAdd,nextAct} from '../../deltarune/controller';
import {enemyObjectInit,actCharSpriteEnd,simulText,terminateWriter} from '../../deltarune/chapter2-enemy';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {battleTextDefault,writer} from '../../deltarune/writer';
import {defeatRun} from '../../deltarune/party';
import {bulletInherit2} from '../../deltarune/chapter2-battle';
import {sourceText} from '../../host/text';
import {cloverEnemy,clubsBullet,clubsBulletDark} from '../clover';
import {createDojoPresentation} from './presentation';

type Objects=(name:string)=>GmObjectDef;
const TEXT:Record<string,string>={Create:'obj_clubsenemy_slash_Create_0_gml_',Step:'obj_clubsenemy_slash_Step_0_gml_',Draw:'obj_clubsenemy_slash_Draw_0_gml_'};
const text=(event:string,line:number,suffix='0')=>sourceText(TEXT[event]+line+'_'+suffix);
const msg=(rt:GmRuntime,line:number,suffix='0')=>{rt.globals.msg[0]=text('Step',line,suffix);};
export const CLOVER_DOJO_ENCOUNTERS={71:{party:[1,2,3],monsters:[['obj_clubsenemy',47,400,80]],heroes:[[94,50],[80,122],[72,200]],intro:'892_0',kind:'dojo'}} as const;
export function setupCloverDojoMonster(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself;if(g.monstertype[me]!==47)return false;
 const t=(line:number,suffix='0')=>sourceText(`scr_monstersetup_slash_scr_monstersetup_gml_${line}_${suffix}`);
 for(const [key,value] of Object.entries({monstermaxhp:1500,monsterhp:1500,monsterat:11,monsterdf:0,monsterexp:0,monstergold:0,sparepoint:5,mercymod:0,mercymax:100}))g[key][me]=value;
 g.monstername[me]=t(1464);for(const [slot,line] of [[0,1484],[1,1487],[2,1492]]){g.canact[me][slot]=1;g.actname[me][slot]=t(line);}g.actsimul[me][1]=0;g.actdesc[me][1]=t(1505);g.actactor[me][2]=4;g.actdesc[me][2]=t(1510);
 g.canactsus[me][0]=1;g.actnamesus[me][0]=t(1495);g.actsimulsus[me][0]=1;g.canactral[me][0]=1;g.actnameral[me][0]=t(1499,'0_b');g.actsimulral[me][0]=1;return true;
}
/** Dojo Clover uses the standard enemy lifecycle with a timed topic ACT. Its lists are native ds handles. */
export function createCloverDojo(object:Objects,room='room_battletest'){
 const enemy=defineEnemy({...object('obj_clubsenemy'),depth:90},{
  phase:(_s,rt,name)=>rt.globals.mnfight===(name==='enemytalk'?1:2),
  create:(s,rt)=>{
   enemyObjectInit(s,rt);cloverEnemy.events!.create!(s,rt);
   Object.assign(s,{notail:0,topic_count:0,topic_timer:0,topic_timer_total:0,topic_con:0,topic_start:false,topic_timeup:false,right_answer:0,clockalpha:0,progress:0});
   s.likes_list=rt.dsCreate('list');for(let n=69;n<=82;n++)rt.ds('list',s.likes_list).push(text('Create',n));
   s.dislikes_list=rt.dsCreate('list');for(let n=91;n<=107;n++)rt.ds('list',s.dislikes_list).push(text('Create',n));
  },
  talk:(s,rt)=>{rt.globals.typer=50;s.rr=rt.random.choose(0,1,2);const start=[19,26,33][s.rr];s.text1=text('Step',start);s.text2=text('Step',start+1);s.text3=text('Step',start+2);for(const [key,dx,dy,kind] of [['text1',-110,-10,4],['text2',-125,70,5],['text3',125,-10,6]] as const){rt.globals.msg[0]=s[key];enemyBlcon2(s,rt,s.x+dx,s.y+dy,kind);}for(const m of rt.withInstances(monsterParent))m.talkmax=210;s.manual=0;},
  attack:(s,rt)=>{s.rr=rt.random.choose(0,1,2);const c=rt.create(object('obj_dbulletcontroller'),s.x,s.y);s.dc=c.id;c.type=[30,31,33][s.rr];c.target=s.mytarget;c.grazepoints=5;c.timepoints=s.rr===1?1:2;c.damage=rt.globals.monsterat[s.myself]*5;if(s.rr!==2)c.ratio=0.7;rt.globals.turntimer=240;},
  attackWait:(_s,rt)=>{rt.globals.turntimer=150;},
  statusLine:(s,rt)=>{const g=rt.globals,me=s.myself;s.rr=rt.random.choose(0,1,2,3,4,5);g.battlemsg[0]=text('Step',139+s.rr);if(g.monsterstatus[me]===1)g.battlemsg[0]=text('Step',145);if(le(g.monsterhp[me],g.monstermaxhp[me]/3))g.battlemsg[0]=text('Step',146);if(ge(g.mercymod[me],g.mercymax[me]))g.msg[0]=text('Step',147);if(s.betray===1)g.battlemsg[0]=text('Step',148);s.betray=0;},
  acts:(s,rt)=>cloverActs(s,rt,object),actsDone:()=>{},
  monsterPosition:(s,rt)=>[s.x+rt.spriteWidth(s)/2+50,s.y+rt.spriteHeight(s)/2+40],
  events:{draw:(s,rt)=>cloverDraw(s,rt,object,room),destroy:(s,rt)=>{rt.dsDestroy('list',s.likes_list);rt.dsDestroy('list',s.dislikes_list);}},
 });
 const tailIntro:GmObjectDef={...object('obj_clovertail_intro'),events:{
  create:(s,rt)=>{s.timer=0;s.con=0;s.x+=26;s.y-=24;s.imageXscale=2;s.imageYscale=1.8;required(rt,object,'obj_clubsenemy').notail=1;},
  step:(s,rt)=>{
   if(s.con===0){s.imageXscale+=0.5;s.timer++;if(s.timer===10){const t=rt.create(object('obj_clovertail'),rt.view.x+320,0);s.tail=t.id;t.damage=s.damage;t.target=s.target;s.con=1;s.timer=0;}}
   const t=rt.first(object('obj_clovertail'));if(rt.globals.turntimer<=5&&t&&t.con===1)t.con=2;
   if(rt.globals.turntimer<=0&&s.con===1)s.con=2;
   if(s.con===2){s.imageXscale-=0.5;s.timer++;if(s.timer===10){rt.destroy(s);required(rt,object,'obj_clubsenemy').notail=0;}}
  },
 }};
 const tail:GmObjectDef={...object('obj_clovertail'),events:{
  create:(s,rt)=>{Object.assign(s,{con:0,timer:0,shottimer:0,siner:0,sineradd:rt.random.random(.1)+.95,vsiner:0,destroytimer:0,grazed:0,grazepoints:1,timepoints:1,target:-1,grazetimer:0,element:'none',dont:1,inv:120});const c=rt.first(object('obj_clubsenemy'));if(c)s.damage=rt.globals.monsterat[c.myself]*5;},
  step:(s,rt)=>{
   if(s.con===0){if(s.y<rt.view.y+40)s.y+=(rt.view.y+60-s.y)*.2;else{s.con=1;s.timer=0;}}
   if(s.con===1){s.siner+=s.sineradd;s.x=s.xstart+Math.sin(s.siner/10)*70;s.imageAngle=Math.sin(s.siner/6)*20;s.vspeed=Math.sin(s.siner/4)*8;s.timer++;if(s.timer>=8){s.timer=0;const b=rt.create(object('obj_regularbullet'),s.x,s.y);s.shot=b.id;if(b.live){b.sprite='spr_clubsbullet_dark';b.imageAngle=-90;b.speed=6+s.vspeed/4;b.active=1;b.imageAngle=s.imageAngle-90;b.direction=s.imageAngle-90;b.target=s.target;b.damage=s.damage;b.grazepoints=6;}bulletInherit2(s,b);}}
   if(s.con===2){if(s.y>rt.view.y-30)s.y+=(rt.view.y-30-s.y)*.3;s.destroytimer++;if(s.destroytimer===30)rt.destroy(s);}
  },
 }};
 const dark:GmObjectDef={...clubsBulletDark,events:{...clubsBulletDark.events,step:(s,rt)=>{
  s.dtimer++;
  const volley=(spread:number,extra:number,speed:number,inherit:boolean)=>{
   const h=required(rt,object,'obj_heart');moveTowardsPoint(s,h.x+8,h.y+8,.1);
   for(const [sprite,offset] of [['spr_clubsball_b',0],['spr_clubsball_c',-spread],['spr_clubsball_a',spread]] as const){
    const b=rt.create(object('obj_regularbullet'),s.x,s.y);s.bul=b.id;if(!b.live)continue;b.sprite=sprite;b.direction=s.direction+offset+extra;b.speed=speed;b.imageAngle=s.direction;
    if(inherit)bulletInherit2(s,b);else{b.damage=s.damage;b.target=s.target;b.grazepoints=2;b.timepoints=1;}
   }
  };
  const fade=()=>{const a=rt.create(object('obj_afterimage'),s.x,s.y);s.a=a.id;a.sprite=s.sprite;a.imageAngle=s.imageAngle;rt.destroy(s);};
  if(s.type===0){if([15,19,23].includes(s.dtimer))volley(17,0,4,false);if(s.dtimer===25)fade();}
  if(s.type===2){if([20,22,24].includes(s.dtimer)){volley(19,-2+s.initangle,5,true);s.initangle+=2;}if(s.dtimer===26)fade();}
 }}};
 return {objects:[enemy,clubsBullet,dark,tailIntro,tail,...createDojoPresentation(object)],pattern:(s:GmInstance,rt:GmRuntime)=>cloverPattern(s,rt,object),enter:(rt:GmRuntime)=>{
  if(room==='room_dw_castle_dojo'&&rt.exists(object('obj_clubsenemy'))&&!rt.exists(object('obj_dojofx')))rt.create(object('obj_dojofx'),320,0);
 }};
}
function required(rt:GmRuntime,object:Objects,name:string){const s=rt.first(object(name));if(!s)throw Error(`Clover Dojo requires ${name}`);return s;}
function cloverActs(s:GmInstance,rt:GmRuntime,object:Objects){
 const g=rt.globals;g.choicemsg??=[];g.writerimg??=[];s.xx=rt.view.x;s.yy=rt.view.y;
 if(s.acting===1&&s.actcon===0){s.actcon=1;msg(rt,168);battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){s.topic_con=1;s.topic_timer=90;s.topic_timer_total=s.topic_timer;s.actcon=15;}
 if(s.topic_con===1){s.topic_con=2;s.topic_count++;for(const id of [s.likes_list,s.dislikes_list]){const list=rt.ds('list',id);for(let i=1;i<list.length;i++){const j=rt.random.next()%(i+1);[list[i],list[j]]=[list[j],list[i]];}}for(let i=0;i<3;i++){const prepend=i===2?'':'#';g.choicemsg[i]=prepend+rt.ds('list',s.dislikes_list)[i];}s.right_answer=Math.floor(rt.random.random(3));g.choicemsg[s.right_answer]=(g.choicemsg[s.right_answer].includes('#')?'#':'')+rt.ds('list',s.likes_list)[0];g.msgno=0;msg(rt,233);battleTextDefault(rt,s);}
 if(s.topic_con===2&&!rt.exists(writer)){s.topic_con=3;g.msgno=0;g.msg[0]='\\C3 ';battleTextDefault(rt,s);}
 if(s.topic_con===3){if(!rt.exists(writer)&&!rt.exists(object('obj_choicer_neo')))s.topic_con=4;else{s.topic_timer--;if(s.topic_timer<=0){s.topic_con=4;s.topic_timeup=true;for(const d of [writer,object('obj_choicer_neo')])for(const w of rt.all(d))rt.destroy(w);}}}
 if(s.topic_con===4&&!rt.exists(writer)&&!rt.exists(object('obj_choicer_neo'))){s.topic_start=false;s.topic_con=0;let line:number,suffix='0';if(s.topic_timeup){s.topic_timeup=false;rt.sound?.('snd_error');line=286;}else if(g.choice===s.right_answer){rt.sound?.('snd_won');if(g.mercymod[s.myself]<g.mercymax[s.myself])mercyAdd(s,rt,s.myself,Math.max(20,Math.min(50,20+s.turns*5)));line=293;}else{rt.sound?.('snd_error');line=296;suffix='0_b';}g.writerimg[1]='spr_miniface_clover_happy';g.writerimg[2]='spr_miniface_clover_mad';g.writerimg[3]='spr_miniface_clover_sad';g.msgno=0;msg(rt,line,suffix);s.actcon=1;battleTextDefault(rt,s);}
 if(s.acting===3&&s.actcon===0){s.topic_con=1;s.topic_timer=300;s.topic_timer_total=s.topic_timer;s.actcon=15;}
 if(s.actcon===1&&!rt.exists(writer)){if(s.argue>=3){g.monstercomment[s.myself]=text('Step',256);g.monsterstatus[s.myself]=1;}s.actcon=0;actCharSpriteEnd(s,rt);nextAct(rt,s);}
 for(const [actor,acting,con,amount,line] of [['susie','actingsus','actconsus',5,459],['ralsei','actingral','actconral',25,469]] as const)if(s[acting]===1&&s[con]===1){mercyAdd(s,rt,s.myself,amount);g.msgno=0;msg(rt,line);simulText(s,rt,actor);s[con]=20;}
 if(s.actcon===20||s.actconsus===20||s.actconral===20)if(terminateWriter(s,rt)){s.actconsus=-1;s.actconral=-1;s.actcon=1;}
}
function cloverDraw(s:GmInstance,rt:GmRuntime,object:Objects,room:string){
 const g=rt.globals;if(s.notail===1){s.siner++;rt.drawSprite('spr_clubs_tail_attack',0,s.x,s.y,2,2,0,s.imageBlend,1);return;}
 if(s.state===3){if(le(g.monsterhp[s.myself],g.monstermaxhp[s.myself]/2)){g.monsterstatus[s.myself]=1;if(g.monstercomment[s.myself]===' ')g.monstercomment[s.myself]=text('Draw',15);}s.hurttimer--;if(s.hurttimer<0)s.state=0;else{if(g.monster[s.myself]===0){g.flag[522]++;defeatRun(s,rt);}s.hurtshake++;if(s.hurtshake>1){if(s.shakex>0)s.shakex--;if(s.shakex<0)s.shakex++;s.shakex=-s.shakex;s.hurtshake=0;}rt.drawSprite('spr_clubs_hurt',0,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);}}
 if(s.state===0){s.siner++;s.thissprite=ge(g.mercymod[s.myself],g.mercymax[s.myself])?'spr_clubs_spared':'spr_clubs_idle';rt.drawSprite(s.thissprite,s.siner/6,s.x,s.y,2,2,0,s.imageBlend,1);if(s.flash===1){s.fsiner++;rt.drawSpriteFog(s.thissprite,s.siner/6,s.x,s.y,2,2,0,0xffffff,-Math.cos(s.fsiner/5)*.4+.6);}}
 if(s.becomeflash===0)s.flash=0;s.becomeflash=0;if(s.actcon===15){if(le(s.clockalpha,1))s.clockalpha+=.05;}else if(ge(s.clockalpha,0))s.clockalpha-=.05;
 // The dojo room owns its floating clock's anchor. Battle-test scenes have no room prop to draw around.
 if(room==='room_dw_castle_dojo'&&rt.exists(object('obj_dojofx'))){
  const d=rt.drawState;d.color=0x0000ff;d.halign=1;d.font='fnt_mainbig';const time=round(s.topic_timer/30),value=String(time).padStart(2,'0');
  if(s.topic_con!==0){const label=text('Draw',98)+value;d.color=0;rt.drawRect(rt.view.x+320-rt.stringWidth(label)/2-10,rt.view.y+298-rt.stringHeight(label)/2,rt.view.x+320+rt.stringWidth(label)/2+10,rt.view.y+298+rt.stringHeight(label)/2+40);d.color=0x0000ff;rt.drawText(rt.view.x+320,rt.view.y+290,label);d.halign=0;d.color=0xffffff;}
  const fx=required(rt,object,'obj_dojofx'),ball=rt.byId(fx.ball);if(!ball)throw Error('Clover Dojo clock ball is absent');s.cx=ball.x;s.cy=ball.y+65;if(s.topic_timer/s.topic_timer_total<.25){s.cx+=Math.sin(s.topic_timer_total-s.topic_timer)*6*.125;s.cy+=Math.cos(s.topic_timer_total-s.topic_timer)*6*.125;}s.progress=s.topic_timer/s.topic_timer_total*360;rt.drawSprite('spr_clubs_clock_background',0,s.cx-56,s.cy-57,2,2,0,0xffffff,s.clockalpha);rt.drawSprite('spr_clubs_clock_background',1,s.cx-56,s.cy-57,2,2,0,0xffffff,(1-s.topic_timer/s.topic_timer_total)*s.clockalpha);rt.drawSprite('spr_clubs_clock_smallhand',0,s.cx,s.cy,2,2,360-s.progress*10,0xffffff,s.clockalpha);rt.drawSprite('spr_clubs_clock_bighand',0,s.cx,s.cy,2,2,360-s.progress,0xffffff,s.clockalpha);
 }
}
function cloverPattern(s:GmInstance,rt:GmRuntime,object:Objects):boolean{
 if(s.type===30){if(ge(s.btimer,20*s.ratio)){const x=rt.view.x+(s.side===1?660:-20),y=s.miny+rt.random.random(s.maxy-s.miny),b=rt.create(object('obj_clubsbullet'),x,y);s.bul=b.id;b.speed=12;b.damage=s.damage;b.target=s.target;b.grazepoints=4;if(s.side===1){b.direction=180;b.imageAngle=180;}s.btimer=0;}return true;}
 if(s.type===31){if(ge(s.btimer,30*s.ratio)){s.btimer=0;if(s.side===-1)s.dir=225;if(s.side===1)s.dir=315;s.radius=400;const h=required(rt,object,'obj_heart'),b=rt.create(object('obj_clubsbullet_dark'),h.x+8+lengthdirX(s.radius,s.dir),h.y+8+lengthdirY(s.radius,s.dir));s.d=b.id;b.damage=s.damage;b.target=s.target;b.grazepoints=4;b.direction=s.dir+180;b.speed=20;b.friction=1;b.imageAngle=b.direction;s.side=s.side===1?-1:1;}return true;}
 if(s.type===33){if(s.made===0){s.made=1;const c=required(rt,object,'obj_clubsenemy'),t=rt.create(object('obj_clovertail_intro'),c.x+144,c.y+125);s.tail=t.id;t.damage=s.damage;t.target=s.target;}return true;}return false;
}
