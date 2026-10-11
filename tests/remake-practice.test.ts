import {it,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {createJevilPractice} from '../src/remake/host/practice';
import {damage,heart,KEY} from '../src/remake/deltarune/battle';
const empty={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const source:EquipmentSource={weapons:[empty],armors:[empty,{...empty,id:2,name:'Dice Brace',defense:2}],items:[],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
it('equipped armor changes actual contact damage and survives restarting a practice',()=>{
 const loadout=defaultLoadout();loadout.characters[1].armor=[2,0];
 const p=createJevilPractice(bank,source,loadout,0);
 const bullet=p.rt.create({name:'test-contact',index:999},0,0);bullet.target=0;bullet.damage=50;
 damage(bullet,p.rt);expect(p.rt.globals.hp[1]).toBe(52); // 50 - (base DF 2 + armor DF 2) * 3 = 38
 const fresh=createJevilPractice(bank,source,loadout,0);expect(fresh.rt.globals.hp[1]).toBe(90);expect(fresh.rt.globals.battledf[0]).toBe(4);
});
it('slow movement, pause and one-shot completion work without the original engine',()=>{
 const p=createJevilPractice(bank,source,defaultLoadout(),0),s=p.rt.first(heart)!;
 p.rt.input.held.add(KEY.right);p.rt.input.held.add(KEY.shift);const x=s.x;p.step();expect(s.x-x).toBe(2);
 p.paused=true;const frame=p.rt.frame;p.step();expect(p.rt.frame).toBe(frame);
 p.paused=false;p.rt.globals.turntimer=1;p.step();expect(p.outcome).toBe('survived');
 const end=p.rt.frame;p.step();expect(p.rt.frame).toBe(end);
});
