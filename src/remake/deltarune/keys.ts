// Key codes the battles read (GameMaker's vk_* and ord values), and the held/pressed/released checks. A leaf module:
// it imports nothing from the engine, so any object can use it.
import type {GmRuntime} from '../gm/runtime';

export const KEY={left:37,up:38,right:39,down:40,z:90,x:88,c:67,enter:13,shift:16,ctrl:17};
export const held=(rt:GmRuntime,...keys:number[])=>keys.some(k=>rt.input.held.has(k));
export const pressed=(rt:GmRuntime,...keys:number[])=>keys.some(k=>rt.input.pressed.has(k));
export const released=(rt:GmRuntime,...keys:number[])=>keys.some(k=>rt.input.released.has(k));
/** Confirm is Z or Enter. */
export const button1_p=(rt:GmRuntime)=>pressed(rt,KEY.z,KEY.enter);
export const button1_h=(rt:GmRuntime)=>held(rt,KEY.z,KEY.enter);
export const button1_r=(rt:GmRuntime)=>released(rt,KEY.z,KEY.enter);
