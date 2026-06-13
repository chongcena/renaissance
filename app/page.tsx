'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { Goal, SparkItem } from '@/data/types';
import { getMomentumStreakSummary, getScheduledGoalDates } from '@/lib/logic';
import { derivePriorityChip, getPillarColor, getPillarColorStyles, getPriorityChipStyle, motionStyles } from '@/lib/ui';

type HeroCandidate = {
  id: string;
  sourceType: 'Goal' | 'Asset';
  source: Goal | SparkItem;
  sourceTitle: string;
  actionText?: string;
  promptText?: string;
  pillarId: string;
  priority: string;
  reason: string;
  bucket?: string;
  ctaLabel?: string;
  href: string;
};

type CommandItem = {
  id: string;
  sourceType: 'Goal' | 'Asset';
  title: string;
  text: string;
  pillarId: string;
  status: string;
  bucket?: string;
  href: string;
};

const dayMs = 86400000;
const isoToTime = (value?: string) => value ? new Date(`${value}T00:00:00Z`).getTime() : Number.NaN;
const daysFromToday = (value: string | undefined, todayIso: string) => {
  const target = isoToTime(value);
  const start = isoToTime(todayIso);
  if (Number.isNaN(target) || Number.isNaN(start)) return Number.NaN;
  return Math.floor((target - start) / dayMs);
};
const hasText = (value?: string) => !!value?.trim();
const hasEvolution = (spark: SparkItem) => hasText(spark.evolutionForm) || hasText(spark.evolutionPath) || hasText(spark.evolutionPurpose);
const isActionableSpark = (spark: SparkItem) => spark.status !== 'frozen' && spark.status !== 'killed';
const isActiveAsset = (spark: SparkItem) => isActionableSpark(spark) && spark.status !== 'cooling';
const isDueSoon = (goal: Goal, todayIso: string) => {
  const diff = daysFromToday(goal.dueDate, todayIso);
  return Number.isFinite(diff) && diff >= 0 && diff <= 14;
};

export default function HomePage() {
  const { sparks, actions, burners, goals, branches, blazes, completeSparkCurrentAction, completeGoalCurrentAction } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, b) => sum + b.delta, 0);
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${todayIso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i);
    return date.toISOString().slice(0, 10);
  });
  const isScheduledToday = (goal: Goal) => getScheduledGoalDates(goal, todayIso).includes(todayIso);
  const isScheduledThisWeek = (goal: Goal) => getScheduledGoalDates(goal, todayIso).some((date) => weekDates.includes(date));
  const pillarFor = (pillarId: string) => branches.find((b) => b.id === pillarId);
  const assetPriority = (spark: SparkItem) => derivePriorityChip(spark, goals);
  const goalPriority = (goal: Goal) => goal.scheduleBucket === 'today' || goal.dueDate === todayIso || goal.scale === 'day' ? 'High Priority' : goal.scheduleBucket === 'this_week' || goal.scale === 'week' || isDueSoon(goal, todayIso) ? 'Medium Priority' : 'Low Priority';
  const goalHref = '/goals';
  const assetHref = (id: string) => `/spark/${id}`;
  const goalCandidate = (goal: Goal, reason: string, bucket?: string): HeroCandidate => ({
    id: `goal-${goal.id}`,
    sourceType: 'Goal',
    source: goal,
    sourceTitle: goal.title,
    actionText: goal.currentAction?.trim(),
    pillarId: goal.pillarId,
    priority: goalPriority(goal),
    reason,
    bucket,
    ctaLabel: 'View Goal',
    href: goalHref,
  });
  const assetCandidate = (spark: SparkItem, reason: string, bucket?: string, promptText?: string, ctaLabel = 'Open Asset'): HeroCandidate => ({
    id: `asset-${spark.id}`,
    sourceType: 'Asset',
    source: spark,
    sourceTitle: spark.title,
    actionText: spark.currentAction?.trim(),
    promptText,
    pillarId: spark.branchId,
    priority: assetPriority(spark),
    reason,
    bucket,
    ctaLabel,
    href: assetHref(spark.id),
  });

  const hero = [
    goals.find((g) => g.scale === 'day' && g.status === 'active' && hasText(g.currentAction) && isScheduledToday(g)) ? goalCandidate(goals.find((g) => g.scale === 'day' && g.status === 'active' && hasText(g.currentAction) && isScheduledToday(g))!, 'Active Day Goal', 'Today') : undefined,
    goals.find((g) => g.status === 'active' && hasText(g.currentAction) && g.scheduleBucket === 'today') ? goalCandidate(goals.find((g) => g.status === 'active' && hasText(g.currentAction) && g.scheduleBucket === 'today')!, 'Scheduled today', 'Today') : undefined,
    goals.find((g) => g.status === 'active' && hasText(g.currentAction) && g.dueDate === todayIso) ? goalCandidate(goals.find((g) => g.status === 'active' && hasText(g.currentAction) && g.dueDate === todayIso)!, 'Due today', 'Due today') : undefined,
    goals.find((g) => g.status === 'active' && hasText(g.currentAction) && isScheduledThisWeek(g)) ? goalCandidate(goals.find((g) => g.status === 'active' && hasText(g.currentAction) && isScheduledThisWeek(g))!, 'Scheduled this week', 'This week') : undefined,
    sparks.find((s) => isActiveAsset(s) && s.scheduleBucket === 'today' && hasText(s.currentAction)) ? assetCandidate(sparks.find((s) => isActiveAsset(s) && s.scheduleBucket === 'today' && hasText(s.currentAction))!, 'Asset scheduled today', 'Today') : undefined,
    sparks.find((s) => isActiveAsset(s) && hasText(s.currentAction) && assetPriority(s) === 'High Priority') ? assetCandidate(sparks.find((s) => isActiveAsset(s) && hasText(s.currentAction) && assetPriority(s) === 'High Priority')!, 'High-priority asset action') : undefined,
    sparks.find((s) => s.status === 'cooling') ? assetCandidate(sparks.find((s) => s.status === 'cooling')!, 'Cooling asset needs attention', 'Cooling', 'Review this Cooling asset before it loses momentum.', 'Review Asset') : undefined,
    sparks.find((s) => isActionableSpark(s) && s.stage === 'Spark' && !hasEvolution(s)) ? assetCandidate(sparks.find((s) => isActionableSpark(s) && s.stage === 'Spark' && !hasEvolution(s))!, 'Recent Spark needs Evolution', 'Needs Evolution', 'Evolve this Spark by defining Form, Path, Purpose, and Current Action.', 'Evolve Spark') : undefined,
  ].find(Boolean);

  const heroBranch = hero ? pillarFor(hero.pillarId) : undefined;
  const heroStyle = getPillarColorStyles(getPillarColor(heroBranch));
  const completeHeroAction = () => {
    if (!hero?.actionText) return;
    if (hero.sourceType === 'Goal') completeGoalCurrentAction((hero.source as Goal).id);
    else completeSparkCurrentAction((hero.source as SparkItem).id);
  };

  const upNextGoals: CommandItem[] = goals
    .filter((g) => g.status === 'active' && hasText(g.currentAction) && `goal-${g.id}` !== hero?.id)
    .filter((g) => isScheduledThisWeek(g) || isDueSoon(g, todayIso))
    .map((g) => ({ id: `goal-${g.id}`, sourceType: 'Goal', title: g.title, text: g.currentAction!.trim(), pillarId: g.pillarId, status: goalPriority(g), bucket: g.dueDate ? `Due ${g.dueDate}` : g.scheduleBucket?.replaceAll('_', ' '), href: goalHref }));
  const upNextSparks: CommandItem[] = sparks
    .filter((s) => isActiveAsset(s) && hasText(s.currentAction) && `asset-${s.id}` !== hero?.id)
    .map((s) => ({ id: `asset-${s.id}`, sourceType: 'Asset', title: s.title, text: s.currentAction!.trim(), pillarId: s.branchId, status: assetPriority(s), bucket: s.dueDate ? `Due ${s.dueDate}` : s.scheduleBucket?.replaceAll('_', ' '), href: assetHref(s.id) }));
  const upNext = [...upNextGoals, ...upNextSparks].slice(0, 6);
  const cooling = sparks.filter((s) => s.status === 'cooling').slice(0, 4);
  const recentSparks = sparks.filter(isActionableSpark).slice(0, 4);

  return <Layout><section className='space-y-4'>
    <h2 className='text-2xl font-semibold tracking-tight'>Command</h2>
    <section className={`os-selectable rounded-2xl border border-neon/25 bg-gradient-to-br from-panelAlt/95 to-panel/70 p-5 shadow-glow ${heroStyle.glow} ${heroStyle.border}`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='text-xs uppercase tracking-[0.22em] text-neonDim'>Current Action</p>
          <p className='mt-3 text-2xl font-semibold text-amber-100'>{hero?.actionText || hero?.promptText || 'No actionable Goals, Assets, Cooling items, or unresolved Sparks right now.'}</p>
        </div>
        {hero ? <span className='rounded-full border border-neon/30 bg-bg/40 px-2 py-1 text-xs text-neonDim'>{hero.sourceType}</span> : null}
      </div>
      {hero ? <>
        <div className='mt-3 flex flex-wrap gap-2 text-xs'>
          <span className={`rounded-full border px-2 py-0.5 ${getPriorityChipStyle(hero.priority)}`}>{hero.priority}</span>
          {heroBranch ? <span className={`rounded-full border px-2 py-0.5 ${heroStyle.chip}`}><span className={`mr-1 inline-block h-2 w-2 rounded-full ${heroStyle.dot}`}></span>{heroBranch.name}</span> : null}
          <span className='rounded-full border border-neon/20 bg-bg/30 px-2 py-0.5 text-neonDim'>{hero.reason}</span>
          {hero.bucket ? <span className='rounded-full border border-cyan-300/30 bg-cyan-950/20 px-2 py-0.5 text-cyan-100'>{hero.bucket}</span> : null}
        </div>
        <p className='mt-3 text-sm text-muted'>{hero.sourceTitle}</p>
        <div className='mt-4 flex flex-wrap gap-2'>
          {hero.actionText ? <button onClick={completeHeroAction} className='rounded bg-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(110,231,183,0.28)]'>Complete Action</button> : null}
          <Link href={hero.href} className='rounded border border-neon/40 px-3 py-2 text-sm text-neon transition hover:-translate-y-0.5 hover:bg-neon/10'>{hero.ctaLabel}</Link>
        </div>
      </> : null}
    </section>
    <div className='grid gap-3 sm:grid-cols-4'>
      <Stat title='Momentum' value={`${actions.filter((a) => a.countsForStreak).length}`} />
      <Stat title='Streak' value={`${streak.currentStreak}d`} />
      <Stat title='Burners' value={`${burnerBalance}`} />
      <Stat title='Assets / Outputs' value={`${sparks.length}/${blazes.length}`} />
    </div>
    <div className='grid gap-3 lg:grid-cols-3'>
      <Panel title='Up Next / This Week'>{upNext.length ? upNext.map((item) => <ActionItem key={item.id} item={item} branches={branches} />) : <p className='text-xs text-muted'>No upcoming actions.</p>}</Panel>
      <Panel title='Cooling'>{cooling.length ? cooling.map((s) => <SparkPanelItem key={s.id} spark={s} branches={branches} goals={goals} text={s.last_touched_at ? `Last touched ${s.last_touched_at}` : 'Cooling'} status='Cooling' button='Open' />) : <p className='text-xs text-muted'>No cooling assets.</p>}</Panel>
      <Panel title='Recent Sparks'>{recentSparks.length ? recentSparks.map((s) => <SparkPanelItem key={s.id} spark={s} branches={branches} goals={goals} text={s.stage === 'Spark' && !hasEvolution(s) ? 'Needs Evolution' : s.currentAction?.trim() || s.stage} status={s.stage} button='Open' />) : <p className='text-xs text-muted'>No recent Sparks.</p>}</Panel>
    </div>
  </section></Layout>;
}

function ActionItem({ item, branches }: { item: CommandItem; branches: ReturnType<typeof useStore>['branches'] }) {
  const branch = branches.find((b) => b.id === item.pillarId);
  const style = getPillarColorStyles(getPillarColor(branch));
  return <article className='rounded-lg border border-neon/10 bg-bg/30 p-3 text-sm transition hover:-translate-y-0.5 hover:border-neon/35 hover:bg-bg/45'>
    <div className='flex items-start justify-between gap-2'>
      <div>
        <p className='font-medium text-amber-100'>{item.title}</p>
        <p className='mt-1 text-xs text-muted'>{item.text}</p>
      </div>
      <Link href={item.href} className='shrink-0 rounded border border-neon/30 px-2 py-1 text-xs text-neon transition hover:bg-neon/10'>{item.sourceType === 'Goal' ? 'View' : 'Open'}</Link>
    </div>
    <div className='mt-2 flex flex-wrap gap-1.5 text-[11px]'>
      {branch ? <span className={`rounded-full border px-2 py-0.5 ${style.chip}`}>{branch.name}</span> : null}
      <span className={`rounded-full border px-2 py-0.5 ${getPriorityChipStyle(item.status)}`}>{item.status}</span>
      {item.bucket ? <span className='rounded-full border border-cyan-300/25 bg-cyan-950/15 px-2 py-0.5 text-cyan-100'>{item.bucket}</span> : null}
    </div>
  </article>;
}

function SparkPanelItem({ spark, branches, goals, text, status, button }: { spark: SparkItem; branches: ReturnType<typeof useStore>['branches']; goals: Goal[]; text: string; status: string; button: string }) {
  const branch = branches.find((b) => b.id === spark.branchId);
  const style = getPillarColorStyles(getPillarColor(branch));
  return <article className='rounded-lg border border-neon/10 bg-bg/30 p-3 text-sm transition hover:-translate-y-0.5 hover:border-neon/35 hover:bg-bg/45'>
    <div className='flex items-start justify-between gap-2'>
      <div>
        <p className='font-medium text-amber-100'>{spark.title}</p>
        <p className='mt-1 text-xs text-muted'>{text}</p>
      </div>
      <Link href={`/spark/${spark.id}`} className='shrink-0 rounded border border-neon/30 px-2 py-1 text-xs text-neon transition hover:bg-neon/10'>{button}</Link>
    </div>
    <div className='mt-2 flex flex-wrap gap-1.5 text-[11px]'>
      {branch ? <span className={`rounded-full border px-2 py-0.5 ${style.chip}`}>{branch.name}</span> : null}
      <span className={`rounded-full border px-2 py-0.5 ${getPriorityChipStyle(status)}`}>{status}</span>
      {spark.currentAction?.trim() && text !== spark.currentAction.trim() ? <span className='rounded-full border border-orange-300/25 bg-orange-950/15 px-2 py-0.5 text-orange-100'>Action set</span> : null}
      <span className={`rounded-full border px-2 py-0.5 ${getPriorityChipStyle(derivePriorityChip(spark, goals))}`}>{derivePriorityChip(spark, goals)}</span>
    </div>
  </article>;
}

function Stat({title,value}:{title:string;value:string}){return <article className={`rounded-xl border border-neon/10 bg-panelAlt/70 p-3 ${motionStyles.selectable}`}><p className='text-[11px] uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-1 text-xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className={`rounded-xl border border-neon/15 bg-panelAlt/75 p-4 ${motionStyles.selectable}`}><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
