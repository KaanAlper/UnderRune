import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {monsterPop} from './controller';
export type Chapter2BulletRunner=(self:GmInstance,rt:GmRuntime)=>boolean;
/** The source controller's shared prelude; pattern ownership is delegated to independent encounter factories. */
export function createChapter2BulletController(object:(name:string)=>GmObjectDef,patterns:readonly Chapter2BulletRunner[]):GmObjectDef{
 return {name:'obj_dbulletcontroller',index:394,parent:object('obj_bulletgenparent'),sprite:'spr_grazemask',visible:false,events:{
  create:(s,rt)=>{
   Object.assign(s,{type:1,btimer:99,timermax:12,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,grazed:-1,grazetimer:-1,element:'none',target:-1,ratio:1});
   const population=monsterPop(rt);if(population===2)s.ratio=1.6;if(population===3)s.ratio=2.3;
   Object.assign(s,{side:1,difficulty:0,made:0,special:0,roundcount:0,init:0,sameattack:0,sameattacker:0,miny:999,maxy:999,maxx:999,creator:0});
  },
  step:(s,rt)=>{
   if(s.init===0){
    const names=rt.globals.monsterattackname;s.__sameattack=0;for(s._sameattacki=0;s._sameattacki<3;s._sameattacki++)if(names[s._sameattacki]===names[s.creator]&&rt.globals.monster[s._sameattacki]===1)s.__sameattack++;s.sameattack=s.__sameattack;
    if(s.sameattack>1){if(s.creator===2)s.sameattacker=s.sameattack-1;else if(s.creator===1)s.sameattacker=s.sameattack===3?s.creator:names[0]===names[1];}
    const box=rt.first(object('obj_growtangle'));if(box){s.miny=box.y-rt.spriteHeight(box)/2;s.maxy=box.y+rt.spriteHeight(box)/2;s.minx=box.x-rt.spriteWidth(box)/2;s.maxx=box.x+rt.spriteWidth(box)/2;}s.init=1;
   }
   s.btimer+=1;for(const run of patterns)if(run(s,rt))return;throw Error(`Chapter 2 bullet pattern ${s.type} is not registered`);
  },
 }};
}
