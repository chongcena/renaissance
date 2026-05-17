'use client';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { getMomentumStreakSummary } from '@/lib/logic';

export default function HomePage() {
  const { sparks, actions, burners, goals, branches, blazes } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, b) => sum + b.delta, 0);
  const todayGoal = goals.find((g) => g.scale === 'day' && g.status === 'active' && g.currentAction);
  const todaySparkAction = sparks.find((s) => s.scheduleBucket === 'today' && s.currentAction && s.status !== 'frozen');
  const todayAction = todayGoal?.currentAction || todaySparkAction?.currentAction;
  const weekGoalActions = goals.filter((g) => g.scale === 'week' && g.status === 'active' && g.currentAction).slice(0, 2);
  const upNextSparks = sparks.filter((s) => s.status === 'active' && s.currentAction && s.id !== todaySparkAction?.id).slice(0, 3);
  const cooling = sparks.filter((s) => s.status === 'cooling').slice(0, 4);
  const recentSparks = sparks.slice(0, 4);

  return <Layout><section className='space-y-4'>
    <h2 className='text-2xl font-semibold tracking-tight'>Command</h2>
    <section className='rounded-2xl border border-neon/30 bg-gradient-to-br from-panelAlt/95 to-panel/70 p-5 shadow-glow'>
      <p className='text-xs uppercase tracking-[0.22em] text-neonDim'>Today&apos;s Action</p>
      <p className='mt-3 text-xl font-semibold text-amber-100'>{todayAction || 'No action locked. Choose a Day Goal or assign a Current Action.'}</p>
    </section>
    <div className='grid gap-3 sm:grid-cols-4'>
      <Stat title='Streak' value={`${streak.currentStreak}d`} />
      <Stat title='Burners' value={`${burnerBalance}`} />
      <Stat title='Assets' value={`${sparks.length}`} />
      <Stat title='Outputs' value={`${blazes.length}`} />
    </div>
    <div className='grid gap-3 lg:grid-cols-3'>
      <Panel title='Up Next / This Week'>{weekGoalActions.map((g)=><Item key={g.id} title={`${branches.find((b)=>b.id===g.pillarId)?.name ?? 'Pillar'} Goal`} text={g.currentAction || ''} />)}{upNextSparks.map((s)=><Item key={s.id} title={s.title} text={s.currentAction || ''} />)}</Panel>
      <Panel title='Cooling'>{cooling.length ? cooling.map((s)=><Item key={s.id} title={s.title} text='Touch soon' />) : <p className='text-xs text-muted'>No cooling assets.</p>}</Panel>
      <Panel title='Recent Sparks'>{recentSparks.map((s)=><Item key={s.id} title={s.title} text={s.stage} />)}</Panel>
    </div>
  </section></Layout>;
}
const Item=({title,text}:{title:string;text:string})=><p className='rounded-lg border border-neon/15 bg-bg/30 p-2 text-sm'><span className='font-medium'>{title}</span><br/>{text}</p>;
function Stat({title,value}:{title:string;value:string}){return <article className='rounded-xl border border-neon/15 bg-panelAlt/70 p-3'><p className='text-[11px] uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-1 text-xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className='rounded-xl border border-neon/20 bg-panelAlt/75 p-4'><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
