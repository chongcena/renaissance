'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { detectSolarFlares, getCoolDownWarnings, getMomentumStreakSummary, getNearBlazeItems } from '@/lib/logic';

export default function HomePage() {
  const { blazes, branches, sparks, pathways, actions, burners } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, entry) => sum + entry.delta, 0);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, [], branches);
  const warnings = getCoolDownWarnings(sparks, pathways, [], branches);
  const nearBlaze = getNearBlazeItems(sparks, pathways, blazes, branches);
  const activeFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active');
  const currentObjective = sparks.find((s) => s.status === 'active' && s.nextMove?.trim());
  const momentumScore = actions.filter((a) => a.countsForStreak).length;
  const needsDecision = sparks.filter((s) => !pathways.some((p) => p.sparkId === s.id) || !s.nextMove?.trim() || s.status === 'cooling').slice(0, 5);

  return <Layout><section className='space-y-4'>
    <div className='flex items-center justify-between'><h2 className='text-2xl font-semibold'>Creative Command Center</h2><Link href='/add-spark' className='rounded-lg bg-neon px-4 py-2 font-semibold text-bg'>Capture Spark</Link></div>
    <section className='rounded-2xl border border-amber-300/30 bg-gradient-to-r from-panelAlt/95 to-amber-950/40 p-6 shadow-glow'>
      <p className='text-xs uppercase tracking-[0.2em] text-neonDim'>Current Objective</p>
      <p className='mt-2 text-2xl font-semibold'>{currentObjective?.title || 'Choose or set a Current Objective.'}</p>
      <p className='mt-2 text-sm text-amber-100'>{currentObjective?.nextMove || 'Route a Spark or set one concrete next move to drive today.'}</p>
    </section>
    <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      <Stat title='Momentum Streak' value={`${streak.currentStreak}d`} /><Stat title='Burners' value={`🔥 ${burnerBalance}`} /><Stat title='Momentum Score' value={`${momentumScore}`} /><Stat title='Active Fires' value={`${activeFires.length}`} />
    </section>
    <section className='grid gap-3 xl:grid-cols-2'>
      <Panel title='Active Fires'>{activeFires.length ? activeFires.slice(0,4).map((s)=><Item key={s.id} title={s.title} text={s.nextMove || 'Set objective'} />) : <Empty/>}</Panel>
      <Panel title='Needs Decision'>{needsDecision.length ? needsDecision.map((s)=><Item key={s.id} title={s.title} text={s.nextMove || 'No current objective set'} />) : <Empty/>}</Panel>
      <Panel title='Near Blaze'>{nearBlaze.length ? nearBlaze.map((n)=><Item key={n.sparkId} title={n.title} text={n.suggestedAction} />) : <Empty/>}</Panel>
      <Panel title='Solar Flares'>{solarFlares.length ? solarFlares.map((f)=><Item key={f.id} title={f.title} text={f.suggestedAction} />) : <Empty text='No Solar Flares detected.' />}</Panel>
    </section>
    {warnings.length ? <Panel title='Needs Attention'>{warnings.slice(0,4).map((w)=><Item key={w.sparkId} title={w.title} text={w.suggestedAction} />)}</Panel> : null}
  </section></Layout>;
}
const Empty=({text='No priority items right now.'}:{text?:string})=><p className='text-sm text-muted'>{text}</p>;
const Item=({title,text}:{title:string;text:string})=><p className='rounded border border-neon/20 p-2 text-sm'><span className='font-medium'>{title}</span><br/>{text}</p>;
function Stat({title,value}:{title:string;value:string}){return <article className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><p className='text-xs uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-2 text-2xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
