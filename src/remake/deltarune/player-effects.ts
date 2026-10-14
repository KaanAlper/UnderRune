// Chapter 1 obj_burstbolt and obj_basicattack Create/Step events.
import type {GmObjectDef} from '../gm/runtime';
import {ge,lt} from '../gm/math';
import {battleController} from './battle';
export const burstBolt:GmObjectDef={name:'obj_burstbolt',index:200,sprite:'spr_attackspot',events:{
 create:s=>{s.mag=.1;},
 step:(s,rt)=>{s.imageAlpha-=.1;s.imageXscale+=s.mag;s.imageYscale+=s.mag;s.x+=((1-rt.spriteWidth(s))*s.mag)/2.7;s.y+=((1-rt.spriteHeight(s))*s.mag)/2.5;if(lt(s.imageAlpha,0))rt.destroy(s);},
}};
export const basicAttack:GmObjectDef={name:'obj_basicattack',index:195,depth:-100,sprite:'spr_attack_cut1',events:{
 create:(s,rt)=>{s.imageXscale=2;s.imageYscale=2;s.damage=100;s.imageSpeed=.334;s.maxindex=3;s.critical=0;for(const c of rt.all(battleController))c.damagenoise=1;},
 step:(s,rt)=>{if(s.critical===1){s.imageXscale+=.1;s.imageYscale+=.1;}if(ge(s.imageIndex,s.maxindex))rt.destroy(s);},
}};
