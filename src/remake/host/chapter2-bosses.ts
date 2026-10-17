/** Ordinary Chapter 2 battles: explicit source-event factories, independent of NEO's archived scene adapter. */
import type {GmInstance,GmRuntime} from '../gm/runtime';
import metadata from './chapter2-resources.json';
import {createChapter2Registry} from './chapter2';
import {createChapter2Field,createChapter2FieldBulletRunner} from '../bosses/chapter2-field';
import {FIELD_ENCOUNTERS,setupFieldMonster} from '../bosses/chapter2-field/setup';
import {createChapter2BulletController} from '../deltarune/chapter2-bullets';
import {battleBalloon2,growtangle2,battleCleanup} from '../deltarune/chapter2-objects';
import {animator,recruitAnim} from '../deltarune/chapter2-enemy';
import {createSmallFace,installSmallFaceWriter} from '../deltarune/small-face';
import {createNeoSupport} from '../bosses/spamton-neo/support';
import {createNeoFace} from '../bosses/spamton-neo/face';
import {sourceText} from './text';
import {iceHexagon,iceSpell,sleepMist} from '../deltarune/noelle-spells';
import {createPowerUpOrb} from '../bosses/chapter2-field/power-up-orb';

export function installChapter2BossHost(rt:GmRuntime,options:{room:string}){
 const registry=createChapter2Registry(rt,{metadata,room:options.room}),{object}=registry;
 registry.register([battleBalloon2,growtangle2,battleCleanup,animator,recruitAnim,createSmallFace(object),iceHexagon,iceSpell,sleepMist]);
 // Existing source primitives are shared by Werewire and NEO; boss-specific siblings stay absent.
 registry.register(createNeoSupport(object).filter(d=>['obj_doom','obj_lerpvar','obj_afterimage_cut'].includes(d.name)));
 registry.register(createNeoFace(object).filter(d=>['obj_werewire_bullet_lasercircle','obj_werewire_bullet_lasersquare'].includes(d.name)));
 registry.register(createChapter2Field(object));
 registry.register([createPowerUpOrb(object)]);
 registry.register([createChapter2BulletController(object,[createChapter2FieldBulletRunner(object)])]);
 rt.battleSetup={monster:setupFieldMonster,encounter:(r,n,enemies)=>{
  const setup=FIELD_ENCOUNTERS[n as keyof typeof FIELD_ENCOUNTERS];if(!setup||setup.kind==='unused')return false;
  const g=r.globals;g.monstertype=[0,0,0];g.monsterinstancetype=[0,0,0];
  for(const [i,[name,type,x,y]] of setup.monsters.entries()){
   const def=enemies[name];if(!def)throw Error(`Encounter ${n} needs ${name}`);g.monsterinstancetype[i]=def;g.monstertype[i]=type;g.monstermakex[i]=r.view.x+x;g.monstermakey[i]=r.view.y+y;
  }
  g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_'+setup.intro);return true;
 }};
 registry.finalize();installSmallFaceWriter(rt,object);
 return {objects:registry.objects,enter:(_enemy:GmInstance)=>{}};
}
