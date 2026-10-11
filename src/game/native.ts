// Host side of the original-bytecode battle player served under /native/ (tools/native-player.mjs).
export type NativeEvent={type:'ready'|'running'|'failed'|'ended'|'paused'|'diagnostic';id?:string;message?:string;result?:number;value?:boolean};
const KEY_CODES:Record<string,number>={ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,a:37,w:38,d:39,s:40,z:90,x:88,c:67,Enter:13,' ':32,Shift:16};
// Keys the original game reads; browser shortcuts stay with the page.
export function nativeKeyCode(key:string):number|undefined{return KEY_CODES[key.length===1?key.toLowerCase():key];}
export function isNativeEvent(data:unknown):data is NativeEvent{
 const d=data as {source?:unknown;type?:unknown}|null;
 return !!d&&d.source==='underrune-native'&&typeof d.type==='string'&&['ready','running','failed','ended','paused','diagnostic'].includes(d.type);
}
export async function fetchNativeProfiles(url='/native/profiles'):Promise<Set<string>>{
 try{const response=await fetch(url);if(!response.ok)return new Set();const ids=await response.json();return new Set(Array.isArray(ids)?ids.filter((id):id is string=>typeof id==='string'):[]);}catch{return new Set();}
}
export class NativeBattle{
 readonly frame=document.createElement('iframe');
 paused=false;private disposed=false;private readyWaiters:(()=>void)[]=[];private isReady=false;private launch:{resolve:()=>void;reject:(e:Error)=>void}|null=null;
 private readonly listener=(event:MessageEvent)=>{
  if(event.source!==this.frame.contentWindow||event.origin!==location.origin||!isNativeEvent(event.data))return;
  const data=event.data;
  if(data.type==='ready'){this.isReady=true;this.readyWaiters.splice(0).forEach(f=>f());}
  if(data.type==='running'){this.launch?.resolve();this.launch=null;}
  if(data.type==='failed'||data.type==='ended'){this.launch?.reject(Error(data.message??'Özgün savaş motoru başlamadan durdu.'));this.launch=null;}
  if(data.type==='paused')this.paused=!!data.value;
  this.onEvent(data);
 };
 constructor(container:HTMLElement,private onEvent:(event:NativeEvent)=>void,src='/native/'){
  this.frame.id='native';this.frame.title='Özgün DELTARUNE savaşı';this.frame.allow='autoplay';this.frame.src=src;
  window.addEventListener('message',this.listener);container.append(this.frame);
 }
 private post(message:Record<string,unknown>){if(!this.disposed)this.frame.contentWindow?.postMessage({source:'underrune-host',...message},location.origin);}
 async start(id:string,ini:string,timeoutMs=180000):Promise<void>{
  if(!this.isReady)await new Promise<void>((resolve,reject)=>{this.readyWaiters.push(resolve);setTimeout(()=>reject(Error('Özgün savaş oynatıcısı yüklenemedi.')),20000);});
  await new Promise<void>((resolve,reject)=>{
   const timer=setTimeout(()=>{this.launch=null;reject(Error('Özgün savaş motoru zamanında açılmadı.'));},timeoutMs);
   this.launch={resolve:()=>{clearTimeout(timer);resolve();},reject:e=>{clearTimeout(timer);reject(e);}};
   this.post({type:'start',id,ini});
  });
 }
 key(key:string,down:boolean){const code=nativeKeyCode(key);if(code!==undefined)this.post({type:'key',key:code,down});return code!==undefined;}
 pause(value:boolean){this.post({type:'pause',value});}
 mute(value:boolean){this.post({type:'mute',value});}
 focus(){this.frame.focus();}
 dispose(){
  if(this.disposed)return;this.post({type:'stop'});this.disposed=true;
  this.launch?.reject(Error('Savaş kapatıldı.'));this.launch=null;
  window.removeEventListener('message',this.listener);this.frame.remove();
 }
}
