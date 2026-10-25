import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import * as battle from '../src/remake/deltarune/battle';
import * as chapter2 from '../src/remake/deltarune/chapter2-battle';
import {installNeoHost} from '../src/remake/host/neo';
function scene(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));
 const {objects,host}=installNeoHost(rt);
 const heroes=['obj_herokris','obj_herosusie','obj_heroralsei'].map((n,i)=>rt.restore(objects[n],100100+i,50+i*30,200,{myheight:40}));
 rt.globals={chapter:2,inv:-1,invc:1,char:[1,2,3,1],hp:[0,120,140,100],maxhp:[0,120,140,100],battledf:[2,0,0],
  charaction:[0,0,0],charinstance:heroes.map(h=>h.id),charmove:[1,1,1],charcantarget:[1,1,1],chardead:[0,0,0],charspecial:[0,0,0],targeted:[0,0,0]};
 const b=rt.create({name:'contact',index:2000},0,0);battle.bulletInit(b);b.target=0;
 return {rt,b,objects,host};
}
describe('finale shared source helpers',()=>{
 it('dark markers preserve their source return field on the calling instance',()=>{
  const {rt,b}=scene();const marker=battle.darkMarker(rt,b,10,20,'spr_pixel_white');
  expect([b.thismarker,marker.x,marker.y,marker.imageXscale,marker.imageYscale,marker.imageSpeed]).toEqual([marker.id,10,20,2,2,0]);
 });
 it('the host creates the native stream owner and resolves its virtual handle before cleanup',()=>{
  const {rt,b,objects,host}=scene(),freed:(number|string)[]=[];
  rt.sourceAudio={free:h=>{freed.push(h);}} as typeof rt.sourceAudio;
  const handle=host.call!('snd_init',b,rt,['stream_music.ogg']) as number;
  const a=rt.byId(b._astream)!;expect(a.object.name).toBe('obj_astream');expect(a.mystream).toBe(handle);expect(a.songname).toBe('stream_music.ogg');
  host.call!('snd_free',b,rt,[handle]);
  expect(freed).toEqual(['stream_music']);expect(a.live).toBe(false);
 });
 it('named stream holders release exactly once and use string identity',()=>{
  const {rt,b,objects}=scene(),freed:(number|string)[]=[];
  rt.sourceAudio={free:h=>{freed.push(h);}} as typeof rt.sourceAudio;
  const a=rt.restore(objects.obj_astream,100500,0,0,{mystream:'named_track',bstream:0});
  battle.sndFree(rt,b,'named_track');expect(a.live).toBe(false);expect(freed).toEqual(['named_track']);
 });
 it('also releases named browser tracks which have no numeric source stream holder',()=>{
  const {rt,b}=scene(),freed:(number|string)[]=[];
  rt.sourceAudio={free:h=>{freed.push(h);}} as typeof rt.sourceAudio;
  battle.sndFree(rt,b,'spamton_happy');
  expect(freed).toEqual(['spamton_happy']);expect('_xstream' in b).toBe(false);
 });
 it('freeing a stream updates all holders, destroys matches and preserves the caller field',()=>{
  const {rt,b,objects}=scene(),freed:(number|string)[]=[];
  rt.sourceAudio={free:h=>{freed.push(h);}} as typeof rt.sourceAudio;
  const a=rt.restore(objects.obj_astream,100500,0,0,{mystream:300000,bstream:0});
  const other=rt.restore(objects.obj_astream,100501,0,0,{mystream:300001,bstream:0});
  battle.sndFree(rt,b,300000);
  expect([b._xstream,a.live,other.live,a.bstream,other.bstream]).toEqual([300000,false,true,300000,300000]);
  expect(freed).toEqual([300000]);
 });
 it('keeps logical pitch state in the headless host as well as with an audio backend',()=>{
  const {rt}=scene();const t=chapter2.sndPitchTime(rt,'snd_inhale',2,4);
  resolveEvent(t.object,'step')!(t,rt);
  expect(rt.soundGetPitch!('snd_inhale')).toBe(1.25);
  const next=chapter2.sndPitchTime(rt,'snd_inhale',0.5,3);expect(next.initpitch).toBe(1.25);
 });
 it.each([[120,18,102],[50,6,44],[10,1,9],[4,1,3],[1,19,-60]])('proportional damage uses source HP tiers: hp %s', (hp,damage,left)=>{
  const {rt,b}=scene();rt.globals.hp[1]=hp;
  battle.damageProportional(b,rt);
  expect([b.tdamage,rt.globals.hp[1],rt.globals.inv]).toEqual([damage,left,40]);
 });
 it('target4 uses the old target selector and leaves its chosen target on the caller',()=>{
  const {rt,b}=scene();b.target=4;rt.globals.charcantarget=[0,1,0];
  battle.damageProportional(b,rt);expect([b.target,b.mytarget,b.chartarget]).toEqual([1,1,2]);expect(rt.globals.hp[2]).toBe(112);
 });
 it('invincibility exits before setting working fields or creating feedback',()=>{
  const {rt,b}=scene();rt.globals.inv=0;const count=rt.instances.length;
  battle.damageProportional(b,rt);expect('tdamage' in b).toBe(false);expect(rt.instances).toHaveLength(count);
 });
 it('pitch interpolation replaces an existing tween and samples its current pitch',()=>{
  const {rt}=scene();let pitch=1;rt.soundGetPitch=()=>pitch;rt.soundPitch=(_handle,value)=>{pitch=value;};
  const tween=chapter2.sndPitchTime(rt,'snd_sneo_inhale',2,4);
  resolveEvent(tween.object,'step')!(tween,rt);expect(pitch).toBe(1.25);
  const replacement=chapter2.sndPitchTime(rt,'snd_sneo_inhale',0.5,3);
  expect(tween.live).toBe(false);expect(replacement.initpitch).toBe(1.25);
  for(let n=0;n<3;n++)resolveEvent(replacement.object,'step')!(replacement,rt);
  expect([pitch,replacement.frames,replacement.live]).toEqual([0.5,3,false]);
 });
});
