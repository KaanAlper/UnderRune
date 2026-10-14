import {describe,it,expect} from 'vitest';
import {GmRuntime} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {GmRandom} from '../src/remake/gm/random';
import {KEY} from '../src/remake/deltarune/battle';
import {writer,battleText,enemyBalloon} from '../src/remake/deltarune/writer';
import type {GmGraphics,TextStyle} from '../src/remake/gm/graphics';

/** The instance that runs scr_battletext (it keeps the writer and face in its variables). */
const caller=(rt:GmRuntime)=>rt.create({name:'obj_test_caller',index:-1},0,0);
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
function scene(msgs:string[],typer=4){
 const rt=new GmRuntime(bank,{seed:3});rt.globals={msg:[...msgs],typer,fc:0,fe:0,darkzone:1,fighting:1,flag:new Array(100).fill(0)};
 const texts:{x:number;y:number;text:string;style:TextStyle}[]=[];
 const gfx:GmGraphics={sprite:()=>{},rect:()=>{},circle:()=>{},text:(x,y,text,style)=>texts.push({x,y,text,style})};rt.gfx=gfx;
 return {rt,texts,frame:()=>{texts.length=0;rt.draw();rt.step();}};
}
const shown=(texts:{text:string;style:TextStyle}[])=>texts.filter(t=>t.style.colorBottom===undefined).map(t=>t.text).join('');

describe('obj_writer',()=>{
 it('reveals one character per frame at rate 1 and pauses 5 frames for ^1',()=>{
  const {rt,texts,frame}=scene(['* Ab^1cd/%']);const w=battleText(rt,caller(rt));
  const seen:string[]=[];for(let i=0;i<14;i++){frame();seen.push(shown(texts));}
  // The writer starts at pos 2; ^1 skips ahead past the next character, then waits 5 more frames.
  expect(seen.slice(0,5)).toEqual(['*','* ','* A','* Ab','* Abc']);
  expect(seen.slice(4,10).every(s=>s==='* Abc')).toBe(true);
  expect(seen[13]).toBe('* Abcd');expect(w.halt).toBe(2);
 });
 it('draws battle text in fnt_mainbig with a dark-grey-to-navy shadow one pixel down-right',()=>{
  const {rt,texts,frame}=scene(['* Hi/%']);battleText(rt,caller(rt));for(let i=0;i<8;i++)frame();
  const white=texts.find(t=>t.text==='H'&&t.style.colorBottom===undefined)!,shadow=texts.find(t=>t.text==='H'&&t.style.colorBottom!==undefined)!;
  expect(white.style.font).toBe('fnt_mainbig');expect([shadow.x-white.x,shadow.y-white.y]).toEqual([1,1]);
  expect([shadow.style.color,shadow.style.colorBottom]).toEqual([0x404040,0x800000]);
  expect(white.x).toBe(30+32);                                        // "* " then H, 16 px apart
 });
 it('wraps at 33 characters (no portrait) and indents the continuation of a "* " line by two spaces',()=>{
  const {rt,texts,frame}=scene(['* aaaa bbbb cccc dddd eeee ffff gggg hhhh/%']);battleText(rt,caller(rt));for(let i=0;i<60;i++)frame();
  const lines=new Map<number,string>();for(const t of texts.filter(t=>t.style.colorBottom===undefined))lines.set(t.y,(lines.get(t.y)??'')+t.text);
  expect([...lines.values()]).toEqual(['* aaaa bbbb cccc dddd eeee ffff','gggg hhhh']);
  const second=texts.find(t=>t.text==='g'&&t.style.colorBottom===undefined)!;expect(second.x).toBe(30+32);   // indented by "||"
 });
 it('halts on "/", shows the next page on Z, and is gone after "/%" and Z',()=>{
  const {rt,texts,frame}=scene(['* One/','* Two/%']);const w=battleText(rt,caller(rt));
  for(let i=0;i<12;i++)frame();expect(shown(texts)).toBe('* One');expect(w.halt).toBe(1);
  rt.input.pressed.add(KEY.z);frame();for(let i=0;i<12;i++)frame();expect(shown(texts)).toBe('* Two');
  rt.input.pressed.add(KEY.z);frame();expect(w.live).toBe(false);expect(rt.count(writer)).toBe(0);
 });
 it('applies \\F and \\E portrait codes and moves the text past the portrait',()=>{
  const {rt,texts,frame}=scene(['\\E3\\FR* Hey/%']);battleText(rt,caller(rt));for(let i=0;i<12;i++)frame();
  expect([rt.globals.fc,rt.globals.fe]).toEqual([2,3]);
  expect(texts.find(t=>t.text==='H'&&t.style.colorBottom===undefined)!.x).toBe(30+116+32);   // 58 * 2 for the face
 });
 it('uses the random generator in Draw: four calls for every battle-text character drawn',()=>{
  const {rt,frame}=scene(['* Hi/%']);battleText(rt,caller(rt));for(let i=0;i<8;i++)frame();
  const before=GmRandom.restore(rt.random.snapshot());rt.draw();
  for(let i=0;i<4*4;i++)before.next();expect(rt.random.snapshot()).toEqual(before.snapshot());   // "* Hi": 4 characters
 });
 it('puts an enemy balloon writer inside its balloon and removes the balloon with it',()=>{
  const {rt,frame}=scene(['Hello/%'],50);const b=enemyBalloon(rt,400,100,4);
  expect(b.sprite).toBe('spr_battleblcon_clubs');const w=rt.byId(b.mywriter)!;expect([w.x,w.y,w.myfont]).toEqual([405,105,'fnt_dotumche']);
  for(let i=0;i<20;i++)frame();rt.input.pressed.add(KEY.z);frame();frame();expect(b.live).toBe(false);
 });
});
