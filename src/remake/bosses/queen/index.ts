import {defineEnemy} from '../../deltarune/enemy';
import type {GmObjectDef} from '../../gm/runtime';
import {createQueenState} from './state';
import {queenPresentation,drawQueen} from './presentation';
import {queenBeforeTalk,queenDialogue,queenEndTalk} from './dialogue';
import {queenActs} from './acts';
import {queenEndings,recordQueenEnding} from './endings';
import {startQueenAttack} from './attacks';
import {chooseQueenAttack,advanceQueenPhase} from './chooser';
import {updateQueenActs} from './menu';
import {createQueenSupport} from './support';
import {createQueenShield} from './shield';
import {createBattleMarker} from '../../deltarune/guard-peek';
import type {BattleHooks} from '../../deltarune/rules';
import {createQueenBulletController} from './controller';

/** Full normal enemy events; attack dependencies are registered independently and readiness belongs to the host. */
export function createQueenObjects(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const hooks:BattleHooks={
  defeatedByDamage:false,
  interceptFightDamage:(s,_hero,rt,_target,damage)=>{
   if(rt.exists(object('obj_queenshield_enemy'))){s.shieldhp-=damage;return true;}
   if(damage!==0)s.shieldbrokecon=1;return false;
  },
  onFightImpact:(s,_hero,_attack,rt,_target,damage)=>{
   const shield=rt.first(object('obj_queenshield_enemy'));
   for(const attack of rt.withInstances(object('obj_basicattack')))attack.x=shield?shield.x+34:s.x+62;
   if(shield){if(damage!==0)for(const sh of rt.withInstances(object('obj_queenshield_enemy')))rt.userEvent(sh,0);return true;}return false;
  },
  onFightResolved:(_s,hero,rt)=>{const shield=rt.first(object('obj_queenshield_enemy'));if(shield){const dm=rt.byId(hero.dm);if(!dm)throw Error('Queen shield FIGHT number missing');dm.x=shield.x;dm.depth-=100;}},
  interceptSpellDamage:(s,_spell,rt,_target,damage,id)=>{
   if(id!==4||!rt.exists(object('obj_queenshield_enemy')))return false;s.shieldhp-=damage;
   for(const sh of rt.withInstances(object('obj_queenshield_enemy')))sh.con=1;
   for(const sh of rt.withInstances(object('obj_queenshield_enemy')))rt.userEvent(sh,0);return true;
  },
 };
 const enemy=defineEnemy({...object('obj_queen_enemy'),depth:0},{
  create:(s,rt)=>createQueenState(s,rt,object),
  beforeStep:(s,rt)=>{if(rt.globals.monster[s.myself]===1)queenPresentation(s,rt,object);},
  beforeTalk:(s,rt)=>queenBeforeTalk(s,rt,object),startTalk:()=>{},duringTalk:(s,rt)=>queenDialogue(s,rt,object),endTalk:(s,rt)=>queenEndTalk(s,rt,object),
  attackDelay:16,countTurn:false,attack:(s,rt)=>{startQueenAttack(s,rt,object('obj_queen_bulletcontroller'),object('obj_queen_enemy'),object('obj_berdlyplug_enemy'));},
  acts:(s,rt)=>queenActs(s,rt,object),actsDone:()=>{},
  afterStep:(s,rt)=>{s.sactionboxy=(s.y-s.ystart)/2-20;queenEndings(s,rt,object);},hooks,
  events:{
   destroy:()=>{},draw:(s,rt)=>drawQueen(s,rt,object),alarm4:s=>{s.actcon++;},alarm5:s=>{s.talked=.5;},
   alarm6:s=>{if(s.endcon>0){if(s.balloonend===1)s.endcon=4;else{s.endcon=2;s.talktimer=0;}}else if(s.balloonend===1){s.talked=1;if(s.intro===1){s.intro=2;s.talked=0;}}else{s.talked=.6;s.talktimer=0;}},
   user0:(s,rt)=>chooseQueenAttack(s,rt,object('obj_berdlyplug_enemy')),user1:(s,rt)=>updateQueenActs(s,rt,object('obj_queenshield_enemy')),user2:advanceQueenPhase,user3:recordQueenEnding,
  },
 });
 return [enemy,...createQueenSupport(object),createQueenShield(object),createBattleMarker(object),createQueenBulletController(object)];
}
