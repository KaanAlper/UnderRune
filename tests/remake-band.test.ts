import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter2BossHost} from '../src/remake/host/chapter2-bosses';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {KEY} from '../src/remake/deltarune/keys';
import {GmRandom} from '../src/remake/gm/random';

// Sweet, K_K and Cap'n (encounter 62) as players meet them: random keys through the menus, ACTs and songs (party kept
// at full HP), and the band's ending. The recordings check each frame against
// the game; these check that the paths a player takes run through, in the app's frame clock for the songs.
const BUNDLE='public/generated/remake/ch2/bundle.json';
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
const start=(seed=11)=>{
 setSourceText(JSON.parse(fs.readFileSync(BUNDLE,'utf8')).text);
 return new EngineBattle(loadSprites(2),equipment,defaultLoadout(),'ch2-62',seed,{development:true,chapter2Host:installChapter2BossHost});
};
describe.skipIf(!fs.existsSync(BUNDLE))("Sweet, K_K and Cap'n",()=>{
 it('keeps the independent party ACTs locked until the source dance lesson',()=>{
  const b=start(),rt=b.rt,g=rt.globals;
  for(let i=0;i<45;i++){b.step();rt.draw();}
  expect(g.flag[34]).toBe(1);
  const sweet=rt.instances.find(i=>i.live&&i.object.name==='obj_sweet_enemy')!;
  expect(sweet.learnedhowtoact).toBe(0);expect(g.canact[0][2]).toBe(1);
  sweet.dancecon=1.1;g.myfight=3;
  for(const w of rt.instances.filter(i=>i.live&&i.object.name==='obj_writer'))rt.destroy(w);
  b.step();
  expect(g.flag[34]).toBe(0);expect(sweet.learnedhowtoact).toBe(1);
  expect(g.canact.slice(0,3).map((a:number[])=>a[2])).toEqual([0,0,0]);
  expect(g.battlespell[1][0]).toBe(-1);expect(g.battlespell[2][0]).toBe(-1);
 });
 for(const seed of [1,2,3])it(`seed ${seed}: random play for 6000 frames without an event error`,()=>{
  const b=start(seed),rng=new GmRandom(seed*31+7),keys=[KEY.left,KEY.right,KEY.up,KEY.down,KEY.z,KEY.z,KEY.z,KEY.x,KEY.c],held=new Map<number,number>();
  for(let f=0;f<6000&&!b.outcome;f++){
   if(rng.random(1)<.25){const k=keys[rng.irandom(keys.length-1)];b.rt.input.pressed.add(k);b.rt.input.held.add(k);held.set(k,f+1+rng.irandom(20));}
   for(const [k,until] of held)if(f>=until){b.rt.input.held.delete(k);b.rt.input.released.add(k);held.delete(k);}
   const g=b.rt.globals;g.inv=999999;for(const c of [1,2,3])if(g.hp[c]>0)g.hp[c]=g.maxhp[c];
   b.step();b.rt.draw();
  }
  expect(b.rt.frame).toBeGreaterThan(0);
 },180000);
 it('once everyone dances, the music video plays and the battle is won',()=>{
  const b=start(),g=b.rt.globals;
  for(let f=0;f<60;f++){b.step();b.rt.draw();}
  expect(b.phase).toBe('command');
  // The ACTs' own check (all three dancing) starts Sweet's ending; here it is started directly.
  const sweet=b.rt.instances.find(i=>i.live&&i.object.name==='obj_sweet_enemy')!;
  for(const e of b.rt.instances.filter(i=>i.live&&['obj_sweet_enemy','obj_kk_enemy','obj_hatguy_enemy'].includes(i.object.name)))e.dancing=true;
  g.myfight=3;sweet.endcon=1;
  let video=false;
  for(let f=0;f<2000&&!b.outcome;f++){b.step();b.rt.draw();video||=b.rt.instances.some(i=>i.live&&i.object.name==='obj_musical_battle_end');}
  expect(video).toBe(true);expect(b.outcome).toBe('victory');
 },120000);
});
