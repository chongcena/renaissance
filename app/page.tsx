'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { detectSolarFlares, getCoolDownWarnings, getMomentumStreakSummary } from '@/lib/logic';
import { getBranchAttention } from '@/lib/analytics';

export default function HomePage() {
  const { blazes, branches, sparks, pathways, actions, burners } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, entry) => sum + entry.delta, 0);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, [], branches);
  const warnings = getCoolDownWarnings(sparks, pathways, [], branches);
  const attention = getBranchAttention(branches, actions, sparks);
  const activeQuests = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active');
  const currentObjective = sparks.find((s) => s.status === 'active' && s.nextMove?.trim()) || activeQuests[0] || sparks[0];
  const momentumScore = actions.filter((a) => a.countsForStreak).length;

  return <Layout><section className='space-y-4'>
    <div className='flex items-center justify-between'>
      <h2 className='text-xl font-semibold'>Player Dashboard / Command</h2>
      <Link href='/add-spark' className='rounded-lg bg-neon px-4 py-2 font-semibold text-bg'>Capture</Link>
    </div>
    <section className='rounded-2xl border border-amber-300/30 bg-gradient-to-r from-panelAlt/95 to-amber-950/40 p-5 shadow-glow'>
      <p className='text-xs uppercase tracking-[0.2em] text-neonDim'>Current Objective</p>
      <p className='mt-2 text-2xl font-semibold'>{currentObjective ? currentObjective.title : 'No active asset yet.'}</p>
      <p className='mt-2 text-sm text-amber-100'>{currentObjective?.nextMove || 'Capture or route an asset to define the next objective.'}</p>
    </section>
    <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      <Stat title='Momentum Streak' value={`${streak.currentStreak}d`} />
      <Stat title='Burner Balance' value={`${burnerBalance}`} />
      <Stat title='Momentum Score' value={`${momentumScore}`} />
      <Stat title='Active Quests' value={`${activeQuests.length}`} />
    </section>
    <section className='grid gap-3 lg:grid-cols-2'>
      <Panel title='Branch Allocation'>{attention.map((b)=><div key={b.id} className='mb-2'><div className='flex justify-between text-xs'><span>{b.name}</span><span>{b.strategicWeight}% / {b.actual}%</span></div><div className='h-2 rounded bg-bg'><div className='h-2 rounded bg-amber-500' style={{width:`${b.actual}%`}}/></div></div>)}</Panel>
      <Panel title='Vault Signals'>{warnings.length ? warnings.slice(0,4).map((w)=><p key={w.sparkId} className='rounded border border-neon/20 p-2 text-sm'>{w.title} · {w.suggestedAction}</p>) : <p className='text-sm text-muted'>No cool down warnings.</p>}</Panel>
    </section>
    <Panel title='System Signals'>{solarFlares.length ? solarFlares.map((f)=><p key={f.id} className='rounded border border-neon/20 p-2 text-sm'>{f.title} · {f.suggestedAction}</p>) : <p className='text-sm text-muted'>No system unlock signals detected.</p>}</Panel>
  </section></Layout>;
}
function Stat({title,value}:{title:string;value:string}){return <article className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><p className='text-xs uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-2 text-2xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
