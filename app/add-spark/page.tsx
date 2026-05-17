'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { SparkAttachmentType } from '@/data/types';

const modes = ['note', 'link', 'image', 'audio', 'video', 'file'] as const;
type CaptureMode = (typeof modes)[number];
type DraftAttachment = { name: string; type: SparkAttachmentType; mimeType?: string; size?: number; objectUrl?: string; textContent?: string; linkUrl?: string };

export default function CaptureSparkPage() {
  const router = useRouter();
  const { branches, goals, createSpark } = useStore();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<CaptureMode>('note');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [goalId, setGoalId] = useState('');
  const [scheduleBucket, setScheduleBucket] = useState<'today'|'tomorrow'|'this_week'|'this_month'|'later'|''>('');
  const [currentAction, setCurrentAction] = useState('');
  const [notes, setNotes] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [attachment, setAttachment] = useState<DraftAttachment | null>(null);
  const [captureError, setCaptureError] = useState('');

  const onFile = (file?: File | null, forcedType?: SparkAttachmentType) => {
    if (!file) {
      setAttachment(null);
      return;
    }
    const inferred: SparkAttachmentType = forcedType ?? (file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'file');
    setAttachment({ name: file.name, type: inferred, mimeType: file.type, size: file.size, objectUrl: URL.createObjectURL(file) });
  };

  const create = () => {
    const trimmedTitle = title.trim();
    const trimmedNoteBody = noteBody.trim();
    const trimmedLink = linkUrl.trim();
    const finalAttachment: DraftAttachment | null = kind === 'note' && trimmedNoteBody ? { name: 'Note', type: 'note', textContent: trimmedNoteBody } : kind === 'link' && trimmedLink ? { name: trimmedLink, type: 'link', linkUrl: trimmedLink } : attachment;
    const isValid = kind === 'note'
      ? Boolean(trimmedTitle || trimmedNoteBody)
      : kind === 'link'
        ? Boolean(trimmedLink)
        : Boolean(finalAttachment);
    if (!isValid) {
      setCaptureError('Add content before capturing.');
      return;
    }
    setCaptureError('');
    const createdId = createSpark({ title: trimmedTitle || 'Untitled Spark', kind, branchId, goalId: goalId || undefined, scheduleBucket: scheduleBucket || undefined, currentAction: currentAction || undefined, notes, attachments: finalAttachment ? [finalAttachment] : [] });
    if (createdId) router.push(`/spark/${createdId}`);
  };

  return <Layout><section className='mx-auto max-w-3xl space-y-4'><h2 className='text-2xl font-semibold tracking-tight'>Capture</h2>
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>{modes.map((mode)=><button key={mode} onClick={()=>{ setKind(mode); setCaptureError(''); }} className={`rounded-xl border px-3 py-2 text-sm capitalize ${kind===mode?'border-neon/40 bg-neon/15 text-amber-100':'border-neon/15 bg-panelAlt/70 text-muted hover:text-text'}`}>{mode}</button>)}</div>
    <section className='rounded-2xl border border-neon/15 bg-panelAlt/70 p-4 space-y-3'>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5' placeholder='Title your capture' />
      <p className='text-xs text-muted'>Mode: {kind}</p>
      {kind === 'note' && <textarea value={noteBody} onChange={(e)=>setNoteBody(e.target.value)} className='h-28 w-full rounded-lg bg-bg/60 p-2.5' placeholder='Capture the idea...' />}
      {kind === 'link' && <input value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5' placeholder='Paste link...' />}
      {kind === 'image' && <input type='file' accept='image/jpeg,image/png,image/webp,image/gif,image/*' onChange={(e)=>onFile(e.target.files?.[0], 'image')} className='w-full rounded-lg bg-bg/60 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neon/20 file:px-3 file:py-1 file:text-xs' />}
      {kind === 'audio' && <input type='file' accept='audio/*' onChange={(e)=>onFile(e.target.files?.[0], 'audio')} className='w-full rounded-lg bg-bg/60 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neon/20 file:px-3 file:py-1 file:text-xs' />}
      {kind === 'video' && <input type='file' accept='video/*' onChange={(e)=>onFile(e.target.files?.[0], 'video')} className='w-full rounded-lg bg-bg/60 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neon/20 file:px-3 file:py-1 file:text-xs' />}
      {kind === 'file' && <input type='file' onChange={(e)=>onFile(e.target.files?.[0], 'file')} className='w-full rounded-lg bg-bg/60 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neon/20 file:px-3 file:py-1 file:text-xs' />}
      {attachment && <div className='rounded-lg border border-neon/20 bg-bg/40 p-3 text-sm'><p>{attachment.name}</p><p className='text-xs text-muted'>{attachment.mimeType || 'unknown'} • {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'size n/a'}</p>{attachment.type==='image'&&attachment.objectUrl?<img src={attachment.objectUrl} alt={attachment.name} className='mt-2 max-h-40 rounded'/>:null}{attachment.type==='audio'&&attachment.objectUrl?<audio controls src={attachment.objectUrl} className='mt-2 w-full'/>:null}{attachment.type==='video'&&attachment.objectUrl?<video controls src={attachment.objectUrl} className='mt-2 max-h-48 w-full rounded'/>:null}</div>}
      {captureError && <p className='text-xs text-amber-300'>{captureError}</p>}
      <div className='grid gap-2 sm:grid-cols-2'>
        <select value={branchId} onChange={(e)=>setBranchId(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5'>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select value={goalId} onChange={(e)=>setGoalId(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5'><option value=''>No goal</option>{goals.map((g)=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
      </div>
      <details><summary className='cursor-pointer text-sm text-neonDim'>Advanced</summary><div className='mt-2 grid gap-2'><select value={scheduleBucket} onChange={(e)=>setScheduleBucket(e.target.value as any)} className='w-full rounded-lg bg-bg/60 p-2.5'><option value=''>No schedule</option><option value='today'>today</option><option value='tomorrow'>tomorrow</option><option value='this_week'>this_week</option><option value='this_month'>this_month</option><option value='later'>later</option></select><input value={currentAction} onChange={(e)=>setCurrentAction(e.target.value)} className='w-full rounded-lg bg-bg/60 p-2.5' placeholder='Current Action' /><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className='h-24 w-full rounded-lg bg-bg/60 p-2.5' placeholder='Notes' /></div></details>
      <div className='flex gap-2'><button onClick={create} className='rounded-lg bg-neon px-4 py-2 font-semibold text-bg'>Capture</button><Link href='/vault' className='rounded-lg border border-neon/30 px-4 py-2'>Cancel</Link></div>
    </section>
  </section></Layout>;
}
