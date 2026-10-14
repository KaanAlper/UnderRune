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
}
const CHAPTER1:ChapterRules={chapter:1,soulHasModes:false,slowSoulSetting:false,heroesCanBePoisoned:false,moveHeartEndsInvincibility:false,autoSusieMarksKill:true,enemiesTargetWholeParty:false,tensionBarFollowsView:false,tensionBarSurface:false};
const CHAPTER2:ChapterRules={chapter:2,soulHasModes:true,slowSoulSetting:true,heroesCanBePoisoned:true,moveHeartEndsInvincibility:true,autoSusieMarksKill:false,enemiesTargetWholeParty:true,tensionBarFollowsView:true,tensionBarSurface:true};
/** A component's part for the running battle's chapter, from the table of its versions next to it. */
export function forChapter<T>(rt:GmRuntime,versions:Readonly<Record<number,T>>,what:string):T{
 const v=versions[rt.globals.chapter??1];
 if(v===undefined)throw Error(`${what} has no Chapter ${rt.globals.chapter} version`);
 return v;
}
/** The running battle's chapter rules (global.chapter). */
export function rules(rt:GmRuntime):ChapterRules{
 const r=({1:CHAPTER1,2:CHAPTER2} as Record<number,ChapterRules>)[rt.globals.chapter??1];
 if(!r)throw Error(`No battle rules for chapter ${rt.globals.chapter}`);
 return r;
}

export interface BattleHooks{
 /** A FIGHT hit lands on the battle (damage above 0), before the target flinches. NEO: the electrified pose. */
 onHeroHit?(enemy:GmInstance,rt:GmRuntime):void;
 /** False when HP at zero after a FIGHT hit or a damaging spell does not defeat the enemy there: it ends the battle
  * in its own code (NEO; also Queen and Berdly). */
 readonly defeatedByDamage?:boolean;
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
 /** True while the tension bar is hidden (GIGA Queen's boxing). */
 hidesTensionBar?(enemy:GmInstance,rt:GmRuntime):boolean;
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
