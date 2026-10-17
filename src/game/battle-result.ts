// The result screen after a won battle, drawn over the faded battle: YOU WON, the boss, the run's numbers and, when
// the shared leaderboard answers, the place this run would take on it. Lines come in one after another.
import type {AssetStore} from './assets';
import type {RunRecord} from './battle-run';

export type Placement={place:number;of:number};
export type VictoryLine={label:string;value:string};

/** cubic-bezier(0.23, 1, 0.32, 1): a strong ease-out, solved for x by Newton steps. */
function easeOut(x:number){
 const [x1,y1,x2,y2]=[0.23,1,0.32,1];
 const bez=(t:number,a:number,b:number)=>3*a*t*(1-t)**2+3*b*t*t*(1-t)+t**3;
 const slope=(t:number,a:number,b:number)=>3*a*(1-t)**2+6*(b-a)*t*(1-t)+3*(1-b)*t*t;
 let t=x;for(let i=0;i<6;i++){const d=slope(t,x1,x2);if(Math.abs(d)<1e-6)break;t-=(bez(t,x1,x2)-x)/d;t=Math.min(1,Math.max(0,t));}
 return bez(t,y1,y2);
}
export const formatTime=(ms:number)=>{const s=Math.floor(ms/1000),cs=Math.floor(ms%1000/10);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;};

export function victoryLines(turns:number,run:RunRecord|null):VictoryLine[]{
 const lines:VictoryLine[]=[];
 if(run)lines.push({label:'TIME',value:formatTime(run.duration_ms)});
 lines.push({label:'TURNS',value:String(turns)});
 if(run){lines.push({label:'DAMAGE TAKEN',value:String(run.damage)});lines.push({label:'ITEMS USED',value:String(run.used_items.length)});}
 return lines;
}

export class VictoryCard{
 /** 'loading' while the leaderboard is asked; null when there is no board to ask (practice, local runs, no service). */
 placement:Placement|'loading'|null;
 private placedAt=0;
 constructor(readonly boss:string,readonly lines:VictoryLine[],ranked:boolean,private readonly shownAt=performance.now()){this.placement=ranked?'loading':null;}
 place(p:Placement|null){this.placement=p;this.placedAt=performance.now();}
 draw(ctx:CanvasRenderingContext2D,assets:AssetStore,now:number,reduce:boolean){
  // Each piece fades in (and rises 8px) over 260ms, 70ms after the one before; reduced motion keeps only the fade.
  const reveal=(order:number,from=this.shownAt)=>{const p=Math.min(1,Math.max(0,(now-from-order*70)/260));return reduce?{alpha:p,dy:0}:{alpha:easeOut(p),dy:(1-easeOut(p))*8};};
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.72)';ctx.globalAlpha=Math.min(1,(now-this.shownAt)/200);ctx.fillRect(0,0,640,480);
  const text=(order:number,s:string,x:number,y:number,scale:number,color:string,align:'left'|'center'|'right'='center',from?:number)=>{
   const r=reveal(order,from);if(r.alpha<=0)return;ctx.globalAlpha=r.alpha;assets.text(ctx,s,x,y+r.dy,scale,color,align);
  };
  text(0,'* YOU WON!',320,96,3,'#ffff00');
  text(1,this.boss.toUpperCase(),320,156,1,'#c5bed2');
  this.lines.forEach((line,i)=>{text(2+i,line.label,186,206+i*32,1,'#a7a0b5','left');text(2+i,line.value,454,206+i*32,1,'#ffffff','right');});
  const below=206+this.lines.length*32+28,after=2+this.lines.length;
  if(this.placement==='loading')text(after,'CHECKING THE LEADERBOARD...',320,below,1,'#a7a0b5');
  else if(this.placement)text(0,`LEADERBOARD  #${this.placement.place} OF ${this.placement.of}`,320,below,2,this.placement.place===1?'#ffff00':'#ffffff','center',Math.max(this.placedAt,this.shownAt+after*70));
  ctx.restore();
 }
}
