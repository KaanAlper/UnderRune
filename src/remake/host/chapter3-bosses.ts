/** Chapter 3 battles: the chapter's object table, the shared engine, and each boss's own objects. Anything of the
 * chapter not ported yet is a named error when created. */
import type {GmInstance,GmRuntime} from '../gm/runtime';
import metadata from './chapter3-resources.json';
import {createChapterRegistry} from './chapter2';
import {createChapter2BulletController} from '../deltarune/chapter2-bullets';
import {battleBalloon2,growtangle2,battleCleanup} from '../deltarune/chapter2-objects';
import {animator,recruitAnim} from '../deltarune/chapter2-enemy';
import {createSmallFace,installSmallFaceWriter} from '../deltarune/small-face';
import {afterimageCut,doom,lerpvar} from '../deltarune/shared-effects';
import {KNIGHT_ENCOUNTER,setupKnightMonster} from '../bosses/roaring-knight/setup';
import {createKnight} from '../bosses/roaring-knight/knight';
import {createStars} from '../bosses/roaring-knight/stars';
import {createTrackingSwords} from '../bosses/roaring-knight/tracking-swords';
import {createFlurry} from '../bosses/roaring-knight/flurry';
import {createSwordTunnel} from '../bosses/roaring-knight/sword-tunnel';
import {createBlockVfx,createFadeToWhite,createFountain} from '../bosses/roaring-knight/fountain';
import {createBattleMarker} from '../deltarune/guard-peek';
import {sourceText} from './text';

export function installChapter3BossHost(rt:GmRuntime,options:{room:string}){
 const registry=createChapterRegistry(rt,{chapter:3,metadata,room:options.room}),{object}=registry;
 registry.register([battleBalloon2,growtangle2,battleCleanup,animator,recruitAnim,createSmallFace(object)]);
 registry.register([doom,lerpvar,afterimageCut]);
 const attacks=[createStars(object),createTrackingSwords(object),createFlurry(object),createSwordTunnel(object)];
 registry.register([createChapter2BulletController(object,attacks.map(a=>a.pattern)),createBattleMarker(object),...attacks.flatMap(a=>a.objects)]);
 const fountain=createFountain(object),blockVfx=createBlockVfx(object),fadeToWhite=createFadeToWhite(object);
 registry.register([fountain,blockVfx,fadeToWhite,createKnight(object,fountain,blockVfx,fadeToWhite)]);
 rt.battleSetup={monster:setupKnightMonster,encounter:(r,n,enemies)=>{
  if(n!==KNIGHT_ENCOUNTER.n)return false;
  const g=r.globals,{name,type,x,y}=KNIGHT_ENCOUNTER.monster,def=enemies[name];
  if(!def)throw Error(`Encounter ${n} needs ${name}`);
  for(const [i,[hx,hy]] of KNIGHT_ENCOUNTER.heroes.entries()){g.heromakex[i]=r.view.x+hx;g.heromakey[i]=r.view.y+hy;}
  g.monsterinstancetype=[def,0,0];g.monstertype=[type,0,0];g.monstermakex[0]=r.view.x+x;g.monstermakey[0]=r.view.y+y;
  g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_'+KNIGHT_ENCOUNTER.intro);return true;
 }};
 registry.finalize();installSmallFaceWriter(rt,object);
 return {objects:registry.objects,enter:(_enemy:GmInstance)=>{}};
}
