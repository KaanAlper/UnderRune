import {describe,it,expect} from 'vitest';
import {BattleRunTracker} from '../src/game/battle-run';
import {defaultLoadout} from '../src/game/loadout';

function fixture(){
 const loadout=defaultLoadout();loadout.characters[1]={weapon:5,armor:[2,0]};loadout.characters[2].armor=[99,99];loadout.items=[1,1,2];
 const globals:Record<string,any>={char:[1,3,0],hp:[0,90,110,70],maxhp:[0,90,110,70],charweapon:[0,5,2,3],chararmor1:[0,2,99,0],chararmor2:[0,0,99,0]};
 const tracker=new BattleRunTracker('ch1-8',loadout,globals,'00000000-0000-4000-8000-000000000001');
 return {tracker,globals,loadout};
}
describe('passive battle run metrics',()=>{
 it('keeps original party metrics when a companion leaves during committed victory',()=>{
  const {tracker,globals:g}=fixture();g.hp[3]-=10;tracker.frame(g);g.myfight=7;g.char=[1,0,0];tracker.frame(g);
  const run=tracker.finish('victory',g)!;expect(run.damage).toBe(10);expect(run.equipment.map(c=>c.character)).toEqual([1,3]);
  const changed=fixture();changed.globals.myfight=7;changed.globals.char=[1,2,0];changed.tracker.frame(changed.globals);expect(changed.tracker.finish('victory',changed.globals)).toBeNull();
 });
 it('labels committed-victory timing separately from historical dialogue-counted runs',()=>{
  const {tracker,globals:g}=fixture();tracker.frame(g);
  expect(tracker.finish('victory',g)?.rules_version).toBe('battle-v2');
 });
 it('counts heal then damage in one frame without subtracting earlier losses',()=>{
  const {tracker,globals:g}=fixture();g.hp[1]-=20;g.hp[1]+=10;g.hp[1]-=5;tracker.frame(g);
  expect(tracker.finish('victory',g)?.damage).toBe(25);
 });
 it('ignores overheal caps, knockout overflow, below-zero recovery and absent characters',()=>{
  const {tracker,globals:g}=fixture();g.hp[1]+=999;g.hp[1]=90;g.hp[1]=-50;g.hp[1]=-20;g.hp[2]=0;g.hp[3]-=10;tracker.frame(g);
  expect(tracker.finish('victory',g)?.damage).toBe(100);
 });
 it('snapshots participating gear, duplicate bag items and actual execution separately',()=>{
  const {tracker,globals:g,loadout}=fixture();loadout.items.length=0;loadout.characters[1].armor=[0,0];tracker.itemUsed(2);tracker.itemUsed(2);tracker.frame(g);
  const run=tracker.finish('victory',g)!;expect(run.equipment).toEqual([{character:1,weapon:5,armor:[2,0]},{character:3,weapon:3,armor:[0,0]}]);
  expect(run.bag).toEqual([1,1,2]);expect(run.used_items).toEqual([2,2]);expect(run.no_armor).toBe(false);expect(run.no_item).toBe(false);
 });
 it('uses active simulation frames, closes once and never submits defeat or unstepped runs',()=>{
  const {tracker,globals:g}=fixture();for(let i=0;i<30;i++)tracker.frame(g);
  expect(tracker.finish('victory',g)?.duration_ms).toBe(1000);expect(tracker.finish('victory',g)).toBeNull();
  const a=fixture();a.tracker.frame(a.globals);expect(a.tracker.finish('defeat',a.globals)).toBeNull();
  const b=fixture();expect(b.tracker.finish('victory',b.globals)).toBeNull();
 });
 it('separates a genuinely triggered enraged run from its normal boss board',()=>{
  const normal=fixture();normal.tracker.frame(normal.globals);expect(normal.tracker.finish('victory',normal.globals)?.encounter_id).toBe('ch1-8');
  const neo=fixture();const tracker=new BattleRunTracker('ch2-61',neo.loadout,neo.globals);tracker.mode('enraged');tracker.frame(neo.globals);
  expect(tracker.finish('victory',neo.globals)?.encounter_id).toBe('ch2-61-enraged');
 });
 it('no-item permits an unused bag, while gear changes never earn no-armor',()=>{
  const {tracker,globals:g}=fixture();g.chararmor1[1]=0;tracker.frame(g);expect(tracker.finish('victory',g)).toBeNull();
  const clean=fixture();clean.globals.chararmor1[1]=0;const t=new BattleRunTracker('ch1-8',clean.loadout,clean.globals);t.frame(clean.globals);
  const run=t.finish('victory',clean.globals)!;expect(run.no_item).toBe(true);expect(run.no_armor).toBe(true);expect(run.bag.length).toBe(3);
 });
 it('invalidates replaced health arrays, changed party/gear and nonfinite values',()=>{
  for(const change of [(g:any)=>g.hp=[...g.hp],(g:any)=>g.char[1]=2,(g:any)=>g.charweapon[1]=99,(g:any)=>g.hp[1]=NaN]){
   const {tracker,globals:g}=fixture();change(g);tracker.frame(g);expect(tracker.finish('victory',g)).toBeNull();
  }
 });
});
