// A battle run entirely by the game's own objects: the party globals and encounter setup go in, then
// obj_battlecontroller runs the menus, the turns, the spells and the victory. The host only feeds keys, steps and
// draws the runtime, and reads the outcome (game over, or the battle's end).
import {GmRuntime,type GmInstance,type GmObjectDef} from '../gm/runtime';
import type {SpriteBank} from '../gm/sprites';
import {validateLoadout,type EquipmentSource,type Loadout} from '../../game/loadout';
import * as b from '../deltarune/battle';
import {battleControllerFull} from '../deltarune/controller';
import {attackPhase} from '../deltarune/controller';
import {encounterSetup,monsterSetup,partyGlobals,type EquippedStats} from '../deltarune/encounter';
import {battleText,battleTextDefault,destroyWriters,enemyBalloon,writer} from '../deltarune/writer';
import {defeatRun} from '../deltarune/party';
import {createCloverEnemy} from '../bosses/clover';
import {checkersEnemy,checkerTransform,type KRoundHost,type KRoundThrowHost,type KRoundThrowMessage} from '../bosses/kround';
import {checkersHealAnim,flashCheckers} from '../bosses/kround/effects';
import {lancerEnemy} from '../bosses/lancer/enemy';
import {jokerBackground,jokerEnemy} from '../bosses/jevil/enemy';
import {sourceText} from './text';
import {sourceEncounter,developmentEncounter} from './encounters';

/** The encounters whose enemies run on the engine, with their scr_encountersetup number and room. */
const ENGINE:Record<string,{n:number;room:string;backdrop:boolean}>={
 'ch1-2':{n:2,room:'room_field_start',backdrop:true},
 'ch1-8':{n:8,room:'room_forest_area3',backdrop:true},
 'ch1-12':{n:12,room:'room_field_checkersboss',backdrop:true},
 'ch1-25':{n:25,room:'room_cc_joker',backdrop:false},
 'ch1-27':{n:27,room:'room_cc_6f',backdrop:false},
};
export const runsOnEngine=(id:string)=>id in ENGINE;
/** Party base stats (HP, AT, DF, MAGIC for Kris, Susie, Ralsei) at this point of Chapter 1. */
const BASE={hp:[0,90,110,70],at:[0,10,14,8],df:[0,2,2,2],mag:[0,0,1,7]};
const THROW_TEXT:Record<Exclude<KRoundThrowMessage,'power-instructions'>,string>={
 'crown-hit':'obj_ralseithrown_slash_Collision_154b9139_8c0d_44d5_b8de_0f03c1a8096c_gml_6_0',
 'body-hit':'obj_ralseithrown_slash_Collision_154b9139_8c0d_44d5_b8de_0f03c1a8096c_gml_29_0',
 'miss':'obj_ralseithrown_slash_Step_0_gml_23_0',
};

/** Clover on the engine: her events call the game's writers, attack phase and monster setup. */
const cloverEnemy=createCloverEnemy({
 text:sourceText,writerExists:rt=>rt.exists(writer),dismissWriters:rt=>destroyWriters(rt),
 enemySpeech:(rt,x,y,kind)=>{enemyBalloon(rt,x,y,kind);},
 battleText:(rt,useDefault)=>{if(useDefault)battleTextDefault(rt);else battleText(rt);},
 attackPhase:rt=>attackPhase(rt),
 // scr_defeatrun: the enemy runs off as its hurt sprite.
 defeat:(s,rt)=>{defeatRun(s,rt);},
 monsterSetup:(s,rt)=>monsterSetup(s,rt),
});
/** The enemy objects an encounter's setup creates. */
export function engineEnemies(id:string):Record<string,GmObjectDef>{
 if(!ENGINE[id])throw Error(`${id} does not run on the engine`);
 if(id==='ch1-2')return {obj_lancerboss:lancerEnemy};
 if(id==='ch1-8')return {obj_clubsenemy:cloverEnemy};
 if(id==='ch1-25')return {obj_joker:jokerEnemy};
 return {obj_checkers_enemy:checkersEnemy};
}
/** Callbacks some enemies read from globals (K.Round's), installed on the battle's runtime. */
export function installEngineHosts(rt:GmRuntime,id:string){if(id==='ch1-12'||id==='ch1-27')kroundHosts(rt,ENGINE[id].room);}
function kroundHosts(rt:GmRuntime,room:string){
  const host:KRoundHost={
   lang:sourceText,writerExists:()=>rt.exists(writer),clearWriters:()=>destroyWriters(rt),
   battleText:useDefault=>{if(useDefault)battleTextDefault(rt);else battleText(rt);},
   face:(slot,hero,emotion)=>{rt.globals.msg[slot]=sourceText(hero==='ralsei'?'scr_ralface_slash_scr_ralface_gml_1_0':'scr_susface_slash_scr_susface_gml_1_0').replace('~1',String(emotion));},
   // scr_get_input_name(6) on a keyboard: the C key.
   inputName:()=>'C',attackPhase:()=>attackPhase(rt),
   flash:actor=>{flashCheckers(actor,rt);},
   healAnimation:checkersHealAnim,checkerTransform,
   monsterSetup:s=>monsterSetup(s,rt),roomName:()=>room,
  };
  const throwHost:KRoundThrowHost={
   text:message=>{
    destroyWriters(rt);
    rt.globals.msg[0]=message==='power-instructions'?sourceText('obj_throwralsei_slash_Step_0_gml_26_0')+'C'+sourceText('obj_throwralsei_slash_Step_0_gml_26_1'):sourceText(THROW_TEXT[message]);
    battleTextDefault(rt);
   },
   clearWriters:()=>destroyWriters(rt),
  };
  rt.globals.kroundHost=host;rt.globals.kroundThrowHost=throwHost;
}
export class EngineBattle{
 readonly rt:GmRuntime;readonly name:string;readonly party:readonly number[];
 paused=false;outcome:'victory'|'defeat'|null=null;turn=0;
 constructor(bank:SpriteBank,readonly equipment:EquipmentSource,readonly loadout:Loadout,readonly id:string,seed=11,options:{development?:boolean}={}){
  const encounter=options.development?developmentEncounter(id):sourceEncounter(id),setup=ENGINE[id];
  if(!encounter||!setup)throw Error('This battle is not available yet.');
  validateLoadout(loadout,equipment);
  this.rt=new GmRuntime(bank,{seed});this.name=encounter.name;this.party=encounter.party;
  const rt=this.rt,gear=(list:typeof equipment.weapons,id:number)=>list.find(g=>g.id===id);
  const equipped:Record<number,EquippedStats>={};
  for(const c of [1,2,3]){
   const slot=loadout.characters[c],w=gear(equipment.weapons,slot.weapon),a1=gear(equipment.armors,slot.armor[0]),a2=gear(equipment.armors,slot.armor[1]);
   // Weapon 0 is "Game default": scr_gamestart's Wood Blade, Mane Ax and Red Scarf (ids 1, 2, 3; no stats).
   equipped[c]={weapon:slot.weapon||c,itemat:[w?.attack??0,a1?.attack??0,a2?.attack??0],itemdf:[w?.defense??0,a1?.defense??0,a2?.defense??0],itemmag:[w?.magic??0,a1?.magic??0,a2?.magic??0]};
  }
  const char=[...encounter.party,0,0,0].slice(0,3);
  partyGlobals(rt,{char,hp:BASE.hp,maxhp:BASE.hp,at:BASE.at,df:BASE.df,mag:BASE.mag,equipped,items:loadout.items,auto:id==='ch1-2'?[2]:[]});
  installEngineHosts(rt,id);encounterSetup(rt,setup.n,engineEnemies(id));
  if(setup.backdrop)rt.create(b.battleBack,0,0);
  // Jevil's room has its own spinning background (drawn by the host view).
  if(id==='ch1-25')rt.create(jokerBackground,0,0);
  rt.create(battleControllerFull,0,0);
 }
 get enemy():GmInstance|undefined{return this.rt.byId(this.rt.globals.monsterinstance[0]);}
 /** A short label for the status line: whose turn it is. */
 get phase(){
  const g=this.rt.globals;
  if(this.outcome)return this.outcome;
  if(g.myfight===0)return 'command';
  if(g.myfight===1)return 'attack';
  if(g.myfight===3)return 'act';
  if(g.myfight===4)return 'spells';
  if(g.myfight===7)return 'victory';
  if(g.mnfight===1)return 'enemy talk';
  if(g.mnfight===2)return 'enemy attack';
  return 'battle';
 }
 /** One game frame. Keys reach the game through rt.input (held, and pressed this frame). */
 step(){
  if(this.paused||this.outcome)return;
  const rt=this.rt,g=rt.globals,before=g.mnfight;
  g.time+=1;rt.step();
  if(before===2&&g.mnfight===0)this.turn+=1;
  if(rt.pendingRoom==='room_gameover')this.outcome='defeat';
  else if(rt.pendingRoom==='battle_end')this.outcome='victory';
 }
}
