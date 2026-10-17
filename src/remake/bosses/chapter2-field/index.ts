import type {GmObjectDef} from '../../gm/runtime';
import {createWerewerewire} from './werewerewire';
import {createTasque} from './tasque';
import {createTasqueManager} from './tasque-manager';
import {createTasqueWhip} from './tasque-whip';
import {createTasqueQuiz} from './tasque-quiz';
import {createTasqueBullets} from './tasque-bullets';
import {createMauswheel} from './mauswheel';
import {createMauswheelBullets} from './mauswheel-bullets';
import {createMauswheelCatch} from './mauswheel-catch';
import {createFieldEffects} from './small-effects';
import {createMausBasket} from './maus-basket';
import {createWerewire} from './werewire';
import {createWerewireThrow} from './werewire-throw';
export {createChapter2FieldBulletRunner,runChapter2FieldBullets} from './bullets';
/** Install all returned definitions before instantiating: references resolve through the canonical registry. */
export function createChapter2Field(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 const defs=[...createFieldEffects(object),...createWerewerewire(object),...createWerewire(object),...createWerewireThrow(object),...createTasque(object),...createTasqueManager(object),...createTasqueWhip(object),...createTasqueQuiz(object),...createTasqueBullets(object),...createMauswheel(object),...createMauswheelBullets(object),...createMauswheelCatch(object),...createMausBasket(object)];
 // Canonical source metadata exposes parent through a non-enumerable getter, so spreading it loses ancestry.
 const byName=new Map(defs.map(d=>[d.name,d]));for(const d of defs){const parent=d.parent??object(d.name).parent;if(parent)d.parent=byName.get(parent.name)??parent;}
 return defs;
}
