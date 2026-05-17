'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function SparkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { branches, sparks, pathways, blazes, actions, addPathway, updatePathway, releaseBlaze, routeSpark, activateFire, freezeSpark, archiveSpark, killSpark } = useStore();
  const [lane, setLane] = useState('');

  const spark = sparks.find((s) => s.id === id);
  const routes = pathways.filter((p) => p.sparkId === id);
  const sparkBlazes = blazes.filter((b) => b.sparkId === id);
  const sparkActions = actions.filter((a) => a.action.includes(id) || a.action.includes(spark?.title ?? ''));

  const branch = branches.find((b) => b.id === spark?.branchId);
  const condition = spark?.status === 'cooling' ? 'Cooling' : spark?.status === 'frozen' ? 'Frozen' : 'Healthy';
  const nextMove = routes[0]?.lane ? `Develop pathway: ${routes[0].lane}` : 'Add a pathway move';
  const valueTags = useMemo(() => (spark?.notes?.match(/#[\w-]+/g) ?? []), [spark?.notes]);

  if (!spark) {
    return (
      <Layout>
        <section className="rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold">Spark not found</h2>
          <p className="mt-2 text-sm text-muted">This Spark ID does not exist in local state.</p>
          <Link href="/vault" className="mt-4 inline-block rounded bg-neon px-4 py-2 font-semibold text-bg">Back to Vault</Link>
        </section>
      </Layout>
    );
  }

  return <Layout><h2 className="text-xl font-semibold">Spark Detail • {spark.id}</h2><article className="mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-4"><h3 className="mt-1 text-lg font-semibold">{spark.title.trim() || 'Untitled Spark'}</h3><p className="text-xs text-muted">{spark.stage} • {spark.status}</p><p className="mt-3 text-sm text-muted">{spark.notes || 'No description/notes yet.'}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-muted">Type</dt><dd>{spark.kind}</dd></div><div><dt className="text-muted">Branch</dt><dd>{branch?.name ?? spark.branchId}</dd></div><div><dt className="text-muted">Lifecycle Stage</dt><dd>{spark.stage}</dd></div><div><dt className="text-muted">Status</dt><dd>{spark.status}</dd></div><div><dt className="text-muted">Condition</dt><dd>{condition}</dd></div><div><dt className="text-muted">Heat Score</dt><dd>{spark.heatScore}</dd></div><div className="col-span-2"><dt className="text-muted">Next Move</dt><dd>{nextMove}</dd></div><div className="col-span-2"><dt className="text-muted">Value Tags</dt><dd>{valueTags.length ? valueTags.join(', ') : 'No value tags yet (add #tags in notes).'}</dd></div></dl><div className="mt-2 flex flex-wrap gap-2"><button className="rounded bg-bg px-3 py-1" onClick={()=>routeSpark(spark.id)}>Route → Ember</button><button className="rounded bg-bg px-3 py-1" onClick={()=>activateFire(spark.id)}>Activate Fire</button><button className="rounded bg-bg px-3 py-1" onClick={()=>freezeSpark(spark.id)}>Freeze</button><button className="rounded bg-bg px-3 py-1" onClick={()=>archiveSpark(spark.id)}>Archive</button><button className="rounded bg-bg px-3 py-1" onClick={()=>killSpark(spark.id)}>Kill</button><button className="rounded bg-neon px-3 py-1 text-bg" onClick={()=>releaseBlaze(spark.id,`${spark.title} Release`)}>Release Blaze</button></div></article>
  <section className="mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-4"><h4 className="text-sm uppercase tracking-wider text-neonDim">Pathways</h4><p className="mt-1 text-xs text-muted">Pathway rows are expandable via native details panels.</p><div className="mt-2 flex gap-2"><input value={lane} onChange={(e)=>setLane(e.target.value)} placeholder="New pathway lane" className="flex-1 rounded bg-bg p-2"/><button className="rounded bg-neon px-3 text-bg" onClick={()=>{if(lane){addPathway(spark.id,lane);setLane('');}}}>Add</button></div><ul className="mt-3 space-y-2 text-sm">{routes.map((r)=><li key={r.id} className="rounded border border-neon/40 p-2"><details><summary className="cursor-pointer">{r.lane} • {r.confidence}% confidence</summary><div className="mt-2 flex gap-2"><button className="rounded bg-bg px-2 py-1" onClick={()=>updatePathway(r.id,{status:'frozen'})}>Freeze</button><button className="rounded bg-bg px-2 py-1" onClick={()=>updatePathway(r.id,{confidence:Math.min(100,r.confidence+5)})}>+Confidence</button></div></details></li>)}</ul></section>
  <section className="mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-4"><h4 className="text-sm uppercase tracking-wider text-neonDim">Blaze Logs</h4><ul className="mt-3 space-y-2 text-sm">{sparkBlazes.length ? sparkBlazes.map((b) => <li key={b.id} className="rounded border border-neon/40 p-2"><p>{b.title} • {b.releasedAt}</p><Link className="text-xs text-neon hover:underline" href={`/spark/${b.sparkId}`}>Open source Spark</Link></li>) : <li className="text-muted">No Blaze Logs yet.</li>}</ul></section>
  <section className="mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 backdrop-blur-sm p-4"><h4 className="text-sm uppercase tracking-wider text-neonDim">Action Log History</h4><ul className="mt-3 space-y-2 text-sm">{sparkActions.length ? sparkActions.map((a) => <li key={a.id} className="rounded border border-neon/40 p-2">{a.date} • {a.action_type} • {a.action}</li>) : <li className="text-muted">No Spark-specific actions logged yet.</li>}</ul></section></Layout>;
}
