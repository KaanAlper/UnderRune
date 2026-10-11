import {assetUrl} from './url';
export class AudioManager{
 private track:HTMLAudioElement|null=null;private context:AudioContext|null=null;private disposed=false;private audible=false;private paused=false;
 constructor(public muted=false,private available:string[]=[]){ }
 unlock(){this.audible=true;if(this.disposed)return;try{if(!this.context)this.context=new AudioContext();void this.context.resume().catch(()=>{});if(this.track&&!this.muted&&!this.paused)void this.track.play().catch(()=>{});}catch{}}
 play(name:string){
  this.stop();this.paused=false;if(!this.available.includes(name))return;const audio=new Audio(assetUrl('/generated/music/'+name+'.ogg'));audio.loop=true;audio.volume=.38;audio.muted=this.muted;this.track=audio;if(this.audible&&!this.muted)void audio.play().catch(()=>{});
 }
 setMuted(muted:boolean){this.muted=muted;if(this.track){this.track.muted=muted;if(!muted&&this.audible&&!this.paused)void this.track.play().catch(()=>{});}}
 pause(value:boolean){this.paused=value;if(!this.track)return;if(value)this.track.pause();else if(!this.muted&&this.audible)void this.track.play().catch(()=>{});}
 effect(name:string){
  if(this.muted||!this.audible||!this.context||this.disposed)return;
  const ctx=this.context,o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=name==='hurt'?85:name==='fight'?140:name==='shot'?660:name==='block'?880:320;g.gain.setValueAtTime(.025,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.06);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.07);
 }
 stop(){if(this.track){this.track.pause();this.track.removeAttribute('src');this.track.load();this.track=null;}}
 dispose(){this.stop();this.disposed=true;if(this.context)void this.context.close().catch(()=>{});}
}
