// Normal-route obj_sneo_bulletcontroller. Dependencies resolve through the canonical host registry;
// this object owns source timers, NEO's poses/slides, attack spawning and Destroy cleanup.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq,ge,gt,le,lt,lengthdirX,lengthdirY} from '../../gm/math';
import {C} from '../../gm/graphics';
import {moveToRememberXY} from '../../deltarune/chapter2-battle';

/** Reference used by enemy code; the host aliases it to the factory's canonical definition. */
export const sneoBulletController:GmObjectDef={name:'obj_sneo_bulletcontroller',index:703,events:{create:()=>{throw Error('NEO bullet controller must be registered before creation');}}};
const types=[0,1,1.5,6,8.5,9,12];
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const easeOut4=(t:number)=>-1*(Math.pow(t-1,4)-1);

export function createSneoBulletController(object:(name:string)=>GmObjectDef):GmObjectDef{
 const all=(rt:GmRuntime,name:string)=>rt.all(object(name));
 const first=(rt:GmRuntime,name:string)=>{const i=rt.first(object(name));if(!i)throw Error(`NEO bullet controller requires ${name}`);return i;};
 const neo=(rt:GmRuntime)=>first(rt,'obj_spamton_neo_enemy');
 const create=(s:GmInstance,rt:GmRuntime)=>{
  const n=neo(rt);
  Object.assign(s,{type:1,btimer:99,atimer:0,timermax:12,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,grazed:-1,grazetimer:-1,element:6,target:-1,side:1,
   difficulty:n.difficulty,made:0,hellmode:n.hellmode,init:0,sameattack:0,sameattacker:0,miny:999,maxy:999,maxx:999,creator:0,
   sneo:object('obj_spamton_neo_enemy'),hideshooty:1,lastType:0,sneoarm_x:n.x+n.partxoff[1],sneoarm_y:n.y+n.partyoff[1],
   elevatororb:2,doubleelevatorattack:0,arm1:-1,arm2:-1,arm3:-1,sneodollarcount:0,mercyaccumulated:0,hearttargettimer:0,facetimeincrease:0,
   krishp:rt.globals.hp[1],sushp:rt.globals.hp[2],ralhp:rt.globals.hp[3]});
 };
 function initBounds(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;s.__sameattack=0;
  for(s._sameattacki=0;s._sameattacki<3;s._sameattacki++)if(g.monsterattackname[s._sameattacki]===g.monsterattackname[s.creator]&&g.monster[s._sameattacki]===1)s.__sameattack++;
  s.sameattack=s.__sameattack;
  if(s.sameattack>1){if(s.creator===2)s.sameattacker=s.sameattack-1;else if(s.creator===1)s.sameattacker=s.sameattack===3?s.creator:Number(g.monsterattackname[0]===g.monsterattackname[1]);}
  const b=rt.first(object('obj_growtangle'));if(b){s.miny=b.y-rt.spriteHeight(b)/2;s.maxy=b.y+rt.spriteHeight(b)/2;s.minx=b.x-rt.spriteWidth(b)/2;s.maxx=b.x+rt.spriteWidth(b)/2;}
  s.init=1;
 }
 function flying(s:GmInstance,rt:GmRuntime,n:GmInstance){
  if(s.init===1){s.btimer=0;rt.create(object('obj_sneo_guymaker'),0,0);s.init=2;rt.globals.turntimer=s.difficulty===2?360:s.difficulty===3?300:240;}
  else if(s.difficulty===2){
   if([40,150,260].includes(s.btimer)){
    s.sneoarm_x=n.x+n.partxoff[1];s.sneoarm_y=n.y+n.partyoff[1];s.armangle=-68-rt.random.random(32);s.side=s.armangle;
    const y=s.sneoarm_y+lengthdirY(60,s.armangle-90),x=s.sneoarm_x+lengthdirX(60,s.armangle-90),d=rt.create(object('obj_sneo_biglaser'),x,y);s.d=d.id;
    d.direction=s.armangle-90;d.imageAngle=s.armangle-90;d.depth+=1;d.damage=s.damage*2;d.target=s.target;n.aimmode=1;n.armaim=s.armangle;n.partmode=3;
   }else if([90,200,310].includes(s.btimer)){for(const d of all(rt,'obj_sneo_biglaser')){d.firecon=1;d.active=1;d.imageBlend=C.white;}n.partmode=12;}
   else if((s.btimer>=90&&s.btimer<120)||(s.btimer>=200&&s.btimer<230)||(s.btimer>=310&&s.btimer<340)){
    for(const d of all(rt,'obj_sneo_biglaser')){d.x=s.sneoarm_x+lengthdirX(60,s.armangle-90);d.y=s.sneoarm_y+lengthdirY(60,s.armangle-90);d.direction=s.armangle-90;d.imageAngle=s.armangle-90;}n.armaim=s.armangle;
   }else if([130,240,350].includes(s.btimer)){for(const d of all(rt,'obj_sneo_biglaser'))d.firecon=2;n.partmode=4;}
  }else if(s.difficulty===3&&s.btimer===1)n.partmode=36;
 }
 function slideOut(s:GmInstance,rt:GmRuntime,n:GmInstance,restoreY:boolean){
  n.x-=10;const t=rt.globals.turntimer-1;n.vinex=(Math.pow(Math.min(10,t)/10-1,5)+1)*50;n.x=n.xstart+easeOut4(t/20)*200;
  if(restoreY)n.y=lerp(n.y,n.___myremembery,t/20);
 }
 function pipis(s:GmInstance,rt:GmRuntime,n:GmInstance){
  s.atimer++;if(s.atimer===1)s.btimer=0;
  if(s.atimer===6){const b=rt.create(object('obj_pipis_egg_bullet'),n.x+4,n.y+60);s.bul=b.id;Object.assign(b,{type:2,drawlabel:1,depth:n.depth,gravity:0.2+rt.random.random(10)/100,vspeed:0,hspeed:-1.55,target:s.target,damage:s.damage});}
  if(s.atimer<20){n.x+=10;n.vinex=Math.pow(Math.min(10,s.atimer)/10,5)*300;n.x=n.xstart+Math.pow(s.atimer/20,2)*300;}
  if(s.atimer===20&&s.init===1){n.x=n.xstart+300;n.vinex*=-1;const p=rt.create(object('obj_pipis_controller'),s.x,s.y);s.pipis=p.id;p.damage=s.damage;p.target=s.target;s.init=2;}
  const timer=rt.globals.turntimer;
  if(timer<21&&timer>1){n.partmode=1;for(const p of all(rt,'obj_sneo_phonecall'))p.fadealpha=0;slideOut(s,rt,n,true);}
  if(timer===1)n.x=n.xstart;
 }
 function faceAttack(s:GmInstance,rt:GmRuntime,n:GmInstance){
  const g=rt.globals;s.atimer++;
  if(s.atimer===1&&n.facebroken===2){g.turntimer=170;n.facebroken=1;}
  if(s.atimer<20){n.x+=10;n.vinex=Math.pow(Math.min(10,s.atimer)/10,5)*300;n.x=n.xstart+Math.pow(s.atimer/20,2)*300;}
  if(s.atimer===20){
   const f=rt.create(object('obj_sneo_faceattack'),rt.view.x+424,rt.view.y+100);s.face=f.id;f.target=s.target;f.damage=s.damage;f.special=s.hellmode;if(n.faceattackcount===1)f.first_time=true;rt.userEvent(f,0);
   for(const c of rt.all(s.object)){c.facetimeincrease=0;if(n.eyeshp<=0)c.facetimeincrease++;if(n.nosehp<=0)c.facetimeincrease++;if(n.mouthhp<=0)c.facetimeincrease++;}
   const increase=first(rt,'obj_sneo_bulletcontroller').facetimeincrease;
   for(const f of all(rt,'obj_sneo_faceattack')){if(f.type!==1){if(increase===1)f.timer+=20;if(increase===2||increase===3)f.timer+=50;}else if(increase>=1&&increase<=3)f.timer+=20;}
  }
  const faces=all(rt,'obj_sneo_faceattack');
  if(g.turntimer>80&&faces.length&&faces[0].init===1&&n.facebroken===0){
   let a=0;gmArray(s,'enemy');for(let i=0;i<faces.length;i++){s.enemy[i]=faces[i].id;if(faces[i].type!==0&&faces[i].broken===0)a=1;}if(a===0)g.turntimer=80;
  }
  if(g.turntimer<21&&g.turntimer>1){for(const f of faces){f.imageAlpha-=0.1;if(lt(f.imageAlpha,0))rt.destroy(f);}slideOut(s,rt,n,true);}
  if(g.turntimer===1){if(n.facebroken===1)n.facebroken=0;n.x=n.xstart;}
 }
 function finale(s:GmInstance,rt:GmRuntime,n:GmInstance){
  const box=first(rt,'obj_growtangle');
  if(s.init===1){rt.globals.turntimer=1200;rt.create(object('obj_finale_growtangle'),box.x,box.y);s.init=2;s.special=1;s.btimer=0;for(const h of all(rt,'obj_sneo_hitdetector'))h.active=false;}
  if(s.special===1&&s.btimer===45){
   s.special=2;s.d=rt.create(object('obj_sneo_warped_box'),box.x,box.y).id;
   const d=rt.create(object('obj_sneo_final_forme'),rt.view.x+680,n.y);s.d=d.id;Object.assign(d,{intro:-1,damage:s.damage,target:s.target,speed:16.75,direction:180,friction:0.5});s.btimer=0;
  }
  if(s.special===2&&s.btimer===70){for(const b of all(rt,'obj_sneo_warped_box'))b.state=1;for(const b of all(rt,'obj_sneo_final_forme_hitbox'))b.destroyable=1;for(const d of all(rt,'obj_sneo_final_forme')){d.destroyable=1;d.imageIndex++;}s.special=3;}
  if(s.special===3&&s.btimer>=10){
   s.xx=s.minx-rt.random.random(30)-40;const wide=[2,5,6].includes(s.sneodollarcount);s.yy=box.y-rt.random.random(wide?200:100)+([1,4].includes(s.sneodollarcount)?200:100);
   const d=rt.create(object('obj_sneo_dollar'),s.xx,s.yy);s.d=d.id;d.startscale=s.sneodollarcount===6?2:wide?1.5:1;s.sneodollarcount=(s.sneodollarcount+1)%7;s.btimer=3;d.speed=0.1;
  }
 }
 const step=(s:GmInstance,rt:GmRuntime)=>{
  if(!types.includes(s.type))throw Error(`Spamton NEO controller type ${s.type} is outside the NORMAL source route`);
  const n=neo(rt),g=rt.globals;
  if(gt(g.mercymod[n.myself],99)&&gt(g.turntimer,1))g.turntimer=1;
  if(s.init===0)initBounds(s,rt);s.btimer++;
  if(eq(s.type,0))flying(s,rt,n);
  if(eq(s.type,1))pipis(s,rt,n);
  if(eq(s.type,1.5)){s.hearttargettimer--;if(s.init===1){for(const n of all(rt,'obj_spamton_neo_enemy'))n.partmode=34;s.init=2;s.btimer=100;}if(s.btimer===110)for(const n of all(rt,'obj_spamton_neo_enemy')){n.heart_release_con++;if(n.heart_release_con===1)n.makeheart=1;}}
  if(eq(s.type,6)){if(s.init===1){rt.create(object(s.difficulty===9?'obj_sneo_wall_controller':'obj_sneo_wall_controller_new'),0,0);s.init=2;}if(le(g.turntimer,10)&&gt(g.turntimer,9)){for(const n of all(rt,'obj_spamton_neo_enemy'))moveToRememberXY(n,rt,8);g.turntime=9;}}
  if(eq(s.type,8.5)){if(s.init===1){s.init=2;s.made=60;}if(ge(s.btimer,1)){if(gt(g.turntimer,11)&&gt(n.imageAlpha,-0.2))n.imageAlpha-=0.2;if(s.btimer===115){const b=first(rt,'obj_growtangle'),d=rt.create(object('obj_sneo_phonehand_master'),b.x+40+rt.spriteWidth(b)/2,b.y);s.d=d.id;d.target=s.target;}}}
  if(eq(s.type,9))finale(s,rt,n);
  if(eq(s.type,12))faceAttack(s,rt,n);
 };
 const destroy=(s:GmInstance,rt:GmRuntime)=>{
  const n=neo(rt),g=rt.globals;if(s.hideshooty)n.partframe[1]=0;
  for(const n of all(rt,'obj_spamton_neo_enemy'))Object.assign(n,{makeheartinit:0,makeheartalt:0,partmode:1,heart_release_con:0});
  if(eq(s.type,0)&&s.difficulty===3)for(const n of all(rt,'obj_spamton_neo_enemy'))moveToRememberXY(n,rt,4);else n.x=n.xstart;
  if(eq(s.type,8.5)&&(s.krishp!==g.hp[1]||s.sushp!==g.hp[2]||s.ralhp!==g.hp[3]))n.nothitduringphonehands=0;
  if(gt(s.mercyaccumulated,0))for(const n of all(rt,'obj_spamton_neo_enemy')){g.mercymod[n.myself]+=first(rt,'obj_sneo_bulletcontroller').mercyaccumulated;g.mercymod[n.myself]=Math.max(0,Math.min(99,g.mercymod[n.myself]));}
 };
 return {...sneoBulletController,parent:object('obj_bulletgenparent'),sprite:'spr_sneo_c_weakpoint_hit',depth:0,visible:false,events:{create,step,destroy}};
}
