import type {GmObjectDef} from '../../gm/runtime';
import type {BattleHooks} from '../../deltarune/rules';
import type {HammerAttackHost} from './attack-families';
import {round} from '../../gm/math';
import {sourceText} from '../../host/text';
/** Source encounter branches in shared hero/controller scripts belong to this encounter. */
export function hammerHooks(object:(name:string)=>GmObjectDef,host:HammerAttackHost):BattleHooks{return {
 defeatedByDamage:false,takesImmediateItem:()=>true,suppressesRudeBusterFlash:true,
 scoringOutcome:s=>s.endcon>=1?'victory':undefined,
 canSkipEndingText:s=>s.endcon>=1,
 soulEntry:(_s,rt)=>{const h=rt.first(object('obj_herosusie'));if(!h)throw Error('Hammer soul entry requires Susie');return [h.x-250,h.y+40];},
 soulReturnsTo:(_s,rt)=>{const h=rt.first(object('obj_herosusie'));if(!h)throw Error('Hammer soul return requires Susie');return [h.x-150,h.y+40];},
 onControllerCreate:(_s,c)=>{c.questionmercy[0]=1;},
 blocksControllerStep:(s)=>!(s.endcon===5&&s.endtimer>=105)&&s.end_cutscene_version===1&&((s.endcon>0&&s.endtimer>0)||s.endcon>1),
 onPartyHit:s=>{s.gothitlastturn++;},
 prepareContactDamageText:(_s,b)=>{if(b.tdamage<5)b.tdamage=5;if(b.hpdiff<5)b.hpdiff=5;},
 takesFightBar:(s,bar,rt)=>{bar.points[0]=0;Object.assign(s,{state:13,sprite:'spr_gerson_teleport',imageXscale:3,imageYscale:3,imageSpeed:1});s.x+=40;s.y+=30;host.call(s,'snd_play_pitch','motor_swing_down',1.4);return false;},
 onHeroAttackStart:s=>{s.haveattacked=true;},
 onHeroItemAnimation:(_s,_hero,rt)=>{const h=rt.first(object('obj_heroparent'))!;rt.create(object('obj_gerson_item_throw'),h.x+63,h.y+60);},
 modifyFightHeal:()=>({target:0,amount:2}),
 beforeCastSpell:(s,_hero,rt,spell)=>{if([4,5,11,100].includes(spell))return false;if(s.justice_item<1)s.justice_item++;rt.globals.spelldelay=300;return true;},
 onSpellCast:(s,_hero,_rt,spell)=>{if(spell===4&&s.justice_rudebuster<1)s.justice_rudebuster++;},
 modifyHealSpell:(_s,h,rt,spell,amount)=>spell===11?rt.globals.battlemag[h.caster]*2+22+2*rt.globals.flag[1045]:amount,
 afterHealSpell:(s,_h,rt,spell)=>{if(spell!==11)return;if(s.justice_healed<1)s.justice_healed++;s.progress+=9;s.mercylaughcon=1;s.mercylaughcount=9;if(s.susieusedultimateheal===0)s.susieusedultimateheal=1;rt.globals.spelldelay=70;},
 afterSpellText:(_s,_h,rt,spell)=>{if(spell<200)return;const g=rt.globals,insert=[203,204,217].includes(spell)?1:2,index=g.msg[0].length-insert-1;g.msg[0]=g.msg[0].slice(0,index)+sourceText('scr_spelltext_slash_scr_spelltext_gml_351_0')+g.msg[0].slice(index);g.msg[1]=sourceText('scr_spelltext_slash_scr_spelltext_gml_383_0');},
 onRudeBusterCreate:(s,b)=>{if(s.rudebusterhitcount!==s.rudebusterhitcountmax)b.speedmax=6;b.gersonoffset=-10;b.x+=20;b.y-=20;},
 aimsRudeBuster:(_s,rt,b)=>{const target=rt.byId(host.call(b,'instance_find',b.target,0))!;b.targetx=200+target.x+rt.spriteWidth(target)/2;b.targety=target.y+rt.spriteHeight(target)/2;return true;},
 onRudeBusterFlightStart:(s,b,rt)=>{if(s.rudebusterhitcount===s.rudebusterhitcountmax){b.friction=-5;const t=rt.byId(host.call(b,'instance_find',b.target,0))!;b.targety=t.y-60+rt.spriteHeight(t)/2;}},
 onRudeBusterStep:(s,b,rt)=>{if(s.rudebusterhitcount>=s.rudebusterhitcountmax||b.explode!==0)return;b.gersonswingtimer++;
  if(b.gersonswingtimer===10){rt.setSpriteOffset('spr_gerson_smash_stop',25,40);Object.assign(s,{sprite:'spr_gerson_smash_stop',imageIndex:0,state:10});rt.globals.spelldelay+=40;}
  if(b.gersonswingtimer===17){for(const a of rt.all(object('obj_afterimage')))rt.destroy(a);Object.assign(b,{speedmax:0,hurtflashalpha:1,speed:0,imageAlpha:1});host.call(b,'scr_shakeobj');rt.create(object('obj_shake'),b.x,b.y);host.call(b,'snd_play','snd_rudebuster_hit');}
 },
 onRudeBusterFlight:(s,b,rt)=>{const max=s.rudebusterhitcountmax;if(s.rudebusterhitcount<max)b.direction+=4;else{b.direction+=8;if(b.direction<10)b.direction=0;}
  if(s.state!==14&&s.rudebusterhitcount>=max&&b.x>rt.view.x+500){s.saverudebusterstarcount=round(b.damage/rt.globals.monstermaxhp[0]*100);s.state=14;s.spinxscale=1;s.spinspeed=3.05;host.call(s,'snd_play_pitch','snd_wallclaw',.7);rt.globals.spelldelay+=33;if(s.rudebusterhitcount===s.rudebusterhitcountmax&&s.rudebusterhitcountmax<3)s.rudebusterhitcountmax++;}
  if(b.x>rt.view.x+640)rt.destroy(b);return true;
 },
 onRudeBusterAfterimage:(s,_b,a)=>{if(s.rudebusterhitcount===s.rudebusterhitcountmax)a.fadeSpeed=.08;},
};}
