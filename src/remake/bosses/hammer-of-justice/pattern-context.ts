import type {GmInstance,GmRuntime} from '../../gm/runtime';
import {appendSpearPattern} from './spear-pattern';

/** Evaluate side-effecting arguments in GameMaker's order; this executes compiled functions, not source data. */
export function rtl(...values:(()=>any)[]):any[]{
 const result=new Array(values.length);for(let i=values.length-1;i>=0;i--)result[i]=values[i]();return result;
}
export interface HammerPatternContext{
 s:GmInstance;rt:GmRuntime;v:Record<string,any>;
 pattern(...values:any[]):void;choose(...values:any[]):any;irandom(...values:any[]):number;debug(...values:any[]):void;
}
export function createPatternContext(s:GmInstance,rt:GmRuntime,debug?:(message:string)=>void):HammerPatternContext{
 // The original unused debug pattern 5.5 reads `prev` before initializing it. Do not invent a value for it.
 const v=new Proxy(Object.create(null) as Record<string,any>,{get:(target,key)=>{if(!(key in target))throw Error(`Uninitialized attack local ${String(key)}`);return target[key as string];}});
 return {s,rt,v,pattern:(...v)=>appendSpearPattern(s,v[0],v[1],v[2],v[3],v[4],...v.slice(5)),choose:(...v)=>rt.random.choose(...v),irandom:(...v)=>rt.random.irandom(v[0]),debug:(...v)=>debug?.(v[0])};
}
