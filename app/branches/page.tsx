'use client';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function BranchesPage() {
  const { branches, createBranch, updateBranch } = useStore();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [heatScore, setHeatScore] = useState(60);
  const [tags, setTags] = useState('');

  return <Layout><h2 className="mb-4 text-xl font-semibold">Branches</h2>
    <form className="mb-4 grid gap-2 rounded-xl border border-neon/40 bg-panelAlt/85 p-4 sm:grid-cols-2" onSubmit={(e)=>{e.preventDefault();if(!createBranch({name,focus,heatScore,tags:tags.split(',').map(x=>x.trim())})) return; setName('');setFocus('');setTags('');setHeatScore(60);}}>
      <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Branch name" required />
      <input value={focus} onChange={(e)=>setFocus(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Focus / description" />
      <input type="number" min={0} max={100} value={heatScore} onChange={(e)=>setHeatScore(Number(e.target.value))} className="rounded bg-bg px-3 py-2" placeholder="Heat score" />
      <input value={tags} onChange={(e)=>setTags(e.target.value)} className="rounded bg-bg px-3 py-2" placeholder="Role tags (comma-separated)" />
      <button className="rounded bg-neon px-4 py-2 font-semibold text-bg sm:col-span-2">Add Branch</button>
    </form>
    <div className="grid gap-3 sm:grid-cols-2">{branches.map((b) => <article key={b.id} className="rounded-xl border border-neon/40 bg-panelAlt/85 p-4"><h3 className="text-lg font-semibold">{b.name}</h3><p className="text-sm text-muted">{b.focus || 'No focus yet.'}</p><p className="mt-2 text-sm text-fire">Heat Score {b.heatScore}</p><input value={b.focus} onChange={(e)=>updateBranch(b.id,{focus:e.target.value})} className="mt-2 w-full rounded bg-bg px-2 py-1 text-sm"/><div className="mt-2 flex gap-2"><button onClick={()=>updateBranch(b.id,{frozen:!b.frozen})} className="rounded border border-neon/40 px-2 py-1 text-xs">{b.frozen?'Unfreeze':'Freeze'}</button><button onClick={()=>updateBranch(b.id,{heatScore:Math.min(100,b.heatScore+5)})} className="rounded border border-neon/40 px-2 py-1 text-xs">+Heat</button></div></article>)}</div></Layout>;
}
