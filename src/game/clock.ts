export class FixedClock{
 private accumulator=0;
 advance(seconds:number,step:()=>void,maxSteps=5){
  // Source Draw events also advance game state: finish each one, but discard wall-clock debt that would
  // otherwise chain several expensive source frames before the browser can present or receive input.
  this.accumulator=Math.min(this.accumulator+Math.max(seconds,0),maxSteps/60);let n=0;
  while(this.accumulator+1e-9>=1/60&&n<maxSteps){this.accumulator-=1/60;step();n++;}
 }
 reset(){this.accumulator=0;}
}
