import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {dmgWriter} from '../src/remake/deltarune/battle';
import {heal,healAnim} from '../src/remake/deltarune/party';
import {bulletHeal,customAfterimage,drawInBox} from '../src/remake/bosses/queen/shared';
import {executeNeoSource,type NeoSourceHost} from '../src/remake/bosses/spamton-neo/body-source';
const directory='extracted/chapter2_windows/code/';
function setup(target:number,hp=[0,50,60,30]){
 const defs:Record<string,GmObjectDef>={};const object=(name:string)=>defs[name]??={name,index:Object.keys(defs).length};
 const rt=new GmRuntime(spriteBank({sprites:[],atLeast2022_1:false,optionsInfo:0}),{seed:19});
 rt.installObjectAliases([[dmgWriter,object('obj_dmgwriter')],[healAnim,object('obj_healanim')]]);
 rt.globals={chapter:2,char:[1,2,3],hp:[...hp],maxhp:[0,100,100,100],charcantarget:[hp[1]>0?1:0,hp[2]>0?1:0,hp[3]>0?1:0],targeted:[0,0,0],charinstance:[],charmove:[1,1,1],chardead:[0,0,0]};
 for(let i=0;i<3;i++){const h=rt.create(object('hero'+i),80,60+80*i);Object.assign(h,{myself:i,myheight:60,tu:0});rt.globals.charinstance[i]=h.id;}
 const old=rt.create(object('obj_dmgwriter'),0,0);old.delaytimer=3;old.killactive=0;
 const s=rt.create(object('healing_bullet'),320,200);s.target=target;return {rt,s,object};
}
const norm=(v:any):any=>Array.isArray(v)?v.map(norm):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['frameCount','object','layerEntry'].includes(k)).map(([k,x])=>[k,norm(x)])):v;
describe('Queen shared attack helpers',()=>{
 it('custom afterimages leave the source caller handle and copy transforms in source order',()=>{
  const {rt,s,object}=setup(0);s.sprite='sprite';s.imageXscale=-2;s.imageYscale=3;s.imageAngle=44;s.depth=15;
  const a=customAfterimage(s,rt,object('obj_buffer_afterimage'));expect([s.afterimage,a.sprite,a.x,a.y,a.imageXscale,a.imageYscale,a.imageAngle,a.depth,a.imageSpeed]).toEqual([a.id,'sprite',320,200,-2,3,44,16,0]);
 });
});
describe.skipIf(!fs.existsSync(directory+'gml_GlobalScript_scr_bullet_heal.gml'))('bullet healing against installed source',()=>{
 it('matches source clipping with raw sprite origins and signed instance scales',()=>{
  const {rt,s}=setup(0),actual:any[][]=[],expected:any[][]=[];s.sprite='test';s.x=355;s.y=175;s.imageIndex=2;s.imageXscale=-2;s.imageYscale=3;s.imageAlpha=.8;s.imageBlend=0x123456;
  rt.dynamicSprites.set('test',{name:'test',width:50,height:80,originX:5,originY:7,frames:4,bboxMode:1,left:0,right:49,top:0,bottom:79,sepMasks:0,special:false,playbackSpeed:0,playbackType:0});rt.gfx={spritePart:(...args:any[])=>actual.push(args)} as any;
  const env={x:s.x,y:s.y,sprite_xoffset:5,sprite_yoffset:7,sprite_index:s.sprite,image_index:s.imageIndex,image_xscale:s.imageXscale,image_yscale:s.imageYscale,image_blend:s.imageBlend,image_alpha:s.imageAlpha,sign:Math.sign,draw_sprite_part_ext:(...args:any[])=>expected.push(args)};
  new Function('env',`with(env){${fs.readFileSync(directory+'gml_GlobalScript_scr_drawinbox.gml','utf8')};scr_drawinbox(320,200,140,120);}`)(env);
  drawInBox(s,rt,320,200,140,120);expect(actual).toEqual(expected);
 });
 it.each([[0,[0,50,60,30]],[4,[0,50,60,30]],[4,[0,-20,60,0]],[0,[0,-20,60,0]],[2,[0,50,60,99]]] as [number,number[]][])('matches target %i, retarget RNG, hero effects and caller bookkeeping', (target,hp)=>{
  const a=setup(target,hp),b=setup(target,hp);
  const scripts=Object.fromEntries(['scr_bullet_heal','scr_randomtarget_old','scr_dmgwriter_selfchar'].map(name=>[name,fs.readFileSync(directory+'gml_GlobalScript_'+name+'.gml','utf8')]));
  const host:NeoSourceHost={object:b.object,text:key=>key,scripts,call:(name,self,r,args)=>{
   if(name==='scr_heal')return heal(self,r,args[0],args[1]);if(name==='snd_play'||name==='snd_stop')return 0;throw Error('Unexpected source operation '+name);
  }};
  executeNeoSource(scripts.scr_bullet_heal,b.s,b.rt,host,undefined,undefined,[6],'scr_bullet_heal');bulletHeal(a.s,a.rt,6);
  expect(norm(a.rt.instances)).toEqual(norm(b.rt.instances));expect(a.rt.globals).toEqual(b.rt.globals);expect(a.rt.random.snapshot()).toEqual(b.rt.random.snapshot());
 });
});
