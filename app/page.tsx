'use client';
import Layout from '@/components/Layout';
import { getMomentumStreak, useStore } from '@/components/store';

export default function HomePage() {
  const { blazes, branches, sparks, actions } = useStore();
  return <Layout><section className="space-y-4"><h2 className="text-xl font-semibold">Home / Command</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Card label="Sparks in motion" value={String(sparks.length)} /><Card label="Active branches" value={String(branches.filter((b) => !b.frozen).length)} /><Card label="Recent blazes" value={String(blazes.length)} /><Card label="Momentum streak" value={String(getMomentumStreak(actions))} /></div></section></Layout>;
}
function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-neon/20 bg-panelAlt p-4"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-neon">{value}</p></div>; }
