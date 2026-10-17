// The party side of a battle as Chapter 1 runs it: the heroes (obj_heroparent: poses in Draw, the FIGHT hit in
// Alarm 1, spells and items in Alarm 4), the FIGHT bar (obj_attackpress), the spell and item phase (obj_spellphase)
// and what spells do (scr_spell, scr_spelltext): healing, Pacify, Rude Buster, SPARE, items.
import {gmArray,type GmInstance,type GmObjectDef,type GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {f32,pointDirection,pointDistance,round} from '../gm/math';
import {afterImage,afterimage,dmgWriter,heroKris,heroParent,heroRalsei,heroSusie,heroNoelle,marker,mergeColor,monsterParent,shake,tensionHeal} from './battle';
import {recruitAnim} from './chapter2-enemy';
import {burstBolt,basicAttack} from './player-effects';
import {battleTextDefault,writer} from './writer';
import {optionalSourceText as lang,sourceText} from '../host/text';
import {attackPhase,button1_p,button2_p,button3_p,itemShift,mercyAdd,monsterDefeat,monsterPop,subst,winCombat} from './controller';
import {teaAmountChapter2,sideBPhase} from './chapter2';
import {forChapter,hooksOf,rules,withHook} from './rules';
import {castSleepMist,castIceShock} from './noelle-spells';

const destroyId=(rt:GmRuntime,id:number)=>{const i=rt.byId(id);if(i)rt.destroy(i);};
const isHero=(i:GmInstance,name:string)=>i.object.name===name;
/** scr_afterimage: a still copy of the instance that fades out. */
/** obj_oflash: a white silhouette of its target that pulses once. */
export const oflash:GmObjectDef={name:'obj_oflash',index:302,events:{
 create:s=>{s.flashspeed=1;s.siner=0;s.target=43843843;s.imageSpeed=0;s.flashcolor=C.white;},
 draw:(s,rt)=>{
  const t=rt.byId(s.target);
  if(t){
   s.imageIndex=t.imageIndex;s.sprite=t.sprite;
   const h=hooksOf(t);if(h.flashSprite)s.sprite=h.flashSprite(t);
   if(h.onFlash?.(t,s,rt))return;
  }
  s.siner+=s.flashspeed;
  if(s.sprite)rt.drawSpriteFog(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,s.flashcolor,Math.sin(s.siner/3));
  if(s.siner>4&&Math.sin(s.siner/3)<0)rt.destroy(s);
 },
}};
/** scr_oflash, run by the instance that flashes. */
export function oflashOf(s:GmInstance,rt:GmRuntime){
 const o=rt.create(oflash,s.x,s.y);s._oflash=o.id;o.imageXscale=s.imageXscale;o.imageSpeed=0;o.imageIndex=s.imageIndex;o.imageYscale=s.imageYscale;o.sprite=s.sprite;o.depth=s.depth-1;o.target=s.id;return o;
}

// ---- Heroes ----
const SPRITES:Record<string,Record<string,string>>={
 obj_herokris:{normal:'spr_krisr_dark',idle:'spr_krisb_idle',defend:'spr_krisb_defend',hurt:'spr_krisb_hurt',attackready:'spr_krisb_attackready',attack:'spr_krisb_attack',item:'spr_krisb_item',actready:'spr_krisb_actready',act:'spr_krisb_act',itemready:'spr_krisb_itemready',spellready:'spr_krisb_actready',spell:'spr_krisb_act',defeat:'spr_krisb_defeat',victory:'spr_krisb_victory'},
 obj_herosusie:{normal:'spr_susier_dark',idle:'spr_susieb_idle',defend:'spr_susieb_defend',hurt:'spr_susieb_hurt',actready:'spr_susieb_actready',act:'spr_susieb_act',attackready:'spr_susieb_attackready',attack:'spr_susieb_attack',item:'spr_susieb_item',itemready:'spr_susieb_itemready',spellready:'spr_susieb_spellready',spell:'spr_susieb_spell',defeat:'spr_susieb_defeat',victory:'spr_susieb_victory'},
 obj_heroralsei:{normal:'spr_ralseir',idle:'spr_ralseib_idle',defend:'spr_ralseib_defend',hurt:'spr_ralsei_shock',attackready:'spr_ralseib_attackready',attack:'spr_ralseib_attack',item:'spr_ralseib_item',itemready:'spr_ralseib_itemready',spellready:'spr_ralseib_spellready',spell:'spr_ralseib_spell',defeat:'spr_ralseib_defeat',victory:'spr_ralseib_victory',actready:'spr_ralseib_actready',act:'spr_ralseib_act'},
};
const FRAMES:Record<string,[number,number,number,number,number,number,number,number,number]>={
 // act, actreturn, attack, item, defend, spell, attackspeed, width, height
 obj_herokris:[7,10,6,6,5,10,0.5,68,74],obj_herosusie:[7,10,5,5,5,8,0.5,70,82],obj_heroralsei:[7,10,5,7,6,10,0.5,52,86],
};
// Chapter 2 obj_heroparent_Create_0: Kris/Susie are identical; Ralsei uses his hatless sprite set.
const RALSEI_CH2:Record<string,string>={normal:'spr_ralsei_walk_right',idle:'spr_ralsei_idle',defend:'spr_ralsei_defend',hurt:'spr_ralsei_hurt_fixed',attackready:'spr_ralsei_attackready',attack:'spr_ralsei_attack',item:'spr_ralsei_item',itemready:'spr_ralsei_itemready',spellready:'spr_ralsei_spellready',spell:'spr_ralsei_spell',defeat:'spr_ralsei_defeat',victory:'spr_ralsei_victory',actready:'spr_ralsei_actready',act:'spr_ralsei_act'};
const NOELLE_CH2:Record<string,string>={normal:'spr_noelle_walk_right_dw',idle:'spr_noelleb_idle',defend:'spr_noelleb_defend',hurt:'spr_noelleb_hurt',attackready:'spr_noelleb_attackready',attack:'spr_noelleb_attack',item:'spr_noelleb_item',itemready:'spr_noelleb_itemready',spellready:'spr_noelleb_spellready',spell:'spr_noelleb_spell',defeat:'spr_noelleb_defeat',victory:'spr_noelleb_victory',actready:'spr_noelleb_actready',act:'spr_noelleb_act'};
/** Each chapter's battle sprites and animation frame counts per hero. */
const HERO_LOOKS:Record<number,{sprites:Record<string,Record<string,string>>;frames:typeof FRAMES}>={
 1:{sprites:SPRITES,frames:FRAMES},
 2:{sprites:{...SPRITES,obj_heroralsei:RALSEI_CH2,obj_heronoelle:NOELLE_CH2},frames:{...FRAMES,obj_heroralsei:[8,12,6,6,7,10,0.5,52,86],obj_heronoelle:[7,11,4,9,0,6,0.5,52,86]}},
};
function heroCreate(s:GmInstance,rt:GmRuntime){
 Object.assign(s,{char:0,myself:0,points:0,becomeflash:0,state:0,flash:0,siner:0,fsiner:0,attacktimer:0,attacked:0,combatdarken:1,darkentimer:0,darkify:0,
  imageXscale:2,imageYscale:2,index:0,specdraw:0,is_auto_susie:0,victoryanim:0,hurt:0,hurttimer:0,hurtindex:0,acttimer:0,defendtimer:0,itemed:0,tu:0});
 if(rules(rt).heroesCanBePoisoned){s.poisonamount=0;s.poisontimer=0;}
 const looks=forChapter(rt,HERO_LOOKS,'obj_heroparent sprites');
 const sp=looks.sprites[s.object.name]??looks.sprites.obj_herokris,f=looks.frames[s.object.name]??looks.frames.obj_herokris;
 for(const [k,v] of Object.entries(sp))s[k+'sprite']=v;
 if(s.object.name==='obj_herosusie'&&rt.globals.charweapon?.[2]===0){s.idlesprite='spr_susieb_idle_unarmed';s.attackreadysprite='spr_susieb_attackready_unarmed';s.attacksprite='spr_susieb_attack_unarmed';}
 [s.actframes,s.actreturnframes,s.attackframes,s.itemframes,s.defendframes,s.spellframes,s.attackspeed,s.mywidth,s.myheight]=f;
 s.victoryframes=rt.bank.get(s.victorysprite)?.frames??1;
 if(s.object.name==='obj_heronoelle'){
  s._sideb=sideBPhase(rt)>=2?1:0;if(rt.globals.encounterno===73)s.idlesprite='spr_noelle_shocked_dw';
  if(s._sideb===1)Object.assign(s,{attackreadysprite:'spr_noelleb_idle',attacksprite:'spr_noelleb_spell',attackframes:6,victorysprite:'spr_noelleb_pray',victoryframes:10,defendframes:5,defendsprite:'spr_noelleb_defend_sideb',hurtsprite:'spr_noelleb_hurt_sideb',idlesprite:'spr_noelleb_idle_sideb'});
 }
 s.sprite=s.idlesprite;
}
function heroDraw(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 if(g.hp[g.char[me]]>0){
  if(g.myfight===3&&g.faceaction[me]===6)s.state=6;
  if(s.state===0&&s.hurt===0){
   s.acttimer=0;s.thissprite=s.idlesprite;
   if(g.faceaction[me]===1)s.thissprite=s.attackreadysprite;
   if(g.faceaction[me]===3)s.thissprite=s.itemreadysprite;
   if(g.faceaction[me]===2)s.thissprite=s.spellreadysprite;
   if(g.faceaction[me]===6)s.thissprite=s.actreadysprite;
   if(g.charcond[me]===5){s.thissprite=s.defeatsprite;g.faceaction[me]=9;}
   if(g.faceaction[me]===4){s.thissprite=s.defendsprite;s.index=s.defendtimer;if(s.defendtimer<s.defendframes)s.defendtimer+=0.5;}
   else{s.defendtimer=0;s.index=s.siner/5;}
   s.siner+=1;
  }
  if(s.state===1&&s.hurt===0){
   s.siner+=1;
   if(s.attacked===0){
    const pitch=isHero(s,'obj_heroralsei')?1.15:isHero(s,'obj_herosusie')?0.9:isHero(s,'obj_heronoelle')?1.5:1;
    rt.sound?.('snd_laz_c',pitch,true);
    if(s.points===150){
     rt.sound?.('snd_criticalswing',1,true);
     for(let i=0;i<3;i++){
      // instance_create(x + mywidth + random(50), y + 30 + random(30)): arguments evaluate right to left.
      const y=s.y+30+rt.random.random(30),x=s.x+s.mywidth+rt.random.random(50);
      const a=rt.create(afterimage,x,y);a.sprite='spr_lightfairy';a.imageSpeed=0.25;a.depth=-20;a.imageXscale=2;a.imageYscale=2;a.hspeed=2+rt.random.random(4);a.friction=-0.25;
     }
    }
    s.attacked=1;s.alarm[1]=10;
   }
   s.imageIndex=s.attacktimer<s.attackframes?s.attacktimer:s.attackframes;
   s.thissprite=s.attacksprite;s.index=s.imageIndex;s.attacktimer+=s.attackspeed;
  }
  if((s.state===2||s.state===4)&&s.hurt===0){
   s.siner+=1;
   if(s.itemed===0){s.itemed=1;s.alarm[4]=15;}
   const frames=s.state===2?s.spellframes:s.itemframes;
   s.imageIndex=s.attacktimer<frames?s.attacktimer:frames;
   if(monsterPop(rt)===0)s.attacktimer=0;
   s.thissprite=s.state===2?s.spellsprite:s.itemsprite;s.index=s.imageIndex;s.attacktimer+=0.5;
  }
  if(s.state===6){
   if(g.myfight===3){if(s.acttimer<s.actframes)s.acttimer+=0.5;}else s.acttimer+=0.5;
   s.thissprite=s.actsprite;s.index=s.acttimer;
   if(s.acttimer>=s.actreturnframes){s.acttimer=0;s.state=0;g.faceaction[me]=0;}
  }
  if(s.state===7){
   s.hurt=0;s.hurttimer=0;
   if(s.victoryanim<s.victoryframes){s.thissprite=s.victorysprite;s.index=s.victoryanim;s.victoryanim+=0.334;}
   else{s.thissprite=s.normalsprite;s.index=0;}
  }
  if(s.hurt===1){
   s.hurtindex=Math.min(2,s.hurttimer/2);
   if(g.charcond[me]===5){g.faceaction[me]=5;g.charmove[me]=1;g.charcond[me]=0;}
   if(g.faceaction[me]===0)g.faceaction[me]=5;
   s.specdraw=1;
   if(g.faceaction[me]!==4)rt.drawSprite(s.hurtsprite,s.hurtindex,s.x-20+s.hurtindex*10,s.y,2,2,0,s.imageBlend,s.imageAlpha);
   else{s.thissprite=s.defendsprite;s.index=s.defendtimer;rt.drawSprite(s.defendsprite,s.defendtimer,s.x-20+s.hurtindex*10,s.y,2,2,0,s.imageBlend,s.imageAlpha);}
   if(s.hurttimer>15){s.hurttimer=0;s.hurt=0;if(g.faceaction[me]===5)g.faceaction[me]=0;}
   s.hurttimer+=1;
  }
 }else{g.charcond[me]=0;s.hurttimer=0;s.hurt=0;s.thissprite=s.defeatsprite;s.index=0;s.siner+=1;}
 if(s.specdraw===0){
  s.sprite=s.thissprite;s.imageIndex=s.index;
  rt.drawSprite(s.thissprite,s.index,s.x,s.y,2,2,0,s.imageBlend,s.imageAlpha);
  if(s.flash===1){s.fsiner+=1;rt.drawSpriteFog(s.thissprite,s.index,s.x,s.y,2,2,0,C.white,-Math.cos(s.fsiner/5)*0.4+0.6);}
 }
 s.specdraw=0;
 if(s.becomeflash===0)s.flash=0;
 if(g.targeted[me]===1){if(g.mnfight===1)rt.drawSprite('spr_chartarget',s.siner/10,s.x,s.y,2,2,0,C.white,1);}
 else if(s.combatdarken===1&&rt.instances.some(i=>i.live&&i.object.name==='obj_darkener')){
  if(s.darkify===1){if(s.darkentimer<15)s.darkentimer+=1;s.imageBlend=mergeColor(C.white,C.black,s.darkentimer/30);}
 }
 if(s.darkify===0){if(s.darkentimer>0)s.darkentimer-=3;s.imageBlend=mergeColor(C.white,C.black,s.darkentimer/30);}
 s.becomeflash=0;
 // Poison takes 1 HP every 10 frames, down to 1.
 if(rules(rt).heroesCanBePoisoned&&s.poisonamount>0){
  s.poisontimer++;
  if(s.poisontimer>=10){if(g.hp[g.char[me]]>1){g.hp[g.char[me]]--;s.poisonamount--;}else s.poisonamount=0;s.poisontimer=0;}
 }
}
/** scr_retarget: if the chosen enemy is gone, the next one; cancelattack when none is left. */
function retarget(s:GmInstance,rt:GmRuntime,slot:number){
 const g=rt.globals;s.thistarget=g.chartarget[slot];s.cancelattack=0;
 if(s.thistarget===0&&g.monster[0]===0)s.thistarget=1;
 if(s.thistarget===1&&g.monster[1]===0)s.thistarget=2;
 // Only a third target that is gone wraps back to the first ones (or cancels the attack).
 if(s.thistarget===2){
  if(g.monster[2]===0)s.thistarget=3;
  if(s.thistarget===3&&g.monster[0]===1)s.thistarget=0;
  if(s.thistarget===3&&g.monster[1]===1)s.thistarget=1;
  if(s.thistarget===3)s.cancelattack=1;
 }
 g.chartarget[slot]=s.thistarget;
}
/** Whether damage at zero HP defeats the enemy there (an enemy in the battle may end it its own way). */
const defeatable=(rt:GmRuntime)=>!withHook(rt,'defeatedByDamage').some(([,d])=>d===false);
/** The slash effect each hero's hit leaves on the enemy (Kris: the plain cut). */
const HIT_EFFECTS:Record<string,{sprite:string;speed:number;sound?:string;shake?:boolean}>={
 obj_herosusie:{sprite:'spr_attack_mash2',speed:0.5,sound:'snd_impact',shake:true},
 obj_heroralsei:{sprite:'spr_attack_slap1',speed:0.5},
 obj_heronoelle:{sprite:'spr_attack_slap2',speed:0.5},
};
/** Alarm 1: the FIGHT hit lands, for the points the attack bar gave. Chapter differences and enemy-specific reactions
 * come from rules.ts at the points where the original has them. */
function heroHit(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.faceaction[me]=0;retarget(s,rt,me);
 if(s.cancelattack!==0)return;
 const t=g.chartarget[me],m=rt.byId(g.monsterinstance[t]);
 const dm=rt.create(dmgWriter,g.monsterx[t],g.monstery[t]-g.hittarget[t]*20+20);s.dm=dm.id;dm.type=s.char===4?6:s.char-1;dm.delay=8;
 let damage=round(g.battleat[me]*s.points/20-g.monsterdf[t]*3);
 if(g.monstertype[t]===19)damage=Math.ceil(damage*0.3);
 if(damage<0)damage=0;
 if(damage===0){dm.delay=2;if(m&&m.hurttimer<=15&&m.candodge===1){m.dodgetimer=0;m.state=4;}}
 s.damage=damage;dm.damage=damage;g.hittarget[t]+=1;
 const redirected=withHook(rt,'interceptFightDamage').some(([enemy,intercept])=>intercept(enemy,s,rt,t,damage,dm));
 if(!redirected)g.monsterhp[t]-=damage;
 if(s.is_auto_susie===1&&g.monsterhp[t]<=0&&m&&rules(rt).autoSusieMarksKill)g.flag[51+m.myself]=5;
 if(damage>0){
  tensionHeal(rt,round(s.points/(g.monstertype[0]===20?15:10)));
  const y=g.monstery[t]+rt.random.random(6),x=g.monsterx[t]+rt.random.random(6);
  const a=rt.create(basicAttack,x,y),fx=HIT_EFFECTS[s.object.name];s.attack=a.id;
  if(fx){a.sprite=fx.sprite;a.imageSpeed=fx.speed;a.maxindex=4;if(fx.sound)rt.sound?.(fx.sound);if(fx.shake)rt.create(shake,0,0);}
  if(s.points===150){a.imageXscale=2.5;a.imageYscale=2.5;}
  const ownImpact=withHook(rt,'onFightImpact').some(([enemy,impact])=>impact(enemy,s,a,rt,t,damage));
  if(!ownImpact){
   for(const [enemy,hit] of withHook(rt,'onHeroHit'))hit(enemy,rt);
   if(m){m.shakex=9;m.state=3;m.hurttimer=30;}
  }
  if(m)m.hurtamt=damage;
 }
 for(const [enemy,resolved] of withHook(rt,'onFightResolved'))resolved(enemy,s,rt,t,damage);
 if(g.monsterhp[t]<=0&&m&&defeatable(rt))monsterDefeat(m,rt);
}
/** Alarm 4: the spell or item takes effect. */
function heroSpell(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.faceaction[me]=0;if(monsterPop(rt)>0)castSpell(s,rt,g.charspecial[me],me);
 s.state=0;s.attacktimer=0;
}
const heroEvents={create:heroCreate,draw:heroDraw,alarm1:heroHit,alarm4:heroSpell};
export const HERO_DEFS:readonly GmObjectDef[]=[heroKris,heroSusie,heroRalsei,heroNoelle].map(base=>({...base,parent:base,events:heroEvents}));

// ---- Healing and damage helpers ----
// These scripts work in their caller's variables (scr_heal's hltarget, scr_damage_enemy's dm, a heal's ha and dmgwr on
// the healed hero), as in the original; the callers are passed in.
/** scr_revive. */
function revive(rt:GmRuntime,slot:number){const g=rt.globals;g.charmove[slot]=1;g.charcantarget[slot]=1;g.chardead[slot]=0;}
/** scr_heal, run by `caller`: heals a party slot (raising a downed member to a sixth of their HP); returns the HP gained. */
export function heal(caller:GmInstance,rt:GmRuntime,slot:number,amount:number){
 const g=rt.globals;
 caller.abovemaxhp=0;caller.belowzero=0;caller.hltarget=g.char[slot];caller._curhp=g.hp[caller.hltarget];
 const t=caller.hltarget;
 if(g.hp[t]<=0)caller.belowzero=1;
 if(g.hp[t]>g.maxhp[t])caller.abovemaxhp=1;
 if(caller.abovemaxhp===0){g.hp[t]+=amount;if(g.hp[t]>g.maxhp[t])g.hp[t]=g.maxhp[t];}
 if(caller.belowzero===1&&g.hp[t]>=0){if(g.hp[t]<Math.ceil(g.maxhp[t]/6))g.hp[t]=Math.ceil(g.maxhp[t]/6);revive(rt,slot);}
 rt.sound?.('snd_power',1,true);
 return g.hp[t]-caller._curhp;
}
/** scr_healall, run by `caller`: heals every party member. */
function healAll(caller:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals;for(caller.i=0;caller.i<3;caller.i+=1)if(g.char[caller.i]!==0)heal(caller,rt,caller.i,amount);
}
/** scr_dmgwriter_selfchar, run by a hero: the number above them, stacked by how many they got this turn. */
function selfWriter(h:GmInstance,rt:GmRuntime){return rt.create(dmgWriter,h.x,h.y+h.myheight-24-h.tu*20);}
/** The heal sparkles and green number on a hero, in the hero's variables (ha, dmgwr, tu). */
function healShow(h:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals,ha=rt.create(healAnim,h.x,h.y);h.ha=ha.id;ha.target=h.id;
 for(const [obj,shows] of withHook(rt,'showsHeals'))if(shows(obj,rt))ha.target=obj.id;
 const w=selfWriter(h,rt);h.dmgwr=w.id;w.delay=8;w.type=3;w.damage=amount;
 if(g.hp[g.char[h.myself]]>=g.maxhp[g.char[h.myself]])w.specialmessage=3;
 h.tu+=1;
 return ha;
}
/** scr_healitemspell, run by the caster: heals party slot `star`. */
export function healItem(s:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals;heal(s,rt,s.star,amount);g.spelldelay=15;
 const h=rt.byId(g.charinstance[s.star]);return h?healShow(h,rt,amount):undefined;
}
/** scr_healallitemspell, run by the caster. */
export function healAllItem(s:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals;healAll(s,rt,amount);
 for(s.i=0;s.i<3;s.i+=1){const h=rt.byId(g.charinstance[s.i]);if(h)healShow(h,rt,amount);}
 g.spelldelay=20;
}
/** scr_damage_enemy, run by the caster: damage number (kept in the caster's dm), recoil, and defeat at 0 HP. */
export function damageEnemy(s:GmInstance,rt:GmRuntime,enemy:number,amount:number){
 const g=rt.globals,m=rt.byId(g.monsterinstance[enemy]);
 const dm=rt.create(dmgWriter,g.monsterx[enemy],g.monstery[enemy]+20-g.hittarget[enemy]*20);s.dm=dm.id;
 // The damage number's colour: the caster's (Noelle's is 6), or 5 for a caster outside the party.
 if(s.caster<4)dm.type=g.char[s.caster]===4?6:g.char[s.caster]-1;
 if(s.caster===5)dm.type=5;
 dm.damage=amount;
 g.monsterhp[enemy]-=amount;
 if(amount>0&&m){m.shakex=9;m.state=3;m.hurttimer=30;m.hurtamt=amount;}
 g.hittarget[enemy]+=1;
 if(amount===0&&m){m.hurtamt=0;if(m.hurttimer<=15&&m.candodge===1){m.dodgetimer=0;m.state=4;}}
 if(g.monsterhp[enemy]<=0&&m&&defeatable(rt))monsterDefeat(m,rt);
}
/** scr_retarget_spell: if the chosen enemy is gone, the next one; cancelattack when none is left. */
function retargetSpell(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.cancelattack=0;
 if(s.star===0&&g.monster[0]===0)s.star=1;
 if(s.star===1&&g.monster[1]===0)s.star=2;
 // Only a third target that is gone wraps back to the first ones (or cancels).
 if(s.star===2){
  if(g.monster[2]===0)s.star=3;
  if(s.star===3&&g.monster[0]===1)s.star=0;
  if(s.star===3&&g.monster[1]===1)s.star=1;
  if(s.star===3)s.cancelattack=1;
 }
}

/** What scr_spell does differently per chapter. */
interface SpellRules{
 /** Monster types Pacify never puts to sleep (they handle it themselves: pacifycon). */
 readonly pacifyImmune:readonly number[];
 /** Chapter 2 draws the sleep effect over a pacified enemy (obj_pacifyspell, con 20), 60 pixels higher for type 33. */
 readonly pacifyEffect:boolean;
 /** Monster types that, spared at full mercy, end in their own code (sparecon). */
 readonly spareOwnEnding:readonly number[];
 /** Dual Heal's amount for the caster's magic. */
 dualHeal(magic:number):number;
 /** Spells only this chapter has. */
 readonly extra:Readonly<Record<number,(s:GmInstance,rt:GmRuntime)=>void>>;
}
const notPorted=(what:string)=>()=>{throw Error(`scr_spell: ${what} is not ported yet`);};
const SPELLS:Record<number,SpellRules>={
 1:{pacifyImmune:[19,3],pacifyEffect:false,spareOwnEnding:[3],dualHeal:m=>m*4,extra:{}},
 2:{pacifyImmune:[19,3,52,43],pacifyEffect:true,spareOwnEnding:[3,52],dualHeal:m=>Math.ceil(m*5.5),extra:{
  8:castSleepMist,9:(s,rt)=>castIceShock(s,rt,()=>retargetSpell(s,rt)),10:notPorted("Noelle's SnowGrave (10)"),
  // UltimatHeal: Susie's heal, magic + 1.
  11:(s,rt)=>{
   const g=rt.globals;s.healnum=g.battlemag[s.caster]+1;heal(s,rt,s.star,s.healnum);
   const h=rt.byId(g.charinstance[s.star]);if(h){h.healnum=s.healnum;healShow(h,rt,h.healnum);}
   g.spelldelay=15;
   for(const [obj,used] of withHook(rt,'onUltimatHeal'))used(obj,rt);
  },
 }},
};
/** Pacify on a tired enemy, as that enemy (scr_spell runs it in a with block). */
function pacified(m:GmInstance,s:GmInstance,rt:GmRuntime,r:SpellRules){
 const g=rt.globals,type=g.monstertype[m.myself];
 if(!r.pacifyImmune.includes(type)){
  if(r.pacifyEffect){
   const p=rt.create(pacifySpell,g.monsterx[m.myself],g.monstery[m.myself]+(type===33?-60:0));m._pspell=p.id;p.con=20;p.target=m.id;
  }
  g.flag[51+m.myself]=3;rt.userEvent(m,10);monsterDefeat(m,rt);
  return;
 }
 if(r.pacifyEffect&&(type===52||type===43))throw Error(`scr_spell: Pacify on monster type ${type} is not ported yet`);
 m.pacifycon=1;g.spelldelay=999;
}
/** scr_spell, run by the hero: what each spell, SPARE (100) and item (200 + id) does. The spell's values are the
 * hero's variables (spell, caster, star, damage, attack, healnum), as in the original. */
export function castSpell(s:GmInstance,rt:GmRuntime,spell:number,caster:number){
 const g=rt.globals,r=forChapter(rt,SPELLS,'scr_spell');
 s.spell=spell;s.caster=caster;s.star=g.chartarget[caster];g.spelldelay=10;
 const heroOf=(slot:number)=>rt.byId(g.charinstance[slot]);
 switch(spell){
  case 0:break;
  case 1:{
   s.cancelattack=0;if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(s.cancelattack===0){
    s.damage=Math.ceil(g.battleat[caster]*10-g.monsterdf[s.star]*3);if(g.automiss[s.star]===1)s.damage=0;
    damageEnemy(s,rt,s.star,s.damage);
    const y=g.monstery[s.star]+rt.random.random(6),x=g.monsterx[s.star]+rt.random.random(6);
    const a=rt.create(basicAttack,x,y);s.attack=a.id;a.sprite='spr_attack_mash1';
    rt.byId(s.dm)!.delay=8;
   }
   g.spelldelay=30;break;
  }
  case 2:{
   s.healnum=g.battlemag[caster]*5;heal(s,rt,s.star,s.healnum);
   const h=heroOf(s.star);if(h){h.healnum=s.healnum;healShow(h,rt,h.healnum);}
   g.spelldelay=15;break;
  }
  case 3:{
   if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(g.monster[s.star]===1){
    if(g.monsterstatus[s.star]===1){const m=rt.byId(g.monsterinstance[s.star]);if(m)pacified(m,s,rt,r);}
    else{
     // Chapter 2 reads the caster's own slot here (myself), not the enemy's.
     if(r.pacifyEffect&&g.monstertype[s.myself]===52)s.pacifycon=-2;
     const p=rt.create(pacifySpell,0,0);s._pspell=p.id;p.target=g.monsterinstance[s.star];p.fail=1;
    }
   }
   g.spelldelay=20;break;
  }
  case 4:case 5:{
   s.cancelattack=0;g.spelldelay=30;if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(s.cancelattack===0){
    g.spelldelay=70;
    s.damage=spell===4?Math.ceil(g.battlemag[caster]*5+g.battleat[caster]*11-g.monsterdf[s.star]*3):Math.ceil(g.battlemag[caster]*6+g.battleat[caster]*13-g.monsterdf[s.star]*6);
    if(g.automiss[s.star]===1)s.damage=0;
    const sus=rt.first(heroSusie)!;
    const a=rt.create(rudeBusterAnim,sus.x,sus.y);s.attack=a.id;a.damage=s.damage;a.star=s.star;a.caster=s.caster;a.target=g.monsterinstance[s.star];if(spell===5)a.red=1;
   }
   break;
  }
  case 6:{
   s.healnum=r.dualHeal(g.battlemag[caster]);
   for(s.i=0;s.i<3;s.i+=1){heal(s,rt,s.i,s.healnum);const h=heroOf(s.i);if(h){h.healnum=s.healnum;healShow(h,rt,h.healnum);}}
   g.spelldelay=15;break;
  }
  case 100:{
   if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(g.monster[s.star]===1){
    const m=rt.byId(g.monsterinstance[s.star]);
    if(g.mercymod[s.star]>=100){if(m){if(!r.spareOwnEnding.includes(g.monstertype[s.star])){g.flag[51+m.myself]=2;rt.userEvent(m,10);monsterDefeat(m,rt);}else m.sparecon=1;}}
    else{mercyAdd(s,rt,s.star,g.sparepoint[s.star]);const p=rt.create(pacifySpell,0,0);s._pspell=p.id;p.target=g.monsterinstance[s.star];p.fail=1;p.flashcolor=C.yellow;}
   }
   g.spelldelay=0;break;
  }
  default:
   if(r.extra[spell])r.extra[spell](s,rt);
   else if(spell>=201){forChapter(rt,ITEMS,'scr_spell (items)')(s,rt,spell);rt.onItemUsed?.(spell-200);}
 }
}
// ---- Items: each chapter's item effects in scr_spell (spell = 200 + item) ----
type ItemUse=(s:GmInstance,rt:GmRuntime,spell:number)=>void;
/** Items both chapters share; false when the item is not one of them. */
function sharedItem(s:GmInstance,rt:GmRuntime,spell:number){
 const g=rt.globals;
 switch(spell){
  case 201:healItem(s,rt,40);return true;
  case 202:{const t=g.char[s.star];let amount=Math.ceil(g.maxhp[t]/2);if(g.hp[t]<=0)amount=Math.ceil(g.maxhp[t])+Math.abs(g.hp[t]);healItem(s,rt,amount);return true;}
  case 205:healItem(s,rt,20);return true;
  case 206:healAllItem(s,rt,160);return true;
  case 208:healItem(s,rt,70);return true;
  case 209:healItem(s,rt,50);return true;
  case 210:healItem(s,rt,4);return true;
  case 214:healItem(s,rt,500);return true;
 }
 return false;
}
const itemsChapter1:ItemUse=(s,rt,spell)=>{
 const g=rt.globals;if(sharedItem(s,rt,spell))return;
 switch(spell){
  case 207:healAllItem(s,rt,80);break;
  case 211:healAllItem(s,rt,30);break;
  case 212:healItem(s,rt,[0,10,90,60][g.char[s.star]]);break;
  case 213:healItem(s,rt,[0,80,30,30][g.char[s.star]]);break;
  case 215:healItem(s,rt,60);break;
 }
};
/** Chapter 2 changes some amounts and adds the teas, the revive items and the poisoned food. */
const itemsChapter2:ItemUse=(s,rt,spell)=>{
 const g=rt.globals;if(sharedItem(s,rt,spell))return;
 switch(spell){
  case 207:healAllItem(s,rt,140);break;
  case 211:healAllItem(s,rt,70);break;
  case 212:healItem(s,rt,[0,20,80,50,30][g.char[s.star]]);break;
  case 213:healItem(s,rt,[0,80,20,50,70][g.char[s.star]]);break;
  case 215:healItem(s,rt,50);break;
  case 216:healItem(s,rt,80);break;
  case 218:case 219:case 220:case 221:healItem(s,rt,teaAmountChapter2(rt,[1,4,3,2][spell-218],g.char[s.star]));break;
  case 222:healItem(s,rt,60);break;
  case 223:healItem(s,rt,120);break;
  case 224:healItem(s,rt,100);break;
  case 225:healAllItem(s,rt,30);break;
  case 226:healItem(s,rt,g.char[s.star]===1?100:90);break;
  case 230:case 231:
   for(let i=0;i<3;i++)if(g.char[i]>0){
    s.star=i;let amount=spell===230?10:50;
    if(g.hp[g.char[i]]<=0)amount=spell===230?Math.ceil(g.maxhp[g.char[i]]/4)+Math.abs(g.hp[g.char[i]]):999;
    healItem(s,rt,amount);
   }
   break;
  case 232:{const h=rt.byId(g.charinstance[s.star]);if(h)h.poisonamount=60;rt.sound?.('snd_hurt1');const a=healItem(s,rt,40);if(a)a.particlecolor=0xff00ff;break;}
 }
};
const ITEMS:Record<number,ItemUse>={1:itemsChapter1,2:itemsChapter2};
/** scr_spelltext: the battle line for a spell or item, in global.msg. */
/** scr_spelltext's one-line spells and items: line numbers per chapter. Chapter 2 adds its new spells and items (whose
 * lines also reset msgno; one has a second page). */
const SPELL_LINES1:Record<number,number>={1:14,2:18,4:43,5:47,6:51,201:78,202:82,205:179,206:183,207:187,208:191,209:194,210:197,211:200,212:203,213:206,214:209,215:212};
const SPELL_TEXT:Record<number,{lines:Record<number,number>;before?:(g:Record<string,any>,spell:number,L:(n:number)=>string)=>void}>={
 1:{lines:SPELL_LINES1},
 2:{lines:{...SPELL_LINES1,8:55,9:59,10:63,11:67,202:100,215:230,216:233,217:236,218:240,219:243,220:246,221:249,222:252,223:255,224:258,225:261,226:264,227:267,228:270,229:273,230:276,231:279,232:282,233:298},
  before:(g,spell,L)=>{if(spell>=216&&spell<=233)g.msgno=0;if(spell===217){g.msg[1]=L(237);g.msgno=1;}}},
};
export function spellText(s:GmInstance,rt:GmRuntime,spell:number,caster:number){
 const g=rt.globals,L=(n:number)=>lang(`scr_spelltext_slash_scr_spelltext_gml_${n}_0`),name=g.charname[g.char[caster]];
 s.spell=spell;s.caster=caster;s.star=g.chartarget[caster];s.spelltext=' ';
 const text=forChapter(rt,SPELL_TEXT,'scr_spelltext');text.before?.(g,spell,L);
 const one=text.lines;
 if(one[spell]!==undefined){g.msg[0]=subst(L(one[spell]),name);return;}
 if(spell===3){
  g.msg[0]=subst(L(23),name);retargetSpell(s,rt);
  if(g.monster[s.star]===1&&g.monsterstatus[s.star]!==1){g.msg[0]=subst(L(33),name);if(g.mercymod[s.star]>=100)g.msg[0]=subst(L(36),name);}
 }
 if(spell===100){
  s.cancelattack=0;g.msg[0]=subst(L(58),name,g.monstername[s.star]);retargetSpell(s,rt);
  if(g.mercymod[s.star]>=100)g.msg[0]=subst(L(62),name,g.monstername[s.star]);
  else{g.msg[0]=subst(L(66),name,g.monstername[s.star]);if(g.monsterstatus[s.star]===1){g.msg[0]=subst(L(69),name,g.monstername[s.star]);g.msg[1]=L(70);}}
  if(s.cancelattack===1)g.msg[0]=subst(L(73),name);
 }
 if(spell===203||spell===204){g.msg[0]=subst(L(spell===203?86:122),name);g.msg[1]=L(spell===203?87:123);}
}

// ---- The FIGHT bar (obj_attackpress) ----
// Its working values (loop counters, the bolt being checked, the burst made) are instance variables, as in the
// original: event 1's loop shares i with the Draw loop that calls it, and the parity tests compare them.
/** What the bar does differently per chapter. Chapter 2 renames the method variable (my_method), draws the lane lines
 * only when someone fights and from the boxes on, a pixel thinner, sits the boxes a pixel lower, gives Noelle a yellow
 * box, and starts the closing fade at the bar's top. Box colours: [colour, pressbuffer slot] per party member. */
const FIGHT_BAR:Record<number,{method:'mymethod'|'my_method';lanesWhenFighting:boolean;laneX:number;laneHeight:number;boxY:number;fadeTop:number;boxes:Record<number,[number,number]>}>={
 1:{method:'mymethod',lanesWhenFighting:false,laneX:0,laneHeight:2,boxY:0,fadeTop:-1,boxes:{1:[0xff0000,1],2:[C.purple,2],3:[C.green,3]}},
 2:{method:'my_method',lanesWhenFighting:true,laneX:77,laneHeight:1,boxY:1,fadeTop:0,boxes:{1:[0xff0000,1],2:[C.purple,2],3:[C.green,3],4:[C.yellow,2]}},
};
/** A bolt is hit: points by how close it was, and a burst coloured by it (yellow and bigger for a perfect hit). */
function burstBoltAt(s:GmInstance,rt:GmRuntime,bolt:number,bc:number){
 s.burstbolt=rt.create(burstBolt,s.x+80+s.boltframe[bolt]*s.boltspeed-s.boltx*s.boltspeed,s.y+38*bc).id;
 const b=rt.byId(s.burstbolt)!;
 if(s.p===0){s.points[bc]+=150;b.imageBlend=C.yellow;b.mag=0.2;}
 if(s.p===1)s.points[bc]+=120;
 if(s.p===2)s.points[bc]+=110;
 if(s.p>=3){s.points[bc]+=100-Math.abs(s.topclose)*2;b.imageBlend=s.boltcolor[bc];}
 if(s.p>=15)b.imageBlend=s.charcolor[bc];
 s.boltalive[bolt]=0;
}
/** scr_boltcheck: a hero's own button (flag 13 on) hits that hero's nearest bolt within reach. */
function boltCheck(s:GmInstance,rt:GmRuntime,who:number){
 s.pressbuffer[rt.globals.char[who]]=5;s.qualifybolt=-1;s.close=99;s.topclose=99;
 for(s.i=0;s.i<s.bolttotal;s.i+=1)if(s.boltchar[s.i]===who&&s.boltalive[s.i]===1){
  s.close=s.boltframe[s.i]-s.boltx;
  if(s.close<15&&s.close>-5&&s.close<s.topclose){s.topclose=s.close;s.qualifybolt=s.i;}
 }
 if(s.qualifybolt!==-1){s.p=Math.abs(s.topclose);burstBoltAt(s,rt,s.qualifybolt,who);}
}
/** scr_boltcheck_onebutton: Z hits the nearest bolt within reach, and a bolt tied with it. */
function boltCheckOneButton(s:GmInstance,rt:GmRuntime){
 s.dualbolt=-1;s.dualboltid=-1;s.pressbuffer[0]=5;s.pressbuffer[1]=5;s.pressbuffer[2]=5;s.qualifybolt=-1;s.close=99;s.topclose=999;
 for(s.i=0;s.i<s.bolttotal;s.i+=1)if(s.boltalive[s.i]===1){
  s.close=s.boltframe[s.i]-s.boltx;
  if(s.close<15&&s.close>-5){
   if(s.close===s.topclose){s.dualbolt=1;s.dualboltid=s.i;}
   if(s.close<s.topclose){s.topclose=s.close;s.qualifybolt=s.i;}
  }
 }
 if(s.qualifybolt===-1)return;
 s.bc=s.boltchar[s.qualifybolt];s.p=Math.abs(s.topclose);burstBoltAt(s,rt,s.qualifybolt,s.bc);
 if(s.dualbolt===1){s.bc=s.boltchar[s.dualboltid];s.p=Math.abs(s.topclose);burstBoltAt(s,rt,s.dualboltid,s.bc);}
}
export const attackPress:GmObjectDef={name:'obj_attackpress',index:194,depth:1,sprite:'spr_pressfront',events:{
 create:(s,rt)=>{
  const g=rt.globals,R=rt.random,bar=forChapter(rt,FIGHT_BAR,'obj_attackpress');
  s.active=0;s.fastmode=1;if(s.fastmode===1)s.active=1;
  Object.assign(s,{goahead:0,linespeed:2,linex:-10,spelluse:0,spelldelay:[10,10,10],maxdelay:0,maxdelaytimer:0,havechar:[],charitem:[],charspell:[]});
  if(s.spelluse===0)for(s.xyz=0;s.xyz<3;s.xyz+=1){
   const xyz=s.xyz;s.havechar[xyz]=0;s.charitem[xyz]=0;s.charspell[xyz]=0;
   if(g.charaction[xyz]===1)s.havechar[xyz]=1;
   if(g.charaction[xyz]===4||g.charaction[xyz]===2){
    if(s.maxdelay===0)s.maxdelay=25;
    s.maxdelay+=15;
    if(xyz===2&&s.spelluse===1)s.spelldelay[2]=s.spelldelay[1]===25?45:25;
    if(xyz===1&&s.spelluse===1)s.spelldelay[1]=25;
    s.spelluse=1;
    if(g.charaction[xyz]===4)s.charitem[xyz]=1;else s.charspell[xyz]=1;
   }
  }
  Object.assign(s,{spelluse:0,fade:0,fadeamt:0,fakefade:0,bcolor:0x800000,charcolor:[0xffff00,0xff00ff,0x00ff00],target:0});
  g.hittarget[0]=g.chartarget[0];g.hittarget[1]=g.chartarget[1];g.hittarget[2]=g.chartarget[2];
  s.boltcolor=[mergeColor(C.aqua,C.white,0.5),mergeColor(0xff00ff,C.white,0.5),mergeColor(C.lime,C.white,0.5)];
  s.imagetimer=0;s.posttimer=0;s.timermax=50;
  if(s.havechar[0]===0&&s.havechar[1]===0&&s.havechar[2]===0){s.timermax=3;if(s.spelluse===1&&s.fastmode===1)s.timermax+=s.maxdelay;}
  const o:number[]=s.boltorder=[R.choose(0,1,2)];
  if(s.havechar[1]===0&&s.havechar[2]===0)o[0]=0;
  if(o[0]===2)o[1]=R.choose(0,1);
  if(o[0]===1)o[1]=R.choose(0,2);
  if(o[0]===0)o[1]=R.choose(1,2);
  if(o[1]===2&&o[0]===0)o[2]=1;
  if(o[1]===0&&o[0]===2)o[2]=1;
  if(o[1]===1&&o[0]===0)o[2]=2;
  if(o[1]===0&&o[0]===1)o[2]=2;
  if(o[1]===2&&o[0]===1)o[2]=0;
  if(o[1]===1&&o[0]===2)o[2]=0;
  if(s.havechar[1]===1&&s.havechar[2]===0){o[0]=R.choose(0,1);o[2]=o[0]===1?0:1;}
  Object.assign(s,{boltgap:20,boltspeed:8,boltx:0,points:[0,0,0],pressbuffer:[0,0,0,0],charbolt:[1,1,1]});
  for(s.i=0;s.i<3;s.i+=1)if(s.havechar[s.i]===0)s.charbolt[s.i]=0;
  s.attacked=[0,0,0];s.bolttotal=s.charbolt[0]+s.charbolt[1]+s.charbolt[2];s.boltxoff=0;
  s[bar.method]=1;
  Object.assign(s,{boltnum:1,boltuse:[0,0,0],lastbolt:-1,boltchar:[-1],diff:10});
  if(g.flag[13]===0)s.diff+=2;
  if(s[bar.method]===1){
   // The bolt arrays exist only once a bolt is written (no one attacking: none), as GML creates arrays on write.
   for(s.i=0;s.i<s.bolttotal;s.i+=1){
    gmArray(s,'boltalive')[s.i]=1;s.c=R.choose(0,1,2);
    while(s.havechar[s.c]===0)s.c=R.choose(0,1,2);
    while(s.boltuse[s.c]>=s.charbolt[s.c]){s.c=R.choose(0,1,2);while(s.havechar[s.c]===0)s.c=R.choose(0,1,2);}
    s.boltchar[s.i]=s.c;s.boltuse[s.c]+=1;
   }
   for(s.i=0;s.i<s.bolttotal;s.i+=1){
    const i=s.i;gmArray(s,'boltred')[i]=0;s.boltxoff+=s.lastbolt;gmArray(s,'boltframe')[i]=30+s.boltxoff;
    if(i<s.bolttotal-1){
     if(s.lastbolt!==0&&s.boltchar[i]!==s.boltchar[i+1]){s.lastbolt=R.choose(0,s.diff,s.diff*1.5);s.boltred[i]=1;}
     else s.lastbolt=R.choose(s.diff,s.diff*1.5);
    }else s.lastbolt=R.choose(s.diff,s.diff*1.5);
   }
  }
  // Method 2 (each hero's bolts in their own row, in boltorder) is never chosen: the method is set to 1 above.
  if(s[bar.method]===2)throw Error('obj_attackpress method 2 is not used by the game');
  s.haveauto=0;s.autoed=0;
  if(g.charauto[2]===1&&(g.char[0]===2||g.char[1]===2||g.char[2]===2)){
   s.sus=0;if(g.char[1]===2)s.sus=1;if(g.char[2]===2)s.sus=2;
   if(g.hp[2]>=0&&g.charmove[s.sus]===1){s.haveauto=1;if(s.timermax===3)s.timermax=50;}
  }
 },
 // Event 1: the hero whose bolts are done (target) attacks with the points the bar gave.
 user1:(s,rt)=>{
  const g=rt.globals;if(monsterPop(rt)<=0)return;
  for(s.i=0;s.i<3;s.i+=1)if(s.target===s.i){
   if(withHook(rt,'takesFightBar').some(([e,h])=>h(e,s,rt)))continue;
   const h=rt.byId(g.charinstance[s.i]);if(h){h.points=s.points[s.i];h.state=1;h.attacktimer=0;}
  }
 },
 draw:(s,rt)=>{
  const g=rt.globals,d=rt.drawState,bar=forChapter(rt,FIGHT_BAR,'obj_attackpress');
  s.maxdelaytimer+=1;
  if(s.spelluse===1&&monsterPop(rt)>0)for(s.xyz=0;s.xyz<3;s.xyz+=1)if(s.maxdelaytimer===s.spelldelay[s.xyz]){
   const h=rt.byId(g.charinstance[s.xyz]);if(h){if(s.charitem[s.xyz]===1)h.state=4;if(s.charspell[s.xyz]===1)h.state=2;}
  }
  if(s.maxdelaytimer>=s.maxdelay)s.active=1;
  if(s.active!==1)return;
  for(s.i=0;s.i<3;s.i+=1){
   const i=s.i;
   if(!bar.lanesWhenFighting||s.havechar[0]===1||s.havechar[1]===1||s.havechar[2]===1){
    d.color=s.bcolor;if(i===1||i===2)rt.drawRect(s.x+bar.laneX,s.y+38*i,s.x+300,s.y+38*i+bar.laneHeight);
   }
   if(g.char[i]!==0&&g.charauto[g.char[i]]===0&&s.havechar[i]===1){
    d.color=s.bcolor;s.j=g.char[i];s.fullbox=0;
    const box=bar.boxes[s.j];
    if(box){d.color=box[0];if(s.pressbuffer[box[1]]>0)d.color=mergeColor(box[0],C.white,s.pressbuffer[box[1]]/5);}
    rt.drawRect(s.x+78,s.y+38*i+bar.boxY,s.x+80+15*s.boltspeed,s.y+38*i+36,true);
    rt.drawRect(s.x+79,s.y+38*i+1+bar.boxY,s.x+80+15*s.boltspeed-1,s.y+38*i+35,true);
    rt.drawSprite('spr_pressfront',s.j-1,s.x,s.y+38*i);
    if(g.flag[13]===0)rt.drawSprite('spr_pressfront_b',0,s.x,s.y+38*i);
    if(g.flag[13]===1)rt.drawSprite('spr_pressfront_b',i,s.x,s.y+38*i);
    rt.drawSprite('spr_pressspot',s.j-1,s.x+80,s.y+38*i);
   }
  }
  s.boltcount=[0,0,0];
  if(s[bar.method]===1){
   for(s.i=0;s.i<s.bolttotal;s.i+=1){
    const i=s.i,bx=s.x+80+s.boltframe[i]*s.boltspeed-s.boltx*s.boltspeed;
    s.offset=s.boltchar[i];
    if(s.boltframe[i]-s.boltx<-5)s.boltalive[i]=0;
    s.boltalpha=1;
    if(s.boltframe[i]-s.boltx<0)s.boltalpha=1+(s.boltframe[i]-s.boltx)/3;
    else if(s.imagetimer===0&&s.boltalive[i]===1){
     s.img=rt.create(afterimage,bx,s.y+38*s.offset).id;
     const img=rt.byId(s.img)!;img.sprite='spr_attackspot';img.imageAlpha=0.4;
    }
    if(s.boltalive[i]===1){rt.drawSprite('spr_attackspot',0,bx,s.y+38*s.offset,1,1,0,C.white,s.boltalpha);s.boltcount[s.boltchar[i]]+=1;}
   }
   // Event 1 runs its own loop on the same i, so it ends this one: when two heroes' bolts are done in the same
   // frame, the second one starts attacking a frame later.
   for(s.i=0;s.i<3;s.i+=1)if(s.boltcount[s.i]===0&&s.havechar[s.i]===1&&s.attacked[s.i]===0){s.attacked[s.i]=1;s.target=s.i;rt.userEvent(s,1);}
  }
  if(monsterPop(rt)>0){
   if(g.flag[13]===1){
    if(button1_p(rt)&&s.havechar[0]===1)boltCheck(s,rt,0);
    if(button2_p(rt)&&s.havechar[1]===1)boltCheck(s,rt,1);
    if(button3_p(rt)&&s.havechar[2]===1)boltCheck(s,rt,2);
   }else if(button1_p(rt))boltCheckOneButton(s,rt);
  }else{s.fakefade=1;if(s.posttimer<s.timermax-35)s.posttimer=s.timermax-34;}
  s.imagetimer+=1;s.boltx+=1;s.pressbuffer[0]-=1;s.pressbuffer[1]-=1;s.pressbuffer[2]-=1;
  if(s.imagetimer>1)s.imagetimer=0;
  s.goahead=0;
  if((s.attacked[0]===1||s.havechar[0]===0)&&(s.attacked[1]===1||s.havechar[1]===0)&&(s.attacked[2]===1||s.havechar[2]===0))s.goahead=1;
  if(monsterPop(rt)===0)s.goahead=1;
  if(s.goahead===1){
   s.posttimer+=1;
   if(s.posttimer>s.timermax-35&&s.haveauto===1&&s.autoed===0&&monsterPop(rt)>0){
    const h=rt.byId(g.charinstance[s.sus]);
    if(h){h.points=160;if(g.automiss[g.chartarget[s.sus]]===1)h.points=0;h.state=1;h.attacktimer=0;h.is_auto_susie=1;}
    s.posttimer-=25;s.autoed=1;
   }
   if(s.posttimer>s.timermax){
    s.fade=1;
    for(const h of rt.all(heroParent)){if(h.state===1)h.state=0;h.attacked=0;h.itemed=0;}
    s.techwon=0;if(monsterPop(rt)===0)s.techwon=1;
    if(s.techwon===0){g.mnfight=1;g.myfight=-1;}else winCombat(rt);
   }
  }
  if(s.fade===1||s.fakefade===1){
   s.fadeamt+=0.08;d.color=C.black;d.alpha=s.fadeamt;rt.drawRect(s.x-1,s.y+bar.fadeTop,s.x+640,s.y+300);d.alpha=1;
   if(s.fade===1&&s.fadeamt>1)rt.destroy(s);
  }
 },
}};

// ---- Spells and items, one caster after another ----
/** Per chapter: Chapter 2's spell phase marks one encounter (92) as funny each step. */
const SPELL_PHASE:Record<number,{funnyEncounter?:number}>={1:{},2:{funnyEncounter:92}};
export const spellPhase:GmObjectDef={name:'obj_spellphase',index:308,events:{
 create:s=>{s.spelltimer=0;s.spellmax=40;s.spelltotal=0;s.char=0;s.castyet=0;s.re_castyet=0;s.active=0;s.alarm[0]=5;},
 alarm0:(s,rt)=>{
  const g=rt.globals;
  // using, gotspell and gotitem come into being here (GML arrays are made by writing to them).
  for(s.xyz=0;s.xyz<3;s.xyz+=1){
   const xyz=s.xyz;
   gmArray(s,'using')[xyz]=0;gmArray(s,'gotspell')[xyz]=0;gmArray(s,'gotitem')[xyz]=0;
   for(const [action,state,flag] of [[2,2,'gotspell'],[4,4,'gotitem']] as const){
    if(g.charaction[xyz]!==action)continue;
    s.spelltotal+=1;s.using[xyz]=1;s[flag][xyz]=1;
    if(s.castyet===0){
     const h=rt.byId(g.charinstance[xyz]);if(h){h.state=state;h.attacktimer=0;}
     s.castyet=1;s.char=xyz+1;spellText(s,rt,g.charspecial[xyz],xyz);s.spellwriter=battleTextDefault(rt,s).id;
    }
   }
  }
  s.active=1;g.spelldelay=90;
 },
 step:(s,rt)=>{
  const g=rt.globals;
  if(g.encounterno===forChapter(rt,SPELL_PHASE,'obj_spellphase').funnyEncounter)s.funny=1;
  if(s.active!==1)return;
  s.spelltimer+=1;
  if(s.spelltimer<g.spelldelay||rt.byId(s.spellwriter))return;
  if(s.char>=3||s.spelltotal===1){attackPhase(rt);destroyId(rt,s.spellwriter);rt.destroy(s);return;}
  if(monsterPop(rt)<=0){attackPhase(rt);destroyId(rt,s.spellwriter);rt.destroy(s);return;}
  for(const [flag,state] of [['gotitem',4],['gotspell',2]] as const){
   if(s[flag][s.char]!==1)continue;
   s.re_castyet=1;const h=rt.byId(g.charinstance[s.char]);if(h)h.state=state;
   destroyId(rt,s.spellwriter);spellText(s,rt,g.charspecial[s.char],s.char);s.spellwriter=battleTextDefault(rt,s).id;
  }
  g.spelldelay=90;if(s.re_castyet===0)g.spelldelay=1;
  s.char+=1;
  for(let n=0;n<2;n++)if(s.char<3&&s.using[s.char]===0)s.char+=1;
  s.spelltimer=0;s.re_castyet=0;
 },
}};

// ---- Spell effects ----
export const healAnim:GmObjectDef={name:'obj_healanim',index:301,sprite:'spr_sparestar_anim',visible:false,events:{
 create:s=>{s.target=42894289;s.starcount=0;s.t=0;s.particlesprite='spr_sparestar_anim';s.particlecolor=C.lime;s.star=[];},
 step:(s,rt)=>{
  s.t+=1;const target=rt.byId(s.target);
  if(!target){for(let i=0;i<s.starcount;i++)destroyId(rt,s.star[i]);rt.destroy(s);return;}
  if(s.t===1){
   s.x=target.x;s.y=target.y;s.imageXscale=target.imageXscale;s.imageYscale=target.imageYscale;s.sprite=target.sprite;
   s.sw=rt.spriteWidth(s);s.sh=rt.spriteHeight(s);
   if(HERO_DEFS.some(d=>target.object===d)){s.sw=target.mywidth;s.sh=target.myheight;}
   oflashOf(target,rt);
  }
  if(s.t>=1&&s.t<=5)for(let i=0;i<2;i++){
   const y=s.y+rt.random.random(s.sh),x=s.x+rt.random.random(s.sw);
   const st=rt.create(marker,x,y);s.star[s.starcount]=st.id;
   st.imageAngle=rt.random.random(360);st.depth=-10;st.imageXscale=2;st.imageYscale=2;st.imageAlpha=2;st.imageSpeed=0.25;
   st.hspeed=2-rt.random.random(2);st.vspeed=-3-rt.random.random(2);st.friction=0.2;st.sprite=s.particlesprite;st.imageBlend=s.particlecolor;
   s.starcount+=1;
  }
  if(s.t>=5&&s.t<=30){
   for(let i=0;i<s.starcount;i++){const st=rt.byId(s.star[i]);if(!st)continue;st.imageAngle-=10;st.imageAlpha=st.imageAlpha-0.1;if(st.imageAlpha<=0)rt.destroy(st);}
   if(s.t>=30)rt.destroy(s);
  }
 },
}};
export const pacifySpell:GmObjectDef={name:'obj_pacifyspell',index:298,events:{
 create:(s,rt)=>{s.target=439493;s.con=1;s.siner=0;s.xx=rt.view.x;s.yy=rt.view.y;s.alarm[4]=50;s.fail=0;s.flashcolor=0xff0000;},
 alarm4:s=>{s.con+=1;},
 step:(s,rt)=>{
  let t=rt.byId(s.target);
  if(!t){s.con=99;rt.destroy(s);return;}
  if(s.con===1){
   if(s.fail===0){
    s.siner+=1;t.imageBlend=mergeColor(t.imageBlend,s.flashcolor,0.1);
    if(s.siner%2===0){const y=t.y+rt.spriteHeight(t)-20,x=t.x+rt.random.random(rt.spriteWidth(t));const ai=rt.create(afterimage,x,y);ai.gravity=0.5;ai.sprite='spr_savepoint';ai.imageSpeed=0.2;}
    t.x+=s.siner/4+Math.sin(s.siner/8)*10;t.y-=s.siner/5;
   }else{s.siner=0;s.con=5;}
  }
  if(s.con===2){rt.destroy(t);rt.destroy(s);}
  t=rt.byId(s.target);if(!t){s.con=99;rt.destroy(s);return;}
  if(s.con===5){s.con=6;s.alarm[4]=8;}
  if(s.con===6)t.imageBlend=mergeColor(t.imageBlend,s.flashcolor,0.12);
  if(s.con===7){s.con=8;s.alarm[4]=8;}
  if(s.con===8)t.imageBlend=mergeColor(t.imageBlend,C.white,0.16);
  if(s.con===9){t.imageBlend=C.white;rt.destroy(s);}
 },
 draw:()=>{},
}};
/** Per chapter: from Chapter 2 Rude Buster also works outside battle (battlemode 0: Susie absent from the battle, or
 * not fighting), where it flies at its target's middle and only flashes it. (GIGA Queen's shield, which takes the bolt
 * in Chapter 2, belongs to her port.) */
const RUDE_BUSTER:Record<number,{battlemode:boolean}>={1:{battlemode:false},2:{battlemode:true}};
export const rudeBusterAnim:GmObjectDef={name:'obj_rudebuster_anim',index:303,sprite:'spr_susie_rudebuster',events:{
 create:(s,rt)=>{
  s.t=0;s.imageSpeed=0;s.target=9897887;s.imageXscale=2;s.imageYscale=2;s.damage=1;s.caster=0;s.star=0;
  const sus=rt.first(heroSusie);
  if(forChapter(rt,RUDE_BUSTER,'obj_rudebuster_anim').battlemode){s.battlemode=1;if(sus){s.depth=sus.depth;for(const h of rt.all(heroSusie))h.visible=false;}else s.battlemode=0;}
  else{s.depth=sus!.depth;for(const h of rt.all(heroSusie))h.visible=false;}
  s.red=0;
 },
 step:(s,rt)=>{
  s.imageIndex=s.t/2;
  if(s.t>=28){for(const h of rt.all(heroSusie))h.visible=true;rt.destroy(s);}
  if(rt.byId(s.target)&&s.t===10){
   rt.sound?.('snd_rudebuster_swing');
   const b=rt.create(rudeBusterBolt,s.x+40,s.y+30);s.blast=b.id;b.caster=s.caster;b.target=s.target;b.damage=s.damage;b.star=s.star;if(s.red===1)b.red=1;
  }
  s.t+=1;
 },
}};
const angleDifference=(dest:number,src:number)=>((((dest-src)%360)+540)%360)-180;
/** The bolt's hit flash on its target, kept in the target's __of (scr_oflash run as the target). */
function boltFlash(s:GmInstance,rt:GmRuntime){
 const target=rt.byId(s.target);if(!target)return;
 const of=oflashOf(target,rt);target.__of=of.id;if(s.red===1)of.flashcolor=C.red;
}
export const rudeBusterBolt:GmObjectDef={name:'obj_rudebuster_bolt',index:304,depth:-10,sprite:'spr_rudebuster_beam',events:{
 create:(s,rt)=>{
  Object.assign(s,{target:43843743,damage:1,star:0,caster:0,imageAlpha:0,imageXscale:2,imageYscale:2,imageSpeed:1});
  s.prevx=[];s.prevy=[];for(s.i=0;s.i<10;s.i+=1){s.prevx[s.i]=s.x;s.prevy[s.i]=s.y;}
  Object.assign(s,{a:0,targetx:0,targety:0,t:0,tmax:4,siner:0,explode:0,maxaft:0,bolt_timer:0,chosen_bolt:0,final_bolt:0,red:0});
  if(forChapter(rt,RUDE_BUSTER,'obj_rudebuster_bolt').battlemode){s.battlemode=1;if(rt.globals.fighting===0)s.battlemode=0;}
 },
 step:(s,rt)=>{
  const g=rt.globals,modes=forChapter(rt,RUDE_BUSTER,'obj_rudebuster_bolt').battlemode,inBattle=!modes||s.battlemode===1;
  if(s.imageAlpha<1)s.imageAlpha=s.imageAlpha+0.25;else s.imageAlpha=1;
  if(s.t===0){
   const target=rt.byId(s.target);
   if(inBattle){s.targetx=g.monsterx[target!.myself];s.targety=g.monstery[target!.myself];}
   else if(target){s.targetx=target.x+rt.spriteWidth(target)/2;s.targety=target.y+rt.spriteHeight(target)/2;}
   s.cx=s.targetx;s.cy=s.targety;
   s.direction=pointDirection(s.x,s.y,s.cx,s.cy)-20;s.speed=24;s.friction=-1.5;s.imageAngle=s.direction;
   if(s.red===1){s.sprite='spr_rudebuster_beam_red';s.imageXscale=2.5;s.imageYscale=2.5;}
  }
  if(s.t>=1&&s.explode===0){
   s.bolt_timer+=1;
   if(button1_p(rt)&&s.bolt_timer>=4&&s.chosen_bolt===0)s.chosen_bolt=s.bolt_timer;
   s.dir=pointDirection(s.x,s.y,s.cx,s.cy);s.direction=f32(s.direction+angleDifference(s.dir,s.direction)/4);s.imageAngle=s.direction;
   if(pointDistance(s.x,s.y,s.cx,s.cy)<=40){s.final_bolt=s.chosen_bolt;s.visible=false;s.explode=1;s.t=1;}
  }
  if(s.explode===1){
   if(s.t===1){
    s.bonus_anim=0;
    if(s.chosen_bolt>0){
     // The earlier Z was pressed before the hit, the less it adds (from 30 for a hit on the last frame).
     const bonus:Record<number,number>={0:30,1:28,2:22,3:20,4:13,5:11,6:10},k=s.final_bolt-s.chosen_bolt;
     if(bonus[k]!==undefined)s.damage+=bonus[k];
     if(Math.abs(s.chosen_bolt-s.final_bolt)<=2){s.bonus_anim=1;rt.sound?.('snd_scytheburst');}
    }
    if(s.red===1)s.damage+=90;
    if(inBattle){g.hittarget[s.star]=0;const redirected=withHook(rt,'interceptSpellDamage').some(([enemy,intercept])=>intercept(enemy,s,rt,s.star,s.damage,4));if(!redirected)damageEnemy(s,rt,s.star,s.damage);if(g.monstertype[0]!==20)boltFlash(s,rt);}
    else boltFlash(s,rt);
    rt.sound?.('snd_rudebuster_hit');
    const burst=gmArray(s,'burst');
    for(s.i=0;s.i<8;s.i+=1){
     const b=afterImage(s,rt);burst[s.i]=b.id;b.imageSpeed=0.5;b.x=s.cx;b.y=s.cy;b.imageAngle=45+s.i*90;b.direction=b.imageAngle;b.speed=25;b.depth=s.depth-10;
    }
   }
   if(s.t>=2)for(s.i=0;s.i<8;s.i+=1){const b=rt.byId(s.burst[s.i]);if(b){b.speed=b.speed*(s.i<4?0.75:0.8);b.imageXscale=b.imageXscale*0.8;}}
   if(s.t>=18)rt.destroy(s);
  }
  if(s.explode===0){
   const a=afterImage(s,rt);gmArray(s,'aft')[s.maxaft]=a.id;a.imageYscale=1.8;a.imageAngle=s.imageAngle;a.imageIndex=4;a.imageSpeed=0.5;a.imageAlpha=s.imageAlpha-0.2;s.maxaft+=1;
  }
  for(s.i=0;s.i<s.maxaft;s.i+=1){
   let a=rt.byId(s.aft[s.i]);if(a){a.imageYscale=a.imageYscale-0.1;if(a.imageYscale<=0.1)rt.destroy(a);}
   a=rt.byId(s.aft[s.i]);
   if(s.explode===1&&a){a.imageAlpha=a.imageAlpha-0.07;a.imageYscale=a.imageYscale*0.9;if(a.imageYscale<=0.1)rt.destroy(a);}
  }
  s.a+=1;s.t+=1;
 },
}};
/** obj_defeatanim (scr_defeatrun): a beaten enemy sweats, then runs off in a trail of copies. */
export const defeatAnim:GmObjectDef={name:'obj_defeatanim',index:300,events:{
 create:(s,rt)=>{Object.assign(s,{t:0,g:0,imageSpeed:0,starcount:0,redup:0,bsize:6});rt.sound?.('snd_defeatrun');},
 step:s=>{s.g++;if(s.g>=15)s.t++;},
 draw:(s,rt)=>{
  if(s.t===0)rt.drawSelf(s);s.sweat=s.g<=5||(s.g>=9&&s.g<=13)?1:0;
  if(s.sweat===1)rt.drawSprite('spr_defeatsweat',0,s.x-6,s.y-6);
  if(s.t>=1){for(s.i=0;s.i<=80;s.i++){s.alph=.4;rt.drawSprite(s.sprite,s.imageIndex,s.x+4*s.i,s.y,s.imageXscale,s.imageYscale,0,s.imageBlend,s.alph-s.t/8+s.i/200);}if(s.t>=15)rt.destroy(s);}
 },
}};
/** What a beaten enemy leaves behind, per chapter (scr_defeatrun's first half): Chapter 2 marks a recruitable enemy
 * that was beaten as lost (its recruit flag turns -1, with the LOST message), and a frozen one (Snowgrave) stays as
 * ice; a fatal blow (fatal) kills it instead of making it run. Returns whether it was frozen. */
const DEFEAT_RUN:Record<number,(s:GmInstance,rt:GmRuntime)=>boolean>={
 1:()=>false,
 2:(s,rt)=>{
  const g=rt.globals,flag=g.monstertype[s.myself]+600;
  if(!rt.is(s,monsterParent)){s.fatal=0;return false;}
  const frozen=g.flag[51+s.myself]===6;
  const lost=(frame:number)=>{const t=rt.create(recruitAnim,g.monsterx[s.myself],g.monstery[s.myself]-40);s._rtext=t.id;t.imageIndex=frame;};
  if(frozen){lost(12);if(s.recruitable===1)g.flag[flag]=-1;g.flag[63]=1;}
  if(s.recruitable===1&&g.flag[61]===0&&!frozen){g.flag[63]=1;if(g.flag[flag]!==-1){g.flag[flag]=-1;lost(7);}}
  if(frozen)throw Error('scr_defeatrun: a frozen enemy (obj_frozennpc) is not ported yet');
  if(s.fatal===1)throw Error('scr_defeatrun: a fatal defeat (obj_deathanim) is not ported yet');
  return false;
 },
};
/** scr_defeatrun, run by the enemy: it runs off as obj_defeatanim (kept in its defeatanim), and is gone. */
export function defeatRun(s:GmInstance,rt:GmRuntime){
 forChapter(rt,DEFEAT_RUN,'scr_defeatrun')(s,rt);
 const a=rt.create(defeatAnim,s.x,s.y);s.defeatanim=a.id;
 a.sprite=s.sprite;a.sprite=s.hurtsprite;a.imageIndex=0;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;
 rt.destroy(s);return a;
}
void itemShift;void writer;
