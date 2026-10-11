// Native Create, Draw, Other15 (User5), Alarm4. Host owns the unported Step encounter flow.
import {moveTowardsPoint,type GmObjectDef,type GmInstance,type GmRuntime} from '../../gm/runtime';
import {C} from '../../gm/graphics';
import {monsterParent,growtangle,heroKris,moveHeart} from '../../deltarune/battle';
import {kingBulletController} from './sky';
import {chainKing,nonsolidGrowtangle} from './chains';
import {growtangleBouncer} from './bouncer';
const heartMarker:GmObjectDef={name:'obj_heartmarker',index:210,sprite:'spr_diamondbullet_form',visible:false};
export const kingBoss:GmObjectDef={name:'obj_king_boss',depth:90,index:291,parent:monsterParent,sprite:'spr_chainking_idle',events:{
 create:(s,rt)=>{Object.assign(s,{bikeflip:0,becomeflash:0,turnt:0,turns:0,talktimer:0,talkmax:90,state:0,flash:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,mywriter:343249823,acting:0,actcon:0,acttimer:0,mercymod:0,maxmercy:9999,warned:0,compliment:0,tired:0,attacks:0,dodgetimer:0,candodge:0,con:0,battlecancel:0,nexttry:0,mytarget:3,imageSpeed:0,imageXscale:2,imageYscale:2,idlesprite:'spr_chainking_idle',hurtsprite:'spr_chainking_hurt',sparedsprite:'spr_chainking_idle',kturn:0,xx:rt.view.x,yy:rt.view.y,tempattack:1,hurtbuffer:0,reminvc:rt.globals.invc,susinit:0,remxx:rt.view.x,remyy:rt.view.y,chain_dragging:0,wall_bouncing:0,talk_all_message:0});},
 user5:beginKingAttack,alarm4:s=>{s.con++;},
 draw:(s,rt)=>{if(s.state===3){s.hurttimer--;if(s.hurttimer<0)s.state=0;else{if(rt.globals.monster[s.myself]===0)throw new Error('King defeat/cutscene event is unsupported');s.hurtshake++;if(s.hurtshake>1){if(s.shakex>0)s.shakex--;if(s.shakex<0)s.shakex++;s.shakex=-s.shakex;s.hurtshake=0;}rt.drawSprite(s.hurtsprite,0,s.x+s.shakex,s.y,2,2,0,s.imageBlend,1);}}
  if(s.state===0){s.siner++;s.thissprite=s.idlesprite;rt.drawSprite(s.thissprite,s.siner/6,s.x,s.y,2,2,0,s.imageBlend,1);if(s.flash===1){s.fsiner++;rt.drawSpriteFog(s.thissprite,s.siner/6,s.x,s.y,2,2,0,C.white,-Math.cos(s.fsiner/5)*.4+.6);}}
  if(s.becomeflash===0)s.flash=0;s.becomeflash=0;
 },
}};
/** Source turn sequence before target selection; defense falls after turn11 to floor-25. */
export function nextKingAttack(s:GmInstance,rt:GmRuntime){s.kturn++;s.attack=s.kturn<=11?s.kturn:s.kturn===12?7:s.kturn===13?8:s.kturn===14?10:s.kturn===15?9:s.kturn===16?7:11;if(s.kturn>11&&rt.globals.monsterdf[s.myself]>-25)rt.globals.monsterdf[s.myself]-=5;return s.attack;}
function sendHeart(rt:GmRuntime,marker?:GmInstance){const kris=rt.first(heroKris);if(!kris)throw new Error('King attacks require obj_herokris');const h=rt.create(moveHeart,kris.x+10,kris.y+40);if(marker){h.distx=marker.x;h.disty=marker.y;h.dist=Math.hypot(h.x-h.distx,h.y-h.disty);moveTowardsPoint(h,h.distx,h.disty,h.dist/h.flytime);}return h;}
/** Native User5, with creation order and one-turn attack reduction preserved. */
export function beginKingAttack(s:GmInstance,rt:GmRuntime){
 if(s.attacked!==0)return;
 if(!Number.isInteger(s.attack)||s.attack<1||s.attack>11)throw new Error(`Unsupported King attack ${s.attack}`);
 rt.globals.invc=s.reminvc;const a=s.attack;
 if([1,3,7,9].includes(a)){const box=rt.create(growtangle,s.xx+320,s.yy+170);s.box=box.id;const h=sendHeart(rt);if(a===1)s.mh=h.id;const c=rt.create(kingBulletController,0,0);s.dd=c.id;c.type=a===1?21:a===3?34:a===7?35:23;c.damage=rt.globals.monsterat[s.myself]*5*s.tempattack;c.target=s.mytarget;c.btimer=a===1||a===9?-8:10;if(a===1||a===9)c.side=1;rt.globals.turntimer=a===1?190:a===3?210:a===7?220:200;}
 if([2,5,6,10,11].includes(a)){if(a===6||a===11){rt.globals.invc*=1.5;s.timeruse=0;}s.visible=false;const c=rt.create(chainKing,s.x,s.y);s.chainking=c.id;c.type=a===6||a===11?2:1;c.subtype=a===2?0:a===5?1:a===10?2:a===11?1:s.chain_dragging>=1?2:5;if(a===6)s.chain_dragging++;if(a!==6&&a!==11)c.grazepoints=6;
  const box=rt.create(nonsolidGrowtangle,s.xx+(a===6||a===11?205:200),s.yy+(a===6||a===11?170:175));s.box=box.id;box.sprite=a===6||a===11?'spr_battlebg_1':'spr_battlebg_wavechain';
  const move=()=>{const m=rt.create(heartMarker,box.x-10,box.y-10);s.hm=m.id;sendHeart(rt,m);rt.destroy(m);};
  if(a===2||a===10)move();c.damage=rt.globals.monsterat[s.myself]*(a===11?3:a===6?5:4)*s.tempattack;c.target=a===6?s.mytarget:3;rt.globals.turntimer=999;if(a!==2&&a!==10)move();
 }
 if(a===4||a===8){rt.globals.invc*=1.5;const box=rt.create(growtangle,s.xx+310,s.yy+165);s.box=box.id;box.sprite='spr_battlebg_2';box.keep=1;const m=rt.create(heartMarker,box.x-10,box.y-10);s.hm=m.id;sendHeart(rt,m);rt.destroy(m);const d=rt.create(growtangleBouncer,box.x,box.y);s.damagebox=d.id;d.type=a===4?5:3;d.damage=rt.globals.monsterat[s.myself]*5*s.tempattack;d.target=s.mytarget;rt.globals.turntimer=999;}
 s.tempattack=1;s.attacked=1;
}
