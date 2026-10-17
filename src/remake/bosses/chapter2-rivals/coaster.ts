import type {GmObjectDef} from '../../gm/runtime';
import {createBerdlyCoasterEnemy} from './berdly-coaster-enemy';
import {createBerdlyCoasterController} from './coaster-controller';
import {createBerdlyCoasterHeroes} from './coaster-hero';
import {createBerdlyCoasterBird} from './coaster-berdly';
import {createBerdlyCoasterEffects} from './coaster-effects';
/** Source encounter 58's enemy and all coaster state-machine objects. The common bullet runner is separate. */
export function createBerdlyCoaster(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 return [...createBerdlyCoasterEffects(object),...createBerdlyCoasterHeroes(object),createBerdlyCoasterBird(object),createBerdlyCoasterController(object),createBerdlyCoasterEnemy(object)];
}
