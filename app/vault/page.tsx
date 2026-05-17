'use client';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useStore, getCoolDownWarning } from '@/components/store';

export default function VaultPage() {
  const { sparks, pathways, branches } = useStore();
  return <Layout><h2 className="mb-4 text-xl font-semibold">Vault</h2><div className="space-y-3">{sparks.map((s)=>{const branch = branches.find((b) => b.id === s.branchId);const sparkPathways = pathways.filter((p) => p.sparkId === s.id);const nextMove = sparkPathways[0]?.lane ? `Develop pathway: ${sparkPathways[0].lane}` : 'Add a pathway move';return <Link key={s.id} href={`/spark/${s.id}`} className="block rounded-xl border border-neon/20 bg-panelAlt p-4 transition hover:border-neon/50"><p className="text-xs text-muted">{s.kind} • {s.updatedAt}</p><h3 className="mt-1 font-semibold">{s.title.trim() || 'Untitled Spark'}</h3><dl className="mt-2 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-muted">Type</dt><dd>{s.kind}</dd></div><div><dt className="text-muted">Branch</dt><dd>{branch?.name ?? s.branchId}</dd></div><div><dt className="text-muted">Lifecycle Stage</dt><dd>{s.stage}</dd></div><div><dt className="text-muted">Status</dt><dd>{s.status}</dd></div><div><dt className="text-muted">Heat Score</dt><dd>{s.heatScore}</dd></div><div className="col-span-2"><dt className="text-muted">Next Move</dt><dd>{nextMove}</dd></div></dl>{getCoolDownWarning(s.last_touched_at,s.status)?<p className="mt-2 text-xs text-fire">{getCoolDownWarning(s.last_touched_at,s.status)}</p>:null}</Link>;})}</div></Layout>;
}
