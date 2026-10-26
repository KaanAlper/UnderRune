import {GmRuntime,type GmInstance} from '../gm/runtime';
import type {SpriteBank} from '../gm/sprites';
import {validateLoadout,type EquipmentSource,type Loadout} from '../../game/loadout';
import * as b from '../deltarune/battle';
import {findController} from '../deltarune/controller';
import {destroyWriters,faceParent} from '../deltarune/writer';
import {bulletController} from '../bosses/jevil/controller';
import {jokerBody} from '../bosses/jevil/body';
import {EngineBattle} from './engine';
import type {installNeoHost} from './neo';

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
 return {rt,pattern,id:'ch1-25',name:'JEVIL',patternName:selected.name,usesEngineHud:false,paused:false,outcome:null as 'survived'|'defeat'|null,
  step(){if(this.paused||this.outcome)return;rt.step();if(rt.pendingRoom==='room_gameover')this.outcome='defeat';else if(control.reset===1)this.outcome='survived';},
 };
}
export type JevilPractice=ReturnType<typeof createJevilPractice>;

export interface PracticePattern{
 readonly name:string;
 readonly setup?:(rt:GmRuntime,enemy:GmInstance)=>void;
 readonly beforeStep?:(rt:GmRuntime,enemy:GmInstance)=>void;
 readonly afterStep?:(rt:GmRuntime,enemy:GmInstance)=>void;
}

const byName=(rt:GmRuntime,name:string)=>rt.instances.find(i=>i.live&&i.object.name===name);
const allByName=(rt:GmRuntime,name:string)=>rt.instances.filter(i=>i.live&&i.object.name===name);

const knightPattern=(name:string,phase:number,phaseturn:number):PracticePattern=>({
 name,
 setup:(_rt,e)=>{
  e.damagereduction=0;
  if(phase===4){e.phase=4;e.phase4turn=phaseturn;}
  else{e.phase=phase;e.phaseturn=phaseturn;}
 },
});

export const ROARING_KNIGHT_PATTERNS:readonly PracticePattern[]=[
 knightPattern('Stars I',1,0),
 knightPattern('Tracking swords I',1,1),
 knightPattern('Box splitter I',1,2),
 knightPattern('Sword tunnel I',1,3),
 knightPattern('Rotating slash I',1,4),
 knightPattern('Stars II',2,0),
 knightPattern('Box splitter II',2,1),
 knightPattern('Circling sword tunnel',2,2),
 knightPattern('Sword vortex & homing swords',2,3),
 knightPattern('Rotating slash II',2,4),
 knightPattern('Stars III',3,0),
 knightPattern('Diagonal box splitter',3,1),
 knightPattern('Tracking swords II',3,2),
 knightPattern('Narrow sword tunnel',3,3),
 knightPattern('Rotating slash III (Flurry)',3,4),
 knightPattern('The Roar (Final Attack)',4,2),
];

const sneoPattern=(name:string,rr:number,difficulty:number,faceattackcount?:number):PracticePattern=>({
 name,
 setup:(_rt,e)=>{
  // NEO's port chooses rr in startTalk and does not read its native debug fields.
  // Enter endTalk with the chosen attack so its original box/heart setup still runs.
  e.rr=rr;e.difficulty=difficulty;e.talked=1;e.talkedcon=1;e.balloonend=1;
  if(faceattackcount!==undefined)e.faceattackcount=faceattackcount;
 },
});

export const SPAMTON_NEO_PATTERNS:readonly PracticePattern[]=[
 sneoPattern('Flying heads I',0,1),
 sneoPattern('Chained heart & walls I',6,0),
 sneoPattern('Heart on a chain I',2,0),
 sneoPattern('Phone call I',8,0),
 sneoPattern('Phone hands I',8.5,0),
 sneoPattern('Eyes, nose & mouth I',7,0,0),
 sneoPattern('Heart on a chain II (Big heart)',2,2),
 sneoPattern('Shooty dance & flying heads',0,3),
 sneoPattern('Eyes, nose & mouth II',7,0,1),
 sneoPattern('Phone hands II',8.5,1),
 sneoPattern('Phone hands III',8.5,2),
 sneoPattern('Phone call II',8,1),
 sneoPattern('Chained heart & walls II',6,1),
 sneoPattern('Heart on a chain III',2,1),
 sneoPattern('Phone call III',8,3),
 sneoPattern('Power of NEO (Final Attack)',9,0),
];

const KING_PATTERNS:readonly PracticePattern[]=[
 {name:'Spade rain I',setup:(_rt,e)=>{e.kturn=0;}},
 {name:'Chain wave I',setup:(_rt,e)=>{e.kturn=1;}},
 {name:'Spade columns I',setup:(_rt,e)=>{e.kturn=2;}},
 {name:'Bouncing box I',setup:(_rt,e)=>{e.kturn=3;}},
 {name:'Chain wave II',setup:(_rt,e)=>{e.kturn=4;}},
 {name:'Chain drag I (Maze)',setup:(_rt,e)=>{e.kturn=5;e.chain_dragging=0;}},
 {name:'Spade columns II',setup:(_rt,e)=>{e.kturn=6;}},
 {name:'Bouncing box II',setup:(_rt,e)=>{e.kturn=7;}},
 {name:'Spade rain II',setup:(_rt,e)=>{e.kturn=8;}},
 {name:'Chain wave III',setup:(_rt,e)=>{e.kturn=9;}},
 {name:'Chain drag II',setup:(_rt,e)=>{e.kturn=10;}},
 {name:'Chain drag III (Repeat)',setup:(_rt,e)=>{e.kturn=5;e.chain_dragging=1;}},
];

const LANCER_1_PATTERNS:readonly PracticePattern[]=[
 {name:'Bike charge',setup:(_rt,e)=>{e.attacks=0;}},
 {name:'Bike wheelie & spades',setup:(_rt,e)=>{e.attacks=1;}},
];

const CLOVER_PATTERNS:readonly PracticePattern[]=[
 {name:'Splitting clubs',afterStep:rt=>{for(const dc of allByName(rt,'obj_dbulletcontroller'))if(!('__practiceFixed' in dc)){dc.__practiceFixed=true;dc.type=2;}}},
 {name:'Corner dark clubs (alternating)',afterStep:rt=>{for(const dc of allByName(rt,'obj_dbulletcontroller'))if(!('__practiceFixed' in dc)){dc.__practiceFixed=true;dc.type=4;}}},
];

// Clover's Dojo attack chooses one of these before the controller's first Step. Preserve the native branch's
// complete controller values so practice changes only that selection, including type 33's default ratio.
const CLOVER_DOJO_PATTERNS:readonly PracticePattern[]=[
 ['Splitting clubs',30,.7,2],['Corner dark clubs (alternating)',31,.7,1],['Tail barrage',33,1,2],
].map(([name,type,ratio,timepoints])=>({name:name as string,afterStep:rt=>{
 for(const dc of allByName(rt,'obj_dbulletcontroller'))if(!('__practiceFixed' in dc)){
  dc.__practiceFixed=true;dc.type=type;dc.ratio=ratio;dc.grazepoints=5;dc.timepoints=timepoints;
 }
}}));

const KROUND_PATTERNS:readonly PracticePattern[]=[
 {name:'Giant stomp',setup:(_rt,e)=>{e.attacktype=0;}},
 {name:'Star kick',setup:(_rt,e)=>{e.attacktype=1;}},
 {name:'Ground slam & stars',setup:(_rt,e)=>{e.attacktype=2;}},
 {name:'Ballet spin',setup:(_rt,e)=>{e.attacktype=3;}},
];

const LANCER_2_PATTERNS:readonly PracticePattern[]=[
 {name:'Spade ring I',setup:(_rt,e)=>{e.firstskip=0;e.turns=0;}},
 {name:'Spade ring II',setup:(_rt,e)=>{e.firstskip=0;e.turns=1;}},
 {name:'Spade swarm I',setup:(_rt,e)=>{e.firstskip=0;e.turns=3;}},
 {name:'Spade swarm II',setup:(_rt,e)=>{e.firstskip=0;e.turns=5;}},
 {name:'Hesitant spades',setup:(_rt,e)=>{e.firstskip=0;e.turns=6;}},
 {name:'Reluctant spades',setup:(_rt,e)=>{e.firstskip=0;e.turns=7;}},
];

const SUSIE_LANCER_PATTERNS:readonly PracticePattern[]=[
 {name:'Lancer & Susie bike team-up',setup:rt=>{const s=rt.byId(rt.globals.monsterinstance[0]);if(s){s.sleeping=0;s.attacktype=0;}}},
 {name:'Falling spades',setup:rt=>{const s=rt.byId(rt.globals.monsterinstance[0]);if(s){s.sleeping=0;s.attacktype=1;}}},
 {name:'Thrown axes',setup:rt=>{const s=rt.byId(rt.globals.monsterinstance[0]);if(s){s.sleeping=0;s.attacktype=2;}}},
 {name:'Lancer solo bike charge',setup:rt=>{const s=rt.byId(rt.globals.monsterinstance[0]),l=rt.byId(rt.globals.monsterinstance[1]);if(s){s.sleeping=1;s.sleepcounter=0;}if(l)l.attacks=0;}},
 {name:'Lancer solo bike wheelie',setup:rt=>{const s=rt.byId(rt.globals.monsterinstance[0]),l=rt.byId(rt.globals.monsterinstance[1]);if(s){s.sleeping=1;s.sleepcounter=0;}if(l)l.attacks=1;}},
];

const removeTasques=(rt:GmRuntime)=>{
 rt.globals.monster[0]=0;rt.globals.monster[2]=0;
 for(const t of allByName(rt,'obj_tasque_enemy'))rt.destroy(t);
};

const TASQUE_MANAGER_PATTERNS:readonly PracticePattern[]=[
 {name:'Whip & yarn balls',setup:rt=>{const tm=byName(rt,'obj_tasque_manager_enemy');if(tm)tm.overrideAttack=0;},beforeStep:rt=>{if(rt.globals.mnfight===2)for(const t of allByName(rt,'obj_tasque_enemy'))t.rr=0;}},
 {name:'Whip & meow waves',setup:rt=>{const tm=byName(rt,'obj_tasque_manager_enemy');if(tm)tm.overrideAttack=0;},beforeStep:rt=>{if(rt.globals.mnfight===2)for(const t of allByName(rt,'obj_tasque_enemy'))t.rr=1;}},
 {name:'Solo whip (fast)',setup:rt=>{removeTasques(rt);const tm=byName(rt,'obj_tasque_manager_enemy');if(tm)tm.overrideAttack=0;}},
 {name:'Order quiz I',setup:rt=>{removeTasques(rt);const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=0;}}},
 {name:'Order quiz II',setup:rt=>{removeTasques(rt);const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=1;}}},
 {name:'Order quiz III + Tasques',setup:rt=>{const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=2;}}},
 {name:'Order quiz IV + Tasques',setup:rt=>{const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=3;}}},
];

const TASQUE_MANAGER_DOJO_PATTERNS:readonly PracticePattern[]=[
 {name:'Dojo spelling quiz (3 rounds)'},
 {name:'Solo whip (fast)',setup:rt=>{rt.globals.encounterno=57;const tm=byName(rt,'obj_tasque_manager_enemy');if(tm)tm.overrideAttack=0;}},
 {name:'Order quiz I',setup:rt=>{rt.globals.encounterno=57;const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=0;}}},
 {name:'Order quiz II',setup:rt=>{rt.globals.encounterno=57;const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=1;}}},
 {name:'Order quiz III',setup:rt=>{rt.globals.encounterno=57;const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=2;}}},
 {name:'Order quiz IV',setup:rt=>{rt.globals.encounterno=57;const tm=byName(rt,'obj_tasque_manager_enemy');if(tm){tm.overrideAttack=1;tm.quizDifficulty=3;}}},
];

type WerewerewireMode='sweeping'|'circles'|'sparks';
function applyWerewerewireMode(rt:GmRuntime,w:GmInstance,mode:WerewerewireMode){
 for(const m of allByName(rt,'obj_move_to_point'))if(m.target===w.id)rt.destroy(m);
 if('___myrememberx' in w&&typeof w.___myrememberx==='number')w.x=w.___myrememberx;
 if('___myremembery' in w&&typeof w.___myremembery==='number')w.y=w.___myremembery;
 Object.assign(w,{sprite:w.idlesprite,shootmode:0,shootcon:0,shoottimer:0,hangcon:0,hangvspeed:0,xmovement_finished:0});
 if(mode==='sweeping')w.rr=1;
 else if(mode==='circles')Object.assign(w,{rr:0,shootmode:1,shootcon:2,shoottimer:0,shootcount:0,sprite:'spr_werewerewire_attack_2',imageIndex:0,imageSpeed:0,stop_anim:1});
 else Object.assign(w,{rr:0,shootmode:1,shootcon:20,shoottimer:0,shootcount:0,sprite:'spr_werewerewire_attack_1',imageIndex:0,imageSpeed:0,stop_anim:1});
}
const werewerewirePattern=(name:string,modes:readonly WerewerewireMode[]):PracticePattern=>({
 name,
 setup:rt=>{
  const wires=allByName(rt,'obj_werewerewire_enemy');
  for(const [i,w] of wires.entries())w.overrideRr=(modes[i]??modes[0])==='sweeping'?1:0;
 },
 beforeStep:rt=>{
  if(!byName(rt,'obj_heart')||rt.globals.turntimer<40)return;
  for(const [i,w] of allByName(rt,'obj_werewerewire_enemy').entries()){
   const mode=modes[i]??modes[0];
   if(mode!=='sweeping'&&'__practiceConfigured' in w&&w.shootmode===1&&w.shootcon===0)applyWerewerewireMode(rt,w,mode);
  }
 },
 afterStep:rt=>{
  const hasHeart=Boolean(byName(rt,'obj_heart'));
  const wires=allByName(rt,'obj_werewerewire_enemy');
  for(const [i,w] of wires.entries()){
   if(!hasHeart&&'shootwait' in w)w.shootwait=10;
   if(w.attacked===1&&hasHeart&&!('__practiceConfigured' in w)){
    w.__practiceConfigured=true;
    applyWerewerewireMode(rt,w,modes[i]??modes[0]);
   }
  }
 },
});

const WEREWEREWIRE_PATTERNS:readonly PracticePattern[]=[
 werewerewirePattern('Sweeping lasers',['sweeping']),
 werewerewirePattern('Laser circles',['circles']),
 werewerewirePattern('Spark spread',['sparks']),
];

const MAUSWHEEL_PATTERNS:readonly PracticePattern[]=[
 {name:'Following cursor (short)',setup:(_rt,e)=>{e.firstturn=1;e.cursor_count=0;}},
 {name:'Following cursor (full)',setup:(_rt,e)=>{e.firstturn=0;e.cursor_count=0;}},
 {name:'Cursor & lightning orbs',setup:(_rt,e)=>{e.firstturn=0;e.cursor_count=1;}},
];

const SPAMTON_PATTERNS:readonly PracticePattern[]=[
 {name:'Mini-Spamtons',beforeStep:(_rt,e)=>{if(e)e.bulletoverride=0;}},
 {name:'Word bullets',beforeStep:(_rt,e)=>{if(e)e.bulletoverride=1;}},
 {name:'Kromer vacuum',beforeStep:(_rt,e)=>{if(e)e.bulletoverride=2;}},
];

const rouxlsPattern=(name:string,chosenattack:number,head_difficulty=0,wheel_difficulty=0):PracticePattern=>({
 name,
 setup:(_rt,e)=>{e.turns=chosenattack;e.chosenattack=chosenattack;e.head_difficulty=head_difficulty;e.wheel_difficulty=wheel_difficulty;},
 beforeStep:(rt,e)=>{if(rt.globals.mnfight===1&&e){e.chosenattack=chosenattack;e.head_difficulty=head_difficulty;e.wheel_difficulty=wheel_difficulty;if(e.talked===1)e.buildedblocks=1;}},
});

const ROUXLS_PATTERNS:readonly PracticePattern[]=[
 rouxlsPattern('Thrash laser I',0,0,0),
 rouxlsPattern('Thrash laser II (fast)',0,1,0),
 rouxlsPattern('Thrash stomp charge',1,0,0),
 rouxlsPattern('Falling puzzle blocks',2,0,0),
];

const queenPattern=(name:string,rr:number,difficulty=0,removePlug=false):PracticePattern=>({
 name,
 setup:(rt,e)=>{
  e.balloonorder=99;e.attackdebug=rr;e.difficultydebug=difficulty;e.difficulty=difficulty;
  if(removePlug)for(const p of allByName(rt,'obj_berdlyplug_enemy'))rt.destroy(p);
 },
});

const QUEEN_PATTERNS:readonly PracticePattern[]=[
 queenPattern('Berdly tornado I',7,0),
 queenPattern('Stomp I',3,0),
 queenPattern('Exploding heads I',6,0),
 queenPattern('Laser grid I',8,0),
 queenPattern('Social media posts I',4,0),
 queenPattern('Giant plug I',9,0),
 queenPattern('Acid glass I',2,0),
 queenPattern('Acid glass II',2,1),
 queenPattern('Acid glass III',2,2),
 queenPattern('Berdly tornado II',7,1),
 queenPattern('Exploding heads II',6,1),
 queenPattern('Social media posts II',4,1),
 queenPattern('Giant plug II',9,1),
 queenPattern('Laser grid II',8,4),
 queenPattern('Laser grid III',8,5),
 queenPattern('Buffer bullets',5,0,true),
 queenPattern('Final Attack (Giant mech)',1,0),
];

const TRIO_PATTERNS:readonly PracticePattern[]=[
 {name:'Musical bullets (full band)'},
 {name:'Musical bullets (duo)',setup:rt=>{const capn=byName(rt,'obj_hatguy_enemy');if(capn)capn.dancing=true;}},
 {name:'Musical bullets (solo)',setup:rt=>{const kk=byName(rt,'obj_kk_enemy'),capn=byName(rt,'obj_hatguy_enemy');if(kk)kk.dancing=true;if(capn)capn.dancing=true;}},
];

const BERDLY_COASTER_PATTERNS:readonly PracticePattern[]=[
 {name:'Tornado I',setup:(_rt,e)=>{e.attackorder=0;e.difficulty=0;e.balloonorder=99;}},
 {name:'A+ grade papers',setup:(_rt,e)=>{e.attackorder=1;e.difficulty=0;e.balloonorder=99;}},
 {name:'Halberd spear blast',setup:(_rt,e)=>{e.attackorder=2;e.difficulty=0;e.balloonorder=99;}},
 {name:'Tornado II (diagonal box)',setup:(_rt,e)=>{e.attackorder=0;e.difficulty=1;e.balloonorder=99;}},
];

const BERDLY_CITY_PATTERNS:readonly PracticePattern[]=[
 {name:'Tornado (diagonal box)',setup:(_rt,e)=>{e.turns=0;e.attack_phase=0;e.sideb_route=false;}},
 {name:'A+ grade papers',setup:(_rt,e)=>{e.turns=0;e.attack_phase=1;e.sideb_route=false;}},
 {name:'Halberd spear blast',setup:(_rt,e)=>{e.turns=0;e.attack_phase=2;e.sideb_route=false;}},
 {name:'Halberd spear blast (Serious)',setup:(_rt,e)=>{e.turns=0;e.rr=0;e.sideb_route=true;}},
];

function skipGigaQueenIntro(rt:GmRuntime,e:GmInstance){
 for(const name of ['obj_thrash_transformation_transition','obj_bqueen_intro','obj_thrash_intro','obj_gigaqueen_intro_round','obj_gigaqueen_intro_fight']){
  for(const inst of allByName(rt,name))rt.destroy(inst);
 }
 rt.view.x=0;rt.view.y=0;
 const panel=findController(rt);
 if(panel){panel.gigaqueencon=0;panel.gigaqueeny=0;panel.gigaqueentimer=0;}
 const bg=byName(rt,'obj_3d_bg_effect');if(bg)bg.slow_down=0;
 e.balloonorder=1;
}

const gigaBoxingPattern=(name:string,attackpattern:number,subHealthbars:number,noDamagePhase2=false,finalState?:'combo'|'baseball'):PracticePattern=>({
 name,
 setup:(rt,e)=>{
  skipGigaQueenIntro(rt,e);
  e.missleattack=0;e.breathattack=0;
  const q=byName(rt,'o_boxingqueen'),hud=byName(rt,'o_boxinghud'),c=byName(rt,'o_boxingcontroller');
  if(q)q.attackpattern=attackpattern;
  if(hud)hud.sub_healthbar_count=subHealthbars;
  if(c)c.beat_phase2_no_damage_taken=noDamagePhase2?1:0;
  if(q&&finalState){
   q.health_count=Math.floor(q.health_count_max*0.2);
   q.finalbaseballused=finalState==='baseball'?1:0;
  }
 },
});

const GIGA_QUEEN_PATTERNS:readonly PracticePattern[]=[
 gigaBoxingPattern('Round 1: Punches',0,2),
 gigaBoxingPattern('Round 1: Kicks',1,2),
 gigaBoxingPattern('Round 1: Baseball throw',1.4,2),
 gigaBoxingPattern('Round 2: Kicks & splashes',2,1),
 gigaBoxingPattern('Round 2: Pirouette wheels',3.5,1),
 {name:'Round 2: Homing missiles (Box)',setup:(rt,e)=>{skipGigaQueenIntro(rt,e);e.missleattack=1;e.breathattack=0;}},
 gigaBoxingPattern('Round 2: Lasers',5.5,1),
 {name:'Round 3: Flame breath (Box)',setup:(rt,e)=>{skipGigaQueenIntro(rt,e);e.missleattack=0;e.breathattack=1;}},
 gigaBoxingPattern('Round 3: Rapid combo',10,0),
 gigaBoxingPattern('Round 3: Fast wheels',11,0),
 gigaBoxingPattern('Round 3: Aura combo (No-hit)',21,0,true),
 gigaBoxingPattern('Final baseball barrage',99,0,false,'combo'),
];

const PRACTICE_PATTERNS:Readonly<Record<string,readonly PracticePattern[]>>={
 'ch1-2':LANCER_1_PATTERNS,
 'ch1-8':CLOVER_PATTERNS,
 'ch1-12':KROUND_PATTERNS,
 'ch1-20':LANCER_2_PATTERNS,
 'ch1-25':JEVIL_PATTERNS,
 'ch1-27':KROUND_PATTERNS,
 'ch1-31':SUSIE_LANCER_PATTERNS,
 'ch1-40':KING_PATTERNS,
 'ch2-57':TASQUE_MANAGER_PATTERNS,
 'ch2-58':BERDLY_COASTER_PATTERNS,
 'ch2-59':QUEEN_PATTERNS,
 'ch2-60':SPAMTON_PATTERNS,
 'ch2-61':SPAMTON_NEO_PATTERNS,
 'ch2-62':TRIO_PATTERNS,
 'ch2-63':ROUXLS_PATTERNS,
 'ch2-71':CLOVER_DOJO_PATTERNS,
 'ch2-81':WEREWEREWIRE_PATTERNS,
 'ch2-82':BERDLY_CITY_PATTERNS,
 'ch2-83':MAUSWHEEL_PATTERNS,
 'ch2-84':GIGA_QUEEN_PATTERNS,
 'ch2-89':TASQUE_MANAGER_DOJO_PATTERNS,
 'ch3-115':ROARING_KNIGHT_PATTERNS,
};

export function practicePatterns(encounterId:string):readonly PracticePattern[]{
 return PRACTICE_PATTERNS[encounterId]??[];
}

export interface PracticeSession{
 readonly rt:GmRuntime;
 readonly id:string;
 readonly name:string;
 readonly pattern:number;
 readonly patternName:string;
 readonly usesEngineHud:boolean;
 paused:boolean;
 outcome:'survived'|'defeat'|null;
 step():void;
}

type ChapterHost=NonNullable<ConstructorParameters<typeof EngineBattle>[5]>['chapterHost'];

export function createPracticeBattle(
 bank:SpriteBank,
 equipment:EquipmentSource,
 loadout:Loadout,
 encounterId:string,
 pattern=0,
 seed=11,
 options:{development?:boolean;neoHost?:typeof installNeoHost;chapterHost?:ChapterHost}={},
):PracticeSession{
 if(encounterId==='ch1-25')return createJevilPractice(bank,equipment,loadout,pattern,seed);
 const patterns=PRACTICE_PATTERNS[encounterId];
 const selected=patterns?.[pattern];
 if(!selected)throw Error('Choose a practice pattern.');
 const battle=new EngineBattle(bank,equipment,loadout,encounterId,seed,{
  development:options.development,
  neoHost:options.neoHost,
  chapterHost:options.chapterHost,
  secretBossAttempts:1,
 });
 const rt=battle.rt,g=rt.globals;
 destroyWriters(rt);
 for(const f of rt.all(faceParent))rt.destroy(f);
 const control=findController(rt);
 if(control){control.intro=0;control.bp=control.bpy??152;}
 g.myfight=-1;g.mnfight=1;g.bmenuno=0;g.charturn=3;
 for(const id of g.charinstance??[]){const h=rt.byId(id);if(h){h.state=0;h.attacktimer=0;}}
 const activeEnemy=():GmInstance|undefined=>{
  for(const id of g.monsterinstance??[]){const m=rt.byId(id);if(m)return m;}
  return battle.enemy;
 };
 const initialEnemy=activeEnemy();
 if(initialEnemy)selected.setup?.(rt,initialEnemy);
 return {
  rt,
  id:encounterId,
  name:battle.name,
  pattern,
  patternName:selected.name,
  usesEngineHud:true,
  paused:false,
  outcome:null,
  step(){
   if(this.paused||this.outcome)return;
   const enemy=activeEnemy();
   if(enemy)selected.beforeStep?.(rt,enemy);
   if(g.mnfight===1){
    for(const id of g.monsterinstance??[]){
     const m=rt.byId(id);if(!m||!('talked' in m)||m.talked===0)continue;
     destroyWriters(rt);
     for(const b of allByName(rt,'obj_werewire_zzt_balloon'))rt.destroy(b);
     if(m.talked===.4&&m.alarm[5]>1)m.alarm[5]=1;
     if(m.talked===1&&'talkmax' in m&&typeof m.talkmax==='number')m.talktimer=m.talkmax;
    }
   }
   battle.step();
   const afterEnemy=activeEnemy();
   if(afterEnemy)selected.afterStep?.(rt,afterEnemy);
   const boxing=byName(rt,'o_boxingcontroller');
   if(battle.outcome==='defeat'||battle.ending==='defeat'||(boxing&&'dead' in boxing&&boxing.dead>=0.5))this.outcome='defeat';
   else if(battle.turn>=1||battle.outcome==='victory'||battle.ending==='victory')this.outcome='survived';
  },
 };
}
