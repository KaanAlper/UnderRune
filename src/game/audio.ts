import {assetUrl} from './url';
export type SourceSound={url:string;volume:number;pitch:number};
export class AudioManager{
 private track:HTMLAudioElement|null=null;private context:AudioContext|null=null;private disposed=false;private audible=false;private paused=false;
 private samples=new Map<string,{buffer:AudioBuffer;volume:number;pitch:number;url:string}>();private sampleCache=new Map<string,AudioBuffer>();private voices=new Map<AudioBufferSourceNode,{name:string;gain:GainNode;handle?:number}>();
 private loops=new Map<number,{name:string;pitch:number;volume:number}>();private nextLoop=1;private trackName='';private trackFade:ReturnType<typeof setInterval>|null=null;
 private loads=new Set<AbortController>();
 constructor(public muted=false,private available:string[]=[]){ }
 unlock(){this.audible=true;if(this.disposed)return;try{if(!this.context)this.context=new AudioContext();void this.context.resume().catch(()=>{});if(this.track&&!this.muted&&!this.paused)void this.track.play().catch(()=>{});}catch{}}
 play(name:string){
  this.stop();this.paused=false;if(!this.available.includes(name))return;const audio=new Audio(assetUrl('/generated/music/'+name+'.ogg'));audio.loop=true;audio.volume=.38;audio.muted=this.muted;this.track=audio;this.trackName=name;if(this.audible&&!this.muted)void audio.play().catch(()=>{});
 }
 setMuted(muted:boolean){this.muted=muted;if(muted)this.stopEffects();else this.resumeLoops();if(this.track){this.track.muted=muted;if(!muted&&this.audible&&!this.paused)void this.track.play().catch(()=>{});}}
 pause(value:boolean){this.paused=value;if(value)this.stopEffects();else this.resumeLoops();if(!this.track)return;if(value)this.track.pause();else if(!this.muted&&this.audible)void this.track.play().catch(()=>{});}
 async prepareEffects(sounds:Record<string,SourceSound>,signal?:AbortSignal){
  if(this.disposed)return;try{this.context??=new AudioContext();}catch{return;}const ctx=this.context;
  await Promise.all(Object.entries(sounds).map(async([name,s])=>{if(this.samples.get(name)?.url===s.url)return;const cached=this.sampleCache.get(s.url);if(cached){this.samples.set(name,{buffer:cached,...s});return;}const controller=new AbortController(),abort=()=>controller.abort(),timer=setTimeout(abort,15000);this.loads.add(controller);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   try{const response=await fetch(s.url,{signal:controller.signal});if(!response.ok)throw Error('Battle sound could not load. Please retry.');const buffer=await ctx.decodeAudioData(await response.arrayBuffer());controller.signal.throwIfAborted();if(!this.disposed){this.sampleCache.set(s.url,buffer);this.samples.set(name,{buffer,...s});}}finally{clearTimeout(timer);this.loads.delete(controller);signal?.removeEventListener('abort',abort);}
  }));
 }
 sourceEffect(name:string,pitch=1,restart=false,volume?:number){
  if(this.muted||this.paused||!this.audible||!this.context||this.disposed)return;const sample=this.samples.get(name);if(!sample)return;
  if(restart)for(const [voice,s] of this.voices)if(s.name===name){voice.stop();this.releaseVoice(voice);}
  const ctx=this.context,voice=ctx.createBufferSource(),gain=ctx.createGain();voice.buffer=sample.buffer;voice.playbackRate.value=sample.pitch*pitch;gain.gain.value=volume??sample.volume;const handle=this.nextLoop++;
  voice.connect(gain);gain.connect(ctx.destination);this.voices.set(voice,{name,gain,handle});voice.onended=()=>this.releaseVoice(voice);voice.start();return handle;
 }
 sourceLoop(name:string){
  if(this.disposed||!this.samples.has(name))return;const handle=this.nextLoop++;this.loops.set(handle,{name,pitch:1,volume:this.samples.get(name)!.volume});this.startLoop(handle);return handle;
 }
 private startLoop(handle:number){
  if(this.muted||this.paused||!this.audible||!this.context||this.disposed||[...this.voices.values()].some(v=>v.handle===handle))return;
  const loop=this.loops.get(handle),sample=loop&&this.samples.get(loop.name);if(!loop||!sample)return;
  const ctx=this.context,voice=ctx.createBufferSource(),gain=ctx.createGain();voice.buffer=sample.buffer;voice.loop=true;voice.playbackRate.value=sample.pitch*loop.pitch;gain.gain.value=loop.volume;
  voice.connect(gain);gain.connect(ctx.destination);this.voices.set(voice,{name:loop.name,gain,handle});voice.onended=()=>this.releaseVoice(voice);voice.start();
 }
 private resumeLoops(){for(const handle of this.loops.keys())this.startLoop(handle);}
 sourceStop(handle:number|string){
  for(const [id,loop] of this.loops)if(typeof handle==='number'?id===handle:loop.name===handle)this.loops.delete(id);
  for(const [voice,state] of this.voices)if(typeof handle==='number'?state.handle===handle:state.name===handle){voice.stop();this.releaseVoice(voice);}
 }
 sourcePitch(handle:number|string,pitch:number){
  if(handle===this.trackName&&this.track)this.track.playbackRate=pitch;
  for(const [id,loop] of this.loops)if(typeof handle==='number'?id===handle:loop.name===handle)loop.pitch=pitch;
  for(const [voice,state] of this.voices)if(typeof handle==='number'?state.handle===handle:state.name===handle)voice.playbackRate.value=(this.samples.get(state.name)?.pitch??1)*pitch;
 }
 /** The logical pitch multiplier, excluding the sample asset's base pitch. */
 sourceGetPitch(handle:number|string){
  if(handle===this.trackName&&this.track)return this.track.playbackRate;
  for(const [id,loop] of this.loops)if(typeof handle==='number'?id===handle:loop.name===handle)return loop.pitch;
  for(const [voice,state] of this.voices)if(typeof handle==='number'?state.handle===handle:state.name===handle)return voice.playbackRate.value/(this.samples.get(state.name)?.pitch??1);
  return 1;
 }
 sourceVolume(handle:number|string,volume:number,frames=0){
  if(typeof handle==='string'&&handle===this.trackName&&this.track){
   if(this.trackFade!==null){clearInterval(this.trackFade);this.trackFade=null;}const target=Math.max(0,Math.min(1,volume*.38));
   if(frames<=0){this.track.volume=target;return;}const start=this.track.volume,time=performance.now(),duration=frames*1000/30;
   this.trackFade=setInterval(()=>{if(!this.track)return;const t=Math.min(1,(performance.now()-time)/duration);this.track.volume=start+(target-start)*t;if(t===1&&this.trackFade!==null){clearInterval(this.trackFade);this.trackFade=null;}},20);return;
  }
  for(const [id,loop] of this.loops)if(typeof handle==='number'?id===handle:loop.name===handle)loop.volume=volume;
  for(const state of this.voices.values())if(typeof handle==='number'?state.handle===handle:state.name===handle){const gain=state.gain.gain,time=this.context?.currentTime??0;gain.cancelScheduledValues?.(time);if(frames>0){gain.setValueAtTime?.(gain.value,time);if(gain.linearRampToValueAtTime)gain.linearRampToValueAtTime(volume,time+frames/30);else gain.value=volume;}else gain.value=volume;}
 }
 sourcePlaying(handle:number|string){return (handle===this.trackName&&!!this.track&&!this.track.paused)||[...this.voices.values()].some(v=>typeof handle==='number'?v.handle===handle:v.name===handle);}
 sourceTrackPause(handle:number|string){if(handle===this.trackName)this.track?.pause();}
 sourceTrackResume(handle:number|string){if(handle===this.trackName&&this.track&&this.audible&&!this.muted&&!this.paused)void this.track.play().catch(()=>{});}
 sourcePosition(handle:number|string,seconds?:number){if(handle!==this.trackName||!this.track)return 0;if(seconds!==undefined)this.track.currentTime=seconds;return this.track.currentTime;}
 sourceFree(handle:number|string){if(handle===this.trackName){if(this.trackFade!==null)clearInterval(this.trackFade);this.trackFade=null;this.track?.pause();this.track?.removeAttribute('src');this.track?.load();this.track=null;this.trackName='';}else this.sourceStop(handle);}
 sourceSetLoop(handle:number|string){if(handle===this.trackName&&this.track)this.track.loop=true;}
 private releaseVoice(voice:AudioBufferSourceNode){const s=this.voices.get(voice);if(!s)return;voice.disconnect();s.gain.disconnect();this.voices.delete(voice);}
 private stopEffects(){for(const voice of this.voices.keys()){voice.stop();this.releaseVoice(voice);}}
 stop(){if(this.trackFade!==null)clearInterval(this.trackFade);this.trackFade=null;this.trackName='';for(const controller of this.loads)controller.abort();this.loops.clear();this.stopEffects();if(this.track){this.track.pause();this.track.removeAttribute('src');this.track.load();this.track=null;}}
 dispose(){this.stop();this.disposed=true;if(this.context)void this.context.close().catch(()=>{});}
}
