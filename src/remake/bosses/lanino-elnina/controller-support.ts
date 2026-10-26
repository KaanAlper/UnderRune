// Small source scripts and the ephemeral TV speech balloons used by encounter 113.
import {type GmInstance,type GmObjectDef,type GmRuntime} from '../../gm/runtime';
import {eq,gt,lt,lengthdirX,lengthdirY} from '../../gm/math';
import {C} from '../../gm/graphics';
import {isPhase,scriptDelayedOn,setVar} from '../../deltarune/chapter2-battle';
import {speaker as sharedSpeaker} from '../../deltarune/chapter2-enemy';
import {enemyBlcon2} from '../../deltarune/chapter2-objects';
import {guardPeek} from '../../deltarune/guard-peek';
import {sourceText} from '../../host/text';

export interface WeatherScriptHost{call(name:string,s:GmInstance,rt:GmRuntime,args:any[]):any;}
/** Source draw call arguments evaluate right to left, including its y-then-x jitter. */
export function drawWeatherJitter(rt:GmRuntime,sprite:string,x:number,y:number,alpha:number){
 const dy=rt.random.irandom(2),dx=rt.random.irandom(2);rt.drawSprite(sprite,0,x+dx,y+dy,3,3,0,C.white,alpha);
}
type Reference=GmObjectDef|GmInstance|number;
/** Numeric booleans and GML's tolerant real comparisons, with ordinary string equality. */
export function weatherEqual(a:unknown,b:unknown):boolean{
 if((typeof a==='number'||typeof a==='boolean')&&(typeof b==='number'||typeof b==='boolean'))return eq(Number(a),Number(b));
 return a===b;
}
const WEATHER_SPRITES:Readonly<Record<number,string>>={
 "679": "spr_enemy_lanino_head_gloating",
 "783": "spr_weather_sun",
 "871": "spr_enemy_elnina_head_angry",
 "930": "spr_enemy_elnina_torso",
 "1010": "spr_enemy_lanino_removeglasses",
 "1063": "spr_enemy_elnina_head_sunglasses",
 "1196": "spr_enemy_elnina_head_gloating",
 "1214": "spr_enemy_elnina_head_crying",
 "1271": "spr_enemy_lanino_head_serious",
 "1331": "spr_enemy_lanino_lefthand",
 "1465": "spr_enemy_elnina_leftarm",
 "1474": "spr_weather_moon",
 "1641": "spr_enemy_elnina_rightarm",
 "1650": "spr_weather_snow",
 "1660": "spr_enemy_elnina_lefthand",
 "1715": "spr_enemy_elnina_skirt",
 "1888": "spr_enemy_elnina_removeglasses",
 "2138": "spr_enemy_lanino_head_crying",
 "2590": "spr_enemy_lanino_head_sunglasses",
 "2741": "spr_enemy_lanino_head_blush",
 "3079": "spr_enemy_lanino_chest",
 "3264": "spr_enemy_lanino_head_sad",
 "3799": "spr_enemy_elnina_head_shocked",
 "3840": "spr_enemy_lanino_leftarm",
 "4006": "spr_enemy_lanino_legs",
 "4213": "spr_enemy_elnina_head_blush",
 "4256": "spr_weather_rain",
 "4436": "spr_enemy_elnina_head_sad",
 "4526": "spr_enemy_lanino_shoulderflames",
 "4531": "spr_enemy_lanino_head_angry",
 "4545": "spr_enemy_lanino_head_shocked",
 "4565": "spr_enemy_elnina_hairtufts",
 "4846": "spr_enemy_elnina_head_smiling"
};
export function weatherSprite(v:string|number):string{
 if(typeof v==='string')return v;
 const name=WEATHER_SPRITES[v];if(!name)throw Error(`Weather sprite ${v} is not ported`);return name;
}
export function weatherHelpers(object:(name:string)=>GmObjectDef,host?:WeatherScriptHost){
 const targets=(rt:GmRuntime,v:Reference):GmInstance[]=>{
  if(typeof v==='number'){const i=rt.byId(v);return i?[i]:rt.instances.filter(i=>i.live&&i.object.index===v);}
  if('id' in v)return v.live?[v as GmInstance]:[];
  return rt.all(v);
 };
 const resolve=(rt:GmRuntime,v:Reference):GmInstance=>{
  const i=targets(rt,v)[0];if(!i)throw Error(`Weather controller requires live ${typeof v==='object'&&'name' in v?v.name:String(v)}`);return i;
 };
 const balloon=(s:GmInstance,rt:GmRuntime,x:number,y:number,kind:number)=>{
  const b=enemyBlcon2(s,rt,x,y,kind);if(!b)throw Error(`Weather balloon kind ${kind} is not ported`);return b.id;
 };
 const heroBalloon=(s:GmInstance,rt:GmRuntime,hero:string)=>{
  const h=rt.first(object('obj_hero'+hero));if(!h)return false;
  const b=balloon(s,rt,h.x+100,h.y+40,10);resolve(rt,b).side=-1;return b;
 };
 const selectHero=(s:GmInstance,hero:string)=>{
  s._charactor=hero;s._charinstance=object('obj_herokris').index;
  const numbers:Record<string,number>={kris:1,susie:2,ralsei:3,noelle:4};
  if(numbers[hero]!==undefined){s._charinstance=object('obj_hero'+hero).index;s._charnum=numbers[hero];}
  return object('obj_hero'+hero);
 };
 const battleSpriteSet=(s:GmInstance,rt:GmRuntime,hero:string,sprite:string,speed:number,end:number)=>{
  for(const h of rt.all(selectHero(s,hero))){h.state=8;h.hurt=0;h.attacktimer=0;h.sprite=sprite;h.imageSpeed=speed;h.imageIndex=0;if(eq(end,0))h.maxframes=rt.bank.get(sprite)?.frames??0;rt.globals.faceaction[h.myself]=0;}
 };
 const battleSpriteReset=(s:GmInstance,rt:GmRuntime,hero:string)=>{
  for(const h of rt.all(selectHero(s,hero))){h.state=0;h.hurt=0;h.attacktimer=0;h.attacked=0;h.maxframes=0;rt.globals.faceaction[h.myself]=0;}
 };
 const speaker=(s:GmInstance,rt:GmRuntime,who:string)=>{sharedSpeaker(s,rt,who);if(who==='tenna')rt.globals.typer=eq(rt.globals.fighting,1)?81:80;};
 const peek=(s:GmInstance,rt:GmRuntime,hero:GmObjectDef)=>guardPeek(s,rt,resolve(rt,hero),object('obj_battle_marker'),object('obj_heroralsei'),object('obj_herosusie'));
 const delayVar=(s:GmInstance,rt:GmRuntime,name:string,value:unknown,delay:number)=>scriptDelayedOn(s,rt,setVar,delay,name,value);
 const call=(name:string,s:GmInstance,rt:GmRuntime,args:unknown[])=>{if(!host)throw Error(`Weather controller needs host script ${name}`);return host.call(name,s,rt,args);};
 return {targets,resolve,balloon,heroBalloon,battleSpriteSet,battleSpriteReset,speaker,peek,delayVar,
  phase:(s:GmInstance,rt:GmRuntime,name:Parameters<typeof isPhase>[1])=>isPhase(rt,name,s),
  initMusic:(s:GmInstance,rt:GmRuntime,file:string)=>call('snd_init',s,rt,[file]),
  loopMusic:(s:GmInstance,rt:GmRuntime,stream:number,volume:number,pitch:number)=>call('mus_loop_ext',s,rt,[stream,volume,pitch]),
  volume:(s:GmInstance,rt:GmRuntime,stream:number,volume:number,time:number)=>call('mus_volume',s,rt,[stream,volume,time]),
 };
}
export function createWeatherSupport(object:(name:string)=>GmObjectDef):GmObjectDef[]{
 return [{...object('obj_ilovetv'),events:{
  create:s=>{s.imageXscale=.75;s.imageYscale=.5;s.timer=0;s.duration=18;},
  step:(s,rt)=>{
   const angle=s.timer*(360/s.duration)+(lt(s.imageXscale,0)?180:0);
   s.x=s.xstart+lengthdirX(15,angle);s.y=s.ystart+lengthdirY(15,angle);s.timer++;s.imageAlpha=2-(s.timer/s.duration)*2;
   if(gt(s.timer,s.duration))rt.destroy(s);
  },
  draw:(s,rt)=>{
   rt.drawSelf(s);rt.drawState.color=C.black;rt.drawState.font='fnt_main';
   const tx=gt(s.imageXscale,0)?s.x+7:s.x+rt.spriteWidth(s)+22;
   rt.drawState.alpha=s.imageAlpha;rt.drawText(tx,s.y+6,sourceText('obj_ilovetv_slash_Draw_0_gml_7_0'),1,1,0);
   rt.drawState.alpha=1;rt.drawState.color=C.white;
  },
 }}];
}
