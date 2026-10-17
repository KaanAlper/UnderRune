import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createWerewerewire} from '../src/remake/bosses/chapter2-field/werewerewire';
import {runChapter2FieldBullets} from '../src/remake/bosses/chapter2-field/bullets';

function scene(){
 const objects:Record<string,GmObjectDef>={};let index=1000;
 const object=(name:string)=>objects[name]??(objects[name]={name,index:index++});
 const defs=createWerewerewire(object);for(const d of defs)objects[d.name]=d;
 const rt=new GmRuntime(spriteBank({sprites:[],atLeast2022_1:false,optionsInfo:0}),{seed:7});
 rt.globals={chapter:2,monster:[1,0,0],monsterat:[10],mnfight:2,myfight:0,turntimer:300};
 rt.restore(object('obj_growtangle'),9000,320,170);rt.restore(object('obj_heart'),9001,260,190);
 return {rt,objects,object};
}
describe('Chapter 2 field source events',()=>{
 it('registers the complete Werewerewire family with executable events',()=>{
  const {objects}=scene();
  for(const name of ['obj_werewerewire_enemy','obj_werewerewire_laserbullet','obj_werewerewire_laserbullet_v','obj_werewire_zzt_balloon']){
   expect(objects[name].events?.create).toBeTypeOf('function');expect(resolveEvent(objects[name],name.endsWith('balloon')?'draw':'step')).toBeTypeOf('function');
  }
 });
 it('keeps vertical laser tail progression, turn delay and graze rearming in source order',()=>{
  const {rt,objects}=scene(),s=rt.create(objects.obj_werewerewire_laserbullet_v,500,100);
  s.attackdirection=0;resolveEvent(s.object,'step')!(s,rt);
  expect([s.active,s.init,s.targetx,s.direction,s.x,s.y]).toEqual([1,1,220,180,480,100]);
  s.grazed=1;s.grazetimer=1;resolveEvent(s.object,'step')!(s,rt);expect([s.grazed,s.grazetimer]).toEqual([0,0]);
 });
 it('runs the original laser controller rather than a sprite-only attack',()=>{
  const {rt,object}=scene(),s=rt.restore(object('obj_dbulletcontroller'),9002,400,100,{type:34,damage:50,target:4,btimer:100,difficulty:0,init:1,side:1});
  expect(runChapter2FieldBullets(s,rt,object)).toBe(true);
  const b=rt.byId(s.d)!;expect([b.object.name,b.damage,b.target,b.attackdirection,s.btimer,s.init]).toEqual(['obj_werewerewire_laserbullet',50,4,s.side,0,2]);
 });
});
