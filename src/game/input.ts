/** menu is the C key (DELTARUNE's third button: menus, and K.Round's Ralsei throw). */
/** arrows: the directions pressed since the last read (games that read key presses, not held directions). */
export type InputFrame={x:number;y:number;confirm:boolean;cancel:boolean;menu:boolean;restart:boolean;pause:boolean;slow:boolean;shoot:boolean;shootReleased?:boolean;arrows?:('left'|'right'|'up'|'down')[]};
const norm=(key:string)=>key.length===1?key.toLowerCase():key;
const confirmKeys=['z','Enter',' '];
export class Input{
 private held=new Set<string>();private edges=new Set<string>();
 private confirmRelease=false;
 private confirmReleaseMode:'logical'|'independent'='logical';
 setConfirmReleaseMode(mode:'logical'|'independent'){this.clear();this.confirmReleaseMode=mode;}
 press(key:string){key=norm(key);if(!this.held.has(key))this.edges.add(key);this.held.add(key);}
 // The owner reserves independent confirm-release quick-fire for the staged solo Weird route.
 release(key:string){key=norm(key);if(this.held.delete(key)&&confirmKeys.includes(key)&&(this.confirmReleaseMode==='independent'||!confirmKeys.some(k=>this.held.has(k))))this.confirmRelease=true;}
 clear(){this.held.clear();this.edges.clear();this.confirmRelease=false;}
 read():InputFrame{
  const has=(...keys:string[])=>keys.some(k=>this.held.has(k)),edge=(...keys:string[])=>keys.some(k=>this.edges.has(k));
  const f={x:Number(has('ArrowRight','d'))-Number(has('ArrowLeft','a')),y:Number(has('ArrowDown','s'))-Number(has('ArrowUp','w')),confirm:edge('z','Enter',' '),cancel:edge('x','Escape'),menu:edge('c'),restart:edge('r'),pause:edge('p'),arrows:([['left','ArrowLeft','a'],['right','ArrowRight','d'],['up','ArrowUp','w'],['down','ArrowDown','s']] as const).filter(([,...k])=>edge(...k)).map(([d])=>d),slow:has('Shift','x'),shoot:has('z','Enter',' ')};
  this.edges.clear();const shootReleased=this.confirmRelease;this.confirmRelease=false;return {...f,shootReleased};
 }
 bind(target:Window,onBlur:()=>void){
  const down=(e:KeyboardEvent)=>{if(e.ctrlKey||e.altKey||e.metaKey)return;if(e.target instanceof HTMLElement&&(e.target.closest('select,input,textarea,[contenteditable],dialog[open],.leaderboard')||(['Enter',' '].includes(e.key)&&e.target.closest('.boss-deck button')))){this.clear();return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter','Escape','z','x','c','r','p','w','a','s','d','Shift'].includes(e.key)){e.preventDefault();this.press(e.key);}};
  const up=(e:KeyboardEvent)=>this.release(e.key),blur=()=>{this.clear();onBlur();};
  target.addEventListener('keydown',down);target.addEventListener('keyup',up);target.addEventListener('blur',blur);
  return ()=>{target.removeEventListener('keydown',down);target.removeEventListener('keyup',up);target.removeEventListener('blur',blur);this.clear();};
 }
}
