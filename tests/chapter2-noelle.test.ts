import {beforeAll,it,expect} from 'vitest';
import fs from 'node:fs';
import {GmRuntime} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {localizationDefaults} from '../tools/source-localization.mjs';
import {partyGlobals} from '../src/remake/deltarune/encounter';
import {chapter2StartStats} from '../src/remake/deltarune/chapter2';
import {HERO_DEFS,castSpell} from '../src/remake/deltarune/party';
import {spellInfo} from '../src/remake/deltarune/controller';
beforeAll(()=>{const dir='extracted/chapter2_windows/code/';setSourceText(Object.assign({},...fs.readdirSync(dir).filter(f=>f.endsWith('.gml')).map(f=>localizationDefaults(fs.readFileSync(dir+f,'utf8')))));});
const fixture=()=>{const rt=new GmRuntime(loadSprites(2),{seed:11});rt.globals.chapter=2;partyGlobals(rt,{...chapter2StartStats(true),char:[1,4,0],items:[],equipped:{1:{weapon:1,itemat:[0,0,0],itemdf:[0,0,0],itemmag:[0,0,0]},4:{weapon:12,itemat:[0,0,0],itemdf:[0,0,0],itemmag:[0,0,0]}}});return rt;};
it('initializes the real Noelle actor, source base stats, names, spells and animation frames',()=>{
 const rt=fixture();expect(rt.globals.hp[4]).toBe(90);expect(rt.globals.at[4]).toBe(3);expect(rt.globals.mag[4]).toBe(11);expect(rt.globals.df[4]).toBe(1);
 expect(rt.globals.charname[4]).toBe('Noelle');expect(rt.globals.spell[4].slice(0,3)).toEqual([2,8,9]);
 const noelle=rt.create(HERO_DEFS[3],80,180);expect([noelle.idlesprite,noelle.attackframes,noelle.spellframes,noelle.actreturnframes]).toEqual(['spr_noelleb_idle',4,6,11]);
});
it('keeps SleepMist and IceShock source costs, targets and ThornRing discount',()=>{
 const rt=fixture(),caller=rt.restore({name:'test',index:9999},100000,0,0);spellInfo(caller,rt,8);expect([caller.cost,caller.spelltarget,caller.spellnameb]).toEqual([80,0,'Sleep Mist']);
 spellInfo(caller,rt,9);expect([caller.cost,caller.spelltarget]).toEqual([40,2]);rt.globals.charweapon[4]=13;spellInfo(caller,rt,9);expect(caller.cost).toBe(20);
});
it('IceShock uses magic after the source 10 point offset and applies damage at Draw frame15',()=>{
 const rt=fixture(),g=rt.globals;Object.assign(g,{fighting:1,battlemag:[0,15,0],chartarget:[0,0,0],monster:[1,0,0],monsterx:[450,0,0],monstery:[150,0,0],monsterhp:[500,0,0],monsterdf:[0,0,0],monstertype:[46,0,0],hittarget:[0,0,0]});
 const enemy=rt.restore({name:'test_enemy',index:9998},100000,450,150,{myself:0,freezable:0}),noelle=rt.create(HERO_DEFS[3],80,180);g.monsterinstance=[enemy.id,0,0];
 castSpell(noelle,rt,9,1);const attack=rt.byId(noelle.attack)!;expect(attack.object.name).toBe('obj_icespell');expect(attack.damage).toBeGreaterThanOrEqual(240);expect(attack.damage).toBeLessThanOrEqual(250);expect(g.flag[925]).toBe(1);
 for(let i=0;i<14;i++)attack.object.events!.draw!(attack,rt);expect(g.monsterhp[0]).toBe(500);
 attack.object.events!.draw!(attack,rt);expect(g.monsterhp[0]).toBe(500-noelle.damage);expect(g.spelldelay).toBe(40);
});
it('SleepMist staggers each living enemy and spares only a tired target after12 Draw frames',()=>{
 const rt=fixture(),g=rt.globals;Object.assign(g,{fighting:1,chartarget:[0,0,0],monster:[1,1,0],monstertype:[33,33,0],monsterx:[450,500,0],monstery:[150,100,0],monsterstatus:[1,0,0],monstergold:[0,0,0,0],monsterexp:[0,0,0,0]});
 const a=rt.restore({name:'tired',index:9000},100000,450,150,{myself:0}),b=rt.restore({name:'awake',index:9001},100001,500,100,{myself:1});g.monsterinstance=[a.id,b.id,0];const n=rt.create(HERO_DEFS[3],80,180);castSpell(n,rt,8,1);
 const mist=rt.instances.filter(s=>s.object.name==='obj_spell_mist');expect(mist.map(s=>s.initdelay)).toEqual([0,10]);expect(g.spelldelay).toBe(40);
 for(let i=0;i<12;i++)for(const s of mist)s.object.events!.draw!(s,rt);expect(g.monster).toEqual([0,1,0]);expect(g.flag[51]).toBe(3);
});
