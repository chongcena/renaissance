'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useStore, getCoolDownWarning } from '@/components/store';

export default function VaultPage() {
  const { sparks, pathways, branches } = useStore();
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filteredSparks = useMemo(() => sparks.filter((s) => (stageFilter === 'all' || s.stage === stageFilter) && (statusFilter === 'all' || s.status === statusFilter) && (branchFilter==='all'||s.branchId===branchFilter) && (!query.trim()||s.title.toLowerCase().includes(query.toLowerCase()))), [sparks, stageFilter, statusFilter, branchFilter, query]);

  return <Layout><h2 className="mb-4 text-xl font-semibold">Vault</h2><div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
<input value={query} onChange={(e)=>setQuery(e.target.value)} className="rounded-lg border border-neon/40 bg-panelAlt/85 px-3 py-2" placeholder="Search Sparks" /><select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded-lg border border-neon/40 bg-panelAlt/85 px-3 py-2"><option value="all">All stages</option><option value="Spark">Spark</option><option value="Ember">Ember</option><option value="Fire">Fire</option><option value="Blaze">Blaze</option></select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-neon/40 bg-panelAlt/85 px-3 py-2"><option value="all">All statuses</option><option value="new">new</option><option value="active">active</option><option value="cooling">cooling</option><option value="frozen">frozen</option><option value="archived">archived</option><option value="killed">killed</option></select><select value={branchFilter} onChange={(e)=>setBranchFilter(e.target.value)} className="rounded-lg border border-neon/40 bg-panelAlt/85 px-3 py-2"><option value='all'>All branches</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
    {filteredSparks.length === 0 ? <section className="rounded-xl border border-neon/40 bg-panelAlt/85 p-6 text-sm text-muted">No Sparks match these filters yet. Try clearing one filter or create a new Spark.</section> : <div className="space-y-3">{filteredSparks.map((s)=>{const branch = branches.find((b) => b.id === s.branchId);const sparkPathways = pathways.filter((p) => p.sparkId === s.id);const nextMove = sparkPathways[0]?.lane ? `Develop pathway: ${sparkPathways[0].lane}` : 'Add a pathway move';return <Link key={s.id} href={`/spark/${s.id}`} className="block rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm transition hover:border-neon/70"><p className="text-xs text-muted">{s.kind} • {s.updatedAt}</p><h3 className="mt-1 font-semibold">{s.title.trim() || 'Untitled Spark'}</h3><dl className="mt-2 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-muted">Type</dt><dd>{s.kind}</dd></div><div><dt className="text-muted">Branch</dt><dd>{branch?.name ?? s.branchId}</dd></div><div><dt className="text-muted">Lifecycle Stage</dt><dd>{s.stage}</dd></div><div><dt className="text-muted">Status</dt><dd>{s.status}</dd></div><div><dt className="text-muted">Heat Score</dt><dd>{s.heatScore}</dd></div><div className="col-span-2"><dt className="text-muted">Next Move</dt><dd>{nextMove}</dd></div></dl>{getCoolDownWarning(s.last_touched_at,s.status)?<p className="mt-2 text-xs text-fire">{getCoolDownWarning(s.last_touched_at,s.status)}</p>:null}</Link>;})}</div>}</Layout>;
}
