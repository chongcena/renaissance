'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { key: 'command', label: 'Command', href: '/' },
  { key: 'capture', label: 'Capture', href: '/add-spark' },
  { key: 'vault', label: 'Vault', href: '/vault' },
  { key: 'pillars', label: 'Pillars', href: '/branches' },
  { key: 'goals', label: 'Goals', href: '/goals' },
  { key: 'progress', label: 'Progress', href: '/stats' }
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-3 px-3 py-3 sm:px-5">
      <aside className="sticky top-3 h-[calc(100vh-1.5rem)] w-52 shrink-0 rounded-2xl border border-neon/20 bg-panel/75 p-3 backdrop-blur">
        <p className="text-sm font-semibold tracking-wide text-amber-100">Creative Momentum OS</p>
        <nav className="mt-4 space-y-1.5 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`block rounded-lg px-2.5 py-2 transition ${
                  active
                    ? 'bg-neon/20 text-amber-100'
                    : 'text-muted hover:bg-panelAlt/75 hover:text-text'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="grid-matrix flex-1 rounded-2xl border border-neon/15 bg-panel/55 p-5 backdrop-blur">{children}</main>
    </div>
  );
}
