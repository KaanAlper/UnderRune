import fs from 'node:fs';
import {describe,it,expect} from 'vitest';
import {GmRuntime,resolveEvent,type GmInstance,type GmObjectDef,type GmEvent} from '../src/remake/gm/runtime';
import {loadSprites} from './parity/reference';
import {executeNeoSource} from '../src/remake/bosses/spamton-neo/body-source';
import {bulletInit} from '../src/remake/deltarune/battle';
import {createHammerAttackFamilies,type HammerAttackHost} from '../src/remake/bosses/hammer-of-justice/attack-families';
import resources from '../src/remake/host/chapter4-resources.json';
const dir='extracted/chapter4_windows/code/';const ready=fs.existsSync(dir+'gml_Object_obj_follow_spear_Create_0.gml');
const eventParts:Record<string,string>={create:'Create_0',step:'Step_0',endStep:'Step_2',draw:'Draw_0',cleanup:'CleanUp_0',alarm0:'Alarm_0',user0:'Other_10'};
function fixture(name:string,source:boolean){
 const rt=new GmRuntime(loadSprites(4),{seed:17});const calls:any[]=[],packets:any[]=[];
 const defs=new Map(resources.map(d=>[d.name,{...d,parent:undefined,sprite:d.sprite??undefined,mask:d.mask??undefined} as GmObjectDef]));for(const d of resources)if(d.parent)defs.get(d.name)!.parent=defs.get(d.parent);
 const object=(n:string)=>{const d=defs.get(n);if(!d)throw Error(n);return d;};
 const host:HammerAttackHost={call(s,n,...args){calls.push([n,s.id,...args.map(a=>a&&typeof a==='object'&&'index' in a?a.name:a)]);if(n.startsWith('snd_'))return 100;if(n==='scr_oflash'){const flash=rt.create(object('obj_oflash'),s.x,s.y);flash.flashspeed=1;s._oflash=flash.id;return flash.id;}if(n==='scr_afterimage'){const a=rt.create(object('obj_afterimage'),s.x,s.y);s.afterimage=a.id;return a.id;}if(n==='v_ex')return args[0] in s;if(n==='surface_exists')return false;if(n==='scr_get_box')return 320;if(n==='scr_at_player')return 45;if(['scr_script_delayed','scr_darksize','scr_lerpvar','scr_damage','scr_damage_all','scr_shakeobj','scr_shakescreen','scr_sonic_boom','scr_heartcolor','scr_battle_sprite_set','scr_battle_sprite_reset','scr_draw_in_box_end'].includes(n))return;throw Error('Missing test boundary '+n);},inherited(s,r,e){const parent=s.object.parent;if(parent)resolveEvent(parent,e as GmEvent)?.(s,r);}};
 object('obj_collidebullet').events={create:bulletInit};
 const port=createHammerAttackFamilies(object,host).objects.find(d=>d.name===name)!;object(name).events=port.events;
 if(source){object(name).events=Object.fromEntries(Object.entries(eventParts).filter(([,p])=>fs.existsSync(dir+`gml_Object_${name}_${p}.gml`)).map(([e,p])=>[e,(s:GmInstance,r:GmRuntime)=>{let src=fs.readFileSync(dir+`gml_Object_${name}_${p}.gml`,'utf8');src=src.replace(/\bmotor_\w+/g,m=>JSON.stringify(m));return executeNeoSource(src,s,r,{object,text:k=>k,scripts:{scr_bullet_init:fs.readFileSync(dir+'gml_GlobalScript_scr_bullet_init.gml','utf8')},call:(n,self,_r,args)=>host.call(self,n,...args)},undefined,e as GmEvent);} ]));}
 rt.gfx={sprite:(...a:any[])=>packets.push(['sprite',...a]),spriteFog:(...a:any[])=>packets.push(['fog',...a]),rect:()=>{},circle:()=>{},text:()=>{}};
 rt.globals={chapter:4,hp:[0,180,230],turntimer:500,inv:0,monsterat:[14]};
 rt.create(object('obj_darkener'),0,0);rt.create(object('obj_tensionbar'),0,0);rt.create(object('obj_herosusie'),110,150);rt.create(object('obj_heart'),310,160);const box=rt.create(object('obj_growtangle'),320,170);box.idealx=320;box.idealy=170;
 const owner=rt.create(object('obj_hammer_of_justice_enemy'),460,161);Object.assign(owner,{myself:0,mytarget:1,imageAlpha:1,trueturn:0,attackpattern:0,reachedendphase:0});
 const actor=rt.create(object(name),460,161);return {rt,object,actor,calls,packets};
}
function state(r:ReturnType<typeof fixture>){return {globals:r.rt.globals,rng:r.rt.random.snapshot(),calls:r.calls,packets:r.packets,instances:r.rt.instances.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['frameCount','layerEntry'].includes(k)).map(([k,v])=>[k,k==='object'?v.name:typeof v==='boolean'?Number(v):v])))};}
describe.skipIf(!ready)('Hammer source attack family events at required script boundaries',()=>{
 for(const name of ['obj_follow_spear','obj_gerson_green_switch','obj_gerson_green_chevron','obj_gerson_teleport','obj_gerson_teleport_generic','obj_gerson_gradient_telegraph','obj_gerson_progress_star','obj_gerson_box_hit','obj_gerson_box_hit_controller','obj_gerson_squishes_box','obj_gerson_bell_bullet','obj_gerson_bell_bullet_radial','obj_gerson_hammer_bro_hammer','obj_gerson_darkness_overlay_light','obj_gerson_growtangle_hit_fx','obj_box_hit_bullet','obj_gerson_swing_down_new','obj_gerson_swing_down_mask','obj_gerson_swing_down','obj_giant_hammer','obj_gerson_speen','obj_gerson_darken','obj_gerson_bell','obj_gerson_bell_hit','obj_gerson_bell_attack_controller','obj_gerson_hammer_bro_attack_controller','obj_gerson_growtangle','obj_gerson_growtangle_transform','obj_gerson_growtangle_telegraph_new','obj_gerson_fakeheart','obj_gerson_shell_kick_controller','obj_hammer_bounce_controller','obj_box_throw_controller'])it(name+' Create matches decoded source',()=>{expect(state(fixture(name,false))).toEqual(state(fixture(name,true)));});
 for(const name of ['obj_follow_spear','obj_gerson_green_switch','obj_gerson_green_chevron','obj_gerson_teleport_generic','obj_gerson_progress_star'])it(name+' preserves movement and Draw timers',()=>{const a=fixture(name,false),b=fixture(name,true);for(let i=0;i<70;i++){for(const r of [a,b]){r.rt.step();r.rt.draw();}expect(state(a)).toEqual(state(b));a.packets.length=0;b.packets.length=0;}});
});
