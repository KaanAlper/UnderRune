// A GameMaker runtime subset for the remake, following the Butterscotch runtime's frame loop
// (runner.c Runner_step, instance.c motion; AGPL-3.0): float32 instance fields, the same event order,
// per-object dispatch for Step/Alarm events and the same motion math.
import {f32,clamp6} from './math';
import {GmRandom} from './random';
import {GmPaths} from './paths';
import {instancesMeet} from './collision';
import type {SpriteBank,SpriteData} from './sprites';
import type {DrawState,GmGraphics} from './graphics';

export type GmEvent='create'|'destroy'|'cleanup'|'roomEnd'|'beginStep'|'step'|'endStep'|'draw'|'endDraw'|`alarm${number}`|`user${number}`|'animationEnd'|'pathEnd';
export type GmHandler=(self:GmInstance,rt:GmRuntime)=>void;
export type GmCollision={target:GmObjectDef;run:(self:GmInstance,other:GmInstance,rt:GmRuntime)=>void};
export interface GmObjectDef{
 name:string;index:number;parent?:GmObjectDef;sprite?:string;mask?:string;visible?:boolean;depth?:number;
 events?:Partial<Record<GmEvent,GmHandler>>;collisions?:GmCollision[];
}

export class GmInstance{
 // Built-in fields stored the way the reference runtime stores them (32-bit floats). Their storage names start with
 // $, which no GML variable name can, so an instance variable like NEO's _sprite never overwrites them.
 private $x=0;private $y=0;xprevious=0;yprevious=0;xstart=0;ystart=0;
 private $speed=0;private $direction=0;private $hspeed=0;private $vspeed=0;
 private $friction=0;private $gravity=0;private $gravityDirection=270;
 private $imageIndex=0;private $imageSpeed=1;imageAngle=0;private $imageXscale=1;private $imageYscale=1;private $imageAlpha=1;imageBlend=0xffffff;
 mask:string|null;visible:boolean;live=true;
 private $sprite:string|null=null;
 /** The runtime's frame counts, for sprite_index's rule below. */
 frameCount?:(sprite:string)=>number|undefined;
 get sprite(){return this.$sprite;}
 /** Setting sprite_index to another sprite resets image_index to 0 when it is past the new sprite's last frame. */
 set sprite(v:string|null){
  if(v===this.$sprite)return;this.$sprite=v;
  const n=v&&this.frameCount?this.frameCount(v):undefined;
  if(n&&n>0&&Math.trunc(this.imageIndex)>=n)this.imageIndex=0;
 }
 private $depth=0;
 /** When the instance last entered its depth: the runner puts an instance at the front of its depth layer on creation
  * and on every depth change, so among equal depths the most recent arrival draws first (underneath). */
 layerEntry=0;
 static layerEntries=0;
 get depth(){return this.$depth;}
 set depth(v:number){this.$depth=v;this.layerEntry=++GmInstance.layerEntries;}
 alarm:number[]=new Array(12).fill(-1);
 /** Object variables set by code (GML instance variables). */
 [name:string]:any;
 constructor(readonly id:number,public object:GmObjectDef,x:number,y:number){
  this.$x=f32(x);this.$y=f32(y);this.xstart=this.$x;this.ystart=this.$y;this.xprevious=this.$x;this.yprevious=this.$y;
  // Objects do not inherit their parent's sprite or mask.
  this.sprite=object.sprite??null;this.mask=object.mask??null;this.depth=object.depth??0;this.visible=object.visible??true;
  if(GmInstance.strict)return new Proxy(this,STRICT_READS);
 }
 /** GameMaker stops with "variable not set before reading it" when code reads an instance variable nothing has set.
  * With strict on (tests and development), so does the runtime: a misspelt or forgotten variable fails where it is
  * read, naming the object and the variable, instead of reading as undefined and failing somewhere else later. */
 static strict=false;
 get x(){return this.$x;}set x(v:number){this.$x=f32(v);}
 get y(){return this.$y;}set y(v:number){this.$y=f32(v);}
 get speed(){return this.$speed;}set speed(v:number){this.$speed=f32(v);this.componentsFromSpeed();}
 get direction(){return this.$direction;}
 set direction(v:number){let d=v%360;if(d<0)d+=360;this.$direction=f32(d);this.componentsFromSpeed();}
 get hspeed(){return this.$hspeed;}set hspeed(v:number){this.$hspeed=f32(v);this.speedFromComponents();}
 get vspeed(){return this.$vspeed;}set vspeed(v:number){this.$vspeed=f32(v);this.speedFromComponents();}
 get friction(){return this.$friction;}set friction(v:number){this.$friction=f32(v);}
 get gravity(){return this.$gravity;}set gravity(v:number){this.$gravity=f32(v);}
 get gravityDirection(){return this.$gravityDirection;}set gravityDirection(v:number){this.$gravityDirection=f32(v);}
 get imageIndex(){return this.$imageIndex;}set imageIndex(v:number){this.$imageIndex=f32(v);}
 get imageSpeed(){return this.$imageSpeed;}set imageSpeed(v:number){this.$imageSpeed=f32(v);}
 get imageXscale(){return this.$imageXscale;}set imageXscale(v:number){this.$imageXscale=f32(v);}
 get imageYscale(){return this.$imageYscale;}set imageYscale(v:number){this.$imageYscale=f32(v);}
 get imageAlpha(){return this.$imageAlpha;}set imageAlpha(v:number){this.$imageAlpha=f32(v);}
 /** Sets direction and speed as raw values, then the components (as move_towards_point does). */
 setMotion(direction:number,speed:number){this.$direction=f32(direction);this.$speed=f32(speed);this.componentsFromSpeed();}
 // instance.c Instance_computeComponentsFromSpeed / Instance_computeSpeedFromComponents.
 componentsFromSpeed(){
  let h=f32(this.$speed*clamp6(Math.cos(this.$direction*(Math.PI/180))));
  let v=f32(-this.$speed*clamp6(Math.sin(this.$direction*(Math.PI/180))));
  if(Math.abs(h-Math.round(h))<1e-4)h=f32(Math.round(h));
  if(Math.abs(v-Math.round(v))<1e-4)v=f32(Math.round(v));
  this.$hspeed=h;this.$vspeed=v;
 }
 speedFromComponents(){
  if(this.$hspeed===0){if(this.$vspeed>0)this.$direction=270;else if(this.$vspeed<0)this.$direction=90;}
  else{const dd=clamp6(180*Math.atan2(this.$vspeed,this.$hspeed)/Math.PI);this.$direction=f32(dd<=0?-dd:360-dd);}
  if(Math.abs(this.$direction-Math.round(this.$direction))<1e-4)this.$direction=f32(Math.round(this.$direction));
  this.$direction=f32(this.$direction%360);
  let s=f32(Math.sqrt(this.$hspeed*this.$hspeed+this.$vspeed*this.$vspeed));
  if(Math.abs(s-Math.round(s))<1e-4)s=f32(Math.round(s));
  this.$speed=s;
 }
 /** runner.c motion step: friction, gravity, then position. */
 move(adaptPath?:(self:GmInstance)=>void){
  if(this.$friction!==0){
   const ns=f32(this.$speed>0?this.$speed-this.$friction:this.$speed+this.$friction);
   if((this.$speed>0&&ns<0)||(this.$speed<0&&ns>0))this.$speed=0;else if(this.$speed!==0)this.$speed=ns;
   this.componentsFromSpeed();
  }
  if(this.$gravity!==0){
   const rad=this.$gravityDirection*(Math.PI/180);
   this.$hspeed=f32(this.$hspeed+f32(this.$gravity*clamp6(Math.cos(rad))));
   this.$vspeed=f32(this.$vspeed-f32(this.$gravity*clamp6(Math.sin(rad))));
   this.speedFromComponents();
  }
  adaptPath?.(this);
  if(this.$hspeed!==0||this.$vspeed!==0){this.$x=f32(this.$x+this.$hspeed);this.$y=f32(this.$y+this.$vspeed);}
 }
}
/** GML creates an array variable by writing an element to it (a[i] = v on an unset a): the instance's array, created
 * (by `make`) the first time. Checking with `in` does not count as reading the variable. */
/** GML built-in variable names whose runtime fields are named differently (variable_instance_get/set by name). */
const GML_BUILTINS:Readonly<Record<string,string>>={sprite_index:'sprite',mask_index:'mask',object_index:'object',image_index:'imageIndex',image_speed:'imageSpeed',
 image_xscale:'imageXscale',image_yscale:'imageYscale',image_angle:'imageAngle',image_alpha:'imageAlpha',image_blend:'imageBlend',gravity_direction:'gravityDirection'};
/** GML instance variables whose names are runtime fields, and the names the remake keeps them under. `sprite` is the
 * runtime's sprite_index, so an object's own `sprite` variable (Tasque Manager's parts, obj_animator) is `gml_sprite`. */
export const GML_RENAMED:Readonly<Record<string,string>>={sprite:'gml_sprite'};
/** The runtime field that holds the GML variable `name` (built-ins have their own names; instance variables keep theirs). */
export function gmField(name:string){return GML_BUILTINS[name]??GML_RENAMED[name]??name;}
export function gmArray<T=any>(inst:GmInstance,name:string,make:()=>T[]=()=>[]):T[]{
 if(!(name in inst))inst[name]=make();
 return inst[name];
}
/** A read of an instance variable that was never set (GmInstance.strict). */
export class GmUnsetVariableError extends Error{
 constructor(readonly objectName:string,readonly instanceId:number,readonly variable:string){
  super(`${objectName} #${instanceId} reads ${variable}, which was never set`);this.name='GmUnsetVariableError';
 }
}
const STRICT_READS:ProxyHandler<GmInstance>={
 get(target,key,receiver){
  if(typeof key==='string'&&!(key in target))throw new GmUnsetVariableError(target.object.name,target.id,key);
  return Reflect.get(target,key,receiver);
 },
};
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
 /** Encounter adapters provide source setup tables; shared battle objects remain independent of boss names. */
 battleSetup?:{monster:(self:GmInstance,rt:GmRuntime)=>boolean;encounter:(rt:GmRuntime,n:number,enemies:Record<string,GmObjectDef>)=>boolean};
 readonly paths=new GmPaths();
 private adaptPath=(i:GmInstance)=>{if(this.paths.advance(i))this.run(i,'pathEnd');};
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
 /** object_is_ancestor / instance-of: is `inst` an instance of `def` or of one of its children (aliases resolved)? */
 is(inst:GmInstance,def:GmObjectDef){return isA(inst.object,this.object(def));}
 private collisions(def:GmObjectDef){
  if(!this.objectAliases.size)return flatCollisions(def);
  let rows=this.collisionAliases.get(def);
  if(!rows){rows=flatCollisions(def).map(c=>({...c,target:this.object(c.target)})).sort((a,b)=>a.target.index-b.target.index);this.collisionAliases.set(def,rows);}
  return rows;
 }
 private frameCount:(name:string)=>number|undefined;
 view={x:0,y:0,width:640,height:480};
 /** The current room (GML room, room_width, room_height). */
 room={name:'',width:640,height:480};
 globals:Record<string,any>={};
 /** Optional host observation after an item actually executes; never part of source state or RNG. */
 onItemUsed?:(item:number)=>void;
 onBattleMode?:(mode:string)=>void;
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
 drawLineColor(x1:number,y1:number,x2:number,y2:number,color1:number,color2:number){if(!this.gfx)return;if(!this.gfx.lineColor)throw Error('Graphics backend does not support gradient lines');this.gfx.lineColor(x1,y1,x2,y2,color1,color2,this.drawState.alpha);}
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
 soundGetPitch?:(handle:number|string)=>number;
 soundFree?:(handle:number|string)=>void;
 readonly dynamicSprites=new Map<string,SpriteData>();
 private newSprites:boolean[]=[];
 /** The name sprite_create_from_surface gives a new sprite: "__newsprite<index>", the first deleted slot after the
  * game's own sprites, or a new one at the end (the runner reuses freed slots, keeping their names). */
 newSprite(width:number,height:number,originX=0,originY=0){
  let slot=this.newSprites.indexOf(false);if(slot<0)slot=this.newSprites.length;this.newSprites[slot]=true;
  const name=`__newsprite${this.spriteBase()+slot}`;
  this.dynamicSprites.set(name,{name,width,height,originX,originY,bboxMode:1,left:0,right:width-1,top:0,bottom:height-1,sepMasks:0,frames:1,special:false,playbackSpeed:1,playbackType:1});
  return name;
 }
 private spriteBase(){return [...(this.bank.names?.()??[])].length;}
 /** sprite_delete for a sprite made while running. */
 deleteSprite(name:string){const m=/^__newsprite(\d+)$/.exec(name);if(m)this.newSprites[Number(m[1])-this.spriteBase()]=false;this.dynamicSprites.delete(name);this.gfx?.spriteDelete?.(name);}
 /** sprite_create_from_surface(application_surface, 0, 0, view width, view height, ...): the last frame drawn. */
 spriteFromScreen(){const {width,height}=this.view,name=this.newSprite(width,height);this.gfx?.screenSprite?.(name,width,height);return name;}
 /** ds_* data structures (queue, list, map, stack, grid, priority): each kind numbers its own from 0 and reuses the
  * number of a destroyed one, as the runner does. A structure is held as an array. */
 private dsPools=new Map<string,(unknown[]|undefined)[]>();
 dsCreate(kind:string){let pool=this.dsPools.get(kind);if(!pool)this.dsPools.set(kind,pool=[]);let id=pool.indexOf(undefined);if(id<0)id=pool.length;pool[id]=[];return id;}
 ds(kind:string,id:number){const v=this.dsPools.get(kind)?.[id];if(!v)throw Error(`ds_${kind} ${id} does not exist`);return v;}
 dsDestroy(kind:string,id:number){const pool=this.dsPools.get(kind);if(pool?.[id])pool[id]=undefined;}
 /** string_width in the current font (0 without a renderer). */
 stringWidth(text:string){return this.gfx?.textWidth?.(this.drawState.font,text)??0;}
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
  const inst=new GmInstance(id,object,x,y);inst.frameCount=this.frameCount;
  for(const [k,v] of Object.entries(vars))inst[GML_RENAMED[k]??k]=v;
  this.instances.push(inst);this.instances.sort((a,b)=>a.id-b.id);return inst;
 }
 destroy(inst:GmInstance){if(this.destroyedInstances.has(inst))return;this.destroyedInstances.add(inst);this.run(inst,'destroy');this.run(inst,'cleanup');inst.live=false;}
 /** Battle hosts own room transitions. Room End precedes cleanup; exiting a room does not run Destroy. */
 endRoom(){
  this.dispatch('roomEnd',true);
  for(const inst of [...this.instances])if(inst.live&&!this.destroyedInstances.has(inst)){this.destroyedInstances.add(inst);this.run(inst,'cleanup');inst.live=false;}
  this.instances=[];
 }
 /** Every active instance of the object or its children, in creation order. */
 all(object:GmObjectDef){object=this.object(object);return this.instances.filter(i=>i.live&&isA(i.object,object));}
 /** GML object `with` snapshots: the runner visits one/two forwards, three or more backwards (VM PushEnv).
  * Keep this separate from creation-order queries and skip entries destroyed before their callback runs. */
 withInstances(object:GmObjectDef){const list=this.all(object);return list.length>2?list.reverse():list;}
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
  for(const i of [...this.instances])if(i.live)i.move(this.adaptPath);
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
  for(const event of ['draw','endDraw'] as const){
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
    if(!this.run(inst,event)&&event==='draw')this.drawSelf(inst);
   }
   last=depth;
  }
  }
  this.instances=this.instances.filter(i=>!this.destroyedInstances.has(i));
  this.dropConsumed();
 }
}
function mostSpecific(flat:GmCollision[],partner:GmObjectDef){
 for(let c:GmObjectDef|undefined=partner;c;c=c.parent)if(flat.some(e=>e.target===c))return c;
 return undefined;
}
