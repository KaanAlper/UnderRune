/** Strict adapter for the archived NEO events. Object lookups are lazy and canonical;
 * absent scripts/objects/fields throw at the source operation that requires them. */
import {executeGml,parseGml,type GmlProgram} from '../../../source-runtime/gml';
import {GmInstance,resolveEvent,moveTowardsPoint,type GmEvent,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {eq,ge,gt,le,lt,round,lengthdirX,lengthdirY,pointDirection,pointDistance} from '../../gm/math';
import {rectangleMeets,instancesMeet} from '../../gm/collision';

export interface NeoSourceHost{
 object(name:string):GmObjectDef;
 objectIndex?(index:number):GmObjectDef|undefined;
 text(key:string):string;
 /** Only for external battle/menu/audio integrations; never an optional no-op. */
 call(name:string,self:GmInstance,rt:GmRuntime,args:any[]):any;
 scripts?:Readonly<Record<string,string>>;
 room?:string;
}
export interface NeoSourceMetadata {name:string;index:number;parent?:string|null;sprite?:string|null;mask?:string|null;depth?:number;visible?:boolean;solid?:boolean;}
type Compiled={program:GmlProgram;arrays:Set<string>;memberArrays:Set<string>;calls:Set<string>};
const cache=new Map<string,Compiled>();
function compile(source:string):Compiled{
 let entry=cache.get(source);if(entry)return entry;
 const program=parseGml(source),arrays=new Set<string>(),memberArrays=new Set<string>(),calls=new Set<string>();
 const walk=(node:any)=>{
  if(!node||typeof node!=='object')return;
  if(node.kind==='assign'&&node.left.kind==='member'&&node.left.object.kind==='identifier'&&(node.left.key.kind!=='literal'||typeof node.left.key.value==='number'))arrays.add(node.left.object.name);
  if(node.kind==='assign'&&node.left.kind==='member'&&node.left.object.kind==='member'&&node.left.object.key.kind==='literal'&&typeof node.left.object.key.value==='string')memberArrays.add(node.left.object.key.value);
  if(node.kind==='call'&&node.callee.kind==='identifier')calls.add(node.callee.name);
  for(const v of Object.values(node)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
 };walk(program);entry={program,arrays,memberArrays,calls};cache.set(source,entry);return entry;
}
const aliases:Record<string,string>={sprite_index:'sprite',mask_index:'mask',object_index:'object',image_index:'imageIndex',image_speed:'imageSpeed',image_xscale:'imageXscale',image_yscale:'imageYscale',image_angle:'imageAngle',image_alpha:'imageAlpha',image_blend:'imageBlend',gravity_direction:'gravityDirection'};
const rawInstance=new WeakMap<object,GmInstance>();
const native=(v:any):any=>typeof v==='object'&&v!==null?(rawInstance.get(v)?.id??('events' in v||'index' in v&&'name' in v?v.index:v)):v;
const equal=(a:any,b:any)=>typeof native(a)==='number'&&typeof native(b)==='number'?eq(native(a),native(b)):native(a)===native(b);
const operators={ '==':equal,'!=':(a:any,b:any)=>!equal(a,b),'<>':(a:any,b:any)=>!equal(a,b),'<':(a:any,b:any)=>lt(native(a),native(b)),'>':(a:any,b:any)=>gt(native(a),native(b)),'<=':(a:any,b:any)=>le(native(a),native(b)),'>=':(a:any,b:any)=>ge(native(a),native(b))};
const isDef=(v:any):v is GmObjectDef=>!!v&&typeof v==='object'&&typeof v.name==='string'&&typeof v.index==='number';
const substitute=(text:string,args:any[])=>text.replace(/~(\d+)/g,(_,n)=>String(args[Number(n)-1]));

/** Executes Draw as logic too: release timers, wireheart creation and strings must run in headless tests. */
export function executeNeoSource(source:string,s:GmInstance,rt:GmRuntime,host:NeoSourceHost,other?:GmInstance,event?:GmEvent,args?:any[],entryName?:string):any{
 const compiled=compile(source),proxies=new WeakMap<GmInstance,Record<string,any>>(),arrays=new WeakMap<any[],any[]>();
 // Native destruction is deferred until the current event finishes. Existence is
 // already false, but the captured self/other and IDs from this event remain readable.
 const eventInstances=new Map(rt.instances.filter(i=>i.live).map(i=>[i.id,i]));eventInstances.set(s.id,s);if(other)eventInstances.set(other.id,other);
 const array=(a:any[]):any[]=>{let p=arrays.get(a);if(p)return p;p=new Proxy(a,{set:(o,k,v)=>{if(typeof k==='string'&&/^\d+$/.test(k)){const index=Number(k);if(index>1000000)throw Error('NEO source array exceeds native adapter limit');for(let i=o.length;i<index;i++)o[i]=0;}return Reflect.set(o,k,v);}});arrays.set(a,p);return p;};
 const targets=(v:any):GmInstance[]=>{
  const raw=v&&typeof v==='object'?rawInstance.get(v):undefined;
  if(raw)return raw.live?[raw]:[];if(v instanceof GmInstance)return v.live?[v]:[];
  if(isDef(v))return rt.all(v);if(typeof v==='number'){const def=v>=0&&v<100000?host.objectIndex?.(v):undefined;if(def)return rt.all(def);const i=rt.byId(v);return i?[i]:[];}
  if(v===null||v===undefined)return [];throw Error(`NEO invalid instance target ${String(v)}`);
 };
 const instance=(v:any)=>{const captured=v&&typeof v==='object'?rawInstance.get(v):undefined;const i=captured??(v instanceof GmInstance?v:targets(v)[0]??(typeof v==='number'?eventInstances.get(v):undefined));if(!i)throw Error(`NEO source requires live instance ${isDef(v)?v.name:String(v)}`);return i;};
 const proxy=(i:GmInstance):Record<string,any>=>{
  let p=proxies.get(i);if(p)return p;
  p=new Proxy(i,{
   has:(o,k)=>typeof k==='string'?(k in o||k in aliases||compiled.memberArrays.has(k)||['sprite_width','sprite_height','image_number','bbox_left','bbox_right','bbox_top','bbox_bottom'].includes(k)):k in o,
   get:(o,k)=>{
    if(typeof k==='string'&&compiled.memberArrays.has(k)&&!(k in o))o[k]=[];
    if(k===Symbol.toPrimitive)return ()=>o.id;if(k==='sprite_width')return rt.spriteWidth(o);if(k==='sprite_height')return rt.spriteHeight(o);
    if(k==='image_number'){if(!o.sprite)return 0;const sp=rt.bank.get(o.sprite);if(!sp)throw Error(`NEO missing sprite ${o.sprite}`);return sp.frames;}
    if(typeof k==='string'&&k.startsWith('bbox_')){
     const sp=o.mask?rt.bank.get(o.mask):o.sprite?rt.bank.get(o.sprite):undefined;if(!sp)throw Error(`NEO missing collision sprite ${o.mask??o.sprite}`);
     const l=o.x+(sp.left-sp.originX)*o.imageXscale,r=o.x+(sp.right-sp.originX)*o.imageXscale,t=o.y+(sp.top-sp.originY)*o.imageYscale,b=o.y+(sp.bottom-sp.originY)*o.imageYscale;
     return k==='bbox_left'?Math.min(l,r):k==='bbox_right'?Math.max(l,r):k==='bbox_top'?Math.min(t,b):Math.max(t,b);
    }
    const key=typeof k==='string'?aliases[k]??k:k,value=Reflect.get(o,key,o);
    if((k==='sprite_index'||k==='mask_index')&&value===null)return -1;return value;
   },
   set:(o,k,v)=>{const key=typeof k==='string'?aliases[k]??k:k;return Reflect.set(o,key,(key==='sprite'||key==='mask')&&v===-1?null:rawInstance.get(v)?.id??v,o);},
  });proxies.set(i,p);rawInstance.set(p,i);return p;
 };
 // GML's assigned arrays are created by indexed writes, whose extension zero-fills
 // the preceding entries. Missing reads never grow arrays or substitute a value.
 for(const key of compiled.arrays)if(!(key in s)&&!['global','argument'].includes(key))s[key]=[];
 const sprite=(name:string)=>{const data=rt.bank.get(name);if(!data)throw Error(`NEO missing source sprite ${name}`);return data;};
 let fog:number|undefined;
 const drawSprite=(name:string,frame:number,x:number,y:number,xs:number,ys:number,angle:number,color:number,alpha:number)=>{
  if(name===null||name as any===-1)return;
  if(fog!==undefined)rt.drawSpriteFog(name,frame,x,y,xs,ys,angle,fog,alpha);else rt.drawSprite(name,frame,x,y,xs,ys,angle,color,alpha);
 };
 const builtins:Record<string,(self:Record<string,any>,...args:any[])=>any>={
  abs:(_s,v)=>Math.abs(v),sin:(_s,v)=>Math.sin(v),cos:(_s,v)=>Math.cos(v),floor:(_s,v)=>Math.floor(v),ceil:(_s,v)=>Math.ceil(v),round:(_s,v)=>round(v),min:(_s,...v)=>Math.min(...v),max:(_s,...v)=>Math.max(...v),clamp:(_s,v,a,b)=>Math.max(a,Math.min(b,v)),lerp:(_s,a,b,t)=>a+(b-a)*t,sqrt:(_s,v)=>Math.sqrt(v),power:(_s,a,b)=>a**b,sign:(_s,v)=>Math.sign(v),degtorad:(_s,v)=>v*Math.PI/180,
  random:(_s,v)=>rt.random.random(v),random_range:(_s,a,b)=>rt.random.randomRange(a,b),irandom:(_s,v)=>rt.random.irandom(v),irandom_range:(_s,a,b)=>rt.random.irandomRange(a,b),choose:(_s,...v)=>rt.random.choose(...v),
  point_direction:(_s,a,b,c,d)=>pointDirection(a,b,c,d),point_distance:(_s,a,b,c,d)=>pointDistance(a,b,c,d),lengthdir_x:(_s,a,b)=>lengthdirX(a,b),lengthdir_y:(_s,a,b)=>lengthdirY(a,b),distance_to_point:(p,x,y)=>pointDistance(p.x,p.y,x,y),
  move_towards_point:(p,x,y,speed)=>moveTowardsPoint(instance(p),x,y,speed),
  arcsin:(_s,v)=>Math.asin(v),
  string:(_s,v)=>String(native(v)),ord:(_s,v)=>String(v).charCodeAt(0),make_colour_rgb:(_s,r,g,b)=>(r&255)|((g&255)<<8)|((b&255)<<16),make_color_rgb:(_s,r,g,b)=>(r&255)|((g&255)<<8)|((b&255)<<16),
  merge_color:(_s,a,b,t)=>{let c=0;for(let n=0;n<3;n++)c|=Math.trunc(((a>>>(8*n))&255)*(1-t)+((b>>>(8*n))&255)*t)<<(8*n);return c;},
  sprite_get_xoffset:(_s,n)=>sprite(n).originX,sprite_get_yoffset:(_s,n)=>sprite(n).originY,sprite_get_width:(_s,n)=>sprite(n).width,sprite_get_height:(_s,n)=>sprite(n).height,sprite_get_number:(_s,n)=>sprite(n).frames,
  sprite_exists:(_s,n)=>!!rt.bank.get(n),
  ds_map_find_value:(_s,map,key)=>{if(map instanceof Map){if(!map.has(key))throw Error(`Missing source resource map key ${key}`);return map.get(key);}if(!(key in map))throw Error(`Missing source resource map key ${key}`);return map[key];},
  instance_create:(_s,x,y,d)=>{if(!isDef(d))throw Error('NEO instance_create requires canonical object');return rt.create(d,x,y).id;},
  instance_create_depth:(_s,x,y,depth,d)=>{if(!isDef(d))throw Error('NEO instance_create_depth requires canonical object');const i=rt.create(d,x,y);i.depth=depth;return i.id;},
  instance_exists:(_s,v)=>targets(v).length>0,i_ex:(_s,v)=>targets(v).length>0,instance_number:(_s,v)=>targets(v).length,instance_find:(_s,v,n)=>targets(v)[n]?.id??-4,
  instance_destroy:(p,v)=>{for(const i of targets(v??rawInstance.get(p)))rt.destroy(i);},
  place_meeting:(p,x,y,target)=>{if(!isDef(target))throw Error('NEO place_meeting requires a source object');return rt.placeMeeting(instance(p),x,y,target);},
  instance_place:(p,x,y,target)=>{const self=instance(p);return targets(target).find(o=>instancesMeet(rt.bank,{...self,x,y,sprite:self.sprite,mask:self.mask,imageAngle:self.imageAngle,imageXscale:self.imageXscale,imageYscale:self.imageYscale,imageIndex:self.imageIndex},o))?.id??-4;},
  instance_nearest:(_p,x,y,target)=>targets(target).reduce<GmInstance|undefined>((nearest,o)=>!nearest||pointDistance(x,y,o.x,o.y)<pointDistance(x,y,nearest.x,nearest.y)?o:nearest,undefined)?.id??-4,
  collision_rectangle:(p,x1,y1,x2,y2,target,precise,notme)=>targets(target).find(o=>(!notme||o!==instance(p))&&rectangleMeets(rt.bank,o,x1,y1,x2,y2,!!precise))?.id??-4,
  left_h:()=>rt.input.held.has(37),right_h:()=>rt.input.held.has(39),up_h:()=>rt.input.held.has(38),down_h:()=>rt.input.held.has(40),
  event_user:(p,n)=>{const i=instance(p),h=resolveEvent(i.object,`user${n}`);if(!h)throw Error(`${i.object.name} missing source user${n}`);h(i,rt);},
  event_inherited:p=>{if(!event)throw Error('NEO inherited event lacks dispatch context');const i=instance(p),h=i.object.parent&&resolveEvent(i.object.parent,event);h?.(i,rt);},
  keyboard_check_pressed:(_s,k)=>rt.input.pressed.has(k),keyboard_check_released:(_s,k)=>rt.input.released.has(k),keyboard_check:(_s,k)=>rt.input.held.has(k),
  button1_p:()=>rt.input.pressed.has(90)||rt.input.pressed.has(13),button2_p:()=>rt.input.pressed.has(88)||rt.input.pressed.has(16),button3_p:()=>rt.input.pressed.has(67)||rt.input.pressed.has(17),
  button1_h:()=>rt.input.held.has(90)||rt.input.held.has(13),button1_r:()=>rt.input.released.has(90)||rt.input.released.has(13),button2_h:()=>rt.input.held.has(88)||rt.input.held.has(16),
  button3_h:()=>rt.input.held.has(67)||rt.input.held.has(17),
  surface_create:(_s,w,h)=>rt.sourceSurfaces!.create(w,h),surface_set_target:(_s,id)=>rt.sourceSurfaces!.target(id),surface_reset_target:()=>rt.sourceSurfaces!.target(null),surface_free:(_s,id)=>rt.sourceSurfaces!.free(id),draw_clear_alpha:(_s,c,a)=>rt.sourceSurfaces!.clear(c,a),
  sprite_create_from_surface:(_s,id,l,t,w,h,_remove,_smooth,ox,oy)=>rt.sourceSurfaces!.capture(id,l,t,w,h,ox,oy),sprite_delete:(_s,name)=>rt.sourceSurfaces!.deleteSprite(name),
  // Native gamepad input is normalized into the same frame input by the host.
  gamepad_button_check_pressed:(_s,_pad,button)=>rt.input.pressed.has(button),
  camerax:()=>rt.view.x,cameray:()=>rt.view.y,camerawidth:()=>rt.view.width,cameraheight:()=>rt.view.height,__view_get:(_s,key)=>key===0?rt.view.x:key===1?rt.view.y:key===2?rt.view.width:key===3?rt.view.height:(()=>{throw Error(`NEO unsupported view field ${key}`);})(),
  draw_set_color:(_s,c)=>{rt.drawState.color=c;},draw_set_colour:(_s,c)=>{rt.drawState.color=c;},draw_set_alpha:(_s,a)=>{rt.drawState.alpha=a;},draw_set_font:(_s,v)=>{rt.drawState.font=v;},draw_set_halign:(_s,v)=>{rt.drawState.halign=v;},draw_set_valign:(_s,v)=>{rt.drawState.valign=v;},
  draw_get_alpha:()=>rt.drawState.alpha,draw_get_color:()=>rt.drawState.color,
  draw_triangle:(_s,x1,y1,x2,y2,x3,y3,outline)=>rt.drawTriangle(x1,y1,x2,y2,x3,y3,!!outline),
  d3d_set_fog:(_s,on,c)=>{fog=on?c:undefined;},draw_sprite_ext:(_s,...a)=>drawSprite(...a as [string,number,number,number,number,number,number,number,number]),draw_self:p=>rt.drawSelf(instance(p)),
  draw_line_width:(_s,a,b,c,d,w)=>rt.drawLine(a,b,c,d,w),draw_line:(_s,a,b,c,d)=>rt.drawLine(a,b,c,d),draw_circle:(_s,a,b,r,o)=>rt.drawCircle(a,b,r,!!o),draw_rectangle:(_s,a,b,c,d,o)=>rt.drawRect(a,b,c,d,!!o),
  draw_sprite:(_s,n,f,x,y)=>drawSprite(n,f,x,y,1,1,0,C.white,1),draw_text:(_s,x,y,t)=>rt.drawText(x,y,String(t)),
  draw_sprite_part_ext:(_s,...a)=>rt.drawSpritePart(...a as [string,number,number,number,number,number,number,number,number,number,number,number]),
  draw_monster_body_part_ext:(p,...a)=>{drawSprite(...a as [string,number,number,number,number,number,number,number,number]);if(eq(p.flash,1))rt.drawSpriteFog(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],-Math.cos(p.fsiner/5)*.4+.6);},
  draw_sprite_ext_flash:(_s,...a)=>rt.drawSpriteFog(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8]),
  stringsetloc:(_s,_fallback,key)=>host.text(key),stringsetsubloc:(_s,_fallback,...a)=>substitute(host.text(a.pop()),a),
  msgset:(_s,n,t)=>{rt.globals.msgno=n;rt.globals.msg[n]=t;},msgsetloc:(_s,n,_fallback,key)=>{rt.globals.msgno=n;rt.globals.msg[n]=host.text(key);},msgsetsubloc:(_s,n,_fallback,...a)=>{rt.globals.msgno=n;rt.globals.msg[n]=substitute(host.text(a.pop()),a);},
  msgnextloc:(_s,_fallback,key)=>{const g=rt.globals;g.msgno++;g.msg[g.msgno]=host.text(key);},
  scr_sideb_get_phase:()=>{if((rt.globals.flag?.[915]??0)>0||(rt.globals.flag?.[916]??0)>0)throw Error('Spamton NEO side-B source is unavailable');return 0;},
  variable_instance_set:(_s,id,key,value)=>{proxy(instance(id))[key]=value;},
  variable_instance_get:(_s,id,key)=>{const p=proxy(instance(id));if(!(key in p))throw Error(`Unknown GML member ${key}`);return p[key];},is_string:(_s,value)=>typeof value==='string',is_real:(_s,value)=>typeof value==='number',
 };
 const invoke=(name:string,p:Record<string,any>,...a:any[]):any=>{
  if(builtins[name])return builtins[name](p,...a);
  const script=host.scripts?.[name];if(script)return executeNeoSource(script,instance(p),rt,host,other,event,a,name);
  return host.call(name,instance(p),rt,a);
 };
 builtins.script_execute=(p,name,...a)=>invoke(name,p,...a);
 const calls=new Proxy({}, {get:(_o,k)=>typeof k==='string'?(p:Record<string,any>,...a:any[])=>invoke(k,p,...a):undefined}) as Record<string,(self:Record<string,any>,...args:any[])=>any>;
 const constants:Record<string,any>={global:rt.globals,room:host.room??'room_dw_mansion_b_east',room_width:rt.room.width,room_height:rt.room.height,room_speed:rt.bank.roomSpeed,view_wport:[rt.view.width],view_hport:[rt.view.height],e__VW:{XView:0,YView:1,WView:2,HView:3},noone:-4,all:-3,c_white:C.white,c_black:C.black,c_green:C.green,c_lime:C.lime,c_purple:C.purple,c_orange:C.orange,c_red:C.red,c_blue:0xff0000,c_yellow:C.yellow,c_aqua:C.aqua,c_gray:C.gray,c_ltgray:C.ltgray,c_teal:0x808000,c_silver:0xc0c0c0,c_fuchsia:0xff00ff,c_maroon:0x000080,c_navy:0x800000,c_olive:0x008080,vk_f1:112,gp_stickr:32780,vk_enter:13,vk_shift:16,vk_control:17,vk_space:32,vk_left:37,vk_up:38,vk_right:39,vk_down:40,pi:Math.PI};
 const environment=new Proxy(constants,{
  has:(_o,k)=>typeof k==='string'&&(k in constants||/^(obj_|o_|spr_|bg_|snd_|room_|scr_|mus_)/.test(k)),
  get:(o,k)=>typeof k!=='string'?undefined:k in o?o[k]:/^(obj_|o_)/.test(k)?host.object(k):/^(spr_|bg_|snd_|room_|scr_|mus_)/.test(k)?k:undefined,
 });
 let program=compiled.program;
 if(args){const declared=program.statements.find(n=>n.kind==='function'&&(!entryName||n.name===entryName));if(!declared)throw Error(`NEO script has no declared function ${entryName??''}`);program={statements:[...program.statements,{kind:'return',value:{kind:'call',callee:{kind:'identifier',name:declared.name},args:args.map(value=>({kind:'literal',value}))}}]};}
 try{return executeGml(program,proxy(s),environment,{calls,operators,argumentOrder:'right-to-left',other:other?proxy(other):undefined,targets:v=>targets(v).map(proxy),member:v=>Array.isArray(v)?array(v):v instanceof GmInstance?proxy(v):isDef(v)||typeof v==='number'?proxy(instance(v)):v});}
 catch(error){throw Error(`${s.object.name} ${event??'source'}: ${error instanceof Error?error.message:String(error)}`,{cause:error});}
}

export function createNeoSourceObject(host:NeoSourceHost,meta:NeoSourceMetadata,sources:Readonly<Record<string,string>>):GmObjectDef{
 const def:GmObjectDef={name:meta.name,index:meta.index,depth:meta.depth,visible:meta.visible,sprite:meta.sprite??undefined,mask:meta.mask??undefined,events:{}};
 // Marks a definition that still runs archived source (until it is hand-ported).
 Object.defineProperty(def,'archived',{value:Object.keys(sources).length>0});
 if(meta.parent)Object.defineProperty(def,'parent',{get:()=>host.object(meta.parent!),configurable:true});
 const eventName=(key:string):GmEvent|undefined=>key==='Create_0'?'create':key==='Step_0'?'step':key==='Step_1'?'beginStep':key==='Step_2'?'endStep':key==='Draw_0'?'draw':key==='Other_7'?'animationEnd':key.startsWith('Alarm_')?`alarm${Number(key.slice(6))}`:key.startsWith('Other_')&&Number(key.slice(6))>=10?`user${Number(key.slice(6))-10}`:undefined;
 for(const [key,source] of Object.entries(sources)){const ev=eventName(key);if(ev)def.events![ev]=(s,rt)=>executeNeoSource(source,s,rt,host,undefined,ev);}
 if(sources.Destroy_0||sources.CleanUp_0)def.events!.destroy=(s,rt)=>{if(sources.Destroy_0)executeNeoSource(sources.Destroy_0,s,rt,host,undefined,'destroy');if(sources.CleanUp_0)executeNeoSource(sources.CleanUp_0,s,rt,host,undefined,'destroy');};
 const collisions=Object.entries(sources).filter(([key])=>key.startsWith('Collision_'));
 if(collisions.length)Object.defineProperty(def,'collisions',{get:()=>collisions.map(([key,source])=>({target:host.object(key.slice(10)),run:(s:GmInstance,o:GmInstance,rt:GmRuntime)=>executeNeoSource(source,s,rt,host,o)})),configurable:true});
 return def;
}
