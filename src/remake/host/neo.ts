import {createChapter2Registry} from './chapter2';
/** Chapter 2 canonical object registry and explicit common-engine boundaries.
 * Resource-only definitions may be queried but never created silently. */
import {type GmObjectDef,type GmInstance,type GmRuntime,resolveEvent} from '../gm/runtime';
import {createNeoSourceObject,executeNeoSource} from '../bosses/spamton-neo/body-source';
import {createNeoEnemy,createNeoEnemyEffects} from '../bosses/spamton-neo/enemy';
import {createNeoPlayerObjects} from '../bosses/spamton-neo/yellow-heart';
import {createNeoAttackObjects} from '../bosses/spamton-neo/controller';
import {createNeoSceneObjects,enterNeoBattleScene,type NeoSceneHost} from '../bosses/spamton-neo/scene';
import {neoHostScripts,neoHostObjectSources,neoWriterSmallFaceSource,neoResourceMetadata} from '../bosses/spamton-neo/host-source';
import {attackScriptSources} from '../bosses/spamton-neo/attack-script-source';
import {neoEnemyUtilityScriptSources} from '../bosses/spamton-neo/enemy-source-data';
import {spamtonNeo,hitDetector} from '../bosses/spamton-neo/neo';
import * as pending from '../bosses/spamton-neo/pending';
import {battleBalloon2,battleCleanup,growtangle2} from '../deltarune/chapter2-objects';
import {lerpPitch,moveToPoint,scriptDelayed} from '../deltarune/chapter2-battle';
import {shotAfterimage,shotHit,soulSpark,superchargeEnd,yellowShot} from '../deltarune/yellow-soul';
import {vineCut,vineTransition,vineWeak} from '../bosses/spamton-neo/vines';
import {createSneoBulletController,sneoBulletController} from '../bosses/spamton-neo/bullet-controller';
import {createFlyingHeads} from '../bosses/spamton-neo/flying-heads';
import {createNeoSupport} from '../bosses/spamton-neo/support';
import {createNeoWalls} from '../bosses/spamton-neo/walls';
import {createNeoWireHeart} from '../bosses/spamton-neo/wireheart';
import {createNeoPhonecall} from '../bosses/spamton-neo/phonecall';
import {createNeoPhonehands} from '../bosses/spamton-neo/phonehands';
import {createNeoFace} from '../bosses/spamton-neo/face';
import {createNeoLasers} from '../bosses/spamton-neo/lasers';
import {createNeoFinale} from '../bosses/spamton-neo/finale';
import {fadeOut} from '../deltarune/fades';

/** Chapter 2 objects that run as hand-written code (the rest still run from the local source archive). */
const NEO_PORTED:GmObjectDef[]=[spamtonNeo,hitDetector,battleBalloon2,growtangle2,battleCleanup,moveToPoint,scriptDelayed,lerpPitch,fadeOut,
 yellowShot,shotAfterimage,shotHit,superchargeEnd,soulSpark,vineCut,vineTransition,vineWeak];
/** Shared engine objects whose Chapter 2 source versions are replaced by the engine's own (with its chapter rules). */
const ENGINE_PORTED=new Set(['obj_heart','obj_grazebox','obj_moveheart','obj_collidebullet','obj_regularbullet']);

export function installNeoHost(rt:GmRuntime,options:{rage?:boolean}={}){
 const registry=createChapter2Registry(rt,{metadata:neoResourceMetadata,scripts:{...neoEnemyUtilityScriptSources,...neoHostScripts,...attackScriptSources},room:'room_dw_mansion_b_east'});
 const {objects,host,object}=registry;
 for(const [name,def] of Object.entries(createNeoPlayerObjects(host)))if(!ENGINE_PORTED.has(name))objects[name]=def;
 objects.obj_spamton_neo_enemy=createNeoEnemy(host);Object.assign(objects,createNeoEnemyEffects(host));
 Object.assign(objects,createNeoAttackObjects(host));
 Object.assign(objects,createNeoSceneObjects(host));
 for(const [name,record] of Object.entries(neoHostObjectSources))if(!ENGINE_PORTED.has(name))objects[name]=createNeoSourceObject(host,record.metadata,record.sources);
 // Preserve factory order: each family's lazy selectors see the previously registered canonical objects.
 const factories:(()=>GmObjectDef[])[]=[()=>NEO_PORTED,()=>createNeoSupport(object),()=>[createSneoBulletController(object)],()=>createFlyingHeads(object),()=>createNeoWalls(object),()=>createNeoWireHeart(object),()=>createNeoPhonecall(object),()=>createNeoPhonehands(object),()=>createNeoFace(object),()=>createNeoLasers(object),()=>createNeoFinale(object)];
 for(const make of factories)registry.register(make(),definition=>definition.name==='obj_spamton_neo_enemy'&&options.rage===false?{...definition,events:{...definition.events,user4:()=>{}}}:definition);
 registry.finalize([[sneoBulletController,object(sneoBulletController.name)],...Object.values(pending).map(stub=>[stub,object(stub.name)] as const)]);
 rt.globals.onChapter2SmallFace=(s:GmInstance,code:string)=>{Object.assign(s,{nextchar:'f',nextchar2:code,faced:0});executeNeoSource(neoWriterSmallFaceSource,s,rt,host);};
 return {host,objects,enter:(enemy:GmInstance)=>enterNeoBattleScene(rt,host,enemy)};
}
