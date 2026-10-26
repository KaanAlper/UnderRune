// Where the shared battle engine differs by chapter or by enemy. Every difference is one named point here, chosen in
// one place, so the shared objects never test the chapter number or name a boss.
//
// - ChapterRules: what changed in the engine itself between chapters (one strategy object per chapter).
// - BattleHooks: what the original engine does for one specific object (the original code names that object at that
//   point, as in "with (obj_spamton_neo_enemy)"). Each object (an enemy, or one of its attacks) declares its own hooks
//   on its definition, and the shared code runs them at the same point as the original, for every instance in the
//   battle whose object has the hook.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';

export interface ChapterRules{
 readonly chapter:number;
 /** Auto-Susie's finishing FIGHT hit marks the enemy as beaten by her (flag 51+n = 5). Chapter 2's code addresses
  * the wrong instance there, so the mark never happens. */
 readonly autoSusieMarksKill:boolean;
 /** Bringing the soul into the box (scr_moveheart) also ends its invincibility (global.inv = 0). */
 readonly moveHeartEndsInvincibility:boolean;
 /** Heroes can be poisoned (an item's poison takes HP over time). */
 readonly heroesCanBePoisoned:boolean;
 /** The soul has colour modes (red, yellow) and can be frozen in place (canmove). */
 readonly soulHasModes:boolean;
 /** Slowing the soul with X can be turned off in the settings (flag 22). */
 readonly slowSoulSetting:boolean;
 /** An enemy's random target is the whole party (mytarget 4, every hero that can be hit marked). */
 readonly enemiesTargetWholeParty:boolean;
 /** The tension bar keeps itself 40 pixels below the top of the view, so it moves with screen shakes. */
 readonly tensionBarFollowsView:boolean;
 /** The tension bar is drawn through a surface (its cutout rounds the fill), with the TP logo and percentage last. */
 readonly tensionBarSurface:boolean;
 /** Enemies ask the battle phase through scr_isphase, which leaves its answer in the asking instance's __isphase. */
 readonly phaseScript:boolean;
 /** Chapter 3's command row: the cursor skips Susie's TECH while the controller's disablesusieact is set, DEFEND counts
  * in idefendedthisturn (cleared when everyone has chosen, taken back with its 40 mercy by going back), and other
  * encounters' input locks (board introductions, Rouxls's grid) exist. */
 readonly commandRow3:boolean;
 /** scr_bulletspawner also records the spawning instance in the bullet maker (creatorid). */
 readonly bulletMakerKnowsSpawner:boolean;
 /** scr_tensionheal also adds the TP to the controller's mercytotal (0 to 250). */
 readonly tensionCountsMercy:boolean;
}
const CHAPTER1:ChapterRules={chapter:1,tensionCountsMercy:false,bulletMakerKnowsSpawner:false,commandRow3:false,soulHasModes:false,slowSoulSetting:false,heroesCanBePoisoned:false,moveHeartEndsInvincibility:false,autoSusieMarksKill:true,enemiesTargetWholeParty:false,tensionBarFollowsView:false,tensionBarSurface:false,phaseScript:false};
const CHAPTER2:ChapterRules={chapter:2,tensionCountsMercy:false,bulletMakerKnowsSpawner:false,commandRow3:false,soulHasModes:true,slowSoulSetting:true,heroesCanBePoisoned:true,moveHeartEndsInvincibility:true,autoSusieMarksKill:false,enemiesTargetWholeParty:true,tensionBarFollowsView:true,tensionBarSurface:true,phaseScript:true};
/** Chapter 3 keeps Chapter 2's rules: each was checked in its code (scr_moveheart, scr_randomtarget, obj_tensionbar,
 * scr_isphase, obj_heart, obj_heroparent's poison and the auto-Susie mark, which still addresses the wrong instance). */
const CHAPTER3:ChapterRules={chapter:3,tensionCountsMercy:true,bulletMakerKnowsSpawner:true,commandRow3:true,soulHasModes:true,slowSoulSetting:true,heroesCanBePoisoned:true,moveHeartEndsInvincibility:true,autoSusieMarksKill:false,enemiesTargetWholeParty:true,tensionBarFollowsView:true,tensionBarSurface:true,phaseScript:true};
/** A component's part for the running battle's chapter, from the table of its versions next to it. */
export function forChapter<T>(rt:GmRuntime,versions:Readonly<Record<number,T>>,what:string):T{
 const v=versions[rt.globals.chapter??1];
 if(v===undefined)throw Error(`${what} has no Chapter ${rt.globals.chapter} version`);
 return v;
}
/** The running battle's chapter rules (global.chapter). */
export function rules(rt:GmRuntime):ChapterRules{
 const r=({1:CHAPTER1,2:CHAPTER2,3:CHAPTER3} as Record<number,ChapterRules>)[rt.globals.chapter??1];
 if(!r)throw Error(`No battle rules for chapter ${rt.globals.chapter}`);
 return r;
}

export interface BattleHooks{
 /** Source encounter changes to a spell's menu targeting and animation. */
 adjustSpellInfo?(enemy:GmInstance,caller:GmInstance,rt:GmRuntime,spell:number):void;
 /** Encounter-owned spell cutscenes. True when the source spell was handled. */
 castSpecialSpell?(enemy:GmInstance,caller:GmInstance,rt:GmRuntime,spell:number):boolean;
 /** Source route's alternate hero victory presentation. */
 onHeroVictory?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime):void;
 /** Encounter-specific panel initialization after the shared controller has built its chapter fields. */
 onControllerCreate?(enemy:GmInstance,controller:GmInstance,rt:GmRuntime):void;
 /** An encounter's name for a merged ACT entry when the enemy types differ. */
 mixedActName?(enemy:GmInstance,rt:GmRuntime,character:number,slot:number,name:string):string|undefined;
 /** scr_endturn (Chapter 2): the ACTs start with only the first party member's single ACT chosen this turn. */
 soleFirstActor?(enemy:GmInstance,rt:GmRuntime):void;
 /** Redirect a FIGHT hit before HP subtraction. True means the encounter consumed the damage. */
 interceptFightDamage?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,target:number,damage:number,number:GmInstance):boolean;
 /** React to the completed slash effect. True suppresses ordinary enemy recoil, retaining hurtamt. */
 onFightImpact?(enemy:GmInstance,hero:GmInstance,attack:GmInstance,rt:GmRuntime,target:number,damage:number):boolean;
 /** Final source encounter adjustments after a FIGHT impact, before ordinary defeat handling. */
 onFightResolved?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,target:number,damage:number):void;
 /** Redirect a spell impact before the ordinary damage helper creates its number and recoil. */
 interceptSpellDamage?(enemy:GmInstance,spell:GmInstance,rt:GmRuntime,target:number,damage:number,spellId:number):boolean;
 /** The encounter suppresses the tired/Pacify cue even when its enemy is tired. */
 suppressesPacifyHighlight?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** The battle panel and the FIGHT bar are not drawn at all (the Roaring Knight's ending cutscene). */
 hidesBattleHud?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** The enemy list shows "???" instead of HP percentages (the Roaring Knight). */
 hidesHpPercent?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** Extra vertical movement of the command panel (boxing transitions). */
 controllerHudOffset?(enemy:GmInstance,controller:GmInstance,rt:GmRuntime):number;
 /** An encounter replaces a party portrait and name (boxing). True when it drew them. */
 drawPartyHead?(enemy:GmInstance,controller:GmInstance,rt:GmRuntime,character:number,x:number,y:number):boolean;
 /** An encounter displays a different HP value in the HUD (boxing knockout). */
 partyHudHp?(enemy:GmInstance,rt:GmRuntime,character:number,hp:number):number;
 /** Additional portraits on ACT rows (NEO's rescue sequence). */
 drawActOverlay?(enemy:GmInstance,controller:GmInstance,rt:GmRuntime):void;
 /** Source encounter reaction after a shared command has been chosen. */
 onCommandChosen?(enemy:GmInstance,controller:GmInstance,rt:GmRuntime,command:'defend'|'item'):void;
 /** Encounter introductions/transitions can suspend controller Step. */
 blocksControllerStep?(enemy:GmInstance,controller:GmInstance,rt:GmRuntime):boolean;
 /** A FIGHT hit lands on the battle (damage above 0), before the target flinches. NEO: the electrified pose. */
 onHeroHit?(enemy:GmInstance,rt:GmRuntime):void;
 /** False when HP at zero after a FIGHT hit or a damaging spell does not defeat the enemy there: it ends the battle
  * in its own code (NEO; also Queen and Berdly). */
 readonly defeatedByDamage?:boolean;
 /** While this enemy is in the battle, damage leaves every enemy at 1 HP at least (Sweet's band: they are not beaten
  * by FIGHTing, they drink milk). */
 readonly keepsEnemiesAtOneHp?:boolean;
 /** Where a heal's white flash goes from this enemy's origin (obj_healanim moves every flash by it). */
 readonly healFlashShift?:readonly [number,number];
 /** Multi-layer battle actors may add their source heal flash after the ordinary body flash. */
 onHealFlash?(target:GmInstance,effect:GmInstance,rt:GmRuntime):void;
 /** An actor whose origin differs from a hero's supplies its source healing-particle position and RNG calls. */
 healParticlePosition?(target:GmInstance,effect:GmInstance,rt:GmRuntime):readonly [number,number];
 /** While this enemy is in the battle, the party's FIGHT damage numbers draw above everything (Rouxls's board). */
 readonly fightNumbersOnTop?:boolean;
 /** This bullet (exactly this object, not its children) can be grazed while inactive (the Knight's tunnel swords). */
 readonly grazedWhileInactive?:boolean;
 /** The enemy turn is over (obj_battlecontroller Alarm 2): true when the enemy takes over instead of the next turn
  * (NEO at full mercy starts his ending). */
 onTurnEnd?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** The yellow soul's shots come out as BIG SHOTs (NEO's upgrade); true when this object makes it so. */
 upgradedShot?(obj:GmInstance,rt:GmRuntime):boolean;
 /** Charging and the soul's glow go twice as fast (NEO, after Susie's Super Charge). */
 superCharged?(obj:GmInstance,rt:GmRuntime):boolean;
 /** A BIG SHOT is fired (NEO counts it, and spends a Super Charge on it). */
 onBigShot?(obj:GmInstance,shot:GmInstance,soul:GmInstance,rt:GmRuntime):void;
 /** Shots reaching its window ring its bell and stop (NEO's face attack). */
 ringsShots?(obj:GmInstance,rt:GmRuntime):boolean;
 /** Where it pulls shots in, if it does (NEO's final form). */
 pullsShots?(obj:GmInstance,rt:GmRuntime):[number,number]|undefined;
 /** An obj_oflash on this object: true when the object shows the flash itself (NEO flashes his parts and is
  * electrified), so the flash draws nothing. */
 onFlash?(obj:GmInstance,flash:GmInstance,rt:GmRuntime):boolean;
 /** The sprite a flash on this object copies, when not its current one (Mauswheel's idle, Berdly's hurt sprite). */
 flashSprite?(obj:GmInstance):string;
 /** True while the tension bar is hidden (GIGA Queen's boxing). */
 hidesTensionBar?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** A bullet takes a hero's HP to zero: true when the enemy catches it instead (the hero keeps 1 HP and the enemy
  * reacts in its own code; GIGA Queen's boxing round ends). */
 catchesKnockout?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** scr_damage (Chapter 3) first tells the enemy the party was hit (the Roaring Knight's progamer). */
 onPartyHit?(enemy:GmInstance,rt:GmRuntime):void;
 /** While this object exists, hits skip defense, defending, armor and element (the Knight's roar). */
 dealsTrueDamage?(self:GmInstance,rt:GmRuntime):boolean;
 /** Before an ordinary hit is measured, the enemy may change its target (the bullet's target field). */
 redirectsHit?(enemy:GmInstance,bullet:GmInstance,rt:GmRuntime):void;
 /** Maximum-HP damage has its own targeting and ratio rules in the source. */
 redirectsMaxHpHit?(enemy:GmInstance,bullet:GmInstance,rt:GmRuntime):void;
 scalesMaxHpRatio?(enemy:GmInstance,bullet:GmInstance,rt:GmRuntime,ratio:number):number;
 /** Handles source-specific knockout HP and feedback fields; true skips the ordinary fallen state. */
 catchesMaxHpKnockout?(enemy:GmInstance,bullet:GmInstance,rt:GmRuntime):boolean;
 /** An ordinary hit on this party slot is cut by the enemy (the Shadow Mantle against the Knight): the new damage,
  * which then ignores element resistance, or undefined. */
 reducesHit?(enemy:GmInstance,rt:GmRuntime,slot:number,damage:number):number|undefined;
 /** The damage a standing hero takes from this hit, changed by the enemy (the Knight's softer Flurry), or undefined. */
 softensHit?(enemy:GmInstance,rt:GmRuntime,damage:number):number|undefined;
 /** A hero knocked out in this slot drops to -999 HP (damage text type 12) instead of minus half their max HP. */
 knocksOutHard?(enemy:GmInstance,rt:GmRuntime,slot:number):boolean;
 /** The battle ends its own way (no victory screen, no game over): its outcome once that ending is over. */
 battleOutcome?(enemy:GmInstance,rt:GmRuntime):'victory'|'defeat'|undefined;
 /** Host confirm may dismiss this enemy's ending text; this never declares a battle outcome. */
 canSkipEndingText?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** No game over when the whole party is down (the battle ends its own way). */
 preventsGameOver?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** Chapter 3's FIGHT: the enemy blocks the hits now (no slash; onFightBlocked instead). */
 blocksFight?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** A blocked FIGHT hit that did damage. */
 onFightBlocked?(enemy:GmInstance,rt:GmRuntime):void;
 /** FIGHT damage as the enemy changes it (NEO's high defense, the Knight's damage reduction). */
 scalesFightDamage?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,damage:number):number;
 /** Rude Buster's bolt aims somewhere else: true when the hook set its targetx/targety (Queen's shield). */
 aimsRudeBuster?(enemy:GmInstance,rt:GmRuntime,bolt:GmInstance):boolean;
 /** Chapter 3's Rude Buster damage as the enemy changes it (the Knight's damage reduction). */
 scalesRudeBuster?(enemy:GmInstance,rt:GmRuntime,damage:number):number;
 /** Rude Buster's impact adjustment, after its timing bonus and Red Buster bonus. */
 scalesRudeBusterImpact?(enemy:GmInstance,rt:GmRuntime,damage:number):number;
 /** scr_damage_enemy took the enemy in `slot` to 0 HP or below (Berdly ends his battle then: endcon 1). */
 onDamagedToZero?(enemy:GmInstance,rt:GmRuntime,slot:number):void;
 /** scr_damage_enemy hurt this enemy (amount over 0), after its hurt state is set. */
 onEnemyDamaged?(enemy:GmInstance,rt:GmRuntime,amount:number):void;
 /** Downed heroes stay down at the end of the enemy turn (scr_mnendturn heals them by an eighth otherwise). */
 preventsTurnRevive?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** The sprite a downed hero shows in this battle (Chapter 3 hero Step), or undefined. */
 defeatSprite?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime):string|undefined;
 /** Where the soul flies back to after the enemy's turn, when not to Kris (GIGA Queen's boxing ring). */
 soulReturnsTo?(enemy:GmInstance,rt:GmRuntime):[number,number];
 /** The FIGHT bar's hit goes to this object instead of the hero: true when it takes it (GIGA Queen's boxing
  * controller turns Kris's points into a punch). */
 takesFightBar?(obj:GmInstance,bar:GmInstance,rt:GmRuntime):boolean;
 /** Item heals sparkle on this object instead of the hero: true when it shows them (GIGA Queen's boxing controller). */
 showsHeals?(obj:GmInstance,rt:GmRuntime):boolean;
 /** Susie's UltimatHeal was cast (Omawaroid prompts its own heal then). */
 onUltimatHeal?(obj:GmInstance,rt:GmRuntime):void;
 /** What every tea heals while this object is there (GIGA Queen's boxing controller: 100). */
 teaHeals?(obj:GmInstance,rt:GmRuntime):number;
}
export interface HookedDef extends GmObjectDef{readonly hooks?:BattleHooks}
/** The hooks an instance's object (or its nearest parent) declares. */
export function hooksOf(inst:GmInstance):BattleHooks{
 for(let d:HookedDef|undefined=inst.object;d;d=d.parent)if(d.hooks)return d.hooks;
 return {};
}
/** Every live instance in the battle whose object declares the given hook, in creation order. */
export function withHook<K extends keyof BattleHooks>(rt:GmRuntime,key:K):[GmInstance,NonNullable<BattleHooks[K]>][]{
 const out:[GmInstance,NonNullable<BattleHooks[K]>][]=[];
 for(const i of rt.instances)if(i.live){const h=hooksOf(i)[key];if(h!==undefined)out.push([i,h as NonNullable<BattleHooks[K]>]);}
 return out;
}
