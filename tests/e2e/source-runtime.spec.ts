import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test.beforeEach(async({page})=>{
 await page.route('**/source-runtime-probe',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><html><head><meta charset="utf-8"><title>Source runtime probe</title></head><body></body></html>'}));
});
test('official runtime preserves native instance direction, speed and friction',async({page})=>{
 await page.goto('/source-runtime-probe');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addScriptTag({url:'/generated/official-runtime/runner.js'});
 const result=await page.evaluate(()=>{
  const gm=window as any;
  gm.g_pSpriteManager=new gm.yySpriteManager();
  const instance=new gm.yyInstance(100,100,100001,0,false,true);
  gm.move_towards_point(instance,210,210,4.5);
  instance.direction=instance.direction-36;
  const before={direction:instance.direction,speed:instance.speed,x:instance.x,y:instance.y,hspeed:instance.hspeed,vspeed:instance.vspeed};
  instance.friction=.5;instance.AdaptSpeed();
  return {before,afterSpeed:instance.speed,direction:gm.point_direction(0,0,0,-1)};
 });
 expect(errors).toEqual([]);expect(result.before.direction).toBeCloseTo(279);expect(result.before.speed).toBe(4.5);expect(result.afterSpeed).toBe(4);expect(result.direction).toBe(90);
});
test('decoded Jevil event and inheritance script execute with native browser motion',async({page})=>{
 const remote:string[]=[],errors:string[]=[];
 page.on('request',request=>{if(!['127.0.0.1','localhost'].includes(new URL(request.url()).hostname))remote.push(request.url());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/source-runtime-probe');await page.addScriptTag({url:'/generated/official-runtime/runner.js'});
 const source=fs.readFileSync('extracted/chapter1_windows/code/gml_GlobalScript_scr_bullet_inherit.gml','utf8')+'\n'+fs.readFileSync('extracted/chapter1_windows/code/gml_Object_obj_joker_teleport_Step_0.gml','utf8');
 const result=await page.evaluate(async(source)=>{
  // Load the implementation through Vite without substituting browser behavior.
  const modulePath='/src/source-runtime/gml.ts';const {parseGml,executeGml}=await import(/* @vite-ignore */ modulePath);
  const semanticsPath='/src/source-runtime/native-semantics.ts';const {nativeSemantics}=await import(/* @vite-ignore */ semanticsPath);
  const gm=window as any;gm.g_pSpriteManager=new gm.yySpriteManager();
  const self={x:100,y:100,con:0,sndcon:0,image_xscale:0,image_yscale:2,timer:0,type:1,damage:7,grazepoints:3,timepoints:2,inv:6,target:1};
  const created:any[]=[],sounds:number[]=[];
  const program=parseGml(source),environment={snd_swing:1,snd_joker_oh:2,obj_collidebullet:3,spr_spadebullet:4,spr_diamondbullet:5,obj_heart:{x:200,y:200}};
  // Instance allocation and sound observation are test harness hooks; decisions,
  // inheritance and motion execute the decoded source and official movement code.
  const calls={instance_create:(_self:any,x:number,y:number)=>{const bullet=new gm.yyInstance(x,y,100001+created.length,0,false,true);created.push(bullet);return bullet;},instance_exists:(_self:any,instance:any)=>created.includes(instance),snd_play:(_self:any,sound:number)=>sounds.push(sound),snd_stop:(_self:any,sound:number)=>sounds.push(-sound),move_towards_point:gm.move_towards_point};
  const semantics=nativeSemantics(gm);
  for(let frame=0;frame<13;frame++)executeGml(program,self,environment,{calls,...semantics});
  return {bullets:created.map(b=>({direction:b.direction,speed:b.speed,damage:b.damage,grazed:b.grazed,grazepoints:b.grazepoints,inv:b.inv})),sounds};
 },source);
 expect(result.bullets).toHaveLength(5);
 expect(result.bullets.map(b=>b.direction)).toEqual([279,297,315,333,351]);
 expect(result.bullets.every(b=>b.speed===4.5&&b.damage===7&&b.grazed===0&&b.grazepoints===3&&b.inv===6)).toBe(true);
 expect(result.sounds).toEqual([-1,1,2]);expect(errors).toEqual([]);expect(remote).toEqual([]);
});
