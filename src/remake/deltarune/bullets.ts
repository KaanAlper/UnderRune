// DELTARUNE Chapter 1 bullet base objects, re-implemented for the remake (object indices from the game's object table).
import type {GmObjectDef} from '../gm/runtime';

export const battleSolid:GmObjectDef={name:'obj_battlesolid',index:197};
export const growtangle:GmObjectDef={name:'obj_growtangle',index:311,parent:battleSolid,sprite:'spr_battlebg_0'};
export const heart:GmObjectDef={name:'obj_heart',index:313,sprite:'spr_dodgeheart'};
export const bulletParent:GmObjectDef={name:'obj_bulletparent',index:199};
/** Hit callback the battle layer installs: damage the party, then the bullet is destroyed (User Event 5). */
export type BulletHit=(bullet:import('../gm/runtime').GmInstance)=>void;
export function collideBullet(onHit:BulletHit):GmObjectDef{
 return {name:'obj_collidebullet',index:201,parent:bulletParent,events:{
  user5:(self,rt)=>{if(self.active===1){onHit(self);rt.destroy(self);}},
 }};
}
