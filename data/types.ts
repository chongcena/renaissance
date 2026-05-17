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
export type BlazeLog = { id: string; title: string; branchId: string; releasedAt: string; sparkId: string };
export type ActionType = 'capture' | 'route' | 'create_pathway' | 'activate_fire' | 'progress' | 'complete_move' | 'release' | 'create_blaze' | 'create_sun' | 'maintain_sun' | 'freeze' | 'kill' | 'archive';
export type ActionLog = { id: string; action_type: ActionType; action: string; date: string; countsForStreak: boolean };
export type BurnerLedger = { id: string; event: string; reason: string; date: string; delta: number };
