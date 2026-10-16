import {afterEach,describe,expect,it,vi} from 'vitest';
import {LeaderboardApi,loadLeaderboardConfig} from '../src/game/leaderboard-api';
import type {RunRecord} from '../src/game/battle-run';
const config={url:'https://example.supabase.co',key:'sb_publishable_test'};
const run:RunRecord={id:'cc198215-62e0-4f25-8e09-099465856204',encounter_id:'ch2:61',rules_version:'battle-v1',duration_ms:12000,damage:15,equipment:[{character:1,weapon:3,armor:[0,2]}],bag:[4,4],used_items:[4],no_item:false,no_armor:false};
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status});
const session={access_token:'user-token',refresh_token:'refresh-token',expires_at:Math.floor(Date.now()/1000)+3600};
const memory=()=>{const map=new Map<string,string>();return {getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};};
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
describe('shared leaderboard transport',()=>{
 it('combines every filter on the server before fixed pagination, preserving zero bounds',async()=>{
  const fetcher=vi.fn<typeof fetch>().mockResolvedValue(response([]));const api=new LeaderboardApi(config,fetcher);
  await api.list({encounterId:'ch2:61',minDamage:0,maxDamage:90,minSeconds:0,maxSeconds:12.5,noItem:true,noArmor:true,weapon:3,armor:2,bagItem:4,usedItem:5,offset:25});
  const url=new URL(String(fetcher.mock.calls[0][0]));
  expect(url.pathname).toBe('/rest/v1/leaderboard_runs');expect(url.searchParams.get('encounter_id')).toBe('eq.ch2:61');
  expect(url.searchParams.get('rules_version')).toBe('eq.battle-v1');expect(url.searchParams.getAll('damage')).toEqual(['gte.0','lte.90']);
  expect(url.searchParams.getAll('duration_ms')).toEqual(['gte.0','lte.12500']);expect(url.searchParams.get('no_item')).toBe('eq.true');expect(url.searchParams.get('no_armor')).toBe('eq.true');
  expect(url.searchParams.getAll('equipment')).toEqual(['cs.[{"weapon":3}]','cs.[{"armor":[2]}]']);expect(url.searchParams.get('bag')).toBe('cs.{4}');expect(url.searchParams.get('used_items')).toBe('cs.{5}');
  expect(url.searchParams.get('limit')).toBe('25');expect(url.searchParams.get('offset')).toBe('25');expect(url.searchParams.get('order')).toBe('damage.asc,duration_ms.asc,id.asc');
 });
 it('supports duration-first ordering and rejects invalid numeric filters before fetch',async()=>{
  const fetcher=vi.fn<typeof fetch>().mockResolvedValue(response([]));const api=new LeaderboardApi(config,fetcher);
  await api.list({encounterId:'ch1:1',order:'time'});expect(new URL(String(fetcher.mock.calls[0][0])).searchParams.get('order')).toBe('duration_ms.asc,damage.asc,id.asc');
  await expect(api.list({encounterId:'ch1:1',maxDamage:-1})).rejects.toThrow(/filter/i);
  await expect(api.list({encounterId:'ch1:1',minDamage:20,maxDamage:10})).rejects.toThrow(/filter/i);expect(fetcher).toHaveBeenCalledTimes(1);
 });
 it('does not turn missing service configuration into synthetic scores',async()=>{
  const fetcher=vi.fn<typeof fetch>();const api=new LeaderboardApi(null,fetcher);expect(api.configured).toBe(false);await expect(api.list({encounterId:'ch1:1'})).rejects.toThrow(/not configured/i);expect(fetcher).not.toHaveBeenCalled();
 });
 it('rejects secret and legacy service role keys before any request',()=>{
  expect(()=>new LeaderboardApi({...config,key:'sb_secret_never-browser'})).toThrow(/publishable/i);
  expect(()=>new LeaderboardApi({...config,key:'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.sig'})).toThrow(/publishable/i);
 });
 it('signs in anonymously only for publishing, sends immutable run and remembers the session',async()=>{
  const storage=memory();const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(response(session)).mockResolvedValueOnce(response(null));
  await new LeaderboardApi(config,fetcher,storage).submit(run,'  Kris  ');
  expect(String(fetcher.mock.calls[0][0])).toContain('/auth/v1/signup');expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({data:{}});
  const [url,init]=fetcher.mock.calls[1];expect(String(url)).toContain('/rest/v1/rpc/submit_leaderboard_run');expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer user-token');expect(JSON.parse(String(init?.body))).toEqual({p_run:run,p_player_name:'Kris'});
  const next=vi.fn<typeof fetch>().mockResolvedValue(response(null));await new LeaderboardApi(config,next,storage).submit(run,'Kris');expect(next).toHaveBeenCalledTimes(1);
 });
 it('refreshes an expired persisted session and retries one unauthorized submission',async()=>{
  const storage=memory();const initial=vi.fn<typeof fetch>().mockResolvedValueOnce(response(session)).mockResolvedValueOnce(response(null));await new LeaderboardApi(config,initial,storage).submit(run,'Kris');
  const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(response({message:'expired'},401)).mockResolvedValueOnce(response({...session,access_token:'renewed'})).mockResolvedValueOnce(response(null));
  await new LeaderboardApi(config,fetcher,storage).submit(run,'Kris');expect(String(fetcher.mock.calls[1][0])).toContain('/auth/v1/token?grant_type=refresh_token');expect(new Headers(fetcher.mock.calls[2][1]?.headers).get('Authorization')).toBe('Bearer renewed');
 });
 it('retries explicitly after network failure without changing the run ID',async()=>{
  const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(response(session)).mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(response(null));const api=new LeaderboardApi(config,fetcher,memory());
  await expect(api.submit(run,'Kris')).rejects.toThrow(/offline/i);await api.submit(run,'Kris');expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body)).p_run.id).toBe(JSON.parse(String(fetcher.mock.calls[2][1]?.body)).p_run.id);
 });
 it('bounds hung requests and forwards external cancellation',async()=>{
  vi.useFakeTimers();const fetcher=vi.fn<typeof fetch>().mockImplementation((_url,init)=>new Promise((_resolve,reject)=>{init?.signal?.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')));}));const api=new LeaderboardApi(config,fetcher);
  const pending=api.list({encounterId:'ch1:1'});const assertion=expect(pending).rejects.toThrow(/timed out/i);await vi.advanceTimersByTimeAsync(15000);await assertion;
  const controller=new AbortController();const canceled=api.list({encounterId:'ch1:1'},controller.signal);const check=expect(canceled).rejects.toMatchObject({name:'AbortError'});controller.abort();await check;
 });
 it('preserves service errors rather than reporting an empty board',async()=>{
  const fetcher=vi.fn<typeof fetch>().mockResolvedValue(response({message:'database unavailable'},503));await expect(new LeaderboardApi(config,fetcher).list({encounterId:'ch1:1'})).rejects.toThrow(/database unavailable/i);
 });
 it('loads project-relative config and distinguishes missing, invalid and failed files',async()=>{
  const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(response({},404)).mockResolvedValueOnce(response({url:'',key:''})).mockResolvedValueOnce(response(config)).mockResolvedValueOnce(response({},503));vi.stubGlobal('fetch',fetcher);
  expect(await loadLeaderboardConfig()).toBeNull();expect(await loadLeaderboardConfig()).toBeNull();expect(await loadLeaderboardConfig()).toEqual(config);await expect(loadLeaderboardConfig()).rejects.toThrow(/configuration/i);expect(String(fetcher.mock.calls[0][0])).toMatch(/\/leaderboard-config.json$/);
 });
});

it('keeps the timeout active while a response body is still arriving',async()=>{
 vi.useFakeTimers();const fetcher=vi.fn<typeof fetch>().mockImplementation(async(_url,init)=>new Response(new ReadableStream({start(controller){init?.signal?.addEventListener('abort',()=>controller.error(new DOMException('aborted','AbortError')));}})));
 const pending=new LeaderboardApi(config,fetcher).list({encounterId:'ch2-61'});const assertion=expect(pending).rejects.toThrow(/timed out/i);await vi.advanceTimersByTimeAsync(15000);await assertion;
});

it('retries a transient configuration failure without reloading or disabling gameplay',async()=>{
 const loader=vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValue(config),fetcher=vi.fn<typeof fetch>().mockResolvedValue(response([]));
 const api=new LeaderboardApi(null,fetcher,memory(),loader);await expect(api.connect()).rejects.toThrow('offline');expect(api.configured).toBe(false);
 await api.connect();expect(api.configured).toBe(true);expect(await api.list({encounterId:'ch2-61'})).toEqual([]);await api.connect();expect(loader).toHaveBeenCalledTimes(2);
});

it('recovers a revoked refresh token for future runs without changing a pending run ID',async()=>{
 const storage=memory();const initial=vi.fn<typeof fetch>().mockResolvedValueOnce(response(session)).mockResolvedValueOnce(response(null));await new LeaderboardApi(config,initial,storage).submit(run,'Kris');
 const fetcher=vi.fn<typeof fetch>().mockResolvedValueOnce(response({},401)).mockResolvedValueOnce(response({error_code:'refresh_token_not_found'},400)).mockResolvedValueOnce(response({...session,access_token:'new-anonymous-user'})).mockResolvedValueOnce(response(null));
 await new LeaderboardApi(config,fetcher,storage).submit(run,'Kris');expect(String(fetcher.mock.calls[2][0])).toContain('/auth/v1/signup');expect(JSON.parse(String(fetcher.mock.calls[3][1]?.body)).p_run.id).toBe(run.id);
});
