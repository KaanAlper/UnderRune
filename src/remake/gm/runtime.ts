// A GameMaker runtime subset for the remake, following the Butterscotch runtime's frame loop
// (runner.c Runner_step, instance.c motion; AGPL-3.0): float32 instance fields, the same event order,
// per-object dispatch for Step/Alarm events and the same motion math.
import {f32,clamp6} from './math';
import {GmRandom} from './random';

export type GmEvent='create'|'destroy'|'beginStep'|'step'|'endStep'|'draw'|`alarm${number}`|`user${number}`|'animationEnd';
export type GmHandler=(self:GmInstance,rt:GmRuntime)=>void;
export type SpriteInfo={frames:number;speedMultiplier?:number};
export interface GmObjectDef{name:string;index:number;parent?:GmObjectDef;sprite?:string;visible?:boolean;depth?:number;events?:Partial<Record<GmEvent,GmHandler>>}

export class GmInstance{
 // Built-in fields stored the way the reference runtime stores them (32-bit floats).
 private _x=0;private _y=0;xprevious=0;yprevious=0;xstart=0;ystart=0;
 private _speed=0;private _direction=0;private _hspeed=0;private _vspeed=0;
 private _friction=0;private _gravity=0;private _gravityDirection=270;
 private _imageIndex=0;private _imageSpeed=1;imageAngle=0;private _imageXscale=1;private _imageYscale=1;private _imageAlpha=1;imageBlend=0xffffff;
 sprite:string|null;depth:number;visible:boolean;live=true;destroyed=false;
 alarm:number[]=new Array(12).fill(-1);
 /** Object variables set by code (GML instance variables). */
 [name:string]:unknown;
 constructor(readonly id:number,readonly object:GmObjectDef,x:number,y:number){
  this._x=f32(x);this._y=f32(y);this.xstart=this._x;this.ystart=this._y;this.xprevious=this._x;this.yprevious=this._y;
  this.sprite=inheritedSprite(object);this.depth=object.depth??0;this.visible=object.visible??true;
 }
 get x(){return this._x;}set x(v:number){this._x=f32(v);}
 get y(){return this._y;}set y(v:number){this._y=f32(v);}
 get speed(){return this._speed;}set speed(v:number){this._speed=f32(v);this.componentsFromSpeed();}
 get direction(){return this._direction;}
 set direction(v:number){let d=v%360;if(d<0)d+=360;this._direction=f32(d);this.componentsFromSpeed();}
 get hspeed(){return this._hspeed;}set hspeed(v:number){this._hspeed=f32(v);this.speedFromComponents();}
 get vspeed(){return this._vspeed;}set vspeed(v:number){this._vspeed=f32(v);this.speedFromComponents();}
 get friction(){return this._friction;}set friction(v:number){this._friction=f32(v);}
 get gravity(){return this._gravity;}set gravity(v:number){this._gravity=f32(v);}
 get gravityDirection(){return this._gravityDirection;}set gravityDirection(v:number){this._gravityDirection=f32(v);}
 get imageIndex(){return this._imageIndex;}set imageIndex(v:number){this._imageIndex=f32(v);}
 get imageSpeed(){return this._imageSpeed;}set imageSpeed(v:number){this._imageSpeed=f32(v);}
 get imageXscale(){return this._imageXscale;}set imageXscale(v:number){this._imageXscale=f32(v);}
 get imageYscale(){return this._imageYscale;}set imageYscale(v:number){this._imageYscale=f32(v);}
 get imageAlpha(){return this._imageAlpha;}set imageAlpha(v:number){this._imageAlpha=f32(v);}
 // instance.c Instance_computeComponentsFromSpeed / Instance_computeSpeedFromComponents.
 componentsFromSpeed(){
  let h=f32(this._speed*clamp6(Math.cos(this._direction*(Math.PI/180))));
  let v=f32(-this._speed*clamp6(Math.sin(this._direction*(Math.PI/180))));
  if(Math.abs(h-Math.round(h))<1e-4)h=f32(Math.round(h));
  if(Math.abs(v-Math.round(v))<1e-4)v=f32(Math.round(v));
  this._hspeed=h;this._vspeed=v;
 }
 speedFromComponents(){
  if(this._hspeed===0){if(this._vspeed>0)this._direction=270;else if(this._vspeed<0)this._direction=90;}
  else{const dd=clamp6(180*Math.atan2(this._vspeed,this._hspeed)/Math.PI);this._direction=f32(dd<=0?-dd:360-dd);}
  if(Math.abs(this._direction-Math.round(this._direction))<1e-4)this._direction=f32(Math.round(this._direction));
  this._direction=f32(this._direction%360);
  let s=f32(Math.sqrt(this._hspeed*this._hspeed+this._vspeed*this._vspeed));
  if(Math.abs(s-Math.round(s))<1e-4)s=f32(Math.round(s));
  this._speed=s;
 }
 /** runner.c motion step: friction, gravity, then position. */
 move(){
  if(this._friction!==0){
   const ns=f32(this._speed>0?this._speed-this._friction:this._speed+this._friction);
   if((this._speed>0&&ns<0)||(this._speed<0&&ns>0))this._speed=0;else if(this._speed!==0)this._speed=ns;
   this.componentsFromSpeed();
  }
  if(this._gravity!==0){
   const rad=this._gravityDirection*(Math.PI/180);
   this._hspeed=f32(this._hspeed+f32(this._gravity*clamp6(Math.cos(rad))));
   this._vspeed=f32(this._vspeed-f32(this._gravity*clamp6(Math.sin(rad))));
   this.speedFromComponents();
  }
  if(this._hspeed!==0||this._vspeed!==0){this._x=f32(this._x+this._hspeed);this._y=f32(this._y+this._vspeed);}
 }
}
const inheritedSprite=(o:GmObjectDef|undefined):string|null=>o?o.sprite??inheritedSprite(o.parent):null;
/** The handler an object runs for an event: its own, else its nearest parent's (resolved event table). */
export function resolveEvent(o:GmObjectDef|undefined,event:GmEvent):GmHandler|undefined{for(let c=o;c;c=c.parent){const h=c.events?.[event];if(h)return h;}return undefined;}
export function isA(o:GmObjectDef,ancestor:GmObjectDef){for(let c:GmObjectDef|undefined=o;c;c=c.parent)if(c===ancestor)return true;return false;}

export class GmRuntime{
 instances:GmInstance[]=[];frame=0;nextId:number;random:GmRandom;
 view={x:0,y:0,width:640,height:480};
 globals:Record<string,unknown>={};
 constructor(readonly sprites:(name:string)=>SpriteInfo|undefined,options:{seed?:number;rng?:readonly number[];firstId?:number}={}){
  this.random=options.rng?GmRandom.restore(options.rng):new GmRandom(options.seed??0);this.nextId=options.firstId??100000;
 }
 create(object:GmObjectDef,x:number,y:number,id=this.nextId++):GmInstance{
  const inst=new GmInstance(id,object,x,y);this.instances.push(inst);
  resolveEvent(object,'create')?.(inst,this);return inst;
 }
 /** Recreate an instance from a reference snapshot without running its Create event (ids keep creation order). */
 restore(object:GmObjectDef,id:number,x:number,y:number,vars:Record<string,unknown>={}):GmInstance{
  const inst=new GmInstance(id,object,x,y);Object.assign(inst,vars);
  this.instances.push(inst);this.instances.sort((a,b)=>a.id-b.id);return inst;
 }
 destroy(inst:GmInstance){if(inst.destroyed)return;inst.destroyed=true;resolveEvent(inst.object,'destroy')?.(inst,this);inst.live=false;}
 /** `with (object)`: every active instance of the object or its children, in creation order. */
 all(object:GmObjectDef){return this.instances.filter(i=>i.live&&isA(i.object,object));}
 exists(object:GmObjectDef){return this.instances.some(i=>i.live&&isA(i.object,object));}
 first(object:GmObjectDef){return this.instances.find(i=>i.live&&isA(i.object,object));}
 userEvent(inst:GmInstance,n:number){resolveEvent(inst.object,`user${n}`)?.(inst,this);}
 // Step and Alarm events run grouped by object index (then creation order); the others in creation order.
 private dispatch(event:GmEvent,perObject:boolean){
  let list=this.instances.filter(i=>i.live&&resolveEvent(i.object,event));
  if(perObject)list=list.map((i,n)=>({i,n})).sort((a,b)=>a.i.object.index-b.i.object.index||a.n-b.n).map(e=>e.i);
  for(const inst of list)if(inst.live)resolveEvent(inst.object,event)!(inst,this);
 }
 /** One game frame, in runner.c Runner_step order. Collisions are supplied by the battle layer. */
 step(collisions?:(rt:GmRuntime)=>void){
  this.frame++;
  for(const i of this.instances)if(i.live){i.xprevious=i.x;i.yprevious=i.y;}
  for(const i of [...this.instances]){
   if(!i.live)continue;
   const info=i.sprite?this.sprites(i.sprite):undefined;
   if(!info){i.imageIndex=i.imageIndex+i.imageSpeed;continue;}
   i.imageIndex=i.imageIndex+i.imageSpeed*(info.speedMultiplier??1);
   let wrapped=false;
   if(i.imageIndex>=info.frames){i.imageIndex=i.imageIndex-info.frames;wrapped=true;}else if(i.imageIndex<0){i.imageIndex=i.imageIndex+info.frames;wrapped=true;}
   if(wrapped)resolveEvent(i.object,'animationEnd')?.(i,this);
  }
  this.dispatch('beginStep',true);
  for(let a=0;a<12;a++){
   const key=`alarm${a}` as GmEvent;
   const list=this.instances.map((i,n)=>({i,n})).filter(e=>e.i.live&&e.i.alarm[a]>0&&resolveEvent(e.i.object,key)).sort((x,y)=>x.i.object.index-y.i.object.index||x.n-y.n).map(e=>e.i);
   for(const inst of list){if(!inst.live||inst.alarm[a]<=0)continue;inst.alarm[a]--;if(inst.alarm[a]===0){inst.alarm[a]=-1;resolveEvent(inst.object,key)!(inst,this);}}
  }
  this.dispatch('step',true);
  for(const i of [...this.instances])if(i.live)i.move();
  collisions?.(this);
  this.dispatch('endStep',true);
  this.instances=this.instances.filter(i=>!i.destroyed);
 }
}
