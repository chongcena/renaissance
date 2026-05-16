'use client';
import Layout from '@/components/Layout';
import { getMomentumStreak, getSolarFlares, useStore } from '@/components/store';

export default function StatsPage() {
  const { actions, blazes, burners, sparks } = useStore();
  const streak = getMomentumStreak(actions);
  const flares = getSolarFlares(sparks, blazes);
  const burnerBalance = burners.reduce((a, b) => a + b.delta, 0);
  return <Layout><h2 className="mb-4 text-xl font-semibold">Stats</h2><p className="mb-3 text-neon">Momentum Streak: {streak} day(s)</p><p className="mb-3 text-ember">Burner Balance: {burnerBalance}</p><section className="grid gap-3 sm:grid-cols-2"><Panel title="Action Log" items={actions.map((a) => `${a.date}: ${a.action}`)} /><Panel title="Blaze Log" items={blazes.map((b) => `${b.releasedAt}: ${b.title}`)} /><Panel title="Solar Flares" items={flares.length ? flares : ['No flare patterns yet']} /></section></Layout>;
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-xl border border-neon/20 bg-panelAlt p-4"><h3 className="text-sm uppercase tracking-widest text-neonDim">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted">{items.map((i) => <li key={i}>{i}</li>)}</ul></div>;
}
