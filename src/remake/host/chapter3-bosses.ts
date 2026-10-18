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
import {fadeOut} from '../deltarune/fades';
import {KNIGHT_ENCOUNTER,setupKnightMonster} from '../bosses/roaring-knight/setup';
import {createKnight} from '../bosses/roaring-knight/knight';
import {createStars} from '../bosses/roaring-knight/stars';
import {createTrackingSwords} from '../bosses/roaring-knight/tracking-swords';
import {createFlurry} from '../bosses/roaring-knight/flurry';
import {createSwordTunnel} from '../bosses/roaring-knight/sword-tunnel';
import {createRotatingSlash} from '../bosses/roaring-knight/rotating-slash';
import {createSwordVortex} from '../bosses/roaring-knight/sword-vortex';
import {createSlashEffects} from '../bosses/roaring-knight/slash-effects';
import {createRoar} from '../bosses/roaring-knight/roar';
import {createBlockVfx,createFadeToWhite,createFountain} from '../bosses/roaring-knight/fountain';
import {createBattleMarker} from '../deltarune/guard-peek';
import {sourceText} from './text';
import {findController} from '../deltarune/controller';

export function installChapter3BossHost(rt:GmRuntime,options:{room:string}){
 const registry=createChapterRegistry(rt,{chapter:3,metadata,room:options.room}),{object}=registry;
 registry.register([battleBalloon2,growtangle2,battleCleanup,animator,recruitAnim,createSmallFace(object)]);
 registry.register([doom,lerpvar,afterimageCut,fadeOut]);
 const slashEffects=createSlashEffects(object);
 const attacks=[createStars(object),createTrackingSwords(object),createFlurry(object),createSwordTunnel(object),createRotatingSlash(object,slashEffects),createSwordVortex(object),createRoar(object,slashEffects),{pattern:()=>false,objects:slashEffects.objects}];
 registry.register([createChapter2BulletController(object,attacks.map(a=>a.pattern)),createBattleMarker(object),...attacks.flatMap(a=>a.objects)]);
 const fountain=createFountain(object),blockVfx=createBlockVfx(object),fadeToWhite=createFadeToWhite(object);
 registry.register([fountain,blockVfx,fadeToWhite,createKnight(object,fountain,blockVfx,fadeToWhite)]);
 rt.battleSetup={monster:setupKnightMonster,encounter:(r,n,enemies)=>{
  if(n!==KNIGHT_ENCOUNTER.n)return false;
  const g=r.globals,{name,type,x,y}=KNIGHT_ENCOUNTER.monster,def=enemies[name];
  if(!def)throw Error(`Encounter ${n} needs ${name}`);
  for(const [i,[hx,hy]] of KNIGHT_ENCOUNTER.heroes.entries()){g.heromakex[i]=r.view.x+hx;g.heromakey[i]=r.view.y+hy;}
  g.monsterinstancetype=[def,0,0];g.monstertype=[type,0,0];g.monstermakex[0]=r.view.x+x;g.monstermakey[0]=r.view.y+y;
  g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_'+KNIGHT_ENCOUNTER.intro);
  // The fountain scene (obj_ch3_PTB02) marks the Knight's battle for the failure screen.
  g.tempflag[93]=1;return true;
 }};
 registry.finalize();installSmallFaceWriter(rt,object);
 return {objects:registry.objects,enter:(_enemy:GmInstance)=>{
  // Knight Create runs inside the shared controller's Create, before heroes exist and before its final
  // cantspare reset. Apply these scene-dependent writes once the fresh controller and party are ready.
  const controller=findController(rt);if(controller)controller.cantspare[0]=1;
  for(const h of rt.all(object('obj_herosusie'))){
   Object.assign(h,{normalsprite:'spr_susier_dark_unhappy',idlesprite:'spr_susieb_idle_serious',defendsprite:'spr_susieb_defend_unhappy',actreadysprite:'spr_susieb_actready',
    attacksprite:'spr_susieb_attack_serious',itemsprite:'spr_susieb_item_unhappy',itemreadysprite:'spr_susieb_itemready_unhappy',spellreadysprite:'spr_susieb_spellready_unhappy',
    spellsprite:'spr_susieb_spell_unhappy',defeatsprite:'spr_susie_dw_fell'});
   if(rt.globals.charweapon[2]===0)h.idlesprite='spr_susieb_idle_unarmed_unhappy';
  }
 }};
}
