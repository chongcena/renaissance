'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { detectSolarFlares, getCoolDownWarnings, getNearBlazeItems } from '@/lib/logic';

export default function HomePage() {
  const { blazes, branches, sparks, pathways } = useStore();
  const activeFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active');
  const coolDownWarnings = getCoolDownWarnings(sparks, pathways, [], branches);
  const nearBlaze = getNearBlazeItems(sparks, pathways, blazes, branches);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, [], branches);
  const suggestedMoves = sparks.filter((s)=>s.status==='active').slice(0,5).map((s)=>({id:s.id,title:s.title,meta:s.nextMove?`Next Move: ${s.nextMove}`:'Set a next physical move'}));
  const recentBlazes = blazes.slice(0, 5);

  return <Layout><section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Home / Command</h2><Link href="/add-spark" className="rounded-lg bg-neon px-4 py-2 font-semibold text-bg">Quick Capture</Link></div>
    <ListSection title="Today's Command / Suggested Next Moves" items={suggestedMoves} empty="No active sparks yet." />
    <ListSection title="Active Fires" items={activeFires.map((s) => ({ id: s.id, title: s.title || 'Untitled Spark', meta: `${s.stage} • ${s.nextMove || 'No next move set'}` }))} empty="No active Fire Sparks." />
    <ListSection title="Cooling Sparks" items={coolDownWarnings.map((w) => ({ id: w.sparkId, title: w.title, meta: `${w.reason} ${w.suggestedAction}` }))} empty="No cooling Sparks right now." />
    <ListSection title="Near Blaze" items={nearBlaze.map((s) => ({ id: s.sparkId, title: s.title, meta: `${s.reason} ${s.suggestedAction}` }))} empty="No Near Blaze Sparks yet." />
    <ListSection title="Solar Flares" items={solarFlares.map((f)=>({id:f.id,title:f.title,meta:f.suggestedAction}))} empty="No flare patterns detected yet." />
    <ListSection title="Recent Blazes" items={recentBlazes.map((b) => ({ id: b.sparkId, title: b.title, meta: b.releasedAt }))} empty="No Blaze releases yet." />
  </section></Layout>;
}

function ListSection({ title, items, empty }: { title: string; items: { id: string; title: string; meta: string }[]; empty: string }) {
  return <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><h3 className="text-sm uppercase tracking-wider text-neonDim">{title}</h3><div className="mt-3 space-y-2">{items.length ? items.map((item) => <Link key={`${title}-${item.id}-${item.title}`} href={item.id.startsWith('flare')?'/stats':`/spark/${item.id}`} className="block rounded border border-neon/30 p-3 text-sm transition hover:border-neon/70"><p className="font-medium">{item.title}</p><p className="text-xs text-muted">{item.meta}</p></Link>) : <p className="text-sm text-muted">{empty}</p>}</div></section>;
}
