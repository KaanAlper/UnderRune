import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {ge,gt,lt,le,eq} from '../../gm/math';
type Attack=readonly [type:number,amount:number,variant:number,wait:number];
/** scr_qb_reset and scr_qb: the source keeps its completed loop index and overwrites only the active list slots. */
export function resetGigaAttackList(s:GmInstance){s.attackcount=0;s.attackcountmax=0;s.attackpattern=0;s.list_attacktype=[];s.list_attackamount=[];s.list_attackvariant=[];s.list_attackwait=[];for(s.i=0;s.i<20;s.i++){s.list_attacktype[s.i]=0;s.list_attackamount[s.i]=0;s.list_attackvariant[s.i]=0;s.list_attackwait[s.i]=0;}}
export function appendGigaAttack(s:GmInstance,type:number,amount:number,variant:number,wait:number){s.list_attacktype[s.attackcountmax]=type;s.list_attackamount[s.attackcountmax]=amount;s.list_attackvariant[s.attackcountmax]=variant;s.list_attackwait[s.attackcountmax]=wait;s.attackcountmax++;}
const PLANS:Readonly<Record<number,readonly Attack[]>>={
 100:[[9,0,0,0]],99:[[4,7,1,0],[9,0,0,0]],22:[[5,3,2,30]],21:[[6,0,2,1],[3,0,0,0]],
 19:[[0,0,2,0],[0,0,2,0],[0,0,2,0],[0,0,2,0],[2,2,2,0],[0,0,2,0],[0,0,2,0],[4,0,0,0]],
 18:[[0,0,2,0],[2,0,2,0],[0,0,2,0],[1,3,0,0],[2,2,2,0]],17:[[7,0,1,0]],16:[[6,0,1,0],[3,0,0,10]],15:[[6,0,0,0],[3,0,0,10]],14:[[4,5,1,30]],
 13:[[1,0,2,20],[3,0,0,0],[1,3,0,0],[2,0,0,0]],12:[[0,0,2,0],[2,2,0,0],[0,0,2,0],[4,0,0,0],[0,0,3,0]],11:[[5,3,1,30]],
 10:[[1,3,0,20],[0,0,2,0],[0,0,2,0],[0,0,2,0],[0,0,3,0]],8:[[0,0,0,30],[2,0,0,20],[0,0,2,0],[2,2,0,0]],
 7:[[1,2,0,0],[0,0,2,0],[0,0,2,0],[4,0,1,0]],6:[[3,0,0,20],[0,0,2,0],[0,0,2,0],[2,2,0,0]],5.5:[[7,0,0,20]],
 5:[[1,0,2,20],[1,0,2,20],[0,0,2,0],[0,0,3,0],[0,0,3,0]],4:[[2,0,0,20],[0,0,1,20],[2,0,0,0],[1,2,0,0]],3.5:[[5,3,0,30]],
 3:[[0,0,1,20],[0,0,1,0],[2,0,2,20],[2,0,1,0]],2:[[1,0,2,20],[1,0,2,20],[1,0,2,20],[1,2,0,0]],1.8:[[1,0,2,30],[0,0,4,30],[1,0,2,30],[0,0,4,0]],
 1.4:[[8,0,4,30]],1:[[1,0,2,30],[1,0,2,30],[1,0,2,30],[1,0,2,0]],0:[[0,0,4,30],[0,0,4,30],[0,0,4,30],[0,0,4,0]],
 50:[[0,0,4,30],[0,0,4,30],[0,0,4,30],[0,0,4,30]],51:[[1,0,2,30],[0,0,4,0],[1,0,2,30],[0,0,4,0]],52:[[0,0,4,0],[1,0,2,0],[5,1,2,72],[5,1,2,72]],53:[[8,0,0,0]],
};
/** o_boxingqueen user6: build this round's list, then advance the pattern for the next list. */
export function planGigaAttacks(s:GmInstance,rt:GmRuntime,object:(name:string)=>GmObjectDef){
 const require=(name:string)=>{const i=rt.first(object(name));if(!i)throw Error(`GIGA pattern planning requires ${name}`);return i;},c=require('o_boxingcontroller'),hud=require('o_boxinghud'),enemy=()=>require('obj_gigaqueen_enemy');
 s.attackcount=0;s.attackcountmax=0;s.useattacklist=1;if(s.attackorderlooping===1&&s.pacifist===1)s.attackorderloopingturn++;
 if(c.wireframe_boxing===1){if(ge(s.health_count,s.health_count_max*0.75))s.attackpattern=50;if(lt(s.health_count,s.health_count_max*0.75))s.attackpattern=51;if(lt(s.health_count,s.health_count_max*0.5))s.attackpattern=52;if(lt(s.health_count,s.health_count_max*0.25))s.attackpattern=53;}
 if(hud.sub_healthbar_count===0&&c.wireframe_boxing===0){if(s.finalbaseballused>0)s.attackpattern=100;else if(le(s.health_count,s.health_count_max*0.27)){s.attackpattern=99;s.finalbaseballused=1;}enemy().breathattack=0;enemy().missleattack=0;}
 const plan=PLANS[s.attackpattern];if(plan){for(const row of plan)appendGigaAttack(s,...row);let duration=400;if(s.attackpattern===100||s.attackpattern===99)duration=1000;if(s.attackpattern===21||s.attackpattern===16||s.attackpattern===15)duration=500;if(s.attackpattern===17)duration=300;if(eq(s.attackpattern,1.4))duration=270;for(const controller of rt.withInstances(object('o_boxingcontroller')))controller.boxingtimer=duration;}
 if(s.attackpattern===20){s.rand=rt.random.irandom(30);if(s.rand<10)appendGigaAttack(s,1,3,0,0);if(s.rand>=10&&s.rand<20){appendGigaAttack(s,0,0,1,0);appendGigaAttack(s,0,0,1,0);appendGigaAttack(s,0,0,1,0);}if(s.rand>=20)appendGigaAttack(s,2,2,2,0);
  for(let repeat=0;repeat<3;repeat++){s.rand=rt.random.irandom(40);if(s.rand<10)appendGigaAttack(s,1,0,2,0);if(s.rand>=10&&s.rand<20)appendGigaAttack(s,0,0,1,0);if(s.rand>=20&&s.rand<30)appendGigaAttack(s,2,0,2,0);if(s.rand>=30){appendGigaAttack(s,0,0,1,0);appendGigaAttack(s,0,0,1,0);}}
  for(const controller of rt.withInstances(object('o_boxingcontroller')))controller.boxingtimer=400;
 }
 if(c.wireframe_boxing!==0)return;
 if(hud.sub_healthbar_count===2){if(s.attackpattern===0)s.attackpattern=1;else if(s.attackpattern===1)s.attackpattern=1.4;else if(eq(s.attackpattern,1.4)){s.attackpattern=1.8;s.usedbaseball=1;}else if(eq(s.attackpattern,1.8)){s.attackpattern=1.4;s.pattern_state=1;}}
 if(hud.sub_healthbar_count===1){if(s.pattern_state===0){if(s.attackpattern<2)s.attackpattern=2;else if(s.attackpattern===2)s.attackpattern=3;else if(s.attackpattern===3)s.attackpattern=3.5;else if(eq(s.attackpattern,3.5)){s.attackpattern=4;enemy().missleattack=1;}else if(s.attackpattern===4)s.attackpattern=5;else if(s.attackpattern===5&&ge(s.health_count,s.health_count_max*0.5)){s.attackpattern=6;s.pattern_state=1;}else if(s.attackpattern===5&&lt(s.health_count,s.health_count_max*0.5)){s.attackpattern=7;s.pattern_state=1;s.has_boss_done_pattern7=1;}}
  else{if((s.attackpattern===6&&s.pattern_state===1)||(s.attackpattern===7&&s.pattern_state===1))s.attackpattern=4;else if(s.attackpattern===4)s.attackpattern=5;else if(s.attackpattern===5)s.attackpattern=3.5;else if(eq(s.attackpattern,3.5))s.attackpattern=6;else if(s.attackpattern===6)s.attackpattern=7;else if(s.attackpattern===7){s.attackpattern=4;enemy().missleattack=1;}s.pattern_state=2;}}
 if(hud.sub_healthbar_count===0&&c.beat_phase2_no_damage_taken===0){if(s.attackpattern===15)s.attackpattern=10;else if(s.attackpattern===10&&s.has_boss_done_pattern7===0){s.attackpattern=7;s.has_boss_done_pattern7=1;enemy().breathattack=1;}else if(s.attackpattern===10){s.attackpattern=12;enemy().breathattack=1;}else if(s.attackpattern===7||s.attackpattern===12)s.attackpattern=11;else if(s.attackpattern===11)s.attackpattern=8;else if(s.attackpattern===8)s.attackpattern=13;else if(s.attackpattern===13)s.attackpattern=16;else if(s.attackpattern===16){s.attackpattern=10;s.pattern_state=1;}}
 if(hud.sub_healthbar_count===0&&c.beat_phase2_no_damage_taken===1){if(s.pattern_state===0){if(s.attackpattern===21){s.attackpattern=18;if(!rt.exists(object('obj_boxingqueen_aura')))rt.create(object('obj_boxingqueen_aura'),s.x,s.y);}else if(s.attackpattern===18){s.attackpattern=22;c.phase3_hit_check=1;}else if(s.attackpattern===22)s.attackpattern=19;else if(s.attackpattern===19){s.attackpattern=14;s.pattern_state=1;c.phase3_hit_check=1;}}
  else if(s.attackpattern===14&&s.pattern_state===1){s.attackpattern=20;s.pattern_state=2;}else if(s.attackpattern===20&&s.pattern_state===2){s.attackpattern=21;c.phase3_hit_check=1;}else if(s.attackpattern===21){s.attackpattern=20;s.pattern_state=3;}else if(s.attackpattern===20&&s.pattern_state===3){s.attackpattern=22;c.phase3_hit_check=1;}else if(s.attackpattern===22){s.attackpattern=20;s.pattern_state=4;}else if(s.attackpattern===20&&s.pattern_state===4){s.attackpattern=14;s.pattern_state=1;c.phase3_hit_check=1;}}
}
