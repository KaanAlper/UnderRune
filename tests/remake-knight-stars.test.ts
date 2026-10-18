import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {drawBeamColor} from '../src/remake/deltarune/chapter3-scripts';

function fixture(){
 const rt=new GmRuntime(loadSprites(3),{seed:11});rt.globals={chapter:3,turntimer:120};const {objects}=installChapter3BossHost(rt,{room:'room_battletest'});
 rt.restore(objects.obj_knight_enemy,99990,460,100,{aetimer:0,visible:true});rt.restore(objects.obj_growtangle,99991,320,170,{imageXscale:2,imageYscale:2});rt.restore(objects.obj_heart,99992,280,170);
 const cone=rt.create(objects.obj_knight_pointing_cone,460,100);Object.assign(cone,{con:2,tween:1,angle_lerp:1,angle:60});return {rt,objects,cone};
}
describe('Knight Stars source transitions',()=>{
 it('preserves Vector2 temporary handles and its one static scope without adding battle instances',()=>{
  const {rt}=fixture(),before=rt.nextId,count=rt.instances.length;
  drawBeamColor(rt,10,20,100,10,180,0xffffff,0,0.5,false);
  expect(rt.nextId-before).toBe(4);
  drawBeamColor(rt,10,20,100,10,180,0xffffff,0,0.5,false);
  expect(rt.nextId-before).toBe(7);expect(rt.instances.length).toBe(count);
 });
 it('closes stars in the original with-instance order, staggering newer stars first',()=>{
  const {rt,objects,cone}=fixture();const stars=Array.from({length:5},()=>rt.create(objects.obj_knight_pointing_star,400,170));
  resolveEvent(cone.object,'step')!(cone,rt);
  expect(cone.starlist).toEqual(stars.map(s=>s.id).reverse());expect(stars.map(s=>s.timer||0)).toEqual([-4,-3,-2,-1,0]);
 });
 it('enters the closing animation when angle_lerp equals zero within native GML tolerance',()=>{
  const {rt,cone}=fixture();cone.angle_lerp=1.3877787807814457e-16;
  const before=rt.random.snapshot();resolveEvent(cone.object,'step')!(cone,rt);
  expect(cone.con).toBe(3);expect(cone.timer).toBe(10);expect(cone.yoff).toBeGreaterThanOrEqual(60);expect(cone.yoff).toBeLessThanOrEqual(180);expect(rt.random.snapshot()).not.toEqual(before);
 });
});
