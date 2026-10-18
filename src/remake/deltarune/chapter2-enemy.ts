// Chapter 2 enemy scripts shared by every boss family; no encounter-specific branches.
import {type GmInstance,type GmRuntime,type GmObjectDef} from '../gm/runtime';
import {afterImage,darkMarker,heroParent,spareAnim} from './battle';
import {defeatRun,oflashOf} from './party';
import {button1_p,monsterPop,monsterDefeat} from './controller';
import {drawBodyPart} from './chapter2-battle';
import {enemyBlcon2} from './chapter2-objects';
import {writer,msgFace} from './writer';
import {eq,gt,le,lt,round} from '../gm/math';
import {sourceText} from '../host/text';
export {monsterPop};
/** Source scr_monster_add/statreset/makeinstance. Summons use a real vacant monster slot and its ACT tables. */
/** scr_havechar, run by `s`: whether character `who` is in the party (kept in s._rreturn, as the script does). */
export function haveChar(s:GmInstance,rt:GmRuntime,who:number){
 const g=rt.globals;s._rreturn=0;for(const n of [0,1,2])if(g.char[n]===who)s._rreturn=1;return s._rreturn===1;
}
/** scr_monster_actreset, run by `s` for enemy slot `slot` (its loop counter __fj is an instance variable). */
export function monsterActReset(s:GmInstance,rt:GmRuntime,slot:number){
 const g=rt.globals;
 for(s.__fj=0;s.__fj<6;s.__fj+=1){
  g.canact[slot][s.__fj]=0;g.actname[slot][s.__fj]=' ';g.actactor[slot][s.__fj]=1;g.actdesc[slot][s.__fj]=' ';g.actcost[slot][s.__fj]=0;g.actsimul[slot][s.__fj]=0;
  for(const who of ['sus','ral','noe']){g['canact'+who][slot][s.__fj]=0;g['actname'+who][slot][s.__fj]=' ';g['actdesc'+who][slot][s.__fj]=' ';g['actcost'+who][slot][s.__fj]=0;g['actsimul'+who][slot][s.__fj]=0;}
 }
}
export function monsterAdd(s:GmInstance,rt:GmRuntime,type:number,object:GmObjectDef){
 const g=rt.globals;s.__returnid=-1;
 for(s.__mopenslot=0;s.__mopenslot<3;s.__mopenslot++)if(g.monster[s.__mopenslot]===0){
  const slot=s.__mopenslot;g.monstertype[slot]=type;g.monsterinstancetype[slot]=object;
  for(const key of ['monster','monsterx','monstery','monsterat','monsterdf','monsterhp','monstermaxhp','monstergold','monsterexp','sparepoint','hittarget','mercymod','mercymax','monsterstatus'])g[key][slot]=0;
  g.monstername[slot]=sourceText('scr_monster_statreset_slash_scr_monster_statreset_gml_5_0');g.monsterinstance[slot]=12913921839;g.monstercomment[slot]=' ';g.monsterattackname[slot]=' ';
  for(s.__fj=0;s.__fj<6;s.__fj++){
   for(const suffix of ['','sus','ral','noe']){
    for(const key of ['canact','actcost','actsimul'])g[key+suffix][slot][s.__fj]=0;
    for(const key of ['actname','actdesc'])g[key+suffix][slot][s.__fj]=' ';
   }g.actactor[slot][s.__fj]=1;
  }
  g.monster[slot]=1;const previous=rt.byId(g.monsterinstance[slot]);if(previous)rt.destroy(previous);
  const m=rt.create(object,g.monstermakex[slot],g.monstermakey[slot]);g.monsterinstance[slot]=m.id;m.myself=slot;rt.userEvent(m,12);rt.userEvent(m,15);s.__returnid=slot;break;
 }
 return s.__returnid;
}
export function initializeChapter2SmallFaces(rt:GmRuntime){for(const key of ['smalarm','smyy','smxx','smdir','smspeed','smtype','smimage','smimagespeed','smsprite','smcolor','smstring','sminstance'])rt.globals[key]=Array(20).fill(0);}
export function smallFace(_s:GmInstance,rt:GmRuntime,index:number,actor:string|number,emotion:number,x:string|number,y:string|number,text:string){
 const g=rt.globals;g.smalarm[index]=5;g.smyy[index]=70;g.smxx[index]=170;g.smdir[index]=180;g.smspeed[index]=10;g.smtype[index]=3;g.smimage[index]=g.fe;g.smimagespeed[index]=0;g.smsprite[index]='spr_face_s6';g.smcolor[index]=0xffffff;g.smstring[index]=sourceText('scr_smallface_reset_slash_scr_smallface_reset_gml_12_0');
 const sprites:Record<string,string>={susie:'spr_face_susie_alt',ralsei:'spr_face_r_nohat',lancer:'spr_face_l0',noelle:'spr_face_n_matome',noelle_cropped:'spr_face_n_matome_cropped',queen:'spr_face_queen',rouxls:'spr_face_rurus',berdly:'spr_face_berdly_dark',rudy:'spr_face_rudy',none:'spr_empty',empty:'spr_empty'};
 g.smsprite[index]=typeof actor==='number'?(actor===0?'spr_empty':actor):sprites[actor]??(actor.startsWith('spr_')?actor:'spr_face_susie_alt');g.smimage[index]=emotion;
 if(typeof x==='number')g.smxx[index]=x;else{const positions:Record<string,number>={left:g.fighting===1?60:70,leftmid:160,mid:260,middle:260,rightmid:360,right:g.fighting===1?460:400};if(positions[x]!==undefined)g.smxx[index]=positions[x];}
 if(typeof y==='number')g.smyy[index]=y;else if(g.fighting===1){const positions:Record<string,number>={top:-10,mid:30,middle:30,bottommid:45,bottom:56};if(positions[y]!==undefined)g.smyy[index]=positions[y];if(y==='bottom'||y==='bottommid'){g.smdir[index]=90;g.smspeed[index]=4;g.smalarm[index]=10;g.smyy[index]+=40;g.smxx[index]-=40;}}
 else{const positions:Record<string,number>=g.darkzone===0?{top:160,mid:200,middle:200,bottommid:240,bottom:240}:{top:-10,mid:30,middle:30,bottommid:50,bottom:68};if(positions[y]!==undefined)g.smyy[index]=positions[y];}g.smstring[index]=text;
}
export function speaker(s:GmInstance,rt:GmRuntime,who:string){
 const g=rt.globals;s._speaker=who;g.typer=g.fighting===1?4:g.darkzone===1?6:5;g.fc=0;g.fe=0;
 const aliases:Record<string,string>={sus:'susie',ral:'ralsei',noe:'noelle',ber:'berdly',rou:'rouxls',que:'queen',que_2:'queen_2',lan:'lancer',kin:'king'};who=aliases[who]??who;
 if(who==='silent')g.typer=g.darkzone===1?36:2;if(who==='balloon'||who==='enemy')g.typer=50;
 const faces:Record<string,number>={susie:1,ralsei:2,noelle:3,toriel:4,lancer:5,sans:6,undyne:9,asgore:10,alphys:11,berdly:12,catti:13,jockington:14,rudy:15,catty:16,bratty:17,rouxls:18,burgerpants:19,king:20,queen:21,queen_2:21};if(faces[who]!==undefined)g.fc=faces[who];
 const voices:Record<string,number>={sans:14,undyne:17,temmie:21,jevil:35,spamton:g.fighting===0?66:68,sneo:67,susie:g.darkzone===1?(g.fighting===1?47:30):10,ralsei:g.flag[30]===1?6:g.fighting===1?45:31,noelle:g.fighting===1?59:g.darkzone===0?12:56,toriel:7,asgore:18,king:g.fighting===1?48:33,rudy:55,lancer:g.fighting===1?46:32,berdly:g.fighting===1?77:g.darkzone===0?13:57,alphys:20,queen:58,queen_2:62};if(voices[who]!==undefined)g.typer=voices[who];
}
export function anyFace(s:GmInstance,rt:GmRuntime,who:string,slot:number,emotion:number|string){
 s._speakerC=who;s._msgno=slot;s._emotion=emotion;if(typeof emotion==='number'&&emotion>=10){if(emotion<36)s._emotion=String.fromCharCode(55+emotion);else s.emotion=String.fromCharCode(61+emotion);}s._speaker=who.toLowerCase();
 const names:Record<string,'susie'|'ralsei'|'noelle'|'lancer'|'none'>={susie:'susie',sus:'susie',ralsei:'ralsei',ral:'ralsei',noelle:'noelle',noe:'noelle',lancer:'lancer',lan:'lancer',none:'none',x:'none','no name':'none',no_name:'none'};
 if(names[s._speaker])msgFace(rt,slot,names[s._speaker],s._emotion);
 const keys:Record<string,string>={berdly:'scr_anyface_slash_scr_anyface_gml_23_0',ber:'scr_anyface_slash_scr_anyface_gml_23_0',queen:'scr_anyface_slash_scr_anyface_gml_27_0',que:'scr_anyface_slash_scr_anyface_gml_27_0',queen2:'scr_anyface_slash_scr_anyface_gml_28_0_b',que2:'scr_anyface_slash_scr_anyface_gml_28_0_b',rouxls:'scr_rurusface_slash_scr_rurusface_gml_1_0',rou:'scr_rurusface_slash_scr_rurusface_gml_1_0'};
 if(keys[s._speaker]){rt.globals.msgno=slot;rt.globals.msg[slot]=sourceText(keys[s._speaker]).replace('~1',String(s._emotion));}
}
export function anyFaceNext(s:GmInstance,rt:GmRuntime,who:string,emotion:number|string){rt.globals.msgno++;anyFace(s,rt,who,rt.globals.msgno,emotion);}
export function spareAnimation(s:GmInstance,rt:GmRuntime){const a=rt.create(spareAnim,s.x,s.y);s.spareanim=a.id;a.sprite=s.sprite;a.sprite=s.sparedsprite;a.imageIndex=0;a.imageXscale=s.imageXscale;a.imageYscale=s.imageYscale;return a;}
/** Standard enemy user10: animation, recruitment, reward accounting, then destruction. */
export function spareEnemy(s:GmInstance,rt:GmRuntime){
 spareAnimation(s,rt);recruitEnemy(s,rt);monsterDefeat(s,rt);rt.destroy(s);
}
export const recruitAnim:GmObjectDef={name:'obj_recruitanim',index:870,sprite:'spr_battlemsg',events:{
 create:s=>{s.sprite='spr_battlemsg';Object.assign(s,{imageIndex:6,lerptimer:0,imageXscale:4,imageYscale:0,depth:-5,timer:0,imageSpeed:0,firstnumber:1,secondnumber:1});},
 step:(s,rt)=>{s.timer++;const interpolate=(toX:number,toY:number,t:number)=>{s.imageXscale+=(toX-s.imageXscale)*t;s.imageYscale+=(toY-s.imageYscale)*t;};if(s.timer<=5){s.lerptimer++;interpolate(1,1,s.lerptimer/5);}if(s.timer===5)s.lerptimer=0;if(s.timer>=5&&s.timer<=8){s.lerptimer++;interpolate(0.5,2,s.lerptimer/3);}if(s.timer===8)s.lerptimer=0;if(s.timer>=8&&s.timer<=10){s.lerptimer++;if(s.lerptimer>=2)s.lerptimer=2;interpolate(1,1,s.lerptimer/2);}s.x=s.xstart+rt.spriteWidth(s)/2;if(s.timer>=35){s.vspeed-=1;s.imageYscale+=0.1;s.imageAlpha-=0.1;if(le(s.imageAlpha,0))rt.destroy(s);}},
 draw:(s,rt)=>{rt.drawSelf(s);if(s.secondnumber>1){rt.drawState.color=0xffffff;rt.drawState.font=rt.globals.damagefontgold;rt.drawState.alpha=s.imageAlpha;rt.drawText(s.x-70,s.y+35,String(s.firstnumber));rt.drawText(s.x-30,s.y+35,String(s.secondnumber));rt.drawSprite('spr_numbersfontbig_gold',13,s.x-50,s.y+35);rt.drawState.alpha=1;}},
}};
export function recruitEnemy(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,flag=g.monstertype[s.myself]+600;if(s.recruitable===1&&g.flag[61]===0&&g.flag[flag]>=0&&g.flag[flag]<1&&s.recruitcount>0){g.flag[flag]+=1/s.recruitcount;if(g.flag[flag]>1)g.flag[flag]=1;rt.sound?.('snd_sparkle_gem');const a=rt.create(recruitAnim,g.monsterx[s.myself],g.monstery[s.myself]-40);s._recruitanim=a.id;a.firstnumber=round(g.flag[flag]/(1/s.recruitcount));a.secondnumber=s.recruitcount;}
}
export function monsterMakeTired(rt:GmRuntime,enemy:number){rt.globals.monstercomment[enemy]=sourceText('scr_monster_make_tired_slash_scr_monster_make_tired_gml_1_0');rt.globals.monsterstatus[enemy]=1;}
export function enemyHurtTiredAfterDamage(s:GmInstance,rt:GmRuntime,ratio:number){if(le(rt.globals.monsterhp[s.myself],rt.globals.monstermaxhp[s.myself]*ratio))monsterMakeTired(rt,s.myself);}
export function enemyDrawIdleGeneric(s:GmInstance,rt:GmRuntime,rate:number){if(s.state!==0)return;s.fsiner+=1;s.siner+=rate;s.thissprite=s.idlesprite;if(rt.globals.mercymod[s.myself]>=rt.globals.mercymax[s.myself])s.thissprite=s.sparedsprite;drawBodyPart(s,rt,s.thissprite,s.siner,s.x,s.y,s.imageXscale,s.imageYscale,s.imageAngle,s.imageBlend,s.imageAlpha);}
/** scr_enemy_hurt (Chapter 3's script of the generic hurt draw's first half): the hurt time runs out, or the enemy
 * shakes (and runs off once defeated). False once it is over. */
export function enemyHurt(s:GmInstance,rt:GmRuntime):boolean{
 s.hurttimer-=1;if(s.hurttimer<0){s.state=0;return false;}
 if(rt.globals.monster[s.myself]===0)defeatRun(s,rt);
 s.hurtshake+=1;if(s.hurtshake>1){if(s.shakex>0)s.shakex-=1;if(s.shakex<0)s.shakex+=1;s.shakex=-s.shakex;s.hurtshake=0;}
 return true;
}
export function enemyDrawHurtGeneric(s:GmInstance,rt:GmRuntime){
 if(!enemyHurt(s,rt))return;
 rt.drawSprite(s.hurtsprite,0,s.x+s.shakex+s.hurtspriteoffx,s.y+s.hurtspriteoffy,2,2,0,s.imageBlend,1);
}
export function terminateWriter(s:GmInstance,rt:GmRuntime){
 s.__writerkilled=0;s.__writerkillable=0;s.__writerended=0;const writers=rt.all(writer);
 if(writers.length){for(const w of writers){w.__endcheckid=s.id;if(w.reachedend===1)s.__writerended++;}if(s.__writerended===writers.length)s.__writerkillable=1;}else s.__writerkilled=1;
 if(button1_p(rt)&&s.__writerkillable===1){for(const w of writers)rt.destroy(w);s.__writerkilled=1;}return s.__writerkilled;
}
export function simulText(s:GmInstance,rt:GmRuntime,actor:string){
 s.__simulorder=0;const key=({kris:'simulorderkri',susie:'simulordersus',ralsei:'simulorderral',noelle:'simulordernoe'} as Record<string,string>)[actor];if(key)s.__simulorder=s[key];
 s.__yoffset=s.__simulorder*30;rt.globals.typer=4;const w=rt.create(writer,s.xx+30,s.yy+376+s.__yoffset);s.battlewriter=w.id;return w;
}
export function actCharSpriteEnd(s:GmInstance,rt:GmRuntime){
 for(s.i=0;s.i<10;s.i++){const sprite=rt.byId(s._charactsprite[s.i]);if(sprite)rt.destroy(sprite);}
 for(const hero of rt.withInstances(heroParent))if(hero.imageAlpha===0){hero.imageAlpha=1;hero.acttimer=0;hero.state=0;rt.globals.faceaction[hero.myself]=0;}
}
export const animator:GmObjectDef={name:'obj_animator',index:926,events:{
 // GML's ordinary variable `sprite` is distinct from sprite_index (the runtime's sprite accessor).
 create:s=>{Object.assign(s,{con:0,initframe:-1,endframe:-1,target:-1,gml_sprite:-1,fake_image_speed:0.25,fake_image_index:0,fake_image_index_max:0,timer:0});},
 step:(s,rt)=>{const t=rt.byId(s.target);if(!t){rt.destroy(s);return;}if(s.con===0){t.imageIndex=0;t.imageSpeed=0;if(typeof s.gml_sprite==='string')t.sprite=s.gml_sprite;if(s.initframe>=0)t.imageIndex=s.initframe;s.fake_image_index_max=s.endframe;const count=t.sprite?rt.bank.get(t.sprite)?.frames??0:0;if(s.endframe===0)s.fake_image_index_max=count-1-t.imageIndex;if(s.endframe===-1)s.fake_image_index_max=count-t.imageIndex;s.con=1;}if(s.con===1){s.fake_image_index+=s.fake_image_speed;t.imageIndex=s.fake_image_index;if(s.fake_image_index>=s.fake_image_index_max)rt.destroy(s);}},
}};
export function actCharSprite(s:GmInstance,rt:GmRuntime,actor:string,sprite:string,rate:number,mode:number){
 s._charactor=actor;const names=['kris','susie','ralsei','noelle'],id=names.indexOf(actor)+1;s._charinstance=({kris:'obj_herokris',susie:'obj_herosusie',ralsei:'obj_heroralsei',noelle:'obj_heronoelle'} as Record<string,string>)[actor]??'obj_herokris';if(id)s._charnum=id;s.__returnvalue=s._charactsprite[s._charnum];
 const heroes=rt.instances.filter(h=>h.live&&h.object.name===s._charinstance);if(heroes.length){for(const h of heroes){h.imageAlpha=0;h.state=0;rt.globals.faceaction[h.myself]=0;}const h=heroes[0],marker=darkMarker(rt,s,h.x,h.y,sprite);s._charactsprite[s._charnum]=marker.id;marker.depth=20-rt.view.y/40;oflashOf(marker,rt);
  if(rate>0&&mode===0){const a=rt.create(animator,marker.x,marker.y);marker.__animator=a.id;Object.assign(a,{target:marker.id,initframe:0,endframe:0,fake_image_speed:rate});}if(rate>0&&mode===1)marker.imageSpeed=rate;
  const a=afterImage(marker,rt);marker.a=a.id;a.hspeed=2.5;a.depth=marker.depth+1;const b=afterImage(marker,rt);marker.b=b.id;b.imageAlpha=0.6;b.hspeed=5;b.depth=marker.depth+2;s.__returnvalue=marker.id;
 }return s.__returnvalue;
}
export function priorityTarget(s:GmInstance,rt:GmRuntime,...weights:number[]){
 const g=rt.globals;s.abletotarget=g.charcantarget.some((v:number)=>v!==0)?1:0;
 const weighted=()=>{const random=rt.random.random(weights.reduce((a,b)=>a+b,0));let total=0;for(let i=0;i<weights.length;i++){total+=weights[i];if(le(random,total))return i;}return 0;};
 s.mytarget=weighted();if(s.abletotarget===1){while(g.charcantarget[s.mytarget]===0)s.mytarget=weighted();}else s.mytarget=3;g.targeted[s.mytarget]=1;
 if(s.mytarget!==3){for(let i=0;i<3;i++)if(g.charcantarget[i])g.targeted[i]=1;s.mytarget=4;}
}
export function heroBlcon(s:GmInstance,rt:GmRuntime,actor:string|number){
 const names:Record<string,string>={'1':'obj_herokris',kris:'obj_herokris',kr:'obj_herokris','2':'obj_herosusie',susie:'obj_herosusie',su:'obj_herosusie','3':'obj_heroralsei',ralsei:'obj_heroralsei',ra:'obj_heroralsei','4':'obj_heronoelle',noelle:'obj_heronoelle',no:'obj_heronoelle'};
 const hero=rt.instances.find(h=>h.live&&h.object.name===names[actor]);if(!hero)return false;const balloon=enemyBlcon2(s,rt,hero.x+100,hero.y+40,10);if(balloon)balloon.side=-1;return balloon??false;
}
/** scr_enemy_object_init: the fields every Chapter 2 enemy starts with. */
export function enemyObjectInit(s:GmInstance,rt:GmRuntime){
 Object.assign(s,{becomeflash:0,flash:0,turnt:0,turns:0,talktimer:0,state:0,siner:0,fsiner:0,talked:0,attacked:0,hurt:0,hurttimer:0,hurtshake:0,shakex:0,acting:0,actcon:0,
  mywriter:343249823,acttimer:0,con:0,dodgetimer:0,fatal:0,candodge:0,mytarget:0,ambushed:0,firststrike:0,damage:-1,grazepoints:-1,timepoints:-1,inv:-1,target:-1,grazed:-1,
  grazetimer:-1,element:'none',actingsus:0,actingnoe:0,actingral:0,actconsus:0,actconral:0,actconnoe:0,simulorderkri:-1,simulordersus:-1,simulorderral:-1,simulordernoe:-1,
  simultotal:0,simulboss:-1,talkmax:90,mercymod:0,maxmercy:100,recruitable:1,freezable:1,recruitcount:1,sactionboxx:0,sactionboxy:0,hurtspriteoffx:0,hurtspriteoffy:0,
  imageXscale:2,imageYscale:2,imageSpeed:0.2,idlesprite:'spr_diamond_knight_overworld',hurtsprite:'spr_diamond_knight_hurt',sparedsprite:'spr_diamond_knight_spared',custombody:0});
 s._charactsprite=new Array(10).fill(382938298329);
 s.depth=90-(s.y-rt.view.y)/50;
}

/** The standard enemy's User 3 (obj_baseenemy's copy, which most enemies keep): the battle's rewards and how each
 * enemy was beaten (flag 51+n: 1 violence, 2 spared, 3 pacified, 5 Susie, 6 frozen) into the chapter's tallies. */
export function recordDefeat(s:GmInstance,rt:GmRuntime){
 const g=rt.globals,f=g.flag,me=s.myself,is=(a:number,b:number)=>eq(a,b);
 g.monstergold[3]+=g.monstergold[me];g.monsterexp[3]+=g.monsterexp[me];
 if(is(f[51+me],0)){f[51+me]=2;if(le(g.monsterhp[me],0))f[51+me]=1;}
 if(is(f[51+me],1)){f[40]+=1;if(is(s.fatal,1))f[44]++;}
 if(is(f[51+me],2))f[41]+=1;
 if(is(f[51+me],3))f[42]+=1;
 if(is(f[51+me],5))f[43]+=1;
 if(is(f[51+me],6)){f[45]+=1;g.monstergold[3]+=24;}
 s._amt_add=0;s._frozened=0;s._violenced=0;s._spared=0;s._pacified=0;
 for(s.d_i=0;lt(s.d_i,3);s.d_i+=1){
  const v=f[51+s.d_i];
  if(!is(v,0))s._amt_add+=1;if(is(v,1))s._violenced+=1;if(is(v,2))s._spared+=1;if(is(v,3))s._pacified+=1;if(is(v,6))s._frozened+=1;
 }
 if(gt(s._frozened,0))f[50]=6;if(gt(s._pacified,0))f[50]=3;if(gt(s._spared,0))f[50]=2;if(gt(s._violenced,0))f[50]=1;
 if(is(f[50],6))f[926]++;
 if(!is(f[54],0)){f[f[54]]=f[50];f[54]=0;}
}
