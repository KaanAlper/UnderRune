import type {GmCollision,GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {createNeoProjectiles} from './shot';
import {createNeoSourceObject,executeNeoSource,type NeoSourceHost,type NeoSourceMetadata} from './body-source';
import {attackSources as flying} from './attack-flying-heads';
import {attackSources as walls} from './attack-walls';
import {attackSources as wireheart} from './attack-wireheart';
import {attackSources as phonecall} from './attack-phonecall';
import {attackSources as phonehands} from './attack-phonehands';
import {attackSources as face} from './attack-face';
import {attackSources as finale} from './attack-finale';
import {attackSources as support} from './attack-support';
import {controllerSource} from './attack-controller-source';
import {attackScriptSources} from './attack-script-source';
import {flyingHeadPathEnd} from './flying-heads';

export interface NeoAttackSourceRecord {metadata:NeoSourceMetadata;sources:Readonly<Record<string,string>>;}
export type NeoAttackHost=NeoSourceHost;
export const neoAttackSources:readonly NeoAttackSourceRecord[]=[...flying,...walls,...wireheart,...phonecall,...phonehands,...face,...finale,...support,controllerSource];
/** The source's rr is selected by the enemy, not by this controller's type. */
export const normalNeoControllerTypes=[0,1,1.5,6,8.5,9,12] as const;

/** Every reference resolves lazily to the same definition, including recursive face parts.
 * Source events run in the existing GM loop with source metadata/masks and inherited collisions.
 * The external host must own actual party, battle, writer, audio, and enemy definitions. */
export function createNeoAttackObjects(external:NeoAttackHost):Record<string,GmObjectDef>{
 const objects:Record<string,GmObjectDef>={};
 const host:NeoSourceHost={...external,scripts:{...attackScriptSources,...external.scripts},object:name=>objects[name]??external.object(name)};
 for(const record of neoAttackSources)objects[record.metadata.name]=createNeoSourceObject(host,record.metadata,record.sources);
 // Use the independently audited projectile receiver implementations on the real owners.
 const primitives=createNeoProjectiles({get neo(){return host.object('obj_spamton_neo_enemy');},get heart(){return host.object('obj_heart');},faceAttack:objects.obj_sneo_faceattack,finalForm:objects.obj_sneo_final_forme,wireheart:objects.obj_sneo_wireheart}).collisions;
 const handlers:Record<string,GmCollision['run']>={obj_basicbullet_sneo:primitives.basicBullet,obj_basicbullet_sneo_finale:primitives.basicBullet,obj_sneo_lilguy:primitives.flyingHead,obj_sneo_wireheart:primitives.wireheart,obj_sneo_faceattack:primitives.facePart};
 for(const [name,run] of Object.entries(handlers)){
  const def=objects[name],sourceCollisions=Object.getOwnPropertyDescriptor(def,'collisions')?.get;
  Object.defineProperty(def,'collisions',{configurable:true,get:()=>{
   const current:GmCollision[]=sourceCollisions?.call(def)??[];
   const shot=host.object('obj_yheart_shot');
   return [...current.filter(c=>c.target!==shot),{target:shot,run}];
  }});
 }
 const controller=objects.obj_sneo_bulletcontroller,step=controller.events!.step!;
 controller.events!.step=(s,rt)=>{if(!normalNeoControllerTypes.includes(s.type))throw Error(`Spamton NEO controller type ${s.type} is outside the NORMAL source route`);step(s,rt);};
 return objects;
}

/** Room-end is a real source lifecycle event, independent of Destroy/CleanUp. */
export function endNeoAttackRoom(objects:Readonly<Record<string,GmObjectDef>>,external:NeoAttackHost,rt:GmRuntime){
 const host:NeoSourceHost={...external,scripts:{...attackScriptSources,...external.scripts},object:name=>objects[name]??external.object(name)};
 for(const record of neoAttackSources){const source=record.sources.Other_5;if(source)for(const s of rt.all(objects[record.metadata.name]))executeNeoSource(source,s,rt,host);}
}

/** Source path-end hook for the guymaker's developer difficulty7 path; the NORMAL rotation
 * does not start this path, so it never synthesizes a path event during normal attacks. */
export function endNeoAttackPath(s:GmInstance,rt:GmRuntime,host:NeoAttackHost){
 if(s.object.name==='obj_sneo_lilguy'&&!(s.object as {archived?:boolean}).archived){flyingHeadPathEnd(s,rt);return;}
 const source=neoAttackSources.find(r=>r.metadata.name===s.object.name)?.sources.Other_8;
 if(!source)throw Error(`${s.object.name} has no source path-end event`);
 executeNeoSource(source,s,rt,host);
}
