'use client';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { getMomentumStreakSummary } from '@/lib/logic';

export default function HomePage() {
  const { sparks, actions, burners, goals, branches, blazes } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, b) => sum + b.delta, 0);
  const todayGoal = goals.find((g) => g.scale === 'day' && g.status === 'active' && g.currentAction);
  const todaySpark = sparks.find((s) => s.scheduleBucket === 'today' && s.currentAction && s.status !== 'frozen');
  const todayAction = todayGoal?.currentAction || todaySpark?.currentAction;
  const upNextSparks = sparks.filter((s) => s.status === 'active' && s.currentAction && s.id !== todaySpark?.id).slice(0, 4);
  const cooling = sparks.filter((s) => s.status === 'cooling').slice(0, 4);
  const recentSparks = sparks.slice(0, 4);
  const pillar = branches.find((b)=>b.id===todaySpark?.branchId)?.name;

  return <Layout><section className='space-y-4'>
    <h2 className='text-2xl font-semibold tracking-tight'>Command</h2>
    <section className='rounded-2xl border border-neon/25 bg-gradient-to-br from-panelAlt/95 to-panel/70 p-5 shadow-glow'>
      <p className='text-xs uppercase tracking-[0.22em] text-neonDim'>Current Action</p>
      <p className='mt-3 text-2xl font-semibold text-amber-100'>{todayAction || 'No action locked. Choose a Day Goal or assign a Current Action.'}</p>
      {todaySpark ? <p className='mt-2 text-sm text-muted'>{todaySpark.title} • {pillar || 'Pillar'} • {todaySpark.stage}</p> : null}
    </section>
    <div className='grid gap-3 sm:grid-cols-4'>
      <Stat title='Momentum' value={`${actions.filter((a) => a.countsForStreak).length}`} />
      <Stat title='Streak' value={`${streak.currentStreak}d`} />
      <Stat title='Burners' value={`${burnerBalance}`} />
      <Stat title='Assets / Outputs' value={`${sparks.length}/${blazes.length}`} />
    </div>
    <div className='grid gap-3 lg:grid-cols-3'>
      <Panel title='Up Next / This Week'>{upNextSparks.map((s)=><Item key={s.id} title={s.title} text={s.currentAction || ''} />)}</Panel>
      <Panel title='Cooling'>{cooling.length ? cooling.map((s)=><Item key={s.id} title={s.title} text='Cooling' />) : <p className='text-xs text-muted'>No cooling assets.</p>}</Panel>
      <Panel title='Recent Sparks'>{recentSparks.map((s)=><Item key={s.id} title={s.title} text={s.stage} />)}</Panel>
    </div>
  </section></Layout>;
}
const Item=({title,text}:{title:string;text:string})=><p className='rounded-lg border border-neon/10 bg-bg/30 p-2 text-sm'><span className='font-medium'>{title}</span><br/>{text}</p>;
function Stat({title,value}:{title:string;value:string}){return <article className='rounded-xl border border-neon/10 bg-panelAlt/70 p-3'><p className='text-[11px] uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-1 text-xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className='rounded-xl border border-neon/15 bg-panelAlt/75 p-4'><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
