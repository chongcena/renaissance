'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { deriveSparkLifecycle } from '@/lib/logic';
import { useStore } from '@/components/store';
import { derivePriorityChip, getFrozenStateClasses, getPillarColor, getPillarColorStyles, getPriorityChipStyle } from '@/lib/ui';

type AnalysisPathway = { title: string; outputType: string; reason: string; suggestedNextMove: string };
type AnalysisResult = {
  summary: string;
  suggestedKind: string;
  suggestedBranchName: string;
  suggestedStage: 'Spark' | 'Ember' | 'Flame' | 'Blaze';
  suggestedValueTags: string[];
  suggestedPathways: AnalysisPathway[];
  suggestedNextMove: string;
  confidenceNotes: string;
  usedFallback?: boolean;
};

export default function SparkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { branches, sparks, attachments, pathways, blazes, actions, addPathway, updatePathway, releaseBlaze, freezeSpark, updateSpark, addSparkAttachments, removeSparkAttachment, addActionLog } = useStore();
  const [lane, setLane] = useState('');
  const [currentActionInput, setNextMoveInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [pathwayDrafts, setPathwayDrafts] = useState<Record<number, string>>({});
  const [currentActionDraft, setNextMoveDraft] = useState('');
  const [branchSelection, setBranchSelection] = useState('');
  const [outputTitle, setOutputTitle] = useState('');
  const [outputType, setOutputType] = useState('song');
  const [releasePathwayId, setReleasePathwayId] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [draft, setDraft] = useState({ title: '', kind: '', branchId: '', notes: '', currentAction: '', status: 'new', stage: 'Spark' });

  const spark = sparks.find((s) => s.id === id);
  if (!spark) return <Layout><p>Spark not found. <Link href='/vault' className='text-neon'>Back</Link></p></Layout>;

  const routes = pathways.filter((p) => p.sparkId === id);
  const sparkBlazes = blazes.filter((b) => b.sparkId === id);
  const branch = branches.find((b) => b.id === spark.branchId);
  const priority = derivePriorityChip(spark, []);
  const pillarStyle = getPillarColorStyles(getPillarColor(branch));
  const sparkAttachments = attachments.filter((a) => a.sparkId === spark.id);
  const lifecycle = deriveSparkLifecycle(spark, pathways, blazes);

  const startEdit = () => {
    setDraft({ title: spark.title, kind: spark.kind, branchId: spark.branchId, notes: spark.notes ?? '', currentAction: spark.currentAction ?? '', status: spark.status, stage: spark.stage });
    setEditing(true);
  };

  const analyzeSpark = async () => {
    setAnalysisLoading(true);
    setAnalysisError('');
    try {
      const res = await fetch('/api/analyze-spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: spark.title,
          kind: spark.kind,
          notes: spark.notes,
          branchName: branch?.name,
          attachments: sparkAttachments.map((a) => ({ fileName: a.name, mimeType: a.mimeType, attachmentType: a.type, size: a.size })),
          existingPathways: routes.map((r) => ({ title: r.title, outputType: r.outputType })),
          existingNextMove: spark.currentAction,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as AnalysisResult;
      setAnalysis(data);
      setNextMoveDraft(data.suggestedNextMove || '');
      setPathwayDrafts(Object.fromEntries((data.suggestedPathways || []).map((p, i) => [i, p.title])));
      setBranchSelection('');
    } catch {
      setAnalysisError('Could not analyze asset right now. Try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return <Layout>
    <h2 className='text-xl font-semibold'>Asset Profile / Quest Hub</h2>

    <section className={`mt-3 rounded-xl border-2 bg-panelAlt/90 p-5 ${pillarStyle.border} ${spark.status === 'frozen' ? getFrozenStateClasses(true) : pillarStyle.glow} ${pillarStyle.softBg}`}>
      <p className='text-xs uppercase tracking-wide text-muted'>{spark.kind}</p>
      <h3 className='mt-1 flex items-center gap-2 text-2xl font-semibold'>
        <span className={`h-2.5 w-2.5 rounded-full ${pillarStyle.dot}`}></span>{spark.title}
      </h3>
      <div className='mt-3 flex flex-wrap gap-2 text-xs'>
        <span className={`rounded-full border px-2 py-0.5 ${pillarStyle.chip}`}>{branch?.name ?? 'Pillar'}</span>
        <span className='rounded-full border border-neon/30 px-2 py-0.5'>{spark.stage}</span>
        <span className={`rounded-full border px-2 py-0.5 ${getPriorityChipStyle(priority)}`}>{priority}</span>
        <span className='rounded-full border border-neon/30 px-2 py-0.5 capitalize'>{spark.status}</span>
      </div>
      <p className='mt-2 text-xs text-neonDim'>{lifecycle.reason}</p>
      <p className='mt-1 text-sm text-neonDim'>Current Action: {spark.currentAction || 'Set a Current Action to move this asset forward.'}</p>
      <div className='mt-4 flex flex-wrap gap-2'>
        <button onClick={startEdit} className='rounded border border-neon/40 bg-bg px-3 py-1.5 text-xs'>Edit Asset</button>
        <button onClick={() => setFeedback('Use Current Action below to update focus.')} className='rounded border border-neon/40 bg-bg px-3 py-1.5 text-xs'>Set Action</button>
        <button onClick={() => setFeedback('Use Possible Forms below to add a new form.')} className='rounded border border-neon/40 bg-bg px-3 py-1.5 text-xs'>Add Possible Form</button>
        <button onClick={() => freezeSpark(spark.id)} className='rounded border border-neon/40 bg-bg px-3 py-1.5 text-xs'>{spark.status === 'frozen' ? 'Unfreeze' : 'Freeze'}</button>
      </div>
    </section>

    {feedback ? <p className='mt-2 rounded border border-neon/40 p-2 text-sm text-neon'>{feedback}</p> : null}

    <section className='mt-4 rounded-xl border border-neon/60 bg-panelAlt p-4'>
      <h4 className='text-sm font-semibold uppercase tracking-wide text-neon'>Current Action</h4>
      <p className='mt-2 text-sm'>{spark.currentAction || 'No Current Action set yet.'}</p>
      <div className='mt-3 flex gap-2'>
        <input value={currentActionInput} onChange={(e) => setNextMoveInput(e.target.value)} placeholder='Record rough vocals / Clean linework / Export print file...' className='flex-1 rounded bg-bg p-2' />
        <button className='rounded bg-neon px-3 text-bg' onClick={() => { if (currentActionInput.trim()) { updateSpark(spark.id, { currentAction: currentActionInput.trim() }); setFeedback(`Set Action: ${currentActionInput.trim()}`); setNextMoveInput(''); } }}>{spark.currentAction ? 'Update Action' : 'Set Action'}</button>
      </div>
    </section>

    <section className='mt-4 rounded-xl border border-neon/50 bg-panelAlt/90 p-4'>
      <h4 className='text-sm font-semibold uppercase tracking-wide text-neonDim'>Possible Forms</h4>
      <div className='mt-2 flex gap-2'>
        <input value={lane} onChange={(e) => setLane(e.target.value)} placeholder='Possible Form title' className='flex-1 rounded bg-bg p-2' />
        <button className='rounded bg-neon px-3 text-bg' onClick={() => { if (lane.trim()) { addPathway(spark.id, lane.trim()); setFeedback('Possible Form added.'); setLane(''); } }}>Add Possible Form</button>
      </div>
      <ul className='mt-3 space-y-2'>
        {routes.length ? routes.map((r) => <li key={r.id} className={`rounded border bg-bg/40 p-3 text-sm ${pillarStyle.border}`}>
          <p className='font-medium'>{r.title}</p>
          <div className='mt-1 flex flex-wrap gap-2 text-xs'>
            <span className='rounded-full border border-neon/30 px-2 py-0.5'>{r.status === 'chosen' ? 'Chosen Form' : 'Possible Form'}</span>
            {r.outputType ? <span className='rounded-full border border-neon/30 px-2 py-0.5'>Output: {r.outputType}</span> : null}
          </div>
          {r.currentAction || spark.currentAction ? <p className='mt-1 text-xs text-neonDim'>Current Action: {r.currentAction || spark.currentAction}</p> : null}
          <div className='mt-2 flex flex-wrap gap-2'>
            {r.status === 'chosen' ? <span className='rounded border border-emerald-300/40 bg-emerald-300/15 px-2 py-1 text-xs text-emerald-100'>Chosen Form</span> : <button onClick={() => updatePathway(r.id, { status: 'chosen' })} className='rounded border border-neon/40 px-2 py-1 text-xs'>Choose Form</button>}
            <button onClick={() => updateSpark(spark.id, { status: 'frozen' })} className='rounded border border-neon/40 px-2 py-1 text-xs'>Freeze Asset</button>
          </div>
        </li>) : <li className='text-sm text-muted'>No Possible Forms yet.</li>}
      </ul>
    </section>

    <section className='mt-4 rounded-xl border border-neon/50 bg-panelAlt/90 p-4'>
      <h4 className='text-sm font-semibold uppercase tracking-wide text-neonDim'>Release Output</h4>
      <div className='mt-2 grid gap-2 sm:grid-cols-2'>
        <input value={outputTitle} onChange={(e) => setOutputTitle(e.target.value)} placeholder='Output title' className='rounded bg-bg p-2' />
        <input value={outputType} onChange={(e) => setOutputType(e.target.value)} placeholder='song/reel/post/tattoo/print...' className='rounded bg-bg p-2' />
        <select value={releasePathwayId} onChange={(e) => setReleasePathwayId(e.target.value)} className='rounded bg-bg p-2'>
          <option value=''>Related Form (optional)</option>{routes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
        <input value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} placeholder='Optional notes' className='rounded bg-bg p-2' />
        <button className='rounded bg-neon px-3 py-2 text-bg' onClick={() => { if (outputTitle.trim() && outputType.trim()) { releaseBlaze(spark.id, outputTitle.trim(), outputType.trim(), releasePathwayId || undefined, releaseNotes.trim() || undefined); setFeedback(`Released Output: ${outputTitle.trim()}`); setOutputTitle(''); } }}>Release Output</button>
      </div>
    </section>

    {editing ? <section className='mt-4 rounded-xl border border-neon/40 bg-panelAlt/85 p-4'><h4 className='text-sm uppercase text-neonDim'>Edit Asset</h4><div className='mt-2 grid gap-2'><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className='rounded bg-bg p-2' /><input value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className='rounded bg-bg p-2' /><select value={draft.branchId} onChange={(e) => setDraft({ ...draft, branchId: e.target.value })} className='rounded bg-bg p-2'>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className='rounded bg-bg p-2' /><input value={draft.currentAction} onChange={(e) => setDraft({ ...draft, currentAction: e.target.value })} className='rounded bg-bg p-2' /><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className='rounded bg-bg p-2'><option>new</option><option>active</option><option>cooling</option><option>frozen</option></select><details><summary>Advanced</summary><select value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })} className='mt-1 rounded bg-bg p-2'><option>Spark</option><option>Ember</option><option>Flame</option><option>Blaze</option></select></details><div className='flex gap-2'><button onClick={() => { updateSpark(spark.id, draft as any); setEditing(false); setFeedback(`Edited Spark: ${draft.title}`); }} className='rounded bg-neon px-3 py-1 text-bg'>Save</button><button onClick={() => setEditing(false)} className='rounded border border-neon/40 px-3 py-1'>Cancel</button></div></div></section> : null}

    <section className='mt-4 rounded-xl border border-neon/25 bg-panelAlt/60 p-4'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-semibold uppercase tracking-wide text-neonDim'>Attachments</h4>
        <button onClick={analyzeSpark} disabled={analysisLoading} className='rounded border border-neon/30 bg-bg px-3 py-1 text-xs disabled:opacity-60'>{analysisLoading ? 'Analyzing…' : 'Analyze Asset'}</button>
      </div>
      <div className='mt-2 grid gap-2 sm:grid-cols-2'>
        {sparkAttachments.map((att) => <div key={att.id} className='rounded border border-neon/20 p-2 text-xs'><p>{att.name}</p><p className='text-muted'>{att.type} {att.size ? `• ${Math.round(att.size / 1024)} KB` : ''}</p>{att.type === 'image' && att.objectUrl ? <img src={att.objectUrl} alt={att.name} className='mt-2 max-h-36 rounded' /> : null}{att.type === 'audio' && att.objectUrl ? <audio controls src={att.objectUrl} className='mt-2 w-full' /> : null}{att.type === 'video' && att.objectUrl ? <video controls src={att.objectUrl} className='mt-2 max-h-44 w-full rounded' /> : null}{att.type === 'link' && att.linkUrl ? <a href={att.linkUrl} className='mt-1 block text-neon underline'>{att.linkUrl}</a> : null}{att.type === 'note' ? <p className='mt-1 text-sm'>{att.textContent}</p> : null}<button onClick={() => removeSparkAttachment(att.id)} className='mt-2 rounded border border-neon/40 px-2 py-1'>Remove</button></div>)}
      </div>
      <div className='mt-3 border-t border-neon/20 pt-3'><input type='file' onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const t = f.type.startsWith('image/') ? 'image' : f.type.startsWith('audio/') ? 'audio' : f.type.startsWith('video/') ? 'video' : 'file'; addSparkAttachments(spark.id, [{ name: f.name, type: t as any, mimeType: f.type, size: f.size, objectUrl: URL.createObjectURL(f) }]); }} className='text-sm' /></div>
      {analysisError ? <p className='mt-2 text-sm text-red-300'>{analysisError}</p> : null}
    </section>

    <section className='mt-4 rounded-xl border border-neon/25 bg-panelAlt/60 p-4'>
      <h4 className='text-sm font-semibold uppercase tracking-wide text-neonDim'>Output History</h4>
      <ul className='mt-2 space-y-2 text-sm'>{sparkBlazes.length ? sparkBlazes.map((b) => <li key={b.id} className='rounded border border-neon/20 p-2'>{b.releasedAt} • {b.title} • {b.outputType ?? 'output'}{b.pathwayId ? ` • Related Form: ${routes.find((r) => r.id === b.pathwayId)?.title ?? 'Unknown'}` : ''}{b.notes ? ` • ${b.notes}` : ''}</li>) : <li className='text-muted'>No released outputs yet.</li>}</ul>
    </section>

    {analysis ? <section className='mt-4 rounded-xl border border-neon/25 bg-panelAlt/60 p-4'><h4 className='text-sm uppercase text-neonDim'>AI Analysis</h4><p className='mt-2 text-sm'>{analysis.summary}</p><p className='mt-2 text-xs text-muted'>Suggested kind: {analysis.suggestedKind} • Suggested stage: {analysis.suggestedStage}</p><div className='mt-3'><p className='text-xs uppercase text-neonDim'>Suggested Pillar</p><p className='text-sm'>{analysis.suggestedBranchName}</p>{branches.some((b) => b.name.toLowerCase() === analysis.suggestedBranchName.toLowerCase()) ? <button onClick={() => { const matching = branches.find((b) => b.name.toLowerCase() === analysis.suggestedBranchName.toLowerCase()); if (matching) { updateSpark(spark.id, { branchId: matching.id }); setFeedback(`Applied Pillar: ${matching.name}`); } }} className='mt-1 rounded border border-neon/40 px-2 py-1 text-xs'>Apply Existing Pillar</button> : <div className='mt-1 flex gap-2'><select value={branchSelection} onChange={(e) => setBranchSelection(e.target.value)} className='rounded bg-bg p-1 text-xs'><option value=''>Suggested pillar does not exist. Choose existing pillar.</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><button onClick={() => { if (branchSelection) { updateSpark(spark.id, { branchId: branchSelection }); setFeedback('Applied existing pillar.'); } }} className='rounded border border-neon/40 px-2 py-1 text-xs'>Apply Existing Pillar</button></div>}</div><div className='mt-3'><p className='text-xs uppercase text-neonDim'>Suggested Possible Forms</p><ul className='mt-2 space-y-2'>{analysis.suggestedPathways.map((p, idx) => <li key={`${p.title}-${idx}`} className='rounded border border-neon/30 p-2 text-sm'><input value={pathwayDrafts[idx] ?? p.title} onChange={(e) => setPathwayDrafts((s) => ({ ...s, [idx]: e.target.value }))} className='w-full rounded bg-bg p-2 text-sm' /><p className='mt-1 text-xs text-muted'>Output: {p.outputType}</p><p className='mt-1 text-xs text-neonDim'>Current Action: {p.suggestedNextMove}</p><div className='mt-2 flex gap-2'><button onClick={() => { const title = (pathwayDrafts[idx] ?? p.title).trim(); if (title) { addPathway(spark.id, title, { outputType: p.outputType, currentAction: p.suggestedNextMove }); if (spark.stage === 'Spark') { updateSpark(spark.id, { stage: 'Ember', status: spark.status === 'frozen' ? 'frozen' : 'active' }); } addActionLog('create_pathway', `Accepted AI Possible Form: ${title}`, true, { sparkId: spark.id, branchId: spark.branchId }); setFeedback(`Accepted AI Possible Form: ${title}`); } }} className='rounded border border-neon/40 px-2 py-1 text-xs'>Accept Suggested Form</button><button onClick={() => setFeedback(`Ignored AI Possible Form: ${p.title}`)} className='rounded border border-neon/40 px-2 py-1 text-xs'>Ignore</button></div></li>)}</ul></div><div className='mt-3'><p className='text-xs uppercase text-neonDim'>Recommended Current Action</p><div className='mt-1 flex gap-2'><input value={currentActionDraft} onChange={(e) => setNextMoveDraft(e.target.value)} className='flex-1 rounded bg-bg p-2 text-sm' /><button onClick={() => { if (currentActionDraft.trim()) { updateSpark(spark.id, { currentAction: currentActionDraft.trim() }); addActionLog('set_next_move', `Accepted AI Current Action: ${currentActionDraft.trim()}`, true, { sparkId: spark.id, branchId: spark.branchId }); setFeedback(`Accepted AI Current Action: ${currentActionDraft.trim()}`); } }} className='rounded border border-neon/40 px-2 py-1 text-xs'>Accept AI Current Action</button></div></div><div className='mt-3'><p className='text-xs uppercase text-neonDim'>Confidence / caveats</p><p className='text-sm'>{analysis.confidenceNotes}</p>{analysis.usedFallback ? <p className='mt-1 text-xs text-neonDim'>Using local fallback response (no API key or request issue).</p> : null}</div></section> : null}

    <details className='mt-4 rounded-xl border border-neon/20 bg-panelAlt/50 p-3'><summary className='cursor-pointer text-xs uppercase tracking-wide text-neonDim'>History</summary><ul className='mt-2 text-sm'>{actions.filter((a) => a.action.includes(spark.title) || a.action.includes('Current Action') || a.action.includes('Output')).slice(0, 8).map((a) => <li key={a.id}>{a.date} • {a.action}</li>)}</ul></details>
  </Layout>;
}
