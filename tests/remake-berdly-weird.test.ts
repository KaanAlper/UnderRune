import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {chapterText} from './parity/chapter2-runner';
import {setSourceText} from '../src/remake/host/text';
import {spellInfo} from '../src/remake/deltarune/controller';
import {KEY} from '../src/remake/deltarune/keys';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {darkMarker} from '../src/remake/deltarune/battle';
import {oflashOf} from '../src/remake/deltarune/party';
import type {GmInstance} from '../src/remake/gm/runtime';
const equipment:EquipmentSource=JSON.parse(fs.readFileSync('public/generated/equipment.json','utf8')).chapters[2];
function start(id='ch2-82-weird',originalDraw=false){
 setSourceText(chapterText(2));return new EngineBattle(loadSprites(2),equipment,defaultLoadout(),id,11,{scoring:true,chapter2Host:(rt,o)=>{
  const h=installChapter2BossHost(rt,o),object=(name:string)=>h.objects[name];
  if(originalDraw)h.objects.obj_spell_snowgrave.events!.draw=(s,r)=>executeNeoSource(fs.readFileSync('extracted/chapter2_windows/code/gml_Object_obj_spell_snowgrave_Draw_0.gml','utf8'),s,r,{object,text:k=>chapterText(2)[k],call:(name,c,r,a)=>{
   if(name==='scr_dark_marker')return darkMarker(r,c,a[0],a[1],a[2]).id;
   if(name==='scr_oflash')return oflashOf(c,r).id;
   if(name==='scr_shakeobj'){const sh=r.create(object('obj_shakeobj'),c.x,c.y);c.shakeobj=sh.id;sh.target=c.id;r.userEvent(sh,0);return;}
   if(name==='draw_background_tiled_ext'){r.drawSpriteTiled(a[0],...a.slice(1) as [number,number,number,number,number,number]);return;}
   if(name==='draw_rectangle_colour'){const [x,y,rx,by,c1,c2,c3,c4]=a;r.drawTriangleColor(x,y,rx,y,rx,by,c1,c2,c3);r.drawTriangleColor(x,y,rx,by,x,by,c1,c3,c4);return;}
   if(name==='snd_play'||name==='audio_play_sound')return -1;
   if(['mus_volume','snd_volume','snd_pitch'].includes(name))return;
   throw Error('Unexpected Snowgrave source call: '+name);
  }},undefined,'draw');
  return h;
 }});
}
const state=(s:GmInstance)=>Object.fromEntries(Object.entries(s).filter(([k,v])=>!['layerEntry','frameCount'].includes(k)&&!(Array.isArray(v)&&v.length===0)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v]));
function keyFor(b:EngineBattle,spell=10){
 const g=b.rt.globals;if(g.myfight!==0||g.mnfight!==0)return KEY.z;
 const t=g.charturn,m=g.bmenuno,c=g.bmenucoord;
 if(m===0)return c[0][t]===(t===0?4:1)?KEY.z:KEY.right;
 if(m===2){const target=g.battlespell[t].indexOf(spell),at=c[2][t];return at===target?KEY.z:at%2!==target%2?KEY.right:at<target?KEY.down:KEY.up;}
 return KEY.z;
}
describe('Berdly Weird route',()=>{
 it('can abort the route by defeating Berdly with ordinary spells',()=>{
  const b=start(),rt=b.rt,g=rt.globals;for(const c of b.party)g.hp[c]=g.maxhp[c]=99999;
  let victoryActor=false;
  for(let f=0;f<8000&&!b.outcome;f++){
   const key=keyFor(b,9);if(g.myfight===0&&g.mnfight===0)g.tension=g.maxtension;
   rt.input.held.clear();if(f%8===0){rt.input.pressed.add(key);rt.input.held.add(key);}b.step();rt.draw();
   victoryActor||=rt.instances.some(i=>i.live&&i.object.name==='obj_berdlyb2_postBattle_noelle');
  }
  expect(b.outcome).toBe('victory');expect(g.flag[916]).toBe(1);expect(g.flag[915]).toBe(5);expect(victoryActor).toBe(true);
 },120000);
 it('enters the original story state without changing the normal encounter',()=>{
  const b=start(),g=b.rt.globals,n=start('ch2-82');
  expect(b.party).toEqual([1,4]);expect(g.flag[915]).toBe(5);expect(g.flag[916]).toBe(0);expect(g.spell[4].slice(0,4)).toEqual([2,8,9,10]);
  expect(g.charweapon[4]).toBe(13);expect(n.rt.globals.charweapon[4]).toBe(12);expect(n.rt.globals.spell[4]).not.toContain(10);
  const enemy=b.enemy!;expect(enemy.sideb_route).toBe(true);
  spellInfo(enemy,b.rt,10);expect(enemy.cost).toBe(g.maxtension);expect(enemy.spelltarget).toBe(3);
  g.flag[924]=4;spellInfo(enemy,b.rt,10);expect(enemy.spelltarget).toBe(0);expect(enemy.spellanim).toBe(1);
 });
 it('plays all four refusals, the spell and its ending with legal menu keys',()=>{
  const b=start(),reference=start('ch2-82-weird',true),rt=b.rt,g=rt.globals;
  // Survival/TP fixture only: all route progression is driven by the ordinary player menu.
  for(const run of [b,reference])for(const c of run.party)run.rt.globals.hp[c]=run.rt.globals.maxhp[c]=99999;
  let seenSpell=false,seenIce=false;
  for(let f=0;f<16000&&!b.outcome;f++){
   const key=keyFor(b);
   for(const run of [b,reference]){
    const r=run.rt;if(r.globals.myfight===0&&r.globals.mnfight===0)r.globals.tension=r.globals.maxtension;
    r.input.held.clear();if(f%8===0){r.input.pressed.add(key);r.input.held.add(key);}run.step();r.draw();
   }
   if(f%20===0){expect(rt.instances.map(state),`source Draw frame ${f}`).toEqual(reference.rt.instances.map(state));expect(rt.random.snapshot()).toEqual(reference.rt.random.snapshot());}
   seenSpell||=rt.instances.some(i=>i.live&&i.object.name==='obj_spell_snowgrave');
   seenIce||=rt.instances.some(i=>i.live&&i.sprite==='spr_berdly_ice');
  }
  expect(g.flag[924]).toBe(4);expect(seenSpell).toBe(true);expect(seenIce).toBe(true);expect(g.flag[915]).toBe(6);expect(g.char).toEqual([1,0,0]);expect(b.outcome).toBe('victory');
  expect(b.result?.encounter_id).toBe('ch2-82-weird');expect(b.result?.equipment.map(c=>c.character)).toEqual([1,4]);
 },180000);
});
