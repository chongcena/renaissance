'use client';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function SparkDetailPage() {
  const { branches, sparks, pathways, addPathway, updatePathway, releaseBlaze, routeSpark, activateFire, freezeSpark, archiveSpark, killSpark } = useStore();
  const spark = sparks[0];
  const routes = pathways.filter((p) => p.sparkId === spark?.id);
  const [lane, setLane] = useState('');
  if (!spark) return <Layout>No sparks yet.</Layout>;
  const branch = branches.find((b) => b.id === spark.branchId);
  const condition = spark.status === 'cooling' ? 'Cooling' : spark.status === 'frozen' ? 'Frozen' : 'Healthy';
  const nextMove = routes[0]?.lane ? `Develop pathway: ${routes[0].lane}` : 'Add a pathway move';

  return <Layout><h2 className="text-xl font-semibold">Spark Detail</h2><article className="mt-4 rounded-xl border border-neon/20 bg-panelAlt p-4"><h3 className="mt-1 text-lg font-semibold">{spark.title.trim() || 'Untitled Spark'}</h3><p className="text-xs text-muted">{spark.stage} • {spark.status}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-muted">Type</dt><dd>{spark.kind}</dd></div><div><dt className="text-muted">Branch</dt><dd>{branch?.name ?? spark.branchId}</dd></div><div><dt className="text-muted">Lifecycle Stage</dt><dd>{spark.stage}</dd></div><div><dt className="text-muted">Status</dt><dd>{spark.status}</dd></div><div><dt className="text-muted">Condition</dt><dd>{condition}</dd></div><div><dt className="text-muted">Heat Score</dt><dd>{spark.heatScore}</dd></div><div className="col-span-2"><dt className="text-muted">Next Move</dt><dd>{nextMove}</dd></div></dl><div className="mt-2 flex flex-wrap gap-2"><button className="rounded bg-bg px-3 py-1" onClick={()=>routeSpark(spark.id)}>Route → Ember</button><button className="rounded bg-bg px-3 py-1" onClick={()=>activateFire(spark.id)}>Activate Fire</button><button className="rounded bg-bg px-3 py-1" onClick={()=>freezeSpark(spark.id)}>Freeze</button><button className="rounded bg-bg px-3 py-1" onClick={()=>archiveSpark(spark.id)}>Archive</button><button className="rounded bg-bg px-3 py-1" onClick={()=>killSpark(spark.id)}>Kill</button><button className="rounded bg-neon px-3 py-1 text-black" onClick={()=>releaseBlaze(spark.id,`${spark.title} Release`)}>Release Blaze</button></div></article>
  <section className="mt-4 rounded-xl border border-neon/20 bg-panelAlt p-4"><h4 className="text-sm uppercase tracking-wider text-neonDim">Pathways</h4><div className="mt-2 flex gap-2"><input value={lane} onChange={(e)=>setLane(e.target.value)} placeholder="New pathway lane" className="flex-1 rounded bg-bg p-2"/><button className="rounded bg-neon px-3 text-black" onClick={()=>{if(lane){addPathway(spark.id,lane);setLane('');}}}>Add</button></div><ul className="mt-3 space-y-2 text-sm">{routes.map((r)=><li key={r.id} className="rounded border border-neon/20 p-2"><div className="flex justify-between"><span>{r.lane}</span><span>{r.confidence}%</span></div><div className="mt-2 flex gap-2"><button className="rounded bg-bg px-2 py-1" onClick={()=>updatePathway(r.id,{status:'frozen'})}>Freeze</button><button className="rounded bg-bg px-2 py-1" onClick={()=>updatePathway(r.id,{confidence:Math.min(100,r.confidence+5)})}>+Confidence</button></div></li>)}</ul></section></Layout>;
}
