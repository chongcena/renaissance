'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function CaptureSparkPage() {
  const router = useRouter();
  const { branches, goals, createSpark } = useStore();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('note');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [goalId, setGoalId] = useState('');
  const [scheduleBucket, setScheduleBucket] = useState<'today'|'tomorrow'|'this_week'|'this_month'|'later'|''>('');
  const [currentAction, setCurrentAction] = useState('');
  const [notes, setNotes] = useState('');

  const create = () => {
    const createdId = createSpark({ title: title.trim() || 'Untitled Spark', kind, branchId, goalId: goalId || undefined, scheduleBucket: scheduleBucket || undefined, currentAction: currentAction || undefined, notes });
    if (createdId) router.push(`/spark/${createdId}`);
  };

  return <Layout><section className='space-y-3'><h2 className='text-xl font-semibold'>Capture Spark</h2><input value={title} onChange={(e)=>setTitle(e.target.value)} className='w-full rounded bg-bg p-2' placeholder='Title' /><input value={kind} onChange={(e)=>setKind(e.target.value)} className='w-full rounded bg-bg p-2' placeholder='Kind' /><select value={branchId} onChange={(e)=>setBranchId(e.target.value)} className='w-full rounded bg-bg p-2'>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select><select value={goalId} onChange={(e)=>setGoalId(e.target.value)} className='w-full rounded bg-bg p-2'><option value=''>No goal</option>{goals.map((g)=><option key={g.id} value={g.id}>{g.title}</option>)}</select><select value={scheduleBucket} onChange={(e)=>setScheduleBucket(e.target.value as any)} className='w-full rounded bg-bg p-2'><option value=''>No schedule</option><option value='today'>today</option><option value='tomorrow'>tomorrow</option><option value='this_week'>this_week</option><option value='this_month'>this_month</option><option value='later'>later</option></select><input value={currentAction} onChange={(e)=>setCurrentAction(e.target.value)} className='w-full rounded bg-bg p-2' placeholder='Current Action' /><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className='h-24 w-full rounded bg-bg p-2' placeholder='Notes' /><div className='flex gap-2'><button onClick={create} className='rounded bg-neon px-3 py-2 text-bg'>Capture</button><Link href='/vault' className='rounded border border-neon/40 px-3 py-2'>Cancel</Link></div></section></Layout>;
}
