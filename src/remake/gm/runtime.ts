// A GameMaker runtime subset for the remake, following the Butterscotch runtime's frame loop
// (runner.c Runner_step, instance.c motion; AGPL-3.0): float32 instance fields, the same event order,
// per-object dispatch for Step/Alarm events and the same motion math.
import {f32,clamp6} from './math';
import {GmRandom} from './random';
import {instancesMeet} from './collision';
import type {SpriteBank,SpriteData} from './sprites';
import type {DrawState,GmGraphics} from './graphics';

export type GmEvent='create'|'destroy'|'beginStep'|'step'|'endStep'|'draw'|`alarm${number}`|`user${number}`|'animationEnd';
export type GmHandler=(self:GmInstance,rt:GmRuntime)=>void;
export type GmCollision={target:GmObjectDef;run:(self:GmInstance,other:GmInstance,rt:GmRuntime)=>void};
export interface GmObjectDef{
 name:string;index:number;parent?:GmObjectDef;sprite?:string;mask?:string;visible?:boolean;depth?:number;
 events?:Partial<Record<GmEvent,GmHandler>>;collisions?:GmCollision[];
}

export class GmInstance{
 // Built-in fields stored the way the reference runtime stores them (32-bit floats).
 private _x=0;private _y=0;xprevious=0;yprevious=0;xstart=0;ystart=0;
 private _speed=0;private _direction=0;private _hspeed=0;private _vspeed=0;
 private _friction=0;private _gravity=0;private _gravityDirection=270;
 private _imageIndex=0;private _imageSpeed=1;imageAngle=0;private _imageXscale=1;private _imageYscale=1;private _imageAlpha=1;imageBlend=0xffffff;
 mask:string|null;visible:boolean;live=true;
 private _sprite:string|null=null;
 /** The runtime's frame counts, for sprite_index's rule below. */
 frameCount?:(sprite:string)=>number|undefined;
 get sprite(){return this._sprite;}
 /** Setting sprite_index to another sprite resets image_index to 0 when it is past the new sprite's last frame. */
 set sprite(v:string|null){
  if(v===this._sprite)return;this._sprite=v;
  const n=v&&this.frameCount?this.frameCount(v):undefined;
  if(n&&n>0&&Math.trunc(this.imageIndex)>=n)this.imageIndex=0;
 }
 private _depth=0;
 /** When the instance last entered its depth: the runner puts an instance at the front of its depth layer on creation
  * and on every depth change, so among equal depths the most recent arrival draws first (underneath). */
 layerEntry=0;
 static layerEntries=0;
 get depth(){return this._depth;}
 set depth(v:number){this._depth=v;this.layerEntry=++GmInstance.layerEntries;}
 alarm:number[]=new Array(12).fill(-1);
 /** Object variables set by code (GML instance variables). */
 [name:string]:any;
 constructor(readonly id:number,public object:GmObjectDef,x:number,y:number){
  this._x=f32(x);this._y=f32(y);this.xstart=this._x;this.ystart=this._y;this.xprevious=this._x;this.yprevious=this._y;
  // Objects do not inherit their parent's sprite or mask.
  this.sprite=object.sprite??null;this.mask=object.mask??null;this.depth=object.depth??0;this.visible=object.visible??true;
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
 /** Sets direction and speed as raw values, then the components (as move_towards_point does). */
 setMotion(direction:number,speed:number){this._direction=f32(direction);this._speed=f32(speed);this.componentsFromSpeed();}
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
/** The handler an object runs for an event: its own, else its nearest parent's (resolved event table). */
export function resolveEvent(o:GmObjectDef|undefined,event:GmEvent):GmHandler|undefined{for(let c=o;c;c=c.parent){const h=c.events?.[event];if(h)return h;}return undefined;}
export function isA(o:GmObjectDef,ancestor:GmObjectDef){for(let c:GmObjectDef|undefined=o;c;c=c.parent)if(c===ancestor)return true;return false;}
/** Own collision events plus inherited ones for other targets, by target index (runner.c flattenCollisionEvents). */
const flatCache=new WeakMap<GmObjectDef,GmCollision[]>();
function flatCollisions(o:GmObjectDef):GmCollision[]{
 let list=flatCache.get(o);if(list)return list;list=[];
 for(let c:GmObjectDef|undefined=o;c;c=c.parent)for(const e of c.collisions??[])if(!list.some(x=>x.target===e.target))list.push(e);
 list.sort((a,b)=>a.target.index-b.target.index);flatCache.set(o,list);return list;
}

/** move_towards_point: aim at a point (unrounded angle) and set the speed. */
export function moveTowardsPoint(i:GmInstance,x:number,y:number,speed:number){
 let dir=Math.atan2(-(y-i.y),x-i.x)*(180/Math.PI);if(dir<0)dir+=360;
 i.setMotion(dir,speed);
}

export interface GmInput{held:Set<number>;pressed:Set<number>;released:Set<number>}

/** An error inside an object's event, naming where it happened: the object, instance and event, the frame, and the
 * events it ran inside (an instance created from another's Step runs its Create inside that Step). */
export class GmEventError extends Error{
 readonly within:string[]=[];
 constructor(readonly where:string,readonly frame:number,readonly original:unknown){
  super('');this.name='GmEventError';this.update();
  if(original instanceof Error&&original.stack)this.stack=this.message+'\n'+original.stack.split('\n').slice(1).join('\n');
 }
 private update(){
  const reason=this.original instanceof Error?this.original.message:String(this.original);
  this.message=`${this.where}, frame ${this.frame}: ${reason}`+(this.within.length?` (inside ${this.within.join(' < ')})`:'');
 }
 static wrap(e:unknown,where:string,frame:number){
  if(e instanceof GmEventError){e.within.push(where);e.update();return e;}
  return new GmEventError(where,frame,e);
 }
}

export class GmRuntime{
 instances:GmInstance[]=[];frame=0;nextId:number;random:GmRandom;
 /** Engine lifetime must not share a name with GML variables such as NEO wireheart's `destroyed`. */
 private destroyedInstances=new WeakSet<GmInstance>();
 private objectAliases=new Map<GmObjectDef,GmObjectDef>();
 private collisionAliases=new WeakMap<GmObjectDef,GmCollision[]>();
 /** Chapter-specific definitions preserve shared source references while using native indices/parents. */
 installObjectAliases(entries:Iterable<readonly [GmObjectDef,GmObjectDef]>){
  if(this.instances.length)throw Error('Object aliases must be installed before creating instances');
  const aliases=new Map(entries);
  for(const [original,canonical] of aliases)if(original.name!==canonical.name)throw Error('Object alias identity mismatch');
  this.objectAliases=aliases;this.collisionAliases=new WeakMap();
 }
 private object(def:GmObjectDef){return this.objectAliases.get(def)??def;}
 private collisions(def:GmObjectDef){
  if(!this.objectAliases.size)return flatCollisions(def);
  let rows=this.collisionAliases.get(def);
  if(!rows){rows=flatCollisions(def).map(c=>({...c,target:this.object(c.target)})).sort((a,b)=>a.target.index-b.target.index);this.collisionAliases.set(def,rows);}
  return rows;
 }
 private frameCount:(name:string)=>number|undefined;
 view={x:0,y:0,width:640,height:480};
 room={width:640,height:480};
 globals:Record<string,any>={};
 input:GmInput={held:new Set(),pressed:new Set(),released:new Set()};
 /** Where draw calls go (absent in tests); `drawState` holds the GML draw state. */
 gfx?:GmGraphics;
 drawState:DrawState={color:0xffffff,alpha:1,font:'',halign:0,valign:0};
 /** draw_sprite_ext. */
 drawSprite(name:string|null,frame:number,x:number,y:number,xscale=1,yscale=1,angle=0,blend=0xffffff,alpha=1){
  if(this.gfx&&name)this.gfx.sprite(name,frame,x,y,xscale,yscale,angle,blend,alpha);
 }
 /** The source's d3d fog at depth zero replaces sprite RGB while retaining its alpha mask. */
 drawSpriteFog(name:string,frame:number,x:number,y:number,xscale=1,yscale=1,angle=0,color=0xffffff,alpha=1){
  if(!this.gfx)return;if(!this.gfx.spriteFog)throw Error('Graphics backend does not support sprite fog');this.gfx.spriteFog(name,frame,x,y,xscale,yscale,angle,color,alpha);
 }
 /** draw_background_tiled_ext (GameMaker 2 stores backgrounds as sprites). */
 drawSpriteTiled(name:string,x:number,y:number,xscale=1,yscale=1,blend=0xffffff,alpha=1){
  if(!this.gfx)return;if(!this.gfx.spriteTiled)throw Error('Graphics backend does not support tiled sprites');this.gfx.spriteTiled(name,x,y,xscale,yscale,blend,alpha);
 }
 /** draw_self: the instance's sprite with its own frame, scale, angle, blend and alpha. */
 drawSelf(i:GmInstance){this.drawSprite(i.sprite,i.imageIndex,i.x,i.y,i.imageXscale,i.imageYscale,i.imageAngle,i.imageBlend,i.imageAlpha);}
 drawSpritePart(name:string,frame:number,left:number,top:number,width:number,height:number,x:number,y:number,xscale=1,yscale=1,blend=0xffffff,alpha=1){
  if(!this.gfx)return;if(!this.gfx.spritePart)throw Error('Graphics backend does not support sprite parts');
  this.gfx.spritePart(name,frame,left,top,width,height,x,y,xscale,yscale,blend,alpha);
 }
 drawRect(x1:number,y1:number,x2:number,y2:number,outline=false){this.gfx?.rect(x1,y1,x2,y2,this.drawState.color,this.drawState.alpha,outline);}
 drawLine(x1:number,y1:number,x2:number,y2:number,width?:number){if(!this.gfx)return;if(!this.gfx.line)throw Error('Graphics backend does not support line drawing');if(width===undefined)this.gfx.line(x1,y1,x2,y2,this.drawState.color,this.drawState.alpha);else this.gfx.line(x1,y1,x2,y2,this.drawState.color,this.drawState.alpha,width);}
 drawCircle(x:number,y:number,r:number,outline=false){this.gfx?.circle(x,y,r,this.drawState.color,this.drawState.alpha,outline);}
 drawTriangle(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,outline=false){if(!this.gfx)return;if(!this.gfx.triangle)throw Error('Renderer lacks source triangles');this.gfx.triangle(x1,y1,x2,y2,x3,y3,this.drawState.color,this.drawState.alpha,outline);}
 drawText(x:number,y:number,text:string,xscale=1,yscale=1,angle=0){
  const d=this.drawState;this.gfx?.text(x,y,text,{font:d.font,color:d.color,alpha:d.alpha,halign:d.halign,valign:d.valign,xscale,yscale,angle});
 }
 /** draw_text_color with the top colour at the top and the bottom colour at the bottom of the glyphs. */
 drawTextColor(x:number,y:number,text:string,top:number,bottom:number,alpha:number){
  const d=this.drawState;this.gfx?.text(x,y,text,{font:d.font,color:top,colorBottom:bottom,alpha,halign:d.halign,valign:d.valign,xscale:1,yscale:1,angle:0});
 }
 /** Sound hooks; the game logic never waits on them. */
 sound?:(name:string,pitch?:number,restart?:boolean)=>void;
 stopAllSounds?:()=>void;
 soundLoop?:(name:string)=>number|undefined;
 soundStop?:(handle:number|string)=>void;
 soundPitch?:(handle:number|string,pitch:number)=>void;
 readonly dynamicSprites=new Map<string,SpriteData>();
 sourceSurfaces?:{create:(width:number,height:number)=>number;target:(id:number|null)=>void;clear:(color:number,alpha:number)=>void;capture:(id:number,left:number,top:number,width:number,height:number,originX:number,originY:number)=>string;free:(id:number)=>void;deleteSprite:(name:string)=>void};
 sourceAudio?:{effect:(name:string,pitch?:number,volume?:number)=>number|undefined;volume:(handle:number|string,value:number,frames:number)=>void;free:(handle:number|string)=>void;music:(name:string)=>number|string;loop:(handle:number|string)=>void;pause:(handle:number|string)=>void;resume:(handle:number|string)=>void;position:(handle:number|string,seconds?:number)=>number|void;playing:(handle:number|string)=>boolean};
 /** Set by room_goto; the host decides what the room change means (game over, battle end). */
 pendingRoom:string|null=null;
 constructor(readonly bank:SpriteBank,options:{seed?:number;rng?:readonly number[];firstId?:number}={}){
  const sourceBank=bank;this.bank={...bank,get:name=>this.dynamicSprites.get(name)??sourceBank.get(name)};
  this.random=options.rng?GmRandom.restore(options.rng):new GmRandom(options.seed??0);this.nextId=options.firstId??100000;
  this.frameCount=name=>this.bank.get(name)?.frames;
 }
 create(object:GmObjectDef,x:number,y:number,id=this.nextId++):GmInstance{
  object=this.object(object);
  const inst=new GmInstance(id,object,x,y);inst.frameCount=this.frameCount;this.instances.push(inst);
  this.run(inst,'create');return inst;
 }
 /** Recreate an instance from a reference snapshot without running its Create event (ids keep creation order). */
 restore(object:GmObjectDef,id:number,x:number,y:number,vars:Record<string,unknown>={}):GmInstance{
  object=this.object(object);
  const inst=new GmInstance(id,object,x,y);inst.frameCount=this.frameCount;Object.assign(inst,vars);
  this.instances.push(inst);this.instances.sort((a,b)=>a.id-b.id);return inst;
 }
 destroy(inst:GmInstance){if(this.destroyedInstances.has(inst))return;this.destroyedInstances.add(inst);this.run(inst,'destroy');inst.live=false;}
 /** `with (object)`: every active instance of the object or its children, in creation order. */
 all(object:GmObjectDef){object=this.object(object);return this.instances.filter(i=>i.live&&isA(i.object,object));}
 exists(object:GmObjectDef){object=this.object(object);return this.instances.some(i=>i.live&&isA(i.object,object));}
 first(object:GmObjectDef){object=this.object(object);return this.instances.find(i=>i.live&&isA(i.object,object));}
 count(object:GmObjectDef){return this.all(object).length;}
 /** An instance by id (GML instance ids stored in variables), if it is still active. */
 byId(id:number){return this.instances.find(i=>i.id===id&&i.live);}
 /** sprite_width / sprite_height: the sprite's size times the instance's scale. */
 spriteWidth(i:GmInstance){const s=i.sprite?this.bank.get(i.sprite):undefined;return s?s.width*i.imageXscale:0;}
 spriteHeight(i:GmInstance){const s=i.sprite?this.bank.get(i.sprite):undefined;return s?s.height*i.imageYscale:0;}
 userEvent(inst:GmInstance,n:number){this.run(inst,`user${n}`);}
 /** Runs one of an instance's events (its own or its parent's handler); errors say where they happened. */
 private run(inst:GmInstance,event:GmEvent,handler=resolveEvent(inst.object,event),label:string=event){
  if(!handler)return false;
  try{handler(inst,this);}catch(e){throw GmEventError.wrap(e,`${inst.object.name} #${inst.id} ${label}`,this.frame);}
  return true;
 }
 /** place_meeting: would `inst` at (x, y) touch any instance of `target`? */
 placeMeeting(inst:GmInstance,x:number,y:number,target:GmObjectDef){
  target=this.object(target);
  const sx=inst.x,sy=inst.y;inst.x=x;inst.y=y;
  let found=false;
  for(const o of this.instances)if(o.live&&o!==inst&&isA(o.object,target)&&instancesMeet(this.bank,inst,o)){found=true;break;}
  inst.x=sx;inst.y=sy;return found;
 }
 // Step and Alarm events run grouped by object index (then creation order); the others in creation order.
 private dispatch(event:GmEvent,perObject:boolean){
  let list=this.instances.filter(i=>i.live&&resolveEvent(i.object,event));
  if(perObject)list=list.map((i,n)=>({i,n})).sort((a,b)=>a.i.object.index-b.i.object.index||a.n-b.n).map(e=>e.i);
  for(const inst of list)if(inst.live)this.run(inst,event);
 }
 private animate(){
  for(const i of [...this.instances]){
   if(!i.live)continue;
   const s=i.sprite?this.bank.get(i.sprite):undefined;
   if(!s){i.imageIndex=i.imageIndex+i.imageSpeed;continue;}
   if(!s.special)i.imageIndex=i.imageIndex+i.imageSpeed;
   else if(s.playbackType===1)i.imageIndex=i.imageIndex+f32(i.imageSpeed*s.playbackSpeed);
   else i.imageIndex=i.imageIndex+(1/this.bank.roomSpeed)*s.playbackSpeed*i.imageSpeed;
   let wrapped=false;
   if(i.imageIndex>=s.frames){i.imageIndex=i.imageIndex-s.frames;wrapped=true;}else if(i.imageIndex<0){i.imageIndex=i.imageIndex+s.frames;wrapped=true;}
   if(wrapped)this.run(i,'animationEnd');
  }
 }
 /** runner.c dispatchCollisionEvents: objects by first target then index; each pair fires its most specific event. */
 private collide(){
  const objects=[...new Set(this.instances.filter(i=>i.live).map(i=>i.object))].filter(o=>this.collisions(o).length)
   .sort((a,b)=>this.collisions(a)[0].target.index-this.collisions(b)[0].target.index||a.index-b.index);
  for(const obj of objects){
   const flat=this.collisions(obj);
   for(const self of this.instances.filter(i=>i.object===obj)){
    if(!self.live)continue;
    for(const evt of flat){
     const others=this.instances.filter(i=>isA(i.object,evt.target)).sort((a,b)=>a.object.index-b.object.index||a.id-b.id);
     for(const other of others){
      if(!other.live||other===self)continue;
      if(mostSpecific(flat,other.object)!==evt.target)continue;
      if(!instancesMeet(this.bank,self,other))continue;
      try{evt.run(self,other,this);}catch(e){throw GmEventError.wrap(e,`${self.object.name} #${self.id} collision with ${other.object.name} #${other.id}`,this.frame);}
     }
    }
   }
  }
 }
 /** One game frame of logic, in runner.c Runner_step order. */
 step(){
  this.dropConsumed();
  this.frame++;
  for(const i of this.instances)if(i.live){i.xprevious=i.x;i.yprevious=i.y;}
  this.animate();
  this.dispatch('beginStep',true);
  for(let a=0;a<12;a++){
   const key=`alarm${a}` as GmEvent;
   const list=this.instances.map((i,n)=>({i,n})).filter(e=>e.i.live&&e.i.alarm[a]>0&&resolveEvent(e.i.object,key)).sort((x,y)=>x.i.object.index-y.i.object.index||x.n-y.n).map(e=>e.i);
   for(const inst of list){if(!inst.live||inst.alarm[a]<=0)continue;inst.alarm[a]--;if(inst.alarm[a]===0){inst.alarm[a]=-1;this.run(inst,key);}}
  }
  this.dispatch('step',true);
  for(const i of [...this.instances])if(i.live)i.move();
  this.collide();
  this.dispatch('endStep',true);
  this.instances=this.instances.filter(i=>!this.destroyedInstances.has(i));
  // Presses and releases stay visible to this frame's Draw (the writer reads button1_p there), then go.
  this.consumed={pressed:new Set(this.input.pressed),released:new Set(this.input.released)};
 }
 /** Presses a step has seen: cleared after the following draw, or at the next step if no draw ran. */
 private consumed={pressed:new Set<number>(),released:new Set<number>()};
 private dropConsumed(){for(const k of this.consumed.pressed)this.input.pressed.delete(k);for(const k of this.consumed.released)this.input.released.delete(k);this.consumed.pressed.clear();this.consumed.released.clear();}
 /** Draw events by depth layer (deepest first); within a layer the most recent arrival first. Draw code may use the
  * random generator. As in the runner, layers are visited one after another and each is read as it is at that moment:
  * an instance that moves to (or is created in) a layer not yet drawn this frame is drawn there, even if it was
  * already drawn in another layer; one leaving the layer being drawn shifts the rest. */
 draw(){
  let last=Infinity;
  for(;;){
   let depth=-Infinity;
   for(const i of this.instances)if(i.live&&i.depth<last&&i.depth>depth)depth=i.depth;
   if(depth===-Infinity)break;
   // Instances destroyed during this frame keep their place in the layer until cleanup, without drawing.
   const layer=()=>this.instances.filter(i=>i.depth===depth&&(i.live||this.destroyedInstances.has(i))).sort((a,b)=>b.layerEntry-a.layerEntry);
   const count=layer().length;
   for(let j=0;j<count;j++){
    const els=layer();if(j>=els.length)break;
    const inst=els[j];if(!inst.live||!inst.visible)continue;
    if(!this.run(inst,'draw'))this.drawSelf(inst);
   }
   last=depth;
  }
  this.instances=this.instances.filter(i=>!this.destroyedInstances.has(i));
  this.dropConsumed();
 }
}
function mostSpecific(flat:GmCollision[],partner:GmObjectDef){
 for(let c:GmObjectDef|undefined=partner;c;c=c.parent)if(flat.some(e=>e.target===c))return c;
 return undefined;
}
