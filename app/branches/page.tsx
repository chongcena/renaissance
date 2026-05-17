import Layout from '@/components/Layout';
import { branches } from '@/data/mock';

export default function BranchesPage() {
  return (
    <Layout>
      <h2 className="mb-4 text-xl font-semibold">Branches</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {branches.map((b) => (
          <article key={b.id} className="rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-4">
            <p className="text-xs text-muted">{b.id}</p>
            <h3 className="mt-1 text-lg font-semibold">{b.name} {b.frozen ? '🧊' : ''}</h3>
            <p className="text-sm text-muted">{b.focus}</p>
            <p className="mt-2 text-sm text-fire">Heat Score {b.heatScore}</p>
          </article>
        ))}
      </div>
    </Layout>
  );
}
