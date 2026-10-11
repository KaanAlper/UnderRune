import {expect,test} from 'vitest';
import {BattleSession} from '../src/game/battle';
import {getDefinition,catalog} from '../src/bosses/registry';
import {loadPrefs,savePrefs} from '../src/game/storage';
import type {InputFrame} from '../src/game/input';
const input:InputFrame={x:0,y:0,confirm:false,cancel:false,restart:false,pause:false,slow:false,shoot:false};
const make=()=>new BattleSession(getDefinition(catalog.find(r=>r.name==='JEVIL')!),7);

test('pointer commands cannot change a paused or disposed battle',()=>{
 const b=make();b.pause(true);b.selectCommand(5);expect(b.actor).toBe(0);expect(b.phase).toBe('command');
 b.pause(false);b.dispose();b.selectCommand(0);expect(b.phase).toBe('command');
});
test('pause freezes simulation and reset restores the complete state',()=>{
 const b=make();b.beginDefense(0);b.step(input);b.pause(true);const tick=b.tick;b.step(input);expect(b.tick).toBe(tick);b.reset(7);expect(b.phase).toBe('command');expect(b.bullets).toHaveLength(0);expect(b.party.every(p=>p.hp===p.maxHp)).toBe(true);
});
test('invulnerability prevents repeated damage and all party down is defeat',()=>{
 const b=make();b.takeDamage(10);const hp=b.party[0].hp;b.takeDamage(10);expect(b.party[0].hp).toBe(hp);b.party.forEach(p=>p.hp=0);b.invulnerable=0;b.takeDamage(10);expect(b.phase).toBe('defeat');
});
test('full battle does not award victory for surviving one attack',()=>{
 const b=make();b.beginDefense(0);b.invulnerable=10000;for(let n=0;n<400;n++)b.step(input);expect(b.phase).toBe('command');expect(b.enemies[0].hp).toBeGreaterThan(0);
});
test('victory and defeat stop attacks',()=>{const b=make();b.phase='victory';b.step(input);expect(b.bullets).toHaveLength(0);expect(b.tick).toBe(0);});
test('invalid preferences and blocked browser storage preserve playability',()=>{
 const expected={version:1,muted:false,reducedEffects:false,completed:[]};
 expect(loadPrefs({getItem:()=>'{broken',setItem:()=>{}})).toEqual(expected);
 expect(loadPrefs({getItem:()=>{throw Error('blocked');},setItem:()=>{}})).toEqual(expected);
 expect(()=>savePrefs({getItem:()=>null,setItem:()=>{throw Error('full');}},expected)).not.toThrow();
});
test('holding confirm cannot trigger multiple queued commands',()=>{const b=make();b.step({...input,confirm:true});expect(b.phase).toBe('target');b.step(input);expect(b.phase).toBe('target');});
