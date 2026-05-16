export type Stage = 'Spark' | 'Ember' | 'Fire' | 'Blaze';
export type Status = 'new' | 'active' | 'cooling' | 'frozen' | 'archived' | 'killed';

export type Branch = { id: string; name: string; focus: string; heatScore: number; frozen?: boolean };
export type SparkItem = {
  id: string;
  title: string;
  kind: string;
  branchId: string;
  stage: Stage;
  status: Status;
  heatScore: number;
  updatedAt: string;
  last_touched_at: string;
  notes?: string;
};

export type Pathway = { id: string; sparkId: string; lane: string; confidence: number; status: Status; last_touched_at: string };
export type BlazeLog = { id: string; title: string; branchId: string; releasedAt: string; sparkId: string; outputType?: string; valueTags?: string[] };
export type SunEngine = { id: string; title: string; evidence: string; relatedBranchId: string; confidence: number };
export type SolarFlare = { id: string; possibleSunTitle: string; evidence: string; relatedBranchId: string };
export type ActionLog = { id: string; action: string; date: string };
export type BurnerLedger = { id: string; event: string; reason: string; date: string; delta: number };
