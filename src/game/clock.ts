export class FixedClock{
 private accumulator=0;
 advance(seconds:number,step:()=>void){
  this.accumulator+=Math.min(Math.max(seconds,0),5/60);let n=0;
  while(this.accumulator+1e-9>=1/60&&n<5){this.accumulator-=1/60;step();n++;}
 }
 reset(){this.accumulator=0;}
}
