import {expect,it} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {createPreciseMovement,movePrecise} from '../src/remake/bosses/giga-queen/motion';
it('applies the immediate source movement, then seven delayed end-step offsets',()=>{
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11}),defs:Record<string,GmObjectDef>={};
 const object=(name:string)=>defs[name]??(defs[name]={name,index:Object.keys(defs).length});
 const def=createPreciseMovement(object);defs[def.name]=def;
 const player=rt.restore(object('o_boxingcontroller'),100001,100,200,{wireframe_boxing:0});player.imageSpeed=0;
 const helper=movePrecise(player,rt,object,0,-1,0);expect([player.x,player.y,player.imageIndex,helper.movecount]).toEqual([112,200,0,1]);
 const xs:number[]=[];for(let f=0;f<9;f++){rt.step();xs.push(player.x);}
 expect(xs.slice(0,8)).toEqual([112,118,120,116,110,100,100,100]);expect(player.imageIndex).toBe(3);expect(helper.live).toBe(false);expect(player._moveprecise).toBe(helper.id);
});
