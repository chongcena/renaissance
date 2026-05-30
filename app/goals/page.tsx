'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { Goal, GoalStatus, TimelineBucket } from '@/data/types';
import { getScheduledGoalsByDate } from '@/lib/logic';
import { getPillarColor, getPillarColorStyles, sectionStyles } from '@/lib/ui';

const scales: Goal['scale'][] = ['year', 'month', 'week', 'day'];
const statuses: GoalStatus[] = ['active', 'paused', 'complete'];
const buckets: TimelineBucket[] = ['today', 'tomorrow', 'this_week', 'this_month', 'later'];
const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function GoalsPage() {
  return <Suspense fallback={<Layout><h2 className='text-2xl font-semibold tracking-tight'>Goals</h2></Layout>}><GoalsContent /></Suspense>;
}

function GoalsContent() {
  const { goals, branches, createGoal, updateGoal, completeGoalCurrentAction } = useStore();
  const searchParams = useSearchParams();
  const requestedPillarId = searchParams.get('pillarId');
  const [monthOffset, setMonthOffset] = useState(0);
  const [scheduleView, setScheduleView] = useState<'calendar' | 'timeline'>('calendar');
  const [timelineBranchFilter, setTimelineBranchFilter] = useState('all');
  const today = iso(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [draft, setDraft] = useState({ title: '', pillarId: '', scale: 'week' as Goal['scale'], status: 'active' as GoalStatus, priorityWeight: 50, scheduleBucket: '' as '' | TimelineBucket, startDate: '', dueDate: '', currentAction: '' });

  useEffect(() => {
    const fallbackId = branches[0]?.id ?? '';
    const requestedValid = requestedPillarId && branches.some((b) => b.id === requestedPillarId);
    setDraft((prev) => ({ ...prev, pillarId: requestedValid ? requestedPillarId : (prev.pillarId || fallbackId) }));
  }, [branches, requestedPillarId]);

  const grouped = useMemo(() => scales.map((scale) => ({ scale, goals: goals.filter((g) => g.scale === scale) })), [goals]);

  const month = useMemo(() => {
    const base = new Date();
    const target = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + monthOffset, 1));
    const year = target.getUTCFullYear(); const mon = target.getUTCMonth();
    const first = new Date(Date.UTC(year, mon, 1));
    const days = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
    const lead = first.getUTCDay();
    const cells: Array<string | null> = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d += 1) cells.push(iso(new Date(Date.UTC(year, mon, d))));
    while (cells.length % 7 !== 0) cells.push(null);
    return { label: target.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }), cells };
  }, [monthOffset]);

  const eventsByDate = useMemo(() => getScheduledGoalsByDate(goals, today), [goals, today]);
  const selected = eventsByDate.get(selectedDate) ?? [];
  const timelineDates = useMemo(() => Array.from(eventsByDate.keys()).sort(), [eventsByDate]);
  const timelineDateSet = useMemo(() => new Set(timelineDates), [timelineDates]);
  const timelineBranches = useMemo(() => branches.filter((b) => timelineBranchFilter === 'all' || b.id === timelineBranchFilter), [branches, timelineBranchFilter]);

  return <Layout><h2 className='text-2xl font-semibold tracking-tight'>Goals</h2>
    <details className={`mt-3 ${sectionStyles.active}`} open><summary>Add Goal</summary><form className='mt-3 grid gap-2 sm:grid-cols-2' onSubmit={(e) => { e.preventDefault(); createGoal({ ...draft, scheduleBucket: draft.scheduleBucket || undefined, startDate: draft.startDate || undefined, dueDate: draft.dueDate || undefined, currentAction: draft.currentAction || undefined }); setDraft((v) => ({ ...v, title: '', currentAction: '', startDate: '', dueDate: '' })); }}><input required value={draft.title} onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))} className='rounded bg-bg px-3 py-2' placeholder='Goal title' /><select value={draft.pillarId} onChange={(e) => setDraft((v) => ({ ...v, pillarId: e.target.value }))} className='rounded bg-bg px-3 py-2'>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><select value={draft.scale} onChange={(e) => setDraft((v) => ({ ...v, scale: e.target.value as Goal['scale'] }))} className='rounded bg-bg px-3 py-2'>{scales.map((s) => <option key={s}>{s}</option>)}</select><select value={draft.status} onChange={(e) => setDraft((v) => ({ ...v, status: e.target.value as GoalStatus }))} className='rounded bg-bg px-3 py-2'>{statuses.map((s) => <option key={s}>{s}</option>)}</select><input type='number' min={0} max={100} value={draft.priorityWeight} onChange={(e)=>setDraft((v)=>({...v,priorityWeight:Number(e.target.value)}))} className='rounded bg-bg px-3 py-2' placeholder='Priority weight' /><select value={draft.scheduleBucket} onChange={(e) => setDraft((v) => ({ ...v, scheduleBucket: e.target.value as '' | TimelineBucket }))} className='rounded bg-bg px-3 py-2'><option value=''>Schedule bucket</option>{buckets.map((b) => <option key={b}>{b}</option>)}</select><input type='date' value={draft.startDate} onChange={(e) => setDraft((v) => ({ ...v, startDate: e.target.value }))} className='rounded bg-bg px-3 py-2' /><input type='date' value={draft.dueDate} onChange={(e) => setDraft((v) => ({ ...v, dueDate: e.target.value }))} className='rounded bg-bg px-3 py-2' /><input value={draft.currentAction} onChange={(e) => setDraft((v) => ({ ...v, currentAction: e.target.value }))} className='rounded bg-bg px-3 py-2 sm:col-span-2' placeholder='Current Action' /><button className='rounded bg-neon px-3 py-2 text-bg sm:col-span-2'>Save Goal</button></form></details>

    <section className={`mt-4 ${sectionStyles.schedule}`}>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h3 className='text-sm uppercase text-neonDim'>Schedule</h3>
        <div className='inline-flex rounded-lg border border-cyan-300/40 bg-bg/40 p-1 text-xs'>
          <button onClick={() => setScheduleView('calendar')} className={`rounded px-3 py-1 transition-all ${scheduleView === 'calendar' ? 'bg-cyan-300/25 text-cyan-100 shadow-[0_0_14px_rgba(103,232,249,0.28)]' : 'text-muted hover:text-cyan-100'}`}>Calendar</button>
          <button onClick={() => setScheduleView('timeline')} className={`rounded px-3 py-1 transition-all ${scheduleView === 'timeline' ? 'bg-cyan-300/25 text-cyan-100 shadow-[0_0_14px_rgba(103,232,249,0.28)]' : 'text-muted hover:text-cyan-100'}`}>Timeline</button>
        </div>
      </div>

      {scheduleView === 'calendar' ? <>
        <div className='rounded-xl border border-cyan-300/20 bg-panel/50 p-3'>
          <div className='mb-2 flex items-center justify-between'>
            <button onClick={() => setMonthOffset((v) => v - 1)} className='rounded border border-neon/30 px-2 py-1 text-xs transition hover:-translate-y-0.5 hover:border-cyan-200/70'>Previous</button>
            <p className='text-sm font-medium'>{month.label}</p>
            <button onClick={() => setMonthOffset((v) => v + 1)} className='rounded border border-neon/30 px-2 py-1 text-xs transition hover:-translate-y-0.5 hover:border-cyan-200/70'>Next</button>
          </div>
          <div className='mb-2 grid grid-cols-7 gap-2 text-center text-[11px] text-neonDim'>{weekday.map((d) => <p key={d}>{d}</p>)}</div>
          <div className='grid grid-cols-7 gap-2'>{month.cells.map((date, idx) => date ? <button key={date} onClick={() => setSelectedDate(date)} className={`min-h-20 rounded-lg border p-1 text-left text-xs transition-all hover:-translate-y-0.5 ${selectedDate === date ? 'border-amber-200 ring-1 ring-amber-200/80 shadow-[0_0_14px_rgba(251,191,36,0.35)]' : date === today ? 'border-cyan-300/80 ring-1 ring-cyan-300/40' : 'border-neon/15'} ${(eventsByDate.get(date) ?? []).length ? 'bg-panelAlt/60' : 'bg-bg/15 text-muted'}`}><p>{Number(date.slice(-2))}</p><div className='mt-1 space-y-1'>{(eventsByDate.get(date) ?? []).slice(0, 2).map((g, gIdx) => { const st = getPillarColorStyles(getPillarColor(branches.find((b) => b.id === g.pillarId))); return <p key={`${g.id}-${date}-${gIdx}`} className={`truncate rounded border px-1 ${st.calendar}`}>{g.title}</p>; })}{(eventsByDate.get(date) ?? []).length > 2 ? <p className='text-[10px] text-neonDim'>+{(eventsByDate.get(date) ?? []).length - 2} more</p> : null}</div></button> : <div key={`empty-${idx}`} className='min-h-20 rounded border border-transparent bg-transparent' />)}</div>
        </div>
        <div className='mt-3 rounded-xl border border-cyan-300/20 bg-panel/40 p-3 text-sm transition-all'>
          <p className='font-medium'>{selectedDate}</p>
          {selected.length ? <ul className='mt-2 space-y-2'>{selected.map((g, idx) => { const br = branches.find((b) => b.id === g.pillarId); const st = getPillarColorStyles(getPillarColor(br)); return <li key={`${g.id}-detail-${idx}`} className='rounded border border-neon/20 bg-bg/20 p-2'><p>{g.title}</p><p className='text-xs text-muted'>{g.scale} • {g.status}</p><p className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs ${st.chip}`}>{br?.name ?? 'Pillar'}</p>{g.currentAction ? <p className='text-xs text-neonDim'>Current Action: {g.currentAction}</p> : null}<p className='text-xs text-muted'>{g.dueDate ? `Due ${g.dueDate}` : g.scheduleBucket ? `Schedule: ${g.scheduleBucket}` : 'No schedule bucket'}</p></li>; })}</ul> : <p className='text-xs text-muted'>No scheduled goals for this day.</p>}
        </div>
      </> : <div className='rounded-xl border border-cyan-300/20 bg-panel/50 p-3'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <p className='text-xs uppercase tracking-wide text-neonDim'>Branch lanes</p>
          <select value={timelineBranchFilter} onChange={(e) => setTimelineBranchFilter(e.target.value)} className='rounded border border-cyan-300/30 bg-bg/60 px-2 py-1 text-xs'>
            <option value='all'>All</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className='overflow-x-auto'>
          <div className='min-w-[680px]'>
            <div className='mb-2 grid text-[10px] text-neonDim' style={{ gridTemplateColumns: `160px repeat(${timelineDates.length || 1}, minmax(90px, 1fr))` }}>
              <p className='px-2'>Branch</p>
              {(timelineDates.length ? timelineDates : ['No dates']).map((d) => <p key={d} className='px-2 text-center'>{d}</p>)}
            </div>
            <div className='space-y-2'>
              {timelineBranches.map((branch) => {
                const st = getPillarColorStyles(getPillarColor(branch));
                const branchGoals = goals.filter((g) => g.pillarId === branch.id && !!g.dueDate && timelineDateSet.has(g.dueDate));
                return <div key={branch.id} className={`grid items-stretch rounded-lg border bg-bg/20 ${st.border}`} style={{ gridTemplateColumns: `160px repeat(${timelineDates.length || 1}, minmax(90px, 1fr))` }}>
                  <div className='border-r border-neon/15 px-2 py-2 text-xs font-medium'>{branch.name}</div>
                  {(timelineDates.length ? timelineDates : ['No dates']).map((date) => {
                    const laneItems = branchGoals.filter((g) => g.dueDate === date);
                    return <div key={`${branch.id}-${date}`} className='min-h-16 border-l border-neon/10 p-1'>
                      <div className='space-y-1'>
                        {laneItems.map((g) => <button key={`${g.id}-${date}`} onClick={() => { setSelectedDate(date); setScheduleView('calendar'); }} className={`block w-full truncate rounded border px-1 py-0.5 text-left text-[11px] transition hover:-translate-y-0.5 ${st.calendar}`}>{g.title}</button>)}
                      </div>
                    </div>;
                  })}
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>}
    </section>

    {grouped.map(({ scale, goals: items }) => <section key={scale} className={`mt-3 ${sectionStyles.support}`}><h3 className='text-sm uppercase text-neonDim'>{scale[0].toUpperCase() + scale.slice(1)}</h3><div className='mt-2 space-y-2'>{items.map((g) => { const br = branches.find((b) => b.id === g.pillarId); const st = getPillarColorStyles(getPillarColor(br)); return <article key={g.id} className={`rounded-lg border border-neon/15 bg-bg/20 p-3 text-sm transition-all hover:-translate-y-0.5 ${st.border}`}><p className='font-medium'>{g.title}</p><p className='text-xs text-muted'>{g.scale} • {g.status}</p><div className='mt-1 flex flex-wrap gap-2 text-xs'><span className={`rounded-full border px-2 py-0.5 ${st.chip}`}>{br?.name ?? 'Pillar'}</span>{g.currentAction ? <span className='rounded-full border border-neon/20 px-2 py-0.5'>Current Action: {g.currentAction}</span> : null}{g.dueDate ? <span className='rounded-full border border-neon/20 px-2 py-0.5'>Due {g.dueDate}</span> : null}</div><div className='mt-2 flex flex-wrap gap-2 text-xs'><button onClick={() => updateGoal(g.id, { status: 'complete' })} className='rounded border border-neon/40 px-2 py-1'>Complete Goal</button>{g.currentAction ? <button onClick={() => { const next = window.prompt('Next Current Action (optional):', ''); completeGoalCurrentAction(g.id, next ?? undefined); }} className='rounded border border-emerald-300/50 px-2 py-1 text-emerald-100'>Complete Current Action</button> : null}<button onClick={() => updateGoal(g.id, { status: g.status === 'paused' ? 'active' : 'paused' })} className='rounded border border-neon/40 px-2 py-1'>{g.status === 'paused' ? 'Resume' : 'Pause'}</button></div></article>; })}</div></section>)}
  </Layout>;
}
