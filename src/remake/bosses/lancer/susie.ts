// Encounter 31, Susie and Lancer against Kris and Ralsei: obj_susieenemy (her lines, the attacks she leads: the
// bike team-up, falling spades and thrown axes; Ralsei's lullaby puts her to sleep; Pacify is blocked by Lancer),
// obj_lancerboss3 (his lines, the bike when Susie is out of the fight, "Anything" talks that end the battle) and
// obj_lancerbike_neo (Lancer with Susie riding along, throwing axes).
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {damage,darkener,darkMarker,growtangle,heroKris,heroRalsei,inheritBullet,monsterParent,moveHeart,moveHeartIn,regularBullet,regularBulletPermanent,afterimageGrow,heart} from '../../deltarune/battle';
import {attackPhase,button1_p,findController,monsterDefeat,monsterPop,randomTarget,subst} from '../../deltarune/controller';
import {actsDoneAttackPhase,defineEnemy,endTalkAfter} from '../../deltarune/enemy';
import {oflashOf,spellPhase} from '../../deltarune/party';
import {battleText,battleTextDefault,destroyWriters,enemyBalloon,writer} from '../../deltarune/writer';
import {optionalSourceText as lang} from '../../host/text';
import {bulletController} from '../jevil/controller';
import {lancerBike} from './bike';
import {axeBullet} from './axe';

const LS=(n:number)=>lang(`obj_susieenemy_slash_Step_0_gml_${n}_0`),LT=(n:number)=>lang(`obj_susieenemy_slash_Other_11_gml_${n}_0`),LL=(n:number)=>lang(`obj_lancerboss3_slash_Step_0_gml_${n}_0`);
const face=(rt:GmRuntime,key:string,slot:number,e:number|string)=>{rt.globals.msg[slot]=subst(lang(key),String(e));};
const susFace=(rt:GmRuntime,slot:number,e:number|string)=>face(rt,'scr_susface_slash_scr_susface_gml_1_0',slot,e);
const ralFace=(rt:GmRuntime,slot:number,e:number|string)=>face(rt,'scr_ralface_slash_scr_ralface_gml_1_0',slot,e);
const lanFace=(rt:GmRuntime,slot:number,e:number|string)=>face(rt,'scr_lanface_slash_scr_lanface_gml_1_0',slot,e);
const noFace=(rt:GmRuntime,slot:number)=>{rt.globals.msg[slot]=lang('scr_noface_slash_scr_noface_gml_1_0');};
/** The battle music (global.batmusic[1]) pauses for Ralsei's song. */
const music=(rt:GmRuntime,play:boolean)=>{const m=rt.globals.batmusic?.[1];if(m!==undefined){if(play)rt.sourceAudio?.resume(m);else rt.sourceAudio?.pause(m);}};

// ---- Susie ----
function susieCreate(s:GmInstance,rt:GmRuntime){
 rt.globals.turntimer=0;
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,tired:0,attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,
  mytarget:3,imageSpeed:0,imageXscale:2,imageYscale:2,idlesprite:'spr_susie_enemy',hurtsprite:'spr_susie_enemy_hurt',sparedsprite:'spr_susie_enemy',attacktype:0,sleeping:0,
  sleepcounter:99,lullabied:0,lancer_act:0,susie_act:0,lancer_hurt:0,pacifycon:0,defeated:0,lancerhurt:0,anythingcounter:0,anythingxcounter:0,tirespare:0,ears_blocked:0,
  susie_anythingcounter:0,shakex:0});
}
/** Event 1: her line before the enemy turn, and whether she wakes up. */
function susieTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(g.mnfight!==1||s.talked!==0)return;
 s.awoke=0;s.sleepcounter+=1;
 if(s.sleepcounter>=3&&s.sleeping===1){s.sleeping=0;s.idlesprite='spr_susie_enemy';g.monstercomment[me]=LT(9);g.monsterstatus[me]=0;s.sleepcounter=99;s.awoke=1;}
 if(s.sleeping===0)randomTarget(s,rt);
 if(!rt.exists(darkener))rt.create(darkener,0,0);
 g.typer=53;s.rr=rt.random.choose(0,1,2,3);g.msg[0]=LT([19,20,21,22][s.rr]);
 if(s.lancer_hurt===0&&g.monsterhp[1]<=g.monstermaxhp[1]*0.5){s.lancer_hurt=1;g.msg[0]=LT(g.monsterhp[me]===g.monstermaxhp[me]?28:31);}
 if(s.acting===2){const c=s.anythingcounter;if(c>=1)g.msg[0]=LT([35,36,37,38,39][Math.min(c,5)-1]);}
 if(s.lancer_act===3){const c=s.anythingxcounter;if(c>=1)g.msg[0]=LT([43,44,45,46][Math.min(c,4)-1]);}
 if(s.sleeping===1)g.msg[0]=LT(48);
 if(s.awoke===1)g.msg[0]=LT(49);
 s.awoke=0;s.lancer_act=0;
 enemyBalloon(rt,s.x-160,s.y,3);s.talked=1;s.talktimer=0;
}
/** Her three attacks in turn: thrown axes, falling spades, and the bike team-up with Lancer (not while asleep). */
function susieAttack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.turntimer=180;
 if(s.attacktype===2){
  const dc=rt.create(bulletController,s.x+rt.spriteWidth(s)/2,s.y+rt.spriteHeight(s)/2);s.dc=dc.id;
  dc.type=85;dc.target=s.mytarget;dc.damage=g.monsterat[me]*5;dc.timepoints=3;dc.grazepoints=5;if(s.sleeping===1)rt.destroy(dc);
 }
 if(s.attacktype===1){
  const dc=rt.create(bulletController,s.x,s.y);s.dc=dc.id;
  dc.type=20;dc.target=s.mytarget;dc.damage=g.monsterat[me]*5;dc.timepoints=3;dc.grazepoints=3;if(s.sleeping===1)rt.destroy(dc);
 }
 if(s.attacktype===0&&s.sleeping===0){
  const lan=rt.first(lancerEnemy3);
  const bike=rt.create(lancerBikeNeo,lan?.x??0,lan?.y??0);s.bike=bike.id;
  for(const l of rt.all(lancerEnemy3))l.visible=false;
  bike.target=s.mytarget;bike.damage=g.monsterat[me]*5;g.turntimer=999;
 }
 s.attacktype+=1;if(s.attacktype>=3)s.attacktype=0;
}
/** After her last line the battle ends with the enemy turn. */
function susieCancel(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(g.mnfight===2&&g.turntimer<=1){
  if(s.battlecancel===1)g.mercymod[s.myself]=999;
  if(s.battlecancel===2){const c=findController(rt);if(c)c.noreturn=1;s.con=1;s.battlecancel=3;}
 }
}
function susieLeaves(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.con===1){s.con=2;s.alarm[4]=10;}
 if(s.con===3){g.typer=50;g.mercymod[me]=999;g.msg[0]=LS(118);enemyBalloon(rt,s.x-160,s.y,3);s.con=4;}
 if(s.con===4&&!rt.exists(writer)){s.hspeed=15;s.con=5;s.alarm[4]=15;const c=findController(rt);if(c)c.alarm[2]=17;}
 if(s.con===6){const c=findController(rt);if(c)c.noreturn=0;monsterDefeat(s,rt);rt.destroy(s);s.con=7;}
}
function susieActs(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.acting===1&&s.actcon===0){
  s.actcon=1;
  const df=g.itemdf[2][0]+g.itemdf[2][1]+g.itemdf[2][2],at=g.itemat[2][0]+g.itemat[2][1]+g.itemat[2][2];
  g.msg[0]=subst(LS(df>0?162:159),String(g.at[2]+at),String(g.df[2]+df),String(g.maxhp[2]));
  battleTextDefault(rt);
 }
 if(s.acting===2&&s.actcon===0){
  const c=s.anythingcounter;g.msg[0]=LS(c===0?170:[171,172,173,174][Math.min(c,4)-1]);g.msg[1]=LS(c>=1?176:175);
  battleTextDefault(rt);s.anythingcounter+=1;s.actcon=1;
 }
 if(s.acting===3&&s.actcon===0){
  for(const m of rt.all(monsterParent))m.susie_act=3;
  music(rt,false);
  const song=s.lullabied===0?'snd_ralseising1':'snd_ralseising2';rt.sound?.(song);s.singy=song;
  for(const o of rt.all(susieEnemy))o.lullabied=s.lullabied===0?1:0;
  g.msg[0]=LS(197);
  for(const h of rt.all(heroRalsei))h.visible=false;
  const r=rt.first(heroRalsei);const sing=darkMarker(rt,r?.x??0,r?.y??0,'spr_ralseib_sing');sing.imageSpeed=0.2;s.ralsing=sing.id;
  s.lullatimer=0;battleTextDefault(rt);s.actcon=10;
 }
 if(s.actcon===10){s.lullatimer+=1;if(s.lullatimer>=30)s.actcon=11;}
 if(s.actcon===11&&!rt.exists(writer)){
  const sing=rt.byId(s.ralsing);if(sing)rt.destroy(sing);
  for(const h of rt.all(heroRalsei))h.visible=true;
  rt.soundStop?.(s.singy);music(rt,true);
  g.msg[0]=LS(s.sleeping===1?224:223);
  s.idlesprite='spr_susie_enemy_defeat';s.sleepcounter=0;s.sleeping=1;g.monstercomment[me]=LS(228);g.monsterstatus[me]=1;
  battleTextDefault(rt);s.actcon=1;
 }
}
/** Pacify on a sleeping Susie: Lancer rides in to protect her (castSpell sets pacifycon for this enemy type). */
function susiePacified(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.pacifycon>0){g.spelldelay=999;for(const p of rt.all(spellPhase))if(p.spelltimer>30)p.spelltimer=30;}
 if(s.pacifycon===1){
  const p=rt.first(spellPhase);
  if(p&&p.spelltimer>=15){
   s.pacifytimer=0;s.pacifycon=2;for(const l of rt.all(lancerEnemy3))l.visible=false;
   const t=darkMarker(rt,s.x-40,s.y+rt.spriteHeight(s),'spr_lancerbike');t.depth=s.depth-2;s.temp_l=t.id;
  }
 }
 if(s.pacifycon===2){rt.sound?.('snd_lancerwhistle');const t=rt.byId(s.temp_l);if(t){const o=oflashOf(t,rt);o.flashcolor=0xff0000;}s.pacifycon=3;}
 if(s.pacifycon===3){
  s.pacifytimer+=1;
  if(s.pacifytimer>=30&&!rt.exists(writer)){
   const t=rt.byId(s.temp_l);if(t)rt.destroy(t);
   for(const l of rt.all(lancerEnemy3))l.visible=true;
   s.pacifycon=4;for(const m of rt.all(monsterParent))m.susie_act=9;
   g.msg[0]=LS(283);lanFace(rt,1,3);g.msg[2]=LS(285);noFace(rt,3);g.msg[4]=LS(287);
   if(s.tirespare===1){g.msg[0]=LS(290);g.msg[1]=LS(291);g.msg[2]=LS(292);g.msg[3]=LS(293);g.msg[4]=LS(294);}
   if(s.tirespare>=2){g.msg[0]=LS(298);g.msg[1]=LS(299);}
   battleTextDefault(rt);s.pacifycon=5;s.tirespare+=1;
  }
 }
 if(s.pacifycon===5&&!rt.exists(writer)){g.spelldelay=20;for(const p of rt.all(spellPhase))p.spelltimer=18;s.pacifycon=0;}
}
function susieDraw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.state===3){
  s.sleepcounter=99;s.sleeping=0;g.monstercomment[me]=lang('obj_susieenemy_slash_Draw_0_gml_5_0');g.monsterstatus[me]=0;s.idlesprite='spr_susie_enemy';
  s.hurttimer-=1;
  if(s.hurttimer<0)s.state=0;
  else{
   if(g.monster[me]===0){rt.sound?.('snd_sussurprise');s.visible=false;rt.destroy(s);}
   s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
   // The game still draws her this frame, after instance_destroy.
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
/** Susie on Lancer's side: the standard enemy (deltarune/enemy.ts) with these steps of her own. */
export const susieEnemy:GmObjectDef=defineEnemy({name:'obj_susieenemy',index:289,depth:95,sprite:'spr_susie_enemy'},{
 create:susieCreate,
 isAlive:(s,rt)=>rt.globals.monster[s.myself]===1&&s.defeated===0,
 // She talks in her event 1, which also decides whether she wakes up.
 beforeTalk:(s,rt)=>{rt.globals.flag[51+s.myself]=4;rt.userEvent(s,1);},
 startTalk:()=>{},
 attack:susieAttack,
 attackWait:(_s,rt)=>{rt.globals.turntimer=120;},
 statusLine:(s,rt)=>{s.rr=rt.random.choose(0,1,2,3,4);rt.globals.battlemsg[0]=LS([79,80,81,82,83][s.rr]);},
 afterAttack:susieCancel,afterEnemyTurn:susieLeaves,
 acts:susieActs,
 actsDone:actsDoneAttackPhase,
 afterStep:susiePacified,
 monsterPosition:(s,rt)=>[s.x+20,s.y+rt.spriteHeight(s)/2],
 events:{
  draw:susieDraw,user1:susieTalk,
  // Event 11 only counts story flags in the game's own rooms.
  user11:()=>{},
 },
});

// ---- Lancer ----
function lancerCreate(s:GmInstance){
 Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,
  mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,attacks:0,dodgetimer:0,candodge:1,con:0,susie_act:0,lancer_act:0,
  defeated:0,anythingcounter:0,lancer_hurt:0,idlesprite:s.sprite,susie_revive_count:0,ears_blocked:0,shakex:0});
}
/** Whether Lancer fights alone this turn: Susie is out of the battle or asleep. */
function lancerAlone(rt:GmRuntime,me:GmInstance){
 me.attack_qual=monsterPop(rt)===1?1:0;
 for(const su of rt.all(susieEnemy))if(su.sleeping===1)me.attack_qual=1;
 return me.attack_qual;
}
/** The "Anything" talks ending: blocked ears while Susie listens, or the battle ends. */
function anythingEnd(s:GmInstance,rt:GmRuntime){
 if(lancerAlone(rt,s)===0){s.actcon=20;for(const m of rt.all(monsterParent))m.ears_blocked+=1;}
 else s.anythingcounter=10;
 if(s.ears_blocked>=3){s.anythingcounter=10;s.actcon=1;s.attack_qual=1;}
}
/** His line before the enemy turn; three turns after Susie is knocked out she gets back up with 40 HP. */
function lancerTalk(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(monsterPop(rt)===1){
  s.susie_revive_count+=1;
  if(s.susie_revive_count>=3){
   g.monster[0]=1;const su=rt.create(g.monsterinstancetype[0],g.monstermakex[0],g.monstermakey[0]);g.monsterinstance[0]=su.id;su.myself=0;
   rt.userEvent(su,12);rt.userEvent(su,1);if(g.turntimer<150)g.turntimer=150;
   g.monsterhp[0]=40;rt.sound?.('snd_power');s.susie_revive_count=0;
  }
 }
 s.attack_qual=1;
 for(const su of rt.all(susieEnemy))if(su.sleeping===0&&g.monster[su.myself]===1)s.attack_qual=0;
 if(s.attack_qual===1){randomTarget(s,rt);g.targeted[s.mytarget]=1;}
 if(!rt.exists(darkener))rt.create(darkener,0,0);
 g.typer=50;s.rrrr=rt.random.choose(0,1,2,3);g.msg[0]=LL([56,57,58,59][s.rrrr]);
 if(s.lancer_hurt===0&&g.monsterhp[me]<=g.monstermaxhp[me]*0.5){s.lancer_hurt=1;g.msg[0]=LL(64);}
 if(s.susie_act===3)g.msg[0]=LL(66);
 if(s.susie_act===9)g.msg[0]=LL(67);
 const c=s.anythingcounter;
 if(s.acting===2&&c>=1)g.msg[0]=LL([70,71,72,73][Math.min(c,4)-1]);
 if(s.acting===3&&c>=1)g.msg[0]=LL([77,78,79,80][Math.min(c,4)-1]);
 s.susie_act=0;s.lancer_act=0;
 enemyBalloon(rt,s.x-235,s.y-65,3);s.talked=1;s.talktimer=0;
}
/** Alone (Susie out or asleep) he races or laps on his bike; otherwise Susie leads the attack. */
function lancerAttack(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(lancerAlone(rt,s)!==1)return;
 const bike=rt.create(lancerBike,s.x,s.y);s.bike=bike.id;s.visible=false;
 if(s.attacks===0){bike.racecon=1;s.attacks=1;}else{bike.lcon=1;s.attacks=0;}
 bike.target=s.mytarget;bike.damage=g.monsterat[me]*5;g.turntimer=999;
}
/** His ACTs: Check, and the "Anything" talks (Kris's, or Ralsei's) that can end the battle. The end of an ACT is
 * checked between them and the blocked-ears scene, as in the original. */
function lancerActs(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.acting===1&&s.actcon===0){s.actcon=1;g.msg[0]=LL(167);battleTextDefault(rt);}
 if(s.acting===2&&s.actcon===0){
  s.actcon=1;g.msg[0]=LL(176);g.msg[1]=LL(177);const c=s.anythingcounter;
  if(c===1){g.msg[0]=LL(181);g.msg[1]=LL(182);}
  if(c===2){g.msg[0]=LL(187);g.msg[1]=LL(188);}
  if(c>=3){g.msg[0]=LL(193);g.msg[1]=LL(194);if(s.ears_blocked>=2){g.msg[0]=LL(197);g.msg[1]=LL(198);}anythingEnd(s,rt);}
  if(s.anythingcounter<4)s.anythingcounter+=1;
  battleTextDefault(rt);
 }
 if(s.acting===3&&s.actcon===0){
  s.actcon=1;g.msg[0]=LL(222);ralFace(rt,1,8);g.msg[2]=LL(224);noFace(rt,3);g.msg[4]=LL(226);
  const c=s.anythingcounter;
  if(c===1){g.msg[0]=LL(230);ralFace(rt,1,1);g.msg[2]=LL(232);g.msg[3]=LL(233);noFace(rt,4);g.msg[5]=LL(235);}
  if(c===2){g.msg[0]=LL(240);ralFace(rt,1,1);g.msg[2]=LL(242);g.msg[3]=LL(243);noFace(rt,4);g.msg[5]=LL(245);}
  if(c>=3){
   g.msg[0]=LL(250);ralFace(rt,1,6);g.msg[2]=LL(252);g.msg[3]=LL(253);
   if(s.ears_blocked>=2){g.msg[0]=LL(256);ralFace(rt,1,0);g.msg[2]=LL(258);noFace(rt,3);g.msg[4]=LL(260);}
   anythingEnd(s,rt);
  }
  if(s.anythingcounter<4)s.anythingcounter+=1;
  const su=rt.first(susieEnemy);if(su){su.anythingxcounter=s.anythingcounter;su.lancer_act=3;}
  battleTextDefault(rt);
 }
 if(s.actcon===1&&!rt.exists(writer)){
  s.actcon=0;
  if(s.anythingcounter<10)attackPhase(rt);
  else{s.defeated=1;g.mnfight=99;g.myfight=99;s.con=1;g.flag[249]=1;}
 }
 if(s.actcon===20&&!rt.exists(writer)){
  s.visible=false;for(const su of rt.all(susieEnemy))su.visible=false;
  const block=darkMarker(rt,s.x,s.y,'spr_lancerbike_earcover');block.depth=s.depth;s.blocklan=block.id;
  rt.sound?.('snd_bell');g.msg[0]=LL(314);susFace(rt,1,2);g.msg[2]=LL(316);battleTextDefault(rt);s.actcon=21;
 }
 if(s.actcon===21&&!rt.exists(writer)){
  const block=rt.byId(s.blocklan);if(block)rt.destroy(block);
  s.visible=true;for(const su of rt.all(susieEnemy))su.visible=true;s.actcon=1;
 }
}
/** The ending: the party talks it over, then both of them leave. */
function lancerEnding(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;
 if(s.con===1){s.alarm[4]=5;s.con=2;}
 if(s.con===3){
  for(const su of rt.all(susieEnemy))su.idlesprite='spr_susie_enemy';
  g.typer=46;g.fe=4;g.fc=5;
  g.msg[0]=LL(348);susFace(rt,1,9);g.msg[2]=LL(350);g.msg[3]=LL(351);g.msg[4]=LL(352);lanFace(rt,5,2);g.msg[6]=LL(354);g.msg[7]=LL(355);susFace(rt,8,0);g.msg[9]=LL(357);ralFace(rt,10,6);g.msg[11]=LL(359);
  if(g.flag[249]===1){
   g.msg[0]=LL(363);susFace(rt,1,0);g.msg[2]=LL(365);lanFace(rt,3,4);g.msg[4]=LL(367);g.msg[5]=LL(368);g.msg[6]=LL(369);susFace(rt,7,0);
   g.msg[8]=LL(371);g.msg[9]=LL(372);g.msg[10]=LL(373);g.msg[11]=LL(374);
  }
  s.con=4;battleText(rt);
 }
 if(s.con===4&&!rt.exists(writer)){s.con=5;s.alarm[4]=2;const c=findController(rt);if(c){c.noreturn=0;c.alarm[2]=4;}}
 if(s.con===6){for(const m of rt.all(monsterParent))monsterDefeat(m,rt);rt.destroy(s);s.con=7;}
}
function lancerDraw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(s.state===3){
  // Lancer cannot be beaten: below a quarter of his HP the battle turns to its ending.
  if(g.monsterhp[me]<g.monstermaxhp[me]/4){for(const m of rt.all(monsterParent))m.defeated=1;g.monsterhp[me]=g.monstermaxhp[me]/4;}
  s.hurttimer-=1;
  if(s.hurttimer<0)s.state=0;
  else{
   if(g.monster[me]===0)s.hspeed=12;
   s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
   rt.drawSprite('spr_lancerbike_hurt',s.hurttimer/2,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);
  }
 }
 if(s.state===4){s.dodgetimer+=1;rt.drawSprite('spr_lancerbike_l',0,s.x,s.y,Math.cos(s.dodgetimer*2*Math.PI/15)*2,2,0,s.imageBlend,1);if(s.dodgetimer>=15)s.state=0;}
 if(s.state===0){
  s.siner+=1;s.thissprite=s.idlesprite;
  rt.drawSprite(s.thissprite,s.siner/5,s.x,s.y,2,2,0,s.imageBlend,1);
  if(s.flash===1){s.fsiner+=1;rt.drawSpriteFog(s.thissprite,s.siner/5,s.x,s.y,2,2,0,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);}
 }
 if(s.becomeflash===0)s.flash=0;
 s.becomeflash=0;
}
/** Lancer with Susie: the standard enemy (deltarune/enemy.ts) with these steps of his own. He attacks as soon as the
 * enemy turn starts (no delay). */
export const lancerEnemy3:GmObjectDef=defineEnemy({name:'obj_lancerboss3',index:290,depth:90,sprite:'spr_lancerbike'},{
 create:s=>lancerCreate(s),
 beforeStep:(s,rt)=>{if(s.defeated===1&&rt.globals.mnfight===1){rt.globals.mnfight=99;s.con=1;}},
 isAlive:(s,rt)=>rt.globals.monster[s.myself]===1&&s.defeated===0,
 beforeTalk:(s,rt)=>{rt.globals.flag[51+s.myself]=4;},
 startTalk:lancerTalk,endTalk:endTalkAfter(17),
 attackDelay:0,attack:lancerAttack,
 statusLine:(s,rt)=>{s.rr=Math.floor(rt.random.random(5));rt.globals.battlemsg[0]=LL([145,146,147,148,149][s.rr]);},
 acts:lancerActs,actsDone:()=>{},
 afterStep:lancerEnding,
 monsterPosition:(s,rt)=>[s.x-30,s.y-rt.spriteHeight(s)/2-30],
 events:{draw:lancerDraw},
});

// ---- Lancer with Susie riding: the team-up attack ----
function neoCreate(s:GmInstance,rt:GmRuntime){
 Object.assign(s,{grazed:0,grazepoints:4,timepoints:0,target:0,dont:1,inv:60,damage:20,spec:0,imageXscale:2,imageYscale:2,loop:0,lcon:0,flip:0,ltimer:0,btimer:0,racecon:0,
  topy:100,bottomy:300,susiex:s.x-100,susiey:s.y-180,s_tracking:0,s_attack:0,s_timer:0,type:0});
 const su=rt.first(susieEnemy);if(su){s.susiex=su.x;s.susiey=su.y;}
}
function neoStep(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;let sus=rt.byId(s.s);
 if(s.racecon===0){
  s.orx=s.x;s.ory=s.y;s.ang=0;s.vdir=rt.random.choose(1,-1);s.racecon=1;s.rtimer=0;
  for(const su of rt.all(susieEnemy))su.visible=false;
  sus=rt.create(regularBulletPermanent,s.susiex,s.susiey);s.s=sus.id;inheritBullet(s,sus);
  sus.wall_destroy=0;sus.sprite='spr_susiel_dark';sus.imageXscale=2;sus.imageYscale=2;sus.active=1;sus.depth=s.depth-1;sus.imageSpeed=0;sus.imageIndex=1;sus.lx=s.x;sus.ly=s.y-108;
  rt.sound?.('snd_jump');
  sus.hspeed=-2;sus.vspeed=sus.vspeed-7;sus.gravity=1;
 }
 if(s.racecon===1){
  s.siner=0;s.rtimer+=1;
  if(s.rtimer===13){rt.soundStop?.('snd_jump');rt.sound?.('snd_splat');}
  if(s.rtimer>=13){s.imageXscale=s.imageXscale+0.1;s.imageYscale=s.imageYscale-0.15;}
  if(s.rtimer===16&&sus){
   sus.speed=0;sus.gravity=0;sus.imageIndex=0;s.sfitx=sus.x-s.x;s.sfity=sus.y-s.y;s.s_tracking=1;s.ax_timer=0;s.s_timer=0;s.racecon=2;s.rtimer=0;
  }
 }
 if(s.s_attack===1&&sus){
  s.ax_timer+=1;s.s_timer+=1;
  if(s.s_timer===1){
   const axe=rt.create(axeBullet,sus.x-40,sus.y-15);s.axe=axe.id;inheritBullet(s,axe);axe.depth=s.depth+2;
   axe.hspeed=-16;
   const h=rt.first(heart);
   if(h&&h.y>=axe.y){axe.gravityDirection=-15+rt.random.random(10);axe.vspeed=2;}else{axe.gravityDirection=5+rt.random.random(10);axe.vspeed=-2;}
   axe.gravity=0.5;axe.hspeed=axe.hspeed+0.3*s.ax_timer;
   rt.sound?.('snd_laz_c');sus.sprite='spr_susie_enemy_attack';sus.active=0;sus.imageIndex=0;sus.imageSpeed=0.5;
  }
  if(s.s_timer===4)sus.active=0;
  if(s.s_timer===8)sus.imageSpeed=0;
  if(s.s_timer===8&&s.ax_timer<=60)s.s_timer=0;
 }
 if(s.racecon===2){
  s.rtimer+=1;
  if(s.rtimer>=1&&(s.y<=s.ory-120||s.y>=s.ory+120)){if(s.y<=s.ory-120&&s.vspeed<0)s.vspeed=-s.vspeed;if(s.y>=s.ory+120&&s.vspeed>0)s.vspeed=-s.vspeed;}
  if(s.rtimer===5||s.rtimer===10){s.vspeed=0;rt.sound?.('snd_lancerhonk');const honk=rt.create(afterimageGrow,s.x-60,s.y-40);honk.sprite='spr_lancernoise';}
  if(s.rtimer===30){s.active=1;s.s_attack=1;s.racecon=3;s.rtimer=0;s.ang=0;rt.sound?.('snd_drive');s.hspeed=-10;s.vspeed=-11;s.gravity=0.5;}
 }
 if(s.racecon===3){
  s.rtimer+=1;
  if(s.x<=rt.view.x-40&&sus){
   s.speed=0;s.gravity=0;s.friction=0;s.s_attack=0;s.s_tracking=0;s.imageXscale=2;s.imageYscale=2;s.x=rt.view.x+740;s.y=s.ory;
   sus.x=s.susiex+200;sus.hspeed=-8;sus.y=s.susiey;sus.sprite='spr_susie_enemy';s.hspeed=-6;s.racecon=4;
  }
 }
 if(s.racecon===4&&sus){
  s.donecount=0;
  if(sus.x<=s.susiex){s.donecount+=1;sus.hspeed=0;sus.x=s.susiex;}
  if(s.x<=s.orx+5){s.donecount+=1;s.hspeed=0;s.x=s.orx;}
  if(s.donecount>=2){g.turntimer=5;for(const su of rt.all(susieEnemy))su.visible=true;for(const l of rt.all(lancerEnemy3))l.visible=true;s.racecon=-1;}
 }
 if(s.s_tracking===1&&sus){sus.x=s.x+s.sfitx;sus.y=s.y+s.sfity;}
}
export const lancerBikeNeo:GmObjectDef={name:'obj_lancerbike_neo',index:284,depth:-20,parent:regularBullet,sprite:'spr_lancerbike',events:{
 create:neoCreate,step:neoStep,user5:(s,rt)=>damage(s,rt),
}};
