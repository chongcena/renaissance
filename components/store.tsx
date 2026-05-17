'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { action_log, blaze_logs, branches as seedBranches, burner_ledger, pathways, spark_items } from '@/data/mock';
import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SparkItem, Stage, Status } from '@/data/types';

type Store = {
  branches: Branch[]; sparks: SparkItem[]; pathways: Pathway[]; blazes: BlazeLog[]; actions: ActionLog[]; burners: BurnerLedger[];
  createBranch: (input: { name: string; focus: string; heatScore: number; tags?: string[] }) => string | null;
  updateBranch: (id: string, patch: Partial<Branch>) => void;
  createSpark: (input: Pick<SparkItem, 'title' | 'kind' | 'branchId' | 'notes'> & { stage?: Stage; status?: Status; nextMove?: string }) => string | null;
  routeSpark: (sparkId: string) => void; activateFire: (sparkId: string) => void; freezeSpark: (sparkId: string) => void;
  updateSpark: (id: string, patch: Partial<SparkItem>) => void; addPathway: (sparkId: string, lane: string) => void; updatePathway: (id: string, patch: Partial<Pathway>) => void;
  releaseBlaze: (sparkId: string, title: string, outputType: string) => void;
};
const Ctx = createContext<Store | null>(null);
const today = () => new Date().toISOString().slice(0, 10);
const id = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(seedBranches);
  const [sparks, setSparks] = useState<SparkItem[]>(spark_items);
  const [paths, setPaths] = useState<Pathway[]>(pathways);
  const [blazes, setBlazes] = useState<BlazeLog[]>(blaze_logs);
  const [actions, setActions] = useState<ActionLog[]>(action_log);
  const [burners, setBurners] = useState<BurnerLedger[]>(burner_ledger);
  const appendAction = (action_type: ActionLog['action_type'], action: string, countsForStreak = true) => setActions((a) => [{ id: id('ac'), action_type, action, date: today(), countsForStreak }, ...a]);

  const value = useMemo<Store>(() => ({
    branches, sparks, pathways: paths, blazes, actions, burners,
    createBranch: ({ name, focus, heatScore, tags }) => {
      const n = name.trim(); if (!n) return null;
      const next = { id: id('br'), name: n, focus: focus.trim(), heatScore: Math.max(0, Math.min(100, heatScore)), tags: tags?.filter(Boolean) ?? [] };
      setBranches((b) => [next, ...b]); appendAction('progress', `Created Branch: ${next.name}`); return next.id;
    },
    updateBranch: (bid, patch) => { setBranches((b) => b.map((i) => (i.id === bid ? { ...i, ...patch } : i))); appendAction('progress', `Updated Branch: ${(branches.find((b)=>b.id===bid)?.name) ?? bid}`); },
    createSpark: (input) => {
      const trimmedTitle = input.title.trim(); if (!trimmedTitle) return null;
      const next: SparkItem = { id: id('sp'), title: trimmedTitle, kind: input.kind, branchId: input.branchId, notes: input.notes, stage: input.stage ?? 'Spark', status: input.status ?? 'new', heatScore: 50, updatedAt: today(), last_touched_at: today(), nextMove: input.nextMove?.trim() };
      setSparks((s) => [next, ...s]); appendAction('capture', `Captured Spark: ${next.title}`); return next.id;
    },
    routeSpark: (sparkId) => { const spark=sparks.find((s)=>s.id===sparkId); setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, stage: 'Ember', updatedAt: today(), last_touched_at: today() } : i)); appendAction('route', `Routed Spark: ${spark?.title ?? sparkId}`); },
    activateFire: (sparkId) => { const spark=sparks.find((s)=>s.id===sparkId); const activePath=paths.find((p)=>p.sparkId===sparkId&&p.status==='active'); setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, stage: 'Fire', status: 'active', updatedAt: today(), last_touched_at: today() } : i)); appendAction('activate_fire', `Activated Fire: ${activePath?.lane ?? spark?.title ?? sparkId}`); },
    freezeSpark: (sparkId) => { const spark=sparks.find((s)=>s.id===sparkId); setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, status: 'frozen', updatedAt: today(), last_touched_at: today() } : i)); appendAction('freeze', `Froze Spark: ${spark?.title ?? sparkId}`); },
    updateSpark: (sid, patch) => { setSparks((s) => s.map((i) => i.id === sid ? { ...i, ...patch, updatedAt: today(), last_touched_at: today() } : i)); if (patch.nextMove !== undefined) appendAction('progress', `Set Next Move: ${patch.nextMove || 'Cleared next move'}`); else appendAction('progress', `Updated Spark: ${(sparks.find((s)=>s.id===sid)?.title) ?? sid}`); },
    addPathway: (sparkId, lane) => { setPaths((p) => [{ id: id('pw'), sparkId, lane, confidence: 60, status: 'new', last_touched_at: today() }, ...p]); appendAction('create_pathway', `Added Pathway: ${lane}`); },
    updatePathway: (pid, patch) => { const path = paths.find((p)=>p.id===pid); setPaths((p) => p.map((i) => i.id === pid ? { ...i, ...patch, last_touched_at: today() } : i)); appendAction('progress', `Updated Pathway: ${path?.lane ?? pid}`); },
    releaseBlaze: (sparkId, title, outputType) => {
      const spark = sparks.find((s) => s.id === sparkId); if (!spark) return;
      const blaze = { id: id('blz'), sparkId, title: `${title} (${outputType})`, branchId: spark.branchId, releasedAt: today() };
      setBlazes((b) => [blaze, ...b]);
      setSparks((s) => s.map((x) => x.id === sparkId ? { ...x, stage: 'Blaze' as Stage, status: 'active' as Status, updatedAt: today(), last_touched_at: today() } : x));
      setBurners((b) => [{ id: id('bn'), event: 'Earned', reason: `Released Blaze: ${title}`, date: today(), delta: 1 }, ...b]);
      appendAction('release', `Released Blaze: ${title}`); appendAction('create_blaze', `Created Blaze Log: ${title} (${outputType})`);
    }
  }), [branches, sparks, paths, blazes, actions, burners]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => { const ctx = useContext(Ctx); if (!ctx) throw new Error('useStore within StoreProvider'); return ctx; };
