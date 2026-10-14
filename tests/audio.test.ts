import {afterEach,it,expect,vi} from 'vitest';
import {AudioManager} from '../src/game/audio';
afterEach(()=>vi.unstubAllGlobals());
function setup(){
 const gains:{value:number;setValueAtTime:ReturnType<typeof vi.fn>;linearRampToValueAtTime:ReturnType<typeof vi.fn>;cancelScheduledValues:ReturnType<typeof vi.fn>}[]=[];
 const voices:{playbackRate:{value:number};buffer:unknown;onended:(()=>void)|null;connect:()=>void;disconnect:()=>void;start:ReturnType<typeof vi.fn>;stop:ReturnType<typeof vi.fn>}[]=[];
 class Context{destination={};currentTime=0;resume=async()=>{};close=async()=>{};decodeAudioData=async()=>({duration:.5});createGain(){const gain={value:1,setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),cancelScheduledValues:vi.fn()};gains.push(gain);return {gain,connect:()=>{},disconnect:()=>{}};}createBufferSource(){const s={playbackRate:{value:1},buffer:null as unknown,onended:null as (()=>void)|null,connect:()=>{},disconnect:()=>{},start:vi.fn(),stop:vi.fn()};voices.push(s);return s;}}
 const fetcher=vi.fn(async()=>new Response(new Uint8Array([1,2,3])));vi.stubGlobal('AudioContext',Context);vi.stubGlobal('fetch',fetcher);const audio=new AudioManager();audio.unlock();return {audio,voices,fetcher,gains};
}
it('switches identically named chapter effects by source URL, and reuses decoded bytes when switching back',async()=>{
 const {audio,fetcher,gains}=setup();await audio.prepareEffects({snd_hit:{url:'/ch1/hit.wav',volume:.5,pitch:1}});audio.sourceEffect('snd_hit');
 await audio.prepareEffects({snd_hit:{url:'/ch2/hit.wav',volume:.8,pitch:1}});audio.sourceEffect('snd_hit');
 await audio.prepareEffects({snd_hit:{url:'/ch1/hit.wav',volume:.5,pitch:1}});audio.sourceEffect('snd_hit');
 expect(fetcher).toHaveBeenCalledTimes(2);expect(gains.map(g=>g.value)).toEqual([.5,.8,.5]);audio.dispose();
});
it('applies charge gain over native frames and stops only the requested shot handle',async()=>{
 const {audio,gains,voices}=setup();await audio.prepareEffects({snd_charge:{url:'/charge.wav',volume:1,pitch:1}});
 const a=audio.sourceEffect('snd_charge',1,false,.8)!,b=audio.sourceEffect('snd_charge')!;audio.sourceVolume(a,0);audio.sourceVolume(a,.3,20);
 expect(a).not.toBe(b);expect(gains[0].linearRampToValueAtTime).toHaveBeenCalledWith(.3,20/30);expect(gains[1].value).toBe(1);audio.sourceStop(a);expect(voices[0].stop).toHaveBeenCalledOnce();expect(voices[1].stop).not.toHaveBeenCalled();expect(audio.sourcePlaying(a)).toBe(false);expect(audio.sourcePlaying(b)).toBe(true);audio.dispose();
});
it('plays a decoded original sample with source gain and per-character pitch, without synthesizing it',async()=>{
 const {audio,voices,fetcher}=setup();await audio.prepareEffects({snd_laz_c:{url:'/swing.wav',volume:.9,pitch:1}});audio.sourceEffect('snd_laz_c',1.15,true);
 expect(fetcher).toHaveBeenCalledTimes(1);expect(voices[0].buffer).toEqual({duration:.5});expect(voices[0].playbackRate.value).toBe(1.15);expect(voices[0].start).toHaveBeenCalledOnce();audio.dispose();
});
it('reuses decoded effects on rematch and stops the previous swing when the original requests it',async()=>{
 const {audio,voices,fetcher}=setup(),sounds={snd_laz_c:{url:'/swing.wav',volume:1,pitch:1}};await audio.prepareEffects(sounds);await audio.prepareEffects(sounds);audio.sourceEffect('snd_laz_c');audio.sourceEffect('snd_laz_c',.9,true);
 expect(fetcher).toHaveBeenCalledTimes(1);expect(voices[0].stop).toHaveBeenCalledOnce();expect(voices[1].playbackRate.value).toBe(.9);audio.dispose();
});
it('pause and mute stop active effects and prevent more voices until resumed',async()=>{
 const {audio,voices}=setup();await audio.prepareEffects({snd_hurt1:{url:'/hurt.wav',volume:1,pitch:1}});audio.sourceEffect('snd_hurt1');audio.pause(true);expect(voices[0].stop).toHaveBeenCalledOnce();audio.sourceEffect('snd_hurt1');expect(voices).toHaveLength(1);
 audio.pause(false);audio.setMuted(true);audio.sourceEffect('snd_hurt1');expect(voices).toHaveLength(1);audio.setMuted(false);audio.sourceEffect('snd_hurt1');expect(voices).toHaveLength(2);audio.dispose();
});
it('aborts pending sample requests when the manager is disposed',async()=>{
 const {audio}=setup();let signal:AbortSignal|undefined;vi.stubGlobal('fetch',vi.fn((_url,options)=>new Promise((_resolve,reject)=>{signal=options.signal;signal!.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')));})));const pending=audio.prepareEffects({snd_laz_c:{url:'/swing.wav',volume:1,pitch:1}});const result=pending.catch(e=>e);audio.dispose();expect(signal?.aborted).toBe(true);await result;
});
it('keeps native loop handles independent and applies their source pitch until explicitly stopped',async()=>{
 const {audio,voices}=setup();await audio.prepareEffects({snd_chain_wave:{url:'/chain.wav',volume:.7,pitch:1.2}});
 const a=audio.sourceLoop('snd_chain_wave'),b=audio.sourceLoop('snd_chain_wave');
 expect(a).not.toBe(b);expect(voices[0]).toMatchObject({loop:true});audio.sourcePitch(a!,.8);
 expect(voices[0].playbackRate.value).toBeCloseTo(.96);expect(voices[1].playbackRate.value).toBe(1.2);
 audio.sourceStop(a!);expect(voices[0].stop).toHaveBeenCalledOnce();expect(voices[1].stop).not.toHaveBeenCalled();
 audio.sourceStop('snd_chain_wave');expect(voices[1].stop).toHaveBeenCalledOnce();audio.dispose();
});
it('suspends ongoing native loops at pause and mute, then resumes with the original handles and pitch',async()=>{
 const {audio,voices}=setup();await audio.prepareEffects({snd_chain_wave:{url:'/chain.wav',volume:1,pitch:1}});const id=audio.sourceLoop('snd_chain_wave')!;
 audio.pause(true);expect(voices[0].stop).toHaveBeenCalledOnce();audio.sourcePitch(id,.6);audio.pause(false);
 expect(voices[1].playbackRate.value).toBe(.6);expect(voices[1]).toMatchObject({loop:true});audio.setMuted(true);audio.setMuted(false);
 expect(voices).toHaveLength(3);audio.sourceStop(id);expect(voices[2].stop).toHaveBeenCalledOnce();audio.dispose();audio.pause(false);expect(voices).toHaveLength(3);
});
