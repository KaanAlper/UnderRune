// Chapter 2's easing scripts: scr_ease_in/out/inout by kind (-3 bounce, -2 elastic, -1 back, 0 linear, 1 sine,
// 2..5 powers, 6 exponential, 7 circular) and lerp_ease_*, as the original computes them (including its quirks:
// inout kind 1 is -0.5 * cos(pi * t - 1)).

function easeOutBounce(t:number,start:number,change:number,duration:number){
 t/=duration;
 if(t<0.36363636363636365)return change*(7.5625*t*t)+start;
 if(t<0.7272727272727273){t-=0.5454545454545454;return change*(7.5625*t*t+0.75)+start;}
 if(t<0.9090909090909091){t-=0.8181818181818182;return change*(7.5625*t*t+0.9375)+start;}
 t-=0.9545454545454546;return change*(7.5625*t*t+0.984375)+start;
}
function easeInBounce(t:number,start:number,change:number,duration:number){return change-easeOutBounce(duration-t,0,change,duration)+start;}
function easeInoutBounce(t:number,start:number,change:number,duration:number){
 if(t<duration*0.5)return easeInBounce(t*2,0,change,duration)*0.5+start;
 return easeOutBounce(t*2-duration,0,change,duration)*0.5+change*0.5+start;
}
function easeOutElastic(time:number,start:number,arg2:number,duration:number){
 let s:number,p=0,change=arg2;
 if(time===0||change===0)return start;
 time/=duration;
 if(time===1)return start+arg2;
 if(!p)p=duration*0.3;
 if(change<Math.abs(arg2)){change=arg2;s=p*0.25;}else s=p/(2*Math.PI)*Math.asin(arg2/change);
 return change*Math.pow(2,-10*time)*Math.sin((time*duration-s)*(2*Math.PI)/p)+arg2+start;
}
function easeInElastic(t:number,start:number,change:number,duration:number){
 let s:number,p=0,a=change;
 if(t===0||a===0)return start;
 t/=duration;
 if(t===1)return start+change;
 if(p===0)p=duration*0.3;
 if(a<Math.abs(change)){a=change;s=p*0.25;}else s=p/(2*Math.PI)*Math.asin(change/a);
 t-=1;
 return -(a*Math.pow(2,10*t)*Math.sin((t*duration-s)*(2*Math.PI)/p))+start;
}
function easeInoutElastic(t:number,start:number,change:number,duration:number){
 let s:number,p=0,a=change;
 if(t===0||a===0)return start;
 t/=duration*0.5;
 if(t===2)return start+change;
 if(!p)p=duration*0.44999999999999996;
 if(a<Math.abs(change)){a=change;s=p*0.25;}else s=p/(2*Math.PI)*Math.asin(change/a);
 if(t<1){t-=1;return -0.5*(a*Math.pow(2,10*t)*Math.sin((t*duration-s)*(2*Math.PI)/p))+start;}
 t-=1;
 return a*Math.pow(2,-10*t)*Math.sin((t*duration-s)*(2*Math.PI)/p)*0.5+change+start;
}
function easeOutBack(t:number,start:number,change:number,duration:number){
 const s=1.70158;t=t/duration-1;return change*(t*t*((s+1)*t+s)+1)+start;
}
function easeInoutBack(t:number,start:number,change:number,duration:number){
 let s=1.70158;t/=duration;t*=2;
 if(t<1){s*=1.525;return change*0.5*(t*t*((s+1)*t-s))+start;}
 t-=2;s*=1.525;return change*0.5*(t*t*((s+1)*t+s)+2)+start;
}
/** scr_ease_out. */
export function easeOut(t:number,kind:number):number{
 if(kind<-3||kind>7)return t;
 switch(kind){
  case -3:return easeOutBounce(t,0,1,1);
  case -2:return easeOutElastic(t,0,1,1);
  case -1:return easeOutBack(t,0,1,1);
  case 0:return t;
  case 1:return Math.sin(t*1.5707963267948966);
  case 2:return -t*(t-2);
  case 6:return -Math.pow(2,-10*t)+1;
  case 7:t-=1;return Math.sqrt(1-t*t);
  default:t-=1;if(kind===4)return -1*(Math.pow(t,kind)-1);return Math.pow(t,kind)+1;
 }
}
/** scr_ease_in. */
export function easeIn(t:number,kind:number):number{
 if(kind<-3||kind>7)return t;
 switch(kind){
  case -3:return easeInBounce(t,0,1,1);
  case -2:return easeInElastic(t,0,1,1);
  case -1:{const s=1.70158;return t*t*((s+1)*t-s);}
  case 0:return t;
  case 1:return -Math.cos(t*1.5707963267948966)+1;
  case 6:return Math.pow(2,10*(t-1));
  case 7:return -(Math.sqrt(1-t*t)-1);
  default:return Math.pow(t,kind);
 }
}
/** scr_ease_inout. */
export function easeInout(t:number,kind:number):number{
 if(kind<-3||kind>7)return t;
 if(kind===-3)return easeInoutBounce(t,0,1,1);
 if(kind===-2)return easeInoutElastic(t,0,1,1);
 if(kind===-1)return easeInoutBack(t,0,1,1);
 if(kind===1)return -0.5*Math.cos(Math.PI*t-1);
 if(kind===0)return t;
 t*=2;
 if(t<1)return 0.5*easeIn(t,kind);
 t-=1;return 0.5*(easeOut(t,kind)+1);
}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** lerp_ease_out, lerp_ease_in, lerp_ease_inout. */
export const lerpEaseOut=(a:number,b:number,t:number,kind:number)=>lerp(a,b,easeOut(t,kind));
export const lerpEaseIn=(a:number,b:number,t:number,kind:number)=>lerp(a,b,easeIn(t,kind));
export const lerpEaseInout=(a:number,b:number,t:number,kind:number)=>lerp(a,b,easeInout(t,kind));
