import {it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import fs from 'node:fs';
import {setSourceText,sourceText} from '../src/remake/host/text';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it('starts a fresh Chapter 3 battle and reaches commands without a restored reference snapshot',()=>{
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
 const b=new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost});
 for(let i=0;i<45;i++){b.step();b.rt.draw();}
 expect(b.phase).toBe('command');expect(b.party).toEqual([1,2,3]);expect(b.enemy?.object.name).toBe('obj_knight_enemy');
});
it("heals with Chapter 3's items and UltraHeal, an eighth more with armour 26 on the caster",async()=>{
 const {castSpell,spellText}=await import('../src/remake/deltarune/party');
 const {spellInfo}=await import('../src/remake/deltarune/controller');
 setSourceText(JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8')).text);
 const b=new EngineBattle(loadSprites(3),equipment,defaultLoadout(),'ch3-115',11,{development:true,chapterHost:installChapter3BossHost});
 for(let i=0;i<45;i++){b.step();b.rt.draw();}
 const rt=b.rt,g=rt.globals,susie=rt.byId(g.charinstance[1])!;
 g.chartarget[1]=0;g.chararmor1[2]=0;g.chararmor2[2]=0;
 g.hp[1]=1;castSpell(susie,rt,234,1);expect(g.hp[1]).toBe(101);
 g.hp[1]=1;g.chararmor1[2]=26;castSpell(susie,rt,234,1);expect(g.hp[1]).toBe(1+100+13);
 g.hp[1]=1;g.chararmor1[2]=0;castSpell(susie,rt,218,1);expect(g.hp[1]).toBe(11);
 spellText(susie,rt,218,1);expect(g.msg[0]).toBe(sourceText('scr_text_slash_scr_text_gml_10567_0').replace('~1',g.charname[2]));
 g.flag[1045]=0;g.hp[1]=1;castSpell(susie,rt,11,1);expect(g.flag[1045]).toBe(1);expect(g.hp[1]).toBe(1+Math.ceil(g.battlemag[1]*1.5+5+1));
 spellInfo(susie,rt,11);expect(susie.cost).toBe(223);expect(susie.spellnameb).toBe(sourceText('scr_spellinfo_slash_scr_spellinfo_gml_153_0'));
});
