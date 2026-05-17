import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SparkAttachment, SparkItem } from './types';

export const branches: Branch[] = [
  { id: 'br-01', name: 'Music', focus: 'Hybrid ambient EP', strategicWeight: 40, role: 'Driver' },
  { id: 'br-02', name: 'Writing', focus: 'Creative systems essays', strategicWeight: 35, role: 'Strategic Flagship' },
  { id: 'br-03', name: 'Design Lab', focus: 'Visual identity experiments', strategicWeight: 25, role: 'Audience Builder', frozen: true }
];

export const spark_items: SparkItem[] = [
  { id: 'sp-100', title: 'Basement synth loop + rain foley', kind: 'audio note', branchId: 'br-01', stage: 'Spark', status: 'active', heatScore: 91, updatedAt: '2026-05-15', last_touched_at: '2026-05-15' },
  { id: 'sp-101', title: 'Essay: systems that make art inevitable', kind: 'text draft', branchId: 'br-02', stage: 'Ember', status: 'cooling', heatScore: 77, updatedAt: '2026-05-14', last_touched_at: '2026-05-12' }
];

export const spark_attachments: SparkAttachment[] = [
  { id: 'att-01', sparkId: 'sp-100', name: 'Basement loop idea', type: 'note', textContent: 'Slow build with vinyl crackle and thunder textures.', createdAt: '2026-05-15' }
];

export const pathways: Pathway[] = [
  { id: 'pw-01', sparkId: 'sp-100', title: 'Single release', outputType: 'single', confidence: 82, status: 'active', currentAction: 'Bounce final mix', valueTags: ['catalog'], last_touched_at: '2026-05-15' },
  { id: 'pw-02', sparkId: 'sp-101', title: 'Newsletter series', outputType: 'essay', confidence: 76, status: 'possible', last_touched_at: '2026-05-13' }
];

export const blaze_logs: BlazeLog[] = [
  { id: 'blz-01', title: 'Released track teaser reel', branchId: 'br-01', releasedAt: '2026-05-13', sparkId: 'sp-100' }
];

export const action_log: ActionLog[] = [
  { id: 'ac-01', action_type: 'route', action: 'Routed Spark to 2 pathways', date: '2026-05-15', countsForStreak: true, branchId: 'br-01', sparkId: 'sp-100' },
  { id: 'ac-02', action_type: 'progress', action: 'Completed Heat Check on Writing branch', date: '2026-05-14', countsForStreak: true, branchId: 'br-02', sparkId: 'sp-101' },
  { id: 'ac-03', action_type: 'create_blaze', action: 'Logged Blaze and minted Burner', date: '2026-05-13', countsForStreak: true, branchId: 'br-01', sparkId: 'sp-100' }
];

export const burner_ledger: BurnerLedger[] = [
  { id: 'bn-01', event: 'Earned', reason: 'Released output', date: '2026-05-13', delta: 1 }
];
