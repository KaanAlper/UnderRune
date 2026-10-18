import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,GmInstance,gmField,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import type {SpriteBank} from '../src/remake/gm/sprites';
import {createQueenShield} from '../src/remake/bosses/queen/shield';
import {gt,lt} from '../src/remake/gm/math';
const bank:SpriteBank={collisionCompat:true,roomSpeed:30,get:name=>({name,width:40,height:36,frames:3,originX:0,originY:0,bboxMode:1,left:0,right:39,top:0,bottom:35,sepMasks:0,special:false,playbackSpeed:0,playbackType:0})};
function setup(size=7){
 const defs:Record<string,GmObjectDef>={};const object=(name:string)=>defs[name]??=( {name,index:Object.keys(defs).length,sprite:'spr_queenshield_pieces'} );
 const rt=new GmRuntime(bank,{seed:29}),q=rt.create(object('obj_queen_enemy'),470,120);q.depth=90;q.sprite='spr_queen_chair_1_old';Object.assign(q,{shieldsize:size,shieldhp:400,shieldmaxhp:400,shieldacthp:6,shieldactmaxhp:6});
 const shield=createQueenShield(object),s=rt.create(shield,388,20);return {rt,q,s,shield,object};
}
describe('Queen acid shield',()=>{
 it.each([7,10,12])('initializes all fourteen pieces and the correct %i-piece movement order',size=>{
  const {s}=setup(size);expect(s.shieldpiece_x).toHaveLength(14);expect(s.moveorder).toHaveLength(size);expect(s.shieldpiece_sprite_index.slice(size)).toEqual(Array(14-size).fill('spr_nothing'));
  expect([s.shieldpiece_image_index[0],s.shieldpiece_image_index[size-1],s.i]).toEqual([0,2,14]);
 });
 it('breaks with the actual explosion user event, without unreachable afterimage creation',()=>{
  const {rt,s,shield}=setup();s.shieldhurt=2;resolveEvent(shield,'draw')!(s,rt);expect(s.live).toBe(false);
  const explosion=rt.instances.find(i=>i.object.name==='obj_queen_vector_explosion')!;expect([explosion.x,explosion.y,explosion.imageXscale,explosion.imageYscale]).toEqual([Math.fround(s.x+40),Math.fround(s.y+120),2,2]);expect('after' in s).toBe(false);
 });
});
const directory='extracted/chapter2_windows/code/';
describe.skipIf(!fs.existsSync(directory+'gml_Object_obj_queenshield_enemy_Draw_0.gml'))('Queen shield against installed events',()=>{
 it.each([7,10,12])('matches Create, full Draw motion, retract and hurt RNG at size %i',size=>{
  const a=setup(size),b=setup(size),read=(event:string)=>fs.readFileSync(directory+`gml_Object_obj_queenshield_enemy_${event}.gml`,'utf8');
  const nativeCreate=read('Create_0'),nativeDraw=read('Draw_0').replace(/repeat \((\d+)\)/g,(_m,n)=>`for(let __repeat=0;__repeat<${n};__repeat++)`)
   // GML compares reals with a tolerance: the alpha steps of 0.1 stop at zero and one.
   .replace('shieldalpha > 0','gt(shieldalpha, 0)').replace('shieldalpha < 1','lt(shieldalpha, 1)'),nativeSort=read('Other_12');
  const sourceState=b.rt.create({...b.shield,events:{}},388,20);b.rt.destroy(b.s);
  // Reserve the source's declared instance fields. Assignments inside with(state) then behave as GML instance writes.
  for(const m of nativeCreate.matchAll(/^\s*([a-zA-Z_]\w*)(\[\w+\])?\s*=/gm))if(!(gmField(m[1]) in sourceState))sourceState[gmField(m[1])]=m[2]?[]:0;sourceState.i=0;
  const wrap=(s:GmInstance)=>new Proxy(s,{has:(t,k)=>typeof k==='string'&&gmField(k) in t,get:(t,k)=>typeof k==='string'?t[gmField(k)]:Reflect.get(t,k),set:(t,k,v)=>{t[gmField(String(k))]=v;return true;}});
  const state=wrap(sourceState),q=wrap(b.q),drawsA:any[][]=[],drawsB:any[][]=[];let fog=false;
  a.rt.gfx={sprite:(...v:any[])=>drawsA.push(v),spriteFog:(...v:any[])=>drawsA.push(['fog',...v]),line:(...v:any[])=>drawsA.push(['line',...v])} as any;
  const env:Record<string,any>={obj_queen_enemy:q,global:b.rt.globals,c_green:0x008000,c_white:0xffffff,c_lime:0x00ff00,c_black:0,
   spr_queenshield_pieces:'spr_queenshield_pieces',spr_queenshield_pieces_hurt:'spr_queenshield_pieces_hurt',spr_nothing:'spr_nothing',spr_queen_chair_1_battle:'spr_queen_chair_1_battle',spr_queen_chair_1_old:'spr_queen_chair_1_old',
   gt,lt,sin:Math.sin,min:Math.min,random:(n:number)=>b.rt.random.random(n),irandom:(n:number)=>b.rt.random.irandom(n),lerp:(x:number,y:number,t:number)=>x+(y-x)*t,
   lerp_ease_out:(x:number,y:number,t:number,p:number)=>x+(y-x)*(p===1?Math.sin(t*Math.PI/2):-t*(t-2)),
   sprite_get_height:()=>36,snd_swallow:'snd_swallow',snd_play:()=>{},audio_is_playing:()=>false,
   draw_set_alpha:(n:number)=>{b.rt.drawState.alpha=n;},draw_set_color:(n:number)=>{b.rt.drawState.color=n;},
   draw_line:(...v:number[])=>drawsB.push(['line',...v,b.rt.drawState.color,b.rt.drawState.alpha]),
   draw_sprite_ext:(...v:any[])=>drawsB.push(fog?['fog',...v]:v),d3d_set_fog:(v:boolean)=>{fog=v;},
   instance_destroy:()=>b.rt.destroy(sourceState),event_user:(n:number)=>{if(n!==2)throw Error('Unexpected source user event');new Function('state','env',`with(env){with(state){${nativeSort}}}`)(state,env);},
  };
  new Function('state','env',`with(env){with(state){${nativeCreate}}}`)(state,env);
  const compare=()=>{
   for(const key of Object.keys(a.s).filter(k=>!k.startsWith('$')&&k!=='frameCount'&&k!=='layerEntry'&&k!=='id'&&k!=='object'))expect(sourceState[key],key).toEqual(a.s[key]);
   for(const key of ['x','y','depth','imageBlend','imageAlpha','imageXscale','imageYscale','imageAngle','imageSpeed'])expect(sourceState[key],key).toBe(a.s[key]);
  };
  compare();const draw=new Function('state','env',`with(env){with(state){${nativeDraw}}}`);
  for(let frame=0;frame<180;frame++){
   if(frame===0){a.s.appearcon=sourceState.appearcon=1;}
   if(frame===90){a.s.appearcon=sourceState.appearcon=2;}
   if(frame===110){a.s.shieldhurt=sourceState.shieldhurt=1;a.s.shieldhurttimer=sourceState.shieldhurttimer=6;}
   a.q.shieldhp=b.q.shieldhp=400-frame*2;
   drawsA.length=0;drawsB.length=0;draw(state,env);resolveEvent(a.shield,'draw')!(a.s,a.rt);compare();
   expect(a.rt.random.snapshot(),`frame ${frame}`).toEqual(b.rt.random.snapshot());expect(drawsA,`frame ${frame}`).toEqual(drawsB);
  }
 });
});
