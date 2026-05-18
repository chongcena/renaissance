'use client';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { Branch, BranchRole } from '@/data/types';
import { getBranchAttention } from '@/lib/analytics';
import { PILLAR_COLORS, getFrozenStateClasses, getPillarColor, getPillarColorStyles } from '@/lib/ui';

const ROLES: BranchRole[] = ['Driver', 'Audience Builder', 'Strategic Flagship', 'Maintenance', 'Support'];

export default function PillarsPage() {
  const { branches, goals, createGoal, createBranch, updateBranch, actions, sparks } = useStore();
  const [name, setName] = useState(''); const [focus, setFocus] = useState(''); const [strategicWeight, setStrategicWeight] = useState(20); const [role, setRole] = useState<BranchRole>('Support'); const [color, setColor] = useState<(typeof PILLAR_COLORS)[number]>('gold');
  const [editing, setEditing] = useState<string | null>(null); const [draft, setDraft] = useState<Partial<Branch>>({});
  const branchAttention = useMemo(() => getBranchAttention(branches, actions, sparks), [branches, actions, sparks]);
  return <Layout><h2 className="mb-4 text-xl font-semibold">Creative Pillars</h2>
    <form className="mb-4 grid gap-2 rounded-xl border border-neon/40 bg-panelAlt/80 p-4 sm:grid-cols-2" onSubmit={(e)=>{e.preventDefault();if(!createBranch({name,focus,strategicWeight,role,color})) return; setName('');setFocus('');setStrategicWeight(20);setRole('Support');setColor('gold');}}>
      <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Pillar name" required />
      <input value={focus} onChange={(e)=>setFocus(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Pillar focus" />
      <select value={role} onChange={(e)=>setRole(e.target.value as BranchRole)} className="rounded bg-bg px-3 py-2">{ROLES.map((r)=><option key={r} value={r}>{r}</option>)}</select>
      <input type="number" min={0} max={100} value={strategicWeight} onChange={(e)=>setStrategicWeight(Number(e.target.value))} className="rounded bg-bg px-3 py-2" placeholder="Priority Weight" />
      <select value={color} onChange={(e)=>setColor(e.target.value as any)} className='rounded bg-bg px-3 py-2'>{PILLAR_COLORS.map((c)=><option key={c} value={c}>{c}</option>)}</select>
      <button className="rounded bg-neon px-4 py-2 font-semibold text-bg">Add Pillar</button>
    </form>
    <div className="grid gap-3 sm:grid-cols-2">{branches.map((branch) => {const st=getPillarColorStyles(getPillarColor(branch)); const attention = branchAttention.find((item) => item.id === branch.id); const isEditing = editing === branch.id;
      return <article key={branch.id} className={`relative overflow-hidden rounded-xl border p-4 pl-5 ${branch.frozen ? getFrozenStateClasses(true) : `${st.border} ${st.card} ${st.glow}`}`}><span className={`absolute inset-y-0 left-0 w-1.5 ${branch.frozen ? 'bg-cyan-300' : st.rail}`} /><div className={`pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-r ${branch.frozen ? 'from-cyan-300/25 to-transparent' : st.topAccent}`} /><h3 className="relative flex items-center gap-2 text-lg font-semibold"><span className={`inline-block h-2.5 w-2.5 rounded-full ${branch.frozen ? 'bg-cyan-200' : st.dot}`} />{isEditing ? <input value={(draft.name ?? branch.name)} onChange={(e)=>setDraft((d)=>({ ...d, name: e.target.value }))} className="w-full rounded bg-bg px-2 py-1" /> : branch.name}</h3>
      <p className='mt-1 text-xs text-muted'>{isEditing?<select value={(draft.color ?? branch.color ?? 'neutral')} onChange={(e)=>setDraft((d)=>({...d,color:e.target.value as any}))} className='rounded bg-bg px-2 py-1'>{PILLAR_COLORS.map((c)=><option key={c}>{c}</option>)}</select>:<span className={`inline-flex rounded-full border px-2 py-0.5 ${st.chip}`}>{branch.role}</span>}</p>
      <p className="mt-1 text-xs text-neonDim">Pillar Focus: {isEditing ? <select value={(draft.role ?? branch.role)} onChange={(e)=>setDraft((d)=>({ ...d, role: e.target.value as BranchRole }))} className="ml-2 rounded bg-bg px-2 py-1 text-xs">{ROLES.map((r)=><option key={r} value={r}>{r}</option>)}</select> : branch.role}</p>
      <div className='mt-2 grid grid-cols-2 gap-2 text-xs'><p className='rounded border border-neon/20 px-2 py-1'>Strategic Weight <span className='ml-1 text-amber-100'>{branch.strategicWeight}%</span></p><p className='rounded border border-neon/20 px-2 py-1'>Actual Attention <span className='ml-1 text-amber-100'>{attention?.actual ?? 0}%</span></p></div><p className='mt-2 text-xs'><span className={`rounded-full border px-2 py-0.5 ${branch.frozen ? 'border-cyan-300/50 bg-cyan-300/20 text-cyan-100' : 'border-emerald-300/50 bg-emerald-300/20 text-emerald-100'}`}>{branch.frozen ? 'Frozen' : 'Active'}</span></p>
      <div className="mt-3 flex gap-2">{isEditing ? <><button onClick={()=>{updateBranch(branch.id, draft); setEditing(null); setDraft({});}} className="rounded bg-neon px-3 py-1 text-xs font-semibold text-bg">Save</button><button onClick={()=>{setEditing(null); setDraft({});}} className="rounded border border-neon/40 px-3 py-1 text-xs">Cancel</button></> : <button onClick={()=>{setEditing(branch.id); setDraft(branch);}} className="rounded border border-neon/40 px-3 py-1 text-xs">Edit Pillar</button>}<button onClick={()=>updateBranch(branch.id,{frozen:!branch.frozen})} className="rounded border border-neon/40 px-3 py-1 text-xs">{branch.frozen ? 'Set Active' : 'Freeze Pillar'}</button><button onClick={()=>createGoal({title:`${branch.name} Goal`, pillarId:branch.id, status:'active', scale:'month'})} className='rounded border border-neon/40 px-2 py-1 text-xs'>Add Goal</button></div></article>;})}</div></Layout>;
}
