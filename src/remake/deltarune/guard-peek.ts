// scr_guardpeek and obj_battle_marker (Chapter 2 on): a defending Ralsei or Susie peeks out while an enemy talks.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {isPhase} from './chapter2-battle';
import {forChapter} from './rules';

/** Where Susie's peeking marker goes from her position: Chapter 3 moves it 8 right and 4 down. */
const SUSIE_PEEK:Readonly<Record<number,readonly [number,number]>>={2:[0,0],3:[8,4]};

/** scr_battle_marker leaves thismarker on the caller. */
export function battleMarker(s:GmInstance,rt:GmRuntime,marker:GmObjectDef,x:number,y:number,sprite:string){
 const m=rt.create(marker,x,y);s.thismarker=m.id;m.sprite=sprite;m.imageSpeed=1;m.imageXscale=2;m.imageYscale=2;return m;
}

export function createBattleMarker(object:(name:string)=>GmObjectDef):GmObjectDef{
 const marker:GmObjectDef={...object('obj_battle_marker'),events:{
  create:s=>Object.assign(s,{endanimation:0,sourceobject:0,destroyoncomplete:0,autocancel:1,loop:false}),
  step:(s,rt)=>{if(!s.destroyoncomplete&&!isPhase(rt,'enemytalk',s))rt.destroy(s);},
  destroy:(s,rt)=>{
   if(!s.destroyoncomplete&&s.endanimation){
    const m=battleMarker(s,rt,marker,s.x,s.y,s.endanimation);s.newMarker=m.id;m.destroyoncomplete=1;m.sourceobject=s.sourceobject;m.depth=s.depth;m.imageSpeed=.5;
   }else if(s.sourceobject){const source=rt.byId(s.sourceobject);if(!source)throw Error(`Battle marker source ${s.sourceobject} no longer exists`);source.imageAlpha=1;}
  },
  animationEnd:(s,rt)=>{if(s.destroyoncomplete)rt.destroy(s);else if(!s.loop)s.imageSpeed=0;},
 }};
 return marker;
}

/** scr_guardpeek has no caller writes; the marker helper is called on the script's original caller. */
export function guardPeek(s:GmInstance,rt:GmRuntime,hero:GmInstance,marker:GmObjectDef,ralsei:GmObjectDef,susie:GmObjectDef){
 if(rt.globals.faceaction[hero.myself]!==4)return undefined;
 let m:GmInstance|undefined;
 if(rt.first(ralsei)?.id===hero.id){
  hero.imageAlpha=0;m=battleMarker(s,rt,marker,hero.x,hero.y,'spr_ralsei_defend_peek');m.depth=hero.depth;m.sourceobject=hero.id;m.endanimation='spr_ralsei_redefend';
 }else if(rt.first(susie)?.id===hero.id){
  const [dx,dy]=forChapter(rt,SUSIE_PEEK,'scr_guardpeek');
  hero.imageAlpha=0;m=battleMarker(s,rt,marker,hero.x+dx,hero.y+dy,'spr_susie_defend_peek');m.depth=hero.depth;m.sourceobject=hero.id;
 }
 return m??0;
}
