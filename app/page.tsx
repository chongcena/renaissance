'use client';
import Layout from '@/components/Layout';
import { getCoolDownWarning, getMomentumStreak, getSolarFlares, useStore } from '@/components/store';

export default function HomePage() {
  const { blazes, branches, sparks, actions, burners, pathways } = useStore();
  const burnerBalance = burners.reduce((a, b) => a + b.delta, 0);
  const continueFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'active').length;
  const coolDownWarnings = sparks.filter((s) => !!getCoolDownWarning(s.last_touched_at, s.status)).length;
  const nearBlaze = sparks.filter((s) => s.stage === 'Fire' || pathways.some((p) => p.sparkId === s.id && p.confidence >= 80)).length;
  const solarFlares = getSolarFlares(sparks, blazes).length;

  return <Layout><section className="space-y-4"><h2 className="text-xl font-semibold">Home / Command</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Card label="Momentum Streak" value={String(getMomentumStreak(actions))} />
    <Card label="Burners" value={String(burnerBalance)} />
    <Card label="Continue Fires" value={String(continueFires)} />
    <Card label="Cool Down Warnings" value={String(coolDownWarnings)} />
    <Card label="Near Blaze" value={String(nearBlaze)} />
    <Card label="Solar Flares" value={String(solarFlares)} />
    <Card label="Recent Blazes" value={String(blazes.length)} />
    <Card label="Stats Snapshot" value={`${sparks.length} Sparks / ${pathways.length} Pathways / ${branches.length} Branches`} />
  </div></section></Layout>;
}
function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-4"><p className="text-xs uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-neon">{value}</p></div>; }
