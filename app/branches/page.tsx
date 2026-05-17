'use client';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { Branch, BranchRole } from '@/data/types';
import { getBranchAttention } from '@/lib/analytics';

const ROLES: BranchRole[] = ['Driver', 'Audience Builder', 'Strategic Flagship', 'Maintenance', 'Support'];

export default function BranchesPage() {
  const { branches, createBranch, updateBranch, actions, sparks } = useStore();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [strategicWeight, setStrategicWeight] = useState(20);
  const [role, setRole] = useState<BranchRole>('Support');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Branch>>({});

  const totalWeight = branches.filter((b) => !b.frozen).reduce((sum, b) => sum + b.strategicWeight, 0);
  const weightWarning = totalWeight > 100 ? `Strategic weights total ${totalWeight}%. Rebalance attention allocations.` : totalWeight < 100 ? `Strategic weights total ${totalWeight}%. Allocate the remaining ${100 - totalWeight}%.` : null;
  const branchAttention = useMemo(() => getBranchAttention(branches, actions, sparks), [branches, actions, sparks]);

  return <Layout><h2 className="mb-4 text-xl font-semibold">Branches Operating Board</h2>
    <p className="mb-2 text-sm text-ember">Strategic Weight Used: {totalWeight}%</p>
    {weightWarning && <p className="mb-4 rounded border border-fire/50 bg-fire/10 p-2 text-sm text-fire">{weightWarning}</p>}
    <form className="mb-4 grid gap-2 rounded-xl border border-neon/40 bg-panelAlt/85 p-4 sm:grid-cols-2" onSubmit={(e)=>{e.preventDefault();if(!createBranch({name,focus,strategicWeight,role})) return; setName('');setFocus('');setStrategicWeight(20);setRole('Support');}}>
      <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Branch name" required />
      <input value={focus} onChange={(e)=>setFocus(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Focus / description" />
      <select value={role} onChange={(e)=>setRole(e.target.value as BranchRole)} className="rounded bg-bg px-3 py-2">{ROLES.map((r)=><option key={r} value={r}>{r}</option>)}</select>
      <input type="number" min={0} max={100} value={strategicWeight} onChange={(e)=>setStrategicWeight(Number(e.target.value))} className="rounded bg-bg px-3 py-2" placeholder="Strategic Weight %" />
      <button className="rounded bg-neon px-4 py-2 font-semibold text-bg sm:col-span-2">Add Branch</button>
    </form>
    <div className="grid gap-3 sm:grid-cols-2">{branches.map((branch) => {
      const attention = branchAttention.find((item) => item.id === branch.id);
      const isEditing = editing === branch.id;
      return <article key={branch.id} className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-lg font-semibold">{isEditing ? <input value={(draft.name ?? branch.name)} onChange={(e)=>setDraft((d)=>({ ...d, name: e.target.value }))} className="w-full rounded bg-bg px-2 py-1" /> : branch.name}</h3>
        <p className="mt-1 text-xs text-neonDim">Role: {isEditing ? <select value={(draft.role ?? branch.role)} onChange={(e)=>setDraft((d)=>({ ...d, role: e.target.value as BranchRole }))} className="ml-2 rounded bg-bg px-2 py-1 text-xs">{ROLES.map((r)=><option key={r} value={r}>{r}</option>)}</select> : branch.role}</p>
        <p className="mt-2 text-sm text-fire">Strategic Weight: {isEditing ? <input type="number" min={0} max={100} value={(draft.strategicWeight ?? branch.strategicWeight)} onChange={(e)=>setDraft((d)=>({ ...d, strategicWeight: Number(e.target.value) }))} className="ml-2 w-20 rounded bg-bg px-2 py-1" /> : `${branch.strategicWeight}%`}</p>
        <p className="text-sm text-amber-200">Actual Attention: {attention?.actual ?? 0}%</p><p className="text-xs text-muted">Alignment: {attention?.status ?? 'balanced'}</p>
        <p className="mt-2 text-sm text-muted">{isEditing ? <input value={(draft.focus ?? branch.focus)} onChange={(e)=>setDraft((d)=>({ ...d, focus: e.target.value }))} className="w-full rounded bg-bg px-2 py-1" /> : branch.focus || 'No focus set yet.'}</p>
        <div className="mt-3 flex flex-wrap gap-2">{isEditing ? <><button onClick={()=>{updateBranch(branch.id, draft); setEditing(null); setDraft({});}} className="rounded bg-neon px-3 py-1 text-xs font-semibold text-bg">Save</button><button onClick={()=>{setEditing(null); setDraft({});}} className="rounded border border-neon/40 px-3 py-1 text-xs">Cancel</button></> : <button onClick={()=>{setEditing(branch.id); setDraft(branch);}} className="rounded border border-neon/40 px-3 py-1 text-xs">Edit</button>}<button onClick={()=>updateBranch(branch.id,{frozen:!branch.frozen})} className="rounded border border-neon/40 px-3 py-1 text-xs">{branch.frozen ? 'Set Active' : 'Freeze'}</button></div>
      </article>;
    })}</div></Layout>;
}
