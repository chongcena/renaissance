'use client';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { detectSolarFlares, getCoolDownWarnings, getMomentumStreakSummary, getNearBlazeItems } from '@/lib/logic';

export default function HomePage() {
  const { blazes, branches, sparks, actions, burners, pathways } = useStore();
  const [showFlareDetails, setShowFlareDetails] = useState(false);
  const burnerBalance = burners.reduce((a, b) => a + b.delta, 0);
  const streak = getMomentumStreakSummary(actions);
  const continueFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active');
  const coolDownWarnings = getCoolDownWarnings(sparks, pathways, actions, branches);
  const nearBlaze = getNearBlazeItems(sparks, pathways, blazes, branches);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, actions, branches);
  const recentBlazes = blazes.slice(0, 5);

  return <Layout><section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Home / Command</h2><Link href="/add-spark" className="rounded-lg bg-neon px-4 py-2 font-semibold text-bg">+ Spark</Link></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card label="Momentum Streak" value={String(streak.currentStreak)} staticLabel={streak.countedToday ? 'Counted today' : 'No counted action yet today'} />
      <Card label="Burners" value={String(burnerBalance)} staticLabel="Ledger balance" />
      <Card label="Stats Snapshot" value={`${sparks.length} Sparks / ${pathways.length} Pathways / ${branches.length} Branches`} staticLabel="Preview" />
      <button onClick={() => setShowFlareDetails((v) => !v)} className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 text-left backdrop-blur-sm transition hover:border-neon/70"><p className="text-xs uppercase tracking-wider text-muted">Solar Flares</p><p className="mt-2 text-3xl font-bold text-neon">{solarFlares.length}</p><p className="mt-1 text-xs text-neonDim">{showFlareDetails ? 'Hide evidence' : 'Show evidence'}</p></button>
    </div>

    <ListSection title="Continue Fires" items={continueFires.map((s) => ({ id: s.id, title: s.title || 'Untitled Spark', meta: `${s.stage} • ${s.status}` }))} empty="No active Fire Sparks." />
    <ListSection title="Cool Down Warnings" items={coolDownWarnings.map((w) => ({ id: w.sparkId, title: w.title, meta: `${w.reason} ${w.suggestedAction}` }))} empty="No cooling Sparks right now." />
    <ListSection title="Near Blaze" items={nearBlaze.map((s) => ({ id: s.sparkId, title: s.title, meta: `${s.reason} ${s.suggestedAction}` }))} empty="No Near Blaze Sparks yet." />
    <ListSection title="Recent Blazes" items={recentBlazes.map((b) => ({ id: b.sparkId, title: b.title, meta: b.releasedAt }))} empty="No Blaze releases yet." />

    {showFlareDetails ? <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><h3 className="text-sm uppercase tracking-wider text-neonDim">Solar Flare Evidence</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm">{solarFlares.length ? solarFlares.map((flare) => <li key={flare.id}><p>{flare.title}</p><p className="text-xs text-muted">{flare.evidence.join(' ')}</p></li>) : <li>No flare patterns detected yet.</li>}</ul></section> : null}
  </section></Layout>;
}

function Card({ label, value, staticLabel }: { label: string; value: string; staticLabel: string }) { return <div className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-neon">{value}</p><p className="mt-1 text-xs text-neonDim">{staticLabel}</p></div>; }

function ListSection({ title, items, empty }: { title: string; items: { id: string; title: string; meta: string }[]; empty: string }) {
  return <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><h3 className="text-sm uppercase tracking-wider text-neonDim">{title}</h3><div className="mt-3 space-y-2">{items.length ? items.map((item) => <Link key={`${title}-${item.id}-${item.title}`} href={`/spark/${item.id}`} className="block rounded border border-neon/30 p-3 text-sm transition hover:border-neon/70"><p className="font-medium">{item.title}</p><p className="text-xs text-muted">{item.meta}</p></Link>) : <p className="text-sm text-muted">{empty}</p>}</div></section>;
}
