// obj_king_boss as the battle engine runs it (encounter 40): King's lines and attack order (kturn), Talk, Susie's
// and Ralsei's ACTs that unlock Red Buster and Dual Heal, the battle's end after his last line, and his defeat
// (event 10). The attacks themselves (event 5) are in boss.ts.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {darkener,growtangle,heroKris,heroParent,heroRalsei,heroSusie,sndFreeAll} from '../../deltarune/battle';
import {attackPhase,findController,monsterDefeat,randomTarget,subst} from '../../deltarune/controller';
import {monsterSetup} from '../../deltarune/encounter';
import {oflashOf} from '../../deltarune/party';
import {battleTextDefault,enemyBalloon,writer} from '../../deltarune/writer';
import {optionalSourceText as lang} from '../../host/text';
import {kingBoss,nextKingAttack} from './boss';

const L=(n:number)=>lang(`obj_king_boss_slash_Step_0_gml_${n}_0`);
/** obj_animation: plays its sprite once, then removes itself. */
export const animationOnce:GmObjectDef={name:'obj_animation',index:85,events:{animationEnd:(s,rt)=>rt.destroy(s)}};
/** Portrait codes for a writer page: scr_kingface, scr_susface, scr_ralface, scr_noface. */
const kingFace=(rt:GmRuntime,slot:number,e:number|string)=>{rt.globals.msg[slot]=subst(lang(`scr_kingface_slash_scr_kingface_gml_${(rt.globals.plot??0)>=235?3:7}_0`),String(e));};
const susFace=(rt:GmRuntime,slot:number,e:number|string)=>{rt.globals.msg[slot]=subst(lang('scr_susface_slash_scr_susface_gml_1_0'),String(e));};
const ralFace=(rt:GmRuntime,slot:number,e:number|string)=>{rt.globals.msg[slot]=subst(lang('scr_ralface_slash_scr_ralface_gml_1_0'),String(e));};
const noFace=(rt:GmRuntime,slot:number)=>{rt.globals.msg[slot]=lang('scr_noface_slash_scr_noface_gml_1_0');};
/** scr_targetall. */
function targetAll(s:GmInstance,rt:GmRuntime){const g=rt.globals;for(let i=0;i<3;i++)if(g.charcantarget[i]===1)g.targeted[i]=1;s.mytarget=3;s.target=3;}
/** The soul shines on Kris and the helper glows: they cast together. */
function soulShine(rt:GmRuntime,partner:GmObjectDef){
 rt.sound?.('snd_boost');
 const kris=rt.first(heroKris)!;const a=rt.create(animationOnce,kris.x+30,kris.y+50);
 a.depth=-20;a.imageIndex=0;a.imageXscale=2;a.imageYscale=2;a.imageSpeed=1;a.sprite='spr_soulshining';
 const order=partner===heroSusie?[heroKris,heroSusie]:[heroRalsei,heroKris];
 for(const o of order)for(const h of rt.all(o))oflashOf(h,rt);
}

function step(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.susinit===0){for(const h of rt.all(heroSusie)){h.idlesprite='spr_susieb_idle_serious';h.attacksprite='spr_susieb_attack_serious';}s.susinit=1;}
 if(g.monster[me]===1){
  g.flag[51+me]=4;
  if(g.mnfight===1&&s.talked===0){
   if(!rt.exists(darkener))rt.create(darkener,0,0);
   g.typer=50;g.msg[0]=L(25);s.blcontype=3;
   const lines:Record<number,number[]>={0:[27],1:[28],2:[29],3:[30],4:[31],5:[32],6:[36,37],7:[39],8:[40,41],9:[43],10:[44,45],11:[46],12:[47],13:[48]};
   const k=s.kturn>=14?null:lines[s.kturn];
   if(k)k.forEach((n,i)=>{g.msg[i]=L(n);});
   if([1,5,6,8].includes(s.kturn))s.blcontype=8;
   if(s.kturn>=14){g.msg[0]=L(49);s.battlecancel=2;}
   nextKingAttack(s,rt);
   s.target_randomly=1;
   if([2,5,10,11].includes(s.attack))targetAll(s,rt);else randomTarget(s,rt);
   enemyBalloon(rt,s.x-160,s.y,s.blcontype);s.talked=1;s.talktimer=0;
  }
  // scr_blconskip(-1): the attack starts once his words are gone.
  if(s.talked===1&&g.mnfight===1){s.rtimer=0;if(!rt.exists(writer))g.mnfight=2;}
  if(g.mnfight===2&&s.attacked===0){
   s.rtimer+=1;
   if(s.rtimer===12){
    s.talktimer=0;g.turntimer=180;rt.userEvent(s,5);s.turns+=1;s.attacked=1;g.typer=6;g.fc=0;
    s.rr=rt.random.choose(0,1,2,3);g.battlemsg[0]=L([104,105,106,107][s.rr]);
    if(g.monsterhp[me]<=g.monstermaxhp[me]/4)g.battlemsg[0]=L(110);
   }else g.turntimer=120;
  }
  if(g.mnfight===2&&g.turntimer<=1){
   if(s.battlecancel===1)g.mercymod[me]=999;
   if(s.battlecancel===2){const c=findController(rt);if(c)c.noreturn=1;s.con=1;s.battlecancel=3;}
  }
 }
 if(s.con===1)s.con=4;
 if(s.con===4&&!rt.exists(writer)){s.con=5;s.alarm[4]=15;const c=findController(rt);if(c)c.alarm[2]=17;}
 if(s.con===6){const c=findController(rt);if(c)c.noreturn=0;g.flag[247]=1;monsterDefeat(s,rt);rt.userEvent(s,10);rt.destroy(s);s.con=7;}
 if(g.myfight===3){
  if(s.acting===1&&s.actcon===0){s.actcon=1;g.msg[0]=L(169);g.msg[1]=L(170);battleTextDefault(rt);}
  if(s.acting===2&&s.actcon===0){
   if(g.tempflag[5]===0){
    g.msg[0]=L(180);kingFace(rt,1,5);g.msg[2]=L(182);g.msg[3]=L(183);g.msg[4]=L(184);noFace(rt,5);g.msg[6]=L(186);
    g.tempflag[5]=1;g.canact[me][1]=1;g.actactor[me][1]=1;g.actname[me][1]=L(192);g.actdesc[me][1]=L(193);g.actcost[me][1]=62;
   }else{
    rt.sound?.('snd_power');
    for(const h of rt.all(heroParent)){const f=oflashOf(h,rt);f.flashcolor=C.orange;}
    g.msg[0]=L(201);s.tempattack=0.8;
   }
   battleTextDefault(rt);s.actcon=1;
  }
  if(s.acting===3&&s.actcon===0){
   if(g.tempflag[6]===0){
    g.msg[0]=L(214);susFace(rt,1,1);g.msg[2]=L(216);g.msg[3]=L(217);g.msg[4]=L(218);kingFace(rt,5,0);g.msg[6]=L(220);g.msg[7]=L(221);
    susFace(rt,8,'C');g.msg[9]=L(223);g.msg[10]=L(224);noFace(rt,11);g.msg[12]=L(226);
    g.tempflag[6]=1;g.canact[me][2]=1;g.actactor[me][2]=2;g.actname[me][2]=L(232);g.actdesc[me][2]=L(233);g.actcost[me][2]=150;s.actcon=1;
   }else{g.msg[0]=L(241);s.actcon=10;}
   battleTextDefault(rt);s.acttimer=0;
  }
  if(s.acting===4&&s.actcon===0){
   if(g.tempflag[7]===0){
    g.msg[0]=L(254);ralFace(rt,1,'B');g.msg[2]=L(256);g.msg[3]=L(257);g.msg[4]=L(258);kingFace(rt,5,6);g.msg[6]=L(260);g.msg[7]=L(261);g.msg[8]=L(262);
    ralFace(rt,9,8);g.msg[10]=L(264);noFace(rt,11);g.msg[12]=L(266);battleTextDefault(rt);
    g.tempflag[7]=1;g.canact[me][3]=1;g.actactor[me][3]=3;g.actname[me][3]=L(273);g.actdesc[me][3]=L(274);g.actcost[me][3]=125;s.actcon=1;
   }else{g.msg[0]=L(282);battleTextDefault(rt);s.actcon=20;}
   s.acttimer=0;
  }
  // Red Buster (Susie, spell 5) and Dual Heal (Ralsei, spell 6) join the turn as spells.
  for(const [wait,go,run,slot,spell,partner] of [[10,11,12,1,5,heroSusie],[20,21,22,2,6,heroRalsei]] as const){
   if(s.actcon===wait){s.acttimer+=1;if(s.acttimer>=10||!rt.exists(writer)){s.acttimer=0;s.actcon=go;}}
   if(s.actcon===go){g.faceaction[slot]=2;g.charaction[slot]=2;g.charspecial[slot]=spell;g.chartarget[slot]=0;g.acting[slot]=0;soulShine(rt,partner);s.actcon=run;}
   if(s.actcon===run){s.acttimer+=1;if(s.acttimer>=20){s.actcon=1;for(const h of rt.all(partner))h.state=0;}}
  }
  if(s.actcon===1&&!rt.exists(writer)){s.actcon=0;attackPhase(rt);}
 }
 if(g.myfight===7)s.hspeed=15;
 // The view shakes with obj_shake; once it is gone the camera returns.
 if(!rt.instances.some(i=>i.live&&i.object.name==='obj_shake')){rt.view.x=s.remxx;rt.view.y=s.remyy;}
}
function draw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.state===3){
  s.hurttimer-=1;
  if(s.hurttimer<0)s.state=0;
  else{
   if(g.monster[s.myself]===0)rt.userEvent(s,10);
   s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
   rt.drawSprite(s.hurtsprite,0,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);
  }
 }
 if(s.state===0){
  s.siner+=1;s.thissprite=s.idlesprite;
  rt.drawSprite(s.thissprite,s.siner/6,s.x,s.y,2,2,0,s.imageBlend,1);
  if(s.flash===1){s.fsiner+=1;rt.drawSpriteFog(s.thissprite,s.siner/6,s.x,s.y,2,2,0,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);}
 }
 if(s.becomeflash===0)s.flash=0;
 s.becomeflash=0;
}
/** Event 10: the battle ends without a victory line; the throne room scene takes over in the game. */
function defeated(s:GmInstance,rt:GmRuntime){
 sndFreeAll(rt);
 const c=findController(rt);if(c)c.skipvictory=1;
 rt.globals.invc=1;rt.destroy(s);
}
/** The engine's King. */
export const kingEnemy:GmObjectDef={...kingBoss,parent:kingBoss,events:{
 ...kingBoss.events,step,draw,user10:defeated,
 user12:(s,rt)=>{rt.globals.monsterx[s.myself]=s.x+rt.spriteWidth(s)/2-10;rt.globals.monstery[s.myself]=s.y+rt.spriteHeight(s)/2;monsterSetup(s,rt);},
}};
void growtangle;
