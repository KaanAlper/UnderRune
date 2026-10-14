// obj_joker as the battle engine runs it (encounter 25): Jevil's turns (jturn) and dance levels, his lines, the
// attack each turn picks (event 5), Pirouette's nine chaos effects and Hypnosis, TIRED at the end, and his defeat
// (event 10), which the game treats as a spare. His body is obj_joker_body (body.ts); the attacks are
// obj_dbulletcontroller's Jevil types (controller.ts).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {afterimageGrow,darkener,darkMarker,growtangle,heroKris,marker,monsterParent,moveHeart,spareAnim,sndFreeAll} from '../../deltarune/battle';
import {attackPhase,button1_p,findController,monsterDefeat,randomTarget} from '../../deltarune/controller';
import {actsDoneAttackPhase,defineEnemy} from '../../deltarune/enemy';
import {healAllItem,healItem} from '../../deltarune/party';
import {battleTextDefault,enemyBalloon,writer} from '../../deltarune/writer';
import {optionalSourceText} from '../../host/text';
import {jokerBody} from './body';
import {bulletController} from './controller';

const L=(n:number|string)=>optionalSourceText(`obj_joker_slash_Step_0_gml_${n}${typeof n==='number'?'_0':''}`);
const body=(s:GmInstance,rt:GmRuntime)=>rt.byId(s.body);
/** The room's spinning background; Jevil speeds it up as he loses HP and stops it when he is beaten. */
export const jokerBackground:GmObjectDef={name:'obj_jokerbg_triangle_real',index:137,depth:600000,events:{
 create:s=>{s.on=1;s.rotspeed=1;},
 draw:()=>{},
}};
/** Hypnosis: rings that circle Jevil and fade. */
export const hypnoFx:GmObjectDef={name:'obj_hypnofx',index:305,events:{
 create:s=>{s.type=0;s.size=0;s.ringmax=4;s.timer=0;},
 draw:(s,rt)=>{
  s.timer+=1;
  if(s.timer===1){
   s.initsiner=rt.random.random(400);s.ringsize=[];s.ringradius=[];s.ringspeed=[];s.ringalpha=[];s.ringsiner=[];
   for(let i=0;i<s.ringmax;i++){s.ringsize[i]=1+0.5*i;s.ringradius[i]=2+i*12;s.ringspeed[i]=0.3;s.ringalpha[i]=0;s.ringsiner[i]=s.initsiner;}
  }
  if(s.timer>=2){
   for(let i=0;i<s.ringmax;i++){
    s.ringsiner[i]+=(i+2)*s.ringalpha[i];
    if(s.timer<12&&s.ringalpha[i]<1)s.ringalpha[i]+=0.2;
    if(s.timer>=24)s.ringalpha[i]-=0.1;
    rt.drawSprite('spr_hypnoring',0,s.x+Math.sin(s.ringsiner[i]/12)*s.ringradius[i],s.y+Math.cos(s.ringsiner[i]/12)*s.ringradius[i],s.ringsize[i],s.ringsize[i],0,C.white,s.ringalpha[i]);
   }
   if(s.timer>=38)rt.destroy(s);
  }
 },
}};

function create(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurtamt:0,hurttimer:0,hurtshake:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:-9999,maxmercy:9999,warned:0,compliment:0,tired:0,pirouette:0,pirouettecounter:0,pfactor:1,hypnosis:0,hypnosiscounter:0,chaosdance:0,
  reminvc:g.invc,remmaxhp:[...g.maxhp],attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,mytarget:3,imageSpeed:0,imageXscale:2,imageYscale:2,
  idlesprite:'spr_joker_main',hurtsprite:'spr_joker_main',sparedsprite:'spr_joker_main',laughnoise:0,beepnoise:0,beepbuffer:0,burstnoise:0,jturn:0,jattack:0});
 s.body=rt.create(jokerBody,s.x,s.y).id;g.tempflag[4]=1;
}
const dance=(s:GmInstance,rt:GmRuntime,lv:number)=>{const b=body(s,rt);if(b)b.dancelv=lv;};
const condition=(s:GmInstance,rt:GmRuntime,c:number)=>{const b=body(s,rt);if(b)b.condition=c;};
/** scr_targetall. */
function targetAll(s:GmInstance,rt:GmRuntime){const g=rt.globals;for(let i=0;i<3;i++)if(g.charcantarget[i]===1)g.targeted[i]=1;s.mytarget=3;s.target=3;}

/** His line for this turn (by jturn, which also follows his HP and the hypnosis count), the attack it leads to, and
 * its targets. */
function startTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.pirouette!==2)g.invc=s.reminvc;
 const ratio=g.monsterhp[me]/g.monstermaxhp[me],h=s.hypnosiscounter;s.mhpratio=ratio;
 if(ratio<=0.8&&s.jturn===4){s.jturn=5;dance(s,rt,1);}
 if(ratio<=0.6&&s.jturn===9)s.jturn=10;
 if(ratio<=0.4&&s.jturn===14){s.jturn=15;dance(s,rt,3);}
 if(ratio<=0.15&&s.jturn<17){s.jturn=17;dance(s,rt,2);}
 if(s.jturn>=18)dance(s,rt,3);
 if(h>=2&&s.jturn===4&&s.turns>=5-h){s.jturn=5;dance(s,rt,1);}
 if(h>=4&&s.jturn===9&&s.turns>=11-h){s.jturn=10;dance(s,rt,1);}
 if(h>=6&&s.jturn===14&&s.turns>=17-h){s.jturn=15;dance(s,rt,1);}
 if(s.jturn>=19&&s.turns>=29-h){s.tired=1;g.monsterstatus[me]=1;dance(s,rt,2);}
 if(!rt.exists(darkener))rt.create(darkener,0,0);
 g.typer=50;
 const lines:Record<number,number>={0:35,1:36,2:37,3:38,5:39,6:40,7:41,8:42,10:43,11:44,12:45,13:46,15:47,16:48,17:49,18:50};
 if(lines[s.jturn]!==undefined)g.msg[0]=L(lines[s.jturn]);
 if(s.jturn===0||s.jturn===7)rt.sound?.(s.jturn===0?'snd_joker_chaos':'snd_joker_anything');
 if(s.jturn===3||s.jturn===13||s.jturn===18)condition(s,rt,5);
 if(s.jturn===17)dance(s,rt,2);
 if([4,9,14,19].includes(s.jturn)){
  s.rr=rt.random.choose(0,1,2,3);
  if(s.rr===0){g.msg[0]=rt.random.choose(L('56_0'),L('56_1'));rt.sound?.('snd_joker_chaos');}
  if(s.rr===1){g.msg[0]=L(57);rt.sound?.('snd_joker_anything');}
  if(s.rr===2)g.msg[0]=rt.random.choose(L('58_0'),L('58_1'));
  if(s.rr===3)g.msg[0]=L(59);
 }
 enemyBalloon(rt,s.x-160,s.y-20,3);s.talked=1;s.talktimer=0;
 if(s.jturn>=19){if(g.monsterdf[me]>-10)g.monsterdf[me]-=3;if(g.monsterat[me]<11)g.monsterat[me]+=0.5;s.jattack=rt.random.choose(0,4,7,8,10,11,12,13,13,13);}
 if(s.jturn>=15&&s.jturn<=18){s.jattack=s.jturn-3;s.jturn+=1;}
 if(s.jturn===14)s.jattack=rt.random.choose(8,9,10,11);
 if(s.jturn>=10&&s.jturn<=13){s.jattack=s.jturn-2;s.jturn+=1;}
 if(s.jturn===9)s.jattack=rt.random.choose(4,5,6,7);
 if(s.jturn>=5&&s.jturn<=8){s.jattack=s.jturn-1;s.jturn+=1;}
 if(s.jturn===4)s.jattack=rt.random.choose(0,1,2,3);
 if(s.jturn<=3){s.jattack=s.jturn;s.jturn+=1;}
 if([2,5,9,13,15].includes(s.jattack))targetAll(s,rt);else randomTarget(s,rt);
 
}
function statusLine(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 s.rr=rt.random.choose(0,1,2,3,4);g.battlemsg[0]=L([158,159,160,161,162][s.rr]);
 if(body(s,rt)?.dancelv===2)g.battlemsg[0]=L(163);
 if(s.jturn===16)g.battlemsg[0]=L(164);
 if(s.jturn===18)g.battlemsg[0]=L(165);
 if(s.jturn>=19)g.battlemsg[0]=L(166);
 if(g.monsterstatus[me]===1)g.battlemsg[0]=L(167);
}
function afterAttack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(g.mnfight===2&&g.turntimer<=1){
  if(s.battlecancel===1)g.mercymod[s.myself]=999;
  if(s.battlecancel===2){const c=findController(rt);if(c)c.noreturn=1;s.con=1;s.battlecancel=3;}
 }
}
/** Tired out: his last line, and he leaves. */
function leave(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.con===1){s.con=2;s.alarm[4]=10;}
 if(s.con===3){g.typer=50;g.mercymod[me]=999;g.msg[0]=L(201);enemyBalloon(rt,s.x-160,s.y,3);s.con=4;}
 if(s.con===4&&!rt.exists(writer)){s.hspeed=15;s.con=5;s.alarm[4]=15;const c=findController(rt);if(c)c.alarm[2]=17;}
 if(s.con===6){const c=findController(rt);if(c)c.noreturn=0;monsterDefeat(s,rt);rt.destroy(s);s.con=7;}
}
/** Check, Pirouette (one of nine outcomes in turn) and Hypnosis. */
function acts(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.acting===1&&s.actcon===0){s.actcon=1;g.msg[0]=L(237);battleTextDefault(rt,s);}
 if(s.acting===2&&s.actcon===0){
  s.actcon=5;g.msg[0]=L(247);rt.sound?.('snd_pirouette');
  const kris=rt.first(heroKris)!;for(const k of rt.all(heroKris))k.visible=false;
  const dk=darkMarker(rt,kris.x,kris.y,'spr_krisb_pirouette');s.dancekris=dk.id;dk.imageSpeed=0.3334;dk.depth=kris.depth;
  const fx=rt.create(afterimageGrow,dk.x+28,dk.y+40);fx.sprite='spr_pirouette_fx';fx.imageXscale=2;fx.imageYscale=2;
  battleTextDefault(rt,s);
 }
 if(s.actcon===5&&!rt.exists(writer))pirouette(s,rt);
 if(s.acting===3&&s.actcon===0){
  if(g.monsterat[me]>10)g.monsterat[me]-=0.5;
  rt.create(hypnoFx,g.monsterx[me],g.monstery[me]);rt.sound?.('snd_hypnosis');s.actcon=1;
  s.aaa=rt.random.choose(0,1,2);const part1=L([400,401,402][s.aaa]),part2=L(403);let part3=L(404);
  if(s.hypnosiscounter===0)part3=L(405);
  if(s.hypnosiscounter>=9){part3=L(406);g.monsterstatus[me]=1;}
  g.msg[0]=part1+part2+part3+L(407);
  s.pfactor=0.7;s.hypnosis=1;s.hypnosiscounter+=1;battleTextDefault(rt,s);
 }
}
/** He runs off when beaten; the bomb attacks' sounds are played here, at most every five frames. */
function afterStep(s:GmInstance,rt:GmRuntime){
 if(rt.globals.myfight===7)s.hspeed=15;
 s.beepbuffer-=1;
 if(s.beepnoise===4&&s.beepbuffer<0){rt.sound?.('snd_bombfall',1,true);s.beepnoise=0;s.beepbuffer=5;}
 if(s.burstnoise===1){rt.sound?.('snd_bomb',1,true);s.burstnoise=0;}
}
/** Pirouette's outcome, one of nine in turn (chaosdance advances with each of Jevil's attacks). */
function pirouette(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 const dk=rt.byId(s.dancekris);if(dk)rt.destroy(dk);
 for(const k of rt.all(heroKris))k.visible=true;
 g.msg[0]=L(272);
 const c=s.chaosdance;
 if(c===0){g.msg[0]=L(276);s.ch=rt.random.choose(0,1,2);rt.sound?.(['snd_badexplosion','snd_carhonk','snd_toilet'][s.ch]);}
 if(c===1){g.msg[0]=L(284);if(g.monsterdf[me]>=-16)g.monsterdf[me]-=4;rt.sound?.('snd_weirdeffect');}
 if(c===2){g.msg[0]=L(290);rt.sound?.('snd_awkward');g.invc=0.4;}
 if(c===3){g.msg[0]=L(296);s.pfactor=0.7;rt.sound?.('snd_shadowpendant');}
 if(c===4){
  for(const m of rt.all(marker))if(m.sprite==='spr_uselessbird')rt.destroy(m);
  const bird=darkMarker(rt,rt.view.x-40,rt.view.y+60,'spr_uselessbird');bird.hspeed=12;bird.imageSpeed=0.334;
  rt.sound?.('snd_birdtweet');g.msg[0]=L(310);
 }
 if(c===5){g.msg[0]=L(314);s.star=rt.random.choose(0,1,2);s.caster=0;healItem(s,rt,Math.floor(rt.random.random(31)+25));}
 if(c===6){
  g.msg[0]=L(320);s.swap1=rt.random.choose(2,3);s.swap2=s.swap1===2?3:2;
  const hp=[...g.hp],max=[...g.maxhp],a=s.swap1,b=s.swap2;
  g.maxhp[1]=max[a];g.maxhp[a]=max[b];g.maxhp[b]=max[1];g.hp[1]=hp[a];g.hp[a]=hp[b];g.hp[b]=hp[1];
  const ctl=findController(rt);
  if(ctl){const col=[...ctl.hpcolor];ctl.hpcolor[0]=col[a-1];ctl.hpcolor[a-1]=col[b-1];ctl.hpcolor[b-1]=col[0];}
  for(let i=1;i<=3;i++)if(g.hp[i]<1){const share=Math.floor(g.hp[i]/3);g.hp[1]+=share;g.hp[2]+=share;g.hp[3]+=share;g.hp[i]=1;}
  for(let i=1;i<=3;i++)if(g.hp[i]<1)g.hp[i]=1;
  for(let i=0;i<3;i++){g.charmove[i]=1;g.charcantarget[i]=1;g.chardead[i]=0;}
  rt.sound?.('snd_weirdeffect');
 }
 if(c===7){rt.sound?.('snd_boost');g.msg[0]=L(373);s.pfactor=1.25;}
 if(c===8){rt.sound?.('snd_applause');g.msg[0]=L(379);healAllItem(s,rt,36+Math.floor(rt.random.random(15)));}
 battleTextDefault(rt,s);
 s.hypnosiscounter+=0.5;
 if(s.hypnosiscounter>=9){s.txtpart3=L(387);g.monsterstatus[me]=1;}
 s.pirouette=c;s.pirouettecounter+=1;s.actcon=1;
}
/** Event 5: this turn's attack (jattack) as an obj_dbulletcontroller type. */
function attack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;if(s.attacked!==0)return;
 s.turns+=1;s.chaosdance+=1;if(s.chaosdance>=9)s.chaosdance=0;
 s.remat=g.monsterat[me];g.monsterat[me]*=s.pfactor;
 const at=g.monsterat[me],b=body(s,rt);
 // type, damage multiplier, graze points (undefined keeps the controller's), target-all, turn timer, inv, body condition
 const A:Record<number,[number,number,number|undefined,boolean,number|undefined,number|undefined,'scythe'|number|undefined,string?]>={
  0:[70,5,2,false,undefined,undefined,2],1:[65,5,3,false,undefined,undefined,undefined],2:[49,4,3,true,undefined,undefined,2],
  3:[75,6,3,false,undefined,undefined,'scythe'],4:[62,5,2,false,undefined,20,undefined,'snd_joker_anything'],5:[50,4,3,true,300,undefined,2],
  6:[73,5,undefined,false,undefined,undefined,undefined],7:[68,5,2,false,undefined,undefined,undefined],8:[61,5,3,false,240,20,undefined,'snd_joker_anything'],
  9:[48,4,4,true,270,undefined,2],10:[72,5,undefined,false,undefined,undefined,undefined],11:[76,6,3,false,undefined,undefined,'scythe'],
  12:[71,5,2,false,undefined,undefined,2],13:[46,4,4,true,330,undefined,2],14:[74,4,undefined,false,undefined,undefined,undefined],
  15:[77,4,undefined,false,1500,undefined,'scythe'],99:[47,4,undefined,true,300,undefined,2],999:[25,4,undefined,false,300,undefined,undefined],
 };
 const p=A[s.jattack];
 if(p){
  const [type,mult,graze,all,timer,inv,cond,sound]=p;
  if(cond==='scythe'&&b&&b.condition<4)b.condition=5;
  if(sound)rt.sound?.(sound);
  const dc=rt.create(bulletController,s.x,s.y);s.dc=dc.id;
  dc.type=type;dc.target=all?3:s.mytarget;if(inv!==undefined)dc.inv=inv;dc.damage=at*mult;if(graze!==undefined)dc.grazepoints=graze;
  if(timer!==undefined)g.turntimer=timer;
  if(typeof cond==='number'&&b)b.condition=cond;
 }
 for(const dc of rt.all(bulletController))dc.joker=1;
 s.pfactor=1;g.monsterat[me]=s.remat;s.attacked=1;
}
function draw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number,b=body(s,rt);
 if(s.state===3){
  if(s.hurttimer>0){
   s.hurttimer=0;
   if(b){
    b.condition=1;b.siner=0;b.maxdist+=20+s.hurtamt/5;if(b.maxdist<30)b.maxdist=30;
    const ratio=g.monsterhp[me]/g.monstermaxhp[me];s.mhpratio=ratio;b.floatsinerspeed=1+(1-ratio);
    if(ratio<=0.8&&b.dancelv===0)b.dancelv=1;
    if(ratio<=0.4&&s.jturn<17)b.dancelv=3;
    if(ratio<=0.2&&s.jturn===17)b.dancelv=2;
    if(ratio<=0){rt.userEvent(s,10);g.flag[241]=6;}
    const bg=rt.first(jokerBackground);if(bg&&ratio>0)bg.rotspeed=1+(1.5-ratio*1.5);
   }
   s.laughnoise=rt.random.choose(0,1,2);rt.sound?.(['snd_joker_laugh0','snd_joker_ha1','snd_joker_ha0'][s.laughnoise]);
  }
  s.hurttimer-=1;if(s.hurttimer<0)s.state=0;
 }
 if(s.state===0){
  s.siner+=1;s.thissprite=s.idlesprite;
  if(s.flash===1&&b){
   s.fsiner+=1;b.fsiner=s.fsiner;const a=-Math.cos(s.fsiner/5)*0.4+0.6,x=b.offx+b.flyx,y=b.offy+b.fly;
   if(b.dancelv===0)rt.drawSpriteFog('spr_joker_main',0,x,y,2,2,0,C.white,a);
   if(b.dancelv===1)rt.drawSpriteFog('spr_joker_dance',b.floatsiner/3,x,y,2,2,0,C.white,a);
   if(b.dancelv===2)rt.drawSpriteFog('spr_joker_tired',0,x,y,2,2,0,C.white,a);
  }
 }
 if(s.becomeflash===0)s.flash=0;
 s.becomeflash=0;
}
/** Event 10: beaten (or spared): HP and defense changes undone, the body turns to a card, the battle ends quietly. */
function defeated(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number,b=body(s,rt);
 for(let i=0;i<4;i++){g.maxhp[i]=s.remmaxhp[i];if(g.hp[i]>=g.maxhp[i])g.hp[i]=g.maxhp[i];}
 g.invc=s.reminvc;
 for(const jb of rt.all(jokerBody)){jb.imageXscale=2;jb.imageYscale=2;jb.sprite='spr_joker_teleport';jb.sparedsprite=jb.sprite;jb.imageIndex=1;jb.imageSpeed=0;}
 if(g.monsterhp[me]>0)for(const jb of rt.all(jokerBody)){
  jb.x+=20;jb.y+=18;
  const a=rt.create(spareAnim,jb.x,jb.y);a.sprite=jb.sparedsprite;a.imageIndex=0;a.imageXscale=jb.imageXscale;a.imageYscale=jb.imageYscale;
  jb.x-=20;jb.y-=18;
 }
 const c=findController(rt);if(c)c.skipvictory=1;
 sndFreeAll(rt);
 if(b){b.dancelv=4;b.condition=0;}
 for(const bg of rt.all(jokerBackground))bg.on=0;
 monsterDefeat(s,rt);g.invc=s.reminvc;rt.destroy(s);
}
/** The engine's Jevil. */
/** Jevil: the standard enemy (deltarune/enemy.ts) with these steps of his own. He counts his turns in his attack
 * event (5). */
export const jokerEnemy:GmObjectDef=defineEnemy({name:'obj_joker',index:292,depth:10,sprite:'spr_joker_main'},{
 create,
 beforeTalk:(s,rt)=>{rt.globals.flag[51+s.myself]=4;},
 startTalk,
 attack:(s,rt)=>{rt.globals.turntimer=240;rt.userEvent(s,5);},countTurn:false,
 attackWait:(_s,rt)=>{rt.globals.turntimer=120;},
 statusLine,afterAttack,afterEnemyTurn:leave,
 acts,actsDone:actsDoneAttackPhase,afterStep,
 monsterPosition:(s)=>[s.x+20,s.y+20],
 events:{draw,user5:attack,user10:defeated,user11:()=>{}},
});
