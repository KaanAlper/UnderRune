import {afterEach,expect,test,vi} from 'vitest';
import {AssetStore} from '../src/game/assets';
class TestImage{onload:(()=>void)|null=null;onerror:(()=>void)|null=null;src='';constructor(){images.push(this);}}
let images:TestImage[]=[];
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();images=[];});
test('a stalled image times out and can be retried without stale load handlers',async()=>{
 vi.useFakeTimers();vi.stubGlobal('Image',TestImage);
 const store=new AssetStore({version:1,sprites:{},font:null,music:[],sourcePackages:[]});
 const pending=store.loadImage('/stalled.png');const rejected=expect(pending).rejects.toThrow(/zaman|timed out/i);
 await vi.advanceTimersByTimeAsync(15001);await rejected;
 expect(images[0].onload).toBeNull();expect(store.images.size).toBe(0);
 const retry=store.loadImage('/stalled.png');expect(images).toHaveLength(2);images[1].onload!();await retry;
 expect(store.images.get('/stalled.png')).toBe(images[1]);expect(vi.getTimerCount()).toBe(0);
});
test('concurrent requests share one image and a failure allows a new request',async()=>{
 vi.stubGlobal('Image',TestImage);const store=new AssetStore({version:1,sprites:{},font:null,music:[],sourcePackages:[]});
 const first=store.loadImage('/missing.png'),second=store.loadImage('/missing.png');expect(images).toHaveLength(1);
 const results=Promise.allSettled([first,second]);images[0].onerror!();expect((await results).every(r=>r.status==='rejected')).toBe(true);
 const retry=store.loadImage('/missing.png');expect(images).toHaveLength(2);images[1].onload!();await retry;
});
