import {describe,it,expect,vi} from 'vitest';
import {PlayerProfile} from '../src/game/player-profile';
import {LeaderboardApi} from '../src/game/leaderboard-api';
const config={url:'https://example.supabase.co',key:'sb_publishable_test'};
const store=()=>{const map=new Map<string,string>();return {getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status});
const message={id:'11111111-1111-4111-8111-111111111111',room:'undertale' as const,player_name:'Frisk',content:'Hello'};
describe('shared player profile',()=>{
 it('loads the existing name, notifies both panels, and survives storage denial',()=>{const storage=store();storage.setItem('underrune.leaderboard.player.v1',JSON.stringify({name:'Kris'}));const profile=new PlayerProfile(storage),listener=vi.fn();const off=profile.subscribe(listener);expect(profile.name).toBe('Kris');profile.setName(' Frisk ');expect(listener).toHaveBeenCalledOnce();expect(new PlayerProfile(storage).name).toBe('Frisk');off();profile.setName('Chara');expect(listener).toHaveBeenCalledOnce();expect(()=>new PlayerProfile({getItem:()=>{throw Error();},setItem:()=>{throw Error();}}).setName('Kris')).not.toThrow();});
 it('rejects control characters and overlong names',()=>{const profile=new PlayerProfile(store());for(const name of [' ','\u00a0','x'.repeat(25),'a\nb'])expect(()=>profile.setName(name)).toThrow();});
});
describe('chat API',()=>{
 it('reads one room anonymously using a bounded server RPC',async()=>{const fetcher=vi.fn<typeof fetch>().mockResolvedValue(reply([])),api=new LeaderboardApi(config,fetcher,store());await api.listChat('undertale',52);expect(fetcher).toHaveBeenCalledOnce();const [url,init]=fetcher.mock.calls[0];expect(String(url)).toContain('/rpc/read_chat_messages');expect(JSON.parse(String(init?.body))).toEqual({p_room:'undertale',p_before:52});expect(new Headers(init?.headers).has('Authorization')).toBe(false);});
 it('validates rooms, page cursors and bounded payloads before auth',async()=>{const fetcher=vi.fn<typeof fetch>(),api=new LeaderboardApi(config,fetcher,store());await expect(api.listChat('other' as any)).rejects.toThrow();await expect(api.listChat('deltarune',-1)).rejects.toThrow();for(const content of [' ','\u00a0','a'.repeat(501),'a\nb'])await expect(api.sendChat({...message,content})).rejects.toThrow();await expect(api.sendChat({...message,player_name:'\u00a0'})).rejects.toThrow();expect(fetcher).not.toHaveBeenCalled();});
 it('shares persisted leaderboard auth and preserves the same message ID on retry',async()=>{const storage=store();storage.setItem('underrune:leaderboard-auth:https://example.supabase.co',JSON.stringify({access_token:'existing',refresh_token:'refresh',expires_at:Date.now()/1000+3600}));const fetcher=vi.fn<typeof fetch>().mockRejectedValueOnce(Error('offline')).mockResolvedValue(reply(null));const api=new LeaderboardApi(config,fetcher,storage);await expect(api.sendChat(message)).rejects.toThrow('offline');await api.sendChat(message);expect(fetcher).toHaveBeenCalledTimes(2);for(const [,init] of fetcher.mock.calls){expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer existing');expect(JSON.parse(String(init?.body)).p_id).toBe(message.id);}});
 it('refreshes auth once on 401 and reports server rate limits',async()=>{const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(reply({access_token:'first',refresh_token:'r',expires_in:3600})).mockResolvedValueOnce(reply({},401)).mockResolvedValueOnce(reply({access_token:'second',refresh_token:'r',expires_in:3600})).mockResolvedValueOnce(reply({message:'Chat limit reached'},400));const api=new LeaderboardApi(config,fetcher,store());await expect(api.sendChat(message)).rejects.toThrow('Chat limit reached');expect(String(fetcher.mock.calls[2][0])).toContain('grant_type=refresh_token');});
 it('rejects cross-room and oversized server results',async()=>{const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(reply([{...message,room:'deltarune',sequence:1,created_at:new Date().toISOString()}])).mockResolvedValueOnce(reply(Array(51).fill(message)));const api=new LeaderboardApi(config,fetcher,store());await expect(api.listChat('undertale')).rejects.toThrow();await expect(api.listChat('undertale')).rejects.toThrow();});
 it('accepts SQL-valid whitespace rows without allowing one sender to block the whole room page',async()=>{
  const rows=[{...message,sequence:2,player_name:'\u00a0',content:'\u00a0',created_at:'2026-10-26T00:00:00Z'},{...message,sequence:1,created_at:'2026-10-26T00:00:00Z'}];
  const fetcher=vi.fn<typeof fetch>().mockResolvedValue(reply(rows)),api=new LeaderboardApi(config,fetcher,store());expect(await api.listChat('undertale')).toEqual(rows);
 });
 it('still rejects raw stored-text length, control and ordering violations',async()=>{
  const row={...message,sequence:2,created_at:'2026-10-26T00:00:00Z'};
  for(const rows of [[{...row,content:'\u00a0'.repeat(501)}],[{...row,player_name:'\u00a0'.repeat(25)}],[{...row,content:'a\nb'}],[{...row,player_name:'a\u0085b'}],[{...row,content:''}],[{...row,player_name:''}],[row,{...row,sequence:3}]]){
   const api=new LeaderboardApi(config,vi.fn<typeof fetch>().mockResolvedValue(reply(rows)),store());await expect(api.listChat('undertale')).rejects.toThrow('Chat returned an invalid page');
  }
 });
});
