// Sound calls as the game makes them. A leaf module: it imports nothing from the engine.
import type {GmRuntime} from '../gm/runtime';

/** snd_play / snd_play_x: a sound effect, at a pitch and volume. */
export function snd(rt:GmRuntime,name:string,pitch=1,volume?:number){
 if(rt.sourceAudio)return rt.sourceAudio.effect(name,pitch,volume);
 rt.sound?.(name,pitch);return undefined;
}
