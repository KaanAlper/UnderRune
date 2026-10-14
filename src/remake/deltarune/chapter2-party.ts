// Chapter 2's obj_heroparent events where they differ from Chapter 1's (party.ts).
import type {GmInstance,GmRuntime} from '../gm/runtime';
import {round} from '../gm/math';
import {dmgWriter,shake,tensionHeal} from './battle';
import {basicAttack} from './player-effects';
import {monsterDefeat} from './controller';

const named=(rt:GmRuntime,name:string)=>rt.instances.find(i=>i.live&&i.object.name===name);
/** scr_retarget (unchanged from Chapter 1). */
function retarget(s:GmInstance,rt:GmRuntime,slot:number){
 const g=rt.globals;let t=g.chartarget[slot];s.cancelattack=0;
 if(t===0&&g.monster[0]===0)t=1;
 if(t===1&&g.monster[1]===0)t=2;
 if(t===2&&g.monster[2]===0)t=3;
 if(t===3&&g.monster[0]===1)t=0;
 if(t===3&&g.monster[1]===1)t=1;
 if(t===3)s.cancelattack=1;
 g.chartarget[slot]=t;
}
/** Alarm 1 (Chapter 2): the FIGHT hit lands. New in Chapter 2: Noelle's slap, Queen's shield, NEO's electrified
 * pose when hit, and Queen, NEO and Berdly not being defeated by the hit itself. */
export function heroHit2(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.faceaction[me]=0;retarget(s,rt,me);
 if(s.cancelattack!==0)return;
 const t=g.chartarget[me],m=rt.byId(g.monsterinstance[t]);
 const dm=rt.create(dmgWriter,g.monsterx[t],g.monstery[t]-g.hittarget[t]*20+20);
 dm.type=s.char-1;if(s.char===4)dm.type=6;dm.delay=8;
 if(named(rt,'obj_rouxls_enemy'))dm.depth=-999999;
 const neo=named(rt,'obj_spamton_neo_enemy'),queen=named(rt,'obj_queen_enemy');
 if(neo&&neo.weirdpathendcon>0){s.damage=round(g.battleat[me]*s.points/150);if(s.damage<5)s.damage=5;if(s.damage>10)s.damage=10;}
 else s.damage=round(g.battleat[me]*s.points/20-g.monsterdf[t]*3);
 if(g.monstertype[t]===19)s.damage=Math.ceil(s.damage*0.3);
 if(s.damage<0)s.damage=0;
 if(s.damage===0){dm.delay=2;if(m&&m.hurttimer<=15&&m.candodge===1){m.dodgetimer=0;m.state=4;}}
 dm.damage=s.damage;g.hittarget[t]+=1;
 let queenshield=0;
 const shield=named(rt,'obj_queenshield_enemy');
 if(queen){
  if(shield){queen.shieldhp-=s.damage;queenshield=1;}
  else{g.monsterhp[t]-=s.damage;if(s.damage!==0)queen.shieldbrokecon=1;}
 }else g.monsterhp[t]-=s.damage;
 if(s.damage>0){
  tensionHeal(rt,round(s.points/(g.monstertype[0]===20?15:10)));
  const y=g.monstery[t]+rt.random.random(6),x=g.monsterx[t]+rt.random.random(6);
  const a=rt.create(basicAttack,x,y);
  if(s.object.name==='obj_herosusie'){a.sprite='spr_attack_mash2';a.imageSpeed=0.5;a.maxindex=4;rt.sound?.('snd_impact');rt.create(shake,0,0);}
  if(s.object.name==='obj_heroralsei'){a.sprite='spr_attack_slap1';a.maxindex=4;a.imageSpeed=0.5;}
  if(s.object.name==='obj_heronoelle'){a.sprite='spr_attack_slap2';a.maxindex=4;a.imageSpeed=0.5;}
  if(s.points===150){a.imageXscale=2.5;a.imageYscale=2.5;}
  if(queenshield===1){
   for(const b of rt.all(basicAttack))b.x=shield!.x+34;
   if(s.damage!==0)rt.userEvent(shield!,0);
  }else{
   if(queen)for(const b of rt.all(basicAttack))b.x=queen.x+62;
   if(neo)Object.assign(neo,{partmode:40,shockthreshold:15,shocktimer:9999,hurttimer2:10});
   if(m){m.shakex=9;m.state=3;m.hurttimer=30;}
  }
  if(m)m.hurtamt=s.damage;
 }
 if(queenshield===1){dm.x=shield!.x;dm.depth=dm.depth-100;}
 if(named(rt,'obj_sweet_enemy')&&g.monsterhp[t]<=0)g.monsterhp[t]=1;
 const a=named(rt,'obj_berdlyb_enemy')?3:neo?2:queen?1:0;
 if(g.monsterhp[t]<=0&&a===0&&m)monsterDefeat(m,rt);
 if(g.monsterhp[t]<=0&&a===3&&m)m.endcon=1;
}
