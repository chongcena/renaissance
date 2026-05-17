'use client';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { Goal, GoalStatus, TimelineBucket } from '@/data/types';

const scales: Goal['scale'][] = ['year', 'month', 'week', 'day'];
const statuses: GoalStatus[] = ['active', 'paused', 'complete'];
const buckets: TimelineBucket[] = ['today', 'tomorrow', 'this_week', 'this_month', 'later'];

type GoalDraft = {
  title: string;
  pillarId: string;
  scale: Goal['scale'];
  status: GoalStatus;
  priorityWeight: string;
  scheduleBucket: '' | TimelineBucket;
  startDate: string;
  dueDate: string;
  currentAction: string;
};

const scaleLabels: Record<Goal['scale'], string> = {
  year: 'Year Goals',
  month: 'Month Goals',
  week: 'Week Goals',
  day: 'Day Goals / Today'
};

const emptyDraft = (pillarId = ''): GoalDraft => ({
  title: '', pillarId, scale: 'week', status: 'active', priorityWeight: '', scheduleBucket: '', startDate: '', dueDate: '', currentAction: ''
});

export default function GoalsPage() {
  const { goals, branches, createGoal, updateGoal } = useStore();
  const [draft, setDraft] = useState<GoalDraft>(emptyDraft(branches[0]?.id ?? ''));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<GoalDraft>(emptyDraft(branches[0]?.id ?? ''));

  const groupedGoals = useMemo(
    () => scales.map((scale) => ({ scale, goals: goals.filter((goal) => goal.scale === scale) })),
    [goals]
  );

  const toPayload = (form: GoalDraft) => ({
    title: form.title,
    pillarId: form.pillarId,
    scale: form.scale,
    status: form.status,
    priorityWeight: form.priorityWeight ? Number(form.priorityWeight) : undefined,
    scheduleBucket: form.scheduleBucket || undefined,
    startDate: form.startDate || undefined,
    dueDate: form.dueDate || undefined,
    currentAction: form.currentAction || undefined
  });

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditingDraft({
      title: goal.title,
      pillarId: goal.pillarId,
      scale: goal.scale,
      status: goal.status,
      priorityWeight: goal.priorityWeight?.toString() ?? '',
      scheduleBucket: goal.scheduleBucket ?? '',
      startDate: goal.startDate ?? '',
      dueDate: goal.dueDate ?? '',
      currentAction: goal.currentAction ?? ''
    });
  };

  return <Layout><section className='space-y-4'>
    <h2 className='text-2xl font-semibold tracking-tight'>Goals</h2>
    <details className='rounded-xl border border-neon/20 bg-panelAlt/70 p-4' open>
      <summary className='cursor-pointer text-sm font-medium text-amber-100'>Add Goal</summary>
    <form className='mt-3 grid gap-2 sm:grid-cols-2' onSubmit={(e)=>{e.preventDefault(); if(!createGoal(toPayload(draft))) return; setDraft(emptyDraft(branches[0]?.id ?? ''));}}>
      <input required value={draft.title} onChange={(e)=>setDraft((v)=>({...v,title:e.target.value}))} className='rounded bg-bg px-3 py-2' placeholder='Goal title' />
      <select value={draft.pillarId} onChange={(e)=>setDraft((v)=>({...v,pillarId:e.target.value}))} className='rounded bg-bg px-3 py-2' required>
        {branches.map((b)=><option value={b.id} key={b.id}>{b.name}</option>)}
      </select>
      <select value={draft.scale} onChange={(e)=>setDraft((v)=>({...v,scale:e.target.value as Goal['scale']}))} className='rounded bg-bg px-3 py-2'>{scales.map((s)=><option key={s} value={s}>{s}</option>)}</select>
      <select value={draft.status} onChange={(e)=>setDraft((v)=>({...v,status:e.target.value as GoalStatus}))} className='rounded bg-bg px-3 py-2'>{statuses.map((s)=><option key={s} value={s}>{s}</option>)}</select>
      <input value={draft.priorityWeight} onChange={(e)=>setDraft((v)=>({...v,priorityWeight:e.target.value}))} type='number' min={0} max={100} className='rounded bg-bg px-3 py-2' placeholder='Priority weight' />
      <select value={draft.scheduleBucket} onChange={(e)=>setDraft((v)=>({...v,scheduleBucket:e.target.value as '' | TimelineBucket}))} className='rounded bg-bg px-3 py-2'>
        <option value=''>No schedule bucket</option>{buckets.map((b)=><option key={b} value={b}>{b}</option>)}
      </select>
      <input type='date' value={draft.startDate} onChange={(e)=>setDraft((v)=>({...v,startDate:e.target.value}))} className='rounded bg-bg px-3 py-2' />
      <input type='date' value={draft.dueDate} onChange={(e)=>setDraft((v)=>({...v,dueDate:e.target.value}))} className='rounded bg-bg px-3 py-2' />
      <input value={draft.currentAction} onChange={(e)=>setDraft((v)=>({...v,currentAction:e.target.value}))} className='rounded bg-bg px-3 py-2 sm:col-span-2' placeholder='Current Action (optional)' />
      <button className='rounded bg-neon px-3 py-2 font-semibold text-bg sm:col-span-2'>Save Goal</button>
    </form>
    </details>

    {groupedGoals.map(({ scale, goals: bucketGoals })=><section key={scale} className='rounded-xl border border-neon/20 bg-panelAlt/65 p-4'>
      <h3 className='text-sm uppercase text-neonDim'>{scaleLabels[scale]}</h3>
      <div className='mt-2 space-y-2'>{bucketGoals.length===0 ? <p className='text-xs text-muted'>No goals yet.</p> : bucketGoals.map((g)=>{
        const pillar=branches.find((b)=>b.id===g.pillarId);
        const isEditing = editingId===g.id;
        return <article key={g.id} className='rounded-lg border border-neon/15 bg-bg/20 p-3 text-sm space-y-2'>
          {isEditing ? <div className='grid gap-2 sm:grid-cols-2'>
            <input value={editingDraft.title} onChange={(e)=>setEditingDraft((v)=>({...v,title:e.target.value}))} className='rounded bg-bg px-2 py-1 sm:col-span-2' />
            <select value={editingDraft.pillarId} onChange={(e)=>setEditingDraft((v)=>({...v,pillarId:e.target.value}))} className='rounded bg-bg px-2 py-1'>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
            <select value={editingDraft.scale} onChange={(e)=>setEditingDraft((v)=>({...v,scale:e.target.value as Goal['scale']}))} className='rounded bg-bg px-2 py-1'>{scales.map((s)=><option key={s} value={s}>{s}</option>)}</select>
            <select value={editingDraft.status} onChange={(e)=>setEditingDraft((v)=>({...v,status:e.target.value as GoalStatus}))} className='rounded bg-bg px-2 py-1'>{statuses.map((s)=><option key={s} value={s}>{s}</option>)}</select>
            <input type='number' min={0} max={100} value={editingDraft.priorityWeight} onChange={(e)=>setEditingDraft((v)=>({...v,priorityWeight:e.target.value}))} className='rounded bg-bg px-2 py-1' placeholder='Priority weight' />
            <select value={editingDraft.scheduleBucket} onChange={(e)=>setEditingDraft((v)=>({...v,scheduleBucket:e.target.value as '' | TimelineBucket}))} className='rounded bg-bg px-2 py-1'><option value=''>No schedule bucket</option>{buckets.map((b)=><option key={b} value={b}>{b}</option>)}</select>
            <input type='date' value={editingDraft.startDate} onChange={(e)=>setEditingDraft((v)=>({...v,startDate:e.target.value}))} className='rounded bg-bg px-2 py-1' />
            <input type='date' value={editingDraft.dueDate} onChange={(e)=>setEditingDraft((v)=>({...v,dueDate:e.target.value}))} className='rounded bg-bg px-2 py-1' />
            <input value={editingDraft.currentAction} onChange={(e)=>setEditingDraft((v)=>({...v,currentAction:e.target.value}))} className='rounded bg-bg px-2 py-1 sm:col-span-2' placeholder='Current Action' />
          </div> : <>
            <p className='font-medium'>{g.title}</p>
            <p className='text-xs text-muted'>{g.scale} • {pillar?.name ?? 'Unassigned'} • {g.status}</p>
            <p className='text-xs text-neonDim'>
              {g.priorityWeight !== undefined ? `Priority ${g.priorityWeight}` : 'No priority'}
              {g.dueDate ? ` • Due ${g.dueDate}` : g.scheduleBucket ? ` • ${g.scheduleBucket}` : ''}
              {g.currentAction ? ` • Current Action: ${g.currentAction}` : ''}
            </p>
          </>}
          <div className='flex flex-wrap gap-2'>
            {isEditing ? <>
              <button onClick={()=>{updateGoal(g.id, toPayload(editingDraft)); setEditingId(null);}} className='rounded bg-neon px-2 py-1 text-xs text-bg'>Save</button>
              <button onClick={()=>setEditingId(null)} className='rounded border border-neon/40 px-2 py-1 text-xs'>Cancel</button>
            </> : <>
              <button onClick={()=>openEdit(g)} className='rounded border border-neon/40 px-2 py-1 text-xs'>Edit</button>
              <button onClick={()=>updateGoal(g.id,{status:'complete'})} className='rounded border border-neon/40 px-2 py-1 text-xs'>Mark Complete</button>
              <button onClick={()=>updateGoal(g.id,{status:g.status==='paused'?'active':'paused'})} className='rounded border border-neon/40 px-2 py-1 text-xs'>{g.status==='paused' ? 'Resume' : 'Pause'}</button>
            </>}
          </div>
        </article>;
      })}</div>
    </section>)}
  </section></Layout>;
}
