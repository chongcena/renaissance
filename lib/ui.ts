import type { Branch, Goal, SparkItem } from '@/data/types';

export const PILLAR_COLORS = ['gold', 'orange', 'red', 'purple', 'blue', 'cyan', 'green', 'pink', 'neutral'] as const;
export type PillarColor = (typeof PILLAR_COLORS)[number];

type PillarStyles = { dot: string; chip: string; border: string; rail: string; card: string; glow: string; leftRail: string; topAccent: string; cardBg: string; cardBorder: string; softBg: string; progress: string; calendar: string; textAccent: string };

export const pillarColorStyles: Record<PillarColor, PillarStyles> = {
  gold: { rail: 'bg-amber-300', border: 'border-amber-300/70', card: 'bg-gradient-to-br from-amber-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-amber-300/40 to-transparent', cardBg: 'bg-amber-950/20', cardBorder: 'border-amber-300/50', progress: 'bg-amber-300', dot: 'bg-amber-300', chip: 'border-amber-300/70 bg-amber-400/20 text-amber-100', leftRail: 'before:bg-amber-300/90', softBg: 'bg-amber-300/10', glow: 'shadow-[0_0_22px_rgba(251,191,36,0.22)]', calendar: 'border-amber-300/50 bg-amber-300/25 text-amber-100', textAccent: 'text-amber-200' },
  orange: { rail: 'bg-orange-300', border: 'border-orange-300/70', card: 'bg-gradient-to-br from-orange-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-orange-300/40 to-transparent', cardBg: 'bg-orange-950/20', cardBorder: 'border-orange-300/50', progress: 'bg-orange-300', dot: 'bg-orange-300', chip: 'border-orange-300/70 bg-orange-400/20 text-orange-100', leftRail: 'before:bg-orange-300/90', softBg: 'bg-orange-300/10', glow: 'shadow-[0_0_22px_rgba(251,146,60,0.22)]', calendar: 'border-orange-300/50 bg-orange-300/25 text-orange-100', textAccent: 'text-orange-200' },
  red: { rail: 'bg-rose-300', border: 'border-rose-300/70', card: 'bg-gradient-to-br from-rose-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-rose-300/40 to-transparent', cardBg: 'bg-rose-950/20', cardBorder: 'border-rose-300/50', progress: 'bg-rose-300', dot: 'bg-rose-300', chip: 'border-rose-300/70 bg-rose-400/20 text-rose-100', leftRail: 'before:bg-rose-300/90', softBg: 'bg-rose-300/10', glow: 'shadow-[0_0_22px_rgba(251,113,133,0.22)]', calendar: 'border-rose-300/50 bg-rose-300/25 text-rose-100', textAccent: 'text-rose-200' },
  purple: { rail: 'bg-violet-300', border: 'border-violet-300/70', card: 'bg-gradient-to-br from-violet-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-violet-300/40 to-transparent', cardBg: 'bg-violet-950/20', cardBorder: 'border-violet-300/50', progress: 'bg-violet-300', dot: 'bg-violet-300', chip: 'border-violet-300/70 bg-violet-400/20 text-violet-100', leftRail: 'before:bg-violet-300/90', softBg: 'bg-violet-300/10', glow: 'shadow-[0_0_22px_rgba(196,181,253,0.22)]', calendar: 'border-violet-300/50 bg-violet-300/25 text-violet-100', textAccent: 'text-violet-200' },
  blue: { rail: 'bg-blue-300', border: 'border-blue-300/70', card: 'bg-gradient-to-br from-blue-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-blue-300/40 to-transparent', cardBg: 'bg-blue-950/20', cardBorder: 'border-blue-300/50', progress: 'bg-blue-300', dot: 'bg-blue-300', chip: 'border-blue-300/70 bg-blue-400/20 text-blue-100', leftRail: 'before:bg-blue-300/90', softBg: 'bg-blue-300/10', glow: 'shadow-[0_0_22px_rgba(147,197,253,0.22)]', calendar: 'border-blue-300/50 bg-blue-300/25 text-blue-100', textAccent: 'text-blue-200' },
  cyan: { rail: 'bg-cyan-300', border: 'border-cyan-300/70', card: 'bg-gradient-to-br from-cyan-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-cyan-300/40 to-transparent', cardBg: 'bg-cyan-950/20', cardBorder: 'border-cyan-300/50', progress: 'bg-cyan-300', dot: 'bg-cyan-300', chip: 'border-cyan-300/70 bg-cyan-400/20 text-cyan-100', leftRail: 'before:bg-cyan-300/90', softBg: 'bg-cyan-300/10', glow: 'shadow-[0_0_22px_rgba(103,232,249,0.22)]', calendar: 'border-cyan-300/50 bg-cyan-300/25 text-cyan-100', textAccent: 'text-cyan-200' },
  green: { rail: 'bg-emerald-300', border: 'border-emerald-300/70', card: 'bg-gradient-to-br from-emerald-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-emerald-300/40 to-transparent', cardBg: 'bg-emerald-950/20', cardBorder: 'border-emerald-300/50', progress: 'bg-emerald-300', dot: 'bg-emerald-300', chip: 'border-emerald-300/70 bg-emerald-400/20 text-emerald-100', leftRail: 'before:bg-emerald-300/90', softBg: 'bg-emerald-300/10', glow: 'shadow-[0_0_22px_rgba(110,231,183,0.22)]', calendar: 'border-emerald-300/50 bg-emerald-300/25 text-emerald-100', textAccent: 'text-emerald-200' },
  pink: { rail: 'bg-pink-300', border: 'border-pink-300/70', card: 'bg-gradient-to-br from-pink-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-pink-300/40 to-transparent', cardBg: 'bg-pink-950/20', cardBorder: 'border-pink-300/50', progress: 'bg-pink-300', dot: 'bg-pink-300', chip: 'border-pink-300/70 bg-pink-400/20 text-pink-100', leftRail: 'before:bg-pink-300/90', softBg: 'bg-pink-300/10', glow: 'shadow-[0_0_22px_rgba(249,168,212,0.22)]', calendar: 'border-pink-300/50 bg-pink-300/25 text-pink-100', textAccent: 'text-pink-200' },
  neutral: { rail: 'bg-slate-300', border: 'border-slate-300/60', card: 'bg-gradient-to-br from-slate-500/25 via-panelAlt/80 to-panel/80', topAccent: 'from-slate-300/30 to-transparent', cardBg: 'bg-slate-900/25', cardBorder: 'border-slate-300/40', progress: 'bg-slate-300', dot: 'bg-slate-300', chip: 'border-slate-300/60 bg-slate-300/20 text-slate-100', leftRail: 'before:bg-slate-300/90', softBg: 'bg-slate-300/10', glow: 'shadow-[0_0_16px_rgba(203,213,225,0.22)]', calendar: 'border-slate-300/50 bg-slate-300/25 text-slate-100', textAccent: 'text-slate-200' },
};

export const priorityChipStyles: Record<string, string> = {
  'High Priority': 'border-orange-300/50 bg-orange-300/20 text-orange-100',
  'Medium Priority': 'border-violet-300/50 bg-violet-300/20 text-violet-100',
  'Low Priority': 'border-slate-300/30 bg-slate-300/10 text-slate-200',
  Cooling: 'border-amber-200/30 bg-amber-200/10 text-amber-100/90',
  Frozen: 'border-cyan-300/50 bg-cyan-300/20 text-cyan-100',
};

export const sectionStyles = {
  primary: 'rounded-xl border border-neon/45 bg-panelAlt/90 p-4 shadow-[0_0_18px_rgba(251,191,36,0.14)]',
  active: 'rounded-xl border border-orange-300/40 bg-orange-950/15 p-4',
  schedule: 'rounded-xl border border-cyan-300/30 bg-cyan-950/15 p-4',
  analytics: 'rounded-xl border border-neon/25 bg-panelAlt/75 p-4',
  support: 'rounded-xl border border-slate-400/25 bg-slate-900/25 p-4',
  archive: 'rounded-xl border border-slate-500/20 bg-slate-950/30 p-4',
} as const;

export const getPriorityChipStyle = (priority: string) => priorityChipStyles[priority] ?? priorityChipStyles['Low Priority'];
export const getPillarColor = (branch?: Branch): PillarColor => {
  if (branch?.color) return branch.color;
  const name = branch?.name?.toLowerCase() ?? '';
  if (name.includes('music')) return 'gold';
  if (name.includes('writing')) return 'purple';
  if (name.includes('design')) return 'cyan';
  if (name.includes('tattoo')) return 'red';
  if (name.includes('mandala')) return 'green';
  if (name.includes('art')) return 'pink';
  return 'neutral';
};
export const getPillarColorStyles = (color?: PillarColor) => pillarColorStyles[color ?? 'neutral'];
export const getFrozenStateClasses = (isFrozen: boolean) => isFrozen ? 'border-cyan-300/70 bg-gradient-to-br from-cyan-500/25 via-cyan-950/40 to-panel/80 opacity-90 shadow-none' : '';

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
