// A battle run entirely by the game's own objects: the party globals and encounter setup go in, then
// obj_battlecontroller runs the menus, the turns, the spells and the victory. The host only feeds keys, steps and
// draws the runtime, and reads the outcome (game over, or the battle's end).
import {GmRuntime,type GmInstance,type GmObjectDef} from '../gm/runtime';
import type {SpriteBank} from '../gm/sprites';
import {validateLoadout,type EquipmentSource,type Loadout} from '../../game/loadout';
import * as b from '../deltarune/battle';
import {battleControllerFull,endCombat,findController,attackPhase} from '../deltarune/controller';
import {encounterSetup,monsterSetup,partyGlobals,type EquippedStats} from '../deltarune/encounter';
import {battleText,battleTextDefault,destroyWriters,enemyBalloon,face,writer} from '../deltarune/writer';
import {defeatRun} from '../deltarune/party';
import {cloverEnemy} from '../bosses/clover';
import {checkersEnemy} from '../bosses/kround';
import {lancerEnemy} from '../bosses/lancer/enemy';
import {lancerEnemy2} from '../bosses/lancer/enemy2';
import {susieEnemy,lancerEnemy3,installSusieLancerPresentation} from '../bosses/lancer/susie';
import {jokerBackground,jokerEnemy} from '../bosses/jevil/enemy';
import {kingEnemy} from '../bosses/king/enemy';
import {sourceText} from './text';
import {sourceEncounter,developmentEncounter} from './encounters';
import {chapter2StartStats} from '../deltarune/chapter2';
import {chapter3StartStats} from '../deltarune/chapter3';
import {withHook} from '../deltarune/rules';
/** Globals and flags a retry keeps: the Knight's loss advice and UltraHeal's growth survive GO BACK's room change. */
const SESSION={globals:['knight_battle_losses'],flags:[1045,1263,1264]} as const;
export type Session={globals:Record<string,unknown>;flags:Record<number,number>};
import type {installNeoHost} from './neo';
import type {installChapter2BossHost} from './chapter2-bosses';
import {initializeChapter2SmallFaces} from '../deltarune/chapter2-enemy';
import {BattleRunTracker,type RunRecord} from '../../game/battle-run';
import {GAME_END_ROOM,RETRY_ROOM,endBattle,gotoGameOverRoom,hasCommittedGiveUp,isGameOverRoom} from '../deltarune/battle-end';

/** The encounters whose enemies run on the engine, with their scr_encountersetup number and room. */
const ENGINE:Record<string,{n:number;room:string;backdrop:boolean;presentation?:(rt:GmRuntime)=>void}>={
 'ch2-61':{n:61,room:'room_dw_mansion_b_east',backdrop:false},
 'ch2-57':{n:57,room:'room_dw_mansion_east_2f_d',backdrop:true},
 // Queen's story room needs the scene that hangs Berdly's wire (obj_ch2_scene25, not ported); in the battle test room
 // Berdly starts in place, as in the recordings.
 'ch2-59':{n:59,room:'room_battletest',backdrop:true},
 // Spamton's alley (room_dw_city_spamton_alley) holds the scene that starts him; the battle itself needs nothing of it.
 'ch2-60':{n:60,room:'room_battletest',backdrop:true},
 // The band plays in Cyber City's music room (obj_ch2_cyber01 starts them); the battle needs nothing of it.
 'ch2-62':{n:62,room:'room_battletest',backdrop:true},
 'ch2-63':{n:63,room:'room_battletest',backdrop:true},
 'ch2-58':{n:58,room:'room_battletest',backdrop:true},
 'ch2-82':{n:82,room:'room_battletest',backdrop:true},
 'ch2-84':{n:84,room:'room_battletest',backdrop:true},
 'ch2-81':{n:81,room:'room_dw_mansion_east_4f_b',backdrop:true},
 'ch2-83':{n:83,room:'room_dw_city_mice3_transformed_new2F',backdrop:true},
 'ch2-89':{n:89,room:'room_dw_castle_dojo',backdrop:true},
 'ch2-94':{n:94,room:'room_dw_castle_dojo',backdrop:true},
 'ch3-115':{n:115,room:'room_dw_snow_zone',backdrop:true},
 'ch1-2':{n:2,room:'room_field_start',backdrop:true},
 'ch1-8':{n:8,room:'room_forest_area3',backdrop:true},
 'ch1-20':{n:20,room:'room_field_puzzletutorial',backdrop:true},
 'ch1-12':{n:12,room:'room_field_checkersboss',backdrop:true},
 'ch1-25':{n:25,room:'room_cc_joker',backdrop:false},
 'ch1-27':{n:27,room:'room_cc_6f',backdrop:false},
 'ch1-31':{n:31,room:'room_field_secret1',backdrop:true,presentation:installSusieLancerPresentation},
 'ch1-40':{n:40,room:'room_castle_throneroom',backdrop:true},
};
export const runsOnEngine=(id:string)=>id in ENGINE;
/** A chapter's boss host: its object table and boss objects, installed on the battle's runtime. */
type ChapterHost=(rt:GmRuntime,options:{room:string})=>{objects:Record<string,GmObjectDef>;enter:(enemy:GmInstance)=>void};
/** Each chapter's party stats at its start (Chapter 1's: BASE). */
const START_STATS:Record<number,()=>{hp:number[];maxhp:number[];at:number[];df:number[];mag:number[]}>={
 1:()=>({...BASE,maxhp:BASE.hp}),2:()=>chapter2StartStats(),3:()=>chapter3StartStats(),
};
function forChapterStats(chapter:number){const stats=START_STATS[chapter];if(!stats)throw Error(`No Chapter ${chapter} party stats`);return stats();}
/** Party base stats (HP, AT, DF, MAGIC for Kris, Susie, Ralsei) at this point of Chapter 1. */
const BASE={hp:[0,90,110,70],at:[0,10,14,8],df:[0,2,2,2],mag:[0,0,1,7]};

/** The enemy objects an encounter's setup creates. */
export function engineEnemies(id:string):Record<string,GmObjectDef>{
 if(!ENGINE[id])throw Error(`${id} does not run on the engine`);
 if(id==='ch1-2')return {obj_lancerboss:lancerEnemy};
 if(id==='ch1-8')return {obj_clubsenemy:cloverEnemy};
 if(id==='ch1-20')return {obj_lancerboss2:lancerEnemy2};
 if(id==='ch1-25')return {obj_joker:jokerEnemy};
 if(id==='ch1-40')return {obj_king_boss:kingEnemy};
 if(id==='ch1-31')return {obj_susieenemy:susieEnemy,obj_lancerboss3:lancerEnemy3};
 return {obj_checkers_enemy:checkersEnemy};
}
/** The original room an engine battle stands for (GML room): some enemies check it (K.Round's story flags). */
export const engineRoom=(id:string)=>ENGINE[id]?.room??'';
export class EngineBattle{
 readonly rt:GmRuntime;readonly name:string;readonly party:readonly number[];
 paused=false;outcome:'victory'|'defeat'|null=null;turn=0;
 /** While the game plays its ending: the win's fade-out (obj_endbattle) or the game over's rooms. */
 ending:'victory'|'defeat'|null=null;
 /** After a game over, what the player chose: try again (scr_tempload) or leave (the game's end). */
 afterDefeat:'retry'|'menu'|null=null;
 readonly scoring:BattleRunTracker|null;result:RunRecord|null=null;
 private scoreFinished=false;
 constructor(bank:SpriteBank,readonly equipment:EquipmentSource,readonly loadout:Loadout,readonly id:string,seed=11,options:{development?:boolean;neoHost?:typeof installNeoHost;chapterHost?:ChapterHost;chapter2Host?:ChapterHost;scoring?:boolean;rage?:boolean;gameOvers?:number;secretBossAttempts?:number;session?:Session}={}){
  const encounter=options.development?developmentEncounter(id):sourceEncounter(id),setup=ENGINE[id];
  if(!encounter||!setup)throw Error('This battle is not available yet.');
  if(id==='ch2-61'&&!options.neoHost)throw Error('Load the Chapter 2 source host before starting NEO.');
  const host=options.chapterHost??options.chapter2Host;
  if(encounter.chapter>=2&&id!=='ch2-61'&&!host)throw Error(`Load the Chapter ${encounter.chapter} boss host before starting this battle.`);
  validateLoadout(loadout,equipment);
  this.rt=new GmRuntime(bank,{seed});this.name=encounter.name;this.party=encounter.party;
  const rt=this.rt,gear=(list:typeof equipment.weapons,id:number)=>list.find(g=>g.id===id);
  rt.globals.chapter=encounter.chapter;
  const neo=id==='ch2-61'?options.neoHost!(rt,{rage:options.rage}):undefined;
  const chapterHost=encounter.chapter>=2&&!neo?host!(rt,{room:setup.room}):undefined;
  rt.room.name=setup.room;
  if(neo){rt.view.x=1640;rt.room.width=2400;}
  const charIds=encounter.party.includes(4)?[1,2,3,4]:[1,2,3];
  const equipped:Record<number,EquippedStats>={};
  for(const c of charIds){
   const slot=loadout.characters[c]??{weapon:0,armor:[0,0]},w=gear(equipment.weapons,slot.weapon),a1=gear(equipment.armors,slot.armor[0]),a2=gear(equipment.armors,slot.armor[1]);
   // Weapon 0 is "Game default": scr_gamestart's Wood Blade, Mane Ax and Red Scarf (ids 1, 2, 3; no stats).
   equipped[c]={weapon:slot.weapon||(c===4?12:c),armor:[...slot.armor],itemat:[w?.attack??0,a1?.attack??0,a2?.attack??0],itemdf:[w?.defense??0,a1?.defense??0,a2?.defense??0],itemmag:[w?.magic??0,a1?.magic??0,a2?.magic??0]};
  }
  const char=[...encounter.party,0,0,0].slice(0,3);
  const startStats=encounter.chapter===2&&encounter.party.includes(4)?chapter2StartStats(true):forChapterStats(encounter.chapter);
  partyGlobals(rt,{char,...startStats,equipped,items:loadout.items,auto:encounter.auto});
  // global.batmusic: the battle's music, which some enemies pause (Ralsei's lullaby).
  rt.globals.batmusic=[encounter.music,encounter.music];
  if(encounter.chapter>=2){
   const g=rt.globals;g.fighting=0;g.sp=4;g.currentsong=[-1,-1];
   g.chararmor1=[0,...charIds.map(c=>loadout.characters[c]?.armor[0]??0)];g.chararmor2=[0,...charIds.map(c=>loadout.characters[c]?.armor[1]??0)];
   initializeChapter2SmallFaces(rt);
   g.itemelement=Array.from({length:charIds.length+1},()=>[0,0,0]);g.itemelementamount=Array.from({length:charIds.length+1},()=>[0,0,0]);
   for(const c of charIds)for(let j=0;j<2;j++){const armor=gear(equipment.armors,loadout.characters[c]?.armor[j]??0);g.itemelement[c][j+1]=armor?.element??0;g.itemelementamount[c][j+1]=armor?.elementAmount??0;}
   g.chemg_sprite_map=Object.fromEntries([...(bank.names?.()??[])].map(name=>[name,name]));
  }
  // Restore persistent spell progression before the controller builds the spell menus.
  if(options.session){Object.assign(rt.globals,options.session.globals);for(const [i,v] of Object.entries(options.session.flags))rt.globals.flag[Number(i)]=v;}
  encounterSetup(rt,setup.n,neo?{'obj_spamton_neo_enemy':neo.objects.obj_spamton_neo_enemy}:chapterHost?chapterHost.objects:engineEnemies(id));
  if(setup.backdrop)rt.create(b.battleBack,0,0);
  // Jevil's room has its own spinning background (drawn by the host view).
  if(id==='ch1-25')rt.create(jokerBackground,0,0);
  rt.create(battleControllerFull,0,0);
  setup.presentation?.(rt);
  if(neo){rt.globals.fighting=1;neo.enter(this.enemy!);}
  chapterHost?.enter(this.enemy!);
  this.scoring=options.scoring&&!options.development?new BattleRunTracker(id,loadout,rt.globals):null;
  if(this.scoring)rt.onItemUsed=item=>this.scoring!.itemUsed(item);
  if(this.scoring)rt.onBattleMode=mode=>this.scoring!.mode(mode);
  // global.tempflag[3] counts game overs; it outlives scr_tempload, and the failure screen is quicker after the first.
  rt.globals.tempflag[3]=options.gameOvers??0;
  // scr_get_knight_total_attempts: how many times this secret boss has been fought before (save slots in dr.ini).
  rt.globals.secretbossattempts=options.secretBossAttempts??0;
 }
 /** What outlives a retry, as it does in the game (which returns to the room without loading): see SESSION. */
 session():Session{
  const g=this.rt.globals,out:Session={globals:{},flags:{}};
  for(const k of SESSION.globals)if(k in g)out.globals[k]=g[k];
  for(const i of SESSION.flags)if(g.flag[i]!==undefined)out.flags[i]=g.flag[i];
  return out;
 }
 get enemy():GmInstance|undefined{return this.rt.byId(this.rt.globals.monsterinstance[0]);}
 /** A short label for the status line: whose turn it is. */
 get phase(){
  const g=this.rt.globals;
  if(this.outcome)return this.outcome;
  if(this.ending==='defeat')return 'game over';
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
  const confirmSkip=rt.input.pressed.has(b.KEY.z)||rt.input.pressed.has(b.KEY.enter);
  // Only source-declared endings may consume confirm here. Generic fields such as endcon/sparecon
  // also occur during attacks and ACTs, including phases which can return to combat.
  if(confirmSkip){
   if(this.ending==='victory'){this.skipVictory();return;}
   const endingText=withHook(rt,'canSkipEndingText').some(([e,h])=>h(e,rt));
   if(endingText){
    destroyWriters(rt);
    for(const i of rt.instances)if(i.live&&(i.object.name==='obj_battle_blcon'||i.object.name==='obj_battleblcon'))rt.destroy(i);
   }
  }
  g.time+=1;rt.step();
  // Let the controller apply its normal rewards, revival and chapter hooks before removing its text.
  const c=findController(rt);
  this.scoring?.frame(g);
  if(c?.victoried===1)this.finishScore('victory');
  if(confirmSkip&&c?.victoried===1){this.skipVictory();return;}
  if(before===2&&g.mnfight===0&&!this.ending)this.turn+=1;
  const room=rt.pendingRoom;
  if(room==='battle_end'&&!this.ending)this.end('victory');
  if(!this.ending)for(const [e,h] of withHook(rt,'battleOutcome')){const how=h(e,rt);if(how){this.end(how);this.outcome=how;break;}}
  if(this.ending==='victory'&&!rt.exists(endBattle))this.outcome='victory';
  if(isGameOverRoom(room)){rt.pendingRoom=null;if(!this.ending)this.end('defeat');gotoGameOverRoom(rt,room!);}
  if(room===RETRY_ROOM||room===GAME_END_ROOM||(this.ending==='defeat'&&hasCommittedGiveUp(rt))){this.afterDefeat=room===RETRY_ROOM?'retry':'menu';this.outcome='defeat';}
 }
 /** Skip presentation only once the source has committed victory (including its reward setup). */
 private skipVictory(){
  const rt=this.rt,c=findController(rt);
  destroyWriters(rt);for(const f of rt.all(face))rt.destroy(f);
  if(c){c.intro=2;c.bp=0;if(rt.pendingRoom!=='battle_end')endCombat(c,rt);}
  for(const eb of rt.all(endBattle))rt.destroy(eb);
  if(!this.ending)this.end('victory');
  this.outcome='victory';
 }
 /** The run is scored when the battle itself ends, not after the ending plays. */
 private end(how:'victory'|'defeat'){this.ending=how;this.finishScore(how);}
 private finishScore(how:'victory'|'defeat'){
  if(this.scoreFinished)return;
  this.scoreFinished=true;this.result=this.scoring?.finish(how,this.rt.globals)??null;
 }
}
