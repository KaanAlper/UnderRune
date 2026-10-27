import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createSpearContext, type HammerSpearAudio } from './spear-context';
import { spearDispatch1 } from './spear-dispatch-1';
import { spearDispatch2 } from './spear-dispatch-2';
import { spearDispatch3 } from './spear-dispatch-3';
import { spearDispatch4 } from './spear-dispatch-4';
import { spearDefault } from './spear-default';
/** scr_spearshot: build the actual source actor with its source parameters. Child Create runs before these assignments. */
export function spawnHammerSpear(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef, audio: HammerSpearAudio, ...args: number[]) { if (args.length < 4)
    throw Error('scr_spearshot requires four arguments'); const c = createSpearContext(s, rt, object, audio, args); if (spearDispatch1(c))
    return; if (spearDispatch2(c))
    return; if (spearDispatch3(c))
    return; if (spearDispatch4(c))
    return; spearDefault(c); }
