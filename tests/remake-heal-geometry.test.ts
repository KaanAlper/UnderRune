import {expect,it} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {HERO_DEFS,healAnim} from '../src/remake/deltarune/party';
import type {SpriteData} from '../src/remake/gm/sprites';
const image:SpriteData={name:'body',width:100,height:100,originX:0,originY:0,bboxMode:0,left:0,right:99,top:0,bottom:99,sepMasks:0,frames:1,special:false,playbackSpeed:0,playbackType:0};

for(const alias of [false,true])for(const index of [0,1,2,3])it(`native healing geometry: hero ${index+1}, chapter alias ${alias}`,()=>{
 const rt=new GmRuntime({get:()=>image,collisionCompat:true,roomSpeed:30},{seed:11});rt.globals.chapter=2;
 const original=HERO_DEFS[index],definition=alias?{...original,index:1000+index}:original;
 if(alias)rt.installObjectAliases([[original,definition]]);
 const hero=rt.restore(definition,90000,50,60,{mywidth:32,myheight:48});hero.sprite='body';
 const effect=rt.create(healAnim,0,0);effect.target=hero.id;resolveEvent(effect.object,'step')!(effect,rt);
 // obj_healanim Step checks these three exact native object indices. Noelle uses the sprite dimensions.
 const ordinary=index<3;expect(effect.herocheck).toBe(ordinary?1:0);
 expect(effect.sw).toBe(ordinary?32:100);expect(effect.sh).toBe(ordinary?48:100);
 for(const particle of rt.instances.filter(i=>i.live&&i.object.name==='obj_marker')){
  expect(particle.x).toBeGreaterThanOrEqual(50);expect(particle.x).toBeLessThan(50+effect.sw);
  expect(particle.y).toBeGreaterThanOrEqual(60);expect(particle.y).toBeLessThan(60+effect.sh);
 }
});
