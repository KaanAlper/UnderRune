import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {battleControllerFull} from '../src/remake/deltarune/controller';

const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function scene(){
 const rt=new GmRuntime(bank,{seed:3});
 rt.globals={chapter:2,lang:'en',charturn:2,myfight:0,fighting:1,charselect:-1,bmenuno:0,time:0,
  char:[1,2,3],hp:[0,120,140,100,100],maxhp:[0,120,140,100,100],faceaction:[0,0,0],
  monster:[0,0,0],mercymod:[0,0,0],monsterstatus:[0,0,0],tension:0,bmenucoord:Array.from({length:20},()=>new Array(20).fill(0))};
 const s=rt.restore(battleControllerFull,1000,0,0,{bp:152,bpy:152,tp:0,tpy:50,intro:0,bcolor:0,chartotal:3,
  havechar:[1,1,1,0],charpos:[0,1,2,-1],mmy:[0,0,0,0],hpcolor:[0xffff00,0xff00ff,0x00ff00,0x00ffff],s_siner:0});
 return {rt,s};
}
describe('Chapter 2 controller HUD part',()=>{
 it('reports the unported A-held ACT preview explicitly',()=>{
  const {rt}=scene();rt.globals.flag=new Array(100).fill(0);rt.globals.bmenuno=11;rt.globals.monstername=[' ',' ',' '];rt.globals.monsterinstance=[0,0,0];rt.input.held.add(65);
  expect(()=>rt.draw()).toThrow(/ACT preview.*not ported/i);
 });
 it('dispatches through an explicit chapter part',()=>{
  const {rt}=scene();rt.globals.chapter=3;expect(()=>rt.draw()).toThrow(/controller.*Chapter 3/i);
 });
 it('uses Chapter 2 party spacing and preserves selection working fields',()=>{
  const {rt,s}=scene();rt.draw();expect(s.slmxx).toBe(426);expect(s.gc).toBe(2);expect(s.btc).toEqual([1,0,0,0,0]);expect(s.c).toBe(4);expect(s.i).toBe(12);
 });
 it('computes shaken HUD offsets before panel growth',()=>{
  const {rt,s}=scene();s.intro=1;s.bp=0;rt.view.x=4;rt.view.y=-6;rt.draw();
  expect([s.xx,s.yy,s.tpoff,s.bpoff,s.bp]).toEqual([4,-6,-56,146,30]);
 });
 it('positions a reordered two-person party by slot, including Noelle',()=>{
  const {rt,s}=scene();rt.globals.char=[4,1,0];rt.globals.charturn=0;s.chartotal=2;s.havechar=[1,0,0,1];s.charpos=[1,-1,-1,0];rt.draw();
  expect(s.slmxx).toBe(108);expect(s.gc).toBe(0);expect(s.btc).toEqual([1,0,0,0,0]);
 });
});
