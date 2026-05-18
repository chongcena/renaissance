'use client';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { useMemo, useState } from 'react';
import { detectSolarFlares } from '@/lib/logic';
import { getBranchAttention, getConversionData, getHeatCalendar, getStageCounts } from '@/lib/analytics';
import { getPillarColor, getPillarColorStyles, motionStyles } from '@/lib/ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StatsPage() {
  const { actions, blazes, sparks, branches, pathways } = useStore();
  const attentionRouting = getBranchAttention(branches, actions, sparks);
  const stageCounts = getStageCounts(sparks);
  const conversion = getConversionData(sparks, pathways, blazes);
  const calendar = getHeatCalendar(actions, 120);
  const solarFlares = detectSolarFlares(sparks, pathways, blazes, actions, branches);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const outputTypeMissing = blazes.every((blaze) => !blaze.title.includes('('));
  const topCards = [
    ['Total Assets', sparks.length],
    ['Active Flames', stageCounts.Flame],
    ['Released Outputs', blazes.length],
    ['Momentum Score', actions.filter((a) => a.countsForStreak).length]
  ] as const;

  const monthView = useMemo(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const byDate = new Map(calendar.map((day) => [day.date, day]));

    const cells: Array<{ date: string; day: number; score: number; actions: string[] } | null> = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const isoDate = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
      const found = byDate.get(isoDate);
      cells.push({ date: isoDate, day, score: found?.score ?? 0, actions: found?.actions ?? [] });
    }
    return { monthLabel, cells };
  }, [calendar]);

  const selectedDay = monthView.cells.find((d) => d && d.date === selectedDate) ?? null;

  return <Layout><h2 className="mb-4 text-2xl font-semibold tracking-tight">Progress</h2><section className='mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{topCards.map(([label,val])=><article key={label} className='os-selectable rounded-xl border border-neon/20 bg-panelAlt/80 p-3'><p className='text-xs uppercase tracking-widest text-neonDim'>{label}</p><p className='mt-1 text-2xl font-semibold text-amber-100'>{val}</p></article>)}</section>
    <Section title="Pillar Focus">{attentionRouting.map((b)=>{ const st=getPillarColorStyles(getPillarColor(branches.find((br)=>br.id===b.id))); return <DualBar key={b.id} label={b.name} status={b.status} planned={b.strategicWeight} actual={b.actual} style={st} />;})}</Section>
    <Section title="Asset Flow"><div className="grid grid-cols-4 gap-2 text-center text-xs">{([{ label: 'Spark', key: 'Spark' }, { label: 'Ember', key: 'Ember' }, { label: 'Flame', key: 'Flame' }, { label: 'Blaze', key: 'Blaze' }] as const).map((item)=><div key={item.label} className="rounded border border-neon/20 p-2"><p className="text-neonDim">{item.label}</p><p className="text-xl font-semibold text-amber-100">{stageCounts[item.key]}</p></div>)}</div></Section>
    <Section title="Output Flow">{conversion.map((item)=><Bar key={item.name} label={`${item.name}: ${item.value}`} value={Math.round((item.value / Math.max(conversion[0].value,1))*100)} />)}</Section>
    <Section title="Released Output Types">{outputTypeMissing ? <Empty text="Release outputs to activate this chart." /> : <p className="text-sm text-muted">Output type data detected in released Blaze records.</p>}</Section>
    <Section title="Momentum Map">{monthView.cells.every((day)=>!day || day.score===0)?<Empty text="No meaningful creative actions logged yet."/>:<><div className='rounded-xl border border-neon/30 bg-bg/30 p-3'><div className='mb-3 flex items-center justify-between'><p className='text-sm font-semibold text-amber-100'>{monthView.monthLabel}</p></div><div className='mb-2 grid grid-cols-7 gap-2 text-center text-xs text-neonDim'>{WEEKDAYS.map((label)=><p key={label}>{label}</p>)}</div><div className='grid grid-cols-7 gap-2'>{monthView.cells.map((day, idx)=>day ? <button key={day.date} title={`${day.date}: ${day.score} action score`} onClick={()=>setSelectedDate(day.date)} className={`os-selectable h-12 rounded-lg border text-sm transition ${selectedDate===day.date ? 'border-amber-200 ring-1 ring-amber-200/80 animate-[select-pop_180ms_ease-out_1]' : 'border-neon/20'} ${day.score>0 ? 'shadow-[0_0_14px_rgba(251,146,60,0.35)]' : ''} ${day.date===new Date().toISOString().slice(0,10) ? motionStyles.activePulse : ''}`} style={{ backgroundColor: day.score===0 ? '#111827' : day.score < 3 ? '#7c2d12' : day.score < 6 ? '#c2410c' : '#f59e0b', color: day.score > 5 ? '#111827' : '#fde68a' }}>{day.day}</button> : <div key={`empty-${idx}`} className='h-12 rounded-lg border border-transparent bg-transparent' />)}</div></div>{selectedDay?<div className='mt-3 rounded-xl border border-neon/30 bg-panelAlt/85 p-3 text-sm'><p className='font-medium text-amber-100'>{selectedDay.date}</p><p className='mt-1 text-muted'>Momentum score: <span className='text-amber-100'>{selectedDay.score}</span></p><ul className='mt-2 list-disc space-y-1 pl-5 text-muted'>{selectedDay.actions.length ? selectedDay.actions.map((a,idx)=><li key={`${selectedDay.date}-${idx}`}>{a}</li>) : <li>No meaningful actions logged.</li>}</ul></div>:null}</>}</Section>
    <Section title="Schedule"><p className='text-sm text-muted'>Schedule lives in Goals.</p></Section>
    <Section title="Solar Flares">{solarFlares.length ? <ul className="space-y-2 text-sm text-muted">{solarFlares.map((flare)=><li key={flare.id} className="rounded border border-neon/20 p-2"><p className="font-medium text-amber-100">{flare.title}</p><p>{flare.evidence.join(' ')}</p></li>)}</ul> : <Empty text="No repeatable flare evidence yet." />}</Section>
    <section className="mb-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><details><summary className='cursor-pointer text-sm uppercase tracking-widest text-neonDim'>History</summary><ul className="mt-3 space-y-1 text-sm text-muted">{actions.map((a)=><li key={a.id}>{a.date} • {a.action}</li>)}</ul></details></section>
  </Layout>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-sm uppercase tracking-widest text-neonDim">{title}</h3><div className="mt-3 space-y-2">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="rounded border border-neon/20 bg-bg/50 p-3 text-sm text-muted">{text}</p>; }
function Bar({ label, value }: { label: string; value: number }) { return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div><div className="h-2 rounded bg-bg"><div className="h-2 rounded bg-amber-500 transition-[width] duration-500 ease-out" style={{width:`${Math.min(100, value)}%`}} /></div></div>; }
function DualBar({ label, status, planned, actual, style }: { label: string; status: string; planned: number; actual: number; style: ReturnType<typeof getPillarColorStyles> }) { return <div className='rounded-lg border border-neon/20 bg-bg/20 p-2'><p className="mb-1 flex items-center gap-2 text-sm"><span className={`h-2 w-2 rounded-full ${style.dot}`}></span>{label}<span className='text-xs text-muted'>{status}</span></p><div className="relative h-3 rounded bg-bg"><div className="absolute h-3 rounded bg-slate-500/45 transition-[width] duration-500 ease-out" style={{width:`${planned}%`}} /><div className={`absolute h-3 rounded ${style.dot} transition-[width] duration-500 ease-out`} style={{width:`${actual}%`}} /></div><p className="mt-1 text-xs text-muted">Planned {planned}% vs Actual {actual}%</p></div>; }
