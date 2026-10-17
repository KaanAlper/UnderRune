import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
export type QueenObject=(name:string)=>GmObjectDef;
export function queenInstance(rt:GmRuntime,object:QueenObject,name:string):GmInstance{
 const s=rt.first(object(name));if(!s)throw Error(`Queen requires ${name}`);return s;
}
