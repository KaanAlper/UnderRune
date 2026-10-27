import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {GmRandom} from '../src/remake/gm/random';
import {KEY} from '../src/remake/deltarune/battle';
import {writer} from '../src/remake/deltarune/writer';
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function scene(message='Test/%'){
 const rt=new GmRuntime(bank,{seed:3});rt.globals={chapter:2,lang:'en',msg:Array.from({length:100},(_,i)=>i===0?message:''),typer:4,fc:0,fe:0,darkzone:1,fighting:1,flag:new Array(100).fill(0)};
 const w=rt.create(writer,30,376);return {rt,w};
}
describe('Chapter 2 writer part',()=>{
 it('initializes the complete reveal, input and mini-face lifecycle',()=>{
  const {w}=scene();for(const name of ['forcebutton1','prevent_mash_buffer','formattext','drawaster','reachedend','sound_timer','sound_count','jpspecial','jpused','autocenter','miniface_current_pos','miniface_pos','miniface_drawn','i','j'])expect(name in w,name).toBe(true);
  expect([w.i,w.j,w.miniface_current_pos,w.prevent_mash_buffer]).toEqual([7,100,-1,0]);
 });
 it('blocks Z through the mash buffer, then allows the halted page to end',()=>{
  const {rt,w}=scene();w.formatted=1;w.halt=2;w.pos=2;w.siner=5;w.prevent_mash_buffer=2;
  rt.input.pressed.add(KEY.z);rt.draw();expect(w.live).toBe(true);expect(w.prevent_mash_buffer).toBe(1);
  rt.draw();expect(w.live).toBe(true);rt.draw();expect(w.live).toBe(false);
 });
 it('honors forcebutton1 and continues Draw after destroying the instance',()=>{
  const {rt,w}=scene();w.formatted=1;w.halt=2;w.siner=5;w.forcebutton1=1;
  rt.draw();expect(w.live).toBe(false);expect(w.siner).toBe(6);
 });
 it('reveals escaped controls in two positions and records reachedend',()=>{
  const {rt,w}=scene('`&A');w.first_alarm=1;w.pos=1;w.alarm[0]=1;w.alarm[2]=-1;
  rt.step();expect(w.pos).toBe(3);expect(w.getchar).toBe('`');
  w.pos=5;w.alarm[0]=1;rt.step();expect(w.reachedend).toBe(1);
 });
 it('uses the original RNG draws for special effect 3',()=>{
  const {rt,w}=scene('AB');w.formatted=1;w.pos=3;w.special=3;
  const expected=GmRandom.restore(rt.random.snapshot());for(let i=0;i<14;i++)expected.next();rt.draw();
  expect(rt.random.snapshot()).toEqual(expected.snapshot());expect(w.i).toBe(7);expect(w.n).toBe(3);
 });
 it('rejects an unsupported chapter rather than silently using a different writer',()=>{
  const {rt}=scene();rt.globals.chapter=5;expect(()=>rt.create(writer,0,0)).toThrow(/writer.*Chapter 5/i);
 });
 it('removes small-face descendants when a halted page advances',()=>{
  const {rt,w}=scene();const parent={name:'obj_smallface',index:999},child=rt.create({name:'obj_smallface_variant',index:1000,parent},0,0);
  w.formatted=1;w.pos=2;w.halt=1;w.siner=5;rt.input.pressed.add(KEY.z);rt.draw();expect(child.live).toBe(false);expect(w.msgno).toBe(1);
 });
 it('keeps the dialoguer camera offset while formatting',()=>{
  const {rt,w}=scene();const dialoguer=rt.create({name:'obj_dialoguer',index:998},0,0);dialoguer.zurasucon=2;dialoguer.remwriterx=150;rt.view.x=100;w.dialoguer=1;
  rt.draw();expect(w.writingx).toBe(250);
 });
 it('plays special voices through the ordinary audio host too',()=>{
  const {rt,w}=scene('AB');const sounds:string[]=[];rt.sound=name=>sounds.push(name);w.textsound='snd_txtsans';w.firstnoise=0;w.alarm[0]=-1;w.alarm[2]=1;
  rt.step();expect(sounds).toEqual(['snd_txtsans']);expect(w.sound_timer).toBe(2);
 });
 it('pitches the Queen voice using its named handle on the ordinary audio host',()=>{
  const {rt,w}=scene('AB');const sounds:string[]=[],pitches:[number|string,number][]=[];
  rt.sound=name=>sounds.push(name);rt.soundPitch=(handle,pitch)=>pitches.push([handle,pitch]);w.textsound='snd_txtq';w.firstnoise=0;w.alarm[0]=-1;w.alarm[2]=1;
  rt.step();expect(sounds).toEqual(['snd_txtq_2']);expect(pitches).toEqual([['snd_txtq_2',w.qp]]);
 });
 it('uses the installed game debug script rather than inventing a global debug toggle',()=>{
  const {rt,w}=scene('AB');rt.globals.debug=1;rt.input.held.add(KEY.c);rt.draw();
  expect(w.automash_timer).toBe(0);expect([w.button1,w.button2]).toEqual([0,0]);
 });
});
