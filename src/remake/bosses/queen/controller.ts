import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {lengthdirX,lengthdirY} from '../../gm/math';
import {snd} from '../../deltarune/sound';
import {queenSearchPattern} from './controller-search';
import {queenWinePattern} from './controller-wine';
import {type QueenObject,queenInstance} from './context';

/** Every Queen controller type; each child retains the identity of its original attack object. */
export function createQueenBulletController(object:QueenObject):GmObjectDef{
 const required=(rt:GmRuntime,n:string)=>queenInstance(rt,object,n);
 return {...object('obj_queen_bulletcontroller'),events:{
  create:(s,rt)=>{
   Object.assign(s,{type:1,btimer:99,ctimer:0,dtimer:0,timermax:12,threshold:9,wineadded:0,wineadd:4,turnamount:10,turnperiod:15,dropletcount:0,winedebug:0,stomplocation:[0,0,0],damage:-1,grazepoints:-1,timepoints:-1,inv:-1,grazed:-1,grazetimer:-1,element:'none',target:-1,side:1,difficulty:1,made:0,special:0,chooselocation:0,a:rt.random.irandom(2),init:0,sameattack:0,sameattacker:0,miny:999,maxy:999,maxx:999,creator:0,queen:object('obj_queen_enemy'),lastType:0,buffertimer:0,bufferattack:0,extra:0,lastside:-1,siner:0,loopsfx:0});
  },
  destroy:(_s,rt)=>{for(const sh of rt.withInstances(object('obj_queenshield_enemy')))sh.appearcon=1;if(rt.sourceAudio?.playing('snd_crowd'))rt.soundStop?.('snd_crowd');},
  step:(s,rt)=>{
   const box=()=>required(rt,'obj_growtangle');
   const create=(n:string,x:number,y:number,field='d')=>{const d=rt.create(object(n),x,y);s[field]=d.id;return d;};
   const bullet=(n:string,x:number,y:number)=>{const d=create(n,x,y);d.damage=s.damage;d.target=s.target;if('element' in s)d.element=s.element;return d;};
   const leg=(x:number,y:number,side=false)=>{const d=bullet('obj_queen_leg',x,y);if(side){d.direction=180;d.sprite='spr_queen_leg_side';}return d;};
   const gun=()=>{s.dir=s.dir+30+rt.random.random(300);s.len=140+rt.random.random(10);s.cenx=0;s.ceny=0;const b=rt.first(object('obj_growtangle'));if(b)s.cenx=b.x;if(b)s.ceny=b.y;return create('obj_queen_lasergun',s.cenx+lengthdirX(s.len,s.dir),s.ceny+lengthdirY(s.len,s.dir),'gun');};
   if(s.init===0){
    const g=rt.globals;s.__sameattack=0;for(s._sameattacki=0;s._sameattacki<3;s._sameattacki++)if(g.monsterattackname[s._sameattacki]===g.monsterattackname[s.creator]&&g.monster[s._sameattacki]===1)s.__sameattack++;s.sameattack=s.__sameattack;
    if(s.sameattack>1){if(s.creator===2)s.sameattacker=s.sameattack-1;else if(s.creator===1)s.sameattacker=s.sameattack===3?s.creator:g.monsterattackname[0]===g.monsterattackname[1];}
    const b=rt.first(object('obj_growtangle'));if(b){s.miny=b.y-rt.spriteHeight(b)/2;s.maxy=b.y+rt.spriteHeight(b)/2;s.minx=b.x-rt.spriteWidth(b)/2;s.maxx=b.x+rt.spriteWidth(b)/2;}s.init=1;
   }
   const buffering=rt.first(object('obj_queen_buffercontroller'));if(!buffering||buffering.buffering!==1)s.btimer++;
   if(s.type===0||s.type===9||s.type===8){queenSearchPattern(s,rt,object);return;}
   if(s.type===1){if(s.init===1){create('obj_queen_ultimate_attack_controller',box().x,box().y);create('obj_hiddenheart',required(rt,'obj_heart').x,required(rt,'obj_heart').y).depth-=20;s.init=2;}return;}
   if(s.type===2||s.type===2.1||s.type===2.2){queenWinePattern(s,rt,object);return;}
   if([3,3.1,3.2,3.3,3.4].includes(s.type)){
    if(s.type===3&&s.btimer>=30){
     s.chooselocation=rt.random.irandom(2);const a=s.stomplocation;
     for(const [pattern,choices] of [[[0,1,1],[0]],[[1,0,1],[1]],[[1,1,0],[2]],[[0,0,1],[0,1]],[[0,1,0],[0,2]],[[1,0,0],[1,2]]] as [number[],number[]][])
      if(a.every((v:number,i:number)=>v===pattern[i]))s.chooselocation=choices.length===1?choices[0]:rt.random.choose(...choices);
     if(a.every((v:number)=>v===1))for(let i=0;i<3;i++)a[i]=0;
     if(s.chooselocation>=0&&s.chooselocation<=2){const d=leg(box().x+(s.chooselocation-1)*47,s.miny-4);a[s.chooselocation]=1;d.pos=s.chooselocation;d.shootbullets=1;}s.btimer=9;
    }
    if(s.type===3.1&&s.btimer>=30){leg(s.maxx+4,box().y+rt.random.choose(-47,0,47),true);s.btimer=0;}
    if(s.type===3.2){if([110,150].includes(s.btimer))leg(box().x+rt.random.choose(-47,0,47),s.miny-4);if([130,170].includes(s.btimer))leg(s.maxx+4,box().y+rt.random.choose(-47,0,47),true);if(s.btimer===190)leg(box().x-47,s.miny-4);if(s.btimer===192)leg(s.maxx+4,box().y,true);}
    if(s.type===3.3){if(s.btimer===110){leg(box().x,s.miny-4).special=1;leg(box().x+47,s.miny-4).special=1;}if(s.btimer===140)leg(box().x-47,s.miny-4).special=2;if(s.btimer>140&&s.btimer<154)for(const l of rt.withInstances(object('obj_queen_leg')))if(l.special===1)l.stomplerp-=.01;if(s.btimer===170)leg(s.maxx+4,box().y+47,true).special=3;}
    if(s.type===3.4&&s.btimer>=30){for(let repeat=0;repeat<2;repeat++){if(s.a>=0&&s.a<=2)leg(box().x+(s.a-1)*47,s.miny-4);s.a+=1+rt.random.irandom(1);if(s.a>2)s.a-=3;}s.btimer=0;}return;
   }
   if(s.type===4){
    const f=rt.first(object('obj_queen_finger'));if(f)s.btimer+=f.scrollSpeed/4-1;
    if(s.init===1){s.btimer=10;const d=create('obj_queen_sm_deleter',box().x-15,-40);d.imageXscale=2.5;d.imageYscale=3.5;s.init=2;s.extra=rt.bank.get('spr_queen_pfps')!.frames-1;const f=create('obj_queen_finger',rt.view.x+660,rt.view.y+500);if(s.difficulty===2)f.bigscrollcount=rt.random.irandom(1)+1;f.timer=0;}
    if(s.btimer>=10){const height=rt.view.y-40+4*(s.btimer-10),everyman=rt.random.irandom(499)===0;if(!everyman)for(s.i=0;s.i<6;s.i++){const d=bullet('obj_queen_social_media',s.minx+s.i*30,height);d.imageXscale=1.25;d.imageYscale=1.25;d.imageSpeed=.5;d.speed=4;d.direction=270;}
     if(s.special!==5){const d=create('obj_queen_pfp',s.minx-40,height);d.imageSpeed=0;d.direction=270;d.speed=4;d.imageIndex=everyman?s.extra:rt.random.irandom(s.extra-1);d.imageXscale=.65;d.imageYscale=.65;s.special=everyman?0:rt.random.irandom(5);s.btimer=0;}else{s.special=0;s.btimer=5;}
    }return;
   }
   if(s.type===5){if(s.init===1){const d=create('obj_queen_spadeblow',box().x,s.miny-66);d.depth=box().depth;d.imageSpeed=0;d.difficulty=required(rt,'obj_queen_enemy').difficulty;s.init=2;}return;}
   if(s.type===6||s.type===6.1){
    if(s.init===1)s.init=2;if(s.btimer>30){let d:GmInstance;
     if(s.bufferattack){d=create('obj_queen_explodinghead',box().x+150,box().y);d.damage=s.damage;d.target=s.target;d.buffer=s.bufferattack;d=create('obj_queen_explodinghead',box().x-150,box().y);}
     else{d=rt.random.irandom(100)<60?create('obj_queen_explodinghead_intro',box().x+s.lastside*150,box().y-70+rt.random.irandom(140)):create('obj_queen_explodinghead_intro',box().x-70+rt.random.irandom(140),box().y+s.lastside*150);s.lastside*=-1;}
     d.buffer=s.bufferattack;d.damage=s.damage;d.target=s.target;d.laugh=1;s.btimer=s.type===6?2:15;
     if(s.init===2){d.first=1;s.init=3;if(s.type===6)s.btimer=15;}
    }return;
   }
   if(s.type===7){if(s.init===1){const b=required(rt,'obj_berdlyplug_enemy');rt.create(object('obj_queen_berdlywireattack'),b.x,b.y);b.visible=false;s.init=2;}return;}
   if(s.type===100){if(s.btimer>=15){if(s.made===0){s.dir=0;s.made=1;}gun();s.btimer=0;}return;}
   if(s.type===101||s.type===102){
    s.btimerthreshold=s.type===102?22:31;if(s.btimer>=s.btimerthreshold){
     if(s.made===0){s.yway=1;s.goway=0;s.remyway=1;s.xway=1;s.made=1;s.times=0;}
     if(s.times>=0&&s.times<=3)[s.goway,s.yway,s.xway]=[[0,1,1],[1,1,-1],[0,-1,-1],[1,-1,1]][s.times];
     s.times+=rt.random.choose(-1,1);if(s.times<=-1)s.times=3;if(s.times>=4)s.times=0;s.cenx=0;s.ceny=0;const b=rt.first(object('obj_growtangle'));if(b)s.cenx=b.x;if(b)s.ceny=b.y;
     s.fromx=s.cenx+75*s.xway;s.fromy=s.ceny+75*s.yway;
     if(s.goway===0||s.goway===1)for(s.i=0;s.i<4;s.i++){const x=s.goway===0?s.fromx-s.xway*50*s.i:s.cenx+125*s.xway,y=s.goway===0?s.ceny+125*s.yway:s.fromy-s.yway*50*s.i;const g=create('obj_queen_lasergun',x,y,'gun');g.inittime=s.i*4;g.randomshot=0;g.shotsize=.5;g.maxsize=1;}s.btimer=0;
    }return;
   }
   if([105,106,107].includes(s.type)){
    if(!rt.exists(object('obj_social_media_attack_fade_heroes')))rt.create(object('obj_social_media_attack_fade_heroes'),s.x,s.y);s.timerthreshold=s.type===106?20:15;s.init++;
    if(s.init===12){snd(rt,'snd_crowd');rt.soundLoop?.('snd_crowd');rt.soundPitch?.('snd_crowd',.85);}
    if(s.btimer>=s.timerthreshold){s.make=1;if(s.type===107&&(s.made>=7||s.made===4))s.make=0;
     if(s.make){s.side=rt.random.choose(-1,1);create('obj_socialmedia_avatar',box().x+(s.type===107?160:125)*s.side,-80,'face').vspeed=5;}
     if(s.made===4&&s.type===107){const f=create('obj_socialmedia_avatar',box().x+125,-80,'face');f.vspeed=5;f.isqueen=1;f.side=1;f.x=box().x+125;}s.btimer=0;s.made++;
    }return;
   }
   if(s.type===110||s.type===111){if(s.made===0&&rt.exists(object('obj_growtangle'))){const d=create('obj_growtangle_electric',box().x,box().y,'growtangle');d.damage=s.damage;d.target=s.target;if(s.type===111)d.type=1;s.made=1;}return;}
   if(s.type===112||s.type===113){if(s.made===0&&rt.exists(object('obj_growtangle'))){required(rt,'obj_berdlyplug_enemy').con=1;const d=create('obj_berdly_tornadomaker',box().x,box().y-rt.spriteHeight(box()),'bardly');if(s.type===113)d.difficulty=3;s.made=1;}return;}
   if(s.type===114||s.type===115){
    if(s.btimer>=30){if(s.made===0){s.dir=0;s.made=1;}gun();s.btimer=0;}s.ctimer++;
    if(s.type===114&&(s.ctimer===20||s.ctimer===150)){const a=rt.random.choose(1,2,3);if(a===1){s.xx=box().x+150;s.yy=box().y-50+rt.random.irandom(100);}if(a===2){s.xx=box().x-150;s.yy=box().y-50+rt.random.irandom(100);}if(a===3){s.xx=box().x-50+rt.random.irandom(100);s.yy=box().y-100;}const d=create('obj_queen_search_window',s.xx,s.yy);d.quick=true;d.search=2;d.damage=s.damage;d.target=s.target;}
    if(s.type===115&&s.ctimer===50){let a=rt.random.irandom(2);if(a>=0&&a<=2)leg(box().x+(a-1)*47,s.miny-4).pos=a;a+=1+rt.random.irandom(1);if(a>2)a-=3;s.ctimer=0;}return;
   }
   if(s.type===116){
    if(s.made===0){s.dir=0;s.made=1;s.ctimer=89;s.dtimer=64;}if(s.btimer>=105){gun();s.btimer=55;}s.ctimer++;
    if(s.ctimer===94){let a=rt.random.irandom(2);if(a>=0&&a<=2)leg(box().x+(a-1)*47,s.miny-4).pos=a;a+=1+rt.random.irandom(1);if(a>2)a-=3;s.ctimer=0;}
    s.dtimer++;if(s.dtimer===65){if(rt.random.irandom(100)<60)create('obj_queen_explodinghead_intro',box().x+s.lastside*150,box().y-70+rt.random.irandom(140));else create('obj_queen_explodinghead_intro',box().x-70+rt.random.irandom(140),box().y+s.lastside*150);s.lastside*=-1;s.dtimer=0;}return;
   }
   if(s.init===1)s.init=2;
  },
 }};
}
