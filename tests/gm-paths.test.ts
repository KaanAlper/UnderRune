import {describe,it,expect} from 'vitest';
import {GmPaths} from '../src/remake/gm/paths';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';

const fixture=()=>new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));
const line=(paths:GmPaths)=>{const id=paths.add();paths.setClosed(id,false);paths.addPoint(id,40,20,100);paths.addPoint(id,140,20,100);return id;};
describe('GameMaker dynamic paths',()=>{
 it('samples by length and clamps endpoints',()=>{const p=new GmPaths(),id=line(p);expect(p.getX(id,-1)).toBe(40);expect(p.getX(id,0.25)).toBe(65);expect(p.getY(id,2)).toBe(20);expect(p.getX(id,2)).toBe(140);});
 it('moves after gravity without applying ordinary motion twice, then fires end before End Step',()=>{
  const rt=fixture(),events:string[]=[];const s=rt.create({name:'test',index:1,events:{pathEnd:i=>{events.push('end');expect(i.x).toBe(110);},endStep:()=>events.push('step')}},10,30);
  s.gravity=2;rt.paths.start(s,line(rt.paths),100,0,false);rt.step();expect([s.x,s.y,s.speed,s.path_index]).toEqual([110,30,0,-1]);expect(events).toEqual(['end','step']);
 });
 it.each([0,1,2,3])('handles end action %i and subsequent movement',action=>{
  const rt=fixture(),s=rt.create({name:'test',index:1},0,0);rt.paths.start(s,line(rt.paths),60,action,false);rt.step();rt.step();
  expect(s.x).toBeCloseTo([100,20,120,80][action],4);expect(s.path_index).toBe(action===0?-1:0);
  if(action===3)expect(s.path_speed).toBe(-60);
 });
 it('supports absolute reverse starts and explicit end/delete',()=>{
  const rt=fixture(),s=rt.create({name:'test',index:1},400,300),id=line(rt.paths);rt.paths.start(s,id,-25,0,true);expect([s.x,s.y]).toEqual([140,20]);rt.step();expect(s.x).toBe(115);
  rt.paths.end(s);s.hspeed=2;rt.step();expect(s.x).toBe(117);rt.paths.delete(id);expect(rt.paths.exists(id)).toBe(false);
 });
 it('does not introduce path fields on ordinary instances',()=>{const rt=fixture(),s=rt.create({name:'test',index:1},0,0);s.hspeed=3;rt.step();expect(s.x).toBe(3);expect('path_index' in s).toBe(false);});
 it('subdivides an open smooth corner, preserving endpoints and symmetry',()=>{
  const p=new GmPaths(),id=p.add();p.setClosed(id,false);p.setKind(id,1);p.setPrecision(id,4);p.addPoint(id,0,0,100);p.addPoint(id,100,100,100);p.addPoint(id,200,0,100);
  expect(p.getX(id,0)).toBe(0);expect(p.getX(id,1)).toBe(200);expect(p.getX(id,0.5)).toBeCloseTo(100,4);expect(p.getY(id,0.5)).toBeCloseTo(75,4);
 });
});
