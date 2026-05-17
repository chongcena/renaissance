'use client';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { BranchRole } from '@/data/types';

const ROLES: BranchRole[] = ['Driver', 'Audience Builder', 'Strategic Flagship', 'Maintenance', 'Support'];

export default function BranchesPage() {
  const { branches, createBranch, updateBranch, actions, sparks } = useStore();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [strategicWeight, setStrategicWeight] = useState(20);
  const [role, setRole] = useState<BranchRole>('Support');
  const [tags, setTags] = useState('');

  const totalWeight = branches.filter((b) => !b.frozen).reduce((sum, b) => sum + b.strategicWeight, 0);
  const weightWarning = totalWeight > 100 ? `Strategic weights total ${totalWeight}%. Reduce allocation.` : totalWeight < 100 ? `Strategic weights total ${totalWeight}%. Assign remaining ${100 - totalWeight}%.` : null;

  const branchAttention = useMemo(() => {
    const actionable = actions.filter((a) => a.countsForStreak);
    const total = actionable.length;
    return branches.map((branch) => {
      const count = actionable.filter((a) => {
        if (a.branchId) return a.branchId === branch.id;
        if (a.sparkId) return sparks.find((s) => s.id === a.sparkId)?.branchId === branch.id;
        return false;
      }).length;
      const actual = total ? Math.round((count / total) * 100) : 0;
      const delta = actual - branch.strategicWeight;
      const status = delta > 8 ? 'Over-consuming' : delta < -8 ? 'Underfed' : 'Balanced';
      return { id: branch.id, actual, status };
    });
  }, [actions, branches, sparks]);

  return <Layout><h2 className="mb-4 text-xl font-semibold">Branches</h2>
    <p className="mb-2 text-sm text-ember">Strategic Weight Used: {totalWeight}%</p>
    {weightWarning && <p className="mb-4 rounded border border-fire/50 bg-fire/10 p-2 text-sm text-fire">{weightWarning}</p>}
    <form className="mb-4 grid gap-2 rounded-xl border border-neon/40 bg-panelAlt/85 p-4 sm:grid-cols-2" onSubmit={(e)=>{e.preventDefault();if(!createBranch({name,focus,strategicWeight,role,tags:tags.split(',').map(x=>x.trim())})) return; setName('');setFocus('');setTags('');setStrategicWeight(20);setRole('Support');}}>
      <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Branch name" required />
      <input value={focus} onChange={(e)=>setFocus(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Focus / description" />
      <select value={role} onChange={(e)=>setRole(e.target.value as BranchRole)} className="rounded bg-bg px-3 py-2">{ROLES.map((r)=><option key={r} value={r}>{r}</option>)}</select>
      <input type="number" min={0} max={100} value={strategicWeight} onChange={(e)=>setStrategicWeight(Number(e.target.value))} className="rounded bg-bg px-3 py-2" placeholder="Strategic Weight %" />
      <input value={tags} onChange={(e)=>setTags(e.target.value)} className="rounded bg-bg px-3 py-2 sm:col-span-2" placeholder="Value tags (comma-separated)" />
      <button className="rounded bg-neon px-4 py-2 font-semibold text-bg sm:col-span-2">Add Branch</button>
    </form>
    <div className="grid gap-3 sm:grid-cols-2">{branches.map((b) => {
      const attention = branchAttention.find((x) => x.id === b.id);
      return <article key={b.id} className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-lg font-semibold">{b.name}</h3><p className="text-sm text-muted">{b.focus || 'No focus yet.'}</p><p className="mt-2 text-xs text-neonDim">Role: {b.role}</p><p className="text-sm text-fire">Strategic Weight: {b.strategicWeight}%</p><p className="text-sm text-amber-200">Actual Attention: {attention?.actual ?? 0}%</p><p className="text-xs text-muted">Alignment: {attention?.status ?? 'Balanced'}</p><input value={b.focus} onChange={(e)=>updateBranch(b.id,{focus:e.target.value})} className="mt-2 w-full rounded bg-bg px-2 py-1 text-sm"/><div className="mt-2 flex gap-2"><button onClick={()=>updateBranch(b.id,{frozen:!b.frozen})} className="rounded border border-neon/40 px-2 py-1 text-xs">{b.frozen?'Unfreeze':'Freeze'}</button><label className="text-xs text-muted">Weight % <input type="number" min={0} max={100} value={b.strategicWeight} onChange={(e)=>updateBranch(b.id,{strategicWeight:Number(e.target.value)})} className="ml-2 w-16 rounded bg-bg px-1 py-1"/></label><select value={b.role} onChange={(e)=>updateBranch(b.id,{role:e.target.value as BranchRole})} className="rounded bg-bg px-2 py-1 text-xs">{ROLES.map((r)=><option key={r} value={r}>{r}</option>)}</select></div></article>;
    })}</div></Layout>;
}
