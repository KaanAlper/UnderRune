import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq} from '../../gm/math';

/** snd_free: Chapter 2's holder has its own object index and owns backend cleanup. */
export function freeGigaStream(caller:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,handle:number|string){
 const holders=rt.all(object('obj_astream'));if(!holders.length)return;
 caller._xstream=handle;
 for(const stream of holders)stream.bstream=handle;
 for(const stream of rt.withInstances(object('obj_astream')))if(stream.live&&(stream.bstream===stream.mystream||eq(stream.bstream,stream.mystream)))rt.destroy(stream);
}
