'use client';
import Layout from '@/components/Layout';
import { getMomentumStreak, getSolarFlares, useStore } from '@/components/store';

export default function StatsPage() {
  const { actions, blazes, burners, sparks } = useStore();
  const streak = getMomentumStreak(actions);
  const flares = getSolarFlares(sparks, blazes);
  const burnerBalance = burners.reduce((a, b) => a + b.delta, 0);
  const actionItems = actions.map((a, index) => ({ key: `${a.id}-${index}`, label: `${a.date} • ${a.action_type} • ${a.action}` }));
  const blazeItems = blazes.map((b, index) => ({ key: `${b.id}-${index}`, label: `${b.releasedAt} • ${b.title}` }));
  const flareItems = (flares.length ? flares : ['No flare patterns yet']).map((flare, index) => ({ key: `flare-${index}`, label: flare }));

  return <Layout><h2 className="mb-4 text-xl font-semibold">Stats</h2><p className="mb-3 text-neon">Momentum Streak: {streak} day(s)</p><p className="mb-3 text-ember">Burner Balance: {burnerBalance}</p><section className="grid gap-3 sm:grid-cols-2"><Panel title="Action Log" items={actionItems} /><Panel title="Blaze Log" items={blazeItems} /><Panel title="Solar Flares" items={flareItems} /></section></Layout>;
}

function Panel({ title, items }: { title: string; items: { key: string; label: string }[] }) {
  return <div className="rounded-xl border border-neon/20 bg-panelAlt p-4"><h3 className="text-sm uppercase tracking-widest text-neonDim">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted">{items.map((i) => <li key={i.key}>{i.label}</li>)}</ul></div>;
}
