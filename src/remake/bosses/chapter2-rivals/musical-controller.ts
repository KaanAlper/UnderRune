// obj_musical_controller: the band's turn keeper. At the end of each enemy turn (user event 0) it counts down the
// dancing, has a bandmate snap out of it when the party is not dancing with them, and starts Sweet's S-Action scene;
// when a bandmate is nearly beaten, it runs the milk scene that heals them.
import type {GmInstance,GmObjectDef,GmRuntime} from '../../gm/runtime';
import {darkMarker,dmgWriter} from '../../deltarune/battle';
import {healAnim,healItem} from '../../deltarune/party';
import {msgNext,msgSet} from '../../deltarune/chapter2-battle';
import {speaker} from '../../deltarune/chapter2-enemy';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {battleText,battleTextDefault,writer} from '../../deltarune/writer';
import {button1_p} from '../../deltarune/keys';
import {snd} from '../../deltarune/sound';
import {sourceText} from '../../host/text';

/** Its lines, by event (whole events: the asset build brings in every line of a prefix ending in _gml_). */
const EVENTS:Readonly<Record<string,string>>={Alarm_0:'obj_musical_controller_slash_Alarm_0_gml_',Alarm_1:'obj_musical_controller_slash_Alarm_1_gml_',
 Alarm_2:'obj_musical_controller_slash_Alarm_2_gml_',Step_0:'obj_musical_controller_slash_Step_0_gml_'};
const T=(event:string,key:string)=>sourceText(EVENTS[event]+key);
/** Who is healed by the milk: [Sweet, K_K, Cap'n] for each whohealed, and the milk's height. */
const HEALED:Readonly<Record<number,readonly [boolean,boolean,boolean]>>={1:[true,false,false],2:[false,true,false],3:[false,false,true],4:[true,true,false],5:[true,false,true],6:[false,true,true],7:[true,true,true]};
/** What the two bandmates say before the milk, by whohealed: [speaker, key] pairs. */
const MILK_LINES:Readonly<Record<number,readonly (readonly [string,string])[]>>={
 1:[['obj_sweet_enemy','52_0'],['obj_kk_enemy','57_0']],2:[['obj_kk_enemy','66_0'],['obj_hatguy_enemy','71_0']],3:[['obj_hatguy_enemy','80_0'],['obj_sweet_enemy','85_0']],
 4:[['obj_sweet_enemy','94_0'],['obj_kk_enemy','99_0']],5:[['obj_sweet_enemy','108_0'],['obj_hatguy_enemy','113_0']],6:[['obj_kk_enemy','122_0'],['obj_hatguy_enemy','127_0']],
 7:[['obj_sweet_enemy','108_0'],['obj_kk_enemy','127_0']],
};
const HP_UP:Readonly<Record<number,readonly string[]>>={1:['260_0'],2:['261_0'],3:['262_0'],4:['263_0'],5:['264_0'],6:['265_0'],7:['284_0','262_0']};
const BAND=['obj_sweet_enemy','obj_kk_enemy','obj_hatguy_enemy'] as const;

export function createMusicalController(object:(name:string)=>GmObjectDef):GmObjectDef{
 const one=(rt:GmRuntime,name:string)=>rt.first(object(name));
 const sweet=(rt:GmRuntime)=>{const s=one(rt,'obj_sweet_enemy');if(!s)throw Error('obj_musical_controller needs Sweet');return s;};
 const controllers=(rt:GmRuntime)=>rt.withInstances(object('obj_battlecontroller'));
 const low=(rt:GmRuntime,name:string)=>{const e=one(rt,name);return !!e&&rt.globals.monsterhp[e.myself]<2;};
 /** One bandmate's line in their balloon. */
 const say=(rt:GmRuntime,name:string,text:string)=>{for(const e of rt.withInstances(object(name))){msgSet(rt,0,text);enemyBlcon2(e,rt,e.x-10,rt.globals.monstery[e.myself],10);}};
 /** User event 0, the end of an enemy turn: dancing bandmates that were danced with once snap out of it (unless the
  * scene that taught Susie to ACT just happened), dance counters run down, and K_K reports. */
 function endOfTurn(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;s.turnspassed++;s.alarm[0]=1;s.c=0;
  let all=1;if(g.flag[34]===0&&(g.hp[1]<1||g.hp[2]<1||g.hp[3]<1))all=0;
  if(all!==1)return;
  g.typer=50;
  for(const [name,dx] of [['obj_sweet_enemy',0],['obj_hatguy_enemy',0],['obj_kk_enemy',30]] as const){
   const e=one(rt,name);if(!e||e.dancing!=1||e.danceCounter!==1||s.happyfeetscene===1)continue;
   s.alarm[2]=30;s.alarm[0]=-1;s.skiptext=1;
   for(const m of rt.withInstances(object(name))){m.hurtstate2=1;rt.create(object('obj_excblcon'),m.x+rt.spriteWidth(m)/2+dx,m.y-12);}
  }
  for(const name of ['obj_sweet_enemy','obj_hatguy_enemy','obj_kk_enemy'])for(const e of rt.withInstances(object(name)))if(e.dancing==1){e.danceCounter--;if(e.danceCounter<=0)e.dancing=0;}
  if(s.ralseiportrait===0)for(const k of rt.withInstances(object('obj_kk_enemy')))rt.userEvent(k,1);
 }
 return {...object('obj_musical_controller'),events:{
  create:s=>{Object.assign(s,{turnspassed:0,scon:0,milktimer:0,whohealed:0,a:0,c:0,rr:0,theystoppeddancing:0,skiptext:0,happyfeetscene:0,d:0,ralseiportrait:0});},
  user0:endOfTurn,
  // The party's turn comes back: Susie's complaint once they stopped dancing; with Kris down (or after three dances),
  // Sweet's scene teaching Susie to ACT; otherwise the menus.
  alarm0:(s,rt)=>{
   const g=rt.globals;for(const w of rt.withInstances(writer))rt.destroy(w);
   if(s.theystoppeddancing===1){
    s.alarm[0]=-1;g.typer=6;s.theystoppeddancing=2;speaker(s,rt,'susie');msgSet(rt,0,T('Alarm_0','11_0'));msgNext(rt,T('Alarm_0','12_0'));
    if(rt.exists(object('obj_cutscene_master')))throw Error('c_facenext beside a cutscene is not ported');
    battleText(rt,s);return;
   }
   const sw=sweet(rt);
   if(g.hp[1]<=0&&s.happyfeetscene===0||sw.actCounter>3&&s.happyfeetscene===0){
    for(const c of controllers(rt))c.noreturn=1;sw.dancecon=1;sw.postattackscene=1;
    if(g.hp[2]<1){s.star=1;healItem(s,rt,Math.abs(g.hp[2])+1);}
    if(g.hp[3]<1){s.star=2;healItem(s,rt,Math.abs(g.hp[3])+1);}
    return;
   }
   s.skiptext=0;for(const c of controllers(rt))c.noreturn=0;
   for(const c of controllers(rt)){if(s.ralseiportrait===1)speaker(c,rt,'ralsei');c.alarm[2]=2;}
  },
  // Their complaints on snapping out of the dance.
  alarm1:(s,rt)=>{
   const g=rt.globals;for(const w of rt.withInstances(writer))rt.destroy(w);g.typer=50;
   for(const [name,key] of [['obj_sweet_enemy','12_0'],['obj_kk_enemy','21_0'],['obj_hatguy_enemy','30_0']] as const){
    const e=one(rt,name);if(!e||e.hurtstate2!==1)continue;
    for(const m of rt.withInstances(object(name))){m.hurtstate2=0;msgSet(rt,0,T('Alarm_1',key));enemyBlcon2(m,rt,m.x-10,g.monstery[m.myself],10);}
   }
  },
  // The narration of who snapped out of it.
  alarm2:(s,rt)=>{
   for(const w of rt.withInstances(writer))rt.destroy(w);
   const sw=sweet(rt),kk=one(rt,'obj_kk_enemy'),capn=one(rt,'obj_hatguy_enemy');
   if(sw.hurtstate2===1){msgSet(rt,0,T('Alarm_2',kk?.hurtstate2===1||capn?.hurtstate2===1?'8_0':'12_0'));sw.stoppeddancingcounter++;}
   if(kk?.hurtstate2===1){msgSet(rt,0,T('Alarm_2',capn?.hurtstate2===1?'20_0':'24_0'));sw.stoppeddancingcounter++;}
   if(capn?.hurtstate2===1){msgSet(rt,0,T('Alarm_2','30_0'));sw.stoppeddancingcounter++;}
   battleTextDefault(rt,s);s.d=1;
  },
  step:(s,rt)=>{
   const g=rt.globals;
   if(s.theystoppeddancing===2&&!rt.exists(writer)){speaker(s,rt,'none');s.theystoppeddancing=0;s.alarm[0]=2;}
   // Z hurries the snapped-out lines.
   if(s.skiptext===1&&button1_p(rt)){
    if(s.alarm[1]>1&&s.alarm[1]<=45){s.alarm[1]=1;if(s.alarm[0]>60)s.alarm[0]=60;}
    if(s.alarm[0]>1&&s.alarm[0]<=60)s.alarm[0]=1;
   }
   if(s.d===1)g.turntimer=999;
   if(s.d===1&&!rt.exists(writer)){s.d=0;s.alarm[0]=61;s.alarm[1]=1;}
   milkScene(s,rt);
  },
 }};
 /** A bandmate near 0 HP: they ask for milk, a carton flies in, and the low ones heal to full (scon 1 to 7). */
 function milkScene(s:GmInstance,rt:GmRuntime){
  const g=rt.globals;
  if(s.scon===1)s.scon=1.5;
  if(s.scon===1.5&&!rt.exists(writer)){
   g.turntimer=999;for(const w of rt.withInstances(writer))rt.destroy(w);g.typer=50;s.whohealed=0;
   const [sw,kk,capn]=BAND.map(n=>low(rt,n));
   if(sw&&kk&&capn)s.whohealed=7;else if(sw&&kk)s.whohealed=4;else if(sw&&capn)s.whohealed=5;else if(capn&&kk)s.whohealed=6;
   else if(sw)s.whohealed=1;else if(kk)s.whohealed=2;else if(capn)s.whohealed=3;
   for(const [name,key] of MILK_LINES[s.whohealed]??[])say(rt,name,T('Step_0',key));
   s.scon=1.6;s.milktimer=0;
  }
  if(s.scon===1.6){s.milktimer++;if(s.milktimer>=60){s.scon=1.7;s.milktimer=0;}}
  if(s.scon===1.7){
   for(const w of rt.withInstances(writer))rt.destroy(w);
   const y=s.whohealed===1?90:s.whohealed===3?240:180;
   snd(rt,'snd_magicsprinkle');
   const milk=darkMarker(rt,s,s.x-100,rt.view.y+y,'spr_checkers_milk');s.milk=milk.id;
   milk.imageSpeed=0;milk.imageXscale=4;milk.imageYscale=4;milk.imageAlpha=0;milk.depth=s.depth-1;s.milktimer=0;s.scon=2;
  }
  if(s.scon===2){
   for(const m of rt.withInstances(object('obj_marker')))if(m.id===s.milk){m.imageXscale-=.2;m.imageYscale-=.2;m.imageAlpha+=.1;}
   s.milktimer+=1;
   if(s.milktimer>=10){s.scon=3;s.milktimer=0;const m=rt.byId(s.milk);if(m)m.imageAlpha=1.4;}
  }
  if(s.scon===3){s.milktimer+=1;if(s.milktimer>=25){s.scon=4;s.milktimer=0;}}
  if(s.scon===4){
   const m=rt.byId(s.milk);if(m){m.hspeed+=2;m.imageAlpha-=.1;}
   s.milktimer+=1;
   if(s.milktimer===10){
    const healed=HEALED[s.whohealed];
    if(healed)BAND.forEach((name,i)=>{
     if(!healed[i])return;
     for(const e of rt.withInstances(object(name))){
      g.monsterhp[e.myself]=g.monstermaxhp[e.myself];
      const w=rt.create(dmgWriter,g.monsterx[e.myself],g.monstery[e.myself]);e.healamt=w.id;
      const first=one(rt,name)!;w.delay=8;w.type=3;w.damage=g.monstermaxhp[first.myself];w.specialmessage=3;
      const a=rt.create(healAnim,e.x,e.y);e.hanim=a.id;a.target=e.id;
     }
    });
   }
   if(s.milktimer>=15){const milk=rt.byId(s.milk);if(milk)rt.destroy(milk);s.scon=5;s.milktimer=0;}
  }
  if(s.scon===5){
   s.milktimer+=1;
   if(s.milktimer>=30){
    for(const w of rt.withInstances(writer))rt.destroy(w);s.scon=6;
    const keys=HP_UP[s.whohealed];if(keys){msgSet(rt,0,T('Step_0',keys[0]));for(const k of keys.slice(1))msgNext(rt,T('Step_0',k));}
    battleTextDefault(rt,s);
   }
  }
  if(s.scon===6){g.turntimer=999;if(!rt.exists(writer)){g.fc=0;s.scon=7;s.milktimer=0;g.turntimer=5;}}
  if(s.scon===7){const c=rt.first(object('obj_battlecontroller'));if(c&&c.alarm[2]>1){s.scon=0;c.alarm[2]=1;}}
 }
}
