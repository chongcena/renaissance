'use client';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { detectSolarFlares } from '@/lib/logic';
import { getBranchAttention, getConversionData, getHeatCalendar, getStageCounts } from '@/lib/analytics';

export default function StatsPage() {
  const { actions, blazes, sparks, branches, pathways } = useStore();
  const attentionRouting = getBranchAttention(branches, actions, sparks);
  const stageCounts = getStageCounts(sparks);
  const conversion = getConversionData(sparks, pathways, blazes);
  const calendar = getHeatCalendar(actions);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, actions, branches);
  const outputTypeMissing = blazes.every((blaze) => !blaze.title.includes('('));
  const tagsMissing = !branches.some((branch) => branch.tags?.length);

  return <Layout><h2 className="mb-4 text-xl font-semibold">Stats & Insights</h2>
    <Section title="Branch Allocation">{branches.map((b)=><Bar key={b.id} label={`${b.name} ${b.strategicWeight}%`} value={b.strategicWeight} />)}</Section>
    <Section title="Planned vs Actual Attention">{attentionRouting.map((b)=><DualBar key={b.id} label={`${b.name} • ${b.status}`} planned={b.strategicWeight} actual={b.actual} />)}</Section>
    <Section title="Stage Flow"><div className="grid grid-cols-4 gap-2 text-center text-xs">{(['Spark', 'Ember', 'Fire', 'Blaze'] as const).map((key)=><div key={key} className="rounded border border-neon/30 p-2"><p className="text-neonDim">{key}</p><p className="text-xl font-semibold text-amber-100">{stageCounts[key]}</p></div>)}</div></Section>
    <Section title="Conversion Funnel">{conversion.map((item)=><Bar key={item.name} label={`${item.name}: ${item.value}`} value={Math.round((item.value / Math.max(conversion[0].value,1))*100)} />)}</Section>
    <Section title="Output Type Breakdown">{outputTypeMissing ? <Empty text="Release Blazes with output types to activate this chart." /> : <p className="text-sm text-muted">Output type data detected in released Blaze records.</p>}</Section>
    <Section title="Value Routing">{tagsMissing ? <Empty text="Add value tags to Sparks, Pathways, or Blazes to activate value routing." /> : <p className="text-sm text-muted">Value tags exist. Expand routing analytics next.</p>}</Section>
    <Section title="Calendar Heat Map"><div className="grid grid-cols-7 gap-1">{calendar.map((day)=><div key={day.date} title={`${day.date}: ${day.count} meaningful action(s)`} className="h-6 rounded" style={{backgroundColor: day.count===0 ? '#1f2937' : day.count<2 ? '#78350f' : day.count<4 ? '#b45309' : '#f59e0b'}} />)}</div></Section>
    <Section title="Solar Flare Signals">{solarFlares.length ? <ul className="space-y-2 text-sm text-muted">{solarFlares.map((flare)=><li key={flare.id} className="rounded border border-neon/20 p-2"><p className="font-medium text-amber-100">{flare.title}</p><p>{flare.evidence.join(' ')}</p></li>)}</ul> : <Empty text="No repeatable flare evidence yet." />}</Section>
    <Section title="Action History"><ul className="space-y-1 text-sm text-muted">{actions.map((a)=><li key={a.id}>{a.date} • {a.action}</li>)}</ul></Section>
  </Layout>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-sm uppercase tracking-widest text-neonDim">{title}</h3><div className="mt-3 space-y-2">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="rounded border border-neon/20 bg-bg/50 p-3 text-sm text-muted">{text}</p>; }
function Bar({ label, value }: { label: string; value: number }) { return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div><div className="h-2 rounded bg-bg"><div className="h-2 rounded bg-amber-500" style={{width:`${Math.min(100, value)}%`}} /></div></div>; }
function DualBar({ label, planned, actual }: { label: string; planned: number; actual: number }) { return <div><p className="mb-1 text-sm">{label}</p><div className="relative h-3 rounded bg-bg"><div className="absolute h-3 rounded bg-amber-500/70" style={{width:`${planned}%`}} /><div className="absolute h-3 rounded bg-orange-400/80" style={{width:`${actual}%`}} /></div><p className="mt-1 text-xs text-muted">Planned {planned}% vs Actual {actual}%</p></div>; }
