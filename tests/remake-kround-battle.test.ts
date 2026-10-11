import {it as test,expect} from 'vitest';
import {spriteBank} from '../src/remake/gm/sprites';
import {SourceBattle} from '../src/remake/host/battle';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {hasSourceText} from '../src/remake/host/text';
import {heroRalsei} from '../src/remake/deltarune/battle';
// K.Round's lines come from the locally built bundle (tests/setup-source-text.ts); without it these tests are skipped.
const it=test.skipIf(!hasSourceText());
const gear={id:0,name:'',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={armors:[gear],weapons:[gear],items:[],bagCapacity:12};
const bank=spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]});
const create=(id:'ch1-12'|'ch1-27'='ch1-12')=>{const b=new SourceBattle(bank,equipment,defaultLoadout(),id,11,{development:true});b.rt.globals.chemg_god_mode=true;return b;};
const advance=(b:SourceBattle,n:number)=>{for(let i=0;i<n;i++){b.step();b.rt.draw();}};
/** Press Z through messages and dialogue until the battle reaches `phase` (or the limit). */
const until=(b:SourceBattle,phase:string,limit=600)=>{for(let i=0;i<limit&&b.phase!==phase;i++){if(b.phase==='message'||b.sourceDialogue.length)b.confirm();advance(b,1);}};

it('opens encounter 12 with the whole party at the source positions and K.Round own ACTs',()=>{
 const b=create();advance(b,24);
 expect(b.party).toEqual([1,2,3]);expect(b.heroes.map(h=>[h.x,h.y])).toEqual([[80,50],[80,130],[80,210]]);
 expect(b.body.object.name).toBe('obj_checkers_enemy');expect([b.body.x,b.body.y]).toEqual([480,120]);
 expect(b.enemyHp).toBe(1300);expect(b.rt.globals.monsterat[0]).toBe(7.5);
 expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_battleback')).toBe(true);
 b.select(1);b.select(0);
 expect(b.choices.map(c=>[c.name,c.detail??''])).toEqual([['Check',''],['Bow',''],['Deep Bow','Kris + Ralsei'],['Warning','Kris + Ralsei']]);
});
it('runs Check, then K.Round own enemy turn, and returns to commands for turn 2',()=>{
 const b=create();advance(b,24);
 b.select(1);b.select(0);b.select(0);   // Kris: ACT, K.Round, Check
 b.select(4);b.select(4);               // Susie and Ralsei: DEFEND
 advance(b,1);                          // the enemy's next Step opens the Check writer
 expect(b.sourceDialogue.length).toBeGreaterThan(0);expect(b.message).toMatch(/K\.ROUND/);
 until(b,'enemy');expect(b.phase).toBe('enemy');
 until(b,'command');expect(b.phase).toBe('command');expect(b.turn).toBe(1);expect(b.outcome).toBeNull();
});
it('drinks milk at 1000 HP or less: heals 300, gains half an attack point, then Ralsei and Susie speak',()=>{
 const b=create();advance(b,24);b.enemyHp=900;b.rt.globals.monsterhp[0]=900;
 b.select(4);b.select(4);b.select(4);
 const faces=new Set<string>();
 for(let i=0;i<600&&b.phase!=='command';i++){if(b.messageFace)faces.add(b.messageFace.hero);if(b.phase==='message'||b.sourceDialogue.length)b.confirm();advance(b,1);}
 expect(b.rt.globals.monsterhp[0]).toBe(1200);expect(b.rt.globals.monsterat[0]).toBe(8);
 expect([...faces].sort()).toEqual(['ralsei','susie']);expect(b.phase).toBe('command');
 // The shared host keeps the healed values for the next turns instead of writing its old ones back.
 expect(b.enemyHp).toBe(1200);b.select(4);b.select(4);b.select(4);advance(b,20);expect(b.rt.globals.monsterat[0]).toBe(8);expect(b.rt.globals.monsterhp[0]).toBe(1200);
});
it('opens the rematch (27) with Kris raised, three ACTs and Susie\'s Idea needing the whole party',()=>{
 const b=create('ch1-27');advance(b,24);
 expect(b.heroes.map(h=>[h.x,h.y])).toEqual([[80,65],[80,130],[80,210]]);
 expect(b.rt.instances.some(i=>i.live&&i.object.name==='obj_battleback')).toBe(false);
 b.select(1);b.select(0);
 expect(b.choices.map(c=>[c.name,c.detail??''])).toEqual([['Check',''],['Bow',''],['Susie\'s Idea','Kris + Susie + Ralsei']]);
});
it('a crown at 100 after an ACT makes K.Round shrink away and ends the battle in victory',()=>{
 const b=create('ch1-27');advance(b,24);b.body.crown=100;
 b.select(1);b.select(0);b.select(1);   // Kris: ACT Bow (Susie and Ralsei still choose)
 b.select(4);b.select(4);
 for(let i=0;i<900&&!b.outcome;i++){if(b.phase==='message'||b.sourceDialogue.length)b.confirm();advance(b,1);}
 expect(b.rt.instances.some(i=>i.object.name==='obj_checker_animtest')).toBe(false);
 expect(b.rt.globals.monster[0]).toBe(0);expect(b.outcome).toBe('victory');
});
it('Susie\'s Idea: Susie lifts Ralsei, then (same turn, as in the game) C sets the power and throws him at the crown',()=>{
 const b=create('ch1-27');advance(b,24);
 b.select(1);b.select(0);b.select(2);   // Kris: ACT, K.Round, Susie's Idea (Susie and Ralsei join)
 expect(b.actions.filter(a=>a?.kind==='assist')).toHaveLength(2);
 const throwerLive=()=>b.rt.instances.find(x=>x.live&&x.object.name==='obj_throwralsei');
 for(let i=0;i<600&&!throwerLive();i++){if(b.sourceDialogue.length||b.phase==='message')b.confirm();advance(b,1);}
 const sus=throwerLive()!;expect(sus).toBeTruthy();expect(b.body.thrown).toBe(2);expect(b.turn).toBe(0);
 b.rt.input.pressed.add(67);advance(b,1);expect(sus.throwready).toBe(1);                        // C: power gauge
 for(let i=0;i<20&&sus.throwalpha<0.9;i++)advance(b,1);
 b.rt.input.pressed.add(67);advance(b,1);                                                        // C: throw
 expect(b.rt.instances.some(x=>x.live&&x.object.name==='obj_ralseithrown')).toBe(true);
 for(let i=0;i<900&&b.phase!=='command'&&!b.outcome;i++){if(b.phase==='message'||b.sourceDialogue.length)b.confirm();advance(b,1);}
 expect([0,20,35]).toContain(b.body.crown);expect(b.rt.count(heroRalsei)).toBe(1);expect(b.turn).toBe(1);
});
it('Bow, Deep Bow (with Ralsei and his one-time lecture) and Warning each run their dialogue and return to commands',()=>{
 for(const [act,partner] of [[1,false],[2,true],[3,true]] as const){
  const b=create();advance(b,24);
  b.select(1);b.select(0);b.select(act);
  expect(b.actions.filter(a=>a?.kind==='assist')).toHaveLength(partner?1:0);
  while(b.actions.some((a,i)=>!a&&b.party[i]))b.select(4);
  let pages=0;for(let i=0;i<900&&b.phase!=='command';i++){if(b.sourceDialogue.length){pages++;b.confirm();}else if(b.phase==='message')b.confirm();advance(b,1);}
  expect(pages).toBeGreaterThan(0);expect(b.phase).toBe('command');expect(b.turn).toBe(1);expect(b.body.visible).toBe(true);
  expect(b.heroes.every(h=>h.visible)).toBe(true);
 }
});
it('FIGHT down to 0 HP defeats K.Round and wins; his own Step keeps outcome flag 4, as in the game',()=>{
 const b=create();advance(b,24);b.select(0);b.select(0);b.select(4);b.select(4);
 for(let i=0;i<300&&b.phase!=='timing';i++){if(b.phase==='message')b.confirm();advance(b,1);}
 b.enemyHp=1;b.rt.globals.monsterhp[0]=1;b.boltTick=b.bolts[0].frame;b.confirm();advance(b,12);
 expect(b.rt.globals.flag[51]).toBe(4);expect(b.rt.globals.monster[0]).toBe(0);
 advance(b,150);expect(b.outcome).toBe('victory');
});
