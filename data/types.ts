export type Stage = 'Spark' | 'Ember' | 'Flame' | 'Blaze';
export type Status = 'new' | 'active' | 'cooling' | 'frozen' | 'killed';
export type PathwayStatus = 'possible' | 'chosen' | 'active' | 'completed' | 'frozen';

export type TimelineBucket = 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'later';

export type BranchRole = 'Driver' | 'Audience Builder' | 'Strategic Flagship' | 'Maintenance' | 'Support';
export type Branch = { id: string; name: string; focus: string; strategicWeight: number; role: BranchRole; color?: 'gold'|'orange'|'red'|'purple'|'blue'|'cyan'|'green'|'pink'|'neutral'; frozen?: boolean; tags?: string[]; currentGoalId?: string };

export type GoalStatus = 'active' | 'paused' | 'complete';
export type Goal = {
  id: string;
  title: string;
  pillarId: string;
  status: GoalStatus;
  scale: 'year' | 'month' | 'week' | 'day';
  priorityWeight?: number;
  scheduleBucket?: TimelineBucket;
  startDate?: string;
  dueDate?: string;
  currentAction?: string;
};

export type SparkAttachmentType = 'image' | 'audio' | 'video' | 'file' | 'link' | 'note';
export type SparkAttachment = {
  id: string;
  sparkId: string;
  name: string;
  type: SparkAttachmentType;
  mimeType?: string;
  size?: number;
  objectUrl?: string;
  textContent?: string;
  linkUrl?: string;
  createdAt: string;
};

export type SparkItem = {
  id: string;
  title: string;
  kind: string;
  branchId: string;
  goalId?: string;
  scheduleBucket?: TimelineBucket;
  dueDate?: string;
  currentAction?: string;
  evolutionForm?: string;
  evolutionPath?: string;
  evolutionPurpose?: string;
  stage: Stage;
  status: Status;
  heatScore: number; // legacy field; no longer used for active priority logic
  updatedAt: string;
  last_touched_at: string;
  notes?: string;
  manualPin?: boolean;
};

export type Pathway = {
  id: string;
  sparkId: string;
  title: string;
  outputType?: string;
  confidence: number;
  status: PathwayStatus;
  branchId?: string;
  currentAction?: string;
  manualPin?: boolean;
  readinessNote?: string;
  valueTags?: string[];
  last_touched_at: string;
};
export type BlazeLog = { id: string; title: string; branchId: string; releasedAt: string; sparkId: string; outputType?: string; pathwayId?: string; notes?: string };
export type ActionType = 'capture' | 'route' | 'create_pathway' | 'activate_fire' | 'progress' | 'set_next_move' | 'complete_move' | 'release' | 'create_blaze' | 'create_sun' | 'maintain_sun' | 'freeze' | 'kill' | 'archive';
export type ActionLog = { id: string; action_type: ActionType; action: string; date: string; countsForStreak: boolean; branchId?: string; sparkId?: string };
export type BurnerLedger = { id: string; event: string; reason: string; date: string; delta: number };
