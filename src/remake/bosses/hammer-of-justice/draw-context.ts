import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {eq,ge} from '../../gm/math';
import {createObjectContext,type HammerObjectContext,type HammerSceneScripts} from './scene-context';
export type HammerDrawScripts=Pick<HammerSceneScripts,'play'|'stop'|'shakeObject'>&{tensionHeal(self:GmInstance,value:number):void};
type SpriteArgs=[string|null,number,number,number,number,number,number,number,number];
export interface HammerDrawContext extends HammerObjectContext {
 scripts:HammerDrawScripts;
 drawSprite(...args:SpriteArgs):void;
 flashSprite(...args:SpriteArgs):void;
 fog(enabled:boolean|number,color:number,...unused:number[]):void;
 drawBody(self:GmInstance,sprite:string,frame:number,x:number,y:number):void;
 drawHurt(self:GmInstance):void;
 drawIdle(self:GmInstance,rate:number):void;
}
export function createDrawContext(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef,scripts:HammerDrawScripts):HammerDrawContext {
 let fogColor:number|undefined;
 const drawSprite=(...args:SpriteArgs)=>{if(fogColor===undefined)rt.drawSprite(...args);else{const [sprite,frame,x,y,xs,ys,angle,_blend,alpha]=args;if(sprite!==null)rt.drawSpriteFog(sprite,frame,x,y,xs,ys,angle,fogColor,alpha);}};
 const flashSprite=(...args:SpriteArgs)=>{const [sprite,frame,x,y,xs,ys,angle,color,alpha]=args;if(sprite!==null)rt.drawSpriteFog(sprite,frame,x,y,xs,ys,angle,color,alpha);};
 const drawBody=(self:GmInstance,sprite:string,frame:number,x:number,y:number)=>{
  drawSprite(sprite,frame,x,y,self.imageXscale,self.imageYscale,self.imageAngle,self.imageBlend,self.imageAlpha);
  if(eq(self.flash,1))flashSprite(sprite,frame,x,y,self.imageXscale,self.imageYscale,self.imageAngle,0xffffff,-Math.cos(self.fsiner/5)*.4+.6);
 };
 return {...createObjectContext(s,rt,object),scripts,drawSprite,flashSprite,drawBody,
  fog:(enabled,color)=>{fogColor=enabled?color:undefined;},
  // Chapter 4 advances hurt timing in Step. Draw must not advance it a second time.
  drawHurt:self=>{if(eq(self.state,3)&&ge(self.hurttimer,0))drawSprite(self.hurtsprite,0,self.x+self.shakex+self.hurtspriteoffx,self.y+self.hurtspriteoffy,2,2,0,self.imageBlend,1);},
  drawIdle:(self,rate)=>{if(!eq(self.state,0))return;self.fsiner++;self.siner+=rate;self.thissprite=self.idlesprite;if(ge(rt.globals.mercymod[self.myself],rt.globals.mercymax[self.myself]))self.thissprite=self.sparedsprite;drawBody(self,self.thissprite,self.siner,self.x,self.y);},
 };
}
