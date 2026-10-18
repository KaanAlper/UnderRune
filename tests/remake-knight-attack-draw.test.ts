import {describe,it,expect,vi} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {growtangle,heart} from '../src/remake/deltarune/battle';
import {createSlashEffects} from '../src/remake/bosses/roaring-knight/slash-effects';
import {createRotatingSlash} from '../src/remake/bosses/roaring-knight/rotating-slash';
import {createRoar} from '../src/remake/bosses/roaring-knight/roar';

function fixture(){
 const rt=new GmRuntime({get:()=>undefined,collisionCompat:true,roomSpeed:30});
 const definitions=new Map<string,GmObjectDef>();
 const object=(name:string)=>{let def=definitions.get(name);if(!def){def={name,index:10000+definitions.size};definitions.set(name,def);}return def;};
 const effects=createSlashEffects(object),family=createRotatingSlash(object,effects);
 rt.sourceSurfaces={create:()=>1,target:()=>{},clear:()=>{},capture:()=>'',free:()=>{},deleteSprite:()=>{},draw:()=>{},copy:()=>{},part:()=>{},exists:()=>true,resize:()=>{}};
 rt.restore(growtangle,90000,320,170);
 const rotating=rt.create(family.objects[0],460,90);
 const triangle=vi.spyOn(rt,'drawTriangleColor'),line=vi.spyOn(rt,'drawLine');
 return {rt,object,effects,rotating,triangle,line};
}

// Native RValue_toBool treats negative numbers as false. These source Draw conditions
// use -1 as a disabled sentinel or a direction, so JavaScript truthiness changes the picture.
describe('Knight source Draw numeric conditions',()=>{
 for(const [line2,line3,count] of [[-1,-1,0],[0,0,0],[1,-1,2],[1,2,4]]){
  it(`draws ${count} auxiliary guides for line2=${line2}, line3=${line3}`,()=>{
   const f=fixture();Object.assign(f.rotating,{state:'aim',timer:1,aim_x:320,aim_y:170,line2,line3});
   f.rotating.object.events!.draw!(f.rotating,f.rt);
   // gml_Object_obj_knight_rotating_slash_Draw_0: two draw_line calls per true line.
   expect(f.line).toHaveBeenCalledTimes(count);
  });
 }
 for(const slashdir of [-1,1]){
  it(`orients the standalone slash triangle for slashdir=${slashdir}`,()=>{
   const f=fixture(),slash=f.rt.create(f.effects.slash,320,170);
   Object.assign(slash,{slashdir,imageAlpha:0.5,direction:0});
   slash.object.events!.draw!(slash,f.rt);
   // Source ELSE starts at x + hx*alpha; THEN starts at x - hx*alpha.
   expect(f.triangle.mock.calls[0].slice(0,6)).toEqual(slashdir>0
    ?[0,170,960,146,960,194]:[640,170,-320,146,-320,194]);
  });
  it(`orients the surface slash triangle for slashdir=${slashdir}`,()=>{
   const f=fixture(),slash=f.rt.create(f.effects.slash,320,170);
   Object.assign(slash,{slashdir,imageAlpha:0.5,direction:0});
   f.rotating.object.events!.draw!(f.rotating,f.rt);
   // The rotating manager draws the same source triangle relative to box left/top + 5.
   expect(f.triangle.mock.calls[0].slice(0,6)).toEqual(slashdir>0
    ?[-325,-5,635,-29,635,19]:[315,-5,-645,-29,-645,19]);
  });
 }
 it('composes suction particles into the roar star surface using screen coordinates',()=>{
  const f=fixture(),roar=createRoar(f.object,f.effects);
  f.rt.restore(heart,90001,280,160);f.rt.restore(f.object('obj_knight_enemy'),90002,460,90);
  vi.spyOn(f.rt.bank,'get').mockReturnValue({name:'spr_roaringknight_front',width:70,height:1,originX:0,originY:0,bboxMode:1,left:0,right:69,top:0,bottom:0,sepMasks:0,frames:1,special:false,playbackSpeed:1,playbackType:0});
  const scene=f.rt.create(roar.objects[1],460,90);
  Object.assign(scene,{ball_surface:101,star_surface:102,my_surface:103,terrible_surface:104});
  Object.assign(f.rt.view,{x:100,y:200});
  const p=f.rt.create(f.effects.particle,350,270);
  Object.assign(p,{sprite:'spr_pixel_white_front',imageIndex:2,imageXscale:16,imageYscale:0.5,imageAngle:30,imageBlend:0x123456,imageAlpha:0.75});
  let target:number|null=null;f.rt.sourceSurfaces!.target=id=>{target=id;};
  const calls:{target:number|null;args:unknown[]}[]=[];
  vi.spyOn(f.rt,'drawSprite').mockImplementation((...args)=>{calls.push({target,args});});
  const rng=f.rt.random.snapshot();
  scene.object.events!.draw!(scene,f.rt);
  // gml_Object_obj_knight_roaring2_Draw_0 explicitly composites generic particles
  // before its star loops. Ordinary world drawing would be covered by the pit surface.
  expect(calls.filter(c=>c.args[0]==='spr_pixel_white_front')).toEqual([{target:102,args:['spr_pixel_white_front',2,250,70,16,0.5,30,0x123456,0.75]}]);
  expect(f.rt.random.snapshot()).toEqual(rng);
  expect([p.x,p.y,p.imageAlpha,p.timer]).toEqual([350,270,0.75,-1]);
 });
});
