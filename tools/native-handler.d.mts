import type {Plugin} from 'vite';
import type {IncomingMessage, ServerResponse} from 'node:http';
type Options = {root?: string; game?: string};
export const projectRoot: string;
export const NATIVE_UNSUPPORTED: Set<string>;
export function defaultGameDir(): string;
export function nativeProfiles(root?: string): Promise<{catalog: unknown[]; profiles: Record<string, {id: string; name: string; chapter: number; encounter: number; special: number; music: string; party: number[]}>}>;
export function createNativeHandler(options?: Options): (req: IncomingMessage, res: ServerResponse, next?: () => void) => Promise<void>;
export function underruneNative(options?: Options): Plugin;
