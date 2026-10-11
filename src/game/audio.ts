import {assetUrl} from './url';
export type SourceSound={url:string;volume:number;pitch:number};
export class AudioManager{
 private track:HTMLAudioElement|null=null;private context:AudioContext|null=null;private disposed=false;private audible=false;private paused=false;
 private samples=new Map<string,{buffer:AudioBuffer;volume:number;pitch:number}>();private voices=new Map<AudioBufferSourceNode,{name:string;gain:GainNode}>();
 private loads=new Set<AbortController>();
 constructor(public muted=false,private available:string[]=[]){ }
 unlock(){this.audible=true;if(this.disposed)return;try{if(!this.context)this.context=new AudioContext();void this.context.resume().catch(()=>{});if(this.track&&!this.muted&&!this.paused)void this.track.play().catch(()=>{});}catch{}}
 play(name:string){
  this.stop();this.paused=false;if(!this.available.includes(name))return;const audio=new Audio(assetUrl('/generated/music/'+name+'.ogg'));audio.loop=true;audio.volume=.38;audio.muted=this.muted;this.track=audio;if(this.audible&&!this.muted)void audio.play().catch(()=>{});
 }
 setMuted(muted:boolean){this.muted=muted;if(muted)this.stopEffects();if(this.track){this.track.muted=muted;if(!muted&&this.audible&&!this.paused)void this.track.play().catch(()=>{});}}
 pause(value:boolean){this.paused=value;if(value)this.stopEffects();if(!this.track)return;if(value)this.track.pause();else if(!this.muted&&this.audible)void this.track.play().catch(()=>{});}
 async prepareEffects(sounds:Record<string,SourceSound>,signal?:AbortSignal){
  if(this.disposed)return;try{this.context??=new AudioContext();}catch{return;}const ctx=this.context;
  await Promise.all(Object.entries(sounds).map(async([name,s])=>{if(this.samples.has(name))return;const controller=new AbortController(),abort=()=>controller.abort(),timer=setTimeout(abort,15000);this.loads.add(controller);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   try{const response=await fetch(s.url,{signal:controller.signal});if(!response.ok)throw Error('Battle sound could not load. Please retry.');const buffer=await ctx.decodeAudioData(await response.arrayBuffer());controller.signal.throwIfAborted();if(!this.disposed)this.samples.set(name,{buffer,volume:s.volume,pitch:s.pitch});}finally{clearTimeout(timer);this.loads.delete(controller);signal?.removeEventListener('abort',abort);}
  }));
 }
 sourceEffect(name:string,pitch=1,restart=false){
  if(this.muted||this.paused||!this.audible||!this.context||this.disposed)return;const sample=this.samples.get(name);if(!sample)return;
  if(restart)for(const [voice,s] of this.voices)if(s.name===name){voice.stop();this.releaseVoice(voice);}
  const ctx=this.context,voice=ctx.createBufferSource(),gain=ctx.createGain();voice.buffer=sample.buffer;voice.playbackRate.value=sample.pitch*pitch;gain.gain.value=sample.volume;
  voice.connect(gain);gain.connect(ctx.destination);this.voices.set(voice,{name,gain});voice.onended=()=>this.releaseVoice(voice);voice.start();
 }
 private releaseVoice(voice:AudioBufferSourceNode){const s=this.voices.get(voice);if(!s)return;voice.disconnect();s.gain.disconnect();this.voices.delete(voice);}
 private stopEffects(){for(const voice of this.voices.keys()){voice.stop();this.releaseVoice(voice);}}
 effect(name:string){
  if(this.muted||!this.audible||!this.context||this.disposed)return;
  const ctx=this.context,o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=name==='hurt'?85:name==='fight'?140:name==='shot'?660:name==='block'?880:320;g.gain.setValueAtTime(.025,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.06);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.07);
 }
 stop(){for(const controller of this.loads)controller.abort();this.stopEffects();if(this.track){this.track.pause();this.track.removeAttribute('src');this.track.load();this.track=null;}}
 dispose(){this.stop();this.disposed=true;if(this.context)void this.context.close().catch(()=>{});}
}
