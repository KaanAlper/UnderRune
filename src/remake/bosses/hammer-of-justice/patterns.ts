/** obj_hammer_of_justice_enemy User 0: construct the source queue, then advance the story turn. */
import type { GmInstance, GmRuntime } from '../../gm/runtime';
import { createPatternContext } from './pattern-context';
import { patternBlock1 } from './patterns-1';
import { patternBlock2 } from './patterns-2';
import { patternBlock3 } from './patterns-3';
import { patternBlock4 } from './patterns-4';
import { patternBlock5 } from './patterns-5';
import { patternBlock6 } from './patterns-6';
export function buildHammerPattern(s: GmInstance, rt: GmRuntime, debug?: (message: string) => void) {
    const c = createPatternContext(s, rt, debug);
    patternBlock1(c);
    patternBlock2(c);
    patternBlock3(c);
    patternBlock4(c);
    patternBlock5(c);
    patternBlock6(c);
}
