'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import type { SparkAttachmentType, Status } from '@/data/types';

type DraftAttachment = { name: string; type: SparkAttachmentType; mimeType?: string; size?: number; objectUrl?: string; textContent?: string; linkUrl?: string };

const modes = ['Write Note', 'Paste Link', 'Upload Image', 'Upload Audio', 'Upload Video', 'Upload File'] as const;

export default function CaptureSparkPage() {
  const router = useRouter();
  const { branches, createSpark } = useStore();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('captured material');
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [nextMove, setNextMove] = useState('');
  const [status, setStatus] = useState<Status>('new');
  const [mode, setMode] = useState<(typeof modes)[number]>('Write Note');
  const [linkUrl, setLinkUrl] = useState('');
  const [attachment, setAttachment] = useState<DraftAttachment | null>(null);

  const onFile = (file?: File | null, forcedType?: SparkAttachmentType) => {
    if (!file) return;
    const inferred: SparkAttachmentType = forcedType ?? (file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'file');
    setAttachment({ name: file.name, type: inferred, mimeType: file.type, size: file.size, objectUrl: URL.createObjectURL(file) });
  };

  const create = () => {
    const noteText = notes.trim(); const link = linkUrl.trim();
    const finalAttachment: DraftAttachment | null = mode === 'Write Note' && noteText ? { name: 'Note', type: 'note', textContent: noteText } : mode === 'Paste Link' && link ? { name: link, type: 'link', linkUrl: link } : attachment;
    const seedTitle = title.trim() || (finalAttachment?.type === 'image' ? 'Image Spark' : finalAttachment?.type === 'audio' ? 'Audio Spark' : finalAttachment?.type === 'video' ? 'Video Spark' : finalAttachment?.type === 'file' ? (finalAttachment.name || 'File Spark') : finalAttachment?.type === 'note' ? noteText.split(/\s+/).slice(0, 5).join(' ') || 'Note Spark' : finalAttachment?.type === 'link' ? (new URL(link).hostname.replace('www.', '') || 'Link Spark') : 'Link Spark');
    if (!seedTitle && !noteText && !link && !attachment) return;
    const createdId = createSpark({ title: seedTitle, kind, branchId, notes: noteText, status, nextMove, attachments: finalAttachment ? [finalAttachment] : [] });
    if (!createdId) return;
    router.push(`/spark/${createdId}`);
  };

  return <Layout><section className="space-y-4"><h2 className="text-xl font-semibold">Capture Spark</h2><p className='text-xs text-muted'>Local preview uploads use temporary browser object URLs and may disappear on refresh until backend storage is added.</p><div className='grid gap-2 sm:grid-cols-3'>{modes.map((m)=><button key={m} type='button' onClick={()=>setMode(m)} className={`rounded border px-3 py-2 text-sm ${mode===m?'border-neon bg-neon/20':'border-neon/40 bg-bg'}`}>{m}</button>)}</div>
  <form className="space-y-3 rounded-xl border border-neon/40 bg-panelAlt/85 p-4 backdrop-blur-sm" onSubmit={(e)=>{e.preventDefault();create();}}>
    <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Title (optional)" />
    <input value={kind} onChange={(e)=>setKind(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Kind" />
    <select value={branchId} onChange={(e)=>setBranchId(e.target.value)} className="w-full rounded-lg border border-neon/40 bg-bg px-3 py-2"><option value=''>No branch yet</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
    {mode==='Write Note' && <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="h-24 w-full rounded-lg border border-neon/40 bg-bg px-3 py-2" placeholder="Capture your raw note..." />}
    {mode==='Paste Link' && <input value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} className='w-full rounded-lg border border-neon/40 bg-bg px-3 py-2' placeholder='https://example.com/inspiration' />}
    {mode==='Upload Image' && <input type='file' accept='image/*' onChange={(e)=>onFile(e.target.files?.[0], 'image')} className='w-full text-sm'/>}
    {mode==='Upload Audio' && <input type='file' accept='audio/*' onChange={(e)=>onFile(e.target.files?.[0], 'audio')} className='w-full text-sm'/>}
    {mode==='Upload Video' && <input type='file' accept='video/*' onChange={(e)=>onFile(e.target.files?.[0], 'video')} className='w-full text-sm'/>}
    {mode==='Upload File' && <input type='file' onChange={(e)=>onFile(e.target.files?.[0], 'file')} className='w-full text-sm'/>}
    {attachment && <div className='rounded border border-neon/30 p-3 text-sm'><p>{attachment.name}</p><p className='text-xs text-muted'>{attachment.mimeType || 'unknown'} • {attachment.size ? `${Math.round(attachment.size/1024)} KB` : 'size n/a'}</p>{attachment.type==='image'&&attachment.objectUrl?<img src={attachment.objectUrl} alt={attachment.name} className='mt-2 max-h-40 rounded'/>:null}{attachment.type==='audio'&&attachment.objectUrl?<audio controls src={attachment.objectUrl} className='mt-2 w-full'/>:null}{attachment.type==='video'&&attachment.objectUrl?<video controls src={attachment.objectUrl} className='mt-2 max-h-48 w-full rounded'/>:null}</div>}
    <details><summary className='cursor-pointer text-sm text-neonDim'>Advanced</summary><div className='mt-2 grid gap-2'><select value={status} onChange={(e)=>setStatus(e.target.value as Status)} className='rounded bg-bg p-2'><option>new</option><option>active</option><option>cooling</option><option>frozen</option></select><input value={nextMove} onChange={(e)=>setNextMove(e.target.value)} className='rounded bg-bg p-2' placeholder='Next Move (optional)'/></div></details>
    <div className="flex gap-2"><button className="rounded-lg bg-neon px-4 py-2 font-semibold text-bg">Capture Spark</button><Link href="/vault" className="rounded-lg border border-neon/40 px-4 py-2 text-sm text-muted hover:border-neon/70 hover:text-text">Cancel</Link></div></form></section></Layout>;
}
