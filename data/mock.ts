import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SolarFlare, SparkItem, SunEngine } from './types';

export const branches: Branch[] = [
  { id: 'br-01', name: 'Music', focus: 'Hybrid ambient EP', heatScore: 86 },
  { id: 'br-02', name: 'Writing', focus: 'Creative systems essays', heatScore: 74 },
  { id: 'br-03', name: 'Design Lab', focus: 'Visual identity experiments', heatScore: 63, frozen: true },
  { id: 'br-04', name: 'Visual Merch', focus: 'Streetwear + print drops', heatScore: 68 }
];

export const spark_items: SparkItem[] = [
  { id: 'sp-100', title: 'Basement synth loop + rain foley', kind: 'audio note', branchId: 'br-01', stage: 'Fire', status: 'active', heatScore: 91, updatedAt: '2026-05-15', last_touched_at: '2026-05-15' },
  { id: 'sp-101', title: 'Essay: systems that make art inevitable', kind: 'text draft', branchId: 'br-02', stage: 'Fire', status: 'cooling', heatScore: 84, updatedAt: '2026-05-14', last_touched_at: '2026-05-09' },
  { id: 'sp-102', title: 'Grid logo mutation set', kind: 'image set', branchId: 'br-03', stage: 'Spark', status: 'frozen', heatScore: 62, updatedAt: '2026-05-10', last_touched_at: '2026-05-04' },
  { id: 'sp-103', title: 'Live set story arc', kind: 'outline', branchId: 'br-01', stage: 'Ember', status: 'active', heatScore: 72, updatedAt: '2026-05-16', last_touched_at: '2026-05-16' },
  { id: 'sp-104', title: 'Backyard Mural', kind: 'photo + sketch dump', branchId: 'br-03', stage: 'Ember', status: 'active', heatScore: 70, updatedAt: '2026-05-13', last_touched_at: '2026-05-12' },
  { id: 'sp-105', title: 'Untitled Lyrics', kind: 'voice memo transcript', branchId: 'br-01', stage: 'Spark', status: 'new', heatScore: 66, updatedAt: '2026-05-16', last_touched_at: '2026-05-16' },
  { id: 'sp-106', title: 'Flash Sheet 02', kind: 'illustration concepts', branchId: 'br-03', stage: 'Fire', status: 'active', heatScore: 88, updatedAt: '2026-05-15', last_touched_at: '2026-05-15' },
  { id: 'sp-107', title: 'Mandala Tee Mockup', kind: 'product mockup', branchId: 'br-04', stage: 'Fire', status: 'cooling', heatScore: 81, updatedAt: '2026-05-12', last_touched_at: '2026-05-07' },
  { id: 'sp-108', title: 'Faith vs Ego Podcast Thought', kind: 'voice note', branchId: 'br-02', stage: 'Spark', status: 'active', heatScore: 64, updatedAt: '2026-05-11', last_touched_at: '2026-05-08' }
];

export const sparks = spark_items;

export const pathways: Pathway[] = [
  { id: 'pw-01', sparkId: 'sp-100', lane: 'Single release', confidence: 82, status: 'active', last_touched_at: '2026-05-15' },
  { id: 'pw-02', sparkId: 'sp-101', lane: 'Newsletter series', confidence: 76, status: 'active', last_touched_at: '2026-05-11' },
  { id: 'pw-03', sparkId: 'sp-103', lane: 'Behind-the-scenes post', confidence: 65, status: 'new', last_touched_at: '2026-05-16' },
  { id: 'pw-04', sparkId: 'sp-106', lane: 'Tattoo drop campaign', confidence: 79, status: 'active', last_touched_at: '2026-05-15' },
  { id: 'pw-05', sparkId: 'sp-107', lane: 'Limited apparel release', confidence: 83, status: 'cooling', last_touched_at: '2026-05-08' }
];

export const blaze_logs: BlazeLog[] = [
  { id: 'blz-01', title: 'Released track teaser reel', branchId: 'br-01', releasedAt: '2026-05-13', sparkId: 'sp-100', outputType: 'video reel', valueTags: ['consistency', 'visibility'] },
  { id: 'blz-02', title: 'Published essay #4', branchId: 'br-02', releasedAt: '2026-05-09', sparkId: 'sp-101', outputType: 'essay', valueTags: ['authority', 'clarity'] },
  { id: 'blz-03', title: 'Flash Sheet mini-drop', branchId: 'br-03', releasedAt: '2026-05-06', sparkId: 'sp-106', outputType: 'design drop', valueTags: ['demand test', 'signal'] }
];

export const blazes = blaze_logs;

export const sun_engines: SunEngine[] = [
  { id: 'sun-01', title: 'Morning Capture → Afternoon Publish', evidence: 'Repeated Fire progression on days with early capture', relatedBranchId: 'br-01', confidence: 78 },
  { id: 'sun-02', title: 'Essay Cadence Engine', evidence: 'Weekly writing sparks converted to blazes via pathway drafts', relatedBranchId: 'br-02', confidence: 73 }
];

export const solar_flares: SolarFlare[] = [
  { id: 'sf-01', possibleSunTitle: 'Morning Capture Sprint', evidence: '3 Fire items started after short morning sessions', relatedBranchId: 'br-01' },
  { id: 'sf-02', possibleSunTitle: 'Publish Cadence Loop', evidence: '2 Blazes emerged when pathway confidence exceeded 75%', relatedBranchId: 'br-02' }
];

export const action_log: ActionLog[] = [
  { id: 'ac-01', action: 'Routed Spark to 2 pathways', date: '2026-05-16' },
  { id: 'ac-02', action: 'Completed Heat Check on Writing branch', date: '2026-05-15' },
  { id: 'ac-03', action: 'Logged Blaze and minted Burner', date: '2026-05-14' },
  { id: 'ac-04', action: 'Reactivated Backyard Mural spark', date: '2026-05-13' }
];

export const actions = action_log;

export const burner_ledger: BurnerLedger[] = [
  { id: 'bn-01', event: 'Earned', reason: 'Released output', date: '2026-05-13', delta: 1 },
  { id: 'bn-02', event: 'Earned', reason: 'Published essay #4', date: '2026-05-09', delta: 1 },
  { id: 'bn-03', event: 'Spent (Burn Day)', reason: 'Protected missed day', date: '2026-05-10', delta: -1 }
];
