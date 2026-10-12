import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {loadSprites,restoreScene,runParity,type Dump,type TraceLine,type Replay} from './parity/reference';
import * as b from '../src/remake/deltarune/battle';
import {battleControllerFull,tensionBar} from '../src/remake/deltarune/controller';
import {HERO_DEFS,attackPress,spellPhase,healAnim,pacifySpell,oflash,rudeBusterAnim,rudeBusterBolt} from '../src/remake/deltarune/party';
import {writer,face,battleBalloon} from '../src/remake/deltarune/writer';
import {burstBolt,basicAttack} from '../src/remake/deltarune/player-effects';
import {cloverAttackObjects} from '../src/remake/bosses/clover';
import {engineEnemies,installEngineHosts} from '../src/remake/host/engine';
import {cloverDefeat} from '../src/remake/host/clover';
import {hasSourceText} from '../src/remake/host/text';

// Whole battles on the engine against the original game, frame by frame: from the frame the battle controller
// appears (a local snapshot) to the end of the recording, with the recording's key presses. Everything in the
// battle is compared: every object's position, frame, sprite and visibility, the random state and the battle globals.
const battleObjects=['obj_battlecontroller','obj_herokris','obj_herosusie','obj_heroralsei','obj_tensionbar','obj_writer','obj_face','obj_battleblcon',
 'obj_darkener','obj_heart','obj_grazebox','obj_growtangle','obj_moveheart','obj_returnheart','obj_heartburst','obj_dmgwriter','obj_attackpress','obj_spellphase',
 'obj_burstbolt','obj_basicattack','obj_afterimage','obj_regularbullet','obj_marker','obj_shake','obj_defeatanim','obj_spareanim','obj_healanim','obj_oflash'];
const SPRITE_NAMES:string[]=fs.existsSync('extracted/chapter1_windows/index.json')?JSON.parse(fs.readFileSync('extracted/chapter1_windows/index.json','utf8')).sprites.map((s:{name:string})=>s.name):[];
const RUNS:{id:string;run:string;start:number;enemies:string[]}[]=[
 {id:'ch1-8',run:'ch1-8-s11-god',start:40,enemies:['obj_clubsenemy','obj_dbulletcontroller','obj_clubsbullet','obj_clubsbullet_dark']},
];
for(const {id,run,start,enemies} of RUNS){
 const base='.tools/oracle/'+run,ready=hasSourceText()&&fs.existsSync(`${base}-f${start}.json`)&&fs.existsSync(base+'.ndjson')&&fs.existsSync('extracted/chapter1_windows/sprites.json');
 describe.skipIf(!ready)(`${id} on the engine, against the original (local recordings)`,()=>{
  it(`matches every recorded frame from the battle's start`,()=>{
   const trace=new Map<number,TraceLine>(fs.readFileSync(base+'.ndjson','utf8').trim().split('\n').map(l=>{const x=JSON.parse(l) as TraceLine;return [x.f,x];}));
   const replay=JSON.parse(fs.readFileSync(base+'.inputs.json','utf8')) as Replay,dump=JSON.parse(fs.readFileSync(`${base}-f${start}.json`,'utf8')) as Dump;
   const defs=Object.values(engineEnemies(id));
   const objects=[b.mainchara,b.astream,b.eventManager,b.battleBack,battleControllerFull,...HERO_DEFS,tensionBar,writer,face,battleBalloon,b.darkener,b.heart,b.grazebox,b.growtangle,
    b.afterimage,b.afterimageGrow,b.regularBullet,b.moveHeart,b.returnHeart,b.heartBurst,b.dmgWriter,b.shake,b.marker,attackPress,spellPhase,burstBolt,basicAttack,
    healAnim,pacifySpell,oflash,rudeBusterAnim,rudeBusterBolt,b.spareAnim,cloverDefeat as any,...defs,...cloverAttackObjects];
   const {rt,skipped,skippedIds}=restoreScene(loadSprites(1),dump,trace.get(start)!,objects);
   // The snapshot keeps sprite variables (idlesprite, hurtsprite...) as the game's sprite numbers; the remake uses names.
   for(const i of rt.instances)for(const k of Object.keys(i))if(/sprite$/.test(k)&&k!=='sprite'&&typeof i[k]==='number'&&SPRITE_NAMES[i[k]])i[k]=SPRITE_NAMES[i[k]];
   installEngineHosts(rt,id);
   const end=process.env.PARITY_END?Number(process.env.PARITY_END):Math.max(...trace.keys());
   if(process.env.PARITY_DEBUG)(globalThis as any).__parityRt=rt;
   const result=runParity(rt,trace,start,end,new Set([...battleObjects,...enemies]),['hp','tension','turntimer','myfight','mnfight','inv'],skippedIds,replay);
   console.log(`${id} engine ${start}-${end}`,result,'not restored:',[...skipped].join(' '));
   expect(result.mismatch).toBeUndefined();
  },120000);
 });
}
