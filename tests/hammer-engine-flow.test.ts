import {it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter4BossHost} from '../src/remake/host/chapter4-bosses';
import {loadSprites} from './parity/reference';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {setSourceText} from '../src/remake/host/text';
import {chapterText} from './parity/chapter2-runner';
import {buildHammerPattern} from '../src/remake/bosses/hammer-of-justice/patterns';
import {damage} from '../src/remake/deltarune/battle';
import {castSpell} from '../src/remake/deltarune/party';
import {findController} from '../src/remake/deltarune/controller';
import {deviceChoice} from '../src/remake/deltarune/battle-end';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
it('freezes the run clock when Hammer commits its ending, before ending dialogue and party cleanup',()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{chapterHost:installChapter4BossHost,scoring:true}),rt=b.rt,g=rt.globals;for(let f=0;f<50;f++)b.step();Object.assign(b.enemy!,{endcon:1,endtimer:0,end_cutscene_version:1,introtalkcon:-1,attacked:1,talked:1});g.myfight=-1;g.mnfight=-1;b.step();expect(b.result).not.toBeNull();const duration=b.result!.duration_ms;
 for(let f=0;f<1200&&!b.ending;f++){rt.input.pressed=new Set(f%8===0?[90,67]:[]);b.step();rt.draw();}expect(b.ending).toBe('victory');expect(b.result!.duration_ms).toBe(duration);expect(b.result!.equipment.map(e=>e.character)).toEqual([2]);
});
for(const [direction,result] of [[37,'retry'],[39,'menu']] as const)it(`leaves a real Hammer defeat through ${result}`,()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost}),rt=b.rt,g=rt.globals;for(let f=0;f<50;f++)b.step();
 const bullet=rt.create({name:'test_defeat_contact',index:-998},0,0);Object.assign(bullet,{damage:999,target:0,element:0});g.inv=-1;g.heartx=310;g.hearty=160;damage(bullet,rt);b.step();expect(b.ending).toBe('defeat');
 for(let f=0;f<2000&&!rt.exists(deviceChoice);f++){rt.input.pressed=new Set(f%6===0?[90]:[]);b.step();rt.draw();}expect(rt.exists(deviceChoice)).toBe(true);
 for(let f=0;f<12;f++)b.step();rt.input.pressed=new Set([direction]);b.step();rt.input.pressed=new Set([90]);b.step();
 for(let f=0;f<600&&!b.outcome;f++){rt.input.pressed=new Set(f%6===0?[90]:[]);b.step();rt.draw();}expect(b.outcome).toBe('defeat');expect(b.afterDefeat).toBe(result);
});
it('keeps source justice dialogue history and growing heal state across retry',()=>{
 setSourceText(chapterText(4));const a=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost});a.rt.globals.justice_reached_25_first_time=1;a.rt.globals.justice_attacked_twice=3;a.rt.globals.flag[1045]=4;
 const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost,session:a.session()});expect(b.rt.globals.justice_reached_25_first_time).toBe(1);expect(b.rt.globals.justice_attacked_twice).toBe(3);expect(b.rt.globals.flag[1045]).toBe(4);expect(b.enemy!.progress).toBe(0);
});
it('shows FULL when OKHeal reaches maximum HP',()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost}),rt=b.rt,g=rt.globals;for(let f=0;f<50;f++)b.step();g.chartarget[0]=0;castSpell(findController(rt)!,rt,11,0);const hero=rt.byId(g.charinstance[0])!;expect(rt.byId(hero.dmgwr)!.specialmessage).toBe(3);
});
it('steals a chosen bag item through keyboard menus and disables the item command',()=>{
 setSourceText(chapterText(4));const loadout=defaultLoadout();loadout.items=[1];const source={...equipment,items:[{id:1,name:'Darker Candy',description:'',usable:true,target:1}]};
 const b=new EngineBattle(loadSprites(4),source,loadout,'ch4-160',11,{development:true,chapterHost:installChapter4BossHost}),rt=b.rt,g=rt.globals;for(let f=0;f<50;f++)b.step();
 const c=findController(rt)!;g.hp[2]=100;g.bmenucoord[0][0]=2;let steal=false;
 for(let f=0;f<500;f++){rt.input.pressed=new Set(f%8===0?[90,67]:[]);rt.input.held=new Set([38]);b.step();rt.draw();steal||=rt.instances.some(s=>s.live&&s.object.name==='obj_gerson_item_steal_anim');expect(g.hp[2]).toBeLessThanOrEqual(100);if(c.disableitembutton===1&&!rt.instances.some(s=>s.live&&s.object.name==='obj_gerson_item_steal_anim'))break;}
 expect(steal).toBe(true);expect(g.item[0]).toBe(0);expect(c.disableitembutton).toBe(1);
});
it('OKHeal grows its source counter and Hammer progress; Rude Buster is reflected without ordinary HP damage',()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost}),rt=b.rt,g=rt.globals;
 for(let f=0;f<50;f++)b.step();const enemy=b.enemy!,c=findController(rt)!;Object.assign(enemy,{introtalkcon:-1,talked:1,attacked:1});g.myfight=4;g.mnfight=-1;g.chartarget[0]=0;g.hp[2]=10;
 castSpell(c,rt,11,0);expect(g.flag[1045]).toBe(1);expect(enemy.progress).toBe(9);expect(g.spelldelay).toBe(70);expect(g.hp[2]).toBe(10+g.battlemag[0]*2+24);
 const hp=g.monsterhp[0];castSpell(c,rt,4,0);expect(enemy.justice_rudebuster).toBe(1);let bolt=false;
 for(let f=0;f<400;f++){rt.input.pressed=new Set();b.step();rt.draw();bolt||=rt.instances.some(s=>s.live&&s.object.name==='obj_rudebuster_bolt');if(enemy.rudebusterhitcount>=1)break;}
 expect(bolt).toBe(true);expect(enemy.rudebusterhitcount).toBeGreaterThanOrEqual(1);expect(g.monsterhp[0]).toBe(hp);
 for(let f=0;f<500;f++){const incoming=rt.instances.find(s=>s.live&&s.object.name==='obj_gerson_rudebuster');rt.input.pressed=new Set(incoming&&incoming.susieattackcon===0&&incoming.x<330?[90]:[]);b.step();rt.draw();if(enemy.rudebusterhitcountmax>=2&&enemy.state===0)break;}
 expect(enemy.rudebusterhitcountmax).toBe(2);expect(enemy.progress).toBeGreaterThan(9);expect(g.monsterhp[0]).toBe(hp);
});
for(const version of [0,1])it(`finishes source ending ${version} through the real controller and writer`,()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost}),rt=b.rt,g=rt.globals;
 for(let f=0;f<50;f++)b.step();const enemy=rt.instances.find(s=>s.live&&s.object.name==='obj_hammer_of_justice_enemy')!;
 Object.assign(enemy,{endcon:1,endtimer:0,end_cutscene_version:version,introtalkcon:-1,attacked:1,talked:1});g.myfight=-1;g.mnfight=-1;
 for(let f=0;f<1800&&!b.ending;f++){rt.input.pressed=new Set(f%8===0?[90,67]:[]);b.step();rt.draw();}
 expect(b.ending).toBe('victory');
});
it('keeps Hammer minimum damage text separate from HP loss and caches the source party HP',()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost}),rt=b.rt,g=rt.globals;
 for(let f=0;f<50;f++)b.step();const bullet=rt.create({name:'test_contact',index:-999},0,0);Object.assign(bullet,{damage:1,target:0,element:0});g.inv=-1;g.invc=.5;g.battledf[0]=0;const hp=g.hp[2];damage(bullet,rt);
 expect(g.hp[2]).toBe(hp-1);expect(bullet.tdamage).toBe(5);expect(bullet.hpdiff).toBe(5);expect(rt.byId(bullet.dmgwriter)!.damage).toBe(5);expect(g.damage_cache).toEqual([hp,200,200]);expect(g.inv).toBe(20);
});
it('opens a fresh Hammer battle with solo Susie and a real command menu',()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost});
 for(let f=0;f<50;f++){b.step();b.rt.draw();}
 expect(b.rt.globals.char).toEqual([2,0,0]);expect(b.phase).toBe('command');
 const enemy=b.rt.instances.find(s=>s.live&&s.object.name==='obj_hammer_of_justice_enemy')!;expect(enemy).toBeDefined();
 expect(b.rt.instances.filter(s=>s.live&&s.object.name==='obj_herosusie')).toHaveLength(1);
});
for(const turn of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])it(`runs source turn ${turn} through the real actor registry`,()=>{
 setSourceText(chapterText(4));let objects:any;const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:(r,o)=>{const h=installChapter4BossHost(r,o);objects=h.objects;return h;}}),rt=b.rt,g=rt.globals;
 for(let f=0;f<50;f++){b.step();rt.draw();}
 const enemy=rt.instances.find(s=>s.live&&s.object.name==='obj_hammer_of_justice_enemy')!;
 // Isolated attack integration fixture: keep health stable to exercise every actor family, not a scored legal run.
 Object.assign(enemy,{turn:0,trueturn:0,introtalkcon:-1,talked:1,attacked:1,attackcon:1});for(let i=0;i<=turn;i++)buildHammerPattern(enemy,rt);g.myfight=-1;g.mnfight=2;g.turntimer=9999;
 for(const w of rt.instances.filter(s=>s.live&&s.object.name==='obj_writer'))rt.destroy(w);
 rt.create(objects.obj_growtangle,320,170);rt.create(objects.obj_heart,310,160);
 for(let f=0;f<2500;f++){
  g.hp[2]=g.maxhp[2];rt.input.pressed=new Set(f%8===0?[90,67]:[]);rt.input.held=new Set([38]);b.step();rt.draw();
  if(enemy.attackcon===0&&enemy.attackcount>=enemy.attackcountmax)break;
 }
 expect(enemy.attackcount).toBeGreaterThanOrEqual(enemy.attackcountmax);
});
it('keyboard FIGHT proceeds through the source introduction into live green-soul attacks',()=>{
 setSourceText(chapterText(4));const b=new EngineBattle(loadSprites(4),equipment,defaultLoadout(),'ch4-160',11,{development:true,chapterHost:installChapter4BossHost});
 let green=false,spears=false;
 for(let f=0;f<1200;f++){
  b.rt.input.pressed=new Set(f%8===0?[90,67]:[]);b.rt.input.held=new Set([38]);b.step();b.rt.draw();
  green||=b.rt.instances.some(s=>s.live&&s.object.name==='obj_spearblocker');spears||=b.rt.instances.some(s=>s.live&&s.object.name==='obj_spearshot');
  if(green&&spears)break;
 }
 expect(green).toBe(true);expect(spears).toBe(true);
});
