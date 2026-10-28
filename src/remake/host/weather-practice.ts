import type {GmRuntime} from '../gm/runtime';
import {findController} from '../deltarune/controller';
import type {PracticePattern} from './practice';

const director=(rt:GmRuntime)=>rt.instances.find(i=>i.live&&i.object.name==='obj_elnina_lanino_controller');
type Forecast=readonly [number,number];
const MOON_SNOW:Forecast=[1474,1650],SUN_RAIN:Forecast=[783,4256];
const MOON_RAIN:Forecast=[1474,4256],SUN_SNOW:Forecast=[783,1650];

function weatherPattern(name:string,turns:number,favored:0|1,forecast:Forecast):PracticePattern{
 return {name,setup:rt=>{
  const c=director(rt);if(!c)throw Error('Weather practice needs its source director.');
  // Enter immediately after the source forecast dialogue. The director still owns the box,
  // heart entrance, frame-12 type-130 spawner and its full 260/275/850-frame attack clock.
  // 68-71 are planning IDs; overriding a generic bullet controller with them is incorrect.
  Object.assign(c,{intro:4,talked:1,talktimer:0,balloonend:1,ballooncon:0,attacked:0,rtimer:0,
   turns,lastchosen:favored===0?'lanino':'elnina',sunboost:0,calculated_forecast:true,
   forecasts:Array.from({length:3},()=>[60,...forecast]),forecast_turn:turns-1});
  const tenna=rt.byId(c.tenna);if(tenna){tenna.y=rt.view.y-100;tenna.hspeed=0;tenna.vspeed=0;}
  // Full battle holds the turn for the choice/ending dialogue. Practice returns through the
  // normal reset + Alarm 2 path after the source timer expires, without declaring a victory.
  const panel=findController(rt);if(panel)panel.noreturn=0;
 }};
}

// Source obj_elnina_lanino_controller Step: turns 1/2 -> special 0; 3 -> 1;
// 4 -> 2; 5/6 -> 3; 7 -> 4. Later forecasts choose sun+snow or moon+rain.
// Both favored sides matter (sprite sizes, fire rates, chase directions and final dialogue).
export const WEATHER_PATTERNS:readonly PracticePattern[]=[
 weatherPattern('Moon & snow (Kissing mascots)',1,0,MOON_SNOW),
 weatherPattern('Sun & rain (Kissing mascots)',2,0,SUN_RAIN),
 weatherPattern('Larger moon & rain (Lanino favored)',3,0,MOON_RAIN),
 weatherPattern('Moon & larger rain (Elnina favored)',3,1,MOON_RAIN),
 weatherPattern('Large sun & snow (Lanino favored)',4,0,SUN_SNOW),
 weatherPattern('Sun & large snow (Elnina favored)',4,1,SUN_SNOW),
 weatherPattern('Large moon & rain (Lanino favored)',4,0,MOON_RAIN),
 weatherPattern('Moon & large rain (Elnina favored)',4,1,MOON_RAIN),
 weatherPattern('Chasing sun & snow (Lanino favored)',5,0,SUN_SNOW),
 weatherPattern('Chasing sun & snow (Elnina favored)',5,1,SUN_SNOW),
 weatherPattern('Chasing moon & rain (Lanino favored)',5,0,MOON_RAIN),
 weatherPattern('Chasing moon & rain (Elnina favored)',5,1,MOON_RAIN),
 weatherPattern('Final barrage (Lanino favored)',7,0,SUN_SNOW),
 weatherPattern('Final barrage (Elnina favored)',7,1,SUN_SNOW),
];
