'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { id: 'command-root', label: 'Command', href: '/' },
  { id: 'capture-root', label: 'Capture', href: '/add-spark' },
  { id: 'vault-root', label: 'Vault', href: '/vault' },
  { id: 'pillars-root', label: 'Pillars', href: '/branches' },
  { id: 'goals-root', label: 'Goals', href: '/goals' },
  { id: 'progress-root', label: 'Progress', href: '/stats' }
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        <header className="mb-4 rounded-2xl border border-neon/15 bg-panel px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold tracking-wide text-amber-100">Creative Momentum OS</p>
            <Link href="/add-spark" className="os-selectable os-active-pulse rounded-lg bg-neon px-3 py-2 text-sm font-semibold text-bg">+ Capture</Link>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2 text-sm">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`os-selectable rounded-lg px-3 py-1.5 transition ${active ? 'bg-neon/20 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.2)]' : 'text-muted hover:bg-panelAlt/70 hover:text-text'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="rounded-2xl border border-neon/10 bg-panel p-5">{children}</main>
      </div>
    </div>
  );
}
