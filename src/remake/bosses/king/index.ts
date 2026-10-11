// Chapter 1 King attack objects. Native encounter dialogue/ACT/cutscene flow is not installed here.
export {kingBoss,beginKingAttack,nextKingAttack} from './boss';
export {kingBulletController,skyChain,fadeChain} from './sky';
export {chainKing,chainPiece,waveChain,finalChain,nonsolidGrowtangle} from './chains';
export {growtangleBouncer} from './bouncer';
export const kingUnsupportedDependencies=['obj_chain_of_hell path-based debug attack (chainKing.type=0)','obj_king_body debug controller','obj_growtangle_bouncer debug types0/1/2/4','obj_king_boss Step dialogue/ACT/special hero/cutscene flow'] as const;
