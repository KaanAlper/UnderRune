import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import type {HookedDef} from '../../deltarune/rules';
import {monsterSetup} from '../../deltarune/encounter';
import {initializeHammer} from './init';
import {buildHammerPattern} from './patterns';
import {resetSpearPattern} from './spear-pattern';
import {constrainHammerSoul} from './box';
import {stepHammer} from './step';
import {drawHammer} from './draw';
import {cleanupHammer} from './cleanup';
import type {HammerSceneScripts} from './scene-context';
import type {HammerDrawScripts} from './draw-context';

/** User 14 ends an attack, before a new pattern is built. Order matters for actors' CleanUp events. */
export function clearHammerAttack(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 s.attackcount=0;s.visible=true;s.attacktimer=0;s.attackcon=0;resetSpearPattern(s);
 for(const name of ['obj_gerson_hammer_bro_attack_controller','obj_gerson_hammer_bro_hammer','obj_gerson_box_hit_controller','obj_gerson_box_hit','obj_box_hit_bullet','obj_gerson_bell_attack_controller','obj_gerson_bell','obj_gerson_bell_hit','obj_gerson_bell_bullet','obj_gerson_bell_bullet_radial','obj_gerson_swing_down','obj_gerson_hits_box','obj_gerson_squishes_box','obj_gerson_teleport','obj_follow_spear','obj_spearblocker','obj_spearblocker_piece','obj_spearshot','obj_giant_hammer','obj_just_text','obj_green_heart_particle'])for(const actor of rt.all(object(name)))rt.destroy(actor);
}
/** The source event ports need a complete Chapter 4 host. Missing integrations fail before a partial battle runs. */
export function createHammerEnemy(object:(name:string)=>GmObjectDef,integrations?:{scene:HammerSceneScripts;draw:HammerDrawScripts}):GmObjectDef{
 const missing=(event:string)=>()=>{throw Error(`Hammer of Justice ${event} is not ported yet`);};
 const enemy:HookedDef={...object('obj_hammer_of_justice_enemy'),hooks:{soulEntry:(_s,rt)=>{const h=rt.first(object('obj_herosusie'));if(!h)throw Error('Hammer soul entry requires Susie');return [h.x-250,h.y+40];}},events:{
  create:(s,rt)=>initializeHammer(s,rt,object),step:integrations?(s,rt)=>stepHammer(s,rt,object,integrations.scene):missing('Step integration'),draw:integrations?(s,rt)=>drawHammer(s,rt,object,integrations.draw):missing('Draw integration'),endStep:(s,rt)=>constrainHammerSoul(s,rt,object),cleanup:(s,rt)=>cleanupHammer(s,rt,object),
  alarm4:s=>{s.con++;},alarm6:s=>{if(s.balloonend===1)s.talked=1;else{s.talked=.6;s.talktimer=0;}},alarm7:s=>{s.talktimer=0;},
  user0:buildHammerPattern,user11:()=>{},user12:(s,rt)=>{const g=rt.globals;g.monsterx[s.myself]=s.x+rt.spriteWidth(s)/2;g.monstery[s.myself]=s.y+rt.spriteHeight(s)/2;monsterSetup(s,rt);},user13:()=>{},user14:(s,rt)=>clearHammerAttack(s,rt,object),
 }};return enemy;
}
