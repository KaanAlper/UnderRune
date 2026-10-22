import {describe,it,expect} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {setSourceText} from '../src/remake/host/text';
import {GmRandom} from '../src/remake/gm/random';
import {createGigaLoss} from '../src/remake/bosses/giga-queen/loss';
function fixture(){
 setSourceText({'obj_boxing_loss_controller_slash_Draw_0_gml_116_0':'fixture loss','scr_encountersetup_slash_scr_encountersetup_gml_1104_0':'fixture encounter'});
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11});const defs:Record<string,GmObjectDef>={};let index=7000;const object=(n:string)=>defs[n]??(defs[n]={name:n,index:index++});
 for(const d of createGigaLoss(object))defs[d.name]=d;
 rt.globals={chapter:2,chemg_sprite_map:{spr_acrade_retire:'spr_acrade_retire'},hp:[0,1],maxhp:[0,245],tension:60,item:Array(13).fill(0),battlemsg:[''],batmusic:[0],flag:Array(700).fill(0)};
 const c=rt.restore(object('o_boxingcontroller'),90001,100,500,{headsprite:'spr_bhero_head_c',health_count:0,health_count_max:245,dead:1,damage_multiplier:1.5,punchcon:0,flameactive:1,invincible:1,beat_phase2_no_damage_taken:1});
 const e=rt.restore(object('obj_gigaqueen_enemy'),90002,0,0,{items:Array.from({length:13},(_,i)=>i+1),kris_save_hp:123});
 const b=rt.restore(object('obj_battlecontroller'),90003,0,0,{tempitem:Array.from({length:13},()=>[0,0,0])});
 const h=rt.restore(object('o_boxinghud'),90004,0,0,{sub_healthbar_count:0});
 let resets=0;object('o_boxingqueen').events={user1:s=>{resets++;s.x=320;s.y=300;}};const q=rt.restore(object('o_boxingqueen'),90005,320,300,{health_count:0,original_depth:9});
 const manager=rt.create(object('obj_event_manager'),0,0);let resolved=0;manager.resolve_trophies=()=>resolved++;
 const loss=rt.create(object('obj_boxing_loss_controller'),0,0),draw=()=>loss.object.events!.draw!(loss,rt);
 return {rt,object,c,e,b,h,q,loss,draw,resets:()=>resets,resolved:()=>resolved};
}
describe('GIGA native loss sequence',()=>{
 it('advances the loss timer in Draw, with the source same-event alpha increment',()=>{const t=fixture();for(let n=0;n<100;n++)t.draw();expect([t.loss.timer,t.loss.state,t.loss.imageAlpha]).toEqual([100,0,0]);t.draw();expect([t.loss.timer,t.loss.state]).toEqual([101,1]);expect(t.loss.imageAlpha).toBeCloseTo(.02);});
 it.each([90,88,67,13,16,17])('confirms with key %i after the fade and consumes arrows after confirm',key=>{const t=fixture();t.loss.state=1;t.loss.imageAlpha=2.3;t.rt.input.pressed=new Set([key,39]);t.draw();expect([t.loss.state,t.loss.con]).toEqual([2,1]);expect(t.rt.first(t.object('o_bq_whitefade'))!.depth).toBe(-150);});
 it('ignores arrows and confirm until the loss prompt is ready; left wins simultaneous arrows',()=>{const t=fixture();t.loss.state=1;t.loss.imageAlpha=2;t.rt.input.pressed=new Set([90,39]);t.draw();expect([t.loss.state,t.loss.con]).toEqual([1,0]);t.loss.imageAlpha=2.3;t.rt.input.pressed=new Set([37,39]);t.draw();expect(t.loss.con).toBe(0);});
 it('retries in place, restoring inventory and recruit HP while preserving the source 200 displayed HP',()=>{const t=fixture();const left=t.rt.create(t.object('obj_closing_block_left'),0,0),rot=t.rt.create(t.object('obj_rotating_sprite'),0,0);t.loss.state=2;t.loss.imageAlpha=2.61;t.draw();expect(t.rt.globals.hp[1]).toBe(245);expect(t.c.health_count).toBe(200);expect(t.c.health_count_max).toBe(245);expect(t.rt.globals.item).toEqual(t.e.items);expect(t.b.tempitem[12]).toEqual([13,13,13]);expect([t.loss.j,t.loss.i,t.rt.globals.boxingphase,t.c.boxingtimer,t.h.sub_healthbar_count,t.q.health_count,t.resets(),t.resolved()]).toEqual([3,13,3,270,2,1500,1,1]);expect([t.c.flameactive,t.c.invincible,t.c.damage_multiplier,t.c.beat_phase2_no_damage_taken]).toEqual([0,1,1.5,1]);expect([t.loss.live,left.live,rot.live]).toEqual([false,false,false]);});
 it('passes retire through the native DEVICE_FAILURE EVENT8 boundary',()=>{const t=fixture();t.loss.state=2;t.loss.con=1;t.loss.imageAlpha=2.61;t.draw();const d=t.rt.first(t.object('DEVICE_FAILURE'))!;expect(d.EVENT).toBe(8);expect(t.loss.gameend).toBe(d.id);expect(t.resolved()).toBe(1);expect(t.c.dead).toBe(1);});
 it('closes symmetrically and emits the left impact dust in source RNG argument order only once',()=>{const t=fixture(),left=t.rt.create(t.object('obj_closing_block_left'),319,0),right=t.rt.create(t.object('obj_closing_block_right'),321,0);left.grav=2;right.grav=-2;const rng=GmRandom.restore(t.rt.random.snapshot());const y=rng.irandom(240),x=320+rng.randomRange(-4,14);left.object.events!.step!(left,t.rt);right.object.events!.step!(right,t.rt);expect([left.x,right.x,left.state,right.state]).toEqual([320,320,1,1]);const dust=t.rt.all(t.object('obj_boxing_closing_block_dust'));expect(dust).toHaveLength(48);expect([dust[0].x,dust[0].y]).toEqual([Math.fround(x),y]);left.object.events!.step!(left,t.rt);expect(t.rt.all(t.object('obj_boxing_closing_block_dust'))).toHaveLength(48);});
});


describe('GIGA loss rendering state',()=>{
 it('advances closer images in Draw rather than Step and uses mirrored spark transforms',()=>{
  const t=fixture(),sprites:any[][]=[];t.rt.gfx={sprite:(...args:any[])=>{sprites.push(args);},text:()=>{},rect:()=>{},circle:()=>{}};
  const left=t.rt.create(t.object('obj_closing_block_left'),10,0),right=t.rt.create(t.object('obj_closing_block_right'),630,0);
  left.object.events!.step!(left,t.rt);expect(left.imageIndex).toBe(0);left.object.events!.draw!(left,t.rt);right.object.events!.draw!(right,t.rt);
  expect([left.imageIndex,right.imageIndex]).toEqual([1,1]);expect(sprites.filter(s=>s[0]==='spr_sparks').map(s=>s.slice(2,7))).toEqual([[0,0,1,-1,270],[0,480,1,1,90],[640,0,1,1,270],[640,480,1,-1,90]]);
 });
 it('draws both bench layers with the source alpha and resets the shared draw state',()=>{
  const t=fixture(),sprites:any[][]=[];t.rt.gfx={sprite:(...args:any[])=>{sprites.push(args);},text:()=>{},rect:()=>{},circle:()=>{}};t.loss.state=1;t.loss.imageAlpha=2.3;t.draw();
  const bench=sprites.filter(s=>s[0]==='spr_bhero_bench');expect(bench).toHaveLength(2);expect(bench[0][8]).toBeCloseTo(2.3);expect(bench[1][8]).toBeCloseTo(1.3);expect(t.rt.drawState.halign).toBe(0);expect(t.rt.drawState.alpha).toBe(1);
 });
});
