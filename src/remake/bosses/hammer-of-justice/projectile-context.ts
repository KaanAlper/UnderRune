import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import type {HammerDrawContext,HammerDrawScripts} from './draw-context';
import {createDrawContext} from './draw-context';
export interface HammerProjectileScripts extends HammerDrawScripts {
 playAt(self:GmInstance,...args:any[]):number;
 playPitch(self:GmInstance,...args:any[]):number;
 damage(self:GmInstance):void;
 triggerEvent(self:GmInstance,event:number):void;
 afterimage(self:GmInstance):number;
 debug?(self:GmInstance,message:string):void;
}
export interface HammerProjectileContext extends Omit<HammerDrawContext,'scripts'> {
 scripts:HammerProjectileScripts;
 createDepth(x:number,y:number,depth:number,object:GmObjectDef):number;
}
export function createProjectileContext(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,scripts:HammerProjectileScripts):HammerProjectileContext {
 const c=createDrawContext(s,rt,object,scripts);
 return {...c,scripts,createDepth:(x,y,depth,def)=>{const id=c.create(x,y,def);c.resolve(id).depth=depth;return id;}};
}
