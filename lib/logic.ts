import type { ActionLog, BlazeLog, Branch, Goal, Pathway, SparkItem } from '@/data/types';
import { deriveCoolingState, derivePriorityChip } from '@/lib/ui';

type LogicContext = { branches: Branch[]; pathways: Pathway[]; blazes: BlazeLog[]; goals?: Goal[] };
type ReadinessLabel = 'Weak' | 'Possible' | 'Strong' | 'Active';

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const daysSince = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (value: string, amount: number) => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return iso(date);
};

function getDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const [from, to] = start <= end ? [start, end] : [end, start];
  const dates: string[] = [];
  for (const cursor = new Date(from); cursor <= to; cursor.setUTCDate(cursor.getUTCDate() + 1)) dates.push(iso(cursor));
  return dates;
}

export function getGoalScheduleDates(goal: Goal, todayIso = iso(new Date())) {
  const dates = new Set<string>();
  if (goal.startDate && goal.dueDate) getDateRange(goal.startDate, goal.dueDate).forEach((date) => dates.add(date));
  else if (goal.dueDate) dates.add(goal.dueDate);
  else if (goal.startDate) dates.add(goal.startDate);
  if (goal.scheduleBucket === 'today') dates.add(todayIso);
  if (goal.scheduleBucket === 'tomorrow') dates.add(addDays(todayIso, 1));
  return [...dates];
}

export function getScheduledGoalDates(goal: Goal, todayDate = iso(new Date())) {
  const dates = new Set<string>(getGoalScheduleDates(goal, todayDate));
  if (goal.scheduleBucket === 'this_week') {
    if (goal.startDate && goal.dueDate) getDateRange(goal.startDate, goal.dueDate).forEach((date) => dates.add(date));
    else if (goal.startDate) dates.add(goal.startDate);
    else {
      const base = new Date(`${todayDate}T00:00:00Z`);
      const weekday = base.getUTCDay();
      const weekStart = new Date(base);
      weekStart.setUTCDate(base.getUTCDate() - weekday);
      for (let i = 0; i < 7; i += 1) dates.add(iso(new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + i))));
    }
  }
  if (goal.scheduleBucket === 'this_month' && goal.dueDate) dates.add(goal.dueDate);
  return [...dates];
}

export function getScheduledGoalsByDate(goals: Goal[], todayIso = iso(new Date())) {
  const map = new Map<string, Goal[]>();
  goals.forEach((goal) => {
    getScheduledGoalDates(goal, todayIso).forEach((date) => map.set(date, [...(map.get(date) ?? []), goal]));
  });
  return map;
}

// Legacy helper retained for compatibility while heat logic is retired.
export function calculateHeatSignal(spark: SparkItem, context: LogicContext) {
  const label = derivePriorityChip(spark, context.goals ?? []);
  return { score: 0, label, reasons: ['Legacy heat signal is retired.'], suggestedAction: spark.currentAction?.trim() ? `Complete Current Action: ${spark.currentAction}.` : 'Set a Current Action.' };
}

export function calculatePathwayReadiness(pathway: Pathway, spark: SparkItem, context: LogicContext) {
  const reasons: string[] = [];
  let score = 10;
  if (pathway.title?.trim()) { score += 20; reasons.push('Pathway has a clear title.'); }
  if (pathway.status) { score += 10; reasons.push(`Pathway status is ${pathway.status}.`); }
  if (spark.stage === 'Ember' || spark.stage === 'Flame') { score += 15; reasons.push(`Asset stage ${spark.stage} supports pathway execution.`); }
  if (pathway.status === 'active' || pathway.status === 'chosen') { score += 20; reasons.push('Pathway is active/chosen.'); }
  if (context.branches.some((b) => b.id === spark.branchId)) { score += 10; reasons.push('Pathway belongs to an existing Pillar.'); }
  if (spark.currentAction?.trim()) { score += 10; reasons.push('Asset has a Current Action defined.'); }
  if (typeof pathway.confidence === 'number') { score += clamp(pathway.confidence) * 0.15; reasons.push(`Pathway confidence contributes (${pathway.confidence}).`); }
  const stale = daysSince(pathway.last_touched_at);
  if (stale >= 7) { score -= 12; reasons.push(`Pathway has been untouched for ${stale} days.`); }
  score = clamp(Math.round(score));
  const label: ReadinessLabel = score >= 85 ? 'Active' : score >= 65 ? 'Strong' : score >= 40 ? 'Possible' : 'Weak';
  const suggestedAction = !spark.currentAction?.trim() ? 'Set the Current Action this pathway should drive.' : (pathway.status !== 'active' && pathway.status !== 'chosen') ? 'Choose this pathway or park it to reduce ambiguity.' : 'Execute the Current Action and log progress.';
  return { score, label, reasons, suggestedAction };
}

export function getCoolDownWarnings(sparks: SparkItem[], _pathways: Pathway[], _actions: ActionLog[], _branches: Branch[]) {
  return sparks.flatMap((spark) => {
    if (spark.status === 'frozen') return [];
    const d = daysSince(spark.last_touched_at);
    const cooling = deriveCoolingState(spark);
    if (!cooling && d < 7) return [];
    return [{ id: `cd-${spark.id}`, sparkId: spark.id, title: `Cooling Risk: ${spark.title}`, reason: `Asset untouched for ${d} days.`, suggestedAction: spark.currentAction?.trim() ? `Do Current Action: ${spark.currentAction}.` : 'Define and complete one Current Action today.' }];
  });
}

export function getNearBlazeItems(sparks: SparkItem[], pathways: Pathway[], blazes: BlazeLog[], _branches: Branch[]) {
  return sparks.flatMap((spark) => {
    if (spark.status === 'frozen') return [];
    const sparkPaths = pathways.filter((p) => p.sparkId === spark.id);
    const outputCount = blazes.filter((b) => b.sparkId === spark.id).length;
    const hasStrongPath = sparkPaths.some((p) => (p.status === 'active' || p.status === 'chosen'));
    const near = spark.stage === 'Flame' && spark.status === 'active' && (!!spark.currentAction?.trim() || hasStrongPath) && outputCount === 0;
    if (!near) return [];
    return [{ sparkId: spark.id, title: spark.title, reason: `Flame asset with ${sparkPaths.length} pathway(s) and no released output yet.`, suggestedAction: spark.currentAction?.trim() ? `Complete Current Action: ${spark.currentAction}.` : 'Choose one pathway action and execute it today.' }];
  });
}

export function detectSolarFlares(sparks: SparkItem[], pathways: Pathway[], blazes: BlazeLog[], _actions: ActionLog[], branches: Branch[]) { /* unchanged */
  const out: Array<{ id: string; title: string; evidence: string[]; relatedSparkIds: string[]; relatedBlazeIds: string[]; suggestedSunTitle: string; suggestedAction: string }> = [];
  for (const branch of branches) { const bSparks = sparks.filter((s) => s.branchId === branch.id); const bBlazes = blazes.filter((b) => b.branchId === branch.id); const evidence: string[] = []; if (bSparks.length >= 2) evidence.push(`Repeated spark volume in ${branch.name} (${bSparks.length}).`); if (bBlazes.length >= 2) evidence.push(`Repeated output releases in ${branch.name} (${bBlazes.length}).`); const names = pathways.filter((p) => bSparks.some((s) => s.id === p.sparkId)).map((p) => p.title.trim().toLowerCase()).filter(Boolean); const repeatedLane = names.find((lane, i, arr) => arr.indexOf(lane) !== i); if (repeatedLane) evidence.push(`Repeated pathway pattern: ${repeatedLane}.`); const multiBlazeSpark = bSparks.find((s) => bBlazes.filter((b) => b.sparkId === s.id).length >= 2); if (multiBlazeSpark) evidence.push(`One asset produced multiple outputs (${multiBlazeSpark.title}).`); if (evidence.length) out.push({ id: `flare-${branch.id}`, title: `Solar Flare in ${branch.name}`, evidence, relatedSparkIds: bSparks.map((s) => s.id), relatedBlazeIds: bBlazes.map((b) => b.id), suggestedSunTitle: `${branch.name} Release Engine`, suggestedAction: 'Review evidence and confirm whether to create a Sun Engine.' }); }
  return out;
}

export function getMomentumStreakSummary(actions: ActionLog[]) { const counted = actions.filter((a) => a.countsForStreak); const byDay = new Map<string, ActionLog[]>(); for (const a of counted) byDay.set(a.date, [...(byDay.get(a.date) ?? []), a]); let currentStreak = 0; const cursor = new Date(); while (byDay.has(cursor.toISOString().slice(0, 10))) { currentStreak += 1; cursor.setDate(cursor.getDate() - 1); } const today = new Date().toISOString().slice(0, 10); const todayActions = byDay.get(today) ?? []; return { currentStreak, countedToday: todayActions.length > 0, todayReasons: todayActions.map((a) => `${a.action_type}: ${a.action}`) }; }

export function deriveSparkLifecycle(spark: SparkItem, pathways: Pathway[], blazes: BlazeLog[], goals: Goal[] = []) {
  const sparkPaths = pathways.filter((p) => p.sparkId === spark.id);
  const sparkBlazes = blazes.filter((b) => b.sparkId === spark.id);
  const linkedGoal = goals.find((g) => g.id === spark.goalId);
  const goalStarted = linkedGoal?.status === 'active' && !!linkedGoal.currentAction?.trim();
  const hasChosenForm = sparkPaths.some((p) => p.status === 'chosen' || p.status === 'active');
  const hasCurrentAction = !!spark.currentAction?.trim();
  const manualEmber = spark.stage === 'Ember';
  if (sparkBlazes.length >= 2) return { stage: 'Blaze' as const, reason: 'This asset has multiple released outputs.' };
  if (sparkBlazes.length === 1) return { stage: 'Flame' as const, reason: 'This asset has one released output.' };
  if (hasCurrentAction || hasChosenForm || goalStarted || manualEmber) return { stage: 'Ember' as const, reason: 'Work in progress has started.' };
  return { stage: 'Spark' as const, reason: 'Captured asset is waiting to begin work.' };
}
