import {beforeAll,expect,it} from 'vitest';
import fs from 'node:fs';
import {EngineBattle} from '../src/remake/host/engine';
import {installChapter3BossHost} from '../src/remake/host/chapter3-bosses';
import {WEATHER_PATTERNS} from '../src/remake/host/weather-practice';
import {defaultLoadout,type EquipmentSource} from '../src/game/loadout';
import {spriteBank} from '../src/remake/gm/sprites';
import {findController} from '../src/remake/deltarune/controller';
import {destroyWriters,faceParent} from '../src/remake/deltarune/writer';
import {setSourceText} from '../src/remake/host/text';

const bundle=JSON.parse(fs.readFileSync('public/generated/remake/ch3/bundle.json','utf8'));
const bank=spriteBank(bundle);
const gear={id:0,name:'Default',description:'',attack:0,defense:0,magic:0,allowed:[1,2,3]};
const equipment:EquipmentSource={weapons:[gear],armors:[gear],items:[],bagCapacity:12};
beforeAll(()=>setSourceText(bundle.text));

function fixture(index:number){
 const battle=new EngineBattle(bank,equipment,defaultLoadout(),'ch3-113',11,{chapterHost:installChapter3BossHost});
 const rt=battle.rt,g=rt.globals,selected=WEATHER_PATTERNS[index];
 // Same entry state as createPracticeBattle; keep this test independent of pattern registration.
 destroyWriters(rt);for(const f of rt.all(faceParent))rt.destroy(f);
 const panel=findController(rt)!;panel.intro=0;panel.bp=panel.bpy??152;
 Object.assign(g,{myfight:-1,mnfight:1,bmenuno:0,charturn:3});
 for(const id of g.charinstance){const h=rt.byId(id)!;h.state=0;h.attacktimer=0;}
 const enemy=battle.enemy!;
 const hp=[...g.hp],maxhp=[...g.maxhp],inv=g.inv;
 selected.setup?.(rt,enemy);
 expect(g.hp).toEqual(hp);expect(g.maxhp).toEqual(maxhp);expect(g.inv).toBe(inv);
 const step=()=>{selected.beforeStep?.(rt,enemy);battle.step();selected.afterStep?.(rt,enemy);rt.draw();};
 const named=(name:string)=>rt.instances.find(i=>i.live&&i.object.name===name);
 return {battle,rt,g,panel,step,named};
}

const expected=[
 [0,0,260,1474,1650],[0,0,260,783,4256],
 [1,0,260,1474,4256],[1,1,260,1474,4256],
 [2,0,260,783,1650],[2,1,260,783,1650],
 [2,0,260,1474,4256],[2,1,260,1474,4256],
 [3,0,275,783,1650],[3,1,275,783,1650],
 [3,0,275,1474,4256],[3,1,275,1474,4256],
 [4,0,850,0,0],[4,1,850,0,0],
] as const;

it('covers every normal source weather family, forecast and favored side',()=>{
 expect(WEATHER_PATTERNS).toHaveLength(expected.length);
 expect(new Set(WEATHER_PATTERNS.map(p=>p.name)).size).toBe(expected.length);
});

for(const [index,[special,side,duration,moon,cloud]] of expected.entries())it(`runs the full source turn: ${WEATHER_PATTERNS[index].name}`,()=>{
 const f=fixture(index),seen=new Set<string>();let spawnFrame=-1,maxTimer=0,mascotFrames=0;
 // Explicit unscored survival fixture. Production adapters must preserve HP and invulnerability.
 for(let frame=0;frame<1100&&f.battle.turn===0;frame++){
  f.g.inv=999999;f.step();
  const dc=f.named('obj_dbulletcontroller'),m=f.named('obj_elnina_mascotattack');
  if(dc){
   expect(dc.type).toBe(130);expect(dc.special).toBe(special);expect(dc.side).toBe(side);
   if(spawnFrame<0){spawnFrame=frame;maxTimer=f.g.turntimer;expect(f.battle.turn).toBe(0);}
  }
  if(m){
   mascotFrames++;expect(m.attacktype).toBe(special);expect(m.favored).toBe(side);
   expect([m.laninobulletsprite,m.elninabullesprite]).toEqual([moon,cloud]);
  }
  for(const p of f.rt.instances)if(p.live&&p.object.name==='obj_regularbullet_elnina'&&p.sprite)seen.add(p.sprite);
 }
 // The native battlecontroller decrements the newly selected clock later in the same Step.
 expect(spawnFrame).toBeGreaterThanOrEqual(11);expect(maxTimer).toBe(duration-1);
 expect(mascotFrames).toBeGreaterThan(duration-10);
 expect(seen.size).toBeGreaterThan(0);
 expect(f.battle.turn).toBe(1);expect(f.g.mnfight).toBe(0);
 expect(f.battle.outcome).toBeNull();expect(f.battle.ending).toBeNull();
 expect(f.named('obj_heart')).toBeUndefined();expect(f.named('obj_dbulletcontroller')).toBeUndefined();
});
