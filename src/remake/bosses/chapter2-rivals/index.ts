import type {GmObjectDef} from '../../gm/runtime';
import {createRivalAttacks,runBerdlyBulletController} from './attacks';
import {createBerdlyCoaster} from './coaster';
import {createBerdlyRematch,type BerdlyRematchServices} from './berdly-rematch';
import {createBerdlySpearblast} from './spearblast';
import {createRouxlsPowerOrb} from './rouxls-orb';
import {createMusicalScore} from './musical-score';
import {createMusicalBullets} from './musical-bullets';
import {createCapnEnemy} from './trio-capn';
import {createKKEnemy} from './trio-kk';
import {createSweetEnemy} from './trio-sweet';
import {createMusicalController} from './musical-controller';
import {createMusicalEnding} from './musical-ending';
/** Explicit implemented definitions only; encounter acceptance/availability stays in the host.
 * Rouxls's town and machine are still separate pending ports. */
export function createChapter2Rivals(object:(name:string)=>GmObjectDef,services:BerdlyRematchServices):GmObjectDef[]{
 return [...createRivalAttacks(object),...createBerdlySpearblast(object),...createBerdlyCoaster(object),createBerdlyRematch(object,services),createRouxlsPowerOrb(object),createMusicalScore(object),...createMusicalBullets(object),createCapnEnemy(object),createKKEnemy(object),createSweetEnemy(object),createMusicalController(object),...createMusicalEnding(object)];
}
export {runBerdlyBulletController};
export type {BerdlyRematchServices};
