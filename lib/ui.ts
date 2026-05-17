import type { Branch, Goal, SparkItem } from '@/data/types';

export const PILLAR_COLORS = ['gold', 'orange', 'red', 'purple', 'blue', 'cyan', 'green', 'pink', 'neutral'] as const;
export type PillarColor = (typeof PILLAR_COLORS)[number];

export const pillarColorStyles: Record<PillarColor, { border: string; chip: string; dot: string; glow: string; calendar: string }> = {
  gold: { border: 'border-l-2 border-l-amber-300', chip: 'bg-amber-300/20 text-amber-100 border-amber-300/40', dot: 'bg-amber-300', glow: 'shadow-[0_0_14px_rgba(251,191,36,0.20)]', calendar: 'bg-amber-300/20 border-amber-300/40 text-amber-100' },
  orange: { border: 'border-l-2 border-l-orange-300', chip: 'bg-orange-300/20 text-orange-100 border-orange-300/40', dot: 'bg-orange-300', glow: 'shadow-[0_0_14px_rgba(251,146,60,0.20)]', calendar: 'bg-orange-300/20 border-orange-300/40 text-orange-100' },
  red: { border: 'border-l-2 border-l-rose-300', chip: 'bg-rose-300/20 text-rose-100 border-rose-300/40', dot: 'bg-rose-300', glow: 'shadow-[0_0_14px_rgba(251,113,133,0.20)]', calendar: 'bg-rose-300/20 border-rose-300/40 text-rose-100' },
  purple: { border: 'border-l-2 border-l-violet-300', chip: 'bg-violet-300/20 text-violet-100 border-violet-300/40', dot: 'bg-violet-300', glow: 'shadow-[0_0_14px_rgba(196,181,253,0.20)]', calendar: 'bg-violet-300/20 border-violet-300/40 text-violet-100' },
  blue: { border: 'border-l-2 border-l-blue-300', chip: 'bg-blue-300/20 text-blue-100 border-blue-300/40', dot: 'bg-blue-300', glow: 'shadow-[0_0_14px_rgba(147,197,253,0.20)]', calendar: 'bg-blue-300/20 border-blue-300/40 text-blue-100' },
  cyan: { border: 'border-l-2 border-l-cyan-300', chip: 'bg-cyan-300/20 text-cyan-100 border-cyan-300/40', dot: 'bg-cyan-300', glow: 'shadow-[0_0_14px_rgba(103,232,249,0.20)]', calendar: 'bg-cyan-300/20 border-cyan-300/40 text-cyan-100' },
  green: { border: 'border-l-2 border-l-emerald-300', chip: 'bg-emerald-300/20 text-emerald-100 border-emerald-300/40', dot: 'bg-emerald-300', glow: 'shadow-[0_0_14px_rgba(110,231,183,0.20)]', calendar: 'bg-emerald-300/20 border-emerald-300/40 text-emerald-100' },
  pink: { border: 'border-l-2 border-l-pink-300', chip: 'bg-pink-300/20 text-pink-100 border-pink-300/40', dot: 'bg-pink-300', glow: 'shadow-[0_0_14px_rgba(249,168,212,0.20)]', calendar: 'bg-pink-300/20 border-pink-300/40 text-pink-100' },
  neutral: { border: 'border-l-2 border-l-slate-300', chip: 'bg-slate-300/15 text-slate-100 border-slate-300/30', dot: 'bg-slate-300', glow: 'shadow-[0_0_14px_rgba(203,213,225,0.16)]', calendar: 'bg-slate-300/20 border-slate-300/30 text-slate-100' },
};

export const getPillarColor = (branch?: Branch) => branch?.color ?? 'neutral';

export function derivePriorityChip(spark: SparkItem, goals: Goal[]) {
  if (spark.status === 'frozen') return 'Frozen';
  if (spark.status === 'cooling') return 'Cooling';
  const linkedGoal = goals.find((g) => g.id === spark.goalId || (spark.currentAction && g.currentAction === spark.currentAction));
  if (linkedGoal?.scale === 'day' || spark.scheduleBucket === 'today' || spark.currentAction || (spark.stage === 'Ember' || spark.stage === 'Flame')) return 'High Priority';
  if (linkedGoal?.scale === 'week' || spark.scheduleBucket === 'this_week' || linkedGoal?.scale === 'month') return 'Medium Priority';
  return 'Low Priority';
}
