import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {GmInstance,GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {createWeatherEnemies} from '../src/remake/bosses/lanino-elnina/enemies';
import {createWeatherPresentation} from '../src/remake/bosses/lanino-elnina/tenna';
import {writer} from '../src/remake/deltarune/writer';
import {setSourceText} from '../src/remake/host/text';

let oldStrict=false;
beforeEach(()=>{oldStrict=GmInstance.strict;GmInstance.strict=true;});
afterEach(()=>{GmInstance.strict=oldStrict;vi.restoreAllMocks();});
function fixture(){
 const rt=new GmRuntime({get:()=>({name:'test',width:100,height:140,originX:10,originY:20,bboxMode:1,left:0,right:99,top:0,bottom:139,sepMasks:0,frames:10,special:false,playbackSpeed:1,playbackType:0}),collisionCompat:true,roomSpeed:30});
 const objects=new Map<string,GmObjectDef>();
 const object=(name:string)=>{let o=objects.get(name);if(!o){o={name,index:10000+objects.size};objects.set(name,o);}return o;};
 object('obj_elnina_lanino_controller').events={create:s=>Object.assign(s,{sunboost:0,ilovetv_increase:0,ilovetv_increased:false,talked:0})};
 const defs=createWeatherEnemies(object);for(const d of defs)objects.set(d.name,d);
 const g=rt.globals;Object.assign(g,{chapter:3,monster:[1,1,0],myfight:0,mnfight:0,msg:[],targeted:[0,0,0],charcantarget:[1,1,1]});
 const texts:Record<string,string>={};
 for(const who of ['lanino','elnina'])for(const suffix of ['39_0_b','40_0_b','46_0','47_0','78_0','79_0','107_0_b','110_0_b','117_0_b','120_0_b']){const key=`obj_${who}_enemy_slash_Step_0_gml_${suffix}`;texts[key]=key;}
 setSourceText(texts);
 const originalCreate=rt.create.bind(rt);
 vi.spyOn(rt,'create').mockImplementation((def,x,y,id)=>def.name==='obj_writer'?rt.restore(writer,id??rt.nextId++,x,y,{originalcharline:33,reachedend:0}):def.name==='obj_face'?rt.restore(def,id??rt.nextId++,x,y):originalCreate(def,x,y,id));
 const lanino=rt.create(defs[0],300,40);lanino.myself=0;
 const elnina=rt.create(defs[1],420,40);elnina.myself=1;
 const controller=rt.first(object('obj_elnina_lanino_controller'))!;
 const step=(s:GmInstance)=>s.object.events!.step!(s,rt),draw=(s:GmInstance)=>s.object.events!.draw!(s,rt);
 return {rt,defs,object,lanino,elnina,controller,step,draw};
}
describe('normal weather enemies',()=>{
 it('creates the external controller from Elnina, keeps native sprite fields and only follows its talk',()=>{
  const f=fixture();expect(f.rt.all(f.object('obj_elnina_lanino_controller'))).toHaveLength(1);
  expect(f.lanino.head).toBe('spr_enemy_lanino_head_sunglasses');expect(f.elnina.hairtufts).toBe('spr_enemy_elnina_hairtufts');
  f.rt.globals.mnfight=1;f.step(f.lanino);expect(f.lanino.talked).toBe(0);
  f.controller.talked=1;f.step(f.lanino);expect([f.lanino.talked,f.lanino.talktimer,f.lanino.rtimer]).toEqual([1,1,0]);expect(f.lanino.__isphase).toBe(1);
  f.rt.globals.mnfight=2;for(let i=0;i<20;i++)f.step(f.lanino);expect(f.lanino.attacked).toBe(0);expect(f.lanino.turns).toBe(0);
 });
 for(const elnina of [false,true])it(`gates ${elnina?'Elnina':'Lanino'} TV ACT until the controller completes, respecting boost bounds`,()=>{
  const f=fixture(),s=elnina?f.elnina:f.lanino;f.rt.globals.myfight=3;s.acting=2;f.controller.sunboost=elnina?-3:3;
  f.step(s);expect(s.acting).toBe(200);expect(s.actcon).toBe(0);expect(f.controller.sunboost).toBe(elnina?-3:3);expect(f.controller.ilovetv_increase).toBe(1);
  f.rt.first(writer)!.reachedend=1;f.step(s);expect(f.controller.ilovetv_increase).toBe(3);expect(s.actcon).toBe(0);
  f.controller.ilovetv_increased=true;f.controller.ilovetv_increase=0;f.step(s);expect(s.actcon).toBe(0);
 });
 it('ILoveTVX adjusts the weather but does not overwrite the controller increment',()=>{
  const f=fixture();f.rt.globals.myfight=3;f.lanino.acting=3;f.controller.ilovetv_increase=2;
  f.step(f.lanino);expect(f.lanino.acting).toBe(200);expect(f.controller.sunboost).toBe(1);expect(f.controller.ilovetv_increase).toBe(2);
 });
 it('preserves simultaneous order fields and both increase contributions',()=>{
  const f=fixture(),s=f.elnina;f.rt.globals.myfight=3;Object.assign(s,{actingsus:1,actconsus:1,simulordersus:0,actingral:1,actconral:1,simulorderral:1});
  f.step(s);expect([s.actconsus,s.actconral,f.controller.ilovetv_increase]).toEqual([20,0,2]);expect(s.__simulorder).toBe(1);expect(s.__writerended).toBe(0);
 });
 it('keeps Check text keyed, Alarm4 and hurt in Step independent of Draw',()=>{
  const f=fixture();f.rt.globals.myfight=3;f.lanino.acting=1;f.step(f.lanino);expect(f.rt.globals.msg[0]).toBe('obj_lanino_enemy_slash_Step_0_gml_40_0_b');expect(f.lanino.actcon).toBe(1);
  f.lanino.object.events!.alarm4!(f.lanino,f.rt);expect(f.lanino.con).toBe(1);
  f.rt.globals.myfight=0;Object.assign(f.lanino,{state:3,hurttimer:2,hurtshake:1,shakex:6});f.step(f.lanino);expect([f.lanino.hurttimer,f.lanino.shakex]).toEqual([1,-5]);
  const draw=vi.spyOn(f.rt,'drawSprite');f.draw(f.lanino);expect(draw).toHaveBeenCalledWith('spr_lanino_hurt',0,295,40,2,2,0,0xffffff,1);expect(f.lanino.hurttimer).toBe(1);
 });
 it('draws every multipart pose and flash with source ordering and Elnina hurt offset',()=>{
  const f=fixture(),draw=vi.spyOn(f.rt,'drawSprite'),fog=vi.spyOn(f.rt,'drawSpriteFog');
  f.lanino.flash=1;f.draw(f.lanino);expect(draw.mock.calls.map(c=>c[0])).toEqual(['spr_enemy_lanino_leftarm','spr_enemy_lanino_legs','spr_enemy_lanino_chest','spr_enemy_lanino_shoulderflames','spr_enemy_lanino_head_sunglasses','spr_enemy_lanino_lefthand']);expect(fog).toHaveBeenCalledTimes(6);
  for(const s of [f.lanino,f.elnina])for(const pose of [1,2,3]){draw.mockClear();s.pose=pose;f.draw(s);expect(draw.mock.calls.length).toBe(pose===3?7:2);}
  draw.mockClear();Object.assign(f.elnina,{state:3,hurttimer:1,shakex:4});f.draw(f.elnina);expect(draw.mock.calls[0]).toEqual(['spr_elnina_hurt2',0,424,33,2,2,0,0xffffff,1]);
 });
});
describe('weather Tenna actor',()=>{
 it('keeps all initial fields and deforms the actual sprite quad for pointing and sadness',()=>{
  const f=fixture(),tenna=f.rt.create(createWeatherPresentation(f.object)[0],120,240),quad=vi.spyOn(f.rt,'drawSpritePos');
  expect([tenna.specialsprite.length,tenna.i,tenna.palette_sprite]).toEqual([10,10,'spr_tenna_palette']);
  tenna.preset=2;tenna.object.events!.draw!(tenna,f.rt);expect(quad).toHaveBeenCalledOnce();expect(tenna.sprite).toBe('spr_tenna_point_up');expect(tenna.x1).toBeCloseTo(100+Math.abs(Math.sin(1/4)*8));expect(tenna.y1).toBeCloseTo(200-Math.abs(Math.sin(1/4)*8));
  tenna.preset=7;tenna.object.events!.draw!(tenna,f.rt);expect(tenna.sprite).toBe('spr_tenna_sad');expect(tenna.wobblestate).toBe(6);
 });
 it('creates both source bounce interpolators and keeps Step motion fields',()=>{
  const f=fixture(),tenna=f.rt.create(createWeatherPresentation(f.object)[0],120,240);tenna.bounce=1;tenna.preset=2;tenna.imageXscale=-2;
  tenna.object.events!.draw!(tenna,f.rt);expect(tenna.bounce).toBe(3);const lerps=f.rt.instances.filter(i=>i.object.name==='obj_lerpvar');expect(lerps).toHaveLength(2);expect(lerps.map(i=>[i.varname,i.pointa,i.pointb])).toEqual([['image_xscale',-1.5,-2],['image_yscale',2.5,2]]);
  tenna.hspeed=-26;tenna.vspeed=-18;tenna.object.events!.step!(tenna,f.rt);expect([tenna.v_hspeed,tenna.v_vspeed]).toEqual([-26,-18]);expect(tenna.depth).toBe(100000-(240*10+(350-50)*10));
 });
 it('fails explicitly for unrelated unported Tenna modes',()=>{
  const f=fixture(),tenna=f.rt.create(createWeatherPresentation(f.object)[0],0,0);tenna.preset=35;expect(()=>tenna.object.events!.draw!(tenna,f.rt)).toThrow('preset 35 not ported');
 });
});
