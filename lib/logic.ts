import type { ActionLog, BlazeLog, Branch, Pathway, SparkItem, Status } from '@/data/types';

type LogicContext = { branches: Branch[]; pathways: Pathway[]; blazes: BlazeLog[] };
type HeatLabel = 'Low' | 'Warm' | 'Hot' | 'High Heat';
type ReadinessLabel = 'Weak' | 'Possible' | 'Strong' | 'Active';

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const daysSince = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
const statusWeight: Record<Status, number> = { new: 2, active: 12, cooling: -8, frozen: -20, archived: -30, killed: -35 };

export function calculateHeatSignal(spark: SparkItem, context: LogicContext) {
  const reasons: string[] = [];
  const branch = context.branches.find((b) => b.id === spark.branchId);
  const sparkPaths = context.pathways.filter((p) => p.sparkId === spark.id);
  const sparkBlazes = context.blazes.filter((b) => b.sparkId === spark.id);
  let score = 20;
  if (branch) { score += branch.strategicWeight * 0.22; reasons.push(`Branch ${branch.name} strategic weight is ${branch.strategicWeight}%.`); }
  score += spark.stage === 'Spark' ? 0 : spark.stage === 'Ember' ? 10 : spark.stage === 'Fire' ? 20 : 8; reasons.push(`Lifecycle stage ${spark.stage} changes urgency.`);
  score += statusWeight[spark.status]; reasons.push(`Status ${spark.status} changes focus priority.`);
  const staleDays = daysSince(spark.last_touched_at);
  if (staleDays <= 1) score += 10; else if (staleDays <= 3) score += 4; else if (staleDays <= 7) score -= 8; else score -= 15;
  reasons.push(`Last touched ${staleDays} day(s) ago.`);
  if (spark.nextMove?.trim()) { score += 10; reasons.push('A clear next move exists.'); } else { score -= 8; reasons.push('No clear next move is defined yet.'); }
  if (sparkPaths.length > 0) { score += Math.min(10, sparkPaths.length * 3); reasons.push(`${sparkPaths.length} pathway option(s) exist.`); }
  if (sparkPaths.some((p) => p.status === 'active' || p.status === 'chosen')) { score += 8; reasons.push('At least one pathway is active.'); }
  if (spark.stage === 'Fire' && spark.status === 'active') { score += 10; reasons.push('Active Fire assets are close to release momentum.'); }
  if (sparkBlazes.length > 0) { score += Math.min(12, sparkBlazes.length * 4); reasons.push(`Related Blaze history exists (${sparkBlazes.length}).`); }
  const valueTags = branch?.tags?.length ?? 0;
  if (valueTags > 0) { score += Math.min(6, valueTags * 2); reasons.push(`Branch value tags strengthen value signal (${valueTags}).`); }
  score = clamp(Math.round(score));
  const label: HeatLabel = score >= 85 ? 'High Heat' : score >= 70 ? 'Hot' : score >= 45 ? 'Warm' : 'Low';
  const suggestedAction = !spark.nextMove?.trim() ? 'Define one concrete next move to keep momentum.' : staleDays >= 3 ? 'Complete the next move today to prevent cool down.' : label === 'High Heat' ? 'Protect this momentum and push it toward release.' : 'Route or activate the strongest pathway.';
  return { score, label, reasons, suggestedAction };
}

export function calculatePathwayReadiness(pathway: Pathway, spark: SparkItem, context: LogicContext) {
  const reasons: string[] = [];
  let score = 10;
  if (pathway.title?.trim()) { score += 20; reasons.push('Pathway has a clear title/lane.'); }
  if (pathway.status) { score += 10; reasons.push(`Pathway status is ${pathway.status}.`); }
  if (spark.stage === 'Ember' || spark.stage === 'Fire') { score += 15; reasons.push(`Spark stage ${spark.stage} supports pathway execution.`); }
  if (pathway.status === 'active' || pathway.status === 'chosen') { score += 20; reasons.push('Pathway is active/chosen.'); }
  if (context.branches.some((b) => b.id === spark.branchId)) { score += 10; reasons.push('Pathway belongs to an existing branch.'); }
  if (spark.nextMove?.trim()) { score += 10; reasons.push('Spark has a next move defined.'); }
  if (typeof pathway.confidence === 'number') { score += clamp(pathway.confidence) * 0.15; reasons.push(`Pathway heat/value signal contributes (${pathway.confidence}).`); }
  const stale = daysSince(pathway.last_touched_at);
  if (stale >= 7) { score -= 12; reasons.push(`Pathway has been untouched for ${stale} days.`); }
  score = clamp(Math.round(score));
  const label: ReadinessLabel = score >= 85 ? 'Active' : score >= 65 ? 'Strong' : score >= 40 ? 'Possible' : 'Weak';
  const suggestedAction = !spark.nextMove?.trim() ? 'Set the next move this pathway should drive.' : (pathway.status !== 'active' && pathway.status !== 'chosen') ? 'Choose this pathway or park it to reduce ambiguity.' : 'Execute the next move and log progress.';
  return { score, label, reasons, suggestedAction };
}

export function getCoolDownWarnings(sparks: SparkItem[], pathways: Pathway[], _actions: ActionLog[], branches: Branch[]) {
  return sparks.flatMap((spark) => {
    const heat = calculateHeatSignal(spark, { branches, pathways, blazes: [] });
    const d = daysSince(spark.last_touched_at);
    if (spark.status !== 'active' && heat.label === 'Low') return [];
    const shouldWarn = (spark.stage === 'Spark' && d >= 3) || (spark.stage === 'Ember' && d >= 7) || (spark.stage === 'Fire' && spark.status === 'active' && d >= 5) || ((heat.label === 'Hot' || heat.label === 'High Heat') && d >= 3);
    if (!shouldWarn) return [];
    return [{ id: `cd-${spark.id}`, sparkId: spark.id, title: `Cool Down Risk: ${spark.title}`, reason: `${spark.stage} item untouched for ${d} days while value signal is ${heat.label}.`, suggestedAction: spark.nextMove?.trim() ? `Do next move: ${spark.nextMove}.` : 'Define and complete one concrete next move today.' }];
  });
}

export function getNearBlazeItems(sparks: SparkItem[], pathways: Pathway[], blazes: BlazeLog[], branches: Branch[]) {
  return sparks.flatMap((spark) => {
    const sparkPaths = pathways.filter((p) => p.sparkId === spark.id);
    const heat = calculateHeatSignal(spark, { branches, pathways, blazes });
    const hasStrongPath = sparkPaths.some((p) => {
      const label = calculatePathwayReadiness(p, spark, { branches, pathways, blazes }).label;
      return label === 'Strong' || label === 'Active';
    });
    const near = spark.stage === 'Fire' && spark.status === 'active' && sparkPaths.length > 0 && (!!spark.nextMove?.trim() || hasStrongPath) && (heat.label === 'Hot' || heat.label === 'High Heat');
    if (!near) return [];
    return [{ sparkId: spark.id, title: spark.title, reason: `Fire is active with ${sparkPaths.length} pathway(s) and ${heat.label} heat.`, suggestedAction: spark.nextMove?.trim() ? `Complete next move: ${spark.nextMove}.` : 'Choose one pathway move and execute it today.' }];
  });
}

export function detectSolarFlares(sparks: SparkItem[], pathways: Pathway[], blazes: BlazeLog[], _actions: ActionLog[], branches: Branch[]) {
  const out: Array<{ id: string; title: string; evidence: string[]; relatedSparkIds: string[]; relatedBlazeIds: string[]; suggestedSunTitle: string; suggestedAction: string }> = [];
  for (const branch of branches) {
    const bSparks = sparks.filter((s) => s.branchId === branch.id);
    const bBlazes = blazes.filter((b) => b.branchId === branch.id);
    const evidence: string[] = [];
    if (bSparks.length >= 2) evidence.push(`Repeated spark volume in ${branch.name} (${bSparks.length}).`);
    if (bBlazes.length >= 2) evidence.push(`Repeated blaze releases in ${branch.name} (${bBlazes.length}).`);
    const names = pathways.filter((p) => bSparks.some((s) => s.id === p.sparkId)).map((p) => p.title.trim().toLowerCase()).filter(Boolean);
    const repeatedLane = names.find((lane, i, arr) => arr.indexOf(lane) !== i);
    if (repeatedLane) evidence.push(`Repeated pathway lane pattern: ${repeatedLane}.`);
    const multiBlazeSpark = bSparks.find((s) => bBlazes.filter((b) => b.sparkId === s.id).length >= 2);
    if (multiBlazeSpark) evidence.push(`One spark produced multiple blazes (${multiBlazeSpark.title}).`);
    if (evidence.length) out.push({ id: `flare-${branch.id}`, title: `Solar Flare in ${branch.name}`, evidence, relatedSparkIds: bSparks.map((s) => s.id), relatedBlazeIds: bBlazes.map((b) => b.id), suggestedSunTitle: `${branch.name} Release Engine`, suggestedAction: 'Review evidence and confirm whether to create a Sun Engine.' });
  }
  return out;
}

export function getMomentumStreakSummary(actions: ActionLog[]) {
  const counted = actions.filter((a) => a.countsForStreak);
  const byDay = new Map<string, ActionLog[]>();
  for (const a of counted) byDay.set(a.date, [...(byDay.get(a.date) ?? []), a]);
  let currentStreak = 0;
  const cursor = new Date();
  while (byDay.has(cursor.toISOString().slice(0, 10))) { currentStreak += 1; cursor.setDate(cursor.getDate() - 1); }
  const today = new Date().toISOString().slice(0, 10);
  const todayActions = byDay.get(today) ?? [];
  return { currentStreak, countedToday: todayActions.length > 0, todayReasons: todayActions.map((a) => `${a.action_type}: ${a.action}`) };
}

export function deriveSparkLifecycle(spark: SparkItem, pathways: Pathway[], blazes: BlazeLog[]) {
  const sparkPaths = pathways.filter((p) => p.sparkId === spark.id);
  const sparkBlazes = blazes.filter((b) => b.sparkId === spark.id);
  const activePath = sparkPaths.find((p) => p.status === 'active' || p.status === 'chosen');
  if (sparkBlazes.length > 0) return { stage: 'Blaze' as const, reason: 'This Spark has released a Blaze.' };
  if (activePath && (activePath.nextMove?.trim() || spark.nextMove?.trim())) return { stage: 'Fire' as const, reason: `This Spark is in Fire because ${activePath.title} is active and has a next move.` };
  if (sparkPaths.length > 0 || (!!spark.branchId && spark.kind.trim())) return { stage: 'Ember' as const, reason: 'This Spark has routed potential. Choose the strongest pathway.' };
  return { stage: 'Spark' as const, reason: 'This Spark has not been routed yet. Add one possible output lane.' };
}
