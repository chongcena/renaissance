'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getCoolDownWarning, getMomentumStreak, useStore } from '@/components/store';

export default function HomePage() {
  const { blazes, branches, sparks, burners, actions, pathways } = useStore();

  const burnerBalance = burners.reduce((a, b) => a + b.delta, 0);
  const streak = getMomentumStreak(actions);
  const fires = sparks.filter((s) => s.stage === 'Fire' && ['active', 'cooling'].includes(s.status));
  const needingRouting = sparks.filter((s) => !pathways.some((p) => p.sparkId === s.id));
  const coolingFires = sparks.filter((s) => s.stage === 'Fire' && s.status === 'cooling');
  const nearBlaze = sparks.filter((s) => s.stage === 'Fire' && s.heatScore >= 80);
  const frozen = sparks.filter((s) => s.status === 'frozen');
  const warnings = sparks
    .map((s) => ({ ...s, warning: getCoolDownWarning(s.last_touched_at, s.status) }))
    .filter((s) => s.warning);

  const branchLoad = branches.map((b) => ({
    ...b,
    sparkCount: sparks.filter((s) => s.branchId === b.id).length,
    blazeCount: blazes.filter((x) => x.branchId === b.id).length
  }));

  const stageFlow = ['Spark', 'Ember', 'Fire', 'Blaze'].map((stage) => ({ stage, count: sparks.filter((s) => s.stage === stage).length }));

  const mockSolar = [
    { id: 'sf-1', title: 'Morning Capture Sprint', evidence: '3 Fire items started after short morning sessions', branch: 'Music' },
    { id: 'sf-2', title: 'Publish Cadence Loop', evidence: '2 Blazes emerged when pathway confidence exceeded 75%', branch: 'Writing' }
  ];

  return (
    <Layout>
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-wide">Home / Command</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TopStat label="Momentum Streak" value={`${streak}d`} />
          <TopStat label="Burners" value={String(burnerBalance)} />
          <TopStat label="Sparks in Motion" value={String(sparks.length)} />
          <TopStat label="Recent Blazes" value={String(blazes.length)} />
        </div>

        <Link href="/add-spark" className="block rounded-2xl border border-neon/60 bg-neon px-5 py-4 text-center text-lg font-bold text-black shadow-glow">
          + Add Spark
        </Link>

        <Section title="Continue Fires">
          <div className="grid gap-3 sm:grid-cols-2">
            {fires.length ? fires.map((s) => (
              <article key={s.id} className="rounded-xl border border-neon/20 bg-panelAlt p-4">
                <p className="text-xs text-muted">{branchName(branches, s.branchId)} • Heat {s.heatScore}</p>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="text-sm text-ember">Next Move: tighten pathway + prep release notes</p>
                <p className="text-xs text-muted">Condition: {s.status}</p>
                <Link href="/spark" className="mt-3 inline-block text-sm text-neon">Open Spark Detail →</Link>
              </article>
            )) : <Empty text="No active Fires yet. Promote an Ember to Fire." />}
          </div>
        </Section>

        <Section title="Heat Check">
          <ul className="space-y-2 text-sm text-muted">
            <li>• Sparks needing routing: <span className="text-text">{needingRouting.length}</span></li>
            <li>• Fires cooling off: <span className="text-text">{coolingFires.length}</span></li>
            <li>• Near Blaze items: <span className="text-text">{nearBlaze.length}</span></li>
            <li>• Frozen items ready to revisit: <span className="text-text">{frozen.length}</span></li>
            <li>• Neglected branches: <span className="text-text">{branchLoad.filter((b) => b.sparkCount === 0).length}</span></li>
          </ul>
        </Section>

        <Section title="Cool Down Warnings">
          <div className="space-y-2">
            {warnings.length ? warnings.map((w) => <p key={w.id} className="rounded-lg border border-fire/30 bg-fire/10 px-3 py-2 text-sm">{w.title}: {w.warning}</p>) : <Empty text="No momentum risks detected." />}
          </div>
        </Section>

        <Section title="Near Blaze">
          <div className="grid gap-3 sm:grid-cols-2">
            {nearBlaze.length ? nearBlaze.map((s) => (
              <article key={s.id} className="rounded-xl border border-ember/30 bg-panelAlt p-4">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-ember">Next Move: finalize and publish</p>
                <p className="text-xs text-muted">Suggested output: short-form release + blaze log entry</p>
              </article>
            )) : <Empty text="No Fire items close to Blaze yet." />}
          </div>
        </Section>

        <Section title="Solar Flares">
          <div className="grid gap-3 sm:grid-cols-2">
            {mockSolar.map((f) => (
              <article key={f.id} className="rounded-xl border border-neon/20 bg-panelAlt p-4">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted">{f.evidence}</p>
                <p className="mt-1 text-xs text-neonDim">Related Branch: {f.branch}</p>
                <button className="mt-3 rounded-lg border border-neon/40 px-3 py-1 text-sm text-neon">Create Sun</button>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Recent Blazes">
          <div className="grid gap-3 sm:grid-cols-2">
            {blazes.map((b) => (
              <article key={b.id} className="rounded-xl border border-neon/20 bg-panelAlt p-4">
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-xs text-muted">output type: release • {branchName(branches, b.branchId)}</p>
                <p className="mt-1 text-xs text-neonDim">value tags: consistency, visibility</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Stats Snapshot">
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-neon/20 bg-panelAlt p-4">
              <h3 className="text-sm uppercase tracking-wider text-neonDim">Attention by Branch</h3>
              {branchLoad.map((b) => <p key={b.id} className="mt-1 text-sm">{b.name}: {b.sparkCount} sparks / {b.blazeCount} blazes</p>)}
            </article>
            <article className="rounded-xl border border-neon/20 bg-panelAlt p-4">
              <h3 className="text-sm uppercase tracking-wider text-neonDim">Stage Flow</h3>
              {stageFlow.map((s) => <p key={s.stage} className="mt-1 text-sm">{s.stage}: {s.count}</p>)}
            </article>
            <article className="rounded-xl border border-neon/20 bg-panelAlt p-4">
              <h3 className="text-sm uppercase tracking-wider text-neonDim">Value Routing</h3>
              <p className="mt-1 text-sm">Pathways total: {pathways.length}</p>
              <p className="mt-1 text-sm">Avg confidence: {pathways.length ? Math.round(pathways.reduce((a, p) => a + p.confidence, 0) / pathways.length) : 0}%</p>
            </article>
          </div>
        </Section>
      </section>
    </Layout>
  );
}

function TopStat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-neon/20 bg-panelAlt p-3"><p className="text-[11px] uppercase tracking-widest text-muted">{label}</p><p className="mt-1 text-2xl font-bold text-neon">{value}</p></article>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-neonDim">{title}</h3>{children}</section>;
}
function Empty({ text }: { text: string }) { return <p className="rounded-lg border border-neon/15 bg-panelAlt p-3 text-sm text-muted">{text}</p>; }
function branchName(branches: { id: string; name: string }[], id: string) { return branches.find((b) => b.id === id)?.name ?? id; }
