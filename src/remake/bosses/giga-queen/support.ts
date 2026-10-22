import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {C,mergeColor} from '../../gm/graphics';
import {ge,gt,le,lt} from '../../gm/math';
import {tensionHeal} from '../../deltarune/battle';
import {resetGigaAttackList} from './plans';
import {createGigaProjectiles} from './projectiles';
import {createGigaSoulProjectiles} from './projectiles-soul';
import {createGigaVisuals} from './support-visuals';
import {sourceText} from '../../host/text';
type Lookup=(name:string)=>GmObjectDef;
export function createGigaSupport(object:Lookup):GmObjectDef[]{
 const req=(rt:GmRuntime,n:string)=>{const a=rt.first(object(n));if(!a)throw Error(`GIGA support requires ${n}`);return a;},c=(rt:GmRuntime)=>req(rt,'o_boxingcontroller'),q=(rt:GmRuntime)=>req(rt,'o_boxingqueen');
 const out:GmObjectDef[]=[];
 const add=(name:string,index:number,sprite:string|undefined,events:GmObjectDef['events'],extra:Partial<GmObjectDef>={})=>{const def={name,index,sprite,events,...extra};out.push(def);return def;};
 add('o_boxing_hitbox',781,'spr_boxing_hitbox',{
  create:s=>Object.assign(s,{f:2,imageAlpha:0.8,timer:2,damage:10,give_invincibility:18,give_hurt:22,hit_dodging:0,hit_ducking:0,hit_jumping:1,hit_direction:0,grazed:0,graze_points:5,graze_time:1,graze_only:0,final_attack:0,baseball:0,kick:0,has_tutorial_kick_hit_player:0,maker_id:-1,tpgain:10}),
  step:(s,rt)=>{s.timer--;if(le(s.timer,0)){rt.destroy(s);if(s.kick===1&&c(rt).wireframe_boxing===1&&s.has_tutorial_kick_hit_player===0&&c(rt).succeeded_kick_tutorial===0){c(rt).failed_kick_tutorial_counter=1;c(rt).succeeded_kick_tutorial=1;}}s.imageBlend=C.red;if(s.hit_dodging===1)s.imageBlend=C.green;if(s.hit_ducking===0)s.imageBlend=C.aqua;if(s.hit_jumping===0)s.imageBlend=C.yellow;if(s.graze_only===1)s.imageBlend=C.gray;},
 },{visible:false});
 add('o_boxingcontroller_fist_hitbox',792,'spr_bghero_fist_hitbox',{create:s=>{s.timer=0;s.depth=-999999;s.imageBlend=C.red;s.imageAlpha=0;},step:(s,rt)=>{s.timer++;s.x=c(rt).x;s.y=c(rt).y;if(s.timer===8)rt.destroy(s);if(c(rt).sprite==='spr_bhero'&&c(rt).imageIndex===7)rt.destroy(s);}});
 const graze=add('o_boxinggraze',846,'spr_bhero_graze',{
  create:s=>{s.imageXscale=2;s.imageYscale=2;s.imageAlpha=0;s.imageIndex=0;s.imageSpeed=0;s.confirm=0;s.arcade=0;s.tpgain=0;},
  alarm0:(s,rt)=>{if(s.tpgain!==0)tensionHeal(rt,s.tpgain);s.tpgain=0;},
  step:(s,rt)=>{const a=c(rt);if(a.dead===1){s.visible=false;s.confirm=0;return;}s.visible=true;s.x=a.x;s.y=a.y;if(s.confirm===2){if(a.hurttimer===0){rt.sound?.(s.arcade?'snd_graze_bc':'snd_graze');s.imageAlpha=1;}s.confirm=0;}if(s.confirm===1)s.confirm=2;if(ge(s.imageAlpha,0))s.imageAlpha-=0.25;},
  draw:(s,rt)=>{let x=-5,y=-5;const a=rt.first(object('o_boxingcontroller'));if(a?.sprite==='spr_bhero'){if(a.imageIndex===4){x=a.drawflip===0?22:-22;y=-5;}if(a.imageIndex===6){x=-12;y=2;}}rt.drawSprite(s.sprite,s.imageIndex,s.x+x,s.y+y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);},
 });
 graze.collisions=[{target:object('o_boxing_hitbox'),run:(s,b,rt)=>{const a=c(rt);if(a.dead===1)return;if(a.invincible===0&&s.confirm===0&&a.wireframe_boxing===0&&b.grazed===0){b.grazed=1;s.confirm=1;s.tpgain=b.tpgain;s.alarm[0]=2;for(const cc of rt.withInstances(object('o_boxingcontroller')))cc.boxingtimer-=4;}}}];
 add('o_boxingflame',821,'spr_bhero_flame',{
  create:(s,rt)=>{s.imageAngle=rt.random.random(360);s.image_rotation=rt.random.choose(4,-4,6,-6);s.imageXscale=2;s.imageYscale=2;s.imageAlpha=0.5;s.depth=-5;const a=rt.first(object('o_boxingcontroller'));if(a)s.depth=a.depth-1;s.dustmode=0;s.con=0;s.timer=0;},
  draw:(s,rt)=>{if(rt.exists(object('o_coaster_hero'))){s.timer++;if(lt(s.timer,3))return;}rt.drawSelf(s);},
  step:(s,rt)=>{s.imageXscale-=0.1;s.imageYscale-=0.1;if(le(s.imageXscale,0))rt.destroy(s);s.imageAngle+=s.image_rotation;if(s.dustmode===0)s.imageBlend=mergeColor(C.red,C.yellow,s.imageXscale/2);},
 });
 for(const [name,index,sprite,last,speed] of [['o_boxing_splash',823,'spr_boxing_splash',4,0.25],['obj_boxing_smoke',836,'spr_boxing_smoke',2,0.5],['obj_boxing_crescent',837,'spr_boxing_crescent',3,0.5]] as const)add(name,index,sprite,{create:s=>{s.imageSpeed=speed;s.imageXscale=2;s.imageYscale=2;s.timer=0;},step:(s,rt)=>{if(ge(s.imageIndex,last))rt.destroy(s);}});
 const align=(s:GmInstance,rt:GmRuntime)=>{const a=q(rt);s.x=a.x+(a.drawflip===0?-18:18);s.y=a.y-128;};
 add('obj_boxing_block_star',839,'spr_boxing_dizzystar',{create:(s,rt)=>{s.imageXscale=2;s.imageYscale=2;s.speed=6;s.timer=0;if(rt.exists(object('o_boxingqueen'))){s.depth=q(rt).depth-2;align(s,rt);}},endStep:(s,rt)=>{s.timer++;if(gt(s.speed,0))s.speed-=0.4;if(gt(s.timer,16))rt.destroy(s);if(rt.exists(object('o_boxingqueen'))&&s.timer===1)align(s,rt);}});
 add('obj_boxing_wine_shield',840,'spr_bqueen_block_fx',{create:(s,rt)=>{s.imageAlpha=1.2;s.imageXscale=1.8;s.imageYscale=1.8;s.state=0;s.depth=q(rt).depth-2;align(s,rt);},step:(s,rt)=>{s.imageAlpha-=0.1;s.imageXscale+=0.2;s.imageYscale+=0.2;if(lt(s.imageAlpha,0))rt.destroy(s);s.x=q(rt).x+(q(rt).drawflip===0?-18:18);}});
 add('obj_boxing_closing_block_dust',811,'spr_dust1',{create:(s,rt)=>{s.sprite=rt.random.choose('spr_dust1','spr_dust2');s.imageSpeed=0.4+rt.random.random(-0.1);s.imageXscale=rt.random.randomRange(0.5,1)*rt.random.choose(-1,1);s.imageYscale=s.imageXscale*rt.random.choose(-1,1);s.direction=90+rt.random.randomRange(-45,15);s.speed=rt.random.randomRange(0.1,1.5);s.imageAngle=rt.random.random(360);s.imageAlpha=rt.random.random(0.9)+0.1;s.scalerX=rt.random.random(0.03)*s.imageXscale;s.scalerY=rt.random.random(0.03)*s.imageYscale;s.depth=-1000;},step:s=>{s.speed*=0.99;s.imageXscale+=s.scalerX;s.imageYscale+=s.scalerY;},animationEnd:(s,rt)=>rt.destroy(s)});
 add('obj_boxing_hit_fx',838,'spr_boxing_bhero_hurt_fx',{
  create:(s,rt)=>{s.imageXscale=2;s.imageYscale=2;s.imageSpeed=0;s.timer=0;s.spin=0;s.imageIndex=rt.random.irandom(8);s.depth=c(rt).depth-3;s.speed=12;s.gravity=1;},
  user0:(s,rt)=>{const a=c(rt);if(a.drawflip===1){s.direction=155-rt.random.irandom(50);s.x=a.x+20-rt.random.irandom(40);s.y=a.y-80-rt.random.irandom(40);}else{s.direction=25+rt.random.irandom(50);s.x=a.x-20+rt.random.irandom(40);s.y=a.y-80-rt.random.irandom(40);}},
  user1:(s,rt)=>{const a=c(rt);s.sprite='spr_boxing_bqueen_hurt_fx';if(a.drawflip===1){s.direction=155-rt.random.irandom(50);s.y=a.y-169;s.x=a.x;s.spin=-1;}else{s.direction=25+rt.random.irandom(50);s.y=a.y-169;s.x=a.x;s.spin=1;}s.imageAngle=s.direction;},
  step:(s,rt)=>{s.timer++;if(s.spin===-1)s.imageAngle-=4;if(s.spin===1)s.imageAngle+=4;if(gt(s.timer,11)){s.imageAlpha-=0.1;if(lt(s.imageAlpha,0))rt.destroy(s);}},
 });
 for(const [name,index,img,indexImg,end] of [['obj_boxingqueen_aura',834,'o_boxingqueen_aura_image',843,'endStep'],['o_boxingqueen_aura',844,'obj_boxingqueen_aura_image',835,'step']] as const){
  add(name,index,undefined,{create:s=>{s.refresh=1;s.actor=794;s.alarm[1]=s.refresh;s.blend=0x808000;s.sine=0;s.freq=0.4;},alarm1:(s,rt)=>{for(const a of rt.withInstances(object('o_boxingqueen')))if(a.visible){const b=rt.create(object(img),a.x,a.y);b.sprite=a.sprite;b.imageIndex=a.imageIndex;if(!a.visible)b.sprite=null;if(q(rt).drawflip===0)b.imageXscale=2;if(q(rt).drawflip===1)b.imageXscale=-2;b.imageYscale=2;b.vspeed=-0.5;b.imageBlend=s.blend;}s.alarm[1]=s.refresh;},endStep:(s,rt)=>{s.x=q(rt).x;s.y=q(rt).y;}});
  add(img,indexImg,undefined,{create:(s,rt)=>{s.imageSpeed=0;s.imageAlpha=0.4+rt.random.random(0.25);s.depth=q(rt).depth+1;},[end]:(s:GmInstance,rt:GmRuntime)=>{s.imageAlpha-=0.025;if(lt(s.imageAlpha,0))rt.destroy(s);},draw:(s,rt)=>{rt.drawBlendMode('add');rt.drawSelf(s);rt.drawBlendMode('normal');}});
 }
 add('obj_boxingqueen_black_bg',819,'spr_pixel_white',{create:s=>{s.depth=1002;s.imageXscale=9999;s.imageYscale=9999;s.imageBlend=C.black;}});
 add('o_boxing_black_battle_bg',850,undefined,{create:s=>{s.imageAlpha=0;},draw:(s,rt)=>{if(rt.globals.boxingphase!==2&&gt(s.imageAlpha,0))s.imageAlpha-=0.05;if(rt.globals.boxingphase===2&&lt(s.imageAlpha,0.5))s.imageAlpha+=0.05;rt.drawState.alpha=s.imageAlpha;rt.drawState.color=C.black;rt.drawRect(0,-2000,2000,2000);rt.drawState.alpha=1;}});
 add('o_bq_screen_flash',824,'spr_whitepx',{create:s=>{s.state=0;s.imageAlpha=1;s.imageYscale=4000;s.imageXscale=640;s.x=0;s.y=-2000;s.depth=-999;},step:(s,rt)=>{s.state++;if(s.state===3)rt.destroy(s);}});
 add('o_bq_whitefade',828,'spr_whitepx',{create:(s,rt)=>{s.state=0;s.imageAlpha=0;s.imageYscale=4000;s.imageXscale=640;s.x=0;s.y=-2000;s.depth=q(rt).depth-10;s.dont_fade_out=0;},step:(s,rt)=>{if(s.state===0){s.imageAlpha+=0.03;if(gt(s.imageAlpha,1.2)){s.imageAlpha=2;s.state=1;q(rt).x=q(rt).basex;q(rt).y=q(rt).basey;if(rt.exists(object('obj_bq_baseball_final_hits_boss'))){rt.sound?.('snd_explosion');for(const a of rt.withInstances(object('obj_bq_baseball_final_hits_boss')))rt.destroy(a);rt.view.y=0;q(rt).sprite='spr_bqueen';q(rt).imageIndex=26;}}}if(s.state===1&&s.dont_fade_out===0){s.imageAlpha-=0.02;if(lt(s.imageAlpha,0))rt.destroy(s);}}});
 add('o_bq_whitefade_persistent',829,'spr_whitepx',{create:s=>{s.imageAlpha=1;s.imageYscale=4000;s.imageXscale=640;s.x=0;s.y=-2000;s.depth=-1000;},step:(s,rt)=>{s.imageAlpha-=0.02;if(lt(s.imageAlpha,0))rt.destroy(s);}});
 add('obj_rocketpunch_afterimage',801,'spr_queen_rocket_fist',{create:s=>{s.imageXscale=2.1;s.imageYscale=2.1;s.depth=-19;s.imageSpeed=0;s.imageIndex=1;s.imageAlpha=1;s.hspeed=-3;s.vspeed=-3;s.friction=0.5;},step:(s,rt)=>{s.imageAlpha-=0.178;if(lt(s.imageAlpha,0))rt.destroy(s);}});
 add('obj_boxingqueen_rocket_punch_idle',802,'spr_queen_rocket_fist',{create:(s,rt)=>{s.state=0;s.timer=0;s.depth=q(rt).depth-3;s.imageXscale=2;s.imageYscale=2;s.imageSpeed=0;},step:(s,rt)=>{s.timer++;if(s.timer===5){s.timer=0;if(lt(s.y,-420)){const a=rt.create(object('obj_rocketpunch_afterimage'),s.x,s.y);s.gas=a.id;a.depth=q(rt).depth-2;}}},endStep:(s,rt)=>{s.x=q(rt).x-8;s.y=q(rt).y-132;},draw:(s,rt)=>{rt.drawSelf(s);rt.drawSprite(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,C.red,q(rt).final_sequence_red_alpha);}});
 add('o_boxinghud',847,undefined,{create:(s,rt)=>{s.depth=-5;s.topyy=50;s.bottomyy=160;s.sub_healthbar_count=2;s.healthbar_flash=0;s.hide_ui=0;s.hide_ui_quick=0;if(c(rt).wireframe_boxing===1)s.sub_healthbar_count=0;s.arcade=0;},draw:(s,rt)=>drawHud(s,rt,object)});
 return [...out,...createGigaProjectiles(object),...createGigaSoulProjectiles(object),...createGigaVisuals(object)];
}
function drawHud(s:GmInstance,rt:GmRuntime,object:Lookup){
 const req=(n:string)=>{const a=rt.first(object(n));if(!a)throw Error(`GIGA HUD requires ${n}`);return a;},c=req('o_boxingcontroller'),q=req('o_boxingqueen'),g=rt.globals;
 if(s.hide_ui===1){if(ge(s.topyy,-800)){s.topyy*=1.1;s.topyy-=50;if(le(s.topyy,-800))s.topyy=-800;}}
 else if(s.hide_ui===2){if(ge(s.topyy,-800)){s.topyy*=0.95;s.topyy+=23;if(ge(s.topyy,50)){s.hide_ui=0;s.topyy=50;}}}
 else if(g.boxingphase===0||g.boxingphase===3||gt(q.phase_transition,0)){if(ge(s.topyy,0)){s.topyy*=0.8;s.topyy--;if(le(s.topyy,0))s.topyy=0;}if(lt(s.bottomyy,160)){s.bottomyy++;s.bottomyy*=1.2;if(ge(s.bottomyy,160))s.bottomyy=160;}}
 else if(g.boxingphase===1||g.boxingphase===2){if(le(s.topyy,50)){s.topyy*=1.2;s.topyy+=4;if(ge(s.topyy,50))s.topyy=50;}if(gt(s.bottomyy,60)){s.bottomyy--;s.bottomyy*=0.8;if(le(s.bottomyy,60))s.bottomyy=60;}}
 if(s.hide_ui_quick===1||rt.exists(object('obj_thrash_intro'))||rt.exists(object('obj_thrash_transformation_transition')))return;
 if(s.sub_healthbar_count===0&&lt(q.health_count,1)&&c.wireframe_boxing===0){q.health_count=1;if(q.attackpattern!==99)resetGigaAttackList(q);}
 if(!(gt(c.health_count,0)&&s.sub_healthbar_count!==-1&&q.sprite!=='spr_bqueen_defeated'))return;
 const ratio=s.sub_healthbar_count===0?4.5:3.75,bar=(amount:number,color:number,alpha=1)=>{rt.drawState.color=color;rt.drawState.alpha=alpha;rt.drawRect(120,-30+s.topyy,120+amount/ratio,-20+s.topyy);};
 rt.drawState.color=C.white;rt.drawText(50,-31+s.topyy,sourceText('o_boxinghud_slash_Draw_0_gml_66_0'));rt.drawState.color=C.black;rt.drawRect(118,-32+s.topyy,122+q.health_count_max/ratio,-18+s.topyy);s.col=mergeColor(C.red,C.black,0.85);bar(q.health_count_max,s.col);bar(q.health_count_prev,C.red);bar(q.health_count,C.lime);bar(q.health_count,C.white,s.healthbar_flash/100);s.healthbar_flash-=10;rt.drawState.alpha=1;
 q.health_count_prev_timer--;if(lt(q.health_count_prev_timer,1)&&gt(q.health_count_prev,q.health_count)){q.health_count_prev-=8;if(lt(q.health_count_prev,q.health_count))q.health_count_prev=q.health_count;}
 if(lt(q.health_count,1)){s.sub_healthbar_count--;if(s.sub_healthbar_count===-1){if(c.wireframe_boxing===0)q.health_count=0;if(c.wireframe_boxing===1)q.phase_transition=1;}
  else{for(const name of ['snd_squeaky','snd_punchheavythunder','snd_ultraswing','punch_ish_1','snd_criticalswing'])if(rt.sourceAudio?.playing(name))rt.soundStop?.(name);rt.sound?.('snd_scytheburst');if(s.sub_healthbar_count===0)q.health_count_max=1800;q.health_count=q.health_count_max;q.health_count_prev=q.health_count_max;q.phase_transition=1;q.state=1;q.combo=0;q.times_hit_in_a_row=0;q.pattern_state=0;if(c.beat_phase1_no_damage_taken_check===0)g.flag[527]=1;if(c.beat_phase2_no_damage_taken_check===0&&s.sub_healthbar_count===0)c.beat_phase2_no_damage_taken=1;
   const enemy=req('obj_gigaqueen_enemy');if(s.sub_healthbar_count===1){resetGigaAttackList(q);q.attackpattern=2;if(q.usedbaseball===0){q.attackpattern=1.4;q.usedbaseball=1;}enemy.recentphasetransition=2;}if(s.sub_healthbar_count===0){resetGigaAttackList(q);q.attackpattern=c.beat_phase2_no_damage_taken===0?15:21;if(c.beat_phase2_no_damage_taken===1)c.phase3_hit_check=1;enemy.recentphasetransition=3;}rt.create(object('obj_bq_fist_flash'),c.x,s.y);req('obj_bq_fist_flash').rep=3;
  }
 }
 const pip=(x:number,black:boolean)=>{const name=black?'spr_sub_healthbar_black':'spr_sub_healthbar';rt.drawSprite(name,0,x,s.topyy-7,s.imageXscale*1.2,s.imageYscale*1.2,0,C.black,1);rt.drawSprite(name,0,x,s.topyy-7,s.imageXscale,s.imageYscale,0,C.white,1);};
 if(s.sub_healthbar_count===2)pip(140,false);if(ge(s.sub_healthbar_count,1))pip(125,false);if(le(s.sub_healthbar_count,1))pip(140,true);if(s.sub_healthbar_count===0)pip(125,true);
}
