/** The shell owns state; adapters own the active scene's lifecycle, input and drawing. */
export interface SceneAdapter<Keys>{
 enter():void;
 exit():void;
 input(keys:Keys):void;
 draw():void;
}
export class SceneMachine<Name extends string,Keys>{
 private active:Name;
 private started=false;
 constructor(initial:Name,private readonly adapters:Record<Name,SceneAdapter<Keys>>,private readonly beforeEnter:()=>void=()=>{}){this.active=initial;}
 get current():Name{return this.active;}
 start(){if(!this.started){this.started=true;this.adapters[this.active].enter();}}
 /** Replacing resources (a battle retry) refreshes entry without disposing the new resource. */
 transition(next:Name,refresh=false){
  if(next===this.active&&!refresh)return;
  if(next!==this.active)this.adapters[this.active].exit();
  this.beforeEnter();
  this.active=next;
  this.adapters[next].enter();
 }
 input(keys:Keys,blocked=false){if(!blocked)this.adapters[this.active].input(keys);}
 draw(){this.adapters[this.active].draw();}
}
export interface SceneTicket{readonly revision:number;readonly signal:AbortSignal;}
/** Each navigation or new load invalidates earlier completions, including their finally handlers. */
export class SceneWork{
 private generation=0;
 private controller:AbortController|null=null;
 get revision(){return this.generation;}
 get pending(){return this.controller!==null;}
 begin():SceneTicket{this.cancel();this.controller=new AbortController();return {revision:this.generation,signal:this.controller.signal};}
 current(ticket:SceneTicket){return ticket.revision===this.generation&&!ticket.signal.aborted;}
 finish(ticket:SceneTicket){if(!this.current(ticket))return false;this.controller=null;return true;}
 cancel(){this.generation++;this.controller?.abort();this.controller=null;}
}

/** A launch may replace a battle before changing scenes. Its former scene must not close the replacement. */
export function ownedScene<Resource,Keys>(current:()=>Resource|null,adapter:SceneAdapter<Keys>):SceneAdapter<Keys>{
 let owned:Resource|null=null;
 return {
  enter(){owned=current();adapter.enter();},
  exit(){if(owned!==null&&current()===owned)adapter.exit();owned=null;},
  input:keys=>adapter.input(keys),
  draw:()=>adapter.draw(),
 };
}
