'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { action_log, blaze_logs, branches as seedBranches, burner_ledger, pathways, spark_items } from '@/data/mock';
import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SparkItem, Stage, Status } from '@/data/types';

type Store = {
  branches: Branch[];
  sparks: SparkItem[];
  pathways: Pathway[];
  blazes: BlazeLog[];
  actions: ActionLog[];
  burners: BurnerLedger[];
  createBranch: (input: { name: string; focus: string; heatScore: number; tags?: string[] }) => string | null;
  updateBranch: (id: string, patch: Partial<Branch>) => void;
  createSpark: (input: Pick<SparkItem, 'title' | 'kind' | 'branchId' | 'notes'> & { stage?: Stage; status?: Status; nextMove?: string }) => string | null;
  routeSpark: (sparkId: string) => void;
  activateFire: (sparkId: string) => void;
  freezeSpark: (sparkId: string) => void;
  archiveSpark: (sparkId: string) => void;
  killSpark: (sparkId: string) => void;
  updateSpark: (id: string, patch: Partial<SparkItem>) => void;
  addPathway: (sparkId: string, lane: string) => void;
  updatePathway: (id: string, patch: Partial<Pathway>) => void;
  releaseBlaze: (sparkId: string, title: string) => void;
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
      const n = name.trim();
      if (!n) return null;
      const next = { id: id('br'), name: n, focus: focus.trim(), heatScore: Math.max(0, Math.min(100, heatScore)), tags: tags?.filter(Boolean) ?? [] };
      setBranches((b) => [next, ...b]);
      appendAction('progress', `Created Branch: ${next.name}`);
      return next.id;
    },
    updateBranch: (bid, patch) => {
      setBranches((b) => b.map((i) => (i.id === bid ? { ...i, ...patch } : i)));
      appendAction('progress', `Updated Branch ${bid}`);
    },
    createSpark: (input) => {
      const trimmedTitle = input.title.trim();
      if (!trimmedTitle) return null;
      const next: SparkItem = { id: id('sp'), title: trimmedTitle, kind: input.kind, branchId: input.branchId, notes: input.notes, stage: input.stage ?? 'Spark', status: input.status ?? 'new', heatScore: 50, updatedAt: today(), last_touched_at: today(), nextMove: input.nextMove?.trim() };
      setSparks((s) => [next, ...s]);
      appendAction('capture', `Created Spark: ${next.title}`);
      return next.id;
    },
    routeSpark: (sparkId) => { setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, stage: 'Ember', updatedAt: today(), last_touched_at: today() } : i)); appendAction('route', `Routed Spark ${sparkId} to Ember`); },
    activateFire: (sparkId) => { setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, stage: 'Fire', status: 'active', updatedAt: today(), last_touched_at: today() } : i)); appendAction('activate_fire', `Activated Fire for ${sparkId}`); },
    freezeSpark: (sparkId) => { setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, status: 'frozen', updatedAt: today(), last_touched_at: today() } : i)); appendAction('freeze', `Froze Spark ${sparkId}`); },
    archiveSpark: (sparkId) => { setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, status: 'archived', updatedAt: today(), last_touched_at: today() } : i)); appendAction('archive', `Archived Spark ${sparkId}`); },
    killSpark: (sparkId) => { setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, status: 'killed', updatedAt: today(), last_touched_at: today() } : i)); appendAction('kill', `Killed Spark ${sparkId}`); },
    updateSpark: (sid, patch) => { setSparks((s) => s.map((i) => i.id === sid ? { ...i, ...patch, updatedAt: today(), last_touched_at: today() } : i)); appendAction('progress', `Updated Spark ${sid}`); },
    addPathway: (sparkId, lane) => { setPaths((p) => [{ id: id('pw'), sparkId, lane, confidence: 60, status: 'new', last_touched_at: today() }, ...p]); appendAction('create_pathway', `Added Pathway to ${sparkId}`); },
    updatePathway: (pid, patch) => { setPaths((p) => p.map((i) => i.id === pid ? { ...i, ...patch, last_touched_at: today() } : i)); appendAction('progress', `Updated Pathway ${pid}`); },
    releaseBlaze: (sparkId, title) => {
      const spark = sparks.find((s) => s.id === sparkId); if (!spark) return;
      const blaze = { id: id('blz'), sparkId, title, branchId: spark.branchId, releasedAt: today() };
      setBlazes((b) => [blaze, ...b]);
      setSparks((s) => s.map((x) => x.id === sparkId ? { ...x, stage: 'Blaze' as Stage, status: 'active' as Status, updatedAt: today(), last_touched_at: today() } : x));
      setBurners((b) => [{ id: id('bn'), event: 'Earned', reason: `Released Blaze: ${title}`, date: today(), delta: 1 }, ...b]);
      appendAction('release', `Released Blaze from ${sparkId}`); appendAction('create_blaze', `Created Blaze Log: ${title}`);
    }
  }), [branches, sparks, paths, blazes, actions, burners]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => { const ctx = useContext(Ctx); if (!ctx) throw new Error('useStore within StoreProvider'); return ctx; };
