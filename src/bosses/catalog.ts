import catalogData from './catalog.json';
import type {EncounterRecord} from '../game/types';

/** Source inventory; playability is defined separately by source/native encounter availability. */
export const catalog=catalogData as EncounterRecord[];
