import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {growtangle,moveHeart,moveHeartIn} from '../../deltarune/battle';
import {blconSkip,isPhase} from '../../deltarune/chapter2-battle';
export const TRIO_NAMES=['obj_sweet_enemy','obj_kk_enemy','obj_hatguy_enemy'] as const;
/** A low-HP bandmate suspends the usual dodge turn for the original milk scene. */
export function trioEndTalk(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 if(s.talked!==1||!isPhase(rt,'enemytalk',s))return;s.rtimer=0;blconSkip(s,rt,15);
 if(!isPhase(rt,'bullets',s))return;
 if(TRIO_NAMES.some(name=>{const e=rt.first(object(name));return e&&rt.globals.monsterhp[e.myself]<2;})){
  const controller=rt.first(object('obj_musical_controller'))!;if(controller.scon===0)controller.scon=1;for(const name of TRIO_NAMES)for(const e of rt.all(object(name)))e.heal=1;
 }else{if(!rt.exists(growtangle))rt.create(growtangle,rt.view.x+320,rt.view.y+206);if(!rt.exists(moveHeart))moveHeartIn(rt);}
}
/** One song controller and its five visible performers per turn, shared by all undistracted bandmates. */
export function trioAttack(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const g=rt.globals;s.rr=rt.random.choose(0,1);
 if(s.heal===1){const c=rt.first(object('obj_musical_controller'))!;if(c.scon===0)c.scon=1;}
 else if(!s.dancing){
  g.monsterattackname[s.myself]='musical bullets';const existing=rt.first(object('obj_musicalbullet_controller'));
  if(existing)existing.enemy_count++;
  else{const dc=rt.create(object('obj_musicalbullet_controller'),s.x,s.y);s.dc=dc.id;dc.damage=g.monsterat[s.myself]*5;dc.target=s.mytarget;const box=rt.first(growtangle)!;
   for(const [dx,flip] of [[-115,1],[115,-1]]){const b=rt.create(object('obj_musicenemy_boombox'),box.x+dx,box.y+80);s.boombox=b.id;if(flip===-1)b.imageXscale=-1;b.damage=g.monsterat[s.myself]*5;b.target=s.mytarget;}
   for(const dx of [-60,-20,20]){const d=rt.create(object('obj_musicenemy_dancer'),box.x+dx,box.y-100);s.dancer=d.id;d.damage=g.monsterat[s.myself]*5;d.target=s.mytarget;}
  }
 }g.turntimer=235;
}
