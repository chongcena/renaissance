'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function SparkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { branches, sparks, pathways, blazes, actions, addPathway, updatePathway, releaseBlaze, routeSpark, activateFire, freezeSpark, archiveSpark, killSpark } = useStore();
  const [lane, setLane] = useState('');
  const [feedback, setFeedback] = useState('');
  const spark = sparks.find((s) => s.id === id);
  if (!spark) return <Layout><p>Spark not found. <Link href='/vault' className='text-neon'>Back</Link></p></Layout>;
  const routes = pathways.filter((p) => p.sparkId === id);
  const sparkBlazes = blazes.filter((b) => b.sparkId === id);
  const sparkActions = actions.filter((a) => a.action.includes(id) || a.action.includes(spark.title));
  const branch = branches.find((b) => b.id === spark.branchId);
  const actionsButtons: { label: string; run: () => void }[] = [
    { label: 'Route to Ember', run: () => { routeSpark(spark.id); setFeedback('Spark routed to Ember.'); } },
    { label: 'Activate Fire', run: () => { activateFire(spark.id); setFeedback('Spark activated in Fire stage.'); } },
    { label: 'Release Blaze', run: () => { releaseBlaze(spark.id, `${spark.title} Release`); setFeedback('Blaze released and Burner earned.'); } },
    { label: 'Freeze', run: () => { freezeSpark(spark.id); setFeedback('Spark frozen.'); } },
    { label: 'Archive', run: () => { archiveSpark(spark.id); setFeedback('Spark archived.'); } },
    { label: 'Kill', run: () => { killSpark(spark.id); setFeedback('Spark killed.'); } }
  ];

  return <Layout><h2 className='text-xl font-semibold'>Spark Command Hub</h2>{feedback?<p className='mt-2 rounded border border-neon/40 p-2 text-sm text-neon'>{feedback}</p>:null}
    <article className='mt-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4'><h3 className='text-lg font-semibold'>{spark.title}</h3><p className='text-xs text-muted'>{spark.kind} • {branch?.name ?? spark.branchId}</p><p className='mt-2 text-sm'>{spark.notes || 'No notes yet.'}</p>
    <dl className='mt-3 grid grid-cols-2 gap-2 text-sm'><div><dt className='text-muted'>Stage</dt><dd>{spark.stage}</dd></div><div><dt className='text-muted'>Status</dt><dd>{spark.status}</dd></div><div><dt className='text-muted'>Heat Score</dt><dd>{spark.heatScore}</dd></div><div><dt className='text-muted'>Next Move</dt><dd>{spark.nextMove || 'No next move set.'}</dd></div></dl>
    <div className='mt-3 flex flex-wrap gap-2'>{actionsButtons.map((item)=><button key={item.label} onClick={item.run} className='rounded border border-neon/40 bg-bg px-3 py-1 text-sm'>{item.label}</button>)}</div></article>
    <section className='mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 p-4'><h4 className='text-sm uppercase text-neonDim'>Pathways</h4><div className='mt-2 flex gap-2'><input value={lane} onChange={(e)=>setLane(e.target.value)} placeholder='New pathway lane/title' className='flex-1 rounded bg-bg p-2'/><button className='rounded bg-neon px-3 text-bg' onClick={()=>{if(lane.trim()){addPathway(spark.id,lane.trim());setFeedback('Pathway added.');setLane('');}}}>Create Pathway</button></div><ul className='mt-3 space-y-2'>{routes.length?routes.map((r)=><li key={r.id} className='rounded border border-neon/40 p-3 text-sm'><p className='font-medium'>{r.lane}</p><p className='text-xs text-muted'>Status: {r.status} • Confidence: {r.confidence}% • Next Move: {spark.nextMove||'None'}</p><button onClick={()=>updatePathway(r.id,{status:r.status==='active'?'cooling':'active'})} className='mt-2 rounded border border-neon/40 px-2 py-1 text-xs'>Toggle active/cooling</button></li>):<li className='text-sm text-muted'>No pathways yet.</li>}</ul></section>
    <section className='mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 p-4'><h4 className='text-sm uppercase text-neonDim'>Blaze Logs</h4><ul className='mt-2 text-sm'>{sparkBlazes.length?sparkBlazes.map((b)=><li key={b.id}>{b.releasedAt} • {b.title}</li>):<li className='text-muted'>No Blaze Logs yet.</li>}</ul></section>
    <section className='mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 p-4'><h4 className='text-sm uppercase text-neonDim'>Action Log</h4><ul className='mt-2 text-sm'>{sparkActions.length?sparkActions.map((a)=><li key={a.id}>{a.date} • {a.action_type} • {a.action}</li>):<li className='text-muted'>No actions yet.</li>}</ul></section>
  </Layout>;
}
