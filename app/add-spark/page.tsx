'use client';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function AddSparkPage() {
  const { branches, createSpark } = useStore();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('text note');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  return <Layout><section className="space-y-4"><h2 className="text-xl font-semibold">Add Spark</h2><form className="space-y-3 rounded-xl border border-neon/20 bg-panelAlt p-4" onSubmit={(e)=>{e.preventDefault();createSpark({title,kind,branchId,notes});setTitle('');setNotes('');}}>
    <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-lg border border-neon/30 bg-bg px-3 py-2" placeholder="Spark title" />
    <input value={kind} onChange={(e)=>setKind(e.target.value)} className="w-full rounded-lg border border-neon/30 bg-bg px-3 py-2" placeholder="Kind" />
    <select value={branchId} onChange={(e)=>setBranchId(e.target.value)} className="w-full rounded-lg border border-neon/30 bg-bg px-3 py-2">{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
    <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="h-24 w-full rounded-lg border border-neon/30 bg-bg px-3 py-2" placeholder="Notes" />
    <button className="rounded-lg bg-neon px-4 py-2 font-semibold text-black">Create Spark Item</button></form></section></Layout>;
}
