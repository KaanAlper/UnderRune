import {expect,it} from 'vitest';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {chapterText} from './parity/chapter2-runner';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {KEY} from '../src/remake/deltarune/keys';
import {createPracticeBattle,practicePatterns} from '../src/remake/host/practice';
it('opens the normal story boxing ring from a fresh app battle',()=>{
 setSourceText(chapterText(2));
 const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]},equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
 const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-84',11,{development:true,chapter2Host:installChapter2BossHost});
 for(let f=0;f<60;f++){b.rt.draw();b.step();}
 expect(b.party).toEqual([1]);expect(b.rt.instances.some(i=>i.live&&i.object.name==='o_boxingqueen')).toBe(true);
 expect(b.rt.instances.some(i=>i.live&&i.object.name==='o_boxingcontroller')).toBe(true);
});
it('plays legal commands from a fresh start through the boxing round',()=>{
 setSourceText(chapterText(2));
 const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]},equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
 const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-84',11,{development:true,chapter2Host:installChapter2BossHost}),phases=new Set<string>();
 for(let f=0;f<1800&&!b.outcome;f++){
  // Keep the player alive to exercise later commands; input, enemy state and source timers remain untouched.
  b.rt.globals.hp[1]=b.rt.globals.maxhp[1];
  if(f%8===0)b.rt.input.pressed.add(KEY.z);
  b.rt.draw();b.step();phases.add(b.phase);
 }
 expect([...phases]).toContain('command');expect([...phases]).toContain('enemy attack');
},60000);
it('runs the Aura combo background pieces through their hitbox lifecycle in practice',()=>{
 setSourceText(chapterText(2));
 const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]},equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
 const index=practicePatterns('ch2-84').findIndex(p=>p.name.includes('Aura combo'));expect(index).toBeGreaterThanOrEqual(0);
 const battle=createPracticeBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-84',index,11,{development:true,chapterHost:installChapter2BossHost});
 for(let f=0;f<1300&&!battle.outcome;f++){battle.rt.globals.inv=9999;battle.step();battle.rt.draw();}
 expect(battle.outcome).toBe('survived');
},60000);
it('wins a fresh story fight through all three rounds, final baseball and rocket ending with legal punches',()=>{
 setSourceText(chapterText(2));
 const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]},equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
 const battle=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-84',11,{development:true,chapter2Host:installChapter2BossHost});
 const rounds=new Set<number>(),seen=new Set<string>();
 for(let frame=0;frame<10000&&!battle.outcome;frame++){
  const rt=battle.rt;
  // Test-only survival: enemy HP, attack selection, timers and all player actions use their source events.
  rt.draw();rt.globals.hp[1]=rt.globals.maxhp[1];
  const player=rt.instances.find(i=>i.live&&i.object.name==='o_boxingcontroller');
  const interval=player?.cancontrol===1&&rt.globals.boxingphase===2?2:8;
  const punch=frame>=30&&frame%interval===0;
  if(punch&&!rt.input.held.has(KEY.z)){rt.input.held.add(KEY.z);rt.input.pressed.add(KEY.z);}
  else if(!punch&&rt.input.held.has(KEY.z)){rt.input.held.delete(KEY.z);rt.input.released.add(KEY.z);}
  battle.step();
  for(const instance of rt.instances)if(instance.live){seen.add(instance.object.name);if(instance.object.name==='o_boxinghud')rounds.add(instance.sub_healthbar_count);}
 }
 expect([...rounds]).toEqual([2,1,0]);
 expect(seen).toContain('obj_bq_baseball_final');
 expect(seen).toContain('obj_boxingqueen_rocket_punch_idle');
 expect(seen).toContain('obj_rocketpunch_queen');
 expect(battle.outcome).toBe('victory');
},60000);
