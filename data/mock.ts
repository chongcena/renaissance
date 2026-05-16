import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SparkItem } from './types';

export const branches: Branch[] = [
  { id: 'br-01', name: 'Music', focus: 'Hybrid ambient EP', heatScore: 86 },
  { id: 'br-02', name: 'Writing', focus: 'Creative systems essays', heatScore: 74 },
  { id: 'br-03', name: 'Design Lab', focus: 'Visual identity experiments', heatScore: 63, frozen: true }
];

export const spark_items: SparkItem[] = [
  { id: 'sp-100', title: 'Basement synth loop + rain foley', kind: 'audio note', branchId: 'br-01', stage: 'Fire', status: 'active', heatScore: 91, updatedAt: '2026-05-15', last_touched_at: '2026-05-15' },
  { id: 'sp-101', title: 'Essay: systems that make art inevitable', kind: 'text draft', branchId: 'br-02', stage: 'Fire', status: 'cooling', heatScore: 84, updatedAt: '2026-05-14', last_touched_at: '2026-05-09' },
  { id: 'sp-102', title: 'Grid logo mutation set', kind: 'image set', branchId: 'br-03', stage: 'Spark', status: 'frozen', heatScore: 62, updatedAt: '2026-05-10', last_touched_at: '2026-05-04' },
  { id: 'sp-103', title: 'Live set story arc', kind: 'outline', branchId: 'br-01', stage: 'Ember', status: 'active', heatScore: 72, updatedAt: '2026-05-16', last_touched_at: '2026-05-16' }
];

export const pathways: Pathway[] = [
  { id: 'pw-01', sparkId: 'sp-100', lane: 'Single release', confidence: 82, status: 'active', last_touched_at: '2026-05-15' },
  { id: 'pw-02', sparkId: 'sp-101', lane: 'Newsletter series', confidence: 76, status: 'active', last_touched_at: '2026-05-11' },
  { id: 'pw-03', sparkId: 'sp-103', lane: 'Behind-the-scenes post', confidence: 65, status: 'new', last_touched_at: '2026-05-16' }
];

export const blaze_logs: BlazeLog[] = [
  { id: 'blz-01', title: 'Released track teaser reel', branchId: 'br-01', releasedAt: '2026-05-13', sparkId: 'sp-100' },
  { id: 'blz-02', title: 'Published essay #4', branchId: 'br-02', releasedAt: '2026-05-09', sparkId: 'sp-101' }
];

export const action_log: ActionLog[] = [
  { id: 'ac-01', action: 'Routed Spark to 2 pathways', date: '2026-05-16' },
  { id: 'ac-02', action: 'Completed Heat Check on Writing branch', date: '2026-05-15' },
  { id: 'ac-03', action: 'Logged Blaze and minted Burner', date: '2026-05-14' }
];

export const burner_ledger: BurnerLedger[] = [
  { id: 'bn-01', event: 'Earned', reason: 'Released output', date: '2026-05-13', delta: 1 },
  { id: 'bn-02', event: 'Earned', reason: 'Published essay #4', date: '2026-05-09', delta: 1 }
];
