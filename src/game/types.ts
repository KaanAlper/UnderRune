export type EnemyRecord={slot:number;object:string;type:number;name:string;hp:number;at:number;df:number;acts:string[];sprite:string;sourceBlockHash:string};
export type SourceRecord={packageId:string;sha256:string;encounter:number;code:string[];rooms:string[]};
export type EncounterRecord={id:string;name:string;chapter:number;encounter:number;variant:string;kind:string;sources:SourceRecord[];enemies:EnemyRecord[];status:string;adaptation:string};
