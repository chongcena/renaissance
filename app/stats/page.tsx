'use client';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function StatsPage() {
  const { actions, blazes, sparks, branches } = useStore();
  const actionable = actions.filter((a) => a.countsForStreak);
  const totalActions = actionable.length || 1;
  const stageCounts = {
    Spark: sparks.filter((s) => s.stage === 'Spark').length,
    Ember: sparks.filter((s) => s.stage === 'Ember').length,
    Fire: sparks.filter((s) => s.stage === 'Fire').length,
    Blaze: sparks.filter((s) => s.stage === 'Blaze').length
  };
  const bottleneck = stageCounts.Spark > stageCounts.Ember ? 'Many Sparks are captured but not routed.' : stageCounts.Fire > 0 && stageCounts.Blaze < stageCounts.Fire ? 'Few Fires are reaching Blaze.' : 'Stage flow is currently balanced.';

  const attentionRouting = branches.map((b) => {
    const count = actionable.filter((a) => a.branchId === b.id).length;
    const actual = Math.round((count / totalActions) * 100);
    const diff = actual - b.strategicWeight;
    const status = diff > 8 ? 'over-consuming' : diff < -8 ? 'underfed' : 'balanced';
    return { ...b, actual, diff, status };
  });

  const byDate = new Map<string, number>();
  actionable.forEach((a) => byDate.set(a.date, (byDate.get(a.date) ?? 0) + 1));
  const days = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return <Layout><h2 className="mb-4 text-xl font-semibold">Stats & Insights</h2>
    <Panel title="Attention Routing" items={attentionRouting.map((r) => `${r.name}: Planned ${r.strategicWeight}% • Actual ${r.actual}% • Δ ${r.diff}% • ${r.status}`)} />
    <Panel title="Stage Flow" items={[`Spark: ${stageCounts.Spark}`, `Ember: ${stageCounts.Ember}`, `Fire: ${stageCounts.Fire}`, `Blaze: ${stageCounts.Blaze}`, bottleneck]} />
    <Panel title="Conversion Funnel" items={[`Sparks captured: ${stageCounts.Spark + stageCounts.Ember + stageCounts.Fire + stageCounts.Blaze}`, `Routed Embers: ${stageCounts.Ember + stageCounts.Fire + stageCounts.Blaze}`, `Active Fires: ${sparks.filter((s)=>s.stage==='Fire'&&s.status==='active').length}`, `Released Blazes: ${blazes.length}`]} />
    <Panel title="Output Type Breakdown (Preview)" items={[`Preview: Blaze Logs need structured outputType field per release.`, `Current blaze records: ${blazes.length}`]} />
    <Panel title="Value Routing (Preview)" items={[`Preview: We need value tags connected to sparks/pathways/actions.`, `Current branch tag sets: ${branches.filter((b)=>b.tags?.length).length}`]} />
    <Panel title="Calendar Heat Map" items={days.length ? days.map(([day, count]) => `${day} ${'■'.repeat(Math.min(count, 8))} (${count})`) : ['Preview: Add more Action Log day coverage to render a useful heat map.']} />
    <Panel title="Action History" items={actions.map((a) => `${a.date} • ${a.action}`)} />
  </Layout>;
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return <section className="mb-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-sm uppercase tracking-widest text-neonDim">{title}</h3><ul className="mt-3 space-y-2 text-sm text-muted">{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></section>;
}
