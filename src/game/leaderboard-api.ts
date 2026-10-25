import {assetUrl} from './url';
import {BATTLE_RULES_VERSION,type RunRecord} from './battle-run';
import {validPlayerName} from './player-profile';

export type ChatRoom='undertale'|'deltarune';
export type ChatMessage={id:string;sequence:number;room:ChatRoom;player_name:string;content:string;created_at:string};
export type ChatSubmission=Pick<ChatMessage,'id'|'room'|'player_name'|'content'>;
const chatRoom=(room:unknown):room is ChatRoom=>room==='undertale'||room==='deltarune';
const chatContent=(text:unknown):text is string=>typeof text==='string'&&[...text.trim()].length>=1&&[...text.trim()].length<=500&&new TextEncoder().encode(text.trim()).length<=2000&&!/[\u0000-\u001f\u007f-\u009f]/.test(text);
// SQL btrim removes ASCII spaces; JavaScript trim also removes NBSP/BOM. Read the
// bounded stored value as-is so one SQL-valid whitespace message cannot block a room.
const storedChatText=(text:unknown,max:number,maxBytes?:number):text is string=>typeof text==='string'&&[...text].length>=1&&[...text].length<=max&&(maxBytes===undefined||new TextEncoder().encode(text).length<=maxBytes)&&!/[\u0000-\u001f\u007f-\u009f]/.test(text);

export type LeaderboardFilters={encounterId:string;order?:'damage'|'time';minDamage?:number;maxDamage?:number;minSeconds?:number;maxSeconds?:number;noItem?:boolean;noArmor?:boolean;weapon?:number;armor?:number;bagItem?:number;usedItem?:number;offset?:number};
export interface LeaderboardRow extends RunRecord{player_name:string;created_at:string}
type Config={url:string;key:string};
type Session={access_token:string;refresh_token:string;expires_at:number};
type Store=Pick<Storage,'getItem'|'setItem'>;
const TIMEOUT=12000;

function checkConfig(config:Config):Config{
 let url:URL;try{url=new URL(config.url);}catch{throw Error('Leaderboard configuration has an invalid project URL.');}
 if((url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))||url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname))throw Error('Leaderboard configuration needs an HTTPS project origin.');
 if(typeof config.key!=='string'||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.key))throw Error('Leaderboard configuration requires a public Supabase publishable key. Never use a secret or service-role key.');
 return {url:url.origin,key:config.key};
}
async function request(fetcher:typeof fetch,url:string,init:RequestInit={},external?:AbortSignal):Promise<Response>{
 const controller=new AbortController();let expired=false;
 const abort=()=>controller.abort(external?.reason);if(external?.aborted)abort();else external?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(()=>{expired=true;controller.abort();},TIMEOUT);
 try{
  const response=await fetcher(url,{...init,signal:controller.signal});
  const body=await response.text();
  return new Response([204,205,304].includes(response.status)?null:body,{status:response.status,statusText:response.statusText,headers:response.headers});
 }
 catch(error){if(expired)throw Error('Service request timed out. Please retry.');throw error;}
 finally{clearTimeout(timer);external?.removeEventListener('abort',abort);}
}
async function serviceError(response:Response):Promise<Error>{
 let detail='';try{const body=await response.json();if(typeof body.message==='string')detail=body.message;else if(typeof body.msg==='string')detail=body.msg;else if(typeof body.error_description==='string')detail=body.error_description;}catch{/* A proxy may return HTML. */}
 return Error(`Service error (${response.status})${detail?`: ${detail.slice(0,240)}`:'. Please retry.'}`);
}
export async function loadLeaderboardConfig():Promise<Config|null>{
 const response=await request(fetch,assetUrl('/leaderboard-config.json'),{cache:'no-store'});
 if(response.status===404||response.status===204)return null;
 if(!response.ok)throw Error(`Leaderboard configuration could not load (${response.status}). Please retry.`);
 let value:unknown;try{const text=await response.text();if(!text.trim())return null;value=JSON.parse(text);}catch{throw Error('Leaderboard configuration is not valid JSON.');}
 if(value===null)return null;
 if(typeof value!=='object'||Array.isArray(value))throw Error('Leaderboard configuration is invalid.');
 const candidate=value as Config;if(!candidate.url&&!candidate.key)return null;
 return checkConfig(candidate);
}
export class LeaderboardApi{
 get configured(){return !!this.config;}
 private config:Config|null;
 private connecting:Promise<void>|null=null;
 private session:Session|null=null;
 private signingIn:Promise<Session>|null=null;
 private readonly storage:Store|undefined;
 private storageKey:string;
 constructor(config:Config|null,private readonly fetcher:typeof fetch=fetch,storage?:Store,private readonly loader?:()=>Promise<Config|null>){
  this.config=config?checkConfig(config):null;this.storageKey=`underrune:leaderboard-auth:${this.config?.url??'unconfigured'}`;
  try{this.storage=storage??(typeof localStorage!=='undefined'?localStorage:undefined);const saved=this.storage?.getItem(this.storageKey);if(saved)this.session=this.parseSession(JSON.parse(saved));}catch{/* Storage denial never blocks playing or reading. */}
 }
 /** Missing configuration is deliberate; a failed fetch remains an error and can be retried on reopening. */
 connect():Promise<void>{
  if(this.config||!this.loader)return Promise.resolve();if(this.connecting)return this.connecting;
  this.connecting=this.loader().then(config=>{
   this.config=config?checkConfig(config):null;this.storageKey=`underrune:leaderboard-auth:${this.config?.url??'unconfigured'}`;
   try{const saved=this.storage?.getItem(this.storageKey);this.session=saved?this.parseSession(JSON.parse(saved)):null;}catch{this.session=null;}
  }).finally(()=>{this.connecting=null;});return this.connecting;
 }
 private requireConfig():Config{if(!this.config)throw Error('Shared leaderboard is not configured yet.');return this.config;}
 async listChat(room:ChatRoom,before?:number,signal?:AbortSignal):Promise<ChatMessage[]>{
  if(!chatRoom(room)||before!==undefined&&(!Number.isSafeInteger(before)||before<1))throw Error('Invalid chat room or page.');
  const config=this.requireConfig(),response=await request(this.fetcher,`${config.url}/rest/v1/rpc/read_chat_messages`,{method:'POST',headers:this.headers(),body:JSON.stringify({p_room:room,p_before:before??null})},signal);
  if(!response.ok)throw await serviceError(response);
  const rows:unknown=await response.json();
  if(!Array.isArray(rows)||rows.length>50||rows.some((row,index)=>!row||row.room!==room||typeof row.id!=='string'||!Number.isSafeInteger(row.sequence)||row.sequence<1||index>0&&row.sequence>=rows[index-1].sequence||before!==undefined&&row.sequence>=before||!storedChatText(row.player_name,24)||!storedChatText(row.content,500,2000)||typeof row.created_at!=='string'||!Number.isFinite(Date.parse(row.created_at))))throw Error('Chat returned an invalid page.');
  return rows as ChatMessage[];
 }
 async sendChat(message:ChatSubmission):Promise<void>{
  if(!chatRoom(message.room)||!validPlayerName(message.player_name)||!chatContent(message.content)||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id))throw Error('Choose a name and write 1–500 characters without control characters.');
  const config=this.requireConfig();let session=await this.authenticate();
  for(let attempt=0;attempt<2;attempt++){
   const response=await request(this.fetcher,`${config.url}/rest/v1/rpc/send_chat_message`,{method:'POST',headers:this.headers(session.access_token),body:JSON.stringify({p_id:message.id,p_room:message.room,p_player_name:message.player_name.trim(),p_content:message.content.trim()})});
   if(response.status===401&&attempt===0){session=await this.authenticate(true);continue;}if(!response.ok)throw await serviceError(response);return;
  }
 }
 private headers(token?:string):Headers{const headers=new Headers({'apikey':this.requireConfig().key,'Content-Type':'application/json'});if(token)headers.set('Authorization',`Bearer ${token}`);return headers;}
 async list(filters:LeaderboardFilters,signal?:AbortSignal):Promise<LeaderboardRow[]>{
  const config=this.requireConfig();const params=new URLSearchParams({select:'*',encounter_id:`eq.${filters.encounterId}`,rules_version:`eq.${BATTLE_RULES_VERSION}`,order:filters.order==='time'?'duration_ms.asc,damage.asc,id.asc':'damage.asc,duration_ms.asc,id.asc',limit:'25',offset:String(filters.offset??0)});
  if(!/^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,79}$/.test(filters.encounterId)||filters.order!==undefined&&!['damage','time'].includes(filters.order))throw Error('Invalid leaderboard filter.');
  for(const [key,value,max,integer] of [['minDamage',filters.minDamage,100000000,true],['maxDamage',filters.maxDamage,100000000,true],['minSeconds',filters.minSeconds,86400,false],['maxSeconds',filters.maxSeconds,86400,false],['weapon',filters.weapon,65535,true],['armor',filters.armor,65535,true],['bagItem',filters.bagItem,65535,true],['usedItem',filters.usedItem,65535,true],['offset',filters.offset,1000000,true]] as const){
   if(value!==undefined&&(!Number.isFinite(value)||value<0||value>max||integer&&!Number.isInteger(value)))throw Error(`Invalid leaderboard filter: ${key}.`);
  }
  if(filters.minDamage!==undefined&&filters.maxDamage!==undefined&&filters.minDamage>filters.maxDamage||filters.minSeconds!==undefined&&filters.maxSeconds!==undefined&&filters.minSeconds>filters.maxSeconds)throw Error('Invalid leaderboard filter range.');
  for(const [value,column,operation,multiplier] of [[filters.minDamage,'damage','gte',1],[filters.maxDamage,'damage','lte',1],[filters.minSeconds,'duration_ms','gte',1000],[filters.maxSeconds,'duration_ms','lte',1000]] as const)if(value!==undefined)params.append(column,`${operation}.${Math.round(value*multiplier)}`);
  if(filters.noItem)params.set('no_item','eq.true');if(filters.noArmor)params.set('no_armor','eq.true');
  if(filters.weapon!==undefined)params.append('equipment',`cs.${JSON.stringify([{weapon:filters.weapon}])}`);
  if(filters.armor!==undefined)params.append('equipment',`cs.${JSON.stringify([{armor:[filters.armor]}])}`);
  if(filters.bagItem!==undefined)params.set('bag',`cs.{${filters.bagItem}}`);if(filters.usedItem!==undefined)params.set('used_items',`cs.{${filters.usedItem}}`);
  const response=await request(this.fetcher,`${config.url}/rest/v1/leaderboard_runs?${params}`,{headers:this.headers()},signal);if(!response.ok)throw await serviceError(response);
  const rows:unknown=await response.json();if(!Array.isArray(rows))throw Error('Leaderboard returned an invalid result.');return rows as LeaderboardRow[];
 }
 /** Where a finished run would stand on its boss's board, ordered as the board is (damage taken, then time): its
  * place, and how many runs there would be with it. Two counted reads; nothing is published. */
 async rank(run:RunRecord,signal?:AbortSignal):Promise<{place:number;of:number}>{
  const config=this.requireConfig();
  if(run.rules_version!==BATTLE_RULES_VERSION)throw Error('This run uses a different battle rules version. Start a new battle to compare with the current board.');
  if(!/^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,79}$/.test(run.encounter_id)||!Number.isSafeInteger(run.damage)||!Number.isSafeInteger(run.duration_ms))throw Error('Invalid leaderboard run.');
  const count=async(extra:Record<string,string>)=>{
   const params=new URLSearchParams({select:'id',encounter_id:`eq.${run.encounter_id}`,rules_version:`eq.${BATTLE_RULES_VERSION}`,limit:'1',...extra});
   const headers=this.headers();headers.set('Prefer','count=exact');
   const response=await request(this.fetcher,`${config.url}/rest/v1/leaderboard_runs?${params}`,{headers},signal);if(!response.ok)throw await serviceError(response);
   const total=/\/(\d+)$/.exec(response.headers.get('content-range')??'')?.[1];if(total===undefined)throw Error('Leaderboard returned no count.');return Number(total);
  };
  const [ahead,all]=await Promise.all([count({or:`(damage.lt.${run.damage},and(damage.eq.${run.damage},duration_ms.lt.${run.duration_ms}))`}),count({})]);
  return {place:ahead+1,of:all+1};
 }
 private parseSession(value:unknown):Session|null{
  if(!value||typeof value!=='object')return null;const s=value as Session&{expires_in?:number};
  if(typeof s.access_token!=='string'||!s.access_token||typeof s.refresh_token!=='string'||!s.refresh_token)return null;
  const expires_at=typeof s.expires_at==='number'?s.expires_at:Date.now()/1000+(s.expires_in??3600);
  if(!Number.isFinite(expires_at))return null;return {access_token:s.access_token,refresh_token:s.refresh_token,expires_at};
 }
 private authenticate(refresh=false):Promise<Session>{
  if(this.signingIn)return this.signingIn;
  if(!refresh&&this.session&&this.session.expires_at>Date.now()/1000+30)return Promise.resolve(this.session);
  this.signingIn=this.createSession().finally(()=>{this.signingIn=null;});return this.signingIn;
 }
 private async createSession():Promise<Session>{
  const config=this.requireConfig();const previous=this.session;
  let response=await request(this.fetcher,`${config.url}/auth/v1/${previous?'token?grant_type=refresh_token':'signup'}`,{method:'POST',headers:this.headers(),body:JSON.stringify(previous?{refresh_token:previous.refresh_token}:{data:{}})});
  if(previous&&(response.status===400||response.status===401)){
   // A revoked anonymous identity cannot be recovered; a fresh identity can publish
   // future runs. SQL still refuses to reclaim any already-owned pending run ID.
   this.session=null;try{this.storage?.setItem(this.storageKey,'');}catch{/* Storage may be unavailable. */}
   response=await request(this.fetcher,`${config.url}/auth/v1/signup`,{method:'POST',headers:this.headers(),body:JSON.stringify({data:{}})});
  }
  if(!response.ok)throw await serviceError(response);
  const session=this.parseSession(await response.json());if(!session)throw Error('Anonymous sign-in is unavailable. Enable it in Supabase Auth.');this.session=session;
  try{this.storage?.setItem(this.storageKey,JSON.stringify(session));}catch{/* In-memory session still supports retries. */}return session;
 }
 async submit(run:RunRecord,playerName:string):Promise<void>{
  const config=this.requireConfig();const name=playerName.trim();if(!name||[...name].length>24||/[\u0000-\u001f\u007f]/.test(name))throw Error('Choose a player name between 1 and 24 characters.');
  let session=await this.authenticate();
  for(let attempt=0;attempt<2;attempt++){
   const response=await request(this.fetcher,`${config.url}/rest/v1/rpc/submit_leaderboard_run`,{method:'POST',headers:this.headers(session.access_token),body:JSON.stringify({p_run:run,p_player_name:name})});
   if(response.status===401&&attempt===0){session=await this.authenticate(true);continue;}
   if(!response.ok)throw await serviceError(response);return;
  }
 }
}
