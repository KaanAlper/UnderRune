import {GmRuntime} from '../gm/runtime';
import type {SpriteBank} from '../gm/sprites';
import {validateLoadout,type EquipmentSource,type Loadout} from '../../game/loadout';
import * as b from '../deltarune/battle';
import {bulletController} from '../bosses/jevil/controller';
import {jokerBody} from '../bosses/jevil/body';

// Practice selections follow obj_joker Other_15; this host is not the full battle AI or command menu.
export const JEVIL_PATTERNS=[
 {name:'Spade rings',type:70,mult:5,graze:2,body:2},
 {name:'Diamond rain',type:65,mult:5,graze:3,body:0},
 {name:'Heart bombs',type:49,mult:4,graze:3,body:2,all:true},
 {name:'Scythe sweep',type:75,mult:6,graze:3,body:5},
 {name:'Carousel weave',type:62,mult:5,graze:2,body:0,inv:20},
 {name:'Club bombs',type:50,mult:4,graze:3,body:2,all:true,time:300},
 {name:'Double diamonds',type:73,mult:5,graze:1,body:0},
 {name:'Orbiting scythes',type:68,mult:5,graze:2,body:0},
 {name:'Carousel lanes',type:61,mult:5,graze:3,body:0,inv:20},
 {name:'Spade bombs',type:48,mult:4,graze:4,body:2,all:true,time:270},
 {name:'Crossing spade rings',type:72,mult:5,graze:1,body:0},
 {name:'Double scythe sweep',type:76,mult:6,graze:3,body:5},
 {name:'Spiraling spade rings',type:71,mult:5,graze:2,body:2},
 {name:'Mixed suit bombs',type:46,mult:4,graze:4,body:2,all:true,time:330},
 {name:'Triple diamonds',type:74,mult:4,graze:1,body:0},
 {name:'Final Chaos',type:77,mult:4,graze:1,body:5,time:1500},
] as const;

export function createJevilPractice(bank:SpriteBank,source:EquipmentSource,loadout:Loadout,pattern=0,seed=11){
 validateLoadout(loadout,source);
 const selected=JEVIL_PATTERNS[pattern];if(!selected)throw Error('Choose a practice pattern.');
 const rt=new GmRuntime(bank,{seed});
 const df=[1,2,3].map(id=>{
  const slot=loadout.characters[id];
  return 2+source.weapons.find(g=>g.id===slot.weapon)!.defense+slot.armor.reduce((sum,id)=>sum+source.armors.find(g=>g.id===id)!.defense,0);
 });
 rt.globals={hp:[0,90,110,70],maxhp:[0,90,110,70],char:[1,2,3],battledf:df,
  charaction:[1,1,1],charcantarget:[1,1,1],chardead:[0,0,0],charmove:[0,0,0],charspecial:[0,0,0],targeted:[0,0,0],
  tension:0,maxtension:100,inv:-1,invc:1,flag:new Array(1000).fill(0),monster:[1,0,0],mnfight:2,
  turntimer:'time' in selected?selected.time:240,chemg_god_mode:false};
 const heroes=[b.heroKris,b.heroSusie,b.heroRalsei].map((o,i)=>{
  const h=rt.create(o,80+i*10,[100,150,210][i]);h.sprite=['spr_krisb_idle','spr_susieb_idle','spr_ralseib_idle'][i];
  h.imageXscale=2;h.imageYscale=2;h.depth=200-i*20;h.myheight=rt.spriteHeight(h);return h;
 });
 rt.globals.charinstance=heroes.map(h=>h.id);rt.create(b.eventManager,0,0);
 const control=rt.create(b.battleController,0,0);Object.assign(control,{timeron:1,reset:0,noreturn:0,onebuffer:0,twobuffer:0,lbuffer:0,rbuffer:0,grazenoise:0,damagenoise:0});control.visible=false;
 const body=rt.create(jokerBody,500,160);body.depth=15;body.condition=selected.body;
 const box=rt.create(b.growtangle,320,170);Object.assign(box,{timer:15,growcon:2,imageXscale:2,imageYscale:2,imageAlpha:1,depth:5});
 const soul=rt.create(b.heart,310,160);soul.depth=1;
 const dc=rt.create(bulletController,500,160);Object.assign(dc,{joker:1,type:selected.type,target:'all' in selected?3:0,damage:10*selected.mult,grazepoints:selected.graze,inv:'inv' in selected?selected.inv:60});
 return {rt,pattern,paused:false,outcome:null as 'survived'|'defeat'|null,
  step(){if(this.paused||this.outcome)return;rt.step();if(rt.pendingRoom==='room_gameover')this.outcome='defeat';else if(control.reset===1)this.outcome='survived';},
 };
}
export type JevilPractice=ReturnType<typeof createJevilPractice>;
