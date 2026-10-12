// The party side of a battle as Chapter 1 runs it: the heroes (obj_heroparent: poses in Draw, the FIGHT hit in
// Alarm 1, spells and items in Alarm 4), the FIGHT bar (obj_attackpress), the spell and item phase (obj_spellphase)
// and what spells do (scr_spell, scr_spelltext): healing, Pacify, Rude Buster, SPARE, items.
import type {GmInstance,GmObjectDef,GmRuntime} from '../gm/runtime';
import {C} from '../gm/graphics';
import {f32,pointDirection,pointDistance,round} from '../gm/math';
import {afterimage,dmgWriter,heroKris,heroRalsei,heroSusie,marker,mergeColor,shake,tensionHeal} from './battle';
import {burstBolt,basicAttack} from './player-effects';
import {battleTextDefault,writer} from './writer';
import {optionalSourceText as lang} from '../host/text';
import {attackPhase,button1_p,itemShift,mercyAdd,monsterDefeat,monsterPop,subst,winCombat} from './controller';

const destroyId=(rt:GmRuntime,id:number)=>{const i=rt.byId(id);if(i)rt.destroy(i);};
const isHero=(i:GmInstance,name:string)=>i.object.name===name;
/** scr_afterimage: a still copy of the instance that fades out. */
function afterImageOf(s:GmInstance,rt:GmRuntime){
 const a=rt.create(afterimage,s.x,s.y);a.sprite=s.sprite;a.imageIndex=s.imageIndex;a.imageBlend=s.imageBlend;a.imageSpeed=0;a.depth=s.depth;
 a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;a.imageAngle=s.imageAngle;return a;
}
/** obj_oflash: a white silhouette of its target that pulses once. */
export const oflash:GmObjectDef={name:'obj_oflash',index:302,events:{
 create:s=>{s.flashspeed=1;s.siner=0;s.target=43843843;s.imageSpeed=0;s.flashcolor=C.white;},
 draw:(s,rt)=>{
  const t=rt.byId(s.target);if(t){s.imageIndex=t.imageIndex;s.sprite=t.sprite;}
  s.siner+=s.flashspeed;
  if(s.sprite)rt.drawSpriteFog(s.sprite,s.imageIndex,s.x,s.y,s.imageXscale,s.imageYscale,0,s.flashcolor,Math.sin(s.siner/3));
  if(s.siner>4&&Math.sin(s.siner/3)<0)rt.destroy(s);
 },
}};
/** scr_oflash, run by the instance that flashes. */
export function oflashOf(s:GmInstance,rt:GmRuntime){
 const o=rt.create(oflash,s.x,s.y);o.imageXscale=s.imageXscale;o.imageSpeed=0;o.imageIndex=s.imageIndex;o.imageYscale=s.imageYscale;o.sprite=s.sprite;o.depth=s.depth-1;o.target=s.id;return o;
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
function heroCreate(s:GmInstance,rt:GmRuntime){
 Object.assign(s,{char:0,myself:0,points:0,becomeflash:0,state:0,flash:0,siner:0,fsiner:0,attacktimer:0,attacked:0,combatdarken:1,darkentimer:0,darkify:0,
  imageXscale:2,imageYscale:2,index:0,specdraw:0,is_auto_susie:0,victoryanim:0,hurt:0,hurttimer:0,hurtindex:0,acttimer:0,defendtimer:0,itemed:0,tu:0});
 const sp=SPRITES[s.object.name]??SPRITES.obj_herokris,f=FRAMES[s.object.name]??FRAMES.obj_herokris;
 for(const [k,v] of Object.entries(sp))s[k+'sprite']=v;
 if(s.object.name==='obj_herosusie'&&rt.globals.charweapon?.[2]===0){s.idlesprite='spr_susieb_idle_unarmed';s.attackreadysprite='spr_susieb_attackready_unarmed';s.attacksprite='spr_susieb_attack_unarmed';}
 [s.actframes,s.actreturnframes,s.attackframes,s.itemframes,s.defendframes,s.spellframes,s.attackspeed,s.mywidth,s.myheight]=f;
 s.victoryframes=rt.bank.get(s.victorysprite)?.frames??1;
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
    const pitch=isHero(s,'obj_heroralsei')?1.15:isHero(s,'obj_herosusie')?0.9:1;
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
}
/** scr_retarget: if the chosen enemy is gone, the next one; cancelattack when none is left. */
function retarget(s:GmInstance,rt:GmRuntime,slot:number){
 const g=rt.globals;let t=g.chartarget[slot];s.cancelattack=0;
 if(t===0&&g.monster[0]===0)t=1;
 if(t===1&&g.monster[1]===0)t=2;
 if(t===2&&g.monster[2]===0)t=3;
 if(t===3&&g.monster[0]===1)t=0;
 if(t===3&&g.monster[1]===1)t=1;
 if(t===3)s.cancelattack=1;
 g.chartarget[slot]=t;
}
/** Alarm 1: the FIGHT hit lands, for the points the attack bar gave. */
function heroHit(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.faceaction[me]=0;retarget(s,rt,me);
 if(s.cancelattack!==0)return;
 const t=g.chartarget[me],m=rt.byId(g.monsterinstance[t]);
 const dm=rt.create(dmgWriter,g.monsterx[t],g.monstery[t]-g.hittarget[t]*20+20);dm.type=s.char-1;dm.delay=8;
 let damage=round(g.battleat[me]*s.points/20-g.monsterdf[t]*3);
 if(g.monstertype[t]===19)damage=Math.ceil(damage*0.3);
 if(damage<0)damage=0;
 if(damage===0){dm.delay=2;if(m&&m.hurttimer<=15&&m.candodge===1){m.dodgetimer=0;m.state=4;}}
 s.damage=damage;dm.damage=damage;g.hittarget[t]+=1;g.monsterhp[t]-=damage;
 if(s.is_auto_susie===1&&g.monsterhp[t]<=0&&m)g.flag[51+m.myself]=5;
 if(damage>0){
  tensionHeal(rt,round(s.points/(g.monstertype[0]===20?15:10)));
  const y=g.monstery[t]+rt.random.random(6),x=g.monsterx[t]+rt.random.random(6);
  const a=rt.create(basicAttack,x,y);
  if(isHero(s,'obj_herosusie')){a.sprite='spr_attack_mash2';a.imageSpeed=0.5;a.maxindex=4;rt.sound?.('snd_impact');rt.create(shake,0,0);}
  if(isHero(s,'obj_heroralsei')){a.sprite='spr_attack_slap1';a.maxindex=4;a.imageSpeed=0.5;}
  if(s.points===150){a.imageXscale=2.5;a.imageYscale=2.5;}
  if(m){m.shakex=9;m.state=3;m.hurttimer=30;m.hurtamt=damage;}
 }
 if(g.monsterhp[t]<=0&&m)monsterDefeat(m,rt);
}
/** Alarm 4: the spell or item takes effect. */
function heroSpell(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,me=s.myself as number;
 g.faceaction[me]=0;if(monsterPop(rt)>0)castSpell(s,rt,g.charspecial[me],me);
 s.state=0;s.attacktimer=0;
}
const heroEvents={create:heroCreate,draw:heroDraw,alarm1:heroHit,alarm4:heroSpell};
export const HERO_DEFS:readonly GmObjectDef[]=[heroKris,heroSusie,heroRalsei].map(base=>({...base,parent:base,events:heroEvents}));

// ---- Healing and damage helpers ----
/** scr_revive. */
function revive(rt:GmRuntime,slot:number){const g=rt.globals;g.charmove[slot]=1;g.charcantarget[slot]=1;g.chardead[slot]=0;}
/** scr_heal: heals a party slot (raising a downed member to a sixth of their HP); returns the HP gained. */
export function heal(rt:GmRuntime,slot:number,amount:number){
 const g=rt.globals,t=g.char[slot],before=g.hp[t];let below=0,above=0;
 if(g.hp[t]<=0)below=1;if(g.hp[t]>g.maxhp[t])above=1;
 if(above===0){g.hp[t]+=amount;if(g.hp[t]>g.maxhp[t])g.hp[t]=g.maxhp[t];}
 if(below===1&&g.hp[t]>=0){if(g.hp[t]<Math.ceil(g.maxhp[t]/6))g.hp[t]=Math.ceil(g.maxhp[t]/6);revive(rt,slot);}
 rt.sound?.('snd_power',1,true);
 return g.hp[t]-before;
}
/** scr_dmgwriter_selfchar, run by a hero: the number above them, stacked by how many they got this turn. */
function selfWriter(h:GmInstance,rt:GmRuntime){return rt.create(dmgWriter,h.x,h.y+h.myheight-24-h.tu*20);}
/** The heal sparkles and green number on a hero (scr_spell's heal branch, scr_healitemspell). */
function healShow(h:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals,ha=rt.create(healAnim,h.x,h.y);ha.target=h.id;
 const w=selfWriter(h,rt);w.delay=8;w.type=3;w.damage=amount;
 if(g.hp[g.char[h.myself]]>=g.maxhp[g.char[h.myself]])w.specialmessage=3;
 h.tu+=1;
}
/** scr_healitemspell, run by the caster: heals party slot `star`. */
export function healItem(s:GmInstance,rt:GmRuntime,amount:number){
 const g=rt.globals;heal(rt,s.star,amount);const h=rt.byId(g.charinstance[s.star]);if(h)healShow(h,rt,amount);g.spelldelay=15;
}
/** scr_healallitemspell. */
export function healAllItem(rt:GmRuntime,amount:number){
 const g=rt.globals;
 for(let i=0;i<3;i++)if(g.char[i]!==0)heal(rt,i,amount);
 for(let i=0;i<3;i++){const h=rt.byId(g.charinstance[i]);if(h)healShow(h,rt,amount);}
 g.spelldelay=20;
}
/** scr_damage_enemy, run by the caster: damage number, recoil, and defeat at 0 HP. */
export function damageEnemy(s:GmInstance,rt:GmRuntime,enemy:number,amount:number){
 const g=rt.globals,m=rt.byId(g.monsterinstance[enemy]);
 const dm=rt.create(dmgWriter,g.monsterx[enemy],g.monstery[enemy]+20-g.hittarget[enemy]*20);dm.type=g.char[s.caster]-1;dm.damage=amount;
 g.monsterhp[enemy]-=amount;
 if(amount>0&&m){m.shakex=9;m.state=3;m.hurttimer=30;m.hurtamt=amount;}
 g.hittarget[enemy]+=1;
 if(amount===0&&m){m.hurtamt=0;if(m.hurttimer<=15&&m.candodge===1){m.dodgetimer=0;m.state=4;}}
 if(g.monsterhp[enemy]<=0&&m)monsterDefeat(m,rt);
}
/** scr_retarget_spell. */
function retargetSpell(s:GmInstance,rt:GmRuntime){
 const g=rt.globals;s.cancelattack=0;
 if(s.star===0&&g.monster[0]===0)s.star=1;
 if(s.star===1&&g.monster[1]===0)s.star=2;
 if(s.star===2&&g.monster[2]===0)s.star=3;
 if(s.star===3&&g.monster[0]===1)s.star=0;
 if(s.star===3&&g.monster[1]===1)s.star=1;
 if(s.star===3)s.cancelattack=1;
}

/** scr_spell, run by the hero: what each spell, SPARE (100) and item (200 + id) does. */
export function castSpell(s:GmInstance,rt:GmRuntime,spell:number,caster:number){
 const g=rt.globals;s.spell=spell;s.caster=caster;s.star=g.chartarget[caster];g.spelldelay=10;
 const heroOf=(slot:number)=>rt.byId(g.charinstance[slot]);
 switch(spell){
  case 1:{
   s.cancelattack=0;if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(s.cancelattack===0){
    let damage=Math.ceil(g.battleat[caster]*10-g.monsterdf[s.star]*3);if(g.automiss[s.star]===1)damage=0;
    damageEnemy(s,rt,s.star,damage);
    const y=g.monstery[s.star]+rt.random.random(6),x=g.monsterx[s.star]+rt.random.random(6);
    const a=rt.create(basicAttack,x,y);a.sprite='spr_attack_mash1';
   }
   g.spelldelay=30;break;
  }
  case 2:{
   const amount=g.battlemag[caster]*5;heal(rt,s.star,amount);
   const h=heroOf(s.star);if(h){h.healnum=amount;healShow(h,rt,amount);}
   g.spelldelay=15;break;
  }
  case 3:{
   if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(g.monster[s.star]===1){
    const m=rt.byId(g.monsterinstance[s.star]);
    if(g.monsterstatus[s.star]===1){
     if(m){if(g.monstertype[m.myself]!==19&&g.monstertype[m.myself]!==3){g.flag[51+m.myself]=3;rt.userEvent(m,10);monsterDefeat(m,rt);}else{m.pacifycon=1;g.spelldelay=999;}}
    }else{const p=rt.create(pacifySpell,0,0);p.target=g.monsterinstance[s.star];p.fail=1;}
   }
   g.spelldelay=20;break;
  }
  case 4:case 5:{
   s.cancelattack=0;g.spelldelay=30;if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(s.cancelattack===0){
    g.spelldelay=70;
    let damage=spell===4?Math.ceil(g.battlemag[caster]*5+g.battleat[caster]*11-g.monsterdf[s.star]*3):Math.ceil(g.battlemag[caster]*6+g.battleat[caster]*13-g.monsterdf[s.star]*6);
    if(g.automiss[s.star]===1)damage=0;
    const sus=rt.first(heroSusie)!;
    const a=rt.create(rudeBusterAnim,sus.x,sus.y);a.damage=damage;a.star=s.star;a.caster=caster;a.target=g.monsterinstance[s.star];if(spell===5)a.red=1;
   }
   break;
  }
  case 6:{
   const amount=g.battlemag[caster]*4;
   for(let i=0;i<3;i++){heal(rt,i,amount);const h=heroOf(i);if(h){h.healnum=amount;healShow(h,rt,amount);}}
   g.spelldelay=15;break;
  }
  case 100:{
   if(g.monster[s.star]===0)retargetSpell(s,rt);
   if(g.monster[s.star]===1){
    const m=rt.byId(g.monsterinstance[s.star]);
    if(g.mercymod[s.star]>=100){if(m){if(g.monstertype[s.star]!==3){g.flag[51+m.myself]=2;rt.userEvent(m,10);monsterDefeat(m,rt);}else m.sparecon=1;}}
    else{mercyAdd(rt,s.star,g.sparepoint[s.star]);const p=rt.create(pacifySpell,0,0);p.target=g.monsterinstance[s.star];p.fail=1;p.flashcolor=C.yellow;}
   }
   g.spelldelay=0;break;
  }
  case 201:healItem(s,rt,40);break;
  case 202:{const t=g.char[s.star];let amount=Math.ceil(g.maxhp[t]/2);if(g.hp[t]<=0)amount=Math.ceil(g.maxhp[t])+Math.abs(g.hp[t]);healItem(s,rt,amount);break;}
  case 205:healItem(s,rt,20);break;
  case 206:healAllItem(rt,160);break;
  case 207:healAllItem(rt,80);break;
  case 208:healItem(s,rt,70);break;
  case 209:healItem(s,rt,50);break;
  case 210:healItem(s,rt,4);break;
  case 211:healAllItem(rt,30);break;
  case 212:healItem(s,rt,[0,10,90,60][g.char[s.star]]);break;
  case 213:healItem(s,rt,[0,80,30,30][g.char[s.star]]);break;
  case 214:healItem(s,rt,500);break;
  case 215:healItem(s,rt,60);break;
 }
}
/** scr_spelltext: the battle line for a spell or item, in global.msg. */
export function spellText(s:GmInstance,rt:GmRuntime,spell:number,caster:number){
 const g=rt.globals,L=(n:number)=>lang(`scr_spelltext_slash_scr_spelltext_gml_${n}_0`),name=g.charname[g.char[caster]];
 s.spell=spell;s.caster=caster;s.star=g.chartarget[caster];s.spelltext=' ';
 const one:Record<number,number>={1:14,2:18,4:43,5:47,6:51,201:78,202:82,205:179,206:183,207:187,208:191,209:194,210:197,211:200,212:203,213:206,214:209,215:212};
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

// ---- The FIGHT bar ----
const CHARCOLOR=[0xffff00,0xff00ff,0x00ff00];
const boltColor=(c:number)=>mergeColor([C.aqua,0xff00ff,C.lime][c],C.white,0.5);
/** scr_boltcheck_onebutton: Z hits the nearest bolt within reach (and one tied with it). */
function boltCheck(s:GmInstance,rt:GmRuntime){
 let dual=-1,dualId=-1;s.pressbuffer[0]=5;s.pressbuffer[1]=5;s.pressbuffer[2]=5;let qualify=-1,top=999;
 for(let i=0;i<s.bolttotal;i++)if(s.boltalive[i]===1){const close=s.boltframe[i]-s.boltx;if(close<15&&close>-5){if(close===top){dual=1;dualId=i;}if(close<top){top=close;qualify=i;}}}
 if(qualify===-1)return;
 const burst=(i:number)=>{
  const bc=s.boltchar[i],p=Math.abs(top);
  const b=rt.create(burstBolt,s.x+80+s.boltframe[i]*s.boltspeed-s.boltx*s.boltspeed,s.y+38*bc);
  if(p===0){s.points[bc]+=150;b.imageBlend=C.yellow;b.mag=0.2;}
  if(p===1)s.points[bc]+=120;
  if(p===2)s.points[bc]+=110;
  if(p>=3){s.points[bc]+=100-Math.abs(top)*2;b.imageBlend=boltColor(bc);}
  if(p>=15)b.imageBlend=CHARCOLOR[bc];
  s.boltalive[i]=0;
 };
 burst(qualify);if(dual===1)burst(dualId);
}
export const attackPress:GmObjectDef={name:'obj_attackpress',index:194,depth:1,sprite:'spr_pressfront',events:{
 create:(s,rt)=>{
  const g=rt.globals,R=rt.random;
  Object.assign(s,{active:1,fastmode:1,goahead:0,linespeed:2,linex:-10,spelluse:0,spelldelay:[10,10,10],maxdelay:0,maxdelaytimer:0,havechar:[0,0,0],charitem:[0,0,0],charspell:[0,0,0]});
  for(let xyz=0;xyz<3;xyz++){
   if(g.charaction[xyz]===1)s.havechar[xyz]=1;
   if(g.charaction[xyz]===4||g.charaction[xyz]===2){
    if(s.maxdelay===0)s.maxdelay=25;s.maxdelay+=15;
    if(xyz===2&&s.spelluse===1)s.spelldelay[2]=s.spelldelay[1]===25?45:25;
    if(xyz===1&&s.spelluse===1)s.spelldelay[1]=25;
    s.spelluse=1;if(g.charaction[xyz]===4)s.charitem[xyz]=1;else s.charspell[xyz]=1;
   }
  }
  s.spelluse=0;s.fade=0;s.fadeamt=0;s.fakefade=0;s.bcolor=0x800000;s.target=0;
  g.hittarget[0]=g.chartarget[0];g.hittarget[1]=g.chartarget[1];g.hittarget[2]=g.chartarget[2];
  s.imagetimer=0;s.posttimer=0;s.timermax=50;
  if(s.havechar[0]===0&&s.havechar[1]===0&&s.havechar[2]===0)s.timermax=3;
  s.boltorder=[R.choose(0,1,2),0,0];
  if(s.havechar[1]===0&&s.havechar[2]===0)s.boltorder[0]=0;
  if(s.boltorder[0]===2)s.boltorder[1]=R.choose(0,1);
  if(s.boltorder[0]===1)s.boltorder[1]=R.choose(0,2);
  if(s.boltorder[0]===0)s.boltorder[1]=R.choose(1,2);
  const o=s.boltorder;
  if(o[1]===2&&o[0]===0)o[2]=1;if(o[1]===0&&o[0]===2)o[2]=1;if(o[1]===1&&o[0]===0)o[2]=2;
  if(o[1]===0&&o[0]===1)o[2]=2;if(o[1]===2&&o[0]===1)o[2]=0;if(o[1]===1&&o[0]===2)o[2]=0;
  if(s.havechar[1]===1&&s.havechar[2]===0){o[0]=R.choose(0,1);o[2]=o[0]===1?0:1;}
  Object.assign(s,{boltgap:20,boltspeed:8,boltx:0,points:[0,0,0],pressbuffer:[0,0,0,0],charbolt:[1,1,1],attacked:[0,0,0],boltxoff:0,mymethod:1,boltnum:1,boltuse:[0,0,0],lastbolt:-1,boltchar:[-1],diff:10,boltalive:[],boltframe:[],boltred:[]});
  for(let i=0;i<3;i++)if(s.havechar[i]===0)s.charbolt[i]=0;
  s.bolttotal=s.charbolt[0]+s.charbolt[1]+s.charbolt[2];
  if(g.flag[13]===0)s.diff+=2;
  for(let i=0;i<s.bolttotal;i++){
   s.boltalive[i]=1;let c=R.choose(0,1,2);
   while(s.havechar[c]===0)c=R.choose(0,1,2);
   while(s.boltuse[c]>=s.charbolt[c]){c=R.choose(0,1,2);while(s.havechar[c]===0)c=R.choose(0,1,2);}
   s.boltchar[i]=c;s.boltuse[c]+=1;
  }
  for(let i=0;i<s.bolttotal;i++){
   s.boltred[i]=0;s.boltxoff+=s.lastbolt;s.boltframe[i]=30+s.boltxoff;
   if(i<s.bolttotal-1){
    if(s.lastbolt!==0&&s.boltchar[i]!==s.boltchar[i+1]){s.lastbolt=R.choose(0,s.diff,s.diff*1.5);s.boltred[i]=1;}
    else s.lastbolt=R.choose(s.diff,s.diff*1.5);
   }else s.lastbolt=R.choose(s.diff,s.diff*1.5);
  }
  s.haveauto=0;s.autoed=0;
  if(g.charauto[2]===1&&(g.char[0]===2||g.char[1]===2||g.char[2]===2)){
   s.sus=g.char[1]===2?1:g.char[2]===2?2:0;
   if(g.hp[2]>=0&&g.charmove[s.sus]===1){s.haveauto=1;if(s.timermax===3)s.timermax=50;}
  }
 },
 user1:(s,rt)=>{
  const g=rt.globals;if(monsterPop(rt)<=0)return;
  // This loop shares the instance's i with the Draw loop that called it (see below).
  for(s.i=0;s.i<3;s.i++)if(s.target===s.i){const h=rt.byId(g.charinstance[s.i]);if(h){h.points=s.points[s.i];h.state=1;h.attacktimer=0;}}
 },
 draw:(s,rt)=>{
  const g=rt.globals,d=rt.drawState;
  s.maxdelaytimer+=1;
  if(s.spelluse===1&&monsterPop(rt)>0)for(let xyz=0;xyz<3;xyz++)if(s.maxdelaytimer===s.spelldelay[xyz]){
   const h=rt.byId(g.charinstance[xyz]);if(h){if(s.charitem[xyz]===1)h.state=4;if(s.charspell[xyz]===1)h.state=2;}
  }
  if(s.maxdelaytimer>=s.maxdelay)s.active=1;
  if(s.active!==1)return;
  for(let i=0;i<3;i++){
   d.color=s.bcolor;if(i===1||i===2)rt.drawRect(s.x,s.y+38*i,s.x+300,s.y+38*i+2);
   if(g.char[i]!==0&&g.charauto[g.char[i]]===0&&s.havechar[i]===1){
    const j=g.char[i],base=[0,0xff0000,0x800080,0x008000][j];
    d.color=s.pressbuffer[j]>0?mergeColor(base,C.white,s.pressbuffer[j]/5):base;
    rt.drawRect(s.x+78,s.y+38*i,s.x+80+15*s.boltspeed,s.y+38*i+36,true);
    rt.drawRect(s.x+79,s.y+38*i+1,s.x+80+15*s.boltspeed-1,s.y+38*i+35,true);
    rt.drawSprite('spr_pressfront',j-1,s.x,s.y+38*i);
    if(g.flag[13]===0)rt.drawSprite('spr_pressfront_b',0,s.x,s.y+38*i);
    if(g.flag[13]===1)rt.drawSprite('spr_pressfront_b',i,s.x,s.y+38*i);
    rt.drawSprite('spr_pressspot',j-1,s.x+80,s.y+38*i);
   }
  }
  s.boltcount=[0,0,0];
  for(let i=0;i<s.bolttotal;i++){
   const off=s.boltchar[i],gap=s.boltframe[i]-s.boltx,bx=s.x+80+s.boltframe[i]*s.boltspeed-s.boltx*s.boltspeed;
   if(gap<-5)s.boltalive[i]=0;
   let alpha=1;
   if(gap<0)alpha=1+gap/3;
   else if(s.imagetimer===0&&s.boltalive[i]===1){const img=rt.create(afterimage,bx,s.y+38*off);img.sprite='spr_attackspot';img.imageAlpha=0.4;}
   if(s.boltalive[i]===1){rt.drawSprite('spr_attackspot',0,bx,s.y+38*off,1,1,0,C.white,alpha);s.boltcount[s.boltchar[i]]+=1;}
  }
  // Event 1 runs its own loop on the same variable i, which ends the loop here: when two bolts are done in the same
  // frame, the second hero starts attacking one frame later.
  for(s.i=0;s.i<3;s.i++){const i=s.i;if(s.boltcount[i]===0&&s.havechar[i]===1&&s.attacked[i]===0){s.attacked[i]=1;s.target=i;rt.userEvent(s,1);}}
  if(monsterPop(rt)>0){if(button1_p(rt))boltCheck(s,rt);}
  else{s.fakefade=1;if(s.posttimer<s.timermax-35)s.posttimer=s.timermax-34;}
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
    for(const h of rt.instances)if(h.live&&HERO_DEFS.some(def=>h.object===def)){if(h.state===1)h.state=0;h.attacked=0;h.itemed=0;}
    if(monsterPop(rt)!==0){g.mnfight=1;g.myfight=-1;}else winCombat(rt);
   }
  }
  if(s.fade===1||s.fakefade===1){
   s.fadeamt+=0.08;d.color=C.black;d.alpha=s.fadeamt;rt.drawRect(s.x-1,s.y-1,s.x+640,s.y+300);d.alpha=1;
   if(s.fade===1&&s.fadeamt>1)rt.destroy(s);
  }
 },
}};

// ---- Spells and items, one caster after another ----
export const spellPhase:GmObjectDef={name:'obj_spellphase',index:308,events:{
 create:s=>{s.spelltimer=0;s.spellmax=40;s.spelltotal=0;s.char=0;s.castyet=0;s.re_castyet=0;s.active=0;s.alarm[0]=5;s.using=[0,0,0];s.gotspell=[0,0,0];s.gotitem=[0,0,0];},
 alarm0:(s,rt)=>{
  const g=rt.globals;
  for(let xyz=0;xyz<3;xyz++){
   s.using[xyz]=0;s.gotspell[xyz]=0;s.gotitem[xyz]=0;
   for(const [action,state,flag] of [[2,2,'gotspell'],[4,4,'gotitem']] as const){
    if(g.charaction[xyz]!==action)continue;
    s.spelltotal+=1;s.using[xyz]=1;s[flag][xyz]=1;
    if(s.castyet===0){
     const h=rt.byId(g.charinstance[xyz]);if(h){h.state=state;h.attacktimer=0;}
     s.castyet=1;s.char=xyz+1;spellText(s,rt,g.charspecial[xyz],xyz);s.spellwriter=battleTextDefault(rt).id;
    }
   }
  }
  s.active=1;g.spelldelay=90;
 },
 step:(s,rt)=>{
  const g=rt.globals;if(s.active!==1)return;
  s.spelltimer+=1;
  if(s.spelltimer<g.spelldelay||rt.byId(s.spellwriter))return;
  if(s.char>=3||s.spelltotal===1){attackPhase(rt);destroyId(rt,s.spellwriter);rt.destroy(s);return;}
  if(monsterPop(rt)<=0){attackPhase(rt);destroyId(rt,s.spellwriter);rt.destroy(s);return;}
  for(const [flag,state] of [['gotitem',4],['gotspell',2]] as const){
   if(s[flag][s.char]!==1)continue;
   s.re_castyet=1;const h=rt.byId(g.charinstance[s.char]);if(h)h.state=state;
   destroyId(rt,s.spellwriter);spellText(s,rt,g.charspecial[s.char],s.char);s.spellwriter=battleTextDefault(rt).id;
  }
  g.spelldelay=90;if(s.re_castyet===0)g.spelldelay=1;
  s.char+=1;
  for(let n=0;n<2;n++)if(s.char<3&&s.using[s.char]===0)s.char+=1;
  s.spelltimer=0;s.re_castyet=0;
 },
}};

// ---- Spell effects ----
export const healAnim:GmObjectDef={name:'obj_healanim',index:301,sprite:'spr_sparestar_anim',events:{
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
 draw:()=>{},
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
export const rudeBusterAnim:GmObjectDef={name:'obj_rudebuster_anim',index:303,sprite:'spr_susie_rudebuster',events:{
 create:(s,rt)=>{s.t=0;s.imageSpeed=0;s.target=9897887;s.imageXscale=2;s.imageYscale=2;s.damage=1;s.caster=0;s.star=0;const sus=rt.first(heroSusie);if(sus)s.depth=sus.depth;for(const h of rt.all(heroSusie))h.visible=false;s.red=0;},
 step:(s,rt)=>{
  s.imageIndex=s.t/2;
  if(s.t>=28){for(const h of rt.all(heroSusie))h.visible=true;rt.destroy(s);}
  if(rt.byId(s.target)&&s.t===10){
   rt.sound?.('snd_rudebuster_swing');
   const b=rt.create(rudeBusterBolt,s.x+40,s.y+30);b.caster=s.caster;b.target=s.target;b.damage=s.damage;b.star=s.star;if(s.red===1)b.red=1;
  }
  s.t+=1;
 },
}};
const angleDifference=(dest:number,src:number)=>((((dest-src)%360)+540)%360)-180;
export const rudeBusterBolt:GmObjectDef={name:'obj_rudebuster_bolt',index:304,depth:-10,sprite:'spr_rudebuster_beam',events:{
 create:s=>{
  Object.assign(s,{target:43843743,damage:1,star:0,caster:0,imageAlpha:0,imageXscale:2,imageYscale:2,imageSpeed:1,a:0,targetx:0,targety:0,t:0,tmax:4,siner:0,explode:0,maxaft:0,bolt_timer:0,chosen_bolt:0,final_bolt:0,red:0});
  s.prevx=new Array(10).fill(s.x);s.prevy=new Array(10).fill(s.y);s.aft=[];s.burst=[];
 },
 step:(s,rt)=>{
  const g=rt.globals;
  if(s.imageAlpha<1)s.imageAlpha=s.imageAlpha+0.25;else s.imageAlpha=1;
  if(s.t===0){
   const target=rt.byId(s.target);
   s.targetx=g.monsterx[target?.myself??s.star];s.targety=g.monstery[target?.myself??s.star];s.cx=s.targetx;s.cy=s.targety;
   s.direction=pointDirection(s.x,s.y,s.cx,s.cy)-20;s.speed=24;s.friction=-1.5;s.imageAngle=s.direction;
   if(s.red===1){s.sprite='spr_rudebuster_beam_red';s.imageXscale=2.5;s.imageYscale=2.5;}
  }
  if(s.t>=1&&s.explode===0){
   s.bolt_timer+=1;
   if(button1_p(rt)&&s.bolt_timer>=4&&s.chosen_bolt===0)s.chosen_bolt=s.bolt_timer;
   const dir=pointDirection(s.x,s.y,s.cx,s.cy);s.direction=f32(s.direction+angleDifference(dir,s.direction)/4);s.imageAngle=s.direction;
   if(pointDistance(s.x,s.y,s.cx,s.cy)<=40){s.final_bolt=s.chosen_bolt;s.visible=false;s.explode=1;s.t=1;}
  }
  if(s.explode===1){
   if(s.t===1){
    s.bonus_anim=0;
    if(s.chosen_bolt>0){
     const bonus:Record<number,number>={0:30,1:28,2:22,3:20,4:13,5:11,6:10},k=s.final_bolt-s.chosen_bolt;
     if(bonus[k]!==undefined)s.damage+=bonus[k];
     if(Math.abs(s.chosen_bolt-s.final_bolt)<=2){s.bonus_anim=1;rt.sound?.('snd_scytheburst');}
    }
    if(s.red===1)s.damage+=90;
    g.hittarget[s.star]=0;damageEnemy(s,rt,s.star,s.damage);
    const target=rt.byId(s.target);
    if(g.monstertype[0]!==20&&target){const of=oflashOf(target,rt);if(s.red===1)of.flashcolor=C.red;}
    rt.sound?.('snd_rudebuster_hit');
    for(let i=0;i<8;i++){
     const b=afterImageOf(s,rt);b.imageSpeed=0.5;b.x=s.cx;b.y=s.cy;b.imageAngle=45+i*90;b.direction=b.imageAngle;b.speed=25;b.depth=s.depth-10;s.burst[i]=b.id;
    }
   }
   if(s.t>=2)for(let i=0;i<8;i++){const b=rt.byId(s.burst[i]);if(b){b.speed=b.speed*(i<4?0.75:0.8);b.imageXscale=b.imageXscale*0.8;}}
   if(s.t>=18)rt.destroy(s);
  }
  if(s.explode===0){
   const a=afterImageOf(s,rt);a.imageYscale=1.8;a.imageAngle=s.imageAngle;a.imageIndex=4;a.imageSpeed=0.5;a.imageAlpha=s.imageAlpha-0.2;s.aft[s.maxaft]=a.id;s.maxaft+=1;
  }
  for(let i=0;i<s.maxaft;i++){
   let a=rt.byId(s.aft[i]);if(a){a.imageYscale=a.imageYscale-0.1;if(a.imageYscale<=0.1)rt.destroy(a);}
   a=rt.byId(s.aft[i]);
   if(s.explode===1&&a){a.imageAlpha=a.imageAlpha-0.07;a.imageYscale=a.imageYscale*0.9;if(a.imageYscale<=0.1)rt.destroy(a);}
  }
  s.a+=1;s.t+=1;
 },
}};
void itemShift;void writer;
