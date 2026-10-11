import {it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {SourceBattle} from '../src/remake/host/battle';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[{id:9,name:'ChocDiamond',description:'',usable:true,target:1}],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const create=()=>new SourceBattle(bank,equipment,defaultLoadout(),'ch1-8',11,{development:true});
const advance=(b:SourceBattle,n:number)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
it('keeps the unverified full Clover encounter behind the public gate',()=>{
 expect(()=>new SourceBattle(bank,equipment,defaultLoadout(),'ch1-8')).toThrow('not available');
});
it('opens source encounter8 with Kris and Ralsei, correct slot stats and six own ACTs',()=>{
 const b=create();advance(b,24);expect(b.party).toEqual([1,3]);expect(b.rt.globals.battlemag.slice(0,2)).toEqual([0,7]);expect(b.enemyHp).toBe(270);
 expect(b.body.object.name).toBe('obj_clubsenemy');expect([b.body.x,b.body.y]).toEqual([400,120]);b.select(1);b.confirm();expect(b.choices).toHaveLength(6);
});
it('reserves Ralsei for joint source ACTs and returns to his menu when cancelled',()=>{
 const b=create();advance(b,24);b.select(1);b.confirm();b.select(2);expect(b.actions[1]?.kind).toBe('assist');expect(b.phase).toBe('message');
});
it('runs original Clover controller then returns to both party commands without a premature victory',()=>{
 const b=create();b.rt.globals.chemg_god_mode=true;advance(b,24);b.select(4);b.select(4);
 expect(b.phase).toBe('enemyTalk');advance(b,17);b.confirm();advance(b,14);
 expect(b.phase).toBe('enemy');expect(b.rt.instances.some(x=>x.live&&x.object.name==='obj_dbulletcontroller')).toBe(true);
 advance(b,190);expect(b.phase).toBe('command');expect(b.turn).toBe(1);expect(b.outcome).toBeNull();expect(b.body.talked).toBe(0);expect(b.body.attacked).toBe(0);
});
