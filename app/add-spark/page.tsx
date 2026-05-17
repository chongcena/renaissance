'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

const modes = ['note', 'link', 'image', 'audio', 'video', 'file'] as const;

export default function CaptureSparkPage() {
  const router = useRouter();
  const { branches, goals, createSpark } = useStore();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [goalId, setGoalId] = useState('');
  const [scheduleBucket, setScheduleBucket] = useState<'today'|'tomorrow'|'this_week'|'this_month'|'later'|''>('');
  const [currentAction, setCurrentAction] = useState('');
  const [notes, setNotes] = useState('');

  const create = () => {
    const createdId = createSpark({ title: title.trim() || 'Untitled Spark', kind: kind || 'note', branchId, goalId: goalId || undefined, scheduleBucket: scheduleBucket || undefined, currentAction: currentAction || undefined, notes });
    if (createdId) router.push(`/spark/${createdId}`);
  };

  return <Layout><section className='mx-auto max-w-3xl space-y-4'><h2 className='text-2xl font-semibold tracking-tight'>Capture</h2>
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>{modes.map((mode)=><button key={mode} onClick={()=>setKind(mode)} className={`rounded-xl border px-3 py-2 text-sm capitalize ${kind===mode?'border-neon/40 bg-neon/15 text-amber-100':'border-neon/15 bg-panelAlt/70 text-muted hover:text-text'}`}>{mode}</button>)}</div>
    <section className='rounded-2xl border border-neon/15 bg-panelAlt/70 p-4 space-y-3'>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5' placeholder='Title your capture' />
      <p className='text-xs text-muted'>Mode: {kind || 'Choose a capture mode above'}</p>
      <div className='grid gap-2 sm:grid-cols-2'>
        <select value={branchId} onChange={(e)=>setBranchId(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5'>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select value={goalId} onChange={(e)=>setGoalId(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5'><option value=''>No goal</option>{goals.map((g)=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
      </div>
      <details><summary className='cursor-pointer text-sm text-neonDim'>Advanced</summary><div className='mt-2 grid gap-2'><select value={scheduleBucket} onChange={(e)=>setScheduleBucket(e.target.value as any)} className='w-full rounded-lg bg-bg/60 p-2.5'><option value=''>No schedule</option><option value='today'>today</option><option value='tomorrow'>tomorrow</option><option value='this_week'>this_week</option><option value='this_month'>this_month</option><option value='later'>later</option></select><input value={currentAction} onChange={(e)=>setCurrentAction(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5' placeholder='Current Action' /><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className='h-24 w-full rounded-lg bg-bg/60 p-2.5' placeholder='Notes' /></div></details>
      <div className='flex gap-2'><button onClick={create} className='rounded-lg bg-neon px-4 py-2 font-semibold text-bg'>Capture</button><Link href='/vault' className='rounded-lg border border-neon/30 px-4 py-2'>Cancel</Link></div>
    </section>
  </section></Layout>;
}
