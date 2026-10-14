// Where the shared battle engine differs by chapter or by enemy. Every difference is one named point here, chosen in
// one place, so the shared objects never test the chapter number or name a boss.
//
// - ChapterRules: what changed in the engine itself between chapters (one strategy object per chapter).
// - EnemyHooks: what the original engine does for one specific enemy (the original code names that enemy at that
//   point, as in "with (obj_spamton_neo_enemy)"). Each enemy declares its own hooks on its definition, and the shared
//   code runs them at the same point as the original, for every enemy in the battle that has the hook.
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
 /** An enemy's random target is the whole party (mytarget 4, every hero that can be hit marked). */
 readonly enemiesTargetWholeParty:boolean;
 /** The tension bar keeps itself 40 pixels below the top of the view, so it moves with screen shakes. */
 readonly tensionBarFollowsView:boolean;
 /** The tension bar is drawn through a surface (its cutout rounds the fill), with the TP logo and percentage last. */
 readonly tensionBarSurface:boolean;
}
const CHAPTER1:ChapterRules={chapter:1,heroesCanBePoisoned:false,moveHeartEndsInvincibility:false,autoSusieMarksKill:true,enemiesTargetWholeParty:false,tensionBarFollowsView:false,tensionBarSurface:false};
const CHAPTER2:ChapterRules={chapter:2,heroesCanBePoisoned:true,moveHeartEndsInvincibility:true,autoSusieMarksKill:false,enemiesTargetWholeParty:true,tensionBarFollowsView:true,tensionBarSurface:true};
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

export interface EnemyHooks{
 /** A FIGHT hit lands on the battle (damage above 0), before the target flinches. NEO: the electrified pose. */
 onHeroHit?(enemy:GmInstance,rt:GmRuntime):void;
 /** False when HP at zero after a FIGHT hit or a damaging spell does not defeat the enemy there: it ends the battle
  * in its own code (NEO; also Queen and Berdly). */
 readonly defeatedByDamage?:boolean;
 /** The enemy turn is over (obj_battlecontroller Alarm 2): true when the enemy takes over instead of the next turn
  * (NEO at full mercy starts his ending). */
 onTurnEnd?(enemy:GmInstance,rt:GmRuntime):boolean;
 /** True while the tension bar is hidden (GIGA Queen's boxing). */
 hidesTensionBar?(enemy:GmInstance,rt:GmRuntime):boolean;
}
export interface EnemyDef extends GmObjectDef{readonly hooks?:EnemyHooks}
/** The hooks an instance's object (or its nearest parent) declares. */
export function hooksOf(inst:GmInstance):EnemyHooks{
 for(let d:EnemyDef|undefined=inst.object;d;d=d.parent)if(d.hooks)return d.hooks;
 return {};
}
/** Every live instance in the battle whose object declares the given hook, in creation order. */
export function withHook<K extends keyof EnemyHooks>(rt:GmRuntime,key:K):[GmInstance,NonNullable<EnemyHooks[K]>][]{
 const out:[GmInstance,NonNullable<EnemyHooks[K]>][]=[];
 for(const i of rt.instances)if(i.live){const h=hooksOf(i)[key];if(h!==undefined)out.push([i,h as NonNullable<EnemyHooks[K]>]);}
 return out;
}
