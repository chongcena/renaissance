'use client';
import Layout from '@/components/Layout';
import { useStore, getCoolDownWarning } from '@/components/store';

const stages = ['Spark', 'Ember', 'Fire', 'Blaze'];
const statuses = ['new', 'active', 'cooling', 'frozen', 'archived', 'killed'];

export default function VaultPage() {
  const { sparks, updateSpark } = useStore();
  return <Layout><h2 className="mb-4 text-xl font-semibold">Vault</h2><div className="space-y-3">{sparks.map((s)=><article key={s.id} className="rounded-xl border border-neon/20 bg-panelAlt p-4"><p className="text-xs text-muted">{s.kind} • {s.updatedAt}</p><h3 className="mt-1 font-semibold">{s.title}</h3><div className="mt-2 grid grid-cols-2 gap-2 text-sm"><select value={s.stage} onChange={(e)=>updateSpark(s.id,{stage:e.target.value as never})} className="rounded bg-bg p-2">{stages.map(x=><option key={x}>{x}</option>)}</select><select value={s.status} onChange={(e)=>updateSpark(s.id,{status:e.target.value as never})} className="rounded bg-bg p-2">{statuses.map(x=><option key={x}>{x}</option>)}</select></div>{getCoolDownWarning(s.last_touched_at,s.status)?<p className="mt-2 text-xs text-fire">{getCoolDownWarning(s.last_touched_at,s.status)}</p>:null}</article>)}</div></Layout>;
}
