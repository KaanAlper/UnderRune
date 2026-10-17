import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {bulletSpawner,turnTimer} from '../../deltarune/chapter2-battle';
import {sourceText} from '../../host/text';

/** Queen Step's attack dispatch. `rr` and controller `type` are different source fields. */
export function startQueenAttack(s:GmInstance,rt:GmRuntime,controller:GmObjectDef,queen:GmObjectDef,plug:GmObjectDef){
 const g=rt.globals;let d:GmInstance|undefined;
 const spawn=(name:string,type?:number)=>{
  g.monsterattackname[s.myself]=name;
  const b=bulletSpawner(s,rt,s.x,s.y,controller);s.dc=b.id;
  if(type!==undefined)b.type=type;d=b;return b;
 };
 switch(s.rr){
  case 0:spawn('ImageSearch',0).special=s.difficulty;turnTimer(rt,300);break;
  case 1:
   spawn('QueenUltimate',1);if(s.ultimateattackused===0)turnTimer(rt,371);if(s.ultimateattackused===1)turnTimer(rt,311);break;
  case 2:
   g.monsterattackname[s.myself]='Wine';for(const q of rt.withInstances(queen)){q.wineglasscon=1;q.drink=0;}
   s.shieldjustwentup=1;d=spawn('Wine',s.difficulty===1?2.1:s.difficulty===2?2.2:2);d.bufferattack=s.bufferattack;turnTimer(rt,400);break;
  case 3:
   d=spawn('Stomp',3);d.bufferattack=s.bufferattack;turnTimer(rt,240);
   if(s.difficulty>=1&&s.difficulty<=4)d.type=3+s.difficulty/10;
   if(s.difficulty===3)turnTimer(rt,190);break;
  case 4:
   d=spawn('NewSocialMedia',106);d.bufferattack=s.bufferattack;turnTimer(rt,250);
   if(s.difficulty===1){d.type=107;turnTimer(rt,300);}if(s.difficulty===2){d.type=105;turnTimer(rt,300);}break;
  case 5:d=spawn('Bufferbullet',5);d.bufferattack=s.bufferattack;turnTimer(rt,300);break;
  case 6:d=spawn('Explosion',s.difficulty===1?6.1:6);d.bufferattack=s.bufferattack;turnTimer(rt,300);break;
  case 7:
   if(s.difficulty===0)spawn('BerdlyTornado',112);if(s.difficulty===1)spawn('BerdlyTornado',113);
   if(s.difficulty===2)spawn('BerdlyFeather',7);if(s.difficulty===3)spawn('BerdlyFeather',7.5);
   turnTimer(rt,266);break;
  case 8:
   d=spawn('QueenLaser',100);d.bufferattack=s.bufferattack;
   if(s.difficulty>=1&&s.difficulty<=5)d.type=[100,101,102,114,115,116][s.difficulty];turnTimer(rt,245);break;
  case 9:
   d=spawn('Plug');d.bufferattack=s.bufferattack;
   {const q=rt.first(queen);if(!q)throw Error('Queen Plug attack requires obj_queen_enemy');d.damage=g.monsterat[q.myself]*5;}
   d.target=s.mytarget;if(s.difficulty===0)d.type=110;if(s.difficulty===1)d.type=111;turnTimer(rt,300);break;
  case 10:d=spawn('Birthday',8);d.special=5;d.bufferattack=s.bufferattack;turnTimer(rt,300);break;
  default:d=spawn('Unknown',s.rr);d.bufferattack=s.bufferattack;turnTimer(rt,300);
 }
 if(s.rr!==7){const b=rt.first(plug);if(b)b.alphacon=1;}
 s.turns++;g.typer=6;g.fc=0;s.rr=rt.random.choose(0,1,2,3);
 const text=(n:number)=>sourceText(`obj_queen_enemy_slash_Step_0_gml_${n}_0`);
 g.battlemsg[0]=text(462+s.rr);
 if(s.shieldjustwentdown===1)g.battlemsg[0]=text(467);
 if(s.shieldjustwentup===1)g.battlemsg[0]=text(468);
 s.shieldjustwentdown=0;s.shieldjustwentup=0;s.attacked=1;
 return d;
}
