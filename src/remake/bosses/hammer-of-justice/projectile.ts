import type {GmObjectDef} from '../../gm/runtime';
import type {HammerProjectileScripts} from './projectile-context';
import {projectileCreate} from './projectile-create';
import {projectileStep} from './projectile-step';
import {projectileHit} from './projectile-hit';
import {projectileBreak} from './projectile-break';
import {projectileDraw} from './projectile-draw';
import {projectileCleanup} from './projectile-cleanup';
/** The six original obj_spearshot events. Damage and event-manager effects require Chapter 4 integrations. */
export function createHammerProjectile(object:(name:string)=>GmObjectDef,scripts:HammerProjectileScripts):GmObjectDef {
 return {...object('obj_spearshot'),events:{create:(s,rt)=>projectileCreate(s,rt,object,scripts),step:(s,rt)=>projectileStep(s,rt,object,scripts),draw:(s,rt)=>projectileDraw(s,rt,object,scripts),user0:(s,rt)=>projectileHit(s,rt,object,scripts),user1:(s,rt)=>projectileBreak(s,rt,object,scripts),cleanup:(s,rt)=>projectileCleanup(s,rt,object,scripts)}};
}
