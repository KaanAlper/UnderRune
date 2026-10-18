import fs from 'node:fs';
import {expect,it} from 'vitest';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {setSourceText} from '../src/remake/host/text';
import {GmInstance} from '../src/remake/gm/runtime';
import {findController} from '../src/remake/deltarune/controller';
import {castSpell} from '../src/remake/deltarune/party';
import {loadSprites} from './parity/reference';

const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
const original=fs.readFileSync('extracted/chapter3_windows/code/gml_Object_obj_knight_enemy_Create_0.gml','utf8');

it('keeps the Knight Create mercy restriction after the fresh controller has finished creating',()=>{
 const strict=GmInstance.strict;GmInstance.strict=true;
 try{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
  const b=new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost});
  expect(original).toMatch(/cantspare\[0\] = 1;/);
  expect(findController(b.rt)!.cantspare[0]).toBe(1);
 }finally{GmInstance.strict=strict;}
});

it('retains UltraHeal growth when GO BACK starts another Knight battle',()=>{
 const strict=GmInstance.strict;GmInstance.strict=true;
 try{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
  const make=(session?:ReturnType<EngineBattle['session']>)=>new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost,secretBossAttempts:1,session});
  const first=make(),g=first.rt.globals,susie=first.rt.byId(g.charinstance[1])!;
  g.chartarget[1]=0;
  for(let i=0;i<3;i++){g.hp[1]=1;castSpell(susie,first.rt,11,1);}
  expect(g.flag[1045]).toBe(3);
  const retry=make(first.session());
  expect(retry.rt.globals.flag[1045]).toBe(3);
  const retrySusie=retry.rt.byId(retry.rt.globals.charinstance[1])!;
  retry.rt.globals.chartarget[1]=0;retry.rt.globals.hp[1]=1;
  castSpell(retrySusie,retry.rt,11,1);
  expect(retry.rt.globals.flag[1045]).toBe(4);
  expect(retry.rt.globals.hp[1]).toBe(1+Math.ceil(retry.rt.globals.battlemag[1]*1.5+5+4));
 }finally{GmInstance.strict=strict;}
});

it('offers Chapter 3 UltraHeal in the fresh Susie spell menu using its restored cost',()=>{
 const strict=GmInstance.strict;GmInstance.strict=true;
 try{
  const source=fs.readFileSync('extracted/chapter3_windows/code/gml_GlobalScript_scr_gamestart.gml','utf8');
  expect(source).toContain('global.spell[2][1] = 11;');
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
  const b=new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost,session:{globals:{},flags:{1045:3}}});
  const g=b.rt.globals,index=g.battlespell[1].indexOf(11);
  expect(index).toBeGreaterThanOrEqual(0);
  expect(g.battlespellcost[1][index]).toBe(225-Math.round(3*2.5));
 }finally{GmInstance.strict=strict;}
});

it('applies every unconditional source Susie sprite override to the freshly created hero',()=>{
 const strict=GmInstance.strict;GmInstance.strict=true;
 try{
  setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
  const b=new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost});
  const susie=b.rt.byId(b.rt.globals.charinstance[1])!;
  const block=original.split('with (obj_herosusie)')[1].split('with (obj_battleback)')[0];
  const assignments=[...block.replace(/if \(global\.charweapon\[2\] == 0\)\s*\{[^}]*\}/,'').matchAll(/(\w+sprite) = (spr_\w+);/g)];
  expect(assignments.length).toBe(10);
  for(const [,field,sprite] of assignments)expect(susie[field],field).toBe(sprite);
  for(let i=0;i<45;i++){b.step();b.rt.draw();}
  expect(b.phase).toBe('command');
  expect(susie.sprite).toBe('spr_susieb_idle_serious');
 }finally{GmInstance.strict=strict;}
});
