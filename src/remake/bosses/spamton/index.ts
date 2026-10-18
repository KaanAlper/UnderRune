// Spamton (encounter 60): his enemy object, F1's helpers, his attacks' objects, and the bullet maker's patterns for them.
import type {GmObjectDef} from '../../gm/runtime';
import {createSpamtonEnemy} from './enemy';
import {createSpamtonAttacks} from './attacks';
import {createSpamtonCherub} from './cherub';
export {SPAMTON_ENCOUNTERS,setupSpamtonMonster} from './setup';

export function createSpamton(object:(name:string)=>GmObjectDef){
 const attacks=createSpamtonAttacks(object),help=createSpamtonCherub(object);
 return {objects:[createSpamtonEnemy(object,help),help.cherub,...attacks.objects],pattern:attacks.pattern};
}
