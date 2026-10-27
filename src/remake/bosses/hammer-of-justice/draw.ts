import type { GmInstance, GmRuntime, GmObjectDef } from '../../gm/runtime';
import { createDrawContext, type HammerDrawScripts } from './draw-context';
import { drawBlock1 } from './draw-1';
import { drawBlock2 } from './draw-2';
import { drawBlock3 } from './draw-3';
import { drawBlock4 } from './draw-4';
export function drawHammer(s: GmInstance, rt: GmRuntime, object: (name: string) => GmObjectDef, scripts: HammerDrawScripts) { const c = createDrawContext(s, rt, object, scripts); drawBlock1(c); drawBlock2(c); drawBlock3(c); drawBlock4(c); }
