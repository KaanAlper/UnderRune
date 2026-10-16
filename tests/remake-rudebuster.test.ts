import {describe,it,expect} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {castSpell,rudeBusterBolt,oflash} from '../src/remake/deltarune/party';
import {KEY} from '../src/remake/deltarune/keys';
import {loadSprites} from './parity/reference';

const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
function run(timing:'none'|'early'|'valid',id='ch1-40'){
 const b=new EngineBattle(loadSprites(1),equipment,defaultLoadout(),id),g=b.rt.globals,sounds:string[]=[];
 const frame=()=>{b.step();b.rt.draw();};frame();frame();
 const susie=b.rt.byId(g.charinstance[1])!;g.chartarget[1]=0;const hp=g.monsterhp[0];b.rt.sound=name=>{sounds.push(name);};castSpell(susie,b.rt,4,1);
 let bolt:ReturnType<typeof b.rt.first>;
 for(let i=0;i<80&&!bolt;i++){frame();bolt=b.rt.first(rudeBusterBolt);}expect(bolt).toBeDefined();
 const base=bolt!.damage;let pressed=false;
 for(let i=0;i<80&&bolt!.explode===0;i++){
  if(!pressed&&(timing==='early'&&bolt!.bolt_timer===0||timing==='valid'&&bolt!.bolt_timer>=4)){b.rt.input.pressed.add(KEY.z);pressed=true;}
  frame();
 }
 expect(bolt!.explode).toBe(1);
 return {b,g,sounds,bolt:bolt!,damage:hp-g.monsterhp[0],base};
}
describe('Rude Buster source timing and hit effects',()=>{
 it('an early tap is ignored and the source execution window adds 30 HP rather than doubling the hit',()=>{
  const plain=run('none'),early=run('early'),timed=run('valid');
  expect(plain.damage).toBe(plain.base);expect(early.damage).toBe(plain.damage);expect(timed.damage).toBe(plain.damage+30);
  expect(timed.bolt.bonus_anim).toBe(1);expect(timed.sounds).toContain('snd_scytheburst');expect(plain.sounds).not.toContain('snd_scytheburst');
 });
 it('a timed impact keeps the source flash and eight spreading beam fragments on the target',()=>{
  const {b,bolt}=run('valid');expect(b.rt.all(oflash)).toHaveLength(1);expect(bolt.burst).toHaveLength(8);
  for(const id of bolt.burst){const fragment=b.rt.byId(id)!;expect(fragment).toBeDefined();expect(Math.hypot(fragment.x-bolt.cx,fragment.y-bolt.cy)).toBeCloseTo(25);expect(fragment.speed).toBe(25);}
 });
 it('retains the original Jevil exception that suppresses the extra silhouette flash',()=>{
  const {b,damage,base}=run('valid','ch1-25');expect(damage).toBe(base+30);expect(b.rt.all(oflash)).toHaveLength(0);
 });
});
