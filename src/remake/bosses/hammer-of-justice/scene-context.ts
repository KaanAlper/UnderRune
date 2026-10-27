import {GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq as numberEqual} from '../../gm/math';
import {sourceText} from '../../host/text';

/** Explicit script boundaries for the source Step. These are required integrations, never optional fallbacks. */
export interface HammerSceneScripts {
 spellMenu(self:GmInstance):void;
 heroBalloon(self:GmInstance,actor:string):number;
 enemyBalloon(self:GmInstance,x:number,y:number,kind:number):number;
 phase(self:GmInstance,name:string):boolean;
 randomTarget(self:GmInstance):void;
 moveHeart(self:GmInstance):void;
 turnTimer(self:GmInstance,frames:number):void;
 speaker(self:GmInstance,name:string):void;
 shakeObject(self:GmInstance,target?:any,...args:number[]):void;
 musicVolume(self:GmInstance,...args:any[]):void;
 musicFade(self:GmInstance,...args:any[]):void;
 play(self:GmInstance,...args:any[]):number;
 loop(self:GmInstance,...args:any[]):number;
 soundVolume(self:GmInstance,...args:any[]):void;
 stop(self:GmInstance,...args:any[]):void;
 playAt(self:GmInstance,...args:any[]):number;
 pitch(self:GmInstance,...args:any[]):void;
 terminateWriter(self:GmInstance):number|boolean;
 nextAct(self:GmInstance):void;
 hurt(self:GmInstance):void;
 spearShot(self:GmInstance,...args:number[]):void;
 afterimage(self:GmInstance):void;
 fade(self:GmInstance,frames:number):void;
 endTurn(self:GmInstance):void;
 battleSpriteSet(self:GmInstance,actor:string,sprite:string,...args:any[]):void;
 win(self:GmInstance):void;
}
export interface HammerObjectContext {
 s:GmInstance;rt:GmRuntime;g:Record<string,any>;v:Record<string,any>;
 object(name:string):GmObjectDef;
 resolve(value:any):GmInstance;
 targets(value:any):GmInstance[];
 create(x:number,y:number,object:GmObjectDef):number;
 msg(index:number,text:string):void;
 text(key:string):string;
}
export interface HammerSceneContext extends HammerObjectContext {scripts:HammerSceneScripts;}
export const nativeSceneValue=(v:any):any=>typeof v==='boolean'?Number(v):v instanceof GmInstance?v.id:v&&typeof v==='object'&&'index'in v&&'name'in v?v.index:v;
export function sceneArgs<T extends any[]>(...values:{[K in keyof T]:()=>T[K]}):T {
 const result:any[]=[];for(let i=values.length-1;i>=0;i--)result[i]=values[i]();return result as T;
}
export function sceneEqual(a:any,b:any){a=nativeSceneValue(a);b=nativeSceneValue(b);return typeof a==='number'&&typeof b==='number'?numberEqual(a,b):a===b;}
export function sceneTruth(value:any):boolean {
 if(typeof value==='boolean')return value;
 if(typeof value==='number')return value>.5;
 throw Error(`Invalid Hammer condition ${String(value)}`);
}
export function createObjectContext(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef):HammerObjectContext {
 // The native runner defers freeing destroyed instances until this event returns.
 const captured=new Map([[s.id,s]]);
 const targets=(value:any):GmInstance[]=>{
  if(value instanceof GmInstance)return value.live?[value]:[];
  if(value&&typeof value==='object'&&'index'in value)return rt.all(value);
  if(typeof value==='number'){const i=rt.byId(value);if(i)return [i];return rt.instances.filter(i=>{if(!i.live)return false;for(let d:GmObjectDef|undefined=i.object;d;d=d.parent)if(d.index===value)return true;return false;});}
  throw Error(`Invalid Hammer instance target ${String(value)}`);
 };
 const resolve=(value:any)=>{
  // Dead IDs stay in rt.instances until this event finishes. Avoid copying the entire scene for every projectile.
  const i=value instanceof GmInstance?value:targets(value)[0]??(typeof value==='number'?captured.get(value)??rt.instances.find(i=>i.id===value):undefined);
  if(!i)throw Error(`Hammer requires instance ${value?.name??String(value)}`);return i;
 };
 const v=new Proxy(Object.create(null) as Record<string,any>,{get:(o,k)=>{if(!(k in o))throw Error(`Uninitialized Hammer scene local ${String(k)}`);return o[k as string];}});
 return {s,rt,g:rt.globals,v,object,targets,resolve,
  create:(x,y,def)=>{const i=rt.create(def,x,y);captured.set(i.id,i);return i.id;},
  msg:(index,text)=>{rt.globals.msgno=index;rt.globals.msg[index]=text;},text:sourceText};
}
export function createSceneContext(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,scripts:HammerSceneScripts):HammerSceneContext {
 return {...createObjectContext(s,rt,object),scripts};
}
