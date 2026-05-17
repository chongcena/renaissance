'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { getMomentumStreakSummary } from '@/lib/logic';

export default function HomePage() {
  const { blazes, sparks, pathways, actions, burners, goals } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, entry) => sum + entry.delta, 0);
  const activeFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active').slice(0, 4);
  const recentCaptures = sparks.slice(0, 5);
  const needsDecision = sparks.filter((s) => !pathways.some((p) => p.sparkId === s.id) || !s.nextMove?.trim()).slice(0, 5);
  const dueSoon = goals.filter((g) => g.dueDate && g.status === 'active').slice(0, 4);
  const todayObjective = goals.find((g) => g.timeline === 'today' && g.currentObjective?.trim());
  const weekFocus = goals.filter((g) => g.timeline === 'this_week' && g.status === 'active').slice(0, 3);

  return <Layout><section className='space-y-4'>
    <div className='flex items-center justify-between'><h2 className='text-2xl font-semibold'>Creative Command Center</h2><Link href='/add-spark' className='rounded-lg bg-neon px-4 py-2 font-semibold text-bg'>Capture</Link></div>
    <Panel title='Current Objective'><p>{todayObjective?.currentObjective || sparks.find((s)=>s.nextMove)?.nextMove || 'Set one concrete next move.'}</p></Panel>
    <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'><Stat title='Momentum Streak' value={`${streak.currentStreak}d`} /><Stat title='Burners' value={`🔥 ${burnerBalance}`} /><Stat title='Active Fires' value={`${activeFires.length}`} /><Stat title='Released Outputs' value={`${blazes.length}`} /></section>
    <section className='grid gap-3 xl:grid-cols-2'>
      <Panel title="This Week's Focus">{weekFocus.length?weekFocus.map((g)=><Item key={g.id} title={g.title} text={g.currentObjective || 'No objective set'} />):<Empty/>}</Panel>
      <Panel title='Due Soon'>{dueSoon.length?dueSoon.map((g)=><Item key={g.id} title={g.title} text={g.dueDate || ''} />):<Empty/>}</Panel>
      <Panel title='Active Fires'>{activeFires.length?activeFires.map((s)=><Item key={s.id} title={s.title} text={s.nextMove || 'Set objective'} />):<Empty/>}</Panel>
      <Panel title='Needs Decision'>{needsDecision.length?needsDecision.map((s)=><Item key={s.id} title={s.title} text='Needs pathway or next move' />):<Empty/>}</Panel>
    </section>
    <Panel title='Recent Captures'>{recentCaptures.map((s)=><Item key={s.id} title={s.title} text={s.stage} />)}</Panel>
  </section></Layout>;
}
const Empty=({text='No priority items right now.'}:{text?:string})=><p className='text-sm text-muted'>{text}</p>;
const Item=({title,text}:{title:string;text:string})=><p className='rounded border border-neon/20 p-2 text-sm'><span className='font-medium'>{title}</span><br/>{text}</p>;
function Stat({title,value}:{title:string;value:string}){return <article className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><p className='text-xs uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-2 text-2xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
