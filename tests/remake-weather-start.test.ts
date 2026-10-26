import {expect,it} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {chapterText} from './parity/chapter2-runner';
import {GmInstance} from '../src/remake/gm/runtime';
import fs from 'node:fs';
import {spriteBank} from '../src/remake/gm/sprites';
import {menuScript} from '../tools/oracle-scripts.mjs';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
GmInstance.strict=true;
it('packs every dynamic weather portrait, mascot and ACT line used by the static ports',()=>{
 const bundle=JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')),bank=spriteBank(bundle);
 for(const file of ['enemies','attacks','controller-support']){
  const code=fs.readFileSync(`src/remake/bosses/lanino-elnina/${file}.ts`,'utf8');
  for(const name of new Set(code.match(/\bspr_(?:enemy_(?:elnina|lanino)|ch3_mascot_(?:moon|cloud))_[a-z0-9_]+/g)??[]))expect(bank.get(name),name).toBeDefined();
  for(const key of new Set(code.match(/\bobj_(?:lanino_enemy|elnina_enemy|dbulletcontroller)_slash_[A-Za-z0-9_]+/g)??[]))expect(bundle.text[key],key).toBeDefined();
 }
});
for(const packed of [false,true])it(`starts and finishes the real weather introduction (${packed?'packed':'source'} resources)`,()=>{
 const bundle=JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8'));
 setSourceText(packed?bundle.text:chapterText(3));
 const bank=packed?spriteBank(bundle):loadSprites(3);
 const battle=new EngineBattle(bank,equipment,defaultLoadout(),'ch3-113',11,{development:true,chapterHost:installChapter3BossHost});
 const rt=battle.rt,g=rt.globals;
 for(let f=0;f<500;f++){
  if(f%8===0)rt.input.pressed.add(90);
  battle.step();rt.draw();
  if(rt.instances.find(i=>i.live&&i.object.name==='obj_elnina_lanino_controller')?.intro===4)break;
 }
 const controller=rt.instances.find(i=>i.live&&i.object.name==='obj_elnina_lanino_controller')!;
 expect(controller.intro).toBe(4);expect(g.monstertype).toEqual([61,60,0]);expect(g.monsterhp.slice(0,2)).toEqual([8880,8880]);
 expect(g.battlespellname[1][0]).toBe(g.battlespellname[2][0]);
 expect(rt.instances.find(i=>i.live&&i.object.name==='obj_herosusie')?.idlesprite).toBe('spr_susieb_idle');
});
it('completes the full weather director and 99-TV ending through legal menu input',()=>{
 const bundle=JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8'));setSourceText(bundle.text);
 const b=new EngineBattle(spriteBank(bundle),equipment,defaultLoadout(),'ch3-113',11,{development:true,chapterHost:installChapter3BossHost});
 const rt=b.rt,g=rt.globals,inputs=menuScript(10000),phases=new Set<number>();
 for(const c of [1,2,3])g.hp[c]=g.maxhp[c]=99999;
 for(let f=0;f<10000&&!b.outcome;f++){
  const event=inputs[f];
  for(const key of event?.keysPressed??[]){if(!rt.input.held.has(key))rt.input.pressed.add(key);rt.input.held.add(key);}
  for(const key of event?.keysReleased??[]){rt.input.held.delete(key);rt.input.released.add(key);}
  b.step();rt.draw();
  const director=rt.instances.find(i=>i.live&&i.object.name==='obj_elnina_lanino_controller');if(director)phases.add(director.turns);
 }
 expect([...phases]).toContain(7);expect(b.outcome).toBe('victory');
},120000);
