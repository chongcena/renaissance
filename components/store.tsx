'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { action_log, blaze_logs, branches as seedBranches, burner_ledger, pathways, spark_attachments, spark_items } from '@/data/mock';
import type { ActionLog, BlazeLog, Branch, BranchRole, BurnerLedger, Pathway, SparkAttachment, SparkItem, Stage, Status } from '@/data/types';

type Store = {
  branches: Branch[]; sparks: SparkItem[]; attachments: SparkAttachment[]; pathways: Pathway[]; blazes: BlazeLog[]; actions: ActionLog[]; burners: BurnerLedger[];
  createBranch: (input: { name: string; focus: string; strategicWeight: number; role: BranchRole; tags?: string[] }) => string | null;
  updateBranch: (id: string, patch: Partial<Branch>) => void;
  createSpark: (input: Pick<SparkItem, 'title' | 'kind' | 'branchId' | 'notes'> & { stage?: Stage; status?: Status; nextMove?: string; attachments?: Omit<SparkAttachment, 'id' | 'sparkId' | 'createdAt'>[] }) => string | null;
  routeSpark: (sparkId: string) => void; activateFire: (sparkId: string) => void; freezeSpark: (sparkId: string) => void;
  updateSpark: (id: string, patch: Partial<SparkItem>) => void; addSparkAttachments: (sparkId: string, payload: Omit<SparkAttachment, 'id' | 'sparkId' | 'createdAt'>[]) => void; removeSparkAttachment: (attachmentId: string) => void; addPathway: (sparkId: string, lane: string) => void; updatePathway: (id: string, patch: Partial<Pathway>) => void;
  releaseBlaze: (sparkId: string, title: string, outputType: string) => void;
};
const Ctx = createContext<Store | null>(null);
const today = () => new Date().toISOString().slice(0, 10);
const id = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(seedBranches);
  const [sparks, setSparks] = useState<SparkItem[]>(spark_items);
  const [attachments, setAttachments] = useState<SparkAttachment[]>(spark_attachments);
  const [paths, setPaths] = useState<Pathway[]>(pathways);
  const [blazes, setBlazes] = useState<BlazeLog[]>(blaze_logs);
  const [actions, setActions] = useState<ActionLog[]>(action_log);
  const [burners, setBurners] = useState<BurnerLedger[]>(burner_ledger);
  const appendAction = (action_type: ActionLog['action_type'], action: string, countsForStreak = true, meta?: { branchId?: string; sparkId?: string }) => setActions((a) => [{ id: id('ac'), action_type, action, date: today(), countsForStreak, ...meta }, ...a]);

  const value = useMemo<Store>(() => ({
    branches, sparks, attachments, pathways: paths, blazes, actions, burners,
    createBranch: ({ name, focus, strategicWeight, role, tags }) => {
      const n = name.trim(); if (!n) return null;
      const next = { id: id('br'), name: n, focus: focus.trim(), strategicWeight: Math.max(0, Math.min(100, strategicWeight)), role, tags: tags?.filter(Boolean) ?? [] };
      setBranches((b) => [next, ...b]); appendAction('progress', `Created Branch: ${next.name}`); return next.id;
    },
    updateBranch: (bid, patch) => { setBranches((b) => b.map((i) => (i.id === bid ? { ...i, ...patch } : i))); appendAction('progress', `Updated Branch: ${(branches.find((b)=>b.id===bid)?.name) ?? bid}`); },
    createSpark: (input) => {
      const trimmedTitle = input.title.trim(); if (!trimmedTitle) return null;
      const next: SparkItem = { id: id('sp'), title: trimmedTitle, kind: input.kind, branchId: input.branchId, notes: input.notes, stage: input.stage ?? 'Spark', status: input.status ?? 'new', heatScore: 50, updatedAt: today(), last_touched_at: today(), nextMove: input.nextMove?.trim() };
      setSparks((s) => [next, ...s]);
      if (input.attachments?.length) {
        setAttachments((a) => input.attachments!.map((att) => ({ ...att, id: id('att'), sparkId: next.id, createdAt: today() })).concat(a));
      }
      appendAction('capture', `Captured Spark: ${next.title}`); return next.id;
    },
    routeSpark: (sparkId) => { const spark=sparks.find((s)=>s.id===sparkId); setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, stage: 'Ember', updatedAt: today(), last_touched_at: today() } : i)); appendAction('route', `Routed Spark: ${spark?.title ?? sparkId}`, true, { sparkId, branchId: spark?.branchId }); },
    activateFire: (sparkId) => { const spark=sparks.find((s)=>s.id===sparkId); const activePath=paths.find((p)=>p.sparkId===sparkId&&p.status==='active'); setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, stage: 'Fire', status: 'active', updatedAt: today(), last_touched_at: today() } : i)); appendAction('activate_fire', `Activated Fire: ${activePath?.lane ?? spark?.title ?? sparkId}`, true, { sparkId, branchId: spark?.branchId }); },
    freezeSpark: (sparkId) => { const spark=sparks.find((s)=>s.id===sparkId); setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, status: 'frozen', updatedAt: today(), last_touched_at: today() } : i)); appendAction('freeze', `Froze Spark: ${spark?.title ?? sparkId}`, true, { sparkId, branchId: spark?.branchId }); },
    updateSpark: (sid, patch) => { setSparks((s) => s.map((i) => i.id === sid ? { ...i, ...patch, updatedAt: today(), last_touched_at: today() } : i)); const sparkTitle=(sparks.find((s)=>s.id===sid)?.title) ?? sid; if (patch.nextMove !== undefined) appendAction('set_next_move', `Set Next Move: ${patch.nextMove || 'Cleared next move'}`); appendAction('progress', `Edited Spark: ${sparkTitle}`); },
    addSparkAttachments: (sparkId, payload) => {
      if (!payload.length) return;
      setAttachments((a) => payload.map((att) => ({ ...att, id: id('att'), sparkId, createdAt: today() })).concat(a));
      const sparkTitle=(sparks.find((s)=>s.id===sparkId)?.title) ?? sparkId;
      appendAction('progress', `Edited Spark: ${sparkTitle}`);
    },
    removeSparkAttachment: (attachmentId) => {
      setAttachments((a)=>a.filter((att)=>att.id!==attachmentId));
      appendAction('progress', 'Edited Spark: Removed attachment');
    },
    addPathway: (sparkId, lane) => { const spark=sparks.find((s)=>s.id===sparkId); setPaths((p) => [{ id: id('pw'), sparkId, lane, confidence: 60, status: 'new', last_touched_at: today() }, ...p]); appendAction('create_pathway', `Added Pathway: ${lane}`, true, { sparkId, branchId: spark?.branchId }); },
    updatePathway: (pid, patch) => { const path = paths.find((p)=>p.id===pid); setPaths((p) => p.map((i) => i.id === pid ? { ...i, ...patch, last_touched_at: today() } : i)); appendAction('progress', `Updated Pathway: ${path?.lane ?? pid}`); },
    releaseBlaze: (sparkId, title, outputType) => {
      const spark = sparks.find((s) => s.id === sparkId); if (!spark) return;
      const blaze = { id: id('blz'), sparkId, title: `${title} (${outputType})`, branchId: spark.branchId, releasedAt: today() };
      setBlazes((b) => [blaze, ...b]);
      setSparks((s) => s.map((x) => x.id === sparkId ? { ...x, stage: 'Blaze' as Stage, status: 'active' as Status, updatedAt: today(), last_touched_at: today() } : x));
      setBurners((b) => [{ id: id('bn'), event: 'Earned', reason: `Released Blaze: ${title}`, date: today(), delta: 1 }, ...b]);
      appendAction('release', `Released Blaze: ${title}`, true, { sparkId, branchId: spark.branchId }); appendAction('create_blaze', `Created Blaze Log: ${title} (${outputType})`, true, { sparkId, branchId: spark.branchId });
    }
  }), [branches, sparks, attachments, paths, blazes, actions, burners]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => { const ctx = useContext(Ctx); if (!ctx) throw new Error('useStore within StoreProvider'); return ctx; };
