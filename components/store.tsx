'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { action_log, blaze_logs, branches, burner_ledger, pathways, solar_flares, spark_items, sun_engines } from '@/data/mock';
import type { ActionLog, BlazeLog, Branch, BurnerLedger, Pathway, SolarFlare, SparkItem, Status, SunEngine } from '@/data/types';

type ActionType = 'create_spark' | 'route' | 'activate_fire' | 'release' | 'create_blaze' | 'freeze' | 'archive' | 'kill' | 'update_pathway';

type Store = {
  branches: Branch[];
  sparks: SparkItem[];
  pathways: Pathway[];
  blazes: BlazeLog[];
  sunEngines: SunEngine[];
  solarFlares: SolarFlare[];
  actions: ActionLog[];
  burners: BurnerLedger[];
  createSpark: (input: Pick<SparkItem, 'title' | 'kind' | 'branchId' | 'notes'>) => void;
  updateSpark: (id: string, patch: Partial<SparkItem>) => void;
  addPathway: (sparkId: string, lane: string) => void;
  updatePathway: (id: string, patch: Partial<Pathway>) => void;
  routeSpark: (sparkId: string) => void;
  activateFire: (sparkId: string) => void;
  releaseBlaze: (sparkId: string, title: string) => void;
  freezeSpark: (sparkId: string) => void;
  archiveSpark: (sparkId: string) => void;
  killSpark: (sparkId: string) => void;
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

  const logAction = (action_type: ActionType, message: string, countsForStreak = true) => {
    setActions((a) => [{ id: id('ac'), action: message, action_type, countsForStreak, date: today() }, ...a]);
  };

  const setSpark = (sparkId: string, patch: Partial<SparkItem>) => {
    setSparks((s) => s.map((i) => i.id === sparkId ? { ...i, ...patch, updatedAt: today(), last_touched_at: today() } : i));
  };

  const value = useMemo<Store>(() => ({
    branches,
    sparks,
    pathways: paths,
    blazes,
    sunEngines: sun_engines,
    solarFlares: solar_flares,
    actions,
    burners,
    createSpark: (input) => {
      const next: SparkItem = { id: id('sp'), title: input.title, kind: input.kind, branchId: input.branchId, notes: input.notes, stage: 'Spark', status: 'new', heatScore: 50, updatedAt: today(), last_touched_at: today() };
      setSparks((s) => [next, ...s]);
      logAction('create_spark', `Created Spark: ${next.title}`);
    },
    updateSpark: (sparkId, patch) => {
      setSpark(sparkId, patch);
      logAction('update_pathway', `Updated Spark ${sparkId}`);
    },
    addPathway: (sparkId, lane) => {
      setPaths((p) => [{ id: id('pw'), sparkId, lane, confidence: 60, status: 'new', last_touched_at: today() }, ...p]);
      logAction('route', `Routed Spark ${sparkId} into pathway: ${lane}`);
    },
    updatePathway: (pid, patch) => {
      setPaths((p) => p.map((i) => i.id === pid ? { ...i, ...patch, last_touched_at: today() } : i));
      logAction('update_pathway', `Updated pathway ${pid}`);
    },
    routeSpark: (sparkId) => {
      setSpark(sparkId, { stage: 'Ember' });
      logAction('route', `Moved Spark ${sparkId} to Ember`);
    },
    activateFire: (sparkId) => {
      setSpark(sparkId, { stage: 'Fire', status: 'active' });
      logAction('activate_fire', `Activated Fire for ${sparkId}`);
    },
    releaseBlaze: (sparkId, title) => {
      const spark = sparks.find((s) => s.id === sparkId); if (!spark) return;
      setBlazes((b) => [{ id: id('blz'), sparkId, title, branchId: spark.branchId, releasedAt: today(), outputType: 'release', valueTags: ['consistency', 'signal'] }, ...b]);
      setSpark(sparkId, { stage: 'Blaze', status: 'active' });
      setBurners((b) => [{ id: id('bn'), event: 'Earned', reason: `Released Blaze: ${title}`, date: today(), delta: 1 }, ...b]);
      logAction('release', `Released ${sparkId}`);
      logAction('create_blaze', `Created blaze log for ${sparkId}`);
    },
    freezeSpark: (sparkId) => { setSpark(sparkId, { status: 'frozen' as Status }); logAction('freeze', `Froze ${sparkId}`); },
    archiveSpark: (sparkId) => { setSpark(sparkId, { status: 'archived' as Status }); logAction('archive', `Archived ${sparkId}`); },
    killSpark: (sparkId) => { setSpark(sparkId, { status: 'killed' as Status }); logAction('kill', `Killed ${sparkId}`); }
  }), [sparks, paths, blazes, actions, burners]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore within StoreProvider');
  return ctx;
};

export const getMomentumStreak = (actions: ActionLog[]) => {
  const days = Array.from(new Set(actions.filter((a) => a.countsForStreak).map((a) => a.date))).sort().reverse();
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
