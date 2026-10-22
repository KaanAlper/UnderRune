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
import {createQueenObjects} from '../bosses/queen';
import {createQueenProjectiles} from '../bosses/queen/projectiles';
import {createQueenExplosions} from '../bosses/queen/explosion';
import {createQueenBerdly} from '../bosses/queen/berdly';
import {createQueenWine} from '../bosses/queen/wine';
import {createQueenSearch} from '../bosses/queen/search';
import {createQueenSocial} from '../bosses/queen/social';
import {createQueenElectric} from '../bosses/queen/electric';
import {createQueenThrow} from '../bosses/queen/throw';
import {createQueenUltimate} from '../bosses/queen/ultimate';
import {createChapter2Rivals,runBerdlyBulletController} from '../bosses/chapter2-rivals';
import {runBerdlySpearblastController} from '../bosses/chapter2-rivals/spearblast';
import {berdlySnowgraveScene} from '../bosses/chapter2-rivals/berdly-snowgrave';
import {RIVAL_ENCOUNTERS,setupRivalMonster} from '../bosses/chapter2-rivals/setup';
import {rivalRoutePhase} from '../bosses/chapter2-rivals/berdly-rematch';
import {anyFaceNext,monsterAdd,speaker,terminateWriter} from '../deltarune/chapter2-enemy';
import {QUEEN_ENCOUNTERS,setupQueenMonster} from '../bosses/queen/setup';
import {SPAMTON_ENCOUNTERS,createSpamton,setupSpamtonMonster} from '../bosses/spamton';
import {createRouxls} from '../bosses/rouxls';
import {createGigaQueen,runGigaSoulBulletController} from '../bosses/giga-queen';

/** scr_encountersetup for the ported encounters: enemies (object, type, x, y), the opening line and optional hero
 * positions. */
type EncounterSetup={monsters:readonly (readonly [string,number,number,number])[];intro:string;kind:string;heroes?:readonly (readonly [number,number])[]};
const ENCOUNTERS:Record<number,EncounterSetup>={...FIELD_ENCOUNTERS,59:QUEEN_ENCOUNTERS[59],84:QUEEN_ENCOUNTERS[84],58:{...RIVAL_ENCOUNTERS[58],kind:'story'},82:{...RIVAL_ENCOUNTERS[82],kind:'story'},62:{...RIVAL_ENCOUNTERS[62],kind:'story'},63:{...RIVAL_ENCOUNTERS[63],kind:'story'},60:{...SPAMTON_ENCOUNTERS[60],kind:'story'}};
export function installChapter2BossHost(rt:GmRuntime,options:{room:string}){
 const registry=createChapter2Registry(rt,{metadata,room:options.room}),{object}=registry;
 registry.register([battleBalloon2,growtangle2,battleCleanup,animator,recruitAnim,createSmallFace(object),iceHexagon,iceSpell,sleepMist]);
 // Existing source primitives are shared by Werewire and NEO; boss-specific siblings stay absent.
 registry.register(createNeoSupport(object).filter(d=>['obj_doom','obj_lerpvar','obj_afterimage_cut'].includes(d.name)));
 registry.register(createNeoFace(object).filter(d=>['obj_werewire_bullet_lasercircle','obj_werewire_bullet_lasersquare'].includes(d.name)));
 registry.register(createChapter2Field(object));
 registry.register([createPowerUpOrb(object)]);
 // Spamton (60): his enemy and attack objects; his patterns run in the shared bullet maker.
 const spamton=createSpamton(object);registry.register(spamton.objects);
 // Rouxls (63): his enemy, the Thrash Machine, his mini-game and attack objects.
 const rouxls=createRouxls(object);registry.register(rouxls.objects);
 registry.register(createGigaQueen(object));
 registry.register([createChapter2BulletController(object,[createChapter2FieldBulletRunner(object),(s,r)=>runBerdlyBulletController(s,r,object),(s,r)=>runBerdlySpearblastController(s,r,object),(s,r)=>runGigaSoulBulletController(s,r,object),spamton.pattern,rouxls.pattern])]);
 // The rivals: Berdly on the coaster (58) and in the rematch (82).
 const dialogue={speaker,faceNext:anyFaceNext,terminateWriter:(s:GmInstance,r:GmRuntime)=>!!terminateWriter(s,r)};
 registry.register(createChapter2Rivals(object,{dialogue,monsterAdd,snowgraveScene:(s,r)=>berdlySnowgraveScene(s,r,dialogue,object,()=>{throw Error('scr_losechar (after SnowGrave) is not ported');})}));
 // Queen (59): her enemy, shield, bullet controller and attack objects.
 registry.register([...createQueenObjects(object),...createQueenProjectiles(object),...createQueenExplosions(object),...createQueenBerdly(object),...createQueenWine(object),...createQueenSearch(object),...createQueenSocial(object),...createQueenElectric(object),...createQueenThrow(object),...createQueenUltimate(object)]);
 // obj_heartmarker has no events: a place the soul is moved to.
 registry.register([{...object('obj_heartmarker'),events:{}}]);
 // obj_animation plays its sprite once.
 registry.register([{...object('obj_animation'),events:{animationEnd:(s,r)=>r.destroy(s)}}]);
 const plug=object('obj_berdlyplug_enemy');
 rt.battleSetup={monster:(s,r)=>setupFieldMonster(s,r)||setupQueenMonster(s,r,r.exists(plug))||setupRivalMonster(s,r,rivalRoutePhase(r))||setupSpamtonMonster(s,r),encounter:(r,n,enemies)=>{
  const setup=ENCOUNTERS[n];if(!setup||setup.kind==='unused')return false;
  const g=r.globals;g.monstertype=[0,0,0];g.monsterinstancetype=[0,0,0];
  for(const [i,[name,type,x,y]] of setup.monsters.entries()){
   const def=enemies[name];if(!def)throw Error(`Encounter ${n} needs ${name}`);g.monsterinstancetype[i]=def;g.monstertype[i]=type;g.monstermakex[i]=r.view.x+x;g.monstermakey[i]=r.view.y+y;
  }
  if(n===82){g.monstermakex[1]=r.view.x+540;g.monstermakey[1]=r.view.y+84;g.monstermakex[2]=r.view.x+522;g.monstermakey[2]=r.view.y+214;}
  if(setup.heroes)for(const [i,[x,y]] of setup.heroes.entries()){g.heromakex[i]=r.view.x+x;g.heromakey[i]=r.view.y+y;}
  g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_'+setup.intro);return true;
 }};
 registry.finalize();installSmallFaceWriter(rt,object);
 return {objects:registry.objects,enter:(_enemy:GmInstance)=>{}};
}
