'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { detectSolarFlares, getCoolDownWarnings, getMomentumStreakSummary, getNearBlazeItems } from '@/lib/logic';
import { getBranchAttention, getStageCounts } from '@/lib/analytics';

export default function HomePage() {
  const { blazes, branches, sparks, pathways, actions, burners } = useStore();
  const activeFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active');
  const coolDownWarnings = getCoolDownWarnings(sparks, pathways, [], branches);
  const nearBlaze = getNearBlazeItems(sparks, pathways, blazes, branches);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, [], branches);
  const branchAttention = getBranchAttention(branches, actions, sparks);
  const stage = getStageCounts(sparks);
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, entry) => sum + entry.delta, 0);
  const totalWeight = branches.reduce((sum, branch) => sum + branch.strategicWeight, 0);
  const fireNoProgress = sparks.find((s)=>s.stage==='Fire' && s.status==='active'); const emberNoChoice = sparks.find((s)=>s.stage==='Ember' && !pathways.some((p)=>p.sparkId===s.id && (p.status==='chosen'||p.status==='active'))); const sparkNoPath = sparks.find((s)=>s.stage==='Spark' && !pathways.some((p)=>p.sparkId===s.id)); const nextMove = fireNoProgress || emberNoChoice || sparkNoPath || sparks.find((spark) => spark.status === 'active' && spark.nextMove?.trim());

  return <Layout><section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Home / Command</h2><Link href="/add-spark" className="rounded-lg bg-neon px-4 py-2 font-semibold text-bg">Quick Capture</Link></div>
    <section className="grid gap-3 md:grid-cols-3"><Card title="Primary Command / Today's Next Move" value={nextMove ? `${nextMove.title}: ${nextMove.nextMove || 'Route or choose a pathway next.'}` : 'Quick Capture a new Spark.'} /><Card title="Momentum Streak" value={`${streak.currentStreak} day${streak.currentStreak === 1 ? '' : 's'}`} /><Card title="Burner Balance" value={`${burnerBalance} burner${burnerBalance === 1 ? '' : 's'}`} /></section>
    <section className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-sm uppercase tracking-wider text-neonDim">Branch Allocation</h3><div className="mt-3 space-y-2">{branches.map((b)=><div key={b.id}><div className="flex justify-between text-xs"><span>{b.name}</span><span>{b.strategicWeight}%</span></div><div className="h-2 rounded bg-bg"><div className="h-2 rounded bg-amber-400" style={{width:`${b.strategicWeight}%`}}/></div></div>)}</div><p className={`mt-3 text-sm ${totalWeight === 100 ? 'text-muted' : 'text-fire'}`}>{totalWeight === 100 ? 'Strategic allocation is balanced at 100%.' : `Strategic allocation totals ${totalWeight}%. Adjust toward 100%.`}</p></section>
      <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-sm uppercase tracking-wider text-neonDim">Stage Flow</h3><div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">{(['Spark', 'Ember', 'Fire', 'Blaze'] as const).map((key)=><div key={key} className="rounded border border-neon/30 p-2"><p className="text-neonDim">{key}</p><p className="text-xl font-semibold text-amber-100">{stage[key]}</p></div>)}</div><p className="mt-3 text-sm text-muted">{stage.Spark > stage.Ember ? 'Bottleneck: many Sparks have not been routed into Embers yet.' : stage.Fire > 0 && stage.Blaze < stage.Fire ? 'Bottleneck: active Fires need stronger push to release.' : 'Flow is moving across stages.'}</p></section>
    </section>
    <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-sm uppercase tracking-wider text-neonDim">Planned vs Actual Attention</h3><div className="mt-3 space-y-3">{branchAttention.map((b)=><div key={b.id}><div className="mb-1 flex justify-between text-xs"><span>{b.name} • {b.status}</span><span>Planned {b.strategicWeight}% / Actual {b.actual}%</span></div><div className="relative h-3 rounded bg-bg"><div className="absolute h-3 rounded bg-amber-500/70" style={{width:`${b.strategicWeight}%`}} /><div className="absolute h-3 rounded bg-orange-400/80" style={{width:`${b.actual}%`}} /></div></div>)}</div></section>
    <ListSection title="Active Fires" items={activeFires.map((s) => ({ id: s.id, title: s.title || 'Untitled Spark', meta: `${s.stage} • ${s.nextMove || 'No next move set'}` }))} empty="No active Fire Sparks." />
    <ListSection title="Cooling Sparks" items={coolDownWarnings.map((w) => ({ id: w.sparkId, title: w.title, meta: `${w.reason} ${w.suggestedAction}` }))} empty="No cooling Sparks right now." />
    <ListSection title="Near Blaze" items={nearBlaze.map((s) => ({ id: s.sparkId, title: s.title, meta: `${s.reason} ${s.suggestedAction}` }))} empty="No Near Blaze Sparks yet." />
    {solarFlares.length > 0 && <ListSection title="Solar Flares" items={solarFlares.map((f)=>({id:f.id,title:f.title,meta:f.suggestedAction}))} empty="" />}
  </section></Layout>;
}
function Card({ title, value }: { title: string; value: string }) { return <article className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><p className="text-xs uppercase tracking-wider text-neonDim">{title}</p><p className="mt-2 text-sm text-amber-50">{value}</p></article>; }
function ListSection({ title, items, empty }: { title: string; items: { id: string; title: string; meta: string }[]; empty: string }) { return <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><h3 className="text-sm uppercase tracking-wider text-neonDim">{title}</h3><div className="mt-3 space-y-2">{items.length ? items.map((item) => <Link key={`${title}-${item.id}-${item.title}`} href={item.id.startsWith('flare')?'/stats':`/spark/${item.id}`} className="block rounded border border-neon/30 p-3 text-sm transition hover:border-neon/70"><p className="font-medium">{item.title}</p><p className="text-xs text-muted">{item.meta}</p></Link>) : <p className="text-sm text-muted">{empty}</p>}</div></section>; }
