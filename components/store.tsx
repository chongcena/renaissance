'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { action_log, blaze_logs, branches, burner_ledger, pathways, spark_items } from '@/data/mock';
import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SparkItem, Stage, Status } from '@/data/types';

type Store = {
  branches: Branch[];
  sparks: SparkItem[];
  pathways: Pathway[];
  blazes: BlazeLog[];
  actions: ActionLog[];
  burners: BurnerLedger[];
  createSpark: (input: Pick<SparkItem, 'title' | 'kind' | 'branchId' | 'notes'>) => void;
  updateSpark: (id: string, patch: Partial<SparkItem>) => void;
  addPathway: (sparkId: string, lane: string) => void;
  updatePathway: (id: string, patch: Partial<Pathway>) => void;
  releaseBlaze: (sparkId: string, title: string) => void;
};
const Ctx = createContext<Store | null>(null);
const today = () => new Date().toISOString().slice(0, 10);
const id = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [sparks, setSparks] = useState<SparkItem[]>(spark_items);
  const [paths, setPaths] = useState<Pathway[]>(pathways);
  const [blazes, setBlazes] = useState<BlazeLog[]>(blaze_logs);
  const [actions, setActions] = useState<ActionLog[]>(action_log);
  const [burners, setBurners] = useState<BurnerLedger[]>(burner_ledger);
  const log = (action: string) => setActions((a) => [{ id: id('ac'), action, date: today() }, ...a]);

  const value = useMemo<Store>(() => ({
    branches,
    sparks,
    pathways: paths,
    blazes,
    actions,
    burners,
    createSpark: (input) => {
      const next: SparkItem = { id: id('sp'), title: input.title, kind: input.kind, branchId: input.branchId, notes: input.notes, stage: 'Spark', status: 'new', heatScore: 50, updatedAt: today(), last_touched_at: today() };
      setSparks((s) => [next, ...s]); log(`Created Spark: ${next.title}`);
    },
    updateSpark: (sid, patch) => {
      setSparks((s) => s.map((i) => i.id === sid ? { ...i, ...patch, updatedAt: today(), last_touched_at: today() } : i));
      log(`Updated Spark ${sid}`);
    },
    addPathway: (sparkId, lane) => {
      setPaths((p) => [{ id: id('pw'), sparkId, lane, confidence: 60, status: 'new', last_touched_at: today() }, ...p]);
      log(`Added Pathway to ${sparkId}`);
    },
    updatePathway: (pid, patch) => {
      setPaths((p) => p.map((i) => i.id === pid ? { ...i, ...patch, last_touched_at: today() } : i));
      log(`Updated Pathway ${pid}`);
    },
    releaseBlaze: (sparkId, title) => {
      const spark = sparks.find((s) => s.id === sparkId); if (!spark) return;
      const blaze = { id: id('blz'), sparkId, title, branchId: spark.branchId, releasedAt: today() };
      setBlazes((b) => [blaze, ...b]);
      setSparks((s) => s.map((x) => x.id === sparkId ? { ...x, stage: 'Blaze' as Stage, status: 'active' as Status, updatedAt: today(), last_touched_at: today() } : x));
      setBurners((b) => [{ id: id('bn'), event: 'Earned', reason: `Released Blaze: ${title}`, date: today(), delta: 1 }, ...b]);
      log(`Released Blaze from ${sparkId}`);
    }
  }), [sparks, paths, blazes, actions, burners]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore within StoreProvider');
  return ctx;
};

export const getMomentumStreak = (actions: ActionLog[]) => {
  const days = Array.from(new Set(actions.map((a) => a.date))).sort().reverse();
  let streak = 0;
  let cursor = new Date();
  while (days.includes(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const getCoolDownWarning = (lastTouched: string, status: Status) => {
  if (['frozen', 'archived', 'killed'].includes(status)) return null;
  const diff = Math.floor((Date.now() - new Date(lastTouched).getTime()) / 86400000);
  if (diff >= 5) return `Cooling warning: untouched for ${diff} days`;
  return null;
};

export const getSolarFlares = (sparks: SparkItem[], blazes: BlazeLog[]) => {
  const byBranch = sparks.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.branchId]: (acc[s.branchId] ?? 0) + 1 }), {});
  return Object.entries(byBranch).filter(([, c]) => c >= 2).map(([b, c]) => `Solar Flare: Branch ${b} has repeated spark volume (${c})`).concat(
    blazes.length >= 2 ? [`Solar Flare: ${blazes.length} total blazes indicate a forming Sun pattern`] : []
  );
};
