import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {defaultLoadout,type EquipmentSource,type Loadout} from '../src/game/loadout';
import {loadSprites} from './parity/reference';
import {setSourceText} from '../src/remake/host/text';
import {KEY} from '../src/remake/deltarune/keys';
import {GmRandom} from '../src/remake/gm/random';

// Plays battles with random keys (arrows, Z, X, C; held and tapped) from several seeds and loadouts, as a player who
// tries everything would, and fails on any event error. The recordings check that the remake matches the game; this
// checks that no menu path, item, spell or ACT a player can reach stops the battle.
const BUNDLE='public/generated/remake/ch3/bundle.json',EQUIPMENT='public/generated/equipment.json';
const ready=fs.existsSync(BUNDLE)&&fs.existsSync(EQUIPMENT)&&fs.existsSync('extracted/chapter3_windows/index.json');
function play(seed:number,loadout:Loadout,equipment:EquipmentSource,frames:number,god=false){
 const b=new EngineBattle(loadSprites(3),equipment,loadout,'ch3-115',seed,{development:true,chapterHost:installChapter3BossHost});
 const rng=new GmRandom(seed*7919+1),keys=[KEY.left,KEY.right,KEY.up,KEY.down,KEY.z,KEY.z,KEY.z,KEY.x,KEY.c];
 const held=new Map<number,number>();
 for(let f=0;f<frames&&!b.outcome;f++){
  if(rng.random(1)<0.25){const k=keys[rng.irandom(keys.length-1)];b.rt.input.pressed.add(k);b.rt.input.held.add(k);held.set(k,f+1+rng.irandom(20));}
  for(const [k,until] of held)if(f>=until){b.rt.input.held.delete(k);b.rt.input.released.add(k);held.delete(k);}
  // God mode, as in the reference recordings: the party is healed before every frame, so later phases are reached.
  if(god){const g=b.rt.globals;g.inv=999999;for(const c of [1,2,3])if(g.hp[c]>0)g.hp[c]=g.maxhp[c];}
  b.step();b.rt.draw();
 }
 return b;
}
describe.skipIf(!ready)('the Knight battle with random play',()=>{
 const equipment=ready?(JSON.parse(fs.readFileSync(EQUIPMENT,'utf8')).chapters[3] as EquipmentSource):undefined!;
 const withItems=():Loadout=>{const l=defaultLoadout();l.items=[1,2,34,36,38,7,11,18];return l;};
 for(const seed of [1,2,3,4,5,6])it(`seed ${seed} plays 6000 frames without an event error`,()=>{
  setSourceText(JSON.parse(fs.readFileSync(BUNDLE,'utf8')).text);
  const b=play(seed,seed%2?withItems():defaultLoadout(),equipment,6000);
  expect(b.rt.frame).toBeGreaterThan(0);
 },120000);
 // Minutes each: with LONG_PARITY=1, like the long recordings.
 for(const seed of [11,12])it.skipIf(process.env.LONG_PARITY!=='1')(`seed ${seed} plays to his later phases (party kept at full HP) without an event error`,()=>{
  setSourceText(JSON.parse(fs.readFileSync(BUNDLE,'utf8')).text);
  const b=play(seed,seed%2?withItems():defaultLoadout(),equipment,12000,true);
  const k=b.rt.instances.find(i=>i.live&&i.object.name==='obj_knight_enemy');
  console.log(`seed ${seed}: frame ${b.rt.frame}, outcome ${b.outcome}, phase ${k?.phase}, HP ${b.rt.globals.monsterhp[0]}`);
  expect(b.rt.frame).toBeGreaterThan(0);
 },600000);
});
