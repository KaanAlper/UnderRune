import {afterEach,expect,it,vi} from 'vitest';
import {Input} from '../src/game/input';
afterEach(()=>vi.unstubAllGlobals());
function bound(){
 vi.stubGlobal('HTMLElement',class {});
 const target=new EventTarget(),input=new Input(),unbind=input.bind(target as unknown as Window,()=>{});
 const key=(type:string,key:string,modifier:Record<string,boolean>={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,{key,ctrlKey:false,altKey:false,metaKey:false,...modifier});target.dispatchEvent(event);return event;};
 return {input,key,unbind};
}
it('normalizes uppercase game keys at the browser event boundary',()=>{
 const {input,key,unbind}=bound();expect(key('keydown','Z').defaultPrevented).toBe(true);expect(input.read().confirm).toBe(true);key('keyup','Z');expect(input.read().shootReleased).toBe(true);
 key('keydown','X');expect(input.read().cancel).toBe(true);key('keyup','X');key('keydown','W');expect(input.read().y).toBe(-1);unbind();
});
it('keeps arrows working and leaves browser shortcut combinations alone',()=>{
 const {input,key,unbind}=bound();key('keydown','ArrowRight');expect(input.read().arrows).toEqual(['right']);key('keyup','ArrowRight');
 expect(key('keydown','Z',{ctrlKey:true}).defaultPrevented).toBe(false);expect(input.read().confirm).toBe(false);unbind();
});
