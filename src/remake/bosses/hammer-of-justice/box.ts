import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq,gt,lt} from '../../gm/math';
/** Enemy End Step: the flattened battle box has source-specific inner bounds, independent of sprite scaling. */
export function constrainHammerSoul(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const h=rt.first(object('obj_heart')),b=rt.first(object('obj_growtangle'));
 if(!eq(s.squishbox,1)||!h||!b)return;
 if(lt(h.x,b.x-210))h.x=b.x-210;if(gt(h.x,b.x+215-20))h.x=b.x+215-20;
 if(lt(h.y,b.y-37))h.y=b.y-37;if(gt(h.y,b.y+37-20))h.y=b.y+37-20;
}
