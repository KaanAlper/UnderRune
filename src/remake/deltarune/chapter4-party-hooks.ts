import type {GmInstance,GmRuntime} from '../gm/runtime';
import './rules';

/** Source boundaries introduced by the Chapter 4 party events. Encounter implementations own the reactions. */
declare module './rules'{
 interface BattleHooks{
  onHeroAttackStart?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime):void;
  onHeroItemAnimation?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime):void;
  modifyFightHeal?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,heal:{target:number;amount:number}):{target:number;amount:number};
  /** True when an encounter intercepts the spell before any ordinary effect. */
  beforeCastSpell?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,spell:number,caster:number):boolean;
  onSpellCast?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,spell:number,caster:number):void;
  /** Runs before the equipment modifier. */
  modifyHealSpell?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,spell:number,amount:number):number;
  afterHealSpell?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,spell:number):void;
  afterSpellText?(enemy:GmInstance,hero:GmInstance,rt:GmRuntime,spell:number,caster:number):void;
  onRudeBusterCreate?(enemy:GmInstance,bolt:GmInstance,rt:GmRuntime):void;
  onRudeBusterFlightStart?(enemy:GmInstance,bolt:GmInstance,rt:GmRuntime):void;
  onRudeBusterStep?(enemy:GmInstance,bolt:GmInstance,rt:GmRuntime):void;
  /** Runs after steering. True suppresses ordinary distance-based impact. */
  onRudeBusterFlight?(enemy:GmInstance,bolt:GmInstance,rt:GmRuntime):boolean;
  onRudeBusterAfterimage?(enemy:GmInstance,bolt:GmInstance,afterimage:GmInstance,rt:GmRuntime):void;
  suppressesRudeBusterFlash?:boolean;
 }
}
