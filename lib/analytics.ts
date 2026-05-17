import type { ActionLog, BlazeLog, Branch, Pathway, SparkItem } from '@/data/types';

export type AlignmentStatus = 'balanced' | 'underfed' | 'over-consuming';

export function getActionBranchId(action: ActionLog, sparks: SparkItem[]) {
  if (action.branchId) return action.branchId;
  if (!action.sparkId) return undefined;
  return sparks.find((spark) => spark.id === action.sparkId)?.branchId;
}

export function getBranchAttention(branches: Branch[], actions: ActionLog[], sparks: SparkItem[]) {
  const meaningful = actions.filter((action) => action.countsForStreak);
  const total = meaningful.length || 1;
  return branches.map((branch) => {
    const actualCount = meaningful.filter((action) => getActionBranchId(action, sparks) === branch.id).length;
    const actual = Math.round((actualCount / total) * 100);
    const diff = actual - branch.strategicWeight;
    const status: AlignmentStatus = diff > 8 ? 'over-consuming' : diff < -8 ? 'underfed' : 'balanced';
    return { ...branch, actual, diff, status, actualCount };
  });
}

export function getStageCounts(sparks: SparkItem[]) {
  return {
    Spark: sparks.filter((spark) => spark.stage === 'Spark').length,
    Ember: sparks.filter((spark) => spark.stage === 'Ember').length,
    Fire: sparks.filter((spark) => spark.stage === 'Fire').length,
    Blaze: sparks.filter((spark) => spark.stage === 'Blaze').length
  };
}

export function getHeatCalendar(actions: ActionLog[], daysBack = 42) {
  const meaningful = actions.filter((action) => action.countsForStreak);
  const counts = new Map<string, number>();
  meaningful.forEach((action) => counts.set(action.date, (counts.get(action.date) ?? 0) + 1));
  const out: Array<{ date: string; count: number }> = [];
  const cursor = new Date();
  for (let i = daysBack - 1; i >= 0; i -= 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() - i);
    const date = day.toISOString().slice(0, 10);
    out.push({ date, count: counts.get(date) ?? 0 });
  }
  return out;
}

export function getConversionData(sparks: SparkItem[], pathways: Pathway[], blazes: BlazeLog[]) {
  const sparksCaptured = sparks.length;
  const routedEmbers = sparks.filter((spark) => ['Ember', 'Fire', 'Blaze'].includes(spark.stage)).length;
  const activeFires = sparks.filter((spark) => spark.stage === 'Fire' && spark.status === 'active').length;
  const releasedBlazes = blazes.length;
  return [
    { name: 'Sparks', value: sparksCaptured },
    { name: 'Routed Embers', value: routedEmbers },
    { name: 'Active Fires', value: activeFires },
    { name: 'Released Blazes', value: releasedBlazes }
  ];
}
