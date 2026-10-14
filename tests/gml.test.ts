import {expect,test} from 'vitest';
import fs from 'node:fs';
import {parseGml,executeGml} from '../src/source-runtime/gml';
test('GML with changes self while retaining other and event locals',()=>{
 const self={x:2,child:{x:0}},env={};
 executeGml(parseGml('var n = 3; with (child) { x = other.x + n; } x += 1;'),self,env);
 expect(self.x).toBe(3);expect(self.child.x).toBe(5);
});
test('GML loops, compound assignment, postfix updates and short circuit retain state',()=>{
 const self={total:0};executeGml(parseGml('for (var i=0; i<5; i++) { total += i; } if (false && missing()) total=100;'),self,{});expect(self.total).toBe(10);
});
test('unsupported syntax and unknown calls fail explicitly',()=>{
 expect(()=>parseGml('try {}')).toThrow(/Unsupported/);
 expect(()=>executeGml(parseGml('unknown_builtin();'),{},{})).toThrow(/unknown_builtin/);
});

test('repeat evaluates the count once and preserves nested break/continue and budgets',()=>{
 const self={count:0,calls:0};
 executeGml(parseGml('repeat (counted()) { count++; if (count==3) continue; repeat(8) { count++; break; } }'),self,{}, {calls:{counted:s=>{s.calls++;return 3;}}});
 expect(self).toEqual({count:5,calls:1});
 expect(()=>executeGml(parseGml('repeat (1000) {}'),{},{},{budget:50})).toThrow(/budget/);
});

test('native call argument order preserves positions while evaluating right to left',()=>{
 const order:number[]=[];const self={result:''};
 const calls={mark:(_s:any,n:number)=>{order.push(n);return n;},join:(_s:any,...a:number[])=>a.join(',')};
 executeGml(parseGml('result=join(mark(1),mark(2),mark(3));'),self,{}, {calls,argumentOrder:'right-to-left'});
 expect(order).toEqual([3,2,1]);expect(self.result).toBe('1,2,3');
});

test('explicit event other and numeric instance members remain distinct inside with',()=>{
 const self={value:7,child:{value:0},target:42,result:0},collision={damage:3},instances=new Map([[42,{x:10}]]);
 executeGml(parseGml('with(child) { value=other.value; } target.x+=5; result=other.damage;'),self,{}, {other:collision,member:v=>typeof v==='number'?instances.get(v)!:v});
 expect(self.child.value).toBe(7);expect(self.result).toBe(3);expect(instances.get(42)!.x).toBe(15);
});

test('source colour literals retain BGR values and comma-index arrays are real nested arrays',()=>{
 const self={grid:[[0,0]],value:0,hex:0};executeGml(parseGml('grid[0,1]=#00A2E8; value=grid[0,1]; hex=$E8A200;'),self,{});
 expect(self.value).toBe(0xe8a200);expect(self.hex).toBe(self.value);expect(self.grid[0][1]).toBe(self.value);
});

test('switch preserves fallthrough, shared cases, default and nested loop control',()=>{
 const self={value:0};
 executeGml(parseGml('for (var i=0; i<5; i++) { switch(i) { case 0: case 1: value += 2; break; case 2: continue; case 3: value += 10; default: value += 1; } value += 100; }'),self,{});
 expect(self.value).toBe(416);
 const defaults={value:0};executeGml(parseGml('switch(9) { default: value=3; case 1: value+=4; break; case 9: value=8; }'),defaults,{});expect(defaults.value).toBe(8);
});
test('variable declarations accept source item conditional expressions',()=>{
 const self={value:0};executeGml(parseGml('var healamount = (global.chapter == 1) ? 80 : 140; value = healamount;'),self,{global:{chapter:2}});expect(self.value).toBe(140);
});

test('the unmodified source armor script supplies Amber Card stats',()=>{
 const source=fs.readFileSync('extracted/chapter4_windows/code/gml_GlobalScript_scr_armorinfo.gml','utf8');
 const self:Record<string,any>={};
 executeGml(parseGml(source+'\nscr_armorinfo(1);'),self,{global:{chapter:4}},{calls:{stringsetloc:(_self:any,text:string)=>text,stringset:(_self:any,text:string)=>text}});
 expect(self.armornametemp).toBe('Amber Card');expect(self.armordftemp).toBe(1);expect(self.armorattemp).toBe(0);expect(self.armorchar2temp).toBe(1);
});
test('original bullet inheritance script copies source damage and grazing fields',()=>{
 const source=fs.readFileSync('extracted/chapter1_windows/code/gml_GlobalScript_scr_bullet_inherit.gml','utf8');
 const bullet={},self={bullet,damage:7,grazepoints:3,timepoints:2,inv:6,target:1};
 executeGml(parseGml(source+'\nscr_bullet_inherit(bullet);'),self,{},{calls:{instance_exists:(_self:any,instance:any)=>instance===bullet}});
 expect(bullet).toEqual({damage:7,grazepoints:3,timepoints:2,inv:6,target:1,grazed:0,grazetimer:0});
});
test('source execution has a work budget and cannot freeze on infinite loops',()=>{
 expect(()=>executeGml(parseGml('while (true) {}'),{},{},{budget:50})).toThrow(/budget/);
});
test('numeric GML conditions use the native greater-than-half truth threshold',()=>{
 const self={count:0};executeGml(parseGml('if (-1) count+=1; if (0.5) count+=1; if (0.6) count+=1; if (true && 0.2) count+=1;'),self,{});expect(self.count).toBe(1);
});
test('decoded Jevil Create resolves its compiler-generated enum before the declaration',()=>{
 const source=fs.readFileSync('extracted/chapter1_windows/code/gml_Object_obj_joker_teleport_Create_0.gml','utf8');
 const self:Record<string,any>={x:100};executeGml(parseGml(source),self,{spr_joker_teleport_r:9},{calls:{__view_get:(_self:any,field:number)=>field===0?0:field===2?640:undefined}});
 expect(self.damage).toBe(100);expect(self.inv).toBe(60);expect(self.grazepoints).toBe(4);expect(self.sprite_index).toBe(9);expect(self.con).toBe(0);
});
test('unchanged decoded Jevil teleport Step produces its own five-spade spread',()=>{
 const source=fs.readFileSync('extracted/chapter1_windows/code/gml_Object_obj_joker_teleport_Step_0.gml','utf8');
 const program=parseGml(source),created:Record<string,any>[]=[];
 const self:Record<string,any>={x:100,y:100,con:0,sndcon:0,image_xscale:0,image_yscale:2,timer:0,type:1};
 const env={snd_swing:1,snd_joker_oh:2,obj_collidebullet:3,spr_spadebullet:4,spr_diamondbullet:5,obj_heart:{x:200,y:200}};
 const calls={snd_play:()=>0,snd_stop:()=>0,scr_bullet_inherit:()=>0,
  instance_create:(_self:any,x:number,y:number)=>{const b={x,y};created.push(b);return b;},
  move_towards_point:(self:any,x:number,y:number,speed:number)=>{self.speed=speed;self.direction=(Math.atan2(self.y-y,x-self.x)*180/Math.PI+360)%360;}};
 for(let tick=0;tick<12;tick++)executeGml(program,self,env,{calls});expect(created).toHaveLength(0);
 executeGml(program,self,env,{calls});expect(created).toHaveLength(5);
 expect(created.map(b=>b.offset)).toEqual([0,18,36,54,72]);expect(created.every(b=>b.speed===4.5&&b.image_xscale===.4)).toBe(true);
 expect(created.map(b=>b.direction)).toEqual([279,297,315,333,351]);
});
