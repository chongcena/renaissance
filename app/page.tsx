'use client';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';
import { getMomentumStreakSummary } from '@/lib/logic';

export default function HomePage() {
  const { sparks, actions, burners } = useStore();
  const streak = getMomentumStreakSummary(actions);
  const burnerBalance = burners.reduce((sum, b) => sum + b.delta, 0);
  const todayAction = sparks.find((s) => s.scheduleBucket === 'today' && s.currentAction && s.status !== 'frozen');
  const upNext = sparks.filter((s) => s.status === 'active' && s.currentAction && s.id !== todayAction?.id).slice(0, 4);
  const cooling = sparks.filter((s) => s.status === 'cooling').slice(0, 4);
  const recentSparks = sparks.slice(0, 4);
  return <Layout><section className='space-y-4'><h2 className='text-2xl font-semibold'>Command</h2><Panel title="Today's Action"><p>{todayAction?.currentAction || 'Set a Current Action for today.'}</p></Panel><div className='grid gap-3 sm:grid-cols-3'><Stat title='Momentum Streak' value={`${streak.currentStreak}d`} /><Stat title='Burners' value={`${burnerBalance}`} /><Stat title='Assets' value={`${sparks.length}`} /></div><Panel title='Up Next'>{upNext.map((s)=><Item key={s.id} title={s.title} text={s.currentAction || ''} />)}</Panel><Panel title='Cooling'>{cooling.map((s)=><Item key={s.id} title={s.title} text='Needs touch soon' />)}</Panel><Panel title='Recent Sparks'>{recentSparks.map((s)=><Item key={s.id} title={s.title} text={s.stage} />)}</Panel></section></Layout>;
}
const Item=({title,text}:{title:string;text:string})=><p className='rounded border border-neon/20 p-2 text-sm'><span className='font-medium'>{title}</span><br/>{text}</p>;
function Stat({title,value}:{title:string;value:string}){return <article className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><p className='text-xs uppercase tracking-widest text-neonDim'>{title}</p><p className='mt-2 text-2xl font-semibold text-amber-100'>{value}</p></article>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className='rounded-xl border border-neon/30 bg-panelAlt/80 p-4'><h3 className='text-xs uppercase tracking-[0.2em] text-neonDim'>{title}</h3><div className='mt-3 space-y-2'>{children}</div></section>}
