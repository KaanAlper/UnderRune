import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createBattleMarker,guardPeek} from '../src/remake/bosses/queen/guard-peek';
const ralsei:GmObjectDef={name:'obj_heroralsei',index:1},susie:GmObjectDef={name:'obj_herosusie',index:2};
function setup(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:13});rt.globals={chapter:2,faceaction:[0,4,4],mnfight:1};
 const marker=createBattleMarker(name=>({name,index:3})),caller=rt.create({name:'caller',index:0},0,0),r=rt.create(ralsei,80,200),s=rt.create(susie,80,120);r.myself=2;s.myself=1;r.depth=42;s.depth=24;
 return {rt,marker,caller,r,s};
}
describe('Chapter 2 guard peek marker lifecycle',()=>{
 it('does not replace an actor who is not defending or a different actor type',()=>{
  const {rt,marker,caller,r}=setup();rt.globals.faceaction[2]=0;expect(guardPeek(caller,rt,r,marker,ralsei,susie)).toBeUndefined();expect(rt.count(marker)).toBe(0);expect('thismarker' in caller).toBe(false);
 });
 it('holds the peek at animation end, then plays Ralsei redefend when dialogue ends',()=>{
  const {rt,marker,caller,r}=setup(),m=guardPeek(caller,rt,r,marker,ralsei,susie)!;
  if(typeof m==='number')throw Error('Missing marker');expect([r.imageAlpha,m.sprite,m.depth,m.sourceobject,caller.thismarker]).toEqual([0,'spr_ralsei_defend_peek',42,r.id,m.id]);
  resolveEvent(marker,'animationEnd')!(m,rt);expect(m.live).toBe(true);expect(m.imageSpeed).toBe(0);
  rt.globals.mnfight=0;resolveEvent(marker,'step')!(m,rt);expect(m.live).toBe(false);const tail=rt.first(marker)!;
  expect([tail.sprite,tail.imageSpeed,tail.sourceobject,tail.depth,tail.destroyoncomplete,m.thismarker,m.newMarker]).toEqual(['spr_ralsei_redefend',.5,r.id,42,1,tail.id,tail.id]);
  resolveEvent(marker,'step')!(tail,rt);expect(tail.live).toBe(true);expect(r.imageAlpha).toBe(0);
  resolveEvent(marker,'animationEnd')!(tail,rt);expect(tail.live).toBe(false);expect(r.imageAlpha).toBe(1);
 });
 it('restores Susie immediately when the original marker ends, without an invented exit animation',()=>{
  const {rt,marker,caller,s}=setup(),m=guardPeek(caller,rt,s,marker,ralsei,susie)!;
  if(typeof m==='number')throw Error('Missing marker');expect([m.sprite,m.endanimation,s.imageAlpha]).toEqual(['spr_susie_defend_peek',0,0]);
  rt.globals.mnfight=0;resolveEvent(marker,'step')!(m,rt);expect(s.imageAlpha).toBe(1);expect(rt.count(marker)).toBe(0);
 });
});
const folder='extracted/chapter2_windows/code/';
describe.skipIf(!fs.existsSync(folder+'gml_GlobalScript_scr_guardpeek.gml'))('guard peek against installed source',()=>{
 it('matches marker fields, visibility and caller bookkeeping for each defending actor',()=>{
  const code=fs.readFileSync(folder+'gml_GlobalScript_scr_guardpeek.gml','utf8');
  const body=code.slice(code.indexOf('{')+1,code.lastIndexOf('}'));
  const native=new Function('arg0','env',`with(env){${body}}`);
  for(const actor of ['r','s'] as const)for(const defending of [0,4]){
   const {rt,marker,caller,r,s}=setup();rt.globals.faceaction[r.myself]=defending;rt.globals.faceaction[s.myself]=defending;
   const wrap=(h:typeof r)=>({id:h.id,myself:h.myself,x:h.x,y:h.y,depth:h.depth,image_alpha:1});
   const nr=wrap(r),ns=wrap(s),creates:Record<string,any>[]=[];
   const env={global:rt.globals,obj_heroralsei:nr,obj_herosusie:ns,spr_ralsei_defend_peek:'spr_ralsei_defend_peek',spr_susie_defend_peek:'spr_susie_defend_peek',spr_ralsei_redefend:'spr_ralsei_redefend',
    scr_battle_marker:(x:number,y:number,sprite:string)=>{const m={x,y,sprite_index:sprite,image_speed:1,image_xscale:2,image_yscale:2,endanimation:0,sourceobject:0};creates.push(m);return m;}};
   const result=native(actor==='r'?nr:ns,env),actual=guardPeek(caller,rt,actor==='r'?r:s,marker,ralsei,susie);
   expect(actual===undefined).toBe(result===undefined);expect([r.imageAlpha,s.imageAlpha]).toEqual([nr.image_alpha,ns.image_alpha]);
   expect(rt.count(marker)).toBe(creates.length);
   if(creates.length){const m=rt.first(marker)!,n=creates[0];expect([m.x,m.y,m.sprite,m.imageSpeed,m.imageXscale,m.imageYscale,m.depth,m.endanimation,m.sourceobject]).toEqual([n.x,n.y,n.sprite_index,n.image_speed,n.image_xscale,n.image_yscale,n.depth,n.endanimation,n.sourceobject.id]);}
  }
 });
});
