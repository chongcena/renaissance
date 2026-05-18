import type { Branch, Goal, SparkItem } from '@/data/types';

export const PILLAR_COLORS = ['gold', 'orange', 'red', 'purple', 'blue', 'cyan', 'green', 'pink', 'neutral'] as const;
export type PillarColor = (typeof PILLAR_COLORS)[number];

type PillarStyles = { dot: string; chip: string; border: string; leftRail: string; topAccent: string; cardBg: string; cardBorder: string; softBg: string; glow: string; progress: string; calendar: string; textAccent: string };

export const pillarColorStyles: Record<PillarColor, PillarStyles> = {
  gold: { topAccent: 'from-amber-300/35 to-transparent', cardBg: 'bg-amber-950/18', cardBorder: 'border-amber-300/40', progress: 'bg-amber-300', dot: 'bg-amber-300', chip: 'border-amber-300/45 bg-amber-300/18 text-amber-100', border: 'border-amber-300/35', leftRail: 'before:bg-amber-300/85', softBg: 'bg-amber-300/10', glow: 'shadow-[0_0_16px_rgba(251,191,36,0.18)]', calendar: 'border-amber-300/45 bg-amber-300/22 text-amber-100', textAccent: 'text-amber-200' },
  orange: { topAccent: 'from-orange-300/35 to-transparent', cardBg: 'bg-orange-950/18', cardBorder: 'border-orange-300/40', progress: 'bg-orange-300', dot: 'bg-orange-300', chip: 'border-orange-300/45 bg-orange-300/18 text-orange-100', border: 'border-orange-300/35', leftRail: 'before:bg-orange-300/85', softBg: 'bg-orange-300/10', glow: 'shadow-[0_0_16px_rgba(251,146,60,0.18)]', calendar: 'border-orange-300/45 bg-orange-300/22 text-orange-100', textAccent: 'text-orange-200' },
  red: { topAccent: 'from-rose-300/35 to-transparent', cardBg: 'bg-rose-950/18', cardBorder: 'border-rose-300/40', progress: 'bg-rose-300', dot: 'bg-rose-300', chip: 'border-rose-300/45 bg-rose-300/18 text-rose-100', border: 'border-rose-300/35', leftRail: 'before:bg-rose-300/85', softBg: 'bg-rose-300/10', glow: 'shadow-[0_0_16px_rgba(251,113,133,0.16)]', calendar: 'border-rose-300/45 bg-rose-300/22 text-rose-100', textAccent: 'text-rose-200' },
  purple: { topAccent: 'from-violet-300/35 to-transparent', cardBg: 'bg-violet-950/18', cardBorder: 'border-violet-300/40', progress: 'bg-violet-300', dot: 'bg-violet-300', chip: 'border-violet-300/45 bg-violet-300/18 text-violet-100', border: 'border-violet-300/35', leftRail: 'before:bg-violet-300/85', softBg: 'bg-violet-300/10', glow: 'shadow-[0_0_16px_rgba(196,181,253,0.17)]', calendar: 'border-violet-300/45 bg-violet-300/22 text-violet-100', textAccent: 'text-violet-200' },
  blue: { topAccent: 'from-blue-300/35 to-transparent', cardBg: 'bg-blue-950/18', cardBorder: 'border-blue-300/40', progress: 'bg-blue-300', dot: 'bg-blue-300', chip: 'border-blue-300/45 bg-blue-300/18 text-blue-100', border: 'border-blue-300/35', leftRail: 'before:bg-blue-300/85', softBg: 'bg-blue-300/10', glow: 'shadow-[0_0_16px_rgba(147,197,253,0.17)]', calendar: 'border-blue-300/45 bg-blue-300/22 text-blue-100', textAccent: 'text-blue-200' },
  cyan: { topAccent: 'from-cyan-300/35 to-transparent', cardBg: 'bg-cyan-950/18', cardBorder: 'border-cyan-300/40', progress: 'bg-cyan-300', dot: 'bg-cyan-300', chip: 'border-cyan-300/45 bg-cyan-300/18 text-cyan-100', border: 'border-cyan-300/35', leftRail: 'before:bg-cyan-300/85', softBg: 'bg-cyan-300/10', glow: 'shadow-[0_0_16px_rgba(103,232,249,0.17)]', calendar: 'border-cyan-300/45 bg-cyan-300/22 text-cyan-100', textAccent: 'text-cyan-200' },
  green: { topAccent: 'from-emerald-300/35 to-transparent', cardBg: 'bg-emerald-950/18', cardBorder: 'border-emerald-300/40', progress: 'bg-emerald-300', dot: 'bg-emerald-300', chip: 'border-emerald-300/45 bg-emerald-300/18 text-emerald-100', border: 'border-emerald-300/35', leftRail: 'before:bg-emerald-300/85', softBg: 'bg-emerald-300/10', glow: 'shadow-[0_0_16px_rgba(110,231,183,0.17)]', calendar: 'border-emerald-300/45 bg-emerald-300/22 text-emerald-100', textAccent: 'text-emerald-200' },
  pink: { topAccent: 'from-pink-300/35 to-transparent', cardBg: 'bg-pink-950/18', cardBorder: 'border-pink-300/40', progress: 'bg-pink-300', dot: 'bg-pink-300', chip: 'border-pink-300/45 bg-pink-300/18 text-pink-100', border: 'border-pink-300/35', leftRail: 'before:bg-pink-300/85', softBg: 'bg-pink-300/10', glow: 'shadow-[0_0_16px_rgba(249,168,212,0.17)]', calendar: 'border-pink-300/45 bg-pink-300/22 text-pink-100', textAccent: 'text-pink-200' },
  neutral: { topAccent: 'from-slate-300/20 to-transparent', cardBg: 'bg-slate-900/25', cardBorder: 'border-slate-300/30', progress: 'bg-slate-300', dot: 'bg-slate-300', chip: 'border-slate-300/35 bg-slate-300/14 text-slate-100', border: 'border-slate-300/25', leftRail: 'before:bg-slate-300/80', softBg: 'bg-slate-300/8', glow: 'shadow-[0_0_14px_rgba(203,213,225,0.12)]', calendar: 'border-slate-300/35 bg-slate-300/16 text-slate-100', textAccent: 'text-slate-200' },
};

export const priorityChipStyles: Record<string, string> = {
  'High Priority': 'border-orange-300/50 bg-orange-300/18 text-orange-100',
  'Medium Priority': 'border-violet-300/45 bg-violet-300/16 text-violet-100',
  'Low Priority': 'border-slate-300/30 bg-slate-300/10 text-slate-200',
  Cooling: 'border-amber-200/30 bg-amber-200/10 text-amber-100/90',
  Frozen: 'border-cyan-300/45 bg-cyan-300/18 text-cyan-100',
};

export const getPriorityChipStyle = (priority: string) => priorityChipStyles[priority] ?? priorityChipStyles['Low Priority'];
export const getPillarColor = (branch?: Branch) => branch?.color ?? 'neutral';
export const getPillarColorStyles = (color?: PillarColor) => pillarColorStyles[color ?? 'neutral'];
export const getFrozenStateClasses = (isFrozen: boolean) => isFrozen ? 'border-cyan-300/40 bg-cyan-950/25 opacity-90 shadow-none' : '';

export function deriveCoolingState(spark: SparkItem) { if (spark.status === 'frozen') return 'Frozen'; if (spark.status === 'cooling') return 'Cooling'; return null; }
const today = new Date().toISOString().slice(0, 10);
export function derivePriorityChip(spark: SparkItem, goals: Goal[]) {
  const cooling = deriveCoolingState(spark); if (cooling) return cooling;
  const linkedGoal = goals.find((g) => g.id === spark.goalId);
  const isToday = spark.scheduleBucket === 'today' || spark.dueDate === today || linkedGoal?.scheduleBucket === 'today' || linkedGoal?.dueDate === today || (linkedGoal?.scale === 'day' && linkedGoal.status === 'active');
  const hasAction = !!spark.currentAction?.trim() || !!linkedGoal?.currentAction?.trim(); const activeGoalSupport = !!linkedGoal && linkedGoal.status === 'active';
  if (hasAction || isToday || (activeGoalSupport && (spark.stage === 'Ember' || spark.stage === 'Flame'))) return 'High Priority';
  if ((linkedGoal?.scale === 'week' && linkedGoal.status === 'active') || spark.scheduleBucket === 'this_week' || (linkedGoal?.scale === 'month' && linkedGoal.status === 'active')) return 'Medium Priority';
  return 'Low Priority';
}
