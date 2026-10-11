import fs from 'node:fs';
import {expect,test} from 'vitest';
import {parseGml,executeGml} from '../src/source-runtime/gml';
const source=(name:string)=>fs.readFileSync(`extracted/chapter1_windows/code/gml_GlobalScript_${name}.gml`,'utf8');
test('original selection scripts create the attack phase only after all three commands',()=>{
 const program=parseGml(['scr_nexthero','scr_endturn','scr_attackphase'].map(source).join('\n')+'\nscr_nexthero();');
 const global={charturn:0,charmove:[1,1,1],acting:[0,0,0],tension:0,temptension:[0,0,0],item:Array(12).fill(0),char:[1,2,3],charauto:[0,0,0,0],charaction:[1,1,1],myfight:0,attacking:0};
 const controller={tempitem:Array.from({length:12},()=>[0,0,0]),xx:0,yy:0};
 const created:unknown[]=[];
 const environment={global,obj_writer:[],obj_face:[],obj_smallface:[],obj_battlecontroller:controller,obj_attackpress:21,obj_spellphase:22};
 const options={calls:{scr_charcan:()=>true,scr_monsterpop:()=>1,instance_create:(_self:any,x:number,y:number,object:number)=>{const instance={x,y,object};created.push(instance);return instance;}}};
 executeGml(program,controller,environment,options);expect(global.charturn).toBe(1);expect(created).toEqual([]);
 executeGml(program,controller,environment,options);expect(global.charturn).toBe(2);expect(created).toEqual([]);
 executeGml(program,controller,environment,options);expect(global.charturn).toBe(3);expect(created).toEqual([{x:2,y:365,object:21}]);expect(global.myfight).toBe(1);
});
test.each([[0,150],[1,120],[2,110],[3,94],[14,72],[15,0],[-5,0]])('original attack timing offset %i yields %i points', (offset,points)=>{
 const program=parseGml(source('scr_boltcheck_onebutton')+'\nscr_boltcheck_onebutton();');
 const self={x:0,y:0,pressbuffer:[0,0,0],bolttotal:1,boltalive:[1],boltframe:[20+offset],boltx:20,boltchar:[0],points:[0,0,0],boltspeed:8,boltcolor:[1,2,3],charcolor:[1,2,3]};
 const bursts:Record<string,any>[]=[];
 executeGml(program,self,{obj_burstbolt:1,c_yellow:65535},{calls:{abs:(_self:any,value:number)=>Math.abs(value),instance_create:(_self:any,x:number,y:number)=>{const instance={x,y};bursts.push(instance);return instance;}}});
 expect(self.points[0]).toBe(points);expect(self.boltalive[0]).toBe(points?0:1);expect(bursts).toHaveLength(points?1:0);
});
