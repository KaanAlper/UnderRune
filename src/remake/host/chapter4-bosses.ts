/** Chapter 4 development registry. Public readiness stays closed until the complete battle passes acceptance. */
import type {GmRuntime} from '../gm/runtime';
import {createChapterRegistry} from './chapter2';
import metadata from './chapter4-resources.json';
import {HAMMER_ENCOUNTER,hammerHeroPositions,setupHammerMonster} from '../bosses/hammer-of-justice/setup';
import {createHammerEnemy} from '../bosses/hammer-of-justice/enemy';
import {createHammerShield} from '../bosses/hammer-of-justice/shield';
import {sourceText} from './text';
import {createHammerProjectile} from '../bosses/hammer-of-justice/projectile';
import type {HammerSceneScripts} from '../bosses/hammer-of-justice/scene-context';
import type {HammerDrawScripts} from '../bosses/hammer-of-justice/draw-context';
import type {HammerProjectileScripts} from '../bosses/hammer-of-justice/projectile-context';

export function installChapter4BossHost(rt:GmRuntime,options:{room:string;hammer?:{scene:HammerSceneScripts;draw:HammerDrawScripts;projectile:HammerProjectileScripts}}){
 const registry=createChapterRegistry(rt,{chapter:4,metadata,room:options.room}),{object}=registry;
 registry.register([createHammerEnemy(object,options.hammer),...createHammerShield(object),...(options.hammer?[createHammerProjectile(object,options.hammer.projectile)]:[])]);
 rt.battleSetup={monster:setupHammerMonster,encounter:(r,n,enemies)=>{
  if(n!==HAMMER_ENCOUNTER.number)return false;
  const g=r.globals;g.monstertype=[0,0,0];g.monsterinstancetype=[0,0,0];
  for(const [i,[name,type,x,y]] of HAMMER_ENCOUNTER.monsters.entries()){const def=enemies[name];if(!def)throw Error(`Encounter ${n} needs ${name}`);g.monsterinstancetype[i]=def;g.monstertype[i]=type;g.monstermakex[i]=r.view.x+x;g.monstermakey[i]=r.view.y+y;}
  for(const [i,[x,y]] of hammerHeroPositions(options.room).entries()){g.heromakex[i]=x;g.heromakey[i]=y;}
  g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_'+HAMMER_ENCOUNTER.intro);return true;
 }};
 registry.finalize();return {objects:registry.objects,enter:()=>{}};
}
