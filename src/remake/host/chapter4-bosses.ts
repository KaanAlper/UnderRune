/** Chapter 4 source registry. Only accepted encounter entries can launch through the public host. */
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
import {hammerServices} from '../bosses/hammer-of-justice/services';
import {hammerHooks} from '../bosses/hammer-of-justice/hooks';
import {createHammerAttackFamilies} from '../bosses/hammer-of-justice/attack-families';
import {createHammerSineStream} from '../bosses/hammer-of-justice/sine-stream';
import {createScreenAfterimage} from '../deltarune/screen-afterimage';
import {approach} from '../deltarune/chapter3-scripts';
import {battleBalloon2,growtangle2,battleCleanup} from '../deltarune/chapter2-objects';
import {animator,recruitAnim} from '../deltarune/chapter2-enemy';
import {createSmallFace,installSmallFaceWriter} from '../deltarune/small-face';
import {doom,lerpvar,afterimageCut} from '../deltarune/shared-effects';
import {scriptDelayed} from '../deltarune/chapter2-battle';
import {fadeOut} from '../deltarune/fades';
import type {HookedDef} from '../deltarune/rules';

export function installChapter4BossHost(rt:GmRuntime,options:{room:string;hammer?:{scene:HammerSceneScripts;draw:HammerDrawScripts;projectile:HammerProjectileScripts}}){
 const registry=createChapterRegistry(rt,{chapter:4,metadata,room:options.room}),{object}=registry;
 const native=hammerServices(rt,object,(name,s,args)=>registry.host.call(name,s,rt,args)),services=options.hammer??native;
 const baseEnemy=createHammerEnemy(object,services) as HookedDef,enemy:HookedDef={...baseEnemy,hooks:{...baseEnemy.hooks,...hammerHooks(object,native.attack)}};
 registry.register([battleBalloon2,growtangle2,battleCleanup,animator,recruitAnim,createSmallFace(object),doom,lerpvar,afterimageCut,scriptDelayed,fadeOut]);
 registry.register([...createHammerAttackFamilies(object,native.attack).objects,enemy,...createHammerShield(object),createHammerProjectile(object,services.projectile)]);
 // obj_oflash_gerson_buster: the white flash on Susie when the reflected Rude Buster hits (it follows her hurt frame).
 registry.register([{...object('obj_oflash_gerson_buster'),events:{
  create:s=>{Object.assign(s,{flashspeed:1,siner:0,target:43843843,imageSpeed:0,flashcolor:0xffffff,angle:0});},
  draw:(s,rt)=>{
   const t=rt.byId(s.target);
   if(t)s.x=t.x-20+t.hurtindex*10;
   s.siner+=s.flashspeed;
   if(s.sprite)rt.drawSpriteFog(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,s.angle,s.flashcolor,Math.sin(s.siner/3));
   if(s.siner>4&&Math.sin(s.siner/3)<0)rt.destroy(s);
  },
 }}]);
 // Small source objects the Hammer attacks create: directional box/bell shake, the shell spin copy, long-note sparks.
 registry.register([
  {...object('obj_shakedirectional'),events:{
   create:s=>{Object.assign(s,{timer:0,dir:0,target:-1,fakespeed:0});},
   step:(s,rt)=>{
    s.timer++;const t=rt.byId(s.target);
    if(s.dir===0){if(s.timer===1)s.fakespeed=10;if(t){t.x+=s.fakespeed;if(s.timer===6)t.x=t.xstart;}s.fakespeed-=5;}
    if(s.dir===180){if(s.timer===1)s.fakespeed=-10;if(t){t.x+=s.fakespeed;if(s.timer===6)t.x=t.xstart;}s.fakespeed+=4;}
    if(s.timer===6)rt.destroy(s);
   }}},
  {...object('obj_gerson_animation'),events:{
   create:s=>{Object.assign(s,{timer:0,spinindex:0,imageSpeed:0});},
   draw:(s,rt)=>{
    s.timer++;if(s.timer===2){rt.destroy(s);return;}
    rt.drawSprite('spr_bounce_shell_idle',s.spinindex,s.x,s.y,s.imageXscale,s.imageXscale,s.imageAngle,0xffffff,s.imageAlpha);
    rt.drawSpriteFog('spr_bounce_shell_idle_color',s.spinindex,s.x,s.y,s.imageXscale,s.imageXscale,s.imageAngle,0x00ffff,s.imageAlpha);
   }}},
  {...object('obj_arrow_long_particle'),events:{
   create:(s,rt)=>{s.imageXscale=1.5;s.imageYscale=1.5;s.direction=-45+rt.random.irandom(90);s.speed=3;s.imageSpeed=0;},
   step:(s,rt)=>{s.imageXscale-=0.2;s.imageYscale-=0.2;s.speed-=0.3;if(s.speed<0)rt.destroy(s);}}},
 ]);
 registry.register([...createHammerSineStream(object),{...object('obj_animation'),events:{animationEnd:(s,r)=>r.destroy(s)}}]);
 registry.register([createScreenAfterimage(object),{...object('obj_particle_generic'),events:{
  create:s=>{Object.assign(s,{fade_rate:0,shrink_rate:0,acceleration_type:0,acceleration_rate:0,acceleration_goal:0,imageBlend:0xfd4dcc});},
  step:(s,r)=>{s.imageAlpha=approach(s.imageAlpha,0,s.fade_rate);s.imageXscale=approach(s.imageXscale,0,s.shrink_rate);s.imageYscale=approach(s.imageYscale,0,s.shrink_rate);if(s.acceleration_rate!==0){if(s.acceleration_type===0)s.speed=approach(s.speed,s.acceleration_goal,s.acceleration_rate);if(s.acceleration_type===1)s.speed*=s.acceleration_rate;}if(s.imageXscale===0||s.imageYscale===0||s.imageAlpha===0)r.destroy(s);},
  alarm0:(s,r)=>r.destroy(s),outsideRoom:(s,r)=>r.destroy(s),
 }}]);
 // The browser supplies keyboard input in place of the original persistent world input controller.
 registry.register([{...object('obj_gamecontroller'),events:{create:s=>{s.gamepad_active=0;}}}]);
 rt.battleSetup={monster:setupHammerMonster,encounter:(r,n,enemies)=>{
  if(n!==HAMMER_ENCOUNTER.number)return false;
  const g=r.globals;g.flag[850]=7; // the arena follows the piano puzzle; below 6 scr_spellinfo shows Susie's heal as "Can't use" at 255 TP
  g.monstertype=[0,0,0];g.monsterinstancetype=[0,0,0];
  for(const [i,[name,type,x,y]] of HAMMER_ENCOUNTER.monsters.entries()){const def=enemies[name];if(!def)throw Error(`Encounter ${n} needs ${name}`);g.monsterinstancetype[i]=def;g.monstertype[i]=type;g.monstermakex[i]=r.view.x+x;g.monstermakey[i]=r.view.y+y;}
  for(const [i,[x,y]] of hammerHeroPositions(options.room).entries()){g.heromakex[i]=x;g.heromakey[i]=y;}
  g.battlemsg[0]=sourceText('scr_encountersetup_slash_scr_encountersetup_gml_'+HAMMER_ENCOUNTER.intro);return true;
 }};
 registry.finalize();rt.globals.is_console=0;rt.create(object('obj_gamecontroller'),0,0);installSmallFaceWriter(rt,object);return {objects:registry.objects,enter:()=>{}};
}
