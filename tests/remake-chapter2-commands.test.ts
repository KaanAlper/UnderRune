import {beforeEach,describe,it,expect,vi} from 'vitest';
import fs from 'node:fs';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {C} from '../src/remake/gm/graphics';
import {setSourceText} from '../src/remake/host/text';
import {partyGlobals,encounterSetup,monsterSetup} from '../src/remake/deltarune/encounter';
import {battleControllerFull,nextAct,itemInfo} from '../src/remake/deltarune/controller';
import {monsterParent,KEY} from '../src/remake/deltarune/battle';
import {chapter2StartStats,actSelectChapter2,actSimulChapter2} from '../src/remake/deltarune/chapter2';
import {damageEnemy,HERO_DEFS,castSpell,spellText,healAnim} from '../src/remake/deltarune/party';
import {teaAmountChapter2} from '../src/remake/deltarune/chapter2';
import {spamtonNeo} from '../src/remake/bosses/spamton-neo/neo';
import {localizationDefaults} from '../tools/source-localization.mjs';

// Test text comes from the user's source archive; only the keys are kept in the repo.
const text:Record<string,string>={};
const hasChapter2Source=fs.existsSync('extracted/chapter2_windows/code/gml_GlobalScript_scr_monstersetup.gml');
for(const name of ['scr_monstersetup','scr_encountersetup','scr_spellinfo','scr_initialize_charnames','scr_iteminfo','scr_spelltext']){
 if(!hasChapter2Source)break;
 const source=fs.readFileSync(`extracted/chapter2_windows/code/gml_GlobalScript_${name}.gml`,'utf8');
 for(const match of source.matchAll(/(?:stringset(?:sub)?loc|msgset(?:sub)?loc|msgnextloc)\((?:\d+, )?"((?:[^"\\]|\\.)*)"[^\r\n]*?"((?:scr|obj)_[^"]+)"\)/g))text[match[2]]=JSON.parse('"'+match[1]+'"');
}
if(hasChapter2Source)Object.assign(text,localizationDefaults(fs.readFileSync('extracted/chapter2_windows/code/gml_Object_obj_battlecontroller_Step_0.gml','utf8')));
beforeEach(()=>setSourceText(text));
// A stand-in NEO with the real one's hooks (what the shared engine does differently for him).
const enemy:GmObjectDef={name:'obj_spamton_neo_enemy',index:702,parent:monsterParent,hooks:spamtonNeo.hooks,events:{user12:monsterSetup}} as GmObjectDef;
function make(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}));rt.globals.chapter=2;
 partyGlobals(rt,{char:[1,2,3],...chapter2StartStats(),equipped:{},items:[]});
 encounterSetup(rt,61,{obj_spamton_neo_enemy:enemy});const controller=rt.create(battleControllerFull,0,0);
 for(let i=0;i<4;i++)rt.step();
 return {rt,g:rt.globals,c:controller,m:rt.byId(rt.globals.monsterinstance[0])!};
}
const press=(rt:GmRuntime,key:number)=>{rt.input.pressed.add(key);rt.step();for(let i=0;i<3;i++)rt.step();};
describe.skipIf(!hasChapter2Source)('Chapter 2 source command foundation',()=>{
 it('rejects an unported hero instead of creating an invisible party member',()=>{
  const {rt,g}=make();g.char[0]=4;expect(()=>rt.create(battleControllerFull,0,0)).toThrow(/hero 4.*not ported/i);
 });
 it('keeps spell-table setup working variables on its caller',()=>{
  const {g,c}=make();expect([c.__i,c.__fj,c.__ib]).toEqual([3,12,g.battleactcount[2]+11]);
 });
 it('processes simultaneous left/down item input in the original event order',()=>{
  const {rt,g,c}=make();g.bmenuno=4;g.item[0]=1;g.item[1]=8;g.item[2]=9;
  for(let i=0;i<3;i++)c.tempitem[i][0]=g.item[i];rt.input.pressed.add(KEY.left);rt.input.pressed.add(KEY.down);rt.step();
  expect([g.bmenucoord[4][0],c.itemcoord,c.cango]).toEqual([1,1,0]);
 });
 it('applies Chapter 2 TP and equipment gold bonuses in source order at victory',()=>{
  const {rt,g,c}=make();g.tension=100;g.monstergold[3]=100;g.charweapon[1]=8;g.chararmor1[2]=8;g.chararmor2[3]=21;c.victory=1;
  rt.step();expect(g.gold).toBe(Math.floor(126*1.05*1.3));
 });
 it('keeps caller fields while propagating the chosen bag through the end-of-commands slot',()=>{
  const {rt,g,c}=make();g.charturn=2;g.bmenuno=1;c.onebuffer=-1;c.twobuffer=-1;press(rt,KEY.z);
  expect(c.prevturn).toBe(2);expect(c.tempitem[0]).toHaveLength(4);expect(c.__hiti).toBe(3);expect(c.__noactorsi).toBe(3);expect(c.t_siner).toBe(8);
 });
 it('writes ACT selection tables before Draw and resets the ACT cursor after cancellation',()=>{
  const {rt,g,c}=make();g.bmenuno=9;g.bmenucoord[9][0]=2;rt.step();
  expect(c.thisenemy).toBe(0);expect(c.__acti).toBe(6);expect(c.acttpcost).toEqual(g.actcost[0]);
  // X also reaches the target-menu block later in the same source event, returning to the command row.
  press(rt,KEY.x);expect(g.bmenuno).toBe(0);expect(g.bmenucoord[9][0]).toBe(0);
 });
 it('uses gamestart stats, encounter 61 positions and only normal monster 50 ACTs',()=>{
  const {g}=make();
  expect(g.maxhp.slice(1)).toEqual([120,140,100]);expect(g.at.slice(1)).toEqual([12,16,10]);expect(g.mag.slice(1)).toEqual([0,1,9]);
  expect(g.heromakex).toEqual([80,80,80]);expect(g.heromakey).toEqual([60,130,210]);expect(g.monstermakex[0]).toBe(460);expect(g.monstermakey[0]).toBe(80);
  expect(g.monstertype).toEqual([50,0,0]);expect(g.monsterhp[0]).toBe(4809);expect(g.monsterat[0]).toBe(13);expect(g.monsterdf[0]).toBe(0);
  expect(g.actname[0].slice(0,3)).toEqual(['Check','Snap','SnapAll']);expect(g.actactor[0][2]).toBe(4);
  expect(g.battlespell[1].slice(0,4)).toEqual([-1,-1,4,0]);expect(g.battlespellcost[1].slice(0,3)).toEqual([0,80,125]);
  expect(g.battlespellname[2].slice(0,4)).toEqual(['Snap','FluffyGuard','Pacify','Heal Prayer']);expect(g.battlespellcost[2].slice(0,4)).toEqual([0,40,40,80]);
 });
 it('selects Susie ACTs via the merged menu, charges TP once, then targets the enemy',()=>{
  const {rt,g,m}=make();g.charturn=1;g.tension=100;
  press(rt,KEY.right);press(rt,KEY.z);expect(g.bmenuno).toBe(2);
  press(rt,KEY.right);press(rt,KEY.z);expect(g.bmenuno).toBe(13);expect(g.tension).toBe(100);
  press(rt,KEY.z);expect(g.charturn).toBe(2);expect(g.tension).toBe(20);expect(m.actingsus).toBe(2);
  expect(g.actingsingle).toEqual([0,1,0]);expect(g.charaction[1]).toBe(9);expect(g.acting).toEqual([0,0,0]);
 });
 it('dispatches actor ACTs even when Kris defended, then advances to Ralsei and attack phase',()=>{
  const {rt,g,c,m}=make();g.charturn=1;actSelectChapter2(c,rt,0,1);g.charturn=2;actSelectChapter2(c,rt,0,0);
  nextAct(rt,m);expect(g.currentactingchar).toBe(1);expect(m.actconsus).toBe(1);expect(m.actconral??0).toBe(0);
  nextAct(rt,m);expect(g.currentactingchar).toBe(2);expect(m.actconsus).toBe(0);expect(m.actconral).toBe(1);
  nextAct(rt,m);expect(g.currentactingchar).toBe(0);expect(m.actingsus).toBe(0);expect(m.actingral).toBe(0);expect(g.myfight).toBe(1);
 });
 it('SnapAll reserves the whole party while actor-specific ACTs reserve only their own slot',()=>{
  const {rt,g,c,m}=make();actSelectChapter2(c,rt,0,2);
  expect(m.acting).toBe(3);expect(g.acting).toEqual([1,1,1]);expect(g.actingsingle).toEqual([1,0,0]);expect(g.charaction).toEqual([9,9,9]);
 });
 it('dispatches simultaneous actor flags and orders without inventing ACT effects',()=>{
  const {rt,g,c,m}=make();g.actsimul[0][1]=1;g.actsimulsus[0][0]=1;g.actsimulral[0][0]=1;
  actSelectChapter2(c,rt,0,1);g.charturn=1;actSelectChapter2(c,rt,0,0);g.charturn=2;actSelectChapter2(c,rt,0,0);
  actSimulChapter2(rt,c);expect(g.actingsingle).toEqual([0,0,0]);expect(m.simultotal).toBe(3);
  expect([m.simulorderkri,m.simulordersus,m.simulorderral]).toEqual([0,1,2]);expect([m.actcon,m.actconsus,m.actconral]).toEqual([0,1,1]);expect(g.mercymod[0]).toBe(0);
 });
 it('undoes Susie ACT selection and restores the TP snapshot when going back',()=>{
  const {rt,g,m}=make();g.charturn=1;g.tension=100;g.temptension[1]=100;
  press(rt,KEY.right);press(rt,KEY.z);press(rt,KEY.right);press(rt,KEY.z);press(rt,KEY.z);
  press(rt,KEY.x);expect(g.charturn).toBe(1);expect(g.tension).toBe(100);expect(m.actingsus).toBe(0);expect(g.actingsingle[1]).toBe(0);
 });
 it('draws the merged ACT names and descriptions rather than the raw spell table',()=>{
  const {rt,g}=make();g.charturn=1;g.bmenuno=2;g.bmenucoord[2][1]=1;
  const draw=vi.spyOn(rt,'drawText');rt.draw();const lines=draw.mock.calls.map(call=>call[2]);
  expect(lines).toContain('Supercharge');expect(lines).toContain('Charge\nfaster');
 });
 it('starts Susie ACT dispatch after Kris and Ralsei DEFEND, and casts the shifted spell id correctly',()=>{
  const {rt,g,m}=make();g.tension=250;
  for(let i=0;i<4;i++)press(rt,KEY.right);press(rt,KEY.z);
  press(rt,KEY.right);press(rt,KEY.z);press(rt,KEY.z);press(rt,KEY.z);
  for(let i=0;i<4;i++)press(rt,KEY.right);press(rt,KEY.z);
  expect(g.myfight).toBe(3);expect(g.currentactingchar).toBe(1);expect(m.actconsus).toBe(1);
  nextAct(rt,m);expect(g.myfight).toBe(1);
  const other=make();other.g.charturn=1;other.g.tension=250;
  press(other.rt,KEY.right);press(other.rt,KEY.z);press(other.rt,KEY.down);press(other.rt,KEY.z);expect(other.g.bmenuno).toBe(3);
  press(other.rt,KEY.z);expect(other.g.charspecial[1]).toBe(4);expect(other.g.tension).toBe(125);
 });
 it('uses Chapter 2 Ralsei sprites and the source ACT frame counts',()=>{
  const {rt,g}=make(),h=rt.byId(g.charinstance[2])!;
  expect(h.idlesprite).toBe('spr_ralsei_idle');expect(h.actsprite).toBe('spr_ralsei_act');expect([h.actframes,h.actreturnframes,h.attackframes,h.itemframes,h.defendframes]).toEqual([8,12,6,6,7]);
 });
 it('starts the NEO mercy ending at Alarm 2 instead of another turn',()=>{
  const {rt,g,c,m}=make();g.mercymod[0]=100;g.myfight=-1;g.mnfight=2;
  battleControllerFull.events!.alarm2!(c,rt);
  expect(m.endcon).toBe(1);expect(g.myfight).toBe(-1);expect(rt.pendingRoom).toBeNull();
 });
 it('leaves NEO alive at nonpositive HP after physical or spell damage for source enemy ending dispatch',()=>{
  const {rt,g}=make(),h=rt.byId(g.charinstance[0])!;g.monsterhp[0]=1;h.points=150;g.chartarget[0]=0;
  HERO_DEFS[0].events!.alarm1!(h,rt);expect(g.monsterhp[0]).toBeLessThanOrEqual(0);expect(g.monster[0]).toBe(1);
  g.monsterhp[0]=1;h.caster=0;damageEnemy(h,rt,0,100);expect(g.monster[0]).toBe(1);
 });
 it('uses Chapter 2 common item keys and changed healing amounts without changing Chapter 1',()=>{
  const {rt,g,c}=make();itemInfo(c,7,rt);expect(c.itemnameb).toBe('Spincake');expect(c.itemdescb).toBe('Heals#team#140HP');
  itemInfo(c,9,rt);expect(c.itemnameb).toBe('LancerCookie');
  g.hp=[0,1,1,1];castSpell(c,rt,207,0);expect(g.hp.slice(1)).toEqual([120,140,100]);
  g.hp=[0,1,1,1];castSpell(c,rt,211,0);expect(g.hp.slice(1)).toEqual([71,71,71]);
  g.chartarget[0]=1;g.hp[2]=1;castSpell(c,rt,212,0);expect(g.hp[2]).toBe(81);
  g.chartarget[0]=2;g.hp[3]=1;castSpell(c,rt,213,0);expect(g.hp[3]).toBe(51);
  g.hp[3]=1;castSpell(c,rt,215,0);expect(g.hp[3]).toBe(51);
 });
 it('sets every Chapter 2 inventory item target, consumption and replacement from scr_iteminfo',()=>{
  const {rt,c}=make();
  const source=fs.readFileSync('extracted/chapter2_windows/code/gml_GlobalScript_scr_iteminfo.gml','utf8');
  for(const match of source.matchAll(/case (\d+):([\s\S]*?)(?:break;)/g)){
   const id=Number(match[1]);itemInfo(c,id,rt);
   const target=Number(match[2].match(/itemtarget = (\d+);/)?.[1]??0),usable=Number(match[2].match(/usable = (\d+);/)?.[1]??0),replace=Number(match[2].match(/replaceable = (\d+);/)?.[1]??0);
   expect({target:c.itemtarget,usable:c.usable,replace:c.replaceable},`item ${id}`).toEqual({target,usable,replace});
   if(id>0)expect(c.itemnameb,`item ${id}`).not.toBe(' ');
  }
 });
 it('DD-Burger becomes Darkburger in the next actor bag and can be undone',()=>{
  const {rt,g,c}=make();g.item[0]=22;for(let i=0;i<3;i++)c.tempitem[0][i]=22;
  press(rt,KEY.right);press(rt,KEY.right);press(rt,KEY.z);expect(g.bmenuno).toBe(4);press(rt,KEY.z);press(rt,KEY.z);
  expect(g.charspecial[0]).toBe(222);expect(c.tempitem[0][1]).toBe(8);press(rt,KEY.x);expect(c.tempitem[0][0]).toBe(22);
 });
 for(const [item,amount] of [[27,80],[28,125],[29,250]])it(`TP item ${item} raises tension immediately and is consumed before the next actor chooses`,()=>{
  const {rt,g,c}=make();g.item[0]=item;for(let i=0;i<3;i++)c.tempitem[0][i]=item;g.tension=20;g.temptension[0]=20;
  press(rt,KEY.right);press(rt,KEY.right);press(rt,KEY.z);press(rt,KEY.z);
  expect(g.tension).toBe(Math.min(250,20+amount));expect(g.charturn).toBe(1);expect(c.tempitem[0][1]).toBe(0);expect(g.charaction[0]).toBe(0);
  expect(rt.all(healAnim).some(a=>a.particlecolor===C.orange)).toBe(true);
  press(rt,KEY.x);expect(g.tension).toBe(20);expect(c.tempitem[0][0]).toBe(item);
 });
 it('uses the exact tea relationship matrix and battle-only minimum',()=>{
  const {rt}=make();rt.globals.fighting=0;
  expect([1,2,3,4].map(tea=>[1,2,3,4].map(char=>teaAmountChapter2(rt,tea,char)))).toEqual([[10,120,120,70],[120,10,120,400],[60,120,10,50],[70,120,50,10]]);
  rt.globals.fighting=1;expect(teaAmountChapter2(rt,1,1)).toBe(40);
 });
 it('heals all extended items, revives downed allies and stops S.POISON at 1 HP',()=>{
  const {rt,g,c}=make();g.maxhp=[0,999,999,999];
  for(const [spell,expected] of [[216,80],[218,40],[219,70],[220,60],[221,120],[222,60],[223,120],[224,100],[226,100]]){
   g.hp[1]=1;g.chartarget[0]=0;castSpell(c,rt,spell,0);expect(g.hp[1],`spell ${spell}`).toBe(1+expected);
  }
  g.hp=[0,1,1,1];castSpell(c,rt,225,0);expect(g.hp.slice(1)).toEqual([31,31,31]);
  g.maxhp=[0,120,140,100];g.hp=[0,-10,30,-20];castSpell(c,rt,230,0);expect(g.hp.slice(1)).toEqual([30,40,25]);
  g.hp=[0,-10,30,-20];castSpell(c,rt,231,0);expect(g.hp.slice(1)).toEqual([120,80,100]);
  g.chartarget[0]=1;g.hp[2]=5;castSpell(c,rt,232,0);const h=rt.byId(g.charinstance[1])!;expect(g.hp[2]).toBe(45);expect(h.poisonamount).toBe(60);
  const draw=HERO_DEFS[1].events!.draw!;for(let i=0;i<600;i++)draw(h,rt);expect(g.hp[2]).toBe(1);expect(h.poisonamount).toBe(0);
 });
 it('uses exact Chapter 2 item writer keys, including the changed ReviveMint/RouxlsRoux keys',()=>{
  const {rt,g,c}=make();for(const spell of [202,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233]){
   g.msg.fill(' ');spellText(c,rt,spell,0);expect(g.msg[0],`spell ${spell}`).toMatch(/^\* Kris /);expect(g.msg[0],`spell ${spell}`).not.toContain('~1');
   if(spell===217)expect(g.msg[1]).toBe(text.scr_spelltext_slash_scr_spelltext_gml_237_0);
  }
 });
 it('keeps reusable battle items in the bag and emits the inert source text for normal NEO',()=>{
  for(const item of [3,4,17,33]){
   const {rt,g,c}=make();g.item[0]=item;for(let i=0;i<3;i++)c.tempitem[0][i]=item;
   press(rt,KEY.right);press(rt,KEY.right);press(rt,KEY.z);press(rt,KEY.z);
   if(item===4)press(rt,KEY.z);
   expect(g.charturn,`item ${item}`).toBe(1);expect(c.tempitem[0][1],`item ${item}`).toBe(item);
   const hp=[...g.hp];castSpell(c,rt,item+200,0);expect(g.hp).toEqual(hp);expect(g.mercymod[0]).toBe(0);
  }
 });
 it('applies the source Noelle item variants even though normal NEO uses characters 1, 2 and 3',()=>{
  const {rt,g,c}=make();g.char[0]=4;g.hp[4]=1;g.maxhp[4]=999;g.chartarget[0]=0;
  for(const [spell,amount] of [[212,30],[213,70],[218,70],[219,40],[220,50],[221,400],[222,60],[226,90]]){
   g.hp[4]=1;castSpell(c,rt,spell,0);expect(g.hp[4],`spell ${spell}`).toBe(1+amount);
  }
 });
});
