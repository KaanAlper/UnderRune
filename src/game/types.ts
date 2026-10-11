import type {InputFrame} from './input';
export type EnemyRecord={slot:number;object:string;type:number;name:string;hp:number;at:number;df:number;acts:string[];sprite:string;sourceBlockHash:string};
export type SourceRecord={packageId:string;sha256:string;encounter:number;code:string[];rooms:string[]};
export type EncounterRecord={id:string;name:string;chapter:number;encounter:number;variant:string;kind:string;sources:SourceRecord[];enemies:EnemyRecord[];status:string;adaptation:string};
export type Bullet={id:number;x:number;y:number;vx:number;vy:number;radius:number;damage:number;age:number;lifetime:number;kind:string;color:string;angle:number;rotation:number;ax:number;ay:number;scale:number;grazed:boolean;telegraph:number;hit:boolean;data:Record<string,number>};
export type BulletInit=Partial<Bullet>&Pick<Bullet,'x'|'y'>;
export type Arena={x:number;y:number;width:number;height:number};
export type AttackContext={tick:number;random:()=>number;arena:Arena;soul:{x:number;y:number};spawn:(b:BulletInit)=>Bullet;state:Record<string,number>;bossRatio:number;turn:number};
export type Attack={id:string;name:string;duration:number;mode:'red'|'yellow'|'blue'|'shield'|'box';source:string;step:(ctx:AttackContext)=>void;update?:(b:Bullet,ctx:AttackContext)=>void};
export type BossDefinition={record:EncounterRecord;attacks:Attack[];sequence:number[];music:string;accent:string;canSpare:boolean;mercyGoal:number;description:string;differences:string[];special?:'mantle'|'susiezilla'};
export type PartyMember={name:string;hp:number;maxHp:number;attack:number;defense:number;color:string;guard:boolean};
export type EnemyState={record:EnemyRecord;hp:number;maxHp:number;mercy:number};
export type BattlePhase='command'|'target'|'act'|'item'|'magic'|'timing'|'message'|'defense'|'victory'|'defeat';
export type BattleSnapshot={phase:BattlePhase;tick:number;tp:number;turn:number;paused:boolean;bossHp:number;hp:number;maxHp:number;bullets:readonly Bullet[]};
export interface Battle{step(input:InputFrame):void;snapshot():BattleSnapshot;pause(value:boolean):void;reset(seed:number):void;}
