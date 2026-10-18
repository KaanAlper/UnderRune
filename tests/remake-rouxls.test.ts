import fs from 'node:fs';
import {expect,it} from 'vitest';
import type {GmRuntime} from '../src/remake/gm/runtime';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {chapter2RecordingReady,chapterText,runChapter2Recording} from './parity/chapter2-runner';
import {replayInput,type Replay} from './parity/reference';
import {boardScript} from '../tools/oracle-scripts.mjs';
import {KEY} from '../src/remake/deltarune/keys';
import {EngineBattle} from '../src/remake/host/engine';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';

const run='.tools/oracle/ch2-63-s11-god-boardlong';
function boardInput(rt:GmRuntime,frame:number,fallback:Replay[number]){
 const town=rt.instances.find(i=>i.live&&i.object.name==='obj_rouxls_simtown');
 if(town?.MyTurn!==1)return fallback;
 if(frame%2!==0)return {keysPressed:[],keysReleased:[...rt.input.held]};
 const tiles:{x:number;y:number;distance:number}[]=[];
 for(let x=0;x<16;x++)for(let y=0;y<6;y++)if(town.TileYouCanBuild[x][y]===1)tiles.push({x,y,distance:Math.abs(x-town.CursorX)+Math.abs(y-town.CursorY)});
 const target=tiles.sort((a,b)=>a.distance-b.distance)[0];
 const key=target?(target.x<town.CursorX?KEY.left:target.x>town.CursorX?KEY.right:target.y<town.CursorY?KEY.up:target.y>town.CursorY?KEY.down:KEY.z):KEY.z;
 return {keysPressed:[key],keysReleased:[...rt.input.held].filter(k=>k!==key)};
}
it.skipIf(!chapter2RecordingReady(run))('legal board inputs place houses and take Rouxls through the minigame ending',()=>{
 let rt!:GmRuntime;
 // Restore the original's battle snapshot without advancing or claiming a parity result.
 runChapter2Recording(run,r=>installChapter2BossHost(r,{room:'room_battletest'}),{},2,r=>{rt=r;},{end:40,quiet:true});
 const replay=JSON.parse(fs.readFileSync(run+'.inputs.json','utf8')) as Replay,base=boardScript(16000) as Replay;
 for(const f of Object.keys(replay))if(Number(f)>=40)delete replay[Number(f)];
 let houses=0,finished=false,frames=40;
 for(let f=40;f<16000;f++){
  rt.draw();
  const town=rt.instances.find(i=>i.live&&i.object.name==='obj_rouxls_simtown'),enemy=rt.instances.find(i=>i.live&&i.object.name==='obj_rouxls_enemy');
  const entry=boardInput(rt,f,base[f]);
  if(entry)replay[f]=entry;replayInput(rt,replay,f);rt.globals.time=(rt.globals.time??0)+1;rt.step();frames=f+1;
  if(town)houses=Math.max(houses,town.TileHasHouse.flat().filter((v:number)=>v===1).length);
  if(enemy?.actcon>=55){finished=true;break;}
 }
 if(process.env.WRITE_ROUXLS_INPUTS==='1')fs.writeFileSync('.tools/rouxls-autoplay.inputs.json',JSON.stringify(replay));
 console.log({houses,finished,frames,result:rt.globals.flag[435],enemy:rt.instances.find(i=>i.live&&i.object.name==='obj_rouxls_enemy')?.actcon});
 expect(houses).toBeGreaterThan(2);expect(finished).toBe(true);expect([1,2,3]).toContain(rt.globals.flag[435]);
},180000);

it('opens a fresh Rouxls battle with Kris and Ralsei, its board and the supported Thrash Machine',()=>{
 setSourceText(chapterText(2));
 const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
 const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
 const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-63',11,{development:true,chapter2Host:installChapter2BossHost});
 for(let f=0;f<60;f++){b.step();b.rt.draw();}
 expect(b.phase).toBe('command');expect(b.party).toEqual([1,3]);
 const enemy=b.rt.instances.find(i=>i.live&&i.object.name==='obj_rouxls_enemy')!;
 expect(enemy).toBeDefined();expect(b.rt.byId(enemy.thrash)!.part[1]).toBe(0);expect(b.rt.byId(enemy.thrash)!.part[2]).toBe(0);
 expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_rouxls_simtown')).toBe(true);
 expect(b.rt.globals.batmusic).toEqual(['rouxls_battle','rouxls_battle']);
});

it('a fresh app battle reaches the board result and victory through legal commands',()=>{
 setSourceText(chapterText(2));
 const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
 const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
 const b=new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-63',11,{development:true,chapter2Host:installChapter2BossHost}),rt=b.rt;
 // The native recordings raise party HP to cover the complete encounter. Keep that test condition here too.
 for(const c of b.party)rt.globals.hp[c]=rt.globals.maxhp[c]=99999;
 const base=boardScript(16000) as Replay;let built=0;const attacks=new Set<string>();
 for(let f=0;f<16000&&!b.outcome;f++){
  rt.draw();const entry=boardInput(rt,f,base[f]);if(entry)replayInput(rt,{[f]:entry},f);b.step();
  const town=rt.instances.find(i=>i.live&&i.object.name==='obj_rouxls_simtown');if(town)built=Math.max(built,town.TileHasHouse.flat().filter((v:number)=>v===1).length);
  if(rt.globals.monsterattackname?.[0])attacks.add(rt.globals.monsterattackname[0]);
 }
 expect(b.outcome,JSON.stringify({built,attacks:[...attacks],result:rt.globals.flag[435]})).toBe('victory');
 expect(built).toBeGreaterThan(1);expect([1,2,3]).toContain(rt.globals.flag[435]);
 expect(attacks.size).toBeGreaterThan(0);
},180000);
