import {expect,it} from 'vitest';
import {GmRuntime,type GmObjectDef} from '../src/remake/gm/runtime';
import {spriteBank} from '../src/remake/gm/sprites';
import {gigaMenuHooks} from '../src/remake/bosses/giga-queen/menu';
function fixture(){
 const rt=new GmRuntime(spriteBank({atLeast2022_1:false,optionsInfo:0,sprites:[]}),{seed:11}),defs:Record<string,GmObjectDef>={};
 const object=(name:string)=>defs[name]??(defs[name]={name,index:Object.keys(defs).length});
 const enemy=rt.restore(object('obj_gigaqueen_enemy'),100001,0,0,{}),player=rt.restore(object('o_boxingcontroller'),100002,320,390,{dead:0,headsprite:'spr_bhero_head_a'}),panel=rt.restore(object('obj_battlecontroller'),100003,0,0,{gigaqueencon:1,gigaqueentimer:0,gigaqueeny:0});
 rt.globals.turntimer=-1;rt.globals.battleat=[12];return {rt,enemy,player,panel,object,h:gigaMenuHooks(object)};
}
it('slides the menu in Draw and suspends Step until all ten draw frames finish',()=>{
 const {rt,enemy,panel,h}=fixture();expect(h.blocksControllerStep!(enemy,panel,rt)).toBe(true);
 for(let f=1;f<=10;f++)expect(h.controllerHudOffset!(enemy,panel,rt)).toBe(f*10);
 expect([panel.gigaqueencon,panel.gigaqueentimer]).toEqual([0,10]);expect(h.blocksControllerStep!(enemy,panel,rt)).toBe(false);
});
it('starts with the native hidden panel while the ring introduction runs',()=>{
 const {rt,enemy,panel,h}=fixture();h.onControllerCreate!(enemy,panel,rt);expect(panel.gigaqueencon).toBe(3);expect(h.controllerHudOffset!(enemy,panel,rt)).toBe(200);expect(h.hidesTensionBar!(enemy,rt)).toBe(true);
});
it('routes FIGHT points into the machine punch with source perfect/miss overrides',()=>{
 const {rt,enemy,player,object,h}=fixture(),bar=rt.restore(object('obj_attackpress'),100004,0,0,{points:[300]});
 expect(h.takesFightBar!(enemy,bar,rt)).toBe(true);expect([player.punchcon,player.damageoverride,player.tpoverride,player.acttoenemytalktransition]).toEqual([1,360,5,1]);
 bar.points[0]=0;h.takesFightBar!(enemy,bar,rt);expect(player.damageoverride).toBe(1);
});
it('applies DEFEND/item specials and displays zero HP on boxing knockout',()=>{
 const {rt,enemy,player,panel,h}=fixture();h.onCommandChosen!(enemy,panel,rt,'defend');expect([player.defend,player.specialcon]).toEqual([1,8]);
 h.onCommandChosen!(enemy,panel,rt,'item');expect(player.specialcon).toBe(7);player.dead=1;panel.gigaqueencon=0;
 expect(h.partyHudHp!(enemy,rt,0,1)).toBe(0);expect(h.blocksControllerStep!(enemy,panel,rt)).toBe(true);
});
it('returns the soul to the machine torso after the soul attack',()=>{
 const {rt,enemy,player,h}=fixture();player.x=250;player.y=355;
 expect(h.soulReturnsTo?.(enemy,rt)).toEqual([250,245]);
});
