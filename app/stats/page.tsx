'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getMomentumStreak, getSolarFlares, useStore } from '@/components/store';

export default function StatsPage() {
  const { actions, blazes, burners, sparks, pathways, branches } = useStore();
  const streak = getMomentumStreak(actions);
  const flares = getSolarFlares(sparks, blazes);
  const burnerBalance = burners.reduce((a, b) => a + b.delta, 0);

  return <Layout><h2 className="mb-4 text-xl font-semibold">Stats</h2><section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Sparks" value={String(sparks.length)} /><StatCard label="Pathways" value={String(pathways.length)} /><StatCard label="Branches" value={String(branches.length)} /><StatCard label="Blazes" value={String(blazes.length)} /></section><p className="mb-3 text-neon">Momentum Streak: {streak} day(s)</p><p className="mb-3 text-ember">Burner Balance: {burnerBalance}</p><section className="grid gap-3 sm:grid-cols-2"><Panel title="Action Log" items={actions.map((a, index) => ({ key: `${a.id}-${index}`, content: <span>{a.date} • {a.action_type} • {a.action}</span> }))} /><Panel title="Blaze Log" items={blazes.map((b, index) => ({ key: `${b.id}-${index}`, content: <span>{b.releasedAt} • {b.title} <Link className="text-neon hover:underline" href={`/spark/${b.sparkId}`}>Open Spark</Link></span> }))} /><Panel title="Solar Flares" items={(flares.length ? flares : ['No flare patterns yet']).map((flare, index) => ({ key: `flare-${index}`, content: <span>{flare}</span> }))} /></section></Layout>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-neon">{value}</p><p className="mt-1 text-xs text-neonDim">Computed from local state</p></div>;
}

function Panel({ title, items }: { title: string; items: { key: string; content: React.ReactNode }[] }) {
  return <div className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm"><h3 className="text-sm uppercase tracking-widest text-neonDim">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted">{items.map((i) => <li key={i.key}>{i.content}</li>)}</ul></div>;
}
