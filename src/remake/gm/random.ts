// GameMaker's WELL512 generator and the draw functions built on it, matching the Butterscotch runtime
// (src/random.c and the random builtins, AGPL-3.0) so a remake run can reproduce the original's random sequence.
const RAND_MAX=0xffffffff;

export class GmRandom{
 private state=new Uint32Array(16);private index=0;
 constructor(seed=0){this.setSeed(seed);}
 setSeed(seed:number){
  this.state[0]=seed>>>0;
  for(let i=1;i<16;i++){const p=this.state[i-1];this.state[i]=(i+Math.imul(0x6c078965,(p^(p>>>30))>>>0))>>>0;}
 }
 next():number{
  const s=this.state;
  let a=s[this.index],c=s[(this.index+13)&15];
  const b=(a^c^(a<<16)^(c<<15))>>>0;
  c=s[(this.index+9)&15];c=(c^(c>>>11))>>>0;
  a=s[this.index]=(b^c)>>>0;
  const d=(a^((a<<5)&0xda442d24))>>>0;
  this.index=(this.index+15)&15;
  a=s[this.index];
  s[this.index]=(a^b^d^(a<<2)^(b<<18)^(c<<28))>>>0;
  return s[this.index];
 }
 random(n:number){return this.next()/RAND_MAX*n;}
 randomRange(lo:number,hi:number){return lo+this.next()/RAND_MAX*(hi-lo);}
 irandom(n:number){const k=Math.trunc(n)|0;return k<=0?0:this.next()%(k+1);}
 irandomRange(lo:number,hi:number){let a=Math.trunc(lo)|0,b=Math.trunc(hi)|0;if(a>b)[a,b]=[b,a];const range=b-a+1;return range<=0?a:a+this.next()%range;}
 choose<T>(...options:T[]):T{return options[this.next()%options.length];}
 /** [index, s0..s15], the layout written by the runtime's parity trace. */
 snapshot(){return [this.index,...this.state];}
 static restore(snapshot:readonly number[]){const r=new GmRandom();r.index=snapshot[0];r.state.set(snapshot.slice(1,17));return r;}
}
