import {createNeoSourceObject,type NeoSourceHost} from './body-source';
import {neoPlayerSources} from './player-source';
import type {GmObjectDef} from '../../gm/runtime';

/** Actual Chapter2 Create/Step/Draw/collision events, including the yellow charge and source movement. */
export function createNeoPlayerObjects(external:NeoSourceHost):Record<string,GmObjectDef>{
 const objects:Record<string,GmObjectDef>={};
 const host:NeoSourceHost={...external,object:name=>objects[name]??external.object(name)};
 for(const record of neoPlayerSources)objects[record.metadata.name]=createNeoSourceObject(host,record.metadata,record.sources);
 return objects;
}
