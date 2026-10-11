import {describe,it,expect} from 'vitest';
import {defaultLoadout,validateLoadout,loadoutIni,addItem} from '../src/game/loadout';
const armor=(id:number,allowed:number[])=>({id,name:'Armor '+id,description:'',attack:0,defense:1,magic:0,allowed});
const source={armors:[armor(0,[1,2,3,4]),armor(1,[1,3]),armor(2,[1,2,3,4])],weapons:[armor(0,[1,2,3,4])],items:[{id:1,name:'Candy',description:'',usable:true,target:1}],bagCapacity:12};
describe('source loadouts',()=>{
 it('rejects armor a character cannot wear, unknown IDs and overfull bags',()=>{
  const l=defaultLoadout();l.characters[2].armor[0]=1;expect(()=>validateLoadout(l,source)).toThrow(/Susie/);
  l.characters[2].armor[0]=2;l.characters[1].armor[1]=999;expect(()=>validateLoadout(l,source)).toThrow(/999/);
  l.characters[1].armor[1]=0;l.items=Array(13).fill(1);expect(()=>validateLoadout(l,source)).toThrow(/12/);
 });
 it('keeps repeated consumables in order and caps the original 12 slots',()=>{
  let l=defaultLoadout();for(let i=0;i<12;i++)l=addItem(l,1,source);expect(l.items).toEqual(Array(12).fill(1));expect(()=>addItem(l,1,source)).toThrow(/12/);
 });
 it('serializes actual native equipment arrays and fills empty bag slots with zero',()=>{
  const l=defaultLoadout();l.characters[1].armor=[2,1];l.items=[1,1];const ini=loadoutIni(l,source);
  expect(ini).toContain('[armor1]\n1=2');expect(ini).toContain('[armor2]\n1=1');expect(ini).toContain('[items]\n0=1\n1=1\n2=0');expect(ini).toContain('11=0');
 });
 it('leaves unchosen weapons to the game because weapons cannot be unequipped',()=>{
  const withSword={...source,weapons:[...source.weapons,armor(5,[1])]};
  const l=defaultLoadout();l.characters[1].weapon=5;const ini=loadoutIni(l,withSword);
  expect(ini).toContain('[weapon]\n1=5\n[armor1]');expect(ini).not.toMatch(/\[weapon\][^[]*\b2=/);
 });
});
