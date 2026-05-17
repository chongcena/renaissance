'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function AddSparkPage() {
  const router = useRouter();
  const { branches, createSpark } = useStore();
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [kind, setKind] = useState('text note');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState('Spark');
  const [status, setStatus] = useState('new');
  const [nextMove, setNextMove] = useState('');
  return <Layout><section className="space-y-4"><h2 className="text-xl font-semibold">Add Spark</h2><form className="space-y-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm" onSubmit={(e)=>{e.preventDefault();if (!title.trim()) { setTitleError('Spark title is required.'); return; }const createdId = createSpark({title,kind,branchId,notes, stage: stage as any, status: status as any, nextMove}); if (!createdId) { setTitleError('Spark title is required.'); return; } setTitleError(''); router.push(`/spark/${createdId}`);}}>
    <input value={title} onChange={(e)=>{setTitle(e.target.value); if (titleError) setTitleError('');}} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Spark title" />
    {titleError ? <p className="text-sm text-fire">{titleError}</p> : null}
    <input value={kind} onChange={(e)=>setKind(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Kind" />
    <select value={branchId} onChange={(e)=>setBranchId(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2">{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
    <select value={stage} onChange={(e)=>setStage(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2"><option>Spark</option><option>Ember</option><option>Fire</option><option>Blaze</option></select>
    <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2"><option>new</option><option>active</option><option>cooling</option><option>frozen</option></select>
    <input value={nextMove} onChange={(e)=>setNextMove(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Next Move (optional)" />
    <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="h-24 w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Notes" />
    <div className="flex gap-2"><button className="rounded-lg bg-neon px-4 py-2 font-semibold text-bg">Create Spark Item</button><Link href="/vault" className="rounded-lg border border-neon/40 px-4 py-2 text-sm text-muted hover:border-neon/70 hover:text-text">Cancel</Link><button type="button" onClick={() => router.push('/')} className="rounded-lg border border-neon/40 px-4 py-2 text-sm text-muted hover:border-neon/70 hover:text-text">Back to Command</button></div></form></section></Layout>;
}
