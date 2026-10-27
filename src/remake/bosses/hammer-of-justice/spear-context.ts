import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {createObjectContext,sceneEqual,type HammerObjectContext,type HammerSceneScripts} from './scene-context';
export type HammerSpearAudio=Pick<HammerSceneScripts,'play'|'playAt'>;
export interface HammerSpearContext extends HammerObjectContext {
 args:number[];audio:HammerSpearAudio;
 createDepth(x:number,y:number,depth:number,object:GmObjectDef):number;
 bulletSpawner(self:GmInstance,x:number,y:number,object:GmObjectDef):number;
 heartColor(self:GmInstance,color:string|number):void;
}
export function createSpearContext(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,audio:HammerSpearAudio,args:number[]):HammerSpearContext {
 const c=createObjectContext(s,rt,object);
 return {...c,args,audio,
  createDepth:(x,y,depth,def)=>{const id=c.create(x,y,def);c.resolve(id).depth=depth;return id;},
  // Chapter 4 scr_bulletspawner. Its scratch ID is observable on the caller.
  bulletSpawner:(self,x,y,def)=>{self.__dc=c.create(x,y,def);const dc=c.resolve(self.__dc);dc.creator=self.myself;dc.creatorid=self.id;dc.target=self.mytarget;dc.damage=rt.globals.monsterat[self.myself]*5;return self.__dc;},
  // Chapter 4 scr_heartcolor, including the caller field and yellow graze sprite.
  heartColor:(self,color)=>{self.__heartcolor=color;
   if(sceneEqual(color,'red')||sceneEqual(color,0))for(const h of rt.all(object('obj_heart'))){h.color=0;h.sprite='spr_dodgeheart';}
   if(sceneEqual(color,'yellow')||sceneEqual(color,1)){for(const h of rt.all(object('obj_heart'))){h.color=1;h.sprite='spr_yellowheart';}c.resolve(object('obj_grazebox')).sprite='spr_grazeappear_yellow';}
  },
 };
}
