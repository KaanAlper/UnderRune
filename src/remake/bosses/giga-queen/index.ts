import type {GmObjectDef} from '../../gm/runtime';
import {createGigaQueenProxy} from '../queen/boxing-proxy';
import {createGigaPlayer} from './player';
import {createGigaOpponent} from './opponent';
import {createGigaSupport} from './support';
import {drawGigaPlayer,drawGigaOpponent} from './draw';
import {createPreciseMovement} from './motion';
import {gigaMenuHooks} from './menu';
import {gigaHealingHooks} from './healing';
import {createGigaIntro} from './intro';
import {createGigaLoss} from './loss';
import type {HookedDef} from '../../deltarune/rules';
export {runGigaSoulBulletController} from './projectiles-soul';
export function createGigaQueen(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const proxy=createGigaQueenProxy(object) as HookedDef;
 const player=createGigaPlayer(object,(s,rt)=>drawGigaPlayer(s,rt,object));
 return [{...proxy,hooks:{...proxy.hooks,...gigaMenuHooks(object)}},{...player,hooks:gigaHealingHooks()},createGigaOpponent(object,(s,rt)=>drawGigaOpponent(s,rt,object)),...createGigaSupport(object),...createGigaIntro(object),...createGigaLoss(object),createPreciseMovement(object)] as HookedDef[];
}
