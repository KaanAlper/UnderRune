import {it as test,expect} from 'vitest';
import {hasSourceText} from '../src/remake/host/text';
// Clover's lines come from the locally built bundle (tests/setup-source-text.ts); without it these tests are skipped.
const it=test.skipIf(!hasSourceText());
import {spriteBank} from '../src/remake/gm/sprites';
import {SourceBattle} from '../src/remake/host/battle';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[{id:9,name:'ChocDiamond',description:'',usable:true,target:1}],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const create=()=>new SourceBattle(bank,equipment,defaultLoadout(),'ch1-8',11,{development:true});
const advance=(b:SourceBattle,n:number)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
it('is a public source battle once its attacks, ACTs and endings are verified',()=>{
 expect(new SourceBattle(bank,equipment,defaultLoadout(),'ch1-8').party).toEqual([1,3]);
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
const turnUntil=(b:SourceBattle,phase:string,limit=400)=>{for(let i=0;i<limit&&b.phase!==phase;i++){if(b.phase==='message')b.confirm();b.step();b.rt.draw();}};
it('defeats Clover with FIGHT through her own defeat run and outcome flag 1',()=>{
 const b=create();advance(b,24);b.select(0);b.select(0);b.select(4);turnUntil(b,'timing');
 b.enemyHp=1;b.boltTick=b.bolts[0].frame;b.confirm();advance(b,12);
 expect(b.rt.globals.flag[51]).toBe(1);expect(b.rt.globals.monster[0]).toBe(0);advance(b,120);expect(b.outcome).toBe('victory');
});
it('SPARE at full mercy plays the spared-sprite animation and counts a spare (flag 2)',()=>{
 const b=create();advance(b,24);b.rt.globals.mercymod[0]=100;advance(b,1);
 b.select(3);b.select(0);b.select(4);
 expect(b.rt.globals.flag[51]).toBe(2);expect(b.body.live).toBe(false);
 const anim=b.rt.instances.find(i=>i.live&&i.object.name==='obj_spareanim')!;expect(anim.sprite).toBe('spr_clubs_spared');
 advance(b,40);expect(b.outcome).toBe('victory');expect(b.rt.globals.monstergold[3]).toBe(80);
});
it('a SPARE that is not ready adds the source ten spare points',()=>{
 const b=create();b.rt.globals.chemg_god_mode=true;advance(b,24);b.select(3);b.select(0);b.select(4);
 expect(b.rt.globals.mercymod[0]).toBe(10);expect(b.outcome).toBeNull();expect(b.body.live).toBe(true);
});
it('Pacify spares a TIRED Clover (flag 3); it fails while she is not tired',()=>{
 const b=create();advance(b,24);b.rt.globals.monsterstatus[0]=1;advance(b,1);
 b.select(4);b.select(1);b.select(0);
 expect(b.rt.globals.flag[51]).toBe(3);expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_spareanim')).toBe(true);
 advance(b,40);expect(b.outcome).toBe('victory');
 const c=create();c.rt.globals.chemg_god_mode=true;advance(c,24);c.select(4);c.select(1);c.select(0);
 expect(c.rt.globals.flag[51]).toBe(0);expect(c.body.live).toBe(true);
});
